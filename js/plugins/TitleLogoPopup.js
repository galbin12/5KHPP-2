//=============================================================================
// TitleLogoPopup.js
//=============================================================================

/*:
 * @plugindesc 타이틀 화면에서 배경1이 뜬 뒤, 배경2(로고)가 딜레이 후 스케일 팝업으로 나타납니다.
 * @author Claude
 *
 * @param Delay Frames
 * @type number
 * @desc 배경1이 뜨고 배경2가 나오기까지 대기 프레임 (60=1초)
 * @default 60
 * @min 0
 *
 * @param Pop Duration
 * @type number
 * @desc 배경2가 작은 크기에서 원래 크기로 커지는 데 걸리는 프레임
 * @default 20
 * @min 1
 *
 * @param Start Scale
 * @type number
 * @decimals 2
 * @desc 배경2가 나타나기 시작할 때의 크기 배율 (0.5 = 절반 크기)
 * @default 0.50
 *
 * @param Fade In Together
 * @type boolean
 * @desc 스케일 애니메이션과 함께 opacity도 페이드인할지 여부
 * @default true
 *
 * @param Menu Fadein Frames
 * @type number
 * @desc 배경2 팝업이 끝난 뒤 메뉴(커맨드 창)가 페이드인되는 데 걸리는 프레임
 * @default 30
 * @min 1
 *
 * @help
 * ============================================================================
 * 타이틀 배경1(TitleImageSwitch.js와 함께 써도 무관)이 표시된 뒤
 * 지정한 시간만큼 대기했다가, 배경2가 작은 크기에서 원래 크기로
 * 커지면서(팝업) 나타나는 연출을 추가합니다.
 *
 * 다른 타이틀 관련 플러그인(TitleImageSwitch 등)보다 아래에 배치하세요.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.TitleLogoPopup = true;

(function() {

    var parameters = PluginManager.parameters('TitleLogoPopup');
    var DELAY_FRAMES = Number(parameters['Delay Frames'] || 60);
    var POP_DURATION = Number(parameters['Pop Duration'] || 20);
    var START_SCALE = Number(parameters['Start Scale'] || 0.5);
    var FADE_TOGETHER = (parameters['Fade In Together'] || 'true') === 'true';
    var MENU_FADEIN_FRAMES = Number(parameters['Menu Fadein Frames'] || 30);

    var _Scene_Title_createBackground = Scene_Title.prototype.createBackground;
    Scene_Title.prototype.createBackground = function() {
        _Scene_Title_createBackground.call(this);

        // 배경2를 숨긴 상태로 시작
        this._backSprite2.scale.x = START_SCALE;
        this._backSprite2.scale.y = START_SCALE;
        this._backSprite2.anchor.x = 0.5;
        this._backSprite2.anchor.y = 0.5;
        this._backSprite2.x = Graphics.width / 2;
        this._backSprite2.y = Graphics.height / 2;
        if (FADE_TOGETHER) {
            this._backSprite2.opacity = 0;
        }

        this._logoPopupTimer = 0;
        this._logoPopupPhase = 'waiting'; // waiting -> popping -> menuFadein -> done
        this._menuFadeTimer = 0;
    };

    var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        this._commandWindow.opacity = 0;
        this._commandWindow.contentsOpacity = 0;
        this._commandWindow.deactivate();
    };

    var _Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_Title_update.call(this);
        this.updateLogoPopup();
    };

    Scene_Title.prototype.updateLogoPopup = function() {
        if (!this._backSprite2 || this._logoPopupPhase === 'done') return;

        if (this._logoPopupPhase === 'waiting') {
            this._logoPopupTimer++;
            if (this._logoPopupTimer >= DELAY_FRAMES) {
                this._logoPopupTimer = 0;
                this._logoPopupPhase = 'popping';
            }
            return;
        }

        if (this._logoPopupPhase === 'popping') {
            this._logoPopupTimer++;
            var t = Math.min(this._logoPopupTimer / POP_DURATION, 1);
            var eased = this.logoPopupEase(t);

            var scale = START_SCALE + (1 - START_SCALE) * eased;
            this._backSprite2.scale.x = scale;
            this._backSprite2.scale.y = scale;

            if (FADE_TOGETHER) {
                this._backSprite2.opacity = Math.round(255 * eased);
            }

            if (t >= 1) {
                this._backSprite2.scale.x = 1;
                this._backSprite2.scale.y = 1;
                this._backSprite2.opacity = 255;
                this._logoPopupPhase = 'menuFadein';
                this._menuFadeTimer = 0;
            }
            return;
        }

        if (this._logoPopupPhase === 'menuFadein') {
            if (!this._commandWindow) {
                this._logoPopupPhase = 'done';
                return;
            }
            this._menuFadeTimer++;
            var mt = Math.min(this._menuFadeTimer / MENU_FADEIN_FRAMES, 1);
            var op = Math.round(255 * mt);
            this._commandWindow.opacity = op;
            this._commandWindow.contentsOpacity = op;

            if (mt >= 1) {
                this._commandWindow.activate();
                this._logoPopupPhase = 'done';
            }
        }
    };

    // 오버슈트가 살짝 들어간 이징 (통통 튀는 느낌)
    Scene_Title.prototype.logoPopupEase = function(t) {
        var c1 = 1.70158;
        var c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

})();
