//=============================================================================
// TitleCommandCarousel.js
//=============================================================================

/*:
 * @plugindesc 타이틀 화면의 새 게임/계속하기/옵션 커맨드를, 한 번에 하나만
 * 크게 보여주고 좌우 화살표(◀ ▶)로 넘기는 캐러셀 형태로 바꿉니다.
 * 양옆에는 이전/다음 항목이 작게 미리 보이고, 넘길 때 부드럽게 슬라이드됩니다.
 * @author RS
 *
 * @param Font Size
 * @desc 가운데(선택된) 명령어 글자 크기
 * @default 40
 *
 * @param Row Height
 * @desc 박스(창) 높이
 * @default 70
 *
 * @param Arrow Font Size
 * @desc 화살표(◀ ▶) 글자 크기
 * @default 36
 *
 * @param Background Color
 * @desc 박스 배경색 (CSS 색상 문자열)
 * @default rgba(0,0,0,0.85)
 *
 * @param Center Box Width
 * @desc 가운데(선택된 항목) 박스 너비
 * @default 220
 *
 * @param Side Box Width
 * @desc 양옆 미리보기 박스 너비
 * @default 150
 *
 * @param Side Font Size
 * @desc 양옆 미리보기 글자 크기
 * @default 24
 *
 * @param Side Box Height Ratio
 * @desc 양옆 미리보기 박스 높이 비율 (가운데 박스 대비, 0~1)
 * @default 0.75
 *
 * @param Arrow Gap
 * @desc 화살표와 가운데 박스 사이 간격 (작을수록 화살표가 박스에 더 붙음)
 * @default 4
 *
 * @param Side Gap
 * @desc 화살표와 양옆 미리보기 박스 사이 간격
 * @default 10
 *
 * @param Slide Frames
 * @desc 화살표로 넘길 때 슬라이드되는 데 걸리는 정도(체감 프레임 수). 0이면 즉시 전환
 * @default 10
 *
 * @param Box Image
 * @desc img/system 폴더에 있는 배경 박스 이미지 파일명(확장자 제외). 넣으면
 * 이 이미지를 가운데 박스 배경으로 쓰고, 배경색은 무시함
 * @default
 *
 * @help
 * 좌우 방향키, 마우스 클릭(좌측=이전, 우측=다음, 중앙=선택) 모두 지원합니다.
 * 위/아래 방향키는 반응하지 않습니다.
 *
 * 창 전체 너비는 파라미터로 직접 정하지 않고, 아래 요소들의 합으로 자동
 * 계산됩니다: 양옆박스 + 간격 + 화살표 + 간격 + 가운데박스 + 간격 + 화살표
 * + 간격 + 양옆박스. 그래서 숫자를 바꿔도 항상 딱 맞게 나옵니다.
 */

(function() {

    var params = PluginManager.parameters('TitleCommandCarousel');
    var fontSize = Number(params['Font Size'] || 40);
    var rowHeight = Number(params['Row Height'] || 70);
    var arrowFontSize = Number(params['Arrow Font Size'] || 36);
    var bgColor = String(params['Background Color'] || 'rgba(0,0,0,0.85)');
    var centerBoxWidth = Number(params['Center Box Width'] || 220);
    var sideBoxWidth = Number(params['Side Box Width'] || 150);
    var sideFontSize = Number(params['Side Font Size'] || 24);
    var sideHeightRatio = Number(params['Side Box Height Ratio'] || 0.75);
    var arrowGap = Number(params['Arrow Gap'] || 4);
    var sideGap = Number(params['Side Gap'] || 10);
    var slideFrames = Number(params['Slide Frames'] || 10);
    var boxImageName = String(params['Box Image'] || '');
    var boxImageBitmap = boxImageName ? ImageManager.loadSystem(boxImageName) : null;

    // 창 전체 너비를 부품 크기 합으로 자동 계산 (수동 입력값과 안 맞아서
    // 박스가 잘리는 문제를 원천적으로 방지)
    var forceWidth = sideBoxWidth + sideGap + arrowFontSize + arrowGap +
                      centerBoxWidth +
                      arrowGap + arrowFontSize + sideGap + sideBoxWidth;

    var _Window_TitleCommand_initialize = Window_TitleCommand.prototype.initialize;
    Window_TitleCommand.prototype.initialize = function() {
        _Window_TitleCommand_initialize.call(this);

        // 기본 windowskin 배경/테두리/커서 숨기고 직접 그린 배경만 보이게
        this._windowSpriteContainer.visible = false;
        this.opacity = 255;

        // 위/아래 스크롤 화살표를 만들어내는 내부 동기화 함수 자체를 무력화
        // (인스턴스 레벨로 덮어써서, 이 창에만 적용되고 다른 창엔 영향 없음)
        if (typeof this._updateArrows === 'function') {
            this._updateArrows = function() {};
        }
        if (this._downArrowSprite) this._downArrowSprite.visible = false;
        if (this._upArrowSprite) this._upArrowSprite.visible = false;

        this._slideOffset = 0;

        // 혹시 폭이 다르게 잡혔을 경우를 대비해 확실하게 강제로 맞춤
        if (this.width !== forceWidth) {
            this.width = forceWidth;
        }
        this.createContents();
        this.refresh();
    };

    Window_TitleCommand.prototype.standardPadding = function() {
        return 0;
    };

    Window_TitleCommand.prototype.windowWidth = function() {
        return forceWidth;
    };

    Window_TitleCommand.prototype.lineHeight = function() {
        return rowHeight;
    };

    // SuperToolsEngine의 Menu Editor에 이 창의 예전 설정이 저장되어 있으면
    // 게임 시작할 때 되돌려버리므로, 코드 이름을 바꿔서 저장 데이터와
    // 아예 매칭이 안 되게 만듦
    Window_TitleCommand.prototype.getWindowCode = function() {
        return 'TitleCommandCarousel_Ignored';
    };

    // 한 번에 한 항목만 "선택" 상태가 되게 (표시는 drawAllItems에서 직접 다 그림)
    Window_TitleCommand.prototype.maxCols = function() {
        return 1;
    };

    Window_TitleCommand.prototype.numVisibleRows = function() {
        return 1;
    };

    // 좌우 방향키로 넘기기 (양 끝에서 반대쪽으로 순환), 슬라이드 애니메이션 시작
    Window_TitleCommand.prototype.cursorRight = function() {
        var max = this.maxItems();
        if (max > 0) {
            this._slideDirection = 1;
            this.select((this.index() + 1) % max);
        }
    };

    Window_TitleCommand.prototype.cursorLeft = function() {
        var max = this.maxItems();
        if (max > 0) {
            this._slideDirection = -1;
            this.select((this.index() - 1 + max) % max);
        }
    };

    // 위/아래 방향키는 아예 반응 안 하게
    Window_TitleCommand.prototype.cursorDown = function() {};
    Window_TitleCommand.prototype.cursorUp = function() {};

    // 기본 깜빡이는 선택 커서는 숨김
    Window_TitleCommand.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
    };

    // [버그 방지, 이중 안전장치] 매 프레임 화살표 스프라이트를 직접 숨김 +
    // 슬라이드 애니메이션 진행
    var _Window_TitleCommand_update = Window_TitleCommand.prototype.update;
    Window_TitleCommand.prototype.update = function() {
        _Window_TitleCommand_update.call(this);
        if (this._downArrowSprite) this._downArrowSprite.visible = false;
        if (this._upArrowSprite) this._upArrowSprite.visible = false;

        if (this._slideOffset && Math.abs(this._slideOffset) > 0.5) {
            this._slideOffset *= 0.7;
            this.refresh();
        } else if (this._slideOffset) {
            this._slideOffset = 0;
            this.refresh();
        }
    };

    var _Window_TitleCommand_select = Window_TitleCommand.prototype.select;
    Window_TitleCommand.prototype.select = function(index) {
        var changed = (index !== this.index());
        _Window_TitleCommand_select.call(this, index);
        if (changed) {
            // 넘어온 방향의 반대쪽에서 슬라이드되어 들어오는 느낌을 주기 위한
            // 시작 오프셋. slideFrames가 0이면 즉시 전환.
            if (slideFrames > 0) {
                var travel = (centerBoxWidth + arrowGap * 2 + arrowFontSize + sideGap) * 0.5;
                var dir = this._slideDirection || 1;
                this._slideOffset = -dir * travel;
            }
            this.refresh();
        }
    };

    Window_TitleCommand.prototype.refresh = function() {
        this.clearCommandList();
        this.makeCommandList();
        if (!this.contents || this.contents.width !== this.width) {
            this.createContents();
        }
        this.contents.clear();
        this.drawAllItems();
    };

    Window_TitleCommand.prototype.drawAllItems = function() {
        var max = this.maxItems();
        if (max === 0) return;

        var current = this.index();
        if (current < 0) current = 0;
        var h = this.contents.height;
        var y = 0;
        var offset = this._slideOffset || 0;

        var centerX = (this.contents.width - centerBoxWidth) / 2 + offset;

        this.drawCenterBox(current, centerX, y, centerBoxWidth, h);

        var leftArrowX = centerX - arrowGap - arrowFontSize;
        var rightArrowX = centerX + centerBoxWidth + arrowGap;
        this.drawArrowGlyph('\u25C0', leftArrowX, y, arrowFontSize, h);
        this.drawArrowGlyph('\u25B6', rightArrowX, y, arrowFontSize, h);

        if (max > 1) {
            var prevIndex = (current - 1 + max) % max;
            var prevX = leftArrowX - sideGap - sideBoxWidth;
            this.drawSideBox(prevIndex, prevX, y, sideBoxWidth, h);
        }

        if (max > 2) {
            var nextIndex = (current + 1) % max;
            var nextX = rightArrowX + arrowFontSize + sideGap;
            this.drawSideBox(nextIndex, nextX, y, sideBoxWidth, h);
        }
    };

    Window_TitleCommand.prototype.drawCenterBox = function(index, x, y, w, h) {
        if (boxImageBitmap) {
            if (boxImageBitmap.isReady()) {
                this.contents.blt(
                    boxImageBitmap, 0, 0,
                    boxImageBitmap.width, boxImageBitmap.height,
                    x, y, w, h
                );
            } else {
                var self = this;
                boxImageBitmap.addLoadListener(function() {
                    self.refresh();
                });
            }
        } else {
            this.contents.fillRect(x, y, w, h, bgColor);
        }

        this.contents.paintOpacity = this.isCommandEnabled(index) ? 255 : 128;
        this.contents.textColor = '#ffffff';
        this.contents.fontSize = fontSize;
        this.drawText(this.commandName(index), x, y, w, 'center');
        this.resetFontSettings();
    };

    // 양옆에 작게 보이는 다음/이전 항목 미리보기
    Window_TitleCommand.prototype.drawSideBox = function(index, x, y, w, h) {
        var boxH = h * sideHeightRatio;
        var boxY = y + (h - boxH) / 2;

        this.contents.fillRect(x, boxY, w, boxH, bgColor);

        this.contents.paintOpacity = 255;
        this.contents.textColor = 'rgba(210,210,210,1)';
        this.contents.fontSize = sideFontSize;
        this.drawText(this.commandName(index), x, y, w, 'center');
        this.resetFontSettings();
    };

    Window_TitleCommand.prototype.drawArrowGlyph = function(char, x, y, w, h) {
        this.contents.paintOpacity = 255;
        this.contents.textColor = '#ffffff';
        this.contents.fontSize = arrowFontSize;
        this.drawText(char, x, y, w, 'center');
        this.resetFontSettings();
    };

    // 마우스/터치: 왼쪽 25% = 이전, 오른쪽 25% = 다음, 가운데 = 선택
    Window_TitleCommand.prototype.processTouch = function() {
        if (this.isOpenAndActive()) {
            if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
                var localX = this.canvasToLocalX(TouchInput.x);
                if (localX < this.width * 0.25) {
                    this.cursorLeft();
                    SoundManager.playCursor();
                    return;
                } else if (localX > this.width * 0.75) {
                    this.cursorRight();
                    SoundManager.playCursor();
                    return;
                } else {
                    this.processOk();
                    return;
                }
            }
        }
        Window_Selectable.prototype.processTouch.call(this);
    };

})();
