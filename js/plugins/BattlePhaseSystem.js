//=============================================================================
// BattlePhaseSystem.js
//=============================================================================

var Imported = Imported || {};
Imported.BattlePhaseSystem = true;

var BPS = BPS || {};

//=============================================================================
/*:
 * @plugindesc 적 노트태그로 HP% 기준 전투 페이즈(1페이즈/2페이즈...)를 만든다.
 * @author BPS
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 적(Enemy) 노트란에 아래처럼 적는다. 여러 줄 등록 가능(3페이즈 이상도 가능).
 *
 *   <Phase 2: hp 50>
 *   <Phase 2 CE: 5>
 *   <Phase 2 Battler: Enemy2_2>
 *   <Phase 2 Invincible: 60>
 *
 *   <Phase 3: hp 20>
 *   <Phase 3 CE: 6>
 *
 * - "Phase X: hp Y"   → HP가 Y% 이하로 떨어지면 X페이즈로 전환 (필수)
 * - "Phase X CE: id"  → 전환되는 순간 해당 공통이벤트 실행 (선택)
 * - "Phase X Battler: 파일명" → 전환 시 배틀러(sv 아님, 일반 img/enemies) 그래픽 교체 (선택)
 * - "Phase X Invincible: n" → 전환 직후 n프레임 동안 무적 처리 (선택, 컷씬 연출용)
 * - "Phase X Switch: id" → 전환 시 해당 스위치를 ON, 그 외 등록된 페이즈 스위치는 전부 OFF (선택)
 *
 * ============================================================================
 * 스킬(액션패턴) 전환 방법 - 스위치 이용, DB 액션패턴은 그대로 둠
 * ============================================================================
 * 1) 적 노트란에 페이즈별 스위치를 지정한다.
 *      <Phase 1 Switch: 20>   (선택: 1페이즈용 스위치도 등록 가능)
 *      <Phase 2 Switch: 21>
 *      <Phase 3 Switch: 22>
 *
 *    → 페이즈가 바뀌면 해당 스위치만 ON, 나머지(1/2/3 중 다른 것)는 자동 OFF.
 *      (엔진이 알아서 꺼주므로 새 스위치를 켤 필요만 있음, 끄는건 신경 안써도 됨)
 *
 * 2) 데이터베이스 - 적(Enemy) - 액션 패턴에서, 각 스킬 줄의 "발동 조건"을
 *    스위치로 걸어준다.
 *      예) 2페이즈 전용 스킬 → 조건: 스위치 [21: ON]
 *          모든 페이즈 공통 스킬 → 조건: 항상 두면 됨 (조건 없음)
 *
 *    이러면 액션패턴 리스트 자체는 안 건드리고, 조건만 걸어서
 *    페이즈에 따라 자동으로 스킬 세트가 바뀜.
 *
 * 페이즈는 숫자가 큰 순서로 검사하며, 한번 전환된 페이즈는 다시 발동하지 않는다.
 * 현재 페이즈는 enemy._battlePhase 로 저장됨 (기본값 1).
 *
 * ============================================================================
 * 군단1 전멸하면 자동으로 군단2 등장 (수동 트리거 필요 없음)
 * ============================================================================
 * 데이터베이스 → 트룹(군단1) → 전투 이벤트 탭에서 새 페이지를 만들고
 *   조건: 턴 번호 0 (전투 시작하자마자 딱 한번)
 *   범위: 배틀 (span: battle)
 *   내용: 플러그인 커맨드 한 줄만 입력
 *
 *   BattlePhase chainTroop <다음 트룹ID>
 *
 * 예) 군단1 전투 이벤트에 "BattlePhase chainTroop 2" 라고 적어두면,
 *     군단1 소속 적이 순서 상관없이 전원 사망하는 순간 자동으로 감지해서
 *     "적 군단 통째로 교체" 로직이 실행되어 군단2가 등장한다.
 *     (전멸 메시지/패배 판정 없이 바로 이어짐)
 *
 * 3단계까지 이어가고 싶으면, 군단2의 전투 이벤트에도 똑같이
 *   BattlePhase chainTroop 3
 * 를 턴0 조건으로 넣어두면 군단2가 전멸할 때 군단3이 또 자동으로 나옴.
 *
 * 주의: 이 자동 체인은 "적 군단이 X마리든 순서 상관없이 전멸 시" 기준이다.
 * 특정 한 마리 기준(보스 하나 죽을 때)으로 하고 싶으면 위쪽 "죽을 때 변신"
 * (Phase X: hp 0) 방식을 그 적 노트란에 쓰면 된다.
 *
 * ============================================================================
 * 플러그인 커맨드 (이벤트 커맨드 스크립트/플러그인 커맨드 창에서 사용)
 * ============================================================================
 *   BattlePhase set <enemyIndex> <phase>
 *     → 특정 전투 참가 적(troop 내 index, 0부터 시작)의 페이즈를 강제로 지정.
 *       CE/배틀러 전환도 같이 실행됨.
 *
 *   BattlePhase get <enemyIndex>
 *     → $gameVariables 등에서 쓰려면 스크립트로 直접 enemy._battlePhase 참조 권장.
 *
 * 예) 이벤트 커맨드 - 플러그인 커맨드:
 *   BattlePhase set 0 2
 *
 * ============================================================================
 * 적 "군단" 통째로 다른 군단으로 교체
 * ============================================================================
 * 여러 마리로 구성된 트룹을 전투 도중 통째로 다른 트룹으로 바꾸고 싶을 때
 * (1페이즈 군단 전멸 연출 없이 바로 2페이즈 군단 등장) 아래 플러그인
 * 커맨드를 공통이벤트 안에서 쓰면 된다.
 *
 *   BattlePhase transformTroop <새 트룹ID>
 *
 * 동작 방식:
 * - $gameTroop 자체를 새 트룹ID로 완전히 재설정한다. 즉 진짜로 "군단2 전투"로
 *   갈아끼우는 것이라, 군단2 트룹에 걸어둔 전투 이벤트(턴 조건 등)도 정상적으로
 *   인식되어 실행된다. (예전 방식은 기존 적 슬롯만 겉모습만 바꾸는 거라
 *   군단2 쪽 전투 이벤트가 아예 안 읽히는 문제가 있었음 — 지금은 해결됨)
 * - 인원 수는 군단1/군단2가 달라도 상관없다. 군단2 트룹 데이터 그대로 새로
 *   배치되며 스프라이트도 전부 새로 생성된다.
 * - 각 적은 자기 자신의 <Phase..> 노트태그도 새로 읽어들이므로, 군단2 안에서도
 *   또 페이즈/전멸교체를 가질 수 있다.
 *
 * 예) 공통이벤트에서:
 *   BattlePhase transformTroop 8
 *
 * ============================================================================
 * 조건식 안에서 페이즈 체크 (이벤트 커맨드 "조건 분기" - 스크립트)
 * ============================================================================
 *   $gameTroop.members()[0]._battlePhase === 2
 *
 * ============================================================================
 * "죽을 때 2페이즈로 변신" (전멸 대신 다른 적으로 교체)
 * ============================================================================
 * 1페이즈 적 HP가 0이 되는 순간 죽지 않고 2페이즈 적으로 변신시키려면
 * hp 조건을 0으로 주면 된다.
 *
 *   <Phase 2: hp 0>
 *   <Phase 2 Enemy: 15>     ← 데이터베이스 적 ID 15번의 능력치/그래픽으로 완전 교체
 *   <Phase 2 CE: 5>         ← 변신 연출용 공통이벤트 (선택)
 *   <Phase 2 Invincible: 60>
 *
 * "Phase X Enemy: id" 를 쓰면 그 즉시 해당 적 데이터의 능력치(공격력, 방어력,
 * 내성 등 전부)로 완전히 바뀌고, HP는 새 적의 최대HP로 풀피 부활한다.
 * 그래픽은 자동으로 그 적의 기본 배틀러로 바뀌며, 따로 "Phase X Battler"를
 * 같이 써서 다른 그래픽으로 덮어쓸 수도 있다.
 *
 * "Phase X Enemy" 없이 "Phase X: hp 0" 만 쓰면 그래픽/능력치는 그대로 두고
 * 그냥 죽지 않고 풀피로 부활만 한다 (일반 "죽음 직전 발악 페이즈" 연출용).
 *
 * ============================================================================
 */
//=============================================================================

BPS.parsePhaseNotetags = function(enemy) {
  var note = enemy.note;
  var phases = {};
  var re = /<Phase (\d+):\s*hp\s*(\d+)>/gi;
  var match;
  while ((match = re.exec(note)) !== null) {
    var idx = Number(match[1]);
    phases[idx] = phases[idx] || {};
    phases[idx].hp = Number(match[2]);
  }
  var reCE = /<Phase (\d+) CE:\s*(\d+)>/gi;
  while ((match = reCE.exec(note)) !== null) {
    var idx = Number(match[1]);
    phases[idx] = phases[idx] || {};
    phases[idx].ce = Number(match[2]);
  }
  var reBattler = /<Phase (\d+) Battler:\s*(.+?)>/gi;
  while ((match = reBattler.exec(note)) !== null) {
    var idx = Number(match[1]);
    phases[idx] = phases[idx] || {};
    phases[idx].battler = String(match[2]).trim();
  }
  var reInv = /<Phase (\d+) Invincible:\s*(\d+)>/gi;
  while ((match = reInv.exec(note)) !== null) {
    var idx = Number(match[1]);
    phases[idx] = phases[idx] || {};
    phases[idx].invincible = Number(match[2]);
  }
  var reSwitch = /<Phase (\d+) Switch:\s*(\d+)>/gi;
  while ((match = reSwitch.exec(note)) !== null) {
    var idx = Number(match[1]);
    phases[idx] = phases[idx] || {};
    phases[idx].switchId = Number(match[2]);
  }
  var reEnemy = /<Phase (\d+) Enemy:\s*(\d+)>/gi;
  while ((match = reEnemy.exec(note)) !== null) {
    var idx = Number(match[1]);
    phases[idx] = phases[idx] || {};
    phases[idx].enemyId = Number(match[2]);
  }
  return phases;
};

//-----------------------------------------------------------------------------
// Game_Enemy
//-----------------------------------------------------------------------------

BPS.Game_Enemy_setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function(enemyId, x, y) {
  BPS.Game_Enemy_setup.call(this, enemyId, x, y);
  this._battlePhase = 1;
  this._battlePhaseDone = {};
  this._battlePhaseData = BPS.parsePhaseNotetags($dataEnemies[enemyId]);
  this._battlePhaseInvincibleTimer = 0;
  // 1페이즈 스위치가 지정되어 있으면 전투 시작시 켜준다
  if (this._battlePhaseData[1] && this._battlePhaseData[1].switchId) {
    $gameSwitches.setValue(this._battlePhaseData[1].switchId, true);
  }
};

Game_Enemy.prototype.isBattlePhaseInvincible = function() {
  return this._battlePhaseInvincibleTimer > 0;
};

// hp 조건이 0으로 등록된, 아직 발동 안 한 다음 페이즈를 찾는다 (죽음 대체용)
Game_Enemy.prototype.nextDeathPhase = function() {
  var data = this._battlePhaseData;
  if (!data) return null;
  var keys = Object.keys(data).map(Number).sort(function(a, b) { return a - b; });
  for (var i = 0; i < keys.length; i++) {
    var idx = keys[i];
    if (idx <= this._battlePhase) continue;
    if (this._battlePhaseDone[idx]) continue;
    if (data[idx].hp === 0) return idx;
  }
  return null;
};

// 능력치/그래픽을 통째로 다른 적 데이터로 교체 (능력치는 enemy() 참조가
// 자동으로 새 데이터를 읽으므로 _enemyId만 바꿔주면 params/traits 전부 갱신됨)
Game_Enemy.prototype.transformEnemy = function(newEnemyId, resetPhaseData) {
  this._enemyId = newEnemyId;
  var newData = $dataEnemies[newEnemyId];
  this._battlerName = newData.battlerName;
  this._battlerHue = newData.battlerHue;
  if (resetPhaseData) {
    // 새 적 데이터 기준으로 페이즈 태그를 다시 읽어들인다 (2군단도 자체 페이즈 가능)
    this._battlePhase = 1;
    this._battlePhaseDone = {};
    this._battlePhaseData = BPS.parsePhaseNotetags(newData);
  }
};

// Game_BattlerBase.prototype.refresh 안에서 hp<=0 이면 전멸 상태(스테이트)가
// 붙어버리므로, 그 전에 가로채서 "죽음 대체 페이즈"가 있으면 부활/변신시킨다.
BPS.Game_BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
Game_BattlerBase.prototype.refresh = function() {
  if (this instanceof Game_Enemy && this.hp <= 0 && this._battlePhaseData && !this._battlePhaseReviving) {
    var nextIdx = this.nextDeathPhase();
    if (nextIdx) {
      this._battlePhaseReviving = true;
      var data = this._battlePhaseData[nextIdx];
      if (data.enemyId) {
        this.transformEnemy(data.enemyId);
      }
      this.changeBattlePhase(nextIdx, data);
      this._hp = this.mhp; // 새 페이즈로 풀피 부활
      this._battlePhaseReviving = false;
    }
  }
  BPS.Game_BattlerBase_refresh.call(this);
};

BPS.Game_Enemy_onDamage = Game_Enemy.prototype.onDamage;
Game_Enemy.prototype.onDamage = function(value) {
  if (this.isBattlePhaseInvincible() && value > 0) {
    return; // 무적 프레임 동안 대미지 무시
  }
  BPS.Game_Enemy_onDamage.call(this, value);
  this.checkBattlePhase();
};

Game_Enemy.prototype.checkBattlePhase = function() {
  if (!this._battlePhaseData) return;
  var hpRate = Math.floor(this.hp / this.mhp * 100);
  var keys = Object.keys(this._battlePhaseData).map(Number).sort(function(a, b) {
    return b - a; // 높은 페이즈부터 검사
  });
  for (var i = 0; i < keys.length; i++) {
    var phaseIdx = keys[i];
    if (phaseIdx <= this._battlePhase) continue; // 이미 도달했거나 낮은 단계
    if (this._battlePhaseDone[phaseIdx]) continue;
    var data = this._battlePhaseData[phaseIdx];
    if (data.hp === undefined) continue;
    if (hpRate <= data.hp) {
      this.changeBattlePhase(phaseIdx, data);
      break; // 한 프레임/한 히트에 한 단계씩만 전환 (연속 전환 원하면 제거)
    }
  }
};

Game_Enemy.prototype.changeBattlePhase = function(phaseIdx, data) {
  this._battlePhase = phaseIdx;
  this._battlePhaseDone[phaseIdx] = true;
  if (data.battler) {
    this._battlerName = data.battler;
  }
  if (data.invincible) {
    this._battlePhaseInvincibleTimer = data.invincible;
  }
  if (data.ce) {
    BPS.reserveCommonEvent(data.ce);
  }
  if (data.switchId) {
    // 이 적에게 등록된 모든 페이즈 스위치를 끄고, 현재 페이즈 스위치만 켠다
    var allData = this._battlePhaseData;
    Object.keys(allData).forEach(function(key) {
      var sw = allData[key].switchId;
      if (sw) $gameSwitches.setValue(sw, false);
    });
    $gameSwitches.setValue(data.switchId, true);
  }
  if (this._battlePhaseInvincibleTimer === 0) {
    // 별도 무적시간 없으면 즉시 1프레임 무적으로 사망판정 이전에 그래픽 갱신할 시간 확보
    this._battlePhaseInvincibleTimer = 1;
  }
};

BPS.Game_Enemy_update = Game_Enemy.prototype.update;
Game_Enemy.prototype.update = function() {
  BPS.Game_Enemy_update.call(this);
  if (this._battlePhaseInvincibleTimer > 0) {
    this._battlePhaseInvincibleTimer--;
  }
};

//-----------------------------------------------------------------------------
// 공통이벤트 예약: setupChild 패턴 (재귀/중첩 안전)
//-----------------------------------------------------------------------------

BPS.reserveCommonEvent = function(commonEventId) {
  if (!$dataCommonEvents[commonEventId]) return;
  var interpreter = $gameTroop._interpreter;
  if (interpreter && !interpreter.isRunning()) {
    interpreter.setupChild($dataCommonEvents[commonEventId].list, 0);
  } else {
    // 인터프리터가 이미 실행 중이면 큐에 넣었다가 다음 프레임에 재시도
    BPS._pendingCE = BPS._pendingCE || [];
    BPS._pendingCE.push(commonEventId);
  }
};

BPS.Game_Troop_updateInterpreter = Game_Troop.prototype.updateInterpreter;
Game_Troop.prototype.updateInterpreter = function() {
  BPS.Game_Troop_updateInterpreter.call(this);
  if (BPS._pendingCE && BPS._pendingCE.length > 0) {
    var interpreter = this._interpreter;
    if (interpreter && !interpreter.isRunning()) {
      var id = BPS._pendingCE.shift();
      interpreter.setupChild($dataCommonEvents[id].list, 0);
    }
  }
};

//-----------------------------------------------------------------------------
// 플러그인 커맨드
//-----------------------------------------------------------------------------

BPS.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  BPS.Game_Interpreter_pluginCommand.call(this, command, args);
  if (command === 'BattlePhase') {
    var sub = args[0];
    if (sub === 'set') {
      var idx = Number(args[1]);
      var phase = Number(args[2]);
      var enemy = $gameTroop.members()[idx];
      if (enemy) {
        var data = (enemy._battlePhaseData && enemy._battlePhaseData[phase]) || {};
        enemy.changeBattlePhase(phase, data);
      }
    } else if (sub === 'transformTroop') {
      var newTroopId = Number(args[1]);
      BPS.transformTroop(newTroopId);
    } else if (sub === 'chainTroop') {
      var targetTroopId = Number(args[1]);
      BPS.troopChainMap[$gameTroop._troopId] = targetTroopId;
    }
  }
};

BPS.troopChainMap = BPS.troopChainMap || {};

// 트룹 전멸 판정 직전에 가로채서, 체인이 걸려있으면 전멸 대신 다음 군단으로 교체
BPS.Game_Troop_isAllDead = Game_Troop.prototype.isAllDead;
Game_Troop.prototype.isAllDead = function() {
  var allDead = BPS.Game_Troop_isAllDead.call(this);
  if (allDead && !BPS._troopChainProcessing) {
    var nextTroopId = BPS.troopChainMap[this._troopId];
    if (nextTroopId) {
      BPS._troopChainProcessing = true;
      BPS.transformTroop(nextTroopId);
      this._troopId = nextTroopId; // 다음 체인(2->3)도 인식되도록 갱신
      BPS._troopChainProcessing = false;
      return false; // 전멸 아님 취급, 전투 계속
    }
  }
  return allDead;
};

// 현재 트룹을 새 트룹으로 통째로 교체한다 ($gameTroop 자체를 새 트룹으로 재설정).
// 이렇게 해야 새 트룹에 걸어둔 전투 이벤트(턴 조건 등)도 정상적으로 인식되어 실행된다.
BPS.transformTroop = function(newTroopId) {
  var troop = $gameTroop;
  var newTroopData = $dataTroops[newTroopId];
  if (!newTroopData) return;

  troop._troopId = newTroopId;
  troop._enemies = [];
  troop._eventFlags = {}; // 새 트룹의 전투 이벤트(턴 조건 등)가 다시 실행되도록 초기화
  troop._turnCount = 0;   // 턴0 조건 이벤트(첫 텍스트 등)가 다시 매칭되도록 턴 카운트 리셋
  newTroopData.members.forEach(function(member) {
    if ($dataEnemies[member.enemyId]) {
      var enemy = new Game_Enemy(member.enemyId, member.x, member.y);
      if (member.hidden) enemy.hide();
      BPS.applyPhase1Switch(enemy);
      troop._enemies.push(enemy);
    }
  });
  troop.makeUniqueNames();

  // 스프라이트를 전부 새로 만든다 (기존 슬롯 재활용 X, 완전 새 트룹 취급)
  var scene = SceneManager._scene;
  if (scene && scene._spriteset && scene._spriteset._enemySprites) {
    var spriteset = scene._spriteset;
    spriteset._enemySprites.forEach(function(sprite) {
      spriteset._battleField.removeChild(sprite);
    });
    var newSprites = troop.members().map(function(enemy) {
      return new Sprite_Enemy(enemy);
    });
    newSprites.sort(function(a, b) {
      if (a.y !== b.y) return a.y - b.y;
      return (b.spriteId || 0) - (a.spriteId || 0);
    });
    spriteset._enemySprites = newSprites;
    newSprites.forEach(function(sprite) {
      spriteset._battleField.addChild(sprite);
    });
  }

  // 트룹 전투 이벤트 인터프리터를 정리해서 새 트룹의 페이지 조건들이
  // 처음부터 다시 검사되도록 한다 (턴0 조건 등 새 트룹 자체 이벤트 실행됨)
  troop._interpreter.clear();

  BPS.refreshBattleDisplay();
};

BPS.applyPhase1Switch = function(enemy) {
  if (enemy._battlePhaseData && enemy._battlePhaseData[1] && enemy._battlePhaseData[1].switchId) {
    $gameSwitches.setValue(enemy._battlePhaseData[1].switchId, true);
  }
};

// 전투 중간에 적을 새로 추가 (Game_Troop에 데이터 추가 + Spriteset_Battle에 스프라이트 추가)
BPS.addEnemyToBattle = function(enemyId, x, y) {
  var enemy = new Game_Enemy(enemyId, x, y);
  enemy._index = $gameTroop._enemies.length; // 표시/타겟팅용 인덱스
  enemy._hidden = false; // 트룹 에디터의 "숨김" 체크 무시하고 무조건 바로 보이게
  enemy.appear();        // 등장 이펙트/투명도 상태를 확실히 정리
  $gameTroop._enemies.push(enemy);

  var scene = SceneManager._scene;
  if (scene && scene._spriteset && scene._spriteset._enemySprites) {
    var sprite = new Sprite_Enemy(enemy);
    sprite.opacity = 255;
    sprite.scale.x = 1;
    sprite.scale.y = 1;
    scene._spriteset._enemySprites.push(sprite);
    scene._spriteset._battleField.addChild(sprite);
  }
  return enemy;
};

// 트룹 구성이 바뀐 뒤 타겟 선택창/스프라이트 목록 등을 최신 상태로 갱신
BPS.refreshBattleDisplay = function() {
  var scene = SceneManager._scene;
  if (!scene) return;
  if (scene._enemyWindow && scene._enemyWindow.refresh) {
    scene._enemyWindow.refresh();
  }
  if (scene._statusWindow && scene._statusWindow.refresh) {
    scene._statusWindow.refresh();
  }
  var spriteset = scene._spriteset;
  if (spriteset && spriteset.update) {
    spriteset.update(); // 위치(x,y)를 새 좌표 기준으로 먼저 갱신
  }
  // 위/아래 배치가 자연스럽게 보이도록 y좌표 기준으로 다시 정렬 (겹침/가려짐 방지)
  if (spriteset && spriteset._enemySprites && spriteset._battleField) {
    spriteset._enemySprites.sort(function(a, b) {
      if (a.y !== b.y) return a.y - b.y;
      return (b.spriteId || 0) - (a.spriteId || 0);
    });
    spriteset._enemySprites.forEach(function(sprite) {
      spriteset._battleField.addChild(sprite); // addChild는 맨 위로 재배치되며 순서 갱신
    });
  }
};
