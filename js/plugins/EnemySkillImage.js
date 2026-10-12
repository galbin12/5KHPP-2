//=============================================================================
// EnemySkillImage.js
//=============================================================================

/*:
 * @plugindesc v1.0 적이 스킬을 쓰는 동안 스킬 메모란에 적은 이미지로 모습을 바꿉니다.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * ■ 스킬 메모란 (그 스킬을 쓰는 모든 적에게 적용)
 *
 *   <적이미지: 파일명>
 *   <적이미지유지: 30>
 *
 *   예)  <적이미지: Slime_Attack>
 *        <적이미지유지: 30>
 *
 *   - 파일명은 img/enemies 폴더 안의 이미지 이름입니다 (확장자 제외).
 *     (사이드뷰 전투라면 img/sv_enemies)
 *   - 적이 이 스킬을 쓰기 시작하면 이미지가 바뀌고, 스킬 사용이 끝나면
 *     원래 이미지로 돌아옵니다.
 *   - <적이미지유지: 프레임> 은 선택 사항입니다. 스킬이 끝난 뒤에도
 *     그 프레임(60 = 1초) 동안 이미지를 더 유지합니다.
 *
 * ■ 적 캐릭터 메모란 (그 적만 같은 스킬에서 다른 이미지를 쓰고 싶을 때)
 *
 *   <적이미지 스킬ID: 파일명>
 *
 *   예)  <적이미지 12: Slime_Big_Attack>   (12번 스킬을 쓸 때 이 이미지)
 *
 *   적 메모란 설정이 스킬 메모란보다 우선합니다.
 *
 * 영문 태그(<EnemySkillImage: name>, <EnemySkillImageHold: 30>)도 동일하게 동작합니다.
 *
 * ============================================================================
 * 참고
 * ============================================================================
 * - 전투가 시작될 때 필요한 이미지를 미리 불러오기 때문에, 스킬을 쓰는
 *   순간에 이미지가 늦게 뜨는 일이 거의 없습니다.
 * - 아이템에는 적용되지 않고 "스킬"에만 적용됩니다.
 * - EnemyImageSwitch(HP·스위치로 이미지 변경)와 같이 쓸 수 있고,
 *   스킬 이미지가 표시되는 동안에는 이 플러그인이 우선합니다.
 *   플러그인 순서는 EnemyImageSwitch와 YEP 계열보다 아래에 두세요.
 */

(function() {
    'use strict';

    var SKILL_TAG = /<(?:적이미지|EnemySkillImage)\s*:\s*([^>]+)>/i;
    var HOLD_TAG = /<(?:적이미지유지|EnemySkillImageHold)\s*:\s*(\d+)\s*>/i;
    var ENEMY_TAG = /<(?:적이미지|EnemySkillImage)\s+(\d+)\s*:\s*([^>]+)>/gi;

    //-------------------------------------------------------------------------
    // Game_Enemy
    //-------------------------------------------------------------------------
    Game_Enemy.prototype.findSkillImage = function(skill) {
        var name = null;
        var match;

        // 1) 적 메모란: <적이미지 스킬ID: 파일명>
        var enemyNote = this.enemy().note || '';
        var re = new RegExp(ENEMY_TAG.source, 'gi');
        while ((match = re.exec(enemyNote)) !== null) {
            if (Number(match[1]) === skill.id) {
                name = match[2].trim();
                break;
            }
        }

        // 2) 스킬 메모란: <적이미지: 파일명>
        var skillNote = skill.note || '';
        if (!name) {
            match = SKILL_TAG.exec(skillNote);
            if (match) name = match[1].trim();
        }
        if (!name) return null;

        match = HOLD_TAG.exec(skillNote);
        return { name: name, hold: match ? Number(match[1]) : 0 };
    };

    var _Game_Enemy_initMembers = Game_Enemy.prototype.initMembers;
    Game_Enemy.prototype.initMembers = function() {
        _Game_Enemy_initMembers.call(this);
        this._skillImage = null;
        this._skillImageHold = 0;
        this._skillImageEnding = false;
    };

    // 전투 시작 시 사용할 이미지를 미리 불러오기
    var _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);
        this.preloadSkillImages();
    };

    Game_Enemy.prototype.preloadSkillImages = function() {
        var names = {};
        var self = this;
        var enemy = this.enemy();
        var match;

        var re = new RegExp(ENEMY_TAG.source, 'gi');
        while ((match = re.exec(enemy.note || '')) !== null) {
            names[match[2].trim()] = true;
        }
        (enemy.actions || []).forEach(function(a) {
            var skill = $dataSkills[a.skillId];
            if (!skill) return;
            var m = SKILL_TAG.exec(skill.note || '');
            if (m) names[m[1].trim()] = true;
        });

        var hue = this.battlerHue();
        Object.keys(names).forEach(function(name) {
            if ($gameSystem.isSideView()) {
                ImageManager.reserveSvEnemy(name, hue);
            } else {
                ImageManager.reserveEnemy(name, hue);
            }
        });
    };

    var _Game_Enemy_performActionStart = Game_Enemy.prototype.performActionStart;
    Game_Enemy.prototype.performActionStart = function(action) {
        _Game_Enemy_performActionStart.call(this, action);
        this._skillImage = null;
        this._skillImageEnding = false;
        if (action && action.isSkill() && action.item()) {
            var found = this.findSkillImage(action.item());
            if (found) {
                this._skillImage = found.name;
                this._skillImageHold = found.hold;
            }
        }
    };

    var _Game_Enemy_performActionEnd = Game_Enemy.prototype.performActionEnd;
    Game_Enemy.prototype.performActionEnd = function() {
        _Game_Enemy_performActionEnd.call(this);
        if (!this._skillImage) return;
        if (this._skillImageHold > 0) {
            this._skillImageEnding = true;      // 유지 시간이 지나면 복귀
        } else {
            this._skillImage = null;
        }
    };

    // 유지 시간 카운트 (Sprite_Enemy.update에서 매 프레임 호출)
    Game_Enemy.prototype.updateSkillImage = function() {
        if (!this._skillImageEnding) return;
        if (this._skillImageHold > 0) {
            this._skillImageHold--;
        } else {
            this._skillImage = null;
            this._skillImageEnding = false;
        }
    };

    var _Game_Enemy_battlerName = Game_Enemy.prototype.battlerName;
    Game_Enemy.prototype.battlerName = function() {
        if (this._skillImage) return this._skillImage;
        return _Game_Enemy_battlerName.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_Enemy
    //-------------------------------------------------------------------------
    var _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);
        if (this._enemy) this._enemy.updateSkillImage();
    };

})();
