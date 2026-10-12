//=============================================================================
// TitleGallery.js
//=============================================================================

/*:
 * @plugindesc 타이틀 화면에 "갤러리" 커맨드를 추가합니다. 스위치로 해금된
 * 타이틀 이미지, 그리고 원하는 다른 그림들을 함께 넘겨볼 수 있습니다.
 * @author Claude
 *
 * @param Command Name
 * @desc 타이틀 커맨드 목록에 표시될 이름
 * @default 갤러리
 *
 * @param Insert Before Symbol
 * @desc 이 심볼(기본 커맨드) 바로 앞에 갤러리 커맨드를 끼워 넣습니다.
 * 목록에 없으면 맨 아래에 추가합니다. (newGame, continue, options)
 * @default options
 *
 * @param Include Default Title
 * @desc 스위치가 하나도 켜지지 않았을 때 보이는 원래(기본) 타이틀 이미지도
 * 갤러리 맨 처음에 넣을지 여부. 항상 해금 상태로 표시됩니다.
 * @type boolean
 * @default true
 *
 * @param Auto Import From TitleImageSwitch
 * @desc TitleImageSwitch.js의 "Switch List"에 등록된 항목들을 자동으로
 * 가져와서 갤러리 맨 앞에 추가합니다. (Background 1 이미지 기준)
 * @type boolean
 * @default true
 *
 * @param Gallery Items
 * @type struct<GalleryItem>[]
 * @desc 위 자동 목록 뒤에 추가로 나열할 그림들입니다. 목록 순서대로 보여줍니다.
 * @default []
 *
 * @param Show Locked Placeholder
 * @desc 아직 해금 안 된 그림도 "???"같은 잠금 표시로 목록에 포함할지 여부.
 * false면 해금된 그림만 목록에 나타나고 개수도 그만큼만 표시됩니다.
 * @type boolean
 * @default false
 *
 * @param Locked Label
 * @desc Show Locked Placeholder가 true일 때, 잠긴 그림 자리에 표시할 문구
 * @default ???
 *
 * @param Show Page Number
 * @desc 화면 하단에 "1 / 5" 같은 페이지 번호를 표시할지 여부
 * @type boolean
 * @default true
 *
 * @param Page Number Font Size
 * @desc 페이지 번호 글자 크기
 * @default 24
 *
 * @param Loop
 * @desc 마지막 그림에서 다음으로 넘기면 처음으로 돌아갈지 여부
 * @type boolean
 * @default true
 *
 * @param Arrow Font Size
 * @desc 좌우 이동 안내 화살표(◀ ▶) 글자 크기
 * @default 32
 *
 * @param No Items Text
 * @desc 해금된 그림이 하나도 없을 때 갤러리 화면에 표시할 문구
 * @default 아직 해금된 그림이 없습니다
 *
 * @param Cancel SE
 * @desc 갤러리를 닫고 타이틀로 돌아갈 때 재생할 SE (비워두면 기본 취소음)
 * @default
 *
 * @help
 * ------------------------------------------------------------------------
 * 사용법
 * ------------------------------------------------------------------------
 * 플러그인 매개변수 "Gallery Items"에 항목을 추가합니다. 항목마다:
 * - Folder: 그림이 들어있는 폴더 경로 (예: img/titles1/, img/pictures/gallery/)
 * - Image: 폴더 안 파일명 (확장자 제외)
 * - Required Switch: 이 스위치가 ON이어야 갤러리에서 볼 수 있습니다.
 *   0으로 두면 스위치와 상관없이 항상 볼 수 있습니다.
 *
 * "Include Default Title"를 켜두면(기본값 ON), 데이터베이스 시스템 설정의
 * 원래 타이틀 화면1 이미지($dataSystem.title1Name)를 갤러리 맨 처음 항목으로
 * 항상 보여줍니다(스위치와 무관하게 항상 해금 상태).
 *
 * "Auto Import From TitleImageSwitch"를 켜두면(기본값 ON), TitleImageSwitch.js의
 * Switch List에 등록해둔 항목들(스위치 ID + Background 1)을 따로 옮겨 적을
 * 필요 없이 자동으로 갤러리에 가져옵니다(기본 타이틀 다음 순서). 스위치가
 * ON이 되어 타이틀이 바뀐 뒤에야 갤러리에도 나타나며, TitleImageSwitch.js
 * 쪽 목록을 수정하면 갤러리도 함께 갱신됩니다. TitleImageSwitch.js가 없거나
 * 이 옵션을 끄면 무시됩니다.
 *
 * 타이틀 이미지가 아닌 다른 일러스트를 섞어 넣고 싶으면, Folder를 원하는
 * 경로(예: img/pictures/gallery/)로 바꾸고 Required Switch로 해금 조건을
 * 걸면 됩니다. 항상 보여주고 싶다면 Required Switch를 0으로 둡니다.
 *
 * 스위치 값은 $gameSwitches를 그대로 사용하므로, 새 게임을 시작해도 해금
 * 여부가 유지되게 하려면 JKL_PersistentData.js 같은 플러그인으로 해당
 * 스위치들을 영구 저장 처리해두세요. (이 프로젝트는 이미 사용 중입니다.)
 *
 * 조작법
 * ------------------------------------------------------------------------
 * - 좌/우 방향키 또는 화면 좌우 클릭/터치: 이전/다음 그림
 * - 취소(ESC, 우클릭): 타이틀 화면으로 복귀
 *
 * 이 플러그인은 세이브 데이터를 직접 만들지 않으므로 세이브 호환성 문제가
 * 없습니다(해금 여부는 스위치 값 그대로 사용).
 */

/*~struct~GalleryItem:
 * @param Folder
 * @desc 이미지가 들어있는 폴더 경로 (끝에 / 포함). 예: img/titles1/
 * @default img/pictures/gallery/
 *
 * @param Image
 * @desc 위 폴더 안의 파일명 (확장자 제외)
 * @default
 *
 * @param Required Switch
 * @type switch
 * @desc 이 스위치가 ON이어야 해금됩니다. 0이면 항상 해금 상태입니다.
 * @default 0
 */

(function() {

    var pluginName = 'TitleGallery';
    var params = PluginManager.parameters(pluginName);

    var commandName = String(params['Command Name'] || '갤러리');
    var insertBeforeSymbol = String(params['Insert Before Symbol'] || 'options');
    var includeDefaultTitle = String(params['Include Default Title'] || 'true') === 'true';
    var autoImport = String(params['Auto Import From TitleImageSwitch'] || 'true') === 'true';

    var manualItems = [];
    try {
        var rawItems = JSON.parse(params['Gallery Items'] || '[]');
        manualItems = rawItems.map(function(str) {
            var obj = JSON.parse(str);
            return {
                folder: String(obj['Folder'] || 'img/pictures/gallery/'),
                image: String(obj['Image'] || ''),
                switchId: Number(obj['Required Switch'] || 0)
            };
        }).filter(function(item) {
            return item.image.length > 0;
        });
    } catch (e) {
        console.error('TitleGallery: Gallery Items 파싱 오류', e);
    }

    function buildAutoItemsFromTitleImageSwitch() {
        if (!autoImport) return [];
        var srcParams = PluginManager.parameters('TitleImageSwitch');
        if (!srcParams || !srcParams['Switch List']) return [];
        var list = [];
        try {
            var rawList = JSON.parse(srcParams['Switch List'] || '[]');
            rawList.forEach(function(str) {
                var obj = JSON.parse(str);
                var switchId = Number(obj['Switch ID'] || 0);
                var bg1 = String(obj['Background 1'] || '');
                if (switchId > 0 && bg1) {
                    list.push({ folder: 'img/titles1/', image: bg1, switchId: switchId });
                }
            });
        } catch (e) {
            console.error('TitleGallery: TitleImageSwitch 연동 파싱 오류', e);
        }
        return list;
    }

    // 자동 목록(TitleImageSwitch 연동) + 수동 목록을 합침. 같은 폴더/파일이
    // 중복 등록돼 있으면 뒤엣것(수동 목록)은 건너뜀.
    var galleryItems = buildAutoItemsFromTitleImageSwitch();
    manualItems.forEach(function(item) {
        var dup = galleryItems.some(function(existing) {
            return existing.folder === item.folder && existing.image === item.image;
        });
        if (!dup) galleryItems.push(item);
    });

    var showLockedPlaceholder = String(params['Show Locked Placeholder'] || 'false') === 'true';
    var lockedLabel = String(params['Locked Label'] || '???');
    var showPageNumber = String(params['Show Page Number'] || 'true') === 'true';
    var pageFontSize = Number(params['Page Number Font Size'] || 24);
    var loopImages = String(params['Loop'] || 'true') === 'true';
    var arrowFontSize = Number(params['Arrow Font Size'] || 32);
    var noItemsText = String(params['No Items Text'] || '아직 해금된 그림이 없습니다');
    var cancelSe = String(params['Cancel SE'] || '');

    function isUnlocked(item) {
        return item.switchId <= 0 || $gameSwitches.value(item.switchId);
    }

    // 기본 타이틀 이미지는 $dataSystem이 로드된 뒤(갤러리 진입 시점)에만
    // 값을 알 수 있으므로 여기서 그때그때 계산한다.
    function getFullItemList() {
        if (!includeDefaultTitle) return galleryItems;
        var defaultName = $dataSystem.title1Name;
        if (!defaultName) return galleryItems;
        var defaultItem = { folder: 'img/titles1/', image: defaultName, switchId: 0 };
        var dup = galleryItems.some(function(existing) {
            return existing.folder === defaultItem.folder && existing.image === defaultItem.image;
        });
        return dup ? galleryItems : [defaultItem].concat(galleryItems);
    }

    // 갤러리 진입 시점에 매번 새로 계산 (플레이 중 해금될 수 있으므로)
    function buildVisibleList() {
        var fullList = getFullItemList();
        if (showLockedPlaceholder) {
            return fullList.map(function(item) {
                return { item: item, locked: !isUnlocked(item) };
            });
        }
        return fullList.filter(isUnlocked).map(function(item) {
            return { item: item, locked: false };
        });
    }

    //-------------------------------------------------------------------
    // Window_TitleCommand
    //-------------------------------------------------------------------

    var _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this);
        if (galleryItems.length === 0 && !includeDefaultTitle) return;
        var newCommand = { name: commandName, symbol: 'gallery', enabled: true, ext: null };
        var index = this._list.map(function(c) { return c.symbol; }).indexOf(insertBeforeSymbol);
        if (index >= 0) {
            this._list.splice(index, 0, newCommand);
        } else {
            this._list.push(newCommand);
        }
    };

    //-------------------------------------------------------------------
    // Scene_Title
    //-------------------------------------------------------------------

    var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler('gallery', this.commandGallery.bind(this));
    };

    Scene_Title.prototype.commandGallery = function() {
        this._commandWindow.close();
        SceneManager.push(Scene_TitleGallery);
    };

    //-------------------------------------------------------------------
    // Scene_TitleGallery
    //-------------------------------------------------------------------

    function Scene_TitleGallery() {
        this.initialize.apply(this, arguments);
    }

    Scene_TitleGallery.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_TitleGallery.prototype.constructor = Scene_TitleGallery;

    Scene_TitleGallery.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
        this._index = 0;
        this._visibleList = [];
    };

    Scene_TitleGallery.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this._visibleList = buildVisibleList();
        this.createBackground();
        this.createImageSprite();
        this.createEmptyLabel();
        this.createArrowSprites();
        this.createPageWindow();
        this.refresh();
    };

    Scene_TitleGallery.prototype.createBackground = function() {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._backSprite.bitmap.fillAll('#000000');
        this.addChild(this._backSprite);
    };

    Scene_TitleGallery.prototype.createImageSprite = function() {
        this._imageSprite = new Sprite();
        this._imageSprite.anchor.x = 0.5;
        this._imageSprite.anchor.y = 0.5;
        this._imageSprite.x = Graphics.width / 2;
        this._imageSprite.y = Graphics.height / 2;
        this.addChild(this._imageSprite);
    };

    Scene_TitleGallery.prototype.createEmptyLabel = function() {
        var w = 500;
        var h = 60;
        this._emptyWindow = new Window_Base((Graphics.width - w) / 2, (Graphics.height - h) / 2, w, h);
        this._emptyWindow.opacity = 0;
        this._emptyWindow.drawText(noItemsText, 0, 0, this._emptyWindow.contentsWidth(), 'center');
        this._emptyWindow.visible = false;
        this.addChild(this._emptyWindow);
    };

    Scene_TitleGallery.prototype.createArrowSprites = function() {
        var h = 80;
        this._leftArrowSprite = new Sprite(new Bitmap(60, h));
        this._leftArrowSprite.bitmap.fontSize = arrowFontSize;
        this._leftArrowSprite.bitmap.drawText('◀', 0, 0, 60, h, 'center');
        this._leftArrowSprite.x = 20;
        this._leftArrowSprite.y = (Graphics.height - h) / 2;
        this.addChild(this._leftArrowSprite);

        this._rightArrowSprite = new Sprite(new Bitmap(60, h));
        this._rightArrowSprite.bitmap.fontSize = arrowFontSize;
        this._rightArrowSprite.bitmap.drawText('▶', 0, 0, 60, h, 'center');
        this._rightArrowSprite.x = Graphics.width - 80;
        this._rightArrowSprite.y = (Graphics.height - h) / 2;
        this.addChild(this._rightArrowSprite);
    };

    Scene_TitleGallery.prototype.createPageWindow = function() {
        if (!showPageNumber) return;
        var w = 200;
        var h = 60;
        this._pageWindow = new Window_Base((Graphics.width - w) / 2, Graphics.height - h - 10, w, h);
        this._pageWindow.opacity = 128;
        this.addChild(this._pageWindow);
    };

    Scene_TitleGallery.prototype.refresh = function() {
        var hasItems = this._visibleList.length > 0;
        this._imageSprite.visible = hasItems;
        this._leftArrowSprite.visible = hasItems;
        this._rightArrowSprite.visible = hasItems;
        if (this._pageWindow) this._pageWindow.visible = hasItems;
        this._emptyWindow.visible = !hasItems;

        if (!hasItems) return;

        var entry = this._visibleList[this._index];
        if (entry.locked) {
            this._imageSprite.bitmap = new Bitmap(Graphics.width - 160, Graphics.height - 120);
            this._imageSprite.bitmap.fontSize = 48;
            this._imageSprite.bitmap.drawText(lockedLabel, 0, (this._imageSprite.bitmap.height - 48) / 2,
                this._imageSprite.bitmap.width, 48, 'center');
            this._imageSprite.scale.x = 1;
            this._imageSprite.scale.y = 1;
        } else {
            var item = entry.item;
            this._imageSprite.bitmap = ImageManager.loadBitmap(item.folder, item.image, 0, true);
            var scene = this;
            this._imageSprite.bitmap.addLoadListener(function() {
                scene.fitImageSprite();
            });
        }
        this.refreshPageWindow();
    };

    Scene_TitleGallery.prototype.fitImageSprite = function() {
        var bitmap = this._imageSprite.bitmap;
        if (!bitmap || bitmap.width === 0) return;
        var maxWidth = Graphics.width - 160;
        var maxHeight = Graphics.height - 120;
        var scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
        this._imageSprite.scale.x = scale;
        this._imageSprite.scale.y = scale;
    };

    Scene_TitleGallery.prototype.refreshPageWindow = function() {
        if (!this._pageWindow) return;
        this._pageWindow.contents.clear();
        this._pageWindow.contents.fontSize = pageFontSize;
        var text = (this._index + 1) + ' / ' + this._visibleList.length;
        this._pageWindow.drawText(text, 0, 0, this._pageWindow.contentsWidth(), 'center');
    };

    Scene_TitleGallery.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        if (this.isBusy()) return;
        if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
            this.popScene();
            return;
        }
        if (this._visibleList.length === 0) return;
        if (Input.isTriggered('right')) {
            this.showNext();
        } else if (Input.isTriggered('left')) {
            this.showPrevious();
        } else if (TouchInput.isTriggered()) {
            this.onTouch();
        }
    };

    Scene_TitleGallery.prototype.onTouch = function() {
        var x = TouchInput.x;
        if (x < Graphics.width / 2) {
            this.showPrevious();
        } else {
            this.showNext();
        }
    };

    Scene_TitleGallery.prototype.showNext = function() {
        if (this._index < this._visibleList.length - 1) {
            this._index++;
        } else if (loopImages) {
            this._index = 0;
        } else {
            return;
        }
        SoundManager.playCursor();
        this.refresh();
    };

    Scene_TitleGallery.prototype.showPrevious = function() {
        if (this._index > 0) {
            this._index--;
        } else if (loopImages) {
            this._index = this._visibleList.length - 1;
        } else {
            return;
        }
        SoundManager.playCursor();
        this.refresh();
    };

    Scene_TitleGallery.prototype.popScene = function() {
        if (cancelSe) {
            AudioManager.playStaticSe({ name: cancelSe, volume: 90, pitch: 100, pan: 0 });
        } else {
            SoundManager.playCancel();
        }
        SceneManager.pop();
    };

    Scene_TitleGallery.prototype.needsFadeIn = function() {
        return false;
    };

    Scene_TitleGallery.prototype.needsSlowFadeOut = function() {
        return false;
    };

})();
