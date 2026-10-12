//=============================================================================
// CharacterShake.js
//=============================================================================

/*:
 * @plugindesc 캐릭터(플레이어/이벤트/팔로워)를 일정 시간동안 흔드는 플러그인
 * @author ㄹㅅㅁ
 *
 * @help
 * ------------------------------------------------------------------
 * 플러그인 커맨드
 * ------------------------------------------------------------------
 * CharacterShake charId power speed duration
 *
 *   charId   : 0 = 플레이어, -1 = 이 이벤트(자기 자신), 1 이상 = 이벤트 ID
 *              F1, F2, F3 = 팔로워 1,2,3번째
 *   power    : 흔들리는 폭 (픽셀 단위, 기본 4 정도 권장)
 *   speed    : 흔들리는 속도 (1~9 정도 권장, 클수록 빠름)
 *   duration : 지속 프레임 수 (60 = 1초)
 *
 * 예시)
 *   CharacterShake 0 5 8 60      // 플레이어를 60프레임 동안 흔든다
 *   CharacterShake -1 4 6 30     // 이 이벤트를 30프레임 동안 흔든다
 *   CharacterShake 3 6 8 90      // 3번 이벤트를 90프레임 동안 흔든다
 *   CharacterShake F1 4 6 40     // 첫번째 팔로워를 흔든다
 *
 * CharacterShakeStop charId
 *   지정한 캐릭터의 흔들림을 즉시 정지시킨다.
 *
 * ------------------------------------------------------------------
 * 스크립트 (이벤트 커맨드 없이 직접 걸고 싶을 때)
 * ------------------------------------------------------------------
 *   $gamePlayer.startShake(power, speed, duration);
 *   $gameMap.event(eventId).startShake(power, speed, duration);
 *
 * ------------------------------------------------------------------
 */

(function() {

    var pluginName = 'CharacterShake';

    //-----------------------------------------------------------------------
    // Plugin Command

    var _CharacterShake_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _CharacterShake_Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'CharacterShake') {
            var character = this.characterShakeTarget(args[0]);
            if (character) {
                var power = Number(args[1] || 4);
                var speed = Number(args[2] || 6);
                var duration = Number(args[3] || 30);
                character.startShake(power, speed, duration);
            }
        } else if (command === 'CharacterShakeStop') {
            var character = this.characterShakeTarget(args[0]);
            if (character) {
                character.stopShake();
            }
        }
    };

    Game_Interpreter.prototype.characterShakeTarget = function(idText) {
        if (idText === undefined) return null;
        if (/^F(\d+)$/i.test(idText)) {
            var index = Number(RegExp.$1) - 1;
            return $gamePlayer.followers().follower(index);
        }
        var id = Number(idText);
        if (id === 0) {
            return $gamePlayer;
        } else if (id > 0) {
            return $gameMap.event(id);
        } else {
            return this.character(id);
        }
    };

    //-----------------------------------------------------------------------
    // Game_CharacterBase

    var _CharacterShake_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
        _CharacterShake_Game_CharacterBase_initMembers.call(this);
        this._shakePower = 0;
        this._shakeSpeed = 0;
        this._shakeDuration = 0;
        this._shakePhase = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    };

    Game_CharacterBase.prototype.startShake = function(power, speed, duration) {
        this._shakePower = power;
        this._shakeSpeed = speed;
        this._shakeDuration = duration;
        this._shakePhase = 0;
    };

    Game_CharacterBase.prototype.stopShake = function() {
        this._shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    };

    var _CharacterShake_Game_CharacterBase_update = Game_CharacterBase.prototype.update;
    Game_CharacterBase.prototype.update = function() {
        _CharacterShake_Game_CharacterBase_update.call(this);
        this.updateShake();
    };

    Game_CharacterBase.prototype.updateShake = function() {
        if (this._shakeDuration > 0) {
            this._shakePhase += this._shakeSpeed;
            var rate = this._shakeDuration / (this._shakeDuration + 10); // 서서히 감쇠
            this.shakeOffsetX = Math.round(Math.sin(this._shakePhase * 0.5) * this._shakePower * rate);
            this.shakeOffsetY = Math.round(Math.cos(this._shakePhase * 0.5) * this._shakePower * rate);
            this._shakeDuration--;
            if (this._shakeDuration <= 0) {
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }
    };

    //-----------------------------------------------------------------------
    // Sprite_Character

    var _CharacterShake_Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        _CharacterShake_Sprite_Character_updatePosition.call(this);
        if (this._character) {
            this.x += this._character.shakeOffsetX || 0;
            this.y += this._character.shakeOffsetY || 0;
        }
    };

})();
