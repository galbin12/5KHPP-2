//=============================================================================
// ActorCommandOverlay.js
//=============================================================================

/*:
 * @plugindesc 액터의 커맨드(공격/스킬/방어/아이템) 선택 창이 액터 상태창
 * 자리 위에 뜨도록 하고, 크기와 배경을 커스텀할 수 있게 합니다.
 * @author Custom
 *
 * @param Width Scale
 * @desc 상태창 너비 대비 커맨드 창 너비 비율 (0.0 ~ 1.0). 1.0이면 상태창과
 * 완전히 같은 너비.
 * @default 1.0
 *
 * @param Height Scale
 * @desc 상태창 높이 대비 커맨드 창 높이 비율 (0.0 ~ 1.0). 1.0이면 상태창과
 * 완전히 같은 높이.
 * @default 1.0
 *
 * @param Background Image
 * @desc img/pictures/ 폴더에 있는 커맨드 창 배경 이미지 파일명(확장자 제외).
 * 비워두면 기본 윈도우스킨을 그대로 씁니다. 예: AttackWindowBG
 * @default
 *
 * @param Selection Image
 * @desc img/pictures/ 폴더에 있는 "선택된 명령어" 표시용 이미지 파일명
 * (확장자 제외). 지정하면 기본 커서(파란/초록 박스) 대신 이 이미지가
 * 선택된 항목 자리에 표시됩니다. 비워두면 기본 커서를 그대로 씁니다.
 * @default
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * 기본적으로 Window_ActorCommand(공격/스킬/방어/아이템 창)는 화면 우측에
 * 좁은 폭(192px)으로 따로 뜨고, 액터 상태창(YEP_BattleStatusWindow 등)은
 * 계속 화면에 보입니다.
 *
 * 이 플러그인을 적용하면:
 *   1) 액터 커맨드 창의 위치를 상태창(_statusWindow)의 자리를 기준으로
 *      잡고, 너비/높이는 "Width Scale"/"Height Scale" 비율만큼만 차지하며
 *      상태창 영역 안에서 가운데 정렬됩니다. (둘 다 1.0이면 예전처럼 상태창과
 *      완전히 같은 크기)
 *   2) 액터 커맨드 창이 활성화되어 있는 동안에는 상태창을 숨깁니다.
 *   3) 커맨드 선택이 끝나거나 취소되면 상태창이 다시 보입니다.
 *   4) "Background Image"에 이미지 파일명을 적으면, 기본 윈도우스킨 대신
 *      그 이미지를 커맨드 창 배경으로 씁니다(창 크기에 맞춰 늘어남).
 *      비워두면 기본 윈도우스킨 그대로 나옵니다.
 *   5) "Selection Image"에 이미지 파일명을 적으면, 기본 커서(선택된 항목
 *      뒤에 뜨는 파란/초록 박스) 대신 그 이미지가 선택된 항목의 자리에
 *      맞춰(칸 크기만큼 늘어나서) 표시됩니다.
 *
 * ============================================================================
 * 주의 / 커스터마이즈
 * ============================================================================
 * - 파티 커맨드(싸우기/도망) 창은 건드리지 않습니다.
 * - 배경 이미지를 나중에 그려서 img/pictures/에 넣을 계획이라면, 지금은
 *   "Background Image"를 비워두고 크기(Width/Height Scale)만 먼저
 *   조절해도 됩니다. 나중에 파일명만 채워 넣으면 바로 적용됩니다.
 *
 * ============================================================================
 * 주의: 파라미터 값은 플러그인 매니저에 별도로 저장됩니다!
 * ============================================================================
 * 이 파일을 새 버전으로 덮어써도, 이미 플러그인 매니저에 추가되어 있었다면
 * 실제 값은 예전에 저장된 값 그대로 유지됩니다. 값을 바꾸려면 플러그인
 * 매니저에서 이 플러그인을 더블클릭해서 직접 값을 수정해야 합니다.
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleEngineCore, YEP_BattleStatusWindow 보다 아래(뒤)에 두세요.
 * 두 플러그인이 만든 창들의 좌표/크기를 참조해서 덮어쓰기 때문입니다.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('ActorCommandOverlay');
    var widthScale = Number(parameters['Width Scale'] || 1.0);
    var heightScale = Number(parameters['Height Scale'] || 1.0);
    var bgImageName = String(parameters['Background Image'] || '').trim();
    var selImageName = String(parameters['Selection Image'] || '').trim();

    var bgBitmap = null;
    if (bgImageName) {
        bgBitmap = ImageManager.loadPicture(bgImageName);
    }
    var selBitmap = null;
    if (selImageName) {
        selBitmap = ImageManager.loadPicture(selImageName);
    }

    //--------------------------------------------------------------------
    // Window_ActorCommand - 상태창 자리를 기준으로 크기/위치 조정
    //--------------------------------------------------------------------

    var _Window_ActorCommand_initialize = Window_ActorCommand.prototype.initialize;
    Window_ActorCommand.prototype.initialize = function() {
        _Window_ActorCommand_initialize.call(this);
        this.updateACOPlacement();
        this.setupACOBackground();
        this.setupACOSelectionCursor();
    };

    Window_ActorCommand.prototype.updateACOPlacement = function() {
        var scene = SceneManager._scene;
        var statusWin = scene && scene._statusWindow;
        if (!statusWin) return;

        var w = Math.round(statusWin.width * widthScale);
        var h = Math.round(statusWin.height * heightScale);
        var x = statusWin.x + Math.round((statusWin.width - w) / 2);
        var y = statusWin.y + Math.round((statusWin.height - h) / 2);

        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.createContents();
        this.refresh();
        this.updateACOBackgroundSize();
    };

    // 창이 다시 열릴 때(setup)마다 혹시 상태창 크기가 바뀌었을 수 있으니
    // 위치/크기를 재확인합니다.
    var _Window_ActorCommand_setup = Window_ActorCommand.prototype.setup;
    Window_ActorCommand.prototype.setup = function(actor) {
        _Window_ActorCommand_setup.call(this, actor);
        this.updateACOPlacement();
    };

    //--------------------------------------------------------------------
    // 배경 이미지 (선택 사항)
    //--------------------------------------------------------------------

    Window_ActorCommand.prototype.setupACOBackground = function() {
        if (!bgImageName) return;

        // 기본 윈도우스킨 배경/테두리를 숨기고, 그 자리에 이미지 스프라이트를
        // 넣습니다.
        this.opacity = 0;
        if (this._windowFrameSprite) {
            this._windowFrameSprite.visible = false;
        }

        this._acoBgSprite = new Sprite(new Bitmap(this.width, this.height));
        this.addChildAt(this._acoBgSprite, 1);

        if (bgBitmap && !bgBitmap.isReady()) {
            bgBitmap.addLoadListener(function() {
                this.updateACOBackgroundSize();
            }.bind(this));
        }
        this.updateACOBackgroundSize();
    };

    Window_ActorCommand.prototype.updateACOBackgroundSize = function() {
        if (!this._acoBgSprite || !bgBitmap || !bgBitmap.isReady()) return;
        var bmp = this._acoBgSprite.bitmap;
        if (bmp.width !== this.width || bmp.height !== this.height) {
            bmp.resize(this.width, this.height);
        }
        bmp.clear();
        bmp.blt(bgBitmap, 0, 0, bgBitmap.width, bgBitmap.height,
            0, 0, this.width, this.height);
    };

    //--------------------------------------------------------------------
    // 선택된 항목 표시용 커스텀 이미지 (선택 사항)
    //--------------------------------------------------------------------

    Window_ActorCommand.prototype.setupACOSelectionCursor = function() {
        // 기본 창 커서(파란/초록 박스)는 update()에서 항상 숨깁니다.
        // 여기서는 커스텀 선택 표시 스프라이트를 만듭니다. Selection Image가
        // 없거나 로딩에 실패해도 최소한의 흰 박스로 항상 표시되도록 합니다.
        this._acoSelectSprite = new Sprite(new Bitmap(1, 1));
        var insertIndex = this._acoBgSprite ? 2 : 1;
        this.addChildAt(this._acoSelectSprite, insertIndex);

        if (selBitmap && !selBitmap.isReady()) {
            selBitmap.addLoadListener(function() {
                this.refreshACOSelectionCursor();
            }.bind(this));
        }
    };

    Window_ActorCommand.prototype.refreshACOSelectionCursor = function() {
        var sprite = this._acoSelectSprite;
        if (!sprite) return;
        if (!this.active || this.index() < 0) {
            sprite.visible = false;
            return;
        }
        var rect = this.itemRect(this.index());
        sprite.visible = true;
        sprite.move(rect.x + this.standardPadding(), rect.y + this.standardPadding());
        var bmp = sprite.bitmap;
        if (bmp.width !== rect.width || bmp.height !== rect.height) {
            bmp.resize(rect.width, rect.height);
        }
        bmp.clear();
        if (selBitmap && selBitmap.isReady()) {
            bmp.blt(selBitmap, 0, 0, selBitmap.width, selBitmap.height,
                0, 0, rect.width, rect.height);
        } else {
            // 대체 표시: 이미지가 없거나 아직 로딩 중일 때 최소한의 흰
            // 반투명 박스를 보여줍니다.
            bmp.fillRect(0, 0, rect.width, rect.height, 'rgba(255, 255, 255, 0.3)');
        }
    };

    var _Window_ActorCommand_update = Window_ActorCommand.prototype.update;
    Window_ActorCommand.prototype.update = function() {
        _Window_ActorCommand_update.call(this);
        // 기본 커서(파란/초록 깜빡임 박스)는 항상 숨깁니다. Selection
        // Image 설정 여부와 상관없이 적용됩니다.
        if (this._windowCursorSprite) {
            this._windowCursorSprite.visible = false;
        }
        this.refreshACOSelectionCursor();
    };

    //--------------------------------------------------------------------
    // Scene_Battle - 커맨드 창이 활성화된 동안 상태창 숨기기
    //--------------------------------------------------------------------

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this.updateACOStatusVisibility();
    };

    Scene_Battle.prototype.updateACOStatusVisibility = function() {
        if (!this._statusWindow || !this._actorCommandWindow) return;
        var hideStatus = this._actorCommandWindow.active;
        this._statusWindow.visible = !hideStatus;
    };

})();
