//=============================================================================
// CarryPlaceItem.js
// 플레이어가 "물건"을 들고 다니다가, 다른 맵에 있는 지정된 설치 지점에
// 내려놓을 수 있게 해주는 플러그인입니다. 설치 지점은 "맵 ID(숫자)"로
// 판별됩니다 (예: 1번 맵에서 주운 물건을 5번 맵에 놓기). 물건을 들고
// 있는 동안에는 플레이어 머리 위에 그 물건 아이콘이 표시됩니다.
//=============================================================================
var Imported = Imported || {};
Imported.CarryPlaceItem = true;

var RS = RS || {};
RS.CP = RS.CP || {};

/*:
 * @plugindesc v2.0 물건을 들고 다니다가(머리 위 아이콘 표시) 지정된 맵 ID의 지점에 놓거나 다시 집을 수 있게 하는 시스템
 * @author RS
 *
 * @param Object List
 * @text 물건 목록
 * @type struct<CPObject>[]
 * @desc 들고 다닐 수 있는 물건들의 정보 목록입니다.
 * @default []
 *
 * @param Show Head Icon
 * @text 머리 위 아이콘 표시
 * @type boolean
 * @desc 물건을 들고 있는 동안 플레이어 머리 위에 아이콘을 표시할지 여부
 * @default true
 *
 * @param Head Icon Y Offset
 * @text 머리 위 아이콘 Y 오프셋
 * @type number
 * @min -999
 * @desc 플레이어 캐릭터 기준 위쪽으로 얼마나 띄울지 (픽셀)
 * @default 48
 *
 * @help
 * =============================================================================
 * 개요
 * =============================================================================
 * 1) 물건을 "줍는" 이벤트에서 플러그인 명령으로 물건을 들게 합니다.
 *    -> 들고 있는 동안 플레이어 머리 위에 그 물건 아이콘이 표시됩니다.
 * 2) 물건을 "놓는" 지점 이벤트의 주석에 <CPPoint> 태그를 달아둡니다.
 *    -> 이 지점의 식별 번호는 별도로 정하지 않고, "그 지점이 있는 맵의
 *       맵 ID(숫자)"가 그대로 식별자로 쓰입니다. 즉 5번 맵에 있는
 *       <CPPoint> 이벤트는 자동으로 "5번 지점"이 됩니다.
 * 3) 그 지점 이벤트를 실행(보통 액션 버튼 트리거)하면서 플러그인 명령으로
 *    물건을 놓거나, 이미 놓여있는 물건을 다시 집습니다.
 * 4) 지점 이벤트는 물건이 놓여있으면 자동으로 그 물건의 캐릭터 그래픽으로
 *    바뀌고, 비어있으면 에디터에서 그려둔 원래 그래픽(빈 상태)으로 돌아갑니다.
 *
 * =============================================================================
 * 1. 물건 목록 설정 (플러그인 매개변수)
 * =============================================================================
 * 물건 목록에 아래 정보를 등록합니다.
 *   - Id                 : 물건 고유 번호 (1부터 시작, 중복 금지)
 *   - Name                : 물건 이름 (메시지 등에 사용 가능)
 *   - Icon Index          : 들고 있을 때 머리 위에 표시할 아이콘 번호
 *   - Character Name      : 지점에 놓였을 때 보여줄 캐릭터 이미지 파일명
 *   - Character Index     : 캐릭터 이미지 내 인덱스
 *   - Pattern             : 캐릭터 패턴 (0~2, 기본 0)
 *   - Direction           : 캐릭터 방향 (2/4/6/8, 기본 2)
 *
 * =============================================================================
 * 2. 물건 줍기
 * =============================================================================
 * [방법 A] 눌렀을 때(액션 버튼) 자동으로 줍기 - 플러그인 명령 불필요
 * -----------------------------------------------------------------------
 * 줍고 싶은 물건 이벤트의 "현재 페이지" 아무 곳에나 주석으로 태그를
 * 하나 적어둡니다.
 *
 *   <CPItem:3>
 *
 * 이 태그가 있는 이벤트는 트리거(액션 버튼 등)로 실행되는 순간, 이벤트
 * 내용이 시작되기도 전에 자동으로 3번 물건을 들게 됩니다. 그 뒤 이벤트
 * 내용에 원하는 대사나 연출을 자유롭게 넣고, 마지막에 "셀프 스위치 A =
 * ON" 처리를 추가해서 페이지를 바꾸면(빈 페이지 또는 다른 그래픽), 다시
 * 주울 수 없게 됩니다. 이미 셀프 스위치가 켜진 이후 페이지에는 이 태그를
 * 적지 않아야 재획득을 막을 수 있습니다.
 *
 * [방법 B] 플러그인 명령으로 직접 줍기
 * -----------------------------------------------------------------------
 *   CarryPlace pickup 3
 *     -> 3번 물건을 들게 합니다. 이미 뭔가 들고 있었다면 교체됩니다.
 *
 *   이 방식은 상점 구매, 조건부 획득처럼 액션 버튼 누름 자체가 아닌
 *   다른 상황(이벤트 흐름 중간)에서 물건을 들게 하고 싶을 때 사용합니다.
 *
 * =============================================================================
 * 3. 설치 지점 만들기 (맵 ID로 판별) - 눌렀을 때 자동으로 놓기/집기
 * =============================================================================
 * 지점으로 사용할 이벤트의 "현재 페이지" 아무 곳에나 주석 커맨드로
 * 아래 태그를 하나 적어둡니다.
 *
 *   <CPPoint>
 *
 * 번호를 따로 적지 않아도 됩니다 - 이 이벤트가 있는 맵의 맵 ID가
 * 곧 지점 번호가 됩니다. (예: 맵 ID가 7인 맵에 있는 <CPPoint> 이벤트는
 * 자동으로 "7번 지점"으로 취급됩니다.)
 *
 * 이벤트 트리거를 "액션 버튼"으로 설정해두기만 하면 끝입니다.
 * 플레이어가 결정 버튼을 누르는 순간, 이벤트 내용이 시작되기도 전에
 * 자동으로 물건을 놓거나(들고 있을 때) / 다시 집습니다(비어있지 않고
 * 안 들고 있을 때). 별도의 플러그인 명령을 넣을 필요가 없습니다.
 * 놓이면 그 즉시 이벤트 그래픽도 물건 모양으로 바뀝니다.
 *
 * 이벤트 내용에 대사 등을 추가하고 싶다면, 그 뒤에 조건 분기로 결과를
 * 확인해서 다르게 반응하게 만들 수 있습니다 (아래 4번 참고).
 *
 * 플러그인 명령으로 직접 호출하고 싶은 경우(이벤트 흐름 중간 등)는
 * 아래처럼 사용할 수 있습니다.
 *
 *   CarryPlace point
 *     -> 번호를 적지 않으면 현재 맵 ID를 자동으로 사용합니다.
 *   CarryPlace point 7
 *     -> 다른 곳에서 7번 맵 지점을 강제로 지정하고 싶을 때.
 *
 * 한 맵에는 <CPPoint> 이벤트를 하나만 두는 것을 권장합니다. 여러 개를
 * 두면 전부 같은 지점(그 맵 ID)의 상태를 공유해서 동시에 그래픽이
 * 바뀝니다.
 *
 * 명령 실행 결과는 아래 네 가지 중 하나이며, 스크립트로 확인해서
 * 분기 처리(대사 등)를 만들 수 있습니다.
 *
 *   $gameSystem.cpLastResult()  ->  'placed'    (물건을 내려놓음)
 *                                   'retrieved' (놓여있던 물건을 다시 집음)
 *                                   'occupied'  (이미 다른 물건이 있어 놓지 못함)
 *                                   'nothing'   (들고 있지도, 놓여있지도 않음)
 *
 *   예) 조건 분기 - 스크립트: $gameSystem.cpLastResult() === 'occupied'
 *         -> 텍스트 표시: "이미 다른 물건이 놓여 있다."
 *
 * =============================================================================
 * 4. 그 밖에 쓸 수 있는 스크립트 (조건 분기용)
 * =============================================================================
 *   $gameSystem.cpCarrying()          -> 현재 들고 있는 물건 ID (없으면 0)
 *   $gameSystem.cpIsCarrying(3)       -> 3번 물건을 들고 있으면 true
 *   $gameSystem.cpPointObject(5)      -> 5번 맵 지점에 놓인 물건 ID (없으면 0)
 *   $gameSystem.cpPointHas(5, 3)      -> 5번 맵 지점에 3번 물건이 놓여 있으면 true
 *   $gameSystem.cpClearCarrying()     -> 강제로 들고 있는 물건을 버림(삭제)
 *
 * =============================================================================
 * 주의
 * =============================================================================
 * - 한 번에 하나의 물건만 들 수 있습니다.
 * - 지점의 식별 번호 = 그 지점이 있는 맵의 맵 ID 입니다. 같은 맵에
 *   여러 지점을 두고 싶다면 이 방식으로는 구분이 안 되니, 맵을
 *   나누어 설계해주세요.
 * - 지점 이벤트의 "비어있을 때" 그래픽은 에디터에서 직접 그려둔 그래픽이
 *   그대로 사용됩니다. 물건이 놓이면 물건의 캐릭터 그래픽으로 자동 교체됩니다.
 * - 지점 데이터는 세이브 파일에 저장되어 유지됩니다.
 *
 * =============================================================================
 * 버전 로그
 * =============================================================================
 * 2026.09.02 (v2.2) - <CPPoint> 태그도 액션 버튼을 누르면 자동으로 놓기/집기 처리되도록 변경
 * 2026.09.02 (v2.1) - <CPItem:번호> 태그로 액션 버튼을 누르면 자동으로 물건을 줍는 기능 추가
 * 2026.09.02 (v2.0) - 지점 식별을 맵 ID 기반으로 변경, HUD 아이콘을 플레이어 머리 위 표시로 변경
 * 2026.09.02 (v1.0) - 최초 작성
 */
/*~struct~CPObject:
 * @param Id
 * @text 물건 ID
 * @type number
 * @default 1
 *
 * @param Name
 * @text 이름
 * @type text
 * @default
 *
 * @param Icon Index
 * @text 아이콘 번호
 * @type number
 * @default 0
 *
 * @param Character Name
 * @text 캐릭터 이미지 파일명
 * @type file
 * @dir img/characters
 * @default
 *
 * @param Character Index
 * @text 캐릭터 이미지 인덱스
 * @type number
 * @default 0
 *
 * @param Pattern
 * @text 패턴
 * @type number
 * @min 0
 * @max 2
 * @default 0
 *
 * @param Direction
 * @text 방향
 * @type select
 * @option 아래
 * @value 2
 * @option 왼쪽
 * @value 4
 * @option 오른쪽
 * @value 6
 * @option 위
 * @value 8
 * @default 2
 */

(function() {
'use strict';

var params = PluginManager.parameters('CarryPlaceItem');

var parseObjectList = function(json) {
  var list = [];
  var raw = [];
  try {
    raw = JSON.parse(json || '[]');
  } catch (e) {
    raw = [];
  }
  for (var i = 0; i < raw.length; i++) {
    var s = {};
    try {
      s = JSON.parse(raw[i]);
    } catch (e2) {
      continue;
    }
    list.push({
      id: Number(s['Id'] || 0),
      name: String(s['Name'] || ''),
      iconIndex: Number(s['Icon Index'] || 0),
      characterName: String(s['Character Name'] || ''),
      characterIndex: Number(s['Character Index'] || 0),
      pattern: Number(s['Pattern'] || 0),
      direction: Number(s['Direction'] || 2)
    });
  }
  return list;
};

RS.CP.objectList = parseObjectList(params['Object List']);
RS.CP.showHeadIcon = params['Show Head Icon'] === 'true';
RS.CP.headIconYOffset = Number(params['Head Icon Y Offset'] || 48);

RS.CP.objectData = function(id) {
  for (var i = 0; i < RS.CP.objectList.length; i++) {
    if (RS.CP.objectList[i].id === id) return RS.CP.objectList[i];
  }
  return null;
};

//-----------------------------------------------------------------------------
// 이벤트 주석에서 <CPPoint> 태그 찾기 (모든 페이지 검색, 페이지 무관)
// 지점 번호는 별도로 파싱하지 않고, 그 이벤트가 속한 맵의 맵 ID를 사용합니다.
//-----------------------------------------------------------------------------
RS.CP.pointTagRegex = /<CPPoint>/i;

RS.CP.hasPointTag = function(event) {
  var data = event.event();
  if (!data || !data.pages) return false;
  for (var p = 0; p < data.pages.length; p++) {
    var list = data.pages[p].list;
    if (!list) continue;
    for (var i = 0; i < list.length; i++) {
      var cmd = list[i];
      if (cmd.code === 108 || cmd.code === 408) {
        if (RS.CP.pointTagRegex.test(cmd.parameters[0])) return true;
      }
    }
  }
  return false;
};

//-----------------------------------------------------------------------------
// 이벤트 주석에서 <CPItem:번호> 태그 찾기 (현재 활성화된 페이지만 검색)
//-----------------------------------------------------------------------------
RS.CP.itemTagRegex = /<CPItem:\s*(\d+)\s*>/i;

RS.CP.findItemIdOnCurrentPage = function(event) {
  var list = event.list();
  if (!list) return null;
  for (var i = 0; i < list.length; i++) {
    var cmd = list[i];
    if (cmd.code === 108 || cmd.code === 408) {
      var match = RS.CP.itemTagRegex.exec(cmd.parameters[0]);
      if (match) return Number(match[1]);
    }
  }
  return null;
};

RS.CP.hasPointTagOnCurrentPage = function(event) {
  var list = event.list();
  if (!list) return false;
  for (var i = 0; i < list.length; i++) {
    var cmd = list[i];
    if (cmd.code === 108 || cmd.code === 408) {
      if (RS.CP.pointTagRegex.test(cmd.parameters[0])) return true;
    }
  }
  return false;
};

//-----------------------------------------------------------------------------
// Game_System - 들고 있는 물건 / 맵ID별 물건 데이터 저장 (세이브 유지)
//-----------------------------------------------------------------------------
RS.CP.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
  RS.CP.Game_System_initialize.call(this);
  this._cpCarrying = 0;
  this._cpPoints = {};
  this._cpLastResult = 'nothing';
};

Game_System.prototype.cpCarrying = function() {
  return this._cpCarrying || 0;
};

Game_System.prototype.cpIsCarrying = function(id) {
  return this.cpCarrying() === id;
};

Game_System.prototype.cpSetCarrying = function(id) {
  this._cpCarrying = id;
};

Game_System.prototype.cpClearCarrying = function() {
  this._cpCarrying = 0;
};

Game_System.prototype.cpPointObject = function(mapId) {
  if (!this._cpPoints) this._cpPoints = {};
  return this._cpPoints[mapId] || 0;
};

Game_System.prototype.cpPointHas = function(mapId, objectId) {
  return this.cpPointObject(mapId) === objectId;
};

Game_System.prototype.cpSetPointObject = function(mapId, objectId) {
  if (!this._cpPoints) this._cpPoints = {};
  if (objectId > 0) {
    this._cpPoints[mapId] = objectId;
  } else {
    delete this._cpPoints[mapId];
  }
};

Game_System.prototype.cpLastResult = function() {
  return this._cpLastResult || 'nothing';
};

//-----------------------------------------------------------------------------
// 핵심 로직 (mapId를 지점 식별자로 사용)
//-----------------------------------------------------------------------------
RS.CP.pickup = function(objectId) {
  $gameSystem.cpSetCarrying(objectId);
};

RS.CP.resolvePoint = function(mapId) {
  var carrying = $gameSystem.cpCarrying();
  var placed = $gameSystem.cpPointObject(mapId);

  if (carrying > 0 && placed === 0) {
    // 놓기
    $gameSystem.cpSetPointObject(mapId, carrying);
    $gameSystem.cpClearCarrying();
    $gameSystem._cpLastResult = 'placed';
  } else if (carrying === 0 && placed > 0) {
    // 다시 집기
    $gameSystem.cpSetCarrying(placed);
    $gameSystem.cpSetPointObject(mapId, 0);
    $gameSystem._cpLastResult = 'retrieved';
  } else if (carrying > 0 && placed > 0) {
    $gameSystem._cpLastResult = 'occupied';
  } else {
    $gameSystem._cpLastResult = 'nothing';
  }

  RS.CP.refreshPointEvents(mapId);
};

//-----------------------------------------------------------------------------
// 지점 이벤트 그래픽 자동 갱신
//-----------------------------------------------------------------------------
RS.CP.Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
  RS.CP.Game_Event_setupPageSettings.call(this);
  if (!RS.CP.hasPointTag(this)) return;
  this._cpIsPoint = true;
  RS.CP.applyPointImage(this, $gameMap.mapId());
};

RS.CP.applyPointImage = function(event, mapId) {
  var objectId = $gameSystem.cpPointObject(mapId);
  if (objectId > 0) {
    var obj = RS.CP.objectData(objectId);
    if (obj) {
      event.setImage(obj.characterName, obj.characterIndex);
      event.setPattern(obj.pattern);
      event.setDirection(obj.direction);
    }
  }
  // objectId가 0이면 setupPageSettings가 이미 에디터의 기본(빈 상태)
  // 그래픽을 적용해둔 상태이므로 별도 처리가 필요 없습니다.
};

RS.CP.refreshPointEvents = function(mapId) {
  if (!$gameMap || $gameMap.mapId() !== mapId) return;
  var events = $gameMap.events();
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    if (ev._cpIsPoint) {
      ev.refresh();
    }
  }
};

//-----------------------------------------------------------------------------
// <CPItem:번호> 태그가 붙은 이벤트는 트리거되는 즉시(이벤트 내용 실행 전)
// 자동으로 물건을 줍고, <CPPoint> 태그가 붙은 이벤트는 트리거되는 즉시
// 자동으로 놓거나(들고 있을 때) 다시 집습니다(비어있지 않고 안 들고
// 있을 때). 둘 다 이벤트 내용 실행 전에 처리되므로, 그 뒤에 조건 분기로
// 결과를 확인해 대사 등을 자유롭게 넣을 수 있습니다.
//-----------------------------------------------------------------------------
RS.CP.Game_Event_start = Game_Event.prototype.start;
Game_Event.prototype.start = function() {
  var list = this.list();
  console.log('[CarryPlaceItem] Game_Event.start() 호출됨. eventId=', this.eventId(), 'mapId=', this._mapId, 'list=', list);
  var itemId = RS.CP.findItemIdOnCurrentPage(this);
  console.log('[CarryPlaceItem] findItemIdOnCurrentPage 결과:', itemId);
  if (itemId) {
    RS.CP.pickup(itemId);
    console.log('[CarryPlaceItem] pickup 호출됨. 현재 carrying=', $gameSystem.cpCarrying());
  } else if (RS.CP.hasPointTagOnCurrentPage(this)) {
    RS.CP.resolvePoint($gameMap.mapId());
  }
  RS.CP.Game_Event_start.call(this);
};

//-----------------------------------------------------------------------------
// 플러그인 명령
//-----------------------------------------------------------------------------
RS.CP.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  RS.CP.Game_Interpreter_pluginCommand.call(this, command, args);
  if (command === 'CarryPlace') {
    var sub = (args[0] || '').toLowerCase();
    if (sub === 'pickup') {
      RS.CP.pickup(Number(args[1] || 0));
    } else if (sub === 'point') {
      var mapId = args[1] ? Number(args[1]) : $gameMap.mapId();
      RS.CP.resolvePoint(mapId);
    } else if (sub === 'clear') {
      $gameSystem.cpClearCarrying();
    }
  }
};

//-----------------------------------------------------------------------------
// 머리 위 아이콘 표시 (들고 있는 물건을 플레이어 머리 위에 아이콘으로 표시)
//-----------------------------------------------------------------------------
if (RS.CP.showHeadIcon) {
  RS.CP.Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
  Spriteset_Map.prototype.createCharacters = function() {
    RS.CP.Spriteset_Map_createCharacters.call(this);
    this.createCPHeadIconSprite();
  };

  Spriteset_Map.prototype.createCPHeadIconSprite = function() {
    var sprite = new Sprite(new Bitmap(Window_Base._iconWidth, Window_Base._iconHeight));
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 1;
    sprite._cpDrawnId = -1;
    sprite.visible = false;
    this._cpHeadIconSprite = sprite;
    // 타일맵의 자식으로 넣으면 타일맵 내부 정렬(z/y 소트) 때문에 캐릭터
    // 뒤에 가려질 수 있으므로, 스프라이트셋 최상단(this)에 직접 붙여서
    // 항상 맵/캐릭터보다 위에 그려지도록 합니다.
    this.addChild(sprite);
    console.log('[CarryPlaceItem] 머리 위 아이콘 스프라이트 생성됨', sprite);
  };

  RS.CP.Spriteset_Map_update = Spriteset_Map.prototype.update;
  Spriteset_Map.prototype.update = function() {
    RS.CP.Spriteset_Map_update.call(this);
    if (this._cpHeadIconSprite) this.updateCPHeadIconSprite();
  };

  Spriteset_Map.prototype.updateCPHeadIconSprite = function() {
    var sprite = this._cpHeadIconSprite;
    var carrying = $gameSystem.cpCarrying();

    sprite.visible = carrying > 0;
    sprite.x = $gamePlayer.screenX();
    sprite.y = $gamePlayer.screenY() - RS.CP.headIconYOffset;

    if (carrying === sprite._cpDrawnId) return;
    sprite._cpDrawnId = carrying;
    sprite.bitmap.clear();
    console.log('[CarryPlaceItem] carrying 변경됨:', carrying, 'x=', sprite.x, 'y=', sprite.y, 'visible=', sprite.visible);

    if (carrying > 0) {
      var obj = RS.CP.objectData(carrying);
      if (!obj) {
        console.warn('[CarryPlaceItem] 물건 목록에 Id=' + carrying + ' 항목이 없습니다. 플러그인 매개변수 "물건 목록"을 확인해주세요.');
      } else if (obj.characterName) {
        console.log('[CarryPlaceItem] 캐릭터 이미지로 그리기 시도:', obj.characterName, obj);
        // 캐릭터 이미지(액터/오브젝트 그래픽)로 그린 물건인 경우
        RS.CP.drawCharacterOnSprite(sprite, obj);
      } else if (obj.iconIndex > 0) {
        // 아이콘으로 표시하는 물건인 경우
        var iconBitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = (obj.iconIndex % 16) * pw;
        var sy = Math.floor(obj.iconIndex / 16) * ph;
        iconBitmap.addLoadListener(function() {
          sprite.bitmap.resize(pw, ph);
          sprite.bitmap.blt(iconBitmap, sx, sy, pw, ph, 0, 0);
        });
      } else {
        console.warn('[CarryPlaceItem] Id=' + carrying + ' 물건에 캐릭터 이미지 파일명도, 아이콘 번호도 설정되어 있지 않습니다.');
      }
    }
  };

  // 캐릭터 이미지 파일에서 지정된 인덱스/패턴/방향에 해당하는 한 칸을
  // 잘라서 스프라이트에 그립니다. (Sprite_Character의 프레임 계산과 동일)
  RS.CP.drawCharacterOnSprite = function(sprite, obj) {
    var bitmap = ImageManager.loadCharacter(obj.characterName);
    bitmap.addLoadListener(function() {
      console.log('[CarryPlaceItem] 캐릭터 이미지 로드 완료:', obj.characterName, 'width=', bitmap.width, 'height=', bitmap.height);
      var big = ImageManager.isBigCharacter(obj.characterName);
      var pw = bitmap.width / (big ? 3 : 12);
      var ph = bitmap.height / (big ? 4 : 8);
      var blockX = big ? 0 : (obj.characterIndex % 4) * 3;
      var blockY = big ? 0 : Math.floor(obj.characterIndex / 4) * 4;
      var pattern = obj.pattern || 0;
      var dirRow = (obj.direction - 2) / 2;
      var sx = (blockX + pattern) * pw;
      var sy = (blockY + dirRow) * ph;
      console.log('[CarryPlaceItem] 잘라내는 좌표:', 'big=', big, 'pw=', pw, 'ph=', ph, 'sx=', sx, 'sy=', sy);
      sprite.bitmap.resize(pw, ph);
      sprite.bitmap.blt(bitmap, sx, sy, pw, ph, 0, 0);
    });
  };
}

})();
