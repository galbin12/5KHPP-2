//=============================================================================
// EnemyTargetFilter.js
//=============================================================================
/*:
 * @plugindesc 특정 적이 특정 액터만 공격하거나 특정 액터를 피하도록 설정합니다.
 *
 * @help
 * 적(Enemy) 메모 태그:
 *   <targetActors: 1,2>  → 이 적은 1번, 2번 액터만 공격합니다.
 *   <avoidActors: 3>     → 이 적은 3번 액터를 공격하지 않습니다.
 *
 * 두 태그를 함께 쓰면 targetActors에서 avoidActors를 뺀 액터만 공격합니다.
 * 허용된 액터가 모두 쓰러져 있으면 해당 적은 공격하지 않습니다.
 */
(function() {
    'use strict';

    function parseIds(str) {
        if (!str) return [];
        return String(str).split(/[,\s]+/).map(Number).filter(function(n) { return n > 0; });
    }

    var _Game_Action_makeTargets = Game_Action.prototype.makeTargets;
    Game_Action.prototype.makeTargets = function() {
        var targets = _Game_Action_makeTargets.call(this);
        var subject = this.subject();

        // 적이 상대(아군)를 공격하는 행동에만 적용
        if (!subject || !subject.isEnemy() || !this.isForOpponent()) return targets;

        var meta = subject.enemy().meta;
        var only = parseIds(meta.targetActors);
        var avoid = parseIds(meta.avoidActors);
        if (only.length === 0 && avoid.length === 0) return targets;

        var allowed = function(actor) {
            var id = actor.actorId();
            if (only.length > 0 && only.indexOf(id) < 0) return false;
            if (avoid.indexOf(id) >= 0) return false;
            return true;
        };

        // [디버그] 대상 선택 과정 확인용 로그 (확인 후 삭제)
        console.log('[EnemyTargetFilter] ' + subject.enemy().name +
            ' original=' + targets.map(function(t) { return t && t.name(); }).join(',') +
            ' only=' + only.join(',') + ' avoid=' + avoid.join(','));

        // 1) 원래 선택된 대상 중 허용된 대상만 남김
        var filtered = targets.filter(allowed);
        if (filtered.length > 0) return filtered;

        // 2) 없으면 허용된 살아있는 액터 중에서 다시 선택
        var candidates = $gameParty.battleMembers().filter(function(a) {
            return a.isAlive() && allowed(a);
        });
        // 허용된 대상이 전투에 없거나 모두 쓰러진 경우 공격 불능이 되지 않도록 원래 대상을 유지
        if (candidates.length === 0) return targets;
        if (this.isForAll()) return candidates;
        return [candidates[Math.floor(Math.random() * candidates.length)]];
    };
})();
