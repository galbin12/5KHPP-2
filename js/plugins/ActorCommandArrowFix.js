//=============================================================================
// ActorCommandArrowFix.js
//=============================================================================

/*:
 * @plugindesc 액터 커맨드 창(공격/스킬/방어/아이템) 안에서 방향키로 항목을
 * 옮길 때, YEP_BattleStatusWindow의 "좌우 방향키 = 액터 전환" 기능이 같이
 * 발동해서 창이 닫히거나 다른 액터로 튀어버리는 문제를 막습니다.
 * @author Custom
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * YEP_BattleStatusWindow.js는 "좌/우 방향키 = 이전/다음 액터로 전환"
 * 기능(BSWLfRt 파라미터)을 Window_ActorCommand에도 걸어놓습니다. 커맨드
 * 창이 세로 한 줄짜리 목록일 때는 좌우 방향키를 누를 일이 없어서 문제가
 * 없었지만, ActorCommandOverlay.js로 창을 넓혀서 공격/스킬/보호를 가로로도
 * 배치하게 되면서 커맨드 사이를 좌우로 옮기려고 방향키를 누를 때마다 이
 * "액터 전환" 핸들러가 같이 호출되어 창이 닫히고 다른 액터로 넘어가 버리는
 * 문제가 생겼습니다.
 *
 * 이 프로젝트는 액터 전환을 상태창 쪽(ActorStatusClickSelect.js /
 * ManualActorCommandTrigger.js)에서 클릭·화살표로 이미 처리하고 있으므로,
 * 커맨드 창 안에서의 좌우 하이재킹 기능은 꺼도 됩니다.
 *
 * ============================================================================
 * 필수 관계
 * ============================================================================
 * - YEP_BattleStatusWindow.js (BSWLfRt로 만들어진 기능을 되돌립니다)
 * - ActorCommandOverlay.js (창을 넓혀서 이 문제가 드러나게 한 원인)
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleStatusWindow.js 보다 아래(뒤)에 두세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    // BSW가 Window_ActorCommand 생성 시 등록해놓은 'left'/'right' 핸들러
    // (액터 전환용)를 직접 제거합니다. processHandling을 다시 덮어쓰는
    // 것보다, 아예 핸들러 자체를 없애는 쪽이 로드 순서 문제에 더 안전
    // 합니다.
    var _Scene_Battle_createActorCommandWindow =
        Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.call(this);
        var win = this._actorCommandWindow;
        if (win && win._handlerTable) {
            delete win._handlerTable['left'];
            delete win._handlerTable['right'];
        }
    };

    // 혹시 모를 경우를 대비해 processHandling도 원복해둡니다.
    Window_ActorCommand.prototype.processHandling = function() {
        Window_Selectable.prototype.processHandling.call(this);
    };

})();
