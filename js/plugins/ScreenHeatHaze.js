//=============================================================================
// ScreenHeatHaze.js
//=============================================================================

/*:
 * @plugindesc 화면 전체에 이글거리는(아지랑이) 왜곡 효과를 적용합니다.
 * @author RS
 *
 * @param Default Amplitude
 * @desc 기본 왜곡 강도 (픽셀 단위, 권장 2~8)
 * @default 4
 *
 * @param Default Wave Length
 * @desc 기본 파장 (값이 작을수록 물결이 촘촘해짐, 권장 20~60)
 * @default 40
 *
 * @param Default Speed
 * @desc 기본 애니메이션 속도 (권장 0.05~0.3)
 * @default 0.12
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 플러그인 커맨드:
 *
 *   HeatHaze on
 *     - 기본값으로 이글거림 효과를 켭니다.
 *
 *   HeatHaze on amplitude waveLength speed
 *     - 값을 직접 지정하여 켭니다.
 *     - 예: HeatHaze on 6 30 0.2
 *
 *   HeatHaze off
 *     - 효과를 끕니다.
 *
 * ============================================================================
 * 주의
 * ============================================================================
 * - 맵 화면(Scene_Map) 전체에 적용됩니다.
 * - 전투/메뉴 등 다른 씬으로 전환하면 자동으로 꺼지고, 다시 맵으로 돌아오면
 *   이전에 켜져 있던 상태가 유지되어 다시 적용됩니다.
 *
 */

(function() {

    var parameters = PluginManager.parameters('ScreenHeatHaze');
    var defaultAmplitude = Number(parameters['Default Amplitude'] || 8);
    var defaultWaveLength = Number(parameters['Default Wave Length'] || 12);
    var defaultSpeed = Number(parameters['Default Speed'] || 0.04);

    //-----------------------------------------------------------------------
    // Global state
    //-----------------------------------------------------------------------
    window.$heatHazeState = {
        enabled: false,
        amplitude: defaultAmplitude,
        waveLength: defaultWaveLength,
        speed: defaultSpeed
    };

    //-----------------------------------------------------------------------
    // Filter definition
    //-----------------------------------------------------------------------
    function HeatHazeFilter() {
        var vertexSrc = null; // use default vertex shader
        var fragmentSrc = [
            'precision mediump float;',
            'varying vec2 vTextureCoord;',
            'uniform sampler2D uSampler;',
            'uniform float time;',
            'uniform float amplitude;',
            'uniform float waveLength;',
            'uniform float screenWidth;',
            'void main(void) {',
            '    vec2 uv = vTextureCoord;',
            '    float px = amplitude / screenWidth;',
            '    float wave = uv.y * waveLength;',
            '    float offsetX = sin(wave + time) * px;',
            '    vec2 uv2 = uv + vec2(offsetX, 0.0);',
            '    if (uv2.x < 0.0 || uv2.x > 1.0 || uv2.y < 0.0 || uv2.y > 1.0) {',
            '        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);',
            '    } else {',
            '        gl_FragColor = texture2D(uSampler, uv2);',
            '    }',
            '}'
        ].join('\n');

        PIXI.Filter.call(this, vertexSrc, fragmentSrc);
        this.uniforms.time = 0;
        this.uniforms.amplitude = defaultAmplitude;
        this.uniforms.waveLength = defaultWaveLength;
        this.uniforms.screenWidth = Graphics.width;
    }

    HeatHazeFilter.prototype = Object.create(PIXI.Filter.prototype);
    HeatHazeFilter.prototype.constructor = HeatHazeFilter;

    //-----------------------------------------------------------------------
    // Plugin Command
    //-----------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'HeatHaze') {
            var mode = (args[0] || '').toLowerCase();
            if (mode === 'on') {
                $heatHazeState.enabled = true;
                $heatHazeState.amplitude = args[1] !== undefined ? Number(args[1]) : defaultAmplitude;
                $heatHazeState.waveLength = args[2] !== undefined ? Number(args[2]) : defaultWaveLength;
                $heatHazeState.speed = args[3] !== undefined ? Number(args[3]) : defaultSpeed;
            } else if (mode === 'off') {
                $heatHazeState.enabled = false;
            }
        }
    };

    //-----------------------------------------------------------------------
    // Scene_Map hook
    //-----------------------------------------------------------------------
    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        this._heatHazeFilter = new HeatHazeFilter();
        this._heatHazeTime = 0;
        // 필터 적용 대상은 맵 스프라이트셋만. 메시지/선택지 등 윈도우 레이어는
        // 건드리지 않아서 이벤트(메시지 표시 등) 진행에 영향을 주지 않음.
        this._spriteset.filterArea = new PIXI.Rectangle(0, 0, Graphics.width, Graphics.height);
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        this.updateHeatHaze();
    };

    Scene_Map.prototype.updateHeatHaze = function() {
        if (!this._heatHazeFilter || !this._spriteset) return;

        var target = this._spriteset;

        if ($heatHazeState.enabled) {
            this._heatHazeTime += $heatHazeState.speed;
            this._heatHazeFilter.uniforms.time = this._heatHazeTime;
            this._heatHazeFilter.uniforms.amplitude = $heatHazeState.amplitude;
            this._heatHazeFilter.uniforms.waveLength = $heatHazeState.waveLength;

            if (!target.filters || target.filters.indexOf(this._heatHazeFilter) < 0) {
                target.filters = (target.filters || []).concat([this._heatHazeFilter]);
            }
        } else {
            if (target.filters && target.filters.indexOf(this._heatHazeFilter) >= 0) {
                target.filters = target.filters.filter(function(f) {
                    return f !== this._heatHazeFilter;
                }, this);
                if (target.filters.length === 0) target.filters = null;
            }
        }
    };

})();
