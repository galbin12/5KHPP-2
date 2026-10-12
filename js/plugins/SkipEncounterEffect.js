//================================================================
// RS_SkipEncounterEffect.js
//================================================================
/*:
 * @plugindesc (v1.0.0) 전투 시작 시 기본 하양+확대(인카운터) 연출을 건너뜁니다.
 * @author Custom
 *
 * @help
 * ============================================================================
 * 사용 방법
 * ============================================================================
 * 이 플러그인은 전투 진입 시 RPG Maker MV의 기본 연출(화면이 확대되면서
 * 하얗게 번쩍이는 효과)을 생략하고 즉시 전투 화면으로 전환합니다.
 *
 * 대신 원하는 커스텀 연출(그림 슬라이드/줌아웃 등)은 각 전투 그룹(Troop)의
 * 이벤트 페이지에서 아래처럼 구성하세요:
 *
 *   1. 데이터베이스(F9) → 그룹(Troops) → 원하는 그룹 선택
 *   2. 이벤트 페이지 추가 → 조건: "턴 0" 체크
 *   3. 아래 순서로 이벤트 명령 추가:
 *      - 그림 표시 (빨강 이미지, 화면 왼쪽 밖 좌표)
 *      - 그림 이동 (빨강 이미지를 화면 중앙으로, 이동시간 지정)
 *      - 그림 표시 (파랑 이미지, 화면 오른쪽 밖 좌표)
 *      - 그림 이동 (파랑 이미지를 화면 중앙으로)
 *      - 그림 표시 (초록 V 이미지, 확대율 200% 등 크게)
 *      - 그림 이동 (초록 V 이미지를 확대율 100%로, 이동시간 지정 = 줌아웃)
 *      - 그림 표시 (검정 S 이미지, 확대율 200%)
 *      - 그림 이동 (검정 S 이미지를 확대율 100%로 = 줌아웃)
 *      - 대기 (약 120~180프레임 = 2~3초)
 *      - 그림 표시 (흰색 전체화면 이미지)
 *      - 대기 (약 10~15프레임)
 *      - 그림 제거 (흰색 이미지)
 *      - 그림 제거 (나머지 이미지들 전부)
 *
 * 보스전 등 특정 전투에서 다른 이미지를 쓰고 싶으면, 그 그룹의 턴 0 페이지에서
 * 그림 파일명만 다르게 지정하면 됩니다. 그룹마다 자유롭게 다르게 설정 가능합니다.
 *
 * ============================================================================
 * 전투 시작 화면 자동 숨김 / 자동 복귀
 * ============================================================================
 * 전투 화면이 뜨자마자(트룹 이벤트가 실행되기도 전에) 상태창/커맨드창은
 * 물론, 전투 배경과 적/아군 스프라이트까지 전부 자동으로 숨깁니다.
 * 그리고 아래 "REVEAL_DELAY_FRAMES" 값(프레임 단위, 60프레임=1초)만큼
 * 시간이 지나면 자동으로 전부 다시 나타납니다. 스크립트를 따로 넣을 필요
 * 없이, 연출 시간에 맞춰 이 숫자만 조절하면 됩니다.
 * ============================================================================
 */
(function () {
  'use strict';

  // 전투 시작 후 몇 프레임 뒤에 화면(적/배경/창)이 자동으로 나타날지
  // 설정합니다. 60프레임 = 1초. 예) 90 = 1.5초, 120 = 2초
  var REVEAL_DELAY_FRAMES = 120;

  var RS = (window.RS = window.RS || {});

  // (흰색 커버로 가리는 방식은 배경 스냅샷 자체를 하얗게 찍어버리는 부작용이
  // 있어서 제거했습니다. Scene_Map 쪽 기본 줌+플래시 연출은 아주 짧게(약
  // 0.7초) 그대로 남지만, 대신 안전합니다. 전투 화면 진입 후 UI/적/아군을
  // 숨기는 기능은 아래에 그대로 유지됩니다.)

  RS.findRealStatusWindow = function (scene) {
    return scene.children.filter(function (c) {
      return c instanceof Window_BattleStatus;
    });
  };

  RS.findRealPartyCommandWindow = function (scene) {
    return scene.children.filter(function (c) {
      return c instanceof Window_PartyCommand;
    });
  };

  RS.hideBattleScreen = function () {
    var scene = SceneManager._scene;
    if (!(scene instanceof Scene_Battle)) return;
    RS.findRealStatusWindow(scene).forEach(function (w) {
      w.visible = false;
    });
    RS.findRealPartyCommandWindow(scene).forEach(function (w) {
      w.visible = false;
    });
    if (scene._actorCommandWindow) scene._actorCommandWindow.visible = false;
    var spriteset = scene._spriteset;
    if (spriteset) {
      (spriteset._enemySprites || []).forEach(function (s) {
        s.visible = false;
      });
      (spriteset._actorSprites || []).forEach(function (s) {
        s.visible = false;
      });
    }
  };

  RS.revealBattleScreen = function () {
    var scene = SceneManager._scene;
    if (!(scene instanceof Scene_Battle)) return;
    RS.findRealStatusWindow(scene).forEach(function (w) {
      w.visible = true;
    });
    RS.findRealPartyCommandWindow(scene).forEach(function (w) {
      w.visible = true;
    });
    if (scene._actorCommandWindow) scene._actorCommandWindow.visible = true;
    var spriteset = scene._spriteset;
    if (spriteset) {
      (spriteset._enemySprites || []).forEach(function (s) {
        s.visible = true;
      });
      (spriteset._actorSprites || []).forEach(function (s) {
        s.visible = true;
      });
    }
  };

  // 전투 화면 시작과 동시에(트룹 이벤트 실행 전에) 전부 숨깁니다.
  var alias_Scene_Battle_start = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function () {
    alias_Scene_Battle_start.call(this);
    RS.hideBattleScreen();
    this._rsRevealCounter = REVEAL_DELAY_FRAMES;
  };

  // 지정한 프레임 수가 지나면 자동으로 다시 보이게 합니다.
  // (그 사이에는 매 프레임 계속 숨김 상태를 강제로 유지합니다 - 나중에
  // 새로 생성되는 적/아군 스프라이트까지 대응하기 위함입니다)
  var alias_Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function () {
    alias_Scene_Battle_update.call(this);
    if (this._rsRevealCounter > 0) {
      RS.hideBattleScreen();
      this._rsRevealCounter--;
      if (this._rsRevealCounter <= 0) {
        RS.revealBattleScreen();
      }
    }
  };
})();
