//=============================================================================
// SnowballRoll.js
//=============================================================================
/*:
 * @plugindesc 눈덩이를 밀면 회전하며 커지고, 완성되면 몸통이 되며,
 * 2단계 눈덩이를 몸통 위로 가져가면 머리로 합쳐지는 눈사람 기믹.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 눈덩이로 쓸 이벤트의 "메모"란(이벤트 전체 메모, 페이지 메모 아님)에
 * 아래 노트태그를 입력하세요.
 *
 *   <Snowball Stage:1>   // 몸통이 될 1단계 눈덩이
 *   <Snowball Stage:2>   // 머리가 될 2단계 눈덩이
 *
 * 이벤트 그래픽은 48x48 캐릭터 이미지(직접 만드신 것)를 사용하시면 됩니다.
 * 이벤트의 우선순위는 "캐릭터와 같은 높이", 이동속도는 상관없음(강제로 옮김),
 * 이동 타입은 "고정"으로 두세요.
 *
 * 플레이어가 눈덩이 정면에서 그 방향으로 이동하면(미는 동작), 눈덩이가
 * 한 칸 밀려나면서 크기가 커지고 회전합니다. 최대 크기에 도달하면
 * 그 자리에 고정되어 더 이상 밀리지 않습니다(몸통/머리 완성).
 *
 * 2단계 눈덩이를 밀어서 "완성된 1단계 눈덩이(몸통)"와 같은 칸으로
 * 이동시키면 자동으로 그 위에 얹힌 것처럼 위치가 보정되고 고정됩니다.
 * (완성 여부와 무관하게, 몸통 타일에 도달하는 즉시 합체합니다)
 *
 * ============================================================================
 * 플러그인 커맨드
 * ============================================================================
 * 없음 (노트태그만으로 동작)
 *
 * ============================================================================
 * 파라미터
 * ============================================================================
 */

(function() {

    //-------------------------------------------------------------------
    // 설정값 (필요하면 여기 숫자만 수정)
    //-------------------------------------------------------------------
    var GROWTH_PER_PUSH   = 0.12;   // 한 번 밀 때마다 커지는 배율
    var ROTATE_PER_PUSH   = 35;     // 한 번 밀 때마다 회전하는 각도(도)
    var STAGE1_MAX_SCALE  = 8.0;    // 몸통 최대 배율 (48px * 8 = 384px)
    var STAGE1_START_SCALE = 1.0;
    var STAGE2_MAX_SCALE  = 4.0;    // 머리 최대 배율 (48px * 4 = 192px)
    var STAGE2_START_SCALE = 1.0;
    var SNOWMAN_COMPLETE_SWITCH = 1;   // 눈사람 완성 시 ON 시킬 스위치 번호 (0이면 사용 안 함)
    var ALLOWED_REGION_IDS = [1];      // 눈덩이가 자랄 수 있는 리전 ID 목록. 예: [1, 2]
                                        // 비워두면([]) 리전 상관없이 어디서든 작동

    //-------------------------------------------------------------------
    // 데이터 저장 ($gameSystem에 저장되어 세이브/로드 유지됨)
    //-------------------------------------------------------------------
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._snowballData = this._snowballData || {};
    };

    function snowballKey(mapId, eventId) {
        return mapId + '_' + eventId;
    }

    function getSnowballData(mapId, eventId) {
        if (!$gameSystem._snowballData) {
            $gameSystem._snowballData = {};
        }
        var key = snowballKey(mapId, eventId);
        if (!$gameSystem._snowballData[key]) {
            $gameSystem._snowballData[key] = {
                scale: 1.0,
                rotation: 0,
                completed: false,
                offsetY: 0
            };
        }
        return $gameSystem._snowballData[key];
    }

    //-------------------------------------------------------------------
    // Game_Event 확장
    //-------------------------------------------------------------------
    Game_Event.prototype.snowballStage = function() {
        if (!this.event()) return 0;
        var note = this.event().note || '';
        var match = /<Snowball\s*Stage:\s*(\d+)/i.exec(note);
        return match ? Number(match[1]) : 0;
    };

    Game_Event.prototype.isSnowball = function() {
        return this.snowballStage() > 0;
    };

    // <Snowball Stage:1 Switch:5> 처럼 이벤트별로 완성 스위치 지정 가능
    Game_Event.prototype.snowballSwitchId = function() {
        if (!this.event()) return 0;
        var note = this.event().note || '';
        var match = /<Snowball\s*Stage:\s*\d+\s*Switch:\s*(\d+)>/i.exec(note);
        return match ? Number(match[1]) : SNOWMAN_COMPLETE_SWITCH;
    };

    Game_Event.prototype.snowballData = function() {
        return getSnowballData(this._mapId || $gameMap.mapId(), this._eventId);
    };

    Game_Event.prototype.snowballMaxScale = function() {
        return this.snowballStage() === 1 ? STAGE1_MAX_SCALE : STAGE2_MAX_SCALE;
    };

    Game_Event.prototype.snowballStartScale = function() {
        return this.snowballStage() === 1 ? STAGE1_START_SCALE : STAGE2_START_SCALE;
    };

    Game_Event.prototype.isSnowballCompleted = function() {
        return this.snowballData().completed;
    };

    // 이 눈덩이를 dir 방향으로 밀 수 있는지 체크
    Game_Event.prototype.canBePushed = function(dir) {
        if (!this.isSnowball()) return false;
        if (this.isSnowballCompleted()) return false;
        var x2 = $gameMap.roundXWithDirection(this.x, dir);
        var y2 = $gameMap.roundYWithDirection(this.y, dir);
        if (!$gameMap.isValid(x2, y2)) return false;
        if (ALLOWED_REGION_IDS.length > 0) {
            var regionId = $gameMap.regionId(x2, y2);
            if (ALLOWED_REGION_IDS.indexOf(regionId) < 0) return false;
        }
        // 그 너머 타일이 통행 가능해야 함 (다른 이벤트 포함해서 자기 자신 이동 체크는
        // moveStraight 내부에서 다시 하므로 여기서는 대략적 사전 체크만)
        return this.canPass(this.x, this.y, dir);
    };


    // 실제로 한 칸 밀기 + 성장 처리
    Game_Event.prototype.pushBy = function(dir) {
        var beforeX = this.x, beforeY = this.y;
        this.moveStraight(dir);
        if (this.x === beforeX && this.y === beforeY) {
            return false; // 이동 실패
        }
        this.growSnowball();
        this.checkSnowballMerge();
        return true;
    };

    Game_Event.prototype.growSnowball = function() {
        var data = this.snowballData();
        var maxScale = this.snowballMaxScale();
        if (data.scale < 1.0) data.scale = this.snowballStartScale();
        data.scale = Math.min(maxScale, data.scale + GROWTH_PER_PUSH);
        data.rotation += ROTATE_PER_PUSH;
        // 최대 크기에 도달해도 멈추지 않고 계속 굴러갈 수 있게 completed는 여기서 세팅하지 않음
    };

    Game_Event.prototype.isSnowballMaxSize = function() {
        var data = this.snowballData();
        return data.scale >= this.snowballMaxScale();
    };

    // 2단계 눈덩이가 완성된 1단계(몸통) 타일에 도착했는지 체크 -> 합체
    Game_Event.prototype.checkSnowballMerge = function() {
        if (this.snowballStage() !== 2) return;
        var myData = this.snowballData();
        var events = $gameMap.events();
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];
            if (ev === this) continue;
            if (ev.snowballStage() === 1) {
                var bodyData = ev.snowballData();
                var dx = Math.abs(ev.x - this.x);
                var dy = Math.abs(ev.y - this.y);
                var dist = Math.max(dx, dy); // 체비셰프 거리 (대각선도 포함)
                // 몸통+머리 크기가 클수록 합체 가능 범위도 함께 넓어짐
                var mergeRange = Math.max(1, Math.round((bodyData.scale + myData.scale) / 2));
                if (dist <= mergeRange) {
                    this.attachAsHeadOf(ev);
                    return;
                }
            }
        }
    };

    Game_Event.prototype.attachAsHeadOf = function(bodyEvent) {
        var myData = this.snowballData();
        var bodyData = bodyEvent.snowballData();
        // 머리를 몸통과 같은 칸으로 스냅시켜서 깔끔하게 겹쳐 보이게 함
        this.setPosition(bodyEvent.x, bodyEvent.y);
        // 몸통 위에 머리가 얹히도록 위쪽으로 픽셀 오프셋
        var bodyPixelHeight = 48 * bodyData.scale;
        var headPixelHeight = 48 * myData.scale;
        // 중앙 앵커(0.5,0.5) 기준: 몸통 중심에서 위로 (몸통 절반 + 머리 절반)만큼
        // 이동하면 몸통 꼭대기에 머리 아랫부분이 정확히 닿음
        myData.offsetY = -(bodyPixelHeight / 2 + headPixelHeight / 2);
        myData.completed = true;
        myData.merged = true;
        this.setThrough(true);
        bodyData.completed = true;
        bodyEvent.setThrough(true);
        var switchId = bodyEvent.snowballSwitchId();
        if (switchId > 0) {
            $gameSwitches.setValue(switchId, true);
        }
    };

    //-------------------------------------------------------------------
    // Game_Map: 특정 좌표의 눈덩이 이벤트 찾기
    //-------------------------------------------------------------------
    Game_Map.prototype.snowballEventAt = function(x, y) {
        var events = this.eventsXy(x, y);
        for (var i = 0; i < events.length; i++) {
            if (events[i].isSnowball()) return events[i];
        }
        return null;
    };

    //-------------------------------------------------------------------
    // Game_Player: 이동 방향에 눈덩이가 있으면 먼저 밀어준다
    //-------------------------------------------------------------------
    function perpendicularDirs(d) {
        if (d === 2 || d === 8) return [4, 6];
        if (d === 4 || d === 6) return [2, 8];
        return [];
    }

    var _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
    Game_Player.prototype.moveStraight = function(d) {
        if (this.canMove()) {
            var x2 = $gameMap.roundXWithDirection(this.x, d);
            var y2 = $gameMap.roundYWithDirection(this.y, d);
            var snowEvent = $gameMap.snowballEventAt(x2, y2);
            if (snowEvent && !snowEvent.isSnowballCompleted()) {
                if (snowEvent.canBePushed(d)) {
                    snowEvent.pushBy(d);
                } else {
                    // 정면이 막혔으면 90도 옆 방향으로 시도
                    var perp = perpendicularDirs(d);
                    for (var i = 0; i < perp.length; i++) {
                        if (snowEvent.canBePushed(perp[i])) {
                            snowEvent.pushBy(perp[i]);
                            break;
                        }
                    }
                }
            }
        }
        _Game_Player_moveStraight.call(this, d);
    };

    //-------------------------------------------------------------------
    // Sprite_Character: 눈덩이 스케일 / 회전 / 오프셋 적용
    //-------------------------------------------------------------------
    var _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _Sprite_Character_update.call(this);
        if (this._character instanceof Game_Event && this._character.isSnowball()) {
            var data = this._character.snowballData();
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
            this.scale.x = data.scale;
            this.scale.y = data.scale;
            this.rotation = data.rotation * Math.PI / 180;
            this.y += data.offsetY || 0;
        }
    };

})();
