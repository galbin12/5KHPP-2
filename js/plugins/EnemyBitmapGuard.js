//=============================================================================
// EnemyBitmapGuard.js
//=============================================================================

/*:
 * @plugindesc 이미지가 없는 적 때문에 전투가 멈추는 오류(Cannot read property 'height' of undefined)를 막습니다. v1.0
 *
 * @help
 * ■ 증상
 *  전투 화면에서 아래 오류가 나며 멈추는 경우를 막습니다.
 *    TypeError: Cannot read property 'height' of undefined
 *    at Sprite_Enemy.updateFrame
 *
 * ■ 원인(추정)
 *  데이터베이스에서 이미지가 비어 있는 적은, 스프라이트에 이미지(bitmap)가
 *  한 번도 만들어지지 않아 updateFrame 이 undefined 의 height 를 읽게 됩니다.
 *
 * ■ 동작
 *  - 이미지가 없는 적에게 빈 이미지를 달아 줍니다. (화면에는 아무것도 안 보임)
 *  - 해당 적의 ID와 이름을 개발자 도구 콘솔(F8)에 한 번만 경고로 표시합니다.
 *    → 그 적의 이미지를 지정하거나, 의도한 것이라면 그대로 두세요.
 *  - 사이드뷰(SV) 적과 이미지가 정상인 적에는 아무 영향이 없습니다.
 *
 * ■ 플러그인 순서
 *  - 다른 적 관련 플러그인(YEP 계열, EnemyImageSwitch, EnemyImageAnimation,
 *    EnemyIntroAnimation 등)보다 "맨 아래"에 두세요.
 */

(function() {
    'use strict';

    var warned = {};

    var _Sprite_Enemy_updateBitmap = Sprite_Enemy.prototype.updateBitmap;
    Sprite_Enemy.prototype.updateBitmap = function() {
        _Sprite_Enemy_updateBitmap.call(this);
        if (this.bitmap || this._svBattlerEnabled || !this._enemy) return;
        var id = this._enemy.enemyId();
        if (!warned[id]) {
            warned[id] = true;
            console.warn('[EnemyBitmapGuard] 이미지가 없는 적: ID ' + id +
                ' (' + this._enemy.originalName() + ')');
        }
        this.bitmap = ImageManager.loadEmptyBitmap();
    };

})();
