//=============================================================================
// TitleLanguageSelect.js
//=============================================================================

/*:
 * @plugindesc 타이틀 화면에서 언어(한국어/English/日本語 등)를 선택하면
 * 그 즉시 게임 전체 텍스트가 해당 언어로 표시됩니다. (SRD_TranslationEngine 필요)
 * @author ㄹㅅㅁ & Claude
 *
 * @help
 * ===========================================================================
 *  사용 전 필수 조건
 * ===========================================================================
 * 1) 이 플러그인은 반드시 SRD_TranslationEngine 보다 아래에 배치하세요.
 *
 * 2) SRD_TranslationEngine의 [Languages] 파라미터에 "English", "Japanese"
 *    등 원하는 언어 이름을 등록해야 합니다. (예: ["English","Japanese"])
 *    이 이름들은 Translations.json / 번역 앱(Ctrl+T)에서 사용하는 언어 키와
 *    정확히 같은 철자여야 합니다.
 *
 * 3) 일본어를 지원하려면 English와 마찬가지로 번역 앱(Ctrl+T)이나
 *    Translations.json에 "Japanese" 번역을 채워 넣어야 실제로 일본어 텍스트가
 *    나옵니다. (플러그인 자체는 이미 등록된 언어를 "선택"만 가능하게 해줄 뿐,
 *    번역 데이터는 별도로 채워야 합니다.)
 *
 * ===========================================================================
 *  동작 방식
 * ===========================================================================
 * 게임을 처음 실행해 타이틀 화면이 뜨면, 기존 타이틀 커맨드(게임 시작 등)는
 * 잠시 숨겨지고 언어 선택 창이 중앙에 나타납니다. 언어를 고르면 즉시 그
 * 언어로 타이틀 화면을 다시 불러옵니다(타이틀 로고/커맨드 텍스트 포함).
 * 한 번 고르고 나면, 그 이후 타이틀로 돌아올 때는(예: 옵션 화면에서 뒤로가기,
 * 게임오버 후 타이틀 복귀) 다시 뜨지 않습니다.
 *
 * ===========================================================================
 *  플러그인 커맨드
 * ===========================================================================
 *   ShowLanguageSelect
 *     - 아무 이벤트에서나 호출하면 타이틀로 돌아가면서 언어 선택창을
 *       다시 띄웁니다. (타이틀에 "언어 변경" 커맨드를 추가하고 싶을 때 등)
 */

var Imported = Imported || {};
Imported.TitleLanguageSelect = true;

(function() {

//-----------------------------------------------------------------------------
// SRD_TranslationEngine 파라미터에서 언어 목록을 그대로 가져온다.
//-----------------------------------------------------------------------------

var params = PluginManager.parameters('SRD_TranslationEngine');
var sourceLabel = '한국어';
var languages = [];
try {
	languages = JSON.parse(params['Languages'] || '[]');
} catch (e) {
	languages = [];
}

var _languageChosenThisSession = false;

//-----------------------------------------------------------------------------
// Window_TitleLanguage
//-----------------------------------------------------------------------------

function Window_TitleLanguage() {
	this.initialize.apply(this, arguments);
}

Window_TitleLanguage.prototype = Object.create(Window_Command.prototype);
Window_TitleLanguage.prototype.constructor = Window_TitleLanguage;

Window_TitleLanguage.prototype.initialize = function() {
	Window_Command.prototype.initialize.call(this, 0, 0);
	this.updatePlacement();
};

Window_TitleLanguage.prototype.updatePlacement = function() {
	this.x = (Graphics.boxWidth - this.width) / 2;
	this.y = (Graphics.boxHeight - this.height) / 2;
};

Window_TitleLanguage.prototype.windowWidth = function() {
	return 280;
};

Window_TitleLanguage.prototype.windowHeight = function() {
	return this.fittingHeight(this.numVisibleRows());
};

Window_TitleLanguage.prototype.numVisibleRows = function() {
	return languages.length + 1;
};

Window_TitleLanguage.prototype.makeCommandList = function() {
	this.addCommand(sourceLabel, 'lang0');
	for (var i = 0; i < languages.length; i++) {
		this.addCommand(languages[i], 'lang' + (i + 1));
	}
};

//-----------------------------------------------------------------------------
// Scene_Title
//-----------------------------------------------------------------------------

var _Scene_Title_create = Scene_Title.prototype.create;
Scene_Title.prototype.create = function() {
	_Scene_Title_create.call(this);
	if (!_languageChosenThisSession) {
		this.createLanguageSelectWindow();
	}
};

Scene_Title.prototype.createLanguageSelectWindow = function() {
	if (this._commandWindow) {
		this._commandWindow.deactivate();
		this._commandWindow.hide();
	}
	this._languageWindow = new Window_TitleLanguage();
	for (var i = 0; i <= languages.length; i++) {
		this._languageWindow.setHandler('lang' + i, this.onTitleLanguageOk.bind(this, i));
	}
	this.addWindow(this._languageWindow);
};

Scene_Title.prototype.onTitleLanguageOk = function(index) {
	ConfigManager.language = index;
	ConfigManager.save();
	_languageChosenThisSession = true;
	SceneManager.goto(Scene_Title);
};

//-----------------------------------------------------------------------------
// 플러그인 커맨드: ShowLanguageSelect
//-----------------------------------------------------------------------------

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	_Game_Interpreter_pluginCommand.apply(this, arguments);
	if (command.trim().toLowerCase() === 'showlanguageselect') {
		_languageChosenThisSession = false;
		SceneManager.goto(Scene_Title);
	}
};

})();
