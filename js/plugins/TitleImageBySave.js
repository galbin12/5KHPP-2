//=============================================================================
// TitleImageBySave.js
//=============================================================================

/*:
 * @plugindesc 세이브 파일들 중 특정 스위치가 ON인 파일이 하나라도 있으면(예: 엔딩 클리어) 타이틀 이미지를 변경합니다.
 * @author Claude
 *
 * @param Clear Switch ID
 * @type switch
 * @desc 이 스위치가 ON으로 저장된 세이브 파일이 있으면 "클리어"로 판정합니다.
 * @default 1
 *
 * @param Cleared Background 1
 * @type file
 * @dir img/titles1
 * @desc 클리어 판정 시 사용할 배경1. 비워두면 원래 배경1 유지.
 * @default
 *
 * @param Cleared Background 2
 * @type file
 * @dir img/titles2
 * @desc 클리어 판정 시 사용할 배경2. 비워두면 원래 배경2 유지.
 * @default
 *
 * @help
 * ============================================================================
 * 게임 실행 중 스위치가 아니라, "저장된 세이브 파일들 중 하나라도
 * 특정 스위치가 ON으로 저장되어 있는가"를 기준으로 타이틀 이미지를 바꿉니다.
 * 엔딩을 본 세이브가 하나라도 있으면 타이틀을 바꾸는 식의 연출에 사용하세요.
 *
 * 모든 세이브 슬롯을 검사하며, 하나라도 조건에 맞으면 즉시 클리어로 판정합니다.
 * TitleImageSwitch.js와 함께 쓸 경우, 이 플러그인을 더 아래에 배치하면
 * 이 플러그인 쪽이 최종적으로 우선 적용됩니다(둘 다 조건 충족 시).
 * ============================================================================
 */

var Imported = Imported || {};
Imported.TitleImageBySave = true;

(function() {

    var parameters = PluginManager.parameters('TitleImageBySave');
    var CLEAR_SWITCH_ID = Number(parameters['Clear Switch ID'] || 1);
    var CLEARED_BG1 = parameters['Cleared Background 1'] || '';
    var CLEARED_BG2 = parameters['Cleared Background 2'] || '';

    function checkAnySaveCleared() {
        if (CLEAR_SWITCH_ID <= 0) return false;
        var maxSlots = DataManager.maxSavefiles ? DataManager.maxSavefiles() : 20;
        for (var i = 1; i <= maxSlots; i++) {
            if (!DataManager.savefileExists(i)) continue;
            try {
                var json = StorageManager.load(i);
                if (!json) continue;
                var contents = JsonEx.parse(json);
                if (contents && contents.switches && contents.switches.value(CLEAR_SWITCH_ID)) {
                    return true;
                }
            } catch (e) {
                console.error('TitleImageBySave: 세이브 파일 ' + i + ' 읽기 실패', e);
            }
        }
        return false;
    }

    var _Scene_Title_createBackground = Scene_Title.prototype.createBackground;
    Scene_Title.prototype.createBackground = function() {
        this._saveCleared = checkAnySaveCleared();
        _Scene_Title_createBackground.call(this);
    };

    // TitleImageSwitch.js가 먼저 로드되어 titleImage1Name/2Name을 정의했다면
    // 그 함수를 감싸서 클리어 조건일 때 최종적으로 덮어씁니다.
    // 정의되어 있지 않다면(단독 사용) 새로 만듭니다.
    if (Scene_Title.prototype.titleImage1Name) {
        var _Scene_Title_titleImage1Name = Scene_Title.prototype.titleImage1Name;
        Scene_Title.prototype.titleImage1Name = function(override) {
            if (this._saveCleared && CLEARED_BG1) return CLEARED_BG1;
            return _Scene_Title_titleImage1Name.call(this, override);
        };
    } else {
        Scene_Title.prototype.titleImage1Name = function() {
            if (this._saveCleared && CLEARED_BG1) return CLEARED_BG1;
            return $dataSystem.title1Name;
        };
    }

    if (Scene_Title.prototype.titleImage2Name) {
        var _Scene_Title_titleImage2Name = Scene_Title.prototype.titleImage2Name;
        Scene_Title.prototype.titleImage2Name = function(override) {
            if (this._saveCleared && CLEARED_BG2) return CLEARED_BG2;
            return _Scene_Title_titleImage2Name.call(this, override);
        };
    } else {
        Scene_Title.prototype.titleImage2Name = function() {
            if (this._saveCleared && CLEARED_BG2) return CLEARED_BG2;
            return $dataSystem.title2Name;
        };
    }

    // TitleImageSwitch.js 없이 단독 사용할 경우를 위한 createBackground 폴백
    if (!Imported.TitleImageSwitch) {
        Scene_Title.prototype.createBackground = function() {
            this._saveCleared = checkAnySaveCleared();
            this._backSprite1 = new Sprite(ImageManager.loadTitle1(this.titleImage1Name()));
            this._backSprite2 = new Sprite(ImageManager.loadTitle2(this.titleImage2Name()));
            this.addChild(this._backSprite1);
            this.addChild(this._backSprite2);
        };
    }

})();
