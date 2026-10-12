//=============================================================================
// DisableEncounterBySwitch.js
//=============================================================================

/*:
 * @plugindesc 특정 스위치가 ON일 때 랜덤 인카운트(적과의 조우)를 막습니다.
 * @author ㄹㅅㅁ
 *
 * @param Disable Switch IDs
 * @text 인카운트 차단 스위치 ID 목록
 * @type switch[]
 * @desc 이 목록에 있는 스위치 중 하나라도 ON이면 랜덤 인카운트가 발생하지 않습니다.
 * @default ["1"]
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 플러그인 파라미터에서 지정한 스위치 목록 중 하나라도 ON 상태이면
 * 맵 상에서 랜덤 인카운트(적과의 조우)가 발생하지 않습니다.
 * 목록에 있는 스위치를 모두 OFF로 돌리면 다시 정상적으로 인카운트가 발생합니다.
 *
 * 이벤트로 지정한 인카운트(전투 이벤트, Encounter Processing 등)에는
 * 영향을 주지 않습니다. 오직 랜덤 인카운트만 차단합니다.
 *
 * ============================================================================
 * 플러그인 명령 (선택 사항, 없어도 스위치만으로 작동)
 * ============================================================================
 * 없음. 스위치 ON/OFF로만 제어합니다.
 *
 */

(function() {

    var parameters = PluginManager.parameters('DisableEncounterBySwitch');

    var disableSwitchIds = JSON.parse(parameters['Disable Switch IDs'] || '["1"]').map(function(id) {
        return Number(id);
    });

    var _Game_Player_canEncounter = Game_Player.prototype.canEncounter;
    Game_Player.prototype.canEncounter = function() {
        for (var i = 0; i < disableSwitchIds.length; i++) {
            if ($gameSwitches.value(disableSwitchIds[i])) {
                return false;
            }
        }
        return _Game_Player_canEncounter.call(this);
    };

})();
