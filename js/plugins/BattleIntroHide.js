//=============================================================================
// BattleIntroHide.js
//=============================================================================

/*:
 * @plugindesc 전투 시작 시 인트로 연출(그림)이 끝날 때까지 적/액터/전투 UI를 숨깁니다.
 * @author Custom
 *
 * @param Auto Hide On Battle Start
 * @desc 전투 시작과 동시에 자동으로 숨김 상태로 만들지 여부 (true/false)
 * @default true
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 기본값(Auto Hide On Battle Start = true)일 경우, 전투가 시작되는 순간
 * 자동으로 적/액터 스프라이트와 전투 UI(윈도우 전부)가 숨겨집니다.
 *
 * 그룹(Troop)의 턴 0 이벤트 페이지에서 그림을 이용한 인트로 연출을 끝낸 뒤,
 * 아래 플러그인 명령을 실행해서 다시 보이게 해주세요.
 *
 *   BattleIntroHide show
 *
 * 필요하다면 중간에 다시 숨기는 것도 가능합니다.
 *
 *   BattleIntroHide hide
 *
 * ------------------------------------------------------------------------
 * 예시 (턴 0 페이지)
 * ------------------------------------------------------------------------
 * (자동 숨김을 쓰는 경우, 이 페이지 시작 시점엔 이미 숨겨져 있는 상태)
 *   그림 표시 ...
 *   그림 이동 ...
 *   대기 ...
 *   그림 제거 ...
 *   플러그인 명령: BattleIntroHide show
 *
 * ============================================================================
 * 주의
 * ============================================================================
 * - 숨김 상태에서는 적/액터 스프라이트와 모든 전투 윈도우(로그, 커맨드, 상태 등)가
 *   보이지 않게 됩니다. 그림(Picture)은 별도 레이어이므로 영향을 받지 않습니다.
 * - 전투가 끝날 때는 자동으로 숨김 상태가 해제됩니다(다음 전투에 영향 없도록).
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

var RS = RS || {};
RS.BattleIntroHide = RS.BattleIntroHide || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('BattleIntroHide');
    var autoHideOnStart = String(parameters['Auto Hide On Battle Start'] || 'true') === 'true';

    var introHidden = false;

    RS.BattleIntroHide.isHidden = function() {
        return introHidden;
    };

    RS.BattleIntroHide.setHidden = function(value) {
        introHidden = !!value;
    };

    //--------------------------------------------------------------------
    // 플러그인 명령
    //--------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'BattleIntroHide') {
            var mode = String(args[0] || '').toLowerCase();
            if (mode === 'show') {
                RS.BattleIntroHide.setHidden(false);
            } else if (mode === 'hide') {
                RS.BattleIntroHide.setHidden(true);
            }
        }
    };

    //--------------------------------------------------------------------
    // BattleManager - 전투 시작/종료 시 상태 관리
    //--------------------------------------------------------------------

    var _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        _BattleManager_startBattle.call(this);
        RS.BattleIntroHide.setHidden(autoHideOnStart);
    };

    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        RS.BattleIntroHide.setHidden(false);
        _BattleManager_endBattle.call(this, result);
    };

    //--------------------------------------------------------------------
    // Spriteset_Battle - 적/액터 스프라이트 숨김
    //--------------------------------------------------------------------

    var _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        _Spriteset_Battle_update.call(this);
        this.updateRSBattleIntroHide();
    };

    Spriteset_Battle.prototype.updateRSBattleIntroHide = function() {
        var hidden = RS.BattleIntroHide.isHidden();
        var i;
        if (this._enemySprites) {
            for (i = 0; i < this._enemySprites.length; i++) {
                this._enemySprites[i].visible = !hidden;
            }
        }
        if (this._actorSprites) {
            for (i = 0; i < this._actorSprites.length; i++) {
                this._actorSprites[i].visible = !hidden;
            }
        }
    };

    //--------------------------------------------------------------------
    // Scene_Battle - 전투 UI(윈도우 레이어) 숨김
    //--------------------------------------------------------------------

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        if (this._windowLayer) {
            this._windowLayer.visible = !RS.BattleIntroHide.isHidden();
        }
    };

})();
