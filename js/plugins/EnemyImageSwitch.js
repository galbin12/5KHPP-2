//=============================================================================
// EnemyImageSwitch.js
// 전투 중 특정 조건(HP 비율, 스위치, 플러그인 명령)을 만족하면
// 적의 배틀러 이미지(외형)만 변경해주는 플러그인입니다.
// 다른 동작(모션, 애니메이션, 사망연출 등)에는 관여하지 않습니다.
//=============================================================================
var Imported = Imported || {};
Imported.EnemyImageSwitch = true;

var RS = RS || {};
RS.EIS = RS.EIS || {};

/*:
 * @plugindesc v1.0 특정 조건을 만족하면 적 배틀러 이미지(외형)만 변경
 * @author ㄹㅅㅁ
 *
 * @help
 * =============================================================================
 * 사용 방법
 * =============================================================================
 * 데이터베이스 - 적 캐릭터의 메모란에 아래 노트태그를 원하는 만큼 적습니다.
 * 위에서부터 순서대로 검사해서, 조건을 만족하는 "마지막" 항목의 이미지로
 * 바뀝니다. (하나도 만족 안 하면 원래 이미지 그대로)
 *
 *   <ImageSwitch: hpRate<=50 파일명>
 *   <ImageSwitch: hpRate<=25 파일명2>
 *   <ImageSwitch: switch:10 파일명3>
 *   <ImageSwitch: state:4 파일명4>
 *
 * 조건 종류
 *   hpRate<=50   : HP 비율이 50% 이하일 때 (<=, <, >=, > 모두 사용 가능)
 *   switch:10    : 10번 스위치가 켜져 있을 때
 *   state:4      : 4번 스테이트에 걸려 있을 때
 *
 * 파일명은 img/enemies 폴더 안의 이미지 파일명입니다 (확장자 제외).
 * 여러 조건을 동시에 만족하면 노트태그 "아래쪽"에 적힌 것이 우선 적용됩니다.
 *
 * -----------------------------------------------------------------------------
 * 플러그인 명령 (수동으로 강제 변경하고 싶을 때)
 * -----------------------------------------------------------------------------
 *   EnemyImageSwitch set <전투인덱스> <파일명>
 *     예) EnemyImageSwitch set 0 slime_dark
 *
 *   EnemyImageSwitch clear <전투인덱스>
 *     -> 수동 강제 지정을 해제하고 다시 노트태그 조건 판정으로 돌아감
 *
 * 전투인덱스는 화면에 나온 순서(0부터 시작)입니다.
 *
 * =============================================================================
 * 주의
 * =============================================================================
 * - 이 플러그인은 오직 "이미지 파일명"만 바꿉니다. 모션, 애니메이션, hue,
 *   크기, 좌표 등 다른 어떤 것도 건드리지 않습니다.
 * - SV(사이드뷰) 배틀러, 일반 정면 배틀러 모두 동작합니다.
 * - HP가 변할 때, 스테이트가 붙거나 빠질 때, 매 프레임 스위치 상태를
 *   확인해서 조건을 재검사합니다.
 *
 * =============================================================================
 * 버전 로그
 * =============================================================================
 * 2026.08.29 (v1.0) - 최초 작성
 */

(function() {

  //---------------------------------------------------------------------------
  // 노트태그 파싱
  //---------------------------------------------------------------------------
  RS.EIS.noteRegex = /<ImageSwitch:\s*([^\s]+)\s+(.+?)\s*>/g;

  RS.EIS.getRules = function(enemy) {
    if (enemy._eisRules) return enemy._eisRules;
    var rules = [];
    var note = enemy.note || '';
    var match;
    RS.EIS.noteRegex.lastIndex = 0;
    while ((match = RS.EIS.noteRegex.exec(note)) !== null) {
      rules.push({ cond: match[1], image: match[2] });
    }
    enemy._eisRules = rules;
    return rules;
  };

  RS.EIS.checkCondition = function(gameEnemy, cond) {
    var m;
    if ((m = /^hpRate(<=|>=|<|>)(\d+)$/.exec(cond))) {
      var op = m[1];
      var val = Number(m[2]);
      var rate = gameEnemy.hpRate() * 100;
      switch (op) {
        case '<=': return rate <= val;
        case '>=': return rate >= val;
        case '<':  return rate < val;
        case '>':  return rate > val;
      }
      return false;
    }
    if ((m = /^switch:(\d+)$/.exec(cond))) {
      return $gameSwitches.value(Number(m[1]));
    }
    if ((m = /^state:(\d+)$/.exec(cond))) {
      return gameEnemy.isStateAffected(Number(m[1]));
    }
    return false;
  };

  //---------------------------------------------------------------------------
  // Game_Enemy - 조건 판정 후 이미지 이름만 override
  //---------------------------------------------------------------------------
  RS.EIS.Game_Enemy_initMembers = Game_Enemy.prototype.initMembers;
  Game_Enemy.prototype.initMembers = function() {
    RS.EIS.Game_Enemy_initMembers.call(this);
    this._eisForcedImage = null;
    this._eisCurrentImage = null;
  };

  Game_Enemy.prototype.eisRefresh = function() {
    if (this._eisForcedImage !== null) {
      this._eisCurrentImage = this._eisForcedImage;
      return;
    }
    var rules = RS.EIS.getRules(this.enemy());
    var result = null;
    for (var i = 0; i < rules.length; i++) {
      if (RS.EIS.checkCondition(this, rules[i].cond)) {
        result = rules[i].image;
      }
    }
    this._eisCurrentImage = result;
  };

  RS.EIS.Game_Enemy_battlerName = Game_Enemy.prototype.battlerName;
  Game_Enemy.prototype.battlerName = function() {
    if (this._eisCurrentImage === undefined) this._eisCurrentImage = null;
    if (this._eisCurrentImage) return this._eisCurrentImage;
    return RS.EIS.Game_Enemy_battlerName.call(this);
  };

  RS.EIS.Game_Enemy_setHp = Game_Enemy.prototype.setHp;
  Game_Enemy.prototype.setHp = function(hp) {
    RS.EIS.Game_Enemy_setHp.call(this, hp);
    this.eisRefresh();
  };

  RS.EIS.Game_Enemy_addState = Game_Enemy.prototype.addState;
  Game_Enemy.prototype.addState = function(stateId) {
    RS.EIS.Game_Enemy_addState.call(this, stateId);
    this.eisRefresh();
  };

  RS.EIS.Game_Enemy_removeState = Game_Enemy.prototype.removeState;
  Game_Enemy.prototype.removeState = function(stateId) {
    RS.EIS.Game_Enemy_removeState.call(this, stateId);
    this.eisRefresh();
  };

  RS.EIS.Game_Enemy_setup = Game_Enemy.prototype.setup;
  Game_Enemy.prototype.setup = function(enemyId, x, y) {
    RS.EIS.Game_Enemy_setup.call(this, enemyId, x, y);
    this.eisRefresh();
  };

  // 스위치 조건은 실시간으로 변할 수 있으므로 매 프레임 재판정
  RS.EIS.Game_Enemy_update = Game_Enemy.prototype.update;
  Game_Enemy.prototype.update = function() {
    RS.EIS.Game_Enemy_update.call(this);
    this.eisRefresh();
  };

  //---------------------------------------------------------------------------
  // 플러그인 명령
  //---------------------------------------------------------------------------
  RS.EIS.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    RS.EIS.Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'EnemyImageSwitch') {
      var members = $gameTroop.members();
      var index = Number(args[1]);
      var enemy = members[index];
      if (!enemy) return;
      if (args[0] === 'set') {
        enemy._eisForcedImage = args[2];
        enemy.eisRefresh();
      } else if (args[0] === 'clear') {
        enemy._eisForcedImage = null;
        enemy.eisRefresh();
      }
    }
  };

})();
