//=============================================================================
// WordWrapBySpace.js
//=============================================================================
// RS_MessageSystem 바로 아래(다음 순서)에 배치할 것.
// RS_MessageSystem 의 자동 줄바꿈(isParagraphMinifier)이 글자 단위로 동작하는
// 부분을 "띄어쓰기(단어) 단위" 로 줄바꿈하도록 덮어씁니다.
// 단, 공백이 전혀 없는 긴 단어는 기존처럼 글자 단위로 줄이 바뀝니다.
//=============================================================================

/*:
 * @plugindesc RS_MessageSystem 자동 줄바꿈을 띄어쓰기(단어) 단위로 처리합니다.
 * @author claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 1. 플러그인 목록에서 RS_MessageSystem 바로 아래에 배치하세요.
 * 2. RS_MessageSystem 의 파라미터 중 "자동 줄바꿈(isParagraphMinifier)"이
 *    켜져 있어야 동작합니다.
 *
 * 동작 방식
 * ----------------------------------------------------------------------------
 * - 한 단어(공백으로 구분된 덩어리)가 줄 끝을 넘어가면, 그 단어 전체를
 *   다음 줄로 넘깁니다. (단어 중간에서 잘리지 않음)
 * - 단, 단어 자체의 길이가 한 줄 전체 폭보다 긴 경우에는 어쩔 수 없이
 *   기존처럼 글자 단위로 줄바꿈됩니다.
 * - \C[n], \I[n] 등 이스케이프 코드는 폭 계산에서 올바르게 처리됩니다.
 *
 * 플러그인 명령 없음. 별도 설정 없이 바로 적용됩니다.
 */

(function () {
  'use strict';

  //--------------------------------------------------------------------------
  // 단어 시작 지점 플래그 리셋
  //   - 메시지 새 페이지 / 줄바꿈 시 "지금부터 새 단어" 로 인식하도록 초기화
  //--------------------------------------------------------------------------
  var alias_WWBS_processNewLine = Window_Base.prototype.processNewLine;
  Window_Base.prototype.processNewLine = function (textState) {
    alias_WWBS_processNewLine.call(this, textState);
    this._wwbsAtWordStart = true;
  };

  var alias_WWBS_newPage = Window_Message.prototype.newPage;
  Window_Message.prototype.newPage = function (textState) {
    alias_WWBS_newPage.call(this, textState);
    this._wwbsAtWordStart = true;
  };

  //--------------------------------------------------------------------------
  // 메인 로직
  //--------------------------------------------------------------------------
  var alias_WWBS_processNormalCharacter =
    Window_Message.prototype.processNormalCharacter;
  Window_Message.prototype.processNormalCharacter = function (textState) {
    if (this._wwbsAtWordStart === undefined) {
      this._wwbsAtWordStart = true;
    }

    var c = textState.text[textState.index];

    if (c === ' ') {
      // 공백을 만나면: 다음 문자부터 새 단어가 시작됨
      alias_WWBS_processNormalCharacter.call(this, textState);
      this._wwbsAtWordStart = true;
      return;
    }

    if (this._wwbsAtWordStart && this.isWordWrapBySpaceValid()) {
      this.wwbsTryWrapWord(textState);
    }
    this._wwbsAtWordStart = false;

    alias_WWBS_processNormalCharacter.call(this, textState);
  };

  // RS_MessageSystem 의 기존 조건과 동일한 조건에서만 동작
  // (일반 메시지 창 + 자동 줄바꿈 옵션이 켜져 있을 때)
  Window_Message.prototype.isWordWrapBySpaceValid = function () {
    return (
      $gameMessage.getBalloon() ===
        RS.MessageSystem.Params.RESET_DEFAULT_STYLE &&
      !this._isUsedTextWidthEx &&
      RS.MessageSystem.Params.isParagraphMinifier
    );
  };

  // 단어 전체 폭을 미리 재서, 줄을 넘으면 단어 앞에서 줄바꿈
  Window_Message.prototype.wwbsTryWrapWord = function (textState) {
    var width = this.contentsWidth();
    var wordWidth = this.wwbsMeasureWordWidth(textState);

    // 단어가 줄을 넘고, 그 단어 자체는 한 줄 폭 안에 들어갈 때만
    // (단어 자체가 줄 폭보다 크면 어차피 기존 글자단위 줄바꿈에 맡긴다)
    if (Math.floor(textState.x + wordWidth) > width && wordWidth <= width) {
      this.processNewLine(textState);
    }
  };

  // 현재 위치부터 다음 공백/줄바꿈/문자열 끝까지의 픽셀 폭 계산
  // (이스케이프 코드는 폭에 포함하지 않되, \I[n] 아이콘은 아이콘 폭만큼 더함)
  Window_Message.prototype.wwbsMeasureWordWidth = function (textState) {
    var text = textState.text;
    var idx = textState.index;
    var width = 0;

    while (idx < text.length) {
      var c = text[idx];

      if (c === ' ' || c === '\n') {
        break;
      }

      if (c === '\x1b') {
        idx = this.wwbsSkipEscapeCode(text, idx, function (addWidth) {
          width += addWidth;
        });
        continue;
      }

      width += this.textWidth(c);
      idx++;
    }

    return width;
  };

  // obtainEscapeCode / obtainEscapeParam 과 동일한 규칙으로 이스케이프 코드를
  // 건너뛴 뒤의 인덱스를 반환. 아이콘(\I[n])의 경우 콜백으로 폭을 더해준다.
  Window_Message.prototype.wwbsSkipEscapeCode = function (
    text,
    idx,
    onWidth,
  ) {
    idx++; // '\x1b' 자체를 건너뜀

    var codeMatch = /^[\$\.\|\^!><\{\}\\]/.exec(text.slice(idx));
    var code = '';
    if (codeMatch) {
      code = codeMatch[0].toUpperCase();
      idx += codeMatch[0].length;
    } else {
      return idx;
    }

    // 파라미터 [n] 를 갖는 코드들
    if (code === 'C' || code === 'I') {
      var paramMatch = /^\[\d+\]/.exec(text.slice(idx));
      if (paramMatch) {
        idx += paramMatch[0].length;
      }
    }

    // 아이콘은 실제로 폭을 차지하므로 더해준다
    if (code === 'I' && onWidth) {
      onWidth(Window_Base._iconWidth + 4);
    }

    return idx;
  };
})();
