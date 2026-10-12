//=============================================================================
// BattleStatusEmptySlot.js
//=============================================================================
/*:
 * @plugindesc 파티 정원(예: 4인)보다 실제 참전 인원이 적어도 칸 수를 항상
 * 정원 기준으로 고정하고, 전투 중 이탈해도 칸이 당겨지지 않게 합니다.
 * (YEP_BattleStatusWindow 필요)
 * @author ㄹㅅㅁ
 *
 * @help
 * - 항상 $gameParty.maxBattleMembers() 개수만큼 칸을 표시합니다.
 *   (예: 정원 4인인데 2명만 참전해도 칸은 4개, 나머지 2칸은 빈 채로 표시)
 * - 전투 시작 시점의 파티 구성을 스냅샷으로 저장해두고,
 *   이후 $gameParty.removeActor() 등으로 파티원이 실제로 빠지더라도
 *   Window_BattleStatus는 스냅샷 기준 자리(index)를 그대로 유지합니다.
 *   해당 자리의 액터가 더 이상 현재 파티에 없으면 그 칸은 비워둔 채로 표시됩니다.
 *
 * 사망(전투불능)은 원래부터 칸이 유지되니 영향 없습니다.
 * 이 플러그인은 YEP_BattleStatusWindow.js 아래에 두세요.
 */
//=============================================================================

var Imported = Imported || {};
Imported.BattleStatusEmptySlot = true;

(function() {

  //--------------------------------------------------------------------------
  // Window_BattleStatus
  //--------------------------------------------------------------------------

  // 항상 파티 정원 기준으로 칸 수를 고정 (참전 인원이 적어도 빈 칸으로 남음)
  Window_BattleStatus.prototype.maxItems = function() {
    return $gameParty.maxBattleMembers();
  };

  Window_BattleStatus.prototype.maxCols = function() {
    return $gameParty.maxBattleMembers();
  };

  var _Window_BattleStatus_initialize = Window_BattleStatus.prototype.initialize;
  Window_BattleStatus.prototype.initialize = function() {
    _Window_BattleStatus_initialize.call(this);
    this.captureSlotSnapshot();
  };

  // 전투 시작 시점의 파티 구성을 고정 슬롯으로 저장
  Window_BattleStatus.prototype.captureSlotSnapshot = function() {
    this._fixedSlotActors = $gameParty.battleMembers().slice();
  };

  // 필요 시(파티 재구성 등) 외부에서 강제로 스냅샷을 다시 찍고 싶을 때 사용
  Window_BattleStatus.prototype.resetSlotSnapshot = function() {
    this.captureSlotSnapshot();
  };

  // index번 슬롯의 액터를 반환. 스냅샷 당시 그 자리였던 액터가
  // 더 이상 현재 파티(전투 참여 멤버)에 없으면 null을 반환해 칸을 비운다.
  Window_BattleStatus.prototype.windowActor = function(index) {
    if (!this._fixedSlotActors) this.captureSlotSnapshot();
    var actor = this._fixedSlotActors[index];
    if (!actor) return null;
    if ($gameParty.battleMembers().indexOf(actor) < 0) return null;
    return actor;
  };

  Window_BattleStatus.prototype.drawItem = function(index) {
    var actor = this.windowActor(index);
    if (!actor) return;
    this.drawBasicArea(this.basicAreaRect(index), actor);
    this.drawGaugeArea(this.gaugeAreaRect(index), actor);
    this.drawStateArea(this.basicAreaRect(index), actor);
  };

  Window_BattleStatus.prototype.drawStatusFace = function(index) {
    var actor = this.windowActor(index);
    if (!actor) return;
    var rect = this.itemRect(index);
    var ww = Math.min(rect.width - 8, Window_Base._faceWidth);
    var wh = Math.min(rect.height - 8, Window_Base._faceHeight);
    var wx = rect.x + rect.width - ww - 6;
    var wy = rect.y + 4;
    this.drawActorFace(actor, wx, wy, ww, wh);
  };

  var _Window_BattleStatus_drawAllFaces = Window_BattleStatus.prototype.drawAllFaces;
  Window_BattleStatus.prototype.drawAllFaces = function() {
    // 얼굴 비트맵 로딩 대기 체크는 스냅샷 기준으로 다시 수행
    if (!this._fixedSlotActors) this.captureSlotSnapshot();
    for (var i = 0; i < this._fixedSlotActors.length; ++i) {
      var member = this._fixedSlotActors[i];
      if (!member) continue;
      var bitmap = ImageManager.loadFace(member.faceName());
      if (bitmap.width <= 0) return setTimeout(this.drawAllFaces.bind(this), 5);
    }
    this._faceContents.bitmap.clear();
    for (var i = 0; i < this.maxItems(); ++i) {
      this.drawStatusFace(i);
    }
  };

  // 커서/선택 시 실제 조작 대상 액터도 스냅샷 기준으로 맞춰준다.
  // (YEP_BattleEngineCore 등에서 select 관련 처리가 battleMembers()[index]를
  //  직접 참조하는 경우가 있어, 커서가 빈 칸에 머무르지 않도록 별도 방어 로직 추가)
  var _Window_BattleStatus_isCurrentItemEnabled =
      Window_BattleStatus.prototype.isCurrentItemEnabled;
  if (_Window_BattleStatus_isCurrentItemEnabled) {
    Window_BattleStatus.prototype.isCurrentItemEnabled = function() {
      var actor = this.windowActor(this.index());
      if (!actor) return false;
      return _Window_BattleStatus_isCurrentItemEnabled.call(this);
    };
  }

})();
