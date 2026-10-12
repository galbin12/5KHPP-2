//=============================================================================
// DizzyBlur.js
//=============================================================================

/*:
 * @plugindesc 화면이 잠깐 블러 처리되며 어지러운 느낌을 연출합니다.
 * @author RS
 *
 * @param Default Max Blur
 * @desc 기본 최대 블러 강도 (권장 6~20)
 * @default 12
 *
 * @param Default In Frames
 * @desc 블러가 최대치까지 들어오는 데 걸리는 프레임 수
 * @default 15
 *
 * @param Default Hold Frames
 * @desc 최대 블러 상태를 유지하는 프레임 수
 * @default 10
 *
 * @param Default Out Frames
 * @desc 블러가 원래대로 빠지는 데 걸리는 프레임 수
 * @default 25
 *
 * @param Sway Amount
 * @desc 블러와 함께 화면이 흔들리는 정도 (픽셀, 0이면 흔들림 없음)
 * @default 3
 *
 * @param Auto Interval Min
 * @desc 자동 모드일 때 다음 발동까지 최소 프레임 (60프레임 = 1초)
 * @default 300
 *
 * @param Auto Interval Max
 * @desc 자동 모드일 때 다음 발동까지 최대 프레임
 * @default 600
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 플러그인 커맨드:
 *
 *   DizzyBlur start
 *     - 기본값으로 어지러움 연출을 1회 재생합니다.
 *
 *   DizzyBlur start maxBlur inFrames holdFrames outFrames
 *     - 값을 직접 지정하여 1회 재생합니다.
 *     - 예: DizzyBlur start 16 10 8 30
 *
 *   DizzyBlur auto on
 *     - 자동 모드 On. 맵에 있는 동안 랜덤한 간격으로 알아서
 *       어지러움 연출이 반복 재생됩니다. (예: 독/저주 상태 등에 사용)
 *
 *   DizzyBlur auto on minInterval maxInterval
 *     - 자동 모드 발동 간격을 직접 지정합니다. (프레임 단위)
 *
 *   DizzyBlur auto off
 *     - 자동 모드 Off.
 *
 * ============================================================================
 * 주의
 * ============================================================================
 * - 맵 화면(Scene_Map) 전체에 적용됩니다.
 * - 전투/메뉴 등 다른 씬으로 전환하면 진행 중이던 연출은 초기화되고,
 *   자동 모드 On/Off 상태는 유지되어 맵 복귀 시 다시 동작합니다.
 * - 세이브 데이터에는 영향을 주지 않는 임시 연출용 플러그인입니다.
 *   (재접속/로드 시 자동 모드는 다시 켜줘야 합니다)
 *
 */

(function() {

    var parameters = PluginManager.parameters('DizzyBlur');
    var defaultMaxBlur = Number(parameters['Default Max Blur'] || 12);
    var defaultInFrames = Number(parameters['Default In Frames'] || 15);
    var defaultHoldFrames = Number(parameters['Default Hold Frames'] || 10);
    var defaultOutFrames = Number(parameters['Default Out Frames'] || 25);
    var swayAmount = Number(parameters['Sway Amount'] || 3);
    var autoIntervalMin = Number(parameters['Auto Interval Min'] || 300);
    var autoIntervalMax = Number(parameters['Auto Interval Max'] || 600);

    //-----------------------------------------------------------------------
    // Global state
    //-----------------------------------------------------------------------
    window.$dizzyBlurState = {
        playing: false,
        phase: '',      // 'in' | 'hold' | 'out'
        frame: 0,
        maxBlur: defaultMaxBlur,
        inFrames: defaultInFrames,
        holdFrames: defaultHoldFrames,
        outFrames: defaultOutFrames,
        autoEnabled: false,
        autoIntervalMin: autoIntervalMin,
        autoIntervalMax: autoIntervalMax,
        autoCounter: 0
    };

    function startDizzyBlur(maxBlur, inFrames, holdFrames, outFrames) {
        var s = window.$dizzyBlurState;
        s.playing = true;
        s.phase = 'in';
        s.frame = 0;
        s.maxBlur = maxBlur !== undefined ? maxBlur : defaultMaxBlur;
        s.inFrames = inFrames !== undefined ? inFrames : defaultInFrames;
        s.holdFrames = holdFrames !== undefined ? holdFrames : defaultHoldFrames;
        s.outFrames = outFrames !== undefined ? outFrames : defaultOutFrames;
    }

    function resetAutoCounter() {
        var s = window.$dizzyBlurState;
        var min = s.autoIntervalMin;
        var max = s.autoIntervalMax;
        s.autoCounter = min + Math.floor(Math.random() * Math.max(1, (max - min)));
    }

    //-----------------------------------------------------------------------
    // Plugin Command
    //-----------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'DizzyBlur') {
            var mode = (args[0] || '').toLowerCase();
            if (mode === 'start') {
                var maxBlur = args[1] !== undefined ? Number(args[1]) : undefined;
                var inFrames = args[2] !== undefined ? Number(args[2]) : undefined;
                var holdFrames = args[3] !== undefined ? Number(args[3]) : undefined;
                var outFrames = args[4] !== undefined ? Number(args[4]) : undefined;
                startDizzyBlur(maxBlur, inFrames, holdFrames, outFrames);
            } else if (mode === 'auto') {
                var sub = (args[1] || '').toLowerCase();
                if (sub === 'on') {
                    window.$dizzyBlurState.autoEnabled = true;
                    if (args[2] !== undefined) window.$dizzyBlurState.autoIntervalMin = Number(args[2]);
                    if (args[3] !== undefined) window.$dizzyBlurState.autoIntervalMax = Number(args[3]);
                    resetAutoCounter();
                } else if (sub === 'off') {
                    window.$dizzyBlurState.autoEnabled = false;
                }
            }
        }
    };

    //-----------------------------------------------------------------------
    // Scene_Map hook
    //-----------------------------------------------------------------------
    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        this._dizzyBlurFilter = new PIXI.filters.BlurFilter();
        this._dizzyBlurFilter.blur = 0;
        this._dizzyBlurFilter.padding = 32;
        this._dizzySwayX = 0;
        // 절대 base 좌표 대신, 자기가 얼마나 더했는지(오프셋)만 추적
        this._dizzySwayOffsetX = 0;
        this._dizzySwayOffsetY = 0;

        var s = window.$dizzyBlurState;
        s.playing = false;
        s.phase = '';
        s.frame = 0;
        if (s.autoEnabled) resetAutoCounter();
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        this.updateDizzyBlur();
    };

    Scene_Map.prototype.updateDizzyBlur = function() {
        if (!this._dizzyBlurFilter || !this._spriteset) return;
        var s = window.$dizzyBlurState;
        var target = this._spriteset;

        // 자동 모드: 대기 중이면 카운터를 줄이다가 0이 되면 발동
        if (s.autoEnabled && !s.playing) {
            s.autoCounter--;
            if (s.autoCounter <= 0) {
                startDizzyBlur();
            }
        }

        if (s.playing) {
            s.frame++;
            var blurValue = 0;
            var t;

            if (s.phase === 'in') {
                t = s.inFrames > 0 ? Math.min(1, s.frame / s.inFrames) : 1;
                blurValue = s.maxBlur * t;
                if (t >= 1) {
                    s.phase = 'hold';
                    s.frame = 0;
                }
            } else if (s.phase === 'hold') {
                blurValue = s.maxBlur;
                if (s.frame >= s.holdFrames) {
                    s.phase = 'out';
                    s.frame = 0;
                }
            } else if (s.phase === 'out') {
                t = s.outFrames > 0 ? Math.min(1, s.frame / s.outFrames) : 1;
                blurValue = s.maxBlur * (1 - t);
                if (t >= 1) {
                    s.playing = false;
                    s.phase = '';
                    s.frame = 0;
                    blurValue = 0;
                    if (s.autoEnabled) resetAutoCounter();
                }
            }

            this._dizzyBlurFilter.blur = blurValue;

            if (swayAmount > 0) {
                var progress = blurValue / (s.maxBlur || 1);
                this._dizzySwayX += 0.25;
                var newOffsetX = Math.sin(this._dizzySwayX) * swayAmount * progress;
                var newOffsetY = Math.cos(this._dizzySwayX * 0.6) * swayAmount * 0.5 * progress;
                // 절대값 대입이 아니라 "이전 프레임 대비 변화분"만 더함
                // -> 다른 플러그인(ScreenShakeXY 등)이 같은 프레임에 x/y를 건드려도
                //    그 값을 덮어쓰지 않고 유지된다.
                target.x += (newOffsetX - this._dizzySwayOffsetX);
                target.y += (newOffsetY - this._dizzySwayOffsetY);
                this._dizzySwayOffsetX = newOffsetX;
                this._dizzySwayOffsetY = newOffsetY;
            }

            if (!target.filters || target.filters.indexOf(this._dizzyBlurFilter) < 0) {
                target.filters = (target.filters || []).concat([this._dizzyBlurFilter]);
            }
        } else {
            if (target.filters && target.filters.indexOf(this._dizzyBlurFilter) >= 0) {
                target.filters = target.filters.filter(function(f) {
                    return f !== this._dizzyBlurFilter;
                }, this);
                if (target.filters.length === 0) target.filters = null;
            }
            // sway 종료: 자기가 더해뒀던 오프셋만큼만 되돌리고, base로 강제 리셋하지 않음
            if (this._dizzySwayOffsetX !== 0 || this._dizzySwayOffsetY !== 0) {
                target.x -= this._dizzySwayOffsetX;
                target.y -= this._dizzySwayOffsetY;
                this._dizzySwayOffsetX = 0;
                this._dizzySwayOffsetY = 0;
            }
        }
    };

})();
