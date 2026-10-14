//=============================================================================
// BlockAttackSkill.js
//=============================================================================

/*:
 * @plugindesc 플러그인 명령으로 지정한 적에게는 아군의 [공격]·[스킬]이 통하지 않게 합니다. v3.1
 *
 * @help
 * ■ 플러그인 명령 (이벤트 명령 > 플러그인 명령)
 *
 *   BlockAttackSkill add 3 5
 *     -> 적 캐릭터 ID 3번, 5번에게 공격·스킬이 통하지 않게 합니다.
 *        (ID는 데이터베이스 > 적 캐릭터의 번호. 여러 개 가능)
 *
 *   BlockAttackSkill remove 3
 *     -> 3번 적의 차단을 해제합니다.
 *
 *   BlockAttackSkill all
 *     -> 모든 적에게 공격·스킬이 통하지 않게 합니다.
 *
 *   BlockAttackSkill clear
 *     -> 모든 차단을 해제합니다. (all, add 모두 초기화)
 *
 *   한글도 사용할 수 있습니다: 추가 / 제거 / 전체 / 해제
 *     예) BlockAttackSkill 추가 3 5
 *
 * ■ 적 군단(전투 이벤트)에서 사용하기 ★
 *  데이터베이스 > 적 군단 > 전투 이벤트 페이지에서
 *    조건: 턴 0 / 범위: 전투
 *    내용: 플러그인 명령  BlockAttackSkill add 3
 *  처럼 넣으면, 그 군단과 전투를 시작할 때 자동으로 적용됩니다.
 *  - 전투 중에 실행한 명령은 "그 전투에서만" 유지되고 전투가 끝나면 사라집니다.
 *    (별도로 clear 할 필요 없음)
 *  - 전투 중에 add/remove/all/clear 를 다시 실행해 도중에 바꿀 수도 있습니다.
 *    예) 조건: HP 50% 이하 → BlockAttackSkill clear
 *  - 전투 중 명령은 "이번 전투 차단"만 바꿉니다. 맵 이벤트에서 켜 둔 차단은
 *    전투 중 clear 로 풀리지 않으니, 맵에서 켠 것은 맵에서 clear 하세요.
 *
 * ■ 맵 이벤트에서 사용하기
 *  전투 밖(맵 이벤트 등)에서 실행한 명령은 세이브 데이터에 저장되어
 *  clear 하기 전까지 모든 전투에 계속 적용됩니다.
 *
 * ■ 동작
 *  - 대상 선택 창에서 차단된 적이 회색으로 표시되며 선택할 수 없습니다.
 *  - 전체/랜덤 범위 스킬이나 강제 행동이라도 차단된 적은 대상에서 빠집니다.
 *  - 같은 ID의 적이 여러 마리 있으면 전부 차단됩니다.
 *  - 살아 있는 적이 전부 차단 상태이면 [공격] 커맨드가 비활성화됩니다.
 *  - 아이템, 방어, 도망, 아군 대상 스킬(회복 등)은 영향받지 않습니다.
 *  - 적의 행동에는 영향이 없습니다.
 *
 * ■ 플러그인 순서
 *  - YEP_BattleEngineCore 등 YEP 계열보다 아래에 두세요.
 */

(function() {
    'use strict';

    //-------------------------------------------------------------------------
    // 상태 저장
    //  - 전투 중: $gameTroop (전투가 끝나면 자동 초기화)
    //  - 전투 밖: $gameSystem (세이브 데이터에 저장)
    //-------------------------------------------------------------------------
    function currentStore() {
        return $gameParty.inBattle() ? $gameTroop : $gameSystem;
    }

    function idsOf(store) {
        if (!store._blockAttackSkillIds) store._blockAttackSkillIds = [];
        return store._blockAttackSkillIds;
    }

    function parseIds(args) {
        return args.slice(1).map(Number).filter(function(n) {
            return !isNaN(n) && n > 0;
        });
    }

    // 새 전투가 시작될 때 전투 단위 차단 목록 초기화
    var _Game_Troop_setup = Game_Troop.prototype.setup;
    Game_Troop.prototype.setup = function(troopId) {
        _Game_Troop_setup.call(this, troopId);
        this._blockAttackSkillIds = [];
        this._blockAttackSkillAll = false;
    };

    //-------------------------------------------------------------------------
    // 플러그인 명령
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command !== 'BlockAttackSkill') return;
        var sub = String(args[0] || '').toLowerCase();
        var store = currentStore();
        var ids = idsOf(store);
        if (sub === 'add' || sub === '추가') {
            parseIds(args).forEach(function(id) {
                if (ids.indexOf(id) < 0) ids.push(id);
            });
        } else if (sub === 'remove' || sub === '제거') {
            var removeIds = parseIds(args);
            store._blockAttackSkillIds = ids.filter(function(id) {
                return removeIds.indexOf(id) < 0;
            });
        } else if (sub === 'all' || sub === '전체') {
            store._blockAttackSkillAll = true;
        } else if (sub === 'clear' || sub === '해제') {
            store._blockAttackSkillAll = false;
            store._blockAttackSkillIds = [];
        }
    };

    // 아군이 쓰는 스킬(공격 포함)인지 확인. 아이템은 제외.
    function isActorSkillAction(action) {
        if (!action || !action.subject() || !action.subject().isActor()) return false;
        var item = action.item();
        return !!item && DataManager.isSkill(item);
    }

    //-------------------------------------------------------------------------
    // Game_Enemy: 차단 여부 (전역 + 이번 전투 차단 모두 확인)
    //-------------------------------------------------------------------------
    Game_Enemy.prototype.isAttackSkillBlocked = function() {
        var id = this.enemyId();
        return [$gameSystem, $gameTroop].some(function(store) {
            return !!store._blockAttackSkillAll || idsOf(store).indexOf(id) >= 0;
        });
    };

    //-------------------------------------------------------------------------
    // Game_Action: 차단된 적을 대상에서 제거
    //-------------------------------------------------------------------------
    var _Game_Action_makeTargets = Game_Action.prototype.makeTargets;
    Game_Action.prototype.makeTargets = function() {
        var targets = _Game_Action_makeTargets.call(this);
        if (isActorSkillAction(this)) {
            targets = targets.filter(function(target) {
                return !(target.isEnemy() && target.isAttackSkillBlocked());
            });
        }
        return targets;
    };

    //-------------------------------------------------------------------------
    // Window_BattleEnemy: 차단된 적은 선택 불가 + 회색 표시
    //-------------------------------------------------------------------------
    Window_BattleEnemy.prototype.isEnemyBlockedAt = function(index) {
        var enemy = this._enemies && this._enemies[index];
        if (!enemy || !enemy.isAttackSkillBlocked()) return false;
        return isActorSkillAction(BattleManager.inputtingAction());
    };

    var _Window_BattleEnemy_isCurrentItemEnabled = Window_BattleEnemy.prototype.isCurrentItemEnabled;
    Window_BattleEnemy.prototype.isCurrentItemEnabled = function() {
        if (this.isEnemyBlockedAt(this.index())) return false;
        return _Window_BattleEnemy_isCurrentItemEnabled.call(this);
    };

    var _Window_BattleEnemy_drawItem = Window_BattleEnemy.prototype.drawItem;
    Window_BattleEnemy.prototype.drawItem = function(index) {
        this.changePaintOpacity(!this.isEnemyBlockedAt(index));
        _Window_BattleEnemy_drawItem.call(this, index);
        this.changePaintOpacity(true);
    };

    //-------------------------------------------------------------------------
    // Window_ActorCommand: 공격할 수 있는 적이 하나도 없으면 [공격] 비활성화
    //-------------------------------------------------------------------------
    var _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.call(this);
        if (!this._actor) return;
        var alive = $gameTroop.aliveMembers();
        if (alive.length === 0) return;
        var allBlocked = alive.every(function(enemy) {
            return enemy.isAttackSkillBlocked();
        });
        if (!allBlocked) return;
        this._list.forEach(function(cmd) {
            if (cmd.symbol === 'attack') cmd.enabled = false;
        });
    };

})();
