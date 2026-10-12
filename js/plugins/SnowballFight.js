//=============================================================================
// SnowballFight.js
//=============================================================================

/*:
 * @plugindesc 플레이어와 상대 이벤트가 번갈아 눈덩이를 던지는 눈싸움 미니게임.
 * 플레이어는 위/아래로만 움직여 피할 수 있고, 강제로 회피 불가능한
 * 큰 눈덩이도 던질 수 있음. (쓰러짐 연출은 포함하지 않음 - 스위치/
 * 공통이벤트로 직접 처리)
 * @author ㄹㅅㅁ
 *
 * @param Normal Image
 * @desc 기본 눈덩이 이미지 (img/pictures/[이름].png)
 * @default snowball
 *
 * @param Big Image
 * @desc 회피 불가능한 큰 눈덩이 이미지 (img/pictures/[이름].png)
 * @default snowball_big
 *
 * @param Speed
 * @desc 눈덩이 이동 속도 (프레임당 px)
 * @default 7
 *
 * @param Interval
 * @desc 번갈아 던지는 간격 (프레임, 60 = 1초)
 * @default 70
 *
 * @param Hit Range
 * @desc 목표 지점과 플레이어 세로 위치 차이가 이 값(px) 이하면 피격 판정
 * @default 22
 *
 * @param Move Range
 * @desc 시작 위치 기준 위/아래로 이동 가능한 최대 칸 수 (플레이어/상대 공통)
 * @default 4
 *
 * @param Opponent Move Interval
 * @desc 상대가 랜덤으로 위/아래 이동을 시도하는 간격 (프레임)
 * @default 50
 *
 * @param Arc Height
 * @desc 눈덩이가 날아갈 때 위로 솟았다가 내려오는 높이 (px)
 * @default 40
 *
 * @param Rotation Speed
 * @desc 눈덩이가 날아가는 동안 회전하는 속도 (프레임당 라디안)
 * @default 0.35
 *
 * @param Shake Power
 * @desc 눈덩이에 맞았을 때 화면 흔들림 강도
 * @default 6
 *
 * @param Shake Speed
 * @desc 흔들림 속도
 * @default 8
 *
 * @param Shake Duration
 * @desc 흔들림 지속시간 (프레임)
 * @default 20
 *
 * @help
 * ------------------------------------------------------------------
 * 플러그인 커맨드
 * ------------------------------------------------------------------
 *
 *   SnowballFight_Start opponent:5
 *
 * 옵션 지정 (콜론으로 구분, 생략 시 기본값/플러그인 파라미터 사용):
 *
 *   SnowballFight_Start opponent:5 speed:7 interval:70 hitrange:22
 *       hitswitch:10 missswitch:11 bighitswitch:12
 *       hitcommonevent:0 bighitcommonevent:0
 *
 *   opponent:5            → 상대 이벤트 ID (필수)
 *   normalimage:snowball  → 일반 눈덩이 이미지
 *   bigimage:snowball_big → 큰 눈덩이 이미지
 *   speed:7                → 눈덩이 속도
 *   interval:70             → 번갈아 던지는 간격(프레임)
 *   hitrange:22             → 피격 판정 세로 오차(px)
 *   moverange:4              → 시작 위치 기준 위/아래 이동 가능한 최대 칸 수
 *   moveinterval:50          → 상대가 위/아래 이동을 시도하는 간격(프레임)
 *   archeight:40             → 눈덩이가 솟았다가 내려오는 높이(px)
 *   rotationspeed:0.35       → 눈덩이 회전 속도
 *   hitswitch:10            → 일반 눈덩이에 맞았을 때 켜지는 스위치
 *   missswitch:11           → 일반 눈덩이를 피했을 때 켜지는 스위치
 *   bighitswitch:12         → 큰 눈덩이에 맞았을 때 켜지는 스위치 (항상 맞음)
 *   hitcommonevent:0        → 일반 피격 시 실행할 공통이벤트 (생략 가능)
 *   bighitcommonevent:0     → 큰 눈덩이 피격 시 실행할 공통이벤트 (생략 가능)
 *
 *   SnowballFight_ThrowBig
 *       → 지금 상대가 회피 불가능한 큰 눈덩이를 즉시 던짐.
 *         (Start로 루프가 진행 중이어도 즉시 끼어들어서 던지고,
 *          이후 평소 번갈아 던지기 루프는 그대로 이어서 진행됨)
 *         이 커맨드를 실행한 이벤트는 눈덩이가 실제로 도착해서
 *         맞을 때까지 자동으로 대기했다가, 맞은 다음 줄부터 이어서
 *         진행됨 (별도 공통이벤트 없이 같은 이벤트 안에서 바로
 *         이어서 대사/연출을 넣고 싶을 때 사용).
 *
 *   SnowballFight_Stop
 *       → 번갈아 던지기 루프 중지 + 플레이어 이동 제한 해제.
 *         (이미 날아가고 있던 눈덩이는 끝까지 날아가서 판정됨)
 *
 *   SnowballFight_Clear
 *       → Stop과 동일하지만 화면에 남은 눈덩이도 즉시 전부 제거.
 *
 * ------------------------------------------------------------------
 * 주의: 플레이어가 계속 움직일 수 있어야 하므로, SnowballFight_Start를
 * 실행하는 이벤트 페이지는 반드시 "병렬 처리"로 설정할 것.
 * 일반 실행(액션 버튼/자동 실행 등) 상태의 이벤트가 계속 실행 중이면
 * RPG Maker MV 특성상 플레이어가 아예 움직이지 못함.
 * ------------------------------------------------------------------
 * 동작 설명
 * ------------------------------------------------------------------
 * - Start 실행 중에는 플레이어가 좌우로 이동 불가, 위/아래로만 이동 가능.
 *   (moverange 만큼만 시작 위치 기준으로 이동 가능)
 * - 상대도 moverange 범위 안에서 랜덤하게 위/아래로 움직임
 *   (원래 상대 이벤트에 설정된 자율이동은 Start~Stop 동안 잠시 꺼짐).
 * - 상대(opponent) → 플레이어, 플레이어 → 상대 순서로 번갈아 눈덩이를 던짐.
 * - 눈덩이는 날아가는 동안 회전하면서 포물선으로 위로 솟았다가 목표
 *   높이로 다시 내려오는 연출로 날아감.
 * - 상대가 던진 일반 눈덩이는 "던지는 순간" 플레이어의 세로 위치를 조준함.
 *   눈덩이가 도착할 때 플레이어가 그 자리에 없으면(위/아래로 이동했으면)
 *   회피(missswitch), 그대로 있으면 피격(hitswitch).
 * - 큰 눈덩이(ThrowBig)는 세로 위치와 상관없이 도착하면 무조건 피격
 *   (bighitswitch / bighitcommonevent).
 * - 일반/큰 눈덩이에 맞으면 화면이 흔들림 (Shake Power/Speed/Duration).
 * - 플레이어 → 상대로 던지는 눈덩이는 판정 없이 연출용으로만 날아감.
 * - 쓰러짐/기절 연출은 포함되어 있지 않음. hitswitch 등으로 병렬 이벤트를
 *   걸어서 원하는 리액션(대사, 흔들림 등)을 직접 붙이면 됨.
 * ------------------------------------------------------------------
 */

(function() {

    var parameters = PluginManager.parameters('SnowballFight');
    var DEFAULT_NORMAL_IMAGE = parameters['Normal Image'] || 'snowball';
    var DEFAULT_BIG_IMAGE = parameters['Big Image'] || 'snowball_big';
    var DEFAULT_SPEED = Number(parameters['Speed'] || 7);
    var DEFAULT_INTERVAL = Number(parameters['Interval'] || 70);
    var DEFAULT_HIT_RANGE = Number(parameters['Hit Range'] || 22);
    var DEFAULT_MOVE_RANGE = Number(parameters['Move Range'] || 4);
    var DEFAULT_OPPONENT_MOVE_INTERVAL = Number(parameters['Opponent Move Interval'] || 50);
    var DEFAULT_ARC_HEIGHT = Number(parameters['Arc Height'] || 40);
    var DEFAULT_ROTATION_SPEED = Number(parameters['Rotation Speed'] || 0.35);
    var DEFAULT_SHAKE_POWER = Number(parameters['Shake Power'] || 6);
    var DEFAULT_SHAKE_SPEED = Number(parameters['Shake Speed'] || 8);
    var DEFAULT_SHAKE_DURATION = Number(parameters['Shake Duration'] || 20);

    var $snowballFightSettings = {
        active: false,
        clearRequested: false,
        opponentEventId: 0,
        normalImage: DEFAULT_NORMAL_IMAGE,
        bigImage: DEFAULT_BIG_IMAGE,
        speed: DEFAULT_SPEED,
        interval: DEFAULT_INTERVAL,
        hitRange: DEFAULT_HIT_RANGE,
        moveRange: DEFAULT_MOVE_RANGE,
        opponentMoveInterval: DEFAULT_OPPONENT_MOVE_INTERVAL,
        arcHeight: DEFAULT_ARC_HEIGHT,
        rotationSpeed: DEFAULT_ROTATION_SPEED,
        shakePower: DEFAULT_SHAKE_POWER,
        shakeSpeed: DEFAULT_SHAKE_SPEED,
        shakeDuration: DEFAULT_SHAKE_DURATION,
        hitSwitchId: 0,
        missSwitchId: 0,
        bigHitSwitchId: 0,
        hitCommonEventId: 0,
        bigHitCommonEventId: 0,
        turnTimer: 0,
        nextThrower: 'enemy', // 'enemy' or 'player'
        forceBigThrowRequested: false,
        bigThrowResolved: false,
        playerOriginY: 0,
        opponentOriginY: 0,
        opponentMoveTimer: 0
    };

    // 피격/회피 결과로 실행할 공통 이벤트를 위한 독립 인터프리터
    var $snowballFightPendingInterpreter = null;

    //-----------------------------------------------------------------------
    // Plugin Command

    var _SnowballFight_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _SnowballFight_Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'SnowballFight_Start') {
            this.startSnowballFight(args);
        } else if (command === 'SnowballFight_ThrowBig') {
            $snowballFightSettings.forceBigThrowRequested = true;
            $snowballFightSettings.bigThrowResolved = false;
            this.setWaitMode('snowballBigThrow');
        } else if (command === 'SnowballFight_Stop') {
            $snowballFightSettings.active = false;
        } else if (command === 'SnowballFight_Clear') {
            $snowballFightSettings.active = false;
            $snowballFightSettings.clearRequested = true;
        }
    };

    Game_Interpreter.prototype.startSnowballFight = function(args) {
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

        var s = $snowballFightSettings;
        if (options.opponent) s.opponentEventId = Number(options.opponent);
        if (options.normalimage) s.normalImage = options.normalimage;
        if (options.bigimage) s.bigImage = options.bigimage;
        if (options.speed) s.speed = Number(options.speed);
        if (options.interval) s.interval = Number(options.interval);
        if (options.hitrange) s.hitRange = Number(options.hitrange);
        if (options.moverange) s.moveRange = Number(options.moverange);
        if (options.moveinterval) s.opponentMoveInterval = Number(options.moveinterval);
        if (options.archeight) s.arcHeight = Number(options.archeight);
        if (options.rotationspeed) s.rotationSpeed = Number(options.rotationspeed);
        if (options.shakepower) s.shakePower = Number(options.shakepower);
        if (options.shakespeed) s.shakeSpeed = Number(options.shakespeed);
        if (options.shakeduration) s.shakeDuration = Number(options.shakeduration);
        if (options.hitswitch) s.hitSwitchId = Number(options.hitswitch);
        if (options.missswitch) s.missSwitchId = Number(options.missswitch);
        if (options.bighitswitch) s.bigHitSwitchId = Number(options.bighitswitch);
        if (options.hitcommonevent) s.hitCommonEventId = Number(options.hitcommonevent);
        if (options.bighitcommonevent) s.bigHitCommonEventId = Number(options.bighitcommonevent);

        s.turnTimer = s.interval;
        s.nextThrower = 'enemy';
        s.forceBigThrowRequested = false;
        s.clearRequested = false;
        s.playerOriginY = $gamePlayer.y;
        var opponentEvent = $gameMap.event(s.opponentEventId);
        s.opponentOriginY = opponentEvent ? opponentEvent.y : 0;
        s.opponentMoveTimer = s.opponentMoveInterval;
        s.active = true;
    };

    //-----------------------------------------------------------------------
    // ThrowBig을 실행한 이벤트가 실제로 맞을 때까지 대기했다가 이어지게 함

    var _SnowballFight_Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'snowballBigThrow') {
            if ($snowballFightSettings.bigThrowResolved) {
                this._waitMode = '';
                return false;
            }
            return true;
        }
        return _SnowballFight_Game_Interpreter_updateWaitMode.call(this);
    };

    //-----------------------------------------------------------------------
    // Game_Player - 위/아래로만, moverange 범위 안에서만 이동 가능하도록 제한

    var _SnowballFight_Game_Player_getInputDirection = Game_Player.prototype.getInputDirection;
    Game_Player.prototype.getInputDirection = function() {
        if ($snowballFightSettings.active) {
            var s = $snowballFightSettings;
            var minY = s.playerOriginY - s.moveRange;
            var maxY = s.playerOriginY + s.moveRange;
            if (Input.isPressed('up') && this.y - 1 >= minY) return 8;
            if (Input.isPressed('down') && this.y + 1 <= maxY) return 2;
            return 0;
        }
        return _SnowballFight_Game_Player_getInputDirection.call(this);
    };

    //-----------------------------------------------------------------------
    // Game_Event - 상대 이벤트의 원래 자율이동은 잠시 끄고, 플러그인이 직접
    // moverange 범위 안에서 랜덤 위/아래 이동을 담당함

    var _SnowballFight_Game_Event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
    Game_Event.prototype.updateSelfMovement = function() {
        var s = $snowballFightSettings;
        if (s.active && this._eventId === s.opponentEventId) {
            return;
        }
        _SnowballFight_Game_Event_updateSelfMovement.call(this);
    };

    //-----------------------------------------------------------------------
    // 피격/회피 결과 처리

    function snowballFightResolveHit(switchId, commonEventId) {
        if (switchId > 0) {
            $gameSwitches.setValue(switchId, true);
        }
        if (commonEventId > 0) {
            var commonEvent = $dataCommonEvents[commonEventId];
            if (commonEvent) {
                var interpreter = new Game_Interpreter();
                interpreter.setup(commonEvent.list, 0);
                $snowballFightPendingInterpreter = interpreter;
            }
        }
    }

    function snowballFightShake() {
        var s = $snowballFightSettings;
        $gameScreen.startShake(s.shakePower, s.shakeSpeed, s.shakeDuration);
    }

    var _SnowballFight_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _SnowballFight_Scene_Map_update.call(this);
        if ($snowballFightPendingInterpreter) {
            $snowballFightPendingInterpreter.update();
            if (!$snowballFightPendingInterpreter.isRunning()) {
                $snowballFightPendingInterpreter = null;
            }
        }
    };

    //-----------------------------------------------------------------------
    // Spriteset_Map - 눈덩이 생성/이동/판정 + 번갈아 던지기 진행

    var _SnowballFight_Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _SnowballFight_Spriteset_Map_createLowerLayer.call(this);
        this.createSnowballFightLayer();
    };

    Spriteset_Map.prototype.createSnowballFightLayer = function() {
        this._snowballs = [];
        this._snowballContainer = new Sprite();
        this.addChild(this._snowballContainer);
    };

    Spriteset_Map.prototype.snowballFightOpponent = function() {
        return $gameMap.event($snowballFightSettings.opponentEventId);
    };

    // moverange 범위 안에서 랜덤하게 위/아래로 한 칸 이동 시도 (정지 포함)
    Spriteset_Map.prototype.trySnowballOpponentMove = function(opponent) {
        var s = $snowballFightSettings;
        var minY = s.opponentOriginY - s.moveRange;
        var maxY = s.opponentOriginY + s.moveRange;
        var choices = [0]; // 제자리 유지도 선택지에 포함
        if (opponent.y - 1 >= minY && opponent.canPass(opponent.x, opponent.y, 8)) {
            choices.push(8);
        }
        if (opponent.y + 1 <= maxY && opponent.canPass(opponent.x, opponent.y, 2)) {
            choices.push(2);
        }
        var dir = choices[Math.floor(Math.random() * choices.length)];
        if (dir === 8 || dir === 2) {
            opponent.moveStraight(dir);
        }
    };

    // fromChar / toChar : 'player' 또는 상대 이벤트
    Spriteset_Map.prototype.throwSnowball = function(fromChar, toChar, isBig) {
        var s = $snowballFightSettings;
        var imageName = isBig ? s.bigImage : s.normalImage;

        var sprite = new Sprite();
        sprite.bitmap = ImageManager.loadPicture(imageName);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        var startX = fromChar.screenX();
        var endX = toChar.screenX();
        var lockedY = toChar.screenY() - 24; // 던지는 순간의 목표 세로 위치를 고정

        sprite.x = startX;
        sprite.y = lockedY;
        sprite.rotation = 0;
        this._snowballContainer.addChild(sprite);

        var direction = endX >= startX ? 1 : -1;

        this._snowballs.push({
            sprite: sprite,
            toChar: toChar,
            startX: startX,
            targetX: endX,
            totalDistance: Math.abs(endX - startX),
            lockedY: lockedY,
            direction: direction,
            isBig: !!isBig,
            isPlayerTarget: (toChar === $gamePlayer)
        });
    };

    Spriteset_Map.prototype.resolveSnowballArrival = function(snowball) {
        var s = $snowballFightSettings;

        if (snowball.isPlayerTarget) {
            if (snowball.isBig) {
                // 회피 불가 - 세로 위치 상관없이 무조건 피격
                snowballFightResolveHit(s.bigHitSwitchId, s.bigHitCommonEventId);
                snowballFightShake();
                s.bigThrowResolved = true; // ThrowBig을 실행한 이벤트가 대기 중이면 이어서 진행
            } else {
                var currentY = $gamePlayer.screenY() - 24;
                var diff = Math.abs(currentY - snowball.lockedY);
                if (diff <= s.hitRange) {
                    snowballFightResolveHit(s.hitSwitchId, s.hitCommonEventId);
                    snowballFightShake();
                } else {
                    snowballFightResolveHit(s.missSwitchId, 0);
                }
            }
        }
        // 플레이어가 상대에게 던진 눈덩이는 연출용이라 판정 없음
    };

    Spriteset_Map.prototype.removeSnowball = function(index) {
        var snowball = this._snowballs[index];
        this._snowballContainer.removeChild(snowball.sprite);
        this._snowballs.splice(index, 1);
    };

    Spriteset_Map.prototype.clearSnowballs = function() {
        while (this._snowballs.length > 0) {
            this.removeSnowball(this._snowballs.length - 1);
        }
    };

    var _SnowballFight_Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _SnowballFight_Spriteset_Map_update.call(this);
        if (this._snowballs) {
            this.updateSnowballFight();
        }
    };

    Spriteset_Map.prototype.updateSnowballFight = function() {
        var s = $snowballFightSettings;

        if (s.clearRequested) {
            this.clearSnowballs();
            s.clearRequested = false;
        }

        var opponent = this.snowballFightOpponent();

        // 강제 큰 눈덩이 요청 - 언제든 즉시 끼어들어서 던짐
        if (s.forceBigThrowRequested) {
            s.forceBigThrowRequested = false;
            if (opponent) {
                this.throwSnowball(opponent, $gamePlayer, true);
            }
        }

        if (s.active && opponent) {
            s.turnTimer--;
            if (s.turnTimer <= 0) {
                if (s.nextThrower === 'enemy') {
                    this.throwSnowball(opponent, $gamePlayer, false);
                    s.nextThrower = 'player';
                } else {
                    this.throwSnowball($gamePlayer, opponent, false);
                    s.nextThrower = 'enemy';
                }
                s.turnTimer = s.interval;
            }

            // 상대가 moverange 범위 안에서 랜덤하게 위/아래로 움직임
            s.opponentMoveTimer--;
            if (s.opponentMoveTimer <= 0) {
                this.trySnowballOpponentMove(opponent);
                s.opponentMoveTimer = s.opponentMoveInterval;
            }
        }

        for (var i = this._snowballs.length - 1; i >= 0; i--) {
            var snowball = this._snowballs[i];
            snowball.sprite.x += s.speed * snowball.direction;

            // 회전하면서 위로 솟았다가 목표 높이로 내려오는 포물선 연출
            var traveled = Math.abs(snowball.sprite.x - snowball.startX);
            var progress = snowball.totalDistance > 0 ?
                Math.min(1, traveled / snowball.totalDistance) : 1;
            snowball.sprite.y = snowball.lockedY - Math.sin(progress * Math.PI) * s.arcHeight;
            snowball.sprite.rotation += s.rotationSpeed;

            var arrived = snowball.direction > 0 ?
                snowball.sprite.x >= snowball.targetX :
                snowball.sprite.x <= snowball.targetX;

            if (arrived) {
                this.resolveSnowballArrival(snowball);
                this.removeSnowball(i);
            }
        }
    };

})();
