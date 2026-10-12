//=============================================================================
// TrailingActorEffect.js
//=============================================================================

/*:
 * @plugindesc 플레이어가 이동할 때 뒤에 특정 액터의 잔상(고스트)이 잠깐 나타났다가 사라지는 연출
 * @author ㄹㅅㅁ
 *
 * @help
 * ============================================================================
 * 사용법 (Plugin Command)
 * ============================================================================
 *
 *   TrailingActor start actorId
 *   TrailingActor start actorId interval life opacity distance maxCount
 *   TrailingActor startEvent eventId
 *   TrailingActor startEvent eventId interval life opacity distance maxCount
 *   TrailingActor stop
 *
 *   - actorId   : 뒤에 보여줄 액터의 ID (파티에 없는 캐릭터도 가능)
 *   - eventId   : 뒤에 보여줄 "현재 맵에 있는" 이벤트의 ID
 *                 (이벤트에 설정된 캐릭터 그래픽을 그대로 사용합니다)
 *   - interval  : 잔상을 몇 프레임마다 하나씩 생성할지 (기본 10)
 *   - life      : 잔상 하나가 몇 프레임 동안 유지되며 사라지는지 (기본 30)
 *   - opacity   : 잔상의 시작 불투명도 0~255 (기본 180)
 *   - distance  : 플레이어가 "실제로 지나온 발걸음" 기준으로 몇 걸음 뒤에
 *                 나타나게 할지 (기본 2). 벽 모서리를 돌아도 실제 걸어온
 *                 경로를 따라 나타납니다.
 *   - maxCount  : 총 몇 개까지만 생성하고 자동으로 멈출지 (기본 0 = 무제한)
 *
 * 예시:
 *   TrailingActor start 3
 *   TrailingActor start 3 10 30 180 2
 *   TrailingActor startEvent 12 10 30 255 3 5   (5개만 생성하고 자동 정지)
 *   TrailingActor stop
 *
 * 플레이어가 멈춰 있을 때는 잔상이 생성되지 않고, 걸을 때만 생성됩니다.
 *
 * 맵 이동 시 자동으로 정지됩니다. 컷씬 등에서 다시 쓰려면 맵 진입 후
 * 이벤트로 다시 TrailingActor start / startEvent를 호출해주세요.
 * ============================================================================
 */

(function() {

    var TrailingActor = {
        active: false,
        type: 'actor', // 'actor' or 'event'
        actorId: 1,
        eventId: 1,
        interval: 10,
        life: 30,
        opacity: 180,
        distance: 2,
        maxCount: 0, // 0 = 무제한
        spawnedCount: 0,
        _timer: 0
    };

    window.$trailingActorConfig = TrailingActor;

    //--------------------------------------------------------------------
    // Plugin Command
    //--------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'TrailingActor') {
            switch (args[0]) {
                case 'start':
                    TrailingActor.active = true;
                    TrailingActor.type = 'actor';
                    TrailingActor.actorId = Number(args[1] || 1);
                    TrailingActor.interval = Number(args[2] || 10);
                    TrailingActor.life = Number(args[3] || 30);
                    TrailingActor.opacity = Number(args[4] || 180);
                    TrailingActor.distance = Number(args[5] || 2);
                    TrailingActor.maxCount = Number(args[6] || 0);
                    TrailingActor.spawnedCount = 0;
                    TrailingActor._timer = 0;
                    break;
                case 'startEvent':
                    TrailingActor.active = true;
                    TrailingActor.type = 'event';
                    TrailingActor.eventId = Number(args[1] || 1);
                    TrailingActor.interval = Number(args[2] || 10);
                    TrailingActor.life = Number(args[3] || 30);
                    TrailingActor.opacity = Number(args[4] || 180);
                    TrailingActor.distance = Number(args[5] || 2);
                    TrailingActor.maxCount = Number(args[6] || 0);
                    TrailingActor.spawnedCount = 0;
                    TrailingActor._timer = 0;
                    break;
                case 'stop':
                    TrailingActor.active = false;
                    break;
            }
        }
    };

    //--------------------------------------------------------------------
    // Game_Player : 실제 지나온 타일 경로 기록
    //--------------------------------------------------------------------

    var _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _Game_Player_initMembers.call(this);
        this._trailHistory = [];
    };

    var _Game_Player_increaseSteps = Game_Player.prototype.increaseSteps;
    Game_Player.prototype.increaseSteps = function() {
        _Game_Player_increaseSteps.call(this);
        if (!this._trailHistory) this._trailHistory = [];
        this._trailHistory.push({ x: this.x, y: this.y, d: this.direction() });
        if (this._trailHistory.length > 100) {
            this._trailHistory.shift();
        }
    };

    Game_Player.prototype.trailPositionBehind = function(steps) {
        if (!this._trailHistory) return null;
        var index = this._trailHistory.length - 1 - steps;
        if (index < 0) return null;
        return this._trailHistory[index];
    };

    //--------------------------------------------------------------------
    // Sprite_ActorGhost : 잔상 하나를 표현하는 스프라이트
    //--------------------------------------------------------------------

    function Sprite_ActorGhost() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ActorGhost.prototype = Object.create(Sprite.prototype);
    Sprite_ActorGhost.prototype.constructor = Sprite_ActorGhost;

    Sprite_ActorGhost.prototype.initialize = function(characterName, characterIndex, x, y, direction, pattern, life, startOpacity) {
        Sprite.prototype.initialize.call(this);
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this._life = life;
        this._maxLife = life;
        this._direction = direction;
        this._pattern = pattern;
        this.x = x;
        this.y = y;
        this.z = 3;

        this._characterName = characterName || '';
        this._characterIndex = characterIndex || 0;

        this.bitmap = ImageManager.loadCharacter(this._characterName);
        this.opacity = startOpacity;
        this._startOpacity = startOpacity;

        this.updateFrame();
    };

    Sprite_ActorGhost.prototype.isBigCharacter = function() {
        return ImageManager.isBigCharacter(this._characterName);
    };

    Sprite_ActorGhost.prototype.updateFrame = function() {
        var big = this.isBigCharacter();
        var pw = this.bitmap.width / (big ? 3 : 12);
        var ph = this.bitmap.height / (big ? 4 : 8);
        var n = this._characterIndex;
        var kx = big ? 0 : n % 4 * 3;
        var ky = big ? 0 : Math.floor(n / 4) * 4;
        var dx = (this._pattern < 3 ? this._pattern : 1) * pw;
        var dy = (this.directionIndex(this._direction)) * ph;
        this.setFrame(kx * pw + dx, ky * ph + dy, pw, ph);
    };

    Sprite_ActorGhost.prototype.directionIndex = function(d) {
        switch (d) {
            case 2: return 0;
            case 4: return 1;
            case 6: return 2;
            case 8: return 3;
            default: return 0;
        }
    };

    Sprite_ActorGhost.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this._life--;
        var rate = this._life / this._maxLife;
        this.opacity = this._startOpacity * rate;
        if (this._life <= 0) {
            this._dead = true;
        }
    };

    Sprite_ActorGhost.prototype.isDead = function() {
        return this._dead;
    };

    //--------------------------------------------------------------------
    // Spriteset_Map : 잔상 스프라이트 관리
    //--------------------------------------------------------------------

    var _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
    Spriteset_Map.prototype.createCharacters = function() {
        _Spriteset_Map_createCharacters.call(this);
        this._actorGhostSprites = [];
        this._actorGhostContainer = new Sprite();
        this._tilemap.addChild(this._actorGhostContainer);
    };

    var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        this.updateActorGhosts();
    };

    Spriteset_Map.prototype.updateActorGhosts = function() {
        if (!this._actorGhostContainer) return;

        var cfg = TrailingActor;
        var player = $gamePlayer;

        if (cfg.active && player.isMoving()) {
            cfg._timer++;
            if (cfg._timer >= cfg.interval) {
                cfg._timer = 0;
                this.spawnActorGhost(cfg);
                if (cfg.maxCount > 0 && cfg.spawnedCount >= cfg.maxCount) {
                    cfg.active = false;
                }
            }
        } else {
            cfg._timer = cfg.interval;
        }

        for (var i = this._actorGhostSprites.length - 1; i >= 0; i--) {
            var sprite = this._actorGhostSprites[i];
            sprite.update();
            if (sprite.isDead()) {
                this._actorGhostContainer.removeChild(sprite);
                this._actorGhostSprites.splice(i, 1);
            }
        }
    };

    Spriteset_Map.prototype.spawnActorGhost = function(cfg) {
        var player = $gamePlayer;

        var characterName = '';
        var characterIndex = 0;

        if (cfg.type === 'event') {
            var ev = $gameMap.event(cfg.eventId);
            if (!ev) {
                console.warn('[TrailingActorEffect] 현재 맵에 eventId ' + cfg.eventId + ' 가 없습니다.');
                return;
            }
            characterName = ev.characterName();
            characterIndex = ev.characterIndex();
            if (!characterName) {
                console.warn('[TrailingActorEffect] eventId ' + cfg.eventId + ' 의 캐릭터 그래픽이 비어있습니다.');
                return;
            }
        } else {
            var actor = $gameActors.actor(cfg.actorId);
            if (!actor) {
                console.warn('[TrailingActorEffect] actorId ' + cfg.actorId + ' 가 존재하지 않습니다.');
                return;
            }
            characterName = actor.characterName();
            characterIndex = actor.characterIndex();
            if (!characterName) {
                console.warn('[TrailingActorEffect] actorId ' + cfg.actorId + ' 의 캐릭터 그래픽이 비어있습니다.');
                return;
            }
        }

        var pos = this.getBehindPlayerPosition(player, cfg.distance);
        if (!pos) return;

        var sprite = new Sprite_ActorGhost(
            characterName,
            characterIndex,
            pos.screenX,
            pos.screenY,
            pos.direction,
            player.pattern(),
            cfg.life,
            cfg.opacity
        );
        this._actorGhostContainer.addChild(sprite);
        this._actorGhostSprites.push(sprite);
        cfg.spawnedCount++;
    };

    Spriteset_Map.prototype.getBehindPlayerPosition = function(player, distance) {
        var trail = player.trailPositionBehind(Math.max(0, distance || 0));
        if (!trail) return null;
        var tw = $gameMap.tileWidth();
        var th = $gameMap.tileHeight();
        var screenX = $gameMap.adjustX(trail.x) * tw + tw / 2;
        var screenY = $gameMap.adjustY(trail.y) * th + th;
        return { screenX: screenX, screenY: screenY, direction: trail.d };
    };

    //--------------------------------------------------------------------
    // 맵 이동 시 자동 정지
    //--------------------------------------------------------------------

    var _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        _Game_Player_performTransfer.call(this);
        TrailingActor.active = false;
        this._trailHistory = [];
    };

})();
