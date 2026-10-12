//=============================================================================
// SuppressBattleTextMessages.js
//=============================================================================

/*:
 * @plugindesc YEP_BattleEngineCore 이후에 배치. 선제공격/기습 대사와,
 * 승리 연출(전투 종료 직후) 중에 나오는 상태 해제("마법이 풀렸다" 등)
 * 배틀로그 메세지를 강제로 끕니다. 플러그인 매개변수 값과 무관하게 동작합니다.
 * @author ㄹㅅㅁ
 *
 * @help
 * ------------------------------------------------------------------------
 * 이 플러그인은 두 가지를 막습니다.
 *
 * 1) 전투 돌입 시 "선제공격" / "기습(습격)" 대사
 *    - YEP_BattleEngineCore.js의 Show Pre-Emptive Text / Show Surprise Text
 *      매개변수와 상관없이 항상 표시하지 않습니다.
 *    - "적이 나타났다!" (Emerge Text)는 건드리지 않습니다.
 *
 * 2) 승리 연출(전투 종료) 중 배틀로그에 뜨는 상태 해제 메세지
 *    - 예: "OO의 마법이 풀렸습니다" 같은, 전투가 사실상 끝난 뒤
 *      (BattleManager._victoryPhase === true) 상태가 자동 제거되며
 *      뜨는 배틀로그 텍스트를 막습니다.
 *    - 전투 중간에 정상적으로 상태가 걸리거나 풀릴 때 뜨는 메세지는
 *      그대로 유지됩니다 (전투 중 상태 텍스트는 안 건드림).
 *
 * 3) 맵(전투 중이 아닐 때) 상태 부여/해제 메세지
 *    - RPG Maker MV 기본 기능인 Game_Actor.prototype.showAddedStates /
 *      showRemovedStates 를 억제합니다. 걸어다니다가 상태가 자동으로
 *      걸리거나(message1) 풀릴 때(message4) "OO가 XX 상태가 되었다" /
 *      "OO의 XX가 떨어졌습니다" 같은 문구가 맵 위에 뜨는 걸 막습니다.
 *    - 상태 자체의 적용/해제(효과)는 그대로 정상 작동하고, 오직
 *      "메세지 표시"만 막습니다.
 *
 * 4) 패배(전멸) 시 뜨는 기본 "패배했습니다" 메세지
 *    - BattleManager.displayDefeatMessage() 자체를 무력화합니다.
 *      (processDefeat -> endBattle(2) 흐름은 그대로 유지되어 전투
 *      종료 후 화면 전환이 정상적으로 일어납니다.)
 *    - 주의: HideDefeatMessage.js 와 기능이 겹치니, 그 플러그인을
 *      켜뒀다면 끄고 이 파일만 쓰세요. (그 플러그인은 processDefeat를
 *      통째로 새로 작성하는 방식이라 endBattle(2)를 호출하지 않아
 *      전투 패배 후 화면 전환이 멈추는 버그가 있습니다.)
 *
 * 플러그인 순서: YEP_BattleEngineCore.js 보다 아래에 두세요.
 * ------------------------------------------------------------------------
 */

(function() {

  //--------------------------------------------------------------------
  // 1) 선제공격 / 기습 대사 억제
  //--------------------------------------------------------------------
  if (typeof BattleManager.displayStartMessages === 'function') {
    var _BattleManager_displayStartMessages = BattleManager.displayStartMessages;
    BattleManager.displayStartMessages = function() {
      // 적 등장(Emerge) 텍스트만 살리고, 선제공격/기습 텍스트는 강제로 끔.
      var origPreemptive = this._preemptive;
      var origSurprise = this._surprise;
      this._preemptive = false;
      this._surprise = false;
      _BattleManager_displayStartMessages.call(this);
      this._preemptive = origPreemptive;
      this._surprise = origSurprise;
    };
  }

  //--------------------------------------------------------------------
  // 2) 승리 연출 중 상태 해제(자동 소멸) 배틀로그 메세지 억제
  //--------------------------------------------------------------------
  var _Window_BattleLog_displayCurrentState =
      Window_BattleLog.prototype.displayCurrentState;
  Window_BattleLog.prototype.displayCurrentState = function(subject) {
    if (BattleManager._victoryPhase) return;
    _Window_BattleLog_displayCurrentState.call(this, subject);
  };

  var _Window_BattleLog_displayAddedStates =
      Window_BattleLog.prototype.displayAddedStates;
  Window_BattleLog.prototype.displayAddedStates = function(target) {
    if (BattleManager._victoryPhase) return;
    _Window_BattleLog_displayAddedStates.call(this, target);
  };

  var _Window_BattleLog_displayRemovedStates =
      Window_BattleLog.prototype.displayRemovedStates;
  Window_BattleLog.prototype.displayRemovedStates = function(target) {
    if (BattleManager._victoryPhase) return;
    _Window_BattleLog_displayRemovedStates.call(this, target);
  };

  // 버프/디버프 원상복귀 텍스트도 같은 타이밍에 뜨는 경우가 있어 함께 처리
  if (Window_BattleLog.prototype.displayChangedBuffs) {
    var _Window_BattleLog_displayChangedBuffs =
        Window_BattleLog.prototype.displayChangedBuffs;
    Window_BattleLog.prototype.displayChangedBuffs = function(target) {
      if (BattleManager._victoryPhase) return;
      _Window_BattleLog_displayChangedBuffs.call(this, target);
    };
  }

  //--------------------------------------------------------------------
  // 3) 맵 위에서 상태 부여/해제 메세지(기본 MV 기능) 억제
  //--------------------------------------------------------------------
  Game_Actor.prototype.showAddedStates = function() {
    // 기본 코어의 $gameMessage.add(this._name + state.message1) 호출을 막음.
    // (상태 적용 자체는 다른 곳에서 이미 처리되어 있으므로 여기선 아무 것도 안 함)
  };

  Game_Actor.prototype.showRemovedStates = function() {
    // 기본 코어의 $gameMessage.add(this._name + state.message4) 호출을 막음.
    // 예: "OO의 마법이 풀렸습니다" 류 문구가 맵에서 뜨는 걸 방지.
  };

  //--------------------------------------------------------------------
  // 4) 패배 시 기본 "패배했습니다" 메세지 억제
  //--------------------------------------------------------------------
  // processDefeat 전체를 새로 작성하지 않고, 실제 메세지를 띄우는
  // displayDefeatMessage 만 무력화합니다. (예전 방식은 endBattle(2)를
  // 호출하지 않아서 _phase가 'battleEnd'로 안 넘어가 화면 전환이
  // 멈추는 문제가 있었습니다.)
  BattleManager.displayDefeatMessage = function() {
    // 원래 여기서 $gameMessage.add(TextManager.defeat) 를 호출했지만
    // 막아서 메세지가 뜨지 않게 함. 이후 processDefeat -> endBattle(2)
    // 흐름은 그대로 정상 진행됨.
  };

})();
