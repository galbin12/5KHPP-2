//=============================================================================
// PartyCutsceneMove.js
//=============================================================================

/*:
 * @plugindesc 컷신 중 파티원(리더/팔로워)을 actorId 기준으로 이동시키는 플러그인
 * @author (project)
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * 기본 "이동 루트 설정" 이벤트 명령은 대상으로 플레이어 / 이 이벤트 / 이벤트ID만
 * 지정할 수 있고, 특정 파티원(actorId)을 직접 지정할 수 없습니다.
 * 이 플러그인은 플러그인 커맨드로 actorId를 지정해서 그 캐릭터(현재 리더거나
 * 팔로워로 화면에 나와 있는 경우)를 이동시킬 수 있게 해줍니다.
 *
 * 대상으로 지정한 actorId가 현재 파티에 없거나 화면에 표시되지 않는 팔로워면
 * (예: 대기 캐릭터가 꺼져 있는 경우) 아무 동작도 하지 않고 콘솔에 경고를 남깁니다.
 *
 * ============================================================================
 * 플러그인 커맨드
 * ============================================================================
 *
 * PartyMove <actorId> <token1> <token2> ... [옵션 토큰]
 *
 *   예시)
 *   PartyMove 3 up up up wait
 *   PartyMove 2 turnLeft left left left through:on left wait
 *   PartyMove 1 toward wait
 *
 * PartyMoveWait <actorId>
 *   가장 최근에 그 캐릭터에게 내려진 이동 루트가 끝날 때까지
 *   이벤트를 대기시킵니다. (PartyMove 끝에 wait 토큰을 붙이는 것과 동일한 효과를
 *   나중에 별도로 걸고 싶을 때 사용)
 *
 * PartyMoveToLeader <actorId> [wait] [through]
 *   해당 actorId 캐릭터가 리더(플레이어)와 정확히 인접한 칸에 붙을 때까지
 *   매 프레임 자동으로 리더 쪽으로 이동합니다. 길이 막혀서 더 못 가면
 *   포기하지 않고 계속 시도합니다(장애물 있으면 그 자리에서 대기하듯 멈춰있음).
 *   [wait]를 붙이면 붙을 때까지 이벤트가 대기합니다. 안 붙이면 백그라운드로
 *   계속 진행되며(자동 갱신), 다른 이벤트 명령을 이어서 실행합니다.
 *   [through]를 붙이면 이동 중 이벤트/장애물을 통과 상태로 무시하고 이동하며,
 *   목표 지점에 도착(또는 Stop으로 중지)하면 원래 통과 상태로 자동 복구됩니다.
 *   중지하려면 PartyMoveToLeaderStop <actorId> 사용.
 *
 * PartyMoveToLeaderStop <actorId>
 *   PartyMoveToLeader로 걸어놓은 자동 추적을 중단시킵니다.
 *
 * PartyMoveBehindLeader <actorId> [wait] [through]
 *   해당 actorId 캐릭터가 "리더가 바라보는 방향 기준 바로 뒤 칸"으로
 *   정확히 이동합니다. (리더가 아래를 보고 있으면 리더 바로 위 칸,
 *   리더가 오른쪽을 보고 있으면 리더 바로 왼쪽 칸 등)
 *   리더가 이동 중이면 목표 칸도 매 프레임 갱신되어 따라갑니다.
 *   [wait]를 붙이면 도착할 때까지 이벤트가 대기합니다.
 *   [through]를 붙이면 이동 중 이벤트/장애물을 통과 상태로 무시하고 이동하며,
 *   목표 지점에 도착(또는 Stop으로 중지)하면 원래 통과 상태로 자동 복구됩니다.
 *   중지하려면 PartyMoveBehindLeaderStop <actorId> 사용.
 *
 * PartyMoveBehindLeaderStop <actorId>
 *   PartyMoveBehindLeader로 걸어놓은 자동 이동을 중단시킵니다.
 *
 * PartyMoveOntoLeader <actorId> [wait]
 *   해당 actorId 캐릭터가 리더와 완전히 같은 칸에 겹치도록 이동합니다.
 *   이동 중에는 자동으로 통과(through) 상태가 켜지고, 도착하면 원래
 *   통과 상태로 되돌아갑니다. [wait]를 붙이면 도착할 때까지 이벤트가 대기합니다.
 *   중지하려면 PartyMoveOntoLeaderStop <actorId> 사용.
 *
 * PartyMoveOntoLeaderStop <actorId>
 *   PartyMoveOntoLeader로 걸어놓은 자동 이동을 중단시킵니다.
 *   (통과 상태는 중단 시점의 상태 그대로 남으니 필요하면 through:off로 따로 꺼주세요)
 *
 * ----------------------------------------------------------------------------
 * 사용 가능한 이동 토큰 (기본 이동 루트 명령과 1:1 대응)
 * ----------------------------------------------------------------------------
 * 방향 이동   : down, left, right, up,
 *               lowerleft, lowerright, upperleft, upperright
 * 상대 이동   : random, toward, away, forward, backward
 * 점프        : jump:x,y            (예: jump:0,-2  현재 위치 기준 상대좌표, 타일단위)
 * 대기        : wait:n              (예: wait:30  프레임 단위)
 * 방향 전환   : turnDown, turnLeft, turnRight, turnUp,
 *               turn90R, turn90L, turn180, turnRandom90,
 *               turnRandom, turnToward, turnAway
 * 스위치      : switchOn:n, switchOff:n
 * 속도/빈도   : speed:n   (1~6)
 *               freq:n    (1~6)
 * 애니메이션  : walkAnimeOn, walkAnimeOff, stepAnimeOn, stepAnimeOff
 * 방향고정    : dirFixOn, dirFixOff
 * 통과        : through:on, through:off
 * 투명화      : transparentOn, transparentOff
 * 그래픽 변경 : image:파일명,인덱스   (예: image:Actor1,0)
 * 불투명도    : opacity:n            (0~255)
 * 합성방식    : blend:n              (0 노멀 / 1 덧셈 / 2 곱 / 3 스크린)
 * 효과음      : se:파일명,볼륨,피치   (예: se:Jump,90,100  볼륨/피치 생략 가능)
 * 스크립트    : script:임의JS코드
 *
 * ----------------------------------------------------------------------------
 * 옵션 토큰 (토큰 리스트 어디에 있어도 상관없이 인식됩니다)
 * ----------------------------------------------------------------------------
 * wait       : 이 이동 루트가 끝날 때까지 이벤트 진행을 멈춥니다.
 *              (기본 "이동 루트 설정"의 '이동 완료까지 대기'와 동일)
 * repeat     : 루트를 반복 실행합니다.
 * skippable  : 이동할 수 없는 경우 해당 명령을 건너뜁니다.
 *
 * ============================================================================
 * 스크립트에서 직접 사용하기
 * ============================================================================
 * PartyCutsceneMove.getCharacter(actorId)
 *   해당 actorId의 캐릭터(Game_Player 또는 Game_Follower) 인스턴스를 반환합니다.
 *   화면에 없으면 null.
 *
 * ============================================================================
 */

var PartyCutsceneMove = PartyCutsceneMove || {};

(function() {
    'use strict';

    //-------------------------------------------------------------------
    // actorId -> 캐릭터(Game_Player / Game_Follower) 찾기
    //-------------------------------------------------------------------
    PartyCutsceneMove.getCharacter = function(actorId) {
        actorId = Number(actorId);
        if ($gameParty.leader() && $gameParty.leader().actorId() === actorId) {
            return $gamePlayer;
        }
        var followers = $gamePlayer.followers()._data;
        for (var i = 0; i < followers.length; i++) {
            var follower = followers[i];
            var actor = follower.actor();
            if (actor && actor.actorId() === actorId && follower.isVisible()) {
                return follower;
            }
        }
        return null;
    };

    //-------------------------------------------------------------------
    // 토큰 파서 : 문자열 하나를 이동 루트 명령 하나로 변환
    //-------------------------------------------------------------------
    var GC = Game_Character;

    function makeCmd(code, params) {
        return { code: code, parameters: params || [] };
    }

    function parseToken(rawToken, route) {
        var key = rawToken;
        var value = null;
        var sep = rawToken.indexOf(':');
        if (sep >= 0) {
            key = rawToken.substring(0, sep);
            value = rawToken.substring(sep + 1);
        }
        var lowerKey = key.toLowerCase();

        switch (lowerKey) {
            case 'down': return makeCmd(GC.ROUTE_MOVE_DOWN);
            case 'left': return makeCmd(GC.ROUTE_MOVE_LEFT);
            case 'right': return makeCmd(GC.ROUTE_MOVE_RIGHT);
            case 'up': return makeCmd(GC.ROUTE_MOVE_UP);
            case 'lowerleft': return makeCmd(GC.ROUTE_MOVE_LOWER_L);
            case 'lowerright': return makeCmd(GC.ROUTE_MOVE_LOWER_R);
            case 'upperleft': return makeCmd(GC.ROUTE_MOVE_UPPER_L);
            case 'upperright': return makeCmd(GC.ROUTE_MOVE_UPPER_R);
            case 'random': return makeCmd(GC.ROUTE_MOVE_RANDOM);
            case 'toward': return makeCmd(GC.ROUTE_MOVE_TOWARD);
            case 'away': return makeCmd(GC.ROUTE_MOVE_AWAY);
            case 'forward': return makeCmd(GC.ROUTE_MOVE_FORWARD);
            case 'backward': return makeCmd(GC.ROUTE_MOVE_BACKWARD);
            case 'jump': {
                var xy = (value || '0,0').split(',');
                return makeCmd(GC.ROUTE_JUMP, [Number(xy[0]) || 0, Number(xy[1]) || 0]);
            }
            case 'wait': {
                // 옵션 토큰 'wait'(값 없음)와 이동명령 'wait:n'을 구분
                if (value !== null) {
                    return makeCmd(GC.ROUTE_WAIT, [Number(value) || 1]);
                }
                return null; // 옵션 토큰이므로 이동 루트에는 명령을 추가하지 않음
            }
            case 'turndown': return makeCmd(GC.ROUTE_TURN_DOWN);
            case 'turnleft': return makeCmd(GC.ROUTE_TURN_LEFT);
            case 'turnright': return makeCmd(GC.ROUTE_TURN_RIGHT);
            case 'turnup': return makeCmd(GC.ROUTE_TURN_UP);
            case 'turn90r': return makeCmd(GC.ROUTE_TURN_90D_R);
            case 'turn90l': return makeCmd(GC.ROUTE_TURN_90D_L);
            case 'turn180': return makeCmd(GC.ROUTE_TURN_180D);
            case 'turnrandom90': return makeCmd(GC.ROUTE_TURN_90D_R_L);
            case 'turnrandom': return makeCmd(GC.ROUTE_TURN_RANDOM);
            case 'turntoward': return makeCmd(GC.ROUTE_TURN_TOWARD);
            case 'turnaway': return makeCmd(GC.ROUTE_TURN_AWAY);
            case 'switchon': return makeCmd(GC.ROUTE_SWITCH_ON, [Number(value)]);
            case 'switchoff': return makeCmd(GC.ROUTE_SWITCH_OFF, [Number(value)]);
            case 'speed': return makeCmd(GC.ROUTE_CHANGE_SPEED, [Number(value)]);
            case 'freq': return makeCmd(GC.ROUTE_CHANGE_FREQ, [Number(value)]);
            case 'walkanimeon': return makeCmd(GC.ROUTE_WALK_ANIME_ON);
            case 'walkanimeoff': return makeCmd(GC.ROUTE_WALK_ANIME_OFF);
            case 'stepanimeon': return makeCmd(GC.ROUTE_STEP_ANIME_ON);
            case 'stepanimeoff': return makeCmd(GC.ROUTE_STEP_ANIME_OFF);
            case 'dirfixon': return makeCmd(GC.ROUTE_DIR_FIX_ON);
            case 'dirfixoff': return makeCmd(GC.ROUTE_DIR_FIX_OFF);
            case 'through': {
                return makeCmd(value === 'off' ? GC.ROUTE_THROUGH_OFF : GC.ROUTE_THROUGH_ON);
            }
            case 'transparenton': return makeCmd(GC.ROUTE_TRANSPARENT_ON);
            case 'transparentoff': return makeCmd(GC.ROUTE_TRANSPARENT_OFF);
            case 'image': {
                var img = (value || '').split(',');
                return makeCmd(GC.ROUTE_CHANGE_IMAGE, [img[0] || '', Number(img[1]) || 0]);
            }
            case 'opacity': return makeCmd(GC.ROUTE_CHANGE_OPACITY, [Number(value)]);
            case 'blend': return makeCmd(GC.ROUTE_CHANGE_BLEND_MODE, [Number(value)]);
            case 'se': {
                var se = (value || '').split(',');
                return makeCmd(GC.ROUTE_PLAY_SE, [{
                    name: se[0] || '',
                    volume: se[1] !== undefined ? Number(se[1]) : 90,
                    pitch: se[2] !== undefined ? Number(se[2]) : 100,
                    pan: se[3] !== undefined ? Number(se[3]) : 0
                }]);
            }
            case 'script': return makeCmd(GC.ROUTE_SCRIPT, [value || '']);
            default:
                console.warn('PartyCutsceneMove: 알 수 없는 토큰 "' + rawToken + '" 무시함');
                return null;
        }
    }

    //-------------------------------------------------------------------
    // 토큰 배열 -> 이동 루트(route) 객체
    //-------------------------------------------------------------------
    function buildRoute(tokens) {
        var route = { list: [], repeat: false, skippable: false, wait: false };
        tokens.forEach(function(token) {
            var lower = token.toLowerCase();
            if (lower === 'repeat') { route.repeat = true; return; }
            if (lower === 'skippable') { route.skippable = true; return; }
            if (lower === 'wait') { route.wait = true; return; }
            var cmd = parseToken(token, route);
            if (cmd) route.list.push(cmd);
        });
        route.list.push(makeCmd(GC.ROUTE_END));
        return route;
    }

    //-------------------------------------------------------------------
    // 리더에게 붙을 때까지 자동 추적
    //-------------------------------------------------------------------
    PartyCutsceneMove._followTargets = {}; // actorId -> { done: bool }

    function isAdjacentToLeader(character) {
        var dx = character.x - $gamePlayer.x;
        var dy = character.y - $gamePlayer.y;
        if (dx === 0 && dy === 0) return false; // 같은 칸은 제외
        return Math.max(Math.abs(dx), Math.abs(dy)) <= 1;
    }

    PartyCutsceneMove.startMoveToLeader = function(actorId, useThrough) {
        var character = PartyCutsceneMove.getCharacter(actorId);
        var originalThrough = character ? character.isThrough() : false;
        if (useThrough && character) character.setThrough(true);
        PartyCutsceneMove._followTargets[actorId] = {
            done: false,
            useThrough: !!useThrough,
            originalThrough: originalThrough
        };
    };

    PartyCutsceneMove.stopMoveToLeader = function(actorId) {
        var entry = PartyCutsceneMove._followTargets[actorId];
        if (entry && entry.useThrough) {
            var character = PartyCutsceneMove.getCharacter(actorId);
            if (character) character.setThrough(entry.originalThrough);
        }
        delete PartyCutsceneMove._followTargets[actorId];
    };

    PartyCutsceneMove.isMoveToLeaderDone = function(actorId) {
        var entry = PartyCutsceneMove._followTargets[actorId];
        return !entry || entry.done;
    };

    PartyCutsceneMove.updateFollowTargets = function() {
        for (var actorIdKey in PartyCutsceneMove._followTargets) {
            var actorId = Number(actorIdKey);
            var entry = PartyCutsceneMove._followTargets[actorId];
            if (!entry || entry.done) continue;

            var character = PartyCutsceneMove.getCharacter(actorId);
            if (!character) continue; // 화면에서 사라짐: 다음 프레임에 재시도

            if (isAdjacentToLeader(character)) {
                if (entry.useThrough) character.setThrough(entry.originalThrough);
                entry.done = true;
                continue;
            }
            if (!character.isMoving()) {
                character.moveTowardCharacter($gamePlayer);
            }
        }
    };

    var _Game_Map_update_PCM = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update_PCM.call(this, sceneActive);
        PartyCutsceneMove.updateFollowTargets();
        PartyCutsceneMove.updateBehindTargets();
        PartyCutsceneMove.updateOntoTargets();
    };

    var _Game_Interpreter_updateWaitMode_PCM = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'partyMoveToLeader') {
            var done = PartyCutsceneMove.isMoveToLeaderDone(this._pcmWaitActorId);
            if (done) {
                this._waitMode = '';
                return false;
            }
            return true;
        }
        if (this._waitMode === 'partyMoveBehindLeader') {
            var behindDone = PartyCutsceneMove.isMoveBehindLeaderDone(this._pcmWaitActorId);
            if (behindDone) {
                this._waitMode = '';
                return false;
            }
            return true;
        }
        if (this._waitMode === 'partyMoveOntoLeader') {
            var ontoDone = PartyCutsceneMove.isMoveOntoLeaderDone(this._pcmWaitActorId);
            if (ontoDone) {
                this._waitMode = '';
                return false;
            }
            return true;
        }
        return _Game_Interpreter_updateWaitMode_PCM.call(this);
    };

    //-------------------------------------------------------------------
    // 리더 정면 기준 바로 뒤 칸으로 이동
    //-------------------------------------------------------------------
    PartyCutsceneMove._behindTargets = {}; // actorId -> { done: bool }

    // 방향코드(2/4/6/8)를 반대 방향으로
    function reverseDirection(d) {
        return 10 - d;
    }

    function directionToDelta(d) {
        switch (d) {
            case 2: return { x: 0, y: 1 };
            case 4: return { x: -1, y: 0 };
            case 6: return { x: 1, y: 0 };
            case 8: return { x: 0, y: -1 };
            default: return { x: 0, y: 0 };
        }
    }

    function getBehindLeaderPosition() {
        var behindDir = reverseDirection($gamePlayer.direction());
        var delta = directionToDelta(behindDir);
        return { x: $gamePlayer.x + delta.x, y: $gamePlayer.y + delta.y };
    }

    function moveCharacterTowardPoint(character, x, y) {
        var sx = character.deltaXFrom(x);
        var sy = character.deltaYFrom(y);
        if (Math.abs(sx) > Math.abs(sy)) {
            character.moveStraight(sx > 0 ? 4 : 6);
            if (!character.isMovementSucceeded() && sy !== 0) {
                character.moveStraight(sy > 0 ? 8 : 2);
            }
        } else if (sy !== 0) {
            character.moveStraight(sy > 0 ? 8 : 2);
            if (!character.isMovementSucceeded() && sx !== 0) {
                character.moveStraight(sx > 0 ? 4 : 6);
            }
        }
    }

    PartyCutsceneMove.startMoveBehindLeader = function(actorId, useThrough) {
        var character = PartyCutsceneMove.getCharacter(actorId);
        var originalThrough = character ? character.isThrough() : false;
        if (useThrough && character) character.setThrough(true);
        PartyCutsceneMove._behindTargets[actorId] = {
            done: false,
            useThrough: !!useThrough,
            originalThrough: originalThrough
        };
    };

    PartyCutsceneMove.stopMoveBehindLeader = function(actorId) {
        var entry = PartyCutsceneMove._behindTargets[actorId];
        if (entry && entry.useThrough) {
            var character = PartyCutsceneMove.getCharacter(actorId);
            if (character) character.setThrough(entry.originalThrough);
        }
        delete PartyCutsceneMove._behindTargets[actorId];
    };

    PartyCutsceneMove.isMoveBehindLeaderDone = function(actorId) {
        var entry = PartyCutsceneMove._behindTargets[actorId];
        return !entry || entry.done;
    };

    PartyCutsceneMove.updateBehindTargets = function() {
        for (var actorIdKey in PartyCutsceneMove._behindTargets) {
            var actorId = Number(actorIdKey);
            var entry = PartyCutsceneMove._behindTargets[actorId];
            if (!entry || entry.done) continue;

            var character = PartyCutsceneMove.getCharacter(actorId);
            if (!character) continue;

            var target = getBehindLeaderPosition();
            if (character.x === target.x && character.y === target.y) {
                if (entry.useThrough) character.setThrough(entry.originalThrough);
                entry.done = true;
                continue;
            }
            if (!character.isMoving()) {
                moveCharacterTowardPoint(character, target.x, target.y);
            }
        }
    };

    //-------------------------------------------------------------------
    // 리더와 완전히 같은 칸으로 겹치게 이동
    //-------------------------------------------------------------------
    PartyCutsceneMove._ontoTargets = {}; // actorId -> { done: bool, originalThrough: bool }

    PartyCutsceneMove.startMoveOntoLeader = function(actorId, character) {
        PartyCutsceneMove._ontoTargets[actorId] = {
            done: false,
            originalThrough: character.isThrough()
        };
        character.setThrough(true);
    };

    PartyCutsceneMove.stopMoveOntoLeader = function(actorId) {
        delete PartyCutsceneMove._ontoTargets[actorId];
    };

    PartyCutsceneMove.isMoveOntoLeaderDone = function(actorId) {
        var entry = PartyCutsceneMove._ontoTargets[actorId];
        return !entry || entry.done;
    };

    PartyCutsceneMove.updateOntoTargets = function() {
        for (var actorIdKey in PartyCutsceneMove._ontoTargets) {
            var actorId = Number(actorIdKey);
            var entry = PartyCutsceneMove._ontoTargets[actorId];
            if (!entry || entry.done) continue;

            var character = PartyCutsceneMove.getCharacter(actorId);
            if (!character) continue;

            if (character.x === $gamePlayer.x && character.y === $gamePlayer.y) {
                character.setThrough(entry.originalThrough);
                entry.done = true;
                continue;
            }
            if (!character.isMoving()) {
                moveCharacterTowardPoint(character, $gamePlayer.x, $gamePlayer.y);
            }
        }
    };

    //-------------------------------------------------------------------
    // 플러그인 커맨드
    //-------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand_PCM = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand_PCM.call(this, command, args);

        if (command === 'PartyMove') {
            var actorId = Number(args[0]);
            var tokens = args.slice(1);
            var character = PartyCutsceneMove.getCharacter(actorId);
            if (!character) {
                console.warn('PartyCutsceneMove: actorId ' + actorId + ' 캐릭터를 화면에서 찾을 수 없습니다.');
                return;
            }
            var route = buildRoute(tokens);
            character.forceMoveRoute(route);
            if (route.wait) {
                this._character = character;
                this.setWaitMode('route');
            }
        }

        if (command === 'PartyMoveWait') {
            var waitActorId = Number(args[0]);
            var waitCharacter = PartyCutsceneMove.getCharacter(waitActorId);
            if (!waitCharacter) {
                console.warn('PartyCutsceneMove: actorId ' + waitActorId + ' 캐릭터를 화면에서 찾을 수 없습니다.');
                return;
            }
            this._character = waitCharacter;
            this.setWaitMode('route');
        }

        if (command === 'PartyMoveToLeader') {
            var followActorId = Number(args[0]);
            var followRest = args.slice(1).map(function(a) { return a.toLowerCase(); });
            var shouldWait = followRest.indexOf('wait') >= 0;
            var useThroughToLeader = followRest.indexOf('through') >= 0;
            var followCharacter = PartyCutsceneMove.getCharacter(followActorId);
            if (!followCharacter) {
                console.warn('PartyCutsceneMove: actorId ' + followActorId + ' 캐릭터를 화면에서 찾을 수 없습니다.');
                return;
            }
            PartyCutsceneMove.startMoveToLeader(followActorId, useThroughToLeader);
            if (shouldWait) {
                this._pcmWaitActorId = followActorId;
                this._waitMode = 'partyMoveToLeader';
            }
        }

        if (command === 'PartyMoveToLeaderStop') {
            var stopActorId = Number(args[0]);
            PartyCutsceneMove.stopMoveToLeader(stopActorId);
        }

        if (command === 'PartyMoveBehindLeader') {
            var behindActorId = Number(args[0]);
            var behindRest = args.slice(1).map(function(a) { return a.toLowerCase(); });
            var behindShouldWait = behindRest.indexOf('wait') >= 0;
            var useThroughBehind = behindRest.indexOf('through') >= 0;
            var behindCharacter = PartyCutsceneMove.getCharacter(behindActorId);
            if (!behindCharacter) {
                console.warn('PartyCutsceneMove: actorId ' + behindActorId + ' 캐릭터를 화면에서 찾을 수 없습니다.');
                return;
            }
            PartyCutsceneMove.startMoveBehindLeader(behindActorId, useThroughBehind);
            if (behindShouldWait) {
                this._pcmWaitActorId = behindActorId;
                this._waitMode = 'partyMoveBehindLeader';
            }
        }

        if (command === 'PartyMoveBehindLeaderStop') {
            var stopBehindActorId = Number(args[0]);
            PartyCutsceneMove.stopMoveBehindLeader(stopBehindActorId);
        }

        if (command === 'PartyMoveOntoLeader') {
            var ontoActorId = Number(args[0]);
            var ontoShouldWait = args[1] && args[1].toLowerCase() === 'wait';
            var ontoCharacter = PartyCutsceneMove.getCharacter(ontoActorId);
            if (!ontoCharacter) {
                console.warn('PartyCutsceneMove: actorId ' + ontoActorId + ' 캐릭터를 화면에서 찾을 수 없습니다.');
                return;
            }
            PartyCutsceneMove.startMoveOntoLeader(ontoActorId, ontoCharacter);
            if (ontoShouldWait) {
                this._pcmWaitActorId = ontoActorId;
                this._waitMode = 'partyMoveOntoLeader';
            }
        }

        if (command === 'PartyMoveOntoLeaderStop') {
            var stopOntoActorId = Number(args[0]);
            PartyCutsceneMove.stopMoveOntoLeader(stopOntoActorId);
        }
    };

})();
