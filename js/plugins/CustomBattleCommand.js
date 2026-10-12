//=============================================================================
// CustomBattleCommand.js
//=============================================================================

/*:
 * @plugindesc 전투 중 "설득" 같은 커스텀 커맨드를 추가해 커먼 이벤트(대사)를
 * 실행하게 합니다. 플러그인 커맨드로 전투마다 다르게 등록해 재사용 가능합니다.
 * @author ㄹㅅㅁ
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 *
 * 트룹(적 그룹)의 배틀 이벤트에서, Turn 0 (전투 시작 시) 페이지에
 * 아래 플러그인 커맨드를 넣으세요.
 *
 *   AddBattleCommand persuade 설득 5 top actor:1 once
 *
 * 형식:  AddBattleCommand <심볼> <표시이름> <커먼이벤트ID> [옵션...]
 *
 *   - 심볼      : 내부 식별용 영문 단어 (공백 없이, 전투 내에서 중복 안 되게)
 *   - 표시이름  : 커맨드창에 실제로 보일 이름 (한글 가능)
 *   - 커먼이벤트ID : 선택 시 실행할 커먼 이벤트 번호
 *   - 옵션 (순서 상관없이, 필요한 것만 뒤에 추가):
 *       top / afterAttack / bottom : 뜨는 위치 (기본값 afterAttack)
 *       sub : 공격/스킬/보호 창이 아니라, 아이템/도망 쪽 창(BattleUIRework.js의
 *             그룹2)에 아이템 "바로 앞"에 뜨게 합니다. BattleUIRework.js가
 *             켜져 있을 때만 의미가 있습니다.
 *       actor:숫자   : 그 액터 ID를 가진 캐릭터에게만 커맨드가 보입니다.
 *                      (예: actor:1 → 1번 액터만 "설득" 가능)
 *       once         : 파티원 중 누구든 한 번 사용하면, 그 즉시 모두의
 *                      커맨드창에서 사라집니다. (한 번만 실행되게)
 *       eventOnce    : 커맨드는 계속 남아있고 계속 선택할 수 있지만,
 *                      커먼 이벤트는 전투 통틀어 최초 1회만 실행됩니다.
 *       perTurn      : 커맨드는 계속 남아있고 계속 선택할 수 있지만,
 *                      같은 턴 안에서는 누가 먼저 선택하든 커먼 이벤트가
 *                      1번만 실행됩니다. 턴이 넘어가면 다시 실행 가능합니다.
 *                      (예: 액터 4명이 같은 턴에 전부 "설득"을 눌러도
 *                       대사는 딱 한 번만 나옴)
 *
 * 예시)
 *   1번 액터만 쓸 수 있는 설득 커맨드:
 *     AddBattleCommand persuade 설득 5 actor:1
 *
 *   누가 눌러도 상관없지만 딱 한 번만 실행되게:
 *     AddBattleCommand persuade 설득 5 once
 *
 *   둘 다 적용(1번 액터만, 게다가 한 번 쓰면 사라짐):
 *     AddBattleCommand persuade 설득 5 actor:1 once
 *
 * 예시) 협박이라는 커맨드를 추가해서 12번 커먼 이벤트를 맨 위에 뜨게 하려면:
 *   AddBattleCommand threaten 협박 12 top
 *
 * 한 전투에 여러 개 등록도 가능합니다. 플러그인 커맨드를 여러 줄 쓰면 됩니다.
 *
 *   AddBattleCommand persuade 설득 5
 *   AddBattleCommand threaten 협박 12
 *
 * 등록한 커맨드는 그 전투가 끝나면 자동으로 초기화되어, 다른 전투에는
 * 영향을 주지 않습니다. 즉 트룹마다 다른 이름/다른 커먼 이벤트로 자유롭게
 * 재사용할 수 있습니다.
 *
 * 플러그인 목록에서의 위치(순서)는 상관없습니다. 아무 곳에나 두어도
 * 정상 작동합니다.
 *
 * ----------------------------------------------------------------------
 * 동작 방식
 * ----------------------------------------------------------------------
 * 커맨드를 선택하면:
 *   1) 지정한 커먼 이벤트가 실행됩니다 (대사, 분기 등 자유롭게 구성)
 *   2) 해당 액터는 방어(Guard) 판정으로 턴을 소모합니다
 *      (데미지도 안 주고 안 받는 안전한 처리이며, 커먼 이벤트 안에서
 *       원하는 대로 승리/도망/상태이상 부여 등을 직접 제어하면 됩니다)
 *
 * ============================================================================
 */

(function() {

  var Imported = window.Imported || {};
  Imported.CustomBattleCommand = true;

  //--------------------------------------------------------------------------
  // Plugin Command
  //--------------------------------------------------------------------------

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'AddBattleCommand') {
      var symbol = args[0];
      var name = args[1];
      var commonEventId = Number(args[2]);
      var position = 'afterAttack';
      var actorId = null;
      var once = false;
      var eventOnce = false;
      var perTurn = false;
      for (var i = 3; i < args.length; i++) {
        var arg = args[i];
        if (arg === 'top' || arg === 'afterAttack' || arg === 'bottom' ||
            arg === 'sub') {
          position = arg;
        } else if (arg === 'once') {
          once = true;
        } else if (arg === 'eventOnce') {
          eventOnce = true;
        } else if (arg === 'perTurn') {
          perTurn = true;
        } else if (/^actor:\d+$/i.test(arg)) {
          actorId = Number(arg.split(':')[1]);
        }
      }
      $gameTroop.addCustomBattleCommand(symbol, name, commonEventId, position, actorId, once, eventOnce, perTurn);
    }
  };

  //--------------------------------------------------------------------------
  // Game_Troop - 전투별 커스텀 커맨드 목록 관리
  //--------------------------------------------------------------------------

  var _Game_Troop_setup = Game_Troop.prototype.setup;
  Game_Troop.prototype.setup = function(troopId) {
    _Game_Troop_setup.call(this, troopId);
    this._customBattleCommands = [];
  };

  Game_Troop.prototype.addCustomBattleCommand = function(symbol, name, commonEventId, position, actorId, once, eventOnce, perTurn) {
    if (!this._customBattleCommands) this._customBattleCommands = [];
    this._customBattleCommands.push({
      symbol: symbol,
      name: name,
      commonEventId: commonEventId,
      position: position || 'afterAttack',
      actorId: actorId || null,
      once: !!once,
      eventOnce: !!eventOnce,
      perTurn: !!perTurn,
      used: false,
      eventUsed: false,
      lastTurnUsed: -1
    });
  };

  Game_Troop.prototype.customBattleCommands = function() {
    return this._customBattleCommands || [];
  };

  Game_Troop.prototype.customBattleCommandsFor = function(position, actorId) {
    return this.customBattleCommands().filter(function(c) {
      if (c.used) return false;
      if (c.actorId && c.actorId !== actorId) return false;
      return c.position === position;
    });
  };

  //--------------------------------------------------------------------------
  // Window_ActorCommand - 커맨드 추가
  //--------------------------------------------------------------------------

  var _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
  Window_ActorCommand.prototype.makeCommandList = function() {
    _Window_ActorCommand_makeCommandList.call(this);
    if (!this._actor) return;
    var actorId = this._actor.actorId();
    var commands = $gameTroop.customBattleCommands().filter(function(c) {
      if (c.used) return false;
      if (c.actorId && c.actorId !== actorId) return false;
      if (c.position === 'sub') return false;
      return true;
    });
    var topCmds = commands.filter(function(c) { return c.position === 'top'; });
    var afterAttackCmds = commands.filter(function(c) { return c.position === 'afterAttack'; });
    var bottomCmds = commands.filter(function(c) { return !c.position || c.position === 'bottom'; });

    // bottom: 그냥 맨 뒤에 추가
    bottomCmds.forEach(function(cmd) {
      this.addCommand(cmd.name, cmd.symbol, true, cmd.commonEventId);
    }, this);

    // afterAttack: 'attack' 커맨드 바로 다음에 순서대로 삽입
    if (afterAttackCmds.length > 0) {
      var attackIndex = this._list.map(function(c) { return c.symbol; }).indexOf('attack');
      var insertAt = attackIndex >= 0 ? attackIndex + 1 : 0;
      afterAttackCmds.forEach(function(cmd, i) {
        this._list.splice(insertAt + i, 0, {
          name: cmd.name, symbol: cmd.symbol, enabled: true, ext: cmd.commonEventId
        });
      }, this);
    }

    // top: 맨 앞에 순서대로 삽입
    topCmds.forEach(function(cmd, i) {
      this._list.splice(i, 0, {
        name: cmd.name, symbol: cmd.symbol, enabled: true, ext: cmd.commonEventId
      });
    }, this);
  };

  //--------------------------------------------------------------------------
  // Window_ActorCommand - 커맨드 선택을 창 자체에서 직접 처리
  //--------------------------------------------------------------------------
  // Scene_Battle의 setHandler 체인에 의존하지 않고 창에서 바로 실행하기
  // 때문에, 이 플러그인의 로드 순서(위/아래)는 신경 쓰지 않아도 됩니다.

  var _Window_ActorCommand_isHandled = Window_ActorCommand.prototype.isHandled;
  Window_ActorCommand.prototype.isHandled = function(symbol) {
    if (this.findCustomBattleCommand(symbol)) return true;
    return _Window_ActorCommand_isHandled.call(this, symbol);
  };

  var _Window_ActorCommand_callHandler = Window_ActorCommand.prototype.callHandler;
  Window_ActorCommand.prototype.callHandler = function(symbol) {
    var cmd = this.findCustomBattleCommand(symbol);
    if (cmd) {
      this.executeCustomBattleCommand(cmd);
      return;
    }
    _Window_ActorCommand_callHandler.call(this, symbol);
  };

  Window_ActorCommand.prototype.findCustomBattleCommand = function(symbol) {
    return $gameTroop.customBattleCommands().filter(function(cmd) {
      return cmd.symbol === symbol;
    })[0];
  };

  Window_ActorCommand.prototype.executeCustomBattleCommand = function(cmd) {
    var action = BattleManager.inputtingAction();
    if (action) action.setGuard();

    var shouldFireEvent = true;
    if (cmd.eventOnce && cmd.eventUsed) {
      shouldFireEvent = false;
    } else if (cmd.perTurn && cmd.lastTurnUsed === $gameTroop.turnCount()) {
      shouldFireEvent = false;
    }

    if (shouldFireEvent) {
      $gameTemp.reserveCommonEvent(cmd.commonEventId);
      cmd.eventUsed = true;
      cmd.lastTurnUsed = $gameTroop.turnCount();
    }
    if (cmd.once) cmd.used = true;

    var scene = SceneManager._scene;
    if (scene && scene.selectNextCommand) scene.selectNextCommand();
  };

})();
