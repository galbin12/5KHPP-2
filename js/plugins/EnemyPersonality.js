//=============================================================================
// EnemyPersonality.js
//=============================================================================

/*:
 * @plugindesc v1.0 적 다중인격: 매 턴 인격(표정 이미지 + 능력치 보정)이 바뀝니다. (MultiPersonalitySystem의 적 버전)
 * @author Claude
 *
 * @param Reroll On Input Start
 * @text 매 턴 자동 전환
 * @type boolean
 * @on 켜짐
 * @off 꺼짐
 * @desc 매 턴 커맨드 입력이 시작될 때 인격을 자동으로 바꿀지 여부 (첫 턴 포함)
 * @default true
 *
 * @param Allow Same Repeat
 * @text 직전과 같은 인격 재선택 허용
 * @type boolean
 * @on 허용
 * @off 금지 (가능하면 다른 인격으로)
 * @default false
 *
 * @param Pick Mode
 * @text 선택 방식
 * @type select
 * @option 랜덤
 * @value random
 * @option 순서대로
 * @value sequence
 * @desc 인격을 랜덤으로 뽑을지, 적어 놓은 순서대로 돌릴지
 * @default random
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * MultiPersonalitySystem은 "액터(아군)" 전용이라 적에게는 적용되지 않습니다.
 * 이 플러그인이 적용 버전이에요. (표정 = 얼굴그래픽 대신 적 이미지 교체)
 *
 * 1) 적 캐릭터 메모란에 인격을 원하는 만큼 등록합니다. (한 줄에 하나씩)
 *
 *   <적인격: 인격ID 이미지파일명 능력치보정...>
 *
 *   예시)
 *   <적인격: 웃음 Boss_Smile>
 *   <적인격: 분노 Boss_Angry atk+10 def-5>
 *   <적인격: 울음 Boss_Cry mdf+8 agi-3>
 *
 *   - 인격ID: 원하는 문자/숫자
 *   - 이미지파일명: img/enemies 안의 파일명 (확장자 제외)
 *   - 능력치보정: mhp/mmp/atk/def/mat/mdf/agi/luk 뒤에 +또는-와 숫자
 *                 여러 개를 공백으로 나열, 필요 없으면 생략
 *
 *   인격이 하나도 없는 적은 영향을 받지 않습니다.
 *
 * 2) 매 턴 커맨드 입력이 시작될 때 등록한 인격 중 하나로 바뀝니다.
 *    (플레이어가 커맨드를 고르는 동안 그 턴의 표정이 보입니다)
 *
 * ■ 선택 태그
 *
 *   <적인격시작: 인격ID>      (적 메모란)
 *       첫 턴에는 랜덤 대신 이 인격으로 시작합니다.
 *
 *   <적인격전환>              (스킬 메모란)
 *       그 적이 이 스킬을 다 쓰고 나면 인격이 즉시 다시 바뀝니다.
 *       (영문: <RerollEnemyPersonality>)
 *
 * ■ 플러그인 명령 (전투인덱스는 화면에 나온 순서, 0부터 시작)
 *
 *   EPS 강제전환 전투인덱스 인격ID
 *       예) EPS 강제전환 0 분노
 *   EPS 랜덤전환 전투인덱스
 *       예) EPS 랜덤전환 0
 *
 * ■ 스크립트
 *
 *   $gameTroop.members()[0].setPersonality('분노');
 *   $gameTroop.members()[0].personalityId();
 *
 * ============================================================================
 * 참고
 * ============================================================================
 * - 인격 이미지는 전투 시작 때 미리 불러와서 바뀔 때 깜빡이지 않습니다.
 * - 인격 이미지가 크기가 달라도 괜찮습니다. 아래 가운데 기준으로 놓입니다.
 * - 플러그인 순서는 YEP 계열과 EnemyImageSwitch보다 아래,
 *   EnemySkillImage와 EnemyIntroAnimation보다 위에 두세요.
 *   (스킬 이미지와 등장 애니메이션이 인격 이미지보다 우선하도록)
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('EnemyPersonality');
    var rerollOnInput = String(parameters['Reroll On Input Start'] || 'true') === 'true';
    var allowSameRepeat = String(parameters['Allow Same Repeat'] || 'false') === 'true';
    var pickMode = String(parameters['Pick Mode'] || 'random');

    var PARAM_IDS = { mhp: 0, mmp: 1, atk: 2, def: 3, mat: 4, mdf: 5, agi: 6, luk: 7 };
    var PERSONALITY_TAG = /<(?:적인격|EnemyPersonality)\s*:\s*(\S+)\s+(\S+)\s*([^>]*)>/i;
    var START_TAG = /<(?:적인격시작|EnemyPersonalityStart)\s*:\s*([^>]+)>/i;
    var SKILL_TAG = /<(?:적인격전환|RerollEnemyPersonality)\s*>/i;

    //-------------------------------------------------------------------------
    // 노트태그 파싱 (데이터베이스 항목마다 한 번만)
    //-------------------------------------------------------------------------
    function getPersonalities(enemy) {
        if (enemy._epsList !== undefined) return enemy._epsList;
        var list = [];
        var lines = (enemy.note || '').split(/[\r\n]+/);
        for (var i = 0; i < lines.length; i++) {
            var m = PERSONALITY_TAG.exec(lines[i]);
            if (!m) continue;
            var params = {};
            var paramRegex = /(mhp|mmp|atk|def|mat|mdf|agi|luk)\s*([+\-]\d+)/gi;
            var pm;
            while ((pm = paramRegex.exec(m[3] || '')) !== null) {
                params[PARAM_IDS[pm[1].toLowerCase()]] = Number(pm[2]);
            }
            list.push({ id: m[1], image: m[2], params: params });
        }
        enemy._epsList = list;
        var sm = START_TAG.exec(enemy.note || '');
        enemy._epsStart = sm ? sm[1].trim() : null;
        return list;
    }

    //-------------------------------------------------------------------------
    // Game_Enemy
    //-------------------------------------------------------------------------
    var _Game_Enemy_initMembers = Game_Enemy.prototype.initMembers;
    Game_Enemy.prototype.initMembers = function() {
        _Game_Enemy_initMembers.call(this);
        this._personalityId = null;
        this._personalityImage = null;
        this._personalityParams = {};
        this._personalityRerollAfter = false;
    };

    Game_Enemy.prototype.personalities = function() {
        return getPersonalities(this.enemy());
    };

    Game_Enemy.prototype.hasMultiPersonality = function() {
        return this.personalities().length > 0;
    };

    Game_Enemy.prototype.personalityId = function() {
        return this._personalityId;
    };

    Game_Enemy.prototype.applyPersonalityData = function(data) {
        this._personalityId = data.id;
        this._personalityImage = data.image;
        this._personalityParams = data.params || {};
        this.refresh();
    };

    Game_Enemy.prototype.setPersonality = function(id) {
        var list = this.personalities();
        for (var i = 0; i < list.length; i++) {
            if (String(list[i].id) === String(id)) {
                this.applyPersonalityData(list[i]);
                return true;
            }
        }
        return false;
    };

    Game_Enemy.prototype.rerollPersonality = function() {
        var list = this.personalities();
        if (list.length === 0) return;

        // 첫 전환: 시작 인격이 지정돼 있으면 그것으로
        if (this._personalityId === null && this.enemy()._epsStart) {
            if (this.setPersonality(this.enemy()._epsStart)) return;
        }

        var pick;
        if (pickMode === 'sequence') {
            var current = -1;
            for (var i = 0; i < list.length; i++) {
                if (String(list[i].id) === String(this._personalityId)) current = i;
            }
            pick = list[(current + 1) % list.length];
        } else {
            var candidates = list;
            if (!allowSameRepeat && list.length > 1 && this._personalityId !== null) {
                candidates = list.filter(function(p) {
                    return String(p.id) !== String(this._personalityId);
                }, this);
                if (candidates.length === 0) candidates = list;
            }
            pick = candidates[Math.floor(Math.random() * candidates.length)];
        }
        this.applyPersonalityData(pick);
    };

    // 전투 시작 시 인격 이미지 미리 불러오기
    var _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);
        var hue = this.battlerHue();
        this.personalities().forEach(function(p) {
            if ($gameSystem.isSideView()) {
                ImageManager.reserveSvEnemy(p.image, hue);
            } else {
                ImageManager.reserveEnemy(p.image, hue);
            }
        });
    };

    // 이미지 교체
    var _Game_Enemy_battlerName = Game_Enemy.prototype.battlerName;
    Game_Enemy.prototype.battlerName = function() {
        if (this._personalityImage) return this._personalityImage;
        return _Game_Enemy_battlerName.call(this);
    };

    // 능력치 보정
    var _Game_Enemy_paramPlus = Game_Enemy.prototype.paramPlus;
    Game_Enemy.prototype.paramPlus = function(paramId) {
        var value = _Game_Enemy_paramPlus.call(this, paramId);
        if (this._personalityParams && this._personalityParams[paramId] !== undefined) {
            value += this._personalityParams[paramId];
        }
        return value;
    };

    // 스킬 사용 후 즉시 재전환
    var _Game_Enemy_performActionStart = Game_Enemy.prototype.performActionStart;
    Game_Enemy.prototype.performActionStart = function(action) {
        _Game_Enemy_performActionStart.call(this, action);
        var item = action && action.item();
        this._personalityRerollAfter = !!(item && SKILL_TAG.test(item.note || '') &&
                                          this.hasMultiPersonality());
    };

    var _Game_Enemy_performActionEnd = Game_Enemy.prototype.performActionEnd;
    Game_Enemy.prototype.performActionEnd = function() {
        _Game_Enemy_performActionEnd.call(this);
        if (this._personalityRerollAfter) {
            this._personalityRerollAfter = false;
            if (this.isAlive()) this.rerollPersonality();
        }
    };

    //-------------------------------------------------------------------------
    // 매 턴 커맨드 입력 시작 때 전환
    //-------------------------------------------------------------------------
    var _BattleManager_startInput = BattleManager.startInput;
    BattleManager.startInput = function() {
        if (rerollOnInput) {
            $gameTroop.members().forEach(function(enemy) {
                if (enemy.isAlive() && enemy.hasMultiPersonality()) enemy.rerollPersonality();
            });
        }
        _BattleManager_startInput.call(this);
    };

    //-------------------------------------------------------------------------
    // 플러그인 명령
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command !== 'EPS') return;
        var enemy = $gameTroop.members()[Number(args[1])];
        if (!enemy || !enemy.hasMultiPersonality()) return;
        if (args[0] === '강제전환') {
            enemy.setPersonality(args[2]);
        } else if (args[0] === '랜덤전환') {
            enemy.rerollPersonality();
        }
    };

})();
