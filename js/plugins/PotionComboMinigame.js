//=============================================================================
// PotionComboMinigame.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 여러 색의 약물 중 정해진 색들을 골라 플라스크에 조합하는
 * 미니게임. 정답 조합이면 성공, 아니면 실패(재도전/기회 제한 가능).
 * @author RSM
 *
 * @param Default Colors
 * @desc 커맨드에서 colors: 생략 시 놓일 약물 색 목록 (쉼표 구분)
 * @default red,blue,yellow,green
 *
 * @param Default Switch
 * @desc 성공 시 ON될 스위치 ID (0=사용안함)
 * @default 1
 *
 * @param Default Fail Switch
 * @desc 성공하지 못하고 끝났을 때(기회 소진/포기) ON될 스위치 ID (0=사용안함)
 * @default 0
 *
 * @param Default Variable
 * @desc 시도 횟수가 저장될 변수 ID (0=사용안함)
 * @default 0
 *
 * @param Default Common Event
 * @desc 미니게임이 끝난 뒤 실행할 커먼 이벤트 ID (0=사용안함)
 * @default 0
 *
 * @param Default Tries
 * @desc 허용 시도 횟수 (0이면 무제한)
 * @default 0
 *
 * @param Default Order Matters
 * @desc 넣는 순서도 맞아야 성공 (true/false)
 * @default false
 *
 * @param Default Show Hint
 * @desc 상단에 정답 색을 미리 보여줄지 (true/false)
 * @default false
 *
 * @param Default Can Quit
 * @desc 플라스크가 비었을 때 취소키로 포기할 수 있게 할지 (true/false)
 * @default false
 *
 * @param Show Labels
 * @desc 약물 아래에 색 이름 표시 (true/false)
 * @default true
 *
 * @param Color Labels
 * @desc 색 이름 표시 문구 (id:이름 쉼표 구분). 언어별로 바꿔 쓰세요.
 * @default red:빨강,blue:파랑,yellow:노랑,green:초록,purple:보라,orange:주황,pink:분홍,white:하양,black:검정,cyan:하늘
 *
 * @param Fill Frames
 * @desc 약물 한 칸이 차오르는 시간(프레임)
 * @default 12
 *
 * @param Mix Frames
 * @desc 플라스크가 가득 찬 뒤 섞이는 연출 시간(프레임)
 * @default 60
 *
 * @param Drain Frames
 * @desc 실패 후 플라스크가 비워지는 시간(프레임)
 * @default 20
 *
 * @param Result Hold Frames
 * @desc 성공/최종 실패 결과를 보여주는 시간(프레임)
 * @default 90
 *
 * @param Fade Out Frames
 * @desc 종료 시 화면이 사라지는 시간(프레임)
 * @default 40
 *
 * @param Dim Background
 * @desc 미니게임 중 배경을 어둡게 할지 (true/false)
 * @default true
 *
 * @param Guide Text
 * @default 약물을 골라 정답 색을 조합하세요
 *
 * @param Mixing Text
 * @default 섞는 중...
 *
 * @param Success Text
 * @default 조합 성공!
 *
 * @param Fail Text
 * @default 조합 실패...
 *
 * @param Quit Text
 * @default 포기했다
 *
 * @param Tries Text
 * @desc 남은 기회 문구 (%1 = 남은 횟수)
 * @default 남은 기회: %1
 *
 * @param Hint Text
 * @default 정답 색
 *
 * @param Undo Label
 * @default 되돌리기
 *
 * @param Clear Label
 * @default 비우기
 *
 * @param Quit Label
 * @default 포기
 *
 * @param Add SE Name
 * @default Water1
 *
 * @param Add SE Volume
 * @default 60
 *
 * @param Add SE Pitch
 * @default 140
 *
 * @param Cursor SE Name
 * @default Cursor1
 *
 * @param Mix SE Name
 * @default Water1
 *
 * @param Success SE Name
 * @default Saved1
 *
 * @param Fail SE Name
 * @default Buzzer1
 *
 * @help
 * ----------------------------------------------------------------------------
 * 사용법
 * ----------------------------------------------------------------------------
 * 이벤트의 "플러그인 커맨드" 칸에 아래처럼 입력하세요.
 *
 *   PotionCombo_Start colors:red,blue,yellow target:red,yellow switch:5
 *
 * colors   : 화면 아래에 놓일 약물 색 목록 (생략 시 Default Colors)
 * target   : 정답 조합 (필수). 같은 색을 여러 번 쓸 수 있음 (red,red,blue)
 *            ※ 칸 수 = 정답 색 개수. colors에 없는 정답 색은 자동 추가됨
 * switch   : 성공 시 ON 될 스위치 ID
 * fswitch  : 성공 못 하고 끝났을 때 ON 될 스위치 ID
 * variable : 시도 횟수가 저장될 변수 ID
 * scommon  : 종료 후 실행할 커먼 이벤트 ID
 * tries    : 허용 시도 횟수 (0=무제한)
 * order    : true면 넣는 순서까지 맞아야 성공 (기본 false)
 * hint     : true면 상단에 정답 색 표시 (기본 false)
 * canquit  : true면 플라스크가 빈 상태에서 취소키로 포기 가능 (기본 false)
 *
 * 사용 가능한 색 이름
 * ----------------------------------------------------------------------------
 *   red, blue, yellow, green, purple, orange, pink, white, black, cyan
 *   또는 #ff8800 같은 색상 코드 (이름 표시는 비어 있음)
 *
 * 조작
 * ----------------------------------------------------------------------------
 *   마우스/터치 : 약물 클릭으로 플라스크에 넣기, 우측 버튼으로 되돌리기/비우기
 *   키보드      : 좌우 = 선택, 확인 = 넣기, 취소 = 마지막 약물 되돌리기
 *   마우스 우클릭 = 되돌리기
 *
 * 칸이 가득 차면 자동으로 섞이며 판정됩니다. 정답이면 성공, 아니면 플라스크가
 * 비워지고 다시 도전합니다(tries 제한 시 기회 소진되면 종료).
 * 별도 이미지 파일은 필요 없습니다.
 *
 * ※ PotionMixMinigame(방울 투입/색 일치율 방식)과는 별개 플러그인이며
 *    플러그인 커맨드도 다릅니다(PotionCombo_Start).
 * ----------------------------------------------------------------------------
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('PotionComboMinigame');

    function numParam(name, def) {
        var v = parameters[name];
        if (v === undefined || v === '') return def;
        var n = Number(v);
        return isNaN(n) ? def : n;
    }
    function strParam(name, def) {
        var v = parameters[name];
        return (v === undefined) ? def : String(v);
    }
    function boolParam(name, def) {
        var v = parameters[name];
        if (v === undefined || v === '') return def;
        return String(v) === 'true';
    }

    var defaultColors     = strParam('Default Colors', 'red,blue,yellow,green');
    var defaultSwitch     = numParam('Default Switch', 1);
    var defaultFailSwitch = numParam('Default Fail Switch', 0);
    var defaultVariable   = numParam('Default Variable', 0);
    var defaultCommon     = numParam('Default Common Event', 0);
    var defaultTries      = numParam('Default Tries', 0);
    var defaultOrder      = boolParam('Default Order Matters', false);
    var defaultHint       = boolParam('Default Show Hint', false);
    var defaultCanQuit    = boolParam('Default Can Quit', false);

    var showLabels = boolParam('Show Labels', true);

    var fillFrames   = Math.max(1, numParam('Fill Frames', 12));
    var mixFrames    = Math.max(1, numParam('Mix Frames', 60));
    var drainFrames  = Math.max(1, numParam('Drain Frames', 20));
    var holdFrames   = numParam('Result Hold Frames', 90);
    var fadeFrames   = Math.max(1, numParam('Fade Out Frames', 40));
    var dimBackground = boolParam('Dim Background', true);

    var guideText   = strParam('Guide Text', '약물을 골라 정답 색을 조합하세요');
    var mixingText  = strParam('Mixing Text', '섞는 중...');
    var successText = strParam('Success Text', '조합 성공!');
    var failText    = strParam('Fail Text', '조합 실패...');
    var quitText    = strParam('Quit Text', '포기했다');
    var triesText   = strParam('Tries Text', '남은 기회: %1');
    var hintText    = strParam('Hint Text', '정답 색');
    var undoLabel   = strParam('Undo Label', '되돌리기');
    var clearLabel  = strParam('Clear Label', '비우기');
    var quitLabel   = strParam('Quit Label', '포기');

    var addSe     = { name: strParam('Add SE Name', 'Water1'), volume: numParam('Add SE Volume', 60), pitch: numParam('Add SE Pitch', 140) };
    var cursorSe  = { name: strParam('Cursor SE Name', 'Cursor1'), volume: 70, pitch: 100 };
    var mixSe     = { name: strParam('Mix SE Name', 'Water1'), volume: 60, pitch: 70 };
    var successSe = { name: strParam('Success SE Name', 'Saved1'), volume: 80, pitch: 100 };
    var failSe    = { name: strParam('Fail SE Name', 'Buzzer1'), volume: 70, pitch: 100 };

    function playSe(se) {
        if (se && se.name) {
            AudioManager.playSe({ name: se.name, volume: se.volume, pitch: se.pitch, pan: 0 });
        }
    }

    //-------------------------------------------------------------------------
    // 색상 정의
    //-------------------------------------------------------------------------
    var COLOR_HEX = {
        red: '#e53935', blue: '#2979ff', yellow: '#fdd835', green: '#43a047',
        purple: '#8e44ad', orange: '#fb8c00', pink: '#f48fb1', white: '#f5f5f5',
        black: '#263238', cyan: '#26c6da'
    };

    var colorLabels = {};
    strParam('Color Labels', '').split(',').forEach(function(pair) {
        var p = pair.split(':');
        if (p.length >= 2) {
            colorLabels[p[0].trim().toLowerCase()] = p.slice(1).join(':').trim();
        }
    });

    function resolveColor(id) {
        id = String(id).trim().toLowerCase();
        if (COLOR_HEX[id]) {
            return { id: id, hex: COLOR_HEX[id], label: colorLabels[id] || id };
        }
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(id)) {
            return { id: id, hex: id, label: colorLabels[id] || '' };
        }
        return null;
    }

    function resolveList(str) {
        var list = [];
        String(str).split(',').forEach(function(s) {
            if (!s.trim()) return;
            var c = resolveColor(s);
            if (c) {
                list.push(c);
            } else {
                console.warn('PotionComboMinigame: 알 수 없는 색상 - ' + s);
            }
        });
        return list;
    }

    function hexToRgb(hex) {
        var h = hex.replace('#', '');
        if (h.length === 3) {
            h = h.split('').map(function(c) { return c + c; }).join('');
        }
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    function rgbCss(c, a) {
        return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a === undefined ? 1 : a) + ')';
    }

    function roundRectPath(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    function parseCommand(args) {
        var opt = {
            colorIds: defaultColors,
            targetIds: '',
            switchId: defaultSwitch,
            failSwitchId: defaultFailSwitch,
            variableId: defaultVariable,
            commonId: defaultCommon,
            tries: defaultTries,
            order: defaultOrder,
            hint: defaultHint,
            canQuit: defaultCanQuit
        };
        args.forEach(function(arg) {
            var idx = arg.indexOf(':');
            if (idx < 0) return;
            var key = arg.slice(0, idx).toLowerCase();
            var val = arg.slice(idx + 1);
            switch (key) {
                case 'colors':   opt.colorIds = val; break;
                case 'target':   opt.targetIds = val; break;
                case 'switch':   opt.switchId = Number(val); break;
                case 'fswitch':  opt.failSwitchId = Number(val); break;
                case 'variable': opt.variableId = Number(val); break;
                case 'scommon':  opt.commonId = Number(val); break;
                case 'tries':    opt.tries = Number(val); break;
                case 'order':    opt.order = (val === 'true'); break;
                case 'hint':     opt.hint = (val === 'true'); break;
                case 'canquit':  opt.canQuit = (val === 'true'); break;
            }
        });
        return opt;
    }

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'PotionCombo_Start') {
            var scene = SceneManager._scene;
            if (!scene || !scene.startPotionCombo) return;
            if (scene.startPotionCombo(this, parseCommand(args))) {
                this.setWaitMode('potionCombo');
            }
        }
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'potionCombo') {
            if (SceneManager._scene._potionComboSprite) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_PotionCombo  (미니게임 본체)
    //-------------------------------------------------------------------------
    var FLASK_W = 150;
    var FLASK_H = 200;
    var BOTTLE_W = 90;
    var BOTTLE_H = 150;
    var BTN_W = 110;
    var BTN_H = 36;

    function Sprite_PotionCombo() {
        this.initialize.apply(this, arguments);
    }

    Sprite_PotionCombo.prototype = Object.create(Sprite.prototype);
    Sprite_PotionCombo.prototype.constructor = Sprite_PotionCombo;

    Sprite_PotionCombo.prototype.initialize = function(interpreter, opt, bottles, target) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._opt = opt;
        this._bottles = bottles;
        this._target = target;
        this._slots = target.length;

        this._layers = [];
        this._state = 'select';
        this._result = null;
        this._index = 0;
        this._attempts = 0;
        this._timer = 0;
        this._startWait = 10;
        this._drain = 1;
        this._mixRatio = 0;
        this._mixColor = [255, 255, 255];
        this._bubbles = [];
        this._flaskDirty = true;
        this._lastTx = -1;
        this._lastTy = -1;

        var W = Graphics.boxWidth;
        var H = Graphics.boxHeight;
        this._flaskX = Math.round((W - FLASK_W) / 2);
        this._flaskY = Math.round(H * 0.5 - FLASK_H * 0.6);
        this._bottleBaseY = H - 20;

        this.createTexts();
        if (opt.hint) this.createHint();
        this.createFlask();
        this.createBottles();
        this.createCursor();
        this.createButtons();
        this.refreshTexts(guideText, '#ffffff');
    };

    //--- 생성 ------------------------------------------------------------------

    Sprite_PotionCombo.prototype.createTexts = function() {
        this._textBitmap = new Bitmap(Graphics.boxWidth, 70);
        this._textSprite = new Sprite(this._textBitmap);
        this._textSprite.y = 24;
        this.addChild(this._textSprite);
    };

    Sprite_PotionCombo.prototype.refreshTexts = function(text, color) {
        var b = this._textBitmap;
        var W = Graphics.boxWidth;
        b.clear();
        b.outlineColor = 'rgba(0,0,0,0.8)';
        b.outlineWidth = 5;
        b.fontSize = 26;
        b.textColor = color || '#ffffff';
        b.drawText(text, 0, 0, W, 32, 'center');
        if (this._opt.tries > 0) {
            var left = Math.max(0, this._opt.tries - this._attempts);
            b.fontSize = 20;
            b.textColor = '#ffe08a';
            b.drawText(triesText.replace('%1', left), 0, 36, W, 28, 'center');
        }
    };

    Sprite_PotionCombo.prototype.createHint = function() {
        var W = Graphics.boxWidth;
        var b = new Bitmap(W, 60);
        b.outlineColor = 'rgba(0,0,0,0.8)';
        b.outlineWidth = 4;
        b.fontSize = 18;
        b.textColor = '#bbbbbb';
        b.drawText(hintText, 0, 0, W, 22, 'center');
        var n = this._target.length;
        var gap = 38;
        var startX = (W - gap * (n - 1)) / 2;
        var c = b.context;
        for (var i = 0; i < n; i++) {
            c.beginPath();
            c.arc(startX + i * gap, 40, 14, 0, Math.PI * 2, false);
            c.fillStyle = this._target[i].hex;
            c.fill();
            c.lineWidth = 2;
            c.strokeStyle = 'rgba(255,255,255,0.85)';
            c.stroke();
        }
        b._setDirty();
        var s = new Sprite(b);
        s.y = this._flaskY - 66;
        this.addChild(s);
    };

    Sprite_PotionCombo.prototype.createFlask = function() {
        this._flaskBitmap = new Bitmap(FLASK_W, FLASK_H);
        this._flaskSprite = new Sprite(this._flaskBitmap);
        this._flaskSprite.x = this._flaskX;
        this._flaskSprite.y = this._flaskY;
        this.addChild(this._flaskSprite);
    };

    Sprite_PotionCombo.prototype.makeBottleBitmap = function(color) {
        var b = new Bitmap(BOTTLE_W, BOTTLE_H);
        var c = b.context;
        var rgb = hexToRgb(color.hex);

        // 목
        c.fillStyle = 'rgba(255,255,255,0.12)';
        c.fillRect(35, 20, 20, 28);
        c.lineWidth = 2;
        c.strokeStyle = 'rgba(255,255,255,0.8)';
        c.strokeRect(35, 20, 20, 28);

        // 몸통 유리
        roundRectPath(c, 15, 44, 60, 74, 14);
        c.fillStyle = 'rgba(255,255,255,0.12)';
        c.fill();

        // 액체
        c.save();
        roundRectPath(c, 15, 44, 60, 74, 14);
        c.clip();
        c.fillStyle = rgbCss(rgb, 0.95);
        c.fillRect(15, 62, 60, 60);
        c.fillStyle = 'rgba(255,255,255,0.25)';
        c.fillRect(15, 62, 60, 3);
        c.restore();

        // 몸통 테두리
        roundRectPath(c, 15, 44, 60, 74, 14);
        c.lineWidth = 2;
        c.strokeStyle = 'rgba(255,255,255,0.8)';
        c.stroke();

        // 코르크
        roundRectPath(c, 32, 10, 26, 12, 3);
        c.fillStyle = '#a1744a';
        c.fill();

        // 하이라이트
        c.beginPath();
        c.moveTo(24, 56);
        c.lineTo(24, 102);
        c.lineWidth = 3;
        c.lineCap = 'round';
        c.strokeStyle = 'rgba(255,255,255,0.45)';
        c.stroke();

        if (showLabels && color.label) {
            b.outlineColor = 'rgba(0,0,0,0.8)';
            b.outlineWidth = 4;
            b.fontSize = 18;
            b.textColor = '#ffffff';
            b.drawText(color.label, 0, 124, BOTTLE_W, 24, 'center');
        }
        b._setDirty();
        return b;
    };

    Sprite_PotionCombo.prototype.createBottles = function() {
        var W = Graphics.boxWidth;
        var n = this._bottles.length;
        var spacing = Math.min(110, (W - 60) / n);
        var startX = (W - spacing * (n - 1)) / 2;
        this._bottleSprites = [];
        for (var i = 0; i < n; i++) {
            var s = new Sprite(this.makeBottleBitmap(this._bottles[i]));
            s.anchor.x = 0.5;
            s.anchor.y = 1;
            s.x = Math.round(startX + spacing * i);
            s._baseY = this._bottleBaseY;
            s._lift = 0;
            s.y = s._baseY;
            this.addChild(s);
            this._bottleSprites.push(s);
        }
    };

    Sprite_PotionCombo.prototype.createCursor = function() {
        var b = new Bitmap(BOTTLE_W + 10, BOTTLE_H + 10);
        var c = b.context;
        roundRectPath(c, 3, 3, BOTTLE_W + 4, BOTTLE_H + 4, 12);
        c.lineWidth = 3;
        c.strokeStyle = 'rgba(255,255,255,0.9)';
        c.stroke();
        b._setDirty();
        this._cursor = new Sprite(b);
        this._cursor.anchor.x = 0.5;
        this._cursor.anchor.y = 1;
        this.addChild(this._cursor);
    };

    Sprite_PotionCombo.prototype.makeButtonBitmap = function(label) {
        var b = new Bitmap(BTN_W, BTN_H);
        var c = b.context;
        roundRectPath(c, 1, 1, BTN_W - 2, BTN_H - 2, 8);
        c.fillStyle = 'rgba(255,255,255,0.15)';
        c.fill();
        c.lineWidth = 2;
        c.strokeStyle = 'rgba(255,255,255,0.7)';
        c.stroke();
        b.fontSize = 18;
        b.textColor = '#ffffff';
        b.drawText(label, 0, 0, BTN_W, BTN_H, 'center');
        b._setDirty();
        return b;
    };

    Sprite_PotionCombo.prototype.createButtons = function() {
        this._buttons = [];
        var defs = [
            { action: 'undo', label: undoLabel },
            { action: 'clear', label: clearLabel }
        ];
        if (this._opt.canQuit) defs.push({ action: 'quit', label: quitLabel });
        var bx = this._flaskX + FLASK_W + 24;
        for (var i = 0; i < defs.length; i++) {
            var s = new Sprite(this.makeButtonBitmap(defs[i].label));
            s.x = bx;
            s.y = this._flaskY + 40 + i * 46;
            s.opacity = 190;
            s._action = defs[i].action;
            this.addChild(s);
            this._buttons.push(s);
        }
    };

    //--- 플라스크 그리기 ---------------------------------------------------------

    Sprite_PotionCombo.prototype.drawFlask = function() {
        var b = this._flaskBitmap;
        var c = b.context;
        var fw = FLASK_W, fh = FLASK_H;
        b.clear();

        var gx = 16, gy = 14, gw = fw - 32, gh = fh - 26;
        var lx = gx + 4, lw = gw - 8;
        var lbottom = gy + gh - 4;
        var ltotal = gh - 26;
        var lh = ltotal / this._slots;
        var d = this._drain;

        // 유리 안쪽
        roundRectPath(c, gx, gy, gw, gh, 18);
        c.fillStyle = 'rgba(255,255,255,0.08)';
        c.fill();

        // 액체
        c.save();
        roundRectPath(c, gx + 3, gy + 3, gw - 6, gh - 6, 15);
        c.clip();
        for (var i = 0; i < this._layers.length; i++) {
            var layer = this._layers[i];
            var col = layer.rgb;
            if (this._mixRatio > 0) {
                var t = this._mixRatio;
                var m = this._mixColor;
                col = [col[0] + (m[0] - col[0]) * t, col[1] + (m[1] - col[1]) * t, col[2] + (m[2] - col[2]) * t];
            }
            var h = lh * d * layer.progress;
            var top = lbottom - i * lh * d - h;
            c.fillStyle = rgbCss(col, 0.95);
            c.fillRect(lx, top, lw, h + 1);
            c.fillStyle = 'rgba(255,255,255,0.18)';
            c.fillRect(lx, top, lw, 2);
        }
        // 거품
        c.strokeStyle = 'rgba(255,255,255,0.7)';
        c.lineWidth = 1.5;
        for (var j = 0; j < this._bubbles.length; j++) {
            var bub = this._bubbles[j];
            c.beginPath();
            c.arc(bub.x, bub.y, bub.r, 0, Math.PI * 2, false);
            c.stroke();
        }
        c.restore();

        // 눈금
        c.strokeStyle = 'rgba(255,255,255,0.45)';
        c.lineWidth = 2;
        for (var k = 1; k < this._slots; k++) {
            var ty = lbottom - k * lh;
            c.beginPath();
            c.moveTo(gx + gw - 14, ty);
            c.lineTo(gx + gw - 4, ty);
            c.stroke();
        }

        // 테두리
        var outline = 'rgba(255,255,255,0.85)';
        if (this._result === 'success') {
            var pulse = 0.6 + 0.4 * Math.sin(Graphics.frameCount * 0.2);
            outline = 'rgba(130,255,170,' + pulse.toFixed(2) + ')';
        } else if (this._state === 'fail') {
            outline = 'rgba(255,90,90,0.95)';
        }
        roundRectPath(c, gx, gy, gw, gh, 18);
        c.lineWidth = 3;
        c.strokeStyle = outline;
        c.stroke();

        // 입구 테두리
        c.beginPath();
        c.moveTo(gx - 6, gy);
        c.lineTo(gx + gw + 6, gy);
        c.lineWidth = 3;
        c.lineCap = 'round';
        c.strokeStyle = outline;
        c.stroke();

        // 하이라이트
        c.beginPath();
        c.moveTo(gx + 10, gy + 24);
        c.lineTo(gx + 10, gy + gh - 40);
        c.lineWidth = 3;
        c.strokeStyle = 'rgba(255,255,255,0.3)';
        c.stroke();

        b._setDirty();
    };

    //--- 입력 / 판정 도우미 ------------------------------------------------------

    Sprite_PotionCombo.prototype.bottleIndexAt = function(x, y) {
        for (var i = 0; i < this._bottleSprites.length; i++) {
            var s = this._bottleSprites[i];
            if (Math.abs(x - s.x) <= BOTTLE_W / 2 && y >= s._baseY - BOTTLE_H && y <= s._baseY) {
                return i;
            }
        }
        return -1;
    };

    Sprite_PotionCombo.prototype.buttonAt = function(x, y) {
        for (var i = 0; i < this._buttons.length; i++) {
            var s = this._buttons[i];
            if (x >= s.x && x <= s.x + BTN_W && y >= s.y && y <= s.y + BTN_H) {
                return s;
            }
        }
        return null;
    };

    Sprite_PotionCombo.prototype.layersFull = function() {
        if (this._layers.length < this._slots) return false;
        return this._layers.every(function(l) { return l.progress >= 1; });
    };

    Sprite_PotionCombo.prototype.addColor = function(i) {
        if (this._layers.length >= this._slots) return;
        var col = this._bottles[i];
        this._layers.push({ color: col, rgb: hexToRgb(col.hex), progress: 0 });
        this._flaskDirty = true;
        playSe(addSe);
    };

    Sprite_PotionCombo.prototype.undo = function() {
        if (this._layers.length === 0) return;
        this._layers.pop();
        this._flaskDirty = true;
        playSe(cursorSe);
    };

    Sprite_PotionCombo.prototype.clearAll = function() {
        if (this._layers.length === 0) return;
        this._layers = [];
        this._flaskDirty = true;
        playSe(cursorSe);
    };

    Sprite_PotionCombo.prototype.quit = function() {
        this._result = 'fail';
        this._state = 'holding';
        this._timer = 20;
        this.refreshTexts(quitText, '#ff9090');
        playSe(failSe);
    };

    Sprite_PotionCombo.prototype.isCorrect = function() {
        var chosen = this._layers.map(function(l) { return l.color.id; });
        var target = this._target.map(function(c) { return c.id; });
        if (!this._opt.order) {
            chosen.sort();
            target.sort();
        }
        return chosen.join('|') === target.join('|');
    };

    //--- 상태 갱신 -----------------------------------------------------------

    Sprite_PotionCombo.prototype.update = function() {
        Sprite.prototype.update.call(this);
        $gameTemp.clearDestination();

        switch (this._state) {
            case 'select':   this.updateSelect(); break;
            case 'mixing':   this.updateMixing(); break;
            case 'fail':     this.updateFail(); break;
            case 'draining': this.updateDraining(); break;
            case 'holding':  this.updateHolding(); break;
            case 'fading':   this.updateFading(); break;
        }
        this.updateFlask();
        this.updateBottles();
    };

    Sprite_PotionCombo.prototype.updateFlask = function() {
        var animating = false;
        this._layers.forEach(function(l) {
            if (l.progress < 1) {
                l.progress = Math.min(1, l.progress + 1 / fillFrames);
                animating = true;
            }
        });
        var always = (this._state === 'mixing' || this._state === 'draining' ||
                      this._state === 'fail' || this._result === 'success');
        if (animating || always || this._flaskDirty) {
            this.drawFlask();
            this._flaskDirty = false;
        }
        if (this._state === 'fail') {
            var t = this._timer / 30;
            this._flaskSprite.x = this._flaskX + Math.sin(this._timer * 1.3) * 8 * t;
        } else {
            this._flaskSprite.x = this._flaskX;
        }
    };

    Sprite_PotionCombo.prototype.updateBottles = function() {
        var active = (this._state === 'select');
        for (var i = 0; i < this._bottleSprites.length; i++) {
            var s = this._bottleSprites[i];
            var sel = active && i === this._index;
            var targetScale = sel ? 1.1 : 1;
            var targetLift = sel ? 8 : 0;
            s.scale.x += (targetScale - s.scale.x) * 0.3;
            s.scale.y = s.scale.x;
            s._lift += (targetLift - s._lift) * 0.3;
            s.y = s._baseY - s._lift;
        }
        var cs = this._bottleSprites[this._index];
        this._cursor.visible = active;
        this._cursor.x = cs.x;
        this._cursor.y = cs._baseY + 5 - cs._lift;
        this._cursor.scale.x = this._cursor.scale.y = cs.scale.x;
        this._cursor.opacity = 170 + Math.round(70 * Math.sin(Graphics.frameCount * 0.12));
    };

    Sprite_PotionCombo.prototype.updateSelect = function() {
        if (this._startWait > 0) {
            this._startWait--;
            return;
        }
        var tx = TouchInput.x;
        var ty = TouchInput.y;

        // 마우스 이동 시 호버
        if (tx !== this._lastTx || ty !== this._lastTy) {
            this._lastTx = tx;
            this._lastTy = ty;
            var hi = this.bottleIndexAt(tx, ty);
            if (hi >= 0 && hi !== this._index) {
                this._index = hi;
                playSe(cursorSe);
            }
        }
        var hoverBtn = this.buttonAt(tx, ty);
        this._buttons.forEach(function(s) {
            s.opacity = (s === hoverBtn) ? 255 : 190;
        });

        // 키보드
        var n = this._bottleSprites.length;
        if (Input.isRepeated('right')) {
            this._index = (this._index + 1) % n;
            playSe(cursorSe);
        } else if (Input.isRepeated('left')) {
            this._index = (this._index + n - 1) % n;
            playSe(cursorSe);
        }
        if (Input.isTriggered('ok')) {
            this.addColor(this._index);
        }
        if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
            if (this._layers.length === 0 && this._opt.canQuit) {
                this.quit();
                return;
            }
            this.undo();
        }

        // 터치/클릭
        if (TouchInput.isTriggered()) {
            var bi = this.bottleIndexAt(tx, ty);
            if (bi >= 0) {
                this._index = bi;
                this.addColor(bi);
            } else {
                var btn = this.buttonAt(tx, ty);
                if (btn) {
                    if (btn._action === 'undo') this.undo();
                    else if (btn._action === 'clear') this.clearAll();
                    else if (btn._action === 'quit') { this.quit(); return; }
                }
            }
        }

        if (this.layersFull()) {
            this.startMixing();
        }
    };

    Sprite_PotionCombo.prototype.startMixing = function() {
        var sum = [0, 0, 0];
        this._layers.forEach(function(l) {
            sum[0] += l.rgb[0]; sum[1] += l.rgb[1]; sum[2] += l.rgb[2];
        });
        var n = this._layers.length;
        this._mixColor = [sum[0] / n, sum[1] / n, sum[2] / n];
        this._mixRatio = 0;
        this._bubbles = [];
        this._state = 'mixing';
        this._timer = mixFrames;
        this.refreshTexts(mixingText, '#ffffff');
        playSe(mixSe);
    };

    Sprite_PotionCombo.prototype.updateMixing = function() {
        this._timer--;
        this._mixRatio = Math.min(1, 1 - this._timer / mixFrames);

        // 거품 생성 / 이동
        var lbottom = 14 + (FLASK_H - 26) - 4;
        var ltop = lbottom - (FLASK_H - 52);
        if (Graphics.frameCount % 3 === 0) {
            this._bubbles.push({
                x: 24 + Math.random() * (FLASK_W - 48),
                y: lbottom,
                r: 2 + Math.random() * 4,
                vy: 1 + Math.random() * 1.5
            });
        }
        this._bubbles.forEach(function(bb) { bb.y -= bb.vy; });
        this._bubbles = this._bubbles.filter(function(bb) { return bb.y > ltop; });

        if (this._timer <= 0) {
            this._bubbles = [];
            this.judge();
        }
    };

    Sprite_PotionCombo.prototype.judge = function() {
        this._attempts++;
        if (this.isCorrect()) {
            this._result = 'success';
            this._state = 'holding';
            this._timer = holdFrames;
            this.refreshTexts(successText, '#9dffb8');
            playSe(successSe);
        } else {
            this._state = 'fail';
            this._timer = 30;
            this.refreshTexts(failText, '#ff9090');
            playSe(failSe);
        }
    };

    Sprite_PotionCombo.prototype.updateFail = function() {
        this._timer--;
        if (this._timer <= 0) {
            this._flaskSprite.x = this._flaskX;
            var exhausted = (this._opt.tries > 0 && this._attempts >= this._opt.tries);
            if (exhausted) {
                this._result = 'fail';
                this._state = 'holding';
                this._timer = Math.max(30, Math.floor(holdFrames * 0.6));
            } else {
                this._state = 'draining';
            }
        }
    };

    Sprite_PotionCombo.prototype.updateDraining = function() {
        this._drain -= 1 / drainFrames;
        if (this._drain <= 0) {
            this._drain = 1;
            this._mixRatio = 0;
            this._layers = [];
            this._flaskDirty = true;
            this._state = 'select';
            this._startWait = 5;
            this.refreshTexts(guideText, '#ffffff');
        }
    };

    Sprite_PotionCombo.prototype.updateHolding = function() {
        this._timer--;
        if (this._timer <= 0) {
            this._state = 'fading';
            this._timer = fadeFrames;
        }
    };

    Sprite_PotionCombo.prototype.updateFading = function() {
        this._timer--;
        var t = Math.max(0, this._timer / fadeFrames);
        this.opacity = Math.round(255 * t);
        var dim = SceneManager._scene._potionComboDim;
        if (dim) dim.opacity = Math.round(255 * t);
        if (this._timer <= 0) {
            this.finish();
        }
    };

    //--- 종료 처리 -----------------------------------------------------------

    Sprite_PotionCombo.prototype.finish = function() {
        var opt = this._opt;
        if (this._result === 'success') {
            if (opt.switchId > 0) $gameSwitches.setValue(opt.switchId, true);
        } else {
            if (opt.failSwitchId > 0) $gameSwitches.setValue(opt.failSwitchId, true);
        }
        if (opt.variableId > 0) {
            $gameVariables.setValue(opt.variableId, this._attempts);
        }

        var commonEventId = opt.commonId;
        var interpreter = this._interpreter;
        SceneManager._scene.endPotionCombo();

        if (commonEventId > 0 && $dataCommonEvents[commonEventId]) {
            interpreter.setupChild($dataCommonEvents[commonEventId].list, 0);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startPotionCombo = function(interpreter, opt) {
        if (this._potionComboSprite) return false;

        var bottles = [];
        resolveList(opt.colorIds).forEach(function(c) {
            if (!bottles.some(function(b) { return b.id === c.id; })) bottles.push(c);
        });
        var target = resolveList(opt.targetIds);
        if (target.length < 1) {
            console.error('PotionComboMinigame: target: 으로 정답 색을 지정해야 합니다.');
            return false;
        }
        target.forEach(function(t) {
            if (!bottles.some(function(b) { return b.id === t.id; })) {
                console.warn('PotionComboMinigame: 정답 색 ' + t.id + ' 이(가) colors에 없어 자동 추가합니다.');
                bottles.push(t);
            }
        });

        if (dimBackground) {
            this._potionComboDim = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
            this._potionComboDim.bitmap.fillAll('rgba(0,0,0,0.55)');
            this.addChild(this._potionComboDim);
        }
        this._potionComboSprite = new Sprite_PotionCombo(interpreter, opt, bottles, target);
        this.addChild(this._potionComboSprite);
        return true;
    };

    Scene_Map.prototype.endPotionCombo = function() {
        if (this._potionComboSprite) {
            this.removeChild(this._potionComboSprite);
            this._potionComboSprite = null;
        }
        if (this._potionComboDim) {
            this.removeChild(this._potionComboDim);
            this._potionComboDim = null;
        }
    };

})();
