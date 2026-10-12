//=============================================================================
// BattleActorRecenter.js
//=============================================================================

var Imported = Imported || {};
Imported.BattleActorRecenter = true;

/*:
 * @plugindesc v1.00 정면 전투에서 커맨드 창이 닫혀있을 때 액터를 화면 중앙 기준으로 재배치합니다.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * YEP_BattleEngineCore.js, YEP_BattleStatusWindow.js 보다 아래에 배치하세요.
 *
 * YEP_BattleStatusWindow의 setActorHomeFrontView는 파티/액터 커맨드 창이
 * 실제로 열려있는지와 상관없이 항상 커맨드 창 폭만큼 화면을 빼고 위치를
 * 계산합니다. 이 플러그인은 커맨드 창이 닫혀있으면 화면 전체 폭 기준으로
 * 중앙 정렬하고, 열리면 기존 오프셋 로직으로 되돌립니다.
 */

(function() {

  // 커맨드 창(파티/액터)이 실제로 열려서 보이는 상태인지 체크
  Sprite_Actor.prototype.isBECCommandWindowOpen = function() {
    var scene = SceneManager._scene;
    if (!scene || !(scene instanceof Scene_Battle)) return false;
    var pw = scene._partyCommandWindow;
    var aw = scene._actorCommandWindow;
    var pwOpen = !!(pw && pw.visible && pw.openness > 0 && pw.active);
    var awOpen = !!(aw && aw.visible && aw.openness > 0 && aw.active);
    return pwOpen || awOpen;
  };

  // setActorHome을 직접 가로챕니다. (BSWAlignAni 파라미터 설정과 무관하게
  // 항상 동작하도록 setActorHomeFrontView는 거치지 않습니다)
  var _Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
  Sprite_Actor.prototype.setActorHome = function(index) {
    if ($gameSystem.isSideView()) {
      _Sprite_Actor_setActorHome.call(this, index);
      return;
    }
    this._becHomeIndex = index; // 나중에 재계산할 때 쓰기 위해 저장
    this._becCmdWindowOpen = this.isBECCommandWindowOpen();
    this.refreshBECHomePosition(false);
  };

  // 실제 위치 계산 (열림 여부에 따라 폭 계산이 달라짐)
  Sprite_Actor.prototype.refreshBECHomePosition = function(animate) {
    var index = this._becHomeIndex;
    if (index === undefined) return;

    if (Imported.YEP_BattleEngineCore) {
      var statusHeight = Yanfly.Param.BECCommandRows;
    } else {
      var statusHeight = 4;
    }
    statusHeight *= Window_Base.prototype.lineHeight.call(this);
    statusHeight += Window_Base.prototype.standardPadding.call(this) * 2;

    var screenW = Graphics.boxWidth;
    var windowW = 0;

    if (this._becCmdWindowOpen) {
      // 커맨드 창이 열려있을 때: 기존 YEP 로직과 동일하게 폭을 뺌
      windowW = Window_PartyCommand.prototype.windowWidth.call(this);
      screenW -= windowW;
    }
    // 닫혀있을 때는 windowW = 0, screenW = 전체 화면 폭 그대로 -> 중앙 재정렬

    if (Yanfly.Param.BSWAdjustCol) {
      var size = $gameParty.battleMembers().length;
    } else {
      var size = $gameParty.maxBattleMembers();
    }

    var homeX = screenW / size * index + windowW + screenW / (size * 2);
    homeX += Yanfly.Param.BSWXOffset;
    var homeY = Graphics.boxHeight - statusHeight;
    homeY += Yanfly.Param.BSWYOffset;

    if (animate) {
      var diffX = this._homeX - homeX;
      var diffY = this._homeY - homeY;
      this.setHome(homeX, homeY);
      // 현재 화면상의 위치를 유지한 채로 새 홈으로 부드럽게 이동
      this.startMove(diffX, diffY, 24);
    } else {
      this.setHome(homeX, homeY);
      this.moveToStartPosition();
    }
  };

  // 매 프레임 커맨드 창 열림/닫힘 상태 변화를 감지해서 재배치
  var _Sprite_Actor_update = Sprite_Actor.prototype.update;
  Sprite_Actor.prototype.update = function() {
    _Sprite_Actor_update.call(this);
    if (!this._actor) return;
    if ($gameSystem.isSideView()) return;
    if (this._becHomeIndex === undefined) return;

    var nowOpen = this.isBECCommandWindowOpen();
    if (nowOpen !== this._becCmdWindowOpen) {
      this._becCmdWindowOpen = nowOpen;
      this.refreshBECHomePosition(true);
    }
  };

})();
