//=============================================================================
// FallIntoHole.js
//=============================================================================

/*:
 * @plugindesc 캐릭터(플레이어/이벤트/팔로워)가 구멍/함정에 빠지는 연출.
 * 맵과 다른 이벤트들이 화면 위로 쓸려 올라가고, 낙하 캐릭터는 제자리에서
 * 회전하며 가라앉아 사라짐.
 * @author ㄹㅅㅁ
 *
 * @help
 * ------------------------------------------------------------------
 * 플러그인 커맨드
 * ------------------------------------------------------------------
 * FallIntoHole charId duration switchId erase fadeFrames
 *
 *   charId     : 0 = 플레이어, -1 = 이 이벤트(자기 자신), 1 이상 = 이벤트 ID
 *                F1, F2, F3 = 팔로워 1,2,3번째
 *   duration   : 연출 전체 길이 (프레임, 60 = 1초, 기본 40)
 *   switchId   : (생략 가능, 0으로 비워둘 수 있음) 연출이 끝나면 ON되는 스위치
 *   erase      : (생략 가능) "erase" 라고 쓰면 연출 끝난 뒤 해당 이벤트를 삭제
 *   fadeFrames : (생략 가능) 낙하가 끝나기 이 프레임 수 전부터 화면을
 *                자동으로 페이드아웃시킴. duration이 끝나는 시점에
 *                딱 맞춰 화면이 완전히 검게 됨. 이후 "장소 이동"을
 *                (페이드 없음으로) 바로 걸면 맵이 원래 위치로 복귀하는
 *                모습이 화면에 노출되지 않음.
 *
 * 예시)
 *   FallIntoHole 0 260 0 0 60
 *     // 플레이어가 260프레임 동안 낙하, 마지막 60프레임 구간에서
 *     // 자동으로 페이드아웃되어 딱 맞춰 화면이 검게 됨.
 *     // 이 다음 줄에 "장소 이동(페이드 없음)" → "페이드인"만 걸면 됨.
 *
 *   FallIntoHole -1 40 10 erase   // 이 이벤트가 빠지고 삭제됨 + 스위치 ON
 *
 * ------------------------------------------------------------------
 * 스크립트
 * ------------------------------------------------------------------
 *   $gamePlayer.startFallIntoHole(duration, switchId, erase);
 *   $gameMap.event(eventId).startFallIntoHole(duration, switchId, erase);
 *   character.isFalling();   // 연출 진행 중인지 확인
 *
 * ------------------------------------------------------------------
 * 연출 설명
 * ------------------------------------------------------------------
 * - 맵(타일)과 그 위의 모든 이벤트/캐릭터 스프라이트가 화면 기준으로
 *   위쪽으로 쓸려 올라감.
 * - 낙하 대상 캐릭터만 이 상승을 상쇄해서 화면상 원래 위치 부근에 남고,
 *   거기에 추가로 자체적인 하강 이동 + 좌우 회전(랜덤 방향) + 축소 +
 *   페이드아웃이 더해져서 "제자리에서 구멍으로 떨어지는" 것처럼 보임.
 * - 연출은 화면 전체(맵 전체)에 적용되므로, 한 번에 한 캐릭터만
 *   낙하시키는 것을 권장. (동시에 두 캐릭터가 부르면 나중 호출한
 *   지속시간이 화면 상승 효과를 덮어씀)
 * - 완료 대기(웨이트) 커맨드는 없으므로, switchId를 지정하고
 *   "스위치 ON까지 반복 대기" 형태로 이벤트를 구성할 것.
 *
 * ------------------------------------------------------------------
 */

(function() {

    var pluginName = 'FallIntoHole';

    //-----------------------------------------------------------------------
    // Plugin Command

    var _FallIntoHole_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _FallIntoHole_Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'FallIntoHole') {
            var character = this.fallIntoHoleTarget(args[0]);
            if (character) {
                var duration = Number(args[1] || 40);
                var switchId = args[2] ? Number(args[2]) : 0;
                var erase = (args[3] || '').toLowerCase() === 'erase';
                var fadeFrames = args[4] ? Number(args[4]) : 0;
                character.startFallIntoHole(duration, switchId, erase, fadeFrames);
                this.wait(duration); // 연출(+자동 페이드아웃)이 끝날 때까지 이벤트 진행을 멈춤
            }
        }
    };

    Game_Interpreter.prototype.fallIntoHoleTarget = function(idText) {
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
    // Game_Screen - 맵 전체를 위로 밀어올리는 효과

    var _FallIntoHole_Game_Screen_clear = Game_Screen.prototype.clear;
    Game_Screen.prototype.clear = function() {
        _FallIntoHole_Game_Screen_clear.call(this);
        this._mapFallDuration = 0;
        this._mapFallMaxDuration = 0;
        this._mapFallShiftY = 0;
    };

    Game_Screen.prototype.startMapFallShift = function(duration) {
        this._mapFallMaxDuration = Math.max(1, duration || 40);
        this._mapFallDuration = this._mapFallMaxDuration;
        this._mapFallShiftY = 0;
    };

    Game_Screen.prototype.mapFallShiftY = function() {
        return this._mapFallShiftY || 0;
    };

    var _FallIntoHole_Game_Screen_update = Game_Screen.prototype.update;
    Game_Screen.prototype.update = function() {
        _FallIntoHole_Game_Screen_update.call(this);
        this.updateMapFallShift();
    };

    Game_Screen.prototype.updateMapFallShift = function() {
        if (this._mapFallDuration > 0) {
            var t = 1 - (this._mapFallDuration / this._mapFallMaxDuration);
            var eased = t * t; // 점점 빨라지며 밀려올라감
            this._mapFallShiftY = Math.round(eased * (Graphics.height * 0.75));
            this._mapFallDuration--;
            if (this._mapFallDuration <= 0) {
                this._mapFallShiftY = 0;
            }
        }
    };

    var _FallIntoHole_Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _FallIntoHole_Game_Map_setup.call(this, mapId);
        // 맵이 바뀌면 이전 맵의 낙하 연출로 인한 화면 밀림이 남아있지 않도록 강제 초기화
        $gameScreen._mapFallDuration = 0;
        $gameScreen._mapFallMaxDuration = 0;
        $gameScreen._mapFallShiftY = 0;
        // 낙하 연출로 숨겨졌던 플레이어/팔로워를 새 맵에서는 다시 보이게 함
        $gamePlayer._fallHidden = false;
        $gamePlayer.followers()._data.forEach(function(follower) {
            follower._fallHidden = false;
        });
    };

    //-----------------------------------------------------------------------
    // Spriteset_Map - 타일맵(+그 자식인 캐릭터 스프라이트 전체) 이동

    var _FallIntoHole_Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _FallIntoHole_Spriteset_Map_update.call(this);
        if (this._tilemap) {
            this._tilemap.y = -($gameScreen.mapFallShiftY() || 0);
        }
    };

    //-----------------------------------------------------------------------
    // Game_CharacterBase

    var _FallIntoHole_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
        _FallIntoHole_Game_CharacterBase_initMembers.call(this);
        this._fallDuration = 0;
        this._fallMaxDuration = 0;
        this._fallSwitchId = 0;
        this._fallErase = false;
        this._fallThroughRestore = false;
        this._fallTiltDirection = 1;
        this._fallHidden = false;
        this._fallFadeFrames = 0;
        this._fallFadeTriggered = false;
        this.fallOffsetY = 0;
        this.fallScale = 1;
        this.fallOpacityRate = 1;
        this.fallRotation = 0;
    };

    Game_CharacterBase.prototype.startFallIntoHole = function(duration, switchId, erase, fadeFrames) {
        this._fallMaxDuration = Math.max(1, duration || 40);
        this._fallDuration = this._fallMaxDuration;
        this._fallSwitchId = switchId || 0;
        this._fallErase = !!erase;
        this._fallThroughRestore = this.isThrough();
        this._fallTiltDirection = (Math.random() < 0.5 ? -1 : 1);
        this._fallFadeFrames = Math.min(fadeFrames || 0, this._fallMaxDuration);
        this._fallFadeTriggered = false;
        this.setThrough(true);
        this.fallOffsetY = 0;
        this.fallScale = 1;
        this.fallOpacityRate = 1;
        this.fallRotation = 0;
        // 화면(맵) 전체를 위로 밀어올리는 연출 시작
        $gameScreen.startMapFallShift(this._fallMaxDuration);
    };

    Game_CharacterBase.prototype.isFalling = function() {
        return this._fallDuration > 0;
    };

    var _FallIntoHole_Game_CharacterBase_update = Game_CharacterBase.prototype.update;
    Game_CharacterBase.prototype.update = function() {
        _FallIntoHole_Game_CharacterBase_update.call(this);
        this.updateFallIntoHole();
    };

    Game_CharacterBase.prototype.updateFallIntoHole = function() {
        if (this._fallDuration > 0) {
            var t = 1 - (this._fallDuration / this._fallMaxDuration); // 0 -> 1
            var eased = t * t;
            this.fallOffsetY = Math.round(eased * 40);         // 제자리에서 조금 더 가라앉는 양
            this.fallOpacityRate = Math.max(0, 1 - eased * 1.2);
            this.fallRotation = eased * this._fallTiltDirection * 0.6; // 최대 약 34도 회전
            if (this._fallFadeFrames > 0 && !this._fallFadeTriggered &&
                    this._fallDuration <= this._fallFadeFrames) {
                $gameScreen.startFadeOut(this._fallFadeFrames);
                this._fallFadeTriggered = true;
            }
            this._fallDuration--;
            if (this._fallDuration <= 0) {
                this.onFallIntoHoleEnd();
            }
        }
    };

    Game_CharacterBase.prototype.onFallIntoHoleEnd = function() {
        this.fallOffsetY = 0;
        this.fallScale = 0;
        this.fallOpacityRate = 0;
        this._fallHidden = true; // 연출이 끝나도 다시 보이지 않도록 유지
        this.fallRotation = 0;
        this.setThrough(this._fallThroughRestore);
        if (this._fallSwitchId > 0) {
            $gameSwitches.setValue(this._fallSwitchId, true);
        }
        if (this._fallErase && this instanceof Game_Event) {
            this.erase();
        }
    };

    //-----------------------------------------------------------------------
    // Game_Player - 낙하 중 이동 입력 차단

    var _FallIntoHole_Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (this.isFalling && this.isFalling()) {
            return false;
        }
        return _FallIntoHole_Game_Player_canMove.call(this);
    };

    //-----------------------------------------------------------------------
    // Sprite_Character

    var _FallIntoHole_Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        _FallIntoHole_Sprite_Character_updatePosition.call(this);
        if (this._character) {
            this.y += this._character.fallOffsetY || 0;
            // 낙하 중인 캐릭터는 맵 전체 상승분을 상쇄해서 화면상 제자리를 유지
            if (this._character.isFalling && this._character.isFalling()) {
                this.y += ($gameScreen.mapFallShiftY() || 0);
            }
        }
    };

    var _FallIntoHole_Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _FallIntoHole_Sprite_Character_update.call(this);
        if (this._character) {
            if (this._character.isFalling && this._character.isFalling()) {
                this.opacity = Math.round(255 * this._character.fallOpacityRate);
                this.rotation = this._character.fallRotation || 0;
            } else if (this._character._fallHidden) {
                // 연출이 끝난 뒤에도 엔진이 투명도를 되돌리지 못하게 계속 숨김 유지
                this.opacity = 0;
                this.rotation = 0;
            } else if (this.rotation !== 0 && (this._character.fallRotation || 0) === 0) {
                this.rotation = 0;
            }
        }
    };

})();
