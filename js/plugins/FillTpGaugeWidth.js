//=============================================================================
// FillTpGaugeWidth.js
//=============================================================================

/*:
 * @plugindesc 전투 상태창(YEP_BattleStatusWindow)에서 MP 자리를 비워두지 않고
 * TP 게이지가 전체 폭을 꽉 채우도록 합니다.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * RemoveMP.js 등으로 MP를 안 그리게 만든 경우, YEP_BattleStatusWindow의
 * 게이지 영역은 여전히 "MP 절반 + TP 절반"으로 배치되어 있어서 왼쪽 절반이
 * 빈 공간으로 남습니다. 이 플러그인은 게이지 영역을 다시 그려서
 * HP는 그대로, MP는 그리지 않고, TP가 전체 폭을 채우도록 합니다.
 *
 * 반드시 YEP_BattleStatusWindow.js 보다 아래쪽에 배치하세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {

    Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
        this.contents.fontSize = Yanfly.Param.BSWParamFontSize;
        this._enableYBuffer = true;
        var wy = rect.y + rect.height - this.lineHeight();
        var wymod = (Imported.YEP_CoreEngine) ? Yanfly.Param.GaugeHeight : 6;
        var wymod = Math.max(16, wymod);
        this.drawActorHp(actor, rect.x, wy - wymod, rect.width);
        this.drawActorTp(actor, rect.x, wy, rect.width);
        this._enableYBuffer = false;
    };

})();