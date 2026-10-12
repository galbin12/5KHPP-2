//=============================================================================
// ItemCatcherHeadStack.js
//=============================================================================

/*:
 * @plugindesc [ItemCatcherMinigame 확장] 미니게임 안에서 캐치한 아이템을 머리 위에 쌓아서 들고 다니게 함
 * @author Claude
 *
 * @param Max Stack Count
 * @desc 머리 위에 최대 몇 개까지 쌓을지 (넘으면 제일 아래(오래된) 것부터 사라짐)
 * @default 6
 *
 * @param Item Display Size
 * @desc 머리 위에 표시될 아이템 한 개의 크기(px)
 * @default 32
 *
 * @param Head Offset
 * @desc 캐처 머리 위 첫 아이템까지의 거리(px)
 * @default 10
 *
 * @param Item Spacing
 * @desc 쌓인 아이템들 사이의 세로 간격(px)
 * @default 26
 *
 * @param Wobble Range
 * @desc 움직일 때 아이템이 좌우로 흔들리는 폭(px), 0이면 흔들림 없음
 * @default 3
 *
 * @help
 * =============================================================================
 * ItemCatcherHeadStack.js
 * =============================================================================
 *
 * ItemCatcherMinigame.js의 확장 플러그인입니다.
 * 반드시 ItemCatcherMinigame.js보다 아래쪽에 배치해야 합니다.
 *
 * 미니게임 안에서 아이템을 캐치할 때마다 그 아이템이 캐처(플레이어)의
 * 머리 위에 차곡차곡 쌓여서, 캐처가 좌우로 움직일 때 같이 따라다닙니다.
 * (좋은 아이템, 나쁜 아이템 상관없이 캐치한 건 전부 쌓입니다)
 *
 * 미니게임이 끝나면 자동으로 사라지며, 다른 곳에는 영향을 주지 않습니다.
 * 별도의 플러그인 커맨드는 없습니다 - 그냥 켜두기만 하면 자동으로 동작합니다.
 *
 * =============================================================================
 */

(function() {
    var parameters = PluginManager.parameters('ItemCatcherHeadStack');
    var MAX_STACK = parseInt(parameters['Max Stack Count']) || 6;
    var ITEM_SIZE = parseInt(parameters['Item Display Size']) || 32;
    var HEAD_OFFSET = parseInt(parameters['Head Offset']) || 10;
    var ITEM_SPACING = parseInt(parameters['Item Spacing']) || 26;
    var WOBBLE_RANGE = parseInt(parameters['Wobble Range']);
    if (isNaN(WOBBLE_RANGE)) WOBBLE_RANGE = 3;

    if (!window.Scene_ItemCatcher) {
        console.warn('[ItemCatcherHeadStack] ItemCatcherMinigame.js를 찾을 수 없습니다. ' +
            'ItemCatcherHeadStack.js는 ItemCatcherMinigame.js보다 아래에 있어야 합니다.');
        return;
    }

    //=========================================================================
    // 초기화 (게임 시작 시 스택 배열 준비)
    //=========================================================================

    var _Scene_ItemCatcher_createDisplayObjects = Scene_ItemCatcher.prototype.createDisplayObjects;
    Scene_ItemCatcher.prototype.createDisplayObjects = function() {
        _Scene_ItemCatcher_createDisplayObjects.call(this);
        this._headStackItems = [];
    };

    //=========================================================================
    // 아이템 캐치 시 머리 위에 추가 (좋은 아이템만)
    //=========================================================================

    var _Scene_ItemCatcher_onItemCaught = Scene_ItemCatcher.prototype.onItemCaught;
    Scene_ItemCatcher.prototype.onItemCaught = function(item) {
        _Scene_ItemCatcher_onItemCaught.call(this, item);
        // 좋은 아이템/나쁜 아이템 상관없이 캐치한 건 다 머리 위에 쌓음
        this.addHeadStackItem(item);
    };

    // item.sprite.bitmap을 그대로 재사용 (이미지든 색상박스 대체본이든 그대로 사용)
    Scene_ItemCatcher.prototype.addHeadStackItem = function(item) {
        if (!this._headStackItems) this._headStackItems = [];

        var sprite = new Sprite();
        sprite.bitmap = item.sprite.bitmap;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 1;

        var applyScale = function() {
            var w = sprite.bitmap.width || ITEM_SIZE;
            var h = sprite.bitmap.height || ITEM_SIZE;
            var scale = ITEM_SIZE / Math.max(w, h, 1);
            sprite.scale.x = scale;
            sprite.scale.y = scale;
        };
        if (sprite.bitmap.isReady()) {
            applyScale();
        } else {
            sprite.bitmap.addLoadListener(applyScale);
        }

        var layer = this._offsetLayer || this;
        layer.addChild(sprite);

        this._headStackItems.push({
            sprite: sprite,
            wobbleSeed: Math.random() * Math.PI * 2
        });

        // 최대 개수를 넘으면 제일 오래된(맨 아래) 아이템부터 제거
        if (this._headStackItems.length > MAX_STACK) {
            var removed = this._headStackItems.shift();
            layer.removeChild(removed.sprite);
        }
    };

    //=========================================================================
    // 매 프레임 캐처 위치를 따라가도록 갱신
    //=========================================================================

    var _Scene_ItemCatcher_updateCatcher = Scene_ItemCatcher.prototype.updateCatcher;
    Scene_ItemCatcher.prototype.updateCatcher = function() {
        _Scene_ItemCatcher_updateCatcher.call(this);
        this.updateHeadStackItems();
    };

    Scene_ItemCatcher.prototype.updateHeadStackItems = function() {
        if (!this._headStackItems) return;

        for (var i = 0; i < this._headStackItems.length; i++) {
            var entry = this._headStackItems[i];
            var wobble = 0;
            if (WOBBLE_RANGE > 0) {
                wobble = Math.sin((Graphics.frameCount + entry.wobbleSeed * 10) * 0.15) * WOBBLE_RANGE;
            }
            entry.sprite.x = this._catcherX + wobble;
            entry.sprite.y = this._catcherY - HEAD_OFFSET - i * ITEM_SPACING;
        }
    };

    //=========================================================================
    // 게임 종료 시 정리
    //=========================================================================

    var _Scene_ItemCatcher_finishGame = Scene_ItemCatcher.prototype.finishGame;
    Scene_ItemCatcher.prototype.finishGame = function() {
        if (this._headStackItems) {
            var layer = this._offsetLayer || this;
            for (var i = 0; i < this._headStackItems.length; i++) {
                layer.removeChild(this._headStackItems[i].sprite);
            }
            this._headStackItems = [];
        }
        _Scene_ItemCatcher_finishGame.call(this);
    };

})();
