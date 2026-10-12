//=============================================================================
// WireConnectMinigame.js
//=============================================================================

/*:
 * @plugindesc v1.0 화면에 전선 연결 퍼즐을 띄우고, 마우스로 같은 색끼리 끌어서 연결하는 미니게임입니다. (DarkLightPuzzle.js 연동 가능)
 * @author ㄹㅅㅁ
 *
 * @param Default Count
 * @text 기본 선 개수
 * @desc 플러그인 명령에서 count: 를 생략했을 때 연결할 선의 개수 (2~8)
 * @type number
 * @min 2
 * @max 8
 * @default 4
 *
 * @param Title Text
 * @text 제목 문구
 * @default 같은 색끼리 선을 연결하세요
 *
 * @param Hint Text
 * @text 하단 안내 문구
 * @default 상자를 눌러 끌어서 연결 / 우클릭·ESC: 닫기
 *
 * @param Allow Cancel
 * @text 중간에 닫기 허용
 * @desc 우클릭 / ESC(X)로 퍼즐을 닫을 수 있게 할지 여부
 * @type boolean
 * @default true
 *
 * @param Wire Width
 * @text 선 굵기(px)
 * @type number
 * @min 1
 * @default 9
 *
 * @param Node Size
 * @text 상자 크기(px)
 * @type number
 * @min 20
 * @default 52
 *
 * @param Font Size
 * @text 제목 글자 크기
 * @type number
 * @min 10
 * @default 30
 *
 * @param Backdrop Opacity
 * @text 배경 어둡기 (0~255)
 * @desc 퍼즐 뒤의 맵 화면을 얼마나 어둡게 덮을지
 * @type number
 * @min 0
 * @max 255
 * @default 190
 *
 * @param Clear Frames
 * @text 완료 후 유지 프레임
 * @desc 마지막 선을 잇고 나서 창이 닫히기까지 보여주는 시간 (60 = 1초)
 * @type number
 * @min 0
 * @default 50
 *
 * @param Default Switch
 * @text 기본 성공 스위치
 * @desc 플러그인 명령에서 switch: 를 생략했을 때 성공 시 ON 할 스위치 ID (0 = 사용 안 함)
 * @type switch
 * @default 0
 *
 * @param Default Variable
 * @text 기본 결과 변수
 * @desc 결과 저장 변수 ID (성공 1 / 닫음 0, 0 = 사용 안 함)
 * @type variable
 * @default 0
 *
 * @param SE Select
 * @text 효과음: 상자 잡기
 * @type file
 * @dir audio/se/
 * @default Cursor2
 *
 * @param SE Connect
 * @text 효과음: 연결 성공
 * @type file
 * @dir audio/se/
 * @default Decision2
 *
 * @param SE Fail
 * @text 효과음: 색이 다름
 * @type file
 * @dir audio/se/
 * @default Buzzer1
 *
 * @param SE Disconnect
 * @text 효과음: 연결 해제 / 닫기
 * @type file
 * @dir audio/se/
 * @default Cancel1
 *
 * @param SE Clear
 * @text 효과음: 전부 연결 완료
 * @type file
 * @dir audio/se/
 * @default Item1
 *
 * @param SE Volume
 * @text 효과음 볼륨
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 * 이벤트의 [플러그인 명령]에 아래처럼 입력하세요.
 *
 *   WireConnect_Start
 *   WireConnect_Start count:4 group:1 switch:5 variable:3 scommon:12
 *
 *   count:4     연결할 선의 개수 (2~8, 생략 시 기본값 4)
 *   group:1     DarkLightPuzzle.js 의 퍼즐 그룹 번호.
 *               성공하면 그 그룹의 <LightSource: 1> 조명 이벤트에 불이 켜집니다.
 *   switch:5    성공 시 ON 할 스위치 ID
 *   variable:3  결과를 저장할 변수 ID (성공 1 / 중간에 닫음 0)
 *   scommon:12  성공 시 실행할 공통 이벤트 ID
 *   fcommon:13  중간에 닫았을 때 실행할 공통 이벤트 ID
 *
 * 퍼즐이 떠 있는 동안 이벤트는 멈춰 있다가, 끝나면 다음 줄로 이어집니다.
 *
 * -----------------------------------------------------------------------
 * 조작 방법
 * -----------------------------------------------------------------------
 *  - 왼쪽 또는 오른쪽의 상자를 마우스로 누른 채 반대편 상자까지 끕니다.
 *  - 같은 색 상자 위에서 놓으면 선이 연결됩니다. 색이 다르면 실패음.
 *  - 이미 연결된 상자를 다시 누르면 그 선이 풀리면서 다시 끌 수 있습니다.
 *  - 모든 선을 연결하면 성공. (오른쪽 순서는 열 때마다 섞입니다.)
 *  - 우클릭 / ESC(X) : 중간에 닫기 (Allow Cancel 이 켜져 있을 때)
 *
 * -----------------------------------------------------------------------
 * 어두운 맵 + 조명과 함께 쓰기 (DarkLightPuzzle.js)
 * -----------------------------------------------------------------------
 *  1) 맵 메모에 <DarkLight> → 화면이 어두워지고 플레이어 주변만 밝아집니다.
 *  2) 조명 이벤트 메모에 <LightSource: 1> (1 = 그룹 번호)
 *  3) 퍼즐을 여는 이벤트(예: 배전함)에 플러그인 명령
 *       WireConnect_Start group:1
 *  4) 선을 전부 연결하면 그룹 1이 풀리면서 조명에 불이 켜집니다.
 *     (이미 풀린 그룹이면 퍼즐이 다시 열리지 않습니다.)
 *
 *  퍼즐을 여는 이벤트 예시
 *   ◆조건분기: 스크립트 $gameSystem.ldpSolved('1')
 *     ◆문장: "이미 전기가 들어와 있다."
 *   ◆그 외
 *     ◆플러그인 명령: WireConnect_Start group:1
 *
 * ※ DarkLightPuzzle.js 없이도 단독으로 쓸 수 있습니다. 그때는 switch: 로
 *   성공 여부를 받으세요.
 *
 * =============================================================================
 * 버전 로그
 * =============================================================================
 * 2026.10.09 (v1.0) - 최초 작성
 */

var RS = RS || {};
RS.WG = RS.WG || {};

(function() {
    'use strict';

    var P = PluginManager.parameters('WireConnectMinigame');
    var WG = RS.WG;
    WG.active = false;
    WG.sprite = null;

    function seParam(key, def) {
        var v = P[key];
        return v === undefined ? def : String(v);
    }

    var cfg = {
        count:      Math.min(8, Math.max(2, Number(P['Default Count'] || 4))),
        title:      String(P['Title Text'] === undefined ? '같은 색끼리 선을 연결하세요' : P['Title Text']),
        hint:       String(P['Hint Text'] === undefined ? '상자를 눌러 끌어서 연결 / 우클릭·ESC: 닫기' : P['Hint Text']),
        allowCancel: String(P['Allow Cancel'] || 'true') === 'true',
        wireWidth:  Number(P['Wire Width'] || 9),
        nodeSize:   Number(P['Node Size'] || 52),
        fontSize:   Number(P['Font Size'] || 30),
        backdrop:   Number(P['Backdrop Opacity'] === undefined ? 190 : P['Backdrop Opacity']),
        clearFrames: Number(P['Clear Frames'] === undefined ? 50 : P['Clear Frames']),
        defSwitch:  Number(P['Default Switch'] || 0),
        defVariable: Number(P['Default Variable'] || 0),
        seVolume:   Number(P['SE Volume'] === undefined ? 90 : P['SE Volume']),
        se: {
            select:     seParam('SE Select', 'Cursor2'),
            connect:    seParam('SE Connect', 'Decision2'),
            fail:       seParam('SE Fail', 'Buzzer1'),
            disconnect: seParam('SE Disconnect', 'Cancel1'),
            clear:      seParam('SE Clear', 'Item1')
        }
    };

    // 빨강, 초록, 하늘, 보라, 노랑, 주황, 분홍, 흰색
    var PALETTE = ['#ff2a2a', '#00ff6e', '#00b4ff', '#5a1eff', '#ffe23a', '#ff9a2a', '#ff6ad5', '#ffffff'];

    function playSe(kind) {
        var name = cfg.se[kind];
        if (!name || name === 'none') return;
        AudioManager.playSe({ name: name, volume: cfg.seVolume, pitch: 100, pan: 0 });
    }

    function parseArgs(args) {
        var o = {};
        for (var i = 0; i < args.length; i++) {
            var a = String(args[i]);
            var k = a.indexOf(':');
            if (k > 0) o[a.slice(0, k).toLowerCase()] = a.slice(k + 1);
        }
        return o;
    }

    function numOr(v, def) {
        return v === undefined ? def : Number(v);
    }

    //-------------------------------------------------------------------------
    // 시작
    //-------------------------------------------------------------------------
    WG.start = function(interp, o) {
        var scene = SceneManager._scene;
        if (!(scene instanceof Scene_Map)) return false;
        if (WG.active && !(WG.sprite && WG.sprite.parent)) WG.active = false;
        if (WG.active) return false;

        var group = o.group !== undefined ? String(o.group).toLowerCase() : '';
        var switchId = numOr(o.switch, cfg.defSwitch);
        var variableId = numOr(o.variable, cfg.defVariable);

        // DarkLightPuzzle 의 그룹이 이미 풀려 있으면 다시 열지 않음
        if (group && RS.LDP && RS.LDP.isSolved && RS.LDP.isSolved(group)) {
            if (variableId > 0) $gameVariables.setValue(variableId, 1);
            if (switchId > 0) $gameSwitches.setValue(switchId, true);
            return false;
        }

        var opts = {
            count: Math.min(8, Math.max(2, numOr(o.count, cfg.count))),
            group: group,
            switchId: switchId,
            variableId: variableId,
            scommon: numOr(o.scommon, 0),
            fcommon: numOr(o.fcommon, 0),
            interp: interp
        };
        var sprite = new Sprite_WireConnect(opts);
        scene.addChild(sprite);
        WG.active = true;
        WG.sprite = sprite;
        return true;
    };

    //-------------------------------------------------------------------------
    // 플러그인 명령 / 이벤트 대기
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (String(command).toLowerCase() === 'wireconnect_start') {
            if (WG.start(this, parseArgs(args))) this.setWaitMode('wireConnect');
        }
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'wireConnect') {
            if (WG.active && WG.sprite && WG.sprite.parent) return true;
            WG.active = false;
            this._waitMode = '';
            return false;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_WireConnect
    //-------------------------------------------------------------------------
    function Sprite_WireConnect() {
        this.initialize.apply(this, arguments);
    }

    Sprite_WireConnect.prototype = Object.create(Sprite.prototype);
    Sprite_WireConnect.prototype.constructor = Sprite_WireConnect;

    Sprite_WireConnect.prototype.initialize = function(opts) {
        Sprite.prototype.initialize.call(this);
        this._opts = opts;
        this.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._state = 'play';   // play / clear
        this._age = 0;
        this._timer = 0;
        this._closed = false;
        this._drag = null;
        this._mx = 0;
        this._my = 0;
        this._links = [];
        this.opacity = 0;
        this.buildPuzzle();
        this.redraw();
    };

    Sprite_WireConnect.prototype.buildPuzzle = function() {
        var n = this._opts.count;
        var W = Graphics.width;
        var H = Graphics.height;
        var pw = Math.min(W - 40, 640);
        var ph = Math.min(H - 40, 560);
        this._panel = { x: (W - pw) / 2, y: (H - ph) / 2, w: pw, h: ph };

        var top = this._panel.y + 100;
        var bottom = this._panel.y + ph - 80;
        var step = n > 1 ? (bottom - top) / (n - 1) : 0;

        // 오른쪽 색 순서를 섞음 (2개 이상이면 왼쪽과 똑같은 배치는 피함)
        var perm = [];
        var i;
        for (i = 0; i < n; i++) perm.push(i);
        for (var tries = 0; tries < 20; tries++) {
            for (i = n - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = perm[i]; perm[i] = perm[j]; perm[j] = t;
            }
            var same = true;
            for (i = 0; i < n; i++) if (perm[i] !== i) { same = false; break; }
            if (!same) break;
        }

        this._nodes = [];
        for (i = 0; i < n; i++) {
            this._nodes.push({ side: 'L', idx: i, color: i,
                x: this._panel.x + pw * 0.2, y: top + step * i });
        }
        for (i = 0; i < n; i++) {
            this._nodes.push({ side: 'R', idx: i, color: perm[i],
                x: this._panel.x + pw * 0.8, y: top + step * i });
        }
    };

    Sprite_WireConnect.prototype.nodeAt = function(x, y) {
        var r = cfg.nodeSize / 2 + 8;
        for (var i = 0; i < this._nodes.length; i++) {
            var nd = this._nodes[i];
            if (Math.abs(x - nd.x) <= r && Math.abs(y - nd.y) <= r) return nd;
        }
        return null;
    };

    Sprite_WireConnect.prototype.linkIndexOf = function(node) {
        for (var i = 0; i < this._links.length; i++) {
            var l = this._links[i];
            if (l.side[node.side] === node.idx) return i;
        }
        return -1;
    };

    Sprite_WireConnect.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._closed) return;
        this._age++;
        if (this.opacity < 255) this.opacity = Math.min(255, this.opacity + 40);

        if (this._state === 'clear') {
            this._timer--;
            this.redraw();
            if (this._timer <= 0) this.finish(true);
            return;
        }
        if (this._age < 3) return;   // 퍼즐을 연 클릭이 그대로 먹히지 않게

        if (cfg.allowCancel && (TouchInput.isCancelled() || Input.isTriggered('cancel'))) {
            playSe('disconnect');
            this.finish(false);
            return;
        }

        this._mx = TouchInput.x;
        this._my = TouchInput.y;
        if (TouchInput.isTriggered()) this.onPress(this._mx, this._my);
        if (this._drag && !TouchInput.isPressed()) this.onRelease(this._mx, this._my);
        this.redraw();
    };

    Sprite_WireConnect.prototype.onPress = function(x, y) {
        var nd = this.nodeAt(x, y);
        if (!nd) return;
        var li = this.linkIndexOf(nd);
        if (li >= 0) {
            this._links.splice(li, 1);
            playSe('disconnect');
        } else {
            playSe('select');
        }
        this._drag = nd;
    };

    Sprite_WireConnect.prototype.onRelease = function(x, y) {
        var from = this._drag;
        this._drag = null;
        var to = this.nodeAt(x, y);
        if (!to || to.side === from.side) return;
        if (to.color !== from.color) {
            playSe('fail');
            return;
        }
        // 도착 상자에 이미 선이 있으면 그 선을 풀고 새로 연결
        var li = this.linkIndexOf(to);
        if (li >= 0) this._links.splice(li, 1);
        var link = { color: from.color, side: {} };
        link.side[from.side] = from.idx;
        link.side[to.side] = to.idx;
        this._links.push(link);
        playSe('connect');
        if (this._links.length === this._opts.count) {
            this._state = 'clear';
            this._timer = Math.max(1, cfg.clearFrames);
            playSe('clear');
        }
    };

    Sprite_WireConnect.prototype.finish = function(success) {
        this._closed = true;
        if (this.parent) this.parent.removeChild(this);
        WG.active = false;
        WG.sprite = null;

        var o = this._opts;
        if (o.variableId > 0) $gameVariables.setValue(o.variableId, success ? 1 : 0);
        if (success) {
            if (o.switchId > 0) $gameSwitches.setValue(o.switchId, true);
            if (o.group && RS.LDP && RS.LDP.solve) RS.LDP.solve(o.group);
        }
        var ceId = success ? o.scommon : o.fcommon;
        if (ceId > 0 && $dataCommonEvents[ceId] && o.interp) {
            o.interp.setupChild($dataCommonEvents[ceId].list, o.interp.eventId());
        }
    };

    //-------------------------------------------------------------------------
    // 그리기
    //-------------------------------------------------------------------------
    Sprite_WireConnect.prototype.nodeOf = function(side, idx) {
        return this._nodes[(side === 'L' ? 0 : this._opts.count) + idx];
    };

    Sprite_WireConnect.prototype.redraw = function() {
        var bmp = this.bitmap;
        var ctx = bmp._context;
        var p = this._panel;
        var S = cfg.nodeSize;
        var clearing = this._state === 'clear';
        var pulse = clearing ? 0.5 + 0.5 * Math.sin(this._age * 0.4) : 0;

        bmp.clear();

        // 배경 + 패널
        ctx.fillStyle = 'rgba(0,0,0,' + (cfg.backdrop / 255) + ')';
        ctx.fillRect(0, 0, bmp.width, bmp.height);
        ctx.fillStyle = 'rgba(16,18,24,0.96)';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.lineWidth = 3;
        ctx.strokeStyle = clearing ? '#7dffb0' : '#cfd3dc';
        ctx.strokeRect(p.x, p.y, p.w, p.h);

        // 문구
        if ($gameSystem && $gameSystem.mainFontFace) bmp.fontFace = $gameSystem.mainFontFace();
        bmp.fontSize = cfg.fontSize;
        bmp.textColor = '#ffffff';
        if (cfg.title) bmp.drawText(cfg.title, p.x, p.y + 24, p.w, cfg.fontSize + 8, 'center');
        bmp.fontSize = Math.max(12, cfg.fontSize - 10);
        bmp.textColor = '#9aa0ad';
        if (cfg.hint) bmp.drawText(cfg.hint, p.x, p.y + p.h - 52, p.w, cfg.fontSize, 'center');

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 연결된 선
        var i;
        for (i = 0; i < this._links.length; i++) {
            var l = this._links[i];
            var a = this.nodeOf('L', l.side.L);
            var b = this.nodeOf('R', l.side.R);
            this.drawWire(ctx, a.x, a.y, b.x, b.y, PALETTE[l.color], 1 + pulse * 0.4, 1);
        }

        // 끌고 있는 선
        if (this._drag) {
            this.drawWire(ctx, this._drag.x, this._drag.y, this._mx, this._my,
                PALETTE[this._drag.color], 1, 0.75);
        }

        // 상자
        var hover = (!clearing && !this._drag) ? this.nodeAt(this._mx, this._my) : null;
        for (i = 0; i < this._nodes.length; i++) {
            var nd = this._nodes[i];
            var color = PALETTE[nd.color];
            var linked = this.linkIndexOf(nd) >= 0;
            ctx.save();
            ctx.fillStyle = '#0b0d12';
            ctx.fillRect(nd.x - S / 2, nd.y - S / 2, S, S);
            ctx.lineWidth = 4;
            ctx.strokeStyle = (nd === hover || nd === this._drag) ? '#ffe23a' : '#e8eaf0';
            ctx.strokeRect(nd.x - S / 2, nd.y - S / 2, S, S);
            ctx.beginPath();
            ctx.arc(nd.x, nd.y, S * 0.27, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = linked ? 16 : 0;
            ctx.fill();
            ctx.restore();
        }

        bmp._setDirty();
    };

    Sprite_WireConnect.prototype.drawWire = function(ctx, x1, y1, x2, y2, color, scale, alpha) {
        var w = cfg.wireWidth * scale;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = w * 0.3;
        ctx.stroke();
        ctx.restore();
    };

    WG._Sprite = Sprite_WireConnect;

})();
