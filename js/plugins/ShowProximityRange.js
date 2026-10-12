//=============================================================================
// ShowProximityRange.js
//=============================================================================

/*:
 * @plugindesc ProximityFailTrigger.js로 감지 태그가 붙은 이벤트(NPC) 주변에
 * 감지 범위를 무지개색으로 반짝이는 반투명 사각형으로 표시합니다.
 * @author Claude
 *
 * @param Show By Default
 * @desc 게임 시작시 기본적으로 범위를 표시할지 여부
 * @type boolean
 * @default true
 *
 * @param Rainbow Speed
 * @desc 무지개색이 변하는 속도 (프레임당 색상각 변화량, 클수록 빠름)
 * @default 2
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * ProximityFailTrigger.js 로 <ProximityFail: 거리, 공통이벤트ID> 태그가
 * 붙은 이벤트마다, 그 감지 범위(정사각형)를 무지개색으로 반짝이며
 * 지도 위에 표시합니다. 이벤트가 움직이면 범위도 같이 따라 움직입니다.
 *
 * 반드시 ProximityFailTrigger.js 보다 아래쪽에 배치하세요.
 *
 * ------------------------------------------------------------------------
 * 플러그인 명령
 * ------------------------------------------------------------------------
 * ProximityRange show      범위 표시를 켭니다
 * ProximityRange hide      범위 표시를 끕니다
 * ProximityRange toggle    켜짐/꺼짐을 전환합니다
 *
 * (테스트할 때만 켜두고, 실제 배포 시에는 꺼두는 용도로 사용하세요)
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

var RS = RS || {};

(function() {

    var parameters = PluginManager.parameters('ShowProximityRange');
    var visibleByDefault = String(parameters['Show By Default'] || 'true') === 'true';
    var rainbowSpeed = Number(parameters['Rainbow Speed'] || 2);
    var rangeVisible = visibleByDefault;
    var hue = 0;

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ProximityRange') {
            var mode = String(args[0] || '').toLowerCase();
            if (mode === 'show') {
                rangeVisible = true;
            } else if (mode === 'hide') {
                rangeVisible = false;
            } else if (mode === 'toggle') {
                rangeVisible = !rangeVisible;
            }
        }
    };

    //--------------------------------------------------------------------
    // Sprite_ProximityRange
    //--------------------------------------------------------------------

    function Sprite_ProximityRange() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ProximityRange.prototype = Object.create(Sprite.prototype);
    Sprite_ProximityRange.prototype.constructor = Sprite_ProximityRange;

    Sprite_ProximityRange.prototype.initialize = function(event) {
        Sprite.prototype.initialize.call(this);
        this._event = event;
        this._range = -1;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.z = 0;
    };

    Sprite_ProximityRange.prototype.refreshBitmap = function(range, hueValue) {
        this._range = range;
        this._drawnHue = hueValue;
        var tw = $gameMap.tileWidth();
        var th = $gameMap.tileHeight();
        var size = range * 2 + 1;
        if (!this.bitmap || this.bitmap.width !== size * tw || this.bitmap.height !== size * th) {
            this.bitmap = new Bitmap(size * tw, size * th);
        } else {
            this.bitmap.clear();
        }
        var context = this.bitmap._context;
        context.fillStyle = 'hsla(' + hueValue + ', 100%, 50%, 0.35)';
        context.fillRect(0, 0, this.bitmap.width, this.bitmap.height);
        this.bitmap._setDirty();
    };

    Sprite_ProximityRange.prototype.update = function() {
        Sprite.prototype.update.call(this);
        var pf = this._event._proximityFail;
        var detectionOff = window.$isProximityDetectionOff && window.$isProximityDetectionOff();
        if (pf && rangeVisible && !detectionOff) {
            var roundedHue = Math.floor(hue / 4) * 4;
            if (this._range !== pf.range || this._drawnHue !== roundedHue) {
                this.refreshBitmap(pf.range, roundedHue);
            }
            this.visible = true;
            var tw = $gameMap.tileWidth();
            var th = $gameMap.tileHeight();
            this.x = ($gameMap.adjustX(this._event._realX) + 0.5) * tw;
            this.y = ($gameMap.adjustY(this._event._realY) + 0.5) * th;
        } else {
            this.visible = false;
        }
    };

    //--------------------------------------------------------------------
    // Spriteset_Map
    //--------------------------------------------------------------------

    var _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
    Spriteset_Map.prototype.createCharacters = function() {
        _Spriteset_Map_createCharacters.call(this);
        this.createProximityRangeSprites();
    };

    var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        hue = (hue + rainbowSpeed) % 360;
    };

    Spriteset_Map.prototype.createProximityRangeSprites = function() {
        this._proximityRangeSprites = [];
        var events = $gameMap.events();
        for (var i = 0; i < events.length; i++) {
            var sprite = new Sprite_ProximityRange(events[i]);
            this._proximityRangeSprites.push(sprite);
            this._tilemap.addChild(sprite);
        }
    };

})();
