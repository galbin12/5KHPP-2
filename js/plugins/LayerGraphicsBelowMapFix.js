//================================================================
// RS_LayerGraphicsBelowMapFix.js
//================================================================
/*:
 * @plugindesc (v1.1.0) GALV_LayerGraphics에서 특정 레이어만 맵/캐릭터보다
 * 아래(뒤)에 깔리도록 만들어줍니다. GALV_LayerGraphics 아래에 두세요.
 * @author Custom
 *
 * @help
 * ============================================================================
 * 왜 필요한가
 * ============================================================================
 * GALV_LayerGraphics는 레이어를 타일맵의 '맨 마지막 자식'으로 추가하기 때문에,
 * Z값을 몇으로 주든 기본적으로는 맵 타일/캐릭터보다 위(앞)에 그려집니다.
 * 평소에는 이 기본 동작(맵 위)을 그대로 쓰고 싶지만, 특정 레이어(예: 특정
 * 배경/구름 등)만 맵보다 아래(뒤)에 깔고 싶은 경우를 위한 플러그인입니다.
 *
 * ============================================================================
 * 사용법
 * ============================================================================
 * 1. 플러그인 매니저에서 GALV_LayerGraphics.js "바로 아래"에 이 플러그인을
 *    추가하고 켜세요. (다른 설정 필요 없음)
 *
 * 2. 평소처럼 쓰는 레이어는 지금까지와 똑같이 Z값 0 이상으로 설정하세요.
 *    → 기존 GALV 동작 그대로, 맵/캐릭터보다 위에 보입니다. (아무것도 안 바뀜)
 *
 * 3. 맵보다 "아래"로 깔고 싶은 특정 레이어만 Z값을 -1로 설정하세요.
 *    → 이 레이어만 타일맵 맨 아래로 강제 이동되어 맵/캐릭터 뒤에 그려집니다.
 *
 * 예)
 *   LAYER_S 1 1 background 0 0 255 -1 0 0 0     (맵보다 아래로 깔림)
 *   LAYER 1 2 clouds 1 0 200 0 0 0 0             (기존처럼 맵 위에 보임)
 *
 * ============================================================================
 */
(function () {
  'use strict';

  var _Spriteset_Map_createLayerGraphics = Spriteset_Map.prototype.createLayerGraphics;
  Spriteset_Map.prototype.createLayerGraphics = function () {
    _Spriteset_Map_createLayerGraphics.call(this);
    this.rsFixLayerGraphicsOrder();
  };

  // 타일맵이 내부적으로 매 프레임 children을 z값 기준으로 재정렬하기 때문에,
  // 생성 시점 한 번만 순서를 고정하면 리페인트/애니메이션 타일 갱신 타이밍과
  // 겹칠 때 한두 프레임 순서가 흐트러져 깜빡여 보일 수 있음.
  // -> 매 프레임 강제로 다시 맨 아래로 고정한다.
  var _Spriteset_Map_update = Spriteset_Map.prototype.update;
  Spriteset_Map.prototype.update = function () {
    _Spriteset_Map_update.call(this);
    this.rsFixLayerGraphicsOrder();
  };

  Spriteset_Map.prototype.rsFixLayerGraphicsOrder = function () {
    if (!this.layerGraphics || !this._tilemap) return;
    for (var id in this.layerGraphics) {
      var sprite = this.layerGraphics[id];
      // Z가 음수(-1 등)로 지정된 레이어만 맵 아래로 강제 이동
      if (!sprite || sprite.z >= 0) continue;
      var idx = this._tilemap.children.indexOf(sprite);
      if (idx === -1 || idx === 0) continue; // 이미 맨 아래면 건드릴 필요 없음
      this._tilemap.removeChild(sprite);
      this._tilemap.addChildAt(sprite, 0);
    }
  };
})();
