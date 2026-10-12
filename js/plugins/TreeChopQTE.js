//=============================================================================
// TreeChopQTE.js
//=============================================================================

/*:
 * @plugindesc (v1.0) RS_SpaceTimingQTE 방식(막대+마커, 노란 구간에서 확인키)을 활용한
 * 나무 베기 전용 QTE. 성공할 때마다 플레이어/나무 이미지가 단계별로 바뀝니다.
 * @author ㄹㅅㅁ
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
 * @desc 움직이는 마커의 너비(픽셀)
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
 * @desc 성공 구간(노란색) 색상 (CSS 색상값)
 * @default #ffcc00
 *
 * @param Marker Color
 * @desc 마커 색상 (CSS 색상값)
 * @default #ff3333
 *
 * @param Success SE
 * @desc 성공 시 재생할 효과음
 * @default Axe
 *
 * @param Fail SE
 * @desc 실패(빗나감) 시 재생할 효과음
 * @default Buzzer1
 *
 * @param Hits Required
 * @desc 나무를 완전히 벨 때까지 필요한 성공 횟수 (기본 3)
 * @default 3
 *
 * @param Swing Image Name
 * @desc 성공 시 플레이어가 잠깐 취할 캐릭터 이미지 파일명 (img/characters 기준)
 * @default
 *
 * @param Swing Image Index
 * @desc 위 이미지 파일 안에서 사용할 캐릭터 인덱스 (0~7)
 * @default 0
 *
 * @param Swing Duration
 * @desc 스윙 이미지가 유지되는 프레임 수 (60 = 1초) 후 원래 이미지로 복귀
 * @default 15
 *
 * @param Tree Stage2 Image Name
 * @desc 1타 성공 시 나무에 적용할 이미지 파일명 (기본값, 이벤트 인자로 덮어쓰기 가능)
 * @default
 *
 * @param Tree Stage2 Image Index
 * @default 0
 *
 * @param Tree Stage3 Image Name
 * @desc 2타 성공 시 나무에 적용할 이미지 파일명 (기본값, 이벤트 인자로 덮어쓰기 가능)
 * @default
 *
 * @param Tree Stage3 Image Index
 * @default 0
 *
 * @param Tree Shake Power
 * @default 4
 *
 * @param Tree Shake Speed
 * @default 8
 *
 * @param Tree Shake Duration
 * @desc 나무가 흔들리는 프레임 수
 * @default 20
 *
 * @param Erase On Complete
 * @desc 마지막 타격 후 나무 이벤트를 즉시 소거할지 여부 (자기 스위치 A는 항상 ON 처리됨)
 * @default true
 *
 * @param Fade In Speed
 * @desc QTE 바가 시작할 때 페이드인되는 속도 (1프레임당 opacity 증가량, 255면 즉시 표시)
 * @default 25
 *
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 * 나무 이벤트의 [플러그인 명령]에서 아래와 같이 입력하세요.
 * (0을 써서 "이 이벤트 자신"을 나무로 지정합니다. 음수(-1)는 플레이어로 인식되니 사용 금지)
 *
 *   TreeChopQTE_Start 0
 *
 * 옵션 인자 (전부 생략 가능, 순서 상관없음):
 *
 *   hits:5              성공 필요 횟수를 5로 덮어씀 (기본값은 파라미터의 Hits Required)
 *   switch:10           QTE가 끝나면(나무를 다 베면) 10번 스위치를 ON
 *   variable:3          최종 성공 횟수를 3번 변수에 저장
 *   common:12           나무를 다 벤 직후 12번 공통 이벤트 실행
 *   swing:Actor1,0      플레이어 스윙 이미지를 이번 호출에서만 Actor1(0번)으로 덮어씀
 *   s2:Tree_B,0         2번째 이미지(1타 성공 후)를 이번 호출에서만 덮어씀
 *   s3:Tree_C,0         3번째 이미지(2타 성공 후)를 이번 호출에서만 덮어씀
 *
 * 예시)
 *   TreeChopQTE_Start 0 hits:3 switch:5 common:20
 *
 * 나무 이벤트의 "현재 이미지"가 자동으로 1단계 이미지로 취급됩니다.
 * 즉, 에디터에서 나무 이벤트에 미리 넣어둔 그래픽이 이미지1이고,
 * 1타 성공 -> Tree Stage2 이미지, 2타 성공 -> Tree Stage3 이미지,
 * 3타(=Hits Required번째) 성공 -> 자기 스위치 A ON + (설정에 따라) 이벤트 소거.
 *
 * 플레이어도 마찬가지로 QTE 시작 시점의 현재 이미지를 자동으로 기억해두었다가,
 * 매 성공 시 Swing Image로 Swing Duration 프레임만큼 바뀐 뒤 원래 이미지로 되돌아갑니다.
 *
 * 실패(빗나감)해도 QTE가 끝나지 않고 계속 이어집니다. 계속 도전할 수 있습니다.
 *
 * 나무가 흔들리는 효과는 CharacterShake.js를 사용합니다.
 * 반드시 CharacterShake.js보다 아래쪽에 배치하세요.
 *
 * 라이선스: 자유롭게 수정/배포 가능
 * =============================================================================
 */

(function() {

    var parameters = PluginManager.parameters('TreeChopQTE');
    var barWidth       = Number(parameters['Bar Width'] || 400);
    var barHeight       = Number(parameters['Bar Height'] || 24);
    var barX       = Number(parameters['Bar X'] || 0);
    var barY       = Number(parameters['Bar Y'] || 300);
    var markerWidth     = Number(parameters['Marker Width'] || 8);
    var markerSpeed     = Number(parameters['Marker Speed'] || 6);
    var zoneMinWidth    = Number(parameters['Zone Min Width'] || 40);
    var zoneMaxWidth    = Number(parameters['Zone Max Width'] || 70);
    var barColor        = String(parameters['Bar Color'] || '#333333');
    var zoneColor       = String(parameters['Zone Color'] || '#ffcc00');
    var markerColor     = String(parameters['Marker Color'] || '#ff3333');
    var successSE       = String(parameters['Success SE'] || 'Axe');
    var failSE          = String(parameters['Fail SE'] || 'Buzzer1');
    var defaultHits      = Number(parameters['Hits Required'] || 3);
    var swingName        = String(parameters['Swing Image Name'] || '');
    var swingIndex        = Number(parameters['Swing Image Index'] || 0);
    var swingDuration     = Number(parameters['Swing Duration'] || 15);
    var stage2Name        = String(parameters['Tree Stage2 Image Name'] || '');
    var stage2Index        = Number(parameters['Tree Stage2 Image Index'] || 0);
    var stage3Name        = String(parameters['Tree Stage3 Image Name'] || '');
    var stage3Index        = Number(parameters['Tree Stage3 Image Index'] || 0);
    var treeShakePower    = Number(parameters['Tree Shake Power'] || 4);
    var treeShakeSpeed    = Number(parameters['Tree Shake Speed'] || 8);
    var treeShakeDuration = Number(parameters['Tree Shake Duration'] || 20);
    var eraseOnComplete   = String(parameters['Erase On Complete'] || 'true') === 'true';
    var fadeSpeed         = Number(parameters['Fade In Speed'] || 25);

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'TreeChopQTE_Start') {
            var treeChar = this.treeChopTarget(args[0]);
            if (!treeChar) return;

            var hits = defaultHits;
            var switchId = 0;
            var variableId = 0;
            var completeCommon = 0;
            var overrideSwing = null;
            var overrideS2 = null;
            var overrideS3 = null;

            args.slice(1).forEach(function(arg) {
                if (arg.indexOf('hits:') === 0) {
                    hits = Number(arg.split(':')[1]);
                } else if (arg.indexOf('switch:') === 0) {
                    switchId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('variable:') === 0) {
                    variableId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('common:') === 0) {
                    completeCommon = Number(arg.split(':')[1]);
                } else if (arg.indexOf('swing:') === 0) {
                    overrideSwing = arg.substring(6).split(',');
                } else if (arg.indexOf('s2:') === 0) {
                    overrideS2 = arg.substring(3).split(',');
                } else if (arg.indexOf('s3:') === 0) {
                    overrideS3 = arg.substring(3).split(',');
                }
            });

            var opts = {
                hits: hits,
                switchId: switchId,
                variableId: variableId,
                completeCommon: completeCommon,
                swingName: overrideSwing ? overrideSwing[0] : swingName,
                swingIndex: overrideSwing ? Number(overrideSwing[1] || 0) : swingIndex,
                stage2Name: overrideS2 ? overrideS2[0] : stage2Name,
                stage2Index: overrideS2 ? Number(overrideS2[1] || 0) : stage2Index,
                stage3Name: overrideS3 ? overrideS3[0] : stage3Name,
                stage3Index: overrideS3 ? Number(overrideS3[1] || 0) : stage3Index
            };

            this.setWaitMode('treeChopQTE');
            SceneManager._scene.startTreeChopQTE(this, treeChar, opts);
        }
    };

    Game_Interpreter.prototype.treeChopTarget = function(idText) {
        if (idText === undefined) return null;
        var id = Number(idText);
        if (id > 0) {
            return $gameMap.event(id);
        } else {
            // MV 코어 규칙: character(0) = 이 이벤트 자신 (character(음수)는 플레이어를 반환하므로 사용 금지)
            return this.character(0);
        }
    };

    var _TreeChopQTE_Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'treeChopQTE') {
            if (SceneManager._scene._treeChopSprite) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _TreeChopQTE_Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_TreeChopQTE
    //-------------------------------------------------------------------------
    function Sprite_TreeChopQTE() {
        this.initialize.apply(this, arguments);
    }

    Sprite_TreeChopQTE.prototype = Object.create(Sprite.prototype);
    Sprite_TreeChopQTE.prototype.constructor = Sprite_TreeChopQTE;

    Sprite_TreeChopQTE.prototype.initialize = function(interpreter, treeChar, opts) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._treeChar = treeChar;
        this._opts = opts;
        this._hitsDone = 0;
        this._finished = false;

        // 원래 이미지 기억
        this._playerOrigName = $gamePlayer.characterName();
        this._playerOrigIndex = $gamePlayer.characterIndex();
        this._swingTimer = 0;

        var w = barWidth;
        var h = barHeight;
        this.bitmap = new Bitmap(w, h);
        this.x = barX > 0 ? barX : (Graphics.boxWidth - w) / 2;
        this.y = barY;
        this.opacity = 0;

        this._markerX = 0;
        this._markerDir = 1;
        this.resetZone();
        this.redraw();
    };

    Sprite_TreeChopQTE.prototype.resetZone = function() {
        var w = barWidth;
        var zoneWidth = zoneMinWidth + Math.floor(Math.random() * (zoneMaxWidth - zoneMinWidth + 1));
        zoneWidth = Math.min(zoneWidth, w - markerWidth);
        this._zoneWidth = zoneWidth;
        this._zoneStart = Math.floor(Math.random() * (w - zoneWidth));
    };

    Sprite_TreeChopQTE.prototype.redraw = function() {
        var w = barWidth;
        var h = barHeight;
        this.bitmap.clear();
        this.bitmap.fillRect(0, 0, w, h, barColor);
        this.bitmap.fillRect(this._zoneStart, 0, this._zoneWidth, h, zoneColor);
        this.bitmap.fillRect(Math.round(this._markerX), 0, markerWidth, h, markerColor);
    };

    Sprite_TreeChopQTE.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._finished) return;

        if (this.opacity < 255) {
            this.opacity += fadeSpeed;
            if (this.opacity > 255) this.opacity = 255;
        }

        this.updateSwingTimer();

        this._markerX += markerSpeed * this._markerDir;
        var maxX = barWidth - markerWidth;
        if (this._markerX >= maxX) {
            this._markerX = 0;
        }
        this.redraw();

        if (Input.isTriggered('ok')) {
            this.judge();
        }
    };

    Sprite_TreeChopQTE.prototype.updateSwingTimer = function() {
        if (this._swingTimer > 0) {
            this._swingTimer--;
            if (this._swingTimer === 0) {
                $gamePlayer.setImage(this._playerOrigName, this._playerOrigIndex);
            }
        }
    };

    Sprite_TreeChopQTE.prototype.judge = function() {
        var markerCenter = this._markerX + markerWidth / 2;
        var success = (markerCenter >= this._zoneStart &&
                        markerCenter <= this._zoneStart + this._zoneWidth);

        if (success) {
            this.onHitSuccess();
        } else {
            AudioManager.playSe({ name: failSE, volume: 90, pitch: 100, pan: 0 });
        }
    };

    Sprite_TreeChopQTE.prototype.onHitSuccess = function() {
        var opts = this._opts;
        AudioManager.playSe({ name: successSE, volume: 90, pitch: 100, pan: 0 });

        // 플레이어 스윙 이미지
        if (opts.swingName) {
            $gamePlayer.setImage(opts.swingName, opts.swingIndex);
            this._swingTimer = swingDuration;
        }

        this._hitsDone++;

        // 나무 흔들림 (CharacterShake.js 필요)
        if (this._treeChar.startShake) {
            this._treeChar.startShake(treeShakePower, treeShakeSpeed, treeShakeDuration);
        }

        if (this._hitsDone === 1 && opts.stage2Name) {
            this._treeChar.setImage(opts.stage2Name, opts.stage2Index);
        } else if (this._hitsDone === 2 && opts.stage3Name) {
            this._treeChar.setImage(opts.stage3Name, opts.stage3Index);
        }

        if (this._hitsDone >= opts.hits) {
            this.completeChop();
        } else {
            this.resetZone();
        }
    };

    Sprite_TreeChopQTE.prototype.completeChop = function() {
        var opts = this._opts;

        if (this._treeChar instanceof Game_Event) {
            this._treeChar.setSelfSwitchValue('A', true);
            if (eraseOnComplete) {
                this._treeChar.erase();
            }
        }

        if (opts.switchId > 0) {
            $gameSwitches.setValue(opts.switchId, true);
        }
        if (opts.variableId > 0) {
            $gameVariables.setValue(opts.variableId, this._hitsDone);
        }

        this.finish(opts.completeCommon);
    };

    Sprite_TreeChopQTE.prototype.finish = function(commonEventId) {
        this._finished = true;
        // 스윙 도중 종료됐다면 즉시 원래 이미지로 복귀
        if (this._swingTimer > 0) {
            $gamePlayer.setImage(this._playerOrigName, this._playerOrigIndex);
        }
        SceneManager._scene.endTreeChopQTE();

        if (commonEventId > 0 && $dataCommonEvents[commonEventId]) {
            this._interpreter.setupChild($dataCommonEvents[commonEventId].list, 0);
        }
    };

    // Game_Event에는 setSelfSwitchValue가 기본으로 없으므로 헬퍼 추가
    Game_Event.prototype.setSelfSwitchValue = function(letter, value) {
        var key = [$gameMap.mapId(), this.eventId(), letter];
        $gameSelfSwitches.setValue(key, value);
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startTreeChopQTE = function(interpreter, treeChar, opts) {
        this._treeChopSprite = new Sprite_TreeChopQTE(interpreter, treeChar, opts);
        this.addChild(this._treeChopSprite);
    };

    Scene_Map.prototype.endTreeChopQTE = function() {
        if (this._treeChopSprite) {
            this.removeChild(this._treeChopSprite);
            this._treeChopSprite = null;
        }
    };

})();
