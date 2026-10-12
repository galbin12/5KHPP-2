//=============================================================================
// CenterBattleStatusWindow.js
//=============================================================================
/*:
 * @plugindesc v1.00 정면전투 파티 상태창을 화면 중앙에 정렬합니다.
 * @author Claude
 *
 * @param Window Width
 * @type number
 * @min 100
 * @desc 상태창 전체 너비(px). 화면 너비(816)보다 작게 설정하면
 * 중앙 정렬 시 좌우로 여백이 생깁니다.
 * @default 600
 *
 * @help
 * ============================================================================
 * 문제
 * ============================================================================
 * RPG Maker MV 기본 코어는 전투 상태창(Window_BattleStatus)을
 *   windowWidth = Graphics.boxWidth - 192
 *   x = Graphics.boxWidth - windowWidth   (= 항상 192)
 * 로 계산합니다. 즉 왼쪽에 192px만 비우고 나머지 전부를 오른쪽에
 * 딱 붙여서 그리도록 만들어져 있어서, 파티원 수와 상관없이
 * 항상 화면 오른쪽에 치우쳐 보입니다.
 *
 * 이 플러그인은 상태창 너비를 파라미터로 고정하고, 화면 정중앙에
 * 오도록 x 좌표를 다시 계산합니다.
 *
 * ============================================================================
 * 배치 순서
 * ============================================================================
 * YEP_BattleEngineCore, YEP_BattleStatusWindow 보다 아래에 배치하세요.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.CenterBattleStatusWindow = true;

(function() {
    'use strict';

    var parameters = PluginManager.parameters('CenterBattleStatusWindow');
    var fixedWidth = Number(parameters['Window Width'] || 600);

    Window_BattleStatus.prototype.windowWidth = function() {
        return Math.min(fixedWidth, Graphics.boxWidth);
    };

    var _Window_BattleStatus_initialize = Window_BattleStatus.prototype.initialize;
    Window_BattleStatus.prototype.initialize = function() {
        _Window_BattleStatus_initialize.call(this);
        this.x = Math.floor((Graphics.boxWidth - this.width) / 2);
    };

})();

//=============================================================================
// End of File
//=============================================================================
