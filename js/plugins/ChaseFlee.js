//=============================================================================
// ChaseFlee.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 이벤트를 클릭(액션 버튼)하면 놀람 말풍선을 띄우고 플레이어에게서
 * 도망치다가, 붙잡히면 잠시 후 지정한 트룹으로 전투를 시작합니다.
 * @author Claude
 *
 * @param Balloon Icon ID
 * @desc 도망치기 시작할 때 띄울 말풍선 아이콘 번호
 * 1=놀람(!) 2=물음표(?) 3=음표 4=하트 5=분노 6=땀 7=거미줄 8=침묵 9=전구 10=Zzz
 * @default 1
 *
 * @param Catch Wait Seconds
 * @desc 잡힌 뒤 전투가 시작되기까지의 대기 시간(초). 소수점 가능
 * @default 0.5
 *
 * @param Can Escape
 * @desc 잡혀서 시작된 전투에서 "도망가기" 커맨드 허용 여부
 * @default true
 *
 * @param Can Lose
 * @desc 잡혀서 시작된 전투에서 패배해도 게임오버 되지 않고 진행 가능한지 여부
 * @default false
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 도망다니게 하고 싶은 이벤트의 페이지 트리거를 "클릭(결정 버튼)" 등으로
 * 설정하고, 그 페이지의 이벤트 명령 중에 아래처럼 플러그인 명령을 넣으세요.
 *
 *     ChaseFlee troopId:5
 *
 * → troopId 자리에 전투를 시작할 트룹 ID를 적으면 됩니다.
 *
 * ------------------------------------------------------------------------
 * 동작 방식
 * ------------------------------------------------------------------------
 * 1. 플러그인 명령이 실행되면 그 이벤트 위에 말풍선(기본: "!")이 뜨고,
 *    이벤트는 그 즉시부터 매 프레임 플레이어와 반대 방향으로 도망칩니다.
 * 2. 도망치는 도중 플레이어가 그 이벤트와 인접(한 칸 이내)해지면
 *    "붙잡힌 것"으로 판정되어 그 자리에 멈춥니다.
 * 3. 멈춘 뒤 Catch Wait Seconds(기본 0.5초) 동안 대기합니다.
 * 4. 대기가 끝나면 지정한 troopId로 전투가 시작됩니다.
 *
 * - 다른 이벤트(대화 등)가 실행 중이거나 메시지 창이 떠 있는 동안에는
 *   도망 이동 및 붙잡힘 판정을 하지 않습니다.
 * - 이미 도망 중이거나 붙잡혀 대기 중인 이벤트에 다시 플러그인 명령이
 *   실행되어도 무시됩니다(중복 실행 방지).
 * - 붙잡혀서 전투가 시작될 때, 그 이벤트의 셀프 스위치 A가 ON으로
 *   설정됩니다. 전투 종료 후 페이지를 바꿔 다른 대사/처리를 넣고 싶다면
 *   셀프 스위치 A 조건의 페이지를 추가로 만들어 사용하세요.
 * - 전투에서 승리(처치)하면 그 이벤트는 통과(Through) + 투명(Transparent)
 *   상태가 되어 화면에서 사라진 것처럼 보입니다. (도망/패배 시에는 그대로
 *   유지됩니다) 이때 셀프 스위치 B가 ON으로 설정되며, 맵을 나갔다가 다시
 *   들어오거나 세이브 후 로드해도 이 상태가 계속 유지됩니다.
 * - 셀프 스위치 B가 켜진(=이미 처치된) 이벤트는 다시 클릭해도 ChaseFlee
 *   명령이 무시되어 재도전이 되지 않습니다.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {

    var parameters = PluginManager.parameters('ChaseFlee');
    var balloonIconId = Number(parameters['Balloon Icon ID'] || 1);
    var catchWaitFrames = Math.max(0, Math.round(Number(parameters['Catch Wait Seconds'] || 0.5) * 60));
    var canEscape = String(parameters['Can Escape'] || 'true') === 'true';
    var canLose = String(parameters['Can Lose'] || 'false') === 'true';

    //-------------------------------------------------------------------------
    // 플러그인 명령
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ChaseFlee') {
            var event = $gameMap.event(this._eventId);
            if (!event) return;
            if (event._chaseFleeActive || event._chaseFleeCaught) return;
            if ($gameSelfSwitches.value([event._mapId, event._eventId, 'B'])) return; // 이미 처치됨

            var troopId = 0;
            args.forEach(function(arg) {
                if (arg.indexOf('troopId:') === 0) {
                    troopId = Number(arg.split(':')[1]);
                }
            });
            if (troopId > 0) {
                event.startChaseFlee(troopId);
            }
        }
    };

    //-------------------------------------------------------------------------
    // Game_Event
    //-------------------------------------------------------------------------
    Game_Event.prototype.startChaseFlee = function(troopId) {
        this._chaseFleeActive = true;
        this._chaseFleeCaught = false;
        this._chaseFleeTroopId = troopId;
        this._chaseFleeWaitTimer = 0;
        // 클릭한 직후에는 플레이어가 바로 옆에 붙어있는 게 정상이라,
        // 유예시간 없이 바로 인접 판정을 하면 도망칠 틈도 없이 즉시
        // 붙잡힌 것으로 처리돼버립니다. 잠깐(약 0.3초) 붙잡힘 판정을
        // 미뤄서 먼저 도망칠 기회를 줍니다.
        this._chaseFleeGraceTimer = 18;
        this.requestBalloon(balloonIconId);
    };

    Game_Event.prototype.isChaseFleeAdjacentToPlayer = function() {
        var dx = Math.abs(this.deltaXFrom($gamePlayer.x));
        var dy = Math.abs(this.deltaYFrom($gamePlayer.y));
        return Math.max(dx, dy) <= 1;
    };

    Game_Event.prototype.catchByChaseFlee = function() {
        this._chaseFleeActive = false;
        this._chaseFleeCaught = true;
        this._chaseFleeWaitTimer = catchWaitFrames;
        this.turnTowardCharacter($gamePlayer);
    };

    Game_Event.prototype.startChaseFleeBattle = function() {
        this._chaseFleeCaught = false;
        var troopId = this._chaseFleeTroopId;
        var event = this;
        var mapId = this._mapId;
        var eventId = this._eventId;
        $gameSelfSwitches.setValue([mapId, eventId, 'A'], true);
        BattleManager.setup(troopId, canEscape, canLose);
        BattleManager.setEventCallback(function(n) {
            if (n === 0) {
                // 승리(처치) 시 통과+투명 처리. 셀프 스위치 B에 "처치됨" 상태를
                // 남겨서, 맵을 나갔다가 다시 들어오거나 세이브 후 로드해도
                // 페이지가 다시 세팅될 때 아래 setupPageSettings 훅에서
                // 자동으로 다시 통과+투명 처리되도록 함
                $gameSelfSwitches.setValue([mapId, eventId, 'B'], true);
                event.setThrough(true);
                event.setTransparent(true);
            }
        });
        $gamePlayer.makeEncounterCount();
        SceneManager.push(Scene_Battle);
    };

    // 셀프 스위치 B(처치됨)가 켜져 있으면, 이벤트 페이지가 다시 계산될
    // 때마다(맵 재진입, 세이브 로드 등으로 이벤트가 새로 만들어질 때 포함)
    // 무조건 통과+투명 상태를 다시 적용해서 사라진 상태가 계속 유지되게 함
    var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
    Game_Event.prototype.setupPageSettings = function() {
        _Game_Event_setupPageSettings.call(this);
        if ($gameSelfSwitches.value([this._mapId, this._eventId, 'B'])) {
            this._through = true;
            this._transparent = true;
            this._chaseFleeActive = false;
            this._chaseFleeCaught = false;
        }
    };

    Game_Event.prototype.updateChaseFlee = function() {
        if (!this._chaseFleeActive && !this._chaseFleeCaught) return;
        if ($gameMap.isEventRunning() || $gameMessage.isBusy()) return;

        if (this._chaseFleeActive) {
            if (this._chaseFleeGraceTimer > 0) {
                this._chaseFleeGraceTimer--;
                if (!this.isMoving()) {
                    this.moveAwayFromCharacter($gamePlayer);
                }
                return;
            }
            if (this.isChaseFleeAdjacentToPlayer()) {
                this.catchByChaseFlee();
                return;
            }
            if (!this.isMoving()) {
                this.moveAwayFromCharacter($gamePlayer);
            }
        } else if (this._chaseFleeCaught) {
            if (this._chaseFleeWaitTimer > 0) {
                this._chaseFleeWaitTimer--;
                if (this._chaseFleeWaitTimer <= 0) {
                    this.startChaseFleeBattle();
                }
            }
        }
    };

    var _Game_Event_update = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        _Game_Event_update.call(this);
        this.updateChaseFlee();
    };

})();
