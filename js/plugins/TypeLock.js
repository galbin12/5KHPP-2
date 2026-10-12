//=============================================================================
// TypeLock.js
//=============================================================================

/*:
 * @plugindesc 알맞은 글자를 입력해야 문이 열리는 미니게임 v1.0
 *
 * @param Dim Opacity
 * @text 배경 어둡기
 * @desc 화면이 어두워지는 정도 (0~255)
 * @type number
 * @min 0
 * @max 255
 * @default 150
 *
 * @param Placeholder
 * @text 입력칸 안내문
 * @desc 입력칸이 비어 있을 때 보이는 글자
 * @default 글자를 입력하세요
 *
 * @param Success SE
 * @text 성공 효과음
 * @type file
 * @dir audio/se/
 * @default Decision2
 *
 * @param Fail SE
 * @text 실패 효과음
 * @type file
 * @dir audio/se/
 * @default Buzzer1
 *
 * @param Allow Cancel
 * @text ESC로 취소 허용
 * @type boolean
 * @on 허용
 * @off 금지
 * @default true
 *
 * @help
 * ■ 사용법 (이벤트 > 플러그인 커맨드)
 *
 *   TypeLock 정답 스위치번호
 *   TypeLock 정답 스위치번호 안내문
 *
 *   예) TypeLock 열려라 12
 *       → 12번 스위치가 켜지면 정답 성공
 *
 *   예) TypeLock 문|door A
 *       → '문' 또는 'door' 둘 다 정답, 셀프 스위치 A를 켬
 *
 * ■ 규칙
 *   - 정답이 여러 개면 | 로 구분합니다.
 *   - 띄어쓰기와 영문 대소문자는 구분하지 않습니다.
 *   - 스위치번호 자리에 A, B, C, D를 쓰면 해당 이벤트의 셀프 스위치가 켜집니다.
 *   - 시작할 때 일반 스위치는 OFF로 초기화됩니다.
 *   - 입력 중에는 이벤트가 멈춰 있고, 끝나면 다음 줄이 이어서 실행됩니다.
 *   - 맞히면 스위치 ON, 취소(ESC)하면 OFF 그대로 다음 줄로 넘어갑니다.
 *
 * ■ 문 이벤트 구성 예
 *   페이지1: 플러그인 커맨드  TypeLock 열려라 A
 *   페이지2: 조건 = 셀프 스위치 A ON, 문 열린 그래픽 / 통행 가능
 *   (또는 플러그인 커맨드 뒤에 조건 분기로 스위치를 확인해 장소 이동)
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('TypeLock');
    var dimOpacity  = Number(params['Dim Opacity'] || 150);
    var placeholder = String(params['Placeholder'] || '글자를 입력하세요');
    var successSe   = String(params['Success SE'] || '');
    var failSe      = String(params['Fail SE'] || '');
    var allowCancel = String(params['Allow Cancel'] || 'true') !== 'false';

    function normalize(s) {
        s = String(s);
        if (s.normalize) s = s.normalize('NFC');
        return s.replace(/\s+/g, '').toLowerCase();
    }

    function playSe(name) {
        if (name) AudioManager.playSe({ name: name, volume: 90, pitch: 100, pan: 0 });
    }

    //-------------------------------------------------------------------------
    // Game_Interpreter : 플러그인 커맨드 / 대기
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command !== 'TypeLock') return;
        if (!(SceneManager._scene instanceof Scene_Map)) return;

        var answers = String(args[0] || '').split('|').map(normalize).filter(function(a) {
            return a.length > 0;
        });
        var target = String(args[1] || '');
        var hint = args.slice(2).join(' ');

        if (/^\d+$/.test(target)) {
            $gameSwitches.setValue(Number(target), false);
        }

        $gameTemp._typeLock = {
            answers: answers,
            target: target,
            hint: hint,
            mapId: this._mapId,
            eventId: this._eventId
        };
        this.setWaitMode('typelock');
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'typelock') {
            if ($gameTemp._typeLock) return true;
            this._waitMode = '';
            return false;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //-------------------------------------------------------------------------
    // Scene_Map : 어두운 배경 + 입력칸
    //-------------------------------------------------------------------------
    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if ($gameTemp._typeLock && !this._typeLockDim) {
            this.startTypeLock();
        }
        if (this._typeLockDim) {
            this.updateTypeLock();
        }
    };

    var _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        this.removeTypeLockInput();
        _Scene_Map_terminate.call(this);
    };

    Scene_Map.prototype.startTypeLock = function() {
        var data = $gameTemp._typeLock;
        var self = this;

        // 어두운 배경
        var dim = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        dim.bitmap.fillAll('#000000');
        dim.opacity = 0;
        this.addChild(dim);
        this._typeLockDim = dim;
        this._typeLockClosing = false;

        // 입력칸
        var input = document.createElement('input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.placeholder = data.hint || placeholder;
        var st = input.style;
        st.position = 'fixed';
        st.zIndex = '20';
        st.boxSizing = 'border-box';
        st.background = 'rgba(0, 0, 0, 0.75)';
        st.color = '#ffffff';
        st.border = '2px solid #ffffff';
        st.borderRadius = '6px';
        st.outline = 'none';
        st.textAlign = 'center';
        st.fontFamily = 'GameFont, sans-serif';
        document.body.appendChild(input);
        this._typeLockInput = input;
        this.layoutTypeLock();

        // 게임 키 입력(방향키/Z 등)이 입력칸에 간섭하지 않도록 차단
        input.addEventListener('keydown', function(e) {
            e.stopPropagation();
            if (e.key === 'Escape' && allowCancel) {
                e.preventDefault();
                self.closeTypeLock();
            }
        });
        input.addEventListener('keypress', function(e) { e.stopPropagation(); });

        // 한글 조합이 끝난 뒤 확정되도록 keyup 에서 엔터 처리
        input.addEventListener('keyup', function(e) {
            if (e.key === 'Enter' && !e.isComposing) {
                self.submitTypeLock();
            }
        });

        // 포커스 유지
        input.addEventListener('blur', function() {
            if (self._typeLockInput === input && !self._typeLockClosing) {
                setTimeout(function() { input.focus(); }, 0);
            }
        });
        input.focus();
    };

    Scene_Map.prototype.layoutTypeLock = function() {
        var input = this._typeLockInput;
        if (!input || !Graphics._canvas) return;
        var rect = Graphics._canvas.getBoundingClientRect();
        var scale = rect.width / Graphics.width;
        var w = 360 * scale;
        var h = 48 * scale;
        input.style.width = w + 'px';
        input.style.height = h + 'px';
        input.style.fontSize = (26 * scale) + 'px';
        input.style.left = (rect.left + (rect.width - w) / 2) + 'px';
        input.style.top = (rect.top + rect.height - h - 72 * scale) + 'px';
    };

    Scene_Map.prototype.updateTypeLock = function() {
        var dim = this._typeLockDim;
        if (this._typeLockClosing) {
            dim.opacity -= 25;
            if (dim.opacity <= 0) {
                this.removeChild(dim);
                this._typeLockDim = null;
                this._typeLockClosing = false;
                Input.clear();
                $gameTemp._typeLock = null; // 이벤트 재개
            }
        } else {
            if (dim.opacity < dimOpacity) {
                dim.opacity = Math.min(dim.opacity + 20, dimOpacity);
            }
            this.layoutTypeLock();
        }
    };

    Scene_Map.prototype.submitTypeLock = function() {
        var data = $gameTemp._typeLock;
        var input = this._typeLockInput;
        if (!data || !input || this._typeLockClosing) return;

        var value = normalize(input.value);
        if (!value) return; // 빈 입력은 무시

        if (data.answers.indexOf(value) >= 0) {
            this.applyTypeLockSuccess(data);
            playSe(successSe);
            this.closeTypeLock();
        } else {
            playSe(failSe);
            input.value = '';
            input.style.borderColor = '#ff5555';
            if (input.animate) {
                input.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(-6px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 260 });
            }
            setTimeout(function() { input.style.borderColor = '#ffffff'; }, 350);
        }
    };

    Scene_Map.prototype.applyTypeLockSuccess = function(data) {
        var t = data.target;
        if (/^[A-Da-d]$/.test(t)) {
            $gameSelfSwitches.setValue([data.mapId, data.eventId, t.toUpperCase()], true);
        } else if (/^\d+$/.test(t)) {
            $gameSwitches.setValue(Number(t), true);
        }
    };

    Scene_Map.prototype.removeTypeLockInput = function() {
        var input = this._typeLockInput;
        if (input) {
            this._typeLockInput = null;
            if (input.parentNode) input.parentNode.removeChild(input);
        }
    };

    Scene_Map.prototype.closeTypeLock = function() {
        if (this._typeLockClosing) return;
        this._typeLockClosing = true;
        this.removeTypeLockInput();
    };

})();
