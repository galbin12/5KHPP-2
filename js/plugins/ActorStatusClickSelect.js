//=============================================================================
// ActorStatusClickSelect.js
//=============================================================================

/*:
 * @plugindesc 전투 중 상태창(Window_BattleStatus)에서 원하는 액터의 칸을
 * 마우스로 클릭하면, 순서에 상관없이 그 액터의 커맨드(공격/스킬 등) 선택으로
 * 바로 전환합니다.
 * @author Custom
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * 틱 기반(Active/ATB 등) 전투에서 좌우 이동으로 입력 대기 중인 액터들 사이를
 * 넘나드는 것처럼, 상태창에서 원하는 액터의 얼굴/칸을 마우스로 클릭하면
 * 바로 그 액터의 커맨드 창(공격/스킬/방어/아이템)으로 전환됩니다.
 *
 * 조건:
 *   - 현재 BattleManager.isInputting()이 true (누군가는 입력 가능한 상태)
 *   - 클릭한 액터가 canInput()이 true (행동 결정이 이미 끝났거나 죽은 액터,
 *     상태이상으로 입력 불가능한 액터는 무시)
 *
 * 위 조건을 만족하면 BattleManager.changeActor()로 즉시 그 액터로 전환하고
 * Scene_Battle.startActorCommandSelection()을 호출해 커맨드 창을 띄웁니다.
 * (ActorCommandOverlay.js를 같이 쓰고 있다면, 그 즉시 상태창이 숨겨지고
 * 커맨드 UI가 뜨는 것까지 자연스럽게 이어집니다.)
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleEngineCore, YEP_BattleStatusWindow, ActorCommandOverlow.js 보다
 * 아래(뒤)에 두세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var _Window_BattleStatus_update = Window_BattleStatus.prototype.update;
    Window_BattleStatus.prototype.update = function() {
        _Window_BattleStatus_update.call(this);
        this.updateASCSClick();
    };

    Window_BattleStatus.prototype.updateASCSClick = function() {
        if (!this.visible) return;
        // this.active가 아닐 때(스킬/아이템 창, 대상 선택 창 등이 열려서
        // 실제로 입력을 받고 있는 다른 창이 있을 때)는 상태창이 그냥
        // "보이기만" 하는 상태입니다. 이때 얼굴을 클릭하면(예: 아이템의
        // 아군 대상 선택 화면) 그 클릭이 대상 선택용 클릭인데, 여기서도
        // 반응해버려서 BattleManager.changeActor()가 엉뚱하게 끼어들어
        // 진행이 멈추는 문제가 있었습니다. 상태창이 실제로 "누구를 고를지
        // 대기 중"인 active 상태일 때만 반응하도록 합니다.
        if (!this.active) return;
        // this.active만으로는 부족한 경우(다른 플러그인이 서브 선택창을
        // 열면서 상태창 active를 안 건드리는 경우 등)에 대비해, 스킬/
        // 아이템/적/아군 대상 선택창이 하나라도 열려 있으면 절대 반응하지
        // 않도록 이중으로 막습니다.
        if (this.ascsIsSelectionBusy()) return;
        if (!TouchInput.isTriggered()) return;
        if (!BattleManager.isInputting()) return;

        var localX = TouchInput.x - this.x - (this.padding || 0);
        var localY = TouchInput.y - this.y - (this.padding || 0);
        var index = this.ascsHitTest(localX, localY);
        if (index < 0) return;

        var actor = $gameParty.battleMembers()[index];
        if (!actor) return;

        if (actor.canInput()) {
            this.ascsSelectActor(index);
        } else if (this.ascsIsRedoable(actor)) {
            // 이미 커맨드(공격/스킬/방어/아이템 등)를 다 정한 액터를 다시
            // 클릭한 경우: 정해뒀던 행동을 취소하고 다시 고를 수 있게
            // 합니다.
            actor.makeActions();
            actor.setActionState('undecided');
            this.ascsSelectActor(index);
        }
    };

    // 스킬/아이템/적 선택/아군 선택 등 서브 선택창이 하나라도 열려서 입력을
    // 받고 있는 중인지 확인합니다. 이 경우엔 상태창 클릭을 절대 처리하지
    // 않습니다(진행 중인 다른 입력을 방해하지 않기 위함).
    Window_BattleStatus.prototype.ascsIsSelectionBusy = function() {
        var scene = SceneManager._scene;
        if (!scene) return true;
        var wins = [scene._skillWindow, scene._itemWindow,
            scene._enemyWindow, scene._actorWindow];
        for (var i = 0; i < wins.length; i++) {
            var w = wins[i];
            if (w && (w.active || w.visible)) return true;
        }
        // 액터 커맨드 창 자체가 열려서 입력 중일 때도 막습니다. 단, 이
        // 창을 열기 위해 지금 막 클릭한 순간과 겹치지 않도록 active
        // 여부만 봅니다(visible은 안 봄 - 열리는 애니메이션 중에도 문제
        // 없게).
        if (scene._actorCommandWindow && scene._actorCommandWindow.active) {
            return true;
        }
        return false;
    };

    // 이미 행동이 확정되어 대기 중인('waiting') 액터인지 판정합니다.
    // 죽었거나 상태이상 등으로 애초에 입력이 불가능한 액터(canInput()이
    // false이면서 actionState가 'waiting'이 아닌 경우)는 재선택 대상에서
    // 제외됩니다.
    Window_BattleStatus.prototype.ascsIsRedoable = function(actor) {
        return actor._actionState === 'waiting';
    };

    Window_BattleStatus.prototype.ascsSelectActor = function(index) {
        SoundManager.playCursor();
        BattleManager.changeActor(index, 'undecided');
        // ManualActorCommandTrigger.js가 있다면, 이 플래그를 켜줘야
        // "클릭으로 직접 연 것"으로 인식하고 커맨드 창을 실제로 띄웁니다.
        SceneManager._scene._ascsManualOpen = true;
        SceneManager._scene.startActorCommandSelection();
    };

    // 표준 Window_Selectable.hitTest와 동일한 로직이지만, 창이 비활성
    // 상태(active === false)여도 항상 클릭을 인식하도록 별도 구현합니다.
    Window_BattleStatus.prototype.ascsHitTest = function(x, y) {
        if (!this.isASCSOpenAndFrontmost()) return -1;
        var maxCols = this.maxCols();
        var maxItems = this.maxItems();
        for (var i = 0; i < maxItems; i++) {
            var rect = this.itemRect(i);
            if (x >= rect.x && x < rect.x + rect.width &&
                y >= rect.y && y < rect.y + rect.height) {
                return i;
            }
        }
        return -1;
    };

    Window_BattleStatus.prototype.isASCSOpenAndFrontmost = function() {
        return this.isOpen && this.isOpen() && this.contentsOpacity > 0;
    };

})();
