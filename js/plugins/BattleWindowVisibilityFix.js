//=============================================================================
// BattleWindowVisibilityFix.js
//=============================================================================

/*:
 * @plugindesc 스킬/아이템/대상선택 창이 떠 있는 동안 액터 커맨드 창을
 * 숨기고, 어떤 입력 창도 없을 때만 상태창을 보여주도록 정리합니다.
 * @author Custom
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * ActorCommandOverlay.js로 액터 커맨드 창(공격/스킬/방어/아이템)을 상태창
 * 크기만큼 크게 만들면, 공격을 골라 적을 고르는 창(_enemyWindow)이나
 * 아군을 고르는 창(_actorWindow), 스킬/아이템 목록 창이 뜰 때 기본 MV는
 * 액터 커맨드 창을 따로 숨기지 않아서 뒤에 그대로 겹쳐 보입니다.
 *
 * 이 플러그인은 매 프레임:
 *   - 스킬/아이템/적선택/아군선택 창 중 하나라도 활성화되어 있으면
 *     액터 커맨드 창을 숨깁니다.
 *   - 그 중 아무것도 활성화되어 있지 않고, 액터 커맨드 창도 비활성
 *     상태면 상태창(액터 얼굴 나열)을 보여줍니다.
 *   - 반대로 위 창들 중 하나라도 활성화되어 있으면 상태창도 숨깁니다.
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * ActorCommandOverlay.js, BattleListWindowCustomize.js,
 * ManualActorCommandTrigger.js 보다 아래(맨 아래쪽)에 두세요. 이 플러그인이
 * 최종적으로 창 표시 여부를 정리합니다.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this.updateBWVFWindowVisibility();
    };

    Scene_Battle.prototype.updateBWVFWindowVisibility = function() {
        var skillActive = this._skillWindow && this._skillWindow.active;
        var itemActive = this._itemWindow && this._itemWindow.active;
        var actorSelActive = this._actorWindow && this._actorWindow.active;
        var enemySelActive = this._enemyWindow && this._enemyWindow.active;
        var targetOrListActive = skillActive || itemActive ||
            actorSelActive || enemySelActive;

        if (this._actorCommandWindow) {
            if (targetOrListActive) {
                this._actorCommandWindow.visible = false;
            } else if (this._actorCommandWindow.active) {
                this._actorCommandWindow.visible = true;
            }
        }

        var cmdActive = this._actorCommandWindow && this._actorCommandWindow.active;
        if (this._statusWindow) {
            this._statusWindow.visible = !(targetOrListActive || cmdActive);
        }
    };

})();
