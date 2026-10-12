//=============================================================================
// RemoveWeaponArmorCategory.js
//=============================================================================

/*:
 * @plugindesc 아이템 화면의 카테고리 창에서 무기/방어구 항목을 제거합니다.
 * (아이템 / 중요품 두 개만 남김)
 * @author RS
 *
 * @help
 * 무기나 방어구를 습득하는 시스템 자체가 없다면 이 플러그인을 켜서
 * 카테고리 창에서 아예 안 보이게 할 수 있습니다.
 */

(function() {

    Window_ItemCategory.prototype.makeCommandList = function() {
        this.addCommand(TextManager.item,    'item');
        this.addCommand(TextManager.keyItem, 'keyItem');
    };

    Window_ItemCategory.prototype.maxCols = function() {
        return 2;
    };

})();
