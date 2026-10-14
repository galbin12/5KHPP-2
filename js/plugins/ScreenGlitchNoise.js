//=============================================================================
// ScreenGlitchNoise.js
//=============================================================================

/*:
 * @plugindesc 화면이 뒤틀리고 노이즈가 끼는 글리치(깨짐) 효과를 적용합니다.
 * @author RS
 *
 * @param Default Intensity
 * @desc 기본 글리치 강도 (0.3 약하게 ~ 1 보통 ~ 2 강하게)
 * @default 1
 *
 * @param Noise Amount
 * @desc 자글자글한 노이즈(눈 내리는 화면) 세기 (권장 0.05~0.4)
 * @default 0.18
 *
 * @param RGB Split
 * @desc 색 번짐(빨강/파랑 어긋남) 정도 (픽셀 단위, 권장 2~6)
 * @default 3
 *
 * @param Slice Count
 * @desc 화면을 가로로 몇 줄로 쪼개서 어긋나게 할지 (권장 12~30)
 * @default 18
 *
 * @param Scanline
 * @desc 가로 줄무늬(스캔라인) 세기 (0이면 없음, 권장 0~1)
 * @default 0.5
 *
 * @param Apply To Battle
 * @desc 전투 화면에도 적용할지 여부 (true / false)
 * @default true
 *
 * @help
 * ============================================================================
 * 효과 설명
 * ============================================================================
 * 아래 효과가 한꺼번에 들어갑니다.
 *   - 화면이 가로 띠 모양으로 뚝뚝 끊기며 좌우로 어긋남
 *   - 빨강/파랑 색이 갈라지는 색 번짐
 *   - 자글자글한 노이즈
 *   - 미세한 물결 흔들림, 가끔 위아래로 튀는 현상
 *   - 가로 스캔라인
 *
 * ============================================================================
 * 플러그인 커맨드
 * ============================================================================
 *
 *   ScreenGlitch on
 *     - 기본 강도로 글리치를 계속 켜 둡니다.
 *
 *   ScreenGlitch on 강도
 *     - 강도를 직접 지정해서 켭니다.
 *     - 예: ScreenGlitch on 1.5
 *
 *   ScreenGlitch off
 *     - 글리치를 끕니다.
 *
 *   ScreenGlitch pulse
 *     - 글리치가 확 터졌다가 서서히 사라지는 연출을 1회 재생합니다.
 *       (컷신의 충격 연출 등에 사용)
 *
 *   ScreenGlitch pulse 강도 프레임수
 *     - 예: ScreenGlitch pulse 2 40
 *       (강도 2로 터져서 40프레임 동안 사라짐. 60프레임 = 1초)
 *
 *   ScreenGlitch auto on
 *     - 랜덤한 간격으로 글리치가 순간적으로 튀는 자동 모드를 켭니다.
 *       (고장 난 기계, 불안한 분위기 연출 등에 사용)
 *
 *   ScreenGlitch auto on 최소간격 최대간격 강도
 *     - 간격은 프레임 단위입니다.
 *     - 예: ScreenGlitch auto on 120 360 1.5
 *
 *   ScreenGlitch auto off
 *     - 자동 모드를 끕니다.
 *
 * ============================================================================
 * 주의
 * ============================================================================
 * - 맵(Scene_Map)과 전투(Scene_Battle)의 스프라이트 영역에만 적용됩니다.
 *   메시지 창/메뉴 같은 윈도우 레이어에는 적용되지 않아 이벤트 진행에
 *   영향이 없습니다.
 * - 켜짐/꺼짐 상태는 맵 ↔ 전투 ↔ 메뉴를 오가도 유지됩니다.
 * - 세이브 데이터에는 저장되지 않습니다. (로드 후에는 다시 켜 주세요)
 * - ScreenHeatHaze.js 등 다른 화면 필터 플러그인과 같이 써도 됩니다.
 *   플러그인 목록에서는 해당 플러그인들보다 아래에 두세요.
 */

(function() {

    var parameters = PluginManager.parameters('ScreenGlitchNoise');
    var defaultIntensity = Number(parameters['Default Intensity'] || 1);
    var noiseAmount = Number(parameters['Noise Amount'] || 0.18);
    var rgbSplit = Number(parameters['RGB Split'] || 3);
    var sliceCount = Number(parameters['Slice Count'] || 18);
    var scanline = Number(parameters['Scanline'] !== undefined ? parameters['Scanline'] : 0.5);
    var applyToBattle = String(parameters['Apply To Battle'] || 'true').toLowerCase() !== 'false';

    //-----------------------------------------------------------------------
    // Global state
    //-----------------------------------------------------------------------
    window.$screenGlitchState = {
        enabled: false,
        intensity: defaultIntensity,
        // pulse (한 번 터졌다 사라지는 연출)
        pulseFrame: 0,
        pulseTotal: 0,
        pulsePeak: 0,
        // auto (랜덤 간격으로 자동 발동)
        autoEnabled: false,
        autoMin: 120,
        autoMax: 360,
        autoPeak: 1.5,
        autoCounter: 0
    };

    function startPulse(peak, frames) {
        var s = window.$screenGlitchState;
        s.pulsePeak = peak;
        s.pulseTotal = Math.max(1, frames);
        s.pulseFrame = 0;
    }

    function resetAutoCounter() {
        var s = window.$screenGlitchState;
        var range = Math.max(1, s.autoMax - s.autoMin);
        s.autoCounter = s.autoMin + Math.floor(Math.random() * range);
    }

    //-----------------------------------------------------------------------
    // Filter definition
    //-----------------------------------------------------------------------
    function ScreenGlitchFilter() {
        var vertexSrc = null; // use default vertex shader
        var fragmentSrc = [
            'precision mediump float;',
            'varying vec2 vTextureCoord;',
            'uniform sampler2D uSampler;',
            'uniform float time;',
            'uniform float intensity;',
            'uniform float screenWidth;',
            'uniform float screenHeight;',
            'uniform float noiseAmount;',
            'uniform float rgbSplit;',
            'uniform float sliceCount;',
            'uniform float scanline;',
            '',
            'float hash(vec2 p) {',
            '    vec3 p3 = fract(vec3(p.xyx) * 0.1031);',
            '    p3 += dot(p3, p3.yzx + 33.33);',
            '    return fract((p3.x + p3.y) * p3.z);',
            '}',
            '',
            'void main(void) {',
            '    vec2 uv = vTextureCoord;',
            '    float k = clamp(intensity, 0.0, 3.0);',
            // 약 15회/초로 끊겨서 바뀌는 시간 (time은 프레임 단위)
            '    float t = mod(floor(time * 0.25), 97.0);',
            '',
            // 1) 가로 띠 어긋남
            '    float row = floor(uv.y * sliceCount);',
            '    float rnd = hash(vec2(row, t));',
            '    float glitchOn = step(1.0 - 0.18 * k, rnd);',
            '    float shift = (hash(vec2(row + 7.0, t)) - 0.5) * 0.12 * k * glitchOn;',
            '',
            // 2) 미세한 물결 흔들림
            '    float wob = sin(uv.y * 40.0 + time * 0.35) * 0.0015 * k;',
            '',
            // 3) 가끔 위아래로 튐
            '    float vj = step(1.0 - 0.08 * k, hash(vec2(t, 11.0))) * (hash(vec2(t, 5.0)) - 0.5) * 0.03 * k;',
            '',
            '    vec2 base = vec2(uv.x + shift + wob, uv.y + vj);',
            '    base = clamp(base, 0.0, 1.0);',
            '',
            // 4) RGB 색 번짐
            '    float split = (rgbSplit / screenWidth) * k + abs(shift) * 0.5;',
            '    vec4 c = texture2D(uSampler, base);',
            '    float r = texture2D(uSampler, clamp(base + vec2(split, 0.0), 0.0, 1.0)).r;',
            '    float b = texture2D(uSampler, clamp(base - vec2(split, 0.0), 0.0, 1.0)).b;',
            '    vec3 col = vec3(r, c.g, b);',
            '',
            // 5) 노이즈
            '    float n = hash(uv * vec2(screenWidth, screenHeight) * 0.5 + t) - 0.5;',
            '    col += n * noiseAmount * k * c.a;',
            '',
            // 6) 스캔라인
            '    col *= 1.0 - scanline * 0.2 * k * (0.5 + 0.5 * sin(uv.y * screenHeight * 3.14159));',
            '',
            // 7) 어긋난 띠는 살짝 밝게
            '    col += glitchOn * 0.05 * k * c.a;',
            '',
            '    gl_FragColor = vec4(col, c.a);',
            '}'
        ].join('\n');

        PIXI.Filter.call(this, vertexSrc, fragmentSrc);
        this.uniforms.time = 0;
        this.uniforms.intensity = 0;
        this.uniforms.screenWidth = Graphics.width;
        this.uniforms.screenHeight = Graphics.height;
        this.uniforms.noiseAmount = noiseAmount;
        this.uniforms.rgbSplit = rgbSplit;
        this.uniforms.sliceCount = sliceCount;
        this.uniforms.scanline = scanline;
    }

    ScreenGlitchFilter.prototype = Object.create(PIXI.Filter.prototype);
    ScreenGlitchFilter.prototype.constructor = ScreenGlitchFilter;

    //-----------------------------------------------------------------------
    // Plugin Command
    //-----------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command !== 'ScreenGlitch') return;

        var s = window.$screenGlitchState;
        var mode = (args[0] || '').toLowerCase();

        if (mode === 'on') {
            s.enabled = true;
            s.intensity = args[1] !== undefined ? Number(args[1]) : defaultIntensity;
        } else if (mode === 'off') {
            s.enabled = false;
        } else if (mode === 'pulse') {
            var peak = args[1] !== undefined ? Number(args[1]) : defaultIntensity * 1.5;
            var frames = args[2] !== undefined ? Number(args[2]) : 30;
            startPulse(peak, frames);
        } else if (mode === 'auto') {
            var sub = (args[1] || '').toLowerCase();
            if (sub === 'on') {
                s.autoEnabled = true;
                if (args[2] !== undefined) s.autoMin = Number(args[2]);
                if (args[3] !== undefined) s.autoMax = Number(args[3]);
                if (args[4] !== undefined) s.autoPeak = Number(args[4]);
                resetAutoCounter();
            } else if (sub === 'off') {
                s.autoEnabled = false;
            }
        }
    };

    //-----------------------------------------------------------------------
    // Common scene helpers (Scene_Map / Scene_Battle 공통)
    //-----------------------------------------------------------------------
    function setupGlitch(scene) {
        scene._glitchFilter = new ScreenGlitchFilter();
        scene._glitchTime = 0;
        // 필터 적용 대상은 스프라이트셋만. 윈도우 레이어는 건드리지 않아서
        // 메시지/선택지 등 이벤트 진행에 영향을 주지 않음.
        if (scene._spriteset) {
            scene._spriteset.filterArea = new PIXI.Rectangle(0, 0, Graphics.width, Graphics.height);
        }
    }

    function updateGlitch(scene) {
        if (!scene._glitchFilter || !scene._spriteset) return;
        var s = window.$screenGlitchState;
        var target = scene._spriteset;

        // auto 모드: 카운트다운 후 짧은 pulse 발동
        if (s.autoEnabled) {
            s.autoCounter--;
            if (s.autoCounter <= 0) {
                startPulse(s.autoPeak, 8 + Math.floor(Math.random() * 20));
                resetAutoCounter();
            }
        }

        // pulse 진행: 터졌다가 서서히 줄어듦 (살짝 깜빡이며)
        var pulse = 0;
        if (s.pulseFrame < s.pulseTotal) {
            var remain = 1 - s.pulseFrame / s.pulseTotal;
            pulse = s.pulsePeak * remain * (0.6 + Math.random() * 0.4);
            s.pulseFrame++;
        }

        var base = s.enabled ? s.intensity : 0;
        var total = Math.max(base, pulse);
        var filter = scene._glitchFilter;
        var attached = target.filters && target.filters.indexOf(filter) >= 0;

        if (total > 0.001) {
            scene._glitchTime += 1;
            filter.uniforms.time = scene._glitchTime;
            filter.uniforms.intensity = total;
            if (!attached) {
                target.filters = (target.filters || []).concat([filter]);
            }
        } else if (attached) {
            target.filters = target.filters.filter(function(f) {
                return f !== filter;
            });
            if (target.filters.length === 0) target.filters = null;
        }
    }

    //-----------------------------------------------------------------------
    // Scene_Map hook
    //-----------------------------------------------------------------------
    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        setupGlitch(this);
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        updateGlitch(this);
    };

    //-----------------------------------------------------------------------
    // Scene_Battle hook
    //-----------------------------------------------------------------------
    if (applyToBattle) {
        var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
        Scene_Battle.prototype.createDisplayObjects = function() {
            _Scene_Battle_createDisplayObjects.call(this);
            setupGlitch(this);
        };

        var _Scene_Battle_update = Scene_Battle.prototype.update;
        Scene_Battle.prototype.update = function() {
            _Scene_Battle_update.call(this);
            updateGlitch(this);
        };
    }

})();
