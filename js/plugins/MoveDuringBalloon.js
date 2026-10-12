//=============================================================================
// MoveDuringBalloon.js
//=============================================================================

/*:
 * @plugindesc RS_MessageSystem의 말풍선 메시지가 떠 있는 동안에도
 * 플레이어가 계속 이동할 수 있게 합니다.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * RPG Maker MV 기본 동작은 이벤트(메시지 포함)가 실행 중이면 플레이어가
 * 움직일 수 없습니다. 이 플러그인은 그 중에서 "말풍선 모드" 메시지가 떠
 * 있는 경우에만 예외적으로 플레이어 이동을 허용합니다.
 * (일반 중앙 메시지 창은 기존처럼 그대로 이동 불가)
 *
 * 반드시 RS_MessageSystem.js 보다 아래쪽에 배치하세요.
 * 이동 관련 다른 플러그인(GALV_CamControl 등)과 충돌 방지를 위해
 * 플러그인 목록에서 가능한 한 아래쪽에 두는 걸 권장합니다.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {

    Game_Player.prototype.canMove = function() {
        if (this._vehicleGettingOn || this._vehicleGettingOff || this.isMoving()) {
            return false;
        }
        if ($gameMap.isEventRunning()) {
            var balloonActive = $gameMessage.isBusy() &&
                RS.MessageSystem && RS.MessageSystem.Params &&
                $gameMessage.getBalloon() !== RS.MessageSystem.Params.RESET_DEFAULT_STYLE;
            if (!balloonActive) {
                return false;
            }
        }
        if (this.isInVehicle() && !this.vehicle().canMove()) {
            return false;
        }
        return true;
    };

})();
