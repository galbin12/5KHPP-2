//=============================================================================
// RS_HideMenuStatus.js
//=============================================================================

/*:
 * @plugindesc 메인 메뉴에서 상태창(얼굴/이름/레벨)을 기본적으로 숨기고,
 * 아이템/스킬/장비 등 캐릭터를 선택해야 하는 명령을 눌렀을 때만 표시합니다.
 * @author RS
 *
 * @help
 * 메뉴를 처음 열었을 때는 "아이템/스킬/장비/상태..." 커맨드만 보이고
 * 오른쪽 상태창은 비어 있습니다.
 *
 * 아이템/스킬/장비/상태 등 캐릭터 선택이 필요한 명령을 고르면
 * 그때 상태창이 나타나서 캐릭터를 고를 수 있습니다.
 *
 * 취소하고 커맨드 창으로 돌아가면 다시 상태창이 숨겨집니다.
 */

(function() {

    var _Scene_Menu_createStatusWindow = Scene_Menu.prototype.createStatusWindow;
    Scene_Menu.prototype.createStatusWindow = function() {
        _Scene_Menu_createStatusWindow.call(this);
        this._statusWindow.hide();
    };

    var _Scene_Menu_commandPersonal = Scene_Menu.prototype.commandPersonal;
    Scene_Menu.prototype.commandPersonal = function() {
        this._statusWindow.show();
        _Scene_Menu_commandPersonal.call(this);
    };

    var _Scene_Menu_onPersonalCancel = Scene_Menu.prototype.onPersonalCancel;
    Scene_Menu.prototype.onPersonalCancel = function() {
        _Scene_Menu_onPersonalCancel.call(this);
        this._statusWindow.hide();
    };

})();
