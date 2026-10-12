//=============================================================================
// BattleShatterIntro.js
//=============================================================================

/*:
 * @plugindesc 전투 시작 전, 6컷 패널이 바깥에서 안쪽으로 차례로 들어온 뒤
 * 유리창처럼 깨지면서 전투(적)가 드러나는 연출. 스위치별 이미지 교체 지원.
 * @author Claude
 *
 * @param Enable Switch
 * @desc 이 스위치가 ON일 때만 연출을 재생합니다. 0이면 항상 재생.
 * @type switch
 * @default 0
 *
 * @param Image List
 * @desc 스위치별 이미지 목록. 위에서부터 검사해서 스위치가 켜진 첫 항목을 사용합니다.
 * @type struct<ShatterImage>[]
 * @default []
 *
 * @param Default Set
 * @desc 목록에 해당하는 스위치가 없을 때 쓰는 기본 이미지 세트. (Switch ID는 무시됨)
 * @type struct<ShatterImage>
 * @default {"Switch ID":"0","Image Name":"","Panel 1":"","Panel 2":"","Panel 3":"","Panel 4":"","Panel 5":"","Panel 6":""}
 *
 * @param Panel Interval
 * @desc 컷과 컷 사이 등장 간격(프레임).
 * @type number
 * @min 1
 * @default 10
 *
 * @param Slide Frames
 * @desc 컷 하나가 바깥에서 제자리로 들어오는 데 걸리는 프레임.
 * @type number
 * @min 1
 * @default 18
 *
 * @param Slide Distance
 * @desc 컷이 출발하는 바깥쪽 거리(px).
 * @type number
 * @min 0
 * @default 520
 *
 * @param Hold Frames
 * @desc 6컷이 다 모인 뒤 깨지기 전까지 멈춰 있는 프레임. (60프레임 = 약 1초, 150 = 2.5초)
 * @type number
 * @min 0
 * @default 150
 *
 * @param Crack Frames
 * @desc 금이 퍼지는 프레임.
 * @type number
 * @min 1
 * @default 20
 *
 * @param Shatter Frames
 * @desc 파편이 흩어져 사라지는 프레임.
 * @type number
 * @min 10
 * @default 90
 *
 * @param Shatter Speed
 * @desc 파편이 날아가는 속도 배율. 1.0이 원래 속도, 낮을수록 느림(슬로우 모션).
 * @type number
 * @decimals 2
 * @min 0.1
 * @default 0.65
 *
 * @param Shard Sectors
 * @desc 파편 방사 분할 수. 클수록 조각이 많아집니다 (성능 주의).
 * @type number
 * @min 6
 * @max 24
 * @default 14
 *
 * @param Gravity
 * @desc 파편 낙하 가속도.
 * @type number
 * @decimals 2
 * @default 0.45
 *
 * @param Border Width
 * @desc 컷 사이 경계선 굵기(px). 0이면 없음.
 * @type number
 * @min 0
 * @default 3
 *
 * @param Border Color
 * @desc 경계선 색 (#rrggbb)
 * @default #000000
 *
 * @param Impact Shake
 * @desc 컷이 착지할 때 화면 흔들림 세기(px). 0이면 없음.
 * @type number
 * @min 0
 * @default 3
 *
 * @param Enemy Appear Effect
 * @desc 깨진 직후 적이 서서히 나타나는 기본 효과를 다시 재생할지 여부.
 * @type boolean
 * @default true
 *
 * @param Panel SE
 * @desc 컷이 착지할 때 효과음 (audio/se).
 * @type file
 * @dir audio/se/
 * @require 1
 * @default
 *
 * @param Shatter SE
 * @desc 유리가 깨질 때 효과음 (audio/se). 함께 드린 GlassBreak.ogg/.m4a 를 audio/se 에 넣으세요.
 * @type file
 * @dir audio/se/
 * @require 1
 * @default GlassBreak
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
 * 전투가 시작되면 (적/아군/윈도우를 숨긴 채)
 *   1) 컷 1~6이 순서대로 바깥에서 중앙으로 들어오고
 *   2) 잠깐 멈춘 뒤 중앙에서 금이 퍼지고
 *   3) 유리처럼 깨져 흩어지면서 전투 화면과 적이 나타납니다.
 *
 * 컷 배치 (1~6)는 보내주신 스케치 그대로입니다.
 *      1 | 2
 *     6  \/ 3     (중앙점에서 6개의 선이 뻗어나가는 모양)
 *      5 | 4
 *
 * 연출이 끝나는 시점에 BattleManager.startBattle()이 실행되므로
 * 전투 시작 메시지/턴 0 이벤트는 깨진 뒤에 진행됩니다.
 *
 * ============================================================================
 * 이미지 준비
 * ============================================================================
 * - img/pictures 폴더에 PNG를 넣으세요 (하위 폴더는 "폴더/이름" 으로 지정).
 * - 크기는 게임 화면 크기(기본 816x624)로 만드세요. 다르면 화면에 맞춰 늘어납니다.
 * - Image Name 에 1장만 넣으면 그 이미지를 컷 모양으로 잘라 씁니다.
 * - Panel 1~6 에 컷별로 따로 지정할 수도 있습니다. (각 장은 전체 화면 크기로
 *   만들고, 해당 컷 영역만 쓰입니다.) 비워둔 컷은 Image Name 으로 채웁니다.
 * - 이미지가 지정되지 않은 컷은 검은색으로 채워집니다. (모든 컷이 비면 연출 없이 전투 시작)
 * - 기본 세트(Default Set)와 스위치 목록의 각 항목 모두 같은 방식입니다.
 *
 * ============================================================================
 * 조건별 이미지 (스위치 / 액터)
 * ============================================================================
 * Image List 에 항목을 추가하고 조건을 지정하세요.
 *   - Switch ID : 그 스위치가 ON일 때 (0이면 무시)
 *   - Actor ID + Actor Condition : 그 액터가 파티에 있을 때 / 없을 때
 *     (대기 멤버 포함, 파티 전체 기준. 0이면 무시)
 *   - 둘 다 지정하면 두 조건을 모두 만족해야 합니다.
 * 판정은 컷(1~6)마다 따로 합니다.
 *   각 컷은 위에서부터 (조건이 맞고 && 그 컷에 이미지가 지정된) 첫 항목을 쓰고,
 *   없으면 Default Set 의 해당 컷을 씁니다.
 * 그래서 "액터1 있을 때" 항목에는 액터1이 담당하는 컷(예: Panel 1)만 채우고
 * 나머지 Panel 은 비워두세요. 비워둔 컷은 그 항목이 건드리지 않습니다.
 * (Image Name 을 채우면 6컷 전부를 담당하게 됩니다.)
 * Target Panels 에 컷 번호를 적으면 (예: 3 또는 3,4) 그 항목은 해당 컷만 담당합니다.
 * 전체 화면 이미지 1장(Image Name)을 쓰면서 특정 컷에만 적용하고 싶을 때 쓰세요.
 *
 * 예) 액터1 담당 = 컷1
 *   항목1: Actor 1 / 있을 때 / Panel 1 = 액터1그림
 *   항목2: Actor 1 / 없을 때 / Panel 1 = 검은칸
 *   (액터2~4도 각자 담당 컷으로 같은 식으로 추가)
 * 조건은 전투 시작 시점에 한 번만 검사합니다.
 *
 * ============================================================================
 * 플러그인 관리 순서 / 주의
 * ============================================================================
 * - YEP 계열보다 아래, BattleIntroHide 보다 아래에 두세요.
 * - BattleIntroHide 의 Auto Hide On Battle Start 가 true 면 깨진 직후
 *   다시 숨겨지고 턴 0 이벤트의 "BattleIntroHide show" 를 기다립니다.
 *   (이 연출만으로 끝낼 거라면 false 로 두세요.)
 * - 파일 이름은 반드시 BattleShatterIntro.js 여야 합니다.
 * - 컷 모양을 바꾸고 싶으면 코드 상단의 SKETCH_EDGES 좌표(816x624 기준)를
 *   수정하세요.
 *
 * 이용 약관: 자유롭게 수정 및 사용 가능합니다.
 */

/*~struct~ShatterImage:
 * @param Switch ID
 * @desc 이 스위치가 ON일 때 사용. 0이면 스위치는 조건에서 제외.
 * @type switch
 * @default 0
 *
 * @param Actor ID
 * @desc 이 액터가 파티에 있는지(또는 없는지)를 조건으로 사용. 0이면 액터는 조건에서 제외.
 * @type actor
 * @default 0
 *
 * @param Actor Condition
 * @desc 위 액터가 파티에 있을 때 / 없을 때 사용.
 * @type select
 * @option 있을 때
 * @value in
 * @option 없을 때
 * @value out
 * @default in
 *
 * @param Target Panels
 * @desc 이 항목이 담당할 컷 번호. 쉼표로 구분 (예: 3 또는 3,4). 비우면 6컷 전부.
 * @default
 *
 * @param Image Name
 * @desc 전체 화면 이미지 1장 (6조각으로 잘라 씀). Panel 1~6을 비워둔 컷에도 이 이미지를 씁니다.
 * @type file
 * @dir img/pictures/
 * @require 1
 * @default
 *
 * @param Panel 1
 * @desc 컷 1(좌상) 전용 이미지. 비우면 Image Name 사용.
 * @type file
 * @dir img/pictures/
 * @require 1
 * @default
 *
 * @param Panel 2
 * @desc 컷 2(상) 전용 이미지.
 * @type file
 * @dir img/pictures/
 * @require 1
 * @default
 *
 * @param Panel 3
 * @desc 컷 3(우) 전용 이미지.
 * @type file
 * @dir img/pictures/
 * @require 1
 * @default
 *
 * @param Panel 4
 * @desc 컷 4(우하) 전용 이미지.
 * @type file
 * @dir img/pictures/
 * @require 1
 * @default
 *
 * @param Panel 5
 * @desc 컷 5(하) 전용 이미지.
 * @type file
 * @dir img/pictures/
 * @require 1
 * @default
 *
 * @param Panel 6
 * @desc 컷 6(좌) 전용 이미지.
 * @type file
 * @dir img/pictures/
 * @require 1
 * @default
 */

var Imported = Imported || {};
Imported.BattleShatterIntro = true;

(function() {
    'use strict';

    var P = PluginManager.parameters('BattleShatterIntro');

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
    function parseStruct(s) {
        try { return JSON.parse(s || '{}') || {}; } catch (e) { return {}; }
    }
    function parseStructList(s) {
        try {
            return JSON.parse(s || '[]').map(function(e) { return JSON.parse(e); });
        } catch (e) {
            return [];
        }
    }

    var enableSwitch   = num('Enable Switch', 0);
    var imageList      = parseStructList(P['Image List']);
    var defaultSet     = parseStruct(P['Default Set']);
    var panelInterval  = num('Panel Interval', 10);
    var slideFrames    = num('Slide Frames', 18);
    var slideDistance  = num('Slide Distance', 520);
    var holdFrames     = num('Hold Frames', 150);
    var crackFrames    = num('Crack Frames', 20);
    var shatterFrames  = num('Shatter Frames', 90);
    var shatterSpeed   = Math.max(0.1, num('Shatter Speed', 0.65));
    var shardSectors   = Math.max(6, Math.floor(num('Shard Sectors', 14)));
    var gravity        = num('Gravity', 0.45);
    var borderWidth    = num('Border Width', 3);
    var borderColor    = String(P['Border Color'] || '#000000');
    var impactShake    = num('Impact Shake', 3);
    var enemyAppear    = bool('Enemy Appear Effect', true);
    var panelSe        = String(P['Panel SE'] || '');
    var shatterSe      = (P['Shatter SE'] === undefined ? 'GlassBreak' : String(P['Shatter SE']));
    var seVolume       = num('SE Volume', 90);

    //=========================================================================
    // 지오메트리 (스케치 816x624 기준 좌표 → 화면 크기로 스케일)
    //=========================================================================

    var SK_W = 816, SK_H = 624;
    var CENTER = [412.8, 321.4];

    // 중앙 → 화면 가장자리로 뻗는 6개의 직선 (시계 방향: 좌상, 상, 우상, 우하, 하, 좌하)
    // 전투1~6.png 에서 측정한 좌표입니다. (816x624 기준)
    var SKETCH_EDGES = [
        [CENTER, [0, 75]],
        [CENTER, [430.5, 0]],
        [CENTER, [816, 79.5]],
        [CENTER, [816, 465.5]],
        [CENTER, [463.5, 624]],
        [CENTER, [0, 548.5]]
    ];

    // Catmull-Rom 스플라인으로 부드럽게 (양 끝점은 그대로 유지)
    function smoothPath(pts, sub) {
        var out = [pts[0].slice()];
        for (var i = 0; i < pts.length - 1; i++) {
            var p0 = pts[Math.max(i - 1, 0)];
            var p1 = pts[i];
            var p2 = pts[i + 1];
            var p3 = pts[Math.min(i + 2, pts.length - 1)];
            for (var s = 1; s <= sub; s++) {
                var t = s / sub, t2 = t * t, t3 = t2 * t;
                var x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
                    (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
                    (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
                var y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
                    (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
                    (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
                out.push([x, y]);
            }
        }
        out[out.length - 1] = pts[pts.length - 1].slice();
        return out;
    }

    // 화면 둘레를 시계 방향(좌상단 0)으로 잰 거리
    function perimT(p, W, H) {
        var e = 1;
        if (p[1] <= e) return p[0];
        if (p[0] >= W - e) return W + p[1];
        if (p[1] >= H - e) return W + H + (W - p[0]);
        return 2 * W + H + (H - p[1]);
    }

    function cornersBetween(t1, t2, W, H) {
        var P_ = 2 * W + 2 * H;
        if (t2 <= t1) t2 += P_;
        var base = [W, W + H, 2 * W + H, P_];
        var pts = [[W, 0], [W, H], [0, H], [0, 0]];
        var res = [];
        for (var lap = 0; lap < 2; lap++) {
            for (var k = 0; k < 4; k++) {
                var c = base[k] + lap * P_;
                if (c > t1 && c < t2) res.push(pts[k].slice());
            }
        }
        return res;
    }

    function polygonCentroid(poly) {
        var a = 0, cx = 0, cy = 0;
        for (var i = 0; i < poly.length; i++) {
            var p = poly[i], q = poly[(i + 1) % poly.length];
            var cr = p[0] * q[1] - q[0] * p[1];
            a += cr;
            cx += (p[0] + q[0]) * cr;
            cy += (p[1] + q[1]) * cr;
        }
        if (Math.abs(a) < 1e-6) return poly[0].slice();
        return [cx / (3 * a), cy / (3 * a)];
    }

    function buildPanels(W, H) {
        var sx = W / SK_W, sy = H / SK_H;
        var edges = SKETCH_EDGES.map(function(e) {
            return smoothPath(e.map(function(p) { return [p[0] * sx, p[1] * sy]; }), 8);
        });
        var panels = [];
        for (var i = 0; i < 6; i++) {
            var a = edges[i];
            var b = edges[(i + 1) % 6];
            var poly = a.map(function(p) { return p.slice(); });
            var t1 = perimT(a[a.length - 1], W, H);
            var t2 = perimT(b[b.length - 1], W, H);
            cornersBetween(t1, t2, W, H).forEach(function(c) { poly.push(c); });
            for (var j = b.length - 1; j >= 1; j--) poly.push(b[j].slice());
            panels.push({ poly: poly, a: a, b: b, centroid: polygonCentroid(poly) });
        }
        return { panels: panels, center: [CENTER[0] * sx, CENTER[1] * sy] };
    }

    window.ShatterIntroGeometry = { buildPanels: buildPanels };

    //=========================================================================
    // 유틸
    //=========================================================================

    function easeOutQuart(p) { return 1 - Math.pow(1 - p, 4); }
    function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

    function playSe(name) {
        if (!name) return;
        AudioManager.playSe({ name: name, volume: seVolume, pitch: 100, pan: 0 });
    }

    function introHideActive() {
        return !!(window.RS && RS.BattleIntroHide && RS.BattleIntroHide.isHidden &&
            RS.BattleIntroHide.isHidden());
    }

    // 항목에서 컷 i(0~5)에 지정된 이미지 이름. Panel i 우선, 없으면 Image Name, 둘 다 없으면 ''
    function panelName(e, i) {
        e = e || {};
        var tp = String(e['Target Panels'] || '').replace(/\s/g, '');
        if (tp) {
            var list = tp.split(',').map(Number);
            if (list.indexOf(i + 1) < 0) return '';
        }
        return String(e['Panel ' + (i + 1)] || '') || String(e['Image Name'] || '');
    }

    // 조건: 스위치(0이면 무시) AND 액터 유무(0이면 무시). 둘 다 0이면 항상 일치.
    function matchEntry(e) {
        var sid = Number(e['Switch ID'] || 0);
        if (sid > 0 && !$gameSwitches.value(sid)) return false;
        var aid = Number(e['Actor ID'] || 0);
        if (aid > 0) {
            var inParty = $gameParty.allMembers().some(function(a) {
                return a && a.actorId() === aid;
            });
            var wantIn = String(e['Actor Condition'] || 'in') !== 'out';
            if (inParty !== wantIn) return false;
        }
        return true;
    }

    // 컷마다 따로 판정: 위에서부터 (조건이 맞고 && 그 컷에 이미지가 지정된) 첫 항목을 사용.
    // 어느 항목에도 없으면 Default Set. 그래도 없으면 null(검은 칸).
    // 하나도 못 찾으면 null 반환 → 연출 없이 전투 시작.
    function selectImageSet() {
        var names = [], any = false;
        for (var i = 0; i < 6; i++) {
            var n = '';
            for (var j = 0; j < imageList.length && !n; j++) {
                var e = imageList[j] || {};
                if (matchEntry(e)) n = panelName(e, i);
            }
            if (!n) n = panelName(defaultSet, i);
            names.push(n || null);
            if (n) any = true;
        }
        if (Utils.isOptionValid('test')) {
            console.log('[ShatterIntro] 파티 멤버 액터ID:',
                $gameParty.allMembers().map(function(a) { return a.actorId(); }));
            imageList.forEach(function(e, idx) {
                console.log('[ShatterIntro] 항목' + (idx + 1),
                    'switch=' + (e['Switch ID'] || 0),
                    'actor=' + (e['Actor ID'] || 0) + '/' + (e['Actor Condition'] || 'in'),
                    '→ 조건 ' + (matchEntry(e) ? '일치' : '불일치'),
                    '| 담당 컷:', [0, 1, 2, 3, 4, 5].filter(function(i) { return panelName(e, i); })
                        .map(function(i) { return i + 1; }));
            });
            console.log('[ShatterIntro] 최종 컷 1~6 이미지:', names);
        }
        return any ? names : null;
    }

    function loadPicture(name) {
        var idx = name.lastIndexOf('/');
        var folder = 'img/pictures/' + (idx >= 0 ? name.substring(0, idx + 1) : '');
        var file = idx >= 0 ? name.substring(idx + 1) : name;
        return ImageManager.loadBitmap(folder, file, 0, true);
    }

    function shouldPlay() {
        return enableSwitch === 0 || $gameSwitches.value(enableSwitch);
    }

    //=========================================================================
    // BattleManager - 전투 시작을 연출 뒤로 미룸
    //=========================================================================

    var _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function(troopId, canEscape, canLose) {
        _BattleManager_setup.apply(this, arguments);
        this._shatterPending = false;
        this._shatterHide = false;
        this._shatterPlayed = false;
    };

    var _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        if (!this._shatterPlayed && shouldPlay()) {
            this._shatterPlayed = true;
            this._shatterPending = true;
            this._shatterHide = true;
            return; // 연출이 끝나는 시점에 releaseShatterIntro()에서 실제 시작
        }
        _BattleManager_startBattle.call(this);
    };

    BattleManager.releaseShatterIntro = function() {
        if (!this._shatterPending) return;
        this._shatterPending = false;
        this._shatterHide = false;
        _BattleManager_startBattle.call(this);
    };

    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        this._shatterPending = false;
        this._shatterHide = false;
        _BattleManager_endBattle.call(this, result);
    };

    //=========================================================================
    // Spriteset_Battle / Scene_Battle - 연출 중 적/아군/윈도우 숨김
    //=========================================================================

    var _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        _Spriteset_Battle_update.call(this);
        if (BattleManager._shatterHide) {
            var i;
            if (this._enemySprites) {
                for (i = 0; i < this._enemySprites.length; i++) this._enemySprites[i].visible = false;
            }
            if (this._actorSprites) {
                for (i = 0; i < this._actorSprites.length; i++) this._actorSprites[i].visible = false;
            }
        }
        // 해제 후에는 엔진이 매 프레임 visible을 스스로 갱신하므로 따로 복구하지 않음
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this.updateShatterIntro();
    };

    Scene_Battle.prototype.updateShatterIntro = function() {
        if (BattleManager._shatterPending && !this._shatterIntro) {
            this._shatterIntro = new ShatterIntro(this);
            this.addChild(this._shatterIntro); // 맨 위 레이어
        }
        var hide = BattleManager._shatterHide;
        if (this._windowLayer) {
            if (hide) {
                this._windowLayer.visible = false;
                this._shatterWinForced = true;
            } else if (this._shatterWinForced) {
                this._shatterWinForced = false;
                this._windowLayer.visible = !introHideActive();
            }
        }
        if (this._shatterIntro) {
            this._shatterIntro.update();
            if (this._shatterIntro.isDone()) {
                this.removeChild(this._shatterIntro);
                this._shatterIntro.terminate();
                this._shatterIntro = null;
            }
        }
    };

    //=========================================================================
    // ShatterIntro - 연출 본체
    //=========================================================================

    function ShatterIntro() {
        this.initialize.apply(this, arguments);
    }
    ShatterIntro.prototype = Object.create(PIXI.Container.prototype);
    ShatterIntro.prototype.constructor = ShatterIntro;

    ShatterIntro.prototype.initialize = function(scene) {
        PIXI.Container.call(this);
        this._scene = scene;
        this._W = Graphics.width;
        this._H = Graphics.height;
        this._phase = 'load';
        this._t = 0;
        this._revealed = false;
        this._shake = 0;
        this._bitmaps = [];
        this._panels = [];
        this._shards = [];
        this._tris = [];

        this._panelLayer = new PIXI.Container();
        this._shardLayer = new PIXI.Container();
        this._shardLayer.visible = false;
        this._crackGfx = new PIXI.Graphics();
        this.addChild(this._panelLayer);
        this.addChild(this._shardLayer);
        this.addChild(this._crackGfx);

        this._srcs = [];
        var names = selectImageSet();
        if (names) {
            var cache = {};
            for (var i = 0; i < 6; i++) {
                var nm = names[i];
                if (!nm) {
                    if (!cache['\0black']) {
                        var bb = new Bitmap(this._W, this._H);
                        bb.fillAll('#000000');
                        this._bitmaps.push(bb);
                        cache['\0black'] = bb;
                    }
                    this._srcs.push(cache['\0black']);
                } else {
                    if (!cache[nm]) cache[nm] = loadPicture(nm);
                    this._srcs.push(cache[nm]);
                }
            }
        }
    };

    ShatterIntro.prototype.isDone = function() { return this._phase === 'done'; };

    ShatterIntro.prototype.setPhase = function(p) {
        this._phase = p;
        this._t = 0;
    };

    ShatterIntro.prototype.terminate = function() {
        this._bitmaps.forEach(function(b) { if (b && b.destroy) b.destroy(); });
        this._bitmaps = [];
        if (this._flash && this._flash.bitmap && this._flash.bitmap.destroy) {
            this._flash.bitmap.destroy();
        }
    };

    ShatterIntro.prototype.update = function() {
        if (this._phase === 'done') return;
        this._t++;
        switch (this._phase) {
        case 'load':    this.updateLoad(); break;
        case 'panels':  this.updatePanels(); break;
        case 'hold':    this.updateHold(); break;
        case 'crack':   this.updateCrack(); break;
        case 'shatter': this.updateShatter(); break;
        }
        this.updateShake();
        this.updateFlash();
    };

    //--- load ------------------------------------------------------------------

    ShatterIntro.prototype.updateLoad = function() {
        if (this._srcs.length === 0) { this.skip(); return; }
        var i;
        for (i = 0; i < this._srcs.length; i++) {
            var b = this._srcs[i];
            if (b.isError && b.isError()) { this.skip(); return; }
        }
        for (i = 0; i < this._srcs.length; i++) {
            if (!this._srcs[i].isReady()) return;
        }
        if (this._scene._fadeDuration > 0) return; // 씬 페이드인이 끝난 뒤 시작
        this.build();
        this.setPhase('panels');
    };

    // 이미지가 없거나 읽기 실패 → 연출 없이 바로 전투 시작
    ShatterIntro.prototype.skip = function() {
        BattleManager.releaseShatterIntro();
        this._phase = 'done';
    };

    //--- build -----------------------------------------------------------------

    ShatterIntro.prototype.build = function() {
        var W = this._W, H = this._H;
        var geo = buildPanels(W, H);
        this._center = geo.center;
        var comp = new Bitmap(W, H);
        this._bitmaps.push(comp);

        for (var i = 0; i < 6; i++) {
            var pn = geo.panels[i];
            var src = this._srcs[i];
            var bmp = this.makePanelBitmap(pn, src);
            this._bitmaps.push(bmp);
            comp._context.drawImage(bmp._canvas, 0, 0);

            var sp = new Sprite(bmp);
            var dx = pn.centroid[0] - geo.center[0];
            var dy = pn.centroid[1] - geo.center[1];
            var len = Math.sqrt(dx * dx + dy * dy) || 1;
            var dist = slideDistance * Math.max(W / SK_W, H / SK_H);
            sp._offX = dx / len * dist;
            sp._offY = dy / len * dist;
            sp._landed = false;
            sp.x = sp._offX;
            sp.y = sp._offY;
            sp.opacity = 0;
            this._panelLayer.addChild(sp);
            this._panels.push(sp);
        }
        comp._setDirty();
        this._comp = comp;
        this.buildShards();
    };

    ShatterIntro.prototype.makePanelBitmap = function(pn, src) {
        var W = this._W, H = this._H;
        var bmp = new Bitmap(W, H);
        var c = bmp._context;
        var i;
        c.save();
        c.beginPath();
        c.moveTo(pn.poly[0][0], pn.poly[0][1]);
        for (i = 1; i < pn.poly.length; i++) c.lineTo(pn.poly[i][0], pn.poly[i][1]);
        c.closePath();
        c.clip();
        c.drawImage(src._canvas || src._image, 0, 0, W, H);
        if (borderWidth > 0) {
            c.strokeStyle = borderColor;
            c.lineWidth = borderWidth * 2; // 클립 안쪽 절반만 보이므로 2배
            c.lineJoin = 'round';
            [pn.a, pn.b].forEach(function(edge) {
                c.beginPath();
                c.moveTo(edge[0][0], edge[0][1]);
                for (var k = 1; k < edge.length; k++) c.lineTo(edge[k][0], edge[k][1]);
                c.stroke();
            });
        }
        c.restore();
        bmp._setDirty();
        return bmp;
    };

    ShatterIntro.prototype.buildShards = function() {
        var W = this._W, H = this._H;
        var cx = this._center[0], cy = this._center[1];
        var scale = Math.max(W / SK_W, H / SK_H);
        var N = shardSectors;
        var radii = [0, 70, 150, 250, 380, 540, 800];
        var R = radii.length - 1;
        var r, k, V = [];
        var angleOffset = Math.random() * Math.PI * 2;

        for (r = 0; r <= R; r++) {
            V[r] = [];
            for (k = 0; k < N; k++) {
                if (r === 0) { V[0][k] = [cx, cy]; continue; }
                var ang = ((k + (Math.random() - 0.5) * 0.6) / N) * Math.PI * 2 + angleOffset;
                var gap = radii[r] - radii[r - 1];
                var rad = (radii[r] + (Math.random() - 0.5) * gap * 0.5) * scale;
                V[r][k] = [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad];
            }
        }

        var tris = [];
        for (k = 0; k < N; k++) {
            tris.push({ ring: 1, p: [V[0][k], V[1][k], V[1][(k + 1) % N]] });
        }
        for (r = 1; r < R; r++) {
            for (k = 0; k < N; k++) {
                var k1 = (k + 1) % N;
                var a = V[r][k], b = V[r][k1], c = V[r + 1][k1], d = V[r + 1][k];
                if (Math.random() < 0.5) {
                    tris.push({ ring: r + 1, p: [a, b, c] });
                    tris.push({ ring: r + 1, p: [a, c, d] });
                } else {
                    tris.push({ ring: r + 1, p: [a, b, d] });
                    tris.push({ ring: r + 1, p: [b, c, d] });
                }
            }
        }

        this._tris = tris;
        this._ringMax = R;

        var S = H / SK_H;
        for (var i = 0; i < tris.length; i++) {
            var t = tris[i];
            var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            t.p.forEach(function(pt) {
                if (pt[0] < minX) minX = pt[0];
                if (pt[1] < minY) minY = pt[1];
                if (pt[0] > maxX) maxX = pt[0];
                if (pt[1] > maxY) maxY = pt[1];
            });
            var bx = Math.max(0, Math.floor(minX));
            var by = Math.max(0, Math.floor(minY));
            var ex = Math.min(W, Math.ceil(maxX));
            var ey = Math.min(H, Math.ceil(maxY));
            var bw = ex - bx, bh = ey - by;
            if (bw <= 2 || bh <= 2) continue; // 화면 밖 조각

            var bmp = new Bitmap(bw, bh);
            var ctx = bmp._context;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(t.p[0][0] - bx, t.p[0][1] - by);
            ctx.lineTo(t.p[1][0] - bx, t.p[1][1] - by);
            ctx.lineTo(t.p[2][0] - bx, t.p[2][1] - by);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(this._comp._canvas, -bx, -by);
            ctx.restore();
            ctx.strokeStyle = 'rgba(255,255,255,0.55)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(t.p[0][0] - bx, t.p[0][1] - by);
            ctx.lineTo(t.p[1][0] - bx, t.p[1][1] - by);
            ctx.lineTo(t.p[2][0] - bx, t.p[2][1] - by);
            ctx.closePath();
            ctx.stroke();
            bmp._setDirty();
            this._bitmaps.push(bmp);

            var gx = (t.p[0][0] + t.p[1][0] + t.p[2][0]) / 3;
            var gy = (t.p[0][1] + t.p[1][1] + t.p[2][1]) / 3;
            var sp = new Sprite(bmp);
            sp.anchor.set((gx - bx) / bw, (gy - by) / bh);
            sp.x = gx;
            sp.y = gy;
            this._shardLayer.addChild(sp);

            var dx = gx - cx, dy = gy - cy;
            var len = Math.sqrt(dx * dx + dy * dy) || 1;
            var speed = (2.5 + Math.random() * 5 + 4 / t.ring) * S;
            this._shards.push({
                sprite: sp,
                vx: dx / len * speed + (Math.random() - 0.5) * 2 * S,
                vy: dy / len * speed - Math.random() * 3 * S,
                vr: (Math.random() - 0.5) * 0.25,
                delay: t.ring * 2 + Math.random() * 3
            });
        }
    };

    //--- panels / hold ---------------------------------------------------------

    ShatterIntro.prototype.updatePanels = function() {
        var allLanded = true;
        for (var i = 0; i < this._panels.length; i++) {
            var sp = this._panels[i];
            var local = this._t - i * panelInterval;
            var p = clamp01(local / slideFrames);
            var e = easeOutQuart(p);
            sp.x = sp._offX * (1 - e);
            sp.y = sp._offY * (1 - e);
            sp.opacity = 255 * clamp01(p * 3);
            if (p >= 1) {
                if (!sp._landed) {
                    sp._landed = true;
                    this._shake = impactShake;
                    playSe(panelSe);
                }
            } else {
                allLanded = false;
            }
        }
        if (allLanded) this.setPhase('hold');
    };

    ShatterIntro.prototype.updateHold = function() {
        if (this._t >= holdFrames) this.setPhase('crack');
    };

    //--- crack -----------------------------------------------------------------

    ShatterIntro.prototype.updateCrack = function() {
        var p = clamp01(this._t / crackFrames);
        var thr = p * this._ringMax;
        var g = this._crackGfx;
        g.clear();
        var tris = this._tris;
        var pass, i, t;
        for (pass = 0; pass < 2; pass++) {
            if (pass === 0) g.lineStyle(4, 0x000000, 0.35);
            else g.lineStyle(1.6, 0xffffff, 0.9);
            for (i = 0; i < tris.length; i++) {
                t = tris[i];
                if (t.ring > thr) continue;
                g.moveTo(t.p[0][0], t.p[0][1]);
                g.lineTo(t.p[1][0], t.p[1][1]);
                g.lineTo(t.p[2][0], t.p[2][1]);
                g.lineTo(t.p[0][0], t.p[0][1]);
            }
        }
        this._shake = Math.max(this._shake, 1.5);
        if (this._t >= crackFrames) this.startShatter();
    };

    //--- shatter ---------------------------------------------------------------

    ShatterIntro.prototype.startShatter = function() {
        this._panelLayer.visible = false;
        this._crackGfx.visible = false;
        this._shardLayer.visible = true;

        var fb = new Bitmap(this._W, this._H);
        fb.fillAll('#ffffff');
        this._flash = new Sprite(fb);
        this._flash.opacity = 200;
        this.addChild(this._flash);

        playSe(shatterSe);
        this._shake = impactShake * 2;
        this.reveal();
        this.setPhase('shatter');
    };

    // 전투 시작(적 등장) 시점
    ShatterIntro.prototype.reveal = function() {
        if (this._revealed) return;
        this._revealed = true;
        BattleManager.releaseShatterIntro();
        var ss = this._scene._spriteset;
        if (enemyAppear && ss && ss._enemySprites) {
            ss._enemySprites.forEach(function(s) {
                if (s && s.startEffect && s._enemy && s._enemy.isAlive()) {
                    try { s.startEffect('appear'); } catch (e) { /* 다른 플러그인과 충돌 시 무시 */ }
                }
            });
        }
    };

    ShatterIntro.prototype.updateShatter = function() {
        var S = this._H / SK_H;
        var life = shatterFrames;
        var fadeStart = life * 0.35;
        var fadeLen = life * 0.45;
        for (var i = 0; i < this._shards.length; i++) {
            var s = this._shards[i];
            var lt = this._t - s.delay;
            if (lt <= 0) continue;
            var k = shatterSpeed;
            s.vy += gravity * S * k;
            s.sprite.x += s.vx * k;
            s.sprite.y += s.vy * k;
            s.sprite.rotation += s.vr * k;
            var sc = 1 + lt * 0.008 * k;
            s.sprite.scale.set(sc, sc);
            s.sprite.opacity = 255 * (1 - clamp01((lt - fadeStart) / fadeLen));
        }
        if (this._t >= life + 16) this._phase = 'done';
    };

    //--- 공통 효과 -------------------------------------------------------------

    ShatterIntro.prototype.updateShake = function() {
        if (this._shake > 0.1) {
            this.x = (Math.random() * 2 - 1) * this._shake;
            this.y = (Math.random() * 2 - 1) * this._shake;
            this._shake *= 0.82;
        } else {
            this._shake = 0;
            this.x = 0;
            this.y = 0;
        }
    };

    ShatterIntro.prototype.updateFlash = function() {
        if (this._flash && this._flash.opacity > 0) {
            this._flash.opacity = Math.max(0, this._flash.opacity - 18);
        }
    };

})();
