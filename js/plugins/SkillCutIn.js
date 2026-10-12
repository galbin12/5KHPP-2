//=============================================================================
// SkillCutIn.js
//=============================================================================

/*:
 * @plugindesc v1.0 특정 스킬 사용 전, 사진 2장이 교차로 지나가는 연출(빠르게→느리게→빠르게) 후 스킬 발동
 * @author 류수민
 *
 * @param Picture1
 * @text 사진1 파일명
 * @desc 왼쪽 → 오른쪽으로 지나가는 사진 (img/pictures, 확장자 제외)
 * @default CutIn1
 *
 * @param Picture2
 * @text 사진2 파일명
 * @desc 오른쪽 → 왼쪽으로 지나가는 사진 (img/pictures, 확장자 제외)
 * @default CutIn2
 *
 * @param Y1
 * @text 사진1 Y좌표
 * @desc 사진1의 세로 위치(px). -1이면 화면 세로 중앙.
 * @type number
 * @min -1
 * @default 90
 *
 * @param Y2
 * @text 사진2 Y좌표
 * @desc 사진2의 세로 위치(px). -1이면 화면 맨 아래에 붙임.
 * @type number
 * @min -1
 * @default -1
 *
 * @param FastFrames
 * @text 빠른 구간 프레임
 * @desc 등장 / 퇴장 구간에 걸리는 프레임 수 (60프레임 = 1초). 작을수록 빠름.
 * @type number
 * @min 1
 * @default 10
 *
 * @param SlowFrames
 * @text 느린 구간 프레임
 * @desc 화면 중앙을 천천히 지나가는 구간의 프레임 수. 클수록 오래 머묾.
 * @type number
 * @min 1
 * @default 60
 *
 * @param SlowDistance
 * @text 느린 구간 거리
 * @desc 중앙에서 천천히 이동하는 거리(px).
 * @type number
 * @min 0
 * @default 160
 *
 * @param SeName
 * @text 효과음 파일
 * @desc 사진이 나타날 때 재생할 효과음 (audio/se). 비워두면 재생하지 않음.
 * @type file
 * @dir audio/se/
 * @default
 *
 * @param SeVolume
 * @text 효과음 볼륨
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param SePitch
 * @text 효과음 피치
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param SePan
 * @text 효과음 팬
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @param OverWindows
 * @text 윈도우 위에 표시
 * @desc ON이면 상태창 등 윈도우보다 위에, OFF이면 아래에 표시합니다.
 * @type boolean
 * @on 위
 * @off 아래
 * @default true
 *
 * @help
 * ============================================================================
 * SkillCutIn.js - 스킬 컷인 연출
 * ============================================================================
 * 데이터베이스 > 스킬의 [메모]란에 아래 태그를 적으면, 그 스킬을 쓸 때
 * 스킬이 발동하기 전에 사진 2장이 아래 순서로 지나갑니다.
 *
 *   사진1 : 왼쪽 → 오른쪽
 *   사진2 : 오른쪽 → 왼쪽
 *   속도  : 빠르게 등장 → 중앙에서 느리게 통과 → 빠르게 퇴장
 *   효과음 : 사진이 나타나는 순간 1회 재생 (파라미터 '효과음 파일')
 *   끝나면 : 스킬 발동 (스킬명 표시, 애니메이션, 대미지 등)
 *
 * ----------------------------------------------------------------------------
 * 메모 태그
 * ----------------------------------------------------------------------------
 *   <CutIn>
 *   <컷인>
 *     플러그인 파라미터에 지정한 사진 2장을 사용합니다.
 *
 *   <CutIn: 파일명1, 파일명2>
 *   <컷인: 파일명1, 파일명2>
 *     이 스킬에서만 다른 사진 2장을 사용합니다. (img/pictures, 확장자 제외)
 *
 * ----------------------------------------------------------------------------
 * 사용 팁
 * ----------------------------------------------------------------------------
 * - 사진 파일은 img/pictures 폴더에 넣어주세요.
 * - 플러그인 목록에서는 YEP 계열 플러그인들보다 아래에 두세요.
 * - 사진 크기가 화면보다 크면 잘려 보일 수 있습니다.
 */

(function() {
    'use strict';

    var PLUGIN_NAME = 'SkillCutIn';
    var params = PluginManager.parameters(PLUGIN_NAME);

    var P = {
        pic1: String(params['Picture1'] || 'CutIn1'),
        pic2: String(params['Picture2'] || 'CutIn2'),
        y1: Number(params['Y1'] !== undefined ? params['Y1'] : 90),
        y2: Number(params['Y2'] !== undefined ? params['Y2'] : -1),
        fast: Math.max(1, Number(params['FastFrames'] || 10)),
        slow: Math.max(1, Number(params['SlowFrames'] || 60)),
        slowDist: Number(params['SlowDistance'] !== undefined ? params['SlowDistance'] : 160),
        overWindows: String(params['OverWindows'] || 'true') === 'true',
        seName: String(params['SeName'] || ''),
        seVolume: Number(params['SeVolume'] !== undefined ? params['SeVolume'] : 90),
        sePitch: Number(params['SePitch'] !== undefined ? params['SePitch'] : 100),
        sePan: Number(params['SePan'] !== undefined ? params['SePan'] : 0)
    };

    //-------------------------------------------------------------------------
    // 메모 태그 해석
    //-------------------------------------------------------------------------
    var TAG_REGEX = /<(?:CutIn|컷인)(?:\s*:\s*([^,>]+?)\s*,\s*([^>]+?))?\s*>/i;

    function parseCutInNote(item) {
        if (!item || !item.note) return null;
        var m = TAG_REGEX.exec(item.note);
        if (!m) return null;
        if (m[1] && m[2]) return [m[1].trim(), m[2].trim()];
        return [P.pic1, P.pic2];
    }

    //-------------------------------------------------------------------------
    // Sprite_SkillCutIn : 사진 1장의 이동 연출
    //-------------------------------------------------------------------------
    function Sprite_SkillCutIn() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SkillCutIn.prototype = Object.create(Sprite.prototype);
    Sprite_SkillCutIn.prototype.constructor = Sprite_SkillCutIn;

    // direction: 1 = 왼쪽→오른쪽, -1 = 오른쪽→왼쪽
    Sprite_SkillCutIn.prototype.initialize = function(name, direction, yParam, onStart, onFinish) {
        Sprite.prototype.initialize.call(this);
        this.bitmap = ImageManager.loadPicture(name);
        this._direction = direction;
        this._yParam = yParam;
        this._onStart = onStart;
        this._onFinish = onFinish;
        this._count = -1;       // -1: 이미지 로딩 대기
        this._waitCount = 0;
        this._finished = false;
        this.visible = false;
    };

    Sprite_SkillCutIn.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._finished) return;
        if (this._count < 0) {
            this.updateLoading();
        } else {
            this.updateMotion();
        }
    };

    Sprite_SkillCutIn.prototype.updateLoading = function() {
        this._waitCount++;
        var failed = (this.bitmap.isError && this.bitmap.isError()) || this._waitCount > 600;
        if (failed) {
            this.finish();
        } else if (this.bitmap.isReady()) {
            this.setupMotion();
        }
    };

    Sprite_SkillCutIn.prototype.setupMotion = function() {
        var w = this.bitmap.width;
        var h = this.bitmap.height;
        var sw = Graphics.width;
        var center = (sw - w) / 2;
        var half = P.slowDist / 2;
        if (this._direction > 0) {
            this._x0 = -w;
            this._x1 = center - half;
            this._x2 = center + half;
            this._x3 = sw;
        } else {
            this._x0 = sw;
            this._x1 = center + half;
            this._x2 = center - half;
            this._x3 = -w;
        }
        this.y = (this._yParam >= 0) ? this._yParam : (Graphics.height - h);
        this.x = this._x0;
        this._count = 0;
        this.visible = true;
        if (this._onStart) this._onStart();
    };

    Sprite_SkillCutIn.prototype.updateMotion = function() {
        this._count++;
        var c = this._count;
        var F = P.fast;
        var S = P.slow;
        var total = F + S + F;
        if (c >= total) {
            this.x = this._x3;
            this.finish();
            return;
        }
        if (c < F) {
            // 1구간: 빠르게 등장
            this.x = this.lerp(this._x0, this._x1, c / F);
        } else if (c < F + S) {
            // 2구간: 중앙에서 느리게 통과
            this.x = this.lerp(this._x1, this._x2, (c - F) / S);
        } else {
            // 3구간: 빠르게 퇴장
            this.x = this.lerp(this._x2, this._x3, (c - F - S) / F);
        }
    };

    Sprite_SkillCutIn.prototype.lerp = function(a, b, t) {
        return a + (b - a) * t;
    };

    Sprite_SkillCutIn.prototype.finish = function() {
        this._finished = true;
        this.visible = false;
        if (this.parent) this.parent.removeChild(this);
        if (this._onFinish) this._onFinish();
    };

    //-------------------------------------------------------------------------
    // Scene_Battle : 연출 레이어와 재생
    //-------------------------------------------------------------------------
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this.createSkillCutInLayer();
    };

    Scene_Battle.prototype.createSkillCutInLayer = function() {
        this._cutInLayer = new Sprite();
        this._cutInRemain = 0;
        if (P.overWindows) {
            this.addChild(this._cutInLayer);
        } else {
            var index = this.children.indexOf(this._windowLayer);
            this.addChildAt(this._cutInLayer, Math.max(0, index));
        }
    };

    Scene_Battle.prototype.startSkillCutIn = function(name1, name2) {
        this._cutInRemain = 2;
        this._cutInSePlayed = false;
        var onStart = this.onSkillCutInStart.bind(this);
        var onFinish = this.onSkillCutInFinish.bind(this);
        this._cutInLayer.addChild(new Sprite_SkillCutIn(name1, 1, P.y1, onStart, onFinish));
        this._cutInLayer.addChild(new Sprite_SkillCutIn(name2, -1, P.y2, onStart, onFinish));
    };

    // 사진이 처음 나타나는 순간, 효과음을 한 번만 재생
    Scene_Battle.prototype.onSkillCutInStart = function() {
        if (this._cutInSePlayed) return;
        this._cutInSePlayed = true;
        if (P.seName) {
            AudioManager.playSe({
                name: P.seName,
                volume: P.seVolume,
                pitch: P.sePitch,
                pan: P.sePan
            });
        }
    };

    Scene_Battle.prototype.onSkillCutInFinish = function() {
        this._cutInRemain--;
        if (this._cutInRemain <= 0) {
            BattleManager.endSkillCutIn();
        }
    };

    //-------------------------------------------------------------------------
    // BattleManager : 스킬 발동 전에 연출을 끼워 넣기
    //-------------------------------------------------------------------------
    var _BattleManager_processTurn = BattleManager.processTurn;
    BattleManager.processTurn = function() {
        var subject = this._subject;
        var action = subject ? subject.currentAction() : null;

        // 연출이 방금 끝난 행동은 그대로 통과 → 원래 스킬 발동
        if (action && action === this._cutInDoneAction) {
            this._cutInDoneAction = null;
            _BattleManager_processTurn.call(this);
            return;
        }

        if (action && this.startSkillCutIn(action)) return;
        _BattleManager_processTurn.call(this);
    };

    BattleManager.startSkillCutIn = function(action) {
        if (!(SceneManager._scene instanceof Scene_Battle)) return false;
        if (!action.isSkill() || !action.isValid()) return false;
        var names = parseCutInNote(action.item());
        if (!names) return false;
        this._cutInAction = action;
        this._cutInPrevPhase = this._phase;
        this._phase = 'cutin'; // 알 수 없는 phase라 update가 멈춰 있음
        SceneManager._scene.startSkillCutIn(names[0], names[1]);
        return true;
    };

    BattleManager.endSkillCutIn = function() {
        this._cutInDoneAction = this._cutInAction;
        this._cutInAction = null;
        this._phase = this._cutInPrevPhase || 'turn';
        this._cutInPrevPhase = null;
    };

    // 전투가 중간에 끝나는 경우를 대비해 초기화
    var _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function(troopId, canEscape, canLose) {
        _BattleManager_setup.call(this, troopId, canEscape, canLose);
        this._cutInAction = null;
        this._cutInDoneAction = null;
        this._cutInPrevPhase = null;
    };

})();
