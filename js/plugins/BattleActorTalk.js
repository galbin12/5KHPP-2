//=============================================================================
// BattleActorTalk.js
//=============================================================================

/*:
 * @plugindesc (정면 전투용) 전투 중 액터들이 말풍선 대사를 합니다. 순서대로/동시에 선택 가능, 파티 인원수에 맞춰 자동 진행됩니다.
 * @author ㄹㅅㅁ
 *
 * @param FontSize
 * @text 글자 크기
 * @type number
 * @default 24
 *
 * @param Padding
 * @text 여백
 * @type number
 * @default 12
 *
 * @param FillColor
 * @text 배경색
 * @type string
 * @default #ffffff
 *
 * @param BorderColor
 * @text 테두리색
 * @type string
 * @default #000000
 *
 * @param BorderWidth
 * @text 테두리 두께
 * @type number
 * @default 3
 *
 * @param CornerRadius
 * @text 모서리 둥글기
 * @type number
 * @default 10
 *
 * @param TextColor
 * @text 글자색
 * @type string
 * @default #000000
 *
 * @param TailWidth
 * @text 꼬리 폭
 * @type number
 * @default 24
 *
 * @param TailHeight
 * @text 꼬리 길이
 * @type number
 * @default 20
 *
 * @param MinWidth
 * @text 최소 폭
 * @type number
 * @desc 대사가 아주 짧아도 이 폭보다 작아지지 않습니다.
 * @default 110
 *
 * @param OffsetY
 * @text Y축 추가 오프셋
 * @type number
 * @min -9999
 * @max 9999
 * @desc 캐릭터 얼굴 박스 위쪽 기준으로 얼마나 더 띄울지 (픽셀)
 * @default 12
 *
 * @param SlotOffsetX
 * @text 슬롯별 X축 보정 (콤마로 구분)
 * @type string
 * @desc 1번,2번,3번,4번... 슬롯마다 각각 다른 좌우 보정값을 콤마로
 * 구분해서 적습니다. 예: "60,20,-10,-40" (1번은 오른쪽으로 60,
 * 4번은 왼쪽으로 40). 인원수보다 적으면 나머지는 0으로 취급됩니다.
 * @default 0,0,0,0
 *
 * @param AutoOffsetX
 * @text 대기 중 X축 보정 (전투 돌입 등)
 * @type number
 * @min -9999
 * @max 9999
 * @desc 액터가 공격/스킬 등을 고르는 중이 "아닌" 타이밍(전투 돌입
 * 직후, 대기 중)에 전체적으로 적용할 좌우 보정값. 슬롯별 보정과
 * 별도로 더해집니다. 양수면 오른쪽, 음수면 왼쪽.
 * @default 155
 *
 * @param ActingOffsetX
 * @text 행동 선택 중 X축 보정
 * @type number
 * @min -9999
 * @max 9999
 * @desc 액터가 실제로 공격/스킬/아이템/대상을 고르는 중(전투 중간)에
 * 전체적으로 적용할 좌우 보정값. 슬롯별 보정과 별도로 더해집니다.
 * 양수면 오른쪽, 음수면 왼쪽.
 * @default -155
 *
 * @param LineDuration
 * @text 자동 진행 프레임
 * @type number
 * @desc 입력 없이 자동으로 다음(또는 종료)으로 넘어가기까지 걸리는 프레임 수 (60프레임 = 1초)
 * @default 90
 *
 * @param StartDelay
 * @text 시작 후 최소 대기 프레임
 * @type number
 * @desc 전투 커맨드 창이 활성화된 게 확인된 뒤에도 최소 이만큼은
 * 더 기다렸다가 말풍선을 띄웁니다. (60프레임 = 1초)
 * @default 10
 *
 * @param MaxStartDelay
 * @text 최대 대기 프레임(안전장치)
 * @type number
 * @desc 커맨드 창이 끝내 감지되지 않을 경우를 대비한 최대 대기
 * 프레임입니다. 이 시간이 지나면 무조건 말풍선을 띄웁니다.
 * @default 300
 *
 * @param WaitForInput
 * @text 입력으로 넘기기 허용
 * @type boolean
 * @on 허용
 * @off 자동만
 * @desc 켜두면 확인(OK) 입력으로 대사를 바로 다음으로 넘길 수 있습니다.
 * @default true
 *
 * @param DefaultMode
 * @text 기본 진행 방식
 * @type select
 * @option 순차 (한 명씩 순서대로)
 * @value sequential
 * @option 동시 (전부 한번에)
 * @value simultaneous
 * @default sequential
 * @desc 커맨드에서 방식을 따로 지정하지 않았을 때 사용할 기본값입니다.
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * 정면 전투(Frontview) 기준 플러그인입니다. 화면 폭을 파티 인원 수대로
 * 나눠서 각 액터 위치 위에, 테두리 있는 둥근 말풍선(꼬리 포함)을
 * 띄웁니다. "동시" 모드로 실행하면 참여 중인 액터 전원의 말풍선이
 * 한 화면에 동시에 뜹니다 (이미지의 "대사 / 대사 / 대사 / 대사" 같은
 * 모습).
 *
 * ============================================================================
 * 플러그인 커맨드 (전투 이벤트 페이지에서 "플러그인 커맨드"로 사용)
 * ============================================================================
 * 기본형 (파티원 수에 맞춰 앞에서부터 순서대로 자동 배정) :
 *   액터대화 대사1 | 대사2 | 대사3 | 대사4
 *
 * 진행 방식을 직접 지정하고 싶다면 맨 앞에 순차 / 동시 를 붙입니다 :
 *   액터대화 동시 대사1 | 대사2 | 대사3
 *   액터대화 순차 대사1 | 대사2 | 대사3
 *
 * 특정 대사를 특정 액터에게 지정하고 싶다면 "번호:" 를 붙입니다.
 * (번호는 전투 참가 순서 기준 1번, 2번, 3번...) :
 *   액터대화 3:내가 마지막이야? | 1:아니 내가 먼저 할게! | 2:난 마지막에!
 *
 *   번호를 붙이지 않은 대사는 남은 액터에게 앞에서부터 순서대로
 *   자동 배정됩니다. 번호와 자동배정을 섞어써도 됩니다.
 *
 * 좌우 위치 보정은 두 가지가 더해집니다.
 * (1) 슬롯별 보정 - 파라미터 "SlotOffsetX"에 1번,2번,3번,4번... 순서로
 *     콤마 구분해서 넣으세요. 예: "60,20,-10,-40" → 1번은 오른쪽으로
 *     60, 4번은 왼쪽으로 40.
 * (2) 상태별 보정 - 액터가 실제로 공격/스킬/아이템/대상을 고르는
 *     "행동 선택 중"이면 파라미터 "ActingOffsetX", 그게 아니면
 *     (전투 돌입 직후 등 "대기 중")이면 "AutoOffsetX"가 자동으로
 *     적용됩니다. 즉 같은 슬롯이라도 전투 중/대기 중이냐에 따라
 *     위치가 달라질 수 있습니다.
 * 최종 위치 = 슬롯별 보정 + 상태별 보정. 화면 보면서 두 파라미터를
 * 같이 조절하시면 됩니다.
 *
 * 특정 대사 하나에만 상태별 보정 대신 직접 값을 주고 싶으면 맨 앞에
 * "오프셋n"을 붙이세요. (이때는 상태별 보정 대신 이 값이 쓰이고,
 * 슬롯별 보정에는 그대로 더해집니다.) :
 *   액터대화 오프셋40 다들 준비됐어? | 언제든지! | 가자! | 이번엔 진다!
 *   액터대화 오프셋-30 동시 잘 싸워보자! | 이겨보자고! | 문제없어.
 *
 *   모드(순차/동시)와 오프셋n은 순서 상관없이 같이 쓸 수 있습니다.
 *
 *   예)
 *   액터대화 다들 준비됐어? | 언제든지! | 가자! | 이번엔 진다!
 *   액터대화 동시 다들 준비됐어? | 언제든지! | 가자!
 *   액터대화 2:내가 먼저! | 1:아니 잠깐만!
 *   액터대화 오프셋40 동시 잘 싸워보자! | 이겨보자고! | 문제없어.
 *
 * ----------------------------------------------------------------------------
 * - 파이프(|) 기호로 대사를 구분합니다.
 * - 파티원 수보다 대사가 많으면 넘치는 대사는 무시됩니다.
 * - 죽은(전투불능) 액터는 자동으로 건너뜁니다.
 * - 대사 안에서 줄바꿈이 필요하면 \n 을 사용하세요.
 *
 * ============================================================================
 * 주의
 * ============================================================================
 * - 정면(프론트뷰) 전투 기준이며, 전투 스테이터스 창(Window_BattleStatus)이
 *   화면에 떠 있어야 정상적으로 위치를 잡습니다.
 * - 커맨드 실행 즉시가 아니라, 액터의 "공격/스킬 선택" 커맨드 창이
 *   완전히 열린 게 확인된 뒤 "시작 후 최소 대기 프레임"만큼 더
 *   기다렸다가 말풍선이 뜹니다. (파티 커맨드 창 단계에서는 뜨지 않습니다)
 *   혹시 그 창이 끝내 감지되지 않는 상황(전멸/자동전투 등)을 대비해
 *   "최대 대기 프레임"이 지나면 무조건 시작합니다.
 * - 말풍선의 가로 위치는 실제 상태 창 영역을 파티 인원 수대로 균등
 *   분할해서 왼쪽부터 1번, 2번, 3번 순서로 배치한 뒤, 위에 설명한
 *   "슬롯별 보정 + 상태별 보정(또는 오프셋n)"을 더합니다.
 * - 이 커맨드는 전투 진행을 멈추지 않습니다(넌블로킹). 커맨드가
 *   실행되면 이벤트는 곧바로 다음 줄로 넘어가고, 말풍선은 화면 위에서
 *   따로 재생됩니다.
 *
 *
 *
 * ============================================================================
 * 라이선스
 * ============================================================================
 * 자유롭게 사용, 수정하실 수 있습니다.
 */

var Imported = Imported || {};
Imported.BattleActorTalk = true;

var BAT = BAT || {};

(function () {
  'use strict';

  var parameters = PluginManager.parameters('BattleActorTalk');
  var params = {
    fontSize: Number(parameters['FontSize'] || 24),
    padding: Number(parameters['Padding'] || 12),
    offsetY: Number(parameters['OffsetY'] || 12),
    slotOffsetX: String(parameters['SlotOffsetX'] || '0,0,0,0')
      .split(',')
      .map(function (s) {
        var n = Number(s.trim());
        return isFinite(n) ? n : 0;
      }),
    autoOffsetX: Number(parameters['AutoOffsetX'] || 155),
    actingOffsetX: Number(parameters['ActingOffsetX'] || -155),
    lineDuration: Number(parameters['LineDuration'] || 90),
    startDelay: Number(parameters['StartDelay'] || 10),
    maxStartDelay: Number(parameters['MaxStartDelay'] || 300),
    waitForInput: String(parameters['WaitForInput'] || 'true') === 'true',
    defaultMode: String(parameters['DefaultMode'] || 'sequential'),
    fillColor: String(parameters['FillColor'] || '#ffffff'),
    borderColor: String(parameters['BorderColor'] || '#000000'),
    borderWidth: Number(parameters['BorderWidth'] || 3),
    cornerRadius: Number(parameters['CornerRadius'] || 10),
    textColor: String(parameters['TextColor'] || '#000000'),
    tailWidth: Number(parameters['TailWidth'] || 24),
    tailHeight: Number(parameters['TailHeight'] || 20),
    minWidth: Number(parameters['MinWidth'] || 110),
  };

  //---------------------------------------------------------------------------
  // Sprite_TalkBalloon - 꼬리 달린 말풍선 (이미지 참고 스타일)
  //---------------------------------------------------------------------------
  function Sprite_TalkBalloon() {
    this.initialize.apply(this, arguments);
  }

  Sprite_TalkBalloon.prototype = Object.create(Sprite.prototype);
  Sprite_TalkBalloon.prototype.constructor = Sprite_TalkBalloon;

  Sprite_TalkBalloon.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this._anchorRect = null;
    this._fadeSign = 0;
    this.opacity = 0;
    this.visible = false;
  };

  Sprite_TalkBalloon.prototype.setup = function (text, anchorRect, boxWidth) {
    this._anchorRect = anchorRect;

    // 실제 폭 측정을 위한 임시 비트맵 (폰트 설정 동일하게)
    var measureBitmap = new Bitmap(1, 1);
    measureBitmap.fontSize = params.fontSize;
    measureBitmap.fontFace = $gameSystem.mainFontFace
      ? $gameSystem.mainFontFace()
      : 'GameFont';

    var maxAllowedWidth = (boxWidth || Graphics.boxWidth) - 40;
    var maxContentWidth = Math.max(
      maxAllowedWidth - params.padding * 2,
      40,
    );

    // \n으로 나뉜 원래 줄들을, 옆 말풍선과 안 겹치는 폭 안에서
    // 자동으로 더 줄바꿈합니다.
    var rawLines = text.split('\n');
    var lines = [];
    rawLines.forEach(function (rawLine) {
      var plain = rawLine.replace(/\\[a-zA-Z!.|^><$}{]+(\[[^\]]*\])?/g, '');
      var wrapped = this._wrapLine(plain, maxContentWidth, measureBitmap);
      wrapped.forEach(function (w) {
        lines.push(w);
      });
    }, this);
    if (lines.length === 0) lines = [''];

    var lineWidths = lines.map(function (line) {
      var w = measureBitmap.measureTextWidth(line);
      return isFinite(w) && w > 0 ? w : 0;
    });

    var maxLineWidth = Math.max.apply(null, lineWidths.concat([0]));
    if (!isFinite(maxLineWidth)) maxLineWidth = 100;

    var innerWidth = Math.max(maxLineWidth, params.minWidth - params.padding * 2);

    var bubbleWidth = Math.min(
      innerWidth + params.padding * 2,
      maxAllowedWidth,
    );
    var lineH = params.fontSize + 8;
    var bubbleHeight = lines.length * lineH + params.padding * 2;

    var totalWidth = bubbleWidth;
    var totalHeight = bubbleHeight + params.tailHeight;

    var bitmap = new Bitmap(totalWidth, totalHeight);
    this._drawBubble(bitmap, bubbleWidth, bubbleHeight);

    bitmap.fontSize = params.fontSize;
    bitmap.textColor = params.textColor;
    bitmap.fontFace = measureBitmap.fontFace;
    bitmap.fontBold = false;
    bitmap.outlineWidth = 0;
    bitmap.outlineColor = 'rgba(0,0,0,0)';

    lines.forEach(function (line, i) {
      bitmap.drawText(
        line,
        0,
        params.padding + i * lineH,
        bubbleWidth,
        lineH,
        'center',
      );
    });

    this.bitmap = bitmap;
    this.anchor.x = 0.5;
    this.anchor.y = 1; // 스프라이트 하단(꼬리 끝)을 기준점으로 사용

    this.updatePosition();
    this.visible = true;
    this._fadeSign = 1;
    this.opacity = 0;
  };

  // 한 줄을 maxWidth 안에 들어가도록 여러 줄로 쪼갭니다.
  // 공백이 있으면 단어 단위로, 없으면(한글 등) 글자 단위로 끊습니다.
  Sprite_TalkBalloon.prototype._wrapLine = function (
    text,
    maxWidth,
    measureBitmap,
  ) {
    if (!text) return [''];

    var hasSpace = text.indexOf(' ') >= 0;
    var units = hasSpace ? text.split(' ') : text.split('');
    var joiner = hasSpace ? ' ' : '';

    var result = [];
    var current = '';

    units.forEach(function (unit) {
      var test = current ? current + joiner + unit : unit;
      var w = measureBitmap.measureTextWidth(test);

      if (w > maxWidth && current) {
        result.push(current);
        current = unit;
      } else {
        current = test;
      }
    });

    if (current) result.push(current);
    return result.length > 0 ? result : [''];
  };

  Sprite_TalkBalloon.prototype._drawBubble = function (
    bitmap,
    bubbleWidth,
    bubbleHeight,
  ) {
    var ctx = bitmap._context;
    var r = params.cornerRadius;
    var bw = params.borderWidth;
    var tw = params.tailWidth;
    var th = params.tailHeight;
    var cx = bubbleWidth / 2;

    ctx.save();
    ctx.beginPath();

    // 말풍선 몸통 (둥근 사각형)
    var x = bw / 2;
    var y = bw / 2;
    var w = bubbleWidth - bw;
    var h = bubbleHeight - bw;

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);

    // 꼬리 (아래쪽 중앙, 뾰족하게)
    ctx.lineTo(cx + tw / 2, y + h);
    ctx.lineTo(cx, y + h + th);
    ctx.lineTo(cx - tw / 2, y + h);

    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();

    ctx.fillStyle = params.fillColor;
    ctx.fill();

    if (bw > 0) {
      ctx.strokeStyle = params.borderColor;
      ctx.lineWidth = bw;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.restore();
    bitmap._setDirty();
  };

  Sprite_TalkBalloon.prototype.updatePosition = function () {
    if (!this._anchorRect) return;

    var anchor = this._anchorRect;
    var centerX =
      anchor.x + anchor.width / 2 + (anchor.offsetX || 0);
    var bottomY = anchor.y - params.offsetY;

    var halfWidth = this.bitmap ? this.bitmap.width / 2 : 0;
    var minX = halfWidth;
    var maxX = Graphics.boxWidth - halfWidth;

    this.x = Math.round(Math.min(Math.max(centerX, minX), maxX));
    this.y = Math.round(Math.max(bottomY, this.bitmap ? this.bitmap.height : 0));
  };

  Sprite_TalkBalloon.prototype.update = function () {
    Sprite.prototype.update.call(this);
    this.updatePosition();

    if (this._fadeSign > 0) {
      this.opacity += 32;
      if (this.opacity >= 255) {
        this.opacity = 255;
        this._fadeSign = 0;
      }
    } else if (this._fadeSign < 0) {
      this.opacity -= 32;
      if (this.opacity <= 0) {
        this.opacity = 0;
        this._fadeSign = 0;
        this.visible = false;
      }
    }
  };

  Sprite_TalkBalloon.prototype.startFadeOut = function () {
    this._fadeSign = -1;
  };

  Sprite_TalkBalloon.prototype.isFadingOut = function () {
    return this._fadeSign < 0 && this.visible;
  };

  //---------------------------------------------------------------------------
  // BAT.Controller - 전체 대사 진행 관리
  //---------------------------------------------------------------------------
  BAT.Controller = {
    _queue: [], // {actor, text} 목록
    _pointer: 0, // 순차 모드에서 다음에 꺼낼 인덱스
    _active: [], // 현재 화면에 떠 있는 {window, timer, phase} 목록
    _mode: 'sequential',
    _callOffsetX: null,
    _running: false,
    _delayTimer: 0,
    _delayReadyTimer: 0,
    _pendingParsed: null, // 지연 대기 중인 파싱 결과

    // ------------------------------------------------------------------
    // 번역 (SRD_TranslationEngine의 Translations.json "msg" 데이터를 재사용)
    // ------------------------------------------------------------------
    translateText: function (text) {
      try {
        if (
          typeof ConfigManager === 'undefined' ||
          typeof ConfigManager.isDefaultLanguage !== 'function' ||
          ConfigManager.isDefaultLanguage()
        ) {
          return text;
        }
        if (typeof $dataTranslations === 'undefined' || !$dataTranslations) {
          return text;
        }
        var lang = ConfigManager.getLanguage();
        var data = $dataTranslations['msg'];
        if (data && data[text] && data[text][lang]) {
          return data[text][lang];
        }
      } catch (e) {
        // 번역 데이터가 없거나 형식이 다르면 그냥 원문을 씁니다.
      }
      return text;
    },

    // ------------------------------------------------------------------
    // 커맨드 파싱
    // ------------------------------------------------------------------
    parseCommand: function (raw) {
      raw = raw.trim();
      var mode = params.defaultMode;
      var offsetX = null; // null = 이번 커맨드에는 수동 지정 없음(자동 감지 사용)

      // 맨 앞쪽에 붙는 토큰(모드/오프셋)을 순서 상관없이 여러 개 뗍니다.
      var changed = true;
      while (changed) {
        changed = false;

        if (/^동시\s+/.test(raw)) {
          mode = 'simultaneous';
          raw = raw.replace(/^동시\s+/, '');
          changed = true;
        } else if (/^순차\s+/.test(raw)) {
          mode = 'sequential';
          raw = raw.replace(/^순차\s+/, '');
          changed = true;
        }

        var offsetMatch = /^오프셋(-?\d+)\s+/.exec(raw);
        if (offsetMatch) {
          offsetX = Number(offsetMatch[1]);
          raw = raw.replace(/^오프셋(-?\d+)\s+/, '');
          changed = true;
        }
      }

      var segments = raw
        .split('|')
        .map(function (s, i) {
          return { text: s.trim().replace(/\\n/g, '\n'), order: i };
        })
        .filter(function (s) {
          return s.text.length > 0;
        });

      return { mode: mode, offsetX: offsetX, segments: segments };
    },

    // segments: [{text, order}]
    buildQueue: function (segments) {
      var self = this;
      var battleMembers = $gameParty.battleMembers();
      var aliveMembers = battleMembers.filter(function (actor) {
        return actor && actor.isAlive();
      });

      var usedActors = [];
      var autoQueueTargets = aliveMembers.slice();
      var queue = [];

      // 1) "번호:대사" 형태는 지정된 액터로 확정
      segments.forEach(function (seg) {
        var m = /^(\d+)\s*:\s*([\s\S]*)$/.exec(seg.text);
        if (m) {
          var idx = Number(m[1]) - 1;
          var actor = battleMembers[idx];
          if (actor && actor.isAlive() && usedActors.indexOf(actor) < 0) {
            usedActors.push(actor);
            var pos = autoQueueTargets.indexOf(actor);
            if (pos >= 0) autoQueueTargets.splice(pos, 1);
            queue.push({ actor: actor, text: self.translateText(m[2]), order: seg.order });
          }
          // 이미 죽었거나 잘못된 번호면 이 대사는 버립니다.
        } else {
          queue.push({ actor: null, text: self.translateText(seg.text), order: seg.order });
        }
      });

      // 2) 번호 없는 대사에 남은 액터를 앞에서부터 자동 배정
      var autoIndex = 0;
      queue.forEach(function (entry) {
        if (!entry.actor) {
          if (autoIndex < autoQueueTargets.length) {
            entry.actor = autoQueueTargets[autoIndex];
            autoIndex++;
          }
        }
      });

      // 3) 배정 실패(액터 부족)한 항목 제거, 원래 작성 순서대로 정렬
      queue = queue
        .filter(function (entry) {
          return !!entry.actor;
        })
        .sort(function (a, b) {
          return a.order - b.order;
        });

      return queue;
    },

    start: function (raw) {
      var parsed = this.parseCommand(raw);

      // 전투 커맨드 창이 실제로 활성화될 때까지 기다렸다가 시작합니다.
      this._pendingParsed = parsed;
      this._delayTimer = 0;
      this._delayReadyTimer = 0;
      this._running = true;
    },

    _isCommandWindowActive: function () {
      // 코어의 isAnyInputWindowActive()를 참고하되, "파티 커맨드 창
      // (전투/도망)"은 제외합니다. 그건 매 턴 잠깐 뜨는 거라 넣으면
      // 매 턴마다 "행동 안 함" 판정이 나서 원치 않는 결과가 나옵니다.
      // 여기서는 "액터가 실제로 공격/스킬/아이템/대상을 고르는 중"
      // 인지만 확인합니다.
      var scene = SceneManager._scene;
      if (!scene) return false;

      var windows = [
        scene._actorCommandWindow,
        scene._skillWindow,
        scene._itemWindow,
        scene._actorWindow,
        scene._enemyWindow,
      ];

      return windows.some(function (w) {
        return !!(w && w.visible && w.active);
      });
    },

    _beginQueue: function (parsed) {
      var queue = this.buildQueue(parsed.segments);

      this._queue = queue;
      this._mode = parsed.mode;
      this._callOffsetX = parsed.offsetX; // null이면 자동 감지 사용
      this._pointer = 0;
      this._active = [];
      this._pendingParsed = null;
      this._running = queue.length > 0;

      if (!this._running) return;

      if (this._mode === 'simultaneous') {
        this._queue.forEach(function (entry) {
          var balloon = this._createBalloon(entry);
          if (balloon) this._active.push(balloon);
        }, this);
        this._pointer = this._queue.length;
        if (this._active.length === 0) this._running = false;
      } else {
        this._advanceSequential();
      }
    },

    isRunning: function () {
      return this._running;
    },

    _findStatusWindow: function () {
      var scene = SceneManager._scene;
      if (!scene) return null;

      // scene._statusWindow가 실제로 렌더링되는 창이 아닐 수 있으므로
      // scene.children에서 Window_BattleStatus 인스턴스를 직접 찾습니다.
      var found = null;
      scene.children.forEach(function (child) {
        if (found) return;
        if (child instanceof Window_BattleStatus) {
          found = child;
        }
      });

      return found || scene._statusWindow || null;
    },

    _findAnchorRect: function (actor) {
      var index = $gameParty.battleMembers().indexOf(actor);
      if (index < 0) return null;

      var total = $gameParty.battleMembers().length;
      if (total <= 0) return null;

      var statusWindow = this._findStatusWindow();

      var slotX, slotWidth, topY;

      if (statusWindow && typeof statusWindow.itemRect === 'function') {
        // 상태 창이 실제로 각 액터를 그리는 칸(itemRect)을 직접
        // 읽어와서 위치를 잡습니다. 균등 분할 계산보다 훨씬 정확하고,
        // 창 레이아웃이 상태(대기중/행동중)에 따라 달라지는 경우도
        // 그때그때 실제 값을 읽으므로 자동으로 맞습니다.
        // itemRect는 "contents" 좌표계라 window.x + padding을 더해야
        // 화면 좌표가 됩니다.
        var rect = statusWindow.itemRect(index);
        var padding = statusWindow.padding || 0;
        slotX = statusWindow.x + padding + rect.x;
        slotWidth = rect.width;
        topY = statusWindow.y + padding + rect.y;
      } else {
        // 상태 창을 못 찾았을 때의 대체 계산(화면 폭 균등 분할)
        var areaX = 0;
        var areaWidth = Graphics.boxWidth;
        slotWidth = areaWidth / total;
        slotX = areaX + slotWidth * index;
        topY = Graphics.boxHeight - 200;
      }

      // 슬롯(1번, 2번, 3번...)마다 따로 지정한 보정값. 부족하면 0.
      // (itemRect 기반으로 이미 정확해졌다면 0으로 두시면 됩니다.)
      var slotOffset = params.slotOffsetX[index] || 0;

      // "오프셋n"을 커맨드에 직접 붙였으면 그 값을 우선 사용하고,
      // 안 붙였으면 지금 액터가 실제로 공격/스킬/아이템/대상을
      // 고르는 중인지(행동 선택 중)로 자동 판단합니다.
      var stateOffset;
      if (this._callOffsetX !== null) {
        stateOffset = this._callOffsetX;
      } else {
        // 감지 결과가 실제 상황과 반대로 나와서 두 값을 서로 바꿔 적용합니다.
        stateOffset = this._isCommandWindowActive()
          ? params.autoOffsetX
          : params.actingOffsetX;
      }

      console.log(
        '[BattleActorTalk] slotOffset=' +
          slotOffset +
          ' stateOffset=' +
          stateOffset +
          ' total=' +
          (slotOffset + stateOffset),
      );

      return {
        x: slotX,
        y: topY,
        width: slotWidth,
        offsetX: slotOffset + stateOffset,
      };
    },

    _createBalloon: function (entry) {
      var anchorRect = this._findAnchorRect(entry.actor);
      if (!anchorRect) return null;

      var sprite = new Sprite_TalkBalloon();
      SceneManager._scene.addChild(sprite);
      // 옆 말풍선과 겹치지 않도록, 자기 칸 폭의 1.8배까지만 늘어나게 합니다.
      sprite.setup(entry.text, anchorRect, anchorRect.width * 1.8);

      return {
        window: sprite,
        timer: params.lineDuration,
        phase: 'show',
      };
    },

    _advanceSequential: function () {
      while (this._pointer < this._queue.length) {
        var entry = this._queue[this._pointer];
        this._pointer++;
        var balloon = this._createBalloon(entry);
        if (balloon) {
          this._active.push(balloon);
          return;
        }
        // 배정 실패한 항목은 건너뛰고 다음으로 진행합니다.
      }
      // 더 이상 보여줄 대사가 없습니다.
      if (this._active.length === 0) {
        this._running = false;
      }
    },

    _removeBalloon: function (balloon) {
      if (balloon.window.parent) {
        balloon.window.parent.removeChild(balloon.window);
      }
      var idx = this._active.indexOf(balloon);
      if (idx >= 0) this._active.splice(idx, 1);
    },

    update: function () {
      // 시작 지연 대기 중: 전투 커맨드 창이 활성화될 때까지 기다립니다.
      if (this._pendingParsed) {
        this._delayTimer++;

        var commandReady = this._isCommandWindowActive();
        if (commandReady) {
          this._delayReadyTimer++;
        } else {
          this._delayReadyTimer = 0;
        }

        var minWaitDone = this._delayReadyTimer >= params.startDelay;
        var timedOut = this._delayTimer >= params.maxStartDelay;

        if ((commandReady && minWaitDone) || timedOut) {
          var parsed = this._pendingParsed;
          this._pendingParsed = null;
          this._beginQueue(parsed);
        }
        return;
      }

      if (this._active.length === 0 && !this._running) return;

      var inputTriggered =
        params.waitForInput &&
        (Input.isTriggered('ok') || TouchInput.isTriggered());

      // 배열을 복사해서 순회 (도중에 _active가 변경될 수 있음)
      this._active.slice().forEach(
        function (balloon) {
          balloon.window.update();

          if (balloon.phase === 'show') {
            balloon.timer--;
            if (balloon.timer <= 0 || inputTriggered) {
              balloon.phase = 'fadeout';
              balloon.window.startFadeOut();
            }
          } else if (balloon.phase === 'fadeout') {
            if (!balloon.window.isFadingOut()) {
              this._removeBalloon(balloon);

              if (this._mode === 'sequential') {
                this._advanceSequential();
              } else if (this._active.length === 0) {
                this._running = false;
              }
            }
          }
        }.bind(this),
      );

      if (
        this._mode === 'sequential' &&
        this._active.length === 0 &&
        this._pointer >= this._queue.length
      ) {
        this._running = false;
      }
    },

    clear: function () {
      this._active.slice().forEach(
        function (balloon) {
          this._removeBalloon(balloon);
        }.bind(this),
      );
      this._active = [];
      this._queue = [];
      this._running = false;
      this._pendingParsed = null;
      this._delayTimer = 0;
      this._delayReadyTimer = 0;
    },
  };

  //---------------------------------------------------------------------------
  // Game_Interpreter
  //---------------------------------------------------------------------------
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === '액터대화' || command === 'ActorTalk') {
      var raw = args.join(' ');

      if ($gameParty.inBattle() && raw.trim().length > 0) {
        // 이벤트/전투 진행을 멈추지 않고, 말풍선은 화면 위에서
        // 알아서 재생되도록 합니다 (넌블로킹).
        BAT.Controller.start(raw);
      }
    }
  };

  //---------------------------------------------------------------------------
  // Scene_Battle
  //---------------------------------------------------------------------------
  var _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function () {
    _Scene_Battle_update.call(this);
    BAT.Controller.update();
  };

  var _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
  Scene_Battle.prototype.terminate = function () {
    BAT.Controller.clear();
    _Scene_Battle_terminate.call(this);
  };
})();
