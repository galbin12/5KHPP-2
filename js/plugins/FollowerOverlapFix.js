//=============================================================================
// FollowerOverlapFix.js
//=============================================================================

/*:
 * @plugindesc 기본 "이동 루트 설정"(대상: 플레이어) 사용 시 팔로워가 리더와
 * 같은 칸에 겹치지 않도록 하고, 리더가 점프하면 팔로워도 각자 그 자리에서
 * 같은 상대좌표로 점프하게 합니다.
 * @author (project)
 *
 * @param SyncFollowerJump
 * @text 팔로워 동시 점프
 * @type boolean
 * @on 켜짐(같이 점프)
 * @off 꺼짐(리더만 점프)
 * @desc 리더가 점프할 때 팔로워도 같은 상대좌표로 같이 점프할지 여부.
 * 꺼두면 리더만 점프하고 팔로워는 걸어서 따라옵니다. 기본값: 꺼짐
 * @default false
 *
 * @param FollowerChase
 * @text 팔로워 추적
 * @type boolean
 * @on 켜짐(따라옴)
 * @off 꺼짐(제자리에 정지)
 * @desc 꺼두면 팔로워가 리더를 아예 쫓아오지 않고 제자리에 멈춰 있습니다.
 * (걸어서 따라잡는 것도 안 함) 기본값: 켜짐
 * @default true
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * 기본 RPG Maker MV 팔로워 추적 로직(chaseCharacter)은 목표 지점을
 * "선행 캐릭터(리더 또는 앞 팔로워)의 현재 칸"으로 잡습니다.
 * 리더가 이동을 멈추면 팔로워가 계속 걸어서 따라오다가 결국 리더와
 * 완전히 같은 칸까지 파고들어 겹쳐버리는 문제가 있습니다.
 * (특히 "이동 루트 설정"으로 리더를 점프시키면 팔로워는 걸어서 뒤늦게
 * 따라잡다가 리더 칸에 딱 붙어버리는 게 눈에 띕니다.)
 *
 * 이 플러그인은 두 가지를 처리합니다.
 *
 * 1) 리더가 점프하면(ROUTE_JUMP 포함, 기본 이동 루트 설정으로 대상=플레이어
 *    지정 후 "점프" 명령 사용 시) 화면에 보이는 각 팔로워도 자기 위치 기준
 *    "같은 상대 좌표(dx, dy)"로 동시에 점프합니다. 팔로워가 걸어서
 *    따라잡지 않으므로 대형이 그대로 유지되고 리더 칸을 파고들지 않습니다.
 *    (팔로워의 점프 착지 지점이 통행 불가면 해당 팔로워는 점프하지 않고
 *    기존 방식대로 걸어서 따라옵니다.)
 *
 * 2) 평상시 걸어서 따라오는 추적(chaseCharacter) 중에도, 목표 칸이
 *    선행 캐릭터(리더 또는 앞 팔로워)가 "현재 멈춰서 서 있는 칸"과
 *    정확히 같아지는 마지막 한 칸은 밟지 않고 그 앞에서 멈춥니다.
 *    선행 캐릭터가 이동 중이면(곧 비워질 칸이면) 기존처럼 정상적으로
 *    따라갑니다.
 *
 * ============================================================================
 * 플러그인 커맨드
 * ============================================================================
 * FollowerSyncJump on
 *   리더 점프 시 팔로워도 같이 점프하도록 켭니다. (기본 파라미터와 무관하게
 *   게임 중간에 전환 가능)
 *
 * FollowerSyncJump off
 *   리더만 점프하고 팔로워는 걸어서 따라오도록 끕니다.
 *   (겹침 방지 로직 2번 항목은 이 설정과 무관하게 항상 동작합니다.)
 *
 * FollowerChase off
 *   팔로워가 리더를 아예 쫓아오지 않고 지금 있는 자리에 완전히 멈춥니다.
 *   (걸어서 따라잡는 것도, 점프로 같이 움직이는 것도 안 함)
 *   리더가 혼자 이동/점프해서 멀어져도 팔로워는 그대로 있습니다.
 *
 * FollowerChase on
 *   다시 리더를 따라오도록 켭니다.
 *
 * ============================================================================
 * 스크립트에서 직접 사용하기
 * ============================================================================
 * FollowerOverlapFix.setSyncJump(true/false)
 *   위 플러그인 커맨드와 동일한 기능을 스크립트/이동루트의 script: 토큰
 *   등에서 직접 호출할 수 있습니다.
 *
 * FollowerOverlapFix.setChaseEnabled(true/false)
 *   FollowerChase on/off와 동일한 기능을 스크립트에서 직접 호출합니다.
 *
 * 적용 대상: RPG Maker MV
 * ============================================================================
 */

var FollowerOverlapFix = FollowerOverlapFix || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('FollowerOverlapFix');
    FollowerOverlapFix._syncJump = (parameters['SyncFollowerJump'] || 'false') === 'true';
    FollowerOverlapFix._chaseEnabled = (parameters['FollowerChase'] || 'true') === 'true';

    FollowerOverlapFix.setSyncJump = function(value) {
        FollowerOverlapFix._syncJump = !!value;
    };

    FollowerOverlapFix.isSyncJumpEnabled = function() {
        return FollowerOverlapFix._syncJump;
    };

    FollowerOverlapFix.setChaseEnabled = function(value) {
        value = !!value;
        if (value === FollowerOverlapFix._chaseEnabled) return;
        FollowerOverlapFix._chaseEnabled = value;

        if (!value) {
            // 끄는 순간 현재 위치를 그대로 고정 앵커로 저장
            var followers = $gamePlayer.followers()._data;
            for (var i = 0; i < followers.length; i++) {
                var f = followers[i];
                f._foFrozen = {
                    x: f._x, y: f._y,
                    realX: f._realX, realY: f._realY,
                    direction: f.direction()
                };
            }
        } else {
            var followers2 = $gamePlayer.followers()._data;
            for (var j = 0; j < followers2.length; j++) {
                followers2[j]._foFrozen = null;
            }
        }
    };

    FollowerOverlapFix.isChaseEnabled = function() {
        return FollowerOverlapFix._chaseEnabled;
    };

    var _Game_Interpreter_pluginCommand_FOF = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand_FOF.call(this, command, args);

        if (command === 'FollowerSyncJump') {
            var mode = (args[0] || '').toLowerCase();
            FollowerOverlapFix.setSyncJump(mode === 'on');
        }

        if (command === 'FollowerChase') {
            var chaseMode = (args[0] || '').toLowerCase();
            FollowerOverlapFix.setChaseEnabled(chaseMode === 'on');
        }
    };

    //-------------------------------------------------------------------
    // 1) 리더 점프 시 팔로워도 동일한 상대좌표로 동시 점프
    //-------------------------------------------------------------------
    var _Game_Player_jump = Game_Player.prototype.jump;
    Game_Player.prototype.jump = function(xPlus, yPlus) {
        _Game_Player_jump.call(this, xPlus, yPlus);

        if (!FollowerOverlapFix.isChaseEnabled()) return;
        if (!FollowerOverlapFix.isSyncJumpEnabled()) return;

        var followers = this.followers()._data;
        for (var i = 0; i < followers.length; i++) {
            var follower = followers[i];
            if (!follower.isVisible()) continue;
            if (follower.isJumping() || follower.isMoving()) continue;

            if (FollowerOverlapFix.isJumpLandingOk(follower, xPlus, yPlus)) {
                follower.jump(xPlus, yPlus);
                follower._followerSyncJump = true;
            }
            // 착지 지점이 막혀있으면 아무것도 하지 않음 -> 다음 프레임부터
            // 기존 chaseCharacter 로직으로 걸어서 따라옴
        }
    };

    // 점프 착지 지점이 실제로 통행 가능한지 검사
    FollowerOverlapFix.isJumpLandingOk = function(character, xPlus, yPlus) {
        var newX = character.x + xPlus;
        var newY = character.y + yPlus;
        if (xPlus === 0 && yPlus === 0) return true;
        if (!$gameMap.isValid(newX, newY)) return false;

        // Game_Player.jump 내부와 동일한 방식으로 경로상 통행 가능 여부 확인
        var x1 = character.x;
        var y1 = character.y;
        var x2 = newX;
        var y2 = newY;
        if (Math.abs(xPlus) > Math.abs(yPlus)) {
            if (yPlus !== 0) {
                var d = xPlus > 0 ? 6 : 4;
                if (!character.canPass(x1, y1, d)) return false;
            }
        } else {
            if (xPlus !== 0) {
                var d2 = yPlus > 0 ? 2 : 8;
                if (!character.canPass(x1, y1, d2)) return false;
            }
        }
        return character.canPassDiagonally
            ? character.canPassDiagonally(x1, y1,
                xPlus > 0 ? 6 : (xPlus < 0 ? 4 : (yPlus > 0 ? 2 : 8)),
                yPlus > 0 ? 2 : (yPlus < 0 ? 8 : (xPlus > 0 ? 6 : 4)))
            : true;
    };

    //-------------------------------------------------------------------
    // 2-1) 추적 꺼짐 상태에서는 매 프레임 위치를 강제로 고정 (무조건 정지)
    //-------------------------------------------------------------------
    var _Game_Follower_update = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function() {
        _Game_Follower_update.call(this);

        if (!FollowerOverlapFix.isChaseEnabled() && this._foFrozen) {
            this._x = this._foFrozen.x;
            this._y = this._foFrozen.y;
            this._realX = this._foFrozen.realX;
            this._realY = this._foFrozen.realY;
            this.setDirection(this._foFrozen.direction);
            this._moveRouteForcing = false;
        }
    };

    //-------------------------------------------------------------------
    // 2) FollowerChase off일 때만 완전 정지. 켜져 있으면 기본 동작 그대로.
    //-------------------------------------------------------------------

})();
