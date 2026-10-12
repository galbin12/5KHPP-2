//=============================================================================
// ProximityFailTrigger.js
//=============================================================================

/*:
 * @plugindesc 플레이어가 특정 이벤트(액터/적 등)와 지정한 칸 수 이하로 가까워지면
 * 지정한 공통 이벤트를 자동으로 실행합니다. (감지/실패 연출용)
 * @author Claude
 *
 * @param Safe Region ID
 * @desc 이 리전 번호 위에 플레이어가 있으면 항상 무적(감지 무시). 0=사용 안 함
 * @default 0
 *
 * @param Disable Switch ID
 * @desc 이 스위치가 ON이면 모든 감지를 통째로 끕니다. 0=사용 안 함
 * @default 0
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 감지시키고 싶은 이벤트(NPC, 몬스터 등)의 현재 페이지 안에
 * "주석(코멘트)"으로 아래처럼 한 줄 적어주세요.
 *
 *     <ProximityFail: 거리, 공통이벤트ID>
 *
 * 예) 3칸 이내로 다가가면 10번 공통 이벤트(게임오버 등)를 실행:
 *
 *     <ProximityFail: 3, 10>
 *
 * ------------------------------------------------------------------------
 * 동작 방식
 * ------------------------------------------------------------------------
 * - 거리 계산은 대각선도 1칸으로 치는 방식(체비셰프 거리)입니다.
 *   즉 이벤트를 중심으로 "정사각형" 범위가 만들어지며, 플레이어가 그
 *   범위 안으로 들어오면 발동합니다.
 * - 범위 밖으로 나갔다가 다시 범위 안으로 들어오면 매번 다시 발동합니다.
 * - 다른 이벤트가 실행 중일 때는 체크하지 않습니다. (메시지 도중 등)
 * - 발동시 $gameTemp.reserveCommonEvent()로 공통 이벤트를 예약 실행합니다.
 * - 발동한 이벤트(NPC)는 그 즉시 그 자리에서 멈춥니다 (랜덤이동/이동루트
 *   전부 정지). 범위를 벗어나면 자동으로 다시 원래 이동(순찰 등)을
 *   재개합니다.
 *
 * ------------------------------------------------------------------------
 * 숨기(잠깐 무적) 기능
 * ------------------------------------------------------------------------
 * 특정 장소(장소이동 등)로 숨었을 때 잠깐 감지되지 않게 하고 싶으면,
 * 그 이벤트 명령 중 "장소이동" 다음 줄에 플러그인 명령을 추가하세요.
 *
 *     HideImmunity 2
 *
 * → 2초간 ProximityFail 감지가 전부 무시됩니다. (초 단위, 소수점 가능)
 *
 * ------------------------------------------------------------------------
 * 특정 구간(리전)에서 항상 무적
 * ------------------------------------------------------------------------
 * 플러그인 매개변수(Safe Region ID)에 리전 번호를 지정하면, 맵 에디터의
 * "리전" 레이어로 그 번호를 칠해둔 타일 위에 플레이어가 서 있는 동안은
 * 시간 제한 없이 계속 감지가 무시됩니다. (숨는 방, 안전지대 등에 사용)
 *
 * 추가로, <ProximityFail> 태그가 붙은 이벤트(NPC)는 이 안전구역 타일로는
 * 아예 걸어 들어오지 못합니다. (플레이어가 숨어있는데 NPC가 그 안까지
 * 따라 들어오는 것을 방지)
 *
 * 0으로 두면 이 기능은 꺼집니다.
 *
 * ------------------------------------------------------------------------
 * 감지 전체를 껐다 켰다 하기
 * ------------------------------------------------------------------------
 * 방법 A) 스위치 자동 연동 (권장)
 *   플러그인 매개변수(Disable Switch ID)에 스위치 번호를 지정하면,
 *   그 스위치가 ON인 동안에는 모든 <ProximityFail> 감지가 자동으로
 *   꺼집니다. 그냥 이벤트에서 그 스위치만 켜고 끄면 됩니다.
 *
 * 방법 B) 플러그인 명령으로 직접 껐다 켰다
 *   ProximityDetection off       모든 감지를 끕니다
 *   ProximityDetection on        모든 감지를 다시 켭니다
 *   ProximityDetection toggle    켜짐/꺼짐 전환
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {

    var regex = /<ProximityFail:\s*(\d+)\s*,\s*(\d+)\s*>/i;
    var hideImmunityFrames = 0;
    var parameters = PluginManager.parameters('ProximityFailTrigger');
    var safeRegionId = Number(parameters['Safe Region ID'] || 0);
    var disableSwitchId = Number(parameters['Disable Switch ID'] || 0);
    var manuallyDisabled = false;

    function isImmuneNow() {
        if (hideImmunityFrames > 0) return true;
        if (safeRegionId > 0 && $gamePlayer.regionId() === safeRegionId) return true;
        return false;
    }

    function isDetectionOff() {
        if (manuallyDisabled) return true;
        if (disableSwitchId > 0 && $gameSwitches.value(disableSwitchId)) return true;
        return false;
    }

    // 다른 플러그인(ShowProximityRange 등)이 감지 on/off 상태를 참고할 수 있게 공개
    window.$isProximityDetectionOff = isDetectionOff;

    //--------------------------------------------------------------------
    // 플러그인 명령
    //--------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'HideImmunity') {
            var seconds = Number(args[0] || 0);
            hideImmunityFrames = Math.max(hideImmunityFrames, Math.round(seconds * 60));
        } else if (command === 'ProximityDetection') {
            var mode = String(args[0] || '').toLowerCase();
            if (mode === 'off') {
                manuallyDisabled = true;
            } else if (mode === 'on') {
                manuallyDisabled = false;
            } else if (mode === 'toggle') {
                manuallyDisabled = !manuallyDisabled;
            }
        }
    };

    //--------------------------------------------------------------------
    // 이벤트 주석 파싱
    //--------------------------------------------------------------------

    function findProximityFailData(page) {
        if (!page) return null;
        for (var i = 0; i < page.list.length; i++) {
            var cmd = page.list[i];
            if (cmd.code === 108 || cmd.code === 408) {
                var match = regex.exec(cmd.parameters[0]);
                if (match) {
                    return {
                        range: Number(match[1]),
                        commonEventId: Number(match[2]),
                        inRange: false,
                        frozen: false
                    };
                }
            }
        }
        return null;
    }

    var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
    Game_Event.prototype.setupPageSettings = function() {
        _Game_Event_setupPageSettings.call(this);
        this._proximityFail = findProximityFailData(this.page());
    };

    //--------------------------------------------------------------------
    // 매 프레임 갱신 (무적시간 카운트다운은 여기 한 곳에서만 처리)
    //--------------------------------------------------------------------

    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.call(this, sceneActive);
        if (hideImmunityFrames > 0) {
            hideImmunityFrames--;
        }
    };

    var _Game_Event_update = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        _Game_Event_update.call(this);
        var pf = this._proximityFail;
        if (pf && isDetectionOff()) {
            if (pf.inRange || pf.frozen) {
                pf.inRange = false;
                pf.frozen = false;
            }
            return;
        }
        if (pf && !$gameMap.isEventRunning() && !isImmuneNow()) {
            var dx = Math.abs($gamePlayer.x - this.x);
            var dy = Math.abs($gamePlayer.y - this.y);
            var dist = Math.max(dx, dy);
            var inRangeNow = dist <= pf.range;
            if (inRangeNow && !pf.inRange) {
                pf.inRange = true;
                pf.frozen = true;
                $gameTemp.reserveCommonEvent(pf.commonEventId);
            } else if (!inRangeNow && pf.inRange) {
                pf.inRange = false;
                pf.frozen = false;
            }
        }
    };

    // 발동한 이벤트는 그 자리에서 멈춤 (랜덤이동/커스텀 이동루트 전부 정지)
    var _Game_Event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
    Game_Event.prototype.updateSelfMovement = function() {
        if (this._proximityFail && this._proximityFail.frozen) {
            return;
        }
        _Game_Event_updateSelfMovement.call(this);
    };

    // 안전구역(리전) 타일로는 감지 이벤트(NPC)가 아예 들어오지 못하게 막음
    var _Game_Event_canPass = Game_Event.prototype.canPass;
    Game_Event.prototype.canPass = function(x, y, d) {
        if (this._proximityFail && safeRegionId > 0) {
            var x2 = $gameMap.roundXWithDirection(x, d);
            var y2 = $gameMap.roundYWithDirection(y, d);
            if ($gameMap.regionId(x2, y2) === safeRegionId) {
                return false;
            }
        }
        return _Game_Event_canPass.call(this, x, y, d);
    };

})();
