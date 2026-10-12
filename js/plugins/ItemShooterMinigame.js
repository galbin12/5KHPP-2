//=============================================================================
// ItemShooterMinigame.js
//=============================================================================

/*:
 * @plugindesc 좌우로 움직이며 위로 빔을 쏴서 떨어지는 아이템(적)을 없애는 미니게임
 * @author Claude
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
 * @desc 새 아이템이 생성되는 간격 (프레임, 60 = 1초)
 * @default 40
 *
 * @param Beam Cooldown
 * @desc 같은 방향 빔을 다시 쏠 수 있을 때까지의 대기 시간 (프레임)
 * @default 12
 *
 * @param Beam Duration
 * @desc 빔이 화면에 남아있는 시간 (프레임). 이 동안 빔에 닿는 아이템도 파괴됨
 * @default 10
 *
 * @param Beam Thickness
 * @desc 빔 두께 (픽셀, 판정 두께도 동일)
 * @default 24
 *
 * @param Player Y
 * @desc 플레이어 발 위치 (화면 높이의 %, 0~100)
 * @default 90
 *
 * @param Player Speed
 * @desc 플레이어 좌우 이동 속도
 * @default 5
 *
 * @param Items
 * @desc 떨어지는 아이템 이름 목록 (img/pictures/[Item Folder]/[이름].png). 이벤트의 ItemShooter_SetItems 가 있으면 그게 우선
 * @type string[]
 * @default
 *
 * @param Item Folder
 * @desc 아이템 이미지 폴더 (img/pictures 아래). 비워두면 img/pictures 바로 아래에서 찾음
 * @default items
 *
 * @param Item Hitbox
 * @desc 아이템 판정 크기 (그림의 '불투명한 부분' 대비 %, 100이면 보이는 그림 크기 그대로)
 * @default 85
 *
 * @param Player Hitbox
 * @desc 플레이어 판정 크기 (캐릭터 그림 크기 대비 %, 100이면 캐릭터 칸 전체)
 * @default 60
 *
 * @param Show Hitbox
 * @desc 판정 영역을 화면에 표시 (테스트용). 플러그인 커맨드의 showhitbox:true 로 한 번만 켤 수도 있음
 * @type boolean
 * @on 표시
 * @off 숨김
 * @default false
 *
 * @param Background Image
 * @desc 기본 배경 이미지 (img/pictures 안의 파일). 비워두면 하늘색. 커맨드의 backgroundimage 옵션이 있으면 그게 우선
 * @type file
 * @dir img/pictures/
 * @default
 *
 * @param BGM
 * @desc 미니게임 전용 BGM (audio/bgm 안의 파일). 비워두면 맵 BGM이 계속 나오고, 끝나면 원래 BGM으로 돌아감
 * @type file
 * @dir audio/bgm/
 * @default
 *
 * @param BGM Volume
 * @desc 미니게임 BGM 볼륨 (0~100)
 * @default 90
 *
 * @param BGM Pitch
 * @desc 미니게임 BGM 피치 (50~150)
 * @default 100
 *
 * @param Beam SE
 * @desc 빔 발사 효과음 (audio/se 안의 파일명, 비워두면 소리 없음)
 * @default Flash2
 *
 * @help
 * =============================================================================
 * 개요
 * =============================================================================
 * 화면 아래쪽의 플레이어가 좌우로 움직이며 위로 빔을 쏴서
 * 떨어지는 아이템(적)을 파괴하는 미니게임입니다.
 *
 *   ← →  : 좌우 이동
 *   ↑    : 위로 빔 발사 (눌러서 발사, 쿨타임 있음)
 *
 * 떨어지는 아이템은 전부 적입니다.
 *   - 빔에 맞으면 파괴되고 점수 획득
 *   - 플레이어에 닿으면 체력 감소 (바닥까지 내려가는 건 감점 없음)
 *
 * =============================================================================
 * 플러그인 커맨드
 * =============================================================================
 *   ItemShooter_Start targetScore:30 healthMax:4 successEvent:10 failEvent:11
 *
 * 옵션 (콜론으로 구분, 대소문자 무관):
 *   targetScore:30     → 목표 점수 (필수! 도달하면 성공)
 *   healthMax:4        → 최대 체력/하트 개수 (기본 4)
 *   hitScore:1         → 적 파괴 시 점수 (기본 1)
 *   missHP:1           → 적이 플레이어에 닿았을 때 깎일 체력 (기본 1, 0이면 무시)
 *   floorHP:1          → 적이 바닥까지 내려갔을 때 깎일 체력 (기본 0 = 감소 없음)
 *   spawninterval:30   → 아이템 생성 간격 (프레임)
 *   switch:5           → 성공/실패를 5번 스위치에 저장 (성공 ON, 실패 OFF)
 *   variable:3         → 점수를 3번 변수에 저장
 *   variable2:4        → 파괴한 적 개수를 4번 변수에 저장
 *   successEvent:10    → 성공 시 실행할 공통 이벤트 ID
 *   failEvent:11       → 실패 시 실행할 공통 이벤트 ID
 *                        (결과 이벤트가 실행되는 경우, ItemShooter_Start 를 부른 이벤트의
 *                         뒤쪽 명령은 실행하지 않고 거기서 끝납니다. 대사가 중복으로 뜨는 것 방지)
 *   continue:true      → 위 동작을 끄고, 결과 이벤트와 별개로 호출한 이벤트의 뒤쪽 명령도 계속 실행
 *   introtext:텍스트   → 시작 전 표시할 문구 (띄어쓰기 가능)
 *   backgroundimage:이름 → 이번 게임만 쓸 배경 이미지 (img/pictures/[이름].png)
 *                           생략하면 플러그인 파라미터 'Background Image' 사용,
 *                           그것도 비어 있으면 하늘색
 *   showhitbox:true    → 이번 게임만 판정 영역 표시 (테스트용)
 *   bgm:이름           → 이번 게임만 쓸 BGM (audio/bgm/[이름]). bgm:none 이면 BGM 없이 진행
 *                        생략하면 파라미터 'BGM' 사용, 그것도 비면 맵 BGM 그대로
 *   bgmvolume:90       → 이번 게임 BGM 볼륨
 *
 * 적 아이템 설정:
 *   기본값은 플러그인 파라미터 'Items' 에 이름을 적어두면 됩니다.
 *   이벤트에서 따로 바꾸고 싶을 때만 (이름만 나열):
 *   ItemShooter_SetItems rock bomb meteor
 *   (SetItems 를 쓰면 파라미터 값 대신 그 목록을 사용합니다)
 *
 *   이미지: img/pictures/items/[아이템명].png  (ItemCatcher와 같은 폴더 사용)
 *   이미지 파일이 없으면 빨간 박스로 표시 (콘솔 F8에 찾아본 경로가 출력됨)
 *   아이템 판정은 그림의 투명한 여백을 제외한 '실제로 보이는 부분' 기준입니다.
 *   Show Hitbox 를 true 로 하면 판정(노랑=아이템, 하늘=빔, 초록=플레이어)과
 *   그림 영역(흰 점선)이 같이 보여서 맞춰보기 쉽습니다.
 *   하트 이미지: img/pictures/heart1.png (생존), heart2.png (소실)
 *   (예전 형식 rock:bad 처럼 콜론이 붙어 있어도 이름만 읽고 종류는 무시합니다)
 *
 * 진행:
 *   인트로 문구 → 3 2 1 → START! → 게임 → 성공/실패 이벤트 실행
 * =============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('ItemShooterMinigame');

    function numParam(name, def) {
        var v = parseFloat(parameters[name]);
        return isNaN(v) ? def : v;
    }

    var ITEM_SPEED_MIN = numParam('Item Speed Min', 2);
    var ITEM_SPEED_MAX = numParam('Item Speed Max', 4);
    var SPAWN_INTERVAL = numParam('Spawn Interval', 40);
    var BEAM_COOLDOWN = numParam('Beam Cooldown', 12);
    var BEAM_DURATION = Math.max(1, numParam('Beam Duration', 10));
    var BEAM_THICKNESS = Math.max(2, numParam('Beam Thickness', 24));
    var PLAYER_Y_RATIO = numParam('Player Y', 90) / 100;
    var PLAYER_SPEED = numParam('Player Speed', 5);
    var ITEM_FOLDER = (parameters['Item Folder'] === undefined) ? 'items' : String(parameters['Item Folder']).trim().replace(/^\/+|\/+$/g, '');
    function itemImageName(type) {
        return ITEM_FOLDER ? ITEM_FOLDER + '/' + type : type;
    }
    var HITBOX_SCALE = Math.max(0.1, numParam('Item Hitbox', 85) / 100);
    var PLAYER_HIT_SCALE = Math.max(0.1, numParam('Player Hitbox', 60) / 100);
    var SHOW_HITBOX = /^(true|on|1)$/i.test(String(parameters['Show Hitbox']).trim());
    var BACKGROUND_IMAGE = (parameters['Background Image'] === undefined) ? '' :
        String(parameters['Background Image']).trim().replace(/\.png$/i, '');
    function cleanAudioName(v) {
        return (v === undefined) ? '' : String(v).trim().replace(/\.(ogg|m4a)$/i, '');
    }
    var BGM_NAME = cleanAudioName(parameters['BGM']);
    var BGM_VOLUME = numParam('BGM Volume', 90);
    var BGM_PITCH = numParam('BGM Pitch', 100);
    var BEAM_SE = (parameters['Beam SE'] === undefined) ? 'Flash2' : String(parameters['Beam SE']).trim();

    var DEFAULT_PLAYER_SIZE = 48;
    var DEFAULT_ITEM_SIZE = 40;

    // 미니게임 종료 후 실행할 공통 이벤트를 위한 독립 인터프리터
    var $itemShooterPendingInterpreter = null;

    // 이름 토큰 목록 → 중복 없는 이름 배열 (공백/쉼표 구분, rock:bad 형식은 이름만 사용)
    function namesFromTokens(tokens) {
        var list = [];
        for (var i = 0; i < tokens.length; i++) {
            var parts = String(tokens[i]).split(/[\s,\u3000]+/);
            for (var j = 0; j < parts.length; j++) {
                var name = parts[j].split(':')[0].trim();
                if (name && list.indexOf(name) < 0) {
                    list.push(name);
                }
            }
        }
        return list;
    }

    // 파라미터 'Items' 읽기 (["rock","bomb"] 형태 또는 "rock bomb" 문자열 모두 허용)
    function parseItemParam(raw) {
        var text = (raw === undefined || raw === null) ? '' : String(raw).trim();
        if (!text) {
            return [];
        }
        if (text.charAt(0) === '[') {
            try {
                var arr = JSON.parse(text);
                if (Array.isArray(arr)) {
                    return namesFromTokens(arr);
                }
            } catch (e) {}
            return [];
        }
        return namesFromTokens([text]);
    }

    // 적 아이템 이름 목록 (img/pictures/[Item Folder]/[이름].png)
    // 초기값은 파라미터 'Items', 이벤트의 ItemShooter_SetItems 로 바꿀 수 있음
    var $itemShooterDB = parseItemParam(parameters['Items']);

    //-------------------------------------------------------------------------
    // 이미지 로딩
    // ImageManager 캐시를 거치지 않고 Bitmap.load 로 직접 불러옵니다.
    //  - 파일 존재 여부를 미리 검사하지 않으므로 경로 탐지 실패로 그림을 못 찾는 일이 없음
    //  - 캐시에 안 들어가서 파일이 없어도 종료 후 Loading Error 화면이 뜨지 않음
    //  - 후보 경로(폴더/이름 → 이름)를 순서대로 시도, 모두 실패하면 failed
    //-------------------------------------------------------------------------
    var _picEntries = {};
    var _warned = {};

    function picUrl(name) {
        return 'img/pictures/' + name + '.png';
    }

    function warnOnce(key, msg) {
        if (!_warned[key]) {
            _warned[key] = true;
            console.warn(msg);
        }
    }

    function getPicture(candidates) {
        var key = candidates.join('|');
        var e = _picEntries[key];
        if (!e) {
            e = {
                cands: candidates,
                idx: 0,
                failed: false,
                bitmap: Bitmap.load(picUrl(candidates[0])),
                bounds: undefined
            };
            _picEntries[key] = e;
        }
        return e;
    }

    function updatePicture(e) {
        if (e.failed) {
            return;
        }
        if (e.bitmap.isError && e.bitmap.isError()) {
            warnOnce('try:' + e.cands[e.idx], '[ItemShooter] 이미지를 불러오지 못했습니다: ' + picUrl(e.cands[e.idx]));
            e.idx++;
            if (e.idx < e.cands.length) {
                e.bitmap = Bitmap.load(picUrl(e.cands[e.idx]));
                e.bounds = undefined;
            } else {
                e.failed = true;
                warnOnce('fail:' + e.cands.join('|'), '[ItemShooter] 모든 위치에서 이미지를 찾지 못했습니다 → ' +
                    e.cands.map(picUrl).join(' , ') + ' (파일명/폴더/대소문자 확인)');
            }
        }
    }

    function itemCandidates(type) {
        return ITEM_FOLDER ? [ITEM_FOLDER + '/' + type, type] : [type];
    }

    // 투명 여백을 뺀 실제 그림 영역 (판정용). 읽을 수 없으면 null → 이미지 전체 사용
    function opaqueBounds(bitmap) {
        try {
            var w = bitmap.width, h = bitmap.height;
            if (w <= 0 || h <= 0) {
                return null;
            }
            var data = bitmap.context.getImageData(0, 0, w, h).data;
            var minX = w, minY = h, maxX = -1, maxY = -1;
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    if (data[(y * w + x) * 4 + 3] > 24) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX < 0) {
                return null;
            }
            return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
        } catch (e) {
            return null;
        }
    }

    function makeColorBox(color, w, h) {
        var box = new Bitmap(w, h);
        box.fillRect(0, 0, w, h, color);
        return box;
    }

    function bitmapUsable(bitmap) {
        return bitmap && bitmap.isReady() && !(bitmap.isError && bitmap.isError());
    }

    //=========================================================================
    // Game_ItemShooter
    //=========================================================================

    function Game_ItemShooter() {
        this.initialize.apply(this, arguments);
    }

    Game_ItemShooter.prototype.initialize = function() {
        this.score = 0;
        this.itemCount = 0;
        this.switchId = 1;
        this.variableId = 1;
        this.variable2Id = 2;
        this.hitScore = 1;
        this.missHP = 1;
        this.floorHP = 0; // 바닥까지 내려가도 체력 감소 없음 (floorhp 옵션으로 켤 수 있음)
        this.successEventId = 0;
        this.failEventId = 0;
        this.introText = '떨어지는 아이템을 빔으로 쏴서 없애세요!';
        this.targetScore = 0;
        this.backgroundImage = BACKGROUND_IMAGE;
        this.showHitbox = SHOW_HITBOX;
        this.bgm = BGM_NAME;          // '' 이면 맵 BGM 유지
        this.bgmVolume = BGM_VOLUME;
        this.bgmPitch = BGM_PITCH;
        this.healthMax = 4;
        this.health = 4;
        this.spawnInterval = SPAWN_INTERVAL;
        this.nextSpawnTime = SPAWN_INTERVAL;
        this.heartShakeTime = 0;
        this.heartShakeIndex = -1;
        this.items = [];
    };

    Game_ItemShooter.prototype.isFinished = function() {
        if (this.health <= 0) {
            return true;
        }
        if (this.targetScore > 0 && this.score >= this.targetScore) {
            return true;
        }
        return false;
    };

    //=========================================================================
    // Scene_ItemShooter
    //=========================================================================

    function Scene_ItemShooter() {
        this.initialize.apply(this, arguments);
    }

    Scene_ItemShooter.prototype = Object.create(Scene_Base.prototype);
    Scene_ItemShooter.prototype.constructor = Scene_ItemShooter;

    Scene_ItemShooter.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._gameData = window.$itemShooterGameData || new Game_ItemShooter();
        this._state = 'intro';
        this._introTimer = 0;
        this._countdownTime = 0;
        this._countdownStep = -1;
        this._startPopupTimer = 0;
        this._flashTime = 0;
        this._beams = [];
        this._effects = [];
        this._cooldown = 0;
        this._playerW = DEFAULT_PLAYER_SIZE;
        this._playerH = DEFAULT_PLAYER_SIZE;
        _picEntries = {}; // 게임을 시작할 때마다 이미지를 새로 찾음
    };

    Scene_ItemShooter.prototype.create = function() {
        Scene_Base.prototype.create.call(this);

        // 해상도/줌 플러그인 대응: boxWidth/boxHeight 안전 영역을 화면 중앙에 배치
        this._offsetLayer = new Sprite();
        this._offsetLayer.x = (Graphics.width - Graphics.boxWidth) / 2;
        this._offsetLayer.y = (Graphics.height - Graphics.boxHeight) / 2;
        this.addChild(this._offsetLayer);

        this._playerX = Graphics.boxWidth / 2;
        this._playerY = Math.floor(Graphics.boxHeight * PLAYER_Y_RATIO);
        this._heartEntries = [getPicture(['heart1']), getPicture(['heart2'])];

        // 레이어 순서: 배경 < 아이템 < 빔 < 플레이어 < 이펙트 < UI < 팝업
        this.createBackground();
        this._itemLayer = new Sprite();
        this._offsetLayer.addChild(this._itemLayer);
        this._beamLayer = new Sprite();
        this._offsetLayer.addChild(this._beamLayer);
        this.createPlayer();
        this._effectLayer = new Sprite();
        this._offsetLayer.addChild(this._effectLayer);
        this.createUIWindow();
        this._popupLayer = new Sprite();
        this._popupLayer.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._offsetLayer.addChild(this._popupLayer);
        if (this._gameData.showHitbox) {
            this._debugSprite = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
            this._offsetLayer.addChild(this._debugSprite);
        }

        this.hideFollowers();
        this.startMinigameBgm();
    };

    Scene_ItemShooter.prototype.createBackground = function() {
        var sprite = new Sprite();
        this._bgSprite = sprite;
        this._bgChecked = false;
        this._bgEntry = this._gameData.backgroundImage ? getPicture([this._gameData.backgroundImage]) : null;
        if (this._bgEntry) {
            sprite.bitmap = this._bgEntry.bitmap;
        } else {
            sprite.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
            sprite.bitmap.fillRect(0, 0, Graphics.boxWidth, Graphics.boxHeight, 'rgb(100, 149, 237)');
        }
        this._offsetLayer.addChild(sprite);
    };

    Scene_ItemShooter.prototype.createPlayer = function() {
        this._originalDirection = $gamePlayer.direction();
        $gamePlayer.setDirection(8); // 위를 보고 있음
        this._player = new Sprite_Character($gamePlayer);
        // 위치는 맵 좌표가 아니라 직접 제어
        this._player.updatePosition = function() {};
        this._offsetLayer.addChild(this._player);
        this._player.x = this._playerX;
        this._player.y = this._playerY;
        this._player.update();
    };

    Scene_ItemShooter.prototype.hideFollowers = function() {
        this._followersWereVisible = $gamePlayer.followers().isVisible();
        $gamePlayer.followers().hide();
    };

    // 전용 BGM 재생 (원래 BGM/BGS는 저장해두었다가 종료 시 복귀)
    Scene_ItemShooter.prototype.startMinigameBgm = function() {
        var data = this._gameData;
        this._savedBgm = null;
        this._savedBgs = null;
        var name = data.bgm;
        if (!name || /^(none|off)$/i.test(name)) {
            if (/^(none|off)$/i.test(name)) {
                this._savedBgm = AudioManager.saveBgm();
                this._savedBgs = AudioManager.saveBgs();
                AudioManager.stopBgm();
            }
            return;
        }
        this._savedBgm = AudioManager.saveBgm();
        this._savedBgs = AudioManager.saveBgs();
        AudioManager.playBgm({ name: name, volume: data.bgmVolume, pitch: data.bgmPitch, pan: 0 });
    };

    Scene_ItemShooter.prototype.restoreBgm = function() {
        if (this._savedBgm) {
            AudioManager.replayBgm(this._savedBgm);
            this._savedBgm = null;
        }
        if (this._savedBgs) {
            AudioManager.replayBgs(this._savedBgs);
            this._savedBgs = null;
        }
    };

    Scene_ItemShooter.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        this.restoreBgm();
    };

    Scene_ItemShooter.prototype.createUIWindow = function() {
        this._uiBitmap = new Bitmap(Graphics.boxWidth, 100);
        this._uiSprite = new Sprite();
        this._uiSprite.bitmap = this._uiBitmap;
        this._offsetLayer.addChild(this._uiSprite);
    };

    //-------------------------------------------------------------------------
    // 상태 진행
    //-------------------------------------------------------------------------

    Scene_ItemShooter.prototype.checkBackground = function() {
        var e = this._bgEntry;
        if (this._bgChecked || !e) {
            return;
        }
        updatePicture(e);
        if (e.failed) {
            var box = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
            box.fillRect(0, 0, Graphics.boxWidth, Graphics.boxHeight, 'rgb(100, 149, 237)');
            this._bgSprite.bitmap = box;
            this._bgChecked = true;
        } else if (e.bitmap.isReady()) {
            this._bgChecked = true;
        }
    };

    Scene_ItemShooter.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        this.checkBackground();

        if (this._state === 'intro') {
            this.updateIntro();
        } else if (this._state === 'countdown') {
            this.updateCountdown();
        } else if (this._state === 'running') {
            this.updateGame();
        }
    };

    Scene_ItemShooter.prototype.updateIntro = function() {
        if (this._introTimer === 0) {
            this.drawIntroText();
        }
        this._introTimer++;
        if (this._introTimer >= 60) {
            this._state = 'countdown';
            this._popupLayer.bitmap.clear();
        }
    };

    Scene_ItemShooter.prototype.drawIntroText = function() {
        this._popupLayer.bitmap.clear();
        var ctx = this._popupLayer.bitmap.context;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var maxWidth = Graphics.boxWidth - 80;
        var fontSize = 28;
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

    Scene_ItemShooter.prototype.wrapText = function(ctx, text, maxWidth) {
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

    Scene_ItemShooter.prototype.updateCountdown = function() {
        var step = Math.floor(this._countdownTime / 60);
        this._countdownTime++;
        if (step === this._countdownStep) {
            return;
        }
        this._countdownStep = step;
        this.drawCountdown(step);
        if (step < 3) {
            SoundManager.playCursor();
        } else {
            // START! 표시와 동시에 게임 시작
            this._state = 'running';
            this._startPopupTimer = 50;
        }
    };

    Scene_ItemShooter.prototype.drawCountdown = function(step) {
        this._popupLayer.bitmap.clear();
        var texts = ['3', '2', '1', 'START!'];
        var size = step === 3 ? 120 : 96;

        var ctx = this._popupLayer.bitmap.context;
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold ' + size + 'px GameFont';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texts[step], Graphics.boxWidth / 2, Graphics.boxHeight / 2);
        this._popupLayer.bitmap._setDirty();
    };

    //-------------------------------------------------------------------------
    // 게임 진행
    //-------------------------------------------------------------------------

    Scene_ItemShooter.prototype.updateGame = function() {
        if (this._startPopupTimer > 0) {
            this._startPopupTimer--;
            if (this._startPopupTimer === 0) {
                this._popupLayer.bitmap.clear();
            }
        }

        this.updateInput();
        this.updateItems();
        this.updateBeams();
        this.checkItemsReach();
        this.updateEffects();
        this.updatePlayer();
        this.updateUI();
        this.updateDebug();

        if (this._gameData.isFinished()) {
            this.finishGame();
        }
    };

    // 판정 영역 표시 (Show Hitbox 파라미터가 true일 때만)
    Scene_ItemShooter.prototype.updateDebug = function() {
        if (!this._debugSprite) {
            return;
        }
        var bmp = this._debugSprite.bitmap;
        bmp.clear();
        var ctx = bmp.context;
        ctx.lineWidth = 2;
        var self = this;
        function box(r, color) {
            ctx.strokeStyle = color;
            ctx.strokeRect(r.l, r.t, r.r - r.l, r.b - r.t);
        }
        this._gameData.items.forEach(function(it) {
            // 그림 전체 영역 (흰색 반투명) / 실제 판정 (노랑)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.strokeRect(it.x - it.w / 2, it.y - it.h / 2, it.w, it.h);
            box(self.itemRect(it), '#ffff00');
        });
        this._beams.forEach(function(b) { box(self.beamRect(b), '#00ffff'); });
        box(this.playerRect(), '#00ff00');
        bmp._setDirty();
    };

    // 캐릭터 그림의 실제 크기 반영 (CustomCharacterSize 등 큰 캐릭터 대응)
    Scene_ItemShooter.prototype.updatePlayerSize = function() {
        var bmp = this._player.bitmap;
        if (bmp && bmp.isReady() && this._player.patternWidth) {
            var pw = this._player.patternWidth();
            var ph = this._player.patternHeight();
            if (pw > 0 && ph > 0) {
                this._playerW = pw;
                this._playerH = ph;
            }
        }
    };

    Scene_ItemShooter.prototype.playerRect = function() {
        var pw = this._playerW, ph = this._playerH;
        var cx = this._playerX + pw * (0.5 - this._player.anchor.x);
        var hw = pw * PLAYER_HIT_SCALE / 2;
        return {
            l: cx - hw,
            r: cx + hw,
            t: this._playerY - ph * PLAYER_HIT_SCALE,
            b: this._playerY
        };
    };

    Scene_ItemShooter.prototype.updatePlayer = function() {
        this.updatePlayerSize();
        if (this._flashTime > 0) {
            this._flashTime--;
            this._player.setBlendColor([255, 0, 0, Math.floor(160 * this._flashTime / 15)]);
        }
        this._player.x = this._playerX;
        this._player.y = this._playerY;
        this._player.update();
    };

    //-------------------------------------------------------------------------
    // 입력 / 빔
    //-------------------------------------------------------------------------

    Scene_ItemShooter.prototype.updateInput = function() {
        // 좌우 이동
        if (Input.isPressed('left')) {
            this._playerX -= PLAYER_SPEED;
        }
        if (Input.isPressed('right')) {
            this._playerX += PLAYER_SPEED;
        }
        var halfW = this._playerW / 2;
        var minX = halfW;
        var maxX = Graphics.boxWidth - halfW;
        if (this._playerX < minX) this._playerX = minX;
        if (this._playerX > maxX) this._playerX = maxX;

        // 위로 빔 발사
        if (this._cooldown > 0) {
            this._cooldown--;
        }
        if (Input.isTriggered('up') && this._cooldown <= 0) {
            this.fireBeam();
            this._cooldown = BEAM_COOLDOWN;
        }
    };

    Scene_ItemShooter.prototype.fireBeam = function() {
        var x = this._playerX;
        var y = this._playerY - this._playerH; // 캐릭터 머리 위에서 발사
        var sprite = this.createBeamSprite(x, y);
        this._beamLayer.addChild(sprite);
        this._beams.push({ x: x, y: y, timer: BEAM_DURATION, sprite: sprite });

        if (BEAM_SE) {
            AudioManager.playSe({ name: BEAM_SE, volume: 80, pitch: 100, pan: 0 });
        }
    };

    Scene_ItemShooter.prototype.createBeamSprite = function(x, y) {
        var th = Math.ceil(BEAM_THICKNESS);
        var len = Math.max(1, Math.ceil(y));

        var bitmap = new Bitmap(th, len);
        var ctx = bitmap.context;
        var g = ctx.createLinearGradient(0, 0, th, 0);
        // 가장자리까지 보이게 해서 보이는 폭 = 판정 폭
        g.addColorStop(0.0, 'rgba(0, 200, 255, 0.45)');
        g.addColorStop(0.25, 'rgba(120, 230, 255, 0.9)');
        g.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.75, 'rgba(120, 230, 255, 0.9)');
        g.addColorStop(1.0, 'rgba(0, 200, 255, 0.45)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, th, len);
        bitmap._setDirty();

        var sprite = new Sprite(bitmap);
        sprite.blendMode = 1; // 가산 합성으로 빛나는 느낌
        sprite.anchor.set(0.5, 1);
        sprite.x = x;
        sprite.y = y;
        return sprite;
    };

    // 빔의 판정 영역 (발사한 x 위치에서 화면 위끝까지)
    Scene_ItemShooter.prototype.beamRect = function(beam) {
        var half = BEAM_THICKNESS / 2;
        return { l: beam.x - half, r: beam.x + half, t: 0, b: beam.y };
    };

    Scene_ItemShooter.prototype.itemRect = function(item) {
        // item.hit: 그림에서 투명 여백을 뺀 영역 (이미지 중심 기준 오프셋)
        var hit = item.hit || { w: item.w, h: item.h, ox: 0, oy: 0 };
        var cx = item.x + hit.ox;
        var cy = item.y + hit.oy;
        var hw = hit.w * HITBOX_SCALE / 2;
        var hh = hit.h * HITBOX_SCALE / 2;
        return { l: cx - hw, r: cx + hw, t: cy - hh, b: cy + hh };
    };

    Scene_ItemShooter.prototype.rectsOverlap = function(a, b) {
        return !(a.r < b.l || a.l > b.r || a.b < b.t || a.t > b.b);
    };

    Scene_ItemShooter.prototype.updateBeams = function() {
        for (var i = this._beams.length - 1; i >= 0; i--) {
            var beam = this._beams[i];

            // 빔이 남아있는 동안 닿는 아이템은 모두 파괴
            var rect = this.beamRect(beam);
            for (var j = this._gameData.items.length - 1; j >= 0; j--) {
                var item = this._gameData.items[j];
                if (this.rectsOverlap(rect, this.itemRect(item))) {
                    this._gameData.items.splice(j, 1);
                    this.onItemShot(item);
                }
            }

            // 빔 연출 (서서히 사라짐)
            beam.timer--;
            var p = Math.max(0, beam.timer / BEAM_DURATION);
            beam.sprite.opacity = 255 * p; // 폭은 유지(판정과 일치), 투명도만 서서히 감소
            if (beam.timer <= 0) {
                this._beamLayer.removeChild(beam.sprite);
                this._beams.splice(i, 1);
            }
        }
    };

    //-------------------------------------------------------------------------
    // 아이템
    //-------------------------------------------------------------------------

    Scene_ItemShooter.prototype.updateItems = function() {
        var data = this._gameData;
        data.nextSpawnTime--;
        if (data.nextSpawnTime <= 0) {
            this.spawnItem();
            data.nextSpawnTime = data.spawnInterval;
        }

        for (var i = 0; i < data.items.length; i++) {
            var item = data.items[i];
            this.refreshItemSprite(item);
            item.y += item.speed;
            item.sprite.x = item.x;
            item.sprite.y = item.y;
        }
    };

    Scene_ItemShooter.prototype.spawnItem = function() {
        var types = $itemShooterDB;
        if (types.length === 0) {
            warnOnce('noitems', '[ItemShooter] 아이템 이름이 지정되지 않았습니다. ' +
                '플러그인 파라미터 Items 에 적거나 "ItemShooter_SetItems 이름1 이름2" 를 사용하세요. (빨간 박스로 대체)');
            types = ['__none__'];
        }
        var type = types[Math.floor(Math.random() * types.length)];

        var sprite = new Sprite();
        sprite.anchor.set(0.5, 0.5);
        var entry = null;
        if (type === '__none__') {
            sprite.bitmap = makeColorBox('rgb(200, 0, 0)', DEFAULT_ITEM_SIZE, DEFAULT_ITEM_SIZE);
        } else {
            entry = getPicture(itemCandidates(type));
            sprite.bitmap = entry.bitmap;
        }

        var item = {
            type: type,
            x: 0,
            y: -DEFAULT_ITEM_SIZE,
            w: DEFAULT_ITEM_SIZE,
            h: DEFAULT_ITEM_SIZE,
            speed: ITEM_SPEED_MIN + Math.random() * (ITEM_SPEED_MAX - ITEM_SPEED_MIN),
            sprite: sprite,
            entry: entry,
            hit: { w: DEFAULT_ITEM_SIZE, h: DEFAULT_ITEM_SIZE, ox: 0, oy: 0 },
            sized: false,
            fallback: !entry
        };
        item.x = DEFAULT_ITEM_SIZE / 2 + 10 + Math.random() * (Graphics.boxWidth - DEFAULT_ITEM_SIZE - 20);
        sprite.x = item.x;
        sprite.y = item.y;

        this._gameData.items.push(item);
        this._itemLayer.addChild(sprite);
    };

    // 이미지 로드 완료 후 실제 크기/판정 영역 반영 / 로드 실패 시 색상 박스로 대체
    Scene_ItemShooter.prototype.refreshItemSprite = function(item) {
        var e = item.entry;
        if (!e || item.fallback) {
            return;
        }
        updatePicture(e);
        if (e.failed) {
            item.sprite.bitmap = makeColorBox('rgb(200, 0, 0)', DEFAULT_ITEM_SIZE, DEFAULT_ITEM_SIZE);
            item.w = item.h = DEFAULT_ITEM_SIZE;
            item.hit = { w: DEFAULT_ITEM_SIZE, h: DEFAULT_ITEM_SIZE, ox: 0, oy: 0 };
            item.fallback = true;
            return;
        }
        if (item.sprite.bitmap !== e.bitmap) {
            // 다음 후보 경로로 넘어간 경우
            item.sprite.bitmap = e.bitmap;
            item.sized = false;
        }
        if (!item.sized && bitmapUsable(e.bitmap)) {
            var bmp = e.bitmap;
            item.w = bmp.width;
            item.h = bmp.height;
            if (e.bounds === undefined) {
                e.bounds = opaqueBounds(bmp);
            }
            var b = e.bounds;
            if (b) {
                item.hit = {
                    w: b.w,
                    h: b.h,
                    ox: b.x + b.w / 2 - item.w / 2,
                    oy: b.y + b.h / 2 - item.h / 2
                };
            } else {
                item.hit = { w: item.w, h: item.h, ox: 0, oy: 0 };
            }
            // 큰 그림이 화면 밖으로 삐져나가지 않게 한 번만 보정
            var minX = item.w / 2;
            var maxX = Graphics.boxWidth - item.w / 2;
            if (maxX >= minX) {
                item.x = Math.max(minX, Math.min(maxX, item.x));
            }
            item.sized = true;
        }
    };

    // 플레이어에 닿았거나 바닥까지 내려간 아이템 처리
    Scene_ItemShooter.prototype.checkItemsReach = function() {
        var playerRect = this.playerRect();

        for (var i = this._gameData.items.length - 1; i >= 0; i--) {
            var item = this._gameData.items[i];
            if (item.y - item.h / 2 > Graphics.boxHeight) {
                // 바닥까지 내려감
                this._gameData.items.splice(i, 1);
                this._itemLayer.removeChild(item.sprite);
                this.onTargetMissed(true, item.x, item.y);
            } else if (this.rectsOverlap(playerRect, this.itemRect(item))) {
                // 플레이어에 닿음
                this._gameData.items.splice(i, 1);
                this.startPopEffect(item.sprite);
                this.onTargetMissed(false, item.x, item.y);
            }
        }
    };

    //-------------------------------------------------------------------------
    // 결과 처리
    //-------------------------------------------------------------------------

    Scene_ItemShooter.prototype.damage = function(amount) {
        if (amount <= 0) {
            return;
        }
        var data = this._gameData;
        data.heartShakeIndex = Math.max(0, data.health - 1);
        data.heartShakeTime = 20;
        data.health -= amount;
        this._flashTime = 15;
    };

    Scene_ItemShooter.prototype.onItemShot = function(item) {
        var data = this._gameData;
        this.startPopEffect(item.sprite);

        SoundManager.playOk();
        data.score += data.hitScore;
        data.itemCount++;
        this.showTextPopup(item.x, item.y, (data.hitScore >= 0 ? '+' : '') + data.hitScore, '#ffff66');
    };

    // floor: true면 바닥까지 내려간 경우, false면 플레이어에 닿은 경우
    Scene_ItemShooter.prototype.onTargetMissed = function(floor, x, y) {
        var data = this._gameData;
        var hp = floor ? data.floorHP : data.missHP;
        if (hp > 0) {
            SoundManager.playBuzzer();
            this.damage(hp);
            // 왜 깎였는지 화면에 표시 (바닥: MISS, 플레이어: HIT)
            var px = Math.max(40, Math.min(Graphics.boxWidth - 40, x));
            var py = floor ? Graphics.boxHeight - 30 : y;
            this.showTextPopup(px, py, (floor ? 'MISS -' : 'HIT -') + hp, '#ff6666');
        }
    };

    //-------------------------------------------------------------------------
    // 이펙트
    //-------------------------------------------------------------------------

    // 파괴된 아이템 스프라이트를 커지면서 사라지게 함
    Scene_ItemShooter.prototype.startPopEffect = function(sprite) {
        this._itemLayer.removeChild(sprite);
        sprite.blendMode = 1;
        this._effectLayer.addChild(sprite);
        this._effects.push({ kind: 'pop', sprite: sprite, timer: 14, max: 14 });
    };

    Scene_ItemShooter.prototype.showTextPopup = function(x, y, text, color) {
        var bitmap = new Bitmap(100, 36);
        var ctx = bitmap.context;
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.font = 'bold 26px GameFont';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(text, 50, 18);
        ctx.fillText(text, 50, 18);
        bitmap._setDirty();

        var sprite = new Sprite(bitmap);
        sprite.anchor.set(0.5, 0.5);
        sprite.x = x;
        sprite.y = y;
        this._effectLayer.addChild(sprite);
        this._effects.push({ kind: 'text', sprite: sprite, timer: 40, max: 40 });
    };

    Scene_ItemShooter.prototype.updateEffects = function() {
        for (var i = this._effects.length - 1; i >= 0; i--) {
            var fx = this._effects[i];
            fx.timer--;
            var progress = 1 - fx.timer / fx.max;
            if (fx.kind === 'pop') {
                var s = 1 + 0.8 * progress;
                fx.sprite.scale.set(s, s);
                fx.sprite.opacity = 255 * (1 - progress);
            } else {
                fx.sprite.y -= 1;
                fx.sprite.opacity = 255 * (1 - progress);
            }
            if (fx.timer <= 0) {
                this._effectLayer.removeChild(fx.sprite);
                this._effects.splice(i, 1);
            }
        }
    };

    //-------------------------------------------------------------------------
    // UI
    //-------------------------------------------------------------------------

    Scene_ItemShooter.prototype.updateUI = function() {
        this._uiBitmap.clear();

        var ctx = this._uiBitmap.context;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px GameFont';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        var data = this._gameData;
        var scoreText = 'Score: ' + data.score;
        if (data.targetScore > 0) {
            scoreText += ' / ' + data.targetScore;
        }
        ctx.fillText(scoreText, 20, 10);

        this.drawHearts();
        this._uiBitmap._setDirty();
    };

    Scene_ItemShooter.prototype.drawHearts = function() {
        var data = this._gameData;
        var ctx = this._uiBitmap.context;
        var heartSize = 32;
        var spacing = 40;
        var totalWidth = (data.healthMax - 1) * spacing + heartSize;
        var startX = Graphics.boxWidth - totalWidth - 20;
        var startY = 10;

        var heart1 = this._heartEntries[0];
        var heart2 = this._heartEntries[1];
        updatePicture(heart1);
        updatePicture(heart2);

        for (var i = 0; i < data.healthMax; i++) {
            var x = startX + i * spacing;
            var y = startY;

            if (data.heartShakeTime > 0 && i === data.heartShakeIndex) {
                x += Math.sin(data.heartShakeTime) * 3;
                y += Math.cos(data.heartShakeTime) * 3;
            }

            var alive = i < data.health;
            var entry = alive ? heart1 : heart2;
            var img = entry.failed ? null : entry.bitmap;
            if (bitmapUsable(img)) {
                this._uiBitmap.blt(img, 0, 0, img.width, img.height, x, y, heartSize, heartSize);
            } else {
                ctx.fillStyle = alive ? '#ff0000' : '#666666';
                ctx.fillRect(x, y, heartSize, heartSize);
            }
        }

        if (data.heartShakeTime > 0) {
            data.heartShakeTime--;
        }
    };

    //-------------------------------------------------------------------------
    // 종료
    //-------------------------------------------------------------------------

    Scene_ItemShooter.prototype.finishGame = function() {
        var data = this._gameData;
        var isSuccess = false;

        if (data.health <= 0) {
            isSuccess = false;
        } else if (data.targetScore > 0 && data.score >= data.targetScore) {
            isSuccess = true;
        }

        $gameSwitches.setValue(data.switchId, isSuccess);
        $gameVariables.setValue(data.variableId, data.score);
        $gameVariables.setValue(data.variable2Id, data.itemCount);

        // 플레이어 방향 / 팔로워 복구
        $gamePlayer.setDirection(this._originalDirection);
        if (this._followersWereVisible) {
            $gamePlayer.followers().show();
        }

        // 공통 이벤트는 호출 이벤트와 무관하게 독립 인터프리터로 실행
        var eventId = isSuccess ? data.successEventId : data.failEventId;
        console.log('[ItemShooter] 결과:', isSuccess ? '성공' : '실패', '/ 이벤트ID:', eventId,
            '/ 점수:', data.score, '/ 체력:', data.health);
        // 결과 이벤트가 있으면, 호출한 이벤트의 'Start 다음 줄들'이 같이 실행되어
        // 대사가 중복/잘못 뜨지 않도록 호출 이벤트를 여기서 종료시킴
        var caller = data.callerInterpreter;
        if (eventId > 0 && !data.continueAfter && caller && caller._list && caller._list === data.callerList) {
            caller._index = caller._list.length;
        }
        if (eventId > 0) {
            var commonEvent = $dataCommonEvents[eventId];
            if (!commonEvent) {
                console.warn('[ItemShooter] 경고: 공통 이벤트 ' + eventId + '번이 존재하지 않습니다.');
            } else {
                var interpreter = new Game_Interpreter();
                interpreter.setup(commonEvent.list, 0);
                $itemShooterPendingInterpreter = interpreter;
            }
        } else {
            console.log('[ItemShooter] eventId가 0이라 실행할 공통 이벤트가 없습니다. (successEvent/failEvent 옵션 확인)');
        }

        SceneManager.pop();
    };

    //=========================================================================
    // 예약된 공통 이벤트를 독립적으로 실행
    //=========================================================================

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if ($itemShooterPendingInterpreter) {
            $itemShooterPendingInterpreter.update();
            if (!$itemShooterPendingInterpreter.isRunning()) {
                $itemShooterPendingInterpreter = null;
            }
        }
    };

    //=========================================================================
    // 플러그인 커맨드
    //=========================================================================

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'ItemShooter_Start') {
            // Start 직후 씬이 바뀌면 이벤트의 다음 줄은 미니게임이 끝난 뒤에야 실행되므로,
            // 바로 뒤에 이어진 ItemShooter_SetItems 줄을 미리 읽어서 적용
            this.applyFollowingItemShooterItems();
            // 같은 줄에 ItemShooter_SetItems 가 이어 붙어 있으면 분리해서 처리
            var splitAt = args.indexOf('ItemShooter_SetItems');
            if (splitAt >= 0) {
                this.setItemShooterItems(args.slice(splitAt + 1));
                args = args.slice(0, splitAt);
            }
            this.startItemShooterGame(args);
        } else if (command === 'ItemShooter_SetItems') {
            this.setItemShooterItems(args);
        }
    };

    Game_Interpreter.prototype.applyFollowingItemShooterItems = function() {
        var list = this._list;
        if (!list) {
            return;
        }
        for (var i = this._index + 1; i < list.length; i++) {
            var cmd = list[i];
            if (cmd.code !== 356) {
                continue; // 사이에 다른 이벤트 명령(대화, 대기 등)이 있어도 계속 찾음
            }
            var tokens = String(cmd.parameters[0]).split(/[\s\u3000]+/);
            if (tokens[0] === 'ItemShooter_Start') {
                break; // 다음 미니게임 시작 줄이면 거기서 중단
            }
            if (tokens[0] === 'ItemShooter_SetItems') {
                this.setItemShooterItems(tokens.slice(1));
                break;
            }
        }
    };

    Game_Interpreter.prototype.startItemShooterGame = function(args) {
        var options = {};
        var lastKey = null;
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg.indexOf(':') > -1) {
                var parts = arg.split(':');
                lastKey = parts[0].toLowerCase();
                options[lastKey] = parts.slice(1).join(':');
            } else if (lastKey === 'introtext') {
                // 띄어쓰기가 들어간 문구는 이어붙임
                options[lastKey] += ' ' + arg;
            }
        }

        var game = new Game_ItemShooter();
        game.callerInterpreter = this; // 종료 시 호출 이벤트의 뒤쪽 명령을 건너뛰기 위해 기억
        game.callerList = this._list;
        game.continueAfter = false;

        if (options.switch) game.switchId = parseInt(options.switch);
        if (options.variable) game.variableId = parseInt(options.variable);
        if (options.variable2) game.variable2Id = parseInt(options.variable2);
        if (options.hitscore) game.hitScore = parseInt(options.hitscore);
        if (options.misshp !== undefined) game.missHP = parseInt(options.misshp) || 0;
        if (options.floorhp !== undefined) game.floorHP = parseInt(options.floorhp) || 0;
        if (options.healthmax) {
            game.healthMax = parseInt(options.healthmax);
            game.health = game.healthMax;
        }
        if (options.targetscore) game.targetScore = parseInt(options.targetscore);
        if (options.successevent) game.successEventId = parseInt(options.successevent);
        if (options.failevent) game.failEventId = parseInt(options.failevent);
        if (options.introtext) game.introText = options.introtext;
        if (options.backgroundimage) game.backgroundImage = options.backgroundimage.trim().replace(/\.png$/i, '');
        if (options.bgm !== undefined) game.bgm = cleanAudioName(options.bgm);
        if (options.bgmvolume) game.bgmVolume = parseInt(options.bgmvolume);
        if (options.continue !== undefined) game.continueAfter = /^(true|on|1)$/i.test(options.continue.trim());
        if (options.showhitbox !== undefined) game.showHitbox = /^(true|on|1)$/i.test(options.showhitbox.trim());
        if (options.spawninterval) {
            game.spawnInterval = parseInt(options.spawninterval);
            game.nextSpawnTime = game.spawnInterval;
        }

        window.$itemShooterGameData = game;
        console.log('[ItemShooter] 시작 / 아이템:', $itemShooterDB.join(', '),
            '/ 목표점수:', game.targetScore, '/ 배경:', game.backgroundImage || '(기본)');
        SceneManager.push(Scene_ItemShooter);
    };

    Game_Interpreter.prototype.setItemShooterItems = function(args) {
        var list = namesFromTokens(args);
        if (list.length > 0) {
            $itemShooterDB = list;
        }
    };

    window.Scene_ItemShooter = Scene_ItemShooter;
    window.Game_ItemShooter = Game_ItemShooter;

})();
