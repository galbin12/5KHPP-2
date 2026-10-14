//=============================================================================
// BattleSlotIntro.js
//=============================================================================

/*:
 * @plugindesc 전투 진입 전, 슬롯머신처럼 캐릭터 얼굴이 쭈르륵 돌다가 전투 파티원 1~4가
 * 차례로 멈춘 뒤 전투가 시작되는 연출. 릴 회전음 / 멈출 때 띠링 효과음 지원.
 * @author Claude
 *
 * @param Enable Switch
 * @desc 이 스위치가 ON일 때만 연출을 재생합니다. 0이면 항상 재생.
 * @type switch
 * @default 0
 *
 * @param Reel Actor IDs
 * @desc 릴에서 돌아갈 액터 ID 목록 (쉼표로 구분, 예: 1,2,3,4,5,6,7,8,9,10,11,12).
 * 비워두면 데이터베이스의 이름이 있는 모든 액터(얼굴이 있는 액터)가 돕니다.
 * @default
 *
 * @param Reel Width
 * @desc 릴 한 칸의 가로(px). 0이면 화면 폭의 92%를 4칸으로 나눈 크기.
 * @type number
 * @min 0
 * @default 0
 *
 * @param Reel Height
 * @desc 릴 한 칸의 세로(px). 0이면 가로의 1.25배.
 * @type number
 * @min 0
 * @default 0
 *
 * @param Face Padding
 * @desc 칸 안쪽 여백(px). 얼굴은 이 여백을 뺀 칸에 맞춰 네 칸 모두 같은 배율로 그려집니다.
 * @type number
 * @min 0
 * @default 14
 *
 * @param Smooth Faces
 * @desc 얼굴을 키울 때 부드럽게 보정할지 여부. 도트 느낌을 살리려면 false.
 * @type boolean
 * @default true
 *
 * @param Actor Images
 * @desc 액터별로 직접 그린 그림 (img/slot 폴더). 지정한 액터는 얼굴 대신 이 그림이 칸에 들어갑니다. 지정 안 한 액터는 얼굴을 씁니다.
 * @type struct<SlotImage>[]
 * @default []
 *
 * @param Image Padding
 * @desc 직접 그린 그림의 칸 안쪽 여백(px). 0이면 칸(기본 187x234)에 꽉 맞춥니다.
 * @type number
 * @min 0
 * @default 0
 *
 * @param Spin Speed
 * @desc 릴이 도는 속도 (프레임당 px).
 * @type number
 * @min 1
 * @default 34
 *
 * @param First Stop Delay
 * @desc 연출 시작 후 첫 번째 릴이 멈추기 시작하는 프레임. (60프레임 = 1초)
 * @type number
 * @min 12
 * @default 45
 *
 * @param Stop Interval
 * @desc 릴과 릴 사이 멈추기 시작하는 간격(프레임).
 * @type number
 * @min 14
 * @default 32
 *
 * @param Slow Cells
 * @desc 멈추기 시작한 뒤 최소 몇 칸을 더 굴러가며 감속할지.
 * @type number
 * @decimals 1
 * @min 1
 * @default 2
 *
 * @param Hold Frames
 * @desc 네 칸이 모두 멈춘 뒤 전투로 넘어가기 전 잠깐 보여주는 프레임.
 * @type number
 * @min 0
 * @default 40
 *
 * @param Fade Frames
 * @desc 연출이 사라지며 전투 화면이 드러나는 프레임.
 * @type number
 * @min 1
 * @default 24
 *
 * @param Backdrop Opacity
 * @desc 슬롯 뒤 화면을 어둡게 하는 정도 (0~1).
 * @type number
 * @decimals 2
 * @min 0
 * @max 1
 * @default 0.65
 *
 * @param Frame Color
 * @desc 바깥 테두리 색 (#rrggbb)
 * @default #d4a020
 *
 * @param Frame Width
 * @desc 바깥 테두리 굵기(px)
 * @type number
 * @min 0
 * @default 8
 *
 * @param Reel Color
 * @desc 릴 배경색 (#rrggbb)
 * @default #f6f1de
 *
 * @param Divider Color
 * @desc 릴 사이 구분선 색 (#rrggbb)
 * @default #3a3a3a
 *
 * @param Spin SE
 * @desc 릴이 돌아갈 때 나는 효과음 (audio/se). 비우면 없음.
 * @type file
 * @dir audio/se/
 * @require 1
 * @default Cursor1
 *
 * @param Spin SE Interval
 * @desc 릴 회전음을 반복 재생하는 간격(프레임). 0이면 시작할 때 한 번만 재생.
 * (회전음 파일이 길면 0으로 두세요)
 * @type number
 * @min 0
 * @default 7
 *
 * @param Ding SE
 * @desc 릴이 하나씩 멈출 때마다 나는 "띠링" 효과음 (audio/se). 비우면 없음.
 * @type file
 * @dir audio/se/
 * @require 1
 * @default Bell3
 *
 * @param SE Volume
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * 전투가 시작되기 직전에
 *   1) 화면 가운데에 슬롯머신(칸 1~4)이 나타나 릴마다 캐릭터 얼굴이
 *      위에서 아래로 쭈르륵 돌아가고 (회전음)
 *   2) 1번 → 2번 → 3번 → 4번 칸 순서로 전투 파티원의 얼굴에서 하나씩 멈추며
 *      (멈출 때마다 "띠링")
 *   3) 네 칸이 모두 멈추면 잠깐 보여준 뒤 전투가 시작됩니다.
 *
 * - 각 칸에 멈추는 얼굴은 전투 파티원 순서(1~4번째)입니다.
 *   파티원이 4명보다 적으면 그 인원 수만큼만 칸이 나옵니다.
 * - 얼굴은 액터의 "현재 얼굴"(이벤트로 바꾼 얼굴 포함)을 씁니다.
 * - 네 칸 모두 같은 크기(같은 배율)로 얼굴을 그립니다.
 *
 * ============================================================================
 * 효과음
 * ============================================================================
 * Spin SE : 릴이 도는 동안 반복해서 납니다 (Spin SE Interval 프레임마다).
 * Ding SE : 릴이 하나 멈출 때마다 납니다.
 * 기본값(Cursor1 / Bell3)이 없으면 소리 없이 진행됩니다. audio/se 에 넣어 둔
 * 슬롯머신 소리로 바꿔 주세요. (.ogg/.m4a 한 쌍)
 *
 * ============================================================================
 * 다른 연출과 함께 쓸 때
 * ============================================================================
 * - 이 플러그인은 BattleManager.startBattle 을 뒤로 미루는 방식이라
 *   BattleShatterIntro 와 같이 켜도 됩니다.
 *     · 이 플러그인을 BattleShatterIntro 아래에 두면: 슬롯 → 깨짐 순서
 *     · 위에 두면: 깨짐 → 슬롯 순서
 * - YEP 계열보다 아래, BattleIntroHide 보다 아래에 두세요.
 * - BattleIntroHide 의 Auto Hide On Battle Start 가 true 면 연출이 끝난 직후
 *   다시 숨겨지고 턴 0 이벤트의 "BattleIntroHide show" 를 기다립니다.
 * - 파일 이름은 반드시 BattleSlotIntro.js 여야 합니다.
 *
 * ============================================================================
 * 직접 그린 그림 넣기
 * ============================================================================
 * 1) 그림 파일(png)을 게임 폴더의 img/slot/ 에 넣으세요. (폴더가 없으면 만드세요)
 * 2) Actor Images 에서 액터와 그림 파일을 짝지어 주세요.
 *    - 짝지은 액터는 얼굴 대신 그 그림이 칸에 들어가고, 나머지는 얼굴을 씁니다.
 * - 배율: 그림은 비율을 유지한 채 (칸 크기 - Image Padding)에 맞춰 줄이거나 늘립니다.
 *   화면 816x624 기준 칸이 187x234px 이므로, 그 크기로 그리면 1배로 들어갑니다.
 *   네 칸 모두 같은 규칙입니다.
 * - 칸 크기를 바꾸고 싶으면 Reel Width / Reel Height 를 조절하세요.
 * - 배포(Deployment) 때 "사용하지 않는 파일 제외"를 켜면 img/slot 의 그림이
 *   빠질 수 있으니, 그 옵션은 끄거나 파일을 따로 넣어 주세요.
 *
 * 이용 약관: 자유롭게 수정 및 사용 가능합니다.
 */

/*~struct~SlotImage:
 * @param Actor ID
 * @desc 이 액터가 칸에 나올 때 쓸 그림.
 * @type actor
 * @default 0
 *
 * @param Image Name
 * @desc img/slot 폴더의 그림 파일.
 * @type file
 * @dir img/slot/
 * @require 1
 * @default
 */

var Imported = Imported || {};
Imported.BattleSlotIntro = true;

(function() {
    'use strict';

    var P = PluginManager.parameters('BattleSlotIntro');

    function num(key, def) {
        var v = P[key];
        if (v === undefined || v === '') return def;
        v = Number(v);
        return isNaN(v) ? def : v;
    }
    function bool(key, def) {
        var v = P[key];
        if (v === undefined || v === '') return def;
        return String(v).toLowerCase() === 'true';
    }
    function str(key, def) {
        var v = P[key];
        return (v === undefined) ? def : String(v);
    }

    var enableSwitch   = num('Enable Switch', 0);
    var reelIds        = str('Reel Actor IDs', '').split(/[\s,]+/).map(Number)
                            .filter(function(n) { return n > 0; });
    var reelWidthParam = num('Reel Width', 0);
    var reelHeightParam = num('Reel Height', 0);
    var facePad        = num('Face Padding', 14);
    var smoothFaces    = bool('Smooth Faces', true);
    var imgPad         = num('Image Padding', 0);
    var slotFolder     = 'img/slot/';
    var imageMap       = {}; // 액터ID → img/slot 안의 그림 이름
    (function() {
        var arr;
        try { arr = JSON.parse(P['Actor Images'] || '[]'); } catch (e) { arr = []; }
        arr.forEach(function(s) {
            try {
                var e = JSON.parse(s);
                var id = Number(e['Actor ID'] || 0);
                var nm = String(e['Image Name'] || '').trim();
                if (id > 0 && nm) imageMap[id] = nm;
            } catch (e2) { /* 깨진 항목은 건너뜀 */ }
        });
    })();
    var spinSpeed      = Math.max(1, num('Spin Speed', 34));
    var firstStop      = Math.max(12, Math.floor(num('First Stop Delay', 45)));
    var stopInterval   = Math.max(14, Math.floor(num('Stop Interval', 32)));
    var slowCells      = Math.max(1, num('Slow Cells', 2));
    var holdFrames     = Math.max(0, Math.floor(num('Hold Frames', 40)));
    var fadeFrames     = Math.max(1, Math.floor(num('Fade Frames', 24)));
    var backdropOpacity = Math.max(0, Math.min(1, num('Backdrop Opacity', 0.65)));
    var frameColor     = str('Frame Color', '#d4a020');
    var frameWidth     = Math.max(0, Math.floor(num('Frame Width', 8)));
    var reelColor      = str('Reel Color', '#f6f1de');
    var dividerColor   = str('Divider Color', '#3a3a3a');
    var spinSe         = str('Spin SE', 'Cursor1');
    var spinSeInterval = Math.max(0, Math.floor(num('Spin SE Interval', 7)));
    var dingSe         = str('Ding SE', 'Bell3');
    var seVolume       = num('SE Volume', 90);

    //=========================================================================
    // 릴 계산 (순수 함수)
    //=========================================================================

    //<math>
    // 릴 스크롤량 p → 띠 이미지에서 잘라 쓸 y좌표. p가 늘수록 얼굴이 아래로 흐름.
    function frameYFor(p, total) {
        var m = p % total;
        if (m < 0) m += total;
        return (total - m) % total;
    }
    // 현재 스크롤량 p에서 멈출 계획: 최소 minDist 이상 더 굴러간 뒤 "칸 경계"에 정지.
    // 멈출 칸(row)은 띠에서 아직 화면에 안 보이는 자리라, 거기에 목표 얼굴을 끼워 넣는다.
    // → 어느 릴이든 굴러가는 거리가 minDist ~ minDist+cellH 로 거의 일정하다.
    function planStop(p, cellH, total, minDist, speed) {
        var pT = Math.ceil((p + minDist) / cellH) * cellH;
        var d = pT - p;
        var T = Math.max(12, Math.round(2 * d / speed));
        var row = Math.round(frameYFor(pT, total) / cellH) % (total / cellH);
        return { pT: pT, d: d, T: T, row: row };
    }
    //</math>

    //=========================================================================
    // 유틸
    //=========================================================================

    function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

    function playSe(name) {
        if (!name) return;
        AudioManager.playSe({ name: name, volume: seVolume, pitch: 100, pan: 0 });
    }

    function introHideActive() {
        return !!(window.RS && RS.BattleIntroHide && RS.BattleIntroHide.isHidden &&
            RS.BattleIntroHide.isHidden());
    }

    function shouldPlay() {
        if (enableSwitch > 0 && !$gameSwitches.value(enableSwitch)) return false;
        return $gameParty.battleMembers().length > 0;
    }

    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    // 릴에서 돌아갈 후보 목록 (+ 전투 파티원은 반드시 포함)
    function buildItems(members) {
        var items = [], seen = {};
        function add(id, faceName, faceIndex, name) {
            if (seen[id]) return;
            seen[id] = true;
            items.push({ id: id, faceName: faceName || '', faceIndex: faceIndex || 0, name: name || '',
                         image: imageMap[id] || '' });
        }
        var ids = reelIds.slice();
        if (ids.length === 0) {
            for (var i = 1; i < $dataActors.length; i++) {
                if ($dataActors[i] && $dataActors[i].name) ids.push(i);
            }
        }
        ids.forEach(function(id) {
            var d = $dataActors[id];
            if (!d) return;
            var ga = $gameActors._data[id];
            var fn = ga ? ga.faceName() : d.faceName;
            var fi = ga ? ga.faceIndex() : d.faceIndex;
            if (fn || imageMap[id]) add(id, fn, fi, ga ? ga.name() : d.name);
        });
        members.forEach(function(m) {
            add(m.actorId(), m.faceName(), m.faceIndex(), m.name());
        });
        return items;
    }

    //=========================================================================
    // BattleManager - 전투 시작을 연출 뒤로 미룸
    //=========================================================================

    var _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function(troopId, canEscape, canLose) {
        _BattleManager_setup.apply(this, arguments);
        this._slotPending = false;
        this._slotHide = false;
        this._slotPlayed = false;
    };

    var _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        if (!this._slotPlayed && shouldPlay()) {
            this._slotPlayed = true;
            this._slotPending = true;
            this._slotHide = true;
            return; // 연출이 끝나는 시점에 releaseSlotIntro()에서 실제 시작
        }
        _BattleManager_startBattle.call(this);
    };

    BattleManager.releaseSlotIntro = function() {
        if (!this._slotPending) return;
        this._slotPending = false;
        this._slotHide = false;
        _BattleManager_startBattle.call(this);
    };

    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        this._slotPending = false;
        this._slotHide = false;
        _BattleManager_endBattle.call(this, result);
    };

    //=========================================================================
    // Spriteset_Battle / Scene_Battle - 연출 중 적/아군/윈도우 숨김
    //=========================================================================

    var _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        _Spriteset_Battle_update.call(this);
        if (BattleManager._slotHide) {
            var i;
            if (this._enemySprites) {
                for (i = 0; i < this._enemySprites.length; i++) this._enemySprites[i].visible = false;
            }
            if (this._actorSprites) {
                for (i = 0; i < this._actorSprites.length; i++) this._actorSprites[i].visible = false;
            }
        }
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this.updateSlotIntro();
    };

    Scene_Battle.prototype.updateSlotIntro = function() {
        if (BattleManager._slotPending && !this._slotIntro) {
            this._slotIntro = new SlotIntro(this);
            this.addChild(this._slotIntro); // 맨 위 레이어
        }
        var hide = BattleManager._slotHide;
        if (this._windowLayer) {
            if (hide) {
                this._windowLayer.visible = false;
                this._slotWinForced = true;
            } else if (this._slotWinForced) {
                this._slotWinForced = false;
                // 뒤이어 다른 연출(BattleShatterIntro)이 바로 숨기는 중이면 건드리지 않음
                if (!BattleManager._shatterHide) {
                    this._windowLayer.visible = !introHideActive();
                }
            }
        }
        if (this._slotIntro) {
            this._slotIntro.update();
            if (this._slotIntro.isDone()) {
                this.removeChild(this._slotIntro);
                this._slotIntro.terminate();
                this._slotIntro = null;
            }
        }
    };

    //=========================================================================
    // SlotIntro - 연출 본체
    //=========================================================================

    function SlotIntro() {
        this.initialize.apply(this, arguments);
    }
    SlotIntro.prototype = Object.create(PIXI.Container.prototype);
    SlotIntro.prototype.constructor = SlotIntro;

    SlotIntro.prototype.initialize = function(scene) {
        PIXI.Container.call(this);
        this._scene = scene;
        this._phase = 'load';
        this._t = 0;
        this._bitmaps = [];
        this._reels = [];
        this._members = $gameParty.battleMembers().slice();
        this._items = buildItems(this._members);

        // 얼굴 이미지 로드 (파일별 1회)
        var self = this;
        this._faceBitmaps = {};
        this._items.forEach(function(it) {
            if (it.faceName && !self._faceBitmaps[it.faceName]) {
                self._faceBitmaps[it.faceName] = ImageManager.loadFace(it.faceName);
            }
        });

        // 직접 그린 그림 로드 (파일별 1회)
        this._imgBitmaps = {};
        this._items.forEach(function(it) {
            if (it.image && !self._imgBitmaps[it.image]) {
                self._imgBitmaps[it.image] = ImageManager.loadBitmap(slotFolder, it.image, 0, true);
            }
        });

        var dimBmp = new Bitmap(Graphics.width, Graphics.height);
        dimBmp.fillAll('#000000');
        this._bitmaps.push(dimBmp);
        this._dim = new Sprite(dimBmp);
        this._dim.alpha = 0;
        this.addChild(this._dim);

        this._box = new PIXI.Container();
        this._box.alpha = 0;
        this.addChild(this._box);
    };

    SlotIntro.prototype.isDone = function() { return this._phase === 'done'; };

    SlotIntro.prototype.setPhase = function(p) {
        this._phase = p;
        this._t = 0;
    };

    SlotIntro.prototype.terminate = function() {
        this._bitmaps.forEach(function(b) { if (b && b.destroy) b.destroy(); });
        this._bitmaps = [];
    };

    SlotIntro.prototype.release = function() {
        BattleManager.releaseSlotIntro();
    };

    SlotIntro.prototype.update = function() {
        if (this._phase === 'done') return;
        this._t++;
        switch (this._phase) {
        case 'load': this.updateLoad(); break;
        case 'spin': this.updateSpin(); break;
        case 'hold': this.updateHold(); break;
        case 'fade': this.updateFade(); break;
        }
        this.updateFlashes();
    };

    //--- load / build ----------------------------------------------------------

    SlotIntro.prototype.updateLoad = function() {
        if (this._members.length === 0) { this.skip(); return; }
        var groups = [this._faceBitmaps, this._imgBitmaps];
        for (var g = 0; g < groups.length; g++) {
            for (var name in groups[g]) {
                var b = groups[g][name];
                if (b.isError && b.isError()) continue; // 실패한 그림은 얼굴/이름으로 대체
                if (!b.isReady()) return;
            }
        }
        if (this._scene._fadeDuration > 0) return; // 씬 페이드인이 끝난 뒤 시작
        this.build();
        this.setPhase('spin');
    };

    SlotIntro.prototype.skip = function() {
        this.release();
        this._phase = 'done';
    };

    SlotIntro.prototype.build = function() {
        var n = this._members.length;
        var slots = Math.max(4, n);
        var cw = reelWidthParam > 0 ? Math.round(reelWidthParam)
                                    : Math.floor(Graphics.width * 0.92 / slots);
        var ch = reelHeightParam > 0 ? Math.round(reelHeightParam) : Math.round(cw * 1.25);
        var boxW = cw * n, boxH = ch;
        this._cw = cw;
        this._ch = ch;
        this._box.x = Math.round((Graphics.width - boxW) / 2);
        this._box.y = Math.round((Graphics.height - boxH) / 2);

        // 릴 배경
        var bgBmp = new Bitmap(boxW, boxH);
        bgBmp.fillAll(reelColor);
        this._bitmaps.push(bgBmp);
        this._box.addChild(new Sprite(bgBmp));

        // 어둑한 그림자(릴이 돌 때 위아래가 어두워 보이게) / 번쩍임용 비트맵
        var shadeBmp = new Bitmap(cw, ch);
        var sc = shadeBmp._context;
        var g = sc.createLinearGradient(0, 0, 0, ch);
        g.addColorStop(0, 'rgba(0,0,0,0.5)');
        g.addColorStop(0.28, 'rgba(0,0,0,0)');
        g.addColorStop(0.72, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,0.5)');
        sc.fillStyle = g;
        sc.fillRect(0, 0, cw, ch);
        shadeBmp._setDirty();
        this._bitmaps.push(shadeBmp);

        var flashBmp = new Bitmap(cw, ch);
        flashBmp.fillAll('#ffffff');
        this._bitmaps.push(flashBmp);

        // 릴 만들기
        var rowH = ch;
        for (var i = 0; i < n; i++) {
            var list = shuffle(this._items.slice());
            while (list.length < 6) list = list.concat(list); // 얼굴이 너무 적으면 반복해서 채움
            var N = list.length;
            var total = N * rowH;

            var strip = new Bitmap(cw, total + rowH);
            this._bitmaps.push(strip);
            strip._context.imageSmoothingEnabled = smoothFaces;
            for (var r = 0; r <= N; r++) {
                this.drawItem(strip, list[r % N], 0, r * rowH, cw, rowH);
            }
            strip._setDirty();

            // 이 칸에 멈출 얼굴 = 전투 파티원 i+1 번째 (멈추기 시작할 때 띠에 끼워 넣음)
            var targetId = this._members[i].actorId();
            var target = this._items[0];
            for (var k = 0; k < this._items.length; k++) {
                if (this._items[k].id === targetId) { target = this._items[k]; break; }
            }

            var sp = new Sprite(strip);
            var startP = Math.floor(Math.random() * total);
            sp.x = i * cw;
            sp.setFrame(0, Math.round(frameYFor(startP, total)), cw, ch);
            this._box.addChild(sp);

            var shade = new Sprite(shadeBmp);
            shade.x = i * cw;
            this._box.addChild(shade);

            var flash = new Sprite(flashBmp);
            flash.x = i * cw;
            flash.alpha = 0;
            this._box.addChild(flash);

            this._reels.push({
                sprite: sp, shade: shade, flash: flash,
                strip: strip, N: N, target: target,
                total: total, row: 0,
                p: startP, state: 'spin', st: 0, p0: 0, pT: 0, d: 0, T: 1
            });
        }

        // 테두리 + 구분선
        var B = frameWidth;
        var ow = boxW + B * 2, oh = boxH + B * 2;
        var over = new Bitmap(ow, oh);
        if (B > 0) {
            over.fillAll(frameColor);
            over.clearRect(B, B, boxW, boxH);
        }
        for (var d = 1; d < n; d++) {
            over.fillRect(B + d * cw - 1, B, 3, boxH, dividerColor);
        }
        this._bitmaps.push(over);
        var overSp = new Sprite(over);
        overSp.x = -B;
        overSp.y = -B;
        this._box.addChild(overSp);
    };

    SlotIntro.prototype.drawItem = function(bmp, it, x, y, w, h) {
        var img = it.image ? this._imgBitmaps[it.image] : null;
        var src = it.faceName ? this._faceBitmaps[it.faceName] : null;
        if (img && img.isReady() && img.width > 0 && img.height > 0) {
            // 직접 그린 그림: 비율 유지, (칸 - 여백)에 맞춤. 모든 칸 같은 규칙.
            var iscale = Math.min((w - imgPad * 2) / img.width, (h - imgPad * 2) / img.height);
            var iw = Math.max(1, Math.round(img.width * iscale));
            var ih = Math.max(1, Math.round(img.height * iscale));
            bmp.blt(img, 0, 0, img.width, img.height,
                x + Math.round((w - iw) / 2), y + Math.round((h - ih) / 2), iw, ih);
        } else if (src && src.isReady()) {
            var pw = Window_Base._faceWidth, ph = Window_Base._faceHeight;
            var sx = (it.faceIndex % 4) * pw;
            var sy = Math.floor(it.faceIndex / 4) * ph;
            // 모든 칸이 같은 배율: 여백을 뺀 칸에 맞춰 같은 비율로 그림
            var scale = Math.min((w - facePad * 2) / pw, (h - facePad * 2) / ph);
            var dw = Math.round(pw * scale), dh = Math.round(ph * scale);
            bmp.blt(src, sx, sy, pw, ph,
                x + Math.round((w - dw) / 2), y + Math.round((h - dh) / 2), dw, dh);
        } else if (it.name) {
            // 얼굴이 없거나 못 불러왔으면 이름으로 대체
            bmp.textColor = '#222222';
            bmp.outlineWidth = 0;
            bmp.fontSize = Math.max(12, Math.round(h * 0.13));
            bmp.drawText(it.name, x, y + Math.round(h / 2 - bmp.fontSize), w, bmp.fontSize * 2, 'center');
        }
    };

    //--- spin ------------------------------------------------------------------

    SlotIntro.prototype.anySpinning = function() {
        return this._reels.some(function(r) { return r.state !== 'done'; });
    };

    SlotIntro.prototype.updateSpin = function() {
        var t = this._t;
        var ramp = clamp01(t / 12);
        var v = spinSpeed * ramp;
        var intro = clamp01(t / 10);
        this._dim.alpha = backdropOpacity * intro;
        this._box.alpha = intro;

        // 릴 회전음
        if (spinSe && this.anySpinning() &&
            (t === 1 || (spinSeInterval > 0 && t % spinSeInterval === 0))) {
            playSe(spinSe);
        }

        for (var i = 0; i < this._reels.length; i++) {
            var r = this._reels[i];
            if (r.state === 'spin') {
                r.p += v;
                if (t >= firstStop + i * stopInterval) this.beginStop(r);
                r.shade.alpha = 1;
            } else if (r.state === 'stop') {
                this.updateStopping(r);
            }
            r.sprite.setFrame(0, Math.round(frameYFor(r.p, r.total)), this._cw, this._ch);
        }

        if (!this.anySpinning()) this.setPhase('hold');
    };

    SlotIntro.prototype.beginStop = function(r) {
        var plan = planStop(r.p, this._ch, r.total, slowCells * this._ch, spinSpeed);
        // 멈출 칸(아직 화면에 안 보임: 거리 ≥ 1칸)에 목표 얼굴을 그려 넣음
        this.putTarget(r, plan.row);
        r.row = plan.row;
        r.state = 'stop';
        r.st = 0;
        r.p0 = r.p;
        r.pT = plan.pT;
        r.d = plan.d;
        r.T = plan.T;
    };

    SlotIntro.prototype.putTarget = function(r, row) {
        var cw = this._cw, ch = this._ch;
        var rows = (row === 0) ? [0, r.N] : [row]; // 0번째 칸은 띠 맨 끝에 복제본이 있음
        for (var i = 0; i < rows.length; i++) {
            var y = rows[i] * ch;
            r.strip.clearRect(0, y, cw, ch);
            this.drawItem(r.strip, r.target, 0, y, cw, ch);
        }
    };

    SlotIntro.prototype.updateStopping = function(r) {
        r.st++;
        var k = r.st / r.T;
        if (k >= 1) {
            r.p = r.pT;
            r.state = 'done';
            r.shade.alpha = 0;
            r.flash.alpha = 0.85;
            playSe(dingSe);
            return;
        }
        var e = 1 - (1 - k) * (1 - k); // 감속 (처음 속도가 spinSpeed와 이어짐)
        r.p = r.p0 + r.d * e;
        r.shade.alpha = 1 - k;
    };

    SlotIntro.prototype.updateFlashes = function() {
        for (var i = 0; i < this._reels.length; i++) {
            var f = this._reels[i].flash;
            if (f.alpha > 0) f.alpha = Math.max(0, f.alpha - 0.06);
        }
    };

    //--- hold / fade -----------------------------------------------------------

    SlotIntro.prototype.updateHold = function() {
        this._dim.alpha = backdropOpacity;
        this._box.alpha = 1;
        if (this._t >= holdFrames) {
            this.release(); // 전투 시작 → 페이드되는 동안 적/윈도우가 드러남
            this.setPhase('fade');
        }
    };

    SlotIntro.prototype.updateFade = function() {
        var k = clamp01(this._t / fadeFrames);
        this._dim.alpha = backdropOpacity * (1 - k);
        this._box.alpha = 1 - k;
        if (k >= 1) this._phase = 'done';
    };

})();
