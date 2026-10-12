//=============================================================================
// Popp - YEP_BattleStatusWindow Add-On Animated Face
// Popp_BStatusAnimatedFace.js
//=============================================================================
var Imported = Imported || {};
Imported.Popp_BSAddOn = true;
var Popp = Popp || {};
Popp.BSAddOn = Popp.BSAddOn || {};

 /*:
 * 
 * Free to use for commercial and non commercial projects
 * as long as proper credit is given.
 * 
 * @author Poppicha (Popjustpop_TH)
 * @plugindesc v1.0 - add animated face.(26:07:2022)
 * 
 * @param Animated Frame Speed
 * @desc How fast animated frame is.
 * (This is for Frontview System)
 * default: 48
 * @default 48
 *
 * @param Number Animated Frame
 * @desc How many frame you want to animate.
 * default: 3
 * @default 3
 *
 * @help
 * //--------------------------------------------------------
 * // SV_Battler
 * //--------------------------------------------------------
 * For now it's only work with default SV_Actor.
 * If you use sideview system the animated face will be same as battler motion.
 * 
 * //--------------------------------------------------------
 * // Folder
 * //--------------------------------------------------------
 * Create Folder name "animate" inside faces folder & put your animate picset in it.
 * 
 * //--------------------------------------------------------
 * // Setting
 * //--------------------------------------------------------
 * Animate Face's structure is for default is 462*2592
 * (144 * 144, 3 frames)
 * 
 * //--------------------------------------------------------
 * // Warning
 * //--------------------------------------------------------
 * This plugin requires YEP_BattleStatusWindow and must be place
 * below YEP_BattleStatusWindow.
 * 
 * Change index will not change actor face because I use index to animate
 * so 1 faceName per 1 animatedFace
 * If you want to transform actor change faceName to other characterFace Name.
 */

///* nothing.. just a function I create for easy test in console in the future.
    function sWin() {
        return SceneManager._scene._statusWindow;
    }

    function bparty() {
        return $gameParty.battleMembers();
    }

    function aSprite() {
        return SceneManager._scene._spriteset._actorSprites;
    }
//*/

// Parameter
Popp.Parameters = PluginManager.parameters('Popp_BStatusAnimatedFace');
Popp.Param = Popp.Param || {};

Popp.Param.AnimateFrameSpd = Number(Popp.Parameters['Animated Frame Speed'] || '12');
Popp.Param.NumAnimateFrame = Number(Popp.Parameters['Number Animated Frame'] || '3');

//--------------------------------------------------------
// Stuff
//--------------------------------------------------------  
ImageManager.loadAnimateFace = function(filename, hue) {
    return this.loadBitmap('img/faces/animate/', filename, hue, true);
};

ImageManager.reserveAnimateFace = function(filename, hue, reservationId) {
    return this.reserveBitmap('img/faces/animate/', filename, hue, true, reservationId);
};

Window_Base.prototype.reserveAnimateFaces = function() {
    $gameParty.members().forEach(function(actor) {
        ImageManager.reserveAnimateFace(actor.faceName() + '_' + actor.faceIndex());
    }, this);
};

//--------------------------------------------------------
// Contents
//--------------------------------------------------------
Window_BattleStatus.prototype.animationWait = function() {
    return Popp.Param.AnimateFrameSpd * 2;
};

Popp.BSAddOn.Window_BattleStatus_createContents = Window_BattleStatus.prototype.createContents;
Window_BattleStatus.prototype.createContents = function() {
    Popp.BSAddOn.Window_BattleStatus_createContents.call(this);
    if (!$gameSystem.isSideView()) {
        for (var i = 0; i < $gameParty.battleMembers().length; ++i) {
            this.setFaceMotion(i);
        }
    }
    for (var i = 0; i < $gameParty.battleMembers().length; ++i) {
        var actor = $gameParty.battleMembers()[i];
        actor._motionCount = 0;
        actor._pattern = 0;
    }
};

Popp.BSAddOn.Window_BattleStatus_refresh = Window_BattleStatus.prototype.refresh;
Window_BattleStatus.prototype.refresh = function() {
    Popp.BSAddOn.Window_BattleStatus_refresh.call(this);
    if (!$gameSystem.isSideView()) {
        for (var i = 0; i < $gameParty.battleMembers().length; ++i) {
            this.updateFrontviewFaceMotion(i);
        }
    }
};

//--------------------------------------------------------
// Draw Face
//--------------------------------------------------------
Window_BattleStatus.prototype.drawFace = function(fn, fi, x, y, width, height) {
    width = width || Yanfly.Param.FaceWidth;
    height = height || Yanfly.Param.FaceHeight;
    var bitmap = ImageManager.loadAnimateFace(fn);
    if (Imported.YEP_CoreEngine) {
        var pw = Yanfly.Param.FaceWidth;
        var ph = Yanfly.Param.FaceHeight;
    } else {
        var pw = Window_Base._faceWidth;
        var ph = Window_Base._faceHeight;
    }
    var sw = Math.min(width, pw);
    var sh = Math.min(height, ph);
    var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
    var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
    var sx = fi % Popp.Param.NumAnimateFrame * pw + (pw - sw) / 18;
    var sy = Math.floor(fi / Popp.Param.NumAnimateFrame) * ph + (ph - sh) / 18;
    this._faceContents.bitmap.blt(bitmap, sx, sy, sw, sh, dx, dy);
};

Window_BattleStatus.prototype.drawActorFace = function(actor, x, y, width, height) {
    var svA = SceneManager._scene._spriteset._actorSprites[actor.index()];
    if ($gameSystem.isSideView()) {
        this.drawFace(actor.faceName(), actor._pattern +
         (Popp.Param.NumAnimateFrame * svA._motion.index), x, y, width, height);
    } else {
        this.drawFace(actor.faceName(), actor._pattern +
         (Popp.Param.NumAnimateFrame * actor._faceMotion), x, y, width, height);
    }
};

//--------------------------------------------------------
// Update
//--------------------------------------------------------
Window_BattleStatus.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    for (var i = 0; i < $gameParty.battleMembers().length; ++i) {
        var actor = $gameParty.battleMembers()[i];
        actor._motionCount++;
        this.updateMotionCount(i);
    }
};

Window_BattleStatus.prototype.updateMotionCount = function(index) {
    var actor = $gameParty.battleMembers()[index];
    if (actor._motionCount >= this.animationWait()) {
        if ($gameSystem.isSideView() || actor._faceMotion == 0 || actor._faceMotion == 1 ||
            actor._faceMotion == 2 || actor._faceMotion == 3 ||
            actor._faceMotion == 12 || actor._faceMotion == 13 ||
            actor._faceMotion == 14 || actor._faceMotion == 15 ||
            actor._faceMotion == 16 || actor._faceMotion == 17) {
                for (var i = 0; i < $gameParty.battleMembers().length; ++i) {
                    this.updatePattern(i);
                }
        } else if (actor._pattern == 2) {
            //do nothing bug fix
        } else {
            actor._pattern++;
        }
        actor._motionCount = 0;
    }
};

Window_BattleStatus.prototype.updatePattern = function(index) {
    var actor = $gameParty.battleMembers()[index];
    if ($gameSystem.isSideView()) {
        var svA = SceneManager._scene._spriteset._actorSprites[index];
        actor._pattern = svA._pattern;
        if (actor._pattern == Popp.Param.NumAnimateFrame) {
            actor._pattern = Popp.Param.NumAnimateFrame - 2;
        }
    } else {
        if (actor._motionCount >= this.animationWait()) {
            if (actor._reverse == true) {
                actor._pattern = (actor._pattern - 1) % Popp.Param.NumAnimateFrame;
                actor._pattern %= Popp.Param.NumAnimateFrame;
                if (actor._pattern == 0) {
                    actor._reverse = false;
                }
            } else {
                actor._pattern = (actor._pattern + 1) % Popp.Param.NumAnimateFrame;
                if (actor._pattern == Popp.Param.NumAnimateFrame - 1) {
                    actor._reverse = true;
                }
            }
            actor._motionCount = 0;
        }
    }
};

Window_BattleStatus.prototype.setFaceMotion = function(index) {
    var actor = $gameParty.battleMembers()[index];
    var stateMotion = actor.stateMotionIndex();
    if (stateMotion === 3) {
        actor._faceMotion = 17;
    } else if (stateMotion === 2) {
        actor._faceMotion = 16;
    } else if (actor.isChanting()) {
        actor._faceMotion = 2;
    } else if (actor.isGuard() || actor.isGuardWaiting()) {
            actor._faceMotion = 3;
    } else if (stateMotion === 1) {
        actor._faceMotion = 15;
    } else if (actor.isDying()) {
        actor._faceMotion = 14;
    } else if (actor.isWaiting()) {
        actor._faceMotion = 1;
    } else {
        actor._faceMotion = 0;
    }
};

Window_BattleStatus.prototype.updateFrontviewFaceMotion = function(index) {
    var actor = $gameParty.battleMembers()[index];
        if (!BattleManager.isInputting()) return;
        var stateMotion = actor.stateMotionIndex();
        if (actor.isInputting() || actor.isActing()) {
            actor._faceMotion = 0;
        } else if (stateMotion === 3) {
            actor._faceMotion = 17;
        } else if (stateMotion === 2) {
            actor._faceMotion = 16;
        } else if (actor.isChanting()) {
            actor._faceMotion = 2;
        } else if (actor.isGuard() || actor.isGuardWaiting()) {
            actor._faceMotion = 3;
        } else if (stateMotion === 1) {
            actor._faceMotion = 15;
        } else if (actor.isDying()) {
            actor._faceMotion = 14;
        } else if (actor.isUndecided()) {
            actor._faceMotion = 0;
        } else {
            actor._faceMotion = 1;
        }
};

Popp.BSAddOn.Game_Actor_prototype_performAction = Game_Actor.prototype.performAction;
Game_Actor.prototype.performAction = function(action) {
    Popp.BSAddOn.Game_Actor_prototype_performAction.call(this, action);
    if (action.isAttack()) {
    } else if (action.isGuard()) {
        this._faceMotion = 3;
    } else if (action.isMagicSkill()) {
        this._faceMotion = 10;
    } else if (action.isSkill()) {
        this._faceMotion = 9;
    } else if (action.isItem()) {
        this._faceMotion = 11;
    }
    this._pattern = 0;
};

Popp.BSAddOn.Game_Actor_prototype_performAttack = Game_Actor.prototype.performAttack;
Game_Actor.prototype.performAttack = function() {
    var wtypeId = this.weapons()[0] ? this.weapons()[0].wtypeId : 0;
    var attackMotion = $dataSystem.attackMotions[wtypeId];
    if (attackMotion) {
        if (attackMotion.type === 0) {
            this._faceMotion = 6;
        } else if (attackMotion.type === 1) {
            this._faceMotion = 7;
        } else if (attackMotion.type === 2) {
            this._faceMotion = 8;
        }
        this._pattern = 0;
    }
    Popp.BSAddOn.Game_Actor_prototype_performAttack.call(this);
};

Popp.BSAddOn.Game_Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
    Popp.BSAddOn.Game_Action_apply.call(this, target);
    if (!$gameSystem.isSideView()) {
        if (target.isActor()) {
            if (target.result().isHit() && target.result().hpDamage > 0) {
                $gameParty.battleMembers()[target.index()]._faceMotion = 4;
                $gameParty.battleMembers()[target.index()]._pattern = 0;
            } else if (target.result().missed || target.result().evaded) {
                $gameParty.battleMembers()[target.index()]._faceMotion = 5;
                $gameParty.battleMembers()[target.index()]._pattern = 0;
            }
        }
    }
};

Popp.BSAddOn.Game_Actor_prototype_performVictory = Game_Actor.prototype.performVictory;
Game_Actor.prototype.performVictory = function() {
    if (this.canMove()) {
        this._faceMotion = 13;
    }
    Popp.BSAddOn.Game_Actor_prototype_performVictory.call(this);
};

Popp.BSAddOn.Game_Actor_prototype_performEscape = Game_Actor.prototype.performEscape;
Game_Actor.prototype.performEscape = function() {
    if (this.canMove()) {
        this._faceMotion = 12;
    }
    Popp.BSAddOn.Game_Actor_prototype_performEscape.call(this);
};

Popp.BSAddOn.BattleManager_processTurn = BattleManager.processTurn;
BattleManager.processTurn = function() {
    if (!$gameSystem.isSideView()) {
        for (var i = 0; i < $gameParty.battleMembers().length; ++i) {
            SceneManager._scene._statusWindow.setFaceMotion(i);
        }
    }
    Popp.BSAddOn.BattleManager_processTurn.call(this);
};

Popp.BSAddOn.BattleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function() {
    if (!$gameSystem.isSideView()) {
        for (var i = 0; i < $gameParty.battleMembers().length; ++i) {
            SceneManager._scene._statusWindow.setFaceMotion(i);
        }
    }
    Popp.BSAddOn.BattleManager_endAction.call(this);
};

//--------------------------------------------------------
// Scene_Battle
//--------------------------------------------------------
Popp.BSAddOn.Scene_Battle_update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
    Popp.BSAddOn.Scene_Battle_update.call(this);
    this._statusWindow.refresh();
};
