//=============================================================================
// CustomBattleIntroLite.js
//=============================================================================

/*:
 * @plugindesc SRD_CustomBattleIntro의 "Hide Characters" 기능만 가져온 경량 버전입니다.
 * @author Custom
 *
 * @param Hide Characters
 * @desc 인카운트 연출 중 맵 이벤트를 숨길지 여부 (true/false).
 * false로 하면 이벤트는 보이고, 플레이어와 파티원은 계속 숨겨집니다.
 * @default true
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * SRD_CustomBattleIntro의 복잡한 프레임 연출 시스템 없이,
 * "인카운트 연출(화면 정지/확대) 중 캐릭터 숨김 여부"만 가볍게 제어합니다.
 *
 * - Hide Characters = true
 *     기본 동작. 플레이어/파티원/맵 이벤트가 전부 숨겨집니다.
 *
 * - Hide Characters = false
 *     맵 이벤트(NPC, 오브젝트 등)는 그대로 보이고,
 *     플레이어와 파티원(팔로워)만 계속 숨겨진 채로 유지됩니다.
 *
 * ============================================================================
 * 주의
 * ============================================================================
 * - SRD_CustomBattleIntro와 함께 켜두면 같은 훅을 두 번 덮어써서
 *   동작이 꼬일 수 있으니 둘 중 하나만 사용하세요.
 * - 코어 스크립트의 Scene_Map.prototype.startEncounterEffect /
 *   Spriteset_Map.prototype.hideCharacters 구조에 의존합니다.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

var Imported = Imported || {};
Imported["CustomBattleIntroLite"] = true;

(function() {
    'use strict';

    var parameters = PluginManager.parameters('CustomBattleIntroLite');
    var hideCharacters = String(parameters['Hide Characters'] || 'true').trim().toLowerCase() === 'true';

    //--------------------------------------------------------------------
    // Scene_Map - 인카운트 연출 시작 시 이벤트만 다시 표시
    //--------------------------------------------------------------------

    var _Scene_Map_startEncounterEffect = Scene_Map.prototype.startEncounterEffect;
    Scene_Map.prototype.startEncounterEffect = function() {
        _Scene_Map_startEncounterEffect.call(this);
        if (!hideCharacters && this._spriteset) {
            this._spriteset.showEventCharactersOnly();
        }
    };

    //--------------------------------------------------------------------
    // Spriteset_Map - 플레이어/파티원을 제외한 캐릭터(이벤트)만 표시
    //--------------------------------------------------------------------

    Spriteset_Map.prototype.showEventCharactersOnly = function() {
        for (var i = 0; i < this._characterSprites.length; i++) {
            var sprite = this._characterSprites[i];
            if (sprite.isTile()) continue;
            var character = sprite._character;
            if (character instanceof Game_Player || character instanceof Game_Follower) {
                continue; // 플레이어/파티원은 계속 숨김 상태 유지
            }
            sprite.show();
        }
    };

})();
