//=============================================================================
// FallToStart.js
//=============================================================================

/*:
 * @plugindesc 특정 리전 ID 타일을 밟으면 아래로 떨어진 뒤 시작지점으로 되돌아가는 플러그인 v1.0
 * @author 
 *
 * @param RegionIds
 * @text 낙하 리전 ID
 * @desc 밟으면 떨어지는 리전 ID. 여러 개는 쉼표로 구분 (예: 1,2,5)
 * @default 1
 *
 * @param TargetMapIds
 * @text 적용 맵 ID
 * @desc 이 플러그인을 적용할 맵 ID. 비워두면 모든 맵에 적용 (예: 3,4)
 * @default
 *
 * @param StartMapId
 * @text 복귀 맵 ID
 * @desc 되돌아갈 맵 ID. 0이면 데이터베이스(시스템)의 초기 위치 사용
 * @type number
 * @min 0
 * @default 0
 *
 * @param StartX
 * @text 복귀 X 좌표
 * @desc 복귀 맵 ID가 1 이상일 때만 사용
 * @type number
 * @min 0
 * @default 0
 *
 * @param StartY
 * @text 복귀 Y 좌표
 * @desc 복귀 맵 ID가 1 이상일 때만 사용
 * @type number
 * @min 0
 * @default 0
 *
 * @param FallFrames
 * @text 낙하 시간(프레임)
 * @desc 떨어지는 연출이 지속되는 프레임 수 (60프레임 = 1초)
 * @type number
 * @min 1
 * @default 40
 *
 * @param FallDistance
 * @text 낙하 거리(픽셀)
 * @desc 캐릭터가 아래로 떨어지는 거리
 * @type number
 * @min 0
 * @default 96
 *
 * @param FallSe
 * @text 낙하 효과음
 * @desc 낙하 시 재생할 SE 파일 이름 (audio/se). 비워두면 없음
 * @default
 *
 * @param FallSeVolume
 * @text 효과음 볼륨
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param FallSePitch
 * @text 효과음 피치
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param DisableSwitchId
 * @text 비활성화 스위치 ID
 * @desc 이 스위치가 ON이면 낙하 기능이 꺼집니다. 0이면 사용 안 함
 * @type number
 * @min 0
 * @default 0
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 1. 맵 에디터의 리전 레이어(F7)로 함정 타일에 리전 ID를 칠합니다.
 * 2. 플러그인 매개변수 [낙하 리전 ID]에 같은 번호를 입력합니다.
 * 3. 플레이어가 해당 타일에 도착하면 아래로 떨어지며 사라지고,
 *    지정한 시작지점으로 이동합니다.
 *
 * - 파티원(팔로워)도 함께 떨어집니다.
 * - 이벤트 실행 중, 탈것 탑승 중, 통과(Through) 상태에서는 작동하지 않습니다.
 * - 복귀 지점 타일에 낙하 리전이 칠해져 있으면 반복해서 떨어지니 주의하세요.
 *
 * 플러그인 커맨드
 *   FallToStart on    # 낙하 기능 켜기
 *   FallToStart off   # 낙하 기능 끄기
 *   FallToStart now   # 현재 위치에서 즉시 낙하 시작
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('FallToStart');

    function parseIds(str) {
        return String(str || '').split(',').map(function(s) {
            return Number(s.trim());
        }).filter(function(n) { return n > 0; });
    }

    var regionIds   = parseIds(params['RegionIds']);
    var targetMaps  = parseIds(params['TargetMapIds']);
    var startMapId  = Number(params['StartMapId'] || 0);
    var startX      = Number(params['StartX'] || 0);
    var startY      = Number(params['StartY'] || 0);
    var fallFrames  = Math.max(1, Number(params['FallFrames'] || 40));
    var fallDist    = Number(params['FallDistance'] || 96);
    var fallSeName  = String(params['FallSe'] || '');
    var fallSeVol   = Number(params['FallSeVolume'] || 90);
    var fallSePitch = Number(params['FallSePitch'] || 100);
    var disableSw   = Number(params['DisableSwitchId'] || 0);

    var _enabled = true;

    //-------------------------------------------------------------------------
    // 플러그인 커맨드
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'FallToStart') {
            switch ((args[0] || '').toLowerCase()) {
            case 'on':  _enabled = true;  break;
            case 'off': _enabled = false; break;
            case 'now': $gamePlayer.startFall(); break;
            }
        }
    };

    //-------------------------------------------------------------------------
    // 낙하 대상 판별 (플레이어 + 팔로워)
    //-------------------------------------------------------------------------
    function isFallTarget(character) {
        return character === $gamePlayer || character instanceof Game_Follower;
    }

    function fallRate() {
        if (!$gamePlayer || !$gamePlayer._fallCount) return 0;
        var t = 1 - $gamePlayer._fallCount / fallFrames;
        return Math.min(1, Math.max(0, t));
    }

    //-------------------------------------------------------------------------
    // Game_Player
    //-------------------------------------------------------------------------
    var _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _Game_Player_initMembers.call(this);
        this._fallCount = 0;
    };

    Game_Player.prototype.isFalling = function() {
        return this._fallCount > 0;
    };

    Game_Player.prototype.canFall = function() {
        if (!_enabled) return false;
        if (disableSw > 0 && $gameSwitches.value(disableSw)) return false;
        if (this.isFalling() || this.isTransferring()) return false;
        if (this.isInVehicle() || this.isThrough()) return false;
        if ($gameMap.isEventRunning()) return false;
        if (targetMaps.length > 0 && targetMaps.indexOf($gameMap.mapId()) < 0) return false;
        return true;
    };

    Game_Player.prototype.startFall = function() {
        if (this.isFalling()) return;
        this._fallCount = fallFrames;
        if (fallSeName) {
            AudioManager.playSe({ name: fallSeName, volume: fallSeVol, pitch: fallSePitch, pan: 0 });
        }
    };

    Game_Player.prototype.updateFall = function() {
        this._fallCount--;
        if (this._fallCount <= 0) {
            this._fallCount = 0;
            this.finishFall();
        }
    };

    Game_Player.prototype.finishFall = function() {
        var mapId = startMapId;
        var x = startX;
        var y = startY;
        if (mapId <= 0) {
            mapId = $dataSystem.startMapId;
            x = $dataSystem.startX;
            y = $dataSystem.startY;
        }
        // 이전 이동 상태가 남지 않도록 정리 후 장소 이동 예약
        this.reserveTransfer(mapId, x, y, 2, 0);
    };

    var _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        if (this.isFalling()) {
            this.updateFall();
        } else if (!this.isMoving() && this.canFall() &&
                   regionIds.indexOf(this.regionId()) >= 0) {
            this.startFall();
        }
        _Game_Player_update.call(this, sceneActive);
    };

    // 낙하 중에는 조작 불가
    var _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (this.isFalling()) return false;
        return _Game_Player_canMove.call(this);
    };

    // 장소 이동 후 낙하 상태 초기화
    var _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        this._fallCount = 0;
        _Game_Player_performTransfer.call(this);
    };

    //-------------------------------------------------------------------------
    // 화면 표시: 아래로 내려가며 투명해짐
    //-------------------------------------------------------------------------
    var _Game_CharacterBase_screenY = Game_CharacterBase.prototype.screenY;
    Game_CharacterBase.prototype.screenY = function() {
        var y = _Game_CharacterBase_screenY.call(this);
        if (isFallTarget(this)) {
            var r = fallRate();
            y += Math.round(fallDist * r * r);   // 점점 빨라지는 낙하
        }
        return y;
    };

    var _Game_CharacterBase_opacity = Game_CharacterBase.prototype.opacity;
    Game_CharacterBase.prototype.opacity = function() {
        var o = _Game_CharacterBase_opacity.call(this);
        if (isFallTarget(this)) {
            o = Math.round(o * (1 - fallRate()));
        }
        return o;
    };

})();
