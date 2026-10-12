//=============================================================================
// Custom_AnimatedPicture.js
// 그림(Picture) 파일 이름 규칙만으로 자동으로 스프라이트시트 애니메이션을
// 재생하는 플러그인입니다. 플러그인 명령이 필요 없습니다.
//
// 파일명 끝자리로 "대사 중에만 움직임" / "항상 움직임"을 구분합니다.
//   이름_3f_6s.png  -> 대사(메시지) 표시 중에만 애니메이션 (s = speak)
//   이름_3f_6a.png  -> 항상 애니메이션 (a = always)
//=============================================================================
var Imported = Imported || {};
Imported.Custom_AnimatedPicture = true;

var CAP = CAP || {};

/*:
 * @plugindesc v3.0 그림 파일명 규칙만으로 자동 애니메이션 재생 (플러그인 명령 불필요)
 * @author Custom
 *
 * @help
 * =============================================================================
 * 사용 방법 (플러그인 명령 필요 없음!)
 * =============================================================================
 * 1. img/pictures 폴더에 스프라이트시트 이미지를 넣습니다.
 *    - 프레임들을 가로로 나란히 이어붙인 한 장의 이미지여야 하고,
 *    - 모든 프레임 크기는 동일해야 합니다.
 *
 * 2. 파일 이름을 아래 규칙대로 짓습니다.
 *
 *      [이름]_[프레임수]f_[속도]s.png   -> 대사 중에만 움직임
 *      [이름]_[프레임수]f_[속도]a.png   -> 항상 움직임 (대사 유무 상관없음)
 *
 *      예) 상점사장님_3f_6s.png
 *          -> 3프레임, 6틱마다 전환, 대사가 떠 있을 때만 애니메이션
 *
 *      예) 상점사장님_3f_6a.png
 *          -> 3프레임, 6틱마다 전환, 항상(대사 없어도) 애니메이션
 *
 *      속도 숫자는 "몇 틱마다 다음 프레임으로 넘어가는지"입니다.
 *      게임은 1초에 60틱이므로, 6이면 0.1초마다 전환됩니다.
 *
 * 3. 이벤트 커맨드에서 평소처럼 "그림 표시(Show Picture)"로 이 파일을
 *    선택해서 띄우기만 하면 끝입니다.
 *
 * 4. 파일 이름이 이 규칙과 맞지 않으면 그냥 평범한 정지 이미지로
 *    표시됩니다. 오류는 나지 않습니다.
 *
 * =============================================================================
 * 상점 컷신 예시 흐름 (이벤트 커맨드)
 * =============================================================================
 *   1) 그림 표시: 1번, "상점사장님_3f_6a" (전체화면 좌표/스케일로, 항상 움직임)
 *   2) 문장 표시: "어서오게, 손님..."
 *   3) 상점 처리 (열기)
 *   4) 그림 지우기: 1번
 *
 * =============================================================================
 * 버전 로그
 * =============================================================================
 * 2026.08.06 (v3.0) - 파일명 끝자리(s/a)로 "대사중만/항상" 구분하도록 변경
 *                      (플러그인 파라미터 방식 제거 - 인식 안 되는 문제 해결)
 * 2026.08.01 (v2.0) - 파일명 규칙 기반 자동 인식으로 변경 (플러그인 명령 제거)
 * 2026.08.01 (v1.0) - 최초 작성 (플러그인 명령 방식)
 */

//-----------------------------------------------------------------------------
// 그림 ID별 애니메이션 상태 저장소
//-----------------------------------------------------------------------------
CAP.animData = CAP.animData || {};

// 파일 이름 끝자리 파싱: 이름_3f_6s 또는 이름_3f_6a
CAP.nameRegex = /_(\d+)f_(\d+)([sa])$/;

CAP.parseName = function(name) {
  var match = CAP.nameRegex.exec(name);
  if (!match) return null;
  return {
    frameCount: Math.max(1, Number(match[1])),
    frameSpeed: Math.max(1, Number(match[2])),
    alwaysAnimate: match[3] === 'a'
  };
};

//-----------------------------------------------------------------------------
// Game_Screen - 그림을 지우면 애니메이션 상태도 같이 정리
//-----------------------------------------------------------------------------
CAP.Game_Screen_erasePicture = Game_Screen.prototype.erasePicture;
Game_Screen.prototype.erasePicture = function(pictureId) {
  CAP.Game_Screen_erasePicture.call(this, pictureId);
  delete CAP.animData[pictureId];
};

//-----------------------------------------------------------------------------
// Sprite_Picture - 이름 규칙을 인식해서 자동으로 프레임 슬라이스
//-----------------------------------------------------------------------------
CAP.Sprite_Picture_updateBitmap = Sprite_Picture.prototype.updateBitmap;
Sprite_Picture.prototype.updateBitmap = function() {
  CAP.Sprite_Picture_updateBitmap.call(this);
  if (this.visible && this.bitmap) {
    this.refreshAnimSetup();
    this.updateAnimFrame();
  }
};

Sprite_Picture.prototype.refreshAnimSetup = function() {
  var picture = this.picture();
  if (!picture) return;
  var name = picture.name();

  var data = CAP.animData[this._pictureId];

  // 그림이 바뀌었거나 아직 등록 안 됐다면 새로 파싱
  if (!data || data.sourceName !== name) {
    var parsed = CAP.parseName(name);
    if (parsed) {
      CAP.animData[this._pictureId] = {
        sourceName: name,
        frameCount: parsed.frameCount,
        frameSpeed: parsed.frameSpeed,
        alwaysAnimate: parsed.alwaysAnimate,
        frameIndex: 0,
        count: 0
      };
    } else {
      delete CAP.animData[this._pictureId];
    }
  }
};

Sprite_Picture.prototype.isMessageBusy = function() {
  return (
    $gameMessage.hasText() ||
    $gameMessage.isChoice() ||
    $gameMessage.isNumberInput() ||
    $gameMessage.isItemChoice()
  );
};

Sprite_Picture.prototype.updateAnimFrame = function() {
  var data = CAP.animData[this._pictureId];
  if (!data || !this.bitmap || !this.bitmap.isReady()) return;

  var shouldAnimate = data.alwaysAnimate ? true : this.isMessageBusy();

  if (shouldAnimate) {
    data.count++;
    if (data.count >= data.frameSpeed) {
      data.count = 0;
      data.frameIndex = (data.frameIndex + 1) % data.frameCount;
    }
  } else {
    data.frameIndex = 0;
    data.count = 0;
  }

  var frameWidth = Math.floor(this.bitmap.width / data.frameCount);
  var frameHeight = this.bitmap.height;
  this.setFrame(frameWidth * data.frameIndex, 0, frameWidth, frameHeight);
};
