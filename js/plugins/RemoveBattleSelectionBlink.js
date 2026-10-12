//=============================================================================
// RemoveBattleSelectionBlink.js
//=============================================================================
/*:
 * @plugindesc 전투 중 커서/선택창 깜빡임과 아군 선택 시 반짝임 효과를 제거합니다.
 * @author ㄹㅅㅁ
 *
 * @help
 * 전투 화면에서:
 * 1) 커맨드 창 / 타겟 선택창의 커서 깜빡임(페이드 인아웃)을 정지시킵니다.
 * 2) 아군을 타겟으로 선택했을 때 캐릭터가 색으로 반짝이는 효과를 제거합니다.
 *
 * 플러그인 순서: 다른 배틀 관련 플러그인(YEP_BattleEngineCore 등) 아래에 배치.
 * 플러그인 커맨드 없음.
 */
(function() {

    //--------------------------------------------------------------------
    // 1) 전투 중 창 커서 깜빡임 제거
    //--------------------------------------------------------------------
    var _Window_updateCursor = Window.prototype._updateCursor;
    Window.prototype._updateCursor = function() {
        if (SceneManager._scene instanceof Scene_Battle) {
            // 커서 자체를 숨겨서 windowskin의 초록색이 보이지 않도록 처리
            this._windowCursorSprite.alpha = 0;
            this._windowCursorSprite.visible = false;
            return;
        }
        _Window_updateCursor.call(this);
    };

    //--------------------------------------------------------------------
    // 2) 아군(액터) 타겟 선택 시 반짝임 효과 제거
    //--------------------------------------------------------------------
    Sprite_Actor.prototype.updateSelectionEffect = function() {
        // 반짝임 없이 항상 원래 색으로 고정
        if (this._selectionEffectCount > 0) {
            this._selectionEffectCount = 0;
        }
        this.setBlendColor([0, 0, 0, 0]);
    };

})();
