//=============================================================================
// CircleTimingQTE.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 지정 좌표에 고정 원이 생기고, 바깥에서 원 테두리가
 * 점점 줄어들며 들어와 고정 원과 겹치는 타이밍에 맞춰 확인키를 누르는
 * 리듬게임 스타일 타이밍 QTE 플러그인
 * @author RSM
 *
 * @param Target X
 * @desc 고정 원(타겟)의 X 좌표 (0이면 자동으로 화면 중앙)
 * @default 0
 *
 * @param Target Y
 * @desc 고정 원(타겟)의 Y 좌표 (0이면 자동으로 화면 중앙)
 * @default 0
 *
 * @param Target Radius
 * @desc 고정 원(타겟)의 반지름(픽셀)
 * @default 40
 *
 * @param Target Line Width
 * @desc 고정 원 테두리 두께(픽셀)
 * @default 4
 *
 * @param Target Color
 * @desc 고정 원 색상 (CSS 색상값)
 * @default #ffcc00
 *
 * @param Ring Start Radius
 * @desc 줄어드는 링이 시작하는 반지름(픽셀)
 * @default 200
 *
 * @param Ring Shrink Frames
 * @desc 링이 Start Radius에서 Target Radius까지 줄어드는 데 걸리는 프레임 수 (60 = 1초)
 * @default 90
 *
 * @param Ring Line Width
 * @desc 줄어드는 링의 테두리 두께(픽셀)
 * @default 6
 *
 * @param Ring Color
 * @desc 줄어드는 링 색상 (CSS 색상값)
 * @default #ffffff
 *
 * @param Perfect Tolerance
 * @desc 퍼펙트 판정 오차 범위(픽셀, 링 반지름과 타겟 반지름의 차이)
 * @default 6
 *
 * @param Good Tolerance
 * @desc 성공(굿) 판정 오차 범위(픽셀). 이 범위를 벗어나면 실패
 * @default 18
 *
 * @param Auto Fail
 * @desc 링이 타겟을 그냥 지나쳐버리면(입력 없이) 자동으로 실패 처리할지 여부
 * @default true
 * @type boolean
 *
 * @param Success SE
 * @desc 성공 시 재생할 효과음 이름 (audio/se 폴더 기준)
 * @default Item3
 *
 * @param Perfect SE
 * @desc 퍼펙트 판정 시 재생할 효과음 이름 (비워두면 Success SE 사용)
 * @default
 *
 * @param Fail SE
 * @desc 실패 시 재생할 효과음 이름 (audio/se 폴더 기준)
 * @default Buzzer1
 *
 * @param Success Common Event
 * @desc 성공(굿/퍼펙트) 시 자동으로 실행할 공통 이벤트 ID (0이면 실행 안 함)
 * @default 0
 *
 * @param Perfect Common Event
 * @desc 퍼펙트 판정 시에만 실행할 공통 이벤트 ID (0이면 Success Common Event 사용)
 * @default 0
 *
 * @param Fail Common Event
 * @desc 실패 시 자동으로 실행할 공통 이벤트 ID (0이면 실행 안 함)
 * @default 0
 *
 * @param Perfect Variable Value
 * @desc 퍼펙트 판정 시 결과 변수에 저장할 값
 * @default 2
 *
 * @param Success Popup Text
 * @desc 굿 판정 시 잠깐 띄울 텍스트
 * @default 성공!
 *
 * @param Perfect Popup Text
 * @desc 퍼펙트 판정 시 잠깐 띄울 텍스트
 * @default 퍼펙트!
 *
 * @param Success Popup Image
 * @desc 성공 시 잠깐 띄울 이미지 파일명 (img/pictures 폴더 기준, 확장자 제외). 비워두면 텍스트 사용
 * @default
 *
 * @param Perfect Popup Image
 * @desc 퍼펙트 시 잠깐 띄울 이미지 파일명 (img/pictures 폴더 기준, 확장자 제외). 비워두면 Success Popup Image 또는 텍스트 사용
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
 * @param Success Popup Scale Frames
 * @desc 팝업이 커지는 애니메이션 길이 (프레임). 0이면 애니메이션 없이 바로 원래 크기로 뜸
 * @default 14
 *
 * @param Success Popup Overshoot
 * @desc 팝업이 커질 때 원래 크기의 몇 배까지 튀었다가 줄어드는지 (1.3 = 130%까지 튀었다가 100%로)
 * @default 1.3
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
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 * 이벤트의 [플러그인 명령]에서 아래와 같이 입력하세요.
 *
 *   CircleQTE_Start
 *
 * 결과는 아래 게임 변수/스위치에 자동으로 저장됩니다.
 *
 *   변수 1번  : 퍼펙트면 2, 성공(굿)이면 1, 실패면 0
 *   스위치 1번 : 퍼펙트 또는 성공이면 ON, 실패면 OFF
 *
 * 결과 번호나 좌표를 바꾸고 싶으면 아래처럼 인자를 추가하세요.
 *
 *   CircleQTE_Start switch:5 variable:3 x:600 y:300
 *
 *   switch:5   → 5번 스위치에 성공 여부 저장
 *   variable:3 → 3번 변수에 결과값(0/1/2) 저장
 *   x:600      → 타겟 원의 X 좌표를 이번만 600으로 지정 (생략 시 파라미터 기본값)
 *   y:300      → 타겟 원의 Y 좌표를 이번만 300으로 지정 (생략 시 파라미터 기본값)
 *   scommon:10 → 성공(굿) 시 10번 공통 이벤트 자동 실행
 *   pcommon:12 → 퍼펙트 시 12번 공통 이벤트 자동 실행 (없으면 scommon 사용)
 *   fcommon:11 → 실패 시 11번 공통 이벤트 자동 실행
 *
 * 확인키(스페이스/엔터)를 눌러 판정합니다.
 * 링 반지름이 타겟 반지름과 Perfect Tolerance 이내로 일치하면 퍼펙트,
 * Good Tolerance 이내면 성공, 그 밖이면 실패입니다.
 * Auto Fail이 true면 아무 입력 없이 링이 타겟을 완전히 지나쳐버려도 실패 처리됩니다.
 *
 * 실패하면 그 즉시 QTE가 종료됩니다 (재시도 없음).
 * 성공/실패 시 지정한 공통 이벤트가 있으면 QTE를 호출한 이벤트에 곧바로 이어붙여 실행되므로,
 * 그 안에서 전투 시작, 아이템 증감 등 원하는 이벤트 명령을 자유롭게 넣을 수 있고,
 * 공통 이벤트 안에서 CircleQTE_Start를 다시 호출하는 재귀 구조도 안전하게 동작합니다.
 *
 * 이벤트 명령 예시:
 * -----------------------------------------------------------------------
 *  ◆플러그인 명령: CircleQTE_Start switch:5
 *  ◆조건분기: 스위치 [0005]가 ON
 *    ◆문장表示: "성공했다!"
 *  ◆그렇지 않으면
 *    ◆문장表示: "실패했다..."
 *  ◆분기 종료
 * -----------------------------------------------------------------------
 *
 * 라이선스: 자유롭게 수정/배포 가능
 * =============================================================================
 */

(function() {

    var parameters = PluginManager.parameters('CircleTimingQTE');
    var targetX          = Number(parameters['Target X'] || 0);
    var targetY          = Number(parameters['Target Y'] || 0);
    var targetRadius     = Number(parameters['Target Radius'] || 40);
    var targetLineWidth  = Number(parameters['Target Line Width'] || 4);
    var targetColor      = String(parameters['Target Color'] || '#ffcc00');
    var ringStartRadius  = Number(parameters['Ring Start Radius'] || 200);
    var ringShrinkFrames = Number(parameters['Ring Shrink Frames'] || 90);
    var ringLineWidth    = Number(parameters['Ring Line Width'] || 6);
    var ringColor        = String(parameters['Ring Color'] || '#ffffff');
    var perfectTolerance = Number(parameters['Perfect Tolerance'] || 6);
    var goodTolerance    = Number(parameters['Good Tolerance'] || 18);
    var autoFail         = String(parameters['Auto Fail'] || 'true') === 'true';
    var successSE        = String(parameters['Success SE'] || 'Item3');
    var perfectSE        = String(parameters['Perfect SE'] || '');
    var failSE           = String(parameters['Fail SE'] || 'Buzzer1');
    var defaultSuccessCommon = Number(parameters['Success Common Event'] || 0);
    var defaultPerfectCommon = Number(parameters['Perfect Common Event'] || 0);
    var defaultFailCommon    = Number(parameters['Fail Common Event'] || 0);
    var perfectVarValue  = Number(parameters['Perfect Variable Value'] || 2);
    var popupText         = String(parameters['Success Popup Text'] || '성공!');
    var perfectPopupText  = String(parameters['Perfect Popup Text'] || '퍼펙트!');
    var popupImage        = String(parameters['Success Popup Image'] || '');
    var perfectPopupImage = String(parameters['Perfect Popup Image'] || '');
    var popupDuration    = Number(parameters['Success Popup Duration'] || 60);
    var popupColor       = String(parameters['Success Popup Color'] || '#ffee00');
    var popupScaleFrames = Number(parameters['Success Popup Scale Frames'] || 14);
    var popupOvershoot   = Number(parameters['Success Popup Overshoot'] || 1.3);
    var bgImage          = String(parameters['Background Image'] || '');
    var bgX              = Number(parameters['Background X'] || 0);
    var bgY              = Number(parameters['Background Y'] || 0);

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'CircleQTE_Start') {
            var switchId = 1;
            var variableId = 1;
            var successCommon = defaultSuccessCommon;
            var perfectCommon = defaultPerfectCommon;
            var failCommon = defaultFailCommon;
            var x = targetX;
            var y = targetY;
            args.forEach(function(arg) {
                if (arg.indexOf('switch:') === 0) {
                    switchId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('variable:') === 0) {
                    variableId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('scommon:') === 0) {
                    successCommon = Number(arg.split(':')[1]);
                } else if (arg.indexOf('pcommon:') === 0) {
                    perfectCommon = Number(arg.split(':')[1]);
                } else if (arg.indexOf('fcommon:') === 0) {
                    failCommon = Number(arg.split(':')[1]);
                } else if (arg.indexOf('x:') === 0) {
                    x = Number(arg.split(':')[1]);
                } else if (arg.indexOf('y:') === 0) {
                    y = Number(arg.split(':')[1]);
                }
            });
            this.setWaitMode('circleQte');
            SceneManager._scene.startCircleQTE(this, switchId, variableId, successCommon, perfectCommon, failCommon, x, y);
        }
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'circleQte') {
            if (SceneManager._scene._circleQteSprite) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_CircleTimingQTE
    //-------------------------------------------------------------------------
    function Sprite_CircleTimingQTE() {
        this.initialize.apply(this, arguments);
    }

    Sprite_CircleTimingQTE.prototype = Object.create(Sprite.prototype);
    Sprite_CircleTimingQTE.prototype.constructor = Sprite_CircleTimingQTE;

    Sprite_CircleTimingQTE.prototype.initialize = function(interpreter, switchId, variableId, successCommon, perfectCommon, failCommon, cx, cy) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._switchId = switchId;
        this._variableId = variableId;
        this._successCommon = successCommon || 0;
        this._perfectCommon = perfectCommon || 0;
        this._failCommon = failCommon || 0;
        this._finished = false;
        this._state = 'playing';
        this._commonEventId = 0;

        this._cx = cx > 0 ? cx : Graphics.boxWidth / 2;
        this._cy = cy > 0 ? cy : Graphics.boxHeight / 2;

        var size = (ringStartRadius + ringLineWidth) * 2 + 4;
        this.bitmap = new Bitmap(size, size);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x = this._cx;
        this.y = this._cy;

        this._ringRadius = ringStartRadius;
        this._shrinkPerFrame = (ringStartRadius - targetRadius) / Math.max(1, ringShrinkFrames);
        this._passed = false;

        this.redraw();
    };

    Sprite_CircleTimingQTE.prototype.centerPx = function() {
        return this.bitmap.width / 2;
    };

    Sprite_CircleTimingQTE.prototype.redraw = function() {
        var ctx = this.bitmap.context;
        var c = this.centerPx();
        this.bitmap.clear();

        // 고정 타겟 원
        ctx.save();
        ctx.beginPath();
        ctx.arc(c, c, targetRadius, 0, Math.PI * 2, false);
        ctx.lineWidth = targetLineWidth;
        ctx.strokeStyle = targetColor;
        ctx.stroke();
        ctx.restore();

        // 줄어드는 링
        ctx.save();
        ctx.beginPath();
        ctx.arc(c, c, Math.max(this._ringRadius, 0.1), 0, Math.PI * 2, false);
        ctx.lineWidth = ringLineWidth;
        ctx.strokeStyle = ringColor;
        ctx.stroke();
        ctx.restore();

        this.bitmap._baseTexture.update();
    };

    Sprite_CircleTimingQTE.prototype.update = function() {
        Sprite.prototype.update.call(this);

        if (this._state === 'popup') {
            this._popupTimer--;
            this._popupElapsed++;
            this.updatePopupScale();
            if (this._popupTimer <= 0) {
                this.finish();
            }
            return;
        }

        if (this._finished) return;

        this._ringRadius -= this._shrinkPerFrame;

        if (!this._passed && this._ringRadius <= targetRadius) {
            this._passed = true;
        }

        this.redraw();

        if (Input.isTriggered('ok')) {
            this.judge();
            return;
        }

        // 입력 없이 링이 타겟을 완전히 지나쳐버린 경우 자동 실패
        if (autoFail && this._ringRadius <= targetRadius - goodTolerance) {
            this.judge(true);
        }
    };

    Sprite_CircleTimingQTE.prototype.judge = function(forcedFail) {
        var diff = Math.abs(this._ringRadius - targetRadius);
        var result; // 'perfect' | 'good' | 'fail'

        if (forcedFail) {
            result = 'fail';
        } else if (diff <= perfectTolerance) {
            result = 'perfect';
        } else if (diff <= goodTolerance) {
            result = 'good';
        } else {
            result = 'fail';
        }

        var success = result !== 'fail';

        if (this._switchId > 0) {
            $gameSwitches.setValue(this._switchId, success);
        }
        if (this._variableId > 0) {
            var val = result === 'perfect' ? perfectVarValue : (result === 'good' ? 1 : 0);
            $gameVariables.setValue(this._variableId, val);
        }

        var seName;
        if (result === 'perfect') {
            seName = perfectSE || successSE;
        } else if (result === 'good') {
            seName = successSE;
        } else {
            seName = failSE;
        }
        AudioManager.playSe({ name: seName, volume: 90, pitch: 100, pan: 0 });

        if (result === 'perfect') {
            this._commonEventId = this._perfectCommon || this._successCommon;
        } else if (result === 'good') {
            this._commonEventId = this._successCommon;
        } else {
            this._commonEventId = this._failCommon;
        }

        if (success && popupDuration > 0) {
            this._state = 'popup';
            this._popupTimer = popupDuration;
            this._popupElapsed = 0;
            this.showPopup(result === 'perfect');
        } else {
            this.finish();
        }
    };

    Sprite_CircleTimingQTE.prototype.updatePopupScale = function() {
        if (popupScaleFrames <= 0) {
            this.scale.x = this.scale.y = 1;
            return;
        }
        var growFrames = Math.max(1, Math.round(popupScaleFrames * 0.65));
        var shrinkFrames = Math.max(1, popupScaleFrames - growFrames);
        var t = this._popupElapsed;
        var scale;
        if (t <= growFrames) {
            var p = t / growFrames;
            p = 1 - Math.pow(1 - p, 2);
            scale = popupOvershoot * p;
        } else if (t <= growFrames + shrinkFrames) {
            var p2 = (t - growFrames) / shrinkFrames;
            p2 = 1 - Math.pow(1 - p2, 2);
            scale = popupOvershoot + (1 - popupOvershoot) * p2;
        } else {
            scale = 1;
        }
        this.scale.x = this.scale.y = scale;
    };

    Sprite_CircleTimingQTE.prototype.showPopup = function(isPerfect) {
        this.bitmap = null;
        this.scale.x = this.scale.y = 0;

        var img = isPerfect ? (perfectPopupImage || popupImage) : popupImage;
        var text = isPerfect ? perfectPopupText : popupText;

        if (img) {
            var bmp = ImageManager.loadPicture(img);
            var self = this;
            bmp.addLoadListener(function() {
                self.bitmap = bmp;
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
            this.bitmap.drawText(text, 0, 0, 240, 60, 'center');
        }
    };

    Sprite_CircleTimingQTE.prototype.finish = function() {
        this._finished = true;
        var commonEventId = this._commonEventId;
        SceneManager._scene.endCircleQTE();

        if (commonEventId > 0 && $dataCommonEvents[commonEventId]) {
            this._interpreter.setupChild($dataCommonEvents[commonEventId].list, 0);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startCircleQTE = function(interpreter, switchId, variableId, successCommon, perfectCommon, failCommon, x, y) {
        if (bgImage) {
            this._circleQteBg = new Sprite(ImageManager.loadPicture(bgImage));
            this._circleQteBg.x = bgX;
            this._circleQteBg.y = bgY;
            this.addChild(this._circleQteBg);
        }
        this._circleQteSprite = new Sprite_CircleTimingQTE(interpreter, switchId, variableId, successCommon, perfectCommon, failCommon, x, y);
        this.addChild(this._circleQteSprite);
    };

    Scene_Map.prototype.endCircleQTE = function() {
        if (this._circleQteSprite) {
            this.removeChild(this._circleQteSprite);
            this._circleQteSprite = null;
        }
        if (this._circleQteBg) {
            this.removeChild(this._circleQteBg);
            this._circleQteBg = null;
        }
    };

})();
