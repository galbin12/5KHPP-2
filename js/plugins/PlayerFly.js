//=============================================================================
// PlayerFly.js
//=============================================================================

/*:
 * @plugindesc 비행선 없이 플레이어(+팔로워)가 지형/장애물을 무시하고
 * 자유롭게 날아다니게 해줌. 위아래로 살짝 뜨는 비주얼과 그림자 포함.
 * @author ㄹㅅㅁ
 *
 * @param Rise Speed
 * @desc 비행 중 자동으로 위로 올라가는 속도 (초당 타일 수, 60프레임 기준)
 * @default 1.2
 *
 * @param Horizontal Speed
 * @desc 비행 중 좌우 이동 속도 (초당 타일 수, 60프레임 기준)
 * @default 3
 *
 * @param Bob Height
 * @desc 좌우 이동 위에 추가로 살짝 뜨는 높이 (px, 순수 비주얼용)
 * @default 6
 *
 * @param Bob Speed
 * @desc 위아래로 흔들리는 속도
 * @default 0.05
 *
 * @param Shadow Enabled
 * @desc 바닥에 그림자 표시 여부 (true/false)
 * @default true
 *
 * @param Shadow Opacity
 * @desc 그림자 불투명도 (0~255)
 * @default 160
 *
 * @param Ignore Encounters
 * @desc 비행 중 랜덤 인카운터 무시 (true/false)
 * @default true
 *
 * @param Ignore Damage Floor
 * @desc 비행 중 데미지 바닥 무시 (true/false)
 * @default true
 *
 * @help
 * ------------------------------------------------------------------
 * 플러그인 커맨드
 * ------------------------------------------------------------------
 *   PlayerFly_On     // 비행 시작 (지형/장애물 다 무시하고 자유이동)
 *   PlayerFly_Off    // 비행 종료 (원래대로 지형 판정 적용)
 *
 * ------------------------------------------------------------------
 * 스크립트
 * ------------------------------------------------------------------
 *   $gamePlayer.startFreeFly();
 *   $gamePlayer.stopFreeFly();
 *   $gamePlayer.isFreeFlyingActive();   // 현재 비행 중인지 확인
 *
 * ------------------------------------------------------------------
 * 설명
 * ------------------------------------------------------------------
 * - 비행 중에는 위쪽으로 자동으로 계속 상승함 (입력 불필요).
 * - 비행 중 방향키는 좌우(←→)만 먹힘. 위/아래 입력은 무시됨.
 * - 지형/장애물 판정을 완전히 무시하고 이동 가능 (물, 벽, 통행불가 지형
 *   전부 통과). 팔로워는 좌우 자동상승 없이 평소처럼 플레이어를 따라옴
 *   (뒤쪽에서 같이 비행 판정만 받아서 벽/물은 통과함).
 * - 비행 중에는 이벤트 접촉(터치) 트리거가 발동하지 않음 (비행선과 동일).
 * - 캐릭터가 제자리에서 위아래로 살짝 흔들리며 뜨는 비주얼이 추가됨.
 * - 옵션에 따라 그림자가 발밑에 표시됨.
 * - 옵션에 따라 랜덤 인카운터/데미지 바닥을 무시함.
 * ------------------------------------------------------------------
 */

(function() {

    var parameters = PluginManager.parameters('PlayerFly');
    var RISE_SPEED = (Number(parameters['Rise Speed']) || 1.2) / 60; // 타일/프레임
    var HORIZONTAL_SPEED = (Number(parameters['Horizontal Speed']) || 3) / 60; // 타일/프레임
    var BOB_HEIGHT = Number(parameters['Bob Height']) || 6;
    var BOB_SPEED = Number(parameters['Bob Speed']) || 0.05;
    var SHADOW_ENABLED = (parameters['Shadow Enabled'] || 'true') === 'true';
    var SHADOW_OPACITY = Number(parameters['Shadow Opacity']) || 160;
    var IGNORE_ENCOUNTERS = (parameters['Ignore Encounters'] || 'true') === 'true';
    var IGNORE_DAMAGE_FLOOR = (parameters['Ignore Damage Floor'] || 'true') === 'true';

    //-----------------------------------------------------------------------
    // Plugin Command

    var _PlayerFly_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _PlayerFly_Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'PlayerFly_On') {
            $gamePlayer.startFreeFly();
        } else if (command === 'PlayerFly_Off') {
            $gamePlayer.stopFreeFly();
        }
    };

    //-----------------------------------------------------------------------
    // Game_CharacterBase - 기본값 및 지형 무시 판정

    Game_CharacterBase.prototype.isFreeFlyingActive = function() {
        return false;
    };

    var _PlayerFly_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
        _PlayerFly_Game_CharacterBase_initMembers.call(this);
        this._freeFlyBobTime = Math.random() * Math.PI * 2;
    };

    var _PlayerFly_Game_CharacterBase_isMapPassable = Game_CharacterBase.prototype.isMapPassable;
    Game_CharacterBase.prototype.isMapPassable = function(x, y, d) {
        if (this.isFreeFlyingActive()) {
            return true;
        }
        return _PlayerFly_Game_CharacterBase_isMapPassable.call(this, x, y, d);
    };

    var _PlayerFly_Game_CharacterBase_update = Game_CharacterBase.prototype.update;
    Game_CharacterBase.prototype.update = function() {
        _PlayerFly_Game_CharacterBase_update.call(this);
        if (this.isFreeFlyingActive()) {
            if (!isFinite(this._freeFlyBobTime)) {
                this._freeFlyBobTime = 0; // 혹시 NaN이 되어도 자동 복구
            }
            this._freeFlyBobTime += BOB_SPEED;
        }
    };

    //-----------------------------------------------------------------------
    // Game_Player

    var _PlayerFly_Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _PlayerFly_Game_Player_initMembers.call(this);
        this._freeFly = false;
        this._freeFlyStartX = 0;
        this._freeFlyStartY = 0;
    };

    Game_Player.prototype.isFreeFlyingActive = function() {
        return !!this._freeFly;
    };

    Game_Player.prototype.startFreeFly = function() {
        this._freeFly = true;
        this._freeFlyStartX = this._x;
        this._freeFlyStartY = this._y;
    };

    Game_Player.prototype.stopFreeFly = function() {
        this._freeFly = false;
        // 비행 중 좌표가 소수점 상태일 수 있으므로 격자에 맞춰 정리
        this._x = Math.round(this._x);
        this._y = Math.round(this._y);
        this._realX = this._x;
        this._realY = this._y;
    };

    // 비행 시작 지점으로 좌표를 되돌림 (피격 낙하 후 재시작 등에 사용)
    Game_Player.prototype.resetFreeFlyPosition = function() {
        this._x = this._freeFlyStartX;
        this._y = this._freeFlyStartY;
        this._realX = this._x;
        this._realY = this._y;
        // 순간이동이라 화면 스크롤이 못 따라오므로 카메라도 즉시 스냅
        this.center(this._x, this._y);
    };

    // 비행 중에는 기본 격자 이동(방향키 상하좌우 눌러서 한 칸씩 이동) 대신
    // updateFreeFlyMove로 좌우 이동 + 자동 상승을 처리함.
    // (반드시 moveByInput 안에서 처리해야 카메라 스크롤 타이밍이 맞음)
    var _PlayerFly_Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        if (this._freeFly) {
            this.updateFreeFlyMove();
            return;
        }
        _PlayerFly_Game_Player_moveByInput.call(this);
    };

    Game_Player.prototype.updateFreeFlyMove = function() {
        // FallingItem.js 등에서 "비행 중 피격" 연출을 걸어둔 상태면
        // phase에 따라 좌표 이동 방식을 바꿈 (자동상승/좌우이동은 안 함)
        if (this._fallHitStunned) {
            if (this._fallHitPhase === 'fall' && this._fallHitWasFlying) {
                var t = 1 - (this._fallHitDuration / this._fallHitMaxDuration);
                if (this._fallHitHasLandTarget) {
                    this._x = this._fallHitStartX + (this._fallHitLandX - this._fallHitStartX) * t;
                    this._y = this._fallHitStartY + (this._fallHitLandY - this._fallHitStartY) * t;
                } else {
                    this._y = this._fallHitStartY + (this._fallHitTotalFallTiles || 0) * t;
                }
                this._realX = this._x;
                this._realY = this._y;
            } else if (this._fallHitPhase === 'bounce') {
                var bt = 1 - (this._fallHitBounceDuration / this._fallHitBounceMaxDuration);
                this._x = this._fallHitBounceStartX + (this._fallHitBounceTargetX - this._fallHitBounceStartX) * bt;
                this._realX = this._x;
            }
            return;
        }

        var dx = 0;
        if (Input.isPressed('left')) dx -= 1;
        if (Input.isPressed('right')) dx += 1;

        if (dx !== 0) {
            this._x += dx * HORIZONTAL_SPEED;
        }
        this.setDirection(8); // 비행 중엔 항상 뒷모습(위쪽) 고정

        // 위로 자동 상승 (입력 없이 계속 올라감)
        this._y -= RISE_SPEED;

        // 맵 경계 밖으로 나가지 않게 고정
        var maxX = $gameMap.width() - 1;
        var maxY = $gameMap.height() - 1;
        if (this._x < 0) this._x = 0;
        if (this._x > maxX) this._x = maxX;
        if (this._y < 0) this._y = 0;
        if (this._y > maxY) this._y = maxY;

        this._realX = this._x;
        this._realY = this._y;
    };

    var _PlayerFly_Game_Player_checkEventTriggerTouch = Game_Player.prototype.checkEventTriggerTouch;
    Game_Player.prototype.checkEventTriggerTouch = function(x, y) {
        if (this._freeFly) return;
        _PlayerFly_Game_Player_checkEventTriggerTouch.call(this, x, y);
    };

    if (IGNORE_ENCOUNTERS) {
        var _PlayerFly_Game_Player_encounterProgressValue = Game_Player.prototype.encounterProgressValue;
        Game_Player.prototype.encounterProgressValue = function() {
            if (this._freeFly) return 0;
            return _PlayerFly_Game_Player_encounterProgressValue.call(this);
        };
    }

    if (IGNORE_DAMAGE_FLOOR) {
        var _PlayerFly_Game_Player_isOnDamageFloor = Game_Player.prototype.isOnDamageFloor;
        Game_Player.prototype.isOnDamageFloor = function() {
            if (this._freeFly) return false;
            return _PlayerFly_Game_Player_isOnDamageFloor.call(this);
        };
    }

    //-----------------------------------------------------------------------
    // Game_Follower - 플레이어가 비행 중이면 팔로워도 같이 비행 판정

    Game_Follower.prototype.isFreeFlyingActive = function() {
        return !!($gamePlayer && $gamePlayer._freeFly);
    };

    //-----------------------------------------------------------------------
    // Sprite_Character - 위아래로 뜨는 비주얼

    var _PlayerFly_Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        _PlayerFly_Sprite_Character_updatePosition.call(this);
        if (this._character && this._character.isFreeFlyingActive()) {
            var bobTime = this._character._freeFlyBobTime;
            var bobOffset = isFinite(bobTime) ? Math.round(Math.sin(bobTime) * BOB_HEIGHT) : 0;
            this.y += bobOffset;
        }
    };

    // 비행 중엔 다른 플러그인이 투명도/visible을 건드려도 강제로 보이게 처리
    var _PlayerFly_Sprite_Character_update2 = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _PlayerFly_Sprite_Character_update2.call(this);
        if (this._character && this._character.isFreeFlyingActive()) {
            this.visible = true;
            this.opacity = 255;
        }
    };

    //-----------------------------------------------------------------------
    // Spriteset_Map - 그림자

    if (SHADOW_ENABLED) {

        var _PlayerFly_Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
        Spriteset_Map.prototype.createCharacters = function() {
            _PlayerFly_Spriteset_Map_createCharacters.call(this);
            this.createFreeFlyShadows();
        };

        Spriteset_Map.prototype.freeFlyShadowBitmap = function() {
            if (!this._freeFlyShadowBitmap) {
                var bmp = new Bitmap(48, 24);
                var ctx = bmp.context;
                ctx.fillStyle = 'rgba(0,0,0,' + (SHADOW_OPACITY / 255).toFixed(2) + ')';
                ctx.beginPath();
                if (ctx.ellipse) {
                    ctx.ellipse(24, 12, 22, 8, 0, 0, Math.PI * 2);
                } else {
                    ctx.arc(24, 12, 18, 0, Math.PI * 2);
                }
                ctx.fill();
                bmp._setDirty();
                this._freeFlyShadowBitmap = bmp;
            }
            return this._freeFlyShadowBitmap;
        };

        Spriteset_Map.prototype.createFreeFlyShadows = function() {
            this._freeFlyShadowSprites = [];
            var chars = [$gamePlayer].concat($gamePlayer.followers()._data);
            for (var i = 0; i < chars.length; i++) {
                var shadow = new Sprite();
                shadow.bitmap = this.freeFlyShadowBitmap();
                shadow.anchor.x = 0.5;
                shadow.anchor.y = 0.5;
                shadow.visible = false;
                shadow._freeFlyTargetChar = chars[i];
                this._tilemap.addChild(shadow);
                this._freeFlyShadowSprites.push(shadow);
            }
        };

        var _PlayerFly_Spriteset_Map_update = Spriteset_Map.prototype.update;
        Spriteset_Map.prototype.update = function() {
            _PlayerFly_Spriteset_Map_update.call(this);
            if (this._freeFlyShadowSprites) {
                this.updateFreeFlyShadows();
            }
        };

        Spriteset_Map.prototype.updateFreeFlyShadows = function() {
            for (var i = 0; i < this._freeFlyShadowSprites.length; i++) {
                var shadow = this._freeFlyShadowSprites[i];
                var chara = shadow._freeFlyTargetChar;
                if (chara && chara.isFreeFlyingActive()) {
                    shadow.visible = true;
                    shadow.x = chara.screenX();
                    shadow.y = chara.screenY() + 4;
                } else {
                    shadow.visible = false;
                }
            }
        };
    }

})();
