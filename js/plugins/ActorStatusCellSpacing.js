//=============================================================================
// ActorStatusCellSpacing.js
//=============================================================================

/*:
 * @plugindesc 전투 중 액터 상태창을 하나의 큰 박스 대신, 액터별로 완전히
 * 분리된 개별 패널(박스)로 보이게 합니다. 배경은 얼굴 스프라이트보다
 * 아래에 그려서 얼굴 자체가 어두워지지 않습니다.
 * @author Custom
 *
 * @param Cell Spacing
 * @desc 액터 칸 사이의 간격(px)
 * @default 24
 *
 * @param Cell Background Color
 * @desc 이미지를 안 쓸 때 칸 배경 색 (CSS 색상). 아래 이미지 파라미터를
 * 지정하면 이 색은 무시됩니다.
 * @default rgba(0, 0, 0, 0.85)
 *
 * @param Cell Background Image
 * @desc img/pictures/ 폴더에 있는 배경 이미지 파일명(확장자 제외).
 * 비워두면 위의 단색 배경을 씁니다. 예: BattleCellBG
 * @default
 *
 * @param Cell Border Color
 * @desc 칸 테두리 색 (CSS 색상)
 * @default rgba(255, 255, 255, 0.8)
 *
 * @param Cell Border Thickness
 * @desc 칸 테두리 두께(px)
 * @default 2
 *
 * @param Enable Selection Pulse
 * @desc 선택된 액터 칸에 흰색 펄스(깜빡임) 효과를 줄지 여부 (true/false)
 * @default true
 *
 * @param Pulse Color
 * @desc 펄스 색상 (RGB만, 알파는 아래 Min/Max로 조절). CSS 색상 형식
 * @default 255, 255, 255
 *
 * @param Pulse Min Alpha
 * @desc 펄스 최소 투명도 (0.0 ~ 1.0)
 * @default 0.15
 *
 * @param Pulse Max Alpha
 * @desc 펄스 최대 투명도 (0.0 ~ 1.0, 1.0이면 완전 불투명)
 * @default 0.9
 *
 * @param Pulse Speed
 * @desc 펄스 속도 (클수록 빠르게 깜빡임)
 * @default 0.08
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * YEP_BattleStatusWindow.js는 얼굴을 그리는 전용 스프라이트(_faceContents)를
 * 만들어서, 창의 일반 컨텐츠(contents, 이름/게이지 텍스트가 그려지는 곳)
 * 보다 아래 순서에 끼워넣습니다. 그래서 배경을 contents에 그리면 얼굴
 * 스프라이트 "위"에 얹혀서, 반투명 배경이 캐릭터 얼굴 자체를 덮어 어둡게
 * 보이게 만듭니다.
 *
 * 이 플러그인은 배경 전용의 별도 스프라이트를 새로 만들어서 얼굴
 * 스프라이트보다 더 아래(맨 뒤)에 배치합니다. 그 스프라이트에 액터별
 * 배경(단색 또는 이미지) + 테두리를 그려서:
 *   - 얼굴/이름/게이지는 원래대로 위에 그대로 보이고
 *   - 그 뒤에 액터별로 분리된 배경 패널이 깔려서
 * 캐릭터 자체는 어두워지지 않으면서 배경만 어둡게 나옵니다.
 *
 * 배경 이미지를 쓰려면 img/pictures/ 폴더에 이미지를 넣고, 파라미터
 * "Cell Background Image"에 확장자 없이 파일명만 적으세요.
 *
 * 선택된(커서가 있는) 액터 칸은 흰색으로 은은하게 깜빡이는 펄스 효과가
 * 추가로 들어갑니다. 기본 창 커서(테두리 점멸)가 밋밋하다고 느껴질 때
 * 끄거나(Enable Selection Pulse = false) 색/속도/밝기를 조절하세요.
 *
 * ============================================================================
 * 주의: 파라미터 값은 플러그인 매니저에 별도로 저장됩니다!
 * ============================================================================
 * 이 파일을 새 버전으로 덮어써도, 이미 플러그인 매니저에 추가되어 있었다면
 * 실제 값은 예전에 저장된 값 그대로 유지됩니다. 값을 바꾸려면 플러그인
 * 매니저에서 이 플러그인을 더블클릭해서 직접 값을 수정해야 합니다.
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleStatusWindow.js 보다 아래(뒤)에 두세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('ActorStatusCellSpacing');
    var cellSpacing = Number(parameters['Cell Spacing'] || 24);
    var cellBgColor = String(parameters['Cell Background Color'] || 'rgba(0, 0, 0, 0.85)');
    var cellBgImageName = String(parameters['Cell Background Image'] || '').trim();
    var cellBorderColor = String(parameters['Cell Border Color'] || 'rgba(255, 255, 255, 0.8)');
    var cellBorderThickness = Number(parameters['Cell Border Thickness'] || 2);
    var pulseEnabled = String(parameters['Enable Selection Pulse'] || 'true') === 'true';
    var pulseColorRgb = String(parameters['Pulse Color'] || '255, 255, 255');
    var pulseMinAlpha = Number(parameters['Pulse Min Alpha'] || 0.15);
    var pulseMaxAlpha = Number(parameters['Pulse Max Alpha'] || 0.9);
    var pulseSpeed = Number(parameters['Pulse Speed'] || 0.08);

    var cellBgBitmap = null;
    if (cellBgImageName) {
        cellBgBitmap = ImageManager.loadPicture(cellBgImageName);
    }

    Window_BattleStatus.prototype.spacing = function() {
        return cellSpacing;
    };

    Window_BattleStatus.prototype.itemWidth = function() {
        var cols = this.maxCols();
        var totalSpacing = cellSpacing * (cols - 1);
        return (this.contents.width - totalSpacing) / cols;
    };

    var _Window_BattleStatus_initialize = Window_BattleStatus.prototype.initialize;
    Window_BattleStatus.prototype.initialize = function() {
        _Window_BattleStatus_initialize.call(this);

        this.opacity = 0; // 창 전체 배경 틴트 제거
        if (this._windowFrameSprite) {
            this._windowFrameSprite.visible = false; // 창 전체 테두리 제거
        }

        // 배경 전용 스프라이트를 새로 만들어서, 얼굴 스프라이트
        // (_faceContents)보다 더 아래(뒤) 순서에 넣습니다.
        var w = this.contentsWidth();
        var h = this.contentsHeight();
        this._ascsBgSprite = new Sprite(new Bitmap(w, h));
        this._ascsBgSprite.move(this.standardPadding(), this.standardPadding());
        // index 1 = windowSpriteContainer(0) 바로 다음, 커서/얼굴/컨텐츠
        // 스프라이트보다 앞(=더 아래 z-order)에 위치합니다.
        this.addChildAt(this._ascsBgSprite, 1);

        if (cellBgBitmap && !cellBgBitmap.isReady()) {
            cellBgBitmap.addLoadListener(function() {
                this.refresh();
            }.bind(this));
        }

        this.refresh();
    };

    var _Window_BattleStatus_refresh = Window_BattleStatus.prototype.refresh;
    Window_BattleStatus.prototype.refresh = function() {
        this.drawASCSAllCellBackgrounds();
        _Window_BattleStatus_refresh.call(this);
    };

    var _Window_BattleStatus_update = Window_BattleStatus.prototype.update;
    Window_BattleStatus.prototype.update = function() {
        _Window_BattleStatus_update.call(this);
        if (!pulseEnabled || !this._ascsBgSprite) return;
        this._ascsPulseCount = (this._ascsPulseCount || 0) + 1;
        // 선택 상태가 있을 때만 매 프레임 다시 그립니다 (성능 절약).
        if (this.active && this.index() >= 0) {
            this.drawASCSAllCellBackgrounds();
        }
    };

    Window_BattleStatus.prototype.drawASCSAllCellBackgrounds = function() {
        if (!this._ascsBgSprite) return;
        this._ascsBgSprite.bitmap.clear();
        for (var i = 0; i < this.maxItems(); i++) {
            this.drawASCSCellBackground(i);
        }
    };

    Window_BattleStatus.prototype.drawASCSCellBackground = function(index) {
        var bmp = this._ascsBgSprite.bitmap;
        var rect = this.itemRect(index);
        var t = cellBorderThickness;
        var x = rect.x;
        var y = rect.y;
        var w = rect.width;
        var h = rect.height;

        if (cellBgBitmap && cellBgBitmap.isReady()) {
            bmp.blt(cellBgBitmap, 0, 0, cellBgBitmap.width,
                cellBgBitmap.height, x, y, w, h);
        } else {
            bmp.fillRect(x, y, w, h, cellBgColor);
        }

        // 선택된 칸이면 흰색 펄스를 그 위에 덧그립니다.
        if (pulseEnabled && this.active && index === this.index()) {
            var range = pulseMaxAlpha - pulseMinAlpha;
            var wave = (Math.sin((this._ascsPulseCount || 0) * pulseSpeed) + 1) / 2;
            var alpha = pulseMinAlpha + range * wave;
            bmp.fillRect(x, y, w, h, 'rgba(' + pulseColorRgb + ', ' + alpha + ')');
        }

        bmp.fillRect(x, y, w, t, cellBorderColor);
        bmp.fillRect(x, y + h - t, w, t, cellBorderColor);
        bmp.fillRect(x, y, t, h, cellBorderColor);
        bmp.fillRect(x + w - t, y, t, h, cellBorderColor);
    };

})();
