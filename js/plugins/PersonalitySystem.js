//=============================================================================
// PersonalitySystem.js
//=============================================================================

/*:
 * @plugindesc 스킬 사용 시 선택창 없이 랜덤한 인격으로 정해진 턴 동안
 * 자동 전환합니다. (액터 메모란의 <Personality> 태그 기반)
 * @author RSM
 *
 * @help
 * 선택창 UI를 완전히 없애고, 스킬을 쓰는 순간 후보 중 하나를 무작위로
 * 골라 자동으로 인격을 전환하는 방식입니다. 배틀 UI를 건드리지 않으므로
 * 이 프로젝트의 커스텀 입력 시스템과 충돌하지 않습니다.
 *
 * ▼ 액터 메모란
 *
 *   <Personality: 이름 배틀러명 인덱스 스탯+n 스탯+n ...>
 *
 *   예)
 *   <Personality: 새싹 새싹 0>
 *   <Personality: 미친놈 새싹미친놈 1 atk+10>
 *   <Personality: 미친놈2 새싹미친놈2 2 atk+5 def+3>
 *
 *   - 이름: (선택창이 없으므로 실제 게임 표시에는 안 쓰이지만, 구분용으로
 *     계속 적어두면 됨)
 *   - 배틀러명: img/sv_actors/ 안의 파일명 (전투 그래픽 교체용)
 *   - 인덱스: 인격 번호. 0번 = 기본 인격. 지속 턴이 끝나면 자동으로
 *     0번으로 돌아감
 *   - 스탯+n / 스탯-n: mhp mmp atk def mat mdf agi luk. 여러 번 적으면
 *     합산됨
 *
 * ▼ 스킬 메모란
 *
 *   <PersonalityChoices: 1,2,3,4,5>
 *     이 스킬을 쓰면 이 인덱스들 중 하나가 무작위로 골라짐 (0번은 보통
 *     기본 인격이라 후보에서 빼는 걸 추천)
 *
 *   <PersonalityDuration: 2>
 *     선택된 인격이 유지될 턴 수. 생략하면 기본 2턴.
 *
 * 스킬의 Scope(범위)는 "사용자(User)" 또는 "없음(None)"으로 설정하세요.
 * 대상 선택 없이 스킬 사용 즉시 효과가 적용됩니다.
 */

(function() {

    var DEFAULT_DURATION = 2;
    var PARAM_IDS = { mhp: 0, mmp: 1, atk: 2, def: 3, mat: 4, mdf: 5, agi: 6, luk: 7 };

    //--------------------------------------------------------------------
    // 액터 Personality 태그 파싱
    //--------------------------------------------------------------------
    function parsePersonalities(actorData) {
        var list = [];
        if (!actorData || !actorData.note) return list;
        var re = /<Personality:\s*(.+)>/gi;
        var match;
        while ((match = re.exec(actorData.note)) !== null) {
            var tokens = match[1].trim().split(/\s+/);
            if (tokens.length < 3) continue;
            var name = tokens[0];
            var battlerName = tokens[1];
            var index = Number(tokens[2]);
            if (isNaN(index)) continue;
            var mods = {};
            for (var i = 3; i < tokens.length; i++) {
                var m = /^(mhp|mmp|atk|def|mat|mdf|agi|luk)([+-]\d+)$/i.exec(tokens[i]);
                if (!m) continue;
                var paramId = PARAM_IDS[m[1].toLowerCase()];
                mods[paramId] = (mods[paramId] || 0) + Number(m[2]);
            }
            list[index] = { index: index, name: name, battlerName: battlerName, mods: mods };
        }
        return list;
    }

    function getSkillChoices(skill) {
        if (!skill || !skill.meta || !skill.meta.PersonalityChoices) return null;
        var ids = String(skill.meta.PersonalityChoices).split(',').map(function(s) {
            return Number(s.trim());
        }).filter(function(n) { return !isNaN(n); });
        return ids.length > 0 ? ids : null;
    }

    function getSkillDuration(skill) {
        if (skill && skill.meta && skill.meta.PersonalityDuration) {
            var n = Number(skill.meta.PersonalityDuration);
            if (!isNaN(n)) return n;
        }
        return DEFAULT_DURATION;
    }

    //--------------------------------------------------------------------
    // Game_Actor
    //--------------------------------------------------------------------
    var _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._personalityIndex = 0;
        this._personalityTurns = 0;
    };

    Game_Actor.prototype.personalities = function() {
        if (!this._personalityList) {
            this._personalityList = parsePersonalities(this.actor());
        }
        return this._personalityList;
    };

    Game_Actor.prototype.currentPersonality = function() {
        var list = this.personalities();
        return list[this._personalityIndex] || list[0] || null;
    };

    Game_Actor.prototype.setPersonality = function(index, turns) {
        var list = this.personalities();
        if (!list[index]) return;
        this._personalityIndex = index;
        this._personalityTurns = index === 0 ? 0 : (turns || 0);
        this.refresh();
    };

    var _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(paramId) {
        var value = _Game_Actor_paramPlus.call(this, paramId);
        var p = this.currentPersonality();
        if (p && p.mods && p.mods[paramId]) {
            value += p.mods[paramId];
        }
        return value;
    };

    var _Game_Actor_battlerName = Game_Actor.prototype.battlerName;
    Game_Actor.prototype.battlerName = function() {
        var p = this.currentPersonality();
        if (p && p.battlerName) return p.battlerName;
        return _Game_Actor_battlerName.call(this);
    };

    var _Game_Actor_onAllActionsEnd = Game_Actor.prototype.onAllActionsEnd;
    Game_Actor.prototype.onAllActionsEnd = function() {
        _Game_Actor_onAllActionsEnd.call(this);
        if (this._personalityIndex !== 0 && this._personalityTurns > 0) {
            this._personalityTurns--;
            if (this._personalityTurns <= 0) {
                this.setPersonality(0);
            }
        }
    };

    // 이미 인격이 전환된 상태(0번이 아님)일 때는 같은 인격전환 스킬을
    // 다시 쓸 수 없게 막음
    var _Game_BattlerBase_meetsSkillConditions =
        Game_BattlerBase.prototype.meetsSkillConditions;
    Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
        if (!_Game_BattlerBase_meetsSkillConditions.call(this, skill)) return false;
        var choiceIds = getSkillChoices(skill);
        if (choiceIds && this._personalityIndex) {
            return false;
        }
        return true;
    };

    //--------------------------------------------------------------------
    // 스킬 사용 시 자동 랜덤 전환 (선택창 없음)
    //--------------------------------------------------------------------
    var _Game_Action_applyGlobal = Game_Action.prototype.applyGlobal;
    Game_Action.prototype.applyGlobal = function() {
        _Game_Action_applyGlobal.call(this);
        var item = this.item();
        var choiceIds = getSkillChoices(item);
        var actor = this.subject();
        if (!choiceIds || !actor || !actor.isActor()) return;

        var list = actor.personalities();
        var candidates = choiceIds.map(function(i) { return list[i]; })
            .filter(function(p) { return !!p; });
        // 현재 인격과 같은 게 다시 뽑히지 않도록 제외 (후보가 하나도 안
        // 남으면 원래 목록 그대로 사용)
        var others = candidates.filter(function(p) {
            return p.index !== actor._personalityIndex;
        });
        if (others.length > 0) candidates = others;
        if (candidates.length === 0) return;

        var pick = candidates[Math.floor(Math.random() * candidates.length)];
        var duration = getSkillDuration(item);
        actor.setPersonality(pick.index, duration);

        if ($gameMessage) {
            $gameMessage.add(actor.name() + '이(가) [' + pick.name + ']로 전환!');
        }
    };

})();
