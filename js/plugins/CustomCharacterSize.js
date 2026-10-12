//=============================================================================
// RS_CustomCharacterSize.js
// 캐릭터칩 파일 이름 규칙만으로 셀(프레임) 크기를 48x48이 아닌 임의
// 크기(예: 96x48)로 자유롭게 지정할 수 있게 해주는 플러그인입니다.
// 컷신 등에서 두 캐릭터를 하나의 캐릭터칩으로 붙여 그릴 때 사용합니다.
//=============================================================================
var Imported = Imported || {};
Imported.RS_CustomCharacterSize = true;

var RS = RS || {};
RS.CCS = RS.CCS || {};

/*:
 * @plugindesc v1.0 캐릭터칩 파일명 규칙으로 셀 크기를 가변으로 지정 (예: 96x48)
 * @author RS
 *
 * @help
 * =============================================================================
 * 사용 방법 (플러그인 명령 필요 없음!)
 * =============================================================================
 * 1. img/characters 폴더에 캐릭터칩 이미지를 넣습니다.
 *
 * 2. 파일 이름을 아래 규칙대로 짓습니다.
 *
 *      [원하는이름]_[가로]x[세로].png
 *
 *      예) pullscene_96x48.png
 *          -> 셀 크기 가로 96px, 세로 48px로 인식
 *
 *      예) duo_128x64.png
 *          -> 셀 크기 가로 128px, 세로 64px로 인식
 *
 * 3. 이미지 전체 크기는 원본 캐릭터칩 레이아웃과 동일하게,
 *    "가로 = 셀가로 x 3프레임", "세로 = 셀세로 x 4방향" 으로 그립니다.
 *
 *      예) pullscene_96x48.png 라면 전체 이미지 크기는
 *          가로 288px (96 x 3), 세로 192px (48 x 4)
 *
 *      가로 3칸 = 걷기 프레임(정지 상태면 3칸 다 같은 그림이어도 무방)
 *      세로 4칸 = 방향 (위에서부터 아래/왼쪽/오른쪽/위 순서, 기존 빅캐릭터와 동일)
 *
 * 4. 이 이름 규칙을 쓰면 $ 접두사 없이도 자동으로 "빅캐릭터"로 처리되어
 *    캐릭터 인덱스(칸번호) 구분 없이 이미지 전체를 그 캐릭터 하나가
 *    독점해서 씁니다. 이벤트/플레이어 설정에서 캐릭터 그래픽으로
 *    이 파일을 선택하고, 인덱스는 0으로 두면 됩니다.
 *
 * 5. 파일 이름이 이 규칙(끝이 _숫자x숫자)과 맞지 않으면 평범한 기존
 *    방식(48x48, 12x8 또는 3x4)으로 동작합니다. 기존 캐릭터칩과
 *    100% 호환됩니다.
 *
 * =============================================================================
 * 기준점(anchor) 직접 지정하기 (컷신에서 두 캐릭터 붙일 때 필수!)
 * =============================================================================
 * 기본적으로 기준점(캐릭터가 타일 위에 서는 위치)은 셀 가로의
 * "정중앙"입니다. 그래서 48x48 -> 96x48 로 넓히면 원래 서있던
 * 자리 기준으로 좌우 48px씩 똑같이 퍼지게 되어, 한쪽으로 캐릭터를
 * 이어붙인 그림은 반대쪽으로 밀려 보이는 문제가 생깁니다.
 *
 * 이럴 때는 파일 이름 끝에 _a숫자 를 추가해서 기준점을 원하는
 * 픽셀 위치로 직접 지정하세요.
 *
 *      [이름]_[가로]x[세로]_a[기준점X].png
 *
 *      예) pullscene_96x48_a24.png
 *          -> 셀 크기 96x48, 기준점은 왼쪽에서 24px 지점
 *             (즉 왼쪽 48px는 원래 캐릭터, 오른쪽 48px에 그린
 *              캐릭터를 자연스럽게 오른쪽으로만 붙여서 확장)
 *
 *      _a 를 생략하면 기존처럼 셀 가로의 정중앙(가로/2)이 기준점입니다.
 *
 * =============================================================================
 * 주의
 * =============================================================================
 * - 그림자(Shadow), 풍선(Balloon) 표시 위치도 이 기준점을 따라갑니다.
 * - 기준점은 세로(Y)는 항상 셀 맨 아래로 고정입니다(발밑 기준, 기존과 동일).
 *
 * =============================================================================
 * 버전 로그
 * =============================================================================
 * 2026.08.05 (v1.0) - 최초 작성
 */

//-----------------------------------------------------------------------------
// 파일 이름에서 셀 크기(+옵션으로 기준점 X좌표)를 추출하는 정규식
// 예) 이름_96x48        -> 기준점은 기본값(가로 중앙, 48)
//     이름_96x48_a24    -> 기준점을 왼쪽에서 24px 지점으로 지정
//-----------------------------------------------------------------------------
RS.CCS.nameRegex = /_(\d+)x(\d+)(?:_a(\d+))?$/;

RS.CCS.parseName = function(name) {
  if (!name) return null;
  var match = RS.CCS.nameRegex.exec(name);
  if (!match) return null;
  var w = Number(match[1]);
  var h = Number(match[2]);
  if (!w || !h) return null;
  var anchorX = match[3] !== undefined ? Number(match[3]) : w / 2;
  return { width: w, height: h, anchorX: anchorX };
};

//-----------------------------------------------------------------------------
// ImageManager - 이름 규칙에 맞으면 빅캐릭터로 취급
// (캐릭터 인덱스 무시하고 이미지 전체를 한 캐릭터가 독점)
//-----------------------------------------------------------------------------
RS.CCS.ImageManager_isBigCharacter = ImageManager.isBigCharacter;
ImageManager.isBigCharacter = function(filename) {
  if (RS.CCS.parseName(filename)) {
    return true;
  }
  return RS.CCS.ImageManager_isBigCharacter.call(this, filename);
};

//-----------------------------------------------------------------------------
// Sprite_Character - 이름 규칙에 맞으면 셀 크기를 파일명 기준으로 강제 적용
//-----------------------------------------------------------------------------
RS.CCS.Sprite_Character_patternWidth = Sprite_Character.prototype.patternWidth;
Sprite_Character.prototype.patternWidth = function() {
  var parsed = this._characterName ? RS.CCS.parseName(this._characterName) : null;
  if (parsed) {
    return parsed.width;
  }
  return RS.CCS.Sprite_Character_patternWidth.call(this);
};

RS.CCS.Sprite_Character_patternHeight = Sprite_Character.prototype.patternHeight;
Sprite_Character.prototype.patternHeight = function() {
  var parsed = this._characterName ? RS.CCS.parseName(this._characterName) : null;
  if (parsed) {
    return parsed.height;
  }
  return RS.CCS.Sprite_Character_patternHeight.call(this);
};

//-----------------------------------------------------------------------------
// Sprite_Character - 이름 규칙에 맞으면 기준점(anchor.x)도 파일명 기준으로 적용
// (기본값은 셀 가로 중앙이라 기존 캐릭터와 동일하게 동작하며, 파일명에
//  _a24 처럼 적어두면 그 픽셀 위치로 기준점이 이동합니다)
//-----------------------------------------------------------------------------
RS.CCS.Sprite_Character_updateFrame = Sprite_Character.prototype.updateFrame;
Sprite_Character.prototype.updateFrame = function() {
  var parsed = this._characterName ? RS.CCS.parseName(this._characterName) : null;
  if (parsed) {
    this.anchor.x = parsed.anchorX / parsed.width;
  } else if (this._rsCcsAnchorApplied) {
    // 이전에 커스텀 기준점을 적용한 적이 있다면 기본값(0.5)으로 복원
    this.anchor.x = 0.5;
  }
  this._rsCcsAnchorApplied = !!parsed;
  RS.CCS.Sprite_Character_updateFrame.call(this);
};
