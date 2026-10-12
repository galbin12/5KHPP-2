//=============================================================================
// VictoryNoGameOver.js
//=============================================================================
/*:
 * @plugindesc 전투에서 승리한 직후에는, 파티원이 한 명이라도 살아있으면 게임오버로 넘어가지 않게 합니다.
 * @author ㄹㅅㅁ
 *
 * @param Guard Frames
 * @desc 승리 후 몇 프레임 동안 게임오버를 막을지 (60 = 1초)
 * @default 300
 *
 * @param Debug Log
 * @desc true면 게임오버를 막을 때 콘솔에 로그를 남깁니다.
 * @default false
 *
 * @help
 * ------------------------------------------------------------------------
 * 증상
 *   전투에서 이겼는데, 파티원 중 한 명이 쓰러져 있다는 이유로
 *   게임오버 화면으로 넘어가는 현상.
 *
 * 동작
 *   - 승리 처리(processVictory)가 일어난 시점부터 Guard Frames 동안
 *     (또는 다음 전투가 시작될 때까지) "승리 보호 상태"가 됩니다.
 *   - 보호 상태에서 Scene_Gameover 로 넘어가려는 시도가 있으면,
 *     파티 전체(대기 멤버 포함)에 생존자가 한 명이라도 있을 때
 *     그 전환을 취소합니다. (전원 사망이면 그대로 게임오버)
 *   - 승리하지 않은 상황(패배, 이벤트의 "게임 오버" 등)은 건드리지 않습니다.
 *
 * 플러그인 순서
 *   YEP_BattleEngineCore 등 전투 관련 플러그인보다 아래에 두세요.
 * ------------------------------------------------------------------------
 */

(function () {
  'use strict';

  var params = PluginManager.parameters('VictoryNoGameOver');
  var GUARD_FRAMES = Number(params['Guard Frames'] || 300);
  var DEBUG = String(params['Debug Log'] || 'false') === 'true' &&
              Utils.isOptionValid('test');

  var guardCount = 0; // > 0 이면 승리 보호 상태

  function log(msg) {
    if (DEBUG) console.log('[VictoryNoGameOver] ' + msg);
  }

  // 대기 멤버 포함, 파티에 생존자가 있는가
  function partyHasSurvivor() {
    return $gameParty.allMembers().some(function (m) { return m.isAlive(); });
  }

  function isGuarding() {
    return guardCount > 0 && partyHasSurvivor();
  }

  //--- 승리 시 보호 상태 시작 -------------------------------------------------
  var _processVictory = BattleManager.processVictory;
  BattleManager.processVictory = function () {
    guardCount = GUARD_FRAMES;
    log('승리 -> 게임오버 보호 시작');
    _processVictory.call(this);
  };

  //--- 다음 전투가 시작되면 보호 해제 ------------------------------------------
  var _setup = BattleManager.setup;
  BattleManager.setup = function () {
    guardCount = 0;
    _setup.apply(this, arguments);
  };

  //--- 매 프레임 카운트 감소 --------------------------------------------------
  var _SceneManager_updateScene = SceneManager.updateScene;
  SceneManager.updateScene = function () {
    if (guardCount > 0) guardCount--;
    _SceneManager_updateScene.call(this);
  };

  //--- 게임오버 전환 차단 ------------------------------------------------------
  function isGameoverClass(sceneClass) {
    return sceneClass === Scene_Gameover;
  }

  var _goto = SceneManager.goto;
  SceneManager.goto = function (sceneClass) {
    if (isGameoverClass(sceneClass) && isGuarding()) {
      log('goto(Scene_Gameover) 차단');
      // 전투 씬이면 맵으로 복귀시켜 전환이 멈추지 않게 함
      if (this._scene instanceof Scene_Battle) _goto.call(this, Scene_Map);
      return;
    }
    _goto.call(this, sceneClass);
  };

  var _push = SceneManager.push;
  SceneManager.push = function (sceneClass) {
    if (isGameoverClass(sceneClass) && isGuarding()) {
      log('push(Scene_Gameover) 차단');
      return;
    }
    _push.call(this, sceneClass);
  };

  //--- 이벤트 명령 "게임 오버" (command353) 도 차단 ----------------------------
  var _command353 = Game_Interpreter.prototype.command353;
  Game_Interpreter.prototype.command353 = function () {
    if (isGuarding()) {
      log('이벤트 게임오버 명령 차단');
      return true;
    }
    return _command353.call(this);
  };
})();
