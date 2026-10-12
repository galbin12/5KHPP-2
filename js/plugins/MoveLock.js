//=============================================================================
// MoveLock.js
//=============================================================================

/*:
 * @plugindesc 일정 시간 동안(또는 해제할 때까지) 플레이어의 이동을 막습니다.
 * @author
 *
 * @param LockSwitchId
 * @desc 이 번호의 스위치가 ON인 동안에도 이동을 막습니다. (0이면 사용 안 함)
 * @type switch
 * @default 0
 *
 * @help
 * ============================================================================
 * 플러그인 명령
 * ============================================================================
 * MoveLock 120        120프레임(60프레임 = 1초) 동안 이동을 막습니다.
 * MoveLock sec 2.5    2.5초 동안 이동을 막습니다.
 * MoveLock on         해제 명령을 내릴 때까지 계속 막습니다.
 * MoveLock off        즉시 이동 잠금을 해제합니다.
 *
 * ============================================================================
 * 참고
 * ============================================================================
 * - 이벤트는 돌아가지 않고 플레이어 이동만 막기 때문에, 병렬 처리나
 *   다른 이벤트는 그대로 동작합니다.
 * - 잠겨 있는 동안 방향키, 마우스(터치) 이동, 확인 버튼으로 말 걸기도
 *   함께 막힙니다. (메뉴 호출은 막지 않습니다.)
 * - 잠금 중에 찍어둔 마우스 목적지는 지워져서, 풀린 뒤에 갑자기
 *   걸어가지 않습니다.
 * - 남은 시간은 세이브 파일에 같이 저장됩니다.
 * - 플러그인 순서: canMove 를 통째로 덮어쓰는 플러그인
 *   (예: MoveDuringBalloon)보다 아래에 두세요.
 */

(function() {

    var parameters = PluginManager.parameters('MoveLock');
    var lockSwitchId = Number(parameters['LockSwitchId'] || 0);

    //-------------------------------------------------------------------------
    // Game_Player
    //   _moveLockFrames :  0 = 잠금 없음 / 양수 = 남은 프레임 / -1 = 무제한

    var _MoveLock_Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _MoveLock_Game_Player_initMembers.call(this);
        this._moveLockFrames = 0;
    };

    Game_Player.prototype.setMoveLock = function(frames) {
        this._moveLockFrames = frames;
    };

    Game_Player.prototype.isMoveLocked = function() {
        if ((this._moveLockFrames || 0) !== 0) return true;
        if (lockSwitchId > 0 && $gameSwitches.value(lockSwitchId)) return true;
        return false;
    };

    var _MoveLock_Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (this.isMoveLocked()) return false;
        return _MoveLock_Game_Player_canMove.call(this);
    };

    var _MoveLock_Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        if (this.isMoveLocked()) {
            // 잠금 중 찍어둔 마우스 목적지 제거
            $gameTemp.clearDestination();
        }
        if (this._moveLockFrames > 0) {
            this._moveLockFrames--;
        }
        _MoveLock_Game_Player_update.call(this, sceneActive);
    };

    //-------------------------------------------------------------------------
    // 플러그인 명령

    var _MoveLock_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _MoveLock_Game_Interpreter_pluginCommand.call(this, command, args);
        if (String(command).toLowerCase() !== 'movelock') return;

        var first = String(args[0] || '').toLowerCase();
        if (first === 'on') {
            $gamePlayer.setMoveLock(-1);
        } else if (first === 'off') {
            $gamePlayer.setMoveLock(0);
        } else if (first === 'sec') {
            var sec = Number(args[1]);
            if (sec > 0) $gamePlayer.setMoveLock(Math.ceil(sec * 60));
        } else {
            var frames = Number(first);
            if (frames > 0) $gamePlayer.setMoveLock(Math.ceil(frames));
        }
    };

})();
