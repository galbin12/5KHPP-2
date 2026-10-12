//=============================================================================
// TranslationEngine_CommandPatch.js
//=============================================================================

/*:
 * @plugindesc SRD_TranslationEngine 보완 패치: TextManager.command
 * (새 게임/계속/옵션/싸우기/도망 등 terms.commands 관련 텍스트) 번역 지원 추가.
 * @author ㄹㅅㅁ & Claude
 *
 * @help
 * ===========================================================================
 *  사용 방법
 * ===========================================================================
 * 1) 반드시 SRD_TranslationEngine 보다 "아래"에 배치하세요.
 *    (SRD_TranslationEngine.js 파일 자체는 전혀 수정하지 않습니다.)
 *
 * 2) Translations.json의 "terms" 항목에 다음과 같은 키로 번역을 채워 넣으면
 *    됩니다. 인덱스 번호는 System.json의 terms.commands 배열 순서와 같습니다.
 *
 *      "command-11": { "Japanese": "オプション" },   // 옵션
 *      "command-18": { "Japanese": "はじめから" },   // 새 게임
 *      "command-19": { "Japanese": "つづきから" }    // 계속
 *
 * SRD_TranslationEngine 자체는 TextManager.basic / param / message 만
 * 번역하고 TextManager.command(새 게임, 계속, 옵션, 싸우기, 도망, 공격 등)는
 * 다루지 않으며, 코어 스크립트가 부팅 시 해당 값들을 한 번만 계산해서
 * 고정 문자열로 저장해버리기 때문에 이 부분을 보완합니다.
 */

var Imported = Imported || {};
Imported.TranslationEngine_CommandPatch = true;

(function() {

if (typeof ConfigManager.isDefaultLanguage !== 'function' || typeof TextManager.command !== 'function') {
	console.warn('TranslationEngine_CommandPatch requires SRD_TranslationEngine to be enabled above it.');
	return;
}

var _TextManager_command = TextManager.command;
TextManager.command = function(commandId) {
	if (ConfigManager.isDefaultLanguage()) return _TextManager_command.apply(this, arguments);
	var lang = ConfigManager.getLanguage();
	var id = 'command-' + commandId;
	var data = $dataTranslations['terms'];
	if (data[id] && data[id][lang]) {
		return data[id][lang];
	} else {
		return _TextManager_command.apply(this, arguments);
	}
};

// rpg_managers.js caches these as plain strings once at boot (via
// TextManager[name] = TextManager.command(j)), so we convert them into
// live getters that always re-evaluate through the patched command() above.
var properties = ['fight', 'escape', 'attack', 'guard', 'item', 'skill', 'equip', 'status',
		'formation', 'save', 'gameEnd', 'options', 'weapon', 'armor', 'keyItem', 'equip2',
		'optimize', 'clear', 'newGame', 'continue_', 'toTitle', 'cancel', 'pageup', 'pagedown',
		'buy', 'sell'];
for (var j = 0; j < properties.length; j++) {
	(function(name, index) {
		Object.defineProperty(TextManager, name, {
			get: function() { return TextManager.command(index); },
			configurable: true
		});
	})(properties[j], j);
}

// Same caching problem for basic stat labels (Level, HP, MP, TP, EXP...).
var basicProperties = ['level', 'levelA', 'hp', 'hpA', 'mp', 'mpA', 'tp', 'tpA', 'exp', 'expA'];
for (var b = 0; b < basicProperties.length; b++) {
	(function(name, index) {
		Object.defineProperty(TextManager, name, {
			get: function() { return TextManager.basic(index); },
			configurable: true
		});
	})(basicProperties[b], b);
}

// And for the Options-scene labels (달리기/명령 기억/BGM 볼륨 etc.), which are
// cached from TextManager.message(name) once at boot the same way.
var messageProperties = ['alwaysDash', 'commandRemember', 'bgmVolume', 'bgsVolume', 'meVolume', 'seVolume'];
for (var m = 0; m < messageProperties.length; m++) {
	(function(name) {
		Object.defineProperty(TextManager, name, {
			get: function() { return TextManager.message(name); },
			configurable: true
		});
	})(messageProperties[m]);
}

})();
