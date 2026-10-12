//=============================================================================
// BattleActorTalkAuto.js
//=============================================================================

/*:
 * @plugindesc (BattleActorTalk 확장) 특정 액터들이 전투에 같이 있으면 자동/랜덤으로 말풍선 대화를 띄웁니다.
 * @author ㄹㅅㅁ
 *
 * @param Enabled
 * @text 자동 대화 사용
 * @type boolean
 * @on 사용
 * @off 끔
 * @desc 기본 사용 여부. 게임 중에는 플러그인 커맨드로 켜고 끌 수 있습니다.
 * @default true
 *
 * @param DisableSwitch
 * @text 끄기 스위치
 * @type switch
 * @desc 이 스위치가 ON이면 자동 대화가 나오지 않습니다. (0 = 사용 안 함)
 * 이벤트 전투/컷신 전투에서 잠시 막고 싶을 때 쓰세요.
 * @default 0
 *
 * @param GlobalCooldown
 * @text 전체 쉬는 턴 수
 * @type number
 * @min 0
 * @desc 자동 대화가 한 번 나온 뒤, 이 턴 수만큼은 어떤 규칙도 나오지
 * 않습니다. 0이면 쉬는 턴 없음. (전투 시작 대화는 영향 없음)
 * @default 2
 *
 * @param StepGap
 * @text 단계 사이 간격(프레임)
 * @type number
 * @min 0
 * @desc 주고받는 여러 단계 대화에서, 한 단계가 끝나고 다음 단계가
 * 시작하기까지 쉬는 프레임 수. (60프레임 = 1초)
 * @default 15
 *
 * @param Rules
 * @text 자동 대화 규칙 목록
 * @type struct<TalkRule>[]
 * @desc 규칙 하나 = "이 액터들이 같이 있으면 이런 대화를 한다".
 * @default []
 *
 * @param Debug
 * @text 디버그 로그(F8)
 * @type boolean
 * @desc 켜면 규칙 판정 결과를 콘솔(F8)에 출력합니다.
 * @default false
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * BattleActorTalk.js 를 이용한 확장 플러그인입니다.
 * 전투 이벤트에 "액터대화" 커맨드를 일일이 넣고 조건분기를 만드는 대신,
 * 플러그인 파라미터에 "규칙"만 적어두면 전투 중 조건이 맞을 때
 * 자동으로 말풍선 대화를 띄워줍니다.
 *
 * ★ 반드시 BattleActorTalk.js 보다 "아래"에 두세요. (필수)
 *
 * ============================================================================
 * 규칙(Rule) 항목 설명
 * ============================================================================
 * 규칙 이름   : 구분용 이름. "한 번만" 기록에도 쓰이니 규칙마다 다르게 적고,
 *               나중에 바꾸지 않는 걸 권장합니다.
 * 필요 액터   : 여기 적힌 액터가 "전부" 전투 파티에 있고 살아있어야 발동.
 *               (데이터베이스 액터 ID 기준)
 * 필요 적     : (선택) 지정하면 그 적이 살아있을 때만 발동합니다.
 *               적마다 다른 대화를 하고 싶으면 규칙을 적별로 따로 만드세요.
 * 적 조건 방식: 필요 적이 여러 명일 때 "하나라도 있으면" / "전부 있어야"
 * 제외 적     : (선택) 지정한 적이 "하나라도" 살아있으면 이 규칙은 발동하지
 *               않습니다. 필요 적과 함께 써도 됩니다. (제외가 우선)
 *               예) 보스전에서는 일상 대화가 안 나오게 하고 싶을 때.
 * 우선순위    : 숫자가 큰 규칙부터 판정합니다. 특정 적 전용 규칙은 높게,
 *               일반 규칙은 낮게(0) 두면 전용 규칙이 먼저 나오고, 확률에서
 *               떨어지면 일반 규칙으로 넘어갑니다. 같은 우선순위끼리는 랜덤.
 * 대화 목록   : 한 줄 = 대화 한 세트. 여러 줄이면 그중 하나가 랜덤 선택됩니다.
 *               형식:  액터ID:대사 | 액터ID:대사
 *               예)    1:여기 있었네! | 3:늦었잖아.
 *               - 액터ID는 데이터베이스 번호입니다. 파티 순서와 무관하게
 *                 알아서 맞는 위치에 말풍선이 뜹니다.
 *               - "액터ID:"를 생략하면 필요 액터에게 앞에서부터 순서대로
 *                 배정됩니다.
 *               - "*:대사" 는 살아있는 파티원 중 랜덤한 한 명이 말합니다.
 *               - 한 단계에서 한 액터는 한 번만 말할 수 있습니다.
 *               - 대사 안 줄바꿈은 \n, 대사 구분은 | 입니다. (대사에 | 사용 불가)
 *
 *               ★ 주고받는 여러 단계 대화: // 로 단계를 나눕니다.
 *               예)  1:저거 봤어? // 3:응, 엄청 크네. // 1:조심하자.
 *               예)  1:어이! | 2:왔구나! // 3:...시끄러워. // *:하하하
 *               - 단계는 앞에서부터 하나씩 차례로 나옵니다.
 *               - 단계 맨 앞에 "동시 " 또는 "순차 " 를 붙이면 그 단계만
 *                 진행 방식을 바꿀 수 있습니다.
 *                 예)  동시 1:와! | 2:와! // 3:...시끄러워.
 *               - 중간에 말할 액터가 죽거나 빠지면 그 대사만 건너뜁니다.
 *               - 플레이어가 커맨드 입력을 끝내고 행동이 시작되면, 남은
 *                 단계는 취소됩니다.
 * 진행 방식   : 기본(BattleActorTalk 설정) / 순차 / 동시
 * 발동 시점   : 전투 시작 / 매 턴 / 둘 다
 * 확률(%)     : 조건이 맞았을 때 실제로 나올 확률. 100 = 무조건(자동),
 *               낮추면 랜덤. 규칙마다 따로 굴립니다.
 * 반복        : 조건이 맞을 때마다 / 전투당 1번 / 게임 전체에서 1번
 * 규칙 쉬는 턴: 이 규칙이 나온 뒤 몇 턴 동안 다시 안 나올지.
 * 필요 스위치 : 이 스위치가 ON일 때만 발동. (0 = 조건 없음)
 *
 * 여러 규칙이 동시에 조건을 만족하면 우선순위 순(같으면 랜덤)으로 확률을
 * 굴리고, 먼저 성공한 규칙 하나만 발동합니다. (한 턴에 대화는 최대 1세트)
 *
 * ============================================================================
 * 플러그인 커맨드
 * ============================================================================
 *   자동대화 켜기            자동 대화를 켭니다.
 *   자동대화 끄기            자동 대화를 끕니다.
 *   자동대화 실행            조건을 만족하는 규칙을 지금 바로 하나 발동합니다.
 *                            (시점/확률/쉬는 턴 무시, 조건만 확인)
 *   자동대화 실행 규칙이름   이름이 같은 규칙을 지정해서 발동합니다.
 *   자동대화 초기화          "게임 전체에서 1번" 기록을 지웁니다.
 *   (영어: AutoTalk on / off / run [name] / reset)
 *
 * ============================================================================
 * 참고
 * ============================================================================
 * - 이미 "액터대화" 커맨드로 말풍선이 진행 중이거나 대기 중이면 자동
 *   대화는 그 턴에 나오지 않습니다. (이벤트 대사가 우선)
 * - 말풍선이 뜨는 타이밍/위치/모양은 모두 BattleActorTalk 설정을 따릅니다.
 * - 번역을 쓴다면 대사 원문을 Translations.json의 "msg"에 등록하세요.
 *   (BattleActorTalk의 번역 기능이 그대로 적용됩니다.)
 *
 * 자유롭게 사용, 수정하실 수 있습니다.
 */

/*~struct~TalkRule:
 * @param Name
 * @text 규칙 이름
 * @type string
 * @desc 구분용 이름 (규칙마다 다르게). 예: 1번3번_재회
 * @default
 *
 * @param Enabled
 * @text 규칙 사용
 * @type boolean
 * @on 사용
 * @off 끔
 * @default true
 *
 * @param Actors
 * @text 필요 액터 (전원 함께 있어야 함)
 * @type actor[]
 * @desc 여기 선택한 액터가 전부 전투에 참가 중이고 살아있을 때 발동.
 * 비워두면 액터 조건 없음 (대사에 "액터ID:"나 "*:"를 직접 적으세요).
 * @default []
 *
 * @param Enemies
 * @text 필요 적 (선택)
 * @type enemy[]
 * @desc 지정하면 이 적이 전투에 살아있을 때만 발동합니다.
 * 비워두면 적 조건 없음.
 * @default []
 *
 * @param EnemyMatch
 * @text 적 조건 방식
 * @type select
 * @option 하나라도 있으면
 * @value any
 * @option 전부 있어야
 * @value all
 * @default any
 *
 * @param ExcludeEnemies
 * @text 제외 적 (선택)
 * @type enemy[]
 * @desc 지정한 적이 하나라도 전투에 살아있으면 발동하지 않습니다.
 * 비워두면 제외 조건 없음.
 * @default []
 *
 * @param Priority
 * @text 우선순위
 * @type number
 * @min -999
 * @max 999
 * @desc 숫자가 큰 규칙부터 판정합니다. 특정 적 전용 규칙은 높게,
 * 일반 규칙은 0으로 두세요.
 * @default 0
 *
 * @param Scripts
 * @text 대화 목록 (한 줄 = 한 세트, 랜덤 선택)
 * @type string[]
 * @desc 형식: 액터ID:대사 | 액터ID:대사  (*:대사 = 랜덤 파티원)
 * 단계 나누기: // 예) 1:저거 봤어? // 3:응, 엄청 크네.
 * @default []
 *
 * @param Mode
 * @text 진행 방식
 * @type select
 * @option 기본 (BattleActorTalk 설정)
 * @value default
 * @option 순차 (한 명씩)
 * @value sequential
 * @option 동시 (전부 한번에)
 * @value simultaneous
 * @default default
 *
 * @param Timing
 * @text 발동 시점
 * @type select
 * @option 전투 시작
 * @value start
 * @option 매 턴
 * @value turn
 * @option 전투 시작 + 매 턴
 * @value both
 * @default both
 *
 * @param Chance
 * @text 확률(%)
 * @type number
 * @min 0
 * @max 100
 * @desc 100 = 조건이 맞으면 무조건. 낮추면 랜덤.
 * @default 100
 *
 * @param Repeat
 * @text 반복
 * @type select
 * @option 조건 맞을 때마다
 * @value always
 * @option 전투당 1번
 * @value battle
 * @option 게임 전체에서 1번
 * @value game
 * @default always
 *
 * @param Cooldown
 * @text 규칙 쉬는 턴 수
 * @type number
 * @min 0
 * @desc 이 규칙이 나온 뒤 몇 턴 동안 다시 나오지 않을지. (전투 안에서만)
 * @default 3
 *
 * @param Switch
 * @text 필요 스위치
 * @type switch
 * @desc 이 스위치가 ON일 때만 발동. 0이면 조건 없음.
 * @default 0
 */

var Imported = Imported || {};
Imported.BattleActorTalkAuto = true;

var BAT = BAT || {};

(function () {
  'use strict';

  if (!Imported.BattleActorTalk || !BAT.Controller) {
    console.error(
      '[BattleActorTalkAuto] BattleActorTalk.js 가 먼저 로드되어야 합니다. ' +
        '플러그인 목록에서 BattleActorTalk 아래에 두세요.',
    );
    return;
  }

  //---------------------------------------------------------------------------
  // 파라미터 파싱 (struct / 배열은 문자열 JSON이 중첩되어 있어서 따로 풀어줍니다)
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

  function toObject(value) {
    if (value && typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  var parameters = PluginManager.parameters('BattleActorTalkAuto');

  var params = {
    enabled: String(parameters['Enabled'] || 'true') === 'true',
    disableSwitch: Number(parameters['DisableSwitch'] || 0),
    globalCooldown: Number(parameters['GlobalCooldown'] || 0),
    stepGap: Number(parameters['StepGap'] === undefined ? 15 : parameters['StepGap']),
    debug: String(parameters['Debug'] || 'false') === 'true',
    rules: [],
  };

  toList(parameters['Rules']).forEach(function (item, index) {
    var r = toObject(item);
    if (!r) return;

    var actors = toList(r.Actors)
      .map(function (v) {
        return Number(v);
      })
      .filter(function (v) {
        return v > 0;
      });

    var scripts = toList(r.Scripts)
      .map(function (v) {
        return String(v).trim();
      })
      .filter(function (v) {
        return v.length > 0;
      });

    var enemies = toList(r.Enemies)
      .map(function (v) {
        return Number(v);
      })
      .filter(function (v) {
        return v > 0;
      });

    var excludeEnemies = toList(r.ExcludeEnemies)
      .map(function (v) {
        return Number(v);
      })
      .filter(function (v) {
        return v > 0;
      });

    var name = String(r.Name || '').trim();

    params.rules.push({
      key: name || 'rule' + (index + 1),
      name: name,
      enabled: String(r.Enabled || 'true') === 'true',
      actors: actors,
      enemies: enemies,
      enemyMatch: String(r.EnemyMatch || 'any'),
      excludeEnemies: excludeEnemies,
      priority: Number(r.Priority || 0),
      scripts: scripts,
      mode: String(r.Mode || 'default'),
      timing: String(r.Timing || 'both'),
      chance: r.Chance === undefined || r.Chance === '' ? 100 : Number(r.Chance),
      repeat: String(r.Repeat || 'always'),
      cooldown: Number(r.Cooldown || 0),
      switchId: Number(r.Switch || 0),
    });
  });

  function log() {
    if (!params.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[BattleActorTalkAuto]');
    console.log.apply(console, args);
  }

  //---------------------------------------------------------------------------
  // BAT.Auto
  //---------------------------------------------------------------------------
  BAT.Auto = {
    _inputIndex: 0, // 이번 전투에서 입력 단계가 시작된 횟수 (1 = 전투 시작)
    _lastAnyIndex: null, // 마지막으로 자동 대화가 나온 입력 단계
    _battleSeen: {}, // 이번 전투에서 이미 나온 규칙
    _ruleLastIndex: {}, // 규칙별 마지막으로 나온 입력 단계
    _steps: [], // 아직 안 나온 다음 단계 커맨드들
    _stepWait: 0, // 다음 단계까지 남은 대기 프레임
    _lockedState: null, // 대화 도중 X 보정 판정을 고정해 두는 값 (null = 아직 안 정함)
    _conversationActive: false, // 자동 대화 진행 중 여부

    onBattleSetup: function () {
      this._inputIndex = 0;
      this._lastAnyIndex = null;
      this._battleSeen = {};
      this._ruleLastIndex = {};
      this._steps = [];
      this._stepWait = 0;
      this._lockedState = null;
      this._conversationActive = false;
    },

    isEnabled: function () {
      if (!$gameSystem) return false;
      var on =
        $gameSystem._batAutoEnabled === undefined
          ? params.enabled
          : !!$gameSystem._batAutoEnabled;
      if (!on) return false;
      if (params.disableSwitch > 0 && $gameSwitches.value(params.disableSwitch)) {
        return false;
      }
      return true;
    },

    setEnabled: function (value) {
      $gameSystem._batAutoEnabled = !!value;
      if (!value) this._steps = [];
    },

    resetSeen: function () {
      $gameSystem._batAutoSeen = {};
    },

    _gameSeen: function () {
      if (!$gameSystem._batAutoSeen) $gameSystem._batAutoSeen = {};
      return $gameSystem._batAutoSeen;
    },

    // 입력 단계가 시작될 때마다 호출됩니다.
    onInputStart: function () {
      this._inputIndex++;
      this._steps = []; // 지난 턴에서 남은 단계는 버립니다.
      var isStart = this._inputIndex === 1;

      if (!this.isEnabled()) return;
      if (!BattleManager.isInputting()) return;
      if (BAT.Controller.isRunning()) return; // 이벤트 대사가 우선

      if (!isStart && this._lastAnyIndex !== null) {
        if (this._inputIndex - this._lastAnyIndex <= params.globalCooldown) {
          log('전체 쉬는 턴 중');
          return;
        }
      }

      var candidates = params.rules.filter(function (rule) {
        if (isStart) return rule.timing === 'start' || rule.timing === 'both';
        return rule.timing === 'turn' || rule.timing === 'both';
      });

      this._tryRules(candidates, false);
    },

    // 플러그인 커맨드용: 시점/확률/쉬는 턴을 무시하고 바로 시도
    forceRun: function (ruleName) {
      if (!$gameParty.inBattle()) return;
      if (BAT.Controller.isRunning()) return;

      var candidates = params.rules.filter(function (rule) {
        return !ruleName || rule.name === ruleName;
      });
      this._steps = [];
      this._tryRules(candidates, true);
    },

    // 매 프레임: 앞 단계가 끝났으면 다음 단계를 이어서 시작
    update: function () {
      // 대화가 완전히 끝났으면 위치 보정 고정을 풀어줍니다.
      if (
        this._conversationActive &&
        this._steps.length === 0 &&
        !BAT.Controller.isRunning()
      ) {
        this._conversationActive = false;
        this._lockedState = null;
      }

      if (this._steps.length === 0) return;

      // 행동이 시작되었거나 꺼졌으면 남은 단계 취소
      if (!this.isEnabled() || !BattleManager.isInputting()) {
        this._steps = [];
        return;
      }

      if (BAT.Controller.isRunning()) return;

      if (this._stepWait > 0) {
        this._stepWait--;
        return;
      }

      var raw = this._steps.shift();
      log('다음 단계:', raw);
      // 첫 단계와 달리 커맨드 창 대기 없이 바로 시작합니다.
      BAT.Controller._beginQueue(BAT.Controller.parseCommand(raw));
      this._stepWait = params.stepGap;
    },

    _tryRules: function (candidates, force) {
      var self = this;

      var eligible = candidates.filter(function (rule) {
        return self._isEligible(rule, force);
      });

      // 먼저 섞은 뒤 우선순위 내림차순 정렬 (같은 우선순위끼리는 랜덤)
      for (var i = eligible.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = eligible[i];
        eligible[i] = eligible[j];
        eligible[j] = tmp;
      }
      eligible = eligible
        .map(function (rule, idx) {
          return { rule: rule, idx: idx };
        })
        .sort(function (a, b) {
          return b.rule.priority - a.rule.priority || a.idx - b.idx;
        })
        .map(function (o) {
          return o.rule;
        });

      for (var k = 0; k < eligible.length; k++) {
        var rule = eligible[k];
        var roll = Math.random() * 100;
        if (!force && roll >= rule.chance) {
          log(rule.key, '확률 실패', roll.toFixed(1) + ' >= ' + rule.chance);
          continue;
        }
        if (this._fire(rule)) return true;
      }
      return false;
    },

    _isEligible: function (rule, force) {
      if (!rule.enabled || rule.scripts.length === 0) return false;
      if (rule.switchId > 0 && !$gameSwitches.value(rule.switchId)) return false;

      // 필요 액터 전원이 전투 파티에 있고 살아있는지
      var members = $gameParty.battleMembers();
      var allHere = rule.actors.every(function (id) {
        return members.some(function (a) {
          return a && a.actorId() === id && a.isAlive();
        });
      });
      if (!allHere) return false;

      var aliveEnemyIds = $gameTroop.aliveMembers().map(function (e) {
        return e.enemyId();
      });
      var has = function (id) {
        return aliveEnemyIds.indexOf(id) >= 0;
      };

      // 제외 적 조건: 하나라도 살아있으면 발동하지 않음
      if (rule.excludeEnemies.length > 0 && rule.excludeEnemies.some(has)) {
        log(rule.key, '제외 적 존재');
        return false;
      }

      // 필요 적 조건
      if (rule.enemies.length > 0) {
        var enemyOk =
          rule.enemyMatch === 'all'
            ? rule.enemies.every(has)
            : rule.enemies.some(has);
        if (!enemyOk) return false;
      }

      if (rule.repeat === 'battle' && this._battleSeen[rule.key]) return false;
      if (rule.repeat === 'game' && this._gameSeen()[rule.key]) return false;

      if (!force && rule.cooldown > 0 && this._ruleLastIndex[rule.key] !== undefined) {
        if (this._inputIndex - this._ruleLastIndex[rule.key] <= rule.cooldown) {
          return false;
        }
      }
      return true;
    },

    // 규칙 하나를 실제로 발동. 성공하면 true
    _fire: function (rule) {
      var script = rule.scripts[Math.floor(Math.random() * rule.scripts.length)];
      var steps = this._buildSteps(rule, script);
      if (steps.length === 0) return false;

      log('발동:', rule.key, '→', steps);

      // 첫 단계는 기존대로 커맨드 창이 열릴 때까지 기다렸다가 시작
      this._lockedState = null;
      this._conversationActive = true;
      BAT.Controller.start(steps.shift());
      this._steps = steps;
      this._stepWait = params.stepGap;

      this._lastAnyIndex = this._inputIndex;
      this._ruleLastIndex[rule.key] = this._inputIndex;
      this._battleSeen[rule.key] = true;
      this._gameSeen()[rule.key] = true;
      return true;
    },

    // 대화 한 줄을 "//" 로 나눠 단계별 커맨드 문자열 배열로 변환
    _buildSteps: function (rule, script) {
      var self = this;
      var steps = [];
      script.split(/\s*\/\/\s*/).forEach(function (stepText) {
        var raw = self._buildStep(rule, stepText);
        if (raw) steps.push(raw);
      });
      return steps;
    },

    // "1:대사 | 3:대사" (액터ID 기준) → "2:대사 | 1:대사" (파티 슬롯 번호 기준)
    _buildStep: function (rule, stepText) {
      var members = $gameParty.battleMembers();

      function slotOf(actorId) {
        for (var i = 0; i < members.length; i++) {
          if (members[i] && members[i].actorId() === actorId) return i + 1;
        }
        return 0;
      }

      // 단계별 진행 방식 덮어쓰기 ("동시 ..." / "순차 ...")
      var mode = rule.mode;
      var modeMatch = /^(동시|순차)\s+/.exec(stepText.trim());
      if (modeMatch) {
        mode = modeMatch[1] === '동시' ? 'simultaneous' : 'sequential';
        stepText = stepText.trim().replace(/^(동시|순차)\s+/, '');
      }

      // 1) 대사 분해: id = 숫자 / '*'(랜덤) / null(자동 배정)
      var segs = [];
      stepText.split('|').forEach(function (seg) {
        seg = seg.trim();
        if (!seg) return;
        var m = /^(\d+|\*)\s*:\s*([\s\S]*)$/.exec(seg);
        if (m) {
          segs.push({ id: m[1] === '*' ? '*' : Number(m[1]), text: m[2].trim() });
        } else {
          segs.push({ id: null, text: seg });
        }
      });

      // 2) 이미 지정된 액터 파악
      var used = [];
      segs.forEach(function (sg) {
        if (typeof sg.id === 'number') used.push(sg.id);
      });

      // 3) ID 없는 대사 → 필요 액터에게 앞에서부터 배정
      var pool = rule.actors.filter(function (id) {
        return used.indexOf(id) < 0;
      });
      segs.forEach(function (sg) {
        if (sg.id === null) {
          sg.id = pool.shift() || 0;
          if (sg.id) used.push(sg.id);
        }
      });

      // 4) "*" 대사 → 아직 안 쓰인 살아있는 파티원 중 랜덤
      segs.forEach(function (sg) {
        if (sg.id !== '*') return;
        var free = members
          .filter(function (a) {
            return a && a.isAlive() && used.indexOf(a.actorId()) < 0;
          })
          .map(function (a) {
            return a.actorId();
          });
        if (free.length === 0) {
          sg.id = 0;
          return;
        }
        sg.id = free[Math.floor(Math.random() * free.length)];
        used.push(sg.id);
      });

      // 5) 슬롯 번호로 변환
      var parts = [];
      segs.forEach(function (sg) {
        if (!sg.id || !sg.text) return;
        var slot = slotOf(sg.id);
        if (slot <= 0) return;
        parts.push(slot + ':' + sg.text);
      });

      if (parts.length === 0) return '';

      var prefix = '';
      if (mode === 'sequential') prefix = '순차 ';
      else if (mode === 'simultaneous') prefix = '동시 ';

      return prefix + parts.join(' | ');
    },
  };

  //---------------------------------------------------------------------------
  // 위치 보정 고정
  // BattleActorTalk 는 말풍선을 만드는 "그 순간"의 커맨드 창 상태로 X 보정
  // (대기 중 / 행동 선택 중)을 정합니다. 여러 단계 대화에서 단계마다 그
  // 순간의 상태가 달라지면 말풍선 위치가 단계별로 어긋나므로, 자동 대화가
  // 진행되는 동안에는 첫 말풍선에서 정해진 판정을 끝까지 재사용합니다.
  //---------------------------------------------------------------------------
  var _Controller_findAnchorRect = BAT.Controller._findAnchorRect;
  BAT.Controller._findAnchorRect = function (actor) {
    var auto = BAT.Auto;
    if (!auto._conversationActive) {
      return _Controller_findAnchorRect.call(this, actor);
    }

    var original = this._isCommandWindowActive;
    if (auto._lockedState === null) {
      auto._lockedState = !!original.call(this);
    }
    var locked = auto._lockedState;

    this._isCommandWindowActive = function () {
      return locked;
    };
    try {
      return _Controller_findAnchorRect.call(this, actor);
    } finally {
      this._isCommandWindowActive = original;
    }
  };

  //---------------------------------------------------------------------------
  // BattleManager
  //---------------------------------------------------------------------------
  var _BattleManager_setup = BattleManager.setup;
  BattleManager.setup = function (troopId, canEscape, canLose) {
    _BattleManager_setup.call(this, troopId, canEscape, canLose);
    BAT.Auto.onBattleSetup();
  };

  var _BattleManager_startInput = BattleManager.startInput;
  BattleManager.startInput = function () {
    _BattleManager_startInput.call(this);
    BAT.Auto.onInputStart();
  };

  //---------------------------------------------------------------------------
  // Scene_Battle (단계 이어가기 / 정리)
  //---------------------------------------------------------------------------
  var _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function () {
    _Scene_Battle_update.call(this);
    BAT.Auto.update();
  };

  var _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
  Scene_Battle.prototype.terminate = function () {
    BAT.Auto._steps = [];
    _Scene_Battle_terminate.call(this);
  };

  //---------------------------------------------------------------------------
  // Game_Interpreter (플러그인 커맨드)
  //---------------------------------------------------------------------------
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command !== '자동대화' && command !== 'AutoTalk') return;

    var sub = String(args[0] || '').toLowerCase();
    var rest = args.slice(1).join(' ').trim();

    switch (sub) {
      case '켜기':
      case 'on':
        BAT.Auto.setEnabled(true);
        break;
      case '끄기':
      case 'off':
        BAT.Auto.setEnabled(false);
        break;
      case '실행':
      case 'run':
        BAT.Auto.forceRun(rest);
        break;
      case '초기화':
      case 'reset':
        BAT.Auto.resetSeen();
        break;
    }
  };
})();
