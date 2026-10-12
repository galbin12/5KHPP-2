//=============================================================================
// ScreenShakeXY.js
//=============================================================================

/*:
 * @plugindesc 기본 "흔들기" 이벤트 커맨드는 좌우(X)로만 흔들리는데,
 * 이 플러그인은 화면을 캐릭터 흔들림과 같은 대각선 느낌(X+Y 동시)으로 흔들리게 해준다.
 * @author ㄹㅅㅁ
 *
 * @help
 * ------------------------------------------------------------------
 * 사용법 1) 기본 "흔들기" 이벤트 커맨드 그대로 사용
 * ------------------------------------------------------------------
 * 이벤트 커맨드의 [흔들기] (세기/속도/시간)를 그대로 쓰면
 * 이 플러그인이 자동으로 대각선(X+Y) 흔들림으로 바꿔서 처리한다.
 * 별도의 플러그인 명령이 필요 없음.
 *
 * ------------------------------------------------------------------
 * 사용법 2) 플러그인 명령으로 직접 걸고 싶을 때
 * ------------------------------------------------------------------
 * 플러그인 명령:
 *   ScreenShakeXY power speed duration
 *
 *   power    : 흔들림 세기
 *   speed    : 흔들리는 속도 (1~9 권장)
 *   duration : 지속 프레임 수 (60 = 1초)
 *
 * 예시)
 *   ScreenShakeXY 5 6 60     // 세기5 속도6으로 60프레임 흔들기
 *
 * ------------------------------------------------------------------
 * @param Y Power Rate
 * @desc X세기 대비 Y세기 비율 (0~1). 1.0이면 X/Y 동일한 세기로 원형에 가깝게 흔들림
 * @default 1.0
 */

(function() {

    var params = PluginManager.parameters('ScreenShakeXY');
    var yPowerRate = Number(params['Y Power Rate'] || 1.0);

    //-----------------------------------------------------------------------
    // Game_Screen
    // 코어의 관성식 흔들림 대신, 캐릭터 흔들림 플러그인과 동일한 sin/cos
    // 위상 방식으로 완전히 교체 -> 캐릭터가 흔들릴 때와 같은 대각선 느낌.

    var _ScreenShakeXY_Game_Screen_clear = Game_Screen.prototype.clear;
    Game_Screen.prototype.clear = function() {
        _ScreenShakeXY_Game_Screen_clear.call(this);
        this._shake = 0;
        this._shakeY = 0;
        this._shakePower2 = 0;
        this._shakeSpeed2 = 0;
        this._shakeDuration2 = 0;
        this._shakePhase = 0;
    };

    // 세밀 제어용 플러그인 명령
    var _ScreenShakeXY_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _ScreenShakeXY_Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ScreenShakeXY') {
            var powerX = Number(args[0] || 5);
            var speed = Number(args[1] || 6);
            var duration = Number(args[2] || 30);
            $gameScreen.startDiagonalShake(powerX, speed, duration);
        }
    };

    Game_Screen.prototype.startDiagonalShake = function(power, speed, duration) {
        this._shakePower2 = power;
        this._shakeSpeed2 = speed;
        this._shakeDuration2 = duration;
        this._shakePhase = 0;
    };

    // 기본 [흔들기] 이벤트 커맨드도 그대로 대각선 흔들림으로 동작하도록 가로챔
    Game_Screen.prototype.startShake = function(power, speed, duration) {
        this.startDiagonalShake(power, speed, duration);
    };

    var _ScreenShakeXY_Game_Screen_update = Game_Screen.prototype.update;
    Game_Screen.prototype.update = function() {
        _ScreenShakeXY_Game_Screen_update.call(this);
        this.updateDiagonalShake();
    };

    Game_Screen.prototype.updateDiagonalShake = function() {
        if (this._shakeDuration2 > 0) {
            this._shakePhase += this._shakeSpeed2;
            var rate = this._shakeDuration2 / (this._shakeDuration2 + 10); // 서서히 감쇠
            this._shake = Math.round(Math.sin(this._shakePhase * 0.5) * this._shakePower2 * rate);
            this._shakeY = Math.round(Math.cos(this._shakePhase * 0.5) * this._shakePower2 * yPowerRate * rate);
            this._shakeDuration2--;
            if (this._shakeDuration2 <= 0) {
                this._shake = 0;
                this._shakeY = 0;
            }
        }
    };

    Game_Screen.prototype.shakeY = function() {
        return this._shakeY || 0;
    };

    //-----------------------------------------------------------------------
    // Spriteset_Base

    var _ScreenShakeXY_Spriteset_Base_updatePosition = Spriteset_Base.prototype.updatePosition;
    Spriteset_Base.prototype.updatePosition = function() {
        _ScreenShakeXY_Spriteset_Base_updatePosition.call(this);
        this.y += Math.round($gameScreen.shakeY());
    };

})();
