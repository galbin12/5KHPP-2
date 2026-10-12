//=============================================================================
// LanguageFontSwitch.js
//=============================================================================

/*:
 * @plugindesc 현재 선택된 언어(ConfigManager.getLanguage())가 "日本語"일 때
 * 게임 전체 폰트를 일본어 폰트로 전환합니다. (SRD_TranslationEngine 필요) (v1.0.0)
 * @author Claude
 *
 * @param JP Font Name
 * @desc 일본어 폰트로 사용할 font-family 이름 (gamefont.css에 등록한 이름과 동일해야 함)
 * @default GameFont_JP
 *
 * @param JP Font File
 * @desc fonts 폴더에 넣은 일본어 폰트 파일명
 * @default x14y24pxHeadUpDaisy.ttf
 *
 * @param JP Language Key
 * @desc SRD_TranslationEngine의 Languages 파라미터에 등록한 일본어 언어명
 * @default 日本語
 *
 * @help
 * ============================================================================
 * 동작 방식
 * ============================================================================
 * SRD_TranslationEngine + TitleLanguageSelect로 언어를 "日本語"로 선택하면,
 * 그 이후로 그려지는 모든 텍스트(메시지, 선택지, 메뉴, 이름 등)가 자동으로
 * 일본어 폰트로 표시됩니다. 다른 언어(한국어/English)를 선택하면 원래
 * 폰트(GameFont)로 돌아갑니다.
 *
 * 글자 하나하나를 검사하는 방식이 아니라, "지금 선택된 언어가 일본어인가"만
 * 확인하기 때문에 SRD_TranslationEngine의 번역 로직과 전혀 간섭하지 않습니다.
 *
 * ============================================================================
 * 배치 순서
 * ============================================================================
 * - SRD_TranslationEngine, TitleLanguageSelect, RS_MessageSystem 보다
 *   반드시 아래에 두세요.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.LanguageFontSwitch = true;

var LFS = LFS || {};

(function () {
  "use strict";

  var parameters = PluginManager.parameters("LanguageFontSwitch");
  LFS.Params = {
    jpFontName: String(parameters["JP Font Name"] || "GameFont_JP"),
    jpFontFile: String(parameters["JP Font File"] || "x14y24pxHeadUpDaisy.ttf"),
    jpLanguageKey: String(parameters["JP Language Key"] || "日本語"),
  };

  function isJapaneseLanguage() {
    if (typeof ConfigManager.getLanguage !== "function") {
      return false;
    }
    return ConfigManager.getLanguage() === LFS.Params.jpLanguageKey;
  }

  //===========================================================================
  // Scene_Boot - 폰트 로드
  //===========================================================================

  var _Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
  Scene_Boot.loadSystemImages = function () {
    _Scene_Boot_loadSystemImages.call(this);
    Graphics.loadFont(LFS.Params.jpFontName, "fonts/" + LFS.Params.jpFontFile);
  };

  // 기본 GameFont만 기다리는 코어의 로직에, 일본어 폰트 로딩 완료도 추가로 기다리게 함
  var _Scene_Boot_isGameFontLoaded = Scene_Boot.prototype.isGameFontLoaded;
  Scene_Boot.prototype.isGameFontLoaded = function () {
    var baseReady = _Scene_Boot_isGameFontLoaded.call(this);
    if (!baseReady) {
      return false;
    }
    if (Graphics.isFontLoaded(LFS.Params.jpFontName)) {
      return true;
    } else if (!Graphics.canUseCssFontLoading()) {
      var elapsed = Date.now() - this._startDate;
      if (elapsed >= 60000) {
        SceneManager.stop();
      }
      return false;
    }
    return false;
  };

  //===========================================================================
  // Window_Base - 언어가 일본어면 기본 폰트를 통째로 교체
  //===========================================================================

  var _Window_Base_standardFontFace = Window_Base.prototype.standardFontFace;
  Window_Base.prototype.standardFontFace = function () {
    if (isJapaneseLanguage()) {
      return LFS.Params.jpFontName;
    }
    return _Window_Base_standardFontFace.call(this);
  };

  // RS_MessageSystem이 Window_Message.prototype.standardFontFace를
  // 자체적으로(own property) 재정의하고 있어서, Window_Base 후킹만으로는
  // 실제 대화창(Window_Message)에 적용되지 않음. 별도로 한 번 더 후킹.
  // (이 플러그인은 반드시 RS_MessageSystem보다 아래에 배치해야 함)
  var _Window_Message_standardFontFace =
    Window_Message.prototype.standardFontFace;
  Window_Message.prototype.standardFontFace = function () {
    if (isJapaneseLanguage()) {
      return LFS.Params.jpFontName;
    }
    return _Window_Message_standardFontFace.call(this);
  };
})();
