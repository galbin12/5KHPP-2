//=============================================================================
// LogoLanguageImages.js
//=============================================================================

/*:
 * @plugindesc (v1.01) CustomLogo.js의 인트로 로고 이미지를 선택된 언어에 따라
 * 다른 그림으로 교체합니다. (CustomLogo.js + SRD_TranslationEngine 필요)
 * @author ㄹㅅㅁ + Claude
 *
 * @help
 * ===========================================================================
 *  Logo Language Images
 * ===========================================================================
 *
 * 이 플러그인은 CustomLogo.js 와 SRD_TranslationEngine 이 필요합니다.
 * 반드시 두 플러그인보다 아래쪽(플러그인 목록에서 더 아래)에 배치하세요.
 *
 * ===========================================================================
 *  사용법
 * ===========================================================================
 *
 * CustomLogo.js 의 [Logo 1/2/3 Image Name] 파라미터에 적어둔 파일 이름을
 * "기본 파일명"으로 간주합니다. 예를 들어 [Logo 3 Image Name] 이
 *
 *   Warning
 *
 * 라면, img/system 폴더에 다음과 같이 언어별 그림을 추가로 준비하세요:
 *
 *   Warning.png            (기본/원본 언어 - 항상 필요)
 *   Warning_English.png    (English 로 등록된 언어)
 *   Warning_Spanish.png    (Spanish 로 등록된 언어)
 *
 * 즉, "기본파일명_언어이름.png" 형식입니다. 언어 이름은
 * SRD_TranslationEngine 의 [Languages] 파라미터에 적은 이름과
 * 정확히 똑같이 맞춰야 합니다 (대소문자/띄어쓰기까지 동일하게).
 *
 * 게임이 현재 선택된 언어에 맞는 파일을 찾으면 그 그림을 사용하고,
 * 만약 해당 언어의 파일이 없으면 자동으로 기본 파일(Warning.png)을
 * 대신 사용합니다. 즉, 모든 언어마다 그림을 다 준비할 필요 없이,
 * 다르게 보여주고 싶은 로고만 언어별로 추가하면 됩니다.
 *
 * Logo 1(RPG Maker 로고)처럼 언어와 상관없는 이미지는 그냥 그대로
 * 두면 됩니다 - 파일이 없으면 알아서 기본 파일을 사용하니 안전합니다.
 *
 * ===========================================================================
 *  주의사항
 * ===========================================================================
 *
 * 파일 존재 여부 확인은 NW.js 환경(테스트 플레이 및 배포된 실행 파일)에서만
 * 동작합니다. 브라우저에서 직접 실행하는 경우에는 항상 기본 파일만 사용됩니다.
 *
 * (내부 구현 참고: CustomLogo.js의 Scene_Logo는 CustomLogo.js 자체의
 * 클로저 안에 감춰져 있어 외부에서 직접 건드릴 수 없습니다. 그래서 이
 * 플러그인은 Scene_Logo를 직접 건드리는 대신, 전역 ImageManager.loadSystem
 * 함수를 감싸서 CustomLogo.js가 등록해둔 로고 파일명과 일치할 때만
 * 언어별 파일로 바꿔치기하는 방식으로 동작합니다.)
 *
 */

var Imported = Imported || {};
Imported.LogoLanguageImages = true;

var LLI = LLI || {};

(function($) {

"use strict";

var customLogoParams = PluginManager.parameters('CustomLogo');
if(!customLogoParams || Object.keys(customLogoParams).length === 0) {
	console.warn('LogoLanguageImages requires CustomLogo.js to be installed above it.');
}

var SRDT = (window.SRD && window.SRD.TranslationEngine) ? window.SRD.TranslationEngine : null;
if(!SRDT) {
	console.warn('LogoLanguageImages requires SRD_TranslationEngine to be installed above it.');
}

//-----------------------------------------------------------------------------
// Collect the base logo filenames straight from CustomLogo.js's own
// plugin parameters, so we know exactly which ImageManager.loadSystem
// calls to intercept.
//-----------------------------------------------------------------------------

$.logoBaseNames = {};
['logo1ImageName', 'logo2ImageName', 'logo3ImageName'].forEach(function(key) {
	var name = customLogoParams && customLogoParams[key];
	if(name) $.logoBaseNames[name] = true;
});

var fs = null;
try {
	fs = require('fs');
} catch(e) {
	fs = null;
}

//-----------------------------------------------------------------------------
// Resolve a base "img/system" filename into its language-specific variant,
// falling back to the base name if no matching file exists.
//-----------------------------------------------------------------------------

$.resolveFilename = function(baseName) {
	if(!baseName || !$.logoBaseNames[baseName]) return baseName;
	if(!fs || !SRDT) return baseName;
	if(ConfigManager.isDefaultLanguage()) return baseName;

	var lang = ConfigManager.getLanguage();
	if(!lang) return baseName;

	var variantName = baseName + '_' + lang;
	if($.fileExists(variantName)) {
		return variantName;
	}
	return baseName;
};

$.fileExists = function(filename) {
	try {
		var path = $.systemImagePath(filename);
		return fs.existsSync(path);
	} catch(e) {
		return false;
	}
};

$.systemImagePath = function(filename) {
	// NOTE: window.location.pathname produces malformed paths on Windows
	// (e.g. a leading "/" before "C:\..."), which made fs.existsSync
	// always fail and silently fall back to the base (Korean) image no
	// matter what language was picked. Building the path off of the
	// running Node process instead (which is what NW.js actually is)
	// is reliable on both Windows and Mac.
	try {
		var path = require('path');
		var baseDir = path.dirname(process.mainModule.filename);
		return path.join(baseDir, 'img', 'system', filename + '.png');
	} catch(e) {
		return 'img/system/' + filename + '.png';
	}
};

//-----------------------------------------------------------------------------
// ImageManager
//
// Wrap loadSystem globally. This works regardless of whether Scene_Logo
// (or any other caller) is reachable from outside its own plugin's
// closure, since it's the same shared ImageManager either way.
//-----------------------------------------------------------------------------

$.ImageManager_loadSystem = ImageManager.loadSystem;
ImageManager.loadSystem = function(filename, hue) {
	return $.ImageManager_loadSystem.call(this, $.resolveFilename(filename), hue);
};

})(LLI);
