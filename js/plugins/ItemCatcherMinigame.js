//=============================================================================
// ItemCatcherMinigame.js
//=============================================================================

/*:
 * @plugindesc 떨어지는 아이템들을 캐치하는 미니게임
 * @author Claude
 *
 * @param Game Duration
 * @desc 게임 진행 시간 (프레임, 60 = 1초)
 * @default 600
 *
 * @param Catcher Speed
 * @desc 캐처 움직임 속도
 * @default 5
 *
 * @param Item Speed Min
 * @desc 아이템이 떨어지는 최소 속도
 * @default 2
 *
 * @param Item Speed Max
 * @desc 아이템이 떨어지는 최대 속도
 * @default 4
 *
 * @param Spawn Interval
 * @desc 새 아이템이 생성되는 간격 (프레임)
 * @default 30
 *
 * @param Default BGM Name
 * @desc 게임 시작 시 재생할 기본 BGM 파일명 (audio/bgm/ 안의 파일, 확장자 제외). 비워두면 재생 안 함
 * @default
 *
 * @param Default BGM Volume
 * @desc 기본 BGM 음량 (0~100)
 * @default 90
 *
 * @param Default BGM Pitch
 * @desc 기본 BGM 피치 (50~150)
 * @default 100
 *
 * @param BGM Fadeout Seconds
 * @desc 게임 종료 시 BGM이 서서히 꺼지는 시간(초). 그 후 원래 맵 음악으로 자동 복귀
 * @default 1.5
 *
 * @help
 * =============================================================================
 * 사용법
 * =============================================================================
 * 
 * 이벤트의 [플러그인 명령]에서:
 *
 *   ItemCatcher_Start
 *
 * 또는 옵션을 지정 (콜론으로 구분):
 *
 *   ItemCatcher_Start targetScore:100 healthMax:4 badhp:1 successEvent:10
 *
 * 옵션 설명:
 *   switch:5           → 성공/실패를 5번 스위치에 저장 (성공 ON, 실패 OFF)
 *   variable:3         → 점수를 3번 변수에 저장
 *   variable2:4        → 캐치한 개수를 4번 변수에 저장
 *   goodScore:1        → 좋은 아이템당 +점수 (기본값: 1)
 *   badScore:-1        → 나쁜 아이템당 -점수 (기본값: -1)
 *   badhp:1            → 나쁜 아이템당 깎일 체력 (기본값: 1)
 *   healthMax:4        → 최대 체력/하트 개수 (기본값: 4)
 *   targetScore:100    → 목표 점수 (필수! 이 점수에 도달하면 게임 성공)
 *   spawninterval:20   → 아이템 생성 간격 (프레임, 기본값: 30)
 *   successEvent:10    → 성공 시 실행할 공통 이벤트 ID
 *   failEvent:11       → 실패 시 실행할 공통 이벤트 ID
 *   introtext:텍스트   → 게임 시작 전 표시할 텍스트 (기본값: 떨어지는 아이템을 캐치하세요!)
 *   backgroundimage:이름 → 배경 이미지 (img/pictures/[이름].png, 생략하면 하늘색 배경)
 *   bgm:파일명          → 게임 시작 시 재생할 BGM (audio/bgm/, 생략하면 파라미터의 기본값 사용)
 *   bgmvolume:90        → BGM 음량 (기본값: 파라미터 기본값, 보통 90)
 *   bgmpitch:100        → BGM 피치 (기본값: 파라미터 기본값, 보통 100)
 *   bgmfadeout:1.5      → 게임 종료 시 BGM 페이드아웃 시간(초), 끝나면 원래 맵 음악으로 복귀
 *
 * 성공 판정:
 *   targetScore에 도달하면 게임 성공
 *   체력이 0 이하로 떨어지면 게임 실패
 *
 * 게임 진행:
 *   1. 하늘색 배경에서 게임 시작
 *   2. introtext 표시 (1초)
 *   3. 3 2 1 카운트다운 (각 1초)
 *   4. START! 팝업
 *   5. 게임 진행 (좌우 이동으로만 아이템 캐치)
 *   6. 목표 점수 도달 시 성공 또는 체력 0 시 실패
 *   7. 성공/실패 이벤트 실행
 *
 * 예시:
 *   ItemCatcher_Start targetScore:100 healthMax:4 badhp:1 successEvent:10 failEvent:11
 *   ItemCatcher_Start targetScore:100 spawninterval:15 successEvent:10
 *   ItemCatcher_Start targetScore:50 introtext:50점을 모으세요! healthMax:3 badhp:1 successEvent:10 failEvent:11
 *
 * 아이템 설정
 * =============================================================================
 *
 * 아이템 설정 명령:
 *
 *   ItemCatcher_SetItems apple:good banana:good rock:bad bomb:bad
 *
 * 형식: ItemCatcher_SetItems [아이템명]:good/bad [아이템명]:good/bad ...
 * 
 * 이미지 파일: img/pictures/items/[아이템명].png
 * 예: img/pictures/items/apple.png, img/pictures/items/rock.png
 *
 * =============================================================================
 */

(function() {
    var parameters = PluginManager.parameters('ItemCatcherMinigame');
    var GAME_DURATION = parseInt(parameters['Game Duration']) || 600;
    var CATCHER_SPEED = parseInt(parameters['Catcher Speed']) || 5;
    var ITEM_SPEED_MIN = parseFloat(parameters['Item Speed Min']) || 2;
    var ITEM_SPEED_MAX = parseFloat(parameters['Item Speed Max']) || 4;
    var SPAWN_INTERVAL = parseInt(parameters['Spawn Interval']) || 30;
    var DEFAULT_BGM_NAME = parameters['Default BGM Name'] || '';
    var DEFAULT_BGM_VOLUME = parseInt(parameters['Default BGM Volume']);
    if (isNaN(DEFAULT_BGM_VOLUME)) DEFAULT_BGM_VOLUME = 90;
    var DEFAULT_BGM_PITCH = parseInt(parameters['Default BGM Pitch']);
    if (isNaN(DEFAULT_BGM_PITCH)) DEFAULT_BGM_PITCH = 100;
    var BGM_FADEOUT_SECONDS = parseFloat(parameters['BGM Fadeout Seconds']);
    if (isNaN(BGM_FADEOUT_SECONDS)) BGM_FADEOUT_SECONDS = 1.5;

    // 미니게임 종료 후 실행할 공통 이벤트를 위한 독립 인터프리터
    // (호출한 이벤트/공통이벤트가 계속 실행중이거나 병렬 프로세스여도
    //  영향받지 않고 확실하게 실행되도록 완전히 분리해서 처리함)
    var $itemCatcherPendingInterpreter = null;

    // 전역 아이템 DB
    var $itemCatcherDB = {
        'apple': { type: 'good' },
        'banana': { type: 'good' },
        'rock': { type: 'bad' },
        'bomb': { type: 'bad' }
    };

    //=========================================================================
    // Game_ItemCatcher
    //=========================================================================

    function Game_ItemCatcher() {
        this.initialize.apply(this, arguments);
    }

    Game_ItemCatcher.prototype.initialize = function() {
        this.score = 0;
        this.itemCount = 0;
        this.switchId = 1;
        this.variableId = 1;
        this.variable2Id = 2;
        this.goodScore = 1;
        this.badScore = -1;
        this.badHP = 1; // 나쁜 아이템당 깎일 체력
        this.successEventId = 0;
        this.failEventId = 0;
        this.introText = '떨어지는 아이템을 캐치하세요!';
        this.targetScore = 0;
        this.backgroundImage = ''; // 커스텀 배경 이미지 (img/pictures/[이름].png), 없으면 기본 하늘색
        this.bgmName = DEFAULT_BGM_NAME;
        this.bgmVolume = DEFAULT_BGM_VOLUME;
        this.bgmPitch = DEFAULT_BGM_PITCH;
        this.bgmFadeoutSeconds = BGM_FADEOUT_SECONDS;
        this.healthMax = 4; // 최대 체력
        this.health = 4; // 현재 체력
        this.spawnInterval = SPAWN_INTERVAL;
        this.heartShakeTime = 0; // 하트 흔들림 타이밍
        this.heartShakeIndex = -1; // 흔들리는 하트의 인덱스
        
        this.items = [];
        this.nextSpawnTime = SPAWN_INTERVAL;
        
        this.gameMapId = 0;
        this.gameX = 0;
        this.gameY = 0;
        this.returnMapId = $gameMap.mapId();
        this.returnX = $gamePlayer.x;
        this.returnY = $gamePlayer.y;
    };

    Game_ItemCatcher.prototype.isFinished = function() {
        // 체력이 0 이하면 끝남 (실패)
        if (this.health <= 0) {
            return true;
        }
        // targetScore에 도달하면 끝남 (성공)
        if (this.targetScore > 0 && this.score >= this.targetScore) {
            return true;
        }
        return false;
    };

    //=========================================================================
    // Scene_ItemCatcher
    //=========================================================================

    function Scene_ItemCatcher() {
        this.initialize.apply(this, arguments);
    }

    Scene_ItemCatcher.prototype = Object.create(Scene_Base.prototype);
    Scene_ItemCatcher.prototype.constructor = Scene_ItemCatcher;

    Scene_ItemCatcher.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._gameData = $itemCatcherGameData || new Game_ItemCatcher();
        this._state = 'intro';
        this._introTimer = 0;
        this._countdownTime = 0;
        this._currentCountdown = -1;
    };

    Scene_ItemCatcher.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        
        // Graphics.width가 boxWidth보다 큰 환경(줌/해상도 플러그인 등)에서도
        // 항상 화면 중앙 안전 영역에 오도록 컨테이너로 감싸서 오프셋을 줌
        this._offsetLayer = new Sprite();
        this._offsetLayer.x = (Graphics.width - Graphics.boxWidth) / 2;
        this._offsetLayer.y = (Graphics.height - Graphics.boxHeight) / 2;
        this.addChild(this._offsetLayer);

        this.createBackground();
        this.createDisplayObjects();
        
        // 파티 멤버들 숨기기
        this.hideFollowers();
        
        this.createUIWindow();
    };

    Scene_ItemCatcher.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(this.fadeSpeed(), false);
        this.playGameBgm();
    };

    Scene_ItemCatcher.prototype.playGameBgm = function() {
        if (this._gameData.bgmName) {
            this._savedBgm = AudioManager.saveBgm(); // 원래 맵 음악 기억해두기
            AudioManager.playBgm({
                name: this._gameData.bgmName,
                volume: this._gameData.bgmVolume,
                pitch: this._gameData.bgmPitch,
                pan: 0
            });
        }
    };

    Scene_ItemCatcher.prototype.createBackground = function() {
        var sprite = new Sprite();
        if (this._gameData.backgroundImage) {
            // 커스텀 배경 이미지 사용 (img/pictures/[이름].png)
            console.log('[ItemCatcher] 배경 이미지 로드:', this._gameData.backgroundImage);
            sprite.bitmap = ImageManager.loadPicture(this._gameData.backgroundImage);
            sprite.bitmap.addLoadListener(function() {
                console.log('[ItemCatcher] 배경 이미지 로드 완료:', sprite.bitmap.width, 'x', sprite.bitmap.height);
            });
        } else {
            // 기본 하늘색 배경
            sprite.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
            sprite.bitmap.fillRect(0, 0, Graphics.boxWidth, Graphics.boxHeight, 'rgb(100, 149, 237)');
        }
        this._offsetLayer.addChild(sprite);
    };

    Scene_ItemCatcher.prototype.createDisplayObjects = function() {
        // 캐처 위치 (직접 관리, 맵 좌표와 무관)
        this._catcherX = Graphics.boxWidth / 2;
        this._catcherY = Graphics.boxHeight - 60;

        // Sprite_Character를 사용하면 캐릭터 크기/빅캐릭터 여부 등을
        // MV(및 커스텀 사이즈 플러그인)가 알아서 정확히 처리해줌
        this._catcher = new Sprite_Character($gamePlayer);
        // 위치는 맵 좌표 기반이 아니라 우리가 직접 제어
        this._catcher.updatePosition = function() {};
        this._offsetLayer.addChild(this._catcher);
        this._catcher.x = this._catcherX;
        this._catcher.y = this._catcherY;
        this._catcher.update(); // 인트로 단계에서도 바로 표시되도록 초기화

        this._itemSprites = [];

        // 팝업 레이어 생성 (아이템 위에)
        this._popupLayer = new Sprite();
        this._popupLayer.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._popupLayer.z = 8;
        this._offsetLayer.addChild(this._popupLayer);
    };

    Scene_ItemCatcher.prototype.hideFollowers = function() {
        // 액터 객체에 임의 속성을 건드리면 다른 플러그인(메뉴/액터 관련)과
        // 충돌할 수 있어서, MV 정식 팔로워 숨기기 API를 사용함 (플레이어는 그대로)
        this._followersWereVisible = $gamePlayer.followers().isVisible();
        $gamePlayer.followers().hide();
    };

    Scene_ItemCatcher.prototype.createUIWindow = function() {
        this._uiBitmap = new Bitmap(Graphics.boxWidth, 100);
        this._uiSprite = new Sprite();
        this._uiSprite.bitmap = this._uiBitmap;
        this._offsetLayer.addChild(this._uiSprite);
    };

    Scene_ItemCatcher.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        if (this._state === 'intro') {
            this.updateIntro();
        } else if (this._state === 'countdown') {
            this.updateCountdown();
        } else if (this._state === 'running') {
            this.updateGame();
        } else if (this._state === 'fadeout') {
            this.updateFadeOutWait();
        }
    };

    Scene_ItemCatcher.prototype.updateIntro = function() {
        if (this._introTimer === 0) {
            this.drawIntroText();
        }
        this._introTimer++;
        if (this._introTimer >= 60) {
            this._state = 'countdown';
            this._popupLayer.bitmap.clear();
            this._introTimer = 0;
        }
    };

    Scene_ItemCatcher.prototype.drawIntroText = function() {
        this._popupLayer.bitmap.clear();
        var ctx = this._popupLayer.bitmap.context;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var maxWidth = Graphics.boxWidth - 80;
        var fontSize = 28; // 폰트 크기를 줄이고, 넘치면 줄바꿈으로 처리
        ctx.font = 'bold ' + fontSize + 'px GameFont';

        var lines = this.wrapText(ctx, this._gameData.introText, maxWidth);
        var lineHeight = fontSize + 8;
        var totalHeight = lines.length * lineHeight;
        var startY = Graphics.boxHeight / 2 - totalHeight / 2 + lineHeight / 2;

        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], Graphics.boxWidth / 2, startY + i * lineHeight);
        }
        this._popupLayer.bitmap._setDirty();
    };

    // 텍스트를 maxWidth에 맞춰 여러 줄로 나눠줌 (한글은 공백이 없을 수 있어 글자 단위로 처리)
    Scene_ItemCatcher.prototype.wrapText = function(ctx, text, maxWidth) {
        var lines = [];
        var currentLine = '';
        for (var i = 0; i < text.length; i++) {
            var testLine = currentLine + text[i];
            if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = text[i];
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        return lines;
    };

    Scene_ItemCatcher.prototype.updateCountdown = function() {
        this._countdownTime++;
        if (this._countdownTime % 60 === 0) {
            this._currentCountdown++;
            if (this._currentCountdown >= 4) {
                this._state = 'running';
                this._popupLayer.bitmap.clear();
                this._gameData.timeRemaining = GAME_DURATION;
            } else {
                this.drawCountdown();
                if (this._currentCountdown < 3) {
                    SoundManager.playCursor();
                }
            }
        }
    };

    Scene_ItemCatcher.prototype.drawCountdown = function() {
        this._popupLayer.bitmap.clear();
        var texts = ['3', '2', '1', 'START!'];
        var size = this._currentCountdown === 3 ? 120 : 96;
        
        var ctx = this._popupLayer.bitmap.context;
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold ' + size + 'px GameFont';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texts[this._currentCountdown], Graphics.boxWidth / 2, Graphics.boxHeight / 2);
        this._popupLayer.bitmap._setDirty();
    };

    Scene_ItemCatcher.prototype.updateGame = function() {
        this.updateCatcher();
        this.updateItems();
        this.updateUI();

        if (this._gameData.isFinished()) {
            this.finishGame();
        }
    };

    Scene_ItemCatcher.prototype.updateCatcher = function() {
        if (Input.isPressed('left')) {
            this._catcherX -= CATCHER_SPEED;
        }
        if (Input.isPressed('right')) {
            this._catcherX += CATCHER_SPEED;
        }
        // 화면 밖으로 나가지 않도록 제한
        var halfWidth = 24;
        if (this._catcherX < halfWidth) this._catcherX = halfWidth;
        if (this._catcherX > Graphics.boxWidth - halfWidth) this._catcherX = Graphics.boxWidth - halfWidth;

        this._catcher.x = this._catcherX;
        this._catcher.y = this._catcherY;
        this._catcher.update();
    };

    Scene_ItemCatcher.prototype.updateItems = function() {
        this._gameData.nextSpawnTime--;
        if (this._gameData.nextSpawnTime <= 0) {
            this.spawnItem();
            this._gameData.nextSpawnTime = this._gameData.spawnInterval;
        }

        for (var i = this._gameData.items.length - 1; i >= 0; i--) {
            var item = this._gameData.items[i];
            item.y += item.speed;
            item.sprite.x = item.x;
            item.sprite.y = item.y;

            if (item.y > Graphics.boxHeight) {
                this._offsetLayer.removeChild(item.sprite);
                this._gameData.items.splice(i, 1);
            } else if (this.checkCollision(item)) {
                this.onItemCaught(item);
                this._offsetLayer.removeChild(item.sprite);
                this._gameData.items.splice(i, 1);
            }
        }
    };

    Scene_ItemCatcher.prototype.spawnItem = function() {
        var types = Object.keys($itemCatcherDB);
        var type = types[Math.floor(Math.random() * types.length)];
        
        var item = {
            type: type,
            x: Math.random() * (Graphics.boxWidth - 40) + 20,
            y: -40,
            speed: ITEM_SPEED_MIN + Math.random() * (ITEM_SPEED_MAX - ITEM_SPEED_MIN),
            sprite: new Sprite()
        };

        // 이미지 로드 시도
        try {
            var bitmap = ImageManager.loadPicture('items/' + type);
            if (bitmap) {
                item.sprite.bitmap = bitmap;
            } else {
                throw new Error('Failed to load image');
            }
        } catch (e) {
            // 이미지 로드 실패 시 색상 박스로 표시
            item.sprite.bitmap = new Bitmap(40, 40);
            var color = $itemCatcherDB[type].type === 'good' ? 'rgb(0, 200, 0)' : 'rgb(200, 0, 0)';
            item.sprite.bitmap.fillRect(0, 0, 40, 40, color);
        }

        item.sprite.x = item.x;
        item.sprite.y = item.y;
        item.sprite.z = 7;

        this._gameData.items.push(item);
        this._itemSprites.push(item.sprite);
        
        this._offsetLayer.addChild(item.sprite);
    };

    Scene_ItemCatcher.prototype.checkCollision = function(item) {
        var ix = item.x;
        var iy = item.y;

        // Sprite_Character는 anchor가 (0.5, 1) - 중앙 하단 기준
        var halfWidth = 24;
        var height = 48;
        var cLeft = this._catcherX - halfWidth;
        var cRight = this._catcherX + halfWidth;
        var cTop = this._catcherY - height;
        var cBottom = this._catcherY;

        return !(ix + 40 < cLeft || ix > cRight || iy + 40 < cTop || iy > cBottom);
    };

    Scene_ItemCatcher.prototype.onItemCaught = function(item) {
        var itemInfo = $itemCatcherDB[item.type];

        if (itemInfo.type === 'good') {
            SoundManager.playOk();
            this._gameData.score += this._gameData.goodScore;
        } else {
            SoundManager.playBuzzer();
            this._gameData.score += this._gameData.badScore;
            // 지금 막 깨질 하트(마지막으로 살아있던 하트)의 인덱스를 기억해둠
            var brokenHeartIndex = Math.max(0, this._gameData.health - 1);
            this._gameData.health -= this._gameData.badHP;
            this._gameData.heartShakeIndex = brokenHeartIndex;
            this._gameData.heartShakeTime = 20; // 흔들림 지속 시간
        }

        this._gameData.itemCount++;
    };

    Scene_ItemCatcher.prototype.updateUI = function() {
        this._uiBitmap.clear();
        
        var ctx = this._uiBitmap.context;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px GameFont';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        ctx.fillText('Score: ' + this._gameData.score, 20, 10);
        ctx.fillText('Items: ' + this._gameData.itemCount, Graphics.boxWidth / 2 - 60, 10);
        
        // 하트 그리기
        this.drawHearts();
        
        this._uiBitmap._setDirty();
    };

    Scene_ItemCatcher.prototype.drawHearts = function() {
        var ctx = this._uiBitmap.context;
        var heartSize = 32;
        var spacing = 40;
        var totalWidth = (this._gameData.healthMax - 1) * spacing + heartSize;
        var startX = Graphics.boxWidth - totalWidth - 20;
        var startY = 10;
        
        // 하트 이미지 로드 시도
        var heart1 = null;
        var heart2 = null;
        try {
            heart1 = ImageManager.loadPicture('heart1');
            heart2 = ImageManager.loadPicture('heart2');
        } catch (e) {
            // 이미지 없으면 색상 박스로 표시
        }
        
        for (var i = 0; i < this._gameData.healthMax; i++) {
            var x = startX + (i * spacing);
            var y = startY;
            
            // 흔들림 효과
            var offsetX = 0;
            var offsetY = 0;
            if (this._gameData.heartShakeTime > 0 && i === this._gameData.heartShakeIndex) {
                offsetX = Math.sin(this._gameData.heartShakeTime) * 3;
                offsetY = Math.cos(this._gameData.heartShakeTime) * 3;
            }
            
            x += offsetX;
            y += offsetY;
            
            if (i < this._gameData.health) {
                // 살아있는 하트
                if (heart1) {
                    ctx.drawImage(heart1.canvas, x, y, heartSize, heartSize);
                } else {
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(x, y, heartSize, heartSize);
                }
            } else {
                // 죽은 하트
                if (heart2) {
                    ctx.drawImage(heart2.canvas, x, y, heartSize, heartSize);
                } else {
                    ctx.fillStyle = '#666666';
                    ctx.fillRect(x, y, heartSize, heartSize);
                }
            }
        }
        
        // heartShakeTime 감소
        if (this._gameData.heartShakeTime > 0) {
            this._gameData.heartShakeTime--;
        }
    };

    Scene_ItemCatcher.prototype.finishGame = function() {
        var isSuccess;
        
        // 체력이 0 이하면 실패
        if (this._gameData.health <= 0) {
            isSuccess = false;
        } 
        // targetScore 달성이면 성공
        else if (this._gameData.targetScore > 0 && this._gameData.score >= this._gameData.targetScore) {
            isSuccess = true;
        }
        // 그 외는 실패
        else {
            isSuccess = false;
        }

        $gameSwitches.setValue(this._gameData.switchId, isSuccess);
        $gameVariables.setValue(this._gameData.variableId, this._gameData.score);
        $gameVariables.setValue(this._gameData.variable2Id, this._gameData.itemCount);

        // 팔로워 다시 보이기 (원래부터 숨겨진 상태였으면 그대로 유지)
        if (this._followersWereVisible) {
            $gamePlayer.followers().show();
        }

        this.stopGameBgm();

        // 공통 이벤트 실행
        // 호출한 이벤트에 매달아서 실행하면(자식 인터프리터) 그 이벤트가 아직
        // 실행중이거나 병렬 프로세스거나 하면 타이밍이 꼬여서 한 번에 안 될 수 있음.
        // 그래서 완전히 독립된 인터프리터를 새로 만들어서 확실하게 실행시킴.
        var eventId = isSuccess ? this._gameData.successEventId : this._gameData.failEventId;
        console.log('[ItemCatcher] 결과:', isSuccess ? '성공' : '실패', '/ 이벤트ID:', eventId, '/ 점수:', this._gameData.score, '/ 체력:', this._gameData.health);
        if (eventId > 0) {
            var commonEvent = $dataCommonEvents[eventId];
            if (!commonEvent) {
                console.warn('[ItemCatcher] 경고: 공통 이벤트 ' + eventId + '번이 존재하지 않습니다. 데이터베이스에 만들어졌는지 확인하세요.');
            } else {
                var interpreter = new Game_Interpreter();
                interpreter.setup(commonEvent.list, 0);
                $itemCatcherPendingInterpreter = interpreter;
                console.log('[ItemCatcher] 독립 인터프리터로 공통 이벤트 ' + eventId + '번 실행 시작');
            }
        } else {
            console.log('[ItemCatcher] eventId가 0이라 실행할 공통 이벤트가 없습니다. (successEvent/failEvent 옵션을 이번 호출에도 넣었는지 확인하세요)');
        }

        // 화면을 페이드아웃 시키고, 다 끝나면 맵으로 복귀
        this._state = 'fadeout';
        this._fadeOutTimer = this.fadeSpeed();
        this.startFadeOut(this.fadeSpeed());
    };

    Scene_ItemCatcher.prototype.updateFadeOutWait = function() {
        this._fadeOutTimer--;
        if (this._fadeOutTimer <= 0) {
            SceneManager.pop();
        }
    };

    Scene_ItemCatcher.prototype.stopGameBgm = function() {
        if (!this._gameData.bgmName) return;

        var fadeSeconds = this._gameData.bgmFadeoutSeconds;
        AudioManager.fadeOutBgm(fadeSeconds);

        // 페이드아웃이 끝난 뒤 원래 맵에서 재생중이던 음악으로 복귀
        var savedBgm = this._savedBgm;
        setTimeout(function() {
            if (savedBgm) {
                AudioManager.replayBgm(savedBgm);
            }
        }, fadeSeconds * 1000);
    };

    //=========================================================================
    // Spriteset_Map 훅 제거 - showOnHead 기능 완전 삭제
    //=========================================================================
    // showOnHead 기능은 별도 플러그인으로 구현 예정

    //=========================================================================
    // 예약된 공통 이벤트를 독립적으로 확실하게 실행
    //=========================================================================

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if ($itemCatcherPendingInterpreter) {
            $itemCatcherPendingInterpreter.update();
            if (!$itemCatcherPendingInterpreter.isRunning()) {
                $itemCatcherPendingInterpreter = null;
            }
        }
    };

    //=========================================================================
    // 플러그인 커맨드
    //=========================================================================

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'ItemCatcher_Start') {
            this.startItemCatcherGame(args);
        } else if (command === 'ItemCatcher_SetItems') {
            this.setItemCatcherItems(args);
        }
    };

    Game_Interpreter.prototype.startItemCatcherGame = function(args) {
        var options = {};
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg.indexOf(':') > -1) {
                var parts = arg.split(':');
                var key = parts[0].toLowerCase();
                var value = parts.slice(1).join(':');
                options[key] = value;
            }
        }

        $itemCatcherGameData = new Game_ItemCatcher();

        if (options.switch) $itemCatcherGameData.switchId = parseInt(options.switch);
        if (options.variable) $itemCatcherGameData.variableId = parseInt(options.variable);
        if (options.variable2) $itemCatcherGameData.variable2Id = parseInt(options.variable2);
        if (options.goodscore) $itemCatcherGameData.goodScore = parseInt(options.goodscore);
        if (options.badscore) $itemCatcherGameData.badScore = parseInt(options.badscore);
        if (options.badhp) $itemCatcherGameData.badHP = parseInt(options.badhp);
        if (options.healthmax) {
            $itemCatcherGameData.healthMax = parseInt(options.healthmax);
            $itemCatcherGameData.health = parseInt(options.healthmax);
        }
        if (options.targetscore) $itemCatcherGameData.targetScore = parseInt(options.targetscore);
        if (options.successevent) $itemCatcherGameData.successEventId = parseInt(options.successevent);
        if (options.failevent) $itemCatcherGameData.failEventId = parseInt(options.failevent);
        if (options.introtext) $itemCatcherGameData.introText = options.introtext;
        if (options.backgroundimage) $itemCatcherGameData.backgroundImage = options.backgroundimage.trim();
        if (options.bgm) $itemCatcherGameData.bgmName = options.bgm.trim();
        if (options.bgmvolume) $itemCatcherGameData.bgmVolume = parseInt(options.bgmvolume);
        if (options.bgmpitch) $itemCatcherGameData.bgmPitch = parseInt(options.bgmpitch);
        if (options.bgmfadeout) $itemCatcherGameData.bgmFadeoutSeconds = parseFloat(options.bgmfadeout);
        if (options.spawninterval) {
            $itemCatcherGameData.spawnInterval = parseInt(options.spawninterval);
            $itemCatcherGameData.nextSpawnTime = parseInt(options.spawninterval);
        }

        SceneManager.push(Scene_ItemCatcher);
    };

    Game_Interpreter.prototype.setItemCatcherItems = function(args) {
        // 기존 DB 초기화
        $itemCatcherDB = {};
        
        // 새로 설정한 아이템들만 추가
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg.indexOf(':') > -1) {
                var parts = arg.split(':');
                var itemName = parts[0];
                var itemType = parts[1] ? parts[1].toLowerCase() : 'bad';

                $itemCatcherDB[itemName] = {
                    type: itemType === 'good' ? 'good' : 'bad'
                };
            }
        }
    };

    window.Scene_ItemCatcher = Scene_ItemCatcher;
    window.Game_ItemCatcher = Game_ItemCatcher;

})();
