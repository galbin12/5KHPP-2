//=============================================================================
// LatteArtMinigame.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 마우스(터치)로 커피 위에 우유를 부어 라떼아트를 그리는
 * 미니게임. 한 번 누르고 뗄 때까지가 한 번의 시도이며 실패는 없습니다.
 * @author RSM
 *
 * @param Cup Center X
 * @desc 컵 중심 X좌표 (0이면 화면 중앙)
 * @default 0
 *
 * @param Cup Center Y
 * @desc 컵 중심 Y좌표 (0이면 화면 중앙)
 * @default 0
 *
 * @param Cup Radius
 * @desc 컵(커피 표면) 반지름(픽셀). 이 원 밖으로는 우유가 그려지지 않음
 * @default 150
 *
 * @param Coffee Color Center
 * @desc 커피 표면 중심부 색상 (CSS 색상값)
 * @default #6b3d1f
 *
 * @param Coffee Color Edge
 * @desc 커피 표면 가장자리 색상 (CSS 색상값, 중심보다 어둡게 권장)
 * @default #2c150a
 *
 * @param Cup Rim Color
 * @desc 컵 테두리(입술) 색상
 * @default #f0e2c8
 *
 * @param Cup Rim Width
 * @desc 컵 테두리 두께(픽셀)
 * @default 6
 *
 * @param Milk Color
 * @desc 우유(라떼아트) 색상 (CSS 색상값, rgb만 사용됨)
 * @default 255,248,225
 *
 * @param Min Brush Radius
 * @desc 마우스를 빠르게 움직일 때(가늘게 부을 때)의 최소 붓 반지름
 * @default 6
 *
 * @param Max Brush Radius
 * @desc 마우스를 천천히 움직이거나 멈출 때(많이 부을 때)의 최대 붓 반지름
 * @default 22
 *
 * @param Speed To Thin Factor
 * @desc 마우스 이동 속도가 붓 굵기를 얼마나 가늘게 만드는지의 비율
 * @default 1.4
 *
 * @param Pour Blur Interval
 * @desc 붓는 동안 몇 프레임마다 한 번씩 번짐(blur) 효과를 적용할지
 * @default 6
 *
 * @param Settle Frames
 * @desc 마우스를 뗀 뒤 우유가 저절로 더 퍼지며 안정되는 시간(프레임)
 * @default 50
 *
 * @param Settle Blur Interval
 * @desc 안정화 단계에서 몇 프레임마다 번짐 효과를 적용할지
 * @default 5
 *
 * @param Result Hold Frames
 * @desc 완성된 그림을 그대로 보여주는 시간(프레임)
 * @default 90
 *
 * @param Fade Out Frames
 * @desc 완성 연출이 끝난 뒤 화면이 서서히 사라지는 시간(프레임)
 * @default 40
 *
 * @param Dim Background
 * @desc 미니게임 중 배경을 어둡게 할지 여부 (true/false)
 * @default true
 *
 * @param Guide Text
 * @desc 시작 전 표시할 안내 문구 (붓기 시작하면 사라짐)
 * @default 마우스를 눌러 커피 위에 우유를 부어보세요
 *
 * @param Guide Font Size
 * @default 24
 *
 * @param Guide Color
 * @default #ffffff
 *
 * @param Pour SE Name
 * @desc 붓는 동안 재생할 루프 SE (비우면 재생 안함)
 * @default Water1
 *
 * @param Pour SE Volume
 * @default 30
 *
 * @param Pour SE Pitch
 * @default 120
 *
 * @param Finish SE Name
 * @desc 완성 시 재생할 SE
 * @default Saved1
 *
 * @param Finish SE Volume
 * @default 80
 *
 * @param Finish SE Pitch
 * @default 100
 *
 * @param Default Switch
 * @desc 플러그인 커맨드에서 switch: 생략 시 완성 시 ON될 스위치 ID
 * @default 1
 *
 * @param Default Variable
 * @desc 플러그인 커맨드에서 variable: 생략 시 완성도(0~100)가 저장될 변수 ID (0=사용안함)
 * @default 0
 *
 * @param Default Common Event
 * @desc 플러그인 커맨드에서 scommon: 생략 시 완성 후 실행할 커먼 이벤트 ID (0=사용안함)
 * @default 0
 *
 * @help
 * ----------------------------------------------------------------------------
 * 사용법
 * ----------------------------------------------------------------------------
 * 이벤트의 "플러그인 커맨드" 칸에 아래처럼 입력하세요.
 *
 *   LatteArt_Start switch:5 variable:3 scommon:12
 *
 * switch    : 완성 시 ON 될 스위치 ID (생략 시 Default Switch)
 * variable  : 완성도(우유가 컵을 덮은 비율, 0~100)가 저장될 변수 ID
 *             (생략 시 Default Variable, 0이면 저장 안함)
 * scommon   : 완성 후 실행할 커먼 이벤트 ID (생략 시 Default Common Event, 0이면 실행 안함)
 *
 * 진행 방식
 * ----------------------------------------------------------------------------
 * 화면에 커피가 담긴 원형 컵이 나타납니다. 마우스(또는 터치)를 누른 채
 * 컵 위에서 움직이면 우유가 부어지며, 천천히 움직일수록 굵게, 빠르게
 * 움직일수록 가늘게 부어집니다. 부어진 우유는 시간이 지나며 살짝씩 번져
 * 자연스러운 라떼아트 느낌을 냅니다.
 *
 * 마우스를 처음 누른 순간부터 뗄 때까지가 단 한 번의 시도입니다. 손을
 * 떼면 그 즉시 더 이상 그릴 수 없으며, 우유가 잠시 더 번지며 안정된 뒤
 * (Settle Frames) 결과가 확정되고 완성 처리됩니다. 실패 조건은 없습니다.
 *
 * 컵 모양과 커피/우유 색상은 모두 플러그인 파라미터로 지정되어 있으며
 * 별도의 이미지 파일이 필요 없습니다.
 * ----------------------------------------------------------------------------
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('LatteArtMinigame');

    var cupCenterXParam = Number(parameters['Cup Center X'] || 0);
    var cupCenterYParam = Number(parameters['Cup Center Y'] || 0);
    var cupRadius        = Number(parameters['Cup Radius'] || 150);

    var coffeeColorCenter = String(parameters['Coffee Color Center'] || '#6b3d1f');
    var coffeeColorEdge   = String(parameters['Coffee Color Edge'] || '#2c150a');
    var cupRimColor       = String(parameters['Cup Rim Color'] || '#f0e2c8');
    var cupRimWidth       = Number(parameters['Cup Rim Width'] || 6);

    var milkColorRgb = String(parameters['Milk Color'] || '255,248,225');

    var minBrushRadius   = Number(parameters['Min Brush Radius'] || 6);
    var maxBrushRadius   = Number(parameters['Max Brush Radius'] || 22);
    var speedThinFactor  = Number(parameters['Speed To Thin Factor'] || 1.4);

    var pourBlurInterval   = Number(parameters['Pour Blur Interval'] || 6);
    var settleFrames       = Number(parameters['Settle Frames'] || 50);
    var settleBlurInterval = Number(parameters['Settle Blur Interval'] || 5);

    var resultHoldFrames = Number(parameters['Result Hold Frames'] || 90);
    var fadeOutFrames    = Number(parameters['Fade Out Frames'] || 40);

    var dimBackground = String(parameters['Dim Background'] || 'true') === 'true';

    var guideText     = String(parameters['Guide Text'] || '마우스를 눌러 커피 위에 우유를 부어보세요');
    var guideFontSize = Number(parameters['Guide Font Size'] || 24);
    var guideColor    = String(parameters['Guide Color'] || '#ffffff');

    var pourSeName   = String(parameters['Pour SE Name'] || 'Water1');
    var pourSeVolume = Number(parameters['Pour SE Volume'] || 30);
    var pourSePitch  = Number(parameters['Pour SE Pitch'] || 120);

    var finishSeName   = String(parameters['Finish SE Name'] || 'Saved1');
    var finishSeVolume = Number(parameters['Finish SE Volume'] || 80);
    var finishSePitch  = Number(parameters['Finish SE Pitch'] || 100);

    var defaultSwitch   = Number(parameters['Default Switch'] || 1);
    var defaultVariable = Number(parameters['Default Variable'] || 0);
    var defaultCommon   = Number(parameters['Default Common Event'] || 0);

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'LatteArt_Start') {
            var switchId = defaultSwitch;
            var variableId = defaultVariable;
            var commonId = defaultCommon;
            args.forEach(function(arg) {
                if (arg.indexOf('switch:') === 0) {
                    switchId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('variable:') === 0) {
                    variableId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('scommon:') === 0) {
                    commonId = Number(arg.split(':')[1]);
                }
            });
            this.setWaitMode('latteArtQte');
            SceneManager._scene.startLatteArtQTE(this, switchId, variableId, commonId);
        }
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'latteArtQte') {
            if (SceneManager._scene._latteArtSprite) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_LatteArt  (미니게임 본체)
    //-------------------------------------------------------------------------
    function Sprite_LatteArt() {
        this.initialize.apply(this, arguments);
    }

    Sprite_LatteArt.prototype = Object.create(Sprite.prototype);
    Sprite_LatteArt.prototype.constructor = Sprite_LatteArt;

    Sprite_LatteArt.prototype.initialize = function(interpreter, switchId, variableId, commonEventId) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._switchId = switchId;
        this._variableId = variableId;
        this._commonEventId = commonEventId;

        this._cupSize = cupRadius * 2;
        this.x = (cupCenterXParam || Graphics.boxWidth / 2) - cupRadius;
        this.y = (cupCenterYParam || Graphics.boxHeight / 2) - cupRadius;

        // state: 'waiting' -> 'pouring' -> 'settling' -> 'holding' -> 'fading'
        this._state = 'waiting';
        this._hasPoured = false;
        this._isPressing = false;
        this._lastX = null;
        this._lastY = null;
        this._pourBlurTimer = 0;
        this._settleTimer = 0;
        this._holdTimer = 0;
        this._fadeTimer = 0;

        this.createCoffeeLayer();
        this.createMilkLayer();
        this.createGuideSprite();
    };

    Sprite_LatteArt.prototype.createCoffeeLayer = function() {
        var size = this._cupSize;
        var bitmap = new Bitmap(size, size);
        var context = bitmap.context;
        var r = cupRadius;

        var grad = context.createRadialGradient(r, r, 0, r, r, r);
        grad.addColorStop(0, coffeeColorCenter);
        grad.addColorStop(1, coffeeColorEdge);

        context.save();
        context.beginPath();
        context.arc(r, r, r, 0, Math.PI * 2, false);
        context.closePath();
        context.fillStyle = grad;
        context.fill();
        context.restore();

        if (cupRimWidth > 0) {
            context.save();
            context.beginPath();
            context.arc(r, r, r - cupRimWidth / 2, 0, Math.PI * 2, false);
            context.closePath();
            context.lineWidth = cupRimWidth;
            context.strokeStyle = cupRimColor;
            context.stroke();
            context.restore();
        }
        bitmap._setDirty();

        this._coffeeSprite = new Sprite(bitmap);
        this.addChild(this._coffeeSprite);
    };

    Sprite_LatteArt.prototype.createMilkLayer = function() {
        var size = this._cupSize;
        this._milkBitmap = new Bitmap(size, size);
        this._milkSprite = new Sprite(this._milkBitmap);
        this.addChild(this._milkSprite);
    };

    // RPG Maker MV 코어의 Bitmap.prototype.blur()는 캔버스를 검은색으로 채운 뒤
    // 덧그리는 방식이라 알파(투명) 레이어에 쓰면 화면이 검게 덮여버린다.
    // 그래서 투명도를 보존하는 자체 블러(캔버스 filter 사용)를 대신 사용한다.
    Sprite_LatteArt.prototype.blurMilkLayer = function() {
        var size = this._cupSize;
        var srcCanvas = this._milkBitmap.canvas;

        if (!this._blurTempCanvas) {
            this._blurTempCanvas = document.createElement('canvas');
            this._blurTempCanvas.width = size;
            this._blurTempCanvas.height = size;
        }
        var tempContext = this._blurTempCanvas.getContext('2d');
        tempContext.clearRect(0, 0, size, size);
        tempContext.filter = 'blur(2px)';
        tempContext.drawImage(srcCanvas, 0, 0);
        tempContext.filter = 'none';

        var context = this._milkBitmap.context;
        context.clearRect(0, 0, size, size);
        context.drawImage(this._blurTempCanvas, 0, 0);

        this._milkBitmap._setDirty();
    };

    Sprite_LatteArt.prototype.createGuideSprite = function() {
        var width = Math.min(Graphics.boxWidth - 40, 520);
        var bitmap = new Bitmap(width, guideFontSize + 16);
        bitmap.fontSize = guideFontSize;
        bitmap.textColor = guideColor;
        bitmap.outlineColor = 'rgba(0,0,0,0.7)';
        bitmap.outlineWidth = 4;
        bitmap.drawText(guideText, 0, 0, width, guideFontSize + 16, 'center');

        this._guideSprite = new Sprite(bitmap);
        this._guideSprite.anchor.x = 0.5;
        this._guideSprite.x = cupRadius;
        this._guideSprite.y = -guideFontSize - 20;
        this.addChild(this._guideSprite);
    };

    //--- 좌표 / 판정 -----------------------------------------------------------

    Sprite_LatteArt.prototype.localX = function() {
        return TouchInput.x - this.x;
    };

    Sprite_LatteArt.prototype.localY = function() {
        return TouchInput.y - this.y;
    };

    //--- 그리기 ------------------------------------------------------------

    Sprite_LatteArt.prototype.paintMilkAt = function(x, y, radius) {
        var context = this._milkBitmap.context;
        var r = cupRadius;

        context.save();
        context.beginPath();
        context.arc(r, r, r, 0, Math.PI * 2, false);
        context.closePath();
        context.clip();

        var grad = context.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, 'rgba(' + milkColorRgb + ',0.9)');
        grad.addColorStop(0.7, 'rgba(' + milkColorRgb + ',0.45)');
        grad.addColorStop(1, 'rgba(' + milkColorRgb + ',0)');

        context.fillStyle = grad;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
        context.restore();
    };

    Sprite_LatteArt.prototype.pourAt = function(x, y) {
        var speed = 0;
        if (this._lastX !== null) {
            var dx = x - this._lastX;
            var dy = y - this._lastY;
            speed = Math.sqrt(dx * dx + dy * dy);
        }

        var radius = maxBrushRadius - speed * speedThinFactor;
        radius = Math.max(minBrushRadius, Math.min(maxBrushRadius, radius));

        if (this._lastX === null) {
            this.paintMilkAt(x, y, radius);
        } else {
            var dist = Math.sqrt(Math.pow(x - this._lastX, 2) + Math.pow(y - this._lastY, 2));
            var steps = Math.max(1, Math.ceil(dist / 4));
            for (var i = 1; i <= steps; i++) {
                var t = i / steps;
                var px = this._lastX + (x - this._lastX) * t;
                var py = this._lastY + (y - this._lastY) * t;
                this.paintMilkAt(px, py, radius);
            }
        }

        this._milkBitmap._setDirty();
        this._lastX = x;
        this._lastY = y;
    };

    //--- 상태 갱신 ---------------------------------------------------------

    Sprite_LatteArt.prototype.update = function() {
        Sprite.prototype.update.call(this);

        switch (this._state) {
            case 'waiting':
            case 'pouring':
                this.updatePouring();
                break;
            case 'settling':
                this.updateSettling();
                break;
            case 'holding':
                this.updateHolding();
                break;
            case 'fading':
                this.updateFading();
                break;
        }
    };

    Sprite_LatteArt.prototype.updatePouring = function() {
        if (TouchInput.isTriggered() && !this._hasPoured) {
            this._hasPoured = true;
            this._state = 'pouring';
            this._isPressing = true;
            this._guideSprite.visible = false;
            this.startPourSe();
        }

        if (this._hasPoured && TouchInput.isPressed()) {
            this._isPressing = true;
            this.pourAt(this.localX(), this.localY());

            this._pourBlurTimer++;
            if (this._pourBlurTimer >= pourBlurInterval) {
                this._pourBlurTimer = 0;
                this.blurMilkLayer();
            }
        } else if (this._hasPoured && this._isPressing && !TouchInput.isPressed()) {
            // 마우스를 뗀 순간 - 안정화 단계로 전환
            this._isPressing = false;
            this._lastX = null;
            this._lastY = null;
            this.stopPourSe();
            this._state = 'settling';
            this._settleTimer = settleFrames;
        }
    };

    Sprite_LatteArt.prototype.updateSettling = function() {
        this._settleTimer--;

        if (this._settleTimer % settleBlurInterval === 0) {
            this.blurMilkLayer();
        }

        if (this._settleTimer <= 0) {
            this.finalizeArt();
            this._state = 'holding';
            this._holdTimer = resultHoldFrames;
        }
    };

    Sprite_LatteArt.prototype.updateHolding = function() {
        this._holdTimer--;
        if (this._holdTimer <= 0) {
            this._state = 'fading';
            this._fadeTimer = fadeOutFrames;
        }
    };

    Sprite_LatteArt.prototype.updateFading = function() {
        this._fadeTimer--;
        var t = Math.max(0, this._fadeTimer / fadeOutFrames);
        this.opacity = Math.round(255 * t);

        var dim = SceneManager._scene._latteArtDim;
        if (dim) {
            dim.opacity = Math.round(255 * t);
        }

        if (this._fadeTimer <= 0) {
            this.finish();
        }
    };

    //--- 사운드 --------------------------------------------------------------

    Sprite_LatteArt.prototype.startPourSe = function() {
        if (pourSeName) {
            AudioManager.playSe({ name: pourSeName, volume: pourSeVolume, pitch: pourSePitch, pan: 0 });
        }
    };

    Sprite_LatteArt.prototype.stopPourSe = function() {
        // 루프가 아닌 단발 SE를 사용하므로 별도 정지 처리는 불필요
    };

    //--- 완성 처리 -----------------------------------------------------------

    Sprite_LatteArt.prototype.finalizeArt = function() {
        var coverage = this.calcCoverageRatio();

        if (finishSeName) {
            AudioManager.playSe({ name: finishSeName, volume: finishSeVolume, pitch: finishSePitch, pan: 0 });
        }
        if (this._switchId > 0) {
            $gameSwitches.setValue(this._switchId, true);
        }
        if (this._variableId > 0) {
            $gameVariables.setValue(this._variableId, Math.round(coverage * 100));
        }
    };

    Sprite_LatteArt.prototype.calcCoverageRatio = function() {
        var r = cupRadius;
        var sampleStep = Math.max(4, Math.round(r / 12));
        var total = 0;
        var covered = 0;

        for (var y = 0; y < this._cupSize; y += sampleStep) {
            for (var x = 0; x < this._cupSize; x += sampleStep) {
                var dx = x - r;
                var dy = y - r;
                if (dx * dx + dy * dy > r * r) continue;
                total++;
                if (this._milkBitmap.getAlphaPixel(x, y) > 40) {
                    covered++;
                }
            }
        }
        return total > 0 ? covered / total : 0;
    };

    Sprite_LatteArt.prototype.finish = function() {
        var commonEventId = this._commonEventId;
        SceneManager._scene.endLatteArtQTE();

        if (commonEventId > 0 && $dataCommonEvents[commonEventId]) {
            this._interpreter.setupChild($dataCommonEvents[commonEventId].list, 0);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startLatteArtQTE = function(interpreter, switchId, variableId, commonEventId) {
        if (dimBackground) {
            this._latteArtDim = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
            this._latteArtDim.bitmap.fillAll('rgba(0,0,0,0.4)');
            this.addChild(this._latteArtDim);
        }
        this._latteArtSprite = new Sprite_LatteArt(interpreter, switchId, variableId, commonEventId);
        this.addChild(this._latteArtSprite);
    };

    Scene_Map.prototype.endLatteArtQTE = function() {
        if (this._latteArtSprite) {
            this.removeChild(this._latteArtSprite);
            this._latteArtSprite = null;
        }
        if (this._latteArtDim) {
            this.removeChild(this._latteArtDim);
            this._latteArtDim = null;
        }
    };

})();
