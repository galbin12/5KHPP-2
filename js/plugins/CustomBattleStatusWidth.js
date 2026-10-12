//=============================================================================
// CustomBattleStatusWidth.js
//=============================================================================
/*:
 * @plugindesc v1.01 정면전투 시, 파티원 수와 상관없이 상태창의 칸 크기를
 * 고정값으로 유지하고, 화면 중앙에 정렬되도록 합니다.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 소개
 * ============================================================================
 *
 * YEP_BattleStatusWindow의 'Adjust Columns' 옵션을 켜면 파티원 수에 맞춰
 * 칸(열) 개수는 조정되지만, 칸 하나하나의 "크기"가 화면 너비에 맞춰 늘어나
 * 버립니다 (인원이 적을수록 칸이 넓어짐).
 *
 * 이 플러그인은 그 대신:
 *   - 칸 하나의 크기(너비)는 "최대 파티원 수" 기준으로 고정합니다.
 *   - 상태창 전체 너비는 "현재 전투 참여 인원 수 x 칸 크기"로 계산해서,
 *     실제 인원수만큼만 창을 그립니다 (안 쓰는 칸이 생기지 않음).
 *   - 상태창은 파티 커맨드 창을 제외한 나머지 공간 안에서 중앙 정렬됩니다.
 *   - 정면전투 시 액터 스프라이트(애니메이션 표시 위치)도 동일한 기준으로
 *     맞춰 배치됩니다.
 *
 * ============================================================================
 * 요구사항
 * ============================================================================
 *
 * - YEP_BattleEngineCore
 * - YEP_BattleStatusWindow (Adjust Columns 파라미터를 ON으로 설정해주세요)
 *
 * 이 플러그인은 반드시 YEP_BattleStatusWindow보다 아래쪽에 배치해주세요.
 *
 * ============================================================================
 */
//=============================================================================

(function() {

//=============================================================================
// Window_BattleStatus
//=============================================================================

// 칸(슬롯) 하나의 고정 너비: 최대 파티원 수 기준으로 계산
Window_BattleStatus.prototype.slotWidth = function() {
    var partyCmdWidth = Window_PartyCommand.prototype.windowWidth.call(this);
    var totalWidth = Graphics.boxWidth - partyCmdWidth;
    var maxMembers = Math.max(1, $gameParty.maxBattleMembers());
    return totalWidth / maxMembers;
};

// 상태창 전체 너비: 실제 전투 인원 수 x 고정 칸 너비
Window_BattleStatus.prototype.windowWidth = function() {
    var count = Math.max(1, $gameParty.battleMembers().length);
    return Math.floor(this.slotWidth() * count);
};

// 칸 하나의 너비는 고정값 사용 (인원수에 따라 늘어나지 않음)
Window_BattleStatus.prototype.itemWidth = function() {
    return Math.floor(this.slotWidth());
};

// 상태창을 파티 커맨드 창을 제외한 남은 공간 안에서 "중앙 정렬"로 배치
var CBSW_Window_BattleStatus_initialize = Window_BattleStatus.prototype.initialize;
Window_BattleStatus.prototype.initialize = function() {
    CBSW_Window_BattleStatus_initialize.call(this);
    var partyCmdWidth = Window_PartyCommand.prototype.windowWidth.call(this);
    var freeWidth = Graphics.boxWidth - partyCmdWidth;
    this.x = partyCmdWidth + (freeWidth - this.width) / 2;
};

//=============================================================================
// Sprite_Actor (정면전투 액터 표시 위치)
//=============================================================================

// YEP_BattleStatusWindow의 setActorHomeFrontView를 중앙 정렬 기준으로 재정의
Sprite_Actor.prototype.setActorHomeFrontView = function(index) {
    if (Imported.YEP_BattleEngineCore) {
      var statusHeight = Yanfly.Param.BECCommandRows;
    } else {
      var statusHeight = 4;
    }
    statusHeight *= Window_Base.prototype.lineHeight.call(this);
    statusHeight += Window_Base.prototype.standardPadding.call(this) * 2;

    var partyCmdWidth = Window_PartyCommand.prototype.windowWidth.call(this);
    var freeWidth = Graphics.boxWidth - partyCmdWidth;
    var count = Math.max(1, $gameParty.battleMembers().length);
    var slotWidth = freeWidth / Math.max(1, $gameParty.maxBattleMembers());
    var groupWidth = slotWidth * count;
    var groupStartX = partyCmdWidth + (freeWidth - groupWidth) / 2;

    var homeX = groupStartX + slotWidth * index + slotWidth / 2;
    homeX += Yanfly.Param.BSWXOffset;
    var homeY = Graphics.boxHeight - statusHeight;
    homeY += Yanfly.Param.BSWYOffset;
    this.setHome(homeX, homeY);
    this.moveToStartPosition();
};

})();

//=============================================================================
// End of File
//=============================================================================
