//=============================================================================
// RS_SpaceTimingQTE.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 막대 위에서 마커가 좌우로 움직이다가 랜덤 구간에 들어왔을 때
 * 스페이스(확인키)를 눌러 맞추는 타이밍 QTE 플러그인
 * @author RSM
 *
 * @param Bar X
 * @desc 타이밍 바의 X 좌표 (0이면 자동으로 화면 중앙)
 * @default 0
 *
 * @param Bar Y
 * @desc 타이밍 바의 Y 좌표
 * @default 300
 *
 * @param Bar Width
 * @desc 타이밍 바의 너비(픽셀)
 * @default 400
 *
 * @param Bar Height
 * @desc 타이밍 바의 높이(픽셀)
 * @default 24
 *
 * @param Marker Width
 * @desc 움직이는 마커(막대기)의 너비(픽셀)
 * @default 8
 *
 * @param Marker Speed
 * @desc 마커가 1프레임에 이동하는 픽셀 수
 * @default 6
 *
 * @param Zone Min Width
 * @desc 랜덤 성공 구간의 최소 너비(픽셀)
 * @default 40
 *
 * @param Zone Max Width
 * @desc 랜덤 성공 구간의 최대 너비(픽셀)
 * @default 70
 *
 * @param Bar Color
 * @desc 바 배경 색상 (CSS 색상값)
 * @default #333333
 *
 * @param Zone Color
 * @desc 성공 구간 색상 (CSS 색상값)
 * @default #ffcc00
 *
 * @param Marker Color
 * @desc 마커 색상 (CSS 색상값)
 * @default #ff3333
 *
 * @param Border Color
 * @desc 바 테두리 색상 (CSS 색상값). 비워두면 테두리 없음
 * @default #ffffff
 *
 * @param Border Thickness
 * @desc 바 테두리 두께(픽셀)
 * @default 3
 *
 * @param Success SE
 * @desc 성공 시 재생할 효과음 이름 (audio/se 폴더 기준)
 * @default Item3
 *
 * @param Fail SE
 * @desc 실패 시 재생할 효과음 이름 (audio/se 폴더 기준)
 * @default Buzzer1
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
 * @default 성공!
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
 * @param Marker Image
 * @desc 움직이는 마커로 사용할 이미지 파일명 (img/pictures 폴더 기준, 확장자 제외). 비워두면 색깔 막대 사용
 * @default
 *
 * @param Background Move X
 * @desc 배경 이미지가 1프레임에 가로로 스크롤되는 픽셀 수 (음수 가능, 0이면 정지)
 * @default 0
 *
 * @param Background Move Y
 * @desc 배경 이미지가 1프레임에 세로로 스크롤되는 픽셀 수 (음수 가능, 0이면 정지)
 * @default 0
 *
 * @param Background Width
 * @desc 배경 스크롤 영역의 너비 (0이면 화면 너비 사용)
 * @default 0
 *
 * @param Background Height
 * @desc 배경 스크롤 영역의 높이 (0이면 화면 높이 사용)
 * @default 0
 *
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 * 이벤트의 [플러그인 명령]에서 아래와 같이 입력하세요.
 *
 *   QTE_Start
 *
 * 결과는 아래 게임 변수/스위치에 자동으로 저장됩니다.
 *
 *   변수 1번  : 성공하면 1, 실패하면 0
 *   스위치 1번 : 성공하면 ON, 실패하면 OFF
 *
 * 결과 번호를 바꾸고 싶으면 아래처럼 인자를 추가하세요.
 *
 *   QTE_Start switch:5 variable:3
 *
 *   switch:5   → 5번 스위치에 성공 여부 저장
 *   variable:3 → 3번 변수에 성공(1)/실패(0) 저장
 *   scommon:10 → 성공 시 10번 공통 이벤트 자동 실행 (파라미터의 Success Common Event 대신 사용)
 *   fcommon:11 → 실패 시 11번 공통 이벤트 자동 실행 (파라미터의 Fail Common Event 대신 사용)
 *
 * 실패하면 그 즉시 QTE가 종료됩니다 (재시도 없음).
 * 성공/실패 시 지정한 공통 이벤트가 있으면 QTE를 호출한 이벤트에 곧바로 이어붙여 실행되므로,
 * 그 안에서 전투 시작, 아이템 증감 등 원하는 이벤트 명령을 자유롭게 넣을 수 있고,
 * 공통 이벤트 안에서 QTE_Start를 다시 호출하는 재귀 구조도 안전하게 동작합니다.
 *
 * 이벤트 명령 예시:
 * -----------------------------------------------------------------------
 *  ◆플러그인 명령: QTE_Start switch:5
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

    var parameters = PluginManager.parameters('RS_SpaceTimingQTE');
    var barWidth      = Number(parameters['Bar Width'] || 400);
    var barHeight      = Number(parameters['Bar Height'] || 24);
    var barX      = Number(parameters['Bar X'] || 0);
    var barY      = Number(parameters['Bar Y'] || 300);
    var markerWidth    = Number(parameters['Marker Width'] || 8);
    var markerSpeed    = Number(parameters['Marker Speed'] || 6);
    var zoneMinWidth   = Number(parameters['Zone Min Width'] || 40);
    var zoneMaxWidth   = Number(parameters['Zone Max Width'] || 70);
    var barColor       = String(parameters['Bar Color'] || '#333333');
    var zoneColor      = String(parameters['Zone Color'] || '#ffcc00');
    var markerColor    = String(parameters['Marker Color'] || '#ff3333');
    var borderColor     = String(parameters['Border Color'] || '#ffffff');
    var borderThickness = Number(parameters['Border Thickness'] || 3);
    var successSE      = String(parameters['Success SE'] || 'Item3');
    var failSE         = String(parameters['Fail SE'] || 'Buzzer1');
    var defaultSuccessCommon = Number(parameters['Success Common Event'] || 0);
    var defaultFailCommon    = Number(parameters['Fail Common Event'] || 0);
    var popupText       = String(parameters['Success Popup Text'] || '성공!');
    var popupImage      = String(parameters['Success Popup Image'] || '');
    var popupDuration   = Number(parameters['Success Popup Duration'] || 60);
    var popupColor      = String(parameters['Success Popup Color'] || '#ffee00');
    var popupScaleFrames = Number(parameters['Success Popup Scale Frames'] || 14);
    var popupOvershoot   = Number(parameters['Success Popup Overshoot'] || 1.3);
    var bgImage         = String(parameters['Background Image'] || '');
    var bgX             = Number(parameters['Background X'] || 0);
    var bgY             = Number(parameters['Background Y'] || 0);
    var markerImage     = String(parameters['Marker Image'] || '');
    var bgMoveX         = Number(parameters['Background Move X'] || 0);
    var bgMoveY         = Number(parameters['Background Move Y'] || 0);
    var bgWidth         = Number(parameters['Background Width'] || 0);
    var bgHeight        = Number(parameters['Background Height'] || 0);

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'QTE_Start') {
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
            this.setWaitMode('qteTiming');
            SceneManager._scene.startTimingQTE(this, switchId, variableId, successCommon, failCommon);
        }
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'qteTiming') {
            if (SceneManager._scene._qteSprite) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_TimingQTE
    //-------------------------------------------------------------------------
    function Sprite_TimingQTE() {
        this.initialize.apply(this, arguments);
    }

    Sprite_TimingQTE.prototype = Object.create(Sprite.prototype);
    Sprite_TimingQTE.prototype.constructor = Sprite_TimingQTE;

    Sprite_TimingQTE.prototype.initialize = function(interpreter, switchId, variableId, successCommon, failCommon) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._switchId = switchId;
        this._variableId = variableId;
        this._successCommon = successCommon || 0;
        this._failCommon = failCommon || 0;
        this._finished = false;
        this._state = 'playing';
        this._commonEventId = 0;

        var w = barWidth;
        var h = barHeight;
        var bt = borderThickness;
        this.bitmap = new Bitmap(w + bt * 2, h + bt * 2);
        this.x = (barX > 0 ? barX : (Graphics.boxWidth - w) / 2) - bt;
        this.y = barY - bt;

        // 랜덤 성공 구간 설정
        var zoneWidth = zoneMinWidth + Math.floor(Math.random() * (zoneMaxWidth - zoneMinWidth + 1));
        zoneWidth = Math.min(zoneWidth, w - markerWidth);
        this._zoneWidth = zoneWidth;
        this._zoneStart = Math.floor(Math.random() * (w - zoneWidth));

        this._markerX = 0;
        this._markerDir = 1;

        this.redraw();
    };

    Sprite_TimingQTE.prototype.redraw = function() {
        var w = barWidth;
        var h = barHeight;
        var bt = borderThickness;
        this.bitmap.clear();
        if (borderColor && bt > 0) {
            this.bitmap.fillRect(0, 0, w + bt * 2, h + bt * 2, borderColor);
        }
        this.bitmap.fillRect(bt, bt, w, h, barColor);
        this.bitmap.fillRect(bt + this._zoneStart, bt, this._zoneWidth, h, zoneColor);
        this.bitmap.fillRect(bt + Math.round(this._markerX), bt, markerWidth, h, markerColor);
    };

    Sprite_TimingQTE.prototype.update = function() {
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

        this._markerX += markerSpeed * this._markerDir;
        var maxX = barWidth - markerWidth;
        if (this._markerX >= maxX) {
            this._markerX = 0; // 한 방향으로 이동: 끝에 닿으면 처음으로 리셋
        }

        this.redraw();

        if (Input.isTriggered('ok')) {
            this.judge();
        }
    };

    Sprite_TimingQTE.prototype.judge = function() {
        var markerCenter = this._markerX + markerWidth / 2;
        var success = (markerCenter >= this._zoneStart &&
                        markerCenter <= this._zoneStart + this._zoneWidth);

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
            this.finish();
        }
    };

    Sprite_TimingQTE.prototype.updatePopupScale = function() {
        if (popupScaleFrames <= 0) {
            this.scale.x = this.scale.y = 1;
            return;
        }
        var growFrames = Math.max(1, Math.round(popupScaleFrames * 0.65));
        var shrinkFrames = Math.max(1, popupScaleFrames - growFrames);
        var t = this._popupElapsed;
        var scale;
        if (t <= growFrames) {
            // 0 -> overshoot (ease out)
            var p = t / growFrames;
            p = 1 - Math.pow(1 - p, 2);
            scale = popupOvershoot * p;
        } else if (t <= growFrames + shrinkFrames) {
            // overshoot -> 1.0 (ease out)
            var p2 = (t - growFrames) / shrinkFrames;
            p2 = 1 - Math.pow(1 - p2, 2);
            scale = popupOvershoot + (1 - popupOvershoot) * p2;
        } else {
            scale = 1;
        }
        this.scale.x = this.scale.y = scale;
    };

    Sprite_TimingQTE.prototype.showPopup = function() {
        var w = barWidth;
        var h = barHeight;
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

    Sprite_TimingQTE.prototype.finish = function() {
        this._finished = true;
        var commonEventId = this._commonEventId;
        SceneManager._scene.endTimingQTE();

        if (commonEventId > 0 && $dataCommonEvents[commonEventId]) {
            this._interpreter.setupChild($dataCommonEvents[commonEventId].list, 0);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startTimingQTE = function(interpreter, switchId, variableId, successCommon, failCommon) {
        if (bgImage) {
            this._qteBg = new Sprite(ImageManager.loadPicture(bgImage));
            this._qteBg.x = bgX;
            this._qteBg.y = bgY;
            this.addChild(this._qteBg);
        }
        this._qteSprite = new Sprite_TimingQTE(interpreter, switchId, variableId, successCommon, failCommon);
        this.addChild(this._qteSprite);
    };

    Scene_Map.prototype.endTimingQTE = function() {
        if (this._qteSprite) {
            this.removeChild(this._qteSprite);
            this._qteSprite = null;
        }
        if (this._qteBg) {
            this.removeChild(this._qteBg);
            this._qteBg = null;
        }
    };

})();
