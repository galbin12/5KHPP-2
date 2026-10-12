//=============================================================================
// ActorCommandCursorImage.js
//=============================================================================

/*:
 * @plugindesc Window_ActorCommand(공격/스킬/방어/아이템 선택), 전투 중 스킬
 * 목록(Window_BattleSkill), 전투 중 아이템 목록(Window_BattleItem)의 선택
 * 커서를 기본 초록색 사각형 대신 지정한 그림으로 표시합니다.
 * @author Custom
 *
 * @param Image
 * @desc img/pictures 폴더에 있는 오버레이 이미지 파일명 (확장자 제외)
 * @default 창2
 *
 * @param Min Opacity
 * @desc 가장 투명해질 때의 불투명도 (0~255)
 * @default 80
 *
 * @param Max Opacity
 * @desc 가장 진해질 때의 불투명도 (0~255)
 * @default 255
 *
 * @param Pulse Speed
 * @desc 깜빡이는 속도 (클수록 빠름)
 * @default 0.08
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * Window_ActorCommand에서 항목을 선택했을 때 뜨는 기본 커서(밝은 사각형,
 * 흔히 "초록색 창"이라 부르는 그 깜빡이는 테두리)를 완전히 없애고, 대신
 * img/pictures 폴더의 이미지를 선택된 항목의 자리에 크기를 맞춰 그려줍니다.
 *
 * 이미지는 항목의 위치(x, y)와 크기(width, height)에 맞게 늘어나서(stretch)
 * 그려집니다. 항목 폭/높이가 서로 다르면 그림도 그 비율대로 늘어나니,
 * 정사각형에 가깝게 만들고 싶으면 항목 크기를 맞추거나 이미지 자체를
 * 늘어날 것을 감안해서 만드는 게 좋습니다.
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * Window_ActorCommand의 크기/위치/항목 배치를 바꾸는 플러그인(예:
 * BattleUIRework 계열)보다 아래(뒤)에 두세요. 항목 배치가 끝난 다음에
 * 커서만 교체하는 방식이라, 먼저 배치가 확정돼 있어야 정확한 자리에
 * 그림이 그려집니다.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('ActorCommandCursorImage');
    var imageName = String(params['Image'] || '창2');
    var overlayBitmap = ImageManager.loadPicture(imageName);
    var minOpacity = Number(params['Min Opacity'] || 80);
    var maxOpacity = Number(params['Max Opacity'] || 255);
    var pulseSpeed = Number(params['Pulse Speed'] || 0.08);

    //--------------------------------------------------------------------
    // 공용 로직 - 여러 Window 클래스(prototype)에 공통 적용
    //--------------------------------------------------------------------

    function createACICursorSprite() {
        if (this._aciCursorSprite) return;
        this._aciCursorSprite = new Sprite();
        this._aciCursorSprite.bitmap = overlayBitmap;
        this._aciCursorSprite.visible = false;
        this._aciPulseCount = 0;
        // 창 자체(_windowContentsSprite)보다 위, 커서(_windowCursorSprite)보다
        // 위에 오도록 마지막에 addChild
        this.addChild(this._aciCursorSprite);
    }

    // 기본 커서(초록/밝은 사각형)를 완전히 숨김.
    // setCursorRect(0,0,0,0)으로 지정하면 _refreshCursor에서 커서 스프라이트
    // 크기가 0이 되어 화면에 아무것도 안 그려짐.
    function aciUpdateCursor() {
        this.setCursorRect(0, 0, 0, 0);
    }

    // 매 프레임 선택된 항목의 위치에 맞춰 오버레이 스프라이트를 갱신
    function updateACICursorSprite() {
        if (!this._aciCursorSprite) createACICursorSprite.call(this);
        var sprite = this._aciCursorSprite;

        if (!this.active && !this.visible) {
            sprite.visible = false;
            return;
        }
        if (this.index() < 0 || this.maxItems() === 0) {
            sprite.visible = false;
            return;
        }

        var rect = this.itemRect(this.index());
        var padding = this.standardPadding ? this.standardPadding() : 18;

        sprite.visible = true;
        sprite.x = padding + rect.x;
        sprite.y = padding + rect.y;

        if (sprite.bitmap && sprite.bitmap.isReady()) {
            var bw = sprite.bitmap.width;
            var bh = sprite.bitmap.height;
            sprite.scale.x = bw > 0 ? rect.width / bw : 1;
            sprite.scale.y = bh > 0 ? rect.height / bh : 1;
        }

        // 투명 <-> 불투명을 왕복하는 깜빡임(pulse) 효과
        this._aciPulseCount += pulseSpeed;
        var wave = (Math.sin(this._aciPulseCount) + 1) / 2; // 0~1 사이 왕복
        sprite.opacity = minOpacity + (maxOpacity - minOpacity) * wave;
    }

    // 적용 대상 창 목록: 액터 커맨드(공격/스킬/방어/아이템 선택),
    // 전투 중 스킬 목록(Window_BattleSkill), 전투 중 아이템 목록(Window_BattleItem)
    var aciTargetWindows = [
        Window_ActorCommand,
        Window_BattleSkill,
        Window_BattleItem
    ];

    aciTargetWindows.forEach(function(WindowClass) {
        if (!WindowClass) return;

        var _initialize = WindowClass.prototype.initialize;
        WindowClass.prototype.initialize = function() {
            _initialize.apply(this, arguments);
            createACICursorSprite.call(this);
        };

        WindowClass.prototype.updateCursor = aciUpdateCursor;

        var _update = WindowClass.prototype.update;
        WindowClass.prototype.update = function() {
            _update.call(this);
            updateACICursorSprite.call(this);
        };
    });

})();
