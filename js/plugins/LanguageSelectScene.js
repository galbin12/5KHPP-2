//=============================================================================
// LanguageSelectScene.js
//=============================================================================

/*:
 * @plugindesc (v1.00) SRD_TranslationEngine에 등록된 언어 목록을 게임 시작 전에
 * 선택할 수 있는 화면을 추가합니다. (SRD_TranslationEngine 필요)
 * @author ㄹㅅㅁ + Claude
 *
 * @param Show Every Boot
 * @type boolean
 * @on 매번 표시
 * @off 최초 1회만
 * @desc ON이면 게임을 실행할 때마다 언어 선택 화면을 보여줍니다.
 * OFF면 세이브 데이터(config)에 저장된 언어가 있을 경우 건너뜁니다.
 * @default true
 *
 * @param Window Title
 * @desc 언어 선택 창 위에 표시할 안내 문구. 비워두면 표시하지 않습니다.
 * @default Select Language / 언어를 선택하세요
 *
 * @param Background
 * @type select
 * @option Title Screen
 * @value title
 * @option Black
 * @value black
 * @desc 언어 선택 화면의 배경으로 무엇을 사용할지 정합니다.
 * @default title
 *
 * @param Option Width
 * @type number
 * @min 0
 * @desc 각 언어 항목 바의 가로 폭(px). 0이면 텍스트 길이에 맞춰 자동으로 정해집니다.
 * @default 0
 *
 * @param Option Height
 * @type number
 * @min 10
 * @desc 각 언어 항목 바의 세로 높이(px).
 * @default 50
 *
 * @param Option Spacing
 * @type number
 * @min 0
 * @desc 언어 항목들 사이의 위아래 간격(px).
 * @default 12
 *
 * @param Option Background Image
 * @desc 언어 항목 바 배경으로 쓸 그림 파일명 (img/pictures 폴더, 확장자 제외).
 * 비워두면 기본 그라데이션 바를 사용합니다.
 * @default
 * @require 1
 * @dir img/pictures/
 * @type file
 *
 * @param Option Background Image (Selected)
 * @desc 선택된 항목에 쓸 그림 파일명 (img/pictures 폴더, 확장자 제외).
 * 비워두면 위 [Option Background Image] 를 그대로 사용합니다.
 * @default
 * @require 1
 * @dir img/pictures/
 * @type file
 *
 * @help
 * ===========================================================================
 *  Language Select Scene
 * ===========================================================================
 *
 * 이 플러그인은 SRD_TranslationEngine 이 필요합니다.
 * 반드시 SRD_TranslationEngine 아래(플러그인 목록에서 더 아래쪽)에 배치하세요.
 * 인트로/로고 연출 플러그인(예: CustomLogo.js)이 있다면, 그 플러그인보다도
 * 아래쪽에 배치하세요. (언어 선택 → 인트로 → 타이틀 순서로 진행됩니다)
 *
 * 게임을 실행하면 가장 먼저 언어 선택 화면이 뜨고, SRD_TranslationEngine 의 
 * [Languages] 파라미터에 등록된 언어들과 [Source Language Name] 이 목록으로 
 * 표시됩니다. 플레이어가 고른 언어는 곧바로 ConfigManager.language 에 
 * 반영되고 설정 파일에 저장됩니다. 그 다음 인트로/로고 연출(있는 경우)이 
 * 재생되고, 마지막에 타이틀 화면으로 넘어갑니다.
 *
 * [Show Every Boot] 를 OFF로 하면, 이미 한 번이라도 언어를 선택해 
 * config 파일에 저장된 적이 있는 경우 이 화면을 건너뛰고 곧바로 
 * 타이틀 화면으로 이동합니다. (완전히 새로운 config일 때만 표시)
 *
 * [Option Background Image] 에 img/pictures 폴더의 그림 파일을 지정하면, 
 * 기본 그라데이션 바 대신 그 그림을 배경으로 사용합니다 (Option Width/
 * Height 크기에 맞춰 늘어남). [Option Background Image (Selected)] 를 
 * 따로 지정하면 선택된 항목에만 다른 그림을 쓸 수 있습니다 (비워두면 
 * 선택 여부와 상관없이 같은 그림 사용). 텍스트는 그 위에 항상 그려집니다.
 *
 * 옵션 화면에서 언어를 바꾸는 기능은 그대로 SRD_TranslationEngine 의 
 * [Provide Option?] 파라미터로 제어됩니다. 이 플러그인은 "게임 시작 시" 
 * 선택창을 추가로 보여주는 역할만 합니다.
 *
 * ===========================================================================
 *  플러그인 명령
 * ===========================================================================
 *
 * 이벤트 등에서 아무 때나 강제로 언어 선택 화면을 다시 띄우고 싶다면:
 *
 *   LanguageSelectScene open
 *
 * 을 사용하세요. (메시지 창 표시 도중에는 사용하지 마세요)
 *
 */

var Imported = Imported || {};
Imported.LanguageSelectScene = true;

var LSS = LSS || {};

(function($) {

"use strict";

$.params = PluginManager.parameters('LanguageSelectScene');
$.showEveryBoot = String($.params['Show Every Boot']).trim().toLowerCase() === 'true';
$.windowTitle = String($.params['Window Title'] || '');
$.background = String($.params['Background'] || 'title');
$.optionWidth = Number($.params['Option Width'] || 0);
$.optionHeight = Number($.params['Option Height'] || 50);
$.optionSpacing = Number($.params['Option Spacing'] || 12);
$.optionImage = String($.params['Option Background Image'] || '');
$.optionImageSelected = String($.params['Option Background Image (Selected)'] || '') || $.optionImage;

//-----------------------------------------------------------------------------
// Guard: SRD_TranslationEngine must be present.
//-----------------------------------------------------------------------------

if(!Imported.SRD_TranslationEngine && !window.SRD) {
	console.warn('LanguageSelectScene requires SRD_TranslationEngine to be installed above it.');
}

var SRDT = (window.SRD && window.SRD.TranslationEngine) ? window.SRD.TranslationEngine : null;

//-----------------------------------------------------------------------------
// Whether the player has already picked a language before (saved in config).
//-----------------------------------------------------------------------------

$.hasStoredLanguageChoice = function() {
	return ConfigManager._languageSelectDone === true;
};

$.markLanguageChoiceDone = function() {
	ConfigManager._languageSelectDone = true;
	ConfigManager.save();
};

$.ConfigManager_makeData = ConfigManager.makeData;
ConfigManager.makeData = function() {
	var config = $.ConfigManager_makeData.apply(this, arguments);
	config.languageSelectDone = this._languageSelectDone || false;
	return config;
};

$.ConfigManager_applyData = ConfigManager.applyData;
ConfigManager.applyData = function(config) {
	$.ConfigManager_applyData.apply(this, arguments);
	this._languageSelectDone = !!config.languageSelectDone;
};

//-----------------------------------------------------------------------------
// Scene_Boot
//
// We alias Scene_Boot.prototype.start AFTER any intro/logo plugin (e.g.
// CustomLogo.js) has already replaced it. Their version already decided
// the next scene (usually Scene_Logo, or Scene_Title if no such plugin
// exists) and stored it via SceneManager.goto(...). We simply swap that
// "next scene" out for our language select scene, so the language picker
// shows FIRST. Once a language is picked, Scene_LanguageSelect forwards
// to whatever the normal next scene would have been (Scene_Logo if it
// exists, otherwise Scene_Title) so the intro still plays afterward.
//-----------------------------------------------------------------------------

$.Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
	$.Scene_Boot_start.apply(this, arguments);
	if($.shouldShowLanguageSelect()) {
		// IMPORTANT: intro/logo plugins (e.g. CustomLogo.js) typically wrap
		// their Scene_Logo class inside their own closure (IIFE), so it is
		// NOT accessible as a global "Scene_Logo" from outside that plugin.
		// Instead of trying to reference that class by name (which would
		// always fail and silently skip the intro), we grab whatever scene
		// the engine just queued up via SceneManager._nextScene BEFORE we
		// override it, and remember its constructor so we can return to it
		// after the language is picked.
		$.nextSceneAfterSelect = (SceneManager._nextScene && SceneManager._nextScene.constructor) || Scene_Title;
		SceneManager.goto(Scene_LanguageSelect);
	}
};

$.shouldShowLanguageSelect = function() {
	if(DataManager.isBattleTest() || DataManager.isEventTest()) return false;
	if(!SRDT || !SRDT.languages || SRDT.languages.length === 0) return false;
	if($.showEveryBoot) return true;
	return !$.hasStoredLanguageChoice();
};

//-----------------------------------------------------------------------------
// Plugin Command
//-----------------------------------------------------------------------------

var _LSS_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	_LSS_Game_Interpreter_pluginCommand.call(this, command, args);
	if(command.toLowerCase() === 'languageselectscene') {
		var sub = (args[0] || '').toLowerCase();
		if(sub === 'open') {
			SceneManager.push(Scene_LanguageSelect);
		}
	}
};

//=============================================================================
// Scene_LanguageSelect
//=============================================================================

function Scene_LanguageSelect() {
	this.initialize.apply(this, arguments);
}

Scene_LanguageSelect.prototype = Object.create(Scene_Base.prototype);
Scene_LanguageSelect.prototype.constructor = Scene_LanguageSelect;

Scene_LanguageSelect.prototype.initialize = function() {
	Scene_Base.prototype.initialize.call(this);
};

Scene_LanguageSelect.prototype.create = function() {
	Scene_Base.prototype.create.call(this);
	this.createBackground();
	this.createTitleLabel();
	this.createCommandWindow();
	this.createOptionSprites();
};

Scene_LanguageSelect.prototype.start = function() {
	Scene_Base.prototype.start.call(this);
	SceneManager.clearStack();
	this.startFadeIn(this.fadeSpeed(), false);
};

Scene_LanguageSelect.prototype.update = function() {
	Scene_Base.prototype.update.call(this);
	this.updateOptionSprites();
	if(this._leaving && !this.isBusy()) {
		this.gotoNextScene();
	}
};

Scene_LanguageSelect.prototype.createBackground = function() {
	if($.background === 'title') {
		this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
		this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
		this.addChild(this._backSprite1);
		this.addChild(this._backSprite2);
	} else {
		this._colorSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		this._colorSprite.bitmap.fillAll('#000000');
		this.addChild(this._colorSprite);
	}
};

Scene_LanguageSelect.prototype.createTitleLabel = function() {
	if(!$.windowTitle) return;
	var bmpHeight = 72;
	this._labelSprite = new Sprite(new Bitmap(Graphics.width, bmpHeight));
	this._labelSprite.bitmap.fontSize = 28;
	this._labelSprite.bitmap.outlineWidth = 6;
	this._labelSprite.bitmap.outlineColor = 'rgba(0, 0, 0, 0.6)';
	this._labelSprite.bitmap.drawText($.windowTitle, 0, 0, Graphics.width, bmpHeight, 'center');
	this._labelSprite.y = Math.floor(Graphics.height * 0.25);
	this.addChild(this._labelSprite);
};

Scene_LanguageSelect.prototype.createCommandWindow = function() {
	// This window handles keyboard / gamepad / mouse-click input and cursor
	// movement exactly like a normal Window_Command, but is made fully
	// invisible - all visuals are instead drawn by Sprite_LanguageOption
	// sprites (createOptionSprites) so we get the custom gradient-bar look
	// while keeping all of MV's built-in selection/click handling for free.
	this._commandWindow = new Window_LanguageCommand();
	this._commandWindow.setHandler('ok', this.onLanguageOk.bind(this));
	this._commandWindow.opacity = 0;
	this._commandWindow.contentsOpacity = 0;
	this.addChild(this._commandWindow);
};

Scene_LanguageSelect.prototype.createOptionSprites = function() {
	this._optionSprites = [];
	var win = this._commandWindow;
	for(var i = 0; i < win.maxItems(); i++) {
		win.origin.y = 0;
		var rect = win.itemRect(i);
		var sprite = new Sprite_LanguageOption(win.commandName(i));
		var barHeight = $.optionHeight;
		var yOffset = Math.floor((rect.height - barHeight) / 2);
		sprite.x = win.x + rect.x + win.standardPadding();
		sprite.y = win.y + rect.y + win.standardPadding() + yOffset;
		sprite.setSize(rect.width, barHeight);
		this._optionSprites.push(sprite);
		this.addChild(sprite);
	}
};

Scene_LanguageSelect.prototype.updateOptionSprites = function() {
	if(!this._optionSprites) return;
	var index = this._commandWindow.index();
	for(var i = 0; i < this._optionSprites.length; i++) {
		this._optionSprites[i].setSelected(i === index);
	}
};

Scene_LanguageSelect.prototype.onLanguageOk = function() {
	var value = this._commandWindow.currentExt();
	ConfigManager.language = value;
	$.markLanguageChoiceDone();
	SoundManager.playOk();
	this._commandWindow.deactivate();
	this.startFadeOut(this.fadeSpeed(), false);
	this._leaving = true;
};

Scene_LanguageSelect.prototype.gotoNextScene = function() {
	// Go wherever the engine (or an intro/logo plugin) would have gone next
	// had this language-select scene not intervened.
	SceneManager.goto($.nextSceneAfterSelect || Scene_Title);
};

//=============================================================================
// Window_LanguageCommand
//=============================================================================

function Window_LanguageCommand() {
	this.initialize.apply(this, arguments);
}

Window_LanguageCommand.prototype = Object.create(Window_Command.prototype);
Window_LanguageCommand.prototype.constructor = Window_LanguageCommand;

Window_LanguageCommand.prototype.initialize = function() {
	Window_Command.prototype.initialize.call(this, 0, 0);
	this.updatePlacement();
	this.selectCurrentLanguage();
	// The cursor sprite lives outside the window's own opacity/contents
	// system, so opacity=0 alone won't hide it - force it off directly.
	if(this._windowCursorSprite) this._windowCursorSprite.visible = false;
	// Same story for the up/down scroll arrows.
	if(this._downArrowSprite) this._downArrowSprite.visible = false;
	if(this._upArrowSprite) this._upArrowSprite.visible = false;
};

Window_LanguageCommand.prototype.updatePlacement = function() {
	this.x = Math.floor((Graphics.boxWidth - this.width) / 2);
	this.y = Math.floor((Graphics.boxHeight - this.height) / 2) + 40;
};

Window_LanguageCommand.prototype.makeCommandList = function() {
	if(!SRDT) return;
	this.addCommand(SRDT.sourceName, 'lang', true, 0);
	for(var i = 0; i < SRDT.languages.length; i++) {
		this.addCommand(SRDT.languages[i], 'lang', true, i + 1);
	}
};

Window_LanguageCommand.prototype.selectCurrentLanguage = function() {
	var current = ConfigManager.language || 0;
	for(var i = 0; i < this._list.length; i++) {
		if(this._list[i].ext === current) {
			this.select(i);
			return;
		}
	}
	this.select(0);
};

Window_LanguageCommand.prototype.windowWidth = function() {
	if($.optionWidth > 0) {
		return $.optionWidth + this.standardPadding() * 2;
	}
	var width = 240;
	for(var i = 0; i < this._list.length; i++) {
		var text = this._list[i].name;
		var textWidth = this.textWidthEx(text);
		width = Math.max(width, textWidth + this.textPadding() * 2 + this.standardPadding() * 2 + 40);
	}
	return width;
};

Window_LanguageCommand.prototype.itemHeight = function() {
	return $.optionHeight + $.optionSpacing;
};

Window_LanguageCommand.prototype.textWidthEx = function(text) {
	if(!$._measureBitmap) {
		$._measureBitmap = new Bitmap(1, 1);
		$._measureBitmap.fontFace = $._measureBitmap.fontFace;
		$._measureBitmap.fontSize = 28;
	}
	return $._measureBitmap.measureTextWidth(text);
};

Window_LanguageCommand.prototype.numVisibleRows = function() {
	return this._list ? this._list.length : 1;
};

// itemHeight()를 (막대 높이 + 간격)으로 바꿨기 때문에, 기본 windowHeight
// (줄 높이 기준)로는 모든 항목이 창 안에 들어가지 못해 스크롤이 생긴다.
// 창 높이를 항목 전체가 들어가도록 직접 계산한다.
Window_LanguageCommand.prototype.windowHeight = function() {
	return this.numVisibleRows() * this.itemHeight() + this.standardPadding() * 2;
};

// 항목이 전부 보이므로 스크롤이 절대 일어나지 않게 막는다.
// (스프라이트는 고정 위치라 창이 스크롤되면 어긋난다)
Window_LanguageCommand.prototype.ensureCursorVisible = function() {
};

Window_LanguageCommand.prototype.maxCols = function() {
	return 1;
};

Window_LanguageCommand.prototype.itemTextAlign = function() {
	return 'center';
};

// Visuals are handled entirely by Sprite_LanguageOption; this window stays
// invisible and only exists for its input/cursor/click-handling logic.
Window_LanguageCommand.prototype.drawItem = function(index) {
};

Window_LanguageCommand.prototype._refreshCursor = function() {
};

Window_LanguageCommand.prototype._updateArrows = function() {
	if(this._downArrowSprite) this._downArrowSprite.visible = false;
	if(this._upArrowSprite) this._upArrowSprite.visible = false;
};

//=============================================================================
// Sprite_LanguageOption
//
// Draws one selectable language option as a horizontal gradient bar with
// centered label text. When selected, it gently pulses (breathing scale +
// brightness) to draw the eye, rather than sitting static like the rest.
//=============================================================================

function Sprite_LanguageOption() {
	this.initialize.apply(this, arguments);
}

Sprite_LanguageOption.prototype = Object.create(Sprite.prototype);
Sprite_LanguageOption.prototype.constructor = Sprite_LanguageOption;

Sprite_LanguageOption.prototype.initialize = function(text) {
	Sprite.prototype.initialize.call(this);
	this._text = text;
	this._selected = false;
	this._animCount = 0;
	this.anchor.x = 0.5;
	this.anchor.y = 0.5;
};

Sprite_LanguageOption.prototype.setSize = function(width, height) {
	this._optionWidth = width;
	this._optionHeight = height;
	this.x += Math.floor(width / 2);
	this.y += Math.floor(height / 2);
	this.bitmap = new Bitmap(width, height);
	this.refresh();
};

Sprite_LanguageOption.prototype.currentImageName = function() {
	return this._selected ? $.optionImageSelected : $.optionImage;
};

Sprite_LanguageOption.prototype.refresh = function() {
	var imageName = this.currentImageName();
	if(imageName) {
		this._bgBitmap = ImageManager.loadPicture(imageName);
		if(!this._bgBitmap.isReady()) {
			this._bgBitmap.addLoadListener(this.refresh.bind(this));
			return;
		}
	} else {
		this._bgBitmap = null;
	}
	this.drawContents();
};

Sprite_LanguageOption.prototype.drawContents = function() {
	var w = this._optionWidth;
	var h = this._optionHeight;
	this.bitmap.clear();

	if(this._bgBitmap) {
		// User-supplied background image, stretched to the bar's size.
		this.bitmap.blt(this._bgBitmap, 0, 0, this._bgBitmap.width, this._bgBitmap.height, 0, 0, w, h);
	} else {
		// Default: dark-to-light horizontal gradient bar.
		this.bitmap.gradientFillRect(0, 0, w, h, 'rgba(40, 40, 40, 0.9)', 'rgba(255, 255, 255, 0.9)', false);
	}

	// Centered label text with a soft outline for readability regardless
	// of what's behind it.
	this.bitmap.fontSize = 26;
	this.bitmap.outlineWidth = 5;
	this.bitmap.outlineColor = 'rgba(0, 0, 0, 0.6)';
	this.bitmap.textColor = '#ffffff';
	this.bitmap.drawText(this._text, 0, 0, w, h, 'center');
};

Sprite_LanguageOption.prototype.setSelected = function(selected) {
	if(this._selected === selected) return;
	this._selected = selected;
	if(!selected) {
		this._animCount = 0;
		this.scale.x = 1;
		this.scale.y = 1;
		this.opacity = 255;
	}
	if($.optionImage !== $.optionImageSelected) {
		this.refresh();
	}
};

Sprite_LanguageOption.prototype.update = function() {
	Sprite.prototype.update.call(this);
	if(this._selected) {
		this._animCount++;
		// Gentle breathing pulse: grows/shrinks and brightens/dims in a
		// smooth cycle rather than a jarring on/off blink.
		var wave = Math.sin(this._animCount * 0.12);
		var scale = 1 + wave * 0.06;
		this.scale.x = scale;
		this.scale.y = scale;
		this.opacity = 220 + wave * 35;
	}
};

})(LSS);
