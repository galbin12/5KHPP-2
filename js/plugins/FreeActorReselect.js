//=============================================================================
// FreeActorReselect.js
//=============================================================================

/*:
 * @plugindesc 전투 중 커맨드/스킬/아이템 선택 화면에서 A/D 키(그리고 액터
 * 커맨드 창에서는 좌/우 방향키도)로 다른 액터에게 바로 이동합니다. 이미
 * 커맨드를 정한 액터도 X(취소)를 여러 번 누를 필요 없이 즉시 재선택해서
 * 취소/변경할 수 있습니다.
 * @author Custom
 *
 * @param SwitchSE
 * @text 전환 효과음
 * @desc 액터를 전환할 때 재생할 효과음입니다. (Sound Manager Cursor와 동일)
 * @default Cursor2
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * 기본 구조상 액터 커맨드(공격/스킬/방어/아이템) 창은 상태창 자리를 그대로
 * 덮어버리기 때문에(ActorCommandOverlay.js), 이미 커맨드를 정한 다른 액터를
 * 클릭해서 바로 재선택하는 것이 불가능합니다. 지금까지는 X(취소)를 계속
 * 눌러서 한 단계씩 뒤로 돌아가야만 이전 액터를 바꿀 수 있었습니다.
 *
 * 이 플러그인은 액터 커맨드 창 / 스킬 창 / 아이템 창이 열려 있는 동안
 * A, D 키로 살아있고 행동 가능한 다른 액터에게 즉시 이동할 수 있게
 * 해줍니다. (D: 다음 액터, A: 이전 액터) 액터 커맨드 창(공격/스킬/방어/
 * 아이템 목록)에서는 좌/우 방향키도 똑같이 동작합니다. 대상이 이미
 * 커맨드를 정했던 액터라면 그 결정을 초기화하고 새로 커맨드를 고를 수
 * 있는 상태로 되돌립니다. 떠나는 액터 쪽도 지금까지 고르던 중이던 행동은
 * 취소되고(초기화되고) 다음에 다시 선택하면 됩니다.
 *
 * 좌/우 방향키를 액터 커맨드 창에서만 쓰는 이유는, 스킬 창/아이템 창은
 * 기본적으로 2열(가로 스크롤)이라 좌/우 방향키가 이미 항목 이동에 쓰이고
 * 있기 때문입니다. 그 두 창에서는 A/D 키를 대신 쓰세요.
 *
 * 대상/적 선택 창(Window_BattleActor / Window_BattleEnemy)이 열려 있을
 * 때는 개입하지 않습니다.
 *
 * ============================================================================
 * 필수/권장 플러그인
 * ============================================================================
 * - YEP_BattleEngineCore, YEP_BattleStatusWindow
 * - ActorCommandOverlay.js (같이 쓰는 걸 권장, 없어도 동작은 함)
 * - ManualActorCommandTrigger.js / ActorStatusClickSelect.js 와 병행 사용 가능
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleEngineCore, YEP_BattleStatusWindow, ActorCommandOverlay.js,
 * ManualActorCommandTrigger.js, ActorStatusClickSelect.js 보다
 * 아래(맨 아래쪽)에 두세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('FreeActorReselect');
    var switchSeName = String(params['SwitchSE'] || 'Cursor2');

    //--------------------------------------------------------------------
    // A / D 키를 가상 버튼으로 등록 (다른 키맵과 충돌하지 않는 키)
    //--------------------------------------------------------------------

    Input.keyMapper[65] = Input.keyMapper[65] || 'farprev'; // A
    Input.keyMapper[68] = Input.keyMapper[68] || 'farnext'; // D

    //--------------------------------------------------------------------
    // Scene_Battle
    //--------------------------------------------------------------------

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this.updateFARInput();
    };

    Scene_Battle.prototype.updateFARInput = function() {
        if (!this.isFARSwitchable()) return;
        // A/D는 커맨드/스킬/아이템 창 어디서든 사용 가능합니다.
        // 좌/우 방향키는 스킬/아이템 창(기본 2열)의 항목 이동과 겹치므로
        // 액터 커맨드 창이 활성화된 경우에만 사용합니다.
        var allowArrows = this._actorCommandWindow && this._actorCommandWindow.active;
        if (Input.isTriggered('farnext')) {
            this.farSwitchActor(1);
        } else if (Input.isTriggered('farprev')) {
            this.farSwitchActor(-1);
        } else if (allowArrows && Input.isTriggered('right')) {
            this.farSwitchActor(1);
        } else if (allowArrows && Input.isTriggered('left')) {
            this.farSwitchActor(-1);
        }
    };

    // 지금 "액터 자체를 고르는" 창(커맨드/스킬/아이템 목록)이 열려 있을
    // 때만 개입합니다. 대상 선택 창(액터/적 선택)이 열려 있을 때는
    // 개입하지 않습니다.
    Scene_Battle.prototype.isFARSwitchable = function() {
        if (!BattleManager.isInputting()) return false;
        if (this._actorWindow && this._actorWindow.active) return false;
        if (this._enemyWindow && this._enemyWindow.active) return false;
        if (this._actorCommandWindow && this._actorCommandWindow.active) return true;
        if (this._skillWindow && this._skillWindow.active) return true;
        if (this._itemWindow && this._itemWindow.active) return true;
        return false;
    };

    // battleMembers() 배열상의 "위치(인덱스)"를 기준으로 다음/이전 액터를
    // 찾습니다. 액터 객체로 indexOf를 하지 않는 이유는, 만약 그게 실패해서
    // -1이 나오면 BattleManager.actor()가 null이 되어 커맨드 선택이 파티
    // 커맨드 쪽으로 빠지면서 처음(원래) 액터로 되돌아가 버리기 때문입니다.
    Scene_Battle.prototype.farSwitchActor = function(dir) {
        var members = $gameParty.battleMembers();
        if (members.length <= 1) {
            SoundManager.playBuzzer();
            return;
        }
        var curIndex = BattleManager._actorIndex;
        if (curIndex < 0 || curIndex >= members.length) curIndex = 0;

        var idx = curIndex;
        var nextActor = null;
        var nextIndex = -1;
        for (var i = 0; i < members.length; i++) {
            idx = (idx + dir + members.length) % members.length;
            var cand = members[idx];
            if (cand && cand.isAlive() && cand.canInput()) {
                nextActor = cand;
                nextIndex = idx;
                break;
            }
        }
        if (nextIndex < 0 || nextIndex === curIndex) {
            SoundManager.playBuzzer();
            return;
        }

        var current = members[curIndex];

        // 지금까지 고르던 중이던 행동(진행 중인 부분 선택)은 취소하고,
        // 두 액터 모두 처음부터 다시 고를 수 있는 상태로 되돌립니다.
        BattleManager.clearInputtingAction();
        if (current) current.makeActions();
        nextActor.makeActions();

        this.farCloseSubWindows();

        AudioManager.playSe({name: switchSeName, volume: 90, pitch: 100, pan: 0});

        BattleManager.changeActor(nextIndex, 'undecided');
        this._ascsManualOpen = true; // ManualActorCommandTrigger.js 호환
        this.startActorCommandSelection();
    };

    // 커맨드/스킬/아이템/대상 선택 창을 전환 전에 모두 닫아 정리합니다.
    Scene_Battle.prototype.farCloseSubWindows = function() {
        if (this._actorCommandWindow) {
            this._actorCommandWindow.deactivate();
            this._actorCommandWindow.hide();
        }
        if (this._skillWindow) {
            this._skillWindow.deactivate();
            this._skillWindow.hide();
        }
        if (this._itemWindow) {
            this._itemWindow.deactivate();
            this._itemWindow.hide();
        }
        if (this._actorWindow) {
            this._actorWindow.deactivate();
            this._actorWindow.hide();
        }
        if (this._enemyWindow) {
            this._enemyWindow.deactivate();
            this._enemyWindow.hide();
        }
        if (this._helpWindow) {
            this._helpWindow.hide();
        }
    };

})();
