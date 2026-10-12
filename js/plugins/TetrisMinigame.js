//=============================================================================
// TetrisMinigame.js
//=============================================================================

/*:
 * @plugindesc 정해진 줄 수를 지우면 성공하는 테트리스 미니게임
 * @author Claude
 *
 * @param Cell Size
 * @desc 블록 한 칸의 크기 (px)
 * @default 24
 *
 * @param Field Width
 * @desc 필드 가로 칸 수
 * @default 10
 *
 * @param Field Height
 * @desc 필드 세로 칸 수
 * @default 20
 *
 * @param Fall Interval
 * @desc 블록이 한 칸 내려오는 간격 (프레임, 60 = 1초)
 * @default 45
 *
 * @param Lines To Clear
 * @desc 성공에 필요한 기본 줄 수 (플러그인 명령에서 개별 지정 가능)
 * @default 3
 *
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 *
 * 이벤트의 [플러그인 명령]에서:
 *
 *   Tetris_Start
 *
 * 또는 옵션을 지정 (콜론으로 구분):
 *
 *   Tetris_Start lines:5 switch:10 variable:20 successEvent:10 failEvent:11
 *
 * 옵션 설명:
 *   lines:5            → 목표 줄 수 (이 줄 수를 지우면 성공, 기본값: 파라미터 값)
 *   switch:5           → 성공/실패를 5번 스위치에 저장 (성공 ON, 실패 OFF)
 *   variable:3         → 지운 줄 수를 3번 변수에 저장
 *   variable2:4        → 점수를 4번 변수에 저장
 *   timelimit:1800     → 제한시간 (프레임, 0이면 무제한, 기본값: 0)
 *   successEvent:10    → 성공 시 실행할 공통 이벤트 ID
 *   failEvent:11       → 실패 시 실행할 공통 이벤트 ID (제한시간 초과 또는 게임오버 시)
 *   introtext:텍스트   → 게임 시작 전 표시할 텍스트 (기본값: 줄을 채워서 없애세요!)
 *
 * 조작법
 * =============================================================================
 *   좌/우 방향키   : 이동
 *   아래 방향키    : 소프트 드롭 (빠르게 내리기)
 *   위 방향키      : 회전
 *   스페이스바     : 하드 드롭 (즉시 바닥까지)
 *   ESC/취소       : 일시정지 메뉴 (계속하기/그만두기)
 *
 * 성공 판정
 * =============================================================================
 *   목표 줄 수를 지우면 성공
 *   블록이 필드 위쪽까지 쌓여서 더 이상 놓을 수 없으면 실패
 *   제한시간을 넘기면 실패 (timelimit 옵션을 넣은 경우)
 *
 * 예시
 * =============================================================================
 *   Tetris_Start lines:3 successEvent:10 failEvent:11
 *   Tetris_Start lines:5 switch:10 variable:20 timelimit:1800 successEvent:10 failEvent:11
 *
 * =============================================================================
 */

(function() {
    var parameters = PluginManager.parameters('TetrisMinigame');
    var CELL_SIZE = parseInt(parameters['Cell Size']) || 24;
    var FIELD_WIDTH = parseInt(parameters['Field Width']) || 10;
    var FIELD_HEIGHT = parseInt(parameters['Field Height']) || 20;
    var FALL_INTERVAL = parseInt(parameters['Fall Interval']) || 45;
    var DEFAULT_LINES = parseInt(parameters['Lines To Clear']) || 3;

    // 미니게임 종료 후 실행할 공통 이벤트를 위한 독립 인터프리터
    var $tetrisPendingInterpreter = null;

    //=========================================================================
    // 테트로미노 정의 (4x4 좌표 배열, 회전 상태별)
    //=========================================================================

    var TETROMINOES = {
        I: {
            color: '#00c9d1',
            shapes: [
                [[0,1],[1,1],[2,1],[3,1]],
                [[2,0],[2,1],[2,2],[2,3]],
                [[0,2],[1,2],[2,2],[3,2]],
                [[1,0],[1,1],[1,2],[1,3]]
            ]
        },
        O: {
            color: '#e8d200',
            shapes: [
                [[1,0],[2,0],[1,1],[2,1]],
                [[1,0],[2,0],[1,1],[2,1]],
                [[1,0],[2,0],[1,1],[2,1]],
                [[1,0],[2,0],[1,1],[2,1]]
            ]
        },
        T: {
            color: '#a335e8',
            shapes: [
                [[1,0],[0,1],[1,1],[2,1]],
                [[1,0],[1,1],[2,1],[1,2]],
                [[0,1],[1,1],[2,1],[1,2]],
                [[1,0],[0,1],[1,1],[1,2]]
            ]
        },
        S: {
            color: '#3ecc4a',
            shapes: [
                [[1,0],[2,0],[0,1],[1,1]],
                [[1,0],[1,1],[2,1],[2,2]],
                [[1,1],[2,1],[0,2],[1,2]],
                [[0,0],[0,1],[1,1],[1,2]]
            ]
        },
        Z: {
            color: '#e83a3a',
            shapes: [
                [[0,0],[1,0],[1,1],[2,1]],
                [[2,0],[1,1],[2,1],[1,2]],
                [[0,1],[1,1],[1,2],[2,2]],
                [[1,0],[0,1],[1,1],[0,2]]
            ]
        },
        J: {
            color: '#3a5ce8',
            shapes: [
                [[0,0],[0,1],[1,1],[2,1]],
                [[1,0],[2,0],[1,1],[1,2]],
                [[0,1],[1,1],[2,1],[2,2]],
                [[1,0],[1,1],[0,2],[1,2]]
            ]
        },
        L: {
            color: '#e88a1a',
            shapes: [
                [[2,0],[0,1],[1,1],[2,1]],
                [[1,0],[1,1],[1,2],[2,2]],
                [[0,1],[1,1],[2,1],[0,2]],
                [[0,0],[1,0],[1,1],[1,2]]
            ]
        }
    };

    var TETROMINO_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    //=========================================================================
    // Game_Tetris
    //=========================================================================

    function Game_Tetris() {
        this.initialize.apply(this, arguments);
    }

    Game_Tetris.prototype.initialize = function() {
        this.switchId = 0;
        this.variableId = 0;
        this.variable2Id = 0;
        this.successEventId = 0;
        this.failEventId = 0;
        this.introText = '줄을 채워서 없애세요!';
        this.linesToClear = DEFAULT_LINES;
        this.timeLimit = 0;

        this.linesCleared = 0;
        this.score = 0;

        this.field = [];
        for (var y = 0; y < FIELD_HEIGHT; y++) {
            var row = [];
            for (var x = 0; x < FIELD_WIDTH; x++) {
                row.push(null);
            }
            this.field.push(row);
        }

        this.bag = [];
        this.current = null;
        this.next = null;
        this.hold = null;
        this.holdUsed = false;

        this.fallTimer = 0;
        this.timeElapsed = 0;
        this.gameOver = false;
        this.success = false;
    };

    Game_Tetris.prototype.drawBag = function() {
        if (this.bag.length === 0) {
            this.bag = TETROMINO_KEYS.slice();
            for (var i = this.bag.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = this.bag[i];
                this.bag[i] = this.bag[j];
                this.bag[j] = tmp;
            }
        }
        return this.bag.shift();
    };

    Game_Tetris.prototype.spawnPiece = function(key) {
        return {
            key: key,
            rotation: 0,
            x: Math.floor(FIELD_WIDTH / 2) - 2,
            y: -1
        };
    };

    Game_Tetris.prototype.start = function() {
        this.next = this.drawBag();
        this.spawnNext();
    };

    Game_Tetris.prototype.spawnNext = function() {
        var key = this.next;
        this.next = this.drawBag();
        this.current = this.spawnPiece(key);
        this.holdUsed = false;
        this.fallTimer = 0;
        if (this.checkCollision(this.current, 0, 0, this.current.rotation)) {
            this.gameOver = true;
            this.success = false;
        }
    };

    Game_Tetris.prototype.cellsOf = function(piece, rotation) {
        var rot = rotation === undefined ? piece.rotation : rotation;
        var shape = TETROMINOES[piece.key].shapes[rot];
        var cells = [];
        for (var i = 0; i < shape.length; i++) {
            cells.push([piece.x + shape[i][0], piece.y + shape[i][1]]);
        }
        return cells;
    };

    Game_Tetris.prototype.checkCollision = function(piece, dx, dy, rotation) {
        var rot = rotation === undefined ? piece.rotation : rotation;
        var shape = TETROMINOES[piece.key].shapes[rot];
        for (var i = 0; i < shape.length; i++) {
            var x = piece.x + shape[i][0] + dx;
            var y = piece.y + shape[i][1] + dy;
            if (x < 0 || x >= FIELD_WIDTH || y >= FIELD_HEIGHT) {
                return true;
            }
            if (y >= 0 && this.field[y][x]) {
                return true;
            }
        }
        return false;
    };

    Game_Tetris.prototype.moveCurrent = function(dx, dy) {
        if (!this.current || this.gameOver) return false;
        if (!this.checkCollision(this.current, dx, dy, this.current.rotation)) {
            this.current.x += dx;
            this.current.y += dy;
            return true;
        }
        return false;
    };

    Game_Tetris.prototype.rotateCurrent = function() {
        if (!this.current || this.gameOver) return false;
        var newRot = (this.current.rotation + 1) % 4;
        var kicks = [0, -1, 1, -2, 2];
        for (var i = 0; i < kicks.length; i++) {
            if (!this.checkCollision(this.current, kicks[i], 0, newRot)) {
                this.current.x += kicks[i];
                this.current.rotation = newRot;
                return true;
            }
        }
        return false;
    };

    Game_Tetris.prototype.hardDrop = function() {
        if (!this.current || this.gameOver) return;
        var dropDist = 0;
        while (!this.checkCollision(this.current, 0, dropDist + 1, this.current.rotation)) {
            dropDist++;
        }
        this.current.y += dropDist;
        this.score += dropDist * 2;
        this.lockPiece();
    };

    Game_Tetris.prototype.lockPiece = function() {
        var cells = this.cellsOf(this.current);
        var color = TETROMINOES[this.current.key].color;
        for (var i = 0; i < cells.length; i++) {
            var x = cells[i][0];
            var y = cells[i][1];
            if (y >= 0 && y < FIELD_HEIGHT && x >= 0 && x < FIELD_WIDTH) {
                this.field[y][x] = color;
            }
        }
        this.current = null;
        var cleared = this.clearLines();
        if (cleared > 0) {
            this.linesCleared += cleared;
            var scoreTable = [0, 100, 300, 500, 800];
            this.score += scoreTable[Math.min(cleared, 4)];
            if (this.linesCleared >= this.linesToClear) {
                this.gameOver = true;
                this.success = true;
                return;
            }
        }
        this.spawnNext();
    };

    Game_Tetris.prototype.clearLines = function() {
        var cleared = 0;
        for (var y = FIELD_HEIGHT - 1; y >= 0; y--) {
            var full = true;
            for (var x = 0; x < FIELD_WIDTH; x++) {
                if (!this.field[y][x]) {
                    full = false;
                    break;
                }
            }
            if (full) {
                this.field.splice(y, 1);
                var newRow = [];
                for (var nx = 0; nx < FIELD_WIDTH; nx++) newRow.push(null);
                this.field.unshift(newRow);
                cleared++;
                y++; // 같은 위치 다시 검사 (줄이 당겨졌으므로)
            }
        }
        return cleared;
    };

    Game_Tetris.prototype.update = function() {
        if (this.gameOver || !this.current) return;

        this.timeElapsed++;
        if (this.timeLimit > 0 && this.timeElapsed >= this.timeLimit) {
            this.gameOver = true;
            this.success = false;
            return;
        }

        this.fallTimer++;
        if (this.fallTimer >= FALL_INTERVAL) {
            this.fallTimer = 0;
            if (!this.moveCurrent(0, 1)) {
                this.lockPiece();
            }
        }
    };

    Game_Tetris.prototype.ghostY = function() {
        if (!this.current) return 0;
        var dropDist = 0;
        while (!this.checkCollision(this.current, 0, dropDist + 1, this.current.rotation)) {
            dropDist++;
        }
        return this.current.y + dropDist;
    };

    //=========================================================================
    // Scene_Tetris
    //=========================================================================

    function Scene_Tetris() {
        this.initialize.apply(this, arguments);
    }

    Scene_Tetris.prototype = Object.create(Scene_Base.prototype);
    Scene_Tetris.prototype.constructor = Scene_Tetris;

    Scene_Tetris.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._gameData = $tetrisGameData || new Game_Tetris();
        this._state = 'intro';
        this._introTimer = 0;
        this._countdownTime = 0;
        this._currentCountdown = -1;
        this._softDropHeld = false;
        this._dasTimer = {left: 0, right: 0};
        this._paused = false;
    };

    Scene_Tetris.prototype.create = function() {
        Scene_Base.prototype.create.call(this);

        this._offsetLayer = new Sprite();
        this._offsetLayer.x = (Graphics.width - Graphics.boxWidth) / 2;
        this._offsetLayer.y = (Graphics.height - Graphics.boxHeight) / 2;
        this.addChild(this._offsetLayer);

        this.createBackground();
        this.createFieldSprite();
        this.createSidePanel();
        this.createMessageWindow();

        this.hideFollowers();

        this._fieldOriginX = Math.floor((Graphics.boxWidth - (FIELD_WIDTH * CELL_SIZE) - 160) / 2);
        this._fieldOriginY = Math.floor((Graphics.boxHeight - FIELD_HEIGHT * CELL_SIZE) / 2);
        this._fieldSprite.x = this._fieldOriginX;
        this._fieldSprite.y = this._fieldOriginY;
        this._sidePanelSprite.x = this._fieldOriginX + FIELD_WIDTH * CELL_SIZE + 24;
        this._sidePanelSprite.y = this._fieldOriginY;
    };

    Scene_Tetris.prototype.hideFollowers = function() {
        this._followersWereVisible = !$gamePlayer.followers()._visible === false;
        $gamePlayer.followers().hide();
    };

    Scene_Tetris.prototype.createBackground = function() {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._backSprite.bitmap.fillRect(0, 0, Graphics.boxWidth, Graphics.boxHeight, '#101018');
        this._offsetLayer.addChild(this._backSprite);
    };

    Scene_Tetris.prototype.createFieldSprite = function() {
        this._fieldSprite = new Sprite();
        this._fieldSprite.bitmap = new Bitmap(
            FIELD_WIDTH * CELL_SIZE + 4,
            FIELD_HEIGHT * CELL_SIZE + 4
        );
        this._offsetLayer.addChild(this._fieldSprite);
    };

    Scene_Tetris.prototype.createSidePanel = function() {
        this._sidePanelSprite = new Sprite();
        this._sidePanelSprite.bitmap = new Bitmap(160, FIELD_HEIGHT * CELL_SIZE + 4);
        this._offsetLayer.addChild(this._sidePanelSprite);
    };

    Scene_Tetris.prototype.createMessageWindow = function() {
        var width = 480;
        var height = 120;
        var rect = new Rectangle(
            (Graphics.boxWidth - width) / 2,
            (Graphics.boxHeight - height) / 2,
            width, height
        );
        this._messageWindow = new Window_Base(rect);
        this._messageWindow.visible = false;
        this._offsetLayer.addChild(this._messageWindow);
    };

    Scene_Tetris.prototype.showMessage = function(text, fontSize) {
        var win = this._messageWindow;
        win.contents.clear();
        win.contents.fontSize = fontSize || 36;
        win.drawText(text, 0, (win.contentsHeight() - win.lineHeight()) / 2, win.contentsWidth(), 'center');
        win.contents.fontSize = 28;
        win.visible = true;
    };

    Scene_Tetris.prototype.hideMessage = function() {
        this._messageWindow.visible = false;
    };

    Scene_Tetris.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        switch (this._state) {
            case 'intro':
                this.updateIntro();
                break;
            case 'countdown':
                this.updateCountdown();
                break;
            case 'playing':
                this.updatePlaying();
                break;
            case 'paused':
                this.updatePaused();
                break;
            case 'result':
                this.updateResult();
                break;
        }

        this.drawField();
        this.drawSidePanel();
    };

    Scene_Tetris.prototype.updateIntro = function() {
        if (this._introTimer === 0) {
            this.showMessage(this._gameData.introText, 30);
        }
        this._introTimer++;
        if (this._introTimer >= 60 || Input.isTriggered('ok')) {
            this._state = 'countdown';
            this._countdownTime = 0;
            this._currentCountdown = 3;
            this.showMessage('3', 60);
        }
    };

    Scene_Tetris.prototype.updateCountdown = function() {
        this._countdownTime++;
        if (this._countdownTime >= 40) {
            this._countdownTime = 0;
            this._currentCountdown--;
            if (this._currentCountdown > 0) {
                AudioManager.playSe({name: 'Cursor1', volume: 60, pitch: 100, pan: 0});
                this.showMessage(String(this._currentCountdown), 60);
            } else {
                AudioManager.playSe({name: 'Decision1', volume: 70, pitch: 100, pan: 0});
                this.hideMessage();
                this._gameData.start();
                this._state = 'playing';
            }
        }
    };

    Scene_Tetris.prototype.updatePlaying = function() {
        if (Input.isTriggered('cancel')) {
            this._state = 'paused';
            this.showMessage('일시정지\n결정: 계속하기   취소: 그만두기', 22);
            return;
        }

        this.handleInput();
        this._gameData.update();

        if (this._gameData.gameOver) {
            this._state = 'result';
            this._resultTimer = 0;
            if (this._gameData.success) {
                AudioManager.playSe({name: 'Item3', volume: 80, pitch: 100, pan: 0});
                this.showMessage('성공!\n목표 줄 수를 모두 지웠습니다!', 30);
            } else {
                AudioManager.playSe({name: 'Buzzer1', volume: 80, pitch: 100, pan: 0});
                this.showMessage('실패...', 34);
            }
        }
    };

    Scene_Tetris.prototype.updatePaused = function() {
        if (Input.isTriggered('ok')) {
            this.hideMessage();
            this._state = 'playing';
        } else if (Input.isTriggered('cancel')) {
            this._gameData.gameOver = true;
            this._gameData.success = false;
            this._state = 'result';
            this._resultTimer = 0;
            this.showMessage('중단됨...', 34);
        }
    };

    Scene_Tetris.prototype.updateResult = function() {
        this._resultTimer++;
        if (this._resultTimer >= 50 && (Input.isTriggered('ok') || Input.isTriggered('cancel') || this._resultTimer >= 120)) {
            this.finishGame();
        }
    };

    Scene_Tetris.prototype.handleInput = function() {
        var data = this._gameData;

        if (Input.isTriggered('left')) {
            data.moveCurrent(-1, 0);
            this._dasTimer.left = -14;
        } else if (Input.isPressed('left')) {
            this._dasTimer.left++;
            if (this._dasTimer.left >= 0 && this._dasTimer.left % 5 === 0) {
                data.moveCurrent(-1, 0);
            }
        } else {
            this._dasTimer.left = 0;
        }

        if (Input.isTriggered('right')) {
            data.moveCurrent(1, 0);
            this._dasTimer.right = -14;
        } else if (Input.isPressed('right')) {
            this._dasTimer.right++;
            if (this._dasTimer.right >= 0 && this._dasTimer.right % 5 === 0) {
                data.moveCurrent(1, 0);
            }
        } else {
            this._dasTimer.right = 0;
        }

        if (Input.isPressed('down')) {
            if (Graphics.frameCount % 2 === 0) {
                if (data.moveCurrent(0, 1)) {
                    data.score += 1;
                    data.fallTimer = 0;
                }
            }
        }

        if (Input.isTriggered('up')) {
            data.rotateCurrent();
        }

        if (Input.isTriggered('pagedown') || Input.isTriggered('shift')) {
            data.hardDrop();
        }
    };

    Scene_Tetris.prototype.drawField = function() {
        var bmp = this._fieldSprite.bitmap;
        bmp.clear();
        bmp.fillRect(0, 0, bmp.width, bmp.height, '#000000');
        bmp.fillRect(2, 2, bmp.width - 4, bmp.height - 4, '#1c1c26');

        // 격자
        for (var gx = 0; gx <= FIELD_WIDTH; gx++) {
            bmp.fillRect(2 + gx * CELL_SIZE, 2, 1, FIELD_HEIGHT * CELL_SIZE, '#2a2a38');
        }
        for (var gy = 0; gy <= FIELD_HEIGHT; gy++) {
            bmp.fillRect(2, 2 + gy * CELL_SIZE, FIELD_WIDTH * CELL_SIZE, 1, '#2a2a38');
        }

        var data = this._gameData;

        // 쌓인 블록
        for (var y = 0; y < FIELD_HEIGHT; y++) {
            for (var x = 0; x < FIELD_WIDTH; x++) {
                var color = data.field[y][x];
                if (color) {
                    this.drawCell(bmp, x, y, color, 1);
                }
            }
        }

        // 고스트 & 현재 블록
        if (data.current && this._state === 'playing') {
            var ghostY = data.ghostY();
            var color = TETROMINOES[data.current.key].color;
            var ghostCells = data.cellsOf({key: data.current.key, rotation: data.current.rotation, x: data.current.x, y: ghostY});
            for (var i = 0; i < ghostCells.length; i++) {
                if (ghostCells[i][1] >= 0) {
                    this.drawCell(bmp, ghostCells[i][0], ghostCells[i][1], color, 0.25);
                }
            }

            var cells = data.cellsOf(data.current);
            for (var j = 0; j < cells.length; j++) {
                if (cells[j][1] >= 0) {
                    this.drawCell(bmp, cells[j][0], cells[j][1], color, 1);
                }
            }
        }
    };

    Scene_Tetris.prototype.drawCell = function(bmp, x, y, color, alpha) {
        var px = 2 + x * CELL_SIZE;
        var py = 2 + y * CELL_SIZE;
        var prevAlpha = bmp.paintOpacity;
        bmp.paintOpacity = alpha * 255;
        bmp.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2, color);
        bmp.paintOpacity = prevAlpha;
    };

    Scene_Tetris.prototype.drawSidePanel = function() {
        var bmp = this._sidePanelSprite.bitmap;
        bmp.clear();

        var data = this._gameData;
        bmp.fontSize = 20;
        bmp.textColor = '#ffffff';
        bmp.drawText('NEXT', 0, 0, 160, 24, 'left');
        bmp.fontSize = 24;

        var y = 30;
        bmp.fillRect(0, y, 100, 80, '#1c1c26');
        if (data.next) {
            this.drawMiniPiece(bmp, data.next, 10, y + 10);
        }

        y += 100;
        bmp.fontSize = 18;
        bmp.textColor = '#cccccc';
        bmp.drawText('목표 줄 수', 0, y, 160, 20, 'left');
        bmp.fontSize = 26;
        bmp.textColor = '#ffffff';
        bmp.drawText(data.linesCleared + ' / ' + data.linesToClear, 0, y + 22, 160, 28, 'left');

        y += 60;
        bmp.fontSize = 18;
        bmp.textColor = '#cccccc';
        bmp.drawText('점수', 0, y, 160, 20, 'left');
        bmp.fontSize = 26;
        bmp.textColor = '#ffffff';
        bmp.drawText(String(data.score), 0, y + 22, 160, 28, 'left');

        if (data.timeLimit > 0) {
            y += 60;
            var remain = Math.max(0, Math.ceil((data.timeLimit - data.timeElapsed) / 60));
            bmp.fontSize = 18;
            bmp.textColor = '#cccccc';
            bmp.drawText('남은 시간', 0, y, 160, 20, 'left');
            bmp.fontSize = 26;
            bmp.textColor = remain <= 10 ? '#ff6060' : '#ffffff';
            bmp.drawText(remain + '초', 0, y + 22, 160, 28, 'left');
        }
    };

    Scene_Tetris.prototype.drawMiniPiece = function(bmp, key, ox, oy) {
        var shape = TETROMINOES[key].shapes[0];
        var color = TETROMINOES[key].color;
        var size = 16;
        // 중심 정렬을 위해 셀 범위 계산
        var minX = 4, maxX = 0, minY = 4, maxY = 0;
        for (var i = 0; i < shape.length; i++) {
            minX = Math.min(minX, shape[i][0]);
            maxX = Math.max(maxX, shape[i][0]);
            minY = Math.min(minY, shape[i][1]);
            maxY = Math.max(maxY, shape[i][1]);
        }
        var offsetX = ox + (80 - (maxX - minX + 1) * size) / 2 - minX * size;
        var offsetY = oy + (60 - (maxY - minY + 1) * size) / 2 - minY * size;
        for (var j = 0; j < shape.length; j++) {
            bmp.fillRect(
                offsetX + shape[j][0] * size + 1,
                offsetY + shape[j][1] * size + 1,
                size - 2, size - 2, color
            );
        }
    };

    Scene_Tetris.prototype.finishGame = function() {
        var isSuccess = this._gameData.success;

        if (this._gameData.switchId > 0) {
            $gameSwitches.setValue(this._gameData.switchId, isSuccess);
        }
        if (this._gameData.variableId > 0) {
            $gameVariables.setValue(this._gameData.variableId, this._gameData.linesCleared);
        }
        if (this._gameData.variable2Id > 0) {
            $gameVariables.setValue(this._gameData.variable2Id, this._gameData.score);
        }

        if (this._followersWereVisible) {
            $gamePlayer.followers().show();
        }

        var eventId = isSuccess ? this._gameData.successEventId : this._gameData.failEventId;
        if (eventId > 0) {
            var commonEvent = $dataCommonEvents[eventId];
            if (commonEvent) {
                var interpreter = new Game_Interpreter();
                interpreter.setup(commonEvent.list, 0);
                $tetrisPendingInterpreter = interpreter;
            } else {
                console.warn('[Tetris] 경고: 공통 이벤트 ' + eventId + '번이 존재하지 않습니다.');
            }
        }

        $tetrisGameData = null;
        SceneManager.pop();
    };

    //=========================================================================
    // 예약된 공통 이벤트를 독립적으로 확실하게 실행
    //=========================================================================

    var _Scene_Map_update_tetris = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update_tetris.call(this);

        if ($tetrisPendingInterpreter) {
            $tetrisPendingInterpreter.update();
            if (!$tetrisPendingInterpreter.isRunning()) {
                $tetrisPendingInterpreter = null;
            }
        }
    };

    //=========================================================================
    // 플러그인 커맨드
    //=========================================================================

    var _Game_Interpreter_pluginCommand_tetris = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand_tetris.call(this, command, args);

        if (command === 'Tetris_Start') {
            this.startTetrisGame(args);
        }
    };

    Game_Interpreter.prototype.startTetrisGame = function(args) {
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

        $tetrisGameData = new Game_Tetris();

        if (options.lines) $tetrisGameData.linesToClear = parseInt(options.lines);
        if (options.switch) $tetrisGameData.switchId = parseInt(options.switch);
        if (options.variable) $tetrisGameData.variableId = parseInt(options.variable);
        if (options.variable2) $tetrisGameData.variable2Id = parseInt(options.variable2);
        if (options.timelimit) $tetrisGameData.timeLimit = parseInt(options.timelimit);
        if (options.successevent) $tetrisGameData.successEventId = parseInt(options.successevent);
        if (options.failevent) $tetrisGameData.failEventId = parseInt(options.failevent);
        if (options.introtext) $tetrisGameData.introText = options.introtext;

        SceneManager.push(Scene_Tetris);
    };

    window.Scene_Tetris = Scene_Tetris;
    window.Game_Tetris = Game_Tetris;

})();
