//=============================================================================
// ChoiceDescriptionWindow.js
//=============================================================================

/*:
 * @plugindesc 선택지(Show Choices) 옆에 아이템 설명 창을 표시합니다.
 * @author Claude
 *
 * @param Window X
 * @type number
 * @default 8
 *
 * @param Window Y
 * @type number
 * @default 285
 *
 * @param Window Width
 * @type number
 * @default 270
 *
 * @param Window Height
 * @type number
 * @default 130
 *
 * @param Font Size
 * @type number
 * @default 24
 *
 * @help
 * ==============================================================================
 * 사용법
 * ==============================================================================
 * 별도로 설명을 적을 필요 없습니다.
 * 선택지에 적은 문구(예: "양동이")와 이름이 똑같은 아이템/무기/방어구를
 * 데이터베이스에서 자동으로 찾아서, 그 아이템에 적힌 "설명(Description)"을
 * 그대로 보여줍니다. (액터 설명이 자동으로 뜨는 것과 같은 원리)
 *
 * 즉, 데이터베이스 > 아이템(또는 무기/방어구) > 해당 항목의 "설명"란에
 * 원하는 문구를 적어두기만 하면 끝입니다.
 *
 * 선택지 문구와 아이템 이름이 정확히 일치해야 합니다.
 * (일치하는 아이템이 없으면 설명 창은 비어 있게 됩니다.)
 */

(function () {
    'use strict';

    var params = PluginManager.parameters('ChoiceDescriptionWindow');
    var windowX = Number(params['Window X'] || 8);
    var windowY = Number(params['Window Y'] || 285);
    var windowWidth = Number(params['Window Width'] || 270);
    var windowHeight = Number(params['Window Height'] || 130);
    var fontSize = Number(params['Font Size'] || 24);

    //--------------------------------------------------------------------
    // 아이템/무기/방어구 이름으로 설명(description) 찾기
    //--------------------------------------------------------------------

    var databaseIndexCache = null;

    function buildDatabaseIndex() {
        var index = {};
        [$dataItems, $dataWeapons, $dataArmors].forEach(function (group) {
            if (!group) return;
            for (var i = 1; i < group.length; i++) {
                var entry = group[i];
                if (entry && entry.name) {
                    index[entry.name] = entry.description || '';
                }
            }
        });
        return index;
    }

    function findDescriptionByName(name) {
        if (!databaseIndexCache) {
            databaseIndexCache = buildDatabaseIndex();
        }
        return databaseIndexCache.hasOwnProperty(name) ? databaseIndexCache[name] : '';
    }

    //--------------------------------------------------------------------
    // Window_ChoiceDescription
    //--------------------------------------------------------------------

    function Window_ChoiceDescription() {
        this.initialize.apply(this, arguments);
    }

    Window_ChoiceDescription.prototype = Object.create(Window_Base.prototype);
    Window_ChoiceDescription.prototype.constructor = Window_ChoiceDescription;

    Window_ChoiceDescription.prototype.initialize = function () {
        Window_Base.prototype.initialize.call(this, windowX, windowY, windowWidth, windowHeight);
        this._text = '';
        this.openness = 0;
        this.visible = false;
        this.refresh();
    };

    Window_ChoiceDescription.prototype.standardFontSize = function () {
        return fontSize;
    };

    Window_ChoiceDescription.prototype.setText = function (text) {
        if (this._text === text) return;
        this._text = text || '';
        this.refresh();
    };

    Window_ChoiceDescription.prototype.refresh = function () {
        this.contents.clear();
        this.resetFontSettings();
        var wrapped = this.wrapText(this._text);
        this.drawTextEx(wrapped, 4, 0);
    };

    Window_ChoiceDescription.prototype.wrapText = function (text) {
        if (!text) return text;
        var maxWidth = this.contents.width - 8;
        var lines = text.split('\n');
        var result = [];
        for (var i = 0; i < lines.length; i++) {
            result.push(this.wrapLine(lines[i], maxWidth));
        }
        return result.join('\n');
    };

    Window_ChoiceDescription.prototype.wrapLine = function (line, maxWidth) {
        // 이스케이프 코드(\c[n] 등)는 그대로 두고 일반 글자 단위로 줄바꿈한다.
        var chars = line.split('');
        var output = '';
        var currentLine = '';
        var i = 0;
        while (i < chars.length) {
            var ch = chars[i];
            if (ch === '\x1b' && chars[i + 1] === 'c') {
                // \c[n] 형태의 색상 코드는 통째로 붙여서 넘긴다.
                var codeMatch = line.slice(i).match(/^\x1bC\[\d+\]/i);
                if (codeMatch) {
                    currentLine += codeMatch[0];
                    i += codeMatch[0].length;
                    continue;
                }
            }
            var testLine = currentLine + ch;
            if (this.textWidthEx(testLine) > maxWidth && currentLine.length > 0) {
                output += currentLine + '\n';
                currentLine = ch;
            } else {
                currentLine += ch;
            }
            i++;
        }
        output += currentLine;
        return output;
    };

    Window_ChoiceDescription.prototype.textWidthEx = function (text) {
        return this.drawTextEx(text, 0, this.contents.height);
    };

    Window_ChoiceDescription.prototype.showWindow = function () {
        this.openness = 255;
        this.visible = true;
    };

    Window_ChoiceDescription.prototype.hideWindow = function () {
        this.openness = 0;
        this.visible = false;
    };

    //--------------------------------------------------------------------
    // Window_ChoiceList 연동
    //--------------------------------------------------------------------

    var alias_WCL_initialize = Window_ChoiceList.prototype.initialize;
    Window_ChoiceList.prototype.initialize = function (messageWindow) {
        alias_WCL_initialize.call(this, messageWindow);
        this._descWindow = new Window_ChoiceDescription();
    };

    Window_ChoiceList.prototype.attachDescWindow = function () {
        if (!this._descWindow || this._descWindow.parent) return;
        if (this.parent) {
            this.parent.addChild(this._descWindow);
        }
    };

    var alias_WCL_select = Window_ChoiceList.prototype.select;
    Window_ChoiceList.prototype.select = function (index) {
        alias_WCL_select.call(this, index);
        this.updateChoiceDescription(index);
    };

    Window_ChoiceList.prototype.updateChoiceDescription = function (index) {
        if (!this._descWindow) return;
        if (index < 0 || !this._list || !this._list[index]) return;
        var choiceText = this._list[index].name.replace(/\\\w\[\d+\]/gi, '').trim();
        this._descWindow.setText(findDescriptionByName(choiceText));
    };

    var alias_WCL_start = Window_ChoiceList.prototype.start;
    Window_ChoiceList.prototype.start = function () {
        alias_WCL_start.call(this);
        if (this.hasAnyItemMatch()) {
            this.attachDescWindow();
            if (this._descWindow) {
                this._descWindow.showWindow();
                this.updateChoiceDescription(this.index());
            }
        }
    };

    Window_ChoiceList.prototype.hasAnyItemMatch = function () {
        if (!this._list) return false;
        for (var i = 0; i < this._list.length; i++) {
            var name = this._list[i].name.replace(/\\\w\[\d+\]/gi, '').trim();
            if (findDescriptionByName(name) !== '' || databaseIndexCache.hasOwnProperty(name)) {
                return true;
            }
        }
        return false;
    };

    var alias_WCL_close = Window_ChoiceList.prototype.close;
    Window_ChoiceList.prototype.close = function () {
        alias_WCL_close.call(this);
        if (this._descWindow) {
            this._descWindow.hideWindow();
        }
    };

})();
