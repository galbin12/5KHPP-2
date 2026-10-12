//=============================================================================
// BattlePartyChange.js
//=============================================================================

/*:
 * @plugindesc 전투 중 액터 커맨드 창의 "파티" 명령으로 전투 멤버를 교체합니다. (카드 + 전투 파티원 클릭 UI) v5.0
 * @author ㄹㅅㅁ
 *
 * @param CommandName
 * @text 명령어 이름
 * @desc 전투 커맨드 창(공격/스킬/…)에 표시될 이름입니다.
 * @default 파티
 *
 * @param EnableSwitchId
 * @text 사용 가능 스위치
 * @desc 이 스위치가 ON일 때만 선택 가능합니다. 0이면 항상 사용 가능합니다.
 * @type switch
 * @default 0
 *
 * @param BattleLabel
 * @text 전투 표시
 * @desc 전투 중인 멤버에 표시할 글자
 * @default 전투
 *
 * @param ReserveLabel
 * @text 대기 표시
 * @desc 대기 중인 멤버에 표시할 글자
 * @default 대기
 *
 * @param HelpText
 * @text 안내 문구
 * @desc 카드 아래에 표시할 안내문 (비우면 표시 안 함)
 * @default 위/아래: 멤버 선택  ·  아래 파티원 클릭: 교체
 *
 * @param CloseAfterSwap
 * @text 교체 후 자동으로 닫기
 * @desc true면 한 번 교체하자마자 교체 화면을 닫고 전투로 돌아갑니다.
 * @type boolean
 * @default false
 *
 * @param MaxBattleMembers
 * @text 전투 파티원 최대 인원
 * @desc 전투에 나가는 파티원의 최대 인원입니다. 전투 중에만 적용되고, 맵에서는
 * 엔진 값(파티 전체)이 유지됩니다. (0이면 제한 없이 엔진 값 그대로)
 * @type number
 * @min 0
 * @default 4
 *
 * @param RestoreOrderAfterBattle
 * @text 전투 후 순서 복구
 * @desc true면 전투가 끝났을 때 파티 순서를 전투 시작 전 순서로 되돌립니다.
 * (전투 중 "파티" 명령으로 바꾼 순서는 그 전투 안에서만 유지)
 * @type boolean
 * @default true
 *
 * @param Panel Width
 * @text 카드 너비
 * @default 558
 *
 * @param Panel Height
 * @text 카드 높이
 * @default 205
 *
 * @param Panel Y
 * @text 카드 Y 위치
 * @desc 화면 위에서부터의 위치 (가로는 화면 가운데 정렬)
 * @default 163
 *
 * @param Panel X Offset
 * @text 카드 X 보정
 * @desc 가운데에서 좌우로 밀 픽셀 (음수 = 왼쪽)
 * @default 0
 *
 * @param Font Size
 * @text 이름 글자 크기
 * @desc 카드의 이름/Lv 글자 크기
 * @default 44
 *
 * @param Stat Font Size
 * @text HP/TP 글자 크기
 * @desc 카드의 HP/TP 글자 크기 (숫자는 이보다 조금 더 작게 표시됩니다)
 * @default 28
 *
 * @param Face Size
 * @text 카드 얼굴 크기
 * @desc 카드 오른쪽 얼굴 그림을 그릴 한 변 길이(픽셀)
 * @default 180
 *
 * @param Label Color Index
 * @text 라벨 색 번호
 * @desc HP/TP/Lv 글자 색 (윈도우스킨 색 번호, 0 = 흰색)
 * @default 0
 *
 * @param Darken Alpha
 * @text 배경 어둡게 (0~1)
 * @desc 교체 화면이 열려 있는 동안 전투 화면을 어둡게 (0이면 안 어둡게)
 * @default 0
 *
 * @param Blur Strength
 * @text 배경 블러 강도
 * @desc 교체 화면이 열려 있는 동안 전투 화면 블러 (0이면 블러 없음)
 * @default 0
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 전투 중 액터 커맨드 창(공격 / 스킬 / … / 도망)에 "파티" 명령이 추가됩니다.
 * (이 프로젝트는 SkipPartyCommand.js 때문에 파티 커맨드 창이 없으므로
 *  액터 커맨드 창에 넣었습니다.)
 *
 * "파티"를 고르면 커맨드 창이 사라지고 아래 화면이 뜹니다.
 *
 *   [위쪽 검은 카드]  투입할(바꿔 넣을) 멤버
 *                     왼쪽: 이름 Lv / HP / TP      오른쪽: 얼굴
 *   [카드 아래 글씨]  전투(또는 대기) 번호/전체 + 안내 문구
 *   [아래쪽]          평소 전투 화면 아래에 보이던 "현재 전투 파티원" 상태창
 *                     (얼굴/이름/HP/TP). 선택된 파티원 칸이 밝게 깜빡입니다.
 *
 * 조작
 *   위/아래 방향키, PageUp/PageDown, 마우스 휠 : 위쪽 카드의 멤버 바꾸기
 *   좌/우 방향키 : 아래 파티원 중 깜빡이는 칸 이동
 *   OK : 카드의 멤버와 깜빡이는 칸의 파티원을 바로 교체
 *   아래 파티원을 마우스로 클릭 : 그 파티원과 바로 교체 (선택 + 교체가 한 번에)
 *   취소(X / ESC / 우클릭) : 교체 화면 닫기
 *   (파라미터 "교체 후 자동으로 닫기"를 켜면 교체하자마자 닫힙니다)
 *
 * 규칙
 * - 카드의 멤버가 대기 멤버면 전투 멤버와 교체되고, 전투 멤버면 두 사람의
 *   자리(순서)가 서로 바뀝니다. 카드는 전투 멤버부터 순서대로, 그 뒤에
 *   대기 멤버가 나옵니다.
 * - 전투불능인 대기 멤버는 전투 자리로 들어올 수 없습니다.
 *   (전투불능인 전투 멤버를 대기 멤버로 빼는 것은 가능)
 * - 교체는 턴을 소모하지 않으며, 행동을 입력하는 동안에만 쓸 수 있습니다.
 * - 빠지는 멤버는 전투용 상태이상/버프가 해제되고 입력해 둔 행동이 지워집니다.
 *   새로 들어오는 멤버는 행동을 처음부터 입력해야 합니다.
 *   (자리만 바뀐 멤버가 이미 입력한 행동은 유지됩니다)
 * - 교체 화면을 닫을 때 바뀐 편성이 전투에 적용됩니다.
 * - 전투에 나가는 파티원은 최대 4명입니다. (파라미터 "전투 파티원 최대 인원",
 *   다른 플러그인이 정원을 늘려도 전투 중에는 이 값으로 제한됩니다.
 *   맵에서는 제한하지 않으므로 파티원이 엔진 값만큼 따라다닙니다)
 *
 * ============================================================================
 * 버그 수정 (v2.0 이후 유지)
 * ============================================================================
 * - ESC/X로 교체 창을 닫았을 때 커맨드 창이 안 보이던 문제:
 *   BattleInputWatchdog.js 가 교체 창이 열린 것을 "입력 잠김"으로 오인해
 *   커맨드 창을 닫아버리던 것이 원인이었습니다. 교체 창이 열려 있는 동안
 *   감시를 멈추도록 했고(플러그인 순서와 무관), 닫을 때 커맨드 창을
 *   확실히 다시 열도록 했습니다.
 * - 교체 중에는 ActorStatusClickSelect.js 의 "상태창 클릭 = 커맨드 창 열기"를
 *   잠시 꺼서 클릭이 교체에만 쓰이게 했습니다. (닫으면 자동으로 복구)
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * SkipPartyCommand.js, BattleCommandRestrict.js, ActorCommandOverlay.js 보다
 * "아래(맨 아래쪽)"에 두세요. 그 플러그인들이 만든 커맨드 목록 뒤에 "파티"를
 * 끼워 넣기 때문입니다.
 * BattleStatusEmptySlot.js 가 있으면 교체할 때마다 슬롯 스냅샷을 자동으로
 * 갱신해서 아래 파티원 얼굴이 바로 바뀝니다.
 * 플러그인 파일 이름은 BattlePartyChange.js 여야 합니다.
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('BattlePartyChange');
    function num(name, def) {
        var v = parseFloat(params[name]);
        return isNaN(v) ? def : v;
    }
    var commandName  = String(params['CommandName'] || '파티');
    var enableSwitch = Number(params['EnableSwitchId'] || 0);
    var battleLabel  = String(params['BattleLabel'] || '전투');
    var reserveLabel = String(params['ReserveLabel'] || '대기');
    var helpText     = String(params['HelpText'] === undefined ? '' : params['HelpText']);
    var closeAfterSwap = String(params['CloseAfterSwap'] || 'false') === 'true';
    var maxBattleCap = num('MaxBattleMembers', 4);
    var restoreOrder = String(params['RestoreOrderAfterBattle'] === undefined ? 'true' : params['RestoreOrderAfterBattle']) === 'true';
    var panelWidth   = num('Panel Width', 558);
    var panelHeight  = num('Panel Height', 205);
    var panelY       = num('Panel Y', 163);
    var panelXOffset = num('Panel X Offset', 0);
    var fontSize     = num('Font Size', 44);
    var statFontSize = num('Stat Font Size', 28);
    var faceSize     = num('Face Size', 180);
    var labelColorIx = num('Label Color Index', 0);
    var darkenAlpha  = num('Darken Alpha', 0);
    var blurStrength = num('Blur Strength', 0);

    // 전투 파티원은 전투 중에만 최대 maxBattleCap 명 (기본 4명).
    // 전투 밖(맵, 메뉴 등)에서는 엔진 원래 값(예: 7명)을 그대로 씀.
    // 전투 자리 수를 쓰는 모든 곳(상태창 칸 수, 이 플러그인의 교체 화면 등)이
    // 전투 중에는 같은 값을 보게 됨.
    function inBattleScene() {
        return SceneManager._scene instanceof Scene_Battle;
    }
    if (maxBattleCap > 0) {
        var _Game_Party_maxBattleMembers = Game_Party.prototype.maxBattleMembers;
        Game_Party.prototype.maxBattleMembers = function() {
            var v = _Game_Party_maxBattleMembers.call(this);
            return inBattleScene() ? Math.min(v, maxBattleCap) : v;
        };
    }

    // 팔로워 수는 게임을 시작할 때 정해져서, 예전에 4명 제한 상태로 만든 세이브는
    // 팔로워가 모자람. 맵에 들어올 때 모자란 만큼만 추가함 (줄이지는 않음).
    function ensureFollowers() {
        if (!$gamePlayer || !$gameParty) return;
        var followers = $gamePlayer.followers();
        if (!followers || !followers._data) return;
        var need = $gameParty.maxBattleMembers() - 1;
        var added = false;
        while (followers._data.length < need) {
            followers._data.push(new Game_Follower(followers._data.length + 1));
            added = true;
        }
        if (added) {
            followers.synchronize($gamePlayer.x, $gamePlayer.y, $gamePlayer.direction());
            $gamePlayer.refresh();
        }
    }

    var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        ensureFollowers();
        _Scene_Map_onMapLoaded.apply(this, arguments);
    };

    // 전투 시작 전 파티 순서를 저장해 두었다가, 전투가 끝나면 그 순서로 되돌림.
    // (전투 중 영입/제외된 멤버는 그대로 두고, 순서만 맞춤)
    if (restoreOrder) {
        var _BattleManager_setup = BattleManager.setup;
        BattleManager.setup = function() {
            _BattleManager_setup.apply(this, arguments);
            this._pcOrderBefore = $gameParty._actors.slice();
        };

        var _BattleManager_endBattle = BattleManager.endBattle;
        BattleManager.endBattle = function() {
            _BattleManager_endBattle.apply(this, arguments);
            this.restorePartyOrderAfterBattle();
        };

        BattleManager.restorePartyOrderAfterBattle = function() {
            var before = this._pcOrderBefore;
            this._pcOrderBefore = null;
            if (!before) return;
            var cur = $gameParty._actors;
            var ordered = [];
            before.forEach(function(id) {
                if (cur.indexOf(id) >= 0) ordered.push(id);
            });
            cur.forEach(function(id) {
                if (ordered.indexOf(id) < 0) ordered.push(id);
            });
            if (ordered.join(',') === cur.join(',')) return;
            $gameParty._actors = ordered;
            if ($gamePlayer) $gamePlayer.refresh();
            if ($gameMap) $gameMap.requestRefresh();
        };
    }

    function isBadNum(v) {
        return typeof v !== 'number' || isNaN(v);
    }

    // 얼굴 애니메이션(Popp_BStatusAnimatedFace)용 값 보정. 이미 정상 값이 있는
    // 파티원은 건드리지 않고, 비어 있는(새로 투입된) 파티원만 0부터 시작시킴.
    function initPartyFaceAnim(actor, statusWindow) {
        if (!actor) return;
        if (isBadNum(actor._motionCount)) actor._motionCount = 0;
        if (isBadNum(actor._pattern)) actor._pattern = 0;
        if (actor._reverse === undefined) actor._reverse = false;
        if (isBadNum(actor._faceMotion)) {
            var idx = $gameParty.battleMembers().indexOf(actor);
            try {
                if (statusWindow && idx >= 0 &&
                    typeof statusWindow.setFaceMotion === 'function') {
                    statusWindow.setFaceMotion(idx);
                }
            } catch (e) { /* 아래에서 기본값 처리 */ }
            if (isBadNum(actor._faceMotion)) actor._faceMotion = 0;
        }
    }

    function isPartyChangeEnabled() {
        if (enableSwitch > 0 && !$gameSwitches.value(enableSwitch)) return false;
        return $gameParty.allMembers().length > 1;
    }

    function isFormationOk(actor) {
        if (!actor) return false;
        if (typeof actor.isFormationChangeOk === 'function') {
            return actor.isFormationChangeOk();
        }
        return true;
    }

    // 얼굴 그림을 원하는 크기(정사각형)로 키워서 그림. token 이 바뀌었으면(그 사이
    // 다시 그려졌으면) 그리지 않음.
    function drawScaledFace(win, actor, x, y, size, token) {
        if (!actor || !actor.faceName()) return;
        var bitmap = ImageManager.loadFace(actor.faceName());
        var index = actor.faceIndex();
        bitmap.addLoadListener(function() {
            if (win._faceToken !== token) return;
            var pw = Window_Base._faceWidth;
            var ph = Window_Base._faceHeight;
            var sx = index % 4 * pw;
            var sy = Math.floor(index / 4) * ph;
            win.contents.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
        });
    }

    //-------------------------------------------------------------------------
    // Window_ActorCommand : "파티" 명령 추가 (도망 앞, 없으면 맨 끝)
    //-------------------------------------------------------------------------
    var _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.call(this);
        if (this._actor) this.addPartyChangeCommand();
    };

    Window_ActorCommand.prototype.addPartyChangeCommand = function() {
        var cmd = { name: commandName, symbol: 'party',
                    enabled: isPartyChangeEnabled(), ext: null };
        var idx = -1;
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].symbol === 'escape') { idx = i; break; }
        }
        if (idx >= 0) {
            this._list.splice(idx, 0, cmd);
        } else {
            this._list.push(cmd);
        }
    };

    //-------------------------------------------------------------------------
    // Window_BattlePartyCard : 위쪽 검은 카드 (이름 Lv / HP / TP / 얼굴)
    //-------------------------------------------------------------------------
    function Window_BattlePartyCard() {
        this.initialize.apply(this, arguments);
    }

    Window_BattlePartyCard.prototype = Object.create(Window_Base.prototype);
    Window_BattlePartyCard.prototype.constructor = Window_BattlePartyCard;

    Window_BattlePartyCard.prototype.initialize = function(x, y, width, height) {
        this._actor = null;
        this._faceToken = 0;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        // 기본 윈도우스킨 배경/테두리는 숨기고 contents 에 검은 배경을 직접 그림
        if (this._windowSpriteContainer) this._windowSpriteContainer.visible = false;
        this.opacity = 0;
        this.hide();
    };

    Window_BattlePartyCard.prototype.standardPadding = function() { return 0; };
    Window_BattlePartyCard.prototype.standardBackOpacity = function() { return 0; };
    Window_BattlePartyCard.prototype.contentsHeight = function() {
        return this.height - this.standardPadding() * 2;
    };

    Window_BattlePartyCard.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_BattlePartyCard.prototype.labelColor = function() {
        return this.textColor(labelColorIx);
    };

    // 글자 높이를 직접 지정해서 그리는 도우미 (줄 높이가 행마다 달라서)
    Window_BattlePartyCard.prototype.drawRowText = function(text, x, y, w, h, align) {
        this.contents.drawText(text, x, y, w, h, align || 'left');
    };

    Window_BattlePartyCard.prototype.refresh = function() {
        if (!this.contents) return;
        this.contents.clear();
        this._faceToken++;
        this.contents.fillRect(0, 0, this.contentsWidth(), this.contentsHeight(), '#000000');
        var actor = this._actor;
        if (!actor) return;
        var size = faceSize;
        drawScaledFace(this, actor, this.contentsWidth() - size - 13,
                       Math.round((this.contentsHeight() - size) / 2), size,
                       this._faceToken);
        this.drawCardTexts(actor);
    };

    Window_BattlePartyCard.prototype.drawCardTexts = function(actor) {
        var nameRowH = Math.round(fontSize * 1.4);
        var statRowH = Math.round(statFontSize * 1.6);
        var total = nameRowH + statRowH * 2;
        var x = 22;
        var rightEdge = this.contentsWidth() - faceSize - 13 - 14;
        var width = rightEdge - x;
        var y = Math.round((this.contentsHeight() - total) / 2);
        var small = Math.round(fontSize * 0.8);

        // 1행: 이름 + Lv
        this.contents.fontSize = small;
        var lvLabel = TextManager.levelA;
        var lvLabelW = Math.ceil(this.textWidth(lvLabel)) + 6;
        var lvValueW = Math.ceil(this.textWidth(String(actor.level)));
        this.contents.fontSize = fontSize;
        var nameW = Math.min(Math.ceil(this.textWidth(actor.name())),
                             width - lvLabelW - lvValueW - 12);
        if (actor.isDead()) {
            this.changeTextColor(this.deathColor());
        } else {
            this.resetTextColor();
        }
        this.drawRowText(actor.name(), x, y, nameW, nameRowH);
        var lvX = x + nameW + 12;
        this.contents.fontSize = small;
        this.changeTextColor(this.labelColor());
        this.drawRowText(lvLabel, lvX, y, lvLabelW, nameRowH);
        this.resetTextColor();
        this.drawRowText(String(actor.level), lvX + lvLabelW, y, lvValueW + 4, nameRowH);

        // 2행: HP, 3행: TP (이름보다 작게)
        this.drawCardStat(TextManager.hpA, actor.hp, actor.mhp, actor.hpRate(),
            this.hpGaugeColor1(), this.hpGaugeColor2(), this.hpColor(actor),
            x, y + nameRowH, width, statRowH);
        this.drawCardStat(TextManager.tpA, Math.floor(actor.tp), actor.maxTp(), actor.tpRate(),
            this.tpGaugeColor1(), this.tpGaugeColor2(), this.tpColor(actor),
            x, y + nameRowH + statRowH, width, statRowH);
        this.resetFontSettings();
    };

    Window_BattlePartyCard.prototype.drawCardStat = function(label, cur, max, rate,
                                                           c1, c2, valueColor, x, y, width, rowH) {
        this.contents.fontSize = statFontSize;
        var labelW = Math.ceil(this.textWidth(label)) + 14;
        this.changeTextColor(this.labelColor());
        this.drawRowText(label, x, y, labelW, rowH);

        var gx = x + labelW;
        var gw = width - labelW;
        if (gw <= 0) return;
        var gh = 6;
        var gy = y + rowH - gh - 3;
        this.contents.fillRect(gx, gy, gw, gh, this.gaugeBackColor());
        this.contents.gradientFillRect(gx, gy, Math.floor(gw * Math.max(0, Math.min(1, rate))),
                                       gh, c1, c2);

        this.contents.fontSize = Math.round(statFontSize * 0.9);
        this.changeTextColor(valueColor);
        this.drawRowText(cur + '/' + max, gx, y, gw, rowH, 'right');
        this.resetTextColor();
    };

    //-------------------------------------------------------------------------
    // Window_BattlePartyHint : 카드 아래 안내 글씨 (배경 없음)
    //-------------------------------------------------------------------------
    function Window_BattlePartyHint() {
        this.initialize.apply(this, arguments);
    }

    Window_BattlePartyHint.prototype = Object.create(Window_Base.prototype);
    Window_BattlePartyHint.prototype.constructor = Window_BattlePartyHint;

    Window_BattlePartyHint.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        if (this._windowSpriteContainer) this._windowSpriteContainer.visible = false;
        this.opacity = 0;
        this._isWindow = false; // 투명 창이 뒤의 창을 가리지 않게
        this._text = '';
        this.hide();
    };

    Window_BattlePartyHint.prototype.standardPadding = function() { return 0; };
    Window_BattlePartyHint.prototype.standardBackOpacity = function() { return 0; };
    Window_BattlePartyHint.prototype.contentsHeight = function() {
        return this.height - this.standardPadding() * 2;
    };

    Window_BattlePartyHint.prototype.setHint = function(text) {
        this._text = text;
        this.refresh();
    };

    Window_BattlePartyHint.prototype.refresh = function() {
        this.contents.clear();
        if (!this._text) return;
        this.resetFontSettings();
        this.contents.fontSize = 22;
        this.resetTextColor();
        this.drawText(this._text, 0, 0, this.contentsWidth(), 'center');
        this.resetFontSettings();
    };

    //-------------------------------------------------------------------------
    // Window_BattlePartySlots : 아래쪽 "현재 전투 파티원" 상태창 위에 겹치는
    // 투명 입력 창. 그림은 그리지 않고, 선택된 칸을 밝게 깜빡이고 클릭/키 입력만
    // 받는다. (얼굴/이름/HP/TP 는 원래 상태창이 그대로 보여줌)
    //-------------------------------------------------------------------------
    function Window_BattlePartySlots() {
        this.initialize.apply(this, arguments);
    }

    Window_BattlePartySlots.prototype = Object.create(Window_Selectable.prototype);
    Window_BattlePartySlots.prototype.constructor = Window_BattlePartySlots;

    Window_BattlePartySlots.prototype.initialize = function(statusWindow) {
        this._statusWindow = statusWindow;
        this._blinkCount = 0;
        this._blinkW = 0;
        this._blinkH = 0;
        this._candidateCallback = null;
        Window_Selectable.prototype.initialize.call(this, statusWindow.x, statusWindow.y,
                                                    statusWindow.width, statusWindow.height);
        if (this._windowSpriteContainer) this._windowSpriteContainer.visible = false;
        this.opacity = 0;
        // MV의 WindowLayer는 위에 있는 창의 사각형만큼 아래 창을 잘라내기(마스킹)
        // 때문에, 투명 창이어도 뒤의 상태창(얼굴/HP)이 통째로 안 보이게 됨.
        // _isWindow=false 로 마스킹에서 빼서 아래 상태창이 그대로 보이게 함.
        this._isWindow = false;
        this._blinkSprite = new Sprite();
        this._blinkSprite.blendMode = 1; // 더하기(밝게)
        this._blinkSprite.visible = false;
        this.addChild(this._blinkSprite);
        this.hide();
        this.deactivate();
    };

    Window_BattlePartySlots.prototype.standardPadding = function() { return 0; };
    Window_BattlePartySlots.prototype.standardBackOpacity = function() { return 0; };
    Window_BattlePartySlots.prototype.contentsHeight = function() {
        return this.height - this.standardPadding() * 2;
    };

    // 선택 가능한 칸 수 = 전투 자리 수 (파티가 더 적으면 파티원 수)
    Window_BattlePartySlots.prototype.maxItems = function() {
        return Math.min($gameParty.maxBattleMembers(), $gameParty.allMembers().length);
    };
    Window_BattlePartySlots.prototype.maxCols = function() { return 1; };
    Window_BattlePartySlots.prototype.maxRows = function() { return 1; };
    Window_BattlePartySlots.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
    };
    Window_BattlePartySlots.prototype.ensureCursorVisible = function() {};

    Window_BattlePartySlots.prototype.actorAt = function(index) {
        return $gameParty.allMembers()[index];
    };

    Window_BattlePartySlots.prototype.isCurrentItemEnabled = function() {
        return isFormationOk(this.actorAt(this.index()));
    };

    // 상태창의 칸 위치를 이 창 기준 좌표로 변환
    Window_BattlePartySlots.prototype.tileRect = function(index) {
        var sw = this._statusWindow;
        var r = sw.itemRect(index);
        var p = (typeof sw.padding === 'number') ? sw.padding : sw.standardPadding();
        return { x: r.x + p, y: r.y + p, width: r.width, height: r.height };
    };

    Window_BattlePartySlots.prototype.syncWithStatus = function() {
        var sw = this._statusWindow;
        if (this.x !== sw.x || this.y !== sw.y ||
            this.width !== sw.width || this.height !== sw.height) {
            this.move(sw.x, sw.y, sw.width, sw.height);
        }
    };

    Window_BattlePartySlots.prototype.setupBlinkBitmap = function(w, h) {
        if (this._blinkW === w && this._blinkH === h) return;
        this._blinkW = w;
        this._blinkH = h;
        var b = new Bitmap(w, h);
        b.fillRect(0, 0, w, h, 'rgba(255,255,255,0.45)');
        b.fillRect(0, 0, w, 3, '#ffffff');
        b.fillRect(0, h - 3, w, 3, '#ffffff');
        b.fillRect(0, 0, 3, h, '#ffffff');
        b.fillRect(w - 3, 0, 3, h, '#ffffff');
        this._blinkSprite.bitmap = b;
    };

    Window_BattlePartySlots.prototype.update = function() {
        this.syncWithStatus();
        Window_Selectable.prototype.update.call(this);
        this.updateBlink();
    };

    // 선택된 파티원 칸을 밝게 깜빡임
    Window_BattlePartySlots.prototype.updateBlink = function() {
        var s = this._blinkSprite;
        if (!s) return;
        if (!this.visible || this.index() < 0 || this.index() >= this.maxItems()) {
            s.visible = false;
            return;
        }
        var r = this.tileRect(this.index());
        var w = Math.max(8, r.width - 4);
        var h = Math.max(8, r.height - 4);
        this.setupBlinkBitmap(w, h);
        s.visible = true;
        s.x = r.x + 2;
        s.y = r.y + 2;
        this._blinkCount++;
        s.opacity = 40 + Math.round(190 * (0.5 + 0.5 * Math.sin(this._blinkCount * 0.15)));
    };

    //--- 조작 ---
    Window_BattlePartySlots.prototype.moveSlot = function(dir) {
        var n = this.maxItems();
        if (n <= 1) return;
        SoundManager.playCursor();
        this.select((this.index() + dir + n) % n);
    };

    Window_BattlePartySlots.prototype.moveCandidate = function(dir) {
        if (this._candidateCallback) this._candidateCallback(dir);
    };

    Window_BattlePartySlots.prototype.cursorRight = function() { this.moveSlot(1); };
    Window_BattlePartySlots.prototype.cursorLeft = function() { this.moveSlot(-1); };
    Window_BattlePartySlots.prototype.cursorDown = function() { this.moveCandidate(1); };
    Window_BattlePartySlots.prototype.cursorPagedown = function() { this.moveCandidate(1); };
    Window_BattlePartySlots.prototype.cursorUp = function() { this.moveCandidate(-1); };
    Window_BattlePartySlots.prototype.cursorPageup = function() { this.moveCandidate(-1); };

    Window_BattlePartySlots.prototype.processWheel = function() {
        if (this.isOpenAndActive()) {
            var threshold = 20;
            if (TouchInput.wheelY >= threshold) this.moveCandidate(1);
            if (TouchInput.wheelY <= -threshold) this.moveCandidate(-1);
        }
    };

    Window_BattlePartySlots.prototype.hitTestTile = function(x, y) {
        var n = this.maxItems();
        for (var i = 0; i < n; i++) {
            var r = this.tileRect(i);
            if (x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height) {
                return i;
            }
        }
        return -1;
    };

    // 파티원 칸을 클릭하면 선택과 교체가 한 번에 일어남. 우클릭은 취소.
    Window_BattlePartySlots.prototype.processTouch = function() {
        if (!this.isOpenAndActive()) return;
        if (TouchInput.isTriggered()) {
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            var hit = this.hitTestTile(x, y);
            if (hit >= 0) {
                this.select(hit);
                this.processOk();
            }
        } else if (TouchInput.isCancelled()) {
            if (this.isCancelEnabled()) this.processCancel();
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Battle
    //-------------------------------------------------------------------------
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this.createPartyChangeWindows();
    };

    Scene_Battle.prototype.createPartyChangeWindows = function() {
        var x = Math.round((Graphics.boxWidth - panelWidth) / 2) + panelXOffset;

        var card = new Window_BattlePartyCard(x, panelY, panelWidth, panelHeight);
        this._partyCardWindow = card;
        this.addWindow(card);

        var hint = new Window_BattlePartyHint(x, panelY + panelHeight + 4, panelWidth, 40);
        this._partyChangeHintWindow = hint;
        this.addWindow(hint);

        var slots = new Window_BattlePartySlots(this._statusWindow);
        slots.setHandler('ok', this.onPartyChangeOk.bind(this));
        slots.setHandler('cancel', this.onPartyChangeCancel.bind(this));
        slots._candidateCallback = this.movePartyCandidate.bind(this);
        this._partyChangeWindow = slots;
        this.addWindow(slots);
    };

    var _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.call(this);
        this._actorCommandWindow.setHandler('party', this.commandPartyChange.bind(this));
    };

    // 교체 창이 열려 있는 동안 전투 진행(BattleManager.update)을 멈춤
    var _Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        if (this._partyChangeWindow && this._partyChangeWindow.active) return true;
        return _Scene_Battle_isAnyInputWindowActive.call(this);
    };

    // 교체 창이 열려 있는 동안 매 프레임 다른 플러그인의 간섭을 막음
    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        if (this._partyChangeOpen) this.updatePartyChangeGuards();
    };

    Scene_Battle.prototype.updatePartyChangeGuards = function() {
        // 아래 상태창(현재 전투 파티원)은 계속 보이게 함
        if (this._statusWindow) this._statusWindow.visible = true;
        // BattleInputWatchdog.js 가 "모든 창이 비활성 = 잠김"으로 오인하지 않게 함
        this._biwOpeningGrace = 5;
        this._biwStuckCount = 0;
    };

    // 교체 중에는 ActorStatusClickSelect.js 의 상태창 클릭이 반응하지 않게
    // 이 상태창 인스턴스에서만 막음 (닫으면 지워서 원래대로)
    Scene_Battle.prototype.blockStatusClickSelect = function(block) {
        var sw = this._statusWindow;
        if (!sw) return;
        if (block) {
            sw.updateASCSClick = function() {};
            sw.ascsHitTest = function() { return -1; };
        } else {
            delete sw.updateASCSClick;
            delete sw.ascsHitTest;
        }
    };

    //--- 배경 어둡게 + 블러 (기본 꺼짐) ---
    Scene_Battle.prototype.applyPartyChangeBackdrop = function() {
        var sp = this._spriteset;
        if (sp && blurStrength > 0 && typeof PIXI !== 'undefined' &&
            PIXI.filters && PIXI.filters.BlurFilter) {
            this._pcPrevFilters = sp.filters;
            sp.filters = [new PIXI.filters.BlurFilter(blurStrength)];
            this._pcBlurApplied = true;
        }
        if (darkenAlpha > 0 && !this._pcDarkSprite) {
            var dark = new Sprite();
            dark.bitmap = new Bitmap(Graphics.width, Graphics.height);
            dark.bitmap.fillAll('rgba(0,0,0,' + darkenAlpha + ')');
            var index = this._windowLayer ? this.getChildIndex(this._windowLayer)
                                          : this.children.length;
            this.addChildAt(dark, index);
            this._pcDarkSprite = dark;
        }
    };

    Scene_Battle.prototype.removePartyChangeBackdrop = function() {
        if (this._pcBlurApplied && this._spriteset) {
            this._spriteset.filters = this._pcPrevFilters || null;
        }
        this._pcBlurApplied = false;
        this._pcPrevFilters = null;
        if (this._pcDarkSprite) {
            this.removeChild(this._pcDarkSprite);
            this._pcDarkSprite = null;
        }
    };

    // 아래 상태창(현재 전투 파티원)을 지금 편성으로 다시 그림
    Scene_Battle.prototype.refreshPartyStatusWindow = function() {
        var sw = this._statusWindow;
        if (sw && typeof sw.resetSlotSnapshot === 'function') {
            sw.resetSlotSnapshot();
        }
        // Popp_BStatusAnimatedFace 는 전투 시작 때 처음 파티원에게만 얼굴 애니메이션
        // 값(_pattern/_motionCount/_faceMotion)을 넣어둠. 교체로 새로 들어온 파티원은
        // 값이 비어(undefined/NaN) 얼굴이 안 그려지고 안 움직이므로 여기서 채워 줌.
        $gameParty.battleMembers().forEach(function(actor) {
            initPartyFaceAnim(actor, sw);
        });
        this.refreshStatus();
    };

    //--- 열기 ---
    Scene_Battle.prototype.commandPartyChange = function() {
        this._partyChangeBefore = $gameParty.battleMembers().slice();
        this._partyChangeOpen = true;

        // 커맨드 창은 숨기고 입력도 막음. 아래 상태창(현재 파티원)은 보이게 둠
        this._actorCommandWindow.deactivate();
        this._actorCommandWindow.visible = false;
        if (this._statusWindow) {
            this._statusWindow.deactivate();
            this._statusWindow.visible = true;
        }
        this.blockStatusClickSelect(true);
        this.applyPartyChangeBackdrop();

        // 위쪽 카드의 처음 멤버: 대기 멤버가 있으면 첫 대기 멤버, 없으면 첫 멤버
        var max = $gameParty.maxBattleMembers();
        this._pcCandidate = $gameParty.allMembers().length > max ? max : 0;

        var slots = this._partyChangeWindow;
        this._partyCardWindow.show();
        this._partyChangeHintWindow.show();
        slots.show();
        slots.syncWithStatus();
        var cur = BattleManager._actorIndex;
        slots.select(cur >= 0 && cur < slots.maxItems() ? cur : 0);
        this.syncPartyChangeInfo();
        slots.activate();
    };

    // 위쪽 카드와 안내 글씨를 현재 상태에 맞춰 갱신
    Scene_Battle.prototype.syncPartyChangeInfo = function() {
        var members = $gameParty.allMembers();
        var idx = this._pcCandidate;
        if (idx >= members.length) idx = this._pcCandidate = 0;
        this._partyCardWindow.setActor(members[idx]);
        var inBattle = idx < $gameParty.maxBattleMembers();
        var head = (inBattle ? battleLabel : reserveLabel) + ' ' +
                   (idx + 1) + '/' + members.length;
        this._partyChangeHintWindow.setHint(head + (helpText ? '   ' + helpText : ''));
    };

    // 위쪽 카드의 멤버를 다음/이전으로
    Scene_Battle.prototype.movePartyCandidate = function(dir) {
        var n = $gameParty.allMembers().length;
        if (n <= 1) return;
        this._pcCandidate = (this._pcCandidate + dir + n) % n;
        SoundManager.playCursor();
        this.syncPartyChangeInfo();
    };

    // 두 자리를 바꿔도 되는지 검사 (전투불능 대기 멤버는 전투 자리로 못 들어옴)
    Scene_Battle.prototype.canSwapPartyMembers = function(a, b) {
        var members = $gameParty.allMembers();
        var max = $gameParty.maxBattleMembers();
        var ma = members[a];
        var mb = members[b];
        if (!ma || !mb || a === b) return false;
        if (!isFormationOk(ma) || !isFormationOk(mb)) return false;
        if (a < max && b >= max && mb.isDead()) return false;
        if (b < max && a >= max && ma.isDead()) return false;
        return true;
    };

    // 선택한(깜빡이는) 파티원과 위쪽 카드의 멤버를 바로 교체
    Scene_Battle.prototype.onPartyChangeOk = function() {
        var slots = this._partyChangeWindow;
        var slot = slots.index();
        var cand = this._pcCandidate;
        if (!this.canSwapPartyMembers(cand, slot)) {
            SoundManager.playBuzzer();
            slots.activate();
            return;
        }
        $gameParty.swapOrder(cand, slot);
        this.refreshPartyStatusWindow();
        this.syncPartyChangeInfo();
        if (closeAfterSwap) {
            this.closePartyChange();
        } else {
            slots.activate();
        }
    };

    Scene_Battle.prototype.onPartyChangeCancel = function() {
        this.closePartyChange();
    };

    //--- 닫기 ---
    Scene_Battle.prototype.closePartyChange = function() {
        this._partyChangeOpen = false;
        this._partyChangeWindow.hide();
        this._partyChangeWindow.deactivate();
        this._partyCardWindow.hide();
        this._partyChangeHintWindow.hide();
        this.blockStatusClickSelect(false);
        this.removePartyChangeBackdrop();

        var before = this._partyChangeBefore || [];
        var after = $gameParty.battleMembers();
        var changed = before.length !== after.length;
        for (var i = 0; !changed && i < after.length; i++) {
            if (before[i] !== after[i]) changed = true;
        }

        if (!changed) {
            // 아무것도 안 바뀜 - 원래 커맨드 창으로 확실히 복귀
            var cmd = this._actorCommandWindow;
            cmd.visible = true;
            if (typeof cmd.open === 'function') cmd.open();
            cmd.activate();
            return;
        }

        var entering = [];
        before.forEach(function(member) {
            if (after.indexOf(member) < 0) {
                member.clearActions();
                member.onBattleEnd();
            }
        });
        after.forEach(function(member) {
            if (before.indexOf(member) < 0) {
                member.onBattleStart();
                member.makeActions();
                entering.push(member);
            }
        });

        this.refreshPartyStatusWindow();
        this.restartPartyInput(entering);
    };

    // 새 편성 기준으로 입력 단계를 다시 시작
    Scene_Battle.prototype.restartPartyInput = function(entering) {
        var members = $gameParty.battleMembers();
        var idx = -1;
        for (var i = 0; i < members.length; i++) {
            if (entering.indexOf(members[i]) >= 0 && members[i].canInput()) {
                idx = i;
                break;
            }
        }
        if (idx < 0) {
            var cur = BattleManager._actorIndex;
            if (cur >= 0 && cur < members.length && members[cur].canInput()) idx = cur;
        }
        if (idx < 0) {
            for (var j = 0; j < members.length; j++) {
                if (members[j].canInput()) { idx = j; break; }
            }
        }
        if (idx < 0) idx = 0;

        BattleManager.changeActor(idx, 'undecided');
        this._actorCommandWindow.visible = true;
        this.startActorCommandSelection();
    };

})();
