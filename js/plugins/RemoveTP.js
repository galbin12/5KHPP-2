//=============================================================================
// RemoveTP.js
//=============================================================================

/*:
 * @plugindesc TP(테크니컬 포인트) 기능을 완전히 제거합니다.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 이 플러그인을 켜면 전투 화면, 스킬창, 상태창 등에서 TP 게이지와 수치가
 * 더 이상 표시되지 않으며, TP 소비 스킬도 TP 체크 없이 사용 가능해집니다.
 * (스킬창에서 TP 소모량 자체가 표시되지 않습니다.)
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
    // Game_BattlerBase / Game_Battler - TP 관련 로직 무력화
    //--------------------------------------------------------------------

    Game_BattlerBase.prototype.maxTp = function() {
        return 0;
    };

    Game_BattlerBase.prototype.tp = 0;

    Game_BattlerBase.prototype.tpRate = function() {
        return 0;
    };

    Game_BattlerBase.prototype.setTp = function(tp) {
        this._tp = 0;
    };

    Game_BattlerBase.prototype.gainTp = function(value) {
        // TP 증가 자체를 막음
    };

    Game_BattlerBase.prototype.gainSilentTp = function(value) {
        // 무음 TP 증가도 막음
    };

    Game_BattlerBase.prototype.clearTp = function() {
        this._tp = 0;
    };

    // TP를 소모하는 스킬이라도 사용 가능하도록 체크 제거
    var _Game_BattlerBase_isTpCostPaid = Game_BattlerBase.prototype.isTpCostPaid;
    Game_BattlerBase.prototype.isTpCostPaid = function(skill) {
        return true;
    };

    var _Game_BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
    Game_BattlerBase.prototype.paySkillCost = function(skill) {
        this.paySkillCost = _Game_BattlerBase_paySkillCost;
        this.paySkillCost(skill);
        this._tp = 0;
    };

    // 전투 시작/턴 종료 등에서 자동으로 오르는 TP 무효화
    Game_Battler.prototype.regenerateTp = function() {
        // 아무것도 하지 않음
    };

    Game_Battler.prototype.initTp = function() {
        this._tp = 0;
    };

    Game_Battler.prototype.chargeTpByDamage = function(damageRate) {
        // TP 자동 충전 막음
    };

    //--------------------------------------------------------------------
    // TP 표시를 아예 사용 안 하는 것으로 취급 (가장 확실한 방법)
    //--------------------------------------------------------------------

    // 시스템 데이터베이스의 'TP 표시' 옵션을 강제로 꺼버려서
    // TP 표시 여부를 체크하는 모든 플러그인(YEP 포함)이 알아서 TP를 그리지 않게 함
    var _DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object) {
        _DataManager_onLoad.call(this, object);
        if (object === $dataSystem) {
            $dataSystem.optDisplayTp = false;
        }
    };

    //--------------------------------------------------------------------
    // 혹시 모를 개별 창 대비 - drawActorTp 자체를 무력화
    //--------------------------------------------------------------------

    Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
        // 아무것도 그리지 않음
    };

    // YEP_BattleStatusWindow: 게이지 2개(HP/MP)만 그리도록 강제
    if (Window_BattleStatus.prototype.getGaugesDrawn) {
        Window_BattleStatus.prototype.getGaugesDrawn = function(actor) {
            return 2;
        };
    }

    // 스킬창에서 TP 코스트 표시 제거
    Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
        if (skill.mpCost > 0) {
            this.changeTextColor(this.textColor(23));
            this.drawText(skill.mpCost, x, y, width, 'right');
        }
        // TP 코스트는 표시하지 않음
    };

    // 상태창(메뉴)에서 TP 표시가 있다면 제거
    if (Window_Status.prototype.drawBasicInfo) {
        Window_Status.prototype.drawBasicInfo = function(x, y) {
            var lineHeight = this.lineHeight();
            this.drawActorLevel(this._actor, x, y + lineHeight * 0);
            this.drawActorIcons(this._actor, x, y + lineHeight * 1);
            this.drawActorHp(this._actor, x, y + lineHeight * 2, 186);
            this.drawActorMp(this._actor, x, y + lineHeight * 3, 186);
            // TP 라인은 그리지 않음
        };
    }

})();
