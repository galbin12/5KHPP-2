//=============================================================================
// FallingItem.js
//=============================================================================

/*:
 * @plugindesc 화면 위에서 아이템이 떨어지고, 플레이어가 맞으면 빙글빙글
 * 회전하며 잠깐 기절했다가 원상복귀(또는 지정한 공통이벤트 실행)하는 연출.
 * @author ㄹㅅㅁ
 *
 * @param Item Image
 * @desc 기본 아이템 이미지 (img/pictures/[이름].png)
 * @default rock
 *
 * @param Fall Speed
 * @desc 아이템이 떨어지는 속도 (프레임당 px)
 * @default 6
 *
 * @param Spawn Interval
 * @desc 아이템이 생성되는 간격 (프레임)
 * @default 45
 *
 * @param Hit Range
 * @desc 플레이어와 아이템이 맞았다고 판정할 거리 (px)
 * @default 28
 *
 * @param Stun Duration
 * @desc 맞았을 때 기절(회전+낙하) 지속시간 (프레임, 60 = 1초)
 * @default 40
 *
 * @param Player Fall Distance
 * @desc 비행 중 맞았을 때 바닥까지 떨어지는 거리 (타일 수)
 * @default 6
 *
 * @param Invincible Duration
 * @desc 기절 연출이 다 끝나고 재비행 시작된 후 다시 맞지 않는 무적시간 (프레임)
 * @default 90
 *
 * @param Post Land Wait
 * @desc 낙하(+바운스)가 다 끝난 뒤 대사/스위치 처리 전에 그냥 멈춰서
 * 대기하는 시간 (프레임, 60 = 1초)
 * @default 60
 *
 * @param Fade Duration
 * @desc 재비행 시작 지점으로 되돌아갈 때 페이드아웃/인 시간 (프레임)
 * @default 20
 *
 * @help
 * ------------------------------------------------------------------
 * 플러그인 커맨드
 * ------------------------------------------------------------------
 *
 *   FallingItem_Start
 *
 * 또는 옵션 지정 (콜론으로 구분):
 *
 *   FallingItem_Start item:rock speed:6 interval:45 hitswitch:10
 *
 * 옵션 설명:
 *   item:rock            → 아이템 이미지 1개만 쓸 때 (img/pictures/items/rock.png)
 *   items:rock,apple,bomb → 아이템 이미지 여러 개를 랜덤으로 섞어서 사용
 *                           (쉼표로 구분, 지정하면 item 옵션은 무시됨.
 *                            img/pictures/items/[이름].png)
 *   speed:6              → 낙하 속도
 *   interval:45          → 시작 시점 생성 간격 (프레임)
 *   endinterval:10       → 최종적으로 도달하는 생성 간격 (프레임, 점점
 *                           작아짐 = 점점 많이 떨어짐). 생략하면 간격
 *                           변화 없이 interval 값 그대로 유지됨
 *   rampduration:600     → interval에서 endinterval까지 줄어드는 데
 *                           걸리는 시간 (프레임). 갈수록 빨라지는
 *                           가속 곡선으로 줄어듦 (초반엔 완만하고
 *                           후반에 확 빨라짐)
 *   phaseswitch:21        → rampduration이 다 차서 endinterval(최대
 *                           강도)에 도달하는 순간 켜지는 스위치
 *                           (생략 가능. "이제 피하기 힘들어지는 구간
 *                            진입"을 감지하는 용도로 쓰면 됨)
 *   hitswitch:10          → (1차) 맞을 때마다 켜지는 스위치 ID.
 *                           phaseswitch가 켜지기 전(=아직 여유 있는
 *                           구간)에 맞았을 때 사용됨
 *   hitswitch2:11         → (2차) phaseswitch가 켜진 뒤(=강도 최대
 *                           구간, 결국 맞게 되는 그 구간)에 맞았을 때
 *                           대신 사용할 스위치 ID. 생략하면 hitswitch
 *                           그대로 사용됨
 *   commonevent:5         → hitswitch와 짝지어 기절 종료 후 실행할
 *                           공통이벤트 (생략 가능)
 *   commonevent2:6        → hitswitch2와 짝지어 실행할 공통이벤트
 *                           (생략하면 commonevent 그대로 사용됨)
 *   landx:15 landy:8      → 비행 중 맞았을 때 떨어질 목표 좌표 (맵 타일
 *                           좌표). 둘 다 지정해야 적용됨. 지정하면 그냥
 *                           수직으로 떨어지는 대신 이 지점까지 회전하며
 *                           날아가서 착지함. 착지 후 landimage가 있으면
 *                           바운스 연출까지 이어짐
 *   landimage:Actor2      → 착지 순간부터 바운스 연출 동안 표시할 캐릭터
 *                           이미지 (img/characters/Actor2.png)
 *   landindex:3           → landimage의 캐릭터 인덱스 (기본 0)
 *   bouncedir:right        → 착지 후 통통 튀며 이동할 방향 (left/right,
 *                           기본 right). 한 번에 1칸씩 총 2번 튐
 *   bounceduration:20      → 한 번 튀는 데 걸리는 시간 (프레임)
 *   bounceheight1:20       → 첫 번째 튐의 높이 (px)
 *   bounceheight2:10       → 두 번째 튐의 높이 (px, 첫 번째보다 낮게
 *                           줘서 점점 잦아드는 느낌)
 *   minx:0               → 생성 X범위 최소값 (기본 0)
 *   maxx:816             → 생성 X범위 최대값 (기본 화면 너비)
 *   hitrange:28          → 피격 판정 거리 (px)
 *   stunduration:40      → 맞았을 때 기절 지속시간 (프레임)
 *   (대사 등은 hitswitch/hitswitch2를 켜서 병렬 이벤트로 직접
 *    처리하는 걸 권장)
 *
 *   FallingItem_Stop     // 새 아이템 생성 중지 (떨어지던 것들은 계속 떨어짐)
 *   FallingItem_Clear    // 화면에 있는 아이템 즉시 전부 제거 + 생성 중지
 *
 * ------------------------------------------------------------------
 * 스크립트
 * ------------------------------------------------------------------
 *   $gamePlayer.isFallStunned();   // 현재 기절(피격 연출) 중인지 확인
 *
 * ------------------------------------------------------------------
 * 연출 설명
 * ------------------------------------------------------------------
 * - 위에서 아이템이 계속 떨어지다가 플레이어와 부딪히면:
 *   1. 아이템은 즉시 사라짐
 *   2. 플레이어가 빙글빙글 회전하면서 아래로 튕겼다가 다시 튀어오르는
 *      바운스 연출 (stunduration 동안)
 *   3. 그동안 플레이어는 이동 불가
 *   4. 연출이 끝나면 회전/위치가 원상복귀됨
 *   5. hitswitch가 지정되어 있으면 그 스위치가 ON됨
 *      (예: 이 스위치로 병렬 이벤트를 걸어서 "윽!" 같은 대사 표시)
 *   6. commonevent가 지정되어 있으면 독립적으로 그 공통이벤트가 실행됨
 *      (평소엔 생략하고 hitswitch만 써서 대사 처리, 특정 구간에서만
 *       commonevent를 지정해서 다른 처리를 하는 식으로 사용 가능)
 * - 기절 중에는 무적이라 추가로 맞아도 중복 발동하지 않음.
 * - PlayerFly.js로 비행 중일 때 맞으면: 제자리 바운스 대신 실제로 회전하며
 *   떨어짐.
 *   · landx/landy를 안 주면: 그냥 수직으로 일정 거리(Player Fall
 *     Distance)만큼 떨어진 뒤 바로 비행 시작 지점으로 복귀+재상승.
 *   · landx/landy를 주면: 지정한 착지 지점까지 회전하며 날아가서 착지 →
 *     (landimage 지정 시) 캐릭터 이미지가 바뀌면서 옆으로 한 칸씩 총
 *     두 번 통통 튀어 이동(점점 낮게 튐) → 원래 이미지로 복구 →
 *     (Post Land Wait만큼 잠깐 가만히 대기) →
 *     비행 시작 지점으로 되돌아가서 다시 상승 시작.
 *   · hitswitch/commonevent로 뜨는 대사(메시지)가 있으면, 그 대사가 다
 *     끝날 때까지는 비행이 재개되지 않고 제자리에 멈춰 있음. 대사가
 *     끝나야 화면이 페이드아웃 → (그 순간 좌표/상태 리셋) →
 *     페이드인 되면서 비행 시작 지점으로 자연스럽게 복귀 + 재상승함.
 *   · 재상승이 시작되는 순간, 떨어지는 아이템 시스템도 완전히
 *     초기화됨 (화면의 아이템 다 제거 + 램프업 진행도 처음부터).
 *     즉, 맞아서 떨어지면 아이템 낙하 이벤트를 처음부터 다시
 *     시작하는 것과 같음.
 *   · 재비행이 시작된 직후 잠깐(Invincible Duration) 동안은 다시 안
 *     맞음. 재비행 시작 지점이 낙하 범위 안이라 바로 또 맞아서
 *     대사가 무한 반복되는 걸 막기 위한 안전장치.
 * ------------------------------------------------------------------
 */

(function() {

    var parameters = PluginManager.parameters('FallingItem');
    var DEFAULT_ITEM = parameters['Item Image'] || 'rock';
    var DEFAULT_SPEED = Number(parameters['Fall Speed'] || 6);
    var DEFAULT_INTERVAL = Number(parameters['Spawn Interval'] || 45);
    var DEFAULT_HIT_RANGE = Number(parameters['Hit Range'] || 28);
    var DEFAULT_STUN_DURATION = Number(parameters['Stun Duration'] || 40);
    var PLAYER_FALL_DISTANCE = Number(parameters['Player Fall Distance'] || 6);
    var INVINCIBLE_DURATION = Number(parameters['Invincible Duration'] || 90);
    var POST_LAND_WAIT = Number(parameters['Post Land Wait'] || 60);
    var FADE_DURATION = Number(parameters['Fade Duration'] || 20);

    var $fallingItemSettings = {
        active: false,
        clearRequested: false,
        itemName: DEFAULT_ITEM,
        itemNames: [DEFAULT_ITEM],
        speed: DEFAULT_SPEED,
        interval: DEFAULT_INTERVAL,
        startInterval: DEFAULT_INTERVAL,
        endInterval: 0, // 0이면 램프업 없음 (interval 고정)
        rampDuration: 0,
        elapsed: 0,
        phaseSwitchId: 0,
        phaseTriggered: false,
        minX: 0,
        maxX: 0, // 0이면 Graphics.boxWidth로 취급
        hitRange: DEFAULT_HIT_RANGE,
        stunDuration: DEFAULT_STUN_DURATION,
        hitSwitchId: 0,
        hitSwitchId2: 0,
        commonEventId: 0,
        commonEventId2: 0,
        landX: null,
        landY: null,
        landImage: '',
        landIndex: 0,
        bounceDir: 'right',
        bounceDuration: 20,
        bounceHeight1: 20,
        bounceHeight2: 10
    };

    // 기절 종료 후 실행할 공통 이벤트를 위한 독립 인터프리터
    var $fallingItemPendingInterpreter = null;

    //-----------------------------------------------------------------------
    // Plugin Command

    var _FallingItem_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _FallingItem_Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'FallingItem_Start') {
            this.startFallingItem(args);
        } else if (command === 'FallingItem_Stop') {
            $fallingItemSettings.active = false;
        } else if (command === 'FallingItem_Clear') {
            $fallingItemSettings.active = false;
            $fallingItemSettings.clearRequested = true;
        }
    };

    Game_Interpreter.prototype.startFallingItem = function(args) {
        var options = {};
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg.indexOf(':') > -1) {
                var parts = arg.split(':');
                var key = parts[0].toLowerCase();
                var value = parts.slice(1).join(':');
                options[key] = value;
            }
        }

        if (options.item) {
            $fallingItemSettings.itemName = options.item;
            $fallingItemSettings.itemNames = [options.item];
        }
        if (options.items) {
            $fallingItemSettings.itemNames = options.items.split(',').map(function(s) {
                return s.trim();
            }).filter(function(s) {
                return s.length > 0;
            });
        }
        if (options.speed) $fallingItemSettings.speed = Number(options.speed);
        if (options.interval) {
            $fallingItemSettings.interval = Number(options.interval);
            $fallingItemSettings.startInterval = Number(options.interval);
        }
        if (options.endinterval) $fallingItemSettings.endInterval = Number(options.endinterval);
        if (options.rampduration) $fallingItemSettings.rampDuration = Number(options.rampduration);
        if (options.phaseswitch) $fallingItemSettings.phaseSwitchId = Number(options.phaseswitch);
        if (options.minx) $fallingItemSettings.minX = Number(options.minx);
        if (options.maxx) $fallingItemSettings.maxX = Number(options.maxx);
        if (options.hitrange) $fallingItemSettings.hitRange = Number(options.hitrange);
        if (options.stunduration) $fallingItemSettings.stunDuration = Number(options.stunduration);
        if (options.hitswitch) $fallingItemSettings.hitSwitchId = Number(options.hitswitch);
        if (options.hitswitch2) $fallingItemSettings.hitSwitchId2 = Number(options.hitswitch2);
        if (options.commonevent) $fallingItemSettings.commonEventId = Number(options.commonevent);
        if (options.commonevent2) $fallingItemSettings.commonEventId2 = Number(options.commonevent2);
        if (options.landx !== undefined) $fallingItemSettings.landX = Number(options.landx);
        if (options.landy !== undefined) $fallingItemSettings.landY = Number(options.landy);
        if (options.landimage) $fallingItemSettings.landImage = options.landimage;
        if (options.landindex !== undefined) $fallingItemSettings.landIndex = Number(options.landindex);
        if (options.bouncedir) $fallingItemSettings.bounceDir = options.bouncedir.toLowerCase();
        if (options.bounceduration) $fallingItemSettings.bounceDuration = Number(options.bounceduration);
        if (options.bounceheight1) $fallingItemSettings.bounceHeight1 = Number(options.bounceheight1);
        if (options.bounceheight2) $fallingItemSettings.bounceHeight2 = Number(options.bounceheight2);

        // 새로 시작할 때마다 램프업 진행도는 초기화
        $fallingItemSettings.elapsed = 0;
        $fallingItemSettings.phaseTriggered = false;
        $fallingItemSettings.clearRequested = false;
        $fallingItemSettings.active = true;
    };

    //-----------------------------------------------------------------------
    // Game_Player - 피격 시 회전+바운스 기절 연출

    var _FallingItem_Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _FallingItem_Game_Player_initMembers.call(this);
        this._fallHitStunned = false;
        this._fallHitPhase = ''; // 'fall' -> (착지 목표 있으면) 'bounce'
        this._fallHitDuration = 0;
        this._fallHitMaxDuration = 0;
        this._fallHitSwitchId = 0;
        this._fallHitCommonEventId = 0;
        this._fallHitRotation = 0;
        this._fallHitOffsetY = 0;
        this._fallHitWasFlying = false;
        this._fallHitTotalFallTiles = 0;
        this._fallHitStartX = 0;
        this._fallHitStartY = 0;
        this._fallHitHasLandTarget = false;
        this._fallHitLandX = 0;
        this._fallHitLandY = 0;
        this._fallHitLandImage = '';
        this._fallHitLandIndex = 0;
        this._fallHitOriginalImage = '';
        this._fallHitOriginalIndex = 0;
        this._fallHitBounceIndex = 0;
        this._fallHitBounceDir = 1;
        this._fallHitBounceDuration = 0;
        this._fallHitBounceMaxDuration = 0;
        this._fallHitBounceStartX = 0;
        this._fallHitBounceTargetX = 0;
        this._fallHitBounceHeight1 = 20;
        this._fallHitBounceHeight2 = 10;
        this._fallHitMessageSeen = false;
        this._fallHitWaitTimer = 0;
        this._fallHitInvincibleTimer = 0;
        this._fallHitPostWaitDuration = 0;
        this._fallHitFadeTimer = 0;
    };

    Game_Player.prototype.isFallStunned = function() {
        return !!this._fallHitStunned;
    };

    Game_Player.prototype.isFallHitInvincible = function() {
        return this._fallHitInvincibleTimer > 0;
    };

    Game_Player.prototype.startFallHitStun = function(options) {
        if (this._fallHitStunned) return;
        options = options || {};

        this._fallHitStunned = true;
        this._fallHitMaxDuration = Math.max(1, options.duration || DEFAULT_STUN_DURATION);
        this._fallHitDuration = this._fallHitMaxDuration;
        this._fallHitSwitchId = options.switchId || 0;
        this._fallHitCommonEventId = options.commonEventId || 0;
        this._fallHitRotation = 0;
        this._fallHitOffsetY = 0;
        this._fallHitWasFlying = !!(this.isFreeFlyingActive && this.isFreeFlyingActive());
        this._fallHitTotalFallTiles = options.fallDistance || PLAYER_FALL_DISTANCE;

        this._fallHitStartX = this._x;
        this._fallHitStartY = this._y;

        var hasLandTarget = this._fallHitWasFlying &&
                options.landX !== undefined && options.landX !== null &&
                options.landY !== undefined && options.landY !== null;
        this._fallHitHasLandTarget = hasLandTarget;
        this._fallHitLandX = hasLandTarget ? options.landX : this._x;
        this._fallHitLandY = hasLandTarget ? options.landY : this._y;
        this._fallHitLandImage = options.landImage || '';
        this._fallHitLandIndex = options.landIndex || 0;

        this._fallHitOriginalImage = this.characterName();
        this._fallHitOriginalIndex = this.characterIndex();

        this._fallHitBounceDir = (options.bounceDir === 'left') ? -1 : 1;
        this._fallHitBounceMaxDuration = Math.max(1, options.bounceDuration || 20);
        this._fallHitBounceHeight1 = options.bounceHeight1 || 20;
        this._fallHitBounceHeight2 = options.bounceHeight2 || 10;

        this._fallHitPhase = 'fall';
        SoundManager.playBuzzer();
    };

    var _FallingItem_Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _FallingItem_Game_Player_update.call(this, sceneActive);
        this.updateFallHitStun();
        if (this._fallHitInvincibleTimer > 0) {
            this._fallHitInvincibleTimer--;
        }
    };

    Game_Player.prototype.updateFallHitStun = function() {
        if (!this._fallHitStunned) return;
        if (this._fallHitPhase === 'fall') {
            this.updateFallHitFallPhase();
        } else if (this._fallHitPhase === 'bounce') {
            this.updateFallHitBouncePhase();
        } else if (this._fallHitPhase === 'postWait') {
            this.updateFallHitPostWait();
        } else if (this._fallHitPhase === 'waitMessage') {
            this.updateFallHitWaitMessage();
        } else if (this._fallHitPhase === 'fadeOut') {
            this.updateFallHitFadeOut();
        } else if (this._fallHitPhase === 'fadeIn') {
            this.updateFallHitFadeIn();
        }
    };

    Game_Player.prototype.startFallHitPostWait = function() {
        this._fallHitPhase = 'postWait';
        this._fallHitPostWaitDuration = POST_LAND_WAIT;
    };

    Game_Player.prototype.updateFallHitPostWait = function() {
        this._fallHitPostWaitDuration--;
        if (this._fallHitPostWaitDuration <= 0) {
            this.enterFallHitWaitMessage();
        }
    };

    Game_Player.prototype.updateFallHitFallPhase = function() {
        var t = 1 - (this._fallHitDuration / this._fallHitMaxDuration); // 0 -> 1
        this._fallHitRotation = t * Math.PI * 4; // 두 바퀴 회전

        // 아래로 확 떨어졌다가(35%) 잠깐 멈췄다가(35~75%) 다시 튀어오름(나머지)
        // 단, 비행 중 피격이었으면 실제 맵 좌표로 떨어지는 중이므로
        // (PlayerFly.js의 updateFreeFlyMove에서 처리) 화면 오프셋은 사용하지 않음
        if (!this._fallHitWasFlying) {
            var dipT;
            if (t < 0.35) {
                dipT = t / 0.35;
            } else if (t < 0.75) {
                dipT = 1;
            } else {
                dipT = 1 - (t - 0.75) / 0.25;
            }
            this._fallHitOffsetY = Math.round(dipT * 32);
        }

        this._fallHitDuration--;
        if (this._fallHitDuration <= 0) {
            this._fallHitRotation = 0;
            this._fallHitOffsetY = 0;

            if (this._fallHitHasLandTarget) {
                // 지정한 착지 지점으로 정확히 스냅
                this._x = this._fallHitLandX;
                this._y = this._fallHitLandY;
                this._realX = this._x;
                this._realY = this._y;

                if (this._fallHitLandImage) {
                    this.setImage(this._fallHitLandImage, this._fallHitLandIndex);
                }

                this._fallHitBounceIndex = 0;
                this._fallHitPhase = 'bounce';
                this.startFallHitBounceHop();
            } else {
                this.startFallHitPostWait();
            }
        }
    };

    Game_Player.prototype.startFallHitBounceHop = function() {
        this._fallHitBounceDuration = this._fallHitBounceMaxDuration;
        this._fallHitBounceStartX = this._x;
        this._fallHitBounceTargetX = this._x + this._fallHitBounceDir;
        this.setDirection(this._fallHitBounceDir < 0 ? 4 : 6);
    };

    Game_Player.prototype.updateFallHitBouncePhase = function() {
        var t = 1 - (this._fallHitBounceDuration / this._fallHitBounceMaxDuration); // 0 -> 1

        // 가로 이동은 PlayerFly.js의 updateFreeFlyMove에서 처리 (스크롤 타이밍 때문).
        // 여기서는 세로로 통통 튀는 높이(포물선)만 담당함. 두 번째 튐은 더 낮게.
        var height = (this._fallHitBounceIndex === 0) ? this._fallHitBounceHeight1 : this._fallHitBounceHeight2;
        var arc = Math.sin(t * Math.PI); // 0 -> 1 -> 0
        this._fallHitOffsetY = -Math.round(arc * height); // 화면상 위로 튀어오름

        this._fallHitBounceDuration--;
        if (this._fallHitBounceDuration <= 0) {
            this._x = this._fallHitBounceTargetX;
            this._realX = this._x;
            this._fallHitOffsetY = 0;
            this._fallHitBounceIndex++;

            if (this._fallHitBounceIndex < 2) {
                this.startFallHitBounceHop();
            } else {
                // 통통 튀기 두 번 끝: 원래 이미지로 복구하고 잠깐 대기 후 대사 처리
                this.setImage(this._fallHitOriginalImage, this._fallHitOriginalIndex);
                this.startFallHitPostWait();
            }
        }
    };

    Game_Player.prototype.enterFallHitWaitMessage = function() {
        // 대사/공통이벤트를 여기서 트리거하고, 그게 다 끝날 때까지는
        // 비행 재개를 미룸 (대사 도중엔 날지 않게)
        if (this._fallHitSwitchId > 0) {
            $gameSwitches.setValue(this._fallHitSwitchId, true);
        }
        if (this._fallHitCommonEventId > 0) {
            var commonEvent = $dataCommonEvents[this._fallHitCommonEventId];
            if (commonEvent) {
                var interpreter = new Game_Interpreter();
                interpreter.setup(commonEvent.list, 0);
                $fallingItemPendingInterpreter = interpreter;
            }
        }
        this._fallHitPhase = 'waitMessage';
        this._fallHitMessageSeen = false;
        this._fallHitWaitTimer = 0;
    };

    Game_Player.prototype.updateFallHitWaitMessage = function() {
        if ($gameMessage.isBusy()) {
            // 대사창이 떠 있는 동안엔 계속 대기 (비행 안 함)
            this._fallHitMessageSeen = true;
            this._fallHitWaitTimer = 0;
        } else if (this._fallHitMessageSeen) {
            // 대사가 떴다가 다 닫혔음 → 페이드하며 재비행 재개
            this.startFallHitFade();
        } else {
            // 아직 대사가 안 떴으면 잠깐 대기 (병렬 이벤트가 스위치 감지할
            // 시간을 줌). 너무 오래 대사가 안 뜨면(설정을 안 했거나 등)
            // 무한정 멈춰있지 않도록 일정 시간 후 그냥 재비행 재개
            this._fallHitWaitTimer++;
            if (this._fallHitWaitTimer >= 180) {
                this.startFallHitFade();
            }
        }
    };

    Game_Player.prototype.startFallHitFade = function() {
        this._fallHitPhase = 'fadeOut';
        this._fallHitFadeTimer = FADE_DURATION;
        $gameScreen.startFadeOut(FADE_DURATION);
    };

    Game_Player.prototype.updateFallHitFadeOut = function() {
        this._fallHitFadeTimer--;
        if (this._fallHitFadeTimer <= 0) {
            // 화면이 완전히 검게 된 시점에 실제 위치/상태를 리셋
            this.applyFallHitReset();
            this._fallHitPhase = 'fadeIn';
            this._fallHitFadeTimer = FADE_DURATION;
            $gameScreen.startFadeIn(FADE_DURATION);
        }
    };

    Game_Player.prototype.updateFallHitFadeIn = function() {
        this._fallHitFadeTimer--;
        if (this._fallHitFadeTimer <= 0) {
            this._fallHitStunned = false;
            this._fallHitPhase = '';
        }
    };

    Game_Player.prototype.applyFallHitReset = function() {
        this._fallHitRotation = 0;
        this._fallHitOffsetY = 0;

        // 비행 중 피격이었으면 비행 시작 지점으로 되돌려서 처음부터 다시 날게 함
        if (this._fallHitWasFlying) {
            if (this.resetFreeFlyPosition) {
                this.resetFreeFlyPosition();
            }
            this._fallHitWasFlying = false;

            // 떨어지는 아이템 시스템도 완전히 초기화 (처음부터 다시 시작하는 것처럼)
            $fallingItemSettings.elapsed = 0;
            $fallingItemSettings.phaseTriggered = false;
            $fallingItemSettings.clearRequested = true;

            // 재비행 시작 지점이 아이템 낙하 범위 안이라 바로 또 맞는 걸
            // 막기 위해 잠깐 무적시간을 줌
            this._fallHitInvincibleTimer = INVINCIBLE_DURATION;
        }
    };

    var _FallingItem_Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (this._fallHitStunned) return false;
        return _FallingItem_Game_Player_canMove.call(this);
    };

    //-----------------------------------------------------------------------
    // 기절 종료 후 예약된 공통 이벤트를 독립적으로 확실하게 실행

    var _FallingItem_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _FallingItem_Scene_Map_update.call(this);
        if ($fallingItemPendingInterpreter) {
            $fallingItemPendingInterpreter.update();
            if (!$fallingItemPendingInterpreter.isRunning()) {
                $fallingItemPendingInterpreter = null;
            }
        }
    };

    //-----------------------------------------------------------------------
    // Sprite_Character - 플레이어 회전+바운스 비주얼

    var _FallingItem_Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        _FallingItem_Sprite_Character_updatePosition.call(this);
        if (this._character === $gamePlayer) {
            this.y += $gamePlayer._fallHitOffsetY || 0;
        }
    };

    var _FallingItem_Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _FallingItem_Sprite_Character_update.call(this);
        if (this._character === $gamePlayer) {
            this.rotation = $gamePlayer._fallHitRotation || 0;
        }
    };

    //-----------------------------------------------------------------------
    // Spriteset_Map - 떨어지는 아이템 스프라이트 생성/이동/충돌판정

    var _FallingItem_Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _FallingItem_Spriteset_Map_createLowerLayer.call(this);
        this.createFallingItemLayer();
    };

    Spriteset_Map.prototype.createFallingItemLayer = function() {
        this._fallingItemSprites = [];
        this._fallingItemContainer = new Sprite();
        this._fallingItemTimer = $fallingItemSettings.interval;
        this.addChild(this._fallingItemContainer);
    };

    Spriteset_Map.prototype.spawnFallingItemSprite = function() {
        var settings = $fallingItemSettings;
        var sprite = new Sprite();
        var names = settings.itemNames && settings.itemNames.length > 0 ? settings.itemNames : [settings.itemName];
        var pickedName = names[Math.floor(Math.random() * names.length)];
        sprite.bitmap = ImageManager.loadPicture('items/' + pickedName);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        var minX = settings.minX || 0;
        var maxX = settings.maxX || Graphics.boxWidth;
        sprite.x = minX + Math.random() * Math.max(1, (maxX - minX));
        sprite.y = -32;
        this._fallingItemContainer.addChild(sprite);
        this._fallingItemSprites.push(sprite);
    };

    Spriteset_Map.prototype.removeFallingItemSprite = function(index) {
        var sprite = this._fallingItemSprites[index];
        this._fallingItemContainer.removeChild(sprite);
        this._fallingItemSprites.splice(index, 1);
    };

    Spriteset_Map.prototype.clearFallingItemSprites = function() {
        while (this._fallingItemSprites.length > 0) {
            this.removeFallingItemSprite(this._fallingItemSprites.length - 1);
        }
    };

    Spriteset_Map.prototype.checkFallingItemHit = function(sprite) {
        var px = $gamePlayer.screenX();
        var py = $gamePlayer.screenY() - 24; // 대략 플레이어 상반신 높이
        var dx = sprite.x - px;
        var dy = sprite.y - py;
        var dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= $fallingItemSettings.hitRange;
    };

    Spriteset_Map.prototype.currentFallingItemInterval = function() {
        var settings = $fallingItemSettings;
        if (!settings.rampDuration || settings.endInterval <= 0) {
            return settings.interval;
        }
        var t = Math.min(1, settings.elapsed / settings.rampDuration);
        var eased = t * t; // 초반엔 완만, 후반엔 급격히 빨라짐
        var interval = settings.startInterval - (settings.startInterval - settings.endInterval) * eased;
        return Math.max(1, Math.round(interval));
    };

    var _FallingItem_Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _FallingItem_Spriteset_Map_update.call(this);
        if (this._fallingItemSprites) {
            this.updateFallingItems();
        }
    };

    Spriteset_Map.prototype.updateFallingItems = function() {
        var settings = $fallingItemSettings;

        if (settings.clearRequested) {
            this.clearFallingItemSprites();
            this._fallingItemTimer = settings.startInterval || settings.interval;
            settings.clearRequested = false;
        }

        // 플레이어가 피격 연출(낙하/바운스/대사대기) 중이면 아이템 생성도,
        // 이미 떨어지던 아이템의 이동도 전부 멈춤
        var playerBusy = !!($gamePlayer.isFallStunned && $gamePlayer.isFallStunned());

        if (settings.active && !playerBusy) {
            settings.elapsed++;

            // 램프업이 끝까지 도달하면 페이즈 스위치 1회 발동
            if (settings.rampDuration > 0 && !settings.phaseTriggered &&
                    settings.elapsed >= settings.rampDuration) {
                settings.phaseTriggered = true;
                if (settings.phaseSwitchId > 0) {
                    $gameSwitches.setValue(settings.phaseSwitchId, true);
                }
            }

            this._fallingItemTimer--;
            if (this._fallingItemTimer <= 0) {
                this.spawnFallingItemSprite();
                this._fallingItemTimer = this.currentFallingItemInterval();
            }
        }

        if (playerBusy) return; // 이동/충돌판정도 전부 정지

        for (var i = this._fallingItemSprites.length - 1; i >= 0; i--) {
            var sprite = this._fallingItemSprites[i];
            sprite.y += settings.speed;

            if (!$gamePlayer.isFallStunned() && !$gamePlayer.isFallHitInvincible() && this.checkFallingItemHit(sprite)) {
                this.removeFallingItemSprite(i);
                var useSwitch2 = settings.phaseTriggered && settings.hitSwitchId2 > 0;
                var hitSwitch = useSwitch2 ? settings.hitSwitchId2 : settings.hitSwitchId;
                var useCommon2 = settings.phaseTriggered && settings.commonEventId2 > 0;
                var commonEvent = useCommon2 ? settings.commonEventId2 : settings.commonEventId;
                $gamePlayer.startFallHitStun({
                    duration: settings.stunDuration,
                    switchId: hitSwitch,
                    commonEventId: commonEvent,
                    landX: settings.landX,
                    landY: settings.landY,
                    landImage: settings.landImage,
                    landIndex: settings.landIndex,
                    bounceDir: settings.bounceDir,
                    bounceDuration: settings.bounceDuration,
                    bounceHeight1: settings.bounceHeight1,
                    bounceHeight2: settings.bounceHeight2
                });
                continue;
            }

            if (sprite.y > Graphics.boxHeight + 40) {
                this.removeFallingItemSprite(i);
            }
        }
    };

})();
