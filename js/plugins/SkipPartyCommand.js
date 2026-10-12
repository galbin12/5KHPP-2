//=============================================================================
// SkipPartyCommand.js
//=============================================================================
/*:
 * @plugindesc 전투 시작 시 파티 커맨드(싸우기/도망가기) 창을 없애고,
 * 도망가기를 액터 커맨드 창(공격/스킬/방어/아이템)에 합칩니다.
 * @author ㄹㅅㅁ
 *
 * @help
 * - X(취소) 키를 눌러도 파티 커맨드 창(싸우기/도망가기)이 뜨지 않습니다.
 * - 전투 시작 시 바로 첫 액터의 커맨드 창(공격/스킬/방어/아이템/도망가기)이 뜹니다.
 * - 첫 번째 액터의 커맨드 창에서 취소(X)를 눌러도 파티 커맨드 창으로
 *   돌아가지 않고 그대로 유지됩니다.
 * - 도망가기는 액터 커맨드 목록의 맨 끝에 추가됩니다.
 *
 * ----------------------------------------------------------------------
 * [수정 사항]
 * selectPreviousCommand()의 else 분기에서 BattleManager.selectNextCommand()를
 * 직접 호출하면 YEP_BattleEngineCore가 덧씌운 Scene_Battle.selectNextCommand
 * (헬프창 클리어 + BattleManager.stopAllSelection())를 건너뛰게 됩니다.
 * 그 결과 스킬/아이템/적 선택 등 하위 선택 창이 완전히 정리되지 않고
 * 남을 수 있고, 이게 특정 타이밍에 액터 커맨드 창과 겹치면 이후 어떤 키를
 * 눌러도 반응이 없고 오류음만 나는(재시작이 필요한) 문제로 이어집니다.
 * this.selectNextCommand()(Scene 쪽 래핑된 버전)를 호출하도록 수정해
 * 정리 로직이 항상 함께 실행되도록 했습니다.
 *
 * 플러그인 순서: YEP_BattleEngineCore 아래에 배치하세요.
 */

(function() {

  //--------------------------------------------------------------------
  // Window_ActorCommand : 도망가기 커맨드 추가
  //--------------------------------------------------------------------
  var _Window_ActorCommand_makeCommandList =
      Window_ActorCommand.prototype.makeCommandList;
  Window_ActorCommand.prototype.makeCommandList = function() {
    _Window_ActorCommand_makeCommandList.call(this);
    if (this._actor) {
      this.addEscapeCommand();
    }
  };

  Window_ActorCommand.prototype.addEscapeCommand = function() {
    this.addCommand(TextManager.escape, 'escape', BattleManager.canEscape());
  };

  //--------------------------------------------------------------------
  // Scene_Battle : 파티 커맨드 창 건너뛰기 + 도망가기 핸들러 연결
  //--------------------------------------------------------------------
  var _Scene_Battle_createActorCommandWindow =
      Scene_Battle.prototype.createActorCommandWindow;
  Scene_Battle.prototype.createActorCommandWindow = function() {
    _Scene_Battle_createActorCommandWindow.call(this);
    this._actorCommandWindow.setHandler('escape', this.commandEscape.bind(this));
  };

  Scene_Battle.prototype.startPartyCommandSelection = function() {
    this.refreshStatus();
    this._statusWindow.deselect();
    this._statusWindow.open();
    BattleManager.selectNextCommand();
    this.changeInputWindow();
  };

  Scene_Battle.prototype.selectPreviousCommand = function() {
    BattleManager.selectPreviousCommand();
    if (BattleManager.isInputting() && BattleManager.actor()) {
      this.startActorCommandSelection();
    } else {
      // 파티 커맨드 창으로 돌아가는 대신 첫 액터의 커맨드 창을 그대로 유지
      // (수정: BattleManager.selectNextCommand()를 직접 부르지 않고
      //  this.selectNextCommand()를 통해 불러 정리 로직이 함께 실행되게 함)
      this.selectNextCommand();
      this.startActorCommandSelection();
    }
  };

})();
