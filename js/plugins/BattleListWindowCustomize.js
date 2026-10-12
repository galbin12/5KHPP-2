//=============================================================================
// BattleListWindowCustomize.js
//=============================================================================

/*:
 * @plugindesc 전투 중 스킬/아이템 선택 창의 크기와 배경을 커스텀할 수 있게
 * 합니다. (ActorCommandOverlay.js와 같은 방식)
 * @author Custom
 *
 * @param Width Scale
 * @desc 상태창 너비 대비 스킬/아이템 창 너비 비율 (0.0 ~ 1.0)
 * @default 1.0
 *
 * @param Height Scale
 * @desc 상태창 높이 대비 스킬/아이템 창 높이 비율 (0.0 ~ 1.0)
 * @default 1.0
 *
 * @param Skill Window Background Image
 * @desc img/pictures/ 폴더에 있는 스킬 창 배경 이미지 파일명(확장자 제외).
 * 비워두면 기본 윈도우스킨을 씁니다.
 * @default
 *
 * @param Item Window Background Image
 * @desc img/pictures/ 폴더에 있는 아이템 창 배경 이미지 파일명(확장자 제외).
 * 비워두면 기본 윈도우스킨을 씁니다.
 * @default
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * ActorCommandOverlay.js가 공격/스킬/방어/아이템을 고르는 커맨드 창을
 * 상태창 자리 기준으로 크기/배경을 바꿔주는 것과 동일한 방식으로, 이
 * 플러그인은 그 다음에 뜨는 "스킬 목록 창(Window_BattleSkill)"과
 * "아이템 목록 창(Window_BattleItem)"의 크기/배경을 바꿔줍니다.
 *
 * Width Scale / Height Scale은 두 창에 공통으로 적용됩니다. 배경 이미지는
 * 스킬/아이템 각각 따로 지정할 수 있습니다.
 *
 * 스킬/아이템 창이 열려 있는 동안에도 액터 상태창을 숨겨서, 그 자리에
 * 이 창이 뜬 것처럼 보이게 합니다.
 *
 * ============================================================================
 * 주의: 파라미터 값은 플러그인 매니저에 별도로 저장됩니다!
 * ============================================================================
 * 파일을 새로 덮어써도 이미 저장된 값은 안 바뀝니다. 플러그인 매니저에서
 * 이 플러그인을 더블클릭해서 직접 값을 확인/수정하세요.
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleEngineCore, YEP_BattleStatusWindow, ActorCommandOverlay.js
 * 보다 아래(뒤)에 두세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('BattleListWindowCustomize');
    var widthScale = Number(parameters['Width Scale'] || 1.0);
    var heightScale = Number(parameters['Height Scale'] || 1.0);
    var skillBgName = String(parameters['Skill Window Background Image'] || '').trim();
    var itemBgName = String(parameters['Item Window Background Image'] || '').trim();

    var skillBgBitmap = skillBgName ? ImageManager.loadPicture(skillBgName) : null;
    var itemBgBitmap = itemBgName ? ImageManager.loadPicture(itemBgName) : null;

    function applyPlacement(win) {
        var scene = SceneManager._scene;
        var statusWin = scene && scene._statusWindow;
        if (!statusWin) return;

        var w = Math.round(statusWin.width * widthScale);
        var h = Math.round(statusWin.height * heightScale);
        var x = statusWin.x + Math.round((statusWin.width - w) / 2);
        var y = statusWin.y + Math.round((statusWin.height - h) / 2);

        win.x = x;
        win.y = y;
        win.width = w;
        win.height = h;
        win.createContents();
        win.refresh();
    }

    function setupBackground(win, bitmap) {
        if (!bitmap) return;
        win.opacity = 0;
        if (win._windowFrameSprite) {
            win._windowFrameSprite.visible = false;
        }
        win._blwcBgSprite = new Sprite(new Bitmap(win.width, win.height));
        win.addChildAt(win._blwcBgSprite, 1);

        var redraw = function() {
            if (!win._blwcBgSprite || !bitmap.isReady()) return;
            var bmp = win._blwcBgSprite.bitmap;
            if (bmp.width !== win.width || bmp.height !== win.height) {
                bmp.resize(win.width, win.height);
            }
            bmp.clear();
            bmp.blt(bitmap, 0, 0, bitmap.width, bitmap.height,
                0, 0, win.width, win.height);
        };
        if (!bitmap.isReady()) {
            bitmap.addLoadListener(redraw);
        } else {
            redraw();
        }
    }

    //--------------------------------------------------------------------
    // Window_BattleSkill
    //--------------------------------------------------------------------

    var _Window_BattleSkill_initialize = Window_BattleSkill.prototype.initialize;
    Window_BattleSkill.prototype.initialize = function(x, y, width, height) {
        _Window_BattleSkill_initialize.call(this, x, y, width, height);
        applyPlacement(this);
        setupBackground(this, skillBgBitmap);
    };

    //--------------------------------------------------------------------
    // Window_BattleItem
    //--------------------------------------------------------------------

    var _Window_BattleItem_initialize = Window_BattleItem.prototype.initialize;
    Window_BattleItem.prototype.initialize = function(x, y, width, height) {
        _Window_BattleItem_initialize.call(this, x, y, width, height);
        applyPlacement(this);
        setupBackground(this, itemBgBitmap);
    };

    //--------------------------------------------------------------------
    // Scene_Battle - 스킬/아이템 창이 열려 있는 동안 상태창 숨기기
    //--------------------------------------------------------------------

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this.updateBLWCStatusVisibility();
    };

    Scene_Battle.prototype.updateBLWCStatusVisibility = function() {
        if (!this._statusWindow) return;
        var skillActive = this._skillWindow && this._skillWindow.active;
        var itemActive = this._itemWindow && this._itemWindow.active;
        var cmdActive = this._actorCommandWindow && this._actorCommandWindow.active;
        if (skillActive || itemActive || cmdActive) {
            this._statusWindow.visible = false;
        } else if (!skillActive && !itemActive && !cmdActive) {
            this._statusWindow.visible = true;
        }
    };

})();
