//=============================================================================
// MenuCommandForceStyle.js
//=============================================================================

/*:
 * @plugindesc 메인 메뉴 커맨드 창을 세로 1열 + 커스텀 배경(색/이미지) +
 * 항목별 직사각형 배경 + 선택 항목 확대 글씨(중앙정렬)로 강제 스타일링합니다.
 * 배경 교체는 메인 메뉴(Scene_Menu) 화면에만 적용되고, 아이템/스킬/장비/
 * 상태/옵션 등 다른 화면은 원래 기본 배경 그대로 유지됩니다.
 * SRD_SuperToolsEngine이 저장한 가로배치/투명도 설정을 무시하고 항상 이
 * 스타일이 적용됩니다.
 * @author RS
 *
 * @param Window Width
 * @desc 커맨드 창 너비
 * @default 300
 *
 * @param Line Height
 * @desc 항목 한 칸의 높이 (간격 포함). 클수록 항목 사이 간격이 넓어짐
 * @default 76
 *
 * @param Box Height
 * @desc 일반 항목 배경 박스 높이
 * @default 36
 *
 * @param Selected Box Extra Height
 * @desc 선택된 항목의 배경 박스가 더 커지는 정도 (높이/너비 여백 감소량)
 * @default 16
 *
 * @param Selected Font Size
 * @default 34
 *
 * @param Normal Font Size
 * @default 24
 *
 * @param Box Image
 * @desc img/system 폴더에 있는 배경 박스 이미지 파일명 (확장자 제외). 비워두면 그라데이션 사용
 * @default
 *
 * @param Scene Background Color
 * @desc 메뉴 화면 전체 배경색 (CSS 색상 문자열, 예: black, #101020). Scene Background Image가 있으면 무시됨
 * @default black
 *
 * @param Scene Background Image
 * @desc img/pictures 폴더에 있는 메뉴 전체 배경 이미지 파일명 (확장자 제외). 비워두면 위 색상 사용
 * @default
 *
 * @param Fade Duration
 * @desc 메뉴 화면 열고 닫힐 때 페이드에 걸리는 시간(프레임). 60=1초
 * @default 20
 *
 * @param Sub Screen Darken Alpha
 * @desc 아이템/스킬/장비/상태/옵션 등에서 배경을 얼마나 어둡게 할지 (0~1)
 * @default 0.4
 *
 * @param Sub Screen Blur Strength
 * @desc 아이템/스킬/장비/상태/옵션 등에서 배경 블러 강도 (0이면 블러 없음)
 * @default 6
 *
 * @param Select Animation Speed
 * @desc 선택 항목이 커지는 애니메이션 속도 (0~1, 클수록 빠름). 0이면 즉시 전환
 * @default 0.2
 *
 * @help
 * 플러그인 목록에서 SRD_SuperToolsEngine.js 보다 아래에 배치하세요.
 *
 * Box Image에 파일명을 넣으면 img/system 폴더의 그 이미지를 박스 크기에
 * 맞게 늘려서 배경으로 씁니다. 비워두면 기존 그라데이션을 그립니다.
 *
 * Scene Background Image에 파일명을 넣으면 img/pictures 폴더의 그 이미지를
 * 메뉴 화면 전체 배경으로 화면 크기에 맞게 늘려서 씁니다. 비워두면
 * Scene Background Color로 지정한 단색을 씁니다.
 */

(function() {

    var params = PluginManager.parameters('MenuCommandForceStyle');
    var forceWidth = Number(params['Window Width'] || 300);
    var forceLineHeight = Number(params['Line Height'] || 76);
    var boxHeight = Number(params['Box Height'] || 36);
    var selectedExtra = Number(params['Selected Box Extra Height'] || 16);
    var selectedSize = Number(params['Selected Font Size'] || 34);
    var normalSize = Number(params['Normal Font Size'] || 24);
    var boxImageName = String(params['Box Image'] || '');
    var boxImageBitmap = boxImageName ? ImageManager.loadSystem(boxImageName) : null;
    var sceneBgColor = String(params['Scene Background Color'] || 'black');
    var sceneBgImageName = String(params['Scene Background Image'] || '');
    var sceneBgImageBitmap = sceneBgImageName ? ImageManager.loadPicture(sceneBgImageName) : null;
    var fadeDuration = Number(params['Fade Duration'] || 20);
    var subDarkenAlpha = Number(params['Sub Screen Darken Alpha'] || 0.4);
    var subBlurStrength = Number(params['Sub Screen Blur Strength'] || 6);
    var animSpeed = Number(params['Select Animation Speed'] || 0.2);

    // ease-out 곡선 (처음엔 빠르게, 끝에 갈수록 천천히 - 자연스럽게 감속)
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    //-------------------------------------------------------------------
    // Window_MenuCommand 자체 그리기 로직 (prototype 오버라이드)
    //-------------------------------------------------------------------

    var _Window_MenuCommand_initialize = Window_MenuCommand.prototype.initialize;
    Window_MenuCommand.prototype.initialize = function(x, y) {
        _Window_MenuCommand_initialize.call(this, x, y);
        // 기본 windowskin 배경/테두리/커서를 전부 숨기고
        // contents에 우리가 직접 그린 검은 배경만 보이게 함
        this._windowSpriteContainer.visible = false;
        this.opacity = 255;
        this.refresh();
    };

    // SuperToolsEngine의 Menu Editor가 이 창을 "Window_MenuCommand"로 인식해서
    // 저장된 가로배치/투명도 설정을 되돌려버리는 걸 막기 위해, 코드 이름을 바꿔
    // Menu Editor의 저장 데이터($dataWindows)와 아예 매칭이 안 되게 만듦.
    Window_MenuCommand.prototype.getWindowCode = function() {
        return 'MenuCommandForceStyle_Ignored';
    };

    Window_MenuCommand.prototype.standardPadding = function() {
        return 0;
    };

    Window_MenuCommand.prototype.lineHeight = function() {
        return forceLineHeight;
    };

    Window_MenuCommand.prototype.maxCols = function() {
        return 1;
    };

    Window_MenuCommand.prototype.numVisibleRows = function() {
        return this.maxItems();
    };

    Window_MenuCommand.prototype.windowWidth = function() {
        return forceWidth;
    };

    var _Window_MenuCommand_select = Window_MenuCommand.prototype.select;
    Window_MenuCommand.prototype.select = function(index) {
        var oldIndex = this.index();
        var changed = (index !== oldIndex);
        _Window_MenuCommand_select.call(this, index);
        if (changed) {
            // 곡선(이징) 애니메이션 시작: 이전 선택은 줄어들고,
            // 새로 선택된 항목은 커지는 걸 부드럽게 보간
            this._animPrevIndex = oldIndex;
            this._animT = animSpeed > 0 ? 0 : 1;
            this.refresh();
        }
    };

    var _Window_MenuCommand_update = Window_MenuCommand.prototype.update;
    Window_MenuCommand.prototype.update = function() {
        _Window_MenuCommand_update.call(this);
        if (this._animT !== undefined && this._animT < 1) {
            this._animT = Math.min(1, this._animT + animSpeed);
            this.refresh();
        }
    };

    // 기본 선택 커서(깜빡이는 밝은 사각형)를 완전히 숨김.
    // _windowSpriteContainer만 숨겨서는 안 지워짐 (커서 스프라이트는 별도 자식이라)
    Window_MenuCommand.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
    };

    Window_MenuCommand.prototype.drawItemBackground = function(rect, extraHeight, marginX) {
        var boxH = boxHeight + extraHeight;
        var boxY = rect.y + (rect.height - boxH) / 2;
        var x = rect.x + marginX;
        var width = rect.width - marginX * 2;
        if (width <= 0 || boxH <= 0) return;

        if (boxImageBitmap) {
            if (boxImageBitmap.isReady()) {
                this.contents.blt(
                    boxImageBitmap, 0, 0,
                    boxImageBitmap.width, boxImageBitmap.height,
                    x, boxY, width, boxH
                );
            } else {
                // 이미지 로딩이 끝나면 자동으로 다시 그림
                var self = this;
                boxImageBitmap.addLoadListener(function() {
                    self.refresh();
                });
            }
            return;
        }

        // Box Image가 없으면 기존처럼 왼쪽(밝음) -> 오른쪽(어두움) 그라데이션
        this.contents.gradientFillRect(
            x, boxY, width, boxH,
            'rgba(190,190,190,1)',
            'rgba(40,40,40,1)',
            false // false = 가로(왼쪽->오른쪽) 그라데이션
        );
    };

    Window_MenuCommand.prototype.itemTextAlign = function() {
        return 'center';
    };

    Window_MenuCommand.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var current = this.index();
        var isSelected = (index === current);

        // 0(작음)~1(큼) 사이 진행도 계산 (곡선 적용)
        var rawT = (this._animT === undefined) ? 1 : this._animT;
        var t = easeOutCubic(rawT);
        var growT; // 이 항목이 "커지는 쪽으로" 얼마나 진행됐는지 (0~1)

        if (isSelected) {
            growT = t; // 새로 선택된 항목: 0(직전 크기)에서 1(선택 크기)로 증가
        } else if (index === this._animPrevIndex) {
            growT = 1 - t; // 방금까지 선택돼 있던 항목: 1에서 0으로 감소
        } else {
            growT = 0; // 관계없는 항목: 항상 작은 상태
        }

        var fontSize = Math.round(normalSize + (selectedSize - normalSize) * growT);
        var extraHeight = selectedExtra * growT;
        var marginX = 20 - (20 - 4) * growT;

        this.drawItemBackground(rect, extraHeight, marginX);

        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));

        this.contents.fontSize = fontSize;

        // drawText가 lineHeight() 기준으로 알아서 세로 중앙 정렬을 해주므로
        // y좌표는 rect.y 그대로 사용 (직접 보정하면 이중 보정되어 밀림)
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');

        this.resetFontSettings();
    };

    // 창 자체에 검은 배경을 깔지 않음 (뒤에 씬 배경이 그대로 비치게)
    Window_MenuCommand.prototype.refresh = function() {
        this.clearCommandList();
        this.makeCommandList();
        this.createContents();
        this.contents.clear();
        this.drawAllItems();
    };

    // 항목을 클릭/확정하면 다음 화면으로 넘어가기 전에 이 창을 바로 숨김
    var _Window_MenuCommand_callOkHandler = Window_MenuCommand.prototype.callOkHandler;
    Window_MenuCommand.prototype.callOkHandler = function() {
        this.hide();
        _Window_MenuCommand_callOkHandler.call(this);
    };

    // [버그 수정, 범용] 프로필 안에서 스킬 목록 등을 보고 여러 단계를 취소해서
    // 나올 때, 정확히 어떤 함수를 거쳐 돌아오는지와 상관없이 커맨드 창이
    // 다시 활성화(activate)되는 시점엔 항상 같이 보이도록(show) 안전장치를 검
    var _Window_MenuCommand_activate = Window_MenuCommand.prototype.activate;
    Window_MenuCommand.prototype.activate = function() {
        _Window_MenuCommand_activate.call(this);
        this.show();
    };

    // [버그 수정] 프로필/스킬/장비/상태 등은 씬 전환 없이 같은 Scene_Menu 안에서
    // 진행되는데, 위에서 hide()한 채로 있으면 취소하고 커맨드 목록으로 돌아와도
    // 계속 숨겨진 상태였음. 커맨드 목록으로 돌아오는 시점에 다시 보이게 함.
    var _Scene_MenuBase_onPersonalCancel = Scene_MenuBase.prototype.onPersonalCancel;
    Scene_MenuBase.prototype.onPersonalCancel = function() {
        _Scene_MenuBase_onPersonalCancel.call(this);
        if (this._commandWindow) {
            this._commandWindow.show();
        }
    };

    //-------------------------------------------------------------------
    // 메뉴 화면 자체(전체 화면)를 열 때/닫을 때 페이드 인/아웃
    //-------------------------------------------------------------------

    var _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.call(this);
        this.startFadeIn(fadeDuration, false);
    };

    var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('cancel', this.onMenuCommandCancelWithFade.bind(this));
    };

    Scene_Menu.prototype.onMenuCommandCancelWithFade = function() {
        this._commandWindow.deactivate();
        this.startFadeOut(fadeDuration, false); // 화면 전체 페이드아웃 시작
        this._menuClosingForFade = true;
    };

    var _Scene_Menu_update = Scene_Menu.prototype.update;
    Scene_Menu.prototype.update = function() {
        _Scene_Menu_update.call(this);
        if (this._menuClosingForFade && this._fadeDuration <= 0) {
            this._menuClosingForFade = false;
            this.popScene();
        }
    };

    //-------------------------------------------------------------------
    // 메뉴 계열 화면(Scene_MenuBase) 전체가 같은 배경을 공유하도록 함.
    // 메인 메뉴 화면은 그대로, 아이템/스킬/장비/상태/옵션 등 서브 화면은
    // 같은 배경을 더 어둡게 + 블러 처리해서 글씨가 잘 읽히게 함.
    //-------------------------------------------------------------------

    var _Scene_MenuBase_createBackground_original = Scene_MenuBase.prototype.createBackground;

    Scene_MenuBase.prototype.createBackground = function() {
        // 세이브/로드 화면(Scene_File과 그 자식인 Scene_Save/Scene_Load)은
        // 원래 기본 배경(흐린 맵 스냅샷)을 그대로 씀 - 커스텀 배경 적용 안 함
        if (typeof Scene_File !== 'undefined' && this instanceof Scene_File) {
            _Scene_MenuBase_createBackground_original.call(this);
            return;
        }

        this._backgroundSprite = new Sprite();
        if (sceneBgImageBitmap) {
            if (sceneBgImageBitmap.isReady()) {
                this._backgroundSprite.bitmap = sceneBgImageBitmap;
                this._fitBackgroundSprite();
            } else {
                var self = this;
                sceneBgImageBitmap.addLoadListener(function() {
                    self._backgroundSprite.bitmap = sceneBgImageBitmap;
                    self._fitBackgroundSprite();
                });
            }
        } else {
            this._backgroundSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
            this._backgroundSprite.bitmap.fillAll(sceneBgColor);
        }
        this.addChild(this._backgroundSprite);

        // 메인 메뉴(Scene_Menu)가 아닌 서브 화면(아이템/스킬/장비/상태/옵션 등)은
        // 배경을 어둡게 + 블러 처리
        if (this.constructor !== Scene_Menu) {
            if (subBlurStrength > 0 && typeof PIXI !== 'undefined' && PIXI.filters && PIXI.filters.BlurFilter) {
                this._backgroundSprite.filters = [new PIXI.filters.BlurFilter(subBlurStrength)];
            }
            if (subDarkenAlpha > 0) {
                var darkSprite = new Sprite();
                darkSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
                darkSprite.bitmap.fillAll('rgba(0,0,0,' + subDarkenAlpha + ')');
                this.addChild(darkSprite);
            }
        }
    };

    Scene_MenuBase.prototype._fitBackgroundSprite = function() {
        var bitmap = this._backgroundSprite.bitmap;
        this._backgroundSprite.scale.x = Graphics.width / bitmap.width;
        this._backgroundSprite.scale.y = Graphics.height / bitmap.height;
    };

    Scene_Menu.prototype.applySubScreenDarkBlur = function() {
        if (this._subDarkSprite) return; // 이미 적용됨
        if (subBlurStrength > 0 && typeof PIXI !== 'undefined' && PIXI.filters && PIXI.filters.BlurFilter) {
            this._backgroundSprite.filters = [new PIXI.filters.BlurFilter(subBlurStrength)];
        }
        if (subDarkenAlpha > 0) {
            this._subDarkSprite = new Sprite();
            this._subDarkSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
            this._subDarkSprite.bitmap.fillAll('rgba(0,0,0,' + subDarkenAlpha + ')');
            // 배경 바로 위, 커맨드 창보다는 아래에 오도록 addChildAt
            var index = this.getChildIndex(this._backgroundSprite) + 1;
            this.addChildAt(this._subDarkSprite, index);
        }
    };

    Scene_Menu.prototype.removeSubScreenDarkBlur = function() {
        this._backgroundSprite.filters = null;
        if (this._subDarkSprite) {
            this.removeChild(this._subDarkSprite);
            this._subDarkSprite = null;
        }
    };

    // 프로필 안에서 스킬 목록 등을 여는 팝업(같은 Scene_Menu 안에서 열림)에도
    // 배경 어둡게+블러 적용. MenuActorDetail.js가 이 함수들을 만들어두므로
    // 이 플러그인은 반드시 MenuActorDetail.js보다 아래에 있어야 함.
    if (Scene_Menu.prototype.onActorDetailOpen) {
        var _Scene_Menu_onActorDetailOpen = Scene_Menu.prototype.onActorDetailOpen;
        Scene_Menu.prototype.onActorDetailOpen = function() {
            _Scene_Menu_onActorDetailOpen.call(this);
            this.applySubScreenDarkBlur();
        };
    }

    if (Scene_Menu.prototype.closeActorDetail) {
        var _Scene_Menu_closeActorDetail = Scene_Menu.prototype.closeActorDetail;
        Scene_Menu.prototype.closeActorDetail = function() {
            _Scene_Menu_closeActorDetail.call(this);
            this.removeSubScreenDarkBlur();
        };
    }

})();
