//=============================================================================
// SlidingPuzzle.js
//=============================================================================

/*:
 * @plugindesc 그림을 조각내서 맞추는 슬라이딩 퍼즐 미니게임
 * @author Claude
 *
 * @param Rows
 * @desc 기본 세로 조각 수
 * @default 3
 *
 * @param Cols
 * @desc 기본 가로 조각 수
 * @default 3
 *
 * @param Puzzle Width
 * @desc 퍼즐이 화면에 표시될 최대 가로 크기 (px)
 * @default 480
 *
 * @param Puzzle Height
 * @desc 퍼즐이 화면에 표시될 최대 세로 크기 (px)
 * @default 480
 *
 * @param Shuffle Moves
 * @desc 셔플할 때 섞는 횟수 (많을수록 어려워짐)
 * @default 120
 *
 * @param Move SE
 * @desc 조각을 옮길 때 나는 효과음
 * @default Cursor2
 *
 * @param Move SE Volume
 * @default 60
 *
 * @param Complete SE
 * @desc 퍼즐 완성 시 나는 효과음
 * @default Item1
 *
 * @param Complete SE Volume
 * @default 90
 *
 * @param Complete Display Duration
 * @desc 완성 후 원본 그림을 보여주는 시간 (프레임, 60 = 1초)
 * @default 180
 *
 * @param Background Color
 * @desc 퍼즐 뒷배경(빈 칸) 색상
 * @default rgba(0, 0, 0, 0.6)
 *
 * @param Allow Cancel
 * @desc ESC/취소 키로 퍼즐을 중도 포기할 수 있는지 여부
 * @default true
 *
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 *
 * 이벤트의 [플러그인 명령]에서:
 *
 *   SlidingPuzzle_Start picture:MyPicture
 *
 * 옵션을 지정 (콜론으로 구분):
 *
 *   SlidingPuzzle_Start picture:MyPicture rows:4 cols:4 switch:5 successEvent:10 failEvent:11
 *
 * 옵션 설명:
 *   picture:이름       → img/pictures/[이름].png 를 퍼즐 그림으로 사용 (필수)
 *   rows:3             → 세로 조각 수 (기본값: 플러그인 파라미터 Rows)
 *   cols:3             → 가로 조각 수 (기본값: 플러그인 파라미터 Cols)
 *   switch:5           → 완성/포기 결과를 5번 스위치에 저장 (완성 ON, 포기 OFF)
 *   successEvent:10    → 완성 시 실행할 공통 이벤트 ID
 *   failEvent:11       → 중도 포기 시 실행할 공통 이벤트 ID (Allow Cancel이 true일 때만 동작)
 *
 * 진행 방식:
 *   1. 화면이 페이드 인 되며 퍼즐 등장
 *   2. 마우스/터치로 빈 칸과 인접한 조각을 클릭하면 이동
 *      (방향키로도 빈 칸을 이동시킬 수 있음)
 *   3. 완성하면 효과음과 함께 원본 그림(이음새 없는 완성본)이 표시됨
 *   4. 3초(파라미터로 조절 가능) 동안 완성 그림을 보여준 뒤 페이드 아웃되며 종료
 *
 * 예시:
 *   SlidingPuzzle_Start picture:Photo1 rows:3 cols:3 switch:10 successEvent:20
 *   SlidingPuzzle_Start picture:Photo2 rows:4 cols:3 switch:10 successEvent:20 failEvent:21
 *
 * =============================================================================
 */

(function() {
    var parameters = PluginManager.parameters('SlidingPuzzle');
    var DEFAULT_ROWS = parseInt(parameters['Rows']) || 3;
    var DEFAULT_COLS = parseInt(parameters['Cols']) || 3;
    var PUZZLE_WIDTH = parseInt(parameters['Puzzle Width']) || 480;
    var PUZZLE_HEIGHT = parseInt(parameters['Puzzle Height']) || 480;
    var SHUFFLE_MOVES = parseInt(parameters['Shuffle Moves']) || 120;
    var MOVE_SE = parameters['Move SE'] || 'Cursor2';
    var MOVE_SE_VOLUME = parseInt(parameters['Move SE Volume']) || 60;
    var COMPLETE_SE = parameters['Complete SE'] || 'Item1';
    var COMPLETE_SE_VOLUME = parseInt(parameters['Complete SE Volume']) || 90;
    var COMPLETE_DURATION = parseInt(parameters['Complete Display Duration']) || 180;
    var BG_COLOR = parameters['Background Color'] || 'rgba(0, 0, 0, 0.6)';
    var ALLOW_CANCEL = (parameters['Allow Cancel'] || 'true') === 'true';

    // 완성/포기 후 실행할 공통 이벤트를 위한 독립 인터프리터
    // (호출한 이벤트/공통이벤트가 계속 실행중이거나 병렬 프로세스여도
    //  영향받지 않고 확실하게 실행되도록 완전히 분리해서 처리함)
    var $slidingPuzzlePendingInterpreter = null;
    var $slidingPuzzleGameData = null;

    //=========================================================================
    // Game_SlidingPuzzle
    //=========================================================================

    function Game_SlidingPuzzle() {
        this.initialize.apply(this, arguments);
    }

    Game_SlidingPuzzle.prototype.initialize = function() {
        this.picture = '';
        this.rows = DEFAULT_ROWS;
        this.cols = DEFAULT_COLS;
        this.switchId = 0;
        this.successEventId = 0;
        this.failEventId = 0;
    };

    //=========================================================================
    // Scene_SlidingPuzzle
    //=========================================================================

    function Scene_SlidingPuzzle() {
        this.initialize.apply(this, arguments);
    }

    Scene_SlidingPuzzle.prototype = Object.create(Scene_Base.prototype);
    Scene_SlidingPuzzle.prototype.constructor = Scene_SlidingPuzzle;

    Scene_SlidingPuzzle.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._gameData = $slidingPuzzleGameData || new Game_SlidingPuzzle();
        this._rows = this._gameData.rows;
        this._cols = this._gameData.cols;
        this._state = 'loading';
        this._completeTimer = 0;
        this._closeTimer = 0;
    };

    Scene_SlidingPuzzle.prototype.create = function() {
        Scene_Base.prototype.create.call(this);

        // Graphics.width가 boxWidth보다 큰 환경(줌/해상도 플러그인 등)에서도
        // 항상 화면 중앙 안전 영역에 오도록 컨테이너로 감싸서 오프셋을 줌
        this._offsetLayer = new Sprite();
        this._offsetLayer.x = (Graphics.width - Graphics.boxWidth) / 2;
        this._offsetLayer.y = (Graphics.height - Graphics.boxHeight) / 2;
        this.addChild(this._offsetLayer);

        this.createDimBackground();
        this.hideFollowers();

        this._sourceBitmap = ImageManager.loadPicture(this._gameData.picture);
        this._sourceBitmap.addLoadListener(this.onPictureLoaded.bind(this));
    };

    Scene_SlidingPuzzle.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_SlidingPuzzle.prototype.createDimBackground = function() {
        var sprite = new Sprite();
        sprite.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        sprite.bitmap.fillAll('rgba(0, 0, 0, 0.4)');
        this._offsetLayer.addChild(sprite);
    };

    Scene_SlidingPuzzle.prototype.hideFollowers = function() {
        this._followersWereVisible = $gamePlayer.followers().isVisible();
        $gamePlayer.followers().hide();
    };

    Scene_SlidingPuzzle.prototype.onPictureLoaded = function() {
        var srcW = this._sourceBitmap.width;
        var srcH = this._sourceBitmap.height;
        var scale = Math.min(PUZZLE_WIDTH / srcW, PUZZLE_HEIGHT / srcH);

        this._scale = scale;
        this._srcTileW = srcW / this._cols;
        this._srcTileH = srcH / this._rows;
        this._dispTileW = this._srcTileW * scale;
        this._dispTileH = this._srcTileH * scale;
        this._displayW = srcW * scale;
        this._displayH = srcH * scale;
        this._gridX = (Graphics.boxWidth - this._displayW) / 2;
        this._gridY = (Graphics.boxHeight - this._displayH) / 2;

        this.createGridPanel();
        this.createTiles();
        this.createHighlight();
        this.createResultSprite();
        this.setupBoard();

        this._state = 'playing';
    };

    Scene_SlidingPuzzle.prototype.createGridPanel = function() {
        var sprite = new Sprite();
        sprite.bitmap = new Bitmap(this._displayW, this._displayH);
        sprite.bitmap.fillAll(BG_COLOR);
        sprite.x = this._gridX;
        sprite.y = this._gridY;
        this._offsetLayer.addChild(sprite);
        this._panelSprite = sprite;
    };

    Scene_SlidingPuzzle.prototype.createTiles = function() {
        var n = this._rows * this._cols;
        this._tileSprites = [];
        this._tileLayer = new Sprite();
        this._tileLayer.x = this._gridX;
        this._tileLayer.y = this._gridY;
        this._offsetLayer.addChild(this._tileLayer);

        for (var p = 0; p < n - 1; p++) {
            var col = p % this._cols;
            var row = Math.floor(p / this._cols);
            var srcX = col * this._srcTileW;
            var srcY = row * this._srcTileH;

            var tileBitmap = new Bitmap(this._srcTileW, this._srcTileH);
            tileBitmap.blt(this._sourceBitmap, srcX, srcY, this._srcTileW, this._srcTileH, 0, 0);
            if (tileBitmap._context) {
                var ctx = tileBitmap._context;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, this._srcTileW - 2, this._srcTileH - 2);
                tileBitmap._setDirty();
            }

            var sprite = new Sprite(tileBitmap);
            sprite.scale.x = this._scale;
            sprite.scale.y = this._scale;
            this._tileLayer.addChild(sprite);
            this._tileSprites[p] = sprite;
        }
    };

    Scene_SlidingPuzzle.prototype.createHighlight = function() {
        var sprite = new Sprite();
        sprite.bitmap = new Bitmap(this._srcTileW, this._srcTileH);
        var ctx = sprite.bitmap._context;
        ctx.strokeStyle = 'rgba(255, 255, 150, 1)';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, this._srcTileW - 4, this._srcTileH - 4);
        sprite.bitmap._setDirty();
        sprite.scale.x = this._scale;
        sprite.scale.y = this._scale;
        sprite.visible = false;
        this._tileLayer.addChild(sprite);
        this._highlightSprite = sprite;
        this._highlightPhase = 0;
        this._hoverCell = -1;
    };

    Scene_SlidingPuzzle.prototype.createResultSprite = function() {
        var sprite = new Sprite(this._sourceBitmap);
        sprite.scale.x = this._scale;
        sprite.scale.y = this._scale;
        sprite.x = this._gridX;
        sprite.y = this._gridY;
        sprite.visible = false;
        this._offsetLayer.addChild(sprite);
        this._resultSprite = sprite;
    };

    //=========================================================================
    // 보드 상태
    //=========================================================================

    Scene_SlidingPuzzle.prototype.setupBoard = function() {
        var n = this._rows * this._cols;
        var blank = n - 1;
        this._cellToPiece = [];
        for (var i = 0; i < n; i++) {
            this._cellToPiece[i] = i;
        }
        this._blankCell = blank;
        this.shuffleBoard();
        this.updateTilePositions();
    };

    Scene_SlidingPuzzle.prototype.shuffleBoard = function() {
        var lastMoveCell = -1;
        for (var i = 0; i < SHUFFLE_MOVES; i++) {
            var oldBlank = this._blankCell;
            var neighbors = this.neighborCells(oldBlank).filter(function(c) {
                return c !== lastMoveCell;
            });
            if (neighbors.length === 0) {
                neighbors = this.neighborCells(oldBlank);
            }
            var target = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.swapCells(target, oldBlank);
            lastMoveCell = oldBlank; // 방금 비워진 칸으로 바로 되돌아가는 것을 방지
        }
        // 셔플 결과가 우연히 완성 상태이면 한 번 더 강제로 섞음
        if (this.isSolved()) {
            var again = this.neighborCells(this._blankCell);
            var t = again[Math.floor(Math.random() * again.length)];
            this.swapCells(t, this._blankCell);
        }
    };

    Scene_SlidingPuzzle.prototype.neighborCells = function(cell) {
        var col = cell % this._cols;
        var row = Math.floor(cell / this._cols);
        var result = [];
        if (row > 0) result.push(cell - this._cols);
        if (row < this._rows - 1) result.push(cell + this._cols);
        if (col > 0) result.push(cell - 1);
        if (col < this._cols - 1) result.push(cell + 1);
        return result;
    };

    Scene_SlidingPuzzle.prototype.isAdjacentToBlank = function(cell) {
        return this.neighborCells(this._blankCell).indexOf(cell) > -1;
    };

    Scene_SlidingPuzzle.prototype.swapCells = function(cellA, cellB) {
        var tmp = this._cellToPiece[cellA];
        this._cellToPiece[cellA] = this._cellToPiece[cellB];
        this._cellToPiece[cellB] = tmp;
        if (cellA === this._blankCell) {
            this._blankCell = cellB;
        } else if (cellB === this._blankCell) {
            this._blankCell = cellA;
        }
    };

    Scene_SlidingPuzzle.prototype.isSolved = function() {
        for (var i = 0; i < this._cellToPiece.length; i++) {
            if (this._cellToPiece[i] !== i) return false;
        }
        return true;
    };

    Scene_SlidingPuzzle.prototype.updateTilePositions = function() {
        var n = this._rows * this._cols;
        for (var cell = 0; cell < n; cell++) {
            var piece = this._cellToPiece[cell];
            if (piece === n - 1) continue; // 빈 칸
            var col = cell % this._cols;
            var row = Math.floor(cell / this._cols);
            var sprite = this._tileSprites[piece];
            sprite.x = col * this._dispTileW;
            sprite.y = row * this._dispTileH;
        }
    };

    Scene_SlidingPuzzle.prototype.trySwap = function(cell) {
        if (!this.isAdjacentToBlank(cell)) return;
        this.swapCells(cell, this._blankCell);
        AudioManager.playSe({ name: MOVE_SE, volume: MOVE_SE_VOLUME, pitch: 100, pan: 0 });
        this.updateTilePositions();
        if (this.isSolved()) {
            this.onComplete();
        }
    };

    //=========================================================================
    // 업데이트
    //=========================================================================

    Scene_SlidingPuzzle.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        if (this._state === 'playing') {
            this.updatePlayingInput();
        } else if (this._state === 'complete') {
            this._completeTimer--;
            if (this._completeTimer <= 0) {
                this.startClosing(true);
            }
        } else if (this._state === 'closing') {
            this._closeTimer--;
            if (this._closeTimer <= 0) {
                SceneManager.pop();
            }
        }
    };

    Scene_SlidingPuzzle.prototype.updatePlayingInput = function() {
        this.updateHoverHighlight();
        this.updateTouchInput();
        this.updateKeyboardInput();

        if (ALLOW_CANCEL && Input.isTriggered('cancel')) {
            this.onCancel();
        }
    };

    Scene_SlidingPuzzle.prototype.cellAtScreenPoint = function(x, y) {
        var localX = x - this._offsetLayer.x - this._gridX;
        var localY = y - this._offsetLayer.y - this._gridY;
        if (localX < 0 || localY < 0 || localX >= this._displayW || localY >= this._displayH) {
            return -1;
        }
        var col = Math.floor(localX / this._dispTileW);
        var row = Math.floor(localY / this._dispTileH);
        return row * this._cols + col;
    };

    Scene_SlidingPuzzle.prototype.updateHoverHighlight = function() {
        var cell = this.cellAtScreenPoint(TouchInput.x, TouchInput.y);
        if (cell < 0 || this._cellToPiece[cell] === this._rows * this._cols - 1 || !this.isAdjacentToBlank(cell)) {
            cell = -1;
        }
        this._hoverCell = cell;

        if (cell < 0) {
            this._highlightSprite.visible = false;
            return;
        }

        this._highlightPhase += 0.15;
        var col = cell % this._cols;
        var row = Math.floor(cell / this._cols);
        this._highlightSprite.x = col * this._dispTileW;
        this._highlightSprite.y = row * this._dispTileH;
        this._highlightSprite.visible = true;
        // 은은하게 깜빡여서 방해되지 않도록 알파값만 오르내림
        this._highlightSprite.opacity = 140 + Math.sin(this._highlightPhase) * 90;
    };

    Scene_SlidingPuzzle.prototype.updateTouchInput = function() {
        if (!TouchInput.isTriggered()) return;

        var localX = TouchInput.x - this._offsetLayer.x - this._gridX;
        var localY = TouchInput.y - this._offsetLayer.y - this._gridY;
        if (localX < 0 || localY < 0 || localX >= this._displayW || localY >= this._displayH) return;

        var col = Math.floor(localX / this._dispTileW);
        var row = Math.floor(localY / this._dispTileH);
        var cell = row * this._cols + col;
        this.trySwap(cell);
    };

    Scene_SlidingPuzzle.prototype.updateKeyboardInput = function() {
        var dirCell = -1;
        if (Input.isTriggered('up')) {
            dirCell = this._blankCell - this._cols;
            if (Math.floor(this._blankCell / this._cols) === 0) dirCell = -1;
        } else if (Input.isTriggered('down')) {
            dirCell = this._blankCell + this._cols;
            if (Math.floor(this._blankCell / this._cols) === this._rows - 1) dirCell = -1;
        } else if (Input.isTriggered('left')) {
            if (this._blankCell % this._cols > 0) dirCell = this._blankCell - 1;
        } else if (Input.isTriggered('right')) {
            if (this._blankCell % this._cols < this._cols - 1) dirCell = this._blankCell + 1;
        }
        if (dirCell >= 0) {
            this.trySwap(dirCell);
        }
    };

    //=========================================================================
    // 완성 / 포기 처리
    //=========================================================================

    Scene_SlidingPuzzle.prototype.onComplete = function() {
        this._state = 'complete';
        this._completeTimer = COMPLETE_DURATION;

        this._tileLayer.visible = false;
        this._panelSprite.visible = false;
        this._resultSprite.visible = true;

        AudioManager.playSe({ name: COMPLETE_SE, volume: COMPLETE_SE_VOLUME, pitch: 100, pan: 0 });
    };

    Scene_SlidingPuzzle.prototype.onCancel = function() {
        SoundManager.playCancel();
        this.startClosing(false);
    };

    Scene_SlidingPuzzle.prototype.startClosing = function(isSuccess) {
        this._state = 'closing';
        this._closeTimer = this.fadeSpeed();

        if (this._followersWereVisible) {
            $gamePlayer.followers().show();
        }

        if (this._gameData.switchId > 0) {
            $gameSwitches.setValue(this._gameData.switchId, isSuccess);
        }

        var eventId = isSuccess ? this._gameData.successEventId : this._gameData.failEventId;
        if (eventId > 0) {
            var commonEvent = $dataCommonEvents[eventId];
            if (!commonEvent) {
                console.warn('[SlidingPuzzle] 경고: 공통 이벤트 ' + eventId + '번이 존재하지 않습니다.');
            } else {
                var interpreter = new Game_Interpreter();
                interpreter.setup(commonEvent.list, 0);
                $slidingPuzzlePendingInterpreter = interpreter;
            }
        }

        this.startFadeOut(this.fadeSpeed(), false);
    };

    //=========================================================================
    // 예약된 공통 이벤트를 독립적으로 확실하게 실행
    //=========================================================================

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if ($slidingPuzzlePendingInterpreter) {
            $slidingPuzzlePendingInterpreter.update();
            if (!$slidingPuzzlePendingInterpreter.isRunning()) {
                $slidingPuzzlePendingInterpreter = null;
            }
        }
    };

    //=========================================================================
    // 플러그인 커맨드
    //=========================================================================

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'SlidingPuzzle_Start') {
            this.startSlidingPuzzle(args);
        }
    };

    Game_Interpreter.prototype.startSlidingPuzzle = function(args) {
        var options = {};
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg.indexOf(':') > -1) {
                var parts = arg.split(':');
                var key = parts[0].toLowerCase();
                var value = parts.slice(1).join(':');
                options[key] = value;
            }
        }

        if (!options.picture) {
            console.warn('[SlidingPuzzle] 경고: picture 옵션이 없습니다. 예) SlidingPuzzle_Start picture:MyPicture');
            return;
        }

        $slidingPuzzleGameData = new Game_SlidingPuzzle();
        $slidingPuzzleGameData.picture = options.picture.trim();
        if (options.rows) $slidingPuzzleGameData.rows = Math.max(2, parseInt(options.rows));
        if (options.cols) $slidingPuzzleGameData.cols = Math.max(2, parseInt(options.cols));
        if (options.switch) $slidingPuzzleGameData.switchId = parseInt(options.switch);
        if (options.successevent) $slidingPuzzleGameData.successEventId = parseInt(options.successevent);
        if (options.failevent) $slidingPuzzleGameData.failEventId = parseInt(options.failevent);

        SceneManager.push(Scene_SlidingPuzzle);
    };

    window.Scene_SlidingPuzzle = Scene_SlidingPuzzle;
    window.Game_SlidingPuzzle = Game_SlidingPuzzle;

})();
