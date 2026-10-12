//=============================================================================
// ActorTurnBanner.js
//=============================================================================

/*~struct~ActorTurnImage:
 * @param actorId
 * @text 액터
 * @type actor
 * @default 0
 *
 * @param image
 * @text 캐릭터 그림
 * @type text
 * @default
 * @desc 이 액터의 턴일 때 나올 캐릭터 그림 파일명 (확장자 제외)
 *
 * @param textImage
 * @text 글자 그림 (선택)
 * @type text
 * @default
 * @desc 비워두면 기본 글자 그림을 사용합니다.
 */

/*~struct~FaceTurnImage:
 * @param faceName
 * @text 얼굴 파일명
 * @type text
 * @default
 * @desc 액터의 "현재" 얼굴 파일명 (확장자 제외). 이벤트의 액터 이미지
 * 변경으로 얼굴이 바뀌면 그 얼굴 기준으로 매칭됩니다.
 *
 * @param faceIndex
 * @text 얼굴 인덱스 (선택)
 * @type text
 * @default
 * @desc 비워두면 파일명만 같으면 매칭됩니다. (0부터 시작)
 *
 * @param image
 * @text 캐릭터 그림
 * @type text
 * @default
 *
 * @param textImage
 * @text 글자 그림 (선택)
 * @type text
 * @default
 * @desc 비워두면 기본 글자 그림을 사용합니다.
 */

/*:
 * @plugindesc 라운드가 시작될 때마다 1회, 파티원을 1→2→3→4→1... 순서로
 * 돌아가며 그 액터의 캐릭터 그림과 글자 그림이 반대 방향으로 흐르며
 * 등장하고 효과음이 나오는 연출을 재생합니다.
 * @author ㄹㅅㅁ
 *
 * @param Image Folder
 * @text 이미지 폴더
 * @desc img/pictures 안의 하위 폴더명. 비워두면 img/pictures 바로 아래.
 * @default yourturn
 *
 * @param Disable Switch
 * @text 비활성화 스위치
 * @type switch
 * @default 0
 * @desc 이 스위치가 켜져 있으면 연출이 나오지 않습니다.
 *
 * @param --캐릭터 그림--
 * @default
 *
 * @param Default Character Image
 * @text 기본 캐릭터 그림
 * @type text
 * @default
 * @desc 아래 목록에 해당하는 액터가 없을 때 쓸 그림. 비워두면 캐릭터
 * 그림은 생략하고 글자만 나옵니다.
 *
 * @param Face Images
 * @text 얼굴별 목록
 * @type struct<FaceTurnImage>[]
 * @default []
 * @desc 액터의 현재 얼굴 기준 매칭 (가장 우선).
 *
 * @param Actor Images
 * @text 액터별 목록
 * @type struct<ActorTurnImage>[]
 * @default []
 * @desc 얼굴 매칭이 없을 때 액터 ID 기준으로 매칭.
 *
 * @param Character Height Rate
 * @text 캐릭터 세로 크기 비율
 * @type number
 * @decimals 2
 * @default 1.0
 * @desc 캐릭터 그림 세로 길이를 화면 세로의 몇 %로 맞출지 (0~1).
 * 1이면 화면 높이에 꽉 맞춥니다. 1보다 크게(예: 1.2) 해도 됩니다.
 * 캐릭터는 화면 아래쪽에 붙어서 위로 커집니다.
 *
 * @param Character X Offset
 * @text 캐릭터 X위치 조정
 * @type text
 * @default 0
 *
 * @param Character Y Offset
 * @text 캐릭터 Y위치 조정
 * @type text
 * @default 0
 * @desc 양수면 아래, 음수면 위로 이동 (px). 캐릭터는 화면 아래
 * 끝이 기준입니다.
 *
 * @param --글자 그림--
 * @default
 *
 * @param Default Text Image
 * @text 기본 글자 그림
 * @type text
 * @default 니턴
 * @desc "니턴" 같은 글자 그림. 비워두면 글자는 생략합니다.
 *
 * @param Text Height Rate
 * @text 글자 세로 크기 비율
 * @type number
 * @decimals 2
 * @default 0.3
 * @desc 글자 그림 세로 길이를 화면 세로의 몇 %로 맞출지 (0~1).
 * 가로가 화면보다 넓으면 자동으로 줄입니다.
 *
 * @param Text X Offset
 * @text 글자 X위치 조정
 * @type text
 * @default 0
 *
 * @param Text Y Offset
 * @text 글자 Y위치 조정
 * @type text
 * @default 0
 *
 * @param --움직임--
 * @default
 *
 * @param Base Y
 * @text 기준 Y좌표 비율
 * @type number
 * @decimals 2
 * @default 0.5
 *
 * @param Slide Distance
 * @text 등장 이동 거리
 * @type number
 * @default 160
 * @desc 등장할 때 이동하는 거리(px). 캐릭터는 왼쪽→오른쪽,
 * 글자는 오른쪽→왼쪽으로 흐릅니다. 퇴장 때도 같은 거리만큼 더 흘러갑니다.
 *
 * @param Drift Distance
 * @text 대기 중 흔들림 거리
 * @type number
 * @default 20
 * @desc 중앙에서 대기하는 동안 같은 방향으로 천천히 이동하는 거리(px)
 *
 * @param Enter Frames
 * @text 등장 프레임
 * @type number
 * @default 12
 *
 * @param Hold Frames
 * @text 대기 프레임
 * @type number
 * @default 30
 *
 * @param Exit Frames
 * @text 퇴장 프레임
 * @type number
 * @default 12
 *
 * @param --효과음--
 * @default
 *
 * @param SE Name
 * @text 효과음
 * @type file
 * @dir audio/se
 * @default
 * @desc 연출이 시작될 때 재생 (비워두면 재생 안 함)
 *
 * @param SE Volume
 * @type number
 * @default 90
 *
 * @param SE Pitch
 * @type number
 * @default 100
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 1. 그림 파일을 img/pictures/(이미지 폴더 값, 기본 yourturn) 안에 넣으세요.
 *    예) img/pictures/yourturn/니턴.png
 * 2. 파라미터에는 확장자를 뺀 파일명을 텍스트로 직접 입력하세요.
 *    (MV 파일 선택 버튼은 하위 폴더를 인식하지 못함)
 * 3. 라운드가 시작될 때마다 1회 재생됩니다. 파티 순서(전투 멤버 순서)대로
 *    1번째 → 2번째 → 3번째 → 4번째 → 다시 1번째... 한 명씩 돌아가며
 *    그 액터에 연결된 그림이 나옵니다. 전투불능인 파티원은 건너뛰고,
 *    새 전투는 항상 1번째 파티원부터 시작합니다.
 *
 * 크기: 그림은 화면 세로 길이에 맞춰 자동 조절됩니다 (원본 크기와 무관).
 *   캐릭터 세로 크기 비율 1.0 = 화면 높이에 꽉 맞춤, 글자는 기본 0.3.
 *
 * 연출
 *   - 캐릭터 그림: 왼쪽에서 페이드인하며 들어와 → 오른쪽으로 천천히 흐르다
 *     → 같은 방향으로 페이드아웃
 *   - 글자 그림 : 오른쪽에서 페이드인하며 들어와 → 왼쪽으로 천천히 흐르다
 *     → 같은 방향으로 페이드아웃
 *   - 시작과 동시에 효과음 재생
 *
 * 캐릭터 그림 결정 순서
 *   얼굴별 목록 → 액터별 목록 → 기본 캐릭터 그림 (없으면 생략)
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleEngineCore 및 SkipPartyCommand.js보다 아래에 두세요.
 * 기존 YourTurnBanner.js와 같은 시점에 나오므로 함께 켜면 둘 다 나옵니다.
 * 하나만 쓰고 싶다면 다른 쪽을 꺼주세요.
 */

var Imported = Imported || {};
Imported.ActorTurnBanner = true;

var ATN = ATN || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('ActorTurnBanner');

    ATN.imageFolder   = String(parameters['Image Folder'] || '').trim();
    ATN.disableSwitch = Number(parameters['Disable Switch'] || 0);

    ATN.defaultCharImage = String(parameters['Default Character Image'] || '').trim();
    ATN.charHeightRate = Number(parameters['Character Height Rate'] || 1.0);
    ATN.charXOffset   = Number(parameters['Character X Offset'] || 0);
    ATN.charYOffset   = Number(parameters['Character Y Offset'] || 0);

    ATN.defaultTextImage = String(parameters['Default Text Image'] || '').trim();
    ATN.textHeightRate = Number(parameters['Text Height Rate'] || 0.3);
    ATN.textXOffset   = Number(parameters['Text X Offset'] || 0);
    ATN.textYOffset   = Number(parameters['Text Y Offset'] || 0);

    ATN.baseYRate     = Number(parameters['Base Y'] || 0.5);
    ATN.slideDistance = Number(parameters['Slide Distance'] || 160);
    ATN.driftDistance = Number(parameters['Drift Distance'] || 20);
    ATN.enterFrames   = Number(parameters['Enter Frames'] || 12);
    ATN.holdFrames    = Number(parameters['Hold Frames'] || 30);
    ATN.exitFrames    = Number(parameters['Exit Frames'] || 12);

    ATN.seName   = String(parameters['SE Name'] || '');
    ATN.seVolume = Number(parameters['SE Volume'] || 90);
    ATN.sePitch  = Number(parameters['SE Pitch'] || 100);

    ATN.rotation = 0;    // 다음에 보여줄 파티 순번 (0 = 1번째 파티원)

    //=========================================================================
    // struct 배열 파싱
    //=========================================================================
    function parseStructArray(raw) {
        var list = [];
        if (!raw) return list;
        var arr;
        try {
            arr = JSON.parse(raw);
        } catch (e) {
            console.warn('[ActorTurnBanner] 목록 파라미터 파싱 실패: ' + raw);
            return list;
        }
        for (var i = 0; i < arr.length; i++) {
            try { list.push(JSON.parse(arr[i])); } catch (e2) { /* 건너뜀 */ }
        }
        return list;
    }

    // actorId -> { image, textImage }
    ATN.actorMap = {};
    parseStructArray(parameters['Actor Images']).forEach(function(e) {
        var id = Number(e.actorId || 0);
        if (id > 0) {
            ATN.actorMap[id] = {
                image: String(e.image || '').trim(),
                textImage: String(e.textImage || '').trim()
            };
        }
    });

    // 얼굴 매칭: 인덱스 지정 항목은 faceMap, 비워둔 항목은 faceNameMap
    ATN.faceMap = {};
    ATN.faceNameMap = {};
    parseStructArray(parameters['Face Images']).forEach(function(e) {
        var name = String(e.faceName || '').trim();
        if (!name) return;
        var entry = {
            image: String(e.image || '').trim(),
            textImage: String(e.textImage || '').trim()
        };
        var idxRaw = String(e.faceIndex || '').trim();
        if (idxRaw === '') {
            ATN.faceNameMap[name] = entry;
        } else {
            ATN.faceMap[name + ':' + Number(idxRaw)] = entry;
        }
    });

    //=========================================================================
    // 이미지 로드 / 선택
    //=========================================================================
    ATN.loadPicture = function(imageName) {
        var folder = 'img/pictures/';
        if (ATN.imageFolder) folder += ATN.imageFolder + '/';
        var bitmap = ImageManager.loadBitmap(folder, imageName, 0, true);
        bitmap.addLoadListener(function() {
            if (bitmap.width === 0 || bitmap.height === 0) {
                console.warn('[ActorTurnBanner] 이미지 로드 실패 또는 크기 0: ' +
                    folder + imageName);
            }
        });
        return bitmap;
    };

    // 액터에 맞는 { char, text } 결정
    ATN.decideImages = function(actor) {
        var entry = ATN.faceMap[actor.faceName() + ':' + actor.faceIndex()] ||
                    ATN.faceNameMap[actor.faceName()] ||
                    ATN.actorMap[actor.actorId()] || null;
        var charImg = (entry && entry.image) || ATN.defaultCharImage;
        var textImg = (entry && entry.textImage) || ATN.defaultTextImage;
        return { char: charImg, text: textImg };
    };

    //=========================================================================
    // Easing
    //=========================================================================
    function easeOutCubic(t) { var f = t - 1; return f * f * f + 1; }
    function easeInCubic(t) { return t * t * t; }

    //=========================================================================
    // Sprite_ATNPiece : 한 장의 그림 (dir: +1 = 오른쪽으로 흐름, -1 = 왼쪽)
    //=========================================================================
    function Sprite_ATNPiece() {
        this.initialize.apply(this, arguments);
    }
    Sprite_ATNPiece.prototype = Object.create(Sprite.prototype);
    Sprite_ATNPiece.prototype.constructor = Sprite_ATNPiece;

    Sprite_ATNPiece.prototype.initialize = function(imageName, dir, heightRate, xOffset, yOffset, isChar) {
        Sprite.prototype.initialize.call(this);
        this.bitmap = ATN.loadPicture(imageName);
        this._isChar = !!isChar;
        this.anchor.x = 0.5;
        // 캐릭터는 화면 아래쪽에 붙이고(아래 기준), 글자는 중앙 기준
        this.anchor.y = this._isChar ? 1 : 0.5;
        this._dir = dir;
        this._heightRate = heightRate;
        this._baseX = Graphics.width / 2 + xOffset;
        this._baseY = this._isChar ?
            Graphics.height + yOffset :
            Graphics.height * ATN.baseYRate + yOffset;
        this.y = this._baseY;
        this.opacity = 0;
        this._sized = false;
    };

    Sprite_ATNPiece.prototype.isLoaded = function() {
        return this.bitmap.isReady() ||
            (this.bitmap.isError && this.bitmap.isError());
    };

    Sprite_ATNPiece.prototype.setup = function() {
        if (this._sized) return;
        var bw = this.bitmap.width, bh = this.bitmap.height;
        var scale = 1;
        if (bw > 0 && bh > 0) {
            // 세로 기준으로 맞춤. 글자만 가로가 화면을 넘지 않게 제한하고,
            // 캐릭터는 가로 제한 없이 세로 기준으로만 키움
            scale = (Graphics.height * this._heightRate) / bh;
            if (!this._isChar) scale = Math.min(scale, Graphics.width / bw);
        }
        this.scale.x = scale;
        this.scale.y = scale;
        this.x = this._baseX - this._dir * ATN.slideDistance;
        this._sized = true;
    };

    Sprite_ATNPiece.prototype.applyEnter = function(t) {
        var e = easeOutCubic(t);
        this.x = this._baseX - this._dir * ATN.slideDistance * (1 - e);
        this.opacity = Math.round(255 * t);
    };

    Sprite_ATNPiece.prototype.applyHold = function(t) {
        this.x = this._baseX + this._dir * ATN.driftDistance * t;
        this.opacity = 255;
    };

    Sprite_ATNPiece.prototype.applyExit = function(t) {
        var e = easeInCubic(t);
        this.x = this._baseX + this._dir *
            (ATN.driftDistance + ATN.slideDistance * e);
        this.opacity = Math.round(255 * (1 - t));
    };

    //=========================================================================
    // Sprite_ActorTurnBanner : 캐릭터 + 글자를 묶어 진행하는 컨트롤러
    //=========================================================================
    function Sprite_ActorTurnBanner() {
        this.initialize.apply(this, arguments);
    }
    Sprite_ActorTurnBanner.prototype = Object.create(Sprite.prototype);
    Sprite_ActorTurnBanner.prototype.constructor = Sprite_ActorTurnBanner;

    Sprite_ActorTurnBanner.prototype.initialize = function(actor) {
        Sprite.prototype.initialize.call(this);
        this._pieces = [];
        this._phase = 'load';
        this._count = 0;
        this._finished = false;

        var imgs = ATN.decideImages(actor);
        if (imgs.char) {
            this._addPiece(new Sprite_ATNPiece(imgs.char, 1, ATN.charHeightRate,
                ATN.charXOffset, ATN.charYOffset, true));
        }
        // 글자는 나중에 추가해서 캐릭터보다 위에 그려지게 함
        if (imgs.text) {
            this._addPiece(new Sprite_ATNPiece(imgs.text, -1, ATN.textHeightRate,
                ATN.textXOffset, ATN.textYOffset));
        }
        if (this._pieces.length === 0) this._finished = true;
    };

    Sprite_ActorTurnBanner.prototype._addPiece = function(piece) {
        this.addChild(piece);
        this._pieces.push(piece);
    };

    Sprite_ActorTurnBanner.prototype.isFinished = function() {
        return this._finished;
    };

    Sprite_ActorTurnBanner.prototype._allLoaded = function() {
        for (var i = 0; i < this._pieces.length; i++) {
            if (!this._pieces[i].isLoaded()) return false;
        }
        return true;
    };

    Sprite_ActorTurnBanner.prototype._apply = function(method, t) {
        for (var i = 0; i < this._pieces.length; i++) {
            this._pieces[i][method](t);
        }
    };

    Sprite_ActorTurnBanner.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._finished) return;

        if (this._phase === 'load') {
            if (!this._allLoaded()) return;
            for (var i = 0; i < this._pieces.length; i++) this._pieces[i].setup();
            if (ATN.seName) {
                AudioManager.playSe({
                    name: ATN.seName, volume: ATN.seVolume,
                    pitch: ATN.sePitch, pan: 0
                });
            }
            this._phase = 'enter';
            this._count = 0;
            this._apply('applyEnter', 0);
            return;
        }

        this._count++;
        switch (this._phase) {
        case 'enter':
            var t1 = Math.min(this._count / Math.max(ATN.enterFrames, 1), 1);
            this._apply('applyEnter', t1);
            if (t1 >= 1) { this._phase = 'hold'; this._count = 0; }
            break;
        case 'hold':
            var t2 = Math.min(this._count / Math.max(ATN.holdFrames, 1), 1);
            this._apply('applyHold', t2);
            if (t2 >= 1) { this._phase = 'exit'; this._count = 0; }
            break;
        case 'exit':
            var t3 = Math.min(this._count / Math.max(ATN.exitFrames, 1), 1);
            this._apply('applyExit', t3);
            if (t3 >= 1) this._finished = true;
            break;
        }
    };

    //=========================================================================
    // 이번 라운드에 보여줄 액터 선택: 파티 순서대로 1 2 3 4 1 2 3 4 ...
    // 전투불능(또는 빈 자리)이면 건너뛰고 다음 파티원으로 넘어갑니다.
    //=========================================================================
    ATN.pickActor = function() {
        var members = $gameParty.battleMembers();
        var n = members.length;
        for (var i = 0; i < n; i++) {
            var idx = (ATN.rotation + i) % n;
            var actor = members[idx];
            if (actor && actor.isAlive()) {
                ATN.rotation = idx + 1;
                return actor;
            }
        }
        return null;
    };

    //=========================================================================
    // Scene_Battle
    //=========================================================================
    var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _Scene_Battle_createDisplayObjects.call(this);
        ATN.rotation = 0;          // 새 전투는 항상 1번째 파티원부터
        this._atnTurnCount = -1;
        this._atnSprite = null;
    };

    // 라운드가 시작되어 아군 커맨드 입력 단계로 넘어올 때 1회 재생
    // (YourTurnBanner.js와 같은 시점)
    var _Scene_Battle_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        _Scene_Battle_startPartyCommandSelection.call(this);
        if (ATN.disableSwitch > 0 && $gameSwitches.value(ATN.disableSwitch)) return;
        var turnCount = $gameTroop.turnCount();
        if (this._atnTurnCount === turnCount) return; // 같은 라운드 중복 방지
        this._atnTurnCount = turnCount;
        this.startActorTurnBanner();
    };

    Scene_Battle.prototype.startActorTurnBanner = function() {
        var actor = ATN.pickActor();
        if (!actor) return;
        if (this._atnSprite) this.removeChild(this._atnSprite);
        this._atnSprite = new Sprite_ActorTurnBanner(actor);
        this.addChild(this._atnSprite);
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        if (this._atnSprite) {
            // 다른 스프라이트/창에 가려지지 않도록 최상단 유지
            this.addChild(this._atnSprite);
            if (this._atnSprite.isFinished()) {
                this.removeChild(this._atnSprite);
                this._atnSprite = null;
            }
        }
    };

})();
