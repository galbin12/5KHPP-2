//=============================================================================
// EnemySelectionBlink.js
//=============================================================================

/*:
 * @plugindesc 전투 중 공격 대상(적)이 타겟 선택 상태일 때 연한 하양 <-> 불투명 상태로
 * 부드럽게 깜빡이도록 만듭니다. (YEP_X_AnimatedSVEnemies 사용 시 사이드뷰 포함)
 * @author ㄹㅅㅁ
 *
 * @param Max Alpha
 * @desc 가장 하얗게 될 때의 블렌드 알파값 (0~255). 값이 클수록 더 하얗게 보입니다.
 * @default 140
 *
 * @param Blink Speed
 * @desc 깜빡임 속도. 값이 클수록 빨리 깜빡입니다.
 * @default 8
 *
 * @help
 * ------------------------------------------------------------------------
 * 이 플러그인은 별도 플러그인 커맨드가 없습니다.
 * 반드시 YEP_BattleEngineCore, YEP_X_AnimatedSVEnemies 아래(뒤)에 위치시켜
 * 주세요.
 * ------------------------------------------------------------------------
 */

(function() {

  var params = PluginManager.parameters('EnemySelectionBlink');
  var maxAlpha = Number(params['Max Alpha'] || 140);
  var blinkSpeed = Number(params['Blink Speed'] || 8);

  // 공통 로직: 타겟 선택 상태(커서가 올라간 상태)일 때만 sine 파형으로
  // 부드럽게 흰색 블렌드를 넣었다 뺐다 한다.
  function applySelectionBlink(sprite, target) {
    if (sprite._battler.isSelected()) {
      sprite._selectionEffectCount = (sprite._selectionEffectCount || 0) + 1;
      var wave = (Math.sin(sprite._selectionEffectCount / blinkSpeed) + 1) / 2;
      var alpha = Math.round(wave * maxAlpha);
      target.setBlendColor([255, 255, 255, alpha]);
    } else if (sprite._selectionEffectCount > 0) {
      sprite._selectionEffectCount = 0;
      target.setBlendColor([0, 0, 0, 0]);
    }
  }

  // YEP_X_AnimatedSVEnemies가 있는 경우 (사이드뷰 적)
  if (Sprite_Enemy.prototype.hasOwnProperty('updateSelectionEffect') ||
      Imported.YEP_X_AnimatedSVEnemies) {
    Sprite_Enemy.prototype.updateSelectionEffect = function() {
      if (this._svBattlerEnabled) {
        applySelectionBlink(this, this._mainSprite);
      } else {
        applySelectionBlink(this, this);
      }
    };
  } else {
    // 기본 프론트뷰 적 전용 오버라이드
    Sprite_Enemy.prototype.updateSelectionEffect = function() {
      applySelectionBlink(this, this);
    };
  }

})();
