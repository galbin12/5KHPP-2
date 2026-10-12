//=============================================================================
// EnemyIntroAnimation.js
//=============================================================================

/*:
 * @plugindesc v1.0 전투 시작 때 적이 직접 그린 프레임 이미지로 등장 애니메이션을 한 번 재생합니다.
 * @author Claude
 *
 * @param Wait For Intro
 * @text 등장 끝까지 대기
 * @type boolean
 * @on 대기함
 * @off 대기 안 함
 * @desc 등장 애니메이션이 끝날 때까지 전투 진행(커맨드 입력 등)을 기다릴지 여부
 * @default true
 *
 * @param Default Speed
 * @text 기본 속도
 * @type number
 * @min 1
 * @desc 속도를 지정하지 않았을 때 프레임 한 장당 틱 수 (60틱 = 1초, 작을수록 빠름)
 * @default 6
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 1. 직접 그린 등장 그림들을 "가로로" 나란히 이어붙여 한 장으로 만들고
 *    img/enemies 폴더에 넣습니다.
 *    (프레임 1, 프레임 2, 프레임 3 ... 순서대로 가로 배치)
 *
 *      예) 한 프레임이 300x400, 8프레임이면 → 가로 2400px, 세로 400px
 *
 * 2. 적 캐릭터 메모란에 적습니다.
 *
 *      <등장모션: 파일명, 프레임수, 속도>
 *
 *      예) <등장모션: Slime_Intro, 8, 5>
 *          → Slime_Intro 이미지를 8프레임, 프레임당 5틱(약 0.08초)으로 1회 재생
 *
 *    - 속도는 생략할 수 있습니다 (기본 속도 파라미터 사용).
 *    - 파일명은 확장자를 뺍니다.
 *
 * 3. 재생이 끝나면 그 적의 원래 이미지(데이터베이스에 지정한 이미지)로 바뀝니다.
 *
 * ■ 선택 태그 (적 메모란)
 *
 *   <등장모션지연: 30>
 *       전투 화면이 열린 뒤 30프레임(0.5초) 기다렸다가 시작합니다.
 *       적이 여러 마리일 때 하나씩 순서대로 나오게 하고 싶을 때 쓰세요.
 *
 *   <등장모션SE: 파일명, 볼륨, 피치>
 *       등장 애니메이션이 시작될 때 효과음을 재생합니다.
 *       예) <등장모션SE: Thunder1, 90, 100>
 *
 * 영문 태그(<EnemyIntro: name, frames, speed>, <EnemyIntroDelay: n>,
 * <EnemyIntroSE: name, vol, pitch>)도 동일하게 동작합니다.
 *
 * ============================================================================
 * 그림 그릴 때 팁
 * ============================================================================
 * - 적은 "아래 가운데"를 기준으로 화면에 놓입니다. 그래서 프레임 그림은
 *   발(바닥)이 프레임 아래쪽 가운데에 오도록 그려 주세요.
 * - 위에서 떨어지는 연출처럼 화면 위쪽까지 쓰고 싶다면, 프레임 높이(세로)를
 *   원래 적 이미지보다 크게 잡고 아래를 맞추면 됩니다.
 *   (모든 프레임의 크기는 같아야 합니다)
 * - 맨 마지막 프레임은 원래 적 이미지와 같은 모습으로 끝내면
 *   원래 이미지로 바뀔 때 자연스럽습니다.
 *
 * ============================================================================
 * 참고
 * ============================================================================
 * - 일반 정면 적 이미지용입니다. YEP_X_AnimatedSVEnemies의 SV 배틀러에는
 *   적용되지 않습니다.
 * - 도중에 나타나는 적(숨어 있다가 등장하는 적)은 나타나는 순간에 재생됩니다.
 * - 이미지 파일을 못 찾으면 등장 애니메이션을 건너뛰고 전투를 진행합니다.
 * - 등장 이미지 파일 이름을 EnemyImageAnimation 규칙(_4f_10s)으로 짓지 마세요.
 *   (반복 재생과 겹칩니다)
 * - 플러그인 순서는 YEP 계열, EnemyImageSwitch, EnemyImageAnimation,
 *   EnemyAutoMotion보다 아래에 두세요.
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('EnemyIntroAnimation');
    var waitForIntro = String(parameters['Wait For Intro'] || 'true') === 'true';
    var defaultSpeed = Number(parameters['Default Speed'] || 6);

    //-------------------------------------------------------------------------
    // 노트태그 파싱 (데이터베이스 항목마다 한 번만)
    //-------------------------------------------------------------------------
    function getIntroData(enemy) {
        if (enemy._introData !== undefined) return enemy._introData;
        var note = enemy.note || '';
        var data = null;
        var m = /<(?:등장모션|EnemyIntro)\s*:\s*([^>]+)>/i.exec(note);
        if (m) {
            var args = m[1].split(',').map(function(s) { return s.trim(); });
            if (args[0]) {
                var frames = Math.floor(Number(args[1]));
                var speed = Math.floor(Number(args[2]));
                data = {
                    name: args[0],
                    frames: frames > 0 ? frames : 1,
                    speed: speed > 0 ? speed : defaultSpeed,
                    delay: 0,
                    se: null
                };
                var d = /<(?:등장모션지연|EnemyIntroDelay)\s*:\s*(\d+)\s*>/i.exec(note);
                if (d) data.delay = Number(d[1]);
                var s = /<(?:등장모션SE|EnemyIntroSE)\s*:\s*([^>]+)>/i.exec(note);
                if (s) {
                    var sa = s[1].split(',').map(function(x) { return x.trim(); });
                    if (sa[0]) {
                        data.se = {
                            name: sa[0],
                            volume: sa[1] ? Number(sa[1]) : 90,
                            pitch: sa[2] ? Number(sa[2]) : 100,
                            pan: 0
                        };
                    }
                }
            }
        }
        enemy._introData = data;
        return data;
    }

    function reserveImage(name, hue) {
        if (!name) return;
        if ($gameSystem.isSideView()) {
            ImageManager.reserveSvEnemy(name, hue);
        } else {
            ImageManager.reserveEnemy(name, hue);
        }
    }

    //-------------------------------------------------------------------------
    // Game_Enemy : 등장 중에는 등장 이미지를 battlerName으로 사용
    //-------------------------------------------------------------------------
    var _Game_Enemy_initMembers = Game_Enemy.prototype.initMembers;
    Game_Enemy.prototype.initMembers = function() {
        _Game_Enemy_initMembers.call(this);
        this._introActive = false;
    };

    Game_Enemy.prototype.introData = function() {
        return getIntroData(this.enemy());
    };

    var _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);
        var data = this.introData();
        this._introActive = !!data;
        if (data) {
            // 재생 직후 원래 이미지로 바뀔 때 깜빡이지 않도록 둘 다 미리 불러둠
            var hue = this.battlerHue();
            reserveImage(data.name, hue);
            reserveImage(this.enemy().battlerName, hue);
        }
    };

    var _Game_Enemy_battlerName = Game_Enemy.prototype.battlerName;
    Game_Enemy.prototype.battlerName = function() {
        if (this._introActive) {
            var data = this.introData();
            if (data) return data.name;
        }
        return _Game_Enemy_battlerName.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_Enemy : 프레임 잘라서 한 번 재생
    //-------------------------------------------------------------------------
    var _Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        _Sprite_Enemy_initMembers.call(this);
        this._introState = 'pending';   // pending → playing → (끝)
        this._introIndex = 0;
        this._introCount = 0;
        this._introDelay = -1;
        this._introSafety = 0;
    };

    Sprite_Enemy.prototype.isIntroOn = function() {
        if (!this._enemy || !this._enemy._introActive || this._svBattlerEnabled) return false;
        var data = this._enemy.introData();
        return !!data;
    };

    Sprite_Enemy.prototype.endIntro = function() {
        if (this._enemy) this._enemy._introActive = false;
        this._introState = 'done';
    };

    Sprite_Enemy.prototype.updateIntroFrame = function() {
        var enemy = this._enemy;
        var data = enemy.introData();
        var bitmap = this.bitmap;

        // 이미지 오류 / 도중에 쓰러짐 / 너무 오래 걸림 → 등장 생략
        if (bitmap.isError() || enemy.isDead() || ++this._introSafety > 1800) {
            this.endIntro();
            return;
        }

        var cw = Math.floor(bitmap.width / data.frames);
        var ch = bitmap.height;

        if (this._introState === 'pending') {
            var scene = SceneManager._scene;
            var sceneBusy = scene && scene.isBusy && scene.isBusy();
            if (this._introDelay < 0) this._introDelay = data.delay;
            if (!sceneBusy) {
                if (this._introDelay > 0) {
                    this._introDelay--;
                } else {
                    this._introState = 'playing';
                    if (data.se) AudioManager.playSe(data.se);
                }
            }
        } else if (this._introState === 'playing') {
            if (++this._introCount >= data.speed) {
                this._introCount = 0;
                this._introIndex++;
                if (this._introIndex >= data.frames) {
                    this._introIndex = data.frames - 1;
                    this.endIntro();
                }
            }
        }
        this.setFrame(this._introIndex * cw, 0, cw, ch);
    };

    var _Sprite_Enemy_updateFrame = Sprite_Enemy.prototype.updateFrame;
    Sprite_Enemy.prototype.updateFrame = function() {
        if (this.isIntroOn() && this.bitmap && this.bitmap.isReady() &&
            this._battlerName === this._enemy.introData().name) {
            this.updateIntroFrame();
            return;
        }
        _Sprite_Enemy_updateFrame.call(this);
    };

    // 등장이 끝날 때까지 전투 진행 대기
    var _Sprite_Enemy_isMoving = Sprite_Enemy.prototype.isMoving;
    Sprite_Enemy.prototype.isMoving = function() {
        if (waitForIntro && this._enemy && this._enemy.isAlive() && this.isIntroOn()) return true;
        return _Sprite_Enemy_isMoving.call(this);
    };

})();
