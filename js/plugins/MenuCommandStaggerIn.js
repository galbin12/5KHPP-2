//=============================================================================
// MenuCommandStaggerIn.js
//=============================================================================

/*:
 * @plugindesc 메인 메뉴를 열면 커맨드 항목이 위에서 아래로 차례대로 슬라이드 인
 * 되고, 항목이 나올 때마다 효과음이 납니다. (MenuCommandForceStyle 전용 보조)
 * @author RS
 *
 * @param Start Delay
 * @desc 메뉴가 열린 뒤 첫 항목이 나오기까지 대기 프레임 (60=1초)
 * @default 12
 *
 * @param Item Interval
 * @desc 항목과 항목 사이 등장 간격 (프레임). 작을수록 쭈루룩 빨라짐
 * @default 6
 *
 * @param Slide Duration
 * @desc 항목 하나가 슬라이드 인 되는 데 걸리는 시간 (프레임)
 * @default 16
 *
 * @param Slide Distance
 * @desc 항목이 시작하는 위치가 최종 위치보다 왼쪽으로 얼마나 떨어져 있는지 (px)
 * @default 90
 *
 * @param Flash Effect
 * @desc 항목이 나타날 때 하얗게 번쩍이는 효과 (true / false)
 * @default true
 *
 * @param Only From Map
 * @desc true면 맵에서 메뉴를 열 때만 연출 (아이템/스킬 등에서 돌아올 땐 생략)
 * @default true
 *
 * @param SE Name
 * @desc 항목마다 재생할 효과음 (audio/se 폴더, 확장자 제외). 비우면 무음
 * @default Cursor2
 *
 * @param SE Volume
 * @default 80
 *
 * @param SE Pitch
 * @desc 첫 항목의 피치
 * @default 90
 *
 * @param SE Pitch Step
 * @desc 항목이 내려갈 때마다 피치가 올라가는 양. 0이면 모두 같은 음
 * @default 6
 *
 * @param SE Pan
 * @default 0
 *
 * @help
 * 플러그인 목록에서 MenuCommandForceStyle.js 보다 "아래"에 배치하세요.
 * (이 플러그인은 ForceStyle이 그린 메뉴 항목을 그대로 가져다 연출만 입힘)
 *
 * 연출이 진행되는 동안(약 1초)에는 메뉴 입력이 잠깁니다.
 * 효과음은 SE Pitch Step 덕분에 항목이 내려갈수록 음이 올라가
 * "도-레-미-파" 느낌으로 쭈루룩 나옵니다.
 *
 * 효과음 파일은 audio/se 폴더에 있어야 합니다.
 * 기본 에셋 예: Cursor1~3, Decision1~3
 */

(function() {

    var params = PluginManager.parameters('MenuCommandStaggerIn');
    var startDelay    = Number(params['Start Delay'] || 12);
    var itemInterval  = Number(params['Item Interval'] || 6);
    var slideDuration = Math.max(1, Number(params['Slide Duration'] || 16));
    var slideDistance = Number(params['Slide Distance'] || 90);
    var flashEffect   = String(params['Flash Effect']).toLowerCase() !== 'false';
    var onlyFromMap   = String(params['Only From Map']).toLowerCase() !== 'false';
    var seName   = String(params['SE Name'] === undefined ? 'Cursor2' : params['SE Name']);
    var seVolume = Number(params['SE Volume'] || 80);
    var sePitch  = Number(params['SE Pitch'] || 90);
    var sePitchStep = Number(params['SE Pitch Step'] || 0);
    var sePan    = Number(params['SE Pan'] || 0);

    //-----------------------------------------------------------------------
    // Window_MenuCommand
    //-----------------------------------------------------------------------

    // 연출 중에는 입력(커서 이동/확정/취소/터치)을 막음
    var _Window_MenuCommand_isOpenAndActive = Window_MenuCommand.prototype.isOpenAndActive;
    Window_MenuCommand.prototype.isOpenAndActive = function() {
        if (this._stagger) return false;
        return _Window_MenuCommand_isOpenAndActive.call(this);
    };

    // 이미 그려진 contents를 항목별로 잘라낸 스프라이트를 만들고,
    // 본체 contents는 숨겨둔 채로 스프라이트를 하나씩 등장시킴
    Window_MenuCommand.prototype.startStagger = function() {
        var n = this.maxItems();
        if (n <= 0) return;
        var st = { frame: 0, sprites: [], played: [] };
        for (var i = 0; i < n; i++) {
            var rect = this.itemRect(i);
            var sp = new Sprite(this.contents);
            sp.setFrame(rect.x, rect.y, rect.width, rect.height);
            sp._staggerRect = rect;
            sp._baseX = this.padding + rect.x;
            sp.x = sp._baseX - slideDistance;
            sp.y = this.padding + rect.y;
            sp.alpha = 0;
            sp.visible = false;
            this.addChild(sp);
            st.sprites.push(sp);
            st.played.push(false);
        }
        this._stagger = st;
        this.contentsOpacity = 0;
    };

    Window_MenuCommand.prototype.playStaggerSe = function(index) {
        if (!seName) return;
        var pitch = Math.max(50, Math.min(150, sePitch + sePitchStep * index));
        AudioManager.playSe({ name: seName, volume: seVolume, pitch: pitch, pan: sePan });
    };

    Window_MenuCommand.prototype.updateStagger = function() {
        var st = this._stagger;
        if (!st) return;
        st.frame++;
        var allDone = true;
        for (var i = 0; i < st.sprites.length; i++) {
            var sp = st.sprites[i];

            // 중간에 contents가 새로 만들어졌으면(refresh) 다시 연결
            if (sp.bitmap !== this.contents) {
                sp.bitmap = this.contents;
                var r = sp._staggerRect;
                sp.setFrame(r.x, r.y, r.width, r.height);
            }

            var t = st.frame - (startDelay + i * itemInterval);
            if (t < 0) {
                allDone = false;
                continue;
            }
            if (!st.played[i]) {
                st.played[i] = true;
                this.playStaggerSe(i);
            }
            var p = Math.min(1, t / slideDuration);
            var e = 1 - Math.pow(1 - p, 3); // easeOutCubic
            sp.visible = true;
            sp.alpha = e;
            sp.x = sp._baseX - slideDistance * (1 - e);
            if (flashEffect) {
                var f = Math.round(220 * Math.pow(1 - p, 2));
                sp.setBlendColor([255, 255, 255, f]);
            }
            if (p < 1) allDone = false;
        }
        if (allDone) this.endStagger();
    };

    Window_MenuCommand.prototype.endStagger = function() {
        var st = this._stagger;
        if (!st) return;
        for (var i = 0; i < st.sprites.length; i++) {
            var sp = st.sprites[i];
            this.removeChild(sp);
            sp.bitmap = null;
        }
        this._stagger = null;
        this.contentsOpacity = 255;
    };

    var _Window_MenuCommand_update = Window_MenuCommand.prototype.update;
    Window_MenuCommand.prototype.update = function() {
        _Window_MenuCommand_update.call(this);
        this.updateStagger();
    };

    //-----------------------------------------------------------------------
    // Scene_Menu
    //-----------------------------------------------------------------------

    var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        if (!onlyFromMap || SceneManager.isPreviousScene(Scene_Map)) {
            this._commandWindow.startStagger();
        }
    };

})();
