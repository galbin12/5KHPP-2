//=============================================================================
// SharedSoulLink.js
//=============================================================================
var Imported = Imported || {};
Imported.SharedSoulLink = true;

/*:
 * @plugindesc v1.0 영혼 공유 - 한 명이 맞으면 짝꿍도 같이 피격 표정 + HP 감소
 * @author ㄹㅅㅁ
 *
 * @param ShareHeal
 * @text 회복도 공유
 * @type boolean
 * @on 공유
 * @off 데미지만
 * @default false
 *
 * @param SkipIfBothTargeted
 * @text 둘 다 맞는 공격은 복사 안 함
 * @desc 전체공격처럼 둘이 동시에 맞으면 각자 자기 몫만 맞음 (2배 데미지 방지)
 * @type boolean
 * @default true
 *
 * @param ShareSlip
 * @text 턴 데미지도 공유
 * @desc 독 등 턴마다 깎이는 HP(재생률)도 공유
 * @type boolean
 * @default true
 *
 * @param TpRequireBoth
 * @text 짝꿍 TP도 충분해야 사용 가능
 * @desc <SharedTp> 스킬을 쓸 때 짝꿍 TP도 비용 이상이어야 사용 가능
 * @type boolean
 * @default false
 *
 * @param ShowPopup
 * @text 짝꿍 데미지 숫자 표시
 * @type boolean
 * @default true
 *
 * @param DamageRate
 * @text 공유 데미지 비율(%)
 * @desc 짝꿍이 받는 데미지 비율. 100 = 똑같이
 * @type number
 * @min 0
 * @default 100
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 액터 메모란에 짝꿍 액터 ID를 적습니다. (한쪽에만 적어도 양방향 연결)
 *
 *   <SharedSoul: 2>
 *
 * 예) 1번 액터 메모에 <SharedSoul: 2>
 *   → 1번이 맞으면 2번도 피격 표정 + 같은 만큼 HP 감소
 *   → 2번이 맞아도 1번이 똑같이
 *
 * - 짝꿍이 전투 멤버가 아니거나 이미 쓰러져 있으면 무시됩니다.
 * - 스킬/공격 데미지 + 독 등 턴 데미지(파라미터로 끄기 가능) 공유
 * - 턴 데미지는 데이터베이스 [시스템] "슬립 데미지로 사망" 설정을 따릅니다.
 * - 둘 다 독에 걸려 있으면 서로의 독 데미지도 받아서 각자 2번 깎입니다.
 *
 * ----------------------------------------------------------------------------
 * TP 공유 스킬
 * ----------------------------------------------------------------------------
 * 스킬 메모란에 적으면, 짝꿍 중 한 명이 그 스킬을 쓸 때
 * 짝꿍의 TP도 같이 깎입니다. (0 아래로는 안 내려감)
 *
 *   <SharedTp>        → 스킬의 TP 소비량만큼 짝꿍도 소모
 *   <SharedTp: 50>    → 짝꿍은 50만큼 소모 (따로 지정)
 *
 * "짝꿍 TP도 충분해야 사용 가능"을 켜면 짝꿍 TP가 모자랄 때
 * 스킬이 회색으로 비활성화됩니다.
 *
 * 배치: Popp_BStatusAnimatedFace, MultiPersonalitySystem 보다 아래
 */

(function() {
    var params = PluginManager.parameters('SharedSoulLink');
    var SHARE_HEAL = params['ShareHeal'] === 'true';
    var SKIP_BOTH  = params['SkipIfBothTargeted'] !== 'false';
    var SHARE_SLIP = params['ShareSlip'] !== 'false';
    var TP_REQUIRE_BOTH = params['TpRequireBoth'] === 'true';
    var SHOW_POPUP = params['ShowPopup'] !== 'false';
    var RATE       = Number(params['DamageRate'] || 100) / 100;

    //-------------------------------------------------------------------------
    // 짝꿍 맵 (양방향)
    //-------------------------------------------------------------------------
    var _soulMap = null;
    function soulMap() {
        if (_soulMap) return _soulMap;
        _soulMap = {};
        for (var i = 1; i < $dataActors.length; i++) {
            var a = $dataActors[i];
            if (!a || !a.note) continue;
            var m = a.note.match(/<SharedSoul:\s*(\d+)\s*>/i);
            if (m) {
                var b = Number(m[1]);
                _soulMap[i] = b;
                if (!_soulMap[b]) _soulMap[b] = i;
            }
        }
        return _soulMap;
    }

    Game_Actor.prototype.soulPartner = function() {
        var id = soulMap()[this.actorId()];
        if (!id) return null;
        var p = $gameActors.actor(id);
        if (!p || $gameParty.battleMembers().indexOf(p) < 0) return null;
        if (p.isDead()) return null;
        return p;
    };

    function isAlsoTargeted(partner) {
        var list = BattleManager._allTargets || [];
        return list.indexOf(partner) >= 0;
    }

    //-------------------------------------------------------------------------
    // 짝꿍에게 HP 변화 전달
    //-------------------------------------------------------------------------
    function shareToPartner(partner, dmg, critical, isSlip) {
        var value = Math.round(dmg * RATE);
        if (value === 0) return;
        // 슬립 데미지로 사망 금지 설정이면 HP 1에서 멈춤
        if (isSlip && value > 0 && !$dataSystem.optSlipDeath) {
            value = Math.min(value, partner.hp - 1);
            if (value <= 0) return;
        }
        var wasAlive = partner.isAlive();

        partner._soulMirroring = true;
        partner.clearResult();
        partner.result().used = true;
        partner.result().critical = !!critical;
        partner.gainHp(-value);
        partner._soulMirroring = false;

        // 피격 표정 (Popp 얼굴 모션 4 = 피격)
        if (value > 0 && !$gameSystem.isSideView()) {
            partner._faceMotion = 4;
            partner._pattern = 0;
            partner._motionCount = 0;
        }

        if (SHOW_POPUP && partner.startDamagePopup) {
            if (!partner._damagePopup) partner._damagePopup = [];
            partner.startDamagePopup();
        }

        if (wasAlive && partner.isDead()) {
            partner.performCollapse();
        }
    }

    //-------------------------------------------------------------------------
    // 피격 공유
    //-------------------------------------------------------------------------
    var _apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _apply.call(this, target);
        if (!$gameParty.inBattle() || !target || !target.isActor()) return;
        if (target._soulMirroring) return;

        var result = target.result();
        if (!result.isHit() || !result.hpAffected) return;

        var dmg = result.hpDamage;
        if (dmg === 0) return;
        if (dmg < 0 && !SHARE_HEAL) return;

        var partner = target.soulPartner();
        if (!partner || partner === target) return;
        if (SKIP_BOTH && isAlsoTargeted(partner)) return;

        shareToPartner(partner, dmg, result.critical, false);
    };
    //-------------------------------------------------------------------------
    // 턴 데미지(독 등) 공유
    //-------------------------------------------------------------------------
    var _regenHp = Game_Battler.prototype.regenerateHp;
    Game_Battler.prototype.regenerateHp = function() {
        var before = this.hp;
        _regenHp.call(this);
        if (!SHARE_SLIP || !$gameParty.inBattle() || !this.isActor()) return;
        if (this._soulMirroring) return;

        var dmg = before - this.hp; // +면 데미지, -면 회복
        if (dmg === 0) return;
        if (dmg < 0 && !SHARE_HEAL) return;

        var partner = this.soulPartner();
        if (!partner || partner === this) return;
        shareToPartner(partner, dmg, false, true);
    };

    //-------------------------------------------------------------------------
    // TP 공유 스킬 <SharedTp> / <SharedTp: n>
    //-------------------------------------------------------------------------
    function sharedTpCost(actor, skill) {
        if (!skill || !skill.note) return 0;
        var m = skill.note.match(/<SharedTp(?:\s*:\s*(\d+))?\s*>/i);
        if (!m) return 0;
        return m[1] !== undefined ? Number(m[1]) : actor.skillTpCost(skill);
    }

    var _canPay = Game_BattlerBase.prototype.canPaySkillCost;
    Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
        if (!_canPay.call(this, skill)) return false;
        if (TP_REQUIRE_BOTH && this.isActor() && $gameParty.inBattle()) {
            var cost = sharedTpCost(this, skill);
            if (cost > 0) {
                var partner = this.soulPartner();
                if (partner && partner.tp < cost) return false;
            }
        }
        return true;
    };

    var _paySkill = Game_BattlerBase.prototype.paySkillCost;
    Game_BattlerBase.prototype.paySkillCost = function(skill) {
        _paySkill.call(this, skill);
        if (!this.isActor() || !$gameParty.inBattle()) return;
        var cost = sharedTpCost(this, skill);
        if (cost <= 0) return;
        var partner = this.soulPartner();
        if (!partner || partner === this) return;
        partner.setTp(Math.max(0, partner.tp - cost));
    };
})();
