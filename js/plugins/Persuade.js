//=============================================================================
// Persuade.js
//=============================================================================

/*:
 * @plugindesc 전투 커맨드에 "설득" 칸을 추가합니다. 일정 횟수 이상 설득하면 적이 더 이상 공격하지 않으며, 설득할 때마다 파티원 각자의 대사가 말풍선으로 나옵니다.
 * @author ㄹㅅㅁ
 *
 * @param CommandName
 * @text 커맨드 이름
 * @type string
 * @desc 액터 커맨드 창에 표시될 이름입니다.
 * @default 설득
 *
 * @param Enabled
 * @text 기본 사용 여부
 * @type boolean
 * @on 사용
 * @off 끔
 * @desc 게임 시작 시 설득 커맨드를 쓸지 여부. 플러그인 커맨드로 바꿀 수 있습니다.
 * @default true
 *
 * @param EnableSwitch
 * @text 필요 스위치
 * @type switch
 * @desc 이 스위치가 ON일 때만 설득 커맨드가 나옵니다. 0이면 조건 없음.
 * @default 0
 *
 * @param DefaultNeed
 * @text 기본 필요 설득 횟수
 * @type number
 * @min 1
 * @desc 적마다 따로 지정하지 않았을 때, 이 횟수만큼 설득하면 설득 완료입니다.
 * @default 3
 *
 * @param PointsPerTry
 * @text 설득 1회당 누적 점수
 * @type number
 * @min 1
 * @desc 설득할 때마다 쌓이는 수치입니다. (보통 1)
 * @default 1
 *
 * @param Speakers
 * @text 대사 하는 사람
 * @type select
 * @option 설득한 파티원만
 * @value acting
 * @option 살아있는 파티원 전원 (동시에, 각자 다른 대사)
 * @value party
 * @desc 설득할 때 누가 말풍선 대사를 할지 정합니다.
 * @default acting
 *
 * @param BalloonOffsetX
 * @text 말풍선 X 위치 보정
 * @type string
 * @desc 비워두면 BattleActorTalk 기본 위치 그대로. 숫자(예: 40, -30)를
 * 적으면 설득 대사 말풍선만 그만큼 좌우로 옮깁니다.
 * @default
 *
 * @param DefaultLines
 * @text 기본 설득 대사
 * @type string[]
 * @desc 액터에 <설득대사: ...> 노트태그가 없을 때 쓰는 대사들입니다. (랜덤)
 * @default ["우리 싸울 필요 없잖아!","얘기 좀 하자.","제발 진정해!","일단 무기부터 내려놓자.","우리도 싸우고 싶지 않아.","잠깐만, 내 말 좀 들어봐!"]
 *
 * @param DefaultFinishLines
 * @text 기본 설득 마무리 대사
 * @type string[]
 * @desc 설득이 완료되는 마지막 한 번에 나오는 대사들입니다.
 * 액터에 <설득마무리: ...> 노트태그가 없을 때 쓰입니다.
 * @default ["이제 알겠지? 그만하자."]
 *
 * @param ActorLines
 * @text 액터별 설득 대사
 * @type struct<ActorLine>[]
 * @desc 액터마다 다른 대사를 여기서 바로 적습니다. (액터 메모 노트태그가
 * 있으면 노트태그가 우선, 여기 없는 액터만 기본 대사를 씁니다.)
 * @default []
 *
 * @param LockMode
 * @text 공격/스킬 막기
 * @type select
 * @option 막지 않음
 * @value off
 * @option 설득을 시작한 뒤부터 (이번 전투에서 한 번이라도 설득하면)
 * @value started
 * @option 설득할 수 있는 적이 있는 동안 항상
 * @value always
 * @desc 설득 중에 "공격"과 "스킬" 커맨드를 막습니다. 설득할 수 있는 적이
 * 더 이상 없으면(전부 설득 완료/설득 불가 적만 남음) 자동으로 풀립니다.
 * @default always
 *
 * @param LockStyle
 * @text 막는 방식
 * @type select
 * @option 회색으로 표시 (선택 불가)
 * @value disable
 * @option 아예 숨김
 * @value hide
 * @default disable
 *
 * @param SkillId
 * @text 설득용 스킬 ID (선택)
 * @type skill
 * @desc 0이면 플러그인이 보이지 않는 스킬을 자동으로 만들어 씁니다.
 * 설득 때 애니메이션/속도 등을 직접 꾸미고 싶다면 범위 "적 1명"인
 * 스킬을 만들어 번호를 넣으세요. (데미지/효과는 무시됩니다.)
 * @default 0
 *
 * @param ProgressLabel
 * @text 진행도 표시 문구
 * @type string
 * @desc 설득할 때 적 위에 뜨는 문구입니다. 뒤에 "1/3" 같은 숫자가 붙습니다.
 * @default 설득
 *
 * @param DoneText
 * @text 설득 완료 문구
 * @type string
 * @desc 설득이 완료되면 적 위에 뜨는 문구입니다.
 * @default 설득 성공!
 *
 * @param PopupFontSize
 * @text 문구 글자 크기
 * @type number
 * @min 8
 * @default 22
 *
 * @param TryAnimationId
 * @text 설득 시 적 애니메이션
 * @type animation
 * @desc 설득할 때마다 적에게 재생할 애니메이션. 0이면 없음.
 * @default 0
 *
 * @param DoneAnimationId
 * @text 설득 완료 시 적 애니메이션
 * @type animation
 * @desc 설득이 완료되는 순간 적에게 재생할 애니메이션. 0이면 없음.
 * @default 0
 *
 * @param PersuadedGray
 * @text 설득된 적 회색조 정도
 * @type number
 * @min 0
 * @max 255
 * @desc 설득이 끝난 적을 얼마나 흐리게(회색) 보여줄지. 0이면 변화 없음.
 * @default 120
 *
 * @param VictoryOnAllPersuaded
 * @text 전원 설득 시 승리
 * @type boolean
 * @on 승리 처리
 * @off 그대로 계속
 * @desc 살아있는 적이 전부 설득 완료 상태가 되면 전투를 승리로 끝냅니다.
 * @default true
 *
 * @param RewardPersuaded
 * @text 설득한 적도 보상 지급
 * @type boolean
 * @on 지급
 * @off 안 줌
 * @desc 전투가 끝날 때 설득된 적의 경험치/골드/드롭 아이템도 받습니다.
 * @default true
 *
 * @param CountVariable
 * @text 설득 수 저장 변수
 * @type variable
 * @desc 이번 전투에서 설득에 성공한 적의 수를 이 변수에 저장합니다.
 * 전투 시작 때 0으로 초기화됩니다. 0이면 사용 안 함.
 * @default 0
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * 전투 중 액터 커맨드 창에 "설득" 칸이 생깁니다. (공격 바로 아래)
 *   1) 설득을 고르고 적 한 명을 선택합니다.
 *   2) 행동이 실행되면 그 적의 설득 횟수가 1 오릅니다.
 *      - 설득한 파티원이 자기 대사를 말풍선으로 말합니다.
 *      - 적 위에 "설득 1/3" 처럼 진행도가 잠깐 뜹니다.
 *   3) 필요 횟수에 도달하면 설득 완료!
 *      - 그 적은 더 이상 아무 행동도 하지 않습니다. (공격 안 함)
 *      - 설득이 끝난 적은 회색으로 보이고, 다시 설득 대상으로 고를 수 없습니다.
 *   4) 살아있는 적이 전부 설득되면 전투가 승리로 끝납니다. (옵션)
 *      설득이 안 되는 적(보스 등)이 남아있으면 전투는 계속됩니다.
 *
 * 설득 중 "공격/스킬 막기" (파라미터)
 *   - 항상(기본): 설득할 수 있는 적이 있는 동안 전투 시작부터 공격과 스킬이
 *     막힙니다. (설득/방어/아이템/도망 등은 그대로)
 *   - 설득을 시작한 뒤부터: 이번 전투에서 한 번이라도 설득을 하면 그때부터 막힙니다.
 *   - 설득할 수 있는 적이 없어지면(전부 설득 완료, 또는 설득불가 적만 남음)
 *     자동으로 다시 풀립니다.
 *   - 막는 방식은 "회색(선택 불가)" 또는 "숨김" 중에서 고릅니다.
 *
 * 설득은 스킬처럼 "행동"이므로 턴을 하나 씁니다. 별도의 데이터베이스 작업은
 * 필요 없습니다. (설득용 스킬은 플러그인이 자동으로 만들어 씁니다.)
 *
 * ============================================================================
 * 액터 노트태그 (파티원마다 다른 대사)
 * ============================================================================
 * 데이터베이스 > 액터 > 메모 칸에 적습니다.
 *
 *   <설득대사: 대사1 | 대사2 | 대사3>
 *       설득할 때마다 이 중 하나가 랜덤으로 나옵니다. (같은 대사가 연속으로
 *       나오지 않게 해줍니다.) 이 태그를 여러 줄 써도 됩니다.
 *
 *   <설득마무리: 대사1 | 대사2>
 *       설득이 완료되는 "마지막 한 번"에 나오는 대사입니다. 없으면 위의
 *       설득대사가 대신 나옵니다.
 *
 *   예)
 *     <설득대사: 거기 잠깐! 얘기 좀 하자고. | 우리가 왜 싸워야 해?>
 *     <설득마무리: 그래, 그렇게 얘기하니까 좋잖아!>
 *
 * ★ 적마다 다른 대사 (액터 × 적 조합)
 *   - 적 메모에: <설득대사 3: 대사1 | 대사2>   (3번 액터가 이 적을 설득할 때)
 *                <설득마무리 3: 대사>           (3번 액터가 이 적을 마지막으로 설득할 때)
 *   - 또는 파라미터 "액터별 설득 대사"에서 액터 + "적"(여러 명 가능)을 함께
 *     골라 적습니다.
 *   우선순위: 이 적 전용 > 그 액터의 일반 대사 > 기본 대사.
 *   적 전용 대사가 없는 조합은 자동으로 그 액터의 일반 대사가 나옵니다.
 *   (마무리 때는 이 적 전용 마무리 → 이 적 전용 일반 → 액터 마무리 → 액터 일반 순)
 *
 * ★ 노트태그 대신 플러그인 파라미터 "액터별 설득 대사"에서 액터를 골라
 *   대사를 적어도 똑같이 동작합니다. (노트태그가 있으면 노트태그가 우선)
 *
 * 둘 다 없는 액터는 "기본 설득 대사"를 씁니다. 이때도 액터마다 시작 위치를
 * 달리해서 같은 라운드에 서로 다른 대사가 나오도록 해주지만, 진짜 개성 있는
 * 대사를 원하면 액터마다 직접 적어주세요.
 * ※ 대사 안에는 | 와 > 기호를 쓸 수 없습니다. 줄바꿈은 \n 입니다.
 * ※ 영어 태그명도 됩니다: <PersuadeLine: ...>, <PersuadeFinish: ...>
 *
 * ============================================================================
 * 적 노트태그
 * ============================================================================
 *   <설득횟수: 5>     이 적은 5번 설득해야 완료됩니다. (기본값은 파라미터)
 *   <설득불가>        이 적은 설득할 수 없습니다. (보스 등)
 *   영어: <PersuadeNeed: 5>, <Unpersuadable>
 *
 * ============================================================================
 * 플러그인 커맨드
 * ============================================================================
 *   설득 켜기      설득 커맨드를 켭니다.    (영어: Persuade on)
 *   설득 끄기      설득 커맨드를 끕니다.    (영어: Persuade off)
 *
 * ============================================================================
 * 플러그인 순서 (중요)
 * ============================================================================
 * - YEP_BattleEngineCore, BattleCommandRestrict 보다 "아래"에 두세요.
 *   (BattleCommandRestrict 위에 두면 설득 칸이 지워집니다.)
 * - 대사 말풍선은 BattleActorTalk.js 를 이용합니다. BattleActorTalk 보다
 *   "아래"에 두세요. 없으면 말풍선 대신 전투 로그에 대사가 한 줄 나옵니다.
 *
 * ============================================================================
 * 번역(Translations.json) 참고
 * ============================================================================
 * - 말풍선 대사는 BattleActorTalk의 번역 방식 그대로입니다. 대사 원문을
 *   "msg"에 등록하세요. (기본 대사를 쓰면 그 문장들도 등록)
 * - "설득" 커맨드 이름, "설득", "설득 성공!" 문구는 drawText로 그려지므로
 *   "custom"에 등록하세요.
 *
 * 자유롭게 사용, 수정하실 수 있습니다.
 */

/*~struct~ActorLine:
 * @param Actor
 * @text 액터
 * @type actor
 * @desc 이 대사를 말할 액터
 * @default 1
 *
 * @param Enemies
 * @text 적 (여러 명 선택 가능)
 * @type enemy[]
 * @desc 비워두면 어떤 적에게든 쓰는 일반 대사입니다. 적을 고르면 "고른 적들을
 * 설득할 때만" 나오는 대사가 됩니다. (같은 액터를 여러 줄 만들어 적마다 다르게 적으세요)
 * @default []
 *
 * @param Lines
 * @text 설득 대사 (랜덤)
 * @type string[]
 * @desc 설득할 때마다 이 중 하나가 나옵니다. (대사 안에 | 와 > 는 쓰지 마세요)
 * @default []
 *
 * @param FinishLines
 * @text 설득 마무리 대사 (랜덤)
 * @type string[]
 * @desc 설득이 완료되는 마지막 한 번에 나옵니다. 비우면 위 설득 대사가 대신 나옵니다.
 * @default []
 */

var Imported = Imported || {};
Imported.Persuade = true;

var Persuade = Persuade || {};

(function () {
  'use strict';

  //---------------------------------------------------------------------------
  // 파라미터
  //---------------------------------------------------------------------------
  function toList(value) {
    if (Array.isArray(value)) return value;
    var s = String(value === undefined || value === null ? '' : value).trim();
    if (!s) return [];
    if (s.charAt(0) === '[') {
      try {
        var arr = JSON.parse(s);
        if (Array.isArray(arr)) return arr;
      } catch (e) {
        // 아래 콤마 분리로 넘어갑니다.
      }
    }
    return s.split(',').map(function (v) {
      return v.trim();
    });
  }

  function num(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    var n = Number(value);
    return isFinite(n) ? n : fallback;
  }

  function cleanLines(list) {
    return toList(list)
      .map(function (v) {
        return String(v).trim();
      })
      .filter(function (v) {
        return v.length > 0;
      });
  }

  var parameters = PluginManager.parameters('Persuade');
  var params = {
    commandName: String(parameters['CommandName'] || '설득'),
    enabled: String(parameters['Enabled'] || 'true') === 'true',
    enableSwitch: num(parameters['EnableSwitch'], 0),
    defaultNeed: Math.max(1, num(parameters['DefaultNeed'], 3)),
    points: Math.max(1, num(parameters['PointsPerTry'], 1)),
    speakers: String(parameters['Speakers'] || 'acting'),
    balloonOffsetX: String(
      parameters['BalloonOffsetX'] === undefined ? '' : parameters['BalloonOffsetX'],
    ).trim(),
    defaultLines: cleanLines(parameters['DefaultLines']),
    defaultFinishLines: cleanLines(parameters['DefaultFinishLines']),
    actorLines: {},
    lockMode: String(parameters['LockMode'] || 'always'),
    lockStyle: String(parameters['LockStyle'] || 'disable'),
    skillId: num(parameters['SkillId'], 0),
    progressLabel: String(parameters['ProgressLabel'] || '설득'),
    doneText: String(parameters['DoneText'] || '설득 성공!'),
    popupFontSize: Math.max(8, num(parameters['PopupFontSize'], 22)),
    tryAnimationId: num(parameters['TryAnimationId'], 0),
    doneAnimationId: num(parameters['DoneAnimationId'], 0),
    gray: Math.max(0, Math.min(255, num(parameters['PersuadedGray'], 120))),
    victoryOnAll: String(parameters['VictoryOnAllPersuaded'] || 'true') === 'true',
    rewardPersuaded: String(parameters['RewardPersuaded'] || 'true') === 'true',
    countVariable: num(parameters['CountVariable'], 0),
  };

  // 액터별 대사 (struct 배열은 JSON 문자열이 중첩되어 있어서 따로 풀어줍니다)
  toList(parameters['ActorLines']).forEach(function (item) {
    var r = item;
    if (typeof r === 'string') {
      try {
        r = JSON.parse(r);
      } catch (e) {
        return;
      }
    }
    if (!r) return;
    var id = num(r.Actor, 0);
    if (id <= 0) return;
    if (!params.actorLines[id]) params.actorLines[id] = [];
    // 예전 버전의 단일 "Enemy" 값도 그대로 인식합니다.
    var enemyIds = toList(r.Enemies)
      .concat(r.Enemy !== undefined ? [r.Enemy] : [])
      .map(function (v) {
        return num(v, 0);
      })
      .filter(function (v) {
        return v > 0;
      });
    params.actorLines[id].push({
      enemies: enemyIds,
      lines: cleanLines(r.Lines),
      finish: cleanLines(r.FinishLines),
    });
  });

  // 같은 (액터, 적) 조합에 해당하는 항목들의 대사를 하나로 합칩니다.
  function paramLines(actorId, enemyId) {
    var result = { lines: [], finish: [] };
    (params.actorLines[actorId] || []).forEach(function (entry) {
      // enemyId 0 = 일반 대사(적을 지정하지 않은 항목), 그 외 = 해당 적이 포함된 항목
      var match =
        enemyId === 0 ? entry.enemies.length === 0 : entry.enemies.indexOf(enemyId) >= 0;
      if (!match) return;
      result.lines = result.lines.concat(entry.lines);
      result.finish = result.finish.concat(entry.finish);
    });
    return result;
  }

  //---------------------------------------------------------------------------
  // 설득용 스킬 (SkillId 가 0이면 자동 생성)
  //---------------------------------------------------------------------------
  Persuade._virtualSkillId = 0;
  Persuade._patchedSkills = null;
  Persuade._selecting = false;
  Persuade._rewarding = false;
  Persuade._persuadedCount = 0;
  Persuade._last = {};

  Persuade.skillId = function () {
    return params.skillId > 0 ? params.skillId : Persuade._virtualSkillId;
  };

  function makeVirtualSkill(id) {
    return {
      id: id,
      name: params.commandName,
      iconIndex: 0,
      description: '',
      stypeId: 0,
      scope: 1, // 적 1명
      mpCost: 0,
      tpCost: 0,
      occasion: 1, // 전투 중에만
      speed: 0,
      successRate: 100,
      repeats: 1,
      tpGain: 0,
      hitType: 0, // 필중
      animationId: 0,
      damage: {
        type: 0,
        elementId: 0,
        formula: '0',
        variance: 20,
        critical: false,
      },
      effects: [],
      message1: '',
      message2: '',
      requiredWtypeId1: 0,
      requiredWtypeId2: 0,
      note: '',
      meta: {},
    };
  }

  // YEP 같은 플러그인이 스킬 노트태그를 처리하기 "전에" 넣어야 하므로
  // onLoad 시점에 추가합니다.
  var _DataManager_onLoad = DataManager.onLoad;
  DataManager.onLoad = function (object) {
    _DataManager_onLoad.call(this, object);
    if (
      params.skillId <= 0 &&
      object === window.$dataSkills &&
      Persuade._patchedSkills !== object
    ) {
      Persuade._patchedSkills = object;
      var id = object.length;
      object.push(makeVirtualSkill(id));
      Persuade._virtualSkillId = id;
    }
  };

  //---------------------------------------------------------------------------
  // 상태 확인
  //---------------------------------------------------------------------------
  Persuade.isEnabled = function () {
    if (!$gameSystem) return false;
    var on =
      $gameSystem._persuadeOn === undefined
        ? params.enabled
        : !!$gameSystem._persuadeOn;
    if (!on) return false;
    if (params.enableSwitch > 0 && !$gameSwitches.value(params.enableSwitch)) {
      return false;
    }
    return true;
  };

  Persuade.canUse = function (actor) {
    if (!actor || !actor.canMove()) return false;
    return $gameTroop.aliveMembers().some(function (enemy) {
      return enemy.isPersuadable() && !enemy.isPersuaded();
    });
  };

  // 아직 설득할 수 있는 적(설득 가능 + 설득 미완료)이 있는지
  Persuade.hasTarget = function () {
    return $gameTroop.aliveMembers().some(function (enemy) {
      return enemy.isPersuadable() && !enemy.isPersuaded();
    });
  };

  // 지금 "공격"/"스킬"을 막아야 하는지
  Persuade.isLocked = function () {
    if (params.lockMode === 'off') return false;
    if (!Persuade.isEnabled() || Persuade.skillId() <= 0) return false;
    if (params.lockMode === 'started' && !Persuade._started) return false;
    return Persuade.hasTarget();
  };

  Persuade.allPersuaded = function () {
    var alive = $gameTroop.aliveMembers();
    if (alive.length === 0) return false;
    return alive.every(function (enemy) {
      return enemy.isPersuaded();
    });
  };

  Persuade.hasBalloon = function () {
    return !!(
      Imported.BattleActorTalk &&
      window.BAT &&
      BAT.Controller &&
      typeof BAT.Controller._beginQueue === 'function' &&
      typeof BAT.Controller.parseCommand === 'function'
    );
  };

  Persuade.isBalloonRunning = function () {
    return Persuade.hasBalloon() && BAT.Controller.isRunning();
  };

  //---------------------------------------------------------------------------
  // Game_Enemy
  //---------------------------------------------------------------------------
  Game_Enemy.prototype.isPersuaded = function () {
    return !!this._persuaded;
  };

  Game_Enemy.prototype.isPersuadable = function () {
    if (!this.isAlive()) return false;
    var note = (this.enemy() && this.enemy().note) || '';
    return !/<(?:설득불가|Unpersuadable)\s*>/i.test(note);
  };

  Game_Enemy.prototype.persuadeNeed = function () {
    var note = (this.enemy() && this.enemy().note) || '';
    var m = /<(?:설득횟수|PersuadeNeed)\s*:\s*(\d+)\s*>/i.exec(note);
    if (m) return Math.max(1, Number(m[1]));
    return params.defaultNeed;
  };

  // 설득이 끝난 적은 행동하지 않습니다.
  var _Game_Enemy_canMove = Game_Enemy.prototype.canMove;
  Game_Enemy.prototype.canMove = function () {
    if (this._persuaded) return false;
    return _Game_Enemy_canMove.call(this);
  };

  var _Game_Enemy_makeActions = Game_Enemy.prototype.makeActions;
  Game_Enemy.prototype.makeActions = function () {
    _Game_Enemy_makeActions.call(this);
    if (this._persuaded) this.clearActions();
  };

  //---------------------------------------------------------------------------
  // 대사 고르기
  //---------------------------------------------------------------------------
  function collectTags(note, tagNames) {
    var re = new RegExp('<(?:' + tagNames + ')\\s*:\\s*([^>]*)>', 'gi');
    var result = [];
    var m;
    while ((m = re.exec(note || '')) !== null) {
      m[1].split('|').forEach(function (s) {
        s = s.trim();
        if (s) result.push(s);
      });
    }
    return result;
  }

  // 적 메모에 적는 "액터 번호가 붙은" 태그: <설득대사 3: 대사 | 대사>
  function collectActorTags(note, tagNames, actorId) {
    var re = new RegExp('<(?:' + tagNames + ')\\s+' + actorId + '\\s*:\\s*([^>]*)>', 'gi');
    var result = [];
    var m;
    while ((m = re.exec(note || '')) !== null) {
      m[1].split('|').forEach(function (s) {
        s = s.trim();
        if (s) result.push(s);
      });
    }
    return result;
  }

  // 대사 목록과 "공용 기본 대사인지" 여부를 돌려줍니다.
  // 우선순위(위일수록 먼저):
  //   1) 이 적 전용 대사  - 적 메모 <설득대사 액터번호: ...> / 파라미터에서 적을 고른 항목
  //   2) 이 액터의 일반 대사 - 액터 메모 <설득대사: ...> / 파라미터(적 0)
  //   3) 기본 대사 (공용)
  // 설득이 완료되는 마지막 한 번은 같은 순서로 "마무리" 대사를 먼저 찾습니다.
  Persuade.lineSource = function (actor, finishing, enemy) {
    var aid = actor.actorId();
    var actorNote = (actor.actor() && actor.actor().note) || '';
    var enemyNote = (enemy && enemy.enemy() && enemy.enemy().note) || '';
    var enemyId = enemy ? enemy.enemyId() : 0;

    // 이 적 전용
    var sNormal = enemy ? collectActorTags(enemyNote, '설득대사|PersuadeLine', aid) : [];
    var sFinish = enemy ? collectActorTags(enemyNote, '설득마무리|PersuadeFinish', aid) : [];
    if (enemyId > 0) {
      var sp = paramLines(aid, enemyId);
      if (sNormal.length === 0) sNormal = sp.lines;
      if (sFinish.length === 0) sFinish = sp.finish;
    }

    // 이 액터의 일반 대사
    var gp = paramLines(aid, 0);
    var tagNormal = collectTags(actorNote, '설득대사|PersuadeLine');
    var tagFinish = collectTags(actorNote, '설득마무리|PersuadeFinish');
    var gNormal = tagNormal.length > 0 ? tagNormal : gp.lines;
    var gFinish = tagFinish.length > 0 ? tagFinish : gp.finish;

    var order = finishing ? [sFinish, sNormal, gFinish, gNormal] : [sNormal, gNormal];
    for (var i = 0; i < order.length; i++) {
      if (order[i].length > 0) return { lines: order[i], shared: false };
    }
    if (finishing && params.defaultFinishLines.length > 0) {
      return { lines: params.defaultFinishLines, shared: true };
    }
    return { lines: params.defaultLines, shared: true };
  };

  Persuade.linesFor = function (actor, finishing, enemy) {
    return Persuade.lineSource(actor, finishing, enemy).lines;
  };

  Persuade.pickLine = function (actor, finishing, enemy) {
    var source = Persuade.lineSource(actor, finishing, enemy);
    var lines = source.lines;
    if (lines.length === 0) return '';

    var key = actor.actorId() + ':' + (enemy ? enemy.enemyId() : 0) + (finishing ? ':f' : ':n');
    var last = Persuade._last[key];
    var index;

    if (source.shared) {
      // 공용 대사: 액터마다 시작 위치를 다르게 두고 차례로 돌려서,
      // 같은 라운드에 서로 다른 대사가 나오게 합니다.
      index = last === undefined ? (actor.actorId() - 1) % lines.length : (last + 1) % lines.length;
    } else {
      index = Math.floor(Math.random() * lines.length);
      if (lines.length > 1 && index === last) {
        index = (index + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length;
      }
    }
    Persuade._last[key] = index;
    return lines[index];
  };

  //---------------------------------------------------------------------------
  // 대사 출력 (BattleActorTalk 말풍선, 없으면 전투 로그)
  //---------------------------------------------------------------------------
  Persuade.say = function (actor, finishing, enemy) {
    var members = $gameParty.battleMembers();
    var speakers =
      params.speakers === 'party'
        ? members.filter(function (m) {
            return m && m.isAlive();
          })
        : [actor];

    var parts = [];
    var logLines = [];
    speakers.forEach(function (member) {
      var text = Persuade.pickLine(member, finishing, enemy);
      if (!text) return;
      var slot = members.indexOf(member) + 1;
      if (slot > 0) parts.push(slot + ':' + text);
      logLines.push({ name: member.name(), text: text });
    });
    if (parts.length === 0) return;

    var logWindow = BattleManager._logWindow;

    if (Persuade.hasBalloon()) {
      var controller = BAT.Controller;
      controller.clear();
      if (BAT.Auto) {
        BAT.Auto._steps = [];
        BAT.Auto._conversationActive = false;
        BAT.Auto._lockedState = null;
      }

      var raw = params.speakers === 'party' ? '동시 ' : '순차 ';
      if (params.balloonOffsetX !== '' && isFinite(Number(params.balloonOffsetX))) {
        raw += '오프셋' + Number(params.balloonOffsetX) + ' ';
      }
      raw += parts.join(' | ');

      controller._beginQueue(controller.parseCommand(raw));
      // 말풍선이 끝날 때까지 전투 진행을 잠깐 기다립니다.
      if (logWindow) logWindow.push('waitForPersuade');
    } else if (logWindow) {
      logLines.forEach(function (entry) {
        logWindow.push('addText', entry.name + ': ' + entry.text);
      });
    }
  };

  var _Window_BattleLog_updateWaitMode = Window_BattleLog.prototype.updateWaitMode;
  Window_BattleLog.prototype.updateWaitMode = function () {
    if (this._waitMode === 'persuade') {
      this._persuadeWait = (this._persuadeWait || 0) - 1;
      var waiting = this._persuadeWait > 0 && Persuade.isBalloonRunning();
      if (!waiting) this._waitMode = '';
      return waiting;
    }
    return _Window_BattleLog_updateWaitMode.call(this);
  };

  Window_BattleLog.prototype.waitForPersuade = function () {
    this._waitMode = 'persuade';
    this._persuadeWait = 420; // 안전장치 (약 7초)
  };

  //---------------------------------------------------------------------------
  // 설득 실행
  //---------------------------------------------------------------------------
  Persuade.persuade = function (actor, enemy) {
    if (!enemy || !enemy.isAlive() || enemy.isPersuaded() || !enemy.isPersuadable()) {
      return;
    }

    Persuade._started = true;
    enemy._persuadeCount = (enemy._persuadeCount || 0) + params.points;
    var need = enemy.persuadeNeed();
    var done = enemy._persuadeCount >= need;
    if (done) enemy._persuadeCount = need;

    Persuade.say(actor, done, enemy);

    enemy._persuadePopup = { count: enemy._persuadeCount, need: need, done: done };

    if (done) {
      enemy._persuaded = true;
      enemy.clearActions();
      Persuade._persuadedCount++;
      if (params.countVariable > 0) {
        $gameVariables.setValue(params.countVariable, Persuade._persuadedCount);
      }
      enemy.requestEffect('whiten');
      if (params.doneAnimationId > 0) enemy.startAnimation(params.doneAnimationId, false, 0);
    } else if (params.tryAnimationId > 0) {
      enemy.startAnimation(params.tryAnimationId, false, 0);
    }
  };

  var _Game_Action_apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function (target) {
    var item = this._item;
    var isPersuade =
      item &&
      item.isSkill() &&
      Persuade.skillId() > 0 &&
      item.itemId() === Persuade.skillId() &&
      this.subject().isActor();

    if (!isPersuade) {
      _Game_Action_apply.call(this, target);
      return;
    }

    // 설득: 데미지/효과 없이 "성공"으로만 처리합니다.
    var result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = true;
    result.missed = false;
    result.evaded = false;
    result.success = true;

    if (target.isEnemy()) Persuade.persuade(this.subject(), target);
  };

  //---------------------------------------------------------------------------
  // 전투 흐름: 전원 설득 시 승리 / 보상
  //---------------------------------------------------------------------------
  var _BattleManager_setup = BattleManager.setup;
  BattleManager.setup = function (troopId, canEscape, canLose) {
    _BattleManager_setup.call(this, troopId, canEscape, canLose);
    Persuade._last = {};
    Persuade._selecting = false;
    Persuade._started = false;
    Persuade._persuadedCount = 0;
    if (params.countVariable > 0) $gameVariables.setValue(params.countVariable, 0);
  };

  var _BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
  BattleManager.checkBattleEnd = function () {
    if (_BattleManager_checkBattleEnd.call(this)) return true;
    if (
      params.victoryOnAll &&
      (this._phase === 'turn' || this._phase === 'turnEnd') &&
      !$gameParty.isAllDead() &&
      Persuade.allPersuaded()
    ) {
      this.processVictory();
      return true;
    }
    return false;
  };

  var _BattleManager_makeRewards = BattleManager.makeRewards;
  BattleManager.makeRewards = function () {
    Persuade._rewarding = params.rewardPersuaded;
    try {
      _BattleManager_makeRewards.call(this);
    } finally {
      Persuade._rewarding = false;
    }
  };

  var _Game_Troop_deadMembers = Game_Troop.prototype.deadMembers;
  Game_Troop.prototype.deadMembers = function () {
    var list = _Game_Troop_deadMembers.call(this);
    if (Persuade._rewarding) {
      list = list.concat(
        this.members().filter(function (enemy) {
          return enemy.isAlive() && enemy.isPersuaded();
        }),
      );
    }
    return list;
  };

  //---------------------------------------------------------------------------
  // Window_ActorCommand : "설득" 칸 추가 (공격 바로 아래)
  //---------------------------------------------------------------------------
  var _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
  Window_ActorCommand.prototype.makeCommandList = function () {
    _Window_ActorCommand_makeCommandList.call(this);
    if (this._actor && Persuade.isEnabled() && Persuade.skillId() > 0) {
      this.addPersuadeCommand();
      this.applyPersuadeLock();
    }
  };

  // 설득 중에는 "공격"과 "스킬"을 막습니다.
  Window_ActorCommand.prototype.applyPersuadeLock = function () {
    if (!Persuade.isLocked()) return;
    if (params.lockStyle === 'hide') {
      this._list = this._list.filter(function (cmd) {
        return cmd.symbol !== 'attack' && cmd.symbol !== 'skill';
      });
    } else {
      this._list.forEach(function (cmd) {
        if (cmd.symbol === 'attack' || cmd.symbol === 'skill') cmd.enabled = false;
      });
    }
  };

  // 커서가 막힌(회색) 칸에서 시작하지 않도록 첫 번째로 선택 가능한 칸으로 옮깁니다.
  var _Window_ActorCommand_setup = Window_ActorCommand.prototype.setup;
  Window_ActorCommand.prototype.setup = function (actor) {
    _Window_ActorCommand_setup.call(this, actor);
    if (this._actor && Persuade.isLocked() && !this.isCurrentItemEnabled()) {
      for (var i = 0; i < this._list.length; i++) {
        if (this._list[i].enabled) {
          this.select(i);
          break;
        }
      }
    }
  };

  Window_ActorCommand.prototype.addPersuadeCommand = function () {
    var cmd = {
      name: params.commandName,
      symbol: 'persuade',
      enabled: Persuade.canUse(this._actor),
      ext: null,
    };

    var index = -1;
    var i;
    for (i = 0; i < this._list.length; i++) {
      if (this._list[i].symbol === 'attack') {
        index = i + 1;
        break;
      }
    }
    if (index < 0) {
      for (i = 0; i < this._list.length; i++) {
        if (this._list[i].symbol === 'party' || this._list[i].symbol === 'escape') {
          index = i;
          break;
        }
      }
    }

    if (index >= 0) {
      this._list.splice(index, 0, cmd);
    } else {
      this._list.push(cmd);
    }
  };

  //---------------------------------------------------------------------------
  // Window_BattleEnemy : 설득 대상 선택 중에는 설득 불가/완료 적을 고를 수 없음
  //---------------------------------------------------------------------------
  var _Window_BattleEnemy_isCurrentItemEnabled =
    Window_BattleEnemy.prototype.isCurrentItemEnabled;
  Window_BattleEnemy.prototype.isCurrentItemEnabled = function () {
    if (Persuade._selecting) {
      var enemy = this.enemy();
      if (!enemy || !enemy.isPersuadable() || enemy.isPersuaded()) return false;
    }
    return _Window_BattleEnemy_isCurrentItemEnabled.call(this);
  };

  //---------------------------------------------------------------------------
  // Scene_Battle
  //---------------------------------------------------------------------------
  var _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
  Scene_Battle.prototype.createActorCommandWindow = function () {
    _Scene_Battle_createActorCommandWindow.call(this);
    this._actorCommandWindow.setHandler('persuade', this.commandPersuade.bind(this));
  };

  Scene_Battle.prototype.commandPersuade = function () {
    var action = BattleManager.inputtingAction();
    action.setSkill(Persuade.skillId());
    Persuade._selecting = true;
    this.selectEnemySelection();

    // 처음 커서가 설득할 수 없는 적에 놓이지 않도록 첫 번째 가능한 적으로 옮깁니다.
    var win = this._enemyWindow;
    if (win) {
      for (var i = 0; i < win.maxItems(); i++) {
        win.select(i);
        if (win.isCurrentItemEnabled()) break;
      }
    }
  };

  var _Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
  Scene_Battle.prototype.onEnemyOk = function () {
    Persuade._selecting = false;
    _Scene_Battle_onEnemyOk.call(this);
  };

  var _Scene_Battle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
  Scene_Battle.prototype.onEnemyCancel = function () {
    var symbol = this._actorCommandWindow.currentSymbol();
    Persuade._selecting = false;
    _Scene_Battle_onEnemyCancel.call(this);
    // 기본 코드는 공격/스킬/아이템만 되돌려 주므로 설득도 직접 처리합니다.
    if (symbol === 'persuade') this._actorCommandWindow.activate();
  };

  var _Scene_Battle_startActorCommandSelection =
    Scene_Battle.prototype.startActorCommandSelection;
  Scene_Battle.prototype.startActorCommandSelection = function () {
    Persuade._selecting = false;
    _Scene_Battle_startActorCommandSelection.call(this);
  };

  //---------------------------------------------------------------------------
  // Sprite_PersuadePopup : 적 위에 뜨는 "설득 1/3" 문구
  //---------------------------------------------------------------------------
  function Sprite_PersuadePopup() {
    this.initialize.apply(this, arguments);
  }

  Sprite_PersuadePopup.prototype = Object.create(Sprite.prototype);
  Sprite_PersuadePopup.prototype.constructor = Sprite_PersuadePopup;

  Sprite_PersuadePopup.prototype.initialize = function (target, info) {
    Sprite.prototype.initialize.call(this);
    this._count = 0;
    this._life = 90;
    this.bitmap = this.makeBitmap(info);
    this.anchor.x = 0.5;
    this.anchor.y = 1;

    var enemy = target._enemy;
    var enemyH = enemy && typeof enemy.spriteHeight === 'function' ? enemy.spriteHeight() : 0;
    var h = Math.max(enemyH || 0, target.height || 0, 60);

    var halfW = this.bitmap.width / 2;
    this.x = Math.round(Math.min(Math.max(target.x, halfW), Graphics.boxWidth - halfW));
    this.y = Math.max(Math.round(target.y - h - 4), this.bitmap.height);
  };

  Sprite_PersuadePopup.prototype.makeBitmap = function (info) {
    var fontFace = $gameSystem.mainFontFace ? $gameSystem.mainFontFace() : 'GameFont';
    var size = params.popupFontSize;

    var label = info.done ? params.doneText : params.progressLabel;
    var counter = info.done ? '' : info.count + '/' + info.need;

    var probe = new Bitmap(1, 1);
    probe.fontFace = fontFace;
    probe.fontSize = size;
    var labelW = Math.ceil(probe.measureTextWidth(label)) + 2;
    var counterW = counter ? Math.ceil(probe.measureTextWidth(counter)) + 2 : 0;
    var gap = counter ? 8 : 0;

    var pad = 8;
    var w = pad * 2 + labelW + gap + counterW;
    var h = size + pad * 2;

    var bitmap = new Bitmap(w, h);
    bitmap.fontFace = fontFace;
    bitmap.fontSize = size;
    bitmap.outlineColor = 'rgba(0, 0, 0, 0.85)';
    bitmap.outlineWidth = 5;

    bitmap.textColor = info.done ? '#ffd966' : '#ffffff';
    bitmap.drawText(label, pad, 0, labelW, h, 'left');
    if (counter) {
      bitmap.textColor = '#9fe0ff';
      bitmap.drawText(counter, pad + labelW + gap, 0, counterW, h, 'left');
    }
    return bitmap;
  };

  Sprite_PersuadePopup.prototype.update = function () {
    Sprite.prototype.update.call(this);
    this._count++;
    this.y -= 0.35;
    if (this._count > this._life - 25) this.opacity -= 10;
    if (this._count >= this._life && this.parent) {
      this.parent.removeChild(this);
    }
  };

  var _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function () {
    _Sprite_Enemy_update.call(this);
    if (this._enemy) this.updatePersuade();
  };

  Sprite_Enemy.prototype.updatePersuade = function () {
    var enemy = this._enemy;

    if (enemy._persuadePopup && this.parent) {
      var info = enemy._persuadePopup;
      enemy._persuadePopup = null;
      this.parent.addChild(new Sprite_PersuadePopup(this, info));
    }

    if (enemy.isPersuaded() && !this._persuadeToned && params.gray > 0) {
      this._persuadeToned = true;
      this.setColorTone([0, 0, 0, params.gray]);
    }
  };

  //---------------------------------------------------------------------------
  // 플러그인 커맨드
  //---------------------------------------------------------------------------
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command !== '설득' && command !== 'Persuade') return;
    var sub = String(args[0] || '').toLowerCase();
    if (sub === '켜기' || sub === 'on') {
      $gameSystem._persuadeOn = true;
    } else if (sub === '끄기' || sub === 'off') {
      $gameSystem._persuadeOn = false;
    }
  };
})();
