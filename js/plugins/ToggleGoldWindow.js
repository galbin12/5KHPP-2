//=============================================================================
// ToggleGoldWindow.js
//=============================================================================

/*:
 * @plugindesc 플러그인 명령으로 지도 화면에서 골드 표시를 켜고 끌 수 있습니다.
 * @author RS
 *
 * @param Position
 * @desc 골드창 위치 (topleft / topright / bottomleft / bottomright)
 * @default topright
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 평소에는 지도 화면에 골드가 표시되지 않다가, 이벤트에서 아래 플러그인
 * 명령을 실행하면 그때부터 골드창이 나타납니다. (세이브해도 상태 유지됨)
 *
 * ------------------------------------------------------------------------
 * 플러그인 명령
 * ------------------------------------------------------------------------
 * GoldWindow show      골드창을 표시합니다
 * GoldWindow hide       골드창을 숨깁니다
 * GoldWindow toggle     표시/숨김을 전환합니다
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

var RS = RS || {};
RS.ToggleGoldWindow = RS.ToggleGoldWindow || {};

(function() {

    var parameters = PluginManager.parameters('RS_ToggleGoldWindow');
    var position = String(parameters['Position'] || 'topright').toLowerCase();

    //--------------------------------------------------------------------
    // Game_System - 표시 여부를 세이브 데이터에 저장
    //--------------------------------------------------------------------

    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._rsGoldWindowVisible = false;
    };

    Game_System.prototype.isRSGoldWindowVisible = function() {
        return !!this._rsGoldWindowVisible;
    };

    Game_System.prototype.setRSGoldWindowVisible = function(visible) {
        this._rsGoldWindowVisible = visible;
    };

    //--------------------------------------------------------------------
    // 플러그인 명령
    //--------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'GoldWindow') {
            var mode = String(args[0] || '').toLowerCase();
            if (mode === 'show') {
                $gameSystem.setRSGoldWindowVisible(true);
            } else if (mode === 'hide') {
                $gameSystem.setRSGoldWindowVisible(false);
            } else if (mode === 'toggle') {
                $gameSystem.setRSGoldWindowVisible(!$gameSystem.isRSGoldWindowVisible());
            }
            var scene = SceneManager._scene;
            if (scene instanceof Scene_Map && scene._rsGoldWindow) {
                scene._rsGoldWindow.refresh();
            }
        }
    };

    //--------------------------------------------------------------------
    // Window_RSGold
    //--------------------------------------------------------------------

    function Window_RSGold() {
        this.initialize.apply(this, arguments);
    }

    Window_RSGold.prototype = Object.create(Window_Gold.prototype);
    Window_RSGold.prototype.constructor = Window_RSGold;

    Window_RSGold.prototype.initialize = function() {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var pos = this.calcPosition(width, height);
        Window_Gold.prototype.initialize.call(this, pos.x, pos.y);
        this.refresh();
    };

    Window_RSGold.prototype.windowWidth = function() {
        return 240;
    };

    Window_RSGold.prototype.windowHeight = function() {
        return this.fittingHeight(1);
    };

    Window_RSGold.prototype.calcPosition = function(width, height) {
        var margin = 8;
        switch (position) {
            case 'topleft':
                return { x: margin, y: margin };
            case 'bottomleft':
                return { x: margin, y: Graphics.boxHeight - height - margin };
            case 'bottomright':
                return { x: Graphics.boxWidth - width - margin, y: Graphics.boxHeight - height - margin };
            case 'topright':
            default:
                return { x: Graphics.boxWidth - width - margin, y: margin };
        }
    };

    Window_RSGold.prototype.update = function() {
        Window_Gold.prototype.update.call(this);
        this.visible = $gameSystem.isRSGoldWindowVisible();
        if (this.visible) {
            this.refresh();
        }
    };

    //--------------------------------------------------------------------
    // Scene_Map
    //--------------------------------------------------------------------

    var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this._rsGoldWindow = new Window_RSGold();
        this._rsGoldWindow.visible = $gameSystem.isRSGoldWindowVisible();
        this.addWindow(this._rsGoldWindow);
    };

})();
