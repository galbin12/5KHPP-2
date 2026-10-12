//=============================================================================
// PersonalitySwitchSkill.js
//=============================================================================

/*:
 * @plugindesc 스킬 사용 시 전투 중 선택지 창을 띄워 인격(State)을 전환합니다.
 * @author RSM
 *
 * @help
 * 공통이벤트를 거치지 않고, 전투 화면에서 직접 선택지 창을 띄워
 * 액터의 "인격"을 State로 전환하는 플러그인입니다.
 * 지속 턴수는 각 State의 데이터베이스 설정(자동 해제: 턴)을 그대로 따릅니다.
 *
 * ▼ 사용법
 *
 * 1. 각 인격을 State로 하나씩 만듭니다. (자동 해제 조건 = 턴, 턴수 원하는 대로)
 *
 * 2. 인격을 바꾸는 스킬의 메모란에 아래 태그를 적습니다.
 *
 *   <PersonalityChoices: 4,5,6>
 *     스킬 사용 시 선택지로 띄울 State ID들 (쉼표 구분).
 *     선택지 텍스트는 각 State의 이름이 그대로 사용됩니다.
 *
 *   <PersonalityDuration: 3>
 *     (선택) 이 스킬로 인격을 바꿀 때만 적용할 턴수를 강제로 지정합니다.
 *     생략하면 State 자체의 턴수 설정을 그대로 사용합니다.
 *
 * 3. 스킬을 배틀 중 선택하면:
 *    - 기본 타겟/대미지 처리 없이 곧바로 선택지 창이 뜹니다.
 *    - 선택한 State를 부여하고, 같은 태그 목록 안의 다른 State는 자동으로 해제합니다.
 *      (= 목록에 있는 State들끼리는 서로 배타적으로 취급됩니다)
 *    - 코스트(MP/TP)를 소모하고 턴을 종료합니다.
 *
 * ▼ 주의
 * - 스킬의 Scope(범위)는 아무 값이나 상관없습니다. 어차피 실제 타겟 선택은
 *   건너뛰고 이 플러그인이 직접 처리합니다.
 * - YEP_BattleEngineCore보다 아래에 두는 것을 권장합니다.
 */

(function() {

    //--------------------------------------------------------------------
    // Notetag helpers
    //--------------------------------------------------------------------
    function getPersonalityChoices(skill) {
        if (!skill || !skill.meta || !skill.meta.PersonalityChoices) return null;
        var ids = String(skill.meta.PersonalityChoices).split(',').map(function(s) {
            return Number(s.trim());
        }).filter(function(id) {
            return !!$dataStates[id];
        });
        return ids.length > 0 ? ids : null;
    }

    function getPersonalityDuration(skill) {
        if (!skill || !skill.meta || !skill.meta.PersonalityDuration) return null;
        var n = Number(skill.meta.PersonalityDuration);
        return isNaN(n) ? null : n;
    }

    //--------------------------------------------------------------------
    // Window_PersonalityChoice
    //--------------------------------------------------------------------
    function Window_PersonalityChoice() {
        this.initialize.apply(this, arguments);
    }

    Window_PersonalityChoice.prototype = Object.create(Window_Command.prototype);
    Window_PersonalityChoice.prototype.constructor = Window_PersonalityChoice;

    Window_PersonalityChoice.prototype.initialize = function() {
        this._stateIds = [];
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.openness = 0;
        this.deactivate();
        this.hide();
    };

    Window_PersonalityChoice.prototype.windowWidth = function() {
        return 360;
    };

    Window_PersonalityChoice.prototype.numVisibleRows = function() {
        return Math.max(this._stateIds.length, 1);
    };

    Window_PersonalityChoice.prototype.makeCommandList = function() {
        var self = this;
        this._stateIds.forEach(function(id) {
            var state = $dataStates[id];
            self.addCommand(state.name, 'state', true, id);
        });
    };

    Window_PersonalityChoice.prototype.setup = function(stateIds) {
        this._stateIds = stateIds;
        this.refresh();
        this.select(0);
        this.updatePlacement();
    };

    Window_PersonalityChoice.prototype.updatePlacement = function() {
        this.x = (Graphics.boxWidth - this.width) / 2;
        this.y = (Graphics.boxHeight - this.height) / 2;
    };

    //--------------------------------------------------------------------
    // Scene_Battle
    //--------------------------------------------------------------------
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this.createPersonalityWindow();
    };

    Scene_Battle.prototype.createPersonalityWindow = function() {
        this._personalityWindow = new Window_PersonalityChoice();
        this._personalityWindow.setHandler('state', this.onPersonalityOk.bind(this));
        this._personalityWindow.setHandler('cancel', this.onPersonalityCancel.bind(this));
        this.addWindow(this._personalityWindow);
    };

    var _Scene_Battle_onSkillOk = Scene_Battle.prototype.onSkillOk;
    Scene_Battle.prototype.onSkillOk = function() {
        var skill = this._skillWindow.item();
        var choices = getPersonalityChoices(skill);
        if (choices) {
            this._personalitySkill = skill;
            this._skillWindow.hide();
            this._personalityWindow.setup(choices);
            this._personalityWindow.open();
            this._personalityWindow.activate();
            return;
        }
        _Scene_Battle_onSkillOk.call(this);
    };

    Scene_Battle.prototype.onPersonalityOk = function() {
        var actor = BattleManager.actor();
        var skill = this._personalitySkill;
        var stateId = this._personalityWindow.currentExt();
        var choices = getPersonalityChoices(skill);
        var duration = getPersonalityDuration(skill);

        // 코스트 소모
        actor.paySkillCost(skill);

        // 같은 목록 안의 다른 인격 State는 해제 (상호 배타적으로 처리)
        choices.forEach(function(id) {
            if (id !== stateId && actor.isStateAffected(id)) {
                actor.removeState(id);
            }
        });

        // 선택한 인격 부여 (이미 걸려있어도 턴수 갱신됨)
        actor.addState(stateId);

        // 스킬에 지정된 강제 턴수가 있으면 덮어쓰기
        if (duration !== null && actor._stateTurns) {
            actor._stateTurns[stateId] = duration;
        }

        actor.setLastBattleSkill(skill);

        this._personalityWindow.close();
        this._personalityWindow.deactivate();
        this._skillWindow.show();
        this._skillWindow.refresh();
        if (this._statusWindow) this._statusWindow.refresh();

        this._personalitySkill = null;

        // 타겟 선택 없이 바로 턴 종료
        this.selectNextCommand();
    };

    Scene_Battle.prototype.onPersonalityCancel = function() {
        this._personalityWindow.close();
        this._personalityWindow.deactivate();
        this._skillWindow.show();
        this._skillWindow.activate();
        this._personalitySkill = null;
    };

})();
