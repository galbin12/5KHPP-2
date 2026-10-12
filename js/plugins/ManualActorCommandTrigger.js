//=============================================================================
// ManualActorCommandTrigger.js
//=============================================================================

/*:
 * @plugindesc 액터 커맨드(공격/스킬/방어/아이템) 창이 전투 시작과 동시에,
 * 혹은 턴이 넘어갈 때 자동으로 뜨지 않도록 막습니다. 오직 상태창에서 액터를
 * 직접 클릭했을 때만 그 액터의 커맨드 창이 열립니다.
 * @author Custom
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * 틱 기반 전투에서는 액터가 입력 가능해지는 순간 자동으로 그 액터의 커맨드
 * 창(공격/스킬/방어/아이템)이 뜹니다. 이 플러그인은 그 "자동으로 뜨는" 동작을
 * 막고, 대신 액터 상태창(얼굴이 나열된 창)이 계속 보이는 대기 상태로 되돌려
 * 놓습니다.
 *
 * 유저가 상태창에서 원하는 액터의 칸을 클릭해야만(ActorStatusClickSelect.js)
 * 비로소 그 액터의 커맨드 창이 뜹니다. 행동(스킬/아이템 + 대상)을 다 고르고
 * 나면, 다음 액터의 커맨드가 자동으로 뜨는 대신 다시 액터 상태창만 보이는
 * 대기 화면으로 돌아가서, 유저가 또 클릭으로 골라야 하는 흐름이 됩니다.
 *
 * ============================================================================
 * 필수 플러그인
 * ============================================================================
 * - ActorCommandOverlay.js   (커맨드 창이 뜰 때 상태창을 숨김/복귀)
 * - ActorStatusClickSelect.js (상태창 클릭으로 액터 선택)
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleEngineCore, YEP_BattleStatusWindow, ActorCommandOverlay.js,
 * ActorStatusClickSelect.js 보다 아래(맨 아래쪽)에 두세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var _Scene_Battle_createStatusWindow = Scene_Battle.prototype.createStatusWindow;
    Scene_Battle.prototype.createStatusWindow = function() {
        _Scene_Battle_createStatusWindow.call(this);
        this._statusWindow.setHandler('ok', this.onMACTStatusOk.bind(this));
    };

    // 화살표(좌우)로 상태창의 액터 칸 사이를 이동하다가 엔터로 확정하면
    // ActorStatusClickSelect.js의 클릭 선택과 동일하게 동작합니다.
    Scene_Battle.prototype.onMACTStatusOk = function() {
        var index = this._statusWindow.index();
        var actor = $gameParty.battleMembers()[index];
        if (!BattleManager.isInputting() || !actor || !actor.canInput()) {
            SoundManager.playBuzzer();
            this._statusWindow.activate();
            return;
        }
        SoundManager.playOk();
        BattleManager.changeActor(index, 'undecided');
        this._ascsManualOpen = true;
        this.startActorCommandSelection();
    };

    var _Scene_Battle_startActorCommandSelection =
        Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        if (!this._ascsManualOpen) {
            // 클릭으로 명시적으로 연 게 아니면 (자동 진입) - 커맨드 창을
            // 띄우지 않고 대기 상태(액터 상태창만 보이는 상태)로 둡니다.
            this.hideActorCommandForWaiting();
            return;
        }
        this._ascsManualOpen = false;
        _Scene_Battle_startActorCommandSelection.call(this);
        if (this._actorCommandWindow) {
            this._actorCommandWindow.visible = true;
        }
        if (this._statusWindow) {
            this._statusWindow.deactivate();
        }
    };

    // 코어(rpg_scenes.js)의 isAnyInputWindowActive()는 _statusWindow를
    // 체크하지 않습니다. 그 결과 "대기 상태"(커맨드 창은 꺼지고 상태창만
    // 활성화된 상태)를 "활성화된 창이 없음"으로 오판해서, 매 프레임
    // changeInputWindow() → startActorCommandSelection()이 다시 불려
    // 상태창의 화살표 이동이 계속 초기화되고, 결과적으로 옆 액터로
    // 넘어가지지 않는 것처럼 보였습니다. _statusWindow.active도 같이
    // 체크하도록 패치합니다.
    var _Scene_Battle_isAnyInputWindowActive =
        Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        return _Scene_Battle_isAnyInputWindowActive.call(this) ||
            (this._statusWindow && this._statusWindow.active);
    };

    Scene_Battle.prototype.hideActorCommandForWaiting = function() {
        if (this._actorCommandWindow) {
            this._actorCommandWindow.deactivate();
            this._actorCommandWindow.visible = false;
        }
        // 파티 커맨드(싸우기/도망)도 이 프로젝트에서는 사용하지 않으므로
        // 혹시 활성화되어 있다면 같이 꺼줍니다.
        if (this._partyCommandWindow) {
            this._partyCommandWindow.deactivate();
            this._partyCommandWindow.visible = false;
        }
        // 대기 상태 - 상태창을 활성화해서 화살표(좌우)로 액터를 고를 수
        // 있게 합니다.
        if (this._statusWindow) {
            var idx = this._statusWindow.index();
            var maxIdx = $gameParty.battleMembers().length - 1;
            if (idx < 0 || idx > maxIdx) idx = 0;
            this._statusWindow.select(idx);
            this._statusWindow.activate();
        }
    };

})();
