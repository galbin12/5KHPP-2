//=============================================================================
// CrossingCarAvoid.js
// 길을 건널 때 지나가는 자동차를 피해야 하는 플러그인
//=============================================================================
var Imported = Imported || {};
Imported.CrossingCarAvoid = true;

var CCA = CCA || {};
CCA.version = '1.0.0';

/*:
 * @plugindesc v1.0 길 건너기 장면에서 지나가는 자동차를 피해야 하는 시스템
 * @author Claude for 5K행성
 *
 * @param Car Image
 * @type file
 * @dir img/pictures
 * @desc 자동차 이미지 (img/pictures 폴더에 있는 PNG 파일)
 * @default
 *
 * @param Min Speed
 * @type number
 * @min 1
 * @max 10
 * @default 3
 * @desc 자동차 최소 속도
 *
 * @param Max Speed
 * @type number
 * @min 1
 * @max 15
 * @default 7
 * @desc 자동차 최대 속도
 *
 * @param Hit Event
 * @type common_event
 * @default 2
 * @desc 플레이어가 자동차와 충돌했을 때 실행할 공통이벤트
 *
 * @param Clear Event
 * @type common_event
 * @default 3
 * @desc 플레이어가 도착 지점(<CCA_GoalRegion:번호> 리전)에 도착했을 때 실행할 공통이벤트
 *
 * @help
 * =============================================================================
 * 사용 방법
 * =============================================================================
 * 1. img/pictures 폴더에 자동차 이미지(PNG)를 넣습니다.
 *
 * 2. 플러그인 매개변수에서 "Car Image"에 이미지 파일명을 입력합니다.
 *    (예: Car.png → "Car"라고 입력)
 *
 * 3. 맵에 이벤트를 배치합니다.
 *
 * 4. 이벤트의 커맨드에 주석(코멘트)을 추가하고 다음과 같이 작성:
 *
 *    <CCA_Enable>          -> 이 이벤트의 위치에 자동차 시스템 활성화
 *    <CCA_Direction:right> -> 자동차 방향 (left 또는 right, 기본값: left)
 *    <CCA_Width:1>         -> 자동차 폭 (기본값: 1)
 *    <CCA_SafeRegion:3>    -> 안전지대 리전 번호 (이 리전 위에서는 자동차에 맞지 않음)
 *                             여러 개는 <CCA_SafeRegion:3,4,5> 처럼 쉼표로 구분
 *    <CCA_GoalRegion:5>    -> 도착 지점으로 쓸 리전 번호 (맵 에디터 리전 도구의 숫자)
 *    <CCA_Goal:5>          -> (선택) 도착 지점으로 쓸 이벤트 번호(ID)
 *
 *    주의: Y좌표는 자동으로 이벤트 위치에서 인식됩니다!
 *
 * 5. 플레이어가 자동차와 충돌하면 Hit 공통이벤트 실행
 *    플레이어가 <CCA_GoalRegion:번호> 리전 칸에 도착하면 Clear 공통이벤트 실행
 *
 * =============================================================================
 * 플러그인 명령
 * =============================================================================
 * CCA_SetActive true/false   : 차선 감시 활성화/비활성화
 * CCA_Reset                  : 모든 자동차 상태 초기화 (세이프로 끝난 자동차도 되살림)
 *
 * =============================================================================
 * 버전 로그
 * =============================================================================
 * 2026.10.07 (v1.2) - 이벤트 위치 자동 인식, 외부 이미지 로드
 * 2026.10.07 (v1.1) - 맵별 활성화 시스템 추가
 * 2026.10.07 (v1.0) - 초기 작성
 */

//=============================================================================
// 플러그인 파라미터 파싱
//=============================================================================
CCA.params = PluginManager.parameters('CrossingCarAvoid');
CCA.carImageName = String(CCA.params['Car Image'] || '');
CCA.minSpeed = Number(CCA.params['Min Speed'] || 3);
CCA.maxSpeed = Number(CCA.params['Max Speed'] || 7);
CCA.hitEventId = Number(CCA.params['Hit Event'] || 2);
CCA.clearEventId = Number(CCA.params['Clear Event'] || 3);

//=============================================================================
// 자동차 객체
//=============================================================================
function CCA_Car() {
  this.initialize.apply(this, arguments);
}

CCA_Car.prototype.initialize = function(y, width, direction, goalId, goalRegion) {
  this.laneY = y;
  this.goalId = goalId || 0;
  this.goalRegion = goalRegion || 0;
  this.direction = direction; // 'left' or 'right'
  this.speed = Math.random() * (CCA.maxSpeed - CCA.minSpeed) + CCA.minSpeed;
  this.x = (direction === 'left') ? $gameMap.width() : -width;
  this.width = width;
  this.wasColliding = false;
  this.wasAtGoal = false;
  this.finished = false;
  this.safeRegions = [];
};

CCA_Car.prototype.update = function() {
  if (this.finished) return;
  if (this.direction === 'left') {
    this.x -= this.speed / 60;
    if (this.x < -this.width - 2) {
      this.speed = Math.random() * (CCA.maxSpeed - CCA.minSpeed) + CCA.minSpeed;
      this.x = $gameMap.width();
    }
  } else {
    this.x += this.speed / 60;
    if (this.x > $gameMap.width() + 2) {
      this.speed = Math.random() * (CCA.maxSpeed - CCA.minSpeed) + CCA.minSpeed;
      this.x = -this.width;
    }
  }
};

CCA_Car.prototype.isCollidingWithPlayer = function(playerX, playerY) {
  if (Math.abs(playerY - this.laneY) > this.width) {
    return false;
  }
  return (playerX >= this.x - this.width && playerX <= this.x + this.width);
};

// 안전지대 판정: 플레이어가 선 칸의 리전 ID가 안전 리전 목록에 있으면 true
CCA_Car.prototype.isPlayerInSafeRegion = function(playerX, playerY) {
  if (this.safeRegions.length === 0) return false;
  return this.safeRegions.indexOf($gameMap.regionId(playerX, playerY)) >= 0;
};

// 도착 판정: 맵의 지정한 번호 이벤트와 같은 칸에 플레이어가 서 있는지
CCA_Car.prototype.isPlayerAtGoal = function(playerX, playerY) {
  // 리전 번호로 지정한 경우: 플레이어가 선 칸의 리전 ID가 같으면 도착
  if (this.goalRegion && $gameMap.regionId(playerX, playerY) === this.goalRegion) {
    return true;
  }
  if (!this.goalId) return false;
  var goal = $gameMap.event(this.goalId);
  if (!goal) return false;
  return goal.x === playerX && goal.y === playerY;
};

//=============================================================================
// 전역 자동차 설정
//=============================================================================
CCA.cars = [];
CCA.isActive = true;
CCA.isMapEnabled = false;
CCA.setupMapId = 0; // 자동차를 만들어 둔 맵 번호

//=============================================================================
// 맵 초기화
//=============================================================================
CCA.Game_Map_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
  CCA.Game_Map_initialize.call(this);
  CCA.cars = [];
  CCA.isMapEnabled = false;
};

CCA.Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
  CCA.Game_Map_setup.call(this, mapId);
  this.setupCrossingCarAvoid();
};

Game_Map.prototype.setupCrossingCarAvoid = function() {
  CCA.cars = [];
  CCA.isMapEnabled = false;
  CCA.setupMapId = this._mapId;

  var events = this.events();

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var page = event.page();
    if (page && page.list) {
      var enableCCA = false;
      var width = 1;
      var direction = 'left';
      var goalId = 0;
      var goalRegion = 0;
      var safeRegions = [];

      for (var j = 0; j < page.list.length; j++) {
        var cmd = page.list[j];
        if (cmd.code === 108 || cmd.code === 408) {
          var text = cmd.parameters[0];

          // <CCA_Enable> 찾기
          if (/<CCA_Enable>/i.test(text)) {
            enableCCA = true;
          }

          // <CCA_Width:1> 형식
          var wMatch = /<CCA_Width:\s*(\d+)\s*>/i.exec(text);
          if (wMatch) {
            width = Number(wMatch[1]);
          }

          // <CCA_Goal:5> 형식 (도착 지점으로 쓸 이벤트 번호)
          var goalMatch = /<CCA_Goal:\s*(\d+)\s*>/i.exec(text);
          if (goalMatch) {
            goalId = Number(goalMatch[1]);
          }

          // <CCA_GoalRegion:5> 형식 (도착 지점으로 쓸 리전 번호)
          var regMatch = /<CCA_GoalRegion:\s*(\d+)\s*>/i.exec(text);
          if (regMatch) {
            goalRegion = Number(regMatch[1]);
          }

          // <CCA_SafeRegion:3> 또는 <CCA_SafeRegion:3,4,5> 형식 (안전지대 리전)
          var safeMatch = /<CCA_SafeRegion:\s*([\d,\s]+)>/i.exec(text);
          if (safeMatch) {
            safeRegions = safeMatch[1].split(',').map(function(n) {
              return Number(n.trim());
            }).filter(function(n) { return n > 0; });
          }

          // <CCA_Direction:right> 형식
          var dirMatch = /<CCA_Direction:\s*(left|right)\s*>/i.exec(text);
          if (dirMatch) {
            direction = dirMatch[1].toLowerCase();
          }
        }
      }

      var doneKey = this._mapId + '_' + event.eventId();
      if (enableCCA && $gameSystem._ccaDone && $gameSystem._ccaDone[doneKey]) {
        enableCCA = false; // 이미 세이프한 곳이면 자동차 없음
      }

      if (enableCCA) {
        CCA.isMapEnabled = true;
        // 이벤트의 Y좌표를 자동으로 사용
        var laneY = event.y;
        var car = new CCA_Car(laneY, width, direction, goalId, goalRegion);
        car.doneKey = doneKey;
        car.safeRegions = safeRegions;
        CCA.cars.push(car);
      }
    }
  }
};

//=============================================================================
// 매프레임 업데이트
//=============================================================================
CCA.Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
  CCA.Game_Map_update.call(this, sceneActive);
  if (CCA.isActive && CCA.isMapEnabled && sceneActive) {
    this.updateCrossingCarAvoid();
  }
};

Game_Map.prototype.updateCrossingCarAvoid = function() {
  var px = $gamePlayer.x;
  var py = $gamePlayer.y;

  for (var i = 0; i < CCA.cars.length; i++) {
    var car = CCA.cars[i];
    if (car.finished) continue;
    car.update();

    // 충돌 감지
    if (!car.isPlayerInSafeRegion(px, py) && car.isCollidingWithPlayer(px, py)) {
      if (!car.wasColliding) {
        car.wasColliding = true;
        if (CCA.hitEventId > 0) {
          $gameTemp.reserveCommonEvent(CCA.hitEventId);
        }
      }
    } else {
      car.wasColliding = false;
    }

    // 도착 감지 (지정한 번호의 이벤트 칸에 도착했을 때 한 번만)
    if (car.isPlayerAtGoal(px, py)) {
      if (!car.wasAtGoal && !$gamePlayer.isMoving()) {
        car.wasAtGoal = true;
        this.finishCrossingCarAvoid();
        if (CCA.clearEventId > 0) {
          $gameTemp.reserveCommonEvent(CCA.clearEventId);
        }
        return;
      }
    } else {
      car.wasAtGoal = false;
    }
  }
};

// 세이프: 이 맵의 모든 자동차를 영구히 종료 (저장 데이터에 기록)
Game_Map.prototype.finishCrossingCarAvoid = function() {
  $gameSystem._ccaDone = $gameSystem._ccaDone || {};
  for (var i = 0; i < CCA.cars.length; i++) {
    CCA.cars[i].finished = true;
    $gameSystem._ccaDone[CCA.cars[i].doneKey] = true;
  }
};

//=============================================================================
// 플러그인 명령
//=============================================================================
CCA.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  if (command === 'CCA_Reset') {
    $gameSystem._ccaDone = {}; // 세이프 기록도 초기화
  }
  if (command === 'CCA_SetActive') {
    CCA.isActive = args[0] === 'true';
  } else if (command === 'CCA_Reset') {
    for (var i = 0; i < CCA.cars.length; i++) {
      CCA.cars[i].speed = Math.random() * (CCA.maxSpeed - CCA.minSpeed) + CCA.minSpeed;
      CCA.cars[i].x = (CCA.cars[i].direction === 'left') ? $gameMap.width() : -CCA.cars[i].width;
      CCA.cars[i].wasColliding = false;
      CCA.cars[i].wasAtGoal = false;
      CCA.cars[i].finished = false;
    }
  }
  CCA.Game_Interpreter_pluginCommand.call(this, command, args);
};

//=============================================================================
// 자동차 스프라이트 렌더링
//=============================================================================
CCA.Sprite_CARSprite = function() {
  this.initialize.apply(this, arguments);
};

CCA.Sprite_CARSprite.prototype = Object.create(Sprite.prototype);
CCA.Sprite_CARSprite.prototype.constructor = CCA.Sprite_CARSprite;

CCA.Sprite_CARSprite.prototype.initialize = function(car) {
  Sprite.prototype.initialize.call(this);
  this.car = car;

  if (CCA.carImageName) {
    // 외부 이미지 파일 로드
    this.bitmap = ImageManager.loadPicture(CCA.carImageName);
  } else {
    // 기본 그래픽 생성
    this.createBitmap();
  }
};

CCA.Sprite_CARSprite.prototype.createBitmap = function() {
  var bitmapWidth = 48;
  var bitmapHeight = 32;
  this.bitmap = new Bitmap(bitmapWidth, bitmapHeight);

  // 자동차 그리기 (간단한 사각형 모양)
  var color1 = '#FF0000'; // 빨간색
  var color2 = '#000000'; // 검은색

  // 자동차 본체
  this.bitmap.fillRect(4, 8, 40, 16, color1);

  // 창문
  this.bitmap.fillRect(10, 10, 12, 6, '#4488FF');
  this.bitmap.fillRect(26, 10, 12, 6, '#4488FF');

  // 바퀴
  this.bitmap.fillRect(6, 24, 8, 4, color2);
  this.bitmap.fillRect(34, 24, 8, 4, color2);
};

CCA.Sprite_CARSprite.prototype.update = function() {
  Sprite.prototype.update.call(this);
  this.visible = !this.car.finished;
  // 맵 스크롤을 반영해서 화면 좌표로 변환
  this.x = Math.round($gameMap.adjustX(this.car.x) * $gameMap.tileWidth());
  this.y = Math.round($gameMap.adjustY(this.car.laneY) * $gameMap.tileHeight());
};

//=============================================================================
// Spriteset에 자동차 스프라이트 추가 (맵이 활성화된 경우만)
//=============================================================================
CCA.Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
  CCA.Spriteset_Map_createLowerLayer.call(this);
  this._carSprites = [];

  // 세이브 불러오기 등으로 Game_Map.setup이 호출되지 않은 경우 자동차를 다시 만든다
  if (CCA.setupMapId !== $gameMap.mapId()) {
    $gameMap.setupCrossingCarAvoid();
  }

  if (CCA.isMapEnabled) {
    for (var i = 0; i < CCA.cars.length; i++) {
      var sprite = new CCA.Sprite_CARSprite(CCA.cars[i]);
      this._carSprites.push(sprite);
      this._tilemap.addChild(sprite);
    }
  }
};

CCA.Spriteset_Map_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
  CCA.Spriteset_Map_update.call(this);
  if (this._carSprites) {
    for (var i = 0; i < this._carSprites.length; i++) {
      this._carSprites[i].update();
    }
  }
};
