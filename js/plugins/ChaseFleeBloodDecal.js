//=============================================================================
// ChaseFleeBloodDecal.js
//=============================================================================

/*:
 * @plugindesc (v1.0) ChaseFlee.js 하위호환 플러그인 - 처치(셀프 스위치 B ON) 시
 * 그 자리에 피 이미지를 남깁니다. ChaseFlee.js 아래에 배치하세요.
 * @author Claude
 *
 * @param Blood Images
 * @desc img/pictures 폴더에 있는 피 이미지 파일명들 (쉼표로 구분, 확장자 제외)
 * 여러 개 등록하면 위치마다 랜덤으로 하나가 선택됩니다.
 * @default Blood1,Blood2,Blood3
 *
 * @param Offset Y
 * @desc 피 이미지의 세로 위치 보정값(픽셀). 타일 중앙보다 아래로 내리고 싶을 때
 * @default 0
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 1. 이 플러그인을 ChaseFlee.js "아래"에 배치합니다.
 * 2. img/pictures 폴더에 피 이미지를 넣고, 파라미터 Blood Images에
 *    파일명(확장자 제외)을 쉼표로 구분해 등록합니다.
 *    예) Blood1,Blood2,Blood3
 *
 * ------------------------------------------------------------------------
 * 동작 방식
 * ------------------------------------------------------------------------
 * - ChaseFlee로 시작된 전투에서 승리(처치)하면, ChaseFlee.js가 셀프 스위치 B를
 *   ON으로 설정하는 바로 그 순간을 감지해서 이벤트의 현재 좌표에 피 데칼을
 *   기록합니다. (ChaseFlee.js 자체는 전혀 수정하지 않습니다)
 * - 기록된 피 데칼은 $gameSystem에 저장되어 세이브/로드, 맵 재진입에도
 *   계속 유지됩니다.
 * - 같은 위치(맵ID+좌표)에는 중복으로 쌓이지 않습니다.
 * - 이미지가 여러 장 등록되어 있으면 좌표 기반으로 항상 같은(랜덤이지만
 *   고정된) 이미지가 선택됩니다.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {

    var parameters = PluginManager.parameters('ChaseFleeBloodDecal');
    var bloodImages = String(parameters['Blood Images'] || 'Blood1,Blood2,Blood3')
        .split(',')
        .map(function(s) { return s.trim(); })
        .filter(function(s) { return s.length > 0; });
    var offsetY = Number(parameters['Offset Y'] || 0);

    //-------------------------------------------------------------------------
    // $gameSystem: 피 데칼 위치 저장
    //-------------------------------------------------------------------------
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._chaseFleeBloodSpots = this._chaseFleeBloodSpots || [];
    };

    Game_System.prototype.chaseFleeBloodSpots = function() {
        if (!this._chaseFleeBloodSpots) this._chaseFleeBloodSpots = [];
        return this._chaseFleeBloodSpots;
    };

    Game_System.prototype.addChaseFleeBloodSpot = function(mapId, x, y) {
        var spots = this.chaseFleeBloodSpots();
        var exists = spots.some(function(s) {
            return s.mapId === mapId && s.x === x && s.y === y;
        });
        if (exists) return;
        var index = Math.abs((mapId * 73856093) ^ (x * 19349663) ^ (y * 83492791)) % Math.max(1, bloodImages.length);
        spots.push({ mapId: mapId, x: x, y: y, imageIndex: index });
    };

    //-------------------------------------------------------------------------
    // 처치(셀프 스위치 B ON) 순간 감지
    //-------------------------------------------------------------------------
    var _Game_SelfSwitches_setValue = Game_SelfSwitches.prototype.setValue;
    Game_SelfSwitches.prototype.setValue = function(key, value) {
        _Game_SelfSwitches_setValue.call(this, key, value);
        if (value === true && key[2] === 'B') {
            var mapId = key[0];
            var eventId = key[1];
            if ($gameMap && $gameMap.mapId() === mapId) {
                var event = $gameMap.event(eventId);
                if (event && event._chaseFleeTroopId) {
                    $gameSystem.addChaseFleeBloodSpot(mapId, event.x, event.y);
                }
            }
        }
    };

    //-------------------------------------------------------------------------
    // Sprite_ChaseFleeBlood
    //-------------------------------------------------------------------------
    function Sprite_ChaseFleeBlood() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ChaseFleeBlood.prototype = Object.create(Sprite.prototype);
    Sprite_ChaseFleeBlood.prototype.constructor = Sprite_ChaseFleeBlood;

    Sprite_ChaseFleeBlood.prototype.initialize = function(spot) {
        Sprite.prototype.initialize.call(this);
        this._mapX = spot.x;
        this._mapY = spot.y;
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        var fileName = bloodImages[spot.imageIndex] || bloodImages[0];
        if (fileName) {
            this.bitmap = ImageManager.loadPicture(fileName);
        }
        this.z = 0;
        this.updatePosition();
    };

    Sprite_ChaseFleeBlood.prototype.updatePosition = function() {
        var tw = $gameMap.tileWidth();
        var th = $gameMap.tileHeight();
        this.x = $gameMap.adjustX(this._mapX) * tw + tw / 2;
        this.y = $gameMap.adjustY(this._mapY) * th + th + offsetY;
    };

    Sprite_ChaseFleeBlood.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updatePosition();
    };

    //-------------------------------------------------------------------------
    // Spriteset_Map: 피 데칼 스프라이트 배치
    //-------------------------------------------------------------------------
    var _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.call(this);
        this.createChaseFleeBloodSprites();
    };

    Spriteset_Map.prototype.createChaseFleeBloodSprites = function() {
        this._chaseFleeBloodSprites = [];
        var mapId = $gameMap.mapId();
        var spots = $gameSystem.chaseFleeBloodSpots().filter(function(s) {
            return s.mapId === mapId;
        });
        var self = this;
        spots.forEach(function(spot) {
            var sprite = new Sprite_ChaseFleeBlood(spot);
            self._chaseFleeBloodSprites.push(sprite);
            // 캐릭터보다 아래(바닥) 레이어에 배치하기 위해 tilemap에 추가
            self._tilemap.addChild(sprite);
        });
    };

    var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        if (this._chaseFleeBloodSprites) {
            this._chaseFleeBloodSprites.forEach(function(sprite) {
                sprite.updatePosition();
            });
        }
    };

})();
