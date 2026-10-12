//=============================================================================
// RemoveMP.js
//=============================================================================

/*:
 * @plugindesc MP(마나/마법 포인트) 기능을 완전히 제거합니다.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 이 플러그인을 켜면 전투 화면, 스킬창, 상태창 등에서 MP 게이지와 수치가
 * 더 이상 표시되지 않으며, MP 소비 스킬도 MP 체크 없이 사용 가능해집니다.
 * (스킬창에서 MP 소모량 자체가 표시되지 않습니다. TP는 그대로 유지됩니다.)
 *
 * 특별한 플러그인 명령은 없습니다. 플러그인 관리자에 추가하고 켜기만 하면
 * 적용됩니다.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {

    //--------------------------------------------------------------------
    // Game_BattlerBase / Game_Battler - MP 관련 로직 무력화
    //--------------------------------------------------------------------

    Game_BattlerBase.prototype.maxMp = function() {
        return 0;
    };

    Game_BattlerBase.prototype.mp = 0;

    Game_BattlerBase.prototype.mpRate = function() {
        return 0;
    };

    Game_BattlerBase.prototype.setMp = function(mp) {
        this._mp = 0;
    };

    Game_BattlerBase.prototype.clearMp = function() {
        this._mp = 0;
    };

    // MP를 소모하는 스킬이라도 사용 가능하도록 체크 제거
    Game_BattlerBase.prototype.isMpCostPaid = function(skill) {
        return true;
    };

    var _Game_BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
    Game_BattlerBase.prototype.paySkillCost = function(skill) {
        this.paySkillCost = _Game_BattlerBase_paySkillCost;
        this.paySkillCost(skill);
        this._mp = 0;
    };

    // 액터/적 초기화 시 MP를 항상 0으로
    var _Game_BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
    Game_BattlerBase.prototype.recoverAll = function() {
        _Game_BattlerBase_recoverAll.call(this);
        this._mp = 0;
    };

    //--------------------------------------------------------------------
    // 혹시 모를 개별 창 대비 - drawActorMp 자체를 무력화
    //--------------------------------------------------------------------

    Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
        // 아무것도 그리지 않음
    };

    // 스킬창에서 MP 코스트 표시 제거 (TP 코스트는 유지)
    Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
        if (this._actor && this._actor.skillTpCost(skill) > 0) {
            this.changeTextColor(this.tpCostColor());
            this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right');
        }
        // MP 코스트는 표시하지 않음
    };

    // 상태창(메뉴)에서 MP 표시가 있다면 제거 (TP는 유지)
    if (Window_Status.prototype.drawBasicInfo) {
        Window_Status.prototype.drawBasicInfo = function(x, y) {
            var lineHeight = this.lineHeight();
            this.drawActorLevel(this._actor, x, y + lineHeight * 0);
            this.drawActorIcons(this._actor, x, y + lineHeight * 1);
            this.drawActorHp(this._actor, x, y + lineHeight * 2, 186);
            this.drawActorTp(this._actor, x, y + lineHeight * 3, 186);
            // MP 라인은 그리지 않음
        };
    }

})();
