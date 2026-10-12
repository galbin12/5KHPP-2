//=============================================================================
// MenuCommandWindowStyle.js
//=============================================================================

/*:
 * @plugindesc 메인 메뉴 커맨드 창(아이템/프로필/옵션/게임종료)의 배경 불투명도와
 * 선택 항목 글자 크기 강조 효과를 적용합니다.
 * @author RS
 *
 * @param Background Opacity
 * @desc 창 배경 불투명도 (0~255). 70% = 178
 * @default 178
 *
 * @param Selected Font Size
 * @desc 선택된 항목의 글자 크기
 * @default 30
 *
 * @param Normal Font Size
 * @desc 선택되지 않은 항목의 글자 크기
 * @default 20
 *
 * @help
 * 메인 메뉴 커맨드 창(Window_MenuCommand)에만 적용됩니다.
 * 선택된 항목은 큰 글씨로, 나머지는 작은 글씨로 그려집니다.
 */

(function() {

    var params = PluginManager.parameters('MenuCommandWindowStyle');
    var bgOpacity = Number(params['Background Opacity'] || 178);
    var selectedSize = Number(params['Selected Font Size'] || 30);
    var normalSize = Number(params['Normal Font Size'] || 20);

    //-----------------------------------------------------------------------
    // Window_MenuCommand
    //-----------------------------------------------------------------------

    var _Window_MenuCommand_initialize = Window_MenuCommand.prototype.initialize;
    Window_MenuCommand.prototype.initialize = function() {
        _Window_MenuCommand_initialize.call(this);
        this.opacity = bgOpacity;
    };

    // 선택 항목이 바뀔 때마다 다시 그리도록 select를 오버라이드
    var _Window_MenuCommand_select = Window_MenuCommand.prototype.select;
    Window_MenuCommand.prototype.select = function(index) {
        var changed = (index !== this.index());
        _Window_MenuCommand_select.call(this, index);
        if (changed) {
            this.refresh();
        }
    };

    Window_MenuCommand.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var isSelected = (index === this.index());
        var align = this.itemTextAlign ? this.itemTextAlign() : 'left';

        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));

        this.contents.fontSize = isSelected ? selectedSize : normalSize;

        // 글자 크기가 달라도 항목 세로 중앙에 오도록 y 위치 보정
        var lineHeight = this.lineHeight();
        var fontSize = this.contents.fontSize;
        var y = rect.y + (lineHeight - fontSize) / 2 - 2;

        this.drawText(this.commandName(index), rect.x, y, rect.width, align);

        // 다음 항목을 위해 기본 폰트 크기로 복원
        this.resetFontSettings();
    };

})();
