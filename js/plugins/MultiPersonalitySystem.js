//=============================================================================
// MultiPersonalitySystem.js
// 다중인격 캐릭터 시스템.
// 전투 시작 시 / 매 턴 시작 시 정해진 인격 목록 중 하나로 랜덤 전환되며,
// 인격마다 정해진 능력치 보정과 얼굴(얼굴그래픽)이 적용됩니다.
// 특정 스킬을 사용하면 그 즉시 인격이 다시 랜덤 전환되어 얼굴이 바뀝니다.
//=============================================================================
var Imported = Imported || {};
Imported.MultiPersonalitySystem = true;

var RS = RS || {};
RS.MPS = RS.MPS || {};

/*:
 * @plugindesc v1.0 다중인격 캐릭터 시스템 (랜덤 인격 전환 + 능력치/얼굴 변경)
 * @author ㄹㅅㅁ
 *
 * @param AutoRerollOnBattleStart
 * @text 전투 시작 시 자동 전환
 * @type boolean
 * @on 켜짐
 * @off 꺼짐
 * @default true
 *
 * @param AutoRerollOnTurnStart
 * @text 매 턴 시작 시 자동 전환
 * @type boolean
 * @on 켜짐
 * @off 꺼짐
 * @default true
 *
 * @param AllowSameRepeat
 * @text 직전과 같은 인격 재선택 허용
 * @type boolean
 * @on 허용
 * @off 금지 (가능하면 다른 인격으로)
 * @default false
 *
 * @help
 * =============================================================================
 * 사용 방법
 * =============================================================================
 * 1) 액터의 메모란에 인격을 원하는 만큼 등록합니다. (한 줄에 하나씩)
 *
 *   <Personality: 인격ID 얼굴파일명 얼굴인덱스 능력치보정...>
 *
 *   예시)
 *   <Personality: A Actor1 0 atk+5 def-3>
 *   <Personality: B Actor1 1 atk-3 def+5 mat+10>
 *   <Personality: C Actor1_animate 2 agi+8 luk-5>
 *
 *   - 인격ID: 원하는 문자/숫자 (플러그인 명령/노트태그에서 이 ID로 지정)
 *   - 얼굴파일명: img/faces 폴더 안의 파일명 (확장자 제외)
 *   - 얼굴인덱스: 그 파일 안에서 몇 번째 얼굴인지 (0부터 시작)
 *   - 능력치보정: mhp/mmp/atk/def/mat/mdf/agi/luk 뒤에 +또는-와 숫자
 *                 여러 개를 공백으로 나열 가능, 없으면 생략 가능
 *
 *   인격이 하나도 등록되지 않은 액터는 이 플러그인의 영향을 받지 않습니다.
 *
 * 1-1) "스킬 안 쓰고 평소에 유지할 기본 인격"이 따로 필요하면 (랜덤 목록에는
 *      안 들어가고, 전투가 끝나면 자동으로 여기로 돌아옵니다):
 *
 *   <DefaultPersonality: 얼굴파일명 얼굴인덱스 능력치보정...>
 *
 *   예시) <DefaultPersonality: 새싹 0>
 *   전투가 끝나는 순간 자동으로 이 인격으로 리셋됩니다. 플러그인 명령
 *   "MPS 기본전환 액터ID" 로 언제든 수동으로도 돌릴 수 있어요.
 *
 * 2) 스킬을 사용하는 즉시 인격을 다시 뽑고 싶다면, 그 스킬의 메모란에
 *
 *   <RerollPersonality>
 *
 *   을 적어주세요. 스킬 사용자의 인격이 그 자리에서 다시 랜덤으로 바뀝니다.
 *
 * -----------------------------------------------------------------------------
 * 플러그인 명령
 * -----------------------------------------------------------------------------
 *   MPS 강제전환 액터ID 인격ID
 *     예) MPS 강제전환 1 B
 *     -> 1번 액터를 강제로 B 인격으로 전환합니다.
 *
 *   MPS 랜덤전환 액터ID
 *     예) MPS 랜덤전환 1
 *     -> 1번 액터의 인격을 즉시 랜덤으로 다시 뽑습니다.
 *
 *   MPS 락전환 액터ID 인격ID 턴수
 *     예) MPS 락전환 14 미친놈2 2
 *     -> 14번 액터를 즉시 미친놈2 인격으로 바꾸고, 그 뒤로 2턴 동안은
 *        (전투 자동 랜덤 전환에서 제외되어) 그 인격이 유지됩니다.
 *        턴수가 다 소모되면 다음 턴부터 다시 자동 랜덤 전환이 재개됩니다.
 *
 * -----------------------------------------------------------------------------
 * "스킬 사용 -> 1~5번 중 하나 선택 -> 2턴 동안 그 인격 고정" 만드는 법
 * -----------------------------------------------------------------------------
 * 이 플러그인은 선택창을 직접 만들지 않고, RPG Maker MV가 원래 가지고 있는
 * "스킬의 커먼이벤트 발동" 기능 + "선택지 표시" 이벤트 명령을 그대로 활용해요.
 *
 * 1) 데이터베이스 > 커먼이벤트에 새 이벤트를 만듭니다. (예: "인격선택_미친놈")
 * 2) 그 안에 이벤트 명령 [선택지 표시]를 넣고, 항목을 "1.미친놈" / "2.미친놈2" /
 *    "3.미친놈3" / "4.미친놈4" 이런 식으로 5개까지 만듭니다.
 * 3) 각 선택지 분기 안에 [플러그인 명령]으로 아래처럼 적습니다.
 *      "1.미친놈" 분기   -> MPS 락전환 14 미친놈 2
 *      "2.미친놈2" 분기  -> MPS 락전환 14 미친놈2 2
 *      "3.미친놈3" 분기  -> MPS 락전환 14 미친놈3 2
 *      "4.미친놈4" 분기  -> MPS 락전환 14 미친놈4 2
 * 4) 스킬 메모란에 (DB의 "커먼이벤트" 효과 항목은 쓰지 마세요 - 전투 중
 *    여러 액션이 겹치면 씹히는 문제가 있어서, 대신 아래 노트태그로 직접
 *    실행시킵니다):
 *
 *   <PersonalityChoiceEvent: 커먼이벤트ID>
 *
 *   예시) <PersonalityChoiceEvent: 12>   (12번 커먼이벤트가 그 선택지 이벤트일 때)
 *
 * 이렇게 하면 그 스킬을 쓸 때마다 전투 중 선택지 창이 뜨고, 고른 인격으로
 * 2턴 동안 고정된 뒤 자동으로 다시 랜덤 전환이 재개됩니다.
 *
 * -----------------------------------------------------------------------------
 * 스크립트 (이벤트 - 스크립트 명령에서 사용 가능)
 * -----------------------------------------------------------------------------
 *   $gameActors.actor(1).rerollPersonality();      // 랜덤 전환
 *   $gameActors.actor(1).setPersonality('B');       // 지정 전환
 *   $gameActors.actor(1).personalityId();           // 현재 인격ID 확인
 *
 * =============================================================================
 */

(function() {

    var parameters = PluginManager.parameters('MultiPersonalitySystem');
    RS.MPS.autoBattleStart = String(parameters['AutoRerollOnBattleStart'] || 'true') === 'true';
    RS.MPS.autoTurnStart   = String(parameters['AutoRerollOnTurnStart'] || 'true') === 'true';
    RS.MPS.allowSameRepeat = String(parameters['AllowSameRepeat'] || 'false') === 'true';

    var PARAM_IDS = { mhp: 0, mmp: 1, atk: 2, def: 3, mat: 4, mdf: 5, agi: 6, luk: 7 };

    //-------------------------------------------------------------------------
    // 노트태그 파싱
    //-------------------------------------------------------------------------
    RS.MPS.parsePersonalities = function(note) {
        var list = [];
        if (!note) return list;
        var lines = note.split(/[\r\n]+/);
        var regex = /<Personality:\s*(\S+)\s+(\S+)\s+(\d+)\s*(.*)>/i;
        for (var i = 0; i < lines.length; i++) {
            var match = lines[i].match(regex);
            if (!match) continue;
            var id = match[1];
            var faceName = match[2];
            var faceIndex = Number(match[3]);
            var paramText = match[4] || '';
            var params = {};
            var paramRegex = /(mhp|mmp|atk|def|mat|mdf|agi|luk)\s*([+\-]\d+)/gi;
            var pm;
            while ((pm = paramRegex.exec(paramText)) !== null) {
                var key = pm[1].toLowerCase();
                params[PARAM_IDS[key]] = Number(pm[2]);
            }
            list.push({ id: id, faceName: faceName, faceIndex: faceIndex, params: params });
        }
        return list;
    };

    RS.MPS.parseDefaultPersonality = function(note) {
        if (!note) return null;
        var lines = note.split(/[\r\n]+/);
        var regex = /<DefaultPersonality:\s*(\S+)\s+(\d+)\s*(.*)>/i;
        for (var i = 0; i < lines.length; i++) {
            var match = lines[i].match(regex);
            if (!match) continue;
            var faceName = match[1];
            var faceIndex = Number(match[2]);
            var paramText = match[3] || '';
            var params = {};
            var paramRegex = /(mhp|mmp|atk|def|mat|mdf|agi|luk)\s*([+\-]\d+)/gi;
            var pm;
            while ((pm = paramRegex.exec(paramText)) !== null) {
                var key = pm[1].toLowerCase();
                params[PARAM_IDS[key]] = Number(pm[2]);
            }
            return { id: '기본', faceName: faceName, faceIndex: faceIndex, params: params };
        }
        return null;
    };

    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;
        if (!RS.MPS._parsed) {
            for (var i = 1; i < $dataActors.length; i++) {
                var dataActor = $dataActors[i];
                if (dataActor) {
                    dataActor._mpsPersonalities = RS.MPS.parsePersonalities(dataActor.note);
                    dataActor._mpsDefault = RS.MPS.parseDefaultPersonality(dataActor.note);
                }
            }
            RS.MPS._parsed = true;
        }
        return true;
    };

    //-------------------------------------------------------------------------
    // Game_Actor
    //-------------------------------------------------------------------------
    var _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._personalityId = null;
        this._personalityParams = {};
        this._personalityLockTurns = 0;
    };

    // 몇 턴 동안 자동 랜덤 전환을 막고 지정한 인격으로 고정
    Game_Actor.prototype.setPersonalityLocked = function(id, turns) {
        this.setPersonality(id);
        this._personalityLockTurns = Math.max(0, Number(turns) || 0);
    };

    Game_Actor.prototype.isPersonalityLocked = function() {
        return this._personalityLockTurns > 0;
    };

    // 턴 하나 소비. true를 반환하면 이번 턴은 락 중이라 리롤을 건너뜀
    Game_Actor.prototype.tickPersonalityLock = function() {
        if (this._personalityLockTurns > 0) {
            this._personalityLockTurns--;
            return true;
        }
        return false;
    };

    Game_Actor.prototype.mpsPersonalities = function() {
        return (this.actor() && this.actor()._mpsPersonalities) || [];
    };

    Game_Actor.prototype.hasMultiPersonality = function() {
        return this.mpsPersonalities().length > 0;
    };

    Game_Actor.prototype.personalityId = function() {
        return this._personalityId;
    };

    Game_Actor.prototype.applyPersonalityData = function(data) {
        this._personalityId = data.id;
        this._personalityParams = data.params || {};
        this.setFaceImage(data.faceName, data.faceIndex);
        this.refresh();
    };

    // 지정한 ID로 강제 전환
    Game_Actor.prototype.setPersonality = function(id) {
        var list = this.mpsPersonalities();
        for (var i = 0; i < list.length; i++) {
            if (String(list[i].id) === String(id)) {
                this.applyPersonalityData(list[i]);
                return true;
            }
        }
        return false;
    };

    // 랜덤 목록에 없는, 평소로 돌아갈 기본 인격
    Game_Actor.prototype.defaultPersonalityData = function() {
        return (this.actor() && this.actor()._mpsDefault) || null;
    };

    Game_Actor.prototype.hasDefaultPersonality = function() {
        return !!this.defaultPersonalityData();
    };

    Game_Actor.prototype.resetToDefaultPersonality = function() {
        var data = this.defaultPersonalityData();
        if (data) {
            this._personalityLockTurns = 0;
            this.applyPersonalityData(data);
        }
    };

    // 랜덤 전환 (가능하면 직전 인격과 다른 것으로)
    Game_Actor.prototype.rerollPersonality = function() {
        var list = this.mpsPersonalities();
        if (list.length === 0) return;
        var candidates = list;
        if (!RS.MPS.allowSameRepeat && list.length > 1 && this._personalityId !== null) {
            candidates = list.filter(function(p) {
                return String(p.id) !== String(this._personalityId);
            }, this);
            if (candidates.length === 0) candidates = list;
        }
        var pick = candidates[Math.floor(Math.random() * candidates.length)];
        this.applyPersonalityData(pick);
    };

    // 능력치 보정 반영
    var _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(paramId) {
        var value = _Game_Actor_paramPlus.call(this, paramId);
        if (this._personalityParams && this._personalityParams[paramId] !== undefined) {
            value += this._personalityParams[paramId];
        }
        return value;
    };

    //-------------------------------------------------------------------------
    // 전투 시작 / 턴 시작 시 자동 전환
    //-------------------------------------------------------------------------
    function rerollPartyPersonalities() {
        $gameParty.battleMembers().forEach(function(actor) {
            if (actor.hasMultiPersonality()) actor.rerollPersonality();
        });
    }

    // 턴 시작용: 락(고정) 걸려있는 액터는 리롤하지 않고 락 턴수만 1 소모
    function rerollPartyPersonalitiesRespectingLock() {
        $gameParty.battleMembers().forEach(function(actor) {
            if (!actor.hasMultiPersonality()) return;
            if (actor.tickPersonalityLock()) return; // 락 중이면 이번 턴은 패스
            actor.rerollPersonality();
        });
    }

    var _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        _BattleManager_startBattle.call(this);
        if (RS.MPS.autoBattleStart) rerollPartyPersonalities();
    };

    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _BattleManager_endBattle.call(this, result);
        $gameParty.members().forEach(function(actor) {
            if (actor.hasDefaultPersonality()) actor.resetToDefaultPersonality();
        });
    };

    var _BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function() {
        _BattleManager_startTurn.call(this);
        if (RS.MPS.autoTurnStart) rerollPartyPersonalitiesRespectingLock();
    };

    //-------------------------------------------------------------------------
    // 특정 스킬 사용 시 즉시 재전환
    //-------------------------------------------------------------------------
    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        var item = this.item();
        if (item && item.meta && item.meta.RerollPersonality !== undefined) {
            var subject = this.subject();
            if (subject && subject.isActor && subject.isActor() && subject.hasMultiPersonality()) {
                subject.rerollPersonality();
            }
        }
        // 인격 선택 커먼이벤트: DB "커먼이벤트" 효과(reserveCommonEvent, 슬롯 1개)
        // 대신 interpreter.setupChild()로 직접 실행해 충돌을 피합니다.
        if (item && item.meta && item.meta.PersonalityChoiceEvent !== undefined) {
            var ceId = Number(item.meta.PersonalityChoiceEvent);
            var ceData = $dataCommonEvents[ceId];
            if (ceData && $gameTroop && $gameTroop._interpreter) {
                $gameTroop._interpreter.setupChild(ceData.list, 0);
            }
        }
    };

    //-------------------------------------------------------------------------
    // 플러그인 명령
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command !== 'MPS') return;
        var sub = args[0];
        if (sub === '강제전환') {
            var actor1 = $gameActors.actor(Number(args[1]));
            if (actor1) actor1.setPersonality(args[2]);
        } else if (sub === '랜덤전환') {
            var actor2 = $gameActors.actor(Number(args[1]));
            if (actor2 && actor2.hasMultiPersonality()) actor2.rerollPersonality();
        } else if (sub === '락전환') {
            // MPS 락전환 액터ID 인격ID 턴수
            var actor3 = $gameActors.actor(Number(args[1]));
            if (actor3) actor3.setPersonalityLocked(args[2], Number(args[3]) || 2);
        } else if (sub === '기본전환') {
            var actor4 = $gameActors.actor(Number(args[1]));
            if (actor4 && actor4.hasDefaultPersonality()) actor4.resetToDefaultPersonality();
        }
    };

})();
