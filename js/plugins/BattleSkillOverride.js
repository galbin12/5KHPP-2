//=============================================================================
// BattleSkillOverride.js
//=============================================================================

/*:
 * @plugindesc 특정 전투에서만 액터의 스킬 목록을 임시로 교체합니다.
 * @author RSM
 *
 * @help
 * 세이브 데이터의 습득 스킬(learnSkill/forgetSkill)을 건드리지 않고,
 * 전투 중에만 actor.skills() 결과를 가로채서 바꿉니다.
 * 전투가 끝나면 자동으로 초기화됩니다.
 *
 * ▼ 플러그인 커맨드
 *
 * BattleSkillOverride set <actorId> <skillId1,skillId2,...>
 *   해당 액터의 전투 중 스킬 목록을 지정한 스킬들로 교체합니다.
 *   예) BattleSkillOverride set 1 5,6,7,10
 *
 * BattleSkillOverride clear <actorId>
 *   해당 액터의 교체를 해제하고 원래 스킬 목록으로 되돌립니다.
 *
 * BattleSkillOverride clearAll
 *   모든 교체를 해제합니다.
 *
 * ▼ 사용 예
 * 트룹 이벤트 페이지 조건을 "전투 시작"으로 설정하고
 * 그 안에서 plugin command로 set을 호출하세요.
 * clearAll은 전투 종료 시 자동으로 실행되므로 별도로 호출할 필요 없습니다.
 */

(function() {

    var _overrides = {};

    //--------------------------------------------------------------------
    // Game_Actor
    //--------------------------------------------------------------------
    var _Game_Actor_skills = Game_Actor.prototype.skills;
    Game_Actor.prototype.skills = function() {
        if ($gameParty.inBattle() && _overrides[this.actorId()]) {
            return _overrides[this.actorId()].map(function(id) {
                return $dataSkills[id];
            }).filter(function(skill) {
                return !!skill;
            });
        }
        return _Game_Actor_skills.call(this);
    };

    //--------------------------------------------------------------------
    // BattleManager - 전투 종료 시 자동 초기화
    //--------------------------------------------------------------------
    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _overrides = {};
        _BattleManager_endBattle.call(this, result);
    };

    //--------------------------------------------------------------------
    // Plugin Command
    //--------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'BattleSkillOverride') {
            switch (args[0]) {
                case 'set':
                    var actorId = Number(args[1]);
                    var skillIds = String(args[2]).split(',').map(Number);
                    _overrides[actorId] = skillIds;
                    break;
                case 'clear':
                    delete _overrides[Number(args[1])];
                    break;
                case 'clearAll':
                    _overrides = {};
                    break;
            }
        }
    };

})();
