//=============================================================================
// HiddenBugFindGame.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 그림 위에 숨겨진 작은 벌레들을 클릭/터치해서 모두 찾는
 * 숨은 그림찾기 스타일 미니게임. 잡은/남은 마리 수 표시, 페이드 인/아웃,
 * 전용 BGM 설정을 지원합니다.
 * @author ㄹㅅㅁ
 *
 * @param Bug Count
 * @desc 기본 벌레 마리 수 (이벤트 인자로 덮어쓰기 가능)
 * @default 5
 *
 * @param Bug Image Name
 * @desc 벌레 이미지 파일명 (img/pictures 기준, 확장자 제외)
 * @default Bug
 *
 * @param Bug Width
 * @desc 벌레가 화면에 표시될 너비(픽셀). 클릭 판정 크기로도 사용됨
 * @default 14
 *
 * @param Bug Height
 * @desc 벌레가 화면에 표시될 높이(픽셀). 클릭 판정 크기로도 사용됨
 * @default 14
 *
 * @param Edge Margin
 * @desc 화면 가장자리에서 벌레를 배치하지 않을 여백(픽셀)
 * @default 16
 *
 * @param Min Bug Distance
 * @desc 벌레들끼리 서로 겹치지 않도록 유지할 최소 거리(픽셀)
 * @default 30
 *
 * @param Counter X
 * @desc 카운터 텍스트 상자의 X 좌표(픽셀)
 * @default 16
 *
 * @param Counter Y
 * @desc 카운터 텍스트 상자의 Y 좌표(픽셀)
 * @default 16
 *
 * @param Counter Width
 * @desc 카운터 텍스트 상자의 너비(픽셀). 글자가 잘리면 이 값을 늘리세요
 * @default 260
 *
 * @param Counter Font Size
 * @desc 카운터 텍스트 폰트 크기
 * @default 22
 *
 * @param Counter Text Color
 * @desc 카운터 텍스트 색상 (CSS 색상값)
 * @default #ffffff
 *
 * @param Remaining Text
 * @desc "남은 벌레" 줄의 표시 문구
 * @default 남은 벌레
 *
 * @param Caught Text
 * @desc "잡은 벌레" 줄의 표시 문구
 * @default 잡은 벌레
 *
 * @param Found SE
 * @desc 벌레를 찾을 때마다 재생할 효과음
 * @default Bell3
 *
 * @param Complete SE
 * @desc 모든 벌레를 다 찾았을 때 재생할 효과음
 * @default Item3
 *
 * @param Default BGM Name
 * @desc 미니게임 중 재생할 기본 BGM (비워두면 BGM을 바꾸지 않음, 이벤트 인자로 덮어쓰기 가능)
 * @default
 *
 * @param Default BGM Volume
 * @default 90
 *
 * @param Default BGM Pitch
 * @default 100
 *
 * @param Default BGM Pan
 * @default 0
 *
 * @param Fade Speed
 * @desc 시작/종료 시 페이드 속도 (1프레임당 opacity 증감량, 255면 즉시)
 * @default 12
 *
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 * 이벤트의 [플러그인 명령]에서 아래와 같이 입력하세요.
 *
 *   HiddenBugFindGame_Start bg:Flower1
 *
 * 옵션 인자 (전부 생략 가능, 순서 상관없음):
 *
 *   bg:Flower1          배경(꽃 그림) 이미지 파일명 (img/pictures 기준, 필수)
 *   count:8             벌레 마리 수를 8마리로 덮어씀 (기본값은 파라미터의 Bug Count)
 *   bug:Bug2            벌레 이미지 파일명을 이번 호출에서만 덮어씀
 *   switch:10           모든 벌레를 찾으면 10번 스위치를 ON
 *   variable:3          최종적으로 찾은 마리 수를 3번 변수에 저장
 *   common:12           완료 직후 12번 공통 이벤트 실행
 *   bgm:Minigame1,90,100   미니게임 전용 BGM (이름,음량,피치 순서. 음량/피치는 생략 가능)
 *
 * 예시)
 *   HiddenBugFindGame_Start bg:Flower1 count:6 switch:20 variable:5 bgm:BugHunt,80
 *
 * 배경 그림은 원본 크기와 상관없이 화면 전체를 꽉 채우도록 자동으로
 * 늘려서 표시됩니다. 화면이 페이드 인 되며 시작하고, 화면 좌상단에
 * "남은 벌레 : n" / "잡은 벌레 : m" 이 표시됩니다.
 * 마우스로 벌레를 클릭(또는 터치)하면 그 위치에 벌레가 있는지 판정하며,
 * 벌레를 전부 찾으면 자동으로 페이드 아웃 후 종료됩니다.
 *
 * bgm 인자(또는 파라미터의 Default BGM Name)를 지정하면 미니게임 시작 시
 * 해당 BGM으로 바뀌고, 미니게임이 끝나면 원래 재생 중이던 BGM으로
 * 자동 복귀합니다 (재생 위치까지 복원).
 *
 * 라이선스: 자유롭게 수정/배포 가능
 * =============================================================================
 */

(function() {

    var parameters      = PluginManager.parameters('HiddenBugFindGame');
    var defaultBugCount  = Number(parameters['Bug Count'] || 5);
    var defaultBugName   = String(parameters['Bug Image Name'] || 'Bug');
    var bugWidth         = Number(parameters['Bug Width'] || 24);
    var bugHeight        = Number(parameters['Bug Height'] || 24);
    var edgeMargin        = Number(parameters['Edge Margin'] || 16);
    var minBugDistance    = Number(parameters['Min Bug Distance'] || 30);
    var counterX          = Number(parameters['Counter X'] || 16);
    var counterY          = Number(parameters['Counter Y'] || 16);
    var counterWidth      = Number(parameters['Counter Width'] || 260);
    var counterFontSize   = Number(parameters['Counter Font Size'] || 22);
    var counterTextColor  = String(parameters['Counter Text Color'] || '#ffffff');
    var remainingText     = String(parameters['Remaining Text'] || '남은 벌레');
    var caughtText        = String(parameters['Caught Text'] || '잡은 벌레');
    var foundSE           = String(parameters['Found SE'] || 'Bell3');
    var completeSE        = String(parameters['Complete SE'] || 'Item3');
    var defaultBgmName    = String(parameters['Default BGM Name'] || '');
    var defaultBgmVolume  = Number(parameters['Default BGM Volume'] || 90);
    var defaultBgmPitch   = Number(parameters['Default BGM Pitch'] || 100);
    var defaultBgmPan     = Number(parameters['Default BGM Pan'] || 0);
    var fadeSpeed         = Number(parameters['Fade Speed'] || 12);

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'HiddenBugFindGame_Start') {

            var bgName = '';
            var count = defaultBugCount;
            var bugName = defaultBugName;
            var switchId = 0;
            var variableId = 0;
            var completeCommon = 0;
            var bgmName = defaultBgmName;
            var bgmVolume = defaultBgmVolume;
            var bgmPitch = defaultBgmPitch;
            var bgmPan = defaultBgmPan;

            args.forEach(function(arg) {
                if (arg.indexOf('bg:') === 0) {
                    bgName = arg.substring(3);
                } else if (arg.indexOf('count:') === 0) {
                    count = Number(arg.split(':')[1]);
                } else if (arg.indexOf('bug:') === 0) {
                    bugName = arg.substring(4);
                } else if (arg.indexOf('switch:') === 0) {
                    switchId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('variable:') === 0) {
                    variableId = Number(arg.split(':')[1]);
                } else if (arg.indexOf('common:') === 0) {
                    completeCommon = Number(arg.split(':')[1]);
                } else if (arg.indexOf('bgm:') === 0) {
                    var bgmArgs = arg.substring(4).split(',');
                    bgmName = bgmArgs[0];
                    if (bgmArgs[1] !== undefined) bgmVolume = Number(bgmArgs[1]);
                    if (bgmArgs[2] !== undefined) bgmPitch = Number(bgmArgs[2]);
                }
            });

            if (!bgName) return;

            var opts = {
                bgName: bgName,
                count: count,
                bugName: bugName,
                switchId: switchId,
                variableId: variableId,
                completeCommon: completeCommon,
                bgmName: bgmName,
                bgmVolume: bgmVolume,
                bgmPitch: bgmPitch,
                bgmPan: bgmPan
            };

            this.setWaitMode('bugFindGame');
            SceneManager._scene.startHiddenBugFindGame(this, opts);
        }
    };

    var _HiddenBugFindGame_Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'bugFindGame') {
            if (SceneManager._scene._bugFindSprite) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _HiddenBugFindGame_Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Sprite_Bug (개별 벌레)
    //-------------------------------------------------------------------------
    function Sprite_Bug() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Bug.prototype = Object.create(Sprite.prototype);
    Sprite_Bug.prototype.constructor = Sprite_Bug;

    Sprite_Bug.prototype.initialize = function(bugName, x, y) {
        Sprite.prototype.initialize.call(this);
        this.bitmap = ImageManager.loadPicture(bugName);
        this.x = x;
        this.y = y;
        this.found = false;
        this.bitmap.addLoadListener(this.onBitmapLoaded.bind(this));
    };

    // 원본 벌레 이미지 크기와 상관없이 Bug Width/Height 파라미터 크기로 축소 표시
    Sprite_Bug.prototype.onBitmapLoaded = function() {
        if (this.bitmap.width > 0) {
            this.scale.x = bugWidth / this.bitmap.width;
        }
        if (this.bitmap.height > 0) {
            this.scale.y = bugHeight / this.bitmap.height;
        }
    };

    Sprite_Bug.prototype.containsPoint = function(localX, localY) {
        if (this.found) return false;
        return localX >= this.x && localX < this.x + bugWidth &&
               localY >= this.y && localY < this.y + bugHeight;
    };

    Sprite_Bug.prototype.catchBug = function() {
        this.found = true;
        this.opacity = 0;
    };

    //-------------------------------------------------------------------------
    // Sprite_HiddenBugFindGame (배경 + 벌레들 + 카운터를 담는 컨테이너)
    //-------------------------------------------------------------------------
    function Sprite_HiddenBugFindGame() {
        this.initialize.apply(this, arguments);
    }

    Sprite_HiddenBugFindGame.prototype = Object.create(Sprite.prototype);
    Sprite_HiddenBugFindGame.prototype.constructor = Sprite_HiddenBugFindGame;

    Sprite_HiddenBugFindGame.prototype.initialize = function(interpreter, opts) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._opts = opts;
        this._finishing = false;
        this._finished = false;
        this._caughtCount = 0;

        this.x = 0;
        this.y = 0;
        this.opacity = 0;

        // 배경 그림: 원본 크기와 상관없이 화면 전체를 꽉 채우도록 스케일
        this._bgSprite = new Sprite();
        this._bgSprite.bitmap = ImageManager.loadPicture(opts.bgName);
        this._bgSprite.x = 0;
        this._bgSprite.y = 0;
        this._bgSprite.bitmap.addLoadListener(this.onBackgroundLoaded.bind(this));
        this.addChild(this._bgSprite);

        this._savedBgm = null;
        if (opts.bgmName) {
            this._savedBgm = AudioManager.saveBgm();
            AudioManager.playBgm({
                name: opts.bgmName,
                volume: opts.bgmVolume,
                pitch: opts.bgmPitch,
                pan: opts.bgmPan
            });
        }

        this._bugs = [];
        this._counterSprite = new Sprite(new Bitmap(counterWidth, 90));
        this._counterSprite.x = counterX;
        this._counterSprite.y = counterY;
        this.addChild(this._counterSprite);

        // 배경 그림 로딩 여부와 상관없이 화면 크기 기준으로 바로 벌레를 배치
        this.createBugs();
        this.refreshCounter();
    };

    Sprite_HiddenBugFindGame.prototype.onBackgroundLoaded = function() {
        var bmp = this._bgSprite.bitmap;
        if (bmp.width > 0 && bmp.height > 0) {
            this._bgSprite.scale.x = Graphics.boxWidth / bmp.width;
            this._bgSprite.scale.y = Graphics.boxHeight / bmp.height;
        }
    };

    Sprite_HiddenBugFindGame.prototype.createBugs = function() {
        var opts = this._opts;
        var minX = edgeMargin;
        var maxX = Graphics.boxWidth - edgeMargin - bugWidth;
        var minY = edgeMargin;
        var maxY = Graphics.boxHeight - edgeMargin - bugHeight;

        var placed = [];
        for (var i = 0; i < opts.count; i++) {
            var pos = this.pickBugPosition(minX, maxX, minY, maxY, placed);
            var bug = new Sprite_Bug(opts.bugName, pos.x, pos.y);
            placed.push(pos);
            this._bugs.push(bug);
            this.addChildAt(bug, this.children.indexOf(this._counterSprite));
        }
    };

    Sprite_HiddenBugFindGame.prototype.pickBugPosition = function(minX, maxX, minY, maxY, placed) {
        var tryCount = 0;
        while (tryCount < 30) {
            var x = minX + Math.random() * Math.max(1, maxX - minX);
            var y = minY + Math.random() * Math.max(1, maxY - minY);
            var ok = true;
            for (var i = 0; i < placed.length; i++) {
                var dx = placed[i].x - x;
                var dy = placed[i].y - y;
                if (Math.sqrt(dx * dx + dy * dy) < minBugDistance) {
                    ok = false;
                    break;
                }
            }
            if (ok) return { x: x, y: y };
            tryCount++;
        }
        // 자리를 못 찾으면 마지막 후보라도 반환
        return { x: x, y: y };
    };

    Sprite_HiddenBugFindGame.prototype.refreshCounter = function() {
        var opts = this._opts;
        var remaining = opts.count - this._caughtCount;
        var bmp = this._counterSprite.bitmap;
        var lineWidth = counterWidth;
        bmp.clear();
        bmp.fontSize = counterFontSize;
        bmp.textColor = counterTextColor;
        bmp.drawText(remainingText + ' : ' + remaining, 0, 0, lineWidth, 40, 'left');
        bmp.drawText(caughtText + ' : ' + this._caughtCount, 0, 44, lineWidth, 40, 'left');
    };

    Sprite_HiddenBugFindGame.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._finished) return;

        if (!this._finishing) {
            if (this.opacity < 255) {
                this.opacity += fadeSpeed;
                if (this.opacity > 255) this.opacity = 255;
            }
            this.updateInput();
        } else {
            this.opacity -= fadeSpeed;
            if (this.opacity <= 0) {
                this.opacity = 0;
                this.onFadeOutComplete();
            }
        }
    };

    Sprite_HiddenBugFindGame.prototype.updateInput = function() {
        if (this._bugs.length === 0) return;
        if (!TouchInput.isTriggered()) return;

        var localX = TouchInput.x - this.x;
        var localY = TouchInput.y - this.y;

        for (var i = 0; i < this._bugs.length; i++) {
            var bug = this._bugs[i];
            if (bug.containsPoint(localX, localY)) {
                bug.catchBug();
                this._caughtCount++;
                AudioManager.playSe({ name: foundSE, volume: 90, pitch: 100, pan: 0 });
                this.refreshCounter();
                if (this._caughtCount >= this._opts.count) {
                    this.completeGame();
                }
                break;
            }
        }
    };

    Sprite_HiddenBugFindGame.prototype.completeGame = function() {
        AudioManager.playSe({ name: completeSE, volume: 90, pitch: 100, pan: 0 });

        var opts = this._opts;
        if (opts.switchId > 0) {
            $gameSwitches.setValue(opts.switchId, true);
        }
        if (opts.variableId > 0) {
            $gameVariables.setValue(opts.variableId, this._caughtCount);
        }

        this._finishing = true;
    };

    Sprite_HiddenBugFindGame.prototype.onFadeOutComplete = function() {
        this._finished = true;

        if (this._savedBgm) {
            AudioManager.replayBgm(this._savedBgm);
        }

        SceneManager._scene.endHiddenBugFindGame();

        var completeCommon = this._opts.completeCommon;
        if (completeCommon > 0 && $dataCommonEvents[completeCommon]) {
            this._interpreter.setupChild($dataCommonEvents[completeCommon].list, 0);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startHiddenBugFindGame = function(interpreter, opts) {
        this._bugFindSprite = new Sprite_HiddenBugFindGame(interpreter, opts);
        this.addChild(this._bugFindSprite);
    };

    Scene_Map.prototype.endHiddenBugFindGame = function() {
        if (this._bugFindSprite) {
            this.removeChild(this._bugFindSprite);
            this._bugFindSprite = null;
        }
    };

})();
