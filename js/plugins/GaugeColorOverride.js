//=============================================================================
// GaugeColorOverride.js
//=============================================================================
/*:
 * @plugindesc HP/TP 게이지 색상을 지정합니다. (RPG Maker MV 전용, 전투 화면 포함)
 * @author ㄹㅅㅁ
 *
 * @param HP Color 1
 * @desc HP 게이지 그라데이션 시작 색 (#rrggbb)
 * @default #ff3b3b
 *
 * @param HP Color 2
 * @desc HP 게이지 그라데이션 끝 색 (#rrggbb)
 * @default #ff9a9a
 *
 * @param TP Color 1
 * @desc TP 게이지 그라데이션 시작 색 (#rrggbb)
 * @default #3b8bff
 *
 * @param TP Color 2
 * @desc TP 게이지 그라데이션 끝 색 (#rrggbb)
 * @default #9ad0ff
 *
 * @param Gauge Back Color
 * @desc 게이지 배경 색 (#rrggbb). 비워두면 기존 색을 그대로 사용합니다.
 * @default
 *
 * @help
 * 플러그인 목록에서 YEP_CoreEngine, YEP_BattleStatusWindow 및
 * 게이지를 그리는 다른 커스텀 플러그인보다 "아래"에 두세요.
 *
 * 동작 방식
 * 1) Window_Base의 hpGaugeColor1/2, tpGaugeColor1/2를 덮어씁니다.
 * 2) drawActorHp / drawActorTp 실행 중에 호출되는 drawGauge의 색을
 *    강제로 지정 색으로 바꿉니다. (다른 플러그인이 색을 직접 넘겨도 적용됨)
 *
 * 주의: drawActorHp/drawActorTp를 거치지 않고 drawGauge를 직접 호출해서
 * HP/TP를 그리는 플러그인은 1)번 방식으로만 적용됩니다.
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('GaugeColorOverride');
    var hpColor1 = String(params['HP Color 1'] || '#ff3b3b');
    var hpColor2 = String(params['HP Color 2'] || '#ff9a9a');
    var tpColor1 = String(params['TP Color 1'] || '#3b8bff');
    var tpColor2 = String(params['TP Color 2'] || '#9ad0ff');
    var backColor = String(params['Gauge Back Color'] || '').trim();

    // 1) 색상 함수 덮어쓰기 (MV)
    Window_Base.prototype.hpGaugeColor1 = function() { return hpColor1; };
    Window_Base.prototype.hpGaugeColor2 = function() { return hpColor2; };
    Window_Base.prototype.tpGaugeColor1 = function() { return tpColor1; };
    Window_Base.prototype.tpGaugeColor2 = function() { return tpColor2; };

    // 2) drawActorHp / drawActorTp 중에는 drawGauge 색을 강제 지정
    var _forced = null;

    var _drawGauge = Window_Base.prototype.drawGauge;
    Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
        if (_forced) {
            color1 = _forced[0];
            color2 = _forced[1];
        }
        _drawGauge.call(this, x, y, width, rate, color1, color2);
    };

    var _drawActorHp = Window_Base.prototype.drawActorHp;
    Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
        _forced = [hpColor1, hpColor2];
        try {
            _drawActorHp.apply(this, arguments);
        } finally {
            _forced = null;
        }
    };

    var _drawActorTp = Window_Base.prototype.drawActorTp;
    Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
        _forced = [tpColor1, tpColor2];
        try {
            _drawActorTp.apply(this, arguments);
        } finally {
            _forced = null;
        }
    };

    // 배경 색 (선택)
    if (backColor) {
        Window_Base.prototype.gaugeBackColor = function() { return backColor; };
    }
})();
