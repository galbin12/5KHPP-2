//=============================================================================
// BattlePartyRestore.js
//=============================================================================

/*:
 * @plugindesc 전투가 끝나면 전투 시작 때의 파티 구성으로 되돌립니다.
 * @author Claude
 *
 * @param Disable Switch
 * @desc 이 스위치가 ON인 동안은 복구하지 않습니다. (전투 중 일부러 동료를 영입하는 경우 등) 0이면 항상 복구.
 * @type switch
 * @default 0
 *
 * @param Debug Log
 * @desc 복구가 일어났을 때 F8 콘솔(테스트 플레이)에 로그를 남깁니다.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * 전투가 시작될 때 파티 구성(액터 ID와 순서)을 저장해 두었다가, 전투가 끝나면
 * 파티 구성이 달라져 있을 때만 저장해 둔 구성으로 되돌립니다.
 *
 *  - 전투 중 파티원이 빠지거나 늘어서 "구성(멤버)"이 달라졌으면 → 원래대로 복구
 *  - 멤버는 같고 순서만 바뀐 경우(전투 중 "파티" 명령으로 교체)는 → 그대로 둠
 *
 * 전투 중 일부러 영입/제외한 결과를 유지하고 싶은 전투는 Disable Switch 를
 * 지정하고, 그 전투 직전에 켜 두세요.
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * 전투 관련 플러그인(YEP 계열, BattlePartyChange 등)보다 아래에 두세요.
 * 파일 이름은 반드시 BattlePartyRestore.js 여야 합니다.
 *
 * 이용 약관: 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var P = PluginManager.parameters('BattlePartyRestore');
    var disableSwitch = Number(P['Disable Switch'] || 0);
    var debugLog = String(P['Debug Log'] === undefined ? 'true' : P['Debug Log']) === 'true';

    var _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function(troopId, canEscape, canLose) {
        _BattleManager_setup.apply(this, arguments);
        this._partyRestoreSnapshot = $gameParty._actors.slice();
    };

    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _BattleManager_endBattle.apply(this, arguments);
        this.restorePartyAfterBattle();
    };

    BattleManager.restorePartyAfterBattle = function() {
        var snap = this._partyRestoreSnapshot;
        this._partyRestoreSnapshot = null;
        if (!snap) return;
        if (disableSwitch > 0 && $gameSwitches.value(disableSwitch)) return;

        var cur = $gameParty._actors;
        var sameSet = cur.length === snap.length && snap.every(function(id) {
            return cur.indexOf(id) >= 0;
        });
        if (sameSet) return; // 멤버가 같으면 (순서만 바뀐 경우 포함) 그대로 둠

        if (debugLog && Utils.isOptionValid('test')) {
            console.log('[BattlePartyRestore] 파티 복구:', cur.slice(), '→', snap.slice());
        }
        $gameParty._actors = snap.slice();
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
    };

})();
