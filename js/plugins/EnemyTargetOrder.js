//=============================================================================
// EnemyTargetOrder.js
//=============================================================================

/*:
 * @plugindesc 적이 지정한 순서대로 파티원을 우선 타겟팅하게 합니다.
 * @author ㄹㅅㅁ
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 *
 * 적(Enemy) 노트란에 아래 태그를 입력하세요.
 *
 *   <Target Order: 2, 1, 3>
 *
 * 숫자는 액터 ID이며, 왼쪽부터 우선순위입니다.
 * 위 예시라면 2번 액터가 살아있으면 무조건 2번을 먼저 노리고,
 * 2번이 전투불능이면 1번을, 1번도 없으면 3번을 노립니다.
 * 목록에 없는 액터는 타겟이 되지 않습니다(전원 전투불능이면
 * 기존 랜덤 방식으로 대체됩니다).
 *
 * 노트태그가 없는 적은 기존 MV 기본 AI(TGR 기반 랜덤)를 그대로 사용합니다.
 *
 * 단일 대상(1명) 스킬/공격에만 적용됩니다. 전체 대상 스킬에는 영향을 주지
 * 않습니다.
 *
 * ============================================================================
 */

(function() {

  var Imported = window.Imported || {};
  Imported.TargetOrder = true;

  //--------------------------------------------------------------------------
  // Game_Enemy - 노트태그 파싱
  //--------------------------------------------------------------------------

  var _getOrderList = function(enemy) {
    if (enemy._targetOrderList !== undefined) return enemy._targetOrderList;
    var note = enemy.enemy().note;
    var match = note.match(/<Target Order:[ ]*([\d,\s]+)>/i);
    if (match) {
      enemy._targetOrderList = match[1].split(',').map(function(id) {
        return Number(id.trim());
      }).filter(function(id) {
        return !isNaN(id) && id > 0;
      });
    } else {
      enemy._targetOrderList = null;
    }
    return enemy._targetOrderList;
  };

  //--------------------------------------------------------------------------
  // Game_Action - 타겟 결정 오버라이드
  //--------------------------------------------------------------------------
  // MV 코어에서는 적 AI의 단일 대상 스킬이 decideRandomTarget()을 거치지
  // 않고 targetsForOpponents() 안에서 곧바로 랜덤 타겟을 뽑기 때문에,
  // 이 함수를 직접 가로채야 합니다.

  var _Game_Action_targetsForOpponents = Game_Action.prototype.targetsForOpponents;
  Game_Action.prototype.targetsForOpponents = function() {
    if (this.subject().isEnemy() && this.isForOne()) {
      var orderList = _getOrderList(this.subject());
      if (orderList && orderList.length > 0) {
        var target = this.pickOrderedTarget(orderList);
        if (target) return [target];
      }
    }
    return _Game_Action_targetsForOpponents.call(this);
  };

  Game_Action.prototype.pickOrderedTarget = function(orderList) {
    var unit = this.opponentsUnit();
    for (var i = 0; i < orderList.length; i++) {
      var actorId = orderList[i];
      var member = unit.members().filter(function(m) {
        return m.isActor && m.isActor() && m.actorId() === actorId && m.isAlive();
      })[0];
      if (member) return member;
    }
    return null;
  };

})();
