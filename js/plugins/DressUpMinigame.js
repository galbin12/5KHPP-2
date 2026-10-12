//=============================================================================
// DressUpMinigame.js
//=============================================================================

/*:
 * @plugindesc (v1.2) 모자/상의/하의를 옆으로 넘겨가며 고르는 옷 입히기 미니게임.
 * 클릭하면 결정, 결정한 뒤에도 언제든 다시 바꿀 수 있습니다.
 * @author RSM
 *
 * @param ---- 파일 ----
 *
 * @param File Prefix
 * @desc img/pictures 안의 옷 이미지 파일 이름 앞부분
 * @default DressUp_
 *
 * @param Single Image
 * @desc true: 옷 한 장만 그림 (몸과 같은 캔버스에 그리면 미리보기에 딱 맞고,
 * 아이콘은 그림 부분만 자동으로 잘라서 보여줌) / false: 아이콘과 _wear 따로
 * @default true
 *
 * @param Wear Suffix
 * @desc Single Image가 false일 때, 미리보기용 이미지 파일 이름 뒷부분
 * @default _wear
 *
 * @param Body Image
 * @desc 미리보기에 쓰일 맨몸 캐릭터 이미지 (img/pictures, 비우면 없음)
 * @default DressUp_body
 *
 * @param Background Image
 * @desc 미니게임 배경 이미지 (img/pictures, 비우면 반투명 검정)
 * @default
 *
 * @param ---- 옷 개수 / 결과 변수 ----
 *
 * @param Hat Count
 * @desc 모자 개수
 * @default 3
 *
 * @param Top Count
 * @desc 상의 개수
 * @default 3
 *
 * @param Bottom Count
 * @desc 하의 개수
 * @default 3
 *
 * @param Hat Variable
 * @desc 고른 모자 번호(1부터)가 저장될 변수 ID
 * @default 0
 *
 * @param Top Variable
 * @desc 고른 상의 번호(1부터)가 저장될 변수 ID
 * @default 0
 *
 * @param Bottom Variable
 * @desc 고른 하의 번호(1부터)가 저장될 변수 ID
 * @default 0
 *
 * @param ---- 글자 ----
 *
 * @param Hat Label
 * @default 모자
 *
 * @param Top Label
 * @default 상의
 *
 * @param Bottom Label
 * @default 하의
 *
 * @param Done Text
 * @default 완료
 *
 * @param Guide Text
 * @desc 상단 안내 문구 (비우면 표시 안함)
 * @default 옆으로 넘겨서 옷을 고르고, 클릭해서 결정하세요
 *
 * @param Font Size
 * @default 24
 *
 * @param ---- 레이아웃 ----
 *
 * @param Show Preview
 * @desc 왼쪽에 캐릭터 미리보기를 보여줄지 (true/false)
 * false면 _wear 이미지와 Body Image가 필요 없습니다
 * @default true
 *
 * @param Preview Try-On
 * @desc 넘기는 중인 옷을 미리보기에 바로 입혀볼지 (true/false)
 * @default true
 *
 * @param Preview Area Width
 * @desc 미리보기 영역의 가로 폭
 * @default 290
 *
 * @param Preview Scale
 * @desc 미리보기 캐릭터 배율
 * @default 1
 *
 * @param Preview Offset Y
 * @desc 미리보기 캐릭터 세로 위치 보정 (+면 아래로)
 * @default 0
 *
 * @param Layer Order
 * @desc 미리보기에서 옷이 겹치는 순서 (앞쪽이 아래에 깔림)
 * @default bottom,top,hat
 *
 * @param Item Size
 * @desc 옷 아이콘이 들어가는 칸 크기 (그림이 이 안에 맞춰짐)
 * @default 84
 *
 * @param Item Spacing
 * @desc 옷 아이콘 사이 간격 (한 줄에 3칸 보임)
 * @default 112
 *
 * @param Row Height
 * @desc 한 줄의 높이
 * @default 112
 *
 * @param Label Width
 * @desc 왼쪽 "모자/상의..." 글자 칸 폭
 * @default 80
 *
 * @param Side Scale
 * @desc 가운데가 아닌 옷의 크기 비율
 * @default 0.75
 *
 * @param Side Opacity
 * @desc 가운데가 아닌 옷의 불투명도 비율 (0~1)
 * @default 0.6
 *
 * @param Fit Icon
 * @desc 옷 아이콘을 칸 크기에 자동으로 맞출지 (false면 그린 크기 그대로)
 * @default true
 *
 * @param Selected Color
 * @desc 결정된 옷 테두리 색
 * @default #ffd84a
 *
 * @param ---- 효과음 ----
 *
 * @param Finish SE Name
 * @desc 완료 버튼을 눌렀을 때 SE
 * @default Saved1
 *
 * @param Finish SE Volume
 * @default 80
 *
 * @param Finish SE Pitch
 * @default 100
 *
 * @help
 * ----------------------------------------------------------------------------
 * 사용법
 * ----------------------------------------------------------------------------
 * 이벤트의 "플러그인 커맨드" 칸에 입력:
 *
 *   DressUp_Start
 *   DressUp_Start hat:11 top:12 bottom:13 switch:5 scommon:20
 *
 * hat/top/bottom : 결과를 저장할 변수 ID (생략 시 파라미터 값)
 * switch               : 완료 시 ON 될 스위치 ID (생략 시 없음)
 * scommon              : 완료 후 실행할 커먼 이벤트 ID (생략 시 없음)
 *
 * 변수에는 고른 옷의 번호(1, 2, 3...)가 저장됩니다.
 * 미니게임을 다시 열면 변수에 들어있는 번호가 이미 선택된 상태로 시작합니다.
 * (처음부터 다시 고르게 하려면 시작 전에 변수를 0으로 만드세요)
 *
 * ----------------------------------------------------------------------------
 * 조작
 * ----------------------------------------------------------------------------
 * 마우스/터치 : 줄을 옆으로 끌어서 넘기기, 양옆 화살표 클릭으로 한 칸씩 이동,
 *               옷을 클릭하면 결정 (다른 옷을 클릭하면 바뀜)
 * 키보드      : 위/아래로 줄 이동, 좌/우로 넘기기, 결정키로 가운데 옷 결정
 * 세 가지를 모두 고르면 "완료" 버튼이 활성화됩니다.
 *
 * ----------------------------------------------------------------------------
 * 이미지 준비 (전부 img/pictures 폴더)
 * ----------------------------------------------------------------------------
 [Single Image = true (기본) — 옷 하나당 그림 한 장]
 *      DressUp_body.png   : 맨몸 캐릭터
 *      DressUp_hat_1.png, DressUp_top_1.png, DressUp_bottom_1.png ...
 *    ★ 옷 그림은 전부 body와 "캔버스 크기가 같게" 저장하세요.
 *      몸 그림 위에 새 레이어를 만들어 옷을 그리고, 몸 레이어는 숨긴 채
 *      투명 배경 PNG로 저장하면 미리보기에 그대로 딱 겹쳐집니다.
 *      넘기는 칸의 아이콘은 투명 부분을 자동으로 잘라내 옷만 보여줍니다.
 *
 * [Single Image = false — 아이콘과 입힌 그림을 따로]
 *      DressUp_hat_1.png       : 아이콘 (크기 자유)
 *      DressUp_hat_1_wear.png  : body와 같은 캔버스 크기의 입힌 그림
 *
 * 개수 파라미터만큼 번호가 빠짐없이 있어야 합니다. (파일이 없으면 로딩 에러)
 * 배포 시 "사용되지 않는 파일 제외"를 켜면 이 그림들이 빠질 수 있으니 주의.
 *
 * ----------------------------------------------------------------------------
 * 번역
 * ----------------------------------------------------------------------------
 * 줄 이름, 완료 버튼, 안내 문구는 drawText로 그려지므로
 * Translations.json 의 custom 섹션에 넣으면 자동 번역됩니다.
 * ----------------------------------------------------------------------------
 */

(function() {
    'use strict';

    var P = PluginManager.parameters('DressUpMinigame');
    function pStr(k, d) { var v = P[k]; return (v === undefined || v === '') ? d : String(v); }
    function pNum(k, d) { var v = P[k]; return (v === undefined || v === '') ? d : Number(v); }
    function pBool(k, d) { var v = P[k]; return (v === undefined || v === '') ? d : String(v) === 'true'; }

    var filePrefix  = pStr('File Prefix', 'DressUp_');
    var singleImage = pBool('Single Image', true);
    var wearSuffix  = pStr('Wear Suffix', '_wear');
    var bodyImage   = pStr('Body Image', '');
    var bgImage     = pStr('Background Image', '');

    var CATS = [
        { key: 'hat',    label: pStr('Hat Label', '모자'),    count: pNum('Hat Count', 3),    varId: pNum('Hat Variable', 0) },
        { key: 'top',    label: pStr('Top Label', '상의'),    count: pNum('Top Count', 3),    varId: pNum('Top Variable', 0) },
        { key: 'bottom', label: pStr('Bottom Label', '하의'), count: pNum('Bottom Count', 3), varId: pNum('Bottom Variable', 0) }
    ];

    var doneText   = pStr('Done Text', '완료');
    var guideText  = pStr('Guide Text', '');
    var fontSize   = pNum('Font Size', 24);

    var showPreview   = pBool('Show Preview', true);
    var previewTryOn  = pBool('Preview Try-On', true);
    var previewAreaW  = pNum('Preview Area Width', 290);
    var previewScale  = pNum('Preview Scale', 1);
    var previewOffY   = pNum('Preview Offset Y', 0);
    var layerOrder    = pStr('Layer Order', 'bottom,top,hat').split(',').map(function(s) { return s.trim(); });

    var itemSize    = pNum('Item Size', 84);
    var spacing     = pNum('Item Spacing', 112);
    var rowHeight   = pNum('Row Height', 112);
    var labelWidth  = pNum('Label Width', 80);
    var sideScale   = pNum('Side Scale', 0.75);
    var sideAlpha   = pNum('Side Opacity', 0.6);
    var fitIcon     = pBool('Fit Icon', true);
    var selColor    = pStr('Selected Color', '#ffd84a');

    var finishSe = {
        name:   pStr('Finish SE Name', 'Saved1'),
        volume: pNum('Finish SE Volume', 80),
        pitch:  pNum('Finish SE Pitch', 100),
        pan: 0
    };

    var ARROW_W     = 40;
    var ROW_GAP     = 8;
    var BUTTON_W    = 160;
    var BUTTON_H    = 48;
    var DRAG_THRESH = 8;
    var FADE_FRAMES = 12;

    //-------------------------------------------------------------------------
    // Bitmap helpers
    //-------------------------------------------------------------------------
    function ctxOf(b) { return b._context || b.context; }
    function markDirty(b) {
        if (b._setDirty) b._setDirty();
        else if (b._baseTexture) b._baseTexture.update();
    }
    function roundRectPath(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
    }
    function makeRoundRect(w, h, r, fill, stroke, lineW) {
        var b = new Bitmap(w, h);
        var c = ctxOf(b);
        var lw = lineW || 0;
        c.save();
        roundRectPath(c, lw / 2, lw / 2, w - lw, h - lw, r);
        if (fill) { c.fillStyle = fill; c.fill(); }
        if (stroke && lw > 0) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
        c.restore();
        markDirty(b);
        return b;
    }
    function makeArrow(dir) {
        var w = ARROW_W, h = 44;
        var b = new Bitmap(w, h);
        var c = ctxOf(b);
        c.save();
        c.beginPath();
        if (dir < 0) {
            c.moveTo(w - 10, 6); c.lineTo(10, h / 2); c.lineTo(w - 10, h - 6);
        } else {
            c.moveTo(10, 6); c.lineTo(w - 10, h / 2); c.lineTo(10, h - 6);
        }
        c.closePath();
        c.fillStyle = '#ffffff';
        c.strokeStyle = 'rgba(0,0,0,0.6)';
        c.lineWidth = 3;
        c.stroke();
        c.fill();
        c.restore();
        markDirty(b);
        return b;
    }
    function makeCheck() {
        var s = 28;
        var b = new Bitmap(s, s);
        var c = ctxOf(b);
        c.save();
        c.beginPath();
        c.arc(s / 2, s / 2, s / 2 - 1, 0, Math.PI * 2);
        c.fillStyle = selColor;
        c.fill();
        c.beginPath();
        c.moveTo(7, 14); c.lineTo(12, 19); c.lineTo(21, 9);
        c.strokeStyle = '#3a2a00';
        c.lineWidth = 3.5;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.stroke();
        c.restore();
        markDirty(b);
        return b;
    }

    var _bmpCache = null;
    function sharedBitmaps() {
        if (!_bmpCache) {
            var fs = itemSize + 14;
            _bmpCache = {
                frame:     makeRoundRect(fs, fs, 12, 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.45)', 2),
                frameSel:  makeRoundRect(fs, fs, 12, 'rgba(255,255,255,0.25)', selColor, 5),
                arrowL:    makeArrow(-1),
                arrowR:    makeArrow(1),
                check:     makeCheck()
            };
        }
        return _bmpCache;
    }

    //-------------------------------------------------------------------------
    // Sprite_DressUpRow  (한 줄 = 한 카테고리)
    //-------------------------------------------------------------------------
    function Sprite_DressUpRow() {
        this.initialize.apply(this, arguments);
    }
    Sprite_DressUpRow.prototype = Object.create(Sprite.prototype);
    Sprite_DressUpRow.prototype.constructor = Sprite_DressUpRow;

    Sprite_DressUpRow.width = function() {
        return labelWidth + ARROW_W * 2 + spacing * 3;
    };

    Sprite_DressUpRow.prototype.initialize = function(cat, owner) {
        Sprite.prototype.initialize.call(this);
        this._cat = cat;
        this._owner = owner;
        this._count = Math.max(1, cat.count);
        this._selected = -1;
        this._pos = 0;
        this._target = 0;
        this._dragging = false;
        this._active = false;
        this._rowW = Sprite_DressUpRow.width();
        this._viewX = labelWidth + ARROW_W;
        this._centerX = this._viewX + spacing * 1.5;
        this._centerY = rowHeight / 2;
        this.createHighlight();
        this.createLabel();
        this.createArrows();
        this.createItems();
    };

    Sprite_DressUpRow.prototype.createHighlight = function() {
        this._highlight = new Sprite(makeRoundRect(this._rowW, rowHeight, 14, 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.25)', 2));
        this.addChild(this._highlight);
    };

    Sprite_DressUpRow.prototype.createLabel = function() {
        var b = new Bitmap(labelWidth, rowHeight);
        b.fontSize = fontSize;
        b.drawText(this._cat.label, 0, 0, labelWidth, rowHeight, 'center');
        this._label = new Sprite(b);
        this.addChild(this._label);
    };

    Sprite_DressUpRow.prototype.createArrows = function() {
        var bm = sharedBitmaps();
        this._arrowL = new Sprite(bm.arrowL);
        this._arrowL.anchor.x = this._arrowL.anchor.y = 0.5;
        this._arrowL.x = labelWidth + ARROW_W / 2;
        this._arrowL.y = this._centerY;
        this._arrowR = new Sprite(bm.arrowR);
        this._arrowR.anchor.x = this._arrowR.anchor.y = 0.5;
        this._arrowR.x = this._viewX + spacing * 3 + ARROW_W / 2;
        this._arrowR.y = this._centerY;
        this.addChild(this._arrowL);
        this.addChild(this._arrowR);
    };

    Sprite_DressUpRow.prototype.createItems = function() {
        var bm = sharedBitmaps();
        this._items = [];
        for (var i = 0; i < this._count; i++) {
            var item = new Sprite();
            var frame = new Sprite(bm.frame);
            frame.anchor.x = frame.anchor.y = 0.5;
            var icon = new Sprite(ImageManager.loadPicture(filePrefix + this._cat.key + '_' + (i + 1)));
            icon.anchor.x = icon.anchor.y = 0.5;
            icon.bitmap.addLoadListener(this.fitIcon.bind(this, icon));
            var check = new Sprite(bm.check);
            check.anchor.x = check.anchor.y = 0.5;
            check.x = itemSize / 2;
            check.y = -itemSize / 2;
            check.visible = false;
            item.addChild(frame);
            item.addChild(icon);
            item.addChild(check);
            item._frame = frame;
            item._check = check;
            this._items.push(item);
            this.addChild(item);
        }
    };

    // 투명하지 않은 영역만 찾아서 잘라냄 (Single Image 모드)
    function opaqueBounds(bitmap) {
        if (bitmap._dressUpBounds) return bitmap._dressUpBounds;
        var w = bitmap.width, h = bitmap.height;
        var result = { x: 0, y: 0, w: w, h: h };
        try {
            var src = bitmap._image || bitmap._canvas || bitmap.canvas;
            var cv = document.createElement('canvas');
            cv.width = w; cv.height = h;
            var c = cv.getContext('2d');
            c.drawImage(src, 0, 0);
            var data = c.getImageData(0, 0, w, h).data;
            var minX = w, minY = h, maxX = -1, maxY = -1;
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    if (data[(y * w + x) * 4 + 3] > 10) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX >= 0) {
                result = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
            }
        } catch (e) {
            console.warn('DressUpMinigame: 투명 영역 계산 실패', e);
        }
        bitmap._dressUpBounds = result;
        return result;
    }

    Sprite_DressUpRow.prototype.fitIcon = function(icon) {
        var bw = icon.bitmap.width, bh = icon.bitmap.height;
        if (singleImage) {
            var r = opaqueBounds(icon.bitmap);
            icon.setFrame(r.x, r.y, r.w, r.h);
            bw = r.w; bh = r.h;
        }
        if (fitIcon && bw > 0 && bh > 0) {
            var s = Math.min(itemSize / bw, itemSize / bh);
            icon.scale.x = icon.scale.y = s;
        }
    };

    Sprite_DressUpRow.prototype.maxIndex = function() {
        return this._count - 1;
    };

    Sprite_DressUpRow.prototype.centerIndex = function() {
        return Math.max(0, Math.min(this.maxIndex(), Math.round(this._pos)));
    };

    Sprite_DressUpRow.prototype.selectedIndex = function() {
        return this._selected;
    };

    Sprite_DressUpRow.prototype.setActive = function(active) {
        this._active = active;
    };

    Sprite_DressUpRow.prototype.jumpTo = function(index) {
        this._pos = this._target = index;
    };

    Sprite_DressUpRow.prototype.setSelected = function(index) {
        this._selected = index;
    };

    Sprite_DressUpRow.prototype.move = function(dir) {
        var t = Math.max(0, Math.min(this.maxIndex(), Math.round(this._target) + dir));
        if (t !== Math.round(this._target)) {
            SoundManager.playCursor();
        }
        this._target = t;
    };

    Sprite_DressUpRow.prototype.select = function(index) {
        this._target = index;
        if (this._selected !== index) {
            this._selected = index;
            SoundManager.playOk();
            this._owner.onSelectionChanged();
        } else {
            SoundManager.playCursor();
        }
    };

    Sprite_DressUpRow.prototype.selectCenter = function() {
        this.select(Math.round(this._target));
    };

    // ---- 터치 (좌표는 이 줄 기준 로컬) ----
    Sprite_DressUpRow.prototype.containsY = function(ly) {
        return ly >= 0 && ly < rowHeight;
    };

    Sprite_DressUpRow.prototype.hitArrow = function(lx, ly) {
        if (!this.containsY(ly)) return 0;
        if (lx >= labelWidth && lx < this._viewX) return -1;
        var rx = this._viewX + spacing * 3;
        if (lx >= rx && lx < rx + ARROW_W) return 1;
        return 0;
    };

    Sprite_DressUpRow.prototype.inViewport = function(lx, ly) {
        return this.containsY(ly) && lx >= this._viewX && lx < this._viewX + spacing * 3;
    };

    Sprite_DressUpRow.prototype.startDrag = function(lx) {
        this._dragging = true;
        this._moved = false;
        this._dragStartX = lx;
        this._dragStartPos = this._pos;
        this._lastX = lx;
        this._vel = 0;
    };

    Sprite_DressUpRow.prototype.updateDrag = function(lx) {
        var dx = lx - this._dragStartX;
        if (Math.abs(dx) > DRAG_THRESH) this._moved = true;
        if (this._moved) {
            var p = this._dragStartPos - dx / spacing;
            var max = this.maxIndex();
            if (p < 0) p *= 0.3;
            if (p > max) p = max + (p - max) * 0.3;
            this._pos = p;
        }
        this._vel = this._vel * 0.5 + (lx - this._lastX) * 0.5;
        this._lastX = lx;
    };

    Sprite_DressUpRow.prototype.endDrag = function(lx, ly) {
        this._dragging = false;
        if (!this._moved) {
            var i = Math.round(this._pos + (lx - this._centerX) / spacing);
            if (i < 0 || i > this.maxIndex()) return;
            var d = i - this._pos;
            var half = (itemSize + 14) * this.scaleAt(d) / 2;
            var ix = this._centerX + d * spacing;
            if (Math.abs(lx - ix) <= half && Math.abs(ly - this._centerY) <= half) {
                this.select(i);
            }
        } else {
            var before = Math.round(this._target);
            var t = Math.round(this._pos - this._vel * 0.08);
            t = Math.max(0, Math.min(this.maxIndex(), t));
            if (t !== before) SoundManager.playCursor();
            this._target = t;
        }
    };

    // ---- 표시 ----
    Sprite_DressUpRow.prototype.scaleAt = function(d) {
        return 1 - Math.min(Math.abs(d), 1) * (1 - sideScale);
    };

    Sprite_DressUpRow.prototype.alphaAt = function(d) {
        var ad = Math.abs(d);
        if (ad <= 1) return 1 - ad * (1 - sideAlpha);
        return Math.max(0, sideAlpha * (1 - (ad - 1) * 2));
    };

    Sprite_DressUpRow.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this._dragging) {
            var diff = this._target - this._pos;
            this._pos = Math.abs(diff) < 0.005 ? this._target : this._pos + diff * 0.25;
        }
        var bm = sharedBitmaps();
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            var d = i - this._pos;
            var a = this.alphaAt(d);
            item.visible = a > 0.01;
            item.x = this._centerX + d * spacing;
            item.y = this._centerY;
            item.scale.x = item.scale.y = this.scaleAt(d);
            item.opacity = Math.round(255 * a);
            var sel = (i === this._selected);
            item._frame.bitmap = sel ? bm.frameSel : bm.frame;
            item._check.visible = sel;
        }
        var t = Math.round(this._target);
        this._arrowL.opacity = t > 0 ? 255 : 70;
        this._arrowR.opacity = t < this.maxIndex() ? 255 : 70;
        this._highlight.visible = this._active;
    };

    //-------------------------------------------------------------------------
    // Sprite_DressUp  (미니게임 본체)
    //-------------------------------------------------------------------------
    function Sprite_DressUp() {
        this.initialize.apply(this, arguments);
    }
    Sprite_DressUp.prototype = Object.create(Sprite.prototype);
    Sprite_DressUp.prototype.constructor = Sprite_DressUp;

    Sprite_DressUp.prototype.initialize = function(interpreter, opts) {
        Sprite.prototype.initialize.call(this);
        this._interpreter = interpreter;
        this._opts = opts;
        this._state = 'opening';
        this._timer = 0;
        this._cursor = 0;
        this._dragRow = null;
        this.x = Math.floor((Graphics.width - Graphics.boxWidth) / 2);
        this.y = Math.floor((Graphics.height - Graphics.boxHeight) / 2);
        this.opacity = 0;
        this.createBackground();
        this.computeLayout();
        this.createGuide();
        if (showPreview) this.createPreview();
        this.createRows();
        this.createDoneButton();
        this.loadInitialSelections();
    };

    Sprite_DressUp.prototype.createBackground = function() {
        var bg;
        if (bgImage) {
            bg = new Sprite(ImageManager.loadPicture(bgImage));
        } else {
            bg = new Sprite(new Bitmap(Graphics.width, Graphics.height));
            bg.bitmap.fillAll('rgba(0,0,0,0.6)');
            bg.x = -this.x;
            bg.y = -this.y;
        }
        this.addChild(bg);
    };

    Sprite_DressUp.prototype.computeLayout = function() {
        var W = Graphics.boxWidth, H = Graphics.boxHeight;
        var areaX = showPreview ? previewAreaW : 0;
        var areaW = W - areaX;
        this._rowX = Math.floor(areaX + (areaW - Sprite_DressUpRow.width()) / 2);
        var total = rowHeight * CATS.length + ROW_GAP * (CATS.length - 1) + 16 + BUTTON_H;
        var guideH = guideText ? fontSize + 16 : 0;
        this._rowTop = Math.max(guideH + 4, Math.floor((H - total) / 2));
    };

    Sprite_DressUp.prototype.createGuide = function() {
        if (!guideText) return;
        var W = Graphics.boxWidth;
        var b = new Bitmap(W, fontSize + 16);
        b.fontSize = fontSize - 2;
        b.drawText(guideText, 0, 4, W, fontSize + 8, 'center');
        this.addChild(new Sprite(b));
    };

    Sprite_DressUp.prototype.createPreview = function() {
        this._preview = new Sprite();
        this._preview.x = Math.floor(previewAreaW / 2);
        this._preview.y = Math.floor(Graphics.boxHeight / 2) + previewOffY;
        this._preview.scale.x = this._preview.scale.y = previewScale;
        if (bodyImage) {
            var body = new Sprite(ImageManager.loadPicture(bodyImage));
            body.anchor.x = body.anchor.y = 0.5;
            this._preview.addChild(body);
        }
        this._wearBitmaps = {};
        this._wearLayers = {};
        var self = this;
        layerOrder.forEach(function(key) {
            var cat = self.catByKey(key);
            if (!cat) return;
            var list = [];
            for (var i = 0; i < Math.max(1, cat.count); i++) {
                list.push(ImageManager.loadPicture(filePrefix + key + '_' + (i + 1) + (singleImage ? '' : wearSuffix)));
            }
            self._wearBitmaps[key] = list;
            var layer = new Sprite();
            layer.anchor.x = layer.anchor.y = 0.5;
            layer.visible = false;
            self._wearLayers[key] = layer;
            self._preview.addChild(layer);
        });
        this.addChild(this._preview);
    };

    Sprite_DressUp.prototype.catByKey = function(key) {
        for (var i = 0; i < CATS.length; i++) {
            if (CATS[i].key === key) return CATS[i];
        }
        return null;
    };

    Sprite_DressUp.prototype.createRows = function() {
        this._rows = [];
        for (var i = 0; i < CATS.length; i++) {
            var row = new Sprite_DressUpRow(CATS[i], this);
            row.x = this._rowX;
            row.y = this._rowTop + i * (rowHeight + ROW_GAP);
            this._rows.push(row);
            this.addChild(row);
        }
    };

    Sprite_DressUp.prototype.createDoneButton = function() {
        this._btnNormal = this.makeButtonBitmap(false);
        this._btnFocus  = this.makeButtonBitmap(true);
        this._button = new Sprite(this._btnNormal);
        this._button.anchor.x = this._button.anchor.y = 0.5;
        this._button.x = this._rowX + Sprite_DressUpRow.width() / 2;
        this._button.y = this._rowTop + rowHeight * CATS.length + ROW_GAP * (CATS.length - 1) + 16 + BUTTON_H / 2;
        this.addChild(this._button);
    };

    Sprite_DressUp.prototype.makeButtonBitmap = function(focus) {
        var b = makeRoundRect(BUTTON_W, BUTTON_H, 14, focus ? '#e0a82e' : '#b07d1a', focus ? '#fff2b0' : 'rgba(255,255,255,0.5)', 3);
        b.fontSize = fontSize;
        b.drawText(doneText, 0, 0, BUTTON_W, BUTTON_H, 'center');
        return b;
    };

    Sprite_DressUp.prototype.loadInitialSelections = function() {
        var opts = this._opts;
        for (var i = 0; i < this._rows.length; i++) {
            var row = this._rows[i];
            var varId = opts.vars[i];
            var v = varId > 0 ? $gameVariables.value(varId) : 0;
            if (v >= 1 && v <= row.maxIndex() + 1) {
                row.setSelected(v - 1);
                row.jumpTo(v - 1);
            }
        }
        // 키보드 커서는 아직 안 고른 첫 줄에서 시작
        this._cursor = 0;
        for (var j = 0; j < this._rows.length; j++) {
            if (this._rows[j].selectedIndex() < 0) { this._cursor = j; break; }
        }
    };

    Sprite_DressUp.prototype.allSelected = function() {
        return this._rows.every(function(row) { return row.selectedIndex() >= 0; });
    };

    Sprite_DressUp.prototype.onSelectionChanged = function() {
        // 필요 시 확장용 (미리보기/버튼은 매 프레임 갱신)
    };

    //---- update ----
    Sprite_DressUp.prototype.update = function() {
        Sprite.prototype.update.call(this);
        switch (this._state) {
        case 'opening':
            this._timer++;
            this.opacity = Math.round(255 * this._timer / FADE_FRAMES);
            if (this._timer >= FADE_FRAMES) this._state = 'active';
            break;
        case 'active':
            this.updateTouch();
            if (this._state === 'active') this.updateKeys();
            break;
        case 'closing':
            this._timer++;
            this.opacity = Math.round(255 * (1 - this._timer / FADE_FRAMES));
            if (this._timer >= FADE_FRAMES) this.finish();
            return;
        }
        this.updateCursorVisual();
        this.updatePreview();
    };

    Sprite_DressUp.prototype.localTouch = function() {
        return { x: TouchInput.x - this.x, y: TouchInput.y - this.y };
    };

    Sprite_DressUp.prototype.updateTouch = function() {
        var t = this.localTouch();
        if (this._dragRow) {
            var r = this._dragRow;
            if (TouchInput.isPressed()) {
                r.updateDrag(t.x - r.x);
            } else {
                r.endDrag(t.x - r.x, t.y - r.y);
                this._dragRow = null;
            }
            return;
        }
        if (!TouchInput.isTriggered()) return;

        for (var i = 0; i < this._rows.length; i++) {
            var row = this._rows[i];
            var lx = t.x - row.x, ly = t.y - row.y;
            var arrow = row.hitArrow(lx, ly);
            if (arrow) {
                this._cursor = i;
                row.move(arrow);
                return;
            }
            if (row.inViewport(lx, ly)) {
                this._cursor = i;
                this._dragRow = row;
                row.startDrag(lx);
                return;
            }
        }
        var b = this._button;
        if (Math.abs(t.x - b.x) <= BUTTON_W / 2 && Math.abs(t.y - b.y) <= BUTTON_H / 2) {
            this._cursor = this._rows.length;
            this.pressDone();
        }
    };

    Sprite_DressUp.prototype.updateKeys = function() {
        var n = this._rows.length; // n = 완료 버튼
        if (Input.isRepeated('down')) {
            this._cursor = (this._cursor + 1) % (n + 1);
            SoundManager.playCursor();
        } else if (Input.isRepeated('up')) {
            this._cursor = (this._cursor + n) % (n + 1);
            SoundManager.playCursor();
        }
        if (this._cursor < n) {
            var row = this._rows[this._cursor];
            if (Input.isRepeated('left')) row.move(-1);
            else if (Input.isRepeated('right')) row.move(1);
            if (Input.isTriggered('ok')) {
                row.selectCenter();
                this._cursor = Math.min(n, this._cursor + 1);
            }
        } else if (Input.isTriggered('ok')) {
            this.pressDone();
        }
    };

    Sprite_DressUp.prototype.updateCursorVisual = function() {
        for (var i = 0; i < this._rows.length; i++) {
            this._rows[i].setActive(i === this._cursor);
        }
        var focus = this._cursor === this._rows.length;
        this._button.bitmap = focus ? this._btnFocus : this._btnNormal;
        this._button.opacity = this.allSelected() ? 255 : 90;
    };

    Sprite_DressUp.prototype.updatePreview = function() {
        if (!this._preview) return;
        for (var i = 0; i < this._rows.length; i++) {
            var row = this._rows[i];
            var key = CATS[i].key;
            var layer = this._wearLayers[key];
            if (!layer) continue;
            var sel = row.selectedIndex();
            var idx = -1, alpha = 255;
            if (previewTryOn) {
                idx = row.centerIndex();
                alpha = 255;
            } else if (sel >= 0) {
                idx = sel;
            }
            if (idx < 0) {
                layer.visible = false;
            } else {
                layer.bitmap = this._wearBitmaps[key][idx];
                layer.opacity = alpha;
                layer.visible = true;
            }
        }
    };

    Sprite_DressUp.prototype.pressDone = function() {
        if (!this.allSelected()) {
            SoundManager.playBuzzer();
            return;
        }
        if (finishSe.name) AudioManager.playSe(finishSe);
        var opts = this._opts;
        for (var i = 0; i < this._rows.length; i++) {
            if (opts.vars[i] > 0) {
                $gameVariables.setValue(opts.vars[i], this._rows[i].selectedIndex() + 1);
            }
        }
        if (opts.switchId > 0) $gameSwitches.setValue(opts.switchId, true);
        this._state = 'closing';
        this._timer = 0;
    };

    Sprite_DressUp.prototype.finish = function() {
        var commonId = this._opts.commonId;
        var interpreter = this._interpreter;
        Input.clear();
        TouchInput.clear();
        SceneManager._scene.endDressUp();
        if (commonId > 0 && $dataCommonEvents[commonId] && interpreter) {
            interpreter.setupChild($dataCommonEvents[commonId].list, 0);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map
    //-------------------------------------------------------------------------
    Scene_Map.prototype.startDressUp = function(interpreter, opts) {
        this._dressUpSprite = new Sprite_DressUp(interpreter, opts);
        this.addChild(this._dressUpSprite);
    };

    Scene_Map.prototype.endDressUp = function() {
        if (this._dressUpSprite) {
            this.removeChild(this._dressUpSprite);
            this._dressUpSprite = null;
        }
    };

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command !== 'DressUp_Start') return;
        if (!(SceneManager._scene instanceof Scene_Map)) return;
        var opts = {
            vars: CATS.map(function(c) { return c.varId; }),
            switchId: 0,
            commonId: 0
        };
        args.forEach(function(arg) {
            var parts = String(arg).split(':');
            var k = parts[0].toLowerCase();
            var v = Number(parts[1] || 0);
            var ci = ['hat', 'top', 'bottom'].indexOf(k);
            if (ci >= 0) opts.vars[ci] = v;
            else if (k === 'switch') opts.switchId = v;
            else if (k === 'scommon') opts.commonId = v;
        });
        this.setWaitMode('dressUp');
        SceneManager._scene.startDressUp(this, opts);
    };

    var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'dressUp') {
            if (SceneManager._scene._dressUpSprite) return true;
            this._waitMode = '';
            return false;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

})();
