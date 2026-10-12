//=============================================================================
// BattleInputWatchdog.js
//=============================================================================

/*:
 * @plugindesc 전투 입력 단계에서 모든 창이 비활성화되어 키를 눌러도
 * 오류음만 나고 아무 반응이 없는(재시작이 필요한) 상태를 자동 감지해
 * 재시작 없이 복구합니다.
 * @author Custom
 *
 * @param Stuck Frames
 * @desc 이 프레임 수만큼 "어느 창도 active하지 않은" 상태가 지속되면
 * 잠김으로 판단합니다. (60프레임 = 약 1초)
 * @default 15
 *
 * @param Cooldown Frames
 * @desc 한 번 복구한 뒤, 다시 감지를 시작하기까지 대기하는 프레임 수.
 * @default 60
 *
 * @param Debug Log
 * @desc 복구가 발생했을 때 콘솔(F8)에 로그를 남길지 여부.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * ActorCommandOverlay / ActorStatusClickSelect / ManualActorCommandTrigger /
 * SkipPartyCommand 등으로 구성된 커스텀 전투 입력 흐름은 구조상 "어느 창도
 * active가 아닌" 순간이 아주 짧게라도 생기면 그 상태에서 멈춰버릴 수
 * 있습니다(특정 타이밍에 몰렸을 때만 드물게 재현). 이 상태가 되면 어떤
 * 키를 눌러도 아무 창도 반응하지 않고 오류음만 나며, 지금까지는 게임을
 * 재시작해야만 했습니다.
 *
 * 이 플러그인은 전투 입력 단계(BattleManager.isInputting())에서 상태창 /
 * 액터 커맨드 창 / 파티 커맨드 창 / 스킬·아이템·적 선택 창 등 어떤 창도
 * active하지 않은 상태가 일정 프레임 이상 지속되면, 이를 "입력 잠김"으로
 * 판단하고 액터 상태창에서 다시 선택 가능한 대기 화면으로 자동 복구합니다.
 * (ManualActorCommandTrigger.js의 hideActorCommandForWaiting이 있으면 그
 * 로직을 그대로 재사용하고, 없으면 자체 폴백 로직을 사용합니다.)
 *
 * 근본 원인(어떤 조합의 취소/클릭 타이밍이 잠김을 유발하는지)은 여러
 * 커스텀 플러그인이 얽혀있어 완전히 특정하기 어려울 수 있으므로, 이
 * 플러그인은 "발생 자체를 막는" 것이 아니라 "발생해도 즉시 복구되게"
 * 만드는 안전장치입니다.
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * ActorCommandOverlay.js, ActorStatusClickSelect.js,
 * ManualActorCommandTrigger.js, SkipPartyCommand.js 보다 아래
 * (플러그인 목록 맨 아래쪽)에 두세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('BattleInputWatchdog');
    var STUCK_FRAMES = Number(params['Stuck Frames'] || 15);
    var COOLDOWN_FRAMES = Number(params['Cooldown Frames'] || 60);
    var DEBUG_LOG = String(params['Debug Log'] || 'true') === 'true';

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this.updateBIWWatchdog();
    };

    Scene_Battle.prototype.updateBIWWatchdog = function() {
        if (this._biwCooldown > 0) {
            this._biwCooldown--;
            return;
        }
        if (!this.isBIWStuckCandidate()) {
            this._biwStuckCount = 0;
            return;
        }
        this._biwStuckCount = (this._biwStuckCount || 0) + 1;
        if (this._biwStuckCount >= STUCK_FRAMES) {
            this._biwStuckCount = 0;
            this._biwCooldown = COOLDOWN_FRAMES;
            this.recoverBIWStuckInput();
        }
    };

    // 전투 입력 단계인데도 어떤 창도 active하지 않은지 확인합니다.
    Scene_Battle.prototype.isBIWStuckCandidate = function() {
        if (!BattleManager || !BattleManager.isInputting()) return false;
        if ($gameMessage && $gameMessage.isBusy()) return false;
        if (SceneManager.isSceneChanging && SceneManager.isSceneChanging()) return false;
        if (this._biwOpeningGrace > 0) {
            this._biwOpeningGrace--;
            return false;
        }

        var wins = [
            this._statusWindow,
            this._actorCommandWindow,
            this._partyCommandWindow,
            this._skillWindow,
            this._itemWindow,
            this._actorWindow,
            this._enemyWindow
        ];
        for (var i = 0; i < wins.length; i++) {
            var w = wins[i];
            if (w && w.active) return false;
        }
        return true;
    };

    // 전투 씬이 막 시작되거나 페이즈가 바뀌는 순간에는 창들이 잠깐씩
    // 비활성 상태를 거칠 수 있으므로, 그런 전환 시점 이후 약간의 유예를
    // 둡니다.
    var _Scene_Battle_changeInputWindow = Scene_Battle.prototype.changeInputWindow;
    if (_Scene_Battle_changeInputWindow) {
        Scene_Battle.prototype.changeInputWindow = function() {
            _Scene_Battle_changeInputWindow.call(this);
            this._biwOpeningGrace = 5;
        };
    }

    // [FIX] changeInputWindow 시점의 5프레임 유예만으로는, 전투 씬 자체가
    // 막 시작되는 순간(여러 커스텀 플러그인의 초기화가 겹치는 구간)을
    // 충분히 커버하지 못해 감시견이 "잠김"으로 오판하는 경우가 있었다.
    // (오판 시 index 0을 강제로 select/activate 하기 때문에, 하필 항상
    // 첫 번째 액터 슬롯만 얼굴 애니메이션 상태가 꼬여서 멈춰 보이는
    // 증상으로 나타남)
    // -> 전투 씬 시작(start) 시점에 더 넉넉한 유예를 별도로 준다.
    var _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this);
        this._biwOpeningGrace = 45;
    };

    Scene_Battle.prototype.recoverBIWStuckInput = function() {
        if (DEBUG_LOG) {
            console.warn('[BattleInputWatchdog] 전투 입력 잠김 감지 - 자동 복구합니다.');
        }

        this._ascsManualOpen = false;

        if (this._actorCommandWindow) {
            this._actorCommandWindow.deactivate();
            if (this._actorCommandWindow.close) this._actorCommandWindow.close();
        }
        if (this._partyCommandWindow) {
            this._partyCommandWindow.deactivate();
            if (this._partyCommandWindow.close) this._partyCommandWindow.close();
        }
        if (this._skillWindow && this._skillWindow.hide) this._skillWindow.hide();
        if (this._itemWindow && this._itemWindow.hide) this._itemWindow.hide();
        if (this._actorWindow && this._actorWindow.hide) this._actorWindow.hide();
        if (this._enemyWindow && this._enemyWindow.hide) this._enemyWindow.hide();

        if (BattleManager.stopAllSelection) BattleManager.stopAllSelection();

        // ManualActorCommandTrigger.js가 있으면 그 복구 로직을 그대로 사용
        if (typeof this.hideActorCommandForWaiting === 'function') {
            this.hideActorCommandForWaiting();
            return;
        }

        // 폴백: ManualActorCommandTrigger.js가 없는 경우 자체적으로
        // 상태창을 활성화해 선택 가능한 상태로 되돌립니다.
        if (this._statusWindow) {
            var idx = this._statusWindow.index ? this._statusWindow.index() : 0;
            var maxIdx = $gameParty.battleMembers().length - 1;
            if (idx < 0 || idx > maxIdx) idx = 0;
            this._statusWindow.visible = true;
            if (this._statusWindow.select) this._statusWindow.select(idx);
            this._statusWindow.activate();
        }
    };

})();
