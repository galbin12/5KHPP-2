//=============================================================================
// VictoryMessageSuppress.js
//=============================================================================

/*:
 * @plugindesc 특정 전투(적 그룹)에서 승리했을 때 승리 대사/메시지(경험치, 골드, 아이템 획득 등)를 출력하지 않습니다.
 * @author ㄹㅅㅁ
 *
 * @help
 * 데이터베이스 > 적 그룹(Troop) 노트란에 아래 태그를 넣으면
 * 해당 전투에서 승리해도 로그 창에 아무 메시지도 출력되지 않습니다.
 * (경험치/골드/아이템 획득 텍스트, 레벨업 텍스트 포함)
 * 보상 자체(경험치, 골드, 아이템 획득)는 그대로 지급됩니다. 텍스트만 숨깁니다.
 *
 *   <NoVictoryMessage>
 *
 * ------------------------------------------------------------------------
 * 만약 노트 태그 대신 특정 스위치로 제어하고 싶다면 아래 파라미터를 사용하세요.
 * 해당 스위치가 ON 상태로 전투가 끝나면 승리 메시지가 출력되지 않습니다.
 *
 * @param Suppress Switch
 * @desc 이 스위치가 ON이면 승리 메시지를 출력하지 않습니다. (0 = 사용 안 함)
 * @default 0
 */

var VictoryMessageSuppress = VictoryMessageSuppress || {};

(function() {

    var parameters = PluginManager.parameters('VictoryMessageSuppress');
    var suppressSwitch = Number(parameters['Suppress Switch'] || 0);

    VictoryMessageSuppress.isSuppressed = function() {
        if ($gameTroop.troop() && $gameTroop.troop().meta && $gameTroop.troop().meta.NoVictoryMessage) {
            return true;
        }
        if (suppressSwitch > 0 && $gameSwitches.value(suppressSwitch)) {
            return true;
        }
        return false;
    };

    //=========================================================================
    // BattleManager
    //=========================================================================

    var _VMS_BattleManager_displayVictoryMessage = BattleManager.displayVictoryMessage;
    BattleManager.displayVictoryMessage = function() {
        if (VictoryMessageSuppress.isSuppressed()) return;
        _VMS_BattleManager_displayVictoryMessage.call(this);
    };

    var _VMS_BattleManager_displayRewards = BattleManager.displayRewards;
    BattleManager.displayRewards = function() {
        if (VictoryMessageSuppress.isSuppressed()) return;
        _VMS_BattleManager_displayRewards.call(this);
    };

    var _VMS_BattleManager_displayExp = BattleManager.displayExp;
    BattleManager.displayExp = function() {
        if (VictoryMessageSuppress.isSuppressed()) return;
        _VMS_BattleManager_displayExp.call(this);
    };

    var _VMS_BattleManager_displayGold = BattleManager.displayGold;
    BattleManager.displayGold = function() {
        if (VictoryMessageSuppress.isSuppressed()) return;
        _VMS_BattleManager_displayGold.call(this);
    };

    var _VMS_BattleManager_displayDropItems = BattleManager.displayDropItems;
    BattleManager.displayDropItems = function() {
        if (VictoryMessageSuppress.isSuppressed()) return;
        _VMS_BattleManager_displayDropItems.call(this);
    };

})();
