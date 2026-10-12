//=============================================================================
// SkillVideoIntro.js
//=============================================================================
/*:
 * @plugindesc 특정 스킬 사용 시 전체화면 동영상을 재생한 후 스킬을 발동합니다.
 * @author Claude
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 데이터베이스 > 스킬 > 메모란에 아래 태그를 입력하세요.
 *
 *   <Skill Video: 파일명>
 *
 * 예) <Skill Video: fatality_ryu>
 *   -> movies/fatality_ryu.webm (또는 .mp4) 재생
 *
 * 파일은 프로젝트의 movies 폴더에 넣어야 합니다. 파일명은 영문/숫자만
 * 사용하고 공백 없이 적어주세요. 확장자는 적지 마세요.
 *
 * 동영상이 끝나면 자동으로 스킬의 나머지 연출(캐스트 애니메이션, 데미지 등)이
 * 이어서 진행됩니다.
 *
 * ※ YEP_BattleEngineCore가 필요합니다. 이 플러그인은 그 아래에 위치시켜
 * 주세요.
 * ============================================================================
 */

(function() {

  var SVI_TIMEOUT_FRAMES = 300; // 5초(60fps 기준) 동안 진행이 없으면 강제 종료

  var _SVI_forceEndVideo = function() {
    var video = Graphics._video;
    if (video) {
      try { video.pause(); } catch (e) {}
    }
    Graphics._videoLoading = false;
    if (typeof Graphics._updateVisibility === 'function') {
      Graphics._updateVisibility(false);
    }
  };

  var _SVI_getVideoName = function(item) {
    if (!item || !item.meta) return null;
    var name = item.meta['Skill Video'];
    if (!name) return null;
    return name.trim();
  };

  var _SVI_getVideoUrl = function(videoName) {
    var ext = (Graphics.canPlayVideoType('video/webm') && !Utils.isMobileDevice())
      ? '.webm' : '.mp4';
    return 'movies/' + videoName + ext;
  };

  //--------------------------------------------------------------------------
  // 프리로드: 액션 시작 전에 브라우저가 미리 파일을 받아두게 함
  // (재생 시점에 처음 로드하면서 버퍼링 때문에 멈추는 걸 방지)
  //--------------------------------------------------------------------------

  var _SVI_preloadCache = {};

  var _SVI_preloadVideo = function(url) {
    if (_SVI_preloadCache[url]) return;
    var video = document.createElement('video');
    video.src = url;
    video.preload = 'auto';
    video.load();
    _SVI_preloadCache[url] = video;
  };

  var _SVI_BattleManager_startAction = BattleManager.startAction;
  BattleManager.startAction = function() {
    _SVI_BattleManager_startAction.call(this);
    var videoName = _SVI_getVideoName(this._action.item());
    if (videoName) {
      _SVI_preloadVideo(_SVI_getVideoUrl(videoName));
    }
  };

  //--------------------------------------------------------------------------
  // BattleManager - 액션 시퀀스에 SVI VIDEO 명령 삽입
  //--------------------------------------------------------------------------

  var _SVI_BattleManager_createSetupActions = BattleManager.createSetupActions;
  BattleManager.createSetupActions = function() {
    _SVI_BattleManager_createSetupActions.call(this);
    var videoName = _SVI_getVideoName(this._action.item());
    if (videoName) {
      this._actionList.unshift(['SVI VIDEO', [videoName]]);
    }
  };

  var _SVI_BattleManager_processActionSequence =
    BattleManager.processActionSequence;
  BattleManager.processActionSequence = function(actionName, actionArgs) {
    if (actionName === 'SVI VIDEO') {
      return this.actionSviVideo(actionArgs[0]);
    }
    return _SVI_BattleManager_processActionSequence.call(
      this, actionName, actionArgs);
  };

  BattleManager.actionSviVideo = function(videoName) {
    this._sviVideoBusy = true;
    this._sviVideoTimer = 0;
    this._sviStallFrames = 0;
    this._sviLastTime = -1;
    Graphics.playVideo(_SVI_getVideoUrl(videoName));
    return false;
  };

  var _SVI_BattleManager_isBusy = BattleManager.isBusy;
  BattleManager.isBusy = function() {
    if (this._sviVideoBusy) return true;
    return _SVI_BattleManager_isBusy.call(this);
  };

  var _SVI_BattleManager_update = BattleManager.update;
  BattleManager.update = function() {
    if (this._sviVideoBusy) {
      if (!Graphics.isVideoPlaying()) {
        this._sviVideoBusy = false;
      } else {
        var video = Graphics._video;
        var currentTime = video ? video.currentTime : 0;
        if (currentTime === this._sviLastTime) {
          this._sviStallFrames = (this._sviStallFrames || 0) + 1;
        } else {
          this._sviStallFrames = 0;
          this._sviLastTime = currentTime;
        }
        this._sviVideoTimer = (this._sviVideoTimer || 0) + 1;
        // 재생 위치가 일정 시간(약 2초) 그대로 멈춰있으면 버퍼링/정지로 판단하고 강제 종료
        // 혹시 몰라 절대 타임아웃(SVI_TIMEOUT_FRAMES)도 백업으로 둠
        if (this._sviStallFrames >= 120 || this._sviVideoTimer >= SVI_TIMEOUT_FRAMES) {
          _SVI_forceEndVideo();
          this._sviVideoBusy = false;
        }
      }
    }
    _SVI_BattleManager_update.call(this);
  };

})();
