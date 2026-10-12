//=============================================================================
// PictureEnglishQuiz.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 사진이 나오고 그 아래에 알맞은 영어를 입력하는 퀴즈 씬.
 * 정답을 맞히면 다음 문제가 이어서 나오며, 몇 문제를 낼지 이벤트에서 정할 수 있습니다.
 * @author ㄹㅅㅁ
 *
 * @param Questions
 * @text 문제 목록
 * @desc 사진 파일명과 정답을 등록하세요. 사진은 img/pictures 폴더에 넣으면 됩니다.
 * @type struct<QuizItem>[]
 * @default []
 *
 * @param Default Count
 * @text 기본 문제 수
 * @desc 플러그인 명령에서 count를 생략했을 때 낼 문제 수
 * @type number
 * @min 1
 * @default 3
 *
 * @param Default Order
 * @text 기본 출제 순서
 * @desc 플러그인 명령에서 order를 생략했을 때의 출제 방식
 * @type select
 * @option 무작위 (목록을 섞어서, 다 나오면 다시 섞음)
 * @value random
 * @option 목록 순서대로
 * @value sequential
 * @default random
 *
 * @param Ignore Case
 * @text 대소문자 무시
 * @desc 켜면 Apple / apple / APPLE 을 모두 정답으로 인정합니다.
 * @type boolean
 * @on 무시함
 * @off 구분함
 * @default true
 *
 * @param Hint After Wrongs
 * @text 힌트가 나오는 오답 횟수
 * @desc 한 문제에서 이 횟수만큼 틀리면 첫 글자와 글자 수 힌트를 보여줍니다. 0이면 힌트 없음
 * @type number
 * @min 0
 * @default 3
 *
 * @param Max Input Length
 * @text 최대 입력 글자 수
 * @type number
 * @min 1
 * @default 30
 *
 * @param Picture Max Scale
 * @text 사진 최대 확대 배율
 * @desc 사진은 영역에 맞춰 줄어들며, 작은 사진은 이 배율까지만 확대됩니다. (1 = 확대 안 함)
 * @type number
 * @decimals 1
 * @min 0.1
 * @default 1
 *
 * @param Allow Cancel
 * @text ESC로 중도 포기 허용
 * @desc 켜면 ESC 키로 퀴즈를 중간에 나갈 수 있습니다. (이때는 완료 스위치/공통 이벤트가 실행되지 않음)
 * @type boolean
 * @on 허용
 * @off 불가
 * @default false
 *
 * @param Correct SE
 * @text 정답 효과음
 * @desc 정답을 맞혔을 때 재생할 효과음 (audio/se 기준, 확장자 제외)
 * @default Bell3
 *
 * @param Complete SE
 * @text 완료 효과음
 * @desc 마지막 문제까지 맞혔을 때 재생할 효과음
 * @default Item3
 *
 * @param Question Format
 * @text 문제 번호 문구
 * @desc %1 = 현재 번호, %2 = 전체 문제 수
 * @default 문제 %1 / %2
 *
 * @param Prompt Text
 * @text 안내 문구
 * @default 사진을 보고 알맞은 영어를 입력하세요
 *
 * @param Correct Text
 * @text 정답 문구
 * @default 정답!
 *
 * @param Wrong Text
 * @text 오답 문구
 * @default 틀렸어요! 다시 해보세요
 *
 * @param Complete Text
 * @text 완료 문구
 * @default 퀴즈 완료!
 *
 * @param Hint Format
 * @text 힌트 문구
 * @desc %1 = 힌트 글자(첫 글자 + 밑줄)
 * @default 힌트 : %1
 *
 * @param Button Text
 * @text 확인 버튼 문구
 * @default 확인
 *
 * @help
 * =============================================================================
 * 준비
 * =============================================================================
 * 1) 이 파일을 js/plugins 폴더에 PictureEnglishQuiz.js 이름 그대로 넣으세요.
 * 2) 퀴즈에 쓸 사진을 img/pictures 폴더에 넣으세요. (png / jpg 등)
 *    크기는 상관없고, 화면 영역에 맞춰 자동으로 줄어듭니다.
 * 3) 플러그인 관리에서 [문제 목록]을 열고 문제를 추가하세요.
 *      사진  : 사진 파일명 (확장자 제외)
 *      정답  : 영어 정답. 정답이 여러 개면 | 로 구분  (예: tv|television)
 *      그룹  : (선택) 문제를 묶는 이름. 예: fruit, animal
 *    ※ 문제 목록 편집은 RPG Maker MV 1.5.0 이상에서 지원됩니다.
 *
 * =============================================================================
 * 사용법 (이벤트 [플러그인 명령])
 * =============================================================================
 *   PictureEnglishQuiz_Start count:5
 *
 * 옵션 (전부 생략 가능, 순서 상관없음):
 *   count:5        낼 문제 수. 정답을 맞힐 때마다 다음 문제가 이어서 나오고,
 *                  5문제를 모두 맞히면 끝납니다. count:all 이면 목록 전체.
 *                  문제 수가 목록보다 많으면 목록이 다시 섞여 반복됩니다.
 *   group:fruit    해당 그룹 이름의 문제들만 출제
 *   order:random   무작위 출제   (order:seq 는 목록 순서대로)
 *   switch:10      퀴즈를 모두 끝내면 10번 스위치를 ON
 *   variable:3     퀴즈 중 틀린 횟수 합계를 3번 변수에 저장
 *   common:12      퀴즈 종료 직후 12번 공통 이벤트 실행
 *
 * 예시)
 *   PictureEnglishQuiz_Start count:5 group:fruit switch:20 variable:5
 *
 * =============================================================================
 * 진행 방식
 * =============================================================================
 *  - 키보드로 영어를 입력하고 Enter(또는 [확인] 버튼 클릭)로 제출합니다.
 *  - 한/영 상태와 상관없이 영어 알파벳으로 입력됩니다.
 *  - Backspace로 지울 수 있습니다.
 *  - 틀리면 입력 칸이 흔들리고, 맞힐 때까지 같은 문제가 유지됩니다.
 *  - 정답이면 다음 문제로 넘어가고, 마지막 문제까지 맞히면 맵으로 돌아갑니다.
 *  - 입력 가능 문자: 영문자, 숫자, 띄어쓰기, 하이픈(-), 아포스트로피('), 마침표(.)
 *
 * 라이선스: 자유롭게 수정/배포 가능
 * =============================================================================
 */

/*~struct~QuizItem:
 * @param Picture
 * @text 사진
 * @desc img/pictures 안의 사진 파일 (확장자 제외)
 * @type file
 * @dir img/pictures/
 * @require 1
 *
 * @param Answer
 * @text 정답
 * @desc 영어 정답. 정답이 여러 개면 | 로 구분 (예: tv|television)
 * @type text
 *
 * @param Group
 * @text 그룹 (선택)
 * @desc 문제를 묶는 이름. 플러그인 명령의 group: 으로 골라 낼 수 있습니다. (띄어쓰기 없이)
 * @type text
 */

(function() {

    var pluginName = 'PictureEnglishQuiz';
    var parameters = PluginManager.parameters(pluginName);

    //-------------------------------------------------------------------------
    // Parameters
    //-------------------------------------------------------------------------
    function toNum(value, defaultValue) {
        if (value === undefined || value === '') return defaultValue;
        var n = Number(value);
        return isNaN(n) ? defaultValue : n;
    }

    function toBool(value, defaultValue) {
        if (value === undefined || value === '') return defaultValue;
        return String(value) === 'true';
    }

    function parseItems(raw) {
        var list = [];
        var arr;
        try {
            arr = JSON.parse(raw || '[]');
        } catch (e) {
            console.error('[' + pluginName + '] 문제 목록을 읽지 못했습니다.', e);
            return list;
        }
        arr.forEach(function(entry) {
            try {
                var o = (typeof entry === 'string') ? JSON.parse(entry) : entry;
                var picture = String(o['Picture'] || '').trim();
                var answers = String(o['Answer'] || '').split('|').map(function(s) {
                    return s.replace(/\s+/g, ' ').trim();
                }).filter(function(s) { return s.length > 0; });
                var group = String(o['Group'] || '').trim();
                if (picture && answers.length > 0) {
                    list.push({ picture: picture, answers: answers, group: group });
                }
            } catch (e) {
                console.error('[' + pluginName + '] 문제 항목을 읽지 못했습니다.', e);
            }
        });
        return list;
    }

    var items          = parseItems(parameters['Questions']);
    var defaultCount   = Math.max(1, Math.floor(toNum(parameters['Default Count'], 3)));
    var defaultOrder   = String(parameters['Default Order'] || 'random');
    var ignoreCase     = toBool(parameters['Ignore Case'], true);
    var hintAfter      = Math.max(0, Math.floor(toNum(parameters['Hint After Wrongs'], 3)));
    var maxInputLength = Math.max(1, Math.floor(toNum(parameters['Max Input Length'], 30)));
    var pictureMaxScale = Math.max(0.1, toNum(parameters['Picture Max Scale'], 1));
    var allowCancel    = toBool(parameters['Allow Cancel'], false);
    var correctSE      = String(parameters['Correct SE'] || '');
    var completeSE     = String(parameters['Complete SE'] || '');
    var questionFormat = String(parameters['Question Format'] || '문제 %1 / %2');
    var promptText     = String(parameters['Prompt Text'] || '사진을 보고 알맞은 영어를 입력하세요');
    var correctText    = String(parameters['Correct Text'] || '정답!');
    var wrongText      = String(parameters['Wrong Text'] || '틀렸어요! 다시 해보세요');
    var completeText   = String(parameters['Complete Text'] || '퀴즈 완료!');
    var hintFormat     = String(parameters['Hint Format'] || '힌트 : %1');
    var buttonText     = String(parameters['Button Text'] || '확인');

    //-------------------------------------------------------------------------
    // Utilities
    //-------------------------------------------------------------------------
    function normalize(s) {
        s = String(s).replace(/\s+/g, ' ').trim();
        return ignoreCase ? s.toLowerCase() : s;
    }

    function isCorrect(item, input) {
        var t = normalize(input);
        if (t === '') return false;
        return item.answers.some(function(a) { return normalize(a) === t; });
    }

    function makeHint(answer) {
        return answer.split('').map(function(c, i) {
            if (c === ' ') return ' ';
            return i === 0 ? c : '_';
        }).join(' ');
    }

    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    // 출제 목록 만들기: count 개를 뽑되, 한 바퀴를 다 돌기 전에는 같은 문제가 나오지 않음
    function buildQueue(pool, count, order) {
        var queue = [];
        var bag = [];
        var last = null;
        while (queue.length < count) {
            if (bag.length === 0) {
                bag = pool.slice();
                if (order === 'random') {
                    shuffle(bag);
                    // 새 바퀴가 시작될 때 직전 문제가 바로 또 나오지 않도록
                    if (pool.length > 1 && last && bag[0] === last) {
                        var tmp = bag[0];
                        bag[0] = bag[bag.length - 1];
                        bag[bag.length - 1] = tmp;
                    }
                }
            }
            last = bag.shift();
            queue.push(last);
        }
        return queue;
    }

    // 키 입력 -> 문자. 한/영 상태와 상관없이 영문자가 입력되도록 물리 키(code)로도 판정
    function keyToChar(e) {
        var key = e.key;
        if (key && key.length === 1 && /[A-Za-z0-9 '\-\.]/.test(key)) return key;

        var code = e.code || '';
        var caps = !!(e.getModifierState && e.getModifierState('CapsLock'));
        var upper = !!e.shiftKey !== caps;
        var m = /^Key([A-Z])$/.exec(code);
        if (m) return upper ? m[1] : m[1].toLowerCase();
        m = /^(?:Digit|Numpad)([0-9])$/.exec(code);
        if (m) return e.shiftKey ? '' : m[1];
        if (e.shiftKey) return '';
        if (code === 'Space') return ' ';
        if (code === 'Minus') return '-';
        if (code === 'Quote') return "'";
        if (code === 'Period') return '.';
        return '';
    }

    //-------------------------------------------------------------------------
    // Plugin Command
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command !== 'PictureEnglishQuiz_Start') return;

        var countArg = null;
        var group = '';
        var order = defaultOrder;
        var switchId = 0;
        var variableId = 0;
        var commonId = 0;

        args.forEach(function(arg) {
            var idx = arg.indexOf(':');
            if (idx < 0) return;
            var key = arg.substring(0, idx).toLowerCase();
            var val = arg.substring(idx + 1);
            if (key === 'count') {
                countArg = val;
            } else if (key === 'group') {
                group = val;
            } else if (key === 'order') {
                order = (val.toLowerCase() === 'random') ? 'random' : 'sequential';
            } else if (key === 'switch') {
                switchId = Number(val) || 0;
            } else if (key === 'variable') {
                variableId = Number(val) || 0;
            } else if (key === 'common') {
                commonId = Number(val) || 0;
            }
        });

        var pool = items.filter(function(q) { return !group || q.group === group; });
        if (pool.length === 0) {
            console.error('[' + pluginName + '] 출제할 문제가 없습니다.' +
                (group ? ' (그룹 "' + group + '" 에 해당하는 문제 없음)' : ' (문제 목록이 비어 있음)'));
            return;
        }

        var count = defaultCount;
        if (countArg !== null) {
            if (countArg.toLowerCase() === 'all') {
                count = pool.length;
            } else {
                count = Math.max(1, Math.floor(Number(countArg) || defaultCount));
            }
        }

        var opts = {
            switchId: switchId,
            variableId: variableId,
            commonId: commonId
        };
        SceneManager.push(Scene_PictureEnglishQuiz);
        SceneManager.prepareNextScene(this, opts, buildQueue(pool, count, order));
    };

    //=============================================================================
    // Scene_PictureEnglishQuiz
    //=============================================================================
    function Scene_PictureEnglishQuiz() {
        this.initialize.apply(this, arguments);
    }

    Scene_PictureEnglishQuiz.prototype = Object.create(Scene_Base.prototype);
    Scene_PictureEnglishQuiz.prototype.constructor = Scene_PictureEnglishQuiz;

    Scene_PictureEnglishQuiz.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._interpreter = null;
        this._opts = null;
        this._queue = [];
        this._index = 0;
        this._current = null;
        this._text = '';
        this._state = 'input';     // input / correct / done
        this._frameState = 'normal'; // normal / ng / ok
        this._timer = 0;
        this._shake = 0;
        this._wrongCount = 0;
        this._totalWrong = 0;
        this._dirty = true;
        this._cursorTimer = 0;
        this._showCursor = true;
        this._picErrorShown = false;
        this._closing = false;
        this._popped = false;
        this._keyHandler = null;
    };

    Scene_PictureEnglishQuiz.prototype.prepare = function(interpreter, opts, queue) {
        this._interpreter = interpreter;
        this._opts = opts;
        this._queue = queue;
    };

    Scene_PictureEnglishQuiz.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.calcLayout();
        this.createBackground();
        this.createHeader();
        this.createPictureArea();
        this.createPanel();
    };

    Scene_PictureEnglishQuiz.prototype.calcLayout = function() {
        var W = Graphics.boxWidth;
        var H = Graphics.boxHeight;
        var margin = 48;
        this._W = W;
        this._H = H;
        this._areaX = margin;
        this._areaY = 64;
        this._areaW = W - margin * 2;
        this._panelH = 176;
        this._panelY = H - this._panelH;
        this._areaH = this._panelY - this._areaY - 8;
        this._buttonW = 96;
        this._inputH = 56;
        this._inputW = Math.min(560, W - margin * 2 - this._buttonW - 16);
        this._inputX = Math.floor((W - (this._inputW + 12 + this._buttonW)) / 2);
    };

    Scene_PictureEnglishQuiz.prototype.createTextSprite = function(x, y, w, h) {
        var sprite = new Sprite(new Bitmap(w, h));
        sprite.x = x;
        sprite.y = y;
        this.addChild(sprite);
        return sprite;
    };

    Scene_PictureEnglishQuiz.prototype.drawLine = function(sprite, text, color, size, align) {
        var b = sprite.bitmap;
        b.clear();
        b.textColor = color;
        b.fontSize = size;
        b.drawText(text, 0, 0, b.width, b.height, align || 'center');
    };

    Scene_PictureEnglishQuiz.prototype.createBackground = function() {
        var bmp = new Bitmap(this._W, this._H);
        bmp.gradientFillRect(0, 0, this._W, this._H, '#1c2340', '#0b0f24', true);
        this._backSprite = new Sprite(bmp);
        this.addChild(this._backSprite);
    };

    Scene_PictureEnglishQuiz.prototype.createHeader = function() {
        this._headerSprite = this.createTextSprite(0, 14, this._W, 40);
    };

    Scene_PictureEnglishQuiz.prototype.createPictureArea = function() {
        var w = this._areaW;
        var h = this._areaH;
        var frame = new Bitmap(w, h);
        frame.fillRect(0, 0, w, h, '#7f8cff');
        frame.fillRect(2, 2, w - 4, h - 4, '#12172f');
        var frameSprite = new Sprite(frame);
        frameSprite.x = this._areaX;
        frameSprite.y = this._areaY;
        this.addChild(frameSprite);

        this._picSprite = new Sprite();
        this._picSprite.anchor.x = 0.5;
        this._picSprite.anchor.y = 0.5;
        this._picSprite.x = this._areaX + Math.floor(w / 2);
        this._picSprite.y = this._areaY + Math.floor(h / 2);
        this.addChild(this._picSprite);
    };

    Scene_PictureEnglishQuiz.prototype.createPanel = function() {
        var py = this._panelY;

        this._promptSprite = this.createTextSprite(0, py, this._W, 34);
        this.drawLine(this._promptSprite, promptText, '#cfd6ff', 22);

        this._inputSprite = this.createTextSprite(this._inputX, py + 40, this._inputW, this._inputH);
        this._inputBaseX = this._inputX;

        var bw = this._buttonW;
        var bh = this._inputH;
        var bmp = new Bitmap(bw, bh);
        bmp.fillRect(0, 0, bw, bh, '#4a55c8');
        bmp.fillRect(2, 2, bw - 4, bh - 4, '#6a77f2');
        bmp.textColor = '#ffffff';
        bmp.fontSize = 24;
        bmp.drawText(buttonText, 0, 0, bw, bh, 'center');
        this._button = new Sprite(bmp);
        this._button.x = this._inputX + this._inputW + 12;
        this._button.y = py + 40;
        this.addChild(this._button);

        this._statusSprite = this.createTextSprite(0, py + 104, this._W, 34);
        this._hintSprite = this.createTextSprite(0, py + 138, this._W, 34);
    };

    Scene_PictureEnglishQuiz.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(this.fadeSpeed(), false);
        this.setupQuestion(0);
        this._keyHandler = this.onKeyDown.bind(this);
        document.addEventListener('keydown', this._keyHandler);
    };

    Scene_PictureEnglishQuiz.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
    };

    //-------------------------------------------------------------------------
    // 문제 진행
    //-------------------------------------------------------------------------
    Scene_PictureEnglishQuiz.prototype.setupQuestion = function(index) {
        this._index = index;
        this._current = this._queue[index];
        this._text = '';
        this._wrongCount = 0;
        this._state = 'input';
        this._frameState = 'normal';
        this._picErrorShown = false;

        var self = this;
        var bmp = ImageManager.loadPicture(this._current.picture);
        this._picSprite.bitmap = bmp;
        this._picSprite.opacity = 0;
        this._picSprite.scale.x = 1;
        this._picSprite.scale.y = 1;
        bmp.addLoadListener(function() {
            if (self._picSprite.bitmap === bmp) self.fitPicture();
        });

        var header = questionFormat.replace('%1', String(index + 1)).replace('%2', String(this._queue.length));
        this.drawLine(this._headerSprite, header, '#ffffff', 28);
        this.setStatus('', '#ffffff');
        this.refreshHint();
        this._dirty = true;
    };

    Scene_PictureEnglishQuiz.prototype.fitPicture = function() {
        var bmp = this._picSprite.bitmap;
        if (!bmp || bmp.width <= 0 || bmp.height <= 0) return;
        var s = Math.min((this._areaW - 16) / bmp.width, (this._areaH - 16) / bmp.height, pictureMaxScale);
        this._picSprite.scale.x = s;
        this._picSprite.scale.y = s;
    };

    Scene_PictureEnglishQuiz.prototype.setStatus = function(text, color) {
        this.drawLine(this._statusSprite, text, color, 26);
    };

    Scene_PictureEnglishQuiz.prototype.refreshHint = function() {
        var text = '';
        if (hintAfter > 0 && this._current && this._wrongCount >= hintAfter) {
            text = hintFormat.replace('%1', makeHint(this._current.answers[0]));
        }
        this.drawLine(this._hintSprite, text, '#ffe27a', 24);
    };

    Scene_PictureEnglishQuiz.prototype.submit = function() {
        if (this._state !== 'input' || this._closing) return;
        if (normalize(this._text) === '') {
            SoundManager.playBuzzer();
            return;
        }
        if (isCorrect(this._current, this._text)) {
            this.onCorrect();
        } else {
            this.onWrong();
        }
    };

    Scene_PictureEnglishQuiz.prototype.onCorrect = function() {
        this._state = 'correct';
        this._frameState = 'ok';
        this.setStatus(correctText, '#7dff9b');
        if (correctSE) {
            AudioManager.playSe({ name: correctSE, volume: 90, pitch: 100, pan: 0 });
        } else {
            SoundManager.playOk();
        }
        this._timer = 45;
        this._dirty = true;
    };

    Scene_PictureEnglishQuiz.prototype.onWrong = function() {
        this._wrongCount++;
        this._totalWrong++;
        this._frameState = 'ng';
        this._shake = 18;
        this._text = '';
        SoundManager.playBuzzer();
        this.setStatus(wrongText, '#ff7b7b');
        this.refreshHint();
        this._dirty = true;
    };

    Scene_PictureEnglishQuiz.prototype.nextQuestion = function() {
        if (this._index + 1 >= this._queue.length) {
            this.finishQuiz();
        } else {
            this.setupQuestion(this._index + 1);
        }
    };

    Scene_PictureEnglishQuiz.prototype.finishQuiz = function() {
        this._state = 'done';
        this.setStatus(completeText, '#ffe27a');
        this.drawLine(this._hintSprite, '', '#ffffff', 24);
        if (completeSE) {
            AudioManager.playSe({ name: completeSE, volume: 90, pitch: 100, pan: 0 });
        }
        this._timer = 60;
    };

    Scene_PictureEnglishQuiz.prototype.closeScene = function(completed) {
        if (this._closing) return;
        this._closing = true;
        if (completed) {
            var opts = this._opts;
            if (opts.switchId > 0) {
                $gameSwitches.setValue(opts.switchId, true);
            }
            if (opts.variableId > 0) {
                $gameVariables.setValue(opts.variableId, this._totalWrong);
            }
            if (opts.commonId > 0 && $dataCommonEvents[opts.commonId] && this._interpreter) {
                this._interpreter.setupChild($dataCommonEvents[opts.commonId].list, 0);
            }
        }
        this.startFadeOut(this.fadeSpeed(), false);
    };

    //-------------------------------------------------------------------------
    // 입력
    //-------------------------------------------------------------------------
    Scene_PictureEnglishQuiz.prototype.onKeyDown = function(e) {
        if (this._closing) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        var code = e.code || '';
        if (code === 'Escape') {
            if (allowCancel) {
                e.preventDefault();
                this.closeScene(false);
            }
            return;
        }
        if (this._state !== 'input') return;

        if (code === 'Enter' || code === 'NumpadEnter') {
            e.preventDefault();
            if (!e.repeat) this.submit();
            return;
        }
        if (code === 'Backspace') {
            e.preventDefault();
            if (this._text.length > 0) {
                this._text = this._text.slice(0, -1);
                this._dirty = true;
            }
            return;
        }

        var ch = keyToChar(e);
        if (!ch) return;
        e.preventDefault();
        if (this._text.length >= maxInputLength) return;
        if (ch === ' ' && (this._text === '' || this._text.slice(-1) === ' ')) return;
        this._text += ch;
        this._cursorTimer = 0;
        this._showCursor = true;
        this._dirty = true;
    };

    //-------------------------------------------------------------------------
    // 갱신
    //-------------------------------------------------------------------------
    Scene_PictureEnglishQuiz.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (this._closing) {
            if (!this.isBusy() && !this._popped) {
                this._popped = true;
                this.popScene();
            }
            return;
        }
        this.updatePicture();
        this.updateCursor();
        this.updateShake();
        this.updateTimer();
        this.updateTouch();
        if (this._dirty) {
            this._dirty = false;
            this.refreshInput();
        }
    };

    Scene_PictureEnglishQuiz.prototype.updatePicture = function() {
        var bmp = this._picSprite.bitmap;
        if (!bmp) return;
        if (bmp.isReady()) {
            if (this._picSprite.opacity < 255) {
                this._picSprite.opacity = Math.min(255, this._picSprite.opacity + 24);
            }
        } else if (typeof bmp.isError === 'function' && bmp.isError() && !this._picErrorShown) {
            this._picErrorShown = true;
            console.error('[' + pluginName + '] 사진을 불러올 수 없습니다: img/pictures/' + this._current.picture);
            this.setStatus('(사진을 불러올 수 없어요 : ' + this._current.picture + ')', '#ff7b7b');
        }
    };

    Scene_PictureEnglishQuiz.prototype.updateCursor = function() {
        if (this._state !== 'input') return;
        this._cursorTimer++;
        var show = Math.floor(this._cursorTimer / 30) % 2 === 0;
        if (show !== this._showCursor) {
            this._showCursor = show;
            this._dirty = true;
        }
    };

    Scene_PictureEnglishQuiz.prototype.updateShake = function() {
        if (this._shake > 0) {
            this._shake--;
            var amp = 8 * (this._shake / 18);
            this._inputSprite.x = this._inputBaseX + Math.round((this._shake % 4 < 2 ? -1 : 1) * amp);
            if (this._shake === 0) {
                this._inputSprite.x = this._inputBaseX;
                this._frameState = 'normal';
                this._dirty = true;
            }
        }
    };

    Scene_PictureEnglishQuiz.prototype.updateTimer = function() {
        if (this._timer > 0) {
            this._timer--;
            if (this._timer === 0) {
                if (this._state === 'correct') {
                    this.nextQuestion();
                } else if (this._state === 'done') {
                    this.closeScene(true);
                }
            }
        }
    };

    Scene_PictureEnglishQuiz.prototype.updateTouch = function() {
        if (!TouchInput.isTriggered() || this._state !== 'input') return;
        var lx = TouchInput.x - this._button.x;
        var ly = TouchInput.y - this._button.y;
        if (lx >= 0 && ly >= 0 && lx < this._buttonW && ly < this._inputH) {
            this.submit();
        }
    };

    Scene_PictureEnglishQuiz.prototype.refreshInput = function() {
        var b = this._inputSprite.bitmap;
        var w = b.width;
        var h = b.height;
        var colors = { normal: '#7f8cff', ng: '#ff5b5b', ok: '#4cd964' };
        b.clear();
        b.fillRect(0, 0, w, h, colors[this._frameState] || colors.normal);
        b.fillRect(3, 3, w - 6, h - 6, '#0b0f24');
        b.textColor = '#ffffff';
        b.fontSize = 30;
        var pad = 16;
        b.drawText(this._text, pad, 0, w - pad * 2, h, 'left');
        if (this._showCursor && this._state === 'input') {
            var tw = b.measureTextWidth(this._text);
            var cx = Math.min(pad + Math.ceil(tw) + 2, w - pad);
            b.fillRect(cx, 12, 3, h - 24, '#ffffff');
        }
    };

})();
