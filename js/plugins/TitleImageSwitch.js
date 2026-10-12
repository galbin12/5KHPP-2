//=============================================================================
// TitleImageSwitch.js
//=============================================================================

/*:
 * @plugindesc 특정 스위치가 ON일 때 타이틀 화면 배경1/배경2 이미지를 변경합니다.
 * @author Claude
 *
 * @param Switch List
 * @type struct<SwitchImage>[]
 * @desc 스위치별로 바꿀 이미지를 등록하세요. 목록 아래쪽에 있을수록 우선순위가 높습니다.
 * @default []
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 플러그인 매개변수의 "Switch List"에 항목을 추가하고,
 * - Switch ID: 확인할 스위치 번호
 * - Background 1: img/titles1 폴더의 파일명 (비워두면 원래 배경1 유지)
 * - Background 2: img/titles2 폴더의 파일명 (비워두면 원래 배경2 유지)
 * 를 입력하세요.
 *
 * 여러 스위치가 동시에 ON이면 목록에서 더 아래(나중)에 있는 항목이 우선 적용됩니다.
 * 해당 스위치가 지정한 배경만 비워두면(공란) 그 배경은 시스템 기본 타이틀 이미지를 사용합니다.
 *
 * 플러그인 커맨드 없음. 스위치 값만으로 동작합니다.
 * ============================================================================
 */

/*~struct~SwitchImage:
 * @param Switch ID
 * @type switch
 * @desc 이 스위치가 ON이면 아래 이미지를 사용합니다.
 * @default 1
 *
 * @param Background 1
 * @type file
 * @dir img/titles1
 * @desc img/titles1 폴더의 파일. 비워두면 배경1은 원래 이미지 그대로 사용.
 * @default
 *
 * @param Background 2
 * @type file
 * @dir img/titles2
 * @desc img/titles2 폴더의 파일. 비워두면 배경2는 원래 이미지 그대로 사용.
 * @default
 */

var Imported = Imported || {};
Imported.TitleImageSwitch = true;

(function() {

    var parameters = PluginManager.parameters('TitleImageSwitch');

    var switchList = [];
    try {
        var rawList = JSON.parse(parameters['Switch List'] || '[]');
        switchList = rawList.map(function(str) {
            var obj = JSON.parse(str);
            return {
                switchId: Number(obj['Switch ID'] || 0),
                bg1: obj['Background 1'] || '',
                bg2: obj['Background 2'] || ''
            };
        });
    } catch (e) {
        console.error('TitleImageSwitch: 매개변수 파싱 오류', e);
    }

    function getActiveOverride() {
        var active = null;
        for (var i = 0; i < switchList.length; i++) {
            var entry = switchList[i];
            if (entry.switchId > 0 && $gameSwitches.value(entry.switchId)) {
                active = entry; // 나중(아래)에 있는 항목이 우선 적용되도록 계속 덮어씀
            }
        }
        return active;
    }

    var _Scene_Title_createBackground = Scene_Title.prototype.createBackground;
    Scene_Title.prototype.createBackground = function() {
        var override = getActiveOverride();

        this._backSprite1 = new Sprite(
            ImageManager.loadTitle1(this.titleImage1Name(override))
        );
        this._backSprite2 = new Sprite(
            ImageManager.loadTitle2(this.titleImage2Name(override))
        );
        this.addChild(this._backSprite1);
        this.addChild(this._backSprite2);
    };

    Scene_Title.prototype.titleImage1Name = function(override) {
        if (override && override.bg1) {
            return override.bg1;
        }
        return $dataSystem.title1Name;
    };

    Scene_Title.prototype.titleImage2Name = function(override) {
        if (override && override.bg2) {
            return override.bg2;
        }
        return $dataSystem.title2Name;
    };

})();
