//=============================================================================
// PicturePuzzle.js
//=============================================================================

/*:
 * @plugindesc 그림 맞추기 퍼즐 v1.0 - 지정한 그림을 조각내어 섞고, 교체해서 원래대로 맞추는 퍼즐
 * @author ㄹㅅㅁ
 *
 * @param ClearSE
 * @text 완성 효과음
 * @desc 퍼즐을 완성했을 때 재생할 SE 파일명 (비우면 재생 안 함)
 * @default Item3
 *
 * @param ClearSEVolume
 * @text 완성 효과음 볼륨
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param ResultVariable
 * @text 기본 결과 변수 ID
 * @type variable
 * @desc 플러그인 커맨드에서 변수 ID를 생략했을 때 결과를 저장할 변수 (0이면 저장 안 함)
 * @default 0
 *
 * @param AllowCancel
 * @text 포기 허용
 * @type boolean
 * @on 허용
 * @off 불가
 * @desc ESC / 우클릭으로 중간에 포기할 수 있는지 여부
 * @default true
 *
 * @param ShowBorder
 * @text 조각 테두리 표시
 * @type boolean
 * @on 표시
 * @off 숨김
 * @default true
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 이미지 파일은 img/pictures 폴더에 넣어주세요. (확장자 제외, 공백 없는 이름)
 *
 * 플러그인 커맨드:
 *   PicturePuzzle 그림이름 가로조각수 세로조각수 [결과변수ID]
 *   그림맞추기 그림이름 가로조각수 세로조각수 [결과변수ID]
 *
 * 예) PicturePuzzle Landscape 4 3 10
 *   → img/pictures/Landscape.png 를 4×3 조각으로 나눠 퍼즐 시작.
 *     완성하면 변수 10번 = 1, 포기하면 변수 10번 = 0.
 *
 * 퍼즐이 끝나면 이벤트 실행이 이어지므로, 조건 분기(변수 10 == 1)로
 * 성공/포기 처리를 하면 됩니다.
 *
 * ============================================================================
 * 조작
 * ============================================================================
 * 마우스/터치 : 조각을 드래그해서 다른 조각 위에 놓으면 서로 자리 교체
 *               (조각을 탭 → 다른 조각 탭 으로도 교체 가능)
 * 키보드      : 방향키로 커서 이동, 확인키로 조각 선택 → 다른 칸에서 확인키로 교체
 * Shift (누르는 동안) : 완성된 원본 그림 보기
 * ESC / 우클릭 : 포기 (포기 허용 시)
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('PicturePuzzle');
    var clearSe = String(params['ClearSE'] || '');
    var clearSeVolume = Number(params['ClearSEVolume'] || 90);
    var defaultVar = Number(params['ResultVariable'] || 0);
    var allowCancel = String(params['AllowCancel'] || 'true') === 'true';
    var showBorder = String(params['ShowBorder'] || 'true') === 'true';

    //-------------------------------------------------------------------------
    // Plugin Command
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'PicturePuzzle' || command === '그림맞추기') {
            var name = String(args[0] || '');
            var cols = Math.max(1, Math.floor(Number(args[1] || 3)));
            var rows = Math.max(1, Math.floor(Number(args[2] || 3)));
            var varId = Number(args[3] || defaultVar);
            SceneManager.snapForBackground();
            SceneManager.push(Scene_PicturePuzzle);
            SceneManager.prepareNextScene(name, cols, rows, varId);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_PicturePuzzle
    //-------------------------------------------------------------------------
    function Scene_PicturePuzzle() {
        this.initialize.apply(this, arguments);
    }
    Scene_PicturePuzzle.prototype = Object.create(Scene_Base.prototype);
    Scene_PicturePuzzle.prototype.constructor = Scene_PicturePuzzle;
    window.Scene_PicturePuzzle = Scene_PicturePuzzle;

    Scene_PicturePuzzle.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._name = '';
        this._cols = 3;
        this._rows = 3;
        this._varId = 0;
        this._ready = false;
        this._finished = false;
        this._finishCount = 0;
        this._moves = 0;
        this._cells = [];
        this._cursorCell = 0;
        this._selCell = -1;
        this._drag = null;
    };

    Scene_PicturePuzzle.prototype.prepare = function(name, cols, rows, varId) {
        this._name = name;
        this._cols = cols;
        this._rows = rows;
        this._varId = varId;
    };

    Scene_PicturePuzzle.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this._srcBitmap = ImageManager.loadPicture(this._name);
    };

    Scene_PicturePuzzle.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
        var dim = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
        dim.bitmap.fillAll('rgba(0,0,0,0.75)');
        this.addChild(dim);
    };

    Scene_PicturePuzzle.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_PicturePuzzle.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (!this._ready) {
            this.updateLoading();
        } else if (this._finished) {
            this.updateFinish();
        } else {
            this.updateInput();
        }
    };

    //-------------------------------------------------------------------------
    // 로딩 / 생성
    //-------------------------------------------------------------------------
    Scene_PicturePuzzle.prototype.updateLoading = function() {
        var bmp = this._srcBitmap;
        if (bmp.isError && bmp.isError()) {
            console.error('PicturePuzzle: 이미지를 불러올 수 없습니다 → img/pictures/' + this._name);
            this.setResult(0);
            this.popScene();
            this._ready = true;
            this._finished = true;
            this._finishCount = -9999;
            return;
        }
        if (bmp.isReady()) {
            this.buildPuzzle();
            this._ready = true;
        }
    };

    Scene_PicturePuzzle.prototype.buildPuzzle = function() {
        var bmp = this._srcBitmap;
        var cols = this._cols, rows = this._rows;
        this._pw = Math.max(1, Math.floor(bmp.width / cols));
        this._ph = Math.max(1, Math.floor(bmp.height / rows));
        var fullW = this._pw * cols, fullH = this._ph * rows;

        var availW = Graphics.boxWidth - 40;
        var availH = Graphics.boxHeight - 120;
        var scale = Math.min(availW / fullW, availH / fullH);
        this._scale = scale;
        this._cw = this._pw * scale;
        this._ch = this._ph * scale;
        this._boardX = Math.floor((Graphics.boxWidth - this._cw * cols) / 2);
        this._boardY = 60 + Math.floor((availH - this._ch * rows) / 2);

        // 조각 레이어
        this._pieceLayer = new Sprite();
        this.addChild(this._pieceLayer);

        var borderBitmap = null;
        if (showBorder) {
            var t = Math.max(1, Math.round(2 / scale));
            borderBitmap = makeFrame(this._pw, this._ph, t, 'rgba(255,255,255,0.6)');
        }
        var n = cols * rows;
        this._pieces = [];
        for (var i = 0; i < n; i++) {
            var r = Math.floor(i / cols), c = i % cols;
            var p = new Sprite(bmp);
            p.setFrame(c * this._pw, r * this._ph, this._pw, this._ph);
            p.scale.set(scale, scale);
            p._index = i;
            if (borderBitmap) {
                var b = new Sprite(borderBitmap);
                p.addChild(b);
                p._border = b;
            }
            this._pieces.push(p);
            this._pieceLayer.addChild(p);
        }

        // 섞기 (이미 완성 상태로 섞이지 않도록)
        var perm;
        var tries = 0;
        do {
            perm = [];
            for (i = 0; i < n; i++) perm.push(i);
            for (i = n - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
            }
            tries++;
        } while (n > 1 && tries < 30 && this.isIdentity(perm));

        for (var k = 0; k < n; k++) {
            var piece = this._pieces[perm[k]];
            this._cells[k] = piece;
            piece._cell = k;
            this.placePiece(piece);
        }

        // 커서 / 선택 표시
        var cwI = Math.ceil(this._cw), chI = Math.ceil(this._ch);
        this._cursorSprite = new Sprite(makeFrame(cwI, chI, 3, '#ffe34d'));
        this._cursorSprite.visible = false;
        this.addChild(this._cursorSprite);
        this._selSprite = new Sprite(makeFrame(cwI, chI, 4, '#4dd2ff'));
        this._selSprite.visible = false;
        this.addChild(this._selSprite);
        this.placeCursor();

        // 원본 미리보기
        this._preview = new Sprite(bmp);
        this._preview.setFrame(0, 0, fullW, fullH);
        this._preview.scale.set(scale, scale);
        this._preview.x = this._boardX;
        this._preview.y = this._boardY;
        this._preview.visible = false;
        this.addChild(this._preview);

        // 텍스트
        this._header = new Sprite(new Bitmap(Graphics.boxWidth, 48));
        this._header.y = 8;
        this.addChild(this._header);
        this._footer = new Sprite(new Bitmap(Graphics.boxWidth, 40));
        this._footer.y = Graphics.boxHeight - 44;
        this.addChild(this._footer);
        this.refreshHeader();
        this.refreshFooter();
    };

    Scene_PicturePuzzle.prototype.isIdentity = function(perm) {
        for (var i = 0; i < perm.length; i++) {
            if (perm[i] !== i) return false;
        }
        return true;
    };

    Scene_PicturePuzzle.prototype.refreshHeader = function() {
        var b = this._header.bitmap;
        b.clear();
        b.fontSize = 22;
        if (this._finished) {
            b.drawText('완성!  (이동 ' + this._moves + '회)', 0, 0, Graphics.boxWidth, 40, 'center');
        } else {
            b.drawText('이동 ' + this._moves + '회', 20, 0, 300, 40, 'left');
            b.drawText(this._cols + ' × ' + this._rows, Graphics.boxWidth - 320, 0, 300, 40, 'right');
        }
    };

    Scene_PicturePuzzle.prototype.refreshFooter = function() {
        var b = this._footer.bitmap;
        b.clear();
        b.fontSize = 18;
        var text = '드래그 / 탭 / 방향키+확인: 교체    Shift: 원본 보기';
        if (allowCancel) text += '    ESC·우클릭: 포기';
        b.drawText(text, 0, 0, Graphics.boxWidth, 36, 'center');
    };

    //-------------------------------------------------------------------------
    // 좌표 / 배치
    //-------------------------------------------------------------------------
    Scene_PicturePuzzle.prototype.cellX = function(cell) {
        return this._boardX + (cell % this._cols) * this._cw;
    };
    Scene_PicturePuzzle.prototype.cellY = function(cell) {
        return this._boardY + Math.floor(cell / this._cols) * this._ch;
    };
    Scene_PicturePuzzle.prototype.placePiece = function(piece) {
        piece.x = this.cellX(piece._cell);
        piece.y = this.cellY(piece._cell);
    };
    Scene_PicturePuzzle.prototype.cellAt = function(x, y) {
        var cx = Math.floor((x - this._boardX) / this._cw);
        var cy = Math.floor((y - this._boardY) / this._ch);
        if (cx < 0 || cy < 0 || cx >= this._cols || cy >= this._rows) return -1;
        return cy * this._cols + cx;
    };
    Scene_PicturePuzzle.prototype.placeCursor = function() {
        this._cursorSprite.x = Math.round(this.cellX(this._cursorCell));
        this._cursorSprite.y = Math.round(this.cellY(this._cursorCell));
        if (this._selCell >= 0) {
            this._selSprite.x = Math.round(this.cellX(this._selCell));
            this._selSprite.y = Math.round(this.cellY(this._selCell));
            this._selSprite.visible = true;
        } else {
            this._selSprite.visible = false;
        }
    };

    //-------------------------------------------------------------------------
    // 입력
    //-------------------------------------------------------------------------
    Scene_PicturePuzzle.prototype.updateInput = function() {
        var previewing = Input.isPressed('shift');
        this._preview.visible = previewing;
        if (previewing) return;

        if (allowCancel && (Input.isTriggered('cancel') || TouchInput.isCancelled())) {
            SoundManager.playCancel();
            this.setResult(0);
            this.popScene();
            return;
        }
        this.updateKeyboard();
        this.updateTouch();
    };

    Scene_PicturePuzzle.prototype.updateKeyboard = function() {
        if (this._drag) return;
        var cols = this._cols, rows = this._rows;
        var cx = this._cursorCell % cols;
        var cy = Math.floor(this._cursorCell / cols);
        var used = false;
        if (Input.isRepeated('left'))  { cx = (cx + cols - 1) % cols; used = true; }
        if (Input.isRepeated('right')) { cx = (cx + 1) % cols; used = true; }
        if (Input.isRepeated('up'))    { cy = (cy + rows - 1) % rows; used = true; }
        if (Input.isRepeated('down'))  { cy = (cy + 1) % rows; used = true; }
        if (used) {
            this._cursorCell = cy * cols + cx;
            this._cursorSprite.visible = true;
            SoundManager.playCursor();
            this.placeCursor();
        }
        if (Input.isTriggered('ok')) {
            this._cursorSprite.visible = true;
            this.selectAction(this._cursorCell);
        }
    };

    // 선택 → 교체 공용 동작 (키보드 확인 / 탭)
    Scene_PicturePuzzle.prototype.selectAction = function(cell) {
        if (this._selCell < 0) {
            this._selCell = cell;
            SoundManager.playCursor();
        } else if (this._selCell === cell) {
            this._selCell = -1;
            SoundManager.playCancel();
        } else {
            var a = this._selCell;
            this._selCell = -1;
            this.swapCells(a, cell);
        }
        this.placeCursor();
    };

    Scene_PicturePuzzle.prototype.updateTouch = function() {
        if (TouchInput.isTriggered()) {
            var cell = this.cellAt(TouchInput.x, TouchInput.y);
            this._cursorSprite.visible = false;
            if (cell >= 0) {
                var p = this._cells[cell];
                this._drag = p;
                this._dragDX = TouchInput.x - p.x;
                this._dragDY = TouchInput.y - p.y;
                this._dragStartX = TouchInput.x;
                this._dragStartY = TouchInput.y;
                this._pieceLayer.addChild(p);
            }
        } else if (this._drag) {
            if (TouchInput.isPressed()) {
                this._drag.x = TouchInput.x - this._dragDX;
                this._drag.y = TouchInput.y - this._dragDY;
            } else {
                this.dropPiece();
            }
        }
    };

    Scene_PicturePuzzle.prototype.dropPiece = function() {
        var p = this._drag;
        this._drag = null;
        var dx = TouchInput.x - this._dragStartX;
        var dy = TouchInput.y - this._dragStartY;
        var moved = Math.sqrt(dx * dx + dy * dy);
        if (moved < 8) {
            // 탭으로 간주
            this.placePiece(p);
            this.selectAction(p._cell);
            return;
        }
        this._selCell = -1;
        var target = this.cellAt(TouchInput.x, TouchInput.y);
        if (target >= 0 && target !== p._cell) {
            this.swapCells(p._cell, target);
        } else {
            this.placePiece(p);
        }
        this.placeCursor();
    };

    //-------------------------------------------------------------------------
    // 교체 / 완성 판정
    //-------------------------------------------------------------------------
    Scene_PicturePuzzle.prototype.swapCells = function(a, b) {
        var pa = this._cells[a], pb = this._cells[b];
        this._cells[a] = pb;
        this._cells[b] = pa;
        pa._cell = b;
        pb._cell = a;
        this.placePiece(pa);
        this.placePiece(pb);
        this._moves++;
        this.refreshHeader();
        SoundManager.playCursor();
        if (this.isSolved()) this.onSolved();
    };

    Scene_PicturePuzzle.prototype.isSolved = function() {
        for (var k = 0; k < this._cells.length; k++) {
            if (this._cells[k]._index !== k) return false;
        }
        return true;
    };

    Scene_PicturePuzzle.prototype.onSolved = function() {
        this._finished = true;
        this._finishCount = 0;
        this._cursorSprite.visible = false;
        this._selSprite.visible = false;
        for (var i = 0; i < this._pieces.length; i++) {
            if (this._pieces[i]._border) this._pieces[i]._border.visible = false;
        }
        if (clearSe) {
            AudioManager.playSe({ name: clearSe, volume: clearSeVolume, pitch: 100, pan: 0 });
        }
        this.setResult(1);
        this.refreshHeader();
        this._footer.bitmap.clear();
    };

    Scene_PicturePuzzle.prototype.updateFinish = function() {
        if (this._finishCount < 0) return;
        this._finishCount++;
        if (this._finishCount === 70) this.startFadeOut(30, false);
        if (this._finishCount === 100) {
            this._finishCount = -1;
            this.popScene();
        }
    };

    Scene_PicturePuzzle.prototype.setResult = function(value) {
        if (this._varId > 0) $gameVariables.setValue(this._varId, value);
    };

    //-------------------------------------------------------------------------
    // 유틸: 테두리 프레임 비트맵
    //-------------------------------------------------------------------------
    function makeFrame(w, h, t, color) {
        var b = new Bitmap(w, h);
        b.fillRect(0, 0, w, t, color);
        b.fillRect(0, h - t, w, t, color);
        b.fillRect(0, 0, t, h, color);
        b.fillRect(w - t, 0, t, h, color);
        return b;
    }

})();
