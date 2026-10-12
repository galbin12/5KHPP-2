//=============================================================================
// DarkLightPuzzle.js
//=============================================================================

/*:
 * @plugindesc v1.1 화면을 어둡게 하고 플레이어 주변만 밝힙니다. 같은 색 선 연결 퍼즐을 풀면 조명이 켜집니다.
 * @author ㄹㅅㅁ
 *
 * @param Darkness Opacity
 * @text 어둠 농도 (0~255)
 * @desc 어두운 맵의 기본 어둠 농도입니다. 255면 완전한 암흑입니다.
 * @type number
 * @min 0
 * @max 255
 * @default 235
 *
 * @param Light Radius
 * @text 플레이어 빛 반경(px)
 * @desc 플레이어 주위가 밝아지는 반경입니다. (타일 1칸 = 48px)
 * @type number
 * @min 0
 * @default 120
 *
 * @param Light Core
 * @text 빛 중심 선명 비율
 * @desc 반경 중 완전히 밝은 부분의 비율(0~0.95). 작을수록 가장자리가 부드럽게 번집니다.
 * @type number
 * @decimals 2
 * @min 0
 * @max 0.95
 * @default 0.35
 *
 * @param Lamp Radius
 * @text 조명 기본 반경(px)
 * @desc LightSource 이벤트에 반경을 따로 적지 않았을 때 쓰는 반경입니다.
 * @type number
 * @min 0
 * @default 150
 *
 * @param Lamp Flicker
 * @text 조명 깜빡임 폭(px)
 * @desc 켜진 조명의 반경이 일렁이는 폭입니다. 0이면 깜빡이지 않습니다.
 * @type number
 * @min 0
 * @default 4
 *
 * @param Fade Frames
 * @text 어둠 전환 프레임
 * @desc 어둠을 켜고 끌 때 서서히 바뀌는 데 걸리는 프레임 수입니다.
 * @type number
 * @min 1
 * @default 30
 *
 * @param Light Whole Map
 * @text 퍼즐 완료 시 맵 전체 밝히기
 * @desc ON이면 퍼즐(그룹)이 하나라도 풀리는 순간 그 맵의 어둠이 서서히 걷혀 맵 전체가 밝아집니다.
 * @type boolean
 * @default true
 *
 * @param Whole Map Fade Frames
 * @text 맵 전체가 밝아지는 프레임
 * @desc 퍼즐 완료 후 어둠이 완전히 걷히기까지 걸리는 시간 (60 = 1초)
 * @type number
 * @min 1
 * @default 90
 *
 * @param Wire Width
 * @text 선 굵기(px)
 * @type number
 * @min 1
 * @default 6
 *
 * @param Wires Above Darkness
 * @text 선/연결점을 어둠 위에 표시
 * @desc ON이면 어두운 곳에서도 연결점과 선이 보입니다. OFF면 빛이 닿는 곳에서만 보입니다.
 * @type boolean
 * @default true
 *
 * @param Lamp Self Switch
 * @text 퍼즐 완료 시 켤 셀프 스위치
 * @desc 퍼즐을 풀면 LightSource 이벤트의 이 셀프 스위치가 ON이 됩니다.
 * @type select
 * @option A
 * @value A
 * @option B
 * @value B
 * @option C
 * @value C
 * @option D
 * @value D
 * @option 사용 안 함
 * @value none
 * @default A
 *
 * @param SE Select
 * @text 효과음: 연결점 선택
 * @type file
 * @dir audio/se/
 * @default Cursor2
 *
 * @param SE Connect
 * @text 효과음: 연결 성공
 * @type file
 * @dir audio/se/
 * @default Decision2
 *
 * @param SE Fail
 * @text 효과음: 색이 다름
 * @type file
 * @dir audio/se/
 * @default Buzzer1
 *
 * @param SE Disconnect
 * @text 효과음: 연결 해제/선택 취소
 * @type file
 * @dir audio/se/
 * @default Cancel1
 *
 * @param SE Solved
 * @text 효과음: 퍼즐 완료(불 켜짐)
 * @type file
 * @dir audio/se/
 * @default Item3
 *
 * @param SE Volume
 * @text 효과음 볼륨
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * 1) 어두운 맵: 화면 전체가 어두워지고 플레이어 주위만 밝게 보입니다.
 * 2) 선 연결 퍼즐: "연결점" 이벤트를 차례로 조사해서 같은 색끼리 이으면
 *    선이 그려지고, 그룹의 모든 색을 다 이으면 "조명" 이벤트에 불이 켜집니다.
 *
 * ============================================================================
 * 1. 어둡게 만들기
 * ============================================================================
 * [방법 A] 맵 메모에 태그를 적습니다. (그 맵에 들어가면 자동으로 어두워짐)
 *   <DarkLight>            기본 반경 사용
 *   <DarkLight: 140>       플레이어 빛 반경을 140px로
 *
 * [방법 B] 플러그인 명령 (이벤트 안에서)
 *   DarkLight on           어둡게 (서서히)
 *   DarkLight off          밝게 (서서히)
 *   DarkLight auto         다시 맵 메모 태그를 따르도록
 *   DarkLight radius 150   플레이어 빛 반경 변경
 *   DarkLight opacity 220  어둠 농도 변경 (0~255)
 *
 * ============================================================================
 * 2. 선 연결 퍼즐 만들기
 * ============================================================================
 * (1) 연결점 이벤트 - 같은 색은 반드시 "정확히 2개"씩 배치하세요.
 *     - 트리거: 액션 버튼 / 우선도: 보통 / 이벤트 내용은 비워둬도 됩니다.
 *     - 이벤트 메모(또는 주석)에 태그를 적습니다.
 *
 *       <LinePoint: 그룹, 색>
 *
 *       예) <LinePoint: 1, 빨강>   <LinePoint: 1, 빨강>   (같은 그룹 1의 빨강 2개)
 *           <LinePoint: 1, 파랑>   <LinePoint: 1, 파랑>
 *
 *     - 그룹: 숫자든 글자든 자유 (같은 그룹끼리 한 퍼즐)
 *     - 색: red/orange/yellow/green/cyan/blue/purple/pink/white
 *           빨강/주황/노랑/초록/하늘/파랑/보라/분홍/흰색, 또는 #ff8800 같은 색상 코드
 *
 * (2) 조명 이벤트 - 퍼즐이 풀리면 켜지는 불
 *       <LightSource: 그룹>
 *       <LightSource: 그룹, 반경>
 *       <LightSource: 그룹, 반경, 스위치ID>   (켜질 때 해당 스위치도 ON)
 *     - 퍼즐이 풀리는 순간 이 이벤트의 셀프 스위치(기본 A)가 ON이 됩니다.
 *       2번째 페이지를 "셀프 스위치 A ON" 조건 + 불 켜진 그래픽으로 만들어두면
 *       그래픽도 같이 바뀝니다.
 *     - 퍼즐을 푼 뒤에는 맵에 다시 들어와도 불이 켜진 채로 유지됩니다.
 *
 * (3) 항상 켜져 있는 불(횃불 등)
 *       <Light: 반경>
 *     - 이벤트 메모에 적으면 항상, 특정 페이지의 주석에 적으면 그 페이지에서만
 *       켜집니다.
 *
 * ------------------------------------------------------------------------
 * 플레이 방법
 * ------------------------------------------------------------------------
 *  - 연결점 조사 → 선택됨 (플레이어까지 점선 표시)
 *  - 같은 색의 다른 연결점 조사 → 선으로 연결
 *  - 다른 색의 연결점 조사 → 실패음, 선택 취소
 *  - 이미 연결된 연결점 조사 → 그 선 해제
 *  - 그룹의 모든 연결점이 이어지면 → 퍼즐 완료, 조명 켜짐 (완료 후엔 고정)
 *
 * ------------------------------------------------------------------------
 * 퍼즐을 풀면 맵 전체가 밝아집니다
 * ------------------------------------------------------------------------
 *  퍼즐이 풀리는 순간 그 맵의 어둠이 서서히 걷히면서 맵 전체가 밝아집니다.
 *  (WireConnectMinigame.js 로 풀어도 똑같이 적용됩니다.)
 *  - 플러그인 매개변수 "퍼즐 완료 시 맵 전체 밝히기"를 끄면 예전처럼
 *    조명 이벤트 주변만 밝아집니다.
 *  - 한 번 밝아진 맵은 다시 들어와도 밝은 상태입니다.
 *  - LinePuzzle reset 으로 퍼즐을 초기화하면 다시 어두워집니다.
 *  - 이 맵에 퍼즐이 여러 개면, 그중 하나만 풀려도 맵 전체가 밝아집니다.
 *
 * ============================================================================
 * 플러그인 명령 (퍼즐)
 * ============================================================================
 *   LinePuzzle reset [그룹]   그룹의 선과 완료 상태를 초기화 (조명 셀프 스위치도 OFF)
 *                             그룹을 생략하면 이 맵의 모든 퍼즐 초기화
 *   LinePuzzle solve [그룹]   그룹을 강제로 완료 처리 (남은 연결점은 자동으로 이음)
 *                             그룹을 생략하면 이 맵의 모든 퍼즐
 *
 * 조건 분기 > 스크립트 에서 사용할 수 있는 함수
 *   $gameSystem.ldpSolved('1')        현재 맵의 그룹 1 퍼즐이 풀렸는지
 *   $gameSystem.ldpSolved('1', 5)     5번 맵의 그룹 1 퍼즐이 풀렸는지
 *
 * ============================================================================
 * 주의
 * ============================================================================
 * - 어둠 레이어는 맵 화면 위, 메시지 창 아래에 그려집니다. (맵의 그림(Picture)도
 *   같이 어두워집니다.)
 * - MBS_MapZoom 의 확대/축소와 화면 흔들림에 맞춰서 빛 위치가 따라갑니다.
 * - 선과 완료 상태는 세이브 파일에 저장됩니다.
 *
 * ============================================================================
 * 버전 로그
 * ============================================================================
 * 2026.10.09 (v1.1) - 퍼즐 완료 시 맵 전체가 밝아지는 기능 추가
 * 2026.10.09 (v1.0) - 최초 작성
 */

var RS = RS || {};
RS.LDP = RS.LDP || {};

(function() {
    'use strict';

    var P = PluginManager.parameters('DarkLightPuzzle');
    var LDP = RS.LDP;

    function seParam(key, def) {
        var v = P[key];
        return v === undefined ? def : String(v);
    }

    var cfg = {
        opacity:    Number(P['Darkness Opacity'] || 235),
        radius:     Number(P['Light Radius'] || 120),
        core:       Math.min(0.95, Math.max(0, Number(P['Light Core'] === undefined ? 0.35 : P['Light Core']))),
        lampRadius: Number(P['Lamp Radius'] || 150),
        flicker:    Number(P['Lamp Flicker'] === undefined ? 4 : P['Lamp Flicker']),
        fade:       Math.max(1, Number(P['Fade Frames'] || 30)),
        wholeMap:   String(P['Light Whole Map'] || 'true') === 'true',
        litFade:    Math.max(1, Number(P['Whole Map Fade Frames'] || 90)),
        wireWidth: Number(P['Wire Width'] || 6),
        wiresAbove: String(P['Wires Above Darkness'] || 'true') === 'true',
        selfSwitch: String(P['Lamp Self Switch'] || 'A').toUpperCase(),
        seVolume:   Number(P['SE Volume'] === undefined ? 90 : P['SE Volume']),
        se: {
            select:     seParam('SE Select', 'Cursor2'),
            connect:    seParam('SE Connect', 'Decision2'),
            fail:       seParam('SE Fail', 'Buzzer1'),
            disconnect: seParam('SE Disconnect', 'Cancel1'),
            solved:     seParam('SE Solved', 'Item3')
        }
    };

    //-------------------------------------------------------------------------
    // 저장되는 상태 ($gameSystem._ldp) - 기존 세이브에도 안전하게 지연 생성
    //-------------------------------------------------------------------------
    LDP.state = function() {
        if (!$gameSystem._ldp) {
            $gameSystem._ldp = { mode: null, radius: 0, opacity: -1, wires: {}, solved: {} };
        }
        return $gameSystem._ldp;
    };

    LDP._selected = 0;   // 선택된 연결점의 이벤트 ID (저장하지 않음)
    LDP._infoCache = {};

    LDP.playSe = function(kind) {
        var name = cfg.se[kind];
        if (!name || name === 'none') return;
        AudioManager.playSe({ name: name, volume: cfg.seVolume, pitch: 100, pan: 0 });
    };

    //-------------------------------------------------------------------------
    // 어둠 설정
    //-------------------------------------------------------------------------
    LDP.mapMeta = function() {
        return ($dataMap && $dataMap.meta) || {};
    };

    // 이 맵에서 풀린 퍼즐이 하나라도 있으면 맵 전체가 밝아진 상태
    LDP.mapLit = function() {
        if (!cfg.wholeMap) return false;
        var prefix = $gameMap.mapId() + '|';
        var solved = LDP.state().solved;
        for (var k in solved) {
            if (solved[k] && k.indexOf(prefix) === 0) return true;
        }
        return false;
    };

    LDP.isDark = function() {
        if (LDP.mapLit()) return false;
        var st = LDP.state();
        if (st.mode === true || st.mode === false) return st.mode;
        return LDP.mapMeta().DarkLight !== undefined;
    };

    LDP.baseRadius = function() {
        var st = LDP.state();
        if (st.radius > 0) return st.radius;
        var m = LDP.mapMeta().DarkLight;
        if (typeof m === 'string' && Number(m) > 0) return Number(m);
        return cfg.radius;
    };

    LDP.baseOpacity = function() {
        var st = LDP.state();
        return st.opacity >= 0 ? st.opacity : cfg.opacity;
    };

    LDP.targetOpacity = function() {
        return LDP.isDark() ? LDP.baseOpacity() : 0;
    };

    //-------------------------------------------------------------------------
    // 이벤트 태그 파싱 (메모 + 주석)
    //-------------------------------------------------------------------------
    var RE_POINT  = /<LinePoint\s*:\s*([^,>]+?)\s*,\s*([^,>]+?)\s*>/i;
    var RE_SOURCE = /<LightSource\s*:\s*([^,>]+?)\s*(?:,\s*(\d+)\s*)?(?:,\s*(\d+)\s*)?>/i;
    var RE_LIGHT  = /<Light\s*:\s*(\d+)\s*>/i;

    LDP.noteText = function(ev) {
        var d = ev.event();
        return (d && d.note) || '';
    };

    LDP.pageComments = function(page) {
        var s = '';
        var list = page && page.list;
        if (!list) return s;
        for (var i = 0; i < list.length; i++) {
            var c = list[i];
            if (c.code === 108 || c.code === 408) s += c.parameters[0] + '\n';
        }
        return s;
    };

    // 이벤트 전체(메모 + 모든 페이지 주석)에서 읽은 태그 정보 (맵마다 캐시)
    LDP.info = function(ev) {
        var key = $gameMap.mapId() + '_' + ev.eventId();
        var cached = LDP._infoCache[key];
        if (cached) return cached;
        var d = ev.event();
        var text = LDP.noteText(ev);
        if (d && d.pages) {
            for (var p = 0; p < d.pages.length; p++) text += LDP.pageComments(d.pages[p]);
        }
        var info = { point: null, source: null, hasLight: false };
        var m = RE_POINT.exec(text);
        if (m) info.point = { group: m[1].toLowerCase(), color: m[2] };
        m = RE_SOURCE.exec(text);
        if (m) {
            info.source = {
                group: m[1].toLowerCase(),
                radius: m[2] ? Number(m[2]) : 0,
                switchId: m[3] ? Number(m[3]) : 0
            };
        }
        info.hasLight = RE_LIGHT.test(text);
        LDP._infoCache[key] = info;
        return info;
    };

    LDP.isActive = function(ev) {
        return !ev._erased && ev._pageIndex >= 0;
    };

    // <Light: 반경> (메모는 항상, 주석은 현재 페이지만)
    LDP.lightRadiusOf = function(ev) {
        if (!LDP.info(ev).hasLight) return 0;
        var text = LDP.noteText(ev) + LDP.pageComments(ev.page());
        var m = RE_LIGHT.exec(text);
        return m ? Number(m[1]) : 0;
    };

    //-------------------------------------------------------------------------
    // 색
    //-------------------------------------------------------------------------
    var COLORS = {
        'red': '#ff4d4d', '빨강': '#ff4d4d', '빨간색': '#ff4d4d',
        'orange': '#ff9f40', '주황': '#ff9f40', '주황색': '#ff9f40',
        'yellow': '#ffe94d', '노랑': '#ffe94d', '노란색': '#ffe94d',
        'green': '#4dff7a', '초록': '#4dff7a', '초록색': '#4dff7a',
        'cyan': '#4de8ff', '하늘': '#4de8ff', '하늘색': '#4de8ff',
        'blue': '#4d7dff', '파랑': '#4d7dff', '파란색': '#4d7dff',
        'purple': '#b366ff', '보라': '#b366ff', '보라색': '#b366ff',
        'pink': '#ff7ad9', '분홍': '#ff7ad9', '분홍색': '#ff7ad9',
        'white': '#ffffff', '흰색': '#ffffff', '하양': '#ffffff'
    };

    LDP.cssColor = function(name) {
        var k = String(name).trim().toLowerCase();
        return COLORS[k] || k;
    };

    //-------------------------------------------------------------------------
    // 선 / 연결점 / 완료 상태
    //-------------------------------------------------------------------------
    LDP.wires = function() {
        var st = LDP.state();
        var id = $gameMap.mapId();
        if (!st.wires[id]) st.wires[id] = [];
        return st.wires[id];
    };

    LDP.wireIndexOf = function(eventId) {
        var w = LDP.wires();
        for (var i = 0; i < w.length; i++) {
            if (w[i].a === eventId || w[i].b === eventId) return i;
        }
        return -1;
    };

    LDP.solvedKey = function(group, mapId) {
        return (mapId || $gameMap.mapId()) + '|' + String(group).toLowerCase();
    };

    LDP.isSolved = function(group, mapId) {
        return !!LDP.state().solved[LDP.solvedKey(group, mapId)];
    };

    // 현재 맵에서 활성화된 연결점 이벤트 (group 생략 시 전부)
    LDP.nodes = function(group) {
        var res = [];
        var events = $gameMap.events();
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];
            if (!LDP.isActive(ev)) continue;
            var pt = LDP.info(ev).point;
            if (!pt) continue;
            if (group === undefined || pt.group === group) res.push(ev);
        }
        return res;
    };

    LDP.groups = function() {
        var seen = {};
        var list = [];
        LDP.nodes().forEach(function(ev) {
            var g = LDP.info(ev).point.group;
            if (!seen[g]) { seen[g] = true; list.push(g); }
        });
        return list;
    };

    LDP.interact = function(ev) {
        var pt = LDP.info(ev).point;
        if (LDP.isSolved(pt.group)) return;
        var id = ev.eventId();

        // 이미 연결된 점 → 그 선 해제
        var wi = LDP.wireIndexOf(id);
        if (wi >= 0) {
            LDP.wires().splice(wi, 1);
            LDP._selected = 0;
            LDP.playSe('disconnect');
            return;
        }
        // 같은 점을 다시 → 선택 취소
        if (LDP._selected === id) {
            LDP._selected = 0;
            LDP.playSe('disconnect');
            return;
        }
        // 선택된 점이 없으면 선택
        var other = LDP._selected ? $gameMap.event(LDP._selected) : null;
        var op = other && LDP.isActive(other) ? LDP.info(other).point : null;
        if (!op) {
            LDP._selected = id;
            LDP.playSe('select');
            return;
        }
        // 다른 그룹이면 새로 선택
        if (op.group !== pt.group) {
            LDP._selected = id;
            LDP.playSe('select');
            return;
        }
        // 색이 다르면 실패
        if (LDP.cssColor(op.color) !== LDP.cssColor(pt.color)) {
            LDP._selected = 0;
            LDP.playSe('fail');
            return;
        }
        // 같은 색 → 연결
        LDP.wires().push({ a: LDP._selected, b: id, color: pt.color, group: pt.group });
        LDP._selected = 0;
        LDP.playSe('connect');
        LDP.checkSolved(pt.group);
    };

    LDP.checkSolved = function(group) {
        if (LDP.isSolved(group)) return;
        var nodes = LDP.nodes(group);
        if (nodes.length < 2) return;
        for (var i = 0; i < nodes.length; i++) {
            if (LDP.wireIndexOf(nodes[i].eventId()) < 0) return;
        }
        LDP.solve(group);
    };

    LDP.solve = function(group) {
        group = String(group).toLowerCase();
        LDP.state().solved[LDP.solvedKey(group)] = true;
        LDP._selected = 0;
        LDP.playSe('solved');
        var mapId = $gameMap.mapId();
        $gameMap.events().forEach(function(ev) {
            var src = LDP.info(ev).source;
            if (!src || src.group !== group) return;
            if (cfg.selfSwitch !== 'NONE') {
                $gameSelfSwitches.setValue([mapId, ev.eventId(), cfg.selfSwitch], true);
            }
            if (src.switchId > 0) $gameSwitches.setValue(src.switchId, true);
        });
    };

    // 아직 안 이어진 연결점을 같은 색끼리 자동으로 잇기 (강제 완료용)
    LDP.autoConnect = function(group) {
        var byColor = {};
        LDP.nodes(group).forEach(function(ev) {
            if (LDP.wireIndexOf(ev.eventId()) >= 0) return;
            var c = LDP.cssColor(LDP.info(ev).point.color);
            (byColor[c] = byColor[c] || []).push(ev);
        });
        Object.keys(byColor).forEach(function(c) {
            var arr = byColor[c];
            while (arr.length >= 2) {
                var a = arr.shift();
                var b = arr.shift();
                LDP.wires().push({
                    a: a.eventId(), b: b.eventId(),
                    color: LDP.info(a).point.color, group: group
                });
            }
        });
    };

    LDP.forceSolve = function(group) {
        group = String(group).toLowerCase();
        LDP.autoConnect(group);
        if (!LDP.isSolved(group)) LDP.solve(group);
    };

    LDP.reset = function(group) {
        group = String(group).toLowerCase();
        var st = LDP.state();
        var mapId = $gameMap.mapId();
        st.wires[mapId] = LDP.wires().filter(function(w) { return w.group !== group; });
        delete st.solved[LDP.solvedKey(group)];
        LDP._selected = 0;
        $gameMap.events().forEach(function(ev) {
            var src = LDP.info(ev).source;
            if (!src || src.group !== group) return;
            if (cfg.selfSwitch !== 'NONE') {
                $gameSelfSwitches.setValue([mapId, ev.eventId(), cfg.selfSwitch], false);
            }
        });
    };

    Game_System.prototype.ldpSolved = function(group, mapId) {
        return LDP.isSolved(group, mapId);
    };

    //-------------------------------------------------------------------------
    // 연결점 상호작용 (액션 버튼 / 접촉 트리거로 이벤트가 시작될 때)
    //-------------------------------------------------------------------------
    var _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function() {
        if (this._trigger <= 2 && LDP.isActive(this) && LDP.info(this).point) {
            LDP.interact(this);
        }
        _Game_Event_start.call(this);
    };

    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        LDP._selected = 0;
        LDP._infoCache = {};
    };

    //-------------------------------------------------------------------------
    // 플러그인 명령
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        var cmd = String(command).toLowerCase();
        var sub = String(args[0] || '').toLowerCase();

        if (cmd === 'darklight') {
            var st = LDP.state();
            if (sub === 'on') st.mode = true;
            else if (sub === 'off') st.mode = false;
            else if (sub === 'auto') st.mode = null;
            else if (sub === 'radius') st.radius = Math.max(0, Number(args[1] || 0));
            else if (sub === 'opacity') st.opacity = Math.min(255, Math.max(0, Number(args[1] || 0)));
        } else if (cmd === 'linepuzzle') {
            var groups = args[1] !== undefined ? [String(args[1]).toLowerCase()] : LDP.groups();
            if (sub === 'reset') {
                groups.forEach(function(g) { LDP.reset(g); });
            } else if (sub === 'solve') {
                groups.forEach(function(g) { LDP.forceSolve(g); });
            }
        }
    };

    //-------------------------------------------------------------------------
    // 좌표 변환: 맵 타일 좌표 -> 화면 좌표 (MapZoom, 화면 흔들림 반영)
    //-------------------------------------------------------------------------
    LDP.toScreen = function(ss, mapX, mapY) {
        var tw = $gameMap.tileWidth();
        var th = $gameMap.tileHeight();
        var sx = ($gameMap.adjustX(mapX) + 0.5) * tw;
        var sy = ($gameMap.adjustY(mapY) + 0.5) * th;
        return { x: ss.x + ss.scale.x * sx, y: ss.y + ss.scale.y * sy };
    };

    LDP.lights = function(ss) {
        var s = ss.scale.x;
        var list = [];
        var pc = LDP.toScreen(ss, $gamePlayer._realX, $gamePlayer._realY);
        list.push({ x: pc.x, y: pc.y, r: LDP.baseRadius() * s });

        var flick = cfg.flicker > 0 ? Math.sin((Graphics.frameCount >> 2) * 1.7) * cfg.flicker : 0;
        var events = $gameMap.events();
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];
            if (!LDP.isActive(ev)) continue;
            var info = LDP.info(ev);
            var r = 0;
            if (info.source && LDP.isSolved(info.source.group)) {
                r = info.source.radius || cfg.lampRadius;
            }
            var lr = LDP.lightRadiusOf(ev);
            if (lr > r) r = lr;
            if (r <= 0) continue;
            var p = LDP.toScreen(ss, ev._realX, ev._realY);
            list.push({ x: p.x, y: p.y, r: (r + flick) * s });
        }
        return list;
    };

    //-------------------------------------------------------------------------
    // Sprite_LDPDark - 어둠 레이어 (절반 해상도로 그려서 2배 확대)
    //-------------------------------------------------------------------------
    function Sprite_LDPDark() {
        this.initialize.apply(this, arguments);
    }

    Sprite_LDPDark.prototype = Object.create(Sprite.prototype);
    Sprite_LDPDark.prototype.constructor = Sprite_LDPDark;

    Sprite_LDPDark.prototype.initialize = function(spriteset) {
        Sprite.prototype.initialize.call(this);
        this._spriteset = spriteset;
        this._div = 2;
        this.bitmap = new Bitmap(Math.ceil(Graphics.width / this._div), Math.ceil(Graphics.height / this._div));
        this.scale.x = this._div;
        this.scale.y = this._div;
        this._current = LDP.targetOpacity();   // 맵에 들어올 때는 바로 적용
        this._lastKey = '';
        this.visible = this._current > 0;
    };

    Sprite_LDPDark.prototype.update = function() {
        Sprite.prototype.update.call(this);
        var target = LDP.targetOpacity();
        var step = 255 / (LDP.mapLit() ? cfg.litFade : cfg.fade);
        if (this._current < target) this._current = Math.min(target, this._current + step);
        else if (this._current > target) this._current = Math.max(target, this._current - step);

        this.visible = this._current > 0;
        if (!this.visible) {
            this._lastKey = '';
            return;
        }
        var lights = LDP.lights(this._spriteset);
        var key = Math.round(this._current) + '|' + lights.map(function(l) {
            return Math.round(l.x) + ',' + Math.round(l.y) + ',' + Math.round(l.r);
        }).join(';');
        if (key === this._lastKey) return;
        this._lastKey = key;
        this.redraw(lights, this._current / 255);
    };

    Sprite_LDPDark.prototype.redraw = function(lights, alpha) {
        var bmp = this.bitmap;
        var ctx = bmp._context;
        var d = this._div;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, bmp.width, bmp.height);
        ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
        ctx.fillRect(0, 0, bmp.width, bmp.height);
        ctx.globalCompositeOperation = 'destination-out';
        for (var i = 0; i < lights.length; i++) {
            var x = lights[i].x / d;
            var y = lights[i].y / d;
            var r = lights[i].r / d;
            if (r <= 0) continue;
            var g = ctx.createRadialGradient(x, y, r * cfg.core, x, y, r);
            g.addColorStop(0, 'rgba(0,0,0,1)');
            g.addColorStop(0.5, 'rgba(0,0,0,0.55)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        bmp._setDirty();
    };

    //-------------------------------------------------------------------------
    // Sprite_LDPWires - 연결점 / 선 / 선택 표시 레이어
    //-------------------------------------------------------------------------
    function Sprite_LDPWires() {
        this.initialize.apply(this, arguments);
    }

    Sprite_LDPWires.prototype = Object.create(Sprite.prototype);
    Sprite_LDPWires.prototype.constructor = Sprite_LDPWires;

    Sprite_LDPWires.prototype.initialize = function(spriteset) {
        Sprite.prototype.initialize.call(this);
        this._spriteset = spriteset;
        this.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._lastKey = '';
    };

    Sprite_LDPWires.prototype.update = function() {
        Sprite.prototype.update.call(this);
        var ss = this._spriteset;
        var nodes = LDP.nodes();
        var selected = LDP._selected;
        var wires = LDP.wires();

        var items = {};
        var order = [];
        for (var i = 0; i < nodes.length; i++) {
            var ev = nodes[i];
            var id = ev.eventId();
            var p = LDP.toScreen(ss, ev._realX, ev._realY);
            items[id] = {
                id: id, x: p.x, y: p.y,
                color: LDP.cssColor(LDP.info(ev).point.color),
                connected: LDP.wireIndexOf(id) >= 0
            };
            order.push(items[id]);
        }

        var pc = selected ? LDP.toScreen(ss, $gamePlayer._realX, $gamePlayer._realY) : null;
        var key = order.map(function(it) {
            return it.id + ':' + Math.round(it.x) + ',' + Math.round(it.y) + (it.connected ? 'c' : 'o');
        }).join(';') + '|' + wires.length + '|' + selected + '|' + ss.scale.x;
        if (selected) key += '|' + (Graphics.frameCount >> 2) + '|' + Math.round(pc.x) + ',' + Math.round(pc.y);

        if (key === this._lastKey) return;
        this._lastKey = key;
        this.redraw(ss, items, order, wires, selected, pc);
    };

    Sprite_LDPWires.prototype.redraw = function(ss, items, order, wires, selected, pc) {
        var bmp = this.bitmap;
        var ctx = bmp._context;
        var s = ss.scale.x;
        ctx.save();
        ctx.clearRect(0, 0, bmp.width, bmp.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 연결된 선
        for (var i = 0; i < wires.length; i++) {
            var a = items[wires[i].a];
            var b = items[wires[i].b];
            if (!a || !b) continue;
            ctx.save();
            ctx.shadowColor = a.color;
            ctx.shadowBlur = 12 * s;
            ctx.strokeStyle = a.color;
            ctx.lineWidth = cfg.wireWidth * s;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = cfg.wireWidth * s * 0.35;
            ctx.stroke();
            ctx.restore();
        }

        // 선택된 점 -> 플레이어 미리보기 점선
        var sel = selected ? items[selected] : null;
        if (sel && pc) {
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = sel.color;
            ctx.lineWidth = Math.max(2, cfg.wireWidth * s * 0.5);
            if (ctx.setLineDash) ctx.setLineDash([8 * s, 6 * s]);
            ctx.beginPath();
            ctx.moveTo(sel.x, sel.y);
            ctx.lineTo(pc.x, pc.y);
            ctx.stroke();
            ctx.restore();
        }

        // 연결점
        for (var j = 0; j < order.length; j++) {
            var it = order[j];
            var r = 10 * s;
            ctx.save();
            ctx.beginPath();
            ctx.arc(it.x, it.y, r, 0, Math.PI * 2);
            ctx.fillStyle = it.connected ? it.color : 'rgba(0,0,0,0.65)';
            ctx.fill();
            ctx.lineWidth = 3 * s;
            ctx.strokeStyle = it.color;
            ctx.shadowColor = it.color;
            ctx.shadowBlur = 8 * s;
            ctx.stroke();
            if (it.id === selected) {
                var pulse = 1 + 0.25 * Math.sin(Graphics.frameCount * 0.25);
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(it.x, it.y, r * 1.6 * pulse, 0, Math.PI * 2);
                ctx.lineWidth = 2 * s;
                ctx.strokeStyle = 'rgba(255,255,255,0.9)';
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.restore();
        bmp._setDirty();
    };

    //-------------------------------------------------------------------------
    // Scene_Map - 맵 화면 위, 윈도우 아래에 레이어 추가
    //-------------------------------------------------------------------------
    var _Scene_Map_createSpriteset = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function() {
        _Scene_Map_createSpriteset.call(this);
        this.createLDPLayers();
    };

    Scene_Map.prototype.createLDPLayers = function() {
        this._ldpDark = new Sprite_LDPDark(this._spriteset);
        this._ldpWires = new Sprite_LDPWires(this._spriteset);
        if (cfg.wiresAbove) {
            this.addChild(this._ldpDark);
            this.addChild(this._ldpWires);
        } else {
            this.addChild(this._ldpWires);
            this.addChild(this._ldpDark);
        }
    };

})();
