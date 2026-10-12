//=============================================================================
// FireStartMinigame.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 스페이스바(확인키) 연타로 양쪽의 돌 든 손을 맞부딪혀
 * 불을 지피는 미니게임. 게이지가 가득 차면 성공 (실패 없음).
 * @author RSM
 *
 * @param Left Hand Image
 * @desc img/pictures 폴더에 있는 왼쪽 손 이미지 파일명 (확장자 제외)
 * @default FireHand_Left
 *
 * @param Right Hand Image
 * @desc img/pictures 폴더에 있는 오른쪽 손 이미지 파일명 (확장자 제외)
 * @default FireHand_Right
 *
 * @param Spark Image
 * @desc img/pictures 폴더에 있는 스파크 이미지 파일명 (확장자 제외)
 * @default FireSpark
 *
 * @param Center X
 * @desc 손이 맞닿는 중심 X좌표 (0이면 화면 중앙)
 * @default 0
 *
 * @param Center Y
 * @desc 손이 맞닿는 중심 Y좌표 (0이면 화면 중앙)
 * @default 0
 *
 * @param Hand Max Distance
 * @desc 게이지 0일 때 중심으로부터 손이 떨어진 거리(픽셀)
 * @default 160
 *
 * @param Gauge Max
 * @desc 게이지 최대치 (0~100%로 환산되는 기준값)
 * @default 100
 *
 * @param Success Hold Ratio
 * @desc 이 비율(0~1) 이상을 일정 시간 유지해야 성공 처리됨 (예: 0.85 = 85%)
 * @default 0.85
 *
 * @param Success Hold Frames
 * @desc Success Hold Ratio 이상을 몇 프레임 연속 유지해야 성공하는지 (60 = 1초)
 * @default 60
 *
 * @param Gauge Gain Per Press
 * @desc 확인키(스페이스바)를 한 번 누를 때마다 오르는 게이지 양
 * @default 6
 *
 * @param Gauge Decay Per Frame
 * @desc 매 프레임마다 자연 감소하는 게이지 양 (연타를 멈추면 손이 다시 벌어짐)
 * @default 0.5
 *
 * @param Spark Start Ratio
 * @desc 이 게이지 비율(0~1)부터 스파크가 튀기 시작함
 * @default 0.55
 *
 * @param Min Spark Count
 * @desc Spark Start Ratio 도달 시 한 번 누를 때 튀는 최소 스파크 개수
 * @default 1
 *
 * @param Max Spark Count
 * @desc 게이지가 가득 찼을 때 한 번 누를 때 튀는 최대 스파크 개수
 * @default 6
 *
 * @param Spark Life
 * @desc 스파크 하나가 사라지기까지 걸리는 프레임 수
 * @default 18
 *
 * @param Shake Amount
 * @desc 누를 때마다 손이 흔들리는 최대 픽셀 양
 * @default 4
 *
 * @param Gauge Bar X
 * @desc 게이지 바 X좌표 (0이면 화면 중앙 기준 자동 배치)
 * @default 0
 *
 * @param Gauge Bar Y
 * @desc 게이지 바 Y좌표
 * @default 60
 *
 * @param Gauge Bar Width
 * @desc 게이지 바 너비(픽셀)
 * @default 240
 *
 * @param Gauge Bar Height
 * @desc 게이지 바 높이(픽셀)
 * @default 16
 *
 * @param Gauge Bar Color
 * @desc 게이지 바 색상 (CSS 색상값)
 * @default #ff8800
 *
 * @param Dim Background
 * @desc 미니게임 중 배경을 어둡게 할지 여부 (true/false)
 * @default true
 *
 * @param Press SE Name
 * @desc 누를 때마다 재생할 SE 파일명 (비우면 재생 안함)
 * @default Flash2
 *
 * @param Press SE Volume
 * @default 40
 *
 * @param Press SE Pitch
 * @default 120
 *
 * @param Success SE Name
 * @desc 성공 시 재생할 SE 파일명
 * @default Flash1
 *
 * @param Success SE Volume
 * @default 90
 *
 * @param Success SE Pitch
 * @default 100
 *
 * @param Default Switch
 * @desc 플러그인 커맨드에서 switch: 를 생략했을 때 사용할 스위치 ID
 * @default 1
 *
 * @param Default Variable
 * @desc 플러그인 커맨드에서 variable: 를 생략했을 때 사용할 변수 ID (최종 게이지값 저장, 0=사용안함)
 * @default 0
 *
 * @param Default Common Event
 * @desc 성공 시 실행할 커먼 이벤트 ID (플러그인 커맨드에서 scommon: 생략 시 사용, 0=사용안함)
 * @default 0
 *
 * @param Explosion Frames
 * @desc 성공 순간 폭발 연출(큰 스파크 + 화면 플래시)이 지속되는 시간(프레임)
 * @default 40
 *
 * @param Explosion Particle Count
 * @desc 폭발 시작 순간 한 번에 터지는 스파크 개수
 * @default 30
 *
 * @param Explosion Scale
 * @desc 폭발 스파크의 크기 배율
 * @default 2.2
 *
 * @param Flash Color
 * @desc 폭발 순간 화면 전체에 번쩍이는 플래시 색상 (CSS 색상값)
 * @default #fff2c0
 *
 * @param Flash Max Opacity
 * @desc 플래시가 가장 밝을 때의 불투명도 (0~255)
 * @default 200
 *
 * @param Fade Out Frames
 * @desc 폭발 연출이 끝난 뒤 미니게임 화면 전체가 서서히 사라지는 시간(프레임)
 * @default 40
 *
 * @param Prompt Text
 * @desc 커졌다 작아졌다 반복하며 표시할 안내 문구
 * @default 스페이스바를 눌러라!
 *
 * @param Prompt X
 * @desc 안내 문구 중심 X좌표 (0이면 화면 중앙)
 * @default 0
 *
 * @param Prompt Y
 * @desc 안내 문구 중심 Y좌표 (0이면 화면 중앙보다 위쪽에 자동 배치)
 * @default 0
 *
 * @param Prompt Font Size
 * @desc 안내 문구 기본 폰트 크기
 * @default 40
 *
 * @param Prompt Color
 * @desc 안내 문구 색상 (CSS 색상값)
 * @default #ffffff
 *
 * @param Prompt Outline Color
 * @desc 안내 문구 외곽선 색상 (CSS 색상값)
 * @default rgba(120,40,0,0.9)
 *
 * @param Prompt Min Scale
 * @desc 펄스 애니메이션 최소 배율
 * @default 0.85
 *
 * @param Prompt Max Scale
 * @desc 펄스 애니메이션 최대 배율
 * @default 1.25
 *
 * @param Prompt Pulse Frames
 * @desc 최소→최대→최소로 한 번 반복하는 데 걸리는 프레임 수
 * @default 50
 *
 * @param Prompt Hide On Spark
 * @desc 스파크가 튀기 시작하는 비율(Spark Start Ratio) 이후엔 문구를 숨길지 여부 (true/false)
 * @default false
 *
 * @help
 * ----------------------------------------------------------------------------
 * 사용법
 * ----------------------------------------------------------------------------
 * 이벤트의 "플러그인 커맨드" 칸에 아래처럼 입력하세요.
 *
 *   FireStart_Start switch:5 variable:3 scommon:12
 *
 * switch    : 성공 시 ON 될 스위치 ID (생략 시 Default Switch)
 * variable  : 종료 시 최종 게이지 값(0~Gauge Max)이 저장될 변수 ID (생략 시 Default Variable, 0이면 저장 안함)
 * scommon   : 성공 시 실행할 커먼 이벤트 ID (생략 시 Default Common Event, 0이면 실행 안함)
 *
 * 화면 상단쪽에는 "Prompt Text"에 지정한 문구(기본값: 스페이스바를 눌러라!)가
 * 커졌다 작아졌다를 반복하며 표시됩니다. Prompt Hide On Spark를 true로 하면
 * 게이지가 스파크가 튀는 구간(Spark Start Ratio)에 도달한 뒤부터는 문구가
 * 사라지도록 할 수 있습니다.
 *
 * 이 미니게임에는 "실패"가 없습니다. 확인키(기본적으로 스페이스바/Z/Enter)를
 * 연타하면 게이지가 오르고, 손을 놓으면 서서히 게이지가 줄어들며 손도 다시
 * 벌어집니다. 게이지가 Success Hold Ratio(예: 85%) 이상을 Success Hold
 * Frames(예: 60프레임=1초) 동안 끊기지 않고 유지하면 성공 처리됩니다.
 * 중간에 게이지가 기준 아래로 떨어지면 유지 시간은 0부터 다시 카운트됩니다.
 *
 * 성공하면 화면 플래시 + 큰 스파크가 터지는 폭발 연출(Explosion Frames 동안)
 * 후, 미니게임 화면 전체가 Fade Out Frames 동안 서서히 사라지면서 기존
 * 이벤트(플러그인 커맨드 다음 줄)로 자연스럽게 이어집니다.
 *
 * 이미지 준비 (img/pictures 폴더):
 *  - 왼쪽 손 이미지: 오른쪽을 향해 돌을 든 손 모양 권장
 *  - 오른쪽 손 이미지: 왼쪽을 향해 돌을 든 손 모양 권장
 *  - 스파크 이미지: 정사각형에 가까운 작은 불꽃 한 장이면 충분 (회전/크기 랜덤 적용됨)
 *
 * ----------------------------------------------------------------------------
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('FireStartMinigame');

    var leftHandImg   = String(parameters['Left Hand Image'] || 'FireHand_Left');
    var rightHandImg  = String(parameters['Right Hand Image'] || 'FireHand_Right');
    var sparkImg      = String(parameters['Spark Image'] || 'FireSpark');

    var centerXParam  = Number(parameters['Center X'] || 0);
    var centerYParam  = Number(parameters['Center Y'] || 0);
    var maxDistance   = Number(parameters['Hand Max Distance'] || 160);

    var gaugeMax      = Number(parameters['Gauge Max'] || 100);
    var gaugeGain     = Number(parameters['Gauge Gain Per Press'] || 6);
    var gaugeDecay    = Number(parameters['Gauge Decay Per Frame'] || 0.5);

    var successHoldRatio  = Number(parameters['Success Hold Ratio'] || 0.85);
    var successHoldFrames = Number(parameters['Success Hold Frames'] || 60);

    var sparkStartRatio = Number(parameters['Spark Start Ratio'] || 0.55);
    var minSparkCount  = Number(parameters['Min Spark Count'] || 1);
    var maxSparkCount  = Number(parameters['Max Spark Count'] || 6);
    var sparkLife      = Number(parameters['Spark Life'] || 18);

    var shakeAmount    = Number(parameters['Shake Amount'] || 4);

    var gaugeBarX      = Number(parameters['Gauge Bar X'] || 0);
    var gaugeBarY      = Number(parameters['Gauge Bar Y'] || 60);
    var gaugeBarWidth  = Number(parameters['Gauge Bar Width'] || 240);
    var gaugeBarHeight = Number(parameters['Gauge Bar Height'] || 16);
    var gaugeBarColor  = String(parameters['Gauge Bar Color'] || '#ff8800');

    var dimBackground  = String(parameters['Dim Background'] || 'true') === 'true';

    var pressSeName    = String(parameters['Press SE Name'] || '');
    var pressSeVolume  = Number(parameters['Press SE Volume'] || 40);
    var pressSePitch   = Number(parameters['Press SE Pitch'] || 120);

    var successSeName   = String(parameters['Success SE Name'] || '');
    var successSeVolume = Number(parameters['Success SE Volume'] || 90);
    var successSePitch  = Number(parameters['Success SE Pitch'] || 100);

    var defaultSwitch   = Number(parameters['Default Switch'] || 1);
    var defaultVariable = Number(parameters['Default Variable'] || 0);
    var defaultCommon   = Number(parameters['Default Common Event'] || 0);

    var explosionFrames   = Number(parameters['Explosion Frames'] || 40);
    var explosionCount    = Number(parameters['Explosion Particle Count'] || 30);
    var explosionScale    = Number(parameters['Explosion Scale'] || 2.2);
    var flashColor        = String(parameters['Flash Color'] || '#fff2c0');
    var flashMaxOpacity   = Number(parameters['Flash Max Opacity'] || 200);
    var fadeOutFrames     = Number(parameters['Fade Out Frames'] || 40);

    var promptText       = String(parameters['Prompt Text'] || '스페이스바를 눌러라!');
    var promptXParam     = Number(parameters['Prompt X'] || 0);
    var promptYParam     = Number(parameters['Prompt Y'] || 0);
    var promptFontSize   = Number(parameters['Prompt Font Size'] || 40);
    var promptColor      = String(parameters['Prompt Color'] || '#ffffff');
    var promptOutline    = String(parameters['Prompt Outline Color'] || 'rgba(120,40,0,0.9)');
    var promptMinScale   = Number(parameters['Prompt Min Scale'] || 0.85);
    var promptMaxScale   = Number(parameters['Prompt Max Scale'] || 1.25);
    var promptPulseFrames = Number(parameters['Prompt Pulse Frames'] || 50);
    var promptHideOnSpark = String(parameters['Prompt Hide On Spark'] || 'false') === 'true';

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'FireStart_Start') {
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
            this.setWaitMode('fireStartQte');
            SceneManager._scene.startFireStartQTE(this, switchId, variableId, commonId);
        }
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'fireStartQte') {
            if (SceneManager._scene._fireStartSprite) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_FireSpark  (스파크 한 개)
    //-------------------------------------------------------------------------
    function Sprite_FireSpark() {
        this.initialize.apply(this, arguments);
    }

    Sprite_FireSpark.prototype = Object.create(Sprite.prototype);
    Sprite_FireSpark.prototype.constructor = Sprite_FireSpark;

    Sprite_FireSpark.prototype.initialize = function(x, y, scale) {
        Sprite.prototype.initialize.call(this);
        this.bitmap = ImageManager.loadPicture(sparkImg);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x = x;
        this.y = y;
        this.rotation = Math.random() * Math.PI * 2;
        this._baseScale = scale;
        this.scale.x = this.scale.y = scale * (0.4 + Math.random() * 0.6);
        this._vx = (Math.random() - 0.5) * 6;
        this._vy = -Math.random() * 5 - 1;
        this._gravity = 0.25;
        this._life = sparkLife;
        this._maxLife = sparkLife;
        this.blendMode = Graphics.BLEND_ADD;
    };

    Sprite_FireSpark.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.x += this._vx;
        this.y += this._vy;
        this._vy += this._gravity;
        this._life--;
        this.opacity = 255 * Math.max(0, this._life / this._maxLife);
        this.rotation += 0.2;
    };

    Sprite_FireSpark.prototype.isDead = function() {
        return this._life <= 0;
    };

    //-------------------------------------------------------------------------
    // Sprite_FireStartQTE  (미니게임 본체)
    //-------------------------------------------------------------------------
    function Sprite_FireStartQTE() {
        this.initialize.apply(this, arguments);
    }

    Sprite_FireStartQTE.prototype = Object.create(Sprite.prototype);
    Sprite_FireStartQTE.prototype.constructor = Sprite_FireStartQTE;

    Sprite_FireStartQTE.prototype.initialize = function(interpreter, switchId, variableId, commonEventId) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._switchId = switchId;
        this._variableId = variableId;
        this._commonEventId = commonEventId;

        this._centerX = centerXParam || Graphics.boxWidth / 2;
        this._centerY = centerYParam || Graphics.boxHeight / 2;

        this._gauge = 0;
        this._holdTimer = 0;
        this._state = 'playing'; // playing -> exploding -> fading
        this._explosionTimer = 0;
        this._fadeTimer = 0;
        this._shakeTimer = 0;

        this._sparks = [];

        this._leftHand = new Sprite(ImageManager.loadPicture(leftHandImg));
        this._leftHand.anchor.x = 1;
        this._leftHand.anchor.y = 0.5;

        this._rightHand = new Sprite(ImageManager.loadPicture(rightHandImg));
        this._rightHand.anchor.x = 0;
        this._rightHand.anchor.y = 0.5;

        this.addChild(this._leftHand);
        this.addChild(this._rightHand);

        this._sparkLayer = new Sprite();
        this.addChild(this._sparkLayer);

        this._gaugeSprite = new Sprite(new Bitmap(gaugeBarWidth + 4, gaugeBarHeight + 10));
        this._gaugeSprite.x = (gaugeBarX || (Graphics.boxWidth - gaugeBarWidth) / 2);
        this._gaugeSprite.y = gaugeBarY;
        this.addChild(this._gaugeSprite);

        this.createPromptSprite();

        this._flashSprite = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
        this._flashSprite.bitmap.fillAll(flashColor);
        this._flashSprite.opacity = 0;
        this.addChild(this._flashSprite);

        this.updateHandPosition();
        this.refreshGauge();
    };

    Sprite_FireStartQTE.prototype.createPromptSprite = function() {
        var padding = 20;
        var bmpWidth = Graphics.boxWidth;
        var bmpHeight = promptFontSize + padding * 2;

        var bitmap = new Bitmap(bmpWidth, bmpHeight);
        bitmap.fontSize = promptFontSize;
        bitmap.fontBold = true;
        bitmap.textColor = promptColor;
        bitmap.outlineColor = promptOutline;
        bitmap.outlineWidth = 6;
        bitmap.drawText(promptText, 0, padding, bmpWidth, promptFontSize, 'center');

        this._promptSprite = new Sprite(bitmap);
        this._promptSprite.anchor.x = 0.5;
        this._promptSprite.anchor.y = 0.5;
        this._promptSprite.x = promptXParam || Graphics.boxWidth / 2;
        this._promptSprite.y = promptYParam || Math.round(Graphics.boxHeight * 0.28);
        this._promptTimer = 0;
        this.addChild(this._promptSprite);
    };

    Sprite_FireStartQTE.prototype.updatePrompt = function() {
        if (!this._promptSprite) return;

        if (promptHideOnSpark && this.ratio() >= sparkStartRatio) {
            this._promptSprite.visible = false;
            return;
        }
        this._promptSprite.visible = true;

        this._promptTimer = (this._promptTimer + 1) % promptPulseFrames;
        var t = this._promptTimer / promptPulseFrames;
        // 0 -> 1 -> 0 삼각파로 min과 max 사이를 왕복
        var wave = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
        var scale = promptMinScale + (promptMaxScale - promptMinScale) * wave;
        this._promptSprite.scale.x = this._promptSprite.scale.y = scale;
    };

    Sprite_FireStartQTE.prototype.ratio = function() {
        return this._gauge / gaugeMax;
    };

    Sprite_FireStartQTE.prototype.update = function() {
        Sprite.prototype.update.call(this);

        if (this._state === 'exploding') {
            this.updateExplosion();
            return;
        }
        if (this._state === 'fading') {
            this.updateFade();
            return;
        }

        if (Input.isTriggered('ok')) {
            this.onPress();
        }

        this._gauge = Math.max(0, this._gauge - gaugeDecay);
        this.updateHandPosition();
        this.updateShake();
        this.updateSparks();
        this.updatePrompt();
        this.updateHold();
        this.refreshGauge();

        if (this._holdTimer >= successHoldFrames) {
            this.startFinish();
        }
    };

    Sprite_FireStartQTE.prototype.updateHold = function() {
        if (this.ratio() >= successHoldRatio) {
            this._holdTimer++;
        } else {
            this._holdTimer = 0;
        }
    };

    Sprite_FireStartQTE.prototype.onPress = function() {
        this._gauge = Math.min(gaugeMax, this._gauge + gaugeGain);
        this._shakeTimer = 8;

        if (pressSeName) {
            AudioManager.playSe({ name: pressSeName, volume: pressSeVolume, pitch: pressSePitch, pan: 0 });
        }

        var ratio = this.ratio();
        if (ratio >= sparkStartRatio) {
            var t = (ratio - sparkStartRatio) / Math.max(0.0001, 1 - sparkStartRatio);
            var count = Math.round(minSparkCount + (maxSparkCount - minSparkCount) * t);
            this.spawnSparks(count, 0.6 + t * 0.8);
        }
    };

    Sprite_FireStartQTE.prototype.spawnSparks = function(count, scale) {
        for (var i = 0; i < count; i++) {
            var ox = (Math.random() - 0.5) * 10;
            var oy = (Math.random() - 0.5) * 10;
            var spark = new Sprite_FireSpark(this._centerX + ox, this._centerY + oy, scale);
            this._sparkLayer.addChild(spark);
            this._sparks.push(spark);
        }
    };

    Sprite_FireStartQTE.prototype.updateSparks = function() {
        for (var i = this._sparks.length - 1; i >= 0; i--) {
            var spark = this._sparks[i];
            if (spark.isDead()) {
                this._sparkLayer.removeChild(spark);
                this._sparks.splice(i, 1);
            }
        }
    };

    Sprite_FireStartQTE.prototype.updateShake = function() {
        var offsetX = 0;
        var offsetY = 0;
        if (this._shakeTimer > 0) {
            this._shakeTimer--;
            var power = shakeAmount * (this._shakeTimer / 8);
            offsetX = (Math.random() - 0.5) * power;
            offsetY = (Math.random() - 0.5) * power;
        }
        this._shakeOffsetX = offsetX;
        this._shakeOffsetY = offsetY;
    };

    Sprite_FireStartQTE.prototype.updateHandPosition = function() {
        var ratio = this.ratio();
        var dist = maxDistance * (1 - ratio);
        var ox = this._shakeOffsetX || 0;
        var oy = this._shakeOffsetY || 0;

        this._leftHand.x = this._centerX - dist + ox;
        this._leftHand.y = this._centerY + oy;

        this._rightHand.x = this._centerX + dist + ox;
        this._rightHand.y = this._centerY + oy;
    };

    Sprite_FireStartQTE.prototype.refreshGauge = function() {
        var bitmap = this._gaugeSprite.bitmap;
        bitmap.clear();
        bitmap.fillRect(0, 0, gaugeBarWidth + 4, gaugeBarHeight + 4, 'rgba(0,0,0,0.6)');
        bitmap.fillRect(2, 2, gaugeBarWidth, gaugeBarHeight, '#333333');
        var w = Math.round(gaugeBarWidth * this.ratio());
        if (w > 0) {
            bitmap.fillRect(2, 2, w, gaugeBarHeight, gaugeBarColor);
        }
        // 성공 유지 기준선 표시
        var thresholdX = 2 + Math.round(gaugeBarWidth * successHoldRatio);
        bitmap.fillRect(thresholdX, 0, 2, gaugeBarHeight + 4, '#ffffff');

        // 유지 시간 진행도(기준선 이상 유지 중일 때만 노란색 보조 바로 표시)
        if (this._holdTimer > 0) {
            var holdRatio = Math.min(1, this._holdTimer / successHoldFrames);
            var holdW = Math.round(gaugeBarWidth * holdRatio);
            bitmap.fillRect(2, gaugeBarHeight + 4, holdW, 4, '#ffee66');
        }
    };

    Sprite_FireStartQTE.prototype.startFinish = function() {
        this._state = 'exploding';
        this._explosionTimer = explosionFrames;

        if (this._promptSprite) {
            this._promptSprite.visible = false;
        }

        this.spawnSparks(explosionCount, explosionScale);
        this._flashSprite.opacity = flashMaxOpacity;

        if (successSeName) {
            AudioManager.playSe({ name: successSeName, volume: successSeVolume, pitch: successSePitch, pan: 0 });
        }
        if (this._switchId > 0) {
            $gameSwitches.setValue(this._switchId, true);
        }
        if (this._variableId > 0) {
            $gameVariables.setValue(this._variableId, Math.round(this.ratio() * 100));
        }
    };

    Sprite_FireStartQTE.prototype.updateExplosion = function() {
        this.updateSparks();

        // 폭발 중간중간 추가 스파크를 터뜨려 불이 확 붙는 느낌을 유지
        if (Graphics.frameCount % 3 === 0) {
            this.spawnSparks(4, explosionScale * (0.5 + Math.random() * 0.5));
        }

        // 플래시는 빠르게 밝아졌다가 explosionFrames 동안 서서히 사라짐
        if (this._flashSprite.opacity > 0) {
            this._flashSprite.opacity = Math.max(0, this._flashSprite.opacity - (flashMaxOpacity / (explosionFrames * 0.6)));
        }

        // 손은 완전히 맞닿은 채로 살짝 계속 흔들리게
        this._shakeTimer = 4;
        this.updateShake();
        this.updateHandPosition();

        this._explosionTimer--;
        if (this._explosionTimer <= 0) {
            this._state = 'fading';
            this._fadeTimer = fadeOutFrames;
        }
    };

    Sprite_FireStartQTE.prototype.updateFade = function() {
        this.updateSparks();

        this._fadeTimer--;
        var t = Math.max(0, this._fadeTimer / fadeOutFrames);
        this.opacity = Math.round(255 * t);

        var dim = SceneManager._scene._fireStartDim;
        if (dim) {
            dim.opacity = Math.round(255 * t);
        }

        if (this._fadeTimer <= 0) {
            this.finish();
        }
    };

    Sprite_FireStartQTE.prototype.finish = function() {
        var commonEventId = this._commonEventId;
        SceneManager._scene.endFireStartQTE();

        if (commonEventId > 0 && $dataCommonEvents[commonEventId]) {
            this._interpreter.setupChild($dataCommonEvents[commonEventId].list, 0);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startFireStartQTE = function(interpreter, switchId, variableId, commonEventId) {
        if (dimBackground) {
            this._fireStartDim = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
            this._fireStartDim.bitmap.fillAll('rgba(0,0,0,0.4)');
            this.addChild(this._fireStartDim);
        }
        this._fireStartSprite = new Sprite_FireStartQTE(interpreter, switchId, variableId, commonEventId);
        this.addChild(this._fireStartSprite);
    };

    Scene_Map.prototype.endFireStartQTE = function() {
        if (this._fireStartSprite) {
            this.removeChild(this._fireStartSprite);
            this._fireStartSprite = null;
        }
        if (this._fireStartDim) {
            this.removeChild(this._fireStartDim);
            this._fireStartDim = null;
        }
    };

})();
