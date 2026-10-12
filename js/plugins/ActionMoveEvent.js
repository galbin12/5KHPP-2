//=============================================================================
// RS_ActionMoveEvent.js
// 이벤트 페이지에 코멘트 태그(<RS_MoveTo:x,y,방향>)를 넣어두면, 그 이벤트를
// 어느 방향에서 액션(결정) 버튼으로 누르든 상관없이 플레이어가 무조건
// 지정된 절대 좌표로 길찾기 이동한 뒤, 지정된 방향을 보고 이벤트가
// 실행됩니다.
//=============================================================================
var Imported = Imported || {};
Imported.RS_ActionMoveEvent = true;

var RS = RS || {};
RS.AME = RS.AME || {};

/*:
 * @plugindesc v2.0 액션 버튼으로 이벤트 실행 시 플레이어가 지정 좌표로 이동(길찾기) 후 지정 방향을 보고 이벤트 실행
 * @author RS
 *
 * @help
 * =============================================================================
 * 사용 방법 (플러그인 명령 필요 없음!)
 * =============================================================================
 * 1. 이동시키고 싶은 이벤트 페이지 안에 "주석(코멘트)" 커맨드를 추가하고
 *    아래 형식으로 태그를 적습니다.
 *
 *      <RS_MoveTo:x,y>          -> 그 좌표로 이동만 하고 이벤트 실행
 *      <RS_MoveTo:x,y,방향>      -> 그 좌표로 이동 후 지정 방향을 보고 실행
 *
 *      예) <RS_MoveTo:12,8>
 *          -> 맵 좌표 (12,8) 칸으로 이동한 뒤 이벤트 실행
 *
 *      예) <RS_MoveTo:12,8,8>
 *          -> 맵 좌표 (12,8) 칸으로 이동한 뒤 위(8)를 보고 이벤트 실행
 *
 *      좌표는 맵 에디터에서 커서를 올렸을 때 화면 우하단에 표시되는
 *      절대 타일 좌표(X, Y)를 그대로 적으면 됩니다.
 *
 *      방향 숫자는 텐키 방향과 동일합니다.
 *      2 = 아래   4 = 왼쪽   6 = 오른쪽   8 = 위 (생략 가능)
 *
 * 2. 이 이벤트의 트리거는 반드시 "결정 버튼(액션 버튼)"으로 설정합니다.
 *
 * 3. 플레이어가 이 이벤트를 어느 방향(위/아래/좌/우)에서 결정 버튼으로
 *    누르든 상관없이:
 *      - 이벤트가 즉시 시작되는 대신
 *      - 플레이어가 지정된 좌표까지 길찾기(자동 경로탐색)로 이동하고
 *      - 도착하면 지정된 방향을 보고 바로 이벤트가 시작됩니다.
 *
 * 4. 코멘트 태그가 없는 이벤트는 완전히 기존 방식 그대로 동작합니다.
 *
 * =============================================================================
 * 주의
 * =============================================================================
 * - 길찾기는 RPG Maker MV 기본 "접근(Approach)" 이동 로직과 동일한
 *   탐색 알고리즘을 사용합니다. 너무 복잡한 미로형 지형이거나 목표가
 *   막혀서 도달 불가능하면 탐색이 막힌 자리에서 바로 이벤트가 실행됩니다
 *   (오류 없이 안전하게 진행됨).
 * - 이벤트가 여러 페이지를 가지고 있다면, 실행 시점의 "현재 활성 페이지"에
 *   달린 코멘트 태그를 기준으로 판정합니다.
 *
 * =============================================================================
 * 버전 로그
 * =============================================================================
 * 2026.08.05 (v2.0) - 방향+칸수 방식에서 절대좌표 이동(길찾기) 방식으로 변경
 * 2026.08.05 (v1.0) - 최초 작성 (방향+칸수 방식)
 */

//-----------------------------------------------------------------------------
// 코멘트에서 좌표/방향을 추출하는 정규식: <RS_MoveTo:12,8,8>
//-----------------------------------------------------------------------------
RS.AME.tagRegex = /<RS_MoveTo:\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d)\s*)?>/i;

RS.AME.parseEventMoveData = function(event) {
  var page = event.page();
  if (!page || !page.list) return null;
  var list = page.list;
  for (var i = 0; i < list.length; i++) {
    var cmd = list[i];
    if (cmd.code === 108 || cmd.code === 408) {
      var match = RS.AME.tagRegex.exec(cmd.parameters[0]);
      if (match) {
        var data = { x: Number(match[1]), y: Number(match[2]) };
        if (match[3] && [2, 4, 6, 8].indexOf(Number(match[3])) >= 0) {
          data.dir = Number(match[3]);
        }
        return data;
      }
    }
  }
  return null;
};

//-----------------------------------------------------------------------------
// 대기 중인 이동/이벤트 실행 예약 데이터
//-----------------------------------------------------------------------------
RS.AME.pending = null;

RS.AME.reserve = function(event, moveData) {
  RS.AME.pending = {
    event: event,
    targetX: moveData.x,
    targetY: moveData.y,
    dir: moveData.dir || 0,
    stuckCount: 0,
    originalThrough: $gamePlayer.isThrough()
  };
  // 목표 좌표에 이벤트(캐릭터와 동일 우선순위)가 서 있으면 길찾기가
  // 그 칸을 막힌 것으로 판정해서 영원히 재시도만 하게 됩니다.
  // 이동 중에는 통과 상태로 만들어 목표 칸까지 확실히 진입할 수 있게 합니다.
  $gamePlayer.setThrough(true);
};

//-----------------------------------------------------------------------------
// Game_Player - 액션 버튼(트리거 0)으로 시작되는 이벤트만 가로채서 이동 예약
// (startMapEvent는 Game_Map이 아니라 Game_Player에 정의되어 있습니다)
//-----------------------------------------------------------------------------
RS.AME.Game_Player_startMapEvent = Game_Player.prototype.startMapEvent;
Game_Player.prototype.startMapEvent = function(x, y, triggers, normal) {
  if (!$gameMap.isEventRunning() && triggers.indexOf(0) >= 0) {
    var events = $gameMap.events();
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      if (event.x === x && event.y === y && event.isTriggerIn(triggers) &&
          event.isNormalPriority() === normal) {
        var moveData = RS.AME.parseEventMoveData(event);
        if (moveData) {
          RS.AME.reserve(event, moveData);
          return;
        }
      }
    }
  }
  RS.AME.Game_Player_startMapEvent.call(this, x, y, triggers, normal);
};

//-----------------------------------------------------------------------------
// Game_Player - 매 프레임 목표 좌표까지 길찾기로 한 칸씩 이동, 도착하면 이벤트 시작
//-----------------------------------------------------------------------------
RS.AME.Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
  RS.AME.Game_Player_update.call(this, sceneActive);
  this.updateRS_ActionMoveEvent();
};

Game_Player.prototype.updateRS_ActionMoveEvent = function() {
  var p = RS.AME.pending;
  if (!p) return;
  if (this.isMoving()) return;

  // 이미 목표 좌표에 도착
  if (this.x === p.targetX && this.y === p.targetY) {
    RS.AME.finishPending(this, p);
    return;
  }

  var direction = this.findDirectionTo(p.targetX, p.targetY);
  if (direction > 0) {
    var beforeX = this.x, beforeY = this.y;
    this.moveStraight(direction);
    if (this.x === beforeX && this.y === beforeY) {
      // 통과 상태인데도 이동이 안 먹힌 경우 (지형 자체가 통행불가 등)
      p.stuckCount++;
    } else {
      p.stuckCount = 0;
    }
  } else {
    p.stuckCount++;
  }

  // 30프레임(약 0.5초) 이상 완전히 진행이 안 되면 포기하고 그 자리에서 이벤트 실행
  if (p.stuckCount >= 30) {
    RS.AME.finishPending(this, p);
  }
};

RS.AME.finishPending = function(player, p) {
  RS.AME.pending = null;
  player.setThrough(p.originalThrough);
  if (p.dir) {
    player.setDirection(p.dir);
  }
  if (p.event && !$gameMap.isEventRunning()) {
    p.event.start();
    // event.start()는 "시작 예약" 표시만 남길 뿐 실제로 인터프리터를
    // 구동시키지 않으므로, 반드시 아래 호출로 직접 실행시켜야 합니다.
    $gameMap.setupStartingEvent();
  }
};
