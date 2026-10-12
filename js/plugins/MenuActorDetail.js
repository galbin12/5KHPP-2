//=============================================================================
// RS_MenuActorDetail.js
//=============================================================================

/*:
 * @plugindesc 메뉴에서 스킬/장비/상태 선택 시, 상세 팝업(위:SV+스탯+설명 / 아래:스킬
 * 목록)을 띄웁니다. 스킬 목록은 커서로 실제 선택 가능하며, 선택하면 위쪽 영역이
 * 스킬 설명 화면으로 바뀝니다.
 * @author RS
 *
 * @help
 * ------------------------------------------------------------------------
 * 사용법
 * ------------------------------------------------------------------------
 * 1) 이 플러그인은 RS_HideMenuStatus.js 와 함께 쓰는 걸 권장합니다.
 *    (플러그인 매니저에서 RS_HideMenuStatus.js 보다 아래쪽에 배치하세요)
 *
 * 2) 전신 이미지는 img/sv_enemies 폴더의 이미지를 사용합니다.
 *    기본적으로는 액터의 "이름"과 같은 파일명을 찾습니다.
 *    다른 파일명을 쓰고 싶으면 액터 메모(note)란에 아래처럼 적으세요.
 *
 *        <SVEnemy:파일명>
 *
 *    예) <SVEnemy:Actor1_1>
 *
 * 3) 프로필 텍스트는 액터의 프로필(데이터베이스 액터 설정의 "프로필/Profile")
 *    입력란 내용을 그대로 보여줍니다.
 *
 * ------------------------------------------------------------------------
 * 화면 구성
 * ------------------------------------------------------------------------
 * [위쪽 창]
 *   평상시  : 좌측 SV 이미지 / 우측 이름·레벨·HP·MP·TP / 그 아래 프로필 설명
 *   스킬 선택시 : 위 내용이 전부 사라지고, 선택한 스킬 아이콘+이름+설명으로 교체
 *
 * [아래쪽 창]
 *   배운 스킬 목록 (아이콘+이름+소비 MP/TP), 2단 배치, 커서로 실제 선택 가능
 *
 * ------------------------------------------------------------------------
 * 조작
 * ------------------------------------------------------------------------
 * 상태창(목록)에서 좌/우          -> 다른 파티원으로 커서 이동
 * 상태창에서 캐릭터를 고르고 OK  -> 상세 팝업 오픈 (스킬 목록이 바로 활성화)
 * 스킬 목록에서 상하좌우         -> 스킬 커서 이동
 * 스킬 목록에서 OK               -> 위쪽 창에 그 스킬 설명 표시
 * 스킬 설명이 떠 있는 상태에서 취소 -> 위쪽 창이 원래(SV/스탯/프로필)로 복귀
 * 스킬 설명이 없는 상태에서 취소 -> 상세 팝업을 닫고 캐릭터 목록으로 복귀
 */

var RS = RS || {};
RS.MenuActorDetail = RS.MenuActorDetail || {};

(function() {

    //-------------------------------------------------------------------
    // Window_MenuActorDetail (위쪽 창: 정보 / 스킬 설명)
    //-------------------------------------------------------------------
    function Window_MenuActorDetail() {
        this.initialize.apply(this, arguments);
    }

    Window_MenuActorDetail.prototype = Object.create(Window_Base.prototype);
    Window_MenuActorDetail.prototype.constructor = Window_MenuActorDetail;

    Window_MenuActorDetail.prototype.initialize = function() {
        var width = Graphics.boxWidth;
        var height = Math.floor(Graphics.boxHeight / 2);
        Window_Base.prototype.initialize.call(this, 0, 0, width, height);
        this._actor = null;
        this._skillDetailMode = false;
        this._detailSkill = null;
        this.openness = 0;
        this.hide();
    };

    Window_MenuActorDetail.prototype.setup = function(actor) {
        this._actor = actor;
        this._skillDetailMode = false;
        this._detailSkill = null;
        this.refresh();
    };

    Window_MenuActorDetail.prototype.showActorInfo = function() {
        this._skillDetailMode = false;
        this._detailSkill = null;
        this.refresh();
    };

    Window_MenuActorDetail.prototype.showSkillDetail = function(skill) {
        this._skillDetailMode = true;
        this._detailSkill = skill;
        this.refresh();
    };

    Window_MenuActorDetail.prototype.isShowingSkillDetail = function() {
        return this._skillDetailMode;
    };

    Window_MenuActorDetail.prototype.refresh = function() {
        this.contents.clear();
        if (!this._actor) return;
        if (this._skillDetailMode) {
            this.drawSkillDetail();
        } else {
            this.drawActorImage();
            this.drawActorStats();
            this.drawActorDescription();
        }
    };

    // ---- 액터 정보 화면 ----

    // 원본 액터 노트란의 <변신외형:파일명,스위치ID> 태그를 읽어서 대체 이미지 파일명을 반환
    // 지정한 스위치가 켜져 있으면 그 파일명을, 꺼져 있으면 기존 방식(note SVEnemy/이름)을 사용
    Window_MenuActorDetail.prototype.actorImageName = function() {
        var note = this._actor.actor().note;
        var altMatch = /<변신외형:\s*([^,>]+)\s*,\s*(\d+)\s*>/i.exec(note);
        if (altMatch) {
            var altFileName = altMatch[1].trim();
            var switchId = Number(altMatch[2]);
            if ($gameSwitches.value(switchId)) {
                return altFileName;
            }
        }
        var match = /<SVEnemy:\s*(.+?)>/i.exec(note);
        return match ? match[1].trim() : this._actor.name();
    };

    Window_MenuActorDetail.prototype.imageColumnWidth = function() {
        return Math.floor(this.contentsWidth() * 0.25);
    };

    Window_MenuActorDetail.prototype.drawActorImage = function() {
        var bitmap = ImageManager.loadSvEnemy(this.actorImageName());
        var win = this;
        var colWidth = this.imageColumnWidth() - 8;
        var colHeight = this.contentsHeight();
        bitmap.addLoadListener(function() {
            if (win._skillDetailMode) return; // 그 사이 스킬 설명으로 바뀌었으면 안 그림
            var scale = Math.min(colWidth / bitmap.width, colHeight / bitmap.height, 1);
            var dw = Math.floor(bitmap.width * scale);
            var dh = Math.floor(bitmap.height * scale);
            var x = Math.floor((colWidth - dw) / 2);
            var y = Math.floor((colHeight - dh) / 2);
            win.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x, y, dw, dh);
        });
    };

    Window_MenuActorDetail.prototype.drawActorStats = function() {
        var actor = this._actor;
        var lineHeight = this.lineHeight();
        var x = this.imageColumnWidth() + 16;
        var width = this.contentsWidth() - x;
        var y = 0;
        this.resetFontSettings();
        this.drawActorName(actor, x, y);
        this.drawActorLevel(actor, x + 168, y);
        y += lineHeight;
        this.drawActorHp(actor, x, y, width);
        y += lineHeight;
        this.drawActorMp(actor, x, y, width);
        y += lineHeight;
        this.drawActorTp(actor, x, y, width);
        this._statsBottomY = y + lineHeight;
    };

    Window_MenuActorDetail.prototype.drawActorDescription = function() {
        var x = this.imageColumnWidth() + 16;
        var y = this._statsBottomY + 8;
        var maxY = this.contentsHeight() - this.lineHeight();
        if (y >= maxY) return;
        this.resetFontSettings();
        this.drawTextEx(this._actor.profile(), x, y);
    };

    // ---- 스킬 설명 화면 ----

    Window_MenuActorDetail.prototype.drawSkillDetail = function() {
        var skill = this._detailSkill;
        if (!skill) return;
        this.resetFontSettings();
        this.drawItemName(skill, 0, 0, this.contentsWidth());
        var y = this.lineHeight() + 8;
        this.drawTextEx(skill.description, 0, y);
    };

    //-------------------------------------------------------------------
    // Window_MenuSkillList (아래쪽 창: 실제 선택 가능한 스킬 목록)
    //-------------------------------------------------------------------
    function Window_MenuSkillList() {
        this.initialize.apply(this, arguments);
    }

    Window_MenuSkillList.prototype = Object.create(Window_Selectable.prototype);
    Window_MenuSkillList.prototype.constructor = Window_MenuSkillList;

    Window_MenuSkillList.prototype.initialize = function() {
        var x = 0;
        var y = Math.floor(Graphics.boxHeight / 2);
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight - y;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._data = [];
        this.deactivate();
        this.hide();
    };

    Window_MenuSkillList.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
        this.select(0);
    };

    Window_MenuSkillList.prototype.maxCols = function() {
        return 2;
    };

    Window_MenuSkillList.prototype.spacing = function() {
        return 16;
    };

    Window_MenuSkillList.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };

    Window_MenuSkillList.prototype.item = function() {
        return this._data && this.index() >= 0 ? this._data[this.index()] : null;
    };

    Window_MenuSkillList.prototype.isEnabled = function(skill) {
        return skill && this._actor ? this._actor.canUse(skill) : false;
    };

    Window_MenuSkillList.prototype.isCurrentItemEnabled = function() {
        return this.isEnabled(this.item());
    };

    Window_MenuSkillList.prototype.makeItemList = function() {
        this._data = this._actor ? this._actor.skills() : [];
    };

    Window_MenuSkillList.prototype.refresh = function() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    };

    Window_MenuSkillList.prototype.drawItem = function(index) {
        var skill = this._data[index];
        if (skill) {
            var costWidth = this.costWidth();
            var rect = this.itemRect(index);
            rect.width -= this.textPadding();
            this.changePaintOpacity(this.isEnabled(skill));
            this.drawItemName(skill, rect.x, rect.y, rect.width - costWidth);
            this.drawSkillCost(skill, rect.x, rect.y, rect.width);
            this.changePaintOpacity(true);
        }
    };

    Window_MenuSkillList.prototype.costWidth = Window_SkillList.prototype.costWidth;
    Window_MenuSkillList.prototype.drawSkillCost = Window_SkillList.prototype.drawSkillCost;

    //-------------------------------------------------------------------
    // Window_MenuStatus : 좌우 키로도 캐릭터 이동 가능하게
    //-------------------------------------------------------------------
    Window_MenuStatus.prototype.cursorRight = function() {
        var index = this.index() + 1;
        if (index >= this.maxItems()) index = 0;
        this.select(index);
    };

    Window_MenuStatus.prototype.cursorLeft = function() {
        var index = this.index() - 1;
        if (index < 0) index = this.maxItems() - 1;
        this.select(index);
    };

    //-------------------------------------------------------------------
    // Scene_Menu
    //-------------------------------------------------------------------
    var _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.call(this);
        this.createActorDetailWindow();
        this.createMenuSkillListWindow();
    };

    Scene_Menu.prototype.createActorDetailWindow = function() {
        this._actorDetailWindow = new Window_MenuActorDetail();
        this.addWindow(this._actorDetailWindow);
    };

    Scene_Menu.prototype.createMenuSkillListWindow = function() {
        this._menuSkillListWindow = new Window_MenuSkillList();
        this._menuSkillListWindow.setHandler('ok',     this.onMenuSkillListOk.bind(this));
        this._menuSkillListWindow.setHandler('cancel', this.onMenuSkillListCancel.bind(this));
        this.addWindow(this._menuSkillListWindow);
    };

    var _Scene_Menu_commandPersonal = Scene_Menu.prototype.commandPersonal;
    Scene_Menu.prototype.commandPersonal = function() {
        _Scene_Menu_commandPersonal.call(this);
        // OK를 누르면 바로 진입하는 대신 상세 팝업을 열도록 핸들러를 갈아끼움
        this._statusWindow.setHandler('ok', this.onActorDetailOpen.bind(this));
    };

    Scene_Menu.prototype.onActorDetailOpen = function() {
        this._statusWindow.deactivate();
        var actor = $gameParty.members()[this._statusWindow.index()];

        this._actorDetailWindow.setup(actor);
        this._actorDetailWindow.show();
        this._actorDetailWindow.open();

        this._menuSkillListWindow.setActor(actor);
        this._menuSkillListWindow.show();
        this._menuSkillListWindow.open();
        this._menuSkillListWindow.activate();
    };

    Scene_Menu.prototype.onMenuSkillListOk = function() {
        var skill = this._menuSkillListWindow.item();
        if (!skill) {
            this._menuSkillListWindow.activate();
            return;
        }
        this._actorDetailWindow.showSkillDetail(skill);
        this._menuSkillListWindow.activate();
    };

    Scene_Menu.prototype.onMenuSkillListCancel = function() {
        if (this._actorDetailWindow.isShowingSkillDetail()) {
            this._actorDetailWindow.showActorInfo();
            this._menuSkillListWindow.activate();
        } else {
            this.closeActorDetail();
        }
    };

    Scene_Menu.prototype.closeActorDetail = function() {
        this._menuSkillListWindow.deactivate();
        this._menuSkillListWindow.close();
        this._menuSkillListWindow.hide();
        this._actorDetailWindow.close();
        this._actorDetailWindow.hide();
        this._statusWindow.activate();
    };

})();
