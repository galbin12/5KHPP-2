//=============================================================================
// SkillImageIntro.js
//=============================================================================
/*:
 * @plugindesc 특정 스킬 사용 시 투명 PNG 이미지가 화면보다 크게 빠르게
 * 팝인된 후 화면 크기까지 천천히 작아지고, 다시 빠르게 작아지며
 * 페이드아웃된 후 스킬이 발동합니다.
 * @author Claude
 *
 * @param Pop Frames
 * @desc 화면보다 큰 크기(Overscale)로 확 나타나는 데 걸리는 프레임 수.
 * 아주 짧게(예: 3~6) 두면 "팝인"처럼 개빠르게 커집니다.
 * @type number
 * @min 1
 * @default 5
 *
 * @param Slow Shrink Frames
 * @desc [1단계] Overscale 크기에서 화면에 딱 맞는 크기(1.0)까지
 * 작아지는(=커졌다가 화면 채우는) 데 걸리는 프레임 수.
 * @type number
 * @min 1
 * @default 45
 *
 * @param Hold Shrink Frames
 * @desc [2단계] 화면에 꽉 찬 크기(1.0)에서 Hold Shrink Scale까지 계속
 * 작아지는(페이드 없이) 데 걸리는 프레임 수. 0으로 두면 이 단계를
 * 건너뜁니다.
 * @type number
 * @min 0
 * @default 30
 *
 * @param Hold Shrink Scale
 * @desc [2단계]가 끝나는 시점의 배율 (화면 크기 1.0 기준). End Scale보다
 * 커야 합니다. 예: 0.85
 * @type number
 * @decimals 2
 * @default 0.85
 *
 * @param Fade Frames
 * @desc [3단계] Hold Shrink Scale에서 End Scale까지 빠르게 작아지면서
 * 동시에 페이드아웃(=사라지는)되는 데 걸리는 프레임 수
 * @type number
 * @min 1
 * @default 6
 *
 * @param Overscale
 * @desc 시작 시 도달하는 최대 배율. 1.0 = 화면 꽉 채움, 6.0 = 화면보다
 * 6배 크게. 값을 키울수록 처음에 훨씬 크게 시작합니다.
 * @type number
 * @decimals 2
 * @default 7
 *
 * @param End Scale
 * @desc 페이드가 끝나는 시점(완전히 사라지는 순간)의 배율. 화면 크기(1.0)
 * 보다 작은 값을 넣으면 화면보다 작아진 상태에서 사라집니다.
 * @type number
 * @decimals 2
 * @default 0.7
 *
 * @param Image Folder
 * @desc 이미지를 불러올 하위 폴더명. img/pictures/ 아래에 이 이름의
 * 폴더를 만들어서 그 안에 이미지를 넣으면 됩니다. 비워두면 img/pictures/
 * 바로 아래에서 찾습니다.
 * @default skillcuts
 *
 * @param Default SE Name
 * @desc 스킬 메모란에 SE를 따로 지정하지 않았을 때 재생할 기본 효과음
 * 파일명 (audio/se 폴더 기준, 확장자 제외). 비워두면 재생 안 함.
 * @default
 *
 * @param Default SE Volume
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param Default SE Pitch
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param Default SE Pan
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @param Show Skill Name
 * @desc 이미지 위에 스킬 이름 배너를 표시할지 여부
 * @type boolean
 * @default true
 *
 * @param Name Bar Height
 * @desc 스킬 이름 배너(가로 띠)의 높이(px)
 * @type number
 * @min 10
 * @default 60
 *
 * @param Name Bar Y
 * @desc 배너의 세로 위치. 화면 중앙(0) 기준 위/아래 오프셋(px). 음수면
 * 위로, 양수면 아래로 이동합니다. 예: -280이면 화면 상단 부근에 표시됩니다.
 * @type number
 * @default -280
 *
 * @param Name Bar Color
 * @desc 배너 중심부의 색상 (16진수 hex, 예: #000000)
 * @default #000000
 *
 * @param Name Font Size
 * @type number
 * @min 10
 * @default 32
 *
 * @param Name Font Face
 * @desc 비워두면 게임 기본 폰트를 사용합니다.
 * @default
 *
 * @param Name Text Color
 * @desc 스킬 이름 글자 색상 (16진수 hex)
 * @default #ffffff
 *
 * @param Name Travel Distance
 * @desc 배너가 좌우로 이동하는 거리(px). 왼쪽에서 중앙으로 들어왔다가
 * 중앙에서 오른쪽으로 빠져나가는 이동폭입니다.
 * @type number
 * @min 0
 * @default 350
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 데이터베이스 > 스킬 > 메모란에 아래 태그를 입력하세요.
 *
 *   <Skill Image: 파일명>
 *
 * 예) <Skill Image: ryu_fatality>
 *   -> Image Folder 파라미터가 "skillcuts"(기본값)라면
 *      img/pictures/skillcuts/ryu_fatality.png 를 사용합니다.
 *   -> Image Folder 파라미터를 비워두면 img/pictures/ryu_fatality.png 를
 *      사용합니다.
 *
 * ----------------------------------------------------------------------------
 * 같은 스킬인데 액터 외형(스위치)에 따라 이미지 바꾸기
 * ----------------------------------------------------------------------------
 * 같은 스킬이라도 특정 스위치가 켜져 있을 때 다른 이미지를 쓰고 싶다면,
 * 태그를 여러 줄 겹쳐서 적으면 됩니다.
 *
 *   <Skill Image: 기본파일명>
 *   <Skill Image: switch:10 외형변경후파일명>
 *
 * 예)
 *   <Skill Image: ryu_fatality>
 *   <Skill Image: switch:10 ryu_fatality_awaken>
 *
 *   -> 10번 스위치가 꺼져 있으면 ryu_fatality.png, 켜져 있으면
 *      ryu_fatality_awaken.png 를 사용합니다.
 *
 * switch 조건 태그는 여러 개 겹쳐 써도 되며, 이 경우 켜져 있는 스위치
 * 조건들 중 "가장 아래에 적힌" 것이 우선 적용됩니다(EnemyImageSwitch와
 * 동일한 규칙). 조건이 있는 태그가 하나도 만족되지 않으면 조건 없는
 * <Skill Image: 파일명> 태그(기본 이미지)가 사용됩니다.
 * 조건 없는 기본 태그 없이 switch 태그만 있고 그 스위치가 꺼져 있다면
 * 이미지가 표시되지 않고(연출 생략) 스킬이 곧바로 진행됩니다.
 *
 * 이미지는 프로젝트의 img/pictures 폴더(또는 그 안의 Image Folder로 지정한
 * 하위 폴더)에 넣어야 하며, 배경이 투명한 PNG를 권장합니다.
 * 하위 폴더를 사용하면 배포 시 이미지가 디플로이어의 "미사용 파일 제외"
 * 기능에 의해 삭제되지 않도록, 프로젝트의 img/pictures 폴더 안에 실제로
 * 해당 폴더와 파일을 만들어 두세요 (RPG Maker MV 에디터가 인식하지 못해도
 * 상관없습니다).
 *
 * 연출 순서 (3단계)
 *   1) [커졌다가 화면 채우기] Overscale 크기로 팝인된 후, Slow Shrink
 *      Frames 동안 화면에 딱 맞는 크기(1.0)까지 작아집니다. 이 시작
 *      시점에 SE가 재생됩니다.
 *   2) [화면 채운 채로 계속 줄어들기] Hold Shrink Frames 동안 화면
 *      크기(1.0)에서 Hold Shrink Scale까지 페이드 없이 계속 작아집니다.
 *      (Hold Shrink Frames를 0으로 두면 이 단계는 생략됩니다.)
 *   3) [사라지기] Fade Frames 동안 Hold Shrink Scale에서 End Scale까지
 *      빠르게 작아지면서 동시에 페이드아웃됩니다.
 *   4) 연출이 끝나면 스킬의 나머지 연출(캐스트 애니메이션, 데미지 등)이
 *      이어서 진행됩니다.
 *
 * 각 단계는 서로 완전히 독립된 프레임 수를 가지므로, 플러그인 파라미터에서
 * 각 구간의 길이를 따로따로 조절할 수 있습니다.
 *
 * ----------------------------------------------------------------------------
 * 전용 효과음(SE) 지정하기
 * ----------------------------------------------------------------------------
 * 스킬마다 다른 SE를 쓰고 싶으면 메모란에 아래 태그를 추가로 입력하세요.
 *
 *   <Skill Image SE: SE파일명>
 *   <Skill Image SE: SE파일명, 음량, 피치, 좌우>
 *
 * 예)
 *   <Skill Image SE: Explosion1>
 *   <Skill Image SE: Explosion1, 100, 110, 0>
 *
 * 음량/피치/좌우를 생략하면 플러그인 파라미터의 Default SE Volume /
 * Default SE Pitch / Default SE Pan 값이 사용됩니다.
 * 이 태그가 없는 스킬은 플러그인 파라미터의 Default SE Name이 있으면
 * 그 SE가, 없으면 SE 없이 진행됩니다.
 * SE 파일은 audio/se 폴더에 넣어야 합니다.
 *
 * ----------------------------------------------------------------------------
 * 스킬 이름 배너
 * ----------------------------------------------------------------------------
 * Show Skill Name을 켜두면(기본값 ON) 이미지 위에 스킬 이름이 적힌
 * 가로 띠(그라데이션 배너)가 함께 표시됩니다. 배너는 이미지와 같은
 * 속도/타이밍으로 움직입니다:
 *   - 이미지가 커졌다가 화면 크기로 줄어드는 동안(Slow Shrink 구간),
 *     배너는 왼쪽 바깥에서 화면 중앙으로 들어오면서 페이드인됩니다.
 *   - 이미지가 빠르게 줄어들며 페이드아웃되는 동안(Fade 구간), 배너는
 *     중앙에서 오른쪽 바깥으로 빠져나가면서 페이드아웃됩니다.
 * 스킬 이름은 데이터베이스에 입력한 스킬 이름을 그대로 사용합니다.
 * 배너 높이/위치/색상/폰트/이동거리는 플러그인 파라미터에서 조절할 수
 * 있습니다.
 *
 * ※ YEP_BattleEngineCore가 필요합니다. 이 플러그인은 그 아래에 위치시켜
 * 주세요.
 * ============================================================================
 */

(function() {

  var params = PluginManager.parameters('SkillImageIntro');
  var POP_FRAMES = Number(params['Pop Frames'] || 5);
  var SLOW_SHRINK_FRAMES = Number(params['Slow Shrink Frames'] || 45);
  var HOLD_SHRINK_FRAMES = Number(params['Hold Shrink Frames'] || 30);
  var HOLD_SHRINK_SCALE = Number(params['Hold Shrink Scale'] || 0.85);
  var FADE_FRAMES = Number(params['Fade Frames'] || 6);
  var OVERSCALE = Number(params['Overscale'] || 7);
  var END_SCALE = Number(params['End Scale'] || 0.7);
  var IMAGE_FOLDER = String(params['Image Folder'] || '').trim();
  var DEFAULT_SE_NAME = String(params['Default SE Name'] || '').trim();
  var DEFAULT_SE_VOLUME = Number(params['Default SE Volume'] || 90);
  var DEFAULT_SE_PITCH = Number(params['Default SE Pitch'] || 100);
  var DEFAULT_SE_PAN = Number(params['Default SE Pan'] || 0);
  var SHOW_SKILL_NAME = String(params['Show Skill Name'] || 'true') === 'true';
  var NAME_BAR_HEIGHT = Number(params['Name Bar Height'] || 60);
  var NAME_BAR_Y = Number(params['Name Bar Y'] || -280);
  var NAME_BAR_COLOR = String(params['Name Bar Color'] || '#000000');
  var NAME_FONT_SIZE = Number(params['Name Font Size'] || 32);
  var NAME_FONT_FACE = String(params['Name Font Face'] || '').trim();
  var NAME_TEXT_COLOR = String(params['Name Text Color'] || '#ffffff');
  var NAME_TRAVEL_DISTANCE = Number(params['Name Travel Distance'] || 350);

  var _SII_loadPicture = function(imageName) {
    var folder = 'img/pictures/';
    if (IMAGE_FOLDER) {
      folder += IMAGE_FOLDER + '/';
    }
    return ImageManager.loadBitmap(folder, imageName, 0, true);
  };

  // <Skill Image: 파일명> / <Skill Image: switch:N 파일명> 태그를
  // note에서 직접 파싱합니다. (RPG Maker의 meta 파싱은 같은 태그가
  // 여러 번 나오면 마지막 것만 남기기 때문에 switch 조건 여러 개를
  // 동시에 쓸 수 없어, 여기서는 note 원문을 정규식으로 읽습니다.)
  var _SII_getImageRules = function(item) {
    if (!item) return [];
    if (item._siiImageRules) return item._siiImageRules;
    var rules = [];
    var note = item.note || '';
    var regex = /<Skill Image:\s*(?:switch:(\d+)\s+)?([^\r\n>]+?)\s*>/g;
    var match;
    while ((match = regex.exec(note)) !== null) {
      rules.push({
        switchId: match[1] ? Number(match[1]) : null,
        image: match[2].trim()
      });
    }
    item._siiImageRules = rules;
    return rules;
  };

  var _SII_getImageName = function(item) {
    var rules = _SII_getImageRules(item);
    if (rules.length === 0) return null;
    var defaultImage = null;
    var overrideImage = null;
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.switchId === null) {
        defaultImage = rule.image;
      } else if ($gameSwitches.value(rule.switchId)) {
        overrideImage = rule.image;
      }
    }
    return overrideImage || defaultImage;
  };

  var _SII_getSe = function(item) {
    var se = {
      name: DEFAULT_SE_NAME,
      volume: DEFAULT_SE_VOLUME,
      pitch: DEFAULT_SE_PITCH,
      pan: DEFAULT_SE_PAN
    };
    if (item && item.meta && item.meta['Skill Image SE']) {
      var parts = String(item.meta['Skill Image SE']).split(',');
      se.name = parts[0] ? parts[0].trim() : '';
      if (parts[1] !== undefined && parts[1].trim() !== '') {
        se.volume = Number(parts[1]);
      }
      if (parts[2] !== undefined && parts[2].trim() !== '') {
        se.pitch = Number(parts[2]);
      }
      if (parts[3] !== undefined && parts[3].trim() !== '') {
        se.pan = Number(parts[3]);
      }
    }
    if (!se.name) return null;
    return se;
  };

  //--------------------------------------------------------------------------
  // BattleManager - 액션 시퀀스에 SII IMAGE 명령 삽입
  //--------------------------------------------------------------------------

  var _SII_BattleManager_createSetupActions = BattleManager.createSetupActions;
  BattleManager.createSetupActions = function() {
    _SII_BattleManager_createSetupActions.call(this);
    var subject = this._action.subject();
    if (!subject || !subject.isActor()) return;
    var imageName = _SII_getImageName(this._action.item());
    if (imageName) {
      var se = _SII_getSe(this._action.item());
      var skillName = this._action.item() ? this._action.item().name : '';
      this._actionList.unshift(['SII IMAGE', [imageName, se, skillName]]);
    }
  };

  var _SII_BattleManager_processActionSequence =
    BattleManager.processActionSequence;
  BattleManager.processActionSequence = function(actionName, actionArgs) {
    if (actionName === 'SII IMAGE') {
      return this.actionSiiImage(actionArgs[0], actionArgs[1], actionArgs[2]);
    }
    return _SII_BattleManager_processActionSequence.call(
      this, actionName, actionArgs);
  };

  BattleManager.actionSiiImage = function(imageName, se, skillName) {
    this._siiBusy = true;
    var scene = SceneManager._scene;
    if (scene && scene.startSkillImageIntro) {
      scene.startSkillImageIntro(imageName, se, skillName, this);
    } else {
      this._siiBusy = false;
    }
    return false;
  };

  BattleManager.siiFinish = function() {
    this._siiBusy = false;
  };

  var _SII_BattleManager_isBusy = BattleManager.isBusy;
  BattleManager.isBusy = function() {
    if (this._siiBusy) return true;
    return _SII_BattleManager_isBusy.call(this);
  };

  //--------------------------------------------------------------------------
  // Sprite_SkillImageIntro
  //--------------------------------------------------------------------------

  function Sprite_SkillImageIntro() {
    this.initialize.apply(this, arguments);
  }

  Sprite_SkillImageIntro.prototype = Object.create(Sprite.prototype);
  Sprite_SkillImageIntro.prototype.constructor = Sprite_SkillImageIntro;

  Sprite_SkillImageIntro.prototype.initialize = function(imageName, se, banner, onFinish) {
    Sprite.prototype.initialize.call(this);
    this.bitmap = _SII_loadPicture(imageName);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.x = Graphics.boxWidth / 2;
    this.y = Graphics.boxHeight / 2;
    this.opacity = 255;
    this.scale.x = 0;
    this.scale.y = 0;
    this._se = se || null;
    this._sePlayed = false;
    this._banner = banner || null;
    this._onFinish = onFinish;
    this._phase = 'slowShrink';
    this._count = 0;
    this._targetScale = null;
  };

  Sprite_SkillImageIntro.prototype._playSe = function() {
    if (this._sePlayed || !this._se || !this._se.name) return;
    this._sePlayed = true;
    AudioManager.playSe({
      name: this._se.name,
      volume: this._se.volume,
      pitch: this._se.pitch,
      pan: this._se.pan
    });
  };

  Sprite_SkillImageIntro.prototype._computeBaseScale = function() {
    if (!this.bitmap || !this.bitmap.width || !this.bitmap.height) return 1;
    var scaleX = Graphics.boxWidth / this.bitmap.width;
    var scaleY = Graphics.boxHeight / this.bitmap.height;
    return Math.max(scaleX, scaleY);
  };

  Sprite_SkillImageIntro.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (!this.bitmap || !this.bitmap.isReady()) return;
    if (this._targetScale === null) {
      this._baseScale = this._computeBaseScale();
      this._popScale = this._baseScale * OVERSCALE;
      this._holdScale = this._baseScale * HOLD_SHRINK_SCALE;
      this._endScale = this._baseScale * END_SCALE;
      this._targetScale = this._popScale;
      // 애니메이션 없이 즉시 큰 크기로 스냅 (성장 과정이 보이지 않도록)
      this.scale.x = this._popScale;
      this.scale.y = this._popScale;
      this._phase = 'slowShrink';
      this._playSe();
    }
    switch (this._phase) {
      case 'slowShrink':
        this._updateSlowShrink();
        break;
      case 'holdShrink':
        this._updateHoldShrink();
        break;
      case 'fade':
        this._updateFade();
        break;
      case 'done':
        break;
    }
  };

  Sprite_SkillImageIntro.prototype._updateSlowShrink = function() {
    this._count++;
    var t = Math.min(this._count / SLOW_SHRINK_FRAMES, 1);
    // ease-out (더 급격) : 시작하자마자 엄청 빠르게 줄어듦
    var eased = 1 - Math.pow(1 - t, 4);
    var scale = this._popScale + (this._baseScale - this._popScale) * eased;
    this.scale.x = scale;
    this.scale.y = scale;
    this.opacity = 255;
    if (this._banner) {
      this._banner.x = this._banner._centerX - NAME_TRAVEL_DISTANCE * (1 - eased);
      this._banner.opacity = Math.round(255 * eased);
    }
    if (t >= 1) {
      this._count = 0;
      if (HOLD_SHRINK_FRAMES > 0) {
        this._phase = 'holdShrink';
      } else {
        this._phase = 'fade';
      }
    }
  };

  Sprite_SkillImageIntro.prototype._updateHoldShrink = function() {
    this._count++;
    var t = Math.min(this._count / HOLD_SHRINK_FRAMES, 1);
    // linear : 일정한 속도로 계속 작아짐 (페이드 없음)
    var scale = this._baseScale + (this._holdScale - this._baseScale) * t;
    this.scale.x = scale;
    this.scale.y = scale;
    this.opacity = 255;
    if (t >= 1) {
      this._phase = 'fade';
      this._count = 0;
    }
  };

  Sprite_SkillImageIntro.prototype._updateFade = function() {
    this._count++;
    var t = Math.min(this._count / FADE_FRAMES, 1);
    var fadeStart = HOLD_SHRINK_FRAMES > 0 ? this._holdScale : this._baseScale;
    // ease-in (더 급격하게) : 아주 빠르게 축소되며 페이드아웃
    var eased = Math.pow(t, 3);
    var scale = fadeStart + (this._endScale - fadeStart) * eased;
    this.scale.x = scale;
    this.scale.y = scale;
    this.opacity = Math.round(255 * (1 - t));
    if (this._banner) {
      this._banner.x = this._banner._centerX + NAME_TRAVEL_DISTANCE * eased;
      this._banner.opacity = Math.round(255 * (1 - eased));
    }
    if (t >= 1) {
      this._phase = 'done';
      this._finish();
    }
  };

  Sprite_SkillImageIntro.prototype._finish = function() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    if (this._banner && this._banner.parent) {
      this._banner.parent.removeChild(this._banner);
    }
    if (this._onFinish) {
      this._onFinish();
      this._onFinish = null;
    }
  };

  //--------------------------------------------------------------------------
  // Sprite_SkillNameBanner
  //--------------------------------------------------------------------------

  function Sprite_SkillNameBanner() {
    this.initialize.apply(this, arguments);
  }

  Sprite_SkillNameBanner.prototype = Object.create(Sprite.prototype);
  Sprite_SkillNameBanner.prototype.constructor = Sprite_SkillNameBanner;

  Sprite_SkillNameBanner.prototype.initialize = function(skillName) {
    Sprite.prototype.initialize.call(this);
    var w = Graphics.boxWidth;
    var h = NAME_BAR_HEIGHT;
    this.bitmap = new Bitmap(w, h);
    this._drawBanner(skillName, w, h);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this._centerX = Graphics.boxWidth / 2;
    this._centerY = Graphics.boxHeight / 2 + NAME_BAR_Y;
    this.x = this._centerX - NAME_TRAVEL_DISTANCE;
    this.y = this._centerY;
    this.opacity = 0;
  };

  Sprite_SkillNameBanner.prototype._drawBanner = function(skillName, w, h) {
    var context = this.bitmap._context;
    var gradient = context.createLinearGradient(0, 0, w, 0);
    var c = NAME_BAR_COLOR;
    gradient.addColorStop(0.0, this._colorWithAlpha(c, 0));
    gradient.addColorStop(0.25, this._colorWithAlpha(c, 0.92));
    gradient.addColorStop(0.75, this._colorWithAlpha(c, 0.92));
    gradient.addColorStop(1.0, this._colorWithAlpha(c, 0));
    context.save();
    context.fillStyle = gradient;
    context.fillRect(0, 0, w, h);
    context.restore();
    this.bitmap._setDirty();

    var fontFace = NAME_FONT_FACE || 'GameFont';
    this.bitmap.fontFace = fontFace;
    this.bitmap.fontSize = NAME_FONT_SIZE;
    this.bitmap.textColor = NAME_TEXT_COLOR;
    this.bitmap.outlineWidth = 0;
    this.bitmap.drawText(skillName || '', 0, 0, w, h, 'center');
  };

  Sprite_SkillNameBanner.prototype._colorWithAlpha = function(hex, alpha) {
    var r = parseInt(hex.substr(1, 2), 16) || 0;
    var g = parseInt(hex.substr(3, 2), 16) || 0;
    var b = parseInt(hex.substr(5, 2), 16) || 0;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  };

  //--------------------------------------------------------------------------
  // Scene_Battle
  //--------------------------------------------------------------------------

  Scene_Battle.prototype.startSkillImageIntro = function(imageName, se, skillName, battleManager) {
    var sprite = new Sprite_SkillImageIntro(imageName, se, null, function() {
      battleManager.siiFinish();
    });
    this.addChild(sprite);
    if (SHOW_SKILL_NAME && skillName) {
      var banner = new Sprite_SkillNameBanner(skillName);
      this.addChild(banner);
      sprite._banner = banner;
    }
  };

})();
