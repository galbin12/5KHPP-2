//=============================================================================
// CrossingSignal.js
// 초록 -> 빨강 -> 초록 신호등 (초록불엔 자동차 정지, 빨간불엔 플레이어 정지)
//=============================================================================
var Imported = Imported || {};
Imported.CrossingSignal = true;

var CS = CS || {};

/*:
 * @plugindesc v1.0 신호등 시스템. 초록불에는 자동차가 멈추고, 빨간불에 움직이면 실패합니다. (CrossingCarAvoid.js 아래에 배치)
 * @author Claude for 5K행성
 *
 * @param Green Text
 * @default 초록불
 * @desc 초록불일 때 화면 중앙 위에 표시할 글자
 *
 * @param Red Text
 * @default 빨간불
 * @desc 빨간불일 때 화면 중앙 위에 표시할 글자
 *
 * @param Green Color
 * @default #00c800
 * @desc 초록불일 때 화면 전체 색 (예: #00c800)
 *
 * @param Red Color
 * @default #e00000
 * @desc 빨간불일 때 화면 전체 색 (예: #e00000)
 *
 * @param Screen Opacity
 * @type number
 * @min 0
 * @max 255
 * @default 90
 * @desc 화면 색의 불투명도 (0~255, 클수록 진함)
 *
 * @param Text Y
 * @type number
 * @min 0
 * @default 40
 * @desc 글자의 화면 Y 좌표 (위에서부터 픽셀)
 *
 * @param Text Size
 * @type number
 * @min 12
 * @default 64
 * @desc 글자 크기
 *
 * @param Green Min Seconds
 * @type number
 * @min 1
 * @default 4
 * @desc 초록불이 유지되는 최소 시간(초)
 *
 * @param Green Max Seconds
 * @type number
 * @min 1
 * @default 8
 * @desc 초록불이 유지되는 최대 시간(초)
 *
 * @param Red Min Seconds
 * @type number
 * @min 1
 * @default 3
 * @desc 빨간불이 유지되는 최소 시간(초)
 *
 * @param Red Max Seconds
 * @type number
 * @min 1
 * @default 6
 * @desc 빨간불이 유지되는 최대 시간(초)
 *
 * @param Blink Count
 * @type number
 * @min 1
 * @default 3
 * @desc 색이 바뀌기 전에 깜빡이는 횟수
 *
 * @param Blink Interval
 * @type number
 * @min 2
 * @default 15
 * @desc 깜빡임 한 번의 켜짐/꺼짐 간격(프레임, 60프레임=1초)
 *
 * @param Grace Frames
 * @type number
 * @min 0
 * @default 20
 * @desc 빨간불로 바뀐 직후 봐주는 시간(프레임). 이 동안은 움직여도 실패가 아닙니다.
 *
 * @param Fail Event
 * @type common_event
 * @default 2
 * @desc 빨간불에 움직였을 때 실행할 공통이벤트
 *
 * @help
 * =============================================================================
 * 동작 방식
 * =============================================================================
 * 초록불 -> (깜빡임 3회) -> 빨간불 -> (깜빡임 3회) -> 초록불 ... 반복
 * 각 불이 유지되는 시간은 설정한 범위 안에서 매번 랜덤입니다.
 *
 * - 초록불(깜빡이는 중 포함): 자동차가 멈춥니다. 멈춘 자동차에는 맞지 않습니다.
 * - 빨간불(깜빡이는 중 포함): 자동차가 움직이고,
 *   플레이어가 움직이거나 아무 키/터치를 누르면 실패(Fail Event 실행)
 *
 * 반드시 CrossingCarAvoid.js 보다 아래에 배치하세요.
 *
 * =============================================================================
 * 신호등을 켜는 방법
 * =============================================================================
 * 이벤트에서 플러그인 명령 CS_Start 를 실행했을 때만 켜집니다.
 * 맵을 이동하면 자동으로 꺼지므로, 필요한 맵에서 다시 CS_Start 를 실행하세요.
 *
 * =============================================================================
 * 플러그인 명령
 * =============================================================================
 * CS_Start   : 신호등 시작 (초록불부터)
 * CS_Stop    : 신호등 끄기 (이미지 숨김, 자동차는 다시 정상 이동)
 *
 * 도착(CCA Goal)해서 CCA 자동차가 끝나면 신호등도 자동으로 꺼집니다.
 */

//=============================================================================
// 파라미터
//=============================================================================
CS.params = PluginManager.parameters('CrossingSignal');
CS.greenText = String(CS.params['Green Text'] || '초록불');
CS.redText = String(CS.params['Red Text'] || '빨간불');
CS.greenColor = String(CS.params['Green Color'] || '#00c800');
CS.redColor = String(CS.params['Red Color'] || '#e00000');
CS.screenOpacity = Number(CS.params['Screen Opacity'] || 90);
CS.textY = Number(CS.params['Text Y'] || 40);
CS.textSize = Number(CS.params['Text Size'] || 64);
CS.greenMin = Number(CS.params['Green Min Seconds'] || 4);
CS.greenMax = Number(CS.params['Green Max Seconds'] || 8);
CS.redMin = Number(CS.params['Red Min Seconds'] || 3);
CS.redMax = Number(CS.params['Red Max Seconds'] || 6);
CS.blinkCount = Number(CS.params['Blink Count'] || 3);
CS.blinkInterval = Number(CS.params['Blink Interval'] || 15);
CS.graceFrames = Number(CS.params['Grace Frames'] || 0);
CS.failEventId = Number(CS.params['Fail Event'] || 0);

//=============================================================================
// 상태: 'green' | 'greenBlink' | 'red' | 'redBlink'
//=============================================================================
CS.manualActive = false;
CS.state = 'green';
CS.timer = 0;
CS.blinkTimer = 0;
CS.graceTimer = 0;
CS.failed = false;

CS.randomFrames = function(minSec, maxSec) {
  var lo = Math.min(minSec, maxSec);
  var hi = Math.max(minSec, maxSec);
  return Math.floor((Math.random() * (hi - lo) + lo) * 60);
};

CS.start = function() {
  CS.manualActive = true;
  CS.setState('green');
};

CS.stop = function() {
  CS.manualActive = false;
};

CS.setState = function(state) {
  CS.state = state;
  CS.blinkTimer = 0;
  if (state === 'green') {
    CS.timer = CS.randomFrames(CS.greenMin, CS.greenMax);
  } else if (state === 'red') {
    CS.timer = CS.randomFrames(CS.redMin, CS.redMax);
    CS.graceTimer = CS.graceFrames;
    CS.failed = false;
  }
};

// 신호등이 켜져 있는지
CS.isActive = function() {
  if (typeof CCA !== 'undefined' && !CCA.isActive) return false;
  if (!CS.manualActive) return false;
  // 자동차가 모두 도착해서 끝났으면 신호등도 끔
  if (typeof CCA !== 'undefined' && CCA.isMapEnabled && CCA.cars.length > 0) {
    for (var i = 0; i < CCA.cars.length; i++) {
      if (!CCA.cars[i].finished) return true;
    }
    return false;
  }
  return true;
};


CS.isGreen = function() {
  return CS.state === 'green' || CS.state === 'greenBlink';
};

CS.isRed = function() {
  return CS.state === 'red' || CS.state === 'redBlink';
};

// 현재 깜빡임 중이면 켜짐/꺼짐 반환
CS.blinkVisible = function() {
  if (CS.state !== 'greenBlink' && CS.state !== 'redBlink') return true;
  return Math.floor(CS.blinkTimer / CS.blinkInterval) % 2 === 0;
};

// 아무 키나 터치가 눌렸는지
CS.anyInput = function() {
  var s = Input._currentState;
  for (var k in s) {
    if (s[k]) return true;
  }
  return TouchInput.isPressed();
};

//=============================================================================
// 매 프레임 업데이트 (이벤트 실행 중에는 멈춤)
//=============================================================================
CS.update = function() {
  if (!CS.isActive()) return;
  if ($gameMap.isEventRunning() || $gameMessage.isBusy()) return;

  // 타이머 진행
  if (CS.state === 'green' || CS.state === 'red') {
    CS.timer--;
    if (CS.timer <= 0) {
      CS.state = (CS.state === 'green') ? 'greenBlink' : 'redBlink';
      CS.blinkTimer = 0;
    }
  } else {
    CS.blinkTimer++;
    if (CS.blinkTimer >= CS.blinkCount * CS.blinkInterval * 2) {
      CS.setState(CS.state === 'greenBlink' ? 'red' : 'green');
    }
  }

  // 빨간불 위반 검사
  if (CS.isRed()) {
    if (CS.graceTimer > 0) {
      CS.graceTimer--;
    } else if (!CS.failed && (CS.anyInput() || $gamePlayer.isMoving())) {
      CS.failed = true;
      if (CS.failEventId > 0) {
        $gameTemp.reserveCommonEvent(CS.failEventId);
      }
    }
  }
};

// 맵이 바뀌면 수동 시작 상태를 초기화 (CS_Start 를 쓴 맵에서만 동작)
CS.Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
  CS.Game_Map_setup.call(this, mapId);
  CS.manualActive = false;
  CS.setState('green');
  CS.failed = false;
};

// 게임 오버 / 타이틀 / 새 게임 / 불러오기 때 신호등 상태 완전 초기화
CS.reset = function() {
  CS.manualActive = false;
  CS.state = 'green';
  CS.timer = 0;
  CS.blinkTimer = 0;
  CS.graceTimer = 0;
  CS.failed = false;
};

CS.Scene_Gameover_create = Scene_Gameover.prototype.create;
Scene_Gameover.prototype.create = function() {
  CS.reset();
  CS.Scene_Gameover_create.call(this);
};

CS.Scene_Title_create = Scene_Title.prototype.create;
Scene_Title.prototype.create = function() {
  CS.reset();
  CS.Scene_Title_create.call(this);
};

CS.DataManager_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function() {
  CS.reset();
  CS.DataManager_setupNewGame.call(this);
};

CS.DataManager_loadGame = DataManager.loadGame;
DataManager.loadGame = function(savefileId) {
  CS.reset();
  return CS.DataManager_loadGame.call(this, savefileId);
};

CS.Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
  CS.Scene_Map_update.call(this);
  if (this.isActive()) CS.update();
};

//=============================================================================
// CrossingCarAvoid 연동: 초록불엔 자동차 정지 + 충돌 없음
//=============================================================================
if (typeof CCA_Car !== 'undefined') {
  CS.CCA_Car_update = CCA_Car.prototype.update;
  CCA_Car.prototype.update = function() {
    if (CS.isActive() && CS.isGreen()) return;
    CS.CCA_Car_update.call(this);
  };

  CS.CCA_Car_isColliding = CCA_Car.prototype.isCollidingWithPlayer;
  CCA_Car.prototype.isCollidingWithPlayer = function(playerX, playerY) {
    if (CS.isActive() && CS.isGreen()) return false;
    return CS.CCA_Car_isColliding.call(this, playerX, playerY);
  };
}

//=============================================================================
// 신호등 스프라이트
//=============================================================================
function Sprite_CrossingSignal() {
  this.initialize.apply(this, arguments);
}

Sprite_CrossingSignal.prototype = Object.create(Sprite.prototype);
Sprite_CrossingSignal.prototype.constructor = Sprite_CrossingSignal;

Sprite_CrossingSignal.prototype.initialize = function() {
  Sprite.prototype.initialize.call(this);
  this._shownGreen = null;

  // 화면 전체 색 오버레이
  this._screen = new Sprite(new Bitmap(Graphics.width, Graphics.height));
  this.addChild(this._screen);

  // 중앙 위 글자
  var textHeight = CS.textSize + 24;
  this._text = new Sprite(new Bitmap(Graphics.width, textHeight));
  this._text.y = CS.textY;
  this._text.bitmap.fontSize = CS.textSize;
  this._text.bitmap.outlineWidth = 8;
  this._text.bitmap.outlineColor = 'rgba(0, 0, 0, 0.9)';
  this._text.bitmap.textColor = '#ffffff';
  this.addChild(this._text);

  this.visible = false;
};

Sprite_CrossingSignal.prototype.refreshSignal = function(isGreen) {
  var color = isGreen ? CS.greenColor : CS.redColor;
  var label = isGreen ? CS.greenText : CS.redText;

  this._screen.bitmap.clear();
  this._screen.bitmap.fillAll(color);
  this._screen.opacity = CS.screenOpacity;

  var bmp = this._text.bitmap;
  bmp.clear();
  bmp.drawText(label, 0, 0, bmp.width, bmp.height, 'center');
};

Sprite_CrossingSignal.prototype.update = function() {
  Sprite.prototype.update.call(this);
  if (!CS.isActive()) {
    this.visible = false;
    return;
  }
  var isGreen = CS.isGreen();
  if (this._shownGreen !== isGreen) {
    this._shownGreen = isGreen;
    this.refreshSignal(isGreen);
  }
  this.visible = CS.blinkVisible();
};

CS.Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
Spriteset_Map.prototype.createUpperLayer = function() {
  CS.Spriteset_Map_createUpperLayer.call(this);
  this._signalSprite = new Sprite_CrossingSignal();
  this.addChild(this._signalSprite);
};

//=============================================================================
// 플러그인 명령
//=============================================================================
CS.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  CS.Game_Interpreter_pluginCommand.call(this, command, args);
  if (command === 'CS_Start') {
    CS.start();
  } else if (command === 'CS_Stop') {
    CS.stop();
  }
};
