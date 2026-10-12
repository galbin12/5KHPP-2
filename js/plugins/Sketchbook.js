//=============================================================================
// Sketchbook.js
//=============================================================================

/*:
 * @plugindesc 하얀 스케치북에 마우스로 자유롭게 그림을 그릴 수 있는 씬을 추가합니다.
 * @author ㄹㅅㅁ
 *
 * @param Canvas Width
 * @desc 스케치북(도화지) 가로 크기
 * @type number
 * @default 560
 *
 * @param Canvas Height
 * @desc 스케치북(도화지) 세로 크기
 * @type number
 * @default 560
 *
 * @param Canvas X
 * @desc 스케치북 X 좌표 (텍스트 입력, 음수 가능)
 * @type text
 * @default 24
 *
 * @param Canvas Y
 * @desc 스케치북 Y 좌표 (텍스트 입력, 음수 가능)
 * @type text
 * @default 24
 *
 * @param Panel Width
 * @desc 오른쪽 UI 패널의 가로 크기
 * @type number
 * @default 200
 *
 * @param Default Brush Size
 * @desc 기본 브러쉬 크기(반지름 px)
 * @type number
 * @default 6
 *
 * @param Min Brush Size
 * @type number
 * @default 1
 * @default 1
 *
 * @param Max Brush Size
 * @type number
 * @default 30
 *
 * @param Preset Colors
 * @desc 콤마로 구분된 프리셋 색상 목록 (CSS 색상 코드)
 * @type text
 * @default #000000,#7f7f7f,#ff0000,#ff7f00,#ffff00,#00a651,#00aeef,#0072bc,#662d91,#ec008c,#8c5a2b,#ffffff
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 이벤트 명령 [플러그인 명령]에서 아래와 같이 입력하면 스케치북 씬으로 진입합니다.
 *
 *   Sketchbook open
 *
 * 씬 안에서:
 *  - 왼쪽 흰 도화지 위에서 마우스 좌클릭 드래그로 자유롭게 그림을 그립니다.
 *  - 오른쪽 패널에서 프리셋 색상을 클릭하거나, R/G/B 슬라이더를 드래그해서
 *    원하는 색을 직접 만들 수 있습니다.
 *  - 브러쉬 크기 슬라이더로 붓 굵기를 조절합니다.
 *  - [지우기] 버튼으로 도화지를 다시 하얗게 초기화합니다.
 *  - [닫기] 버튼 또는 ESC/취소 키로 맵으로 돌아갑니다.
 *
 * 이 플러그인은 RPG Maker MV 전용입니다.
 * ============================================================================
 */

(function() {

    var pluginName = 'Sketchbook';
    var parameters = PluginManager.parameters(pluginName);

    var CANVAS_W = Number(parameters['Canvas Width'] || 560);
    var CANVAS_H = Number(parameters['Canvas Height'] || 560);
    var CANVAS_X = Number(parameters['Canvas X'] || 24);
    var CANVAS_Y = Number(parameters['Canvas Y'] || 24);
    var PANEL_W = Number(parameters['Panel Width'] || 200);
    var DEFAULT_BRUSH = Number(parameters['Default Brush Size'] || 6);
    var MIN_BRUSH = Number(parameters['Min Brush Size'] || 1);
    var MAX_BRUSH = Number(parameters['Max Brush Size'] || 30);
    var PRESET_COLORS = String(parameters['Preset Colors'] ||
        '#000000,#7f7f7f,#ff0000,#ff7f00,#ffff00,#00a651,#00aeef,#0072bc,#662d91,#ec008c,#8c5a2b,#ffffff')
        .split(',').map(function(s) { return s.trim(); });

    //-------------------------------------------------------------------------
    // Plugin Command
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'Sketchbook') {
            if (args[0] === 'open') {
                SceneManager.push(Scene_Sketchbook);
            }
        }
    };

    //-------------------------------------------------------------------------
    // Utility: hex <-> rgb
    //-------------------------------------------------------------------------
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(function(c) { return c + c; }).join('');
        }
        var num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function rgbToHex(r, g, b) {
        function h(v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }
        return '#' + h(r) + h(g) + h(b);
    }

    //=============================================================================
    // Sprite_SketchCanvas
    //   실제로 그림이 그려지는 흰 도화지
    //=============================================================================
    function Sprite_SketchCanvas() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SketchCanvas.prototype = Object.create(Sprite.prototype);
    Sprite_SketchCanvas.prototype.constructor = Sprite_SketchCanvas;

    Sprite_SketchCanvas.prototype.initialize = function(width, height) {
        Sprite.prototype.initialize.call(this);
        this._canvasWidth = width;
        this._canvasHeight = height;
        this.bitmap = new Bitmap(width, height);
        this.clearCanvas();
        this._drawing = false;
        this._lastX = 0;
        this._lastY = 0;
        this.color = '#000000';
        this.brushSize = DEFAULT_BRUSH;
    };

    Sprite_SketchCanvas.prototype.clearCanvas = function() {
        this.bitmap.fillAll('#ffffff');
    };

    Sprite_SketchCanvas.prototype.isInside = function(localX, localY) {
        return localX >= 0 && localY >= 0 && localX < this._canvasWidth && localY < this._canvasHeight;
    };

    Sprite_SketchCanvas.prototype.toLocal = function(x, y) {
        return { x: x - this.x, y: y - this.y };
    };

    Sprite_SketchCanvas.prototype.stampAt = function(x, y) {
        this.bitmap.drawCircle(x, y, this.brushSize, this.color);
    };

    Sprite_SketchCanvas.prototype.drawLine = function(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var step = Math.max(1, this.brushSize / 2);
        var count = Math.max(1, Math.floor(dist / step));
        for (var i = 0; i <= count; i++) {
            var t = count === 0 ? 0 : i / count;
            var x = x1 + dx * t;
            var y = y1 + dy * t;
            this.stampAt(x, y);
        }
    };

    Sprite_SketchCanvas.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateDrawing();
    };

    Sprite_SketchCanvas.prototype.updateDrawing = function() {
        var local = this.toLocal(TouchInput.x, TouchInput.y);
        var inside = this.isInside(local.x, local.y);

        if (TouchInput.isTriggered() && inside) {
            this._drawing = true;
            this._lastX = local.x;
            this._lastY = local.y;
            this.stampAt(local.x, local.y);
        } else if (this._drawing && TouchInput.isPressed()) {
            if (inside) {
                this.drawLine(this._lastX, this._lastY, local.x, local.y);
                this._lastX = local.x;
                this._lastY = local.y;
            }
        }

        if (TouchInput.isReleased()) {
            this._drawing = false;
        }
    };

    //=============================================================================
    // Sprite_ColorSwatch
    //=============================================================================
    function Sprite_ColorSwatch() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ColorSwatch.prototype = Object.create(Sprite.prototype);
    Sprite_ColorSwatch.prototype.constructor = Sprite_ColorSwatch;

    Sprite_ColorSwatch.prototype.initialize = function(size, color) {
        Sprite.prototype.initialize.call(this);
        this._size = size;
        this.color = color;
        this.bitmap = new Bitmap(size, size);
        this.refresh();
    };

    Sprite_ColorSwatch.prototype.refresh = function() {
        this.bitmap.clear();
        this.bitmap.fillRect(0, 0, this._size, this._size, this.color);
        this.bitmap.fillRect(0, 0, this._size, 1, '#888888');
        this.bitmap.fillRect(0, this._size - 1, this._size, 1, '#888888');
        this.bitmap.fillRect(0, 0, 1, this._size, '#888888');
        this.bitmap.fillRect(this._size - 1, 0, 1, this._size, '#888888');
    };

    Sprite_ColorSwatch.prototype.isHit = function(x, y) {
        var lx = x - this.x;
        var ly = y - this.y;
        return lx >= 0 && ly >= 0 && lx < this._size && ly < this._size;
    };

    //=============================================================================
    // Sprite_Slider (드래그로 값을 조절하는 가로 슬라이더)
    //=============================================================================
    function Sprite_Slider() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Slider.prototype = Object.create(Sprite.prototype);
    Sprite_Slider.prototype.constructor = Sprite_Slider;

    Sprite_Slider.prototype.initialize = function(width, height, min, max, value, trackColor) {
        Sprite.prototype.initialize.call(this);
        this._width = width;
        this._height = height;
        this.min = min;
        this.max = max;
        this.value = value;
        this._trackColor = trackColor || '#555555';
        this._dragging = false;
        this.bitmap = new Bitmap(width, height);
        this.refresh();
    };

    Sprite_Slider.prototype.refresh = function() {
        var b = this.bitmap;
        b.clear();
        var trackY = Math.floor(this._height / 2) - 2;
        b.fillRect(0, trackY, this._width, 4, this._trackColor);
        var t = (this.value - this.min) / (this.max - this.min);
        var knobX = Math.floor(t * (this._width - 10));
        b.fillRect(knobX, 0, 10, this._height, '#ffffff');
        b.strokeRect ? null : null;
        b.fillRect(knobX, 0, 10, 2, '#333333');
        b.fillRect(knobX, this._height - 2, 10, 2, '#333333');
        b.fillRect(knobX, 0, 2, this._height, '#333333');
        b.fillRect(knobX + 8, 0, 2, this._height, '#333333');
    };

    Sprite_Slider.prototype.isHit = function(x, y) {
        var lx = x - this.x;
        var ly = y - this.y;
        return lx >= -4 && ly >= -4 && lx < this._width + 4 && ly < this._height + 4;
    };

    Sprite_Slider.prototype.setValueFromX = function(x) {
        var lx = x - this.x;
        var t = lx / this._width;
        t = Math.max(0, Math.min(1, t));
        this.value = Math.round(this.min + t * (this.max - this.min));
        this.refresh();
    };

    Sprite_Slider.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (TouchInput.isTriggered() && this.isHit(TouchInput.x, TouchInput.y)) {
            this._dragging = true;
            this.setValueFromX(TouchInput.x);
            if (this.onChange) this.onChange(this.value);
        } else if (this._dragging && TouchInput.isPressed()) {
            this.setValueFromX(TouchInput.x);
            if (this.onChange) this.onChange(this.value);
        }
        if (TouchInput.isReleased()) {
            this._dragging = false;
        }
    };

    //=============================================================================
    // Sprite_ButtonLabel (간단한 텍스트 버튼)
    //=============================================================================
    function Sprite_ButtonLabel() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ButtonLabel.prototype = Object.create(Sprite.prototype);
    Sprite_ButtonLabel.prototype.constructor = Sprite_ButtonLabel;

    Sprite_ButtonLabel.prototype.initialize = function(width, height, text) {
        Sprite.prototype.initialize.call(this);
        this._width = width;
        this._height = height;
        this._text = text;
        this.bitmap = new Bitmap(width, height);
        this.refresh();
    };

    Sprite_ButtonLabel.prototype.refresh = function() {
        var b = this.bitmap;
        b.clear();
        b.fillRect(0, 0, this._width, this._height, '#3a3a3a');
        b.fillRect(1, 1, this._width - 2, this._height - 2, '#555555');
        b.textColor = '#ffffff';
        b.fontSize = 20;
        b.drawText(this._text, 0, 0, this._width, this._height, 'center');
    };

    Sprite_ButtonLabel.prototype.isHit = function(x, y) {
        var lx = x - this.x;
        var ly = y - this.y;
        return lx >= 0 && ly >= 0 && lx < this._width && ly < this._height;
    };

    //=============================================================================
    // Scene_Sketchbook
    //=============================================================================
    function Scene_Sketchbook() {
        this.initialize.apply(this, arguments);
    }

    Scene_Sketchbook.prototype = Object.create(Scene_Base.prototype);
    Scene_Sketchbook.prototype.constructor = Scene_Sketchbook;

    Scene_Sketchbook.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_Sketchbook.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createCanvas();
        this.createPanel();
    };

    Scene_Sketchbook.prototype.createBackground = function() {
        this._backSprite = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
        this._backSprite.bitmap.fillAll('#2b2b2b');
        this.addChild(this._backSprite);
    };

    Scene_Sketchbook.prototype.createCanvas = function() {
        this._canvas = new Sprite_SketchCanvas(CANVAS_W, CANVAS_H);
        this._canvas.x = CANVAS_X;
        this._canvas.y = CANVAS_Y;
        this._canvas.color = PRESET_COLORS[0];
        this._canvas.brushSize = DEFAULT_BRUSH;
        this.addChild(this._canvas);

        // 도화지 테두리
        var borderBmp = new Bitmap(CANVAS_W + 8, CANVAS_H + 8);
        borderBmp.fillRect(0, 0, CANVAS_W + 8, CANVAS_H + 8, '#111111');
        var border = new Sprite(borderBmp);
        border.x = CANVAS_X - 4;
        border.y = CANVAS_Y - 4;
        this.addChildAt(border, this.children.indexOf(this._canvas));
    };

    Scene_Sketchbook.prototype.createPanel = function() {
        var panelX = CANVAS_X + CANVAS_W + 24;
        var panelY = CANVAS_Y;
        this._panelX = panelX;
        this._panelY = panelY;

        var titleBmp = new Bitmap(PANEL_W, 32);
        titleBmp.textColor = '#ffffff';
        titleBmp.fontSize = 22;
        titleBmp.drawText('색상', 0, 0, PANEL_W, 32, 'left');
        var titleSprite = new Sprite(titleBmp);
        titleSprite.x = panelX;
        titleSprite.y = panelY;
        this.addChild(titleSprite);

        this.createColorSwatches(panelX, panelY + 36);
        this.createBrushSizeUI(panelX, panelY + 36 + 130);
        this.createButtons(panelX, panelY + 36 + 130 + 70);
    };

    Scene_Sketchbook.prototype.createColorSwatches = function(x, y) {
        this._swatches = [];
        var size = 32;
        var gap = 6;
        var cols = 4;
        for (var i = 0; i < PRESET_COLORS.length; i++) {
            var col = i % cols;
            var row = Math.floor(i / cols);
            var sw = new Sprite_ColorSwatch(size, PRESET_COLORS[i]);
            sw.x = x + col * (size + gap);
            sw.y = y + row * (size + gap);
            this.addChild(sw);
            this._swatches.push(sw);
        }
    };

    Scene_Sketchbook.prototype.createBrushSizeUI = function(x, y) {
        var labelBmp = new Bitmap(PANEL_W, 20);
        labelBmp.textColor = '#ffffff';
        labelBmp.fontSize = 18;
        labelBmp.drawText('브러쉬 크기', 0, 0, PANEL_W, 20, 'left');
        var label = new Sprite(labelBmp);
        label.x = x;
        label.y = y;
        this.addChild(label);

        this._brushSlider = new Sprite_Slider(PANEL_W - 50, 20, MIN_BRUSH, MAX_BRUSH, DEFAULT_BRUSH, '#cccccc');
        this._brushSlider.x = x;
        this._brushSlider.y = y + 26;
        var self = this;
        this._brushSlider.onChange = function(val) {
            self._canvas.brushSize = val;
            self.refreshBrushPreview();
        };
        this.addChild(this._brushSlider);

        this._brushPreviewBmp = new Bitmap(40, 40);
        this._brushPreviewSprite = new Sprite(this._brushPreviewBmp);
        this._brushPreviewSprite.x = x + PANEL_W - 44;
        this._brushPreviewSprite.y = y + 12;
        this.addChild(this._brushPreviewSprite);
        this.refreshBrushPreview();
    };

    Scene_Sketchbook.prototype.refreshBrushPreview = function() {
        var b = this._brushPreviewBmp;
        b.clear();
        var r = this._canvas.brushSize;
        var cx = 20, cy = 20;
        b.drawCircle(cx, cy, Math.min(r, 18), this._canvas.color);
    };

    Scene_Sketchbook.prototype.createButtons = function(x, y) {
        var self = this;

        this._clearButton = new Sprite_ButtonLabel(84, 32, '지우기');
        this._clearButton.x = x;
        this._clearButton.y = y;
        this.addChild(this._clearButton);

        this._closeButton = new Sprite_ButtonLabel(84, 32, '완성');
        this._closeButton.x = x + 92;
        this._closeButton.y = y;
        this.addChild(this._closeButton);
    };

    Scene_Sketchbook.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_Sketchbook.prototype.closeScene = function() {
        if (this._closing) return;
        this._closing = true;
        this.startFadeOut(this.fadeSpeed(), false);
    };

    Scene_Sketchbook.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (this._closing) {
            if (!this.isBusy()) {
                this.popScene();
            }
            return;
        }
        this.updateSwatchInput();
        this.updateButtonInput();
        if (Input.isTriggered('cancel') || Input.isTriggered('escape')) {
            this.closeScene();
        }
    };

    Scene_Sketchbook.prototype.updateSwatchInput = function() {
        if (!TouchInput.isTriggered()) return;
        for (var i = 0; i < this._swatches.length; i++) {
            var sw = this._swatches[i];
            if (sw.isHit(TouchInput.x, TouchInput.y)) {
                this._canvas.color = sw.color;
                this.refreshBrushPreview();
                SoundManager.playCursor();
                return;
            }
        }
    };

    Scene_Sketchbook.prototype.updateButtonInput = function() {
        if (!TouchInput.isTriggered()) return;
        if (this._clearButton.isHit(TouchInput.x, TouchInput.y)) {
            this._canvas.clearCanvas();
            SoundManager.playOk();
        } else if (this._closeButton.isHit(TouchInput.x, TouchInput.y)) {
            SoundManager.playOk();
            this.closeScene();
        }
    };

})();
