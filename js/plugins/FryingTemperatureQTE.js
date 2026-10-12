//=============================================================================
// FryingTemperatureQTE.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 랜덤 적정 온도 구간을 스페이스/엔터(확인키)로 유지해서
 * 일정 시간(기본 5초) 동안 벗어나지 않아야 성공하는 튀김용 QTE 플러그인
 * @author RSM
 *
 * @param Bar X
 * @desc 온도 게이지의 X 좌표 (0이면 자동으로 화면 중앙)
 * @default 0
 *
 * @param Bar Y
 * @desc 온도 게이지의 Y 좌표
 * @default 300
 *
 * @param Bar Width
 * @desc 온도 게이지의 너비(픽셀)
 * @default 400
 *
 * @param Bar Height
 * @desc 온도 게이지의 높이(픽셀)
 * @default 24
 *
 * @param Marker Width
 * @desc 현재 온도를 나타내는 마커의 너비(픽셀)
 * @default 8
 *
 * @param Heat Rate
 * @desc 확인키(스페이스/엔터)를 누르고 있을 때 1프레임당 온도 상승량
 * @default 1.2
 *
 * @param Cool Rate
 * @desc 확인키를 떼고 있을 때 1프레임당 온도 하강량
 * @default 0.8
 *
 * @param Zone Min Width
 * @desc 랜덤 적정 온도 구간의 최소 너비(픽셀)
 * @default 50
 *
 * @param Zone Max Width
 * @desc 랜덤 적정 온도 구간의 최대 너비(픽셀)
 * @default 80
 *
 * @param Hold Duration
 * @desc 적정 구간 안에서 연속으로 유지해야 하는 시간(프레임, 60 = 1초). 기본 300 = 5초
 * @default 300
 *
 * @param Time Limit
 * @desc 전체 제한 시간(프레임). 0이면 제한 없음. 시간 초과 시 실패 처리
 * @default 0
 *
 * @param Bar Color
 * @desc 게이지 배경 색상 (CSS 색상값)
 * @default #333333
 *
 * @param Zone Color
 * @desc 적정 온도 구간 색상 (CSS 색상값)
 * @default #ffa500
 *
 * @param Marker Color
 * @desc 현재 온도 마커 색상 (CSS 색상값)
 * @default #ff3333
 *
 * @param Border Color
 * @desc 게이지 테두리 색상 (CSS 색상값). 비워두면 테두리 없음
 * @default #ffffff
 *
 * @param Border Thickness
 * @desc 게이지 테두리 두께(픽셀)
 * @default 3
 *
 * @param Progress Bar Y Offset
 * @desc 유지 시간 진행 바가 온도 게이지 아래로 얼마나 떨어져 표시될지(픽셀)
 * @default 16
 *
 * @param Progress Bar Height
 * @desc 유지 시간 진행 바의 높이(픽셀)
 * @default 12
 *
 * @param Progress Bar Color
 * @desc 유지 시간 진행 바 색상 (CSS 색상값)
 * @default #33cc33
 *
 * @param Progress Reset Color
 * @desc 구간을 벗어나 진행 바가 초기화되는 순간 잠깐 표시할 색상 (CSS 색상값)
 * @default #ff3333
 *
 * @param Success SE
 * @desc 성공 시 재생할 효과음 이름 (audio/se 폴더 기준)
 * @default Item3
 *
 * @param Fail SE
 * @desc 실패(시간 초과) 시 재생할 효과음 이름 (audio/se 폴더 기준)
 * @default Buzzer1
 *
 * @param Out Of Zone SE
 * @desc 구간을 벗어나 진행이 초기화될 때마다 재생할 효과음 이름 (비워두면 재생 안 함)
 * @default Cancel2
 *
 * @param Success Common Event
 * @desc 성공 시 자동으로 실행할 공통 이벤트 ID (0이면 실행 안 함)
 * @default 0
 *
 * @param Fail Common Event
 * @desc 실패 시 자동으로 실행할 공통 이벤트 ID (0이면 실행 안 함)
 * @default 0
 *
 * @param Success Popup Text
 * @desc 성공 시 잠깐 띄울 텍스트 (Success Popup Image를 지정하면 이 텍스트 대신 이미지가 뜸)
 * @default 완성!
 *
 * @param Success Popup Image
 * @desc 성공 시 잠깐 띄울 이미지 파일명 (img/pictures 폴더 기준, 확장자 제외). 비워두면 텍스트 사용
 * @default
 *
 * @param Success Popup Duration
 * @desc 성공 팝업이 화면에 떠있는 시간 (프레임, 60 = 1초)
 * @default 60
 *
 * @param Success Popup Color
 * @desc 성공 팝업 텍스트 색상 (텍스트 모드일 때만 적용, CSS 색상값)
 * @default #ffee00
 *
 * @param Background Image
 * @desc QTE 배경으로 사용할 이미지 파일명 (img/pictures 폴더 기준, 확장자 제외). 비워두면 배경 없음
 * @default
 *
 * @param Background X
 * @desc 배경 이미지 X 좌표
 * @default 0
 *
 * @param Background Y
 * @desc 배경 이미지 Y 좌표
 * @default 0
 *
 * @param Fade In Frames
 * @desc 미니게임 시작 시 페이드 인 되는 시간(프레임, 60 = 1초)
 * @default 30
 *
 * @param Fade Out Frames
 * @desc 미니게임 종료(성공/실패) 시 페이드 아웃 되는 시간(프레임, 60 = 1초)
 * @default 30
 *
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 * 이벤트의 [플러그인 명령]에서 아래와 같이 입력하세요.
 *
 *   FryQTE_Start
 *
 * 결과는 아래 게임 변수/스위치에 자동으로 저장됩니다.
 *
 *   변수 1번  : 성공하면 1, 실패하면 0
 *   스위치 1번 : 성공하면 ON, 실패하면 OFF
 *
 * 결과 번호를 바꾸고 싶으면 아래처럼 인자를 추가하세요.
 *
 *   FryQTE_Start switch:5 variable:3
 *
 *   switch:5   → 5번 스위치에 성공 여부 저장
 *   variable:3 → 3번 변수에 성공(1)/실패(0) 저장
 *   scommon:10 → 성공 시 10번 공통 이벤트 자동 실행
 *   fcommon:11 → 실패 시 11번 공통 이벤트 자동 실행
 *
 * -----------------------------------------------------------------------
 * 게임 방식
 * -----------------------------------------------------------------------
 * - 게이지 위에 적정 온도 구간(주황색)이 랜덤한 위치/너비로 정해집니다.
 * - 스페이스/엔터(확인키)를 누르고 있으면 온도가 올라가고, 떼면 내려갑니다.
 * - 온도 마커가 적정 구간 안에 들어가 있으면 아래쪽 진행 바가 차오릅니다.
 * - 구간을 벗어나면 진행 바가 즉시 0으로 초기화됩니다 (실패하지는 않고 다시 시도).
 * - 진행 바가 가득 차면(기본 5초) 성공 처리됩니다.
 * - Time Limit을 0보다 크게 설정하면, 그 시간 안에 성공하지 못했을 때 실패 처리됩니다.
 *
 * 라이선스: 자유롭게 수정/배포 가능
 * =============================================================================
 */

(function() {

    var parameters = PluginManager.parameters('FryingTemperatureQTE');
    var barWidth        = Number(parameters['Bar Width'] || 400);
    var barHeight        = Number(parameters['Bar Height'] || 24);
    var barX        = Number(parameters['Bar X'] || 0);
    var barY        = Number(parameters['Bar Y'] || 300);
    var markerWidth      = Number(parameters['Marker Width'] || 8);
    var heatRate         = Number(parameters['Heat Rate'] || 1.2);
    var coolRate         = Number(parameters['Cool Rate'] || 0.8);
    var zoneMinWidth     = Number(parameters['Zone Min Width'] || 50);
    var zoneMaxWidth     = Number(parameters['Zone Max Width'] || 80);
    var holdDuration     = Number(parameters['Hold Duration'] || 300);
    var timeLimit        = Number(parameters['Time Limit'] || 0);
    var barColor         = String(parameters['Bar Color'] || '#333333');
    var zoneColor        = String(parameters['Zone Color'] || '#ffa500');
    var markerColor      = String(parameters['Marker Color'] || '#ff3333');
    var borderColor      = String(parameters['Border Color'] || '#ffffff');
    var borderThickness  = Number(parameters['Border Thickness'] || 3);
    var progressYOffset  = Number(parameters['Progress Bar Y Offset'] || 16);
    var progressHeight   = Number(parameters['Progress Bar Height'] || 12);
    var progressColor    = String(parameters['Progress Bar Color'] || '#33cc33');
    var progressResetColor = String(parameters['Progress Reset Color'] || '#ff3333');
    var successSE        = String(parameters['Success SE'] || 'Item3');
    var failSE           = String(parameters['Fail SE'] || 'Buzzer1');
    var outOfZoneSE      = String(parameters['Out Of Zone SE'] || 'Cancel2');
    var defaultSuccessCommon = Number(parameters['Success Common Event'] || 0);
    var defaultFailCommon    = Number(parameters['Fail Common Event'] || 0);
    var popupText        = String(parameters['Success Popup Text'] || '완성!');
    var popupImage       = String(parameters['Success Popup Image'] || '');
    var popupDuration    = Number(parameters['Success Popup Duration'] || 60);
    var popupColor       = String(parameters['Success Popup Color'] || '#ffee00');
    var bgImage          = String(parameters['Background Image'] || '');
    var bgX              = Number(parameters['Background X'] || 0);
    var bgY              = Number(parameters['Background Y'] || 0);
    var fadeInFrames     = Number(parameters['Fade In Frames'] || 30);
    var fadeOutFrames    = Number(parameters['Fade Out Frames'] || 30);

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'FryQTE_Start') {
            var switchId = 1;
            var variableId = 1;
            var successCommon = defaultSuccessCommon;
            var failCommon = defaultFailCommon;
            args.forEach(function(arg) {
                if (arg.indexOf('switch:') === 0) {
                    switchId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('variable:') === 0) {
                    variableId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('scommon:') === 0) {
                    successCommon = Number(arg.split(':')[1]);
                } else if (arg.indexOf('fcommon:') === 0) {
                    failCommon = Number(arg.split(':')[1]);
                }
            });
            this.setWaitMode('fryQte');
            SceneManager._scene.startFryingQTE(this, switchId, variableId, successCommon, failCommon);
        }
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'fryQte') {
            if (SceneManager._scene._fryQteSprite) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_FryingTemperatureQTE
    //-------------------------------------------------------------------------
    function Sprite_FryingTemperatureQTE() {
        this.initialize.apply(this, arguments);
    }

    Sprite_FryingTemperatureQTE.prototype = Object.create(Sprite.prototype);
    Sprite_FryingTemperatureQTE.prototype.constructor = Sprite_FryingTemperatureQTE;

    Sprite_FryingTemperatureQTE.prototype.initialize = function(interpreter, switchId, variableId, successCommon, failCommon, bgSprite) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._switchId = switchId;
        this._variableId = variableId;
        this._successCommon = successCommon || 0;
        this._failCommon = failCommon || 0;
        this._finished = false;
        this._bgSprite = bgSprite || null;
        this._commonEventId = 0;

        if (fadeInFrames > 0) {
            this._state = 'fadein';
            this._fadeTimer = 0;
            this.opacity = 0;
            if (this._bgSprite) this._bgSprite.opacity = 0;
        } else {
            this._state = 'playing';
        }

        var w = barWidth;
        var h = barHeight + progressYOffset + progressHeight;
        var bt = borderThickness;
        this.bitmap = new Bitmap(w + bt * 2, h + bt * 2);
        this.x = (barX > 0 ? barX : (Graphics.boxWidth - w) / 2) - bt;
        this.y = barY - bt;

        // 랜덤 적정 온도 구간 설정
        var zoneWidth = zoneMinWidth + Math.floor(Math.random() * (zoneMaxWidth - zoneMinWidth + 1));
        zoneWidth = Math.min(zoneWidth, w - markerWidth);
        this._zoneWidth = zoneWidth;
        this._zoneStart = Math.floor(Math.random() * (w - zoneWidth));

        // 시작 온도는 구간 밖의 임의 위치(구간에 걸쳐있지 않게 낮은 쪽에서 시작)
        this._temp = Math.max(0, this._zoneStart - markerWidth - 20);

        this._holdTimer = 0;
        this._totalTimer = 0;
        this._resetFlash = 0;

        this.redraw();
    };

    Sprite_FryingTemperatureQTE.prototype.redraw = function() {
        var w = barWidth;
        var h = barHeight;
        var bt = borderThickness;
        this.bitmap.clear();

        // 온도 게이지
        if (borderColor && bt > 0) {
            this.bitmap.fillRect(0, 0, w + bt * 2, h + bt * 2, borderColor);
        }
        this.bitmap.fillRect(bt, bt, w, h, barColor);
        this.bitmap.fillRect(bt + this._zoneStart, bt, this._zoneWidth, h, zoneColor);
        this.bitmap.fillRect(bt + Math.round(this._temp), bt, markerWidth, h, markerColor);

        // 유지 시간 진행 바
        var py = bt + h + progressYOffset;
        var fillColor = this._resetFlash > 0 ? progressResetColor : progressColor;
        this.bitmap.fillRect(bt, py, w, progressHeight, '#111111');
        var progressRatio = this._holdTimer / holdDuration;
        var progressWidth = Math.round(w * progressRatio);
        if (progressWidth > 0) {
            this.bitmap.fillRect(bt, py, progressWidth, progressHeight, fillColor);
        }
    };

    Sprite_FryingTemperatureQTE.prototype.update = function() {
        Sprite.prototype.update.call(this);

        if (this._state === 'fadein') {
            this._fadeTimer++;
            var inRatio = Math.min(1, this._fadeTimer / fadeInFrames);
            this.opacity = 255 * inRatio;
            if (this._bgSprite) this._bgSprite.opacity = 255 * inRatio;
            if (this._fadeTimer >= fadeInFrames) {
                this._state = 'playing';
            }
            return;
        }

        if (this._state === 'fadeout') {
            this._fadeTimer++;
            var outRatio = fadeOutFrames > 0 ? Math.min(1, this._fadeTimer / fadeOutFrames) : 1;
            this.opacity = 255 * (1 - outRatio);
            if (this._bgSprite) this._bgSprite.opacity = 255 * (1 - outRatio);
            if (this._fadeTimer >= fadeOutFrames) {
                this.finish();
            }
            return;
        }

        if (this._state === 'popup') {
            this._popupTimer--;
            this._popupElapsed++;
            this.updatePopupScale();
            if (this._popupTimer <= 0) {
                this.startFadeOut();
            }
            return;
        }

        if (this._finished) return;

        if (this._resetFlash > 0) this._resetFlash--;

        // 확인키(스페이스/엔터)를 누르고 있으면 가열, 떼면 냉각
        if (Input.isPressed('ok')) {
            this._temp += heatRate;
        } else {
            this._temp -= coolRate;
        }
        var maxTemp = barWidth - markerWidth;
        if (this._temp < 0) this._temp = 0;
        if (this._temp > maxTemp) this._temp = maxTemp;

        var markerCenter = this._temp + markerWidth / 2;
        var inZone = (markerCenter >= this._zoneStart &&
                      markerCenter <= this._zoneStart + this._zoneWidth);

        if (inZone) {
            this._holdTimer++;
            if (this._holdTimer >= holdDuration) {
                this.judge(true);
                return;
            }
        } else if (this._holdTimer > 0) {
            // 구간을 벗어나 진행이 초기화되는 순간
            this._holdTimer = 0;
            this._resetFlash = 15;
            if (outOfZoneSE) {
                AudioManager.playSe({ name: outOfZoneSE, volume: 60, pitch: 100, pan: 0 });
            }
        }

        this._totalTimer++;
        if (timeLimit > 0 && this._totalTimer >= timeLimit) {
            this.judge(false);
            return;
        }

        this.redraw();
    };

    Sprite_FryingTemperatureQTE.prototype.judge = function(success) {
        if (this._switchId > 0) {
            $gameSwitches.setValue(this._switchId, success);
        }
        if (this._variableId > 0) {
            $gameVariables.setValue(this._variableId, success ? 1 : 0);
        }

        AudioManager.playSe({ name: success ? successSE : failSE, volume: 90, pitch: 100, pan: 0 });

        this._commonEventId = success ? this._successCommon : this._failCommon;

        if (success && popupDuration > 0) {
            this._state = 'popup';
            this._popupTimer = popupDuration;
            this._popupElapsed = 0;
            this.showPopup();
        } else {
            this.startFadeOut();
        }
    };

    Sprite_FryingTemperatureQTE.prototype.startFadeOut = function() {
        if (fadeOutFrames <= 0) {
            this.finish();
            return;
        }
        this._state = 'fadeout';
        this._fadeTimer = 0;
        // 팝업으로 스케일이 변형되어 있을 수 있으므로 원상 복구
        this.scale.x = this.scale.y = 1;
    };

    Sprite_FryingTemperatureQTE.prototype.updatePopupScale = function() {
        var growFrames = 9;
        var shrinkFrames = 5;
        var overshoot = 1.3;
        var t = this._popupElapsed;
        var scale;
        if (t <= growFrames) {
            var p = t / growFrames;
            p = 1 - Math.pow(1 - p, 2);
            scale = overshoot * p;
        } else if (t <= growFrames + shrinkFrames) {
            var p2 = (t - growFrames) / shrinkFrames;
            p2 = 1 - Math.pow(1 - p2, 2);
            scale = overshoot + (1 - overshoot) * p2;
        } else {
            scale = 1;
        }
        this.scale.x = this.scale.y = scale;
    };

    Sprite_FryingTemperatureQTE.prototype.showPopup = function() {
        this.bitmap.clear();
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.scale.x = this.scale.y = 0;

        if (popupImage) {
            var img = ImageManager.loadPicture(popupImage);
            var self = this;
            img.addLoadListener(function() {
                self.bitmap = img;
                self.x = Graphics.boxWidth / 2;
                self.y = Graphics.boxHeight / 2;
            });
        } else {
            this.bitmap = new Bitmap(240, 60);
            this.x = Graphics.boxWidth / 2;
            this.y = Graphics.boxHeight / 2;
            this.bitmap.fontSize = 36;
            this.bitmap.fontBold = true;
            this.bitmap.textColor = popupColor;
            this.bitmap.outlineColor = 'rgba(0, 0, 0, 0.8)';
            this.bitmap.outlineWidth = 6;
            this.bitmap.drawText(popupText, 0, 0, 240, 60, 'center');
        }
    };

    Sprite_FryingTemperatureQTE.prototype.finish = function() {
        this._finished = true;
        var commonEventId = this._commonEventId;
        SceneManager._scene.endFryingQTE();

        if (commonEventId > 0 && $dataCommonEvents[commonEventId]) {
            this._interpreter.setupChild($dataCommonEvents[commonEventId].list, 0);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startFryingQTE = function(interpreter, switchId, variableId, successCommon, failCommon) {
        if (bgImage) {
            this._fryQteBg = new Sprite(ImageManager.loadPicture(bgImage));
            this._fryQteBg.x = bgX;
            this._fryQteBg.y = bgY;
            this.addChild(this._fryQteBg);
        }
        this._fryQteSprite = new Sprite_FryingTemperatureQTE(interpreter, switchId, variableId, successCommon, failCommon, this._fryQteBg);
        this.addChild(this._fryQteSprite);
    };

    Scene_Map.prototype.endFryingQTE = function() {
        if (this._fryQteSprite) {
            this.removeChild(this._fryQteSprite);
            this._fryQteSprite = null;
        }
        if (this._fryQteBg) {
            this.removeChild(this._fryQteBg);
            this._fryQteBg = null;
        }
    };

})();
