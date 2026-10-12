//=============================================================================
// EnemyImageAnimation.js
// 적 배틀러 이미지(img/enemies) 파일명 규칙만으로, 직접 그린 여러 장의
// 그림을 한 장의 스프라이트시트로 이어붙여 순서대로 재생(플립북 애니메이션)
// 시켜주는 플러그인입니다. (사이드뷰 SV 배틀러가 아닌 일반 정면 적 이미지용)
//=============================================================================
var Imported = Imported || {};
Imported.EnemyImageAnimation = true;

var RS = RS || {};
RS.EIA = RS.EIA || {};

/*:
 * @plugindesc v1.0 적 배틀러 이미지 파일명 규칙으로 프레임 애니메이션 재생
 * @author ㄹㅅㅁ
 *
 * @param Default Frames
 * @desc 파일명 규칙이 없을 때 기본 프레임 수 (보통 사용 안 함)
 * @default 1
 *
 * @help
 * =============================================================================
 * 사용 방법 (플러그인 명령 필요 없음!)
 * =============================================================================
 * 1. img/enemies 폴더에 적 이미지를 넣습니다.
 *
 * 2. 여러 장의 그림을 "가로로" 나란히 이어붙여 한 장으로 만듭니다.
 *    (프레임 1, 프레임 2, 프레임 3 ... 순서대로 가로 배치)
 *
 * 3. 파일 이름을 아래 규칙대로 짓습니다.
 *
 *      [원하는이름]_[프레임수]f_[속도]s.png
 *
 *      예) slime_4f_10s.png
 *          -> 가로로 4장이 이어붙은 이미지, 프레임당 10틱(게임 프레임)마다 전환
 *
 *      예) dragon_6f_8s.png
 *          -> 6프레임, 8틱마다 전환, 계속 반복 재생
 *
 *    "속도" 단위는 초가 아니라 게임 틱(1/60초) 입니다. 숫자가 작을수록 빠릅니다.
 *
 * 4. 전체 이미지 가로 크기 = 한 프레임 가로 x 프레임수, 세로 크기는 프레임 1장
 *    분량 그대로입니다. (세로 이어붙이기 아님, 가로로만 이어붙입니다)
 *
 *      예) 한 프레임이 200x200이고 4프레임이면
 *          전체 이미지는 가로 800px, 세로 200px
 *
 * 5. 데이터베이스 - 적 캐릭터 - 이미지에서 이 파일을 그대로 선택하면 됩니다.
 *    등장 시 자동으로 1번 프레임부터 계속 반복 재생됩니다.
 *    (죽음 연출, 확대/축소 등 기존 효과와 함께 사용 가능)
 *
 * 6. 파일 이름이 이 규칙(끝이 _숫자f_숫자s)과 맞지 않으면 기존처럼
 *    한 장짜리 이미지로 그대로 표시됩니다. 기존 적 이미지와 100% 호환됩니다.
 *
 * =============================================================================
 * 주의
 * =============================================================================
 * - YEP_X_AnimatedSVEnemies의 사이드뷰(SV) 배틀러에는 적용되지 않습니다.
 *   (이 플러그인은 일반 정면 적 이미지 전용입니다)
 * - 죽음(쓰러짐) 연출 중에는 애니메이션이 멈추고 마지막 프레임 기준으로
 *   페이드/붕괴 효과가 적용됩니다.
 *
 * =============================================================================
 * 버전 로그
 * =============================================================================
 * 2026.08.23 (v1.0) - 최초 작성
 */

//-----------------------------------------------------------------------------
// 파일 이름에서 프레임수/속도를 추출하는 정규식: 이름_4f_10s
//-----------------------------------------------------------------------------
RS.EIA.nameRegex = /_(\d+)f_(\d+)s$/;

RS.EIA.parseName = function(name) {
  if (!name) return null;
  var match = RS.EIA.nameRegex.exec(name);
  if (!match) return null;
  var frames = Number(match[1]);
  var speed = Number(match[2]);
  if (!frames || !speed) return null;
  return { frames: frames, speed: speed };
};

//-----------------------------------------------------------------------------
// Sprite_Enemy - 파일명 규칙에 맞으면 프레임 애니메이션 적용
//-----------------------------------------------------------------------------
RS.EIA.Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
Sprite_Enemy.prototype.initMembers = function() {
  RS.EIA.Sprite_Enemy_initMembers.call(this);
  this._eiaFrameIndex = 0;
  this._eiaFrameCount = 0;
  this._eiaData = null;
  this._eiaName = '';
};

RS.EIA.Sprite_Enemy_updateBitmap = Sprite_Enemy.prototype.updateBitmap;
Sprite_Enemy.prototype.updateBitmap = function() {
  RS.EIA.Sprite_Enemy_updateBitmap.call(this);
  var name = this._enemy ? this._enemy.battlerName() : '';
  if (this._eiaName !== name) {
    this._eiaName = name;
    this._eiaData = RS.EIA.parseName(name);
    this._eiaFrameIndex = 0;
    this._eiaFrameCount = 0;
  }
};

RS.EIA.Sprite_Enemy_updateFrame = Sprite_Enemy.prototype.updateFrame;
Sprite_Enemy.prototype.updateFrame = function() {
  if (this._svBattlerEnabled) {
    // 사이드뷰(SV) 배틀러는 이 플러그인의 대상이 아니므로 기존 동작 유지
    RS.EIA.Sprite_Enemy_updateFrame.call(this);
    return;
  }
  if (this._eiaData && this.bitmap && this.bitmap.isReady()) {
    this.updateEIAFrame();
    return;
  }
  RS.EIA.Sprite_Enemy_updateFrame.call(this);
};

Sprite_Enemy.prototype.updateEIAFrame = function() {
  var data = this._eiaData;
  var bitmap = this.bitmap;
  var cw = Math.floor(bitmap.width / data.frames);
  var ch = bitmap.height;
  if (!this._appeared || this._effectType === 'bossCollapse' ||
      this._effectType === 'instantCollapse' ||
      this._effectType === 'whiten') {
    // 사망/붕괴 연출 중에는 마지막 프레임으로 고정
    this._eiaFrameIndex = data.frames - 1;
  } else {
    if (++this._eiaFrameCount >= data.speed) {
      this._eiaFrameCount = 0;
      this._eiaFrameIndex = (this._eiaFrameIndex + 1) % data.frames;
    }
  }
  var cdh = 0;
  if (this._effectType === 'bossCollapse') {
    cdh = ch - this._effectDuration;
  }
  this.setFrame(this._eiaFrameIndex * cw, 0, cw, ch - cdh);
};
