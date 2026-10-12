//=============================================================================
// BattleCommandRestrict.js
//=============================================================================

/*:
 * @plugindesc 전투 중 액터 커맨드에서 공격/스킬만 남기고 방어, 아이템, 도망을 제거합니다.
 * @author ㄹㅅㅁ
 *
 * @help
 * 전투 커맨드 창에서 공격(Attack), 스킬(Skill)만 표시됩니다.
 * 방어(Guard), 아이템(Item)은 제거됩니다.
 * 파티 도망(Escape) 커맨드도 함께 숨기려면 아래 파라미터를 조정하세요.
 *
 * @param Show Attack
 * @desc 공격 커맨드를 표시할지 여부 (true/false)
 * @default true
 *
 * @param Show Guard
 * @desc 방어 커맨드를 표시할지 여부 (true/false)
 * @default false
 *
 * @param Show Item
 * @desc 아이템 커맨드를 표시할지 여부 (true/false)
 * @default false
 *
 * @param Show Escape
 * @desc 파티 커맨드의 도망을 표시할지 여부 (true/false)
 * @default true
 *
 * @help
 * ----------------------------------------------------------------------
 * 플러그인 커맨드 (이벤트 명령 > 플러그인 커맨드)
 * ----------------------------------------------------------------------
 *   BattleCommandRestrict on
 *       -> 이후 전투부터 공격/스킬만 사용 가능하게 제한합니다. (도망은 기본값 유지)
 *
 *   BattleCommandRestrict on noescape
 *       -> 공격/스킬만 제한 + 도망도 숨깁니다.
 *
 *   BattleCommandRestrict off
 *       -> 제한을 해제하고 기본 커맨드(공격/스킬/방어/아이템/도망)로 되돌립니다.
 *
 * 기본값은 off이며, 켠 상태는 세이브 데이터에 저장되어 유지됩니다.
 */

var BattleCommandRestrict = BattleCommandRestrict || {};

(function() {

    var parameters = PluginManager.parameters('BattleCommandRestrict');
    var showAttack = String(parameters['Show Attack'] || 'true') === 'true';
    var showGuard = String(parameters['Show Guard'] || 'false') === 'true';
    var showItem = String(parameters['Show Item'] || 'false') === 'true';
    var showEscape = String(parameters['Show Escape'] || 'true') === 'true';

    //=========================================================================
    // Plugin Command
    //=========================================================================

    var _BCR_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _BCR_Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'BattleCommandRestrict') {
            if (args[0] === 'on') {
                $gameSystem._battleCommandRestrict = true;
                $gameSystem._battleCommandRestrictNoEscape = (args[1] === 'noescape');
            } else if (args[0] === 'off') {
                $gameSystem._battleCommandRestrict = false;
                $gameSystem._battleCommandRestrictNoEscape = false;
            }
        }
    };

    BattleCommandRestrict.isActive = function() {
        return !!$gameSystem._battleCommandRestrict;
    };

    BattleCommandRestrict.isEscapeHidden = function() {
        return !!$gameSystem._battleCommandRestrictNoEscape;
    };

    //=========================================================================
    // Window_ActorCommand
    //=========================================================================
    // 다른 플러그인이 makeCommandList 이후에 도망(escape) 등을 추가로 끼워 넣는
    // 경우까지 확실히 막기 위해, addCommand 단계에서 직접 필터링합니다.

    var _BCR_Window_ActorCommand_addCommand = Window_ActorCommand.prototype.addCommand;
    Window_ActorCommand.prototype.addCommand = function(name, symbol, enabled, ext) {
        if (BattleCommandRestrict.isActive()) {
            if (symbol === 'escape' && BattleCommandRestrict.isEscapeHidden()) return;
            if (!showGuard && symbol === 'guard') return;
            if (!showItem && symbol === 'item') return;
            if (!showAttack && symbol === 'attack') return;
        }
        _BCR_Window_ActorCommand_addCommand.call(this, name, symbol, enabled, ext);
    };

    var _BCR_Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        if (this._actor && BattleCommandRestrict.isActive()) {
            if (showAttack) {
                this.addAttackCommand();
            }
            this.addSkillCommands();
            if (showGuard) {
                this.addGuardCommand();
            }
            if (showItem) {
                this.addItemCommand();
            }
        } else {
            _BCR_Window_ActorCommand_makeCommandList.call(this);
        }
    };

    //=========================================================================
    // Window_PartyCommand (도망 커맨드)
    //=========================================================================

    var _BCR_Window_PartyCommand_makeCommandList = Window_PartyCommand.prototype.makeCommandList;
    Window_PartyCommand.prototype.makeCommandList = function() {
        if (BattleCommandRestrict.isActive()) {
            this.addCommand(TextManager.fight, 'fight');
            if (showEscape && !BattleCommandRestrict.isEscapeHidden()) {
                this.addCommand(TextManager.escape, 'escape', BattleManager.canEscape());
            }
        } else {
            _BCR_Window_PartyCommand_makeCommandList.call(this);
        }
    };

})();
