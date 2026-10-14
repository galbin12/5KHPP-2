//=============================================================================
// WaterSprayGame.js
//=============================================================================

/*:
 * @plugindesc v1.2 물 뿌리기 미니게임 (클릭 → 칙칙 소리 + 물방울, 목표 횟수를 채우면 완료)
 * @author Claude
 *
 * @param TargetCount
 * @text 목표 횟수
 * @type number
 * @min 1
 * @desc 이 횟수만큼 물을 뿌리면 미니게임이 완료됩니다 (플러그인 커맨드로 덮어쓸 수 있음)
 * @default 10
 *
 * @param CompleteSwitchId
 * @text 완료 시 켤 스위치
 * @type switch
 * @desc 목표를 채우고 완료됐을 때 ON 으로 만들 스위치 (0이면 사용 안 함)
 * @default 0
 *
 * @param CountVariableId
 * @text 횟수 저장 변수
 * @type variable
 * @desc 종료 시 물을 뿌린 횟수를 저장할 변수 (0이면 사용 안 함)
 * @default 0
 *
 * @param BackgroundImage
 * @text 배경 이미지
 * @type file
 * @dir img/pictures/
 * @desc 비워두면 기본 배경을 사용
 * @default
 *
 * @param BackgroundFit
 * @text 배경 맞춤 방식
 * @type select
 * @option 세로 비율에 맞춤 (가로는 가운데 정렬)
 * @value height
 * @option 화면을 꽉 채움 (넘치는 부분은 잘림)
 * @value cover
 * @option 전체가 보이게 맞춤 (남는 부분은 기본 배경)
 * @value contain
 * @option 화면 크기에 늘려 맞춤 (비율 무시)
 * @value stretch
 * @desc 배경 이미지를 화면에 맞추는 방식
 * @default height
 *
 * @param SeName
 * @text 효과음 파일
 * @type file
 * @dir audio/se/
 * @desc 비워두면 "칙칙" 소리를 코드로 직접 합성해서 재생 (파일 불필요)
 * @default
 *
 * @param SeVolume
 * @text 효과음 볼륨
 * @type number
 * @min 0
 * @max 100
 * @desc 효과음 파일을 지정했을 때만 적용
 * @default 90
 *
 * @param SePitch
 * @text 효과음 피치
 * @type number
 * @min 50
 * @max 150
 * @desc 효과음 파일을 지정했을 때만 적용
 * @default 100
 *
 * @param DropCount
 * @text 물방울 개수
 * @type number
 * @min 1
 * @max 40
 * @desc 클릭 한 번에 튀는 물방울 수
 * @default 12
 *
 * @help
 * ============================================================================
 * 물 뿌리기 미니게임
 * ============================================================================
 * 화면 아무 곳이나 클릭하면 "칙칙" 소리와 함께 물방울이 튀었다가 사라집니다.
 * 목표 횟수만큼 뿌리면 "완료!" 가 뜨고 자동으로 종료됩니다.
 *
 * 중간에 나가기: 마우스 우클릭 / ESC / X  (이 경우 완료 스위치는 켜지지 않음)
 *
 * ■ 플러그인 커맨드
 *   WaterSpray start        미니게임 시작
 *   WaterSpray start 15     목표 15회로 시작
 *
 * ■ 스크립트 호출
 *   SceneManager.push(Scene_WaterSpray);
 *
 * 다른 플러그인에 의존하지 않으므로 플러그인 순서는 상관없습니다.
 */

(function() {
    'use strict';

    var pluginName = 'WaterSprayGame';
    var params = PluginManager.parameters(pluginName);

    var paramTarget = Math.max(1, Number(params['TargetCount'] || 10));
    var paramSwitch = Number(params['CompleteSwitchId'] || 0);
    var paramVariable = Number(params['CountVariableId'] || 0);
    var paramBackground = String(params['BackgroundImage'] || '');
    var paramBackgroundFit = String(params['BackgroundFit'] || 'height');
    var paramSeName = String(params['SeName'] || '');
    var paramSeVolume = Number(params['SeVolume'] || 90);
    var paramSePitch = Number(params['SePitch'] || 100);
    var paramDropCount = Math.max(1, Number(params['DropCount'] || 12));

    //=========================================================================
    // 칙칙 소리 (WebAudio 합성)
    //=========================================================================

    var SpraySound = {
        _ctx: null,

        _getContext: function() {
            if (!this._ctx) {
                var AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return null;
                this._ctx = new AC();
            }
            if (this._ctx.state === 'suspended') this._ctx.resume();
            return this._ctx;
        },

        _burst: function(ctx, startTime, volume) {
            var duration = 0.09;
            var length = Math.floor(ctx.sampleRate * duration);
            var buffer = ctx.createBuffer(1, length, ctx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.5);
            }
            var src = ctx.createBufferSource();
            src.buffer = buffer;

            var filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 2500 + Math.random() * 1500;

            var gain = ctx.createGain();
            gain.gain.value = 0.5 * volume;

            src.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            src.start(startTime);
        },

        play: function() {
            if (paramSeName) {
                AudioManager.playSe({
                    name: paramSeName,
                    volume: paramSeVolume,
                    pitch: paramSePitch,
                    pan: 0
                });
                return;
            }
            var volume = AudioManager.seVolume / 100;
            if (volume <= 0) return;
            var ctx = this._getContext();
            if (!ctx) return;
            var now = ctx.currentTime;
            this._burst(ctx, now, volume);
            this._burst(ctx, now + 0.12, volume * 0.9);
        }
    };

    //=========================================================================
    // 비트맵 생성 (기본 그래픽)
    //=========================================================================

    function makeDropBitmap() {
        var s = 14;
        var bmp = new Bitmap(s, s);
        var c = bmp._context;
        var g = c.createRadialGradient(5, 5, 1, 7, 7, 7);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.4, '#a8dcff');
        g.addColorStop(1, 'rgba(80,170,255,0.9)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(7, 7, 6.5, 0, Math.PI * 2);
        c.fill();
        bmp._setDirty();
        return bmp;
    }

    function makeBackgroundBitmap() {
        var w = Graphics.width, h = Graphics.height;
        var bmp = new Bitmap(w, h);
        var c = bmp._context;
        var g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#cfeeff');
        g.addColorStop(1, '#eaf7e4');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        bmp._setDirty();
        return bmp;
    }

    //=========================================================================
    // Scene_WaterSpray
    //=========================================================================

    function Scene_WaterSpray() {
        this.initialize.apply(this, arguments);
    }

    Scene_WaterSpray.prototype = Object.create(Scene_Base.prototype);
    Scene_WaterSpray.prototype.constructor = Scene_WaterSpray;

    Scene_WaterSpray.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._target = paramTarget;
        this._count = 0;
        this._drops = [];
        this._completeWait = -1;
    };

    Scene_WaterSpray.prototype.prepare = function(target) {
        if (target > 0) this._target = target;
    };

    Scene_WaterSpray.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createDropLayer();
        this.createHint();
    };

    Scene_WaterSpray.prototype.createBackground = function() {
        // 기본 배경은 항상 깔아둠 (이미지가 화면을 다 못 덮을 때 양옆을 채움)
        this._baseSprite = new Sprite(makeBackgroundBitmap());
        this.addChild(this._baseSprite);
        this._backSprite = null;
        this._backFitted = true;
        if (paramBackground) {
            this._backSprite = new Sprite(ImageManager.loadPicture(paramBackground));
            this._backSprite.anchor.x = 0.5;
            this._backSprite.anchor.y = 0.5;
            this._backSprite.x = Graphics.width / 2;
            this._backSprite.y = Graphics.height / 2;
            this._backFitted = false;
            this.addChild(this._backSprite);
        }
    };

    // 이미지 로딩이 끝나면 한 번만 크기를 맞춤 (원본 비율 유지)
    Scene_WaterSpray.prototype.updateBackgroundFit = function() {
        if (this._backFitted) return;
        var bmp = this._backSprite.bitmap;
        if (!bmp || !bmp.isReady() || bmp.width <= 0 || bmp.height <= 0) return;
        var sw = Graphics.width / bmp.width;
        var sh = Graphics.height / bmp.height;
        var sx, sy;
        switch (paramBackgroundFit) {
        case 'cover':
            sx = sy = Math.max(sw, sh);
            break;
        case 'contain':
            sx = sy = Math.min(sw, sh);
            break;
        case 'stretch':
            sx = sw;
            sy = sh;
            break;
        default: // 'height'
            sx = sy = sh;
            break;
        }
        this._backSprite.scale.x = sx;
        this._backSprite.scale.y = sy;
        this._backFitted = true;
    };

    Scene_WaterSpray.prototype.createDropLayer = function() {
        this._dropBitmap = makeDropBitmap();
        this._dropLayer = new Sprite();
        this.addChild(this._dropLayer);
    };

    Scene_WaterSpray.prototype.createHint = function() {
        this._hintSprite = new Sprite(new Bitmap(Graphics.width, 40));
        this._hintSprite.y = 8;
        this.addChild(this._hintSprite);
        this.refreshHint();
    };

    Scene_WaterSpray.prototype.refreshHint = function() {
        var bmp = this._hintSprite.bitmap;
        bmp.clear();
        bmp.fontSize = 20;
        bmp.textColor = '#ffffff';
        bmp.outlineColor = 'rgba(0,0,0,0.6)';
        bmp.outlineWidth = 4;
        var text;
        if (this.isCompleted()) {
            text = '완료!  (' + this._count + ' / ' + this._target + ')';
        } else {
            text = '클릭해서 물을 뿌려보세요  ' + this._count + ' / ' + this._target +
                '  ·  우클릭 / ESC: 나가기';
        }
        bmp.drawText(text, 0, 0, Graphics.width, 40, 'center');
    };

    Scene_WaterSpray.prototype.isCompleted = function() {
        return this._count >= this._target;
    };

    Scene_WaterSpray.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_WaterSpray.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        this.updateBackgroundFit();
        this.updateInput();
        this.updateDrops();
        this.updateComplete();
    };

    Scene_WaterSpray.prototype.updateInput = function() {
        if (this.isCompleted()) return;
        if (TouchInput.isTriggered()) {
            this.splash(TouchInput.x, TouchInput.y);
        }
        if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
            this.exitScene(false);
        }
    };

    Scene_WaterSpray.prototype.splash = function(x, y) {
        this._count++;
        SpraySound.play();
        for (var i = 0; i < paramDropCount; i++) {
            var drop = new Sprite(this._dropBitmap);
            drop.anchor.x = 0.5;
            drop.anchor.y = 0.5;
            drop.x = x;
            drop.y = y;
            var angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
            var speed = 2 + Math.random() * 5;
            drop._vx = Math.cos(angle) * speed;
            drop._vy = Math.sin(angle) * speed;
            drop._life = drop._maxLife = 24 + Math.floor(Math.random() * 26);
            drop._size = 0.5 + Math.random() * 0.9;
            this._dropLayer.addChild(drop);
            this._drops.push(drop);
        }
        this.refreshHint();
        if (this.isCompleted()) {
            this._completeWait = 60; // 물방울이 사라지고 "완료!"를 볼 시간
        }
    };

    Scene_WaterSpray.prototype.updateDrops = function() {
        for (var i = this._drops.length - 1; i >= 0; i--) {
            var d = this._drops[i];
            d.x += d._vx;
            d.y += d._vy;
            d._vy += 0.3;
            d._vx *= 0.98;
            d._life--;
            if (d._life <= 0) {
                this._dropLayer.removeChild(d);
                this._drops.splice(i, 1);
                continue;
            }
            d.opacity = 255 * Math.min(1, d._life / (d._maxLife * 0.5));
            d.rotation = Math.atan2(d._vy, d._vx) - Math.PI / 2;
            d.scale.x = d._size * 0.8;
            d.scale.y = d._size * 1.4;
        }
    };

    Scene_WaterSpray.prototype.updateComplete = function() {
        if (this._completeWait < 0) return;
        this._completeWait--;
        if (this._completeWait <= 0) {
            this.exitScene(true);
        }
    };

    Scene_WaterSpray.prototype.exitScene = function(completed) {
        if (paramVariable > 0) {
            $gameVariables.setValue(paramVariable, this._count);
        }
        if (completed && paramSwitch > 0) {
            $gameSwitches.setValue(paramSwitch, true);
        }
        this.popScene();
    };

    window.Scene_WaterSpray = Scene_WaterSpray;

    //=========================================================================
    // 플러그인 커맨드
    //=========================================================================

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (String(command).toLowerCase() === 'waterspray') {
            var sub = String(args[0] || '').toLowerCase();
            if (sub === 'start') {
                SceneManager.push(Scene_WaterSpray);
                SceneManager.prepareNextScene(Number(args[1]) || 0);
            }
        }
    };

})();
