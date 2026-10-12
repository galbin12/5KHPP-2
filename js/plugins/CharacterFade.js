//=============================================================================
// CharacterFade.js
//=============================================================================

/*:
 * @plugindesc 캐릭터(플레이어/이벤트/팔로워)를 페이드인/아웃 시키는 플러그인
 * @author ㄹㅅㅁ
 *
 * @help
 * ------------------------------------------------------------------
 * 플러그인 커맨드
 * ------------------------------------------------------------------
 * CharacterFadeOut charId duration
 * CharacterFadeIn  charId duration
 *
 *   charId   : 0 = 플레이어, -1 = 이 이벤트(자기 자신), 1 이상 = 이벤트 ID
 *              F1, F2, F3 = 팔로워 1,2,3번째
 *   duration : 페이드에 걸리는 프레임 수 (60 = 1초, 생략 시 30)
 *
 * 예시)
 *   CharacterFadeOut 0 60     // 플레이어 60프레임 동안 페이드아웃(투명해짐)
 *   CharacterFadeIn -1 30     // 이 이벤트 30프레임 동안 페이드인(선명해짐)
 *   CharacterFadeOut 3 45     // 3번 이벤트 45프레임 동안 페이드아웃
 *   CharacterFadeIn F1 60     // 첫번째 팔로워 페이드인
 *
 * CharacterFadeWait charId
 *   해당 캐릭터의 페이드가 끝날 때까지 이벤트를 대기시킨다.
 *   (페이드 커맨드 바로 다음 줄에 넣어서 사용)
 *
 * CharacterSetOpacity charId opacity
 *   페이드 없이 즉시 해당 오퍼시티(0~255)로 설정한다.
 *   0 = 완전 투명, 255 = 완전 불투명, 128 = 반투명(절반) 등 원하는 값 지정 가능.
 *   ex) CharacterSetOpacity 3 0     // 3번 이벤트 즉시 투명 처리
 *       CharacterSetOpacity 3 128  // 3번 이벤트 즉시 반투명 처리
 *   보통 이벤트 시작 페이지 맨 앞에 넣어서 "평소엔 안 보이다가"를 구현할 때 씁니다.
 *
 * ------------------------------------------------------------------
 * 스크립트 (이벤트 커맨드 없이 직접 걸고 싶을 때)
 * ------------------------------------------------------------------
 *   $gamePlayer.startFade(true, 60);   // true = fade out(사라짐), false = fade in(나타남)
 *   $gameMap.event(eventId).startFade(false, 30);
 *
 * 즉시 투명/불투명하게 만들고 싶으면:
 *   character.setOpacity(0);   // 완전 투명
 *   character.setOpacity(255); // 완전 불투명
 *
 * ------------------------------------------------------------------
 * 주의
 * ------------------------------------------------------------------
 * - 이 플러그인은 캐릭터의 opacity(불투명도)만 조절합니다.
 * - 이벤트 커맨드의 '캐릭터의 투명 상태 변경'(_transparent)과는 다른 별개의
 *   값이므로 서로 충돌하지 않습니다.
 * - 완전히 투명(opacity 0) 상태여도 캐릭터의 충돌판정/이벤트 실행 조건 등은
 *   그대로 유지되니, 통행 불가 처리는 별도 스위치/리전으로 관리하세요.
 *
 * ------------------------------------------------------------------
 */

(function() {

    var pluginName = 'CharacterFade';

    //-----------------------------------------------------------------------
    // Plugin Command

    var _CharacterFade_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _CharacterFade_Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'CharacterFadeOut') {
            var character = this.characterFadeTarget(args[0]);
            if (character) {
                var duration = Number(args[1] || 30);
                character.startFade(true, duration);
                this._characterFadeWaitTarget = character;
            }
        } else if (command === 'CharacterFadeIn') {
            var character = this.characterFadeTarget(args[0]);
            if (character) {
                var duration = Number(args[1] || 30);
                character.startFade(false, duration);
                this._characterFadeWaitTarget = character;
            }
        } else if (command === 'CharacterFadeWait') {
            var character = args[0] !== undefined ?
                this.characterFadeTarget(args[0]) : this._characterFadeWaitTarget;
            if (character) {
                this.setWaitMode('characterFade');
                this._characterFadeWaitTarget = character;
            }
        } else if (command === 'CharacterSetOpacity') {
            var character = this.characterFadeTarget(args[0]);
            if (character) {
                var opacity = Number(args[1] !== undefined ? args[1] : 255);
                character.setOpacity(opacity);
            }
        }
    };

    Game_Interpreter.prototype.characterFadeTarget = function(idText) {
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

    var _CharacterFade_Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'characterFade') {
            var target = this._characterFadeWaitTarget;
            if (!target || !target.isFading()) {
                this._waitMode = '';
                return false;
            }
            return true;
        }
        return _CharacterFade_Game_Interpreter_updateWaitMode.call(this);
    };

    //-----------------------------------------------------------------------
    // Game_CharacterBase

    var _CharacterFade_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
        _CharacterFade_Game_CharacterBase_initMembers.call(this);
        this._fadeOpacity = 255;
        this._fadeTarget = 255;
        this._fadeDuration = 0;
        this._fadeMaxDuration = 0;
    };

    Game_CharacterBase.prototype.startFade = function(fadeOut, duration) {
        duration = Math.max(1, duration || 30);
        this._fadeTarget = fadeOut ? 0 : 255;
        this._fadeMaxDuration = duration;
        this._fadeDuration = duration;
    };

    Game_CharacterBase.prototype.setOpacity = function(opacity) {
        this._fadeOpacity = opacity.clamp(0, 255);
        this._fadeTarget = this._fadeOpacity;
        this._fadeDuration = 0;
    };

    Game_CharacterBase.prototype.isFading = function() {
        return this._fadeDuration > 0;
    };

    var _CharacterFade_Game_CharacterBase_update = Game_CharacterBase.prototype.update;
    Game_CharacterBase.prototype.update = function() {
        _CharacterFade_Game_CharacterBase_update.call(this);
        this.updateFade();
    };

    Game_CharacterBase.prototype.updateFade = function() {
        if (this._fadeDuration > 0) {
            var startOpacity = this._fadeOpacity;
            var d = this._fadeDuration;
            this._fadeOpacity = (this._fadeOpacity * (d - 1) + this._fadeTarget) / d;
            this._fadeDuration--;
            if (this._fadeDuration <= 0) {
                this._fadeOpacity = this._fadeTarget;
            }
        }
    };

    //-----------------------------------------------------------------------
    // Sprite_Character

    var _CharacterFade_Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
    Sprite_Character.prototype.updateOther = function() {
        _CharacterFade_Sprite_Character_updateOther.call(this);
        if (this._character && this._character._fadeOpacity !== undefined) {
            this.opacity = Math.round(this._character._fadeOpacity);
        }
    };

})();
