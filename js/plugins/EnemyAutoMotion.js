//=============================================================================
// EnemyAutoMotion.js
// 그림 한 장만으로 적 캐릭터가 "4단계 × 1초"로 자동 움직이게 합니다.
// (아래 중앙 기준으로 세로 크기만 조금씩 줄었다 늘어나는 숨쉬기/꿈틀 효과)
// 올려준 4장의 그림 높이 비율(100% → 97.9% → 94.7% → 97.9%)을 기본값으로 씁니다.
//=============================================================================
var Imported = Imported || {};
Imported.EnemyAutoMotion = true;

var RS = RS || {};
RS.EAM = RS.EAM || {};

/*:
 * @plugindesc v1.0 그림 한 장으로 적을 단계별 자동 움직임 (아래 기준)
 * @author ㄹㅅㅁ
 *
 * @param Default Steps
 * @desc 단계별 세로 배율(쉼표 구분). 1이 원래 크기.
 * @default 1, 0.979, 0.947, 0.979
 *
 * @param Default Seconds
 * @desc 한 단계당 시간(초)
 * @default 1
 *
 * @param Freeze On Collapse
 * @desc 쓰러짐/사라짐 연출 중 움직임을 멈출지 (true/false)
 * @default true
 *
 * @help
 * =============================================================================
 * 사용 방법 (그림은 한 장이면 됩니다)
 * =============================================================================
 * 적 캐릭터 메모란에 적습니다.
 *
 *   <AutoMotion>
 *
 * 이것만 적으면 기본값(4단계, 1초씩, 계속 반복)으로 움직입니다.
 * 기준점은 이미지 "아래 가운데"라서 발바닥은 고정되고 위쪽만 움직입니다.
 *
 * 옵션 (필요할 때만)
 *   <AutoMotion: 1, 0.97, 0.93, 0.97>   단계별 세로 배율을 직접 지정
 *                                         (단계 수는 자유, 2개 이상)
 *   <AutoMotionTime: 0.5>               한 단계당 시간(초)
 *   <AutoMotionWide: 1, 1.02, 1.04, 1.02> 단계별 가로 배율 (찌그러지는 느낌용, 생략 가능)
 *   <AutoMotionSmooth>                  단계 사이를 부드럽게 이어서 움직임
 *                                         (없으면 딱딱 끊어서 바뀜)
 *
 * =============================================================================
 * 주의
 * =============================================================================
 * - 노트태그가 없는 적은 기존과 동일합니다.
 * - SV(사이드뷰) 배틀러에는 적용되지 않습니다.
 * - EnemyFrameLoop(여러 장 교체 방식), EnemyImageAnimation(시트 방식)과
 *   같이 써도 되지만, 같은 적에게 겹치면 움직임이 이중으로 보일 수 있어요.
 * - YEP 계열 플러그인 아래에 두세요.
 *
 * 2026.10.06 (v1.0) - 최초 작성
 */

(function() {

  var params = PluginManager.parameters('EnemyAutoMotion');

  function parseList(str, fallback) {
    var arr = String(str || '').split(',').map(function(s) { return Number(s.trim()); })
      .filter(function(n) { return !isNaN(n) && n > 0; });
    return arr.length >= 2 ? arr : fallback;
  }

  var defaultSteps = parseList(params['Default Steps'], [1, 0.979, 0.947, 0.979]);
  var defaultSeconds = Number(params['Default Seconds'] || 1);
  var freezeOnCollapse = String(params['Freeze On Collapse'] || 'true') === 'true';

  RS.EAM.getData = function(enemy) {
    if (enemy._eamData !== undefined) return enemy._eamData;
    var note = enemy.note || '';
    var data = null;
    if (/<AutoMotion(?::[^>]*)?>/i.test(note)) {
      var m = /<AutoMotion:\s*([^>]+?)\s*>/i.exec(note);
      var steps = m ? parseList(m[1], defaultSteps) : defaultSteps;
      var wm = /<AutoMotionWide:\s*([^>]+?)\s*>/i.exec(note);
      var wide = wm ? parseList(wm[1], null) : null;
      if (wide && wide.length !== steps.length) wide = null;
      var tm = /<AutoMotionTime:\s*([\d.]+)\s*>/i.exec(note);
      var sec = tm ? Number(tm[1]) : defaultSeconds;
      data = {
        steps: steps,
        wide: wide,
        ticks: Math.max(1, Math.round(sec * 60)),
        smooth: /<AutoMotionSmooth>/i.test(note)
      };
    }
    enemy._eamData = data;
    return data;
  };

  var _initMembers = Sprite_Enemy.prototype.initMembers;
  Sprite_Enemy.prototype.initMembers = function() {
    _initMembers.call(this);
    this._eamTime = 0;
    this._eamBaseX = null;
    this._eamBaseY = null;
  };

  var _update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function() {
    _update.call(this);
    this.updateEAM();
  };

  Sprite_Enemy.prototype.updateEAM = function() {
    if (this._svBattlerEnabled || !this._enemy) return;
    var enemyData = this._enemy.enemy();
    var data = enemyData ? RS.EAM.getData(enemyData) : null;
    if (!data) return;

    // 원래 배율을 처음 한 번 기억해 둠 (다른 효과와 곱해지도록)
    if (this._eamBaseX === null) {
      this._eamBaseX = this.scale.x;
      this._eamBaseY = this.scale.y;
    }

    var collapsing = freezeOnCollapse && this._effectType &&
      (this._effectType === 'collapse' || this._effectType === 'bossCollapse' ||
       this._effectType === 'instantCollapse' || this._effectType === 'whiten');
    if (collapsing || this._appeared === false) {
      this.scale.x = this._eamBaseX;
      this.scale.y = this._eamBaseY;
      return;
    }

    this._eamTime++;
    var n = data.steps.length;
    var total = data.ticks * n;
    var t = this._eamTime % total;
    var idx = Math.floor(t / data.ticks);
    var fy = data.steps[idx];
    var fx = data.wide ? data.wide[idx] : 1;

    if (data.smooth) {
      var rate = (t % data.ticks) / data.ticks;
      var nxt = (idx + 1) % n;
      fy = fy + (data.steps[nxt] - fy) * rate;
      if (data.wide) fx = fx + (data.wide[nxt] - fx) * rate;
    }

    // 스프라이트 anchor = (0.5, 1) → 아래 가운데 고정, 위쪽만 움직임
    this.scale.x = this._eamBaseX * fx;
    this.scale.y = this._eamBaseY * fy;
  };

})();
