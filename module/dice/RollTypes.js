import { Defense, MonitorType } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";
export var RollType;
(function (RollType) {
    RollType["Common"] = "common";
    RollType["Weapon"] = "weapon";
    RollType["Skill"] = "skill";
    RollType["Spell"] = "spell";
    RollType["Ritual"] = "ritual";
    RollType["Vehicle"] = "vehicle";
    RollType["ComplexForm"] = "complexform";
    RollType["MatrixAction"] = "matrix";
    /** Defense is a way to reduce netto hits */
    RollType["Defense"] = "defense";
    /** Reduce netto damage */
    RollType["Soak"] = "soak";
    /** Directly apply the given damage */
    RollType["Damage"] = "damage";
    RollType["Initiative"] = "initiative";
})(RollType || (RollType = {}));
export var SoakType;
(function (SoakType) {
    SoakType["DAMAGE_STUN"] = "damage_stun";
    SoakType["DAMAGE_PHYSICAL"] = "damage_phys";
    SoakType["DRAIN"] = "drain";
    SoakType["FADING"] = "fading";
})(SoakType || (SoakType = {}));
export var InitiativeType;
(function (InitiativeType) {
    InitiativeType["PHYSICAL"] = "physical";
    InitiativeType["ASTRAL"] = "astral";
    InitiativeType["MATRIX"] = "matrix";
})(InitiativeType || (InitiativeType = {}));
export var ReallyRoll;
(function (ReallyRoll) {
    ReallyRoll[ReallyRoll["ROLL"] = 0] = "ROLL";
    ReallyRoll[ReallyRoll["AUTOHITS"] = 1] = "AUTOHITS";
})(ReallyRoll || (ReallyRoll = {}));
export class TokenData {
    id;
    actorId;
    sceneId;
    name;
    constructor(token) {
        this.id = token.id;
        this.name = token.name;
        this.sceneId = token.scene.id;
        if (token.actor)
            this.actorId = token.actor.id;
    }
}
class CommonRollData {
    speaker;
    actor;
    /* Suggested Window title */
    title;
    /**
     * Text to describe what is happening.
     * e.g. <i>X is shooting at Y</i>
     */
    actionText;
    /** Describe what is being rolled */
    checkText;
    rollType;
    /* Opposed rolls: How to oppose? */
    defendWith;
    get isOpposed() {
        return this.defendWith != undefined;
    }
    threshold;
    /* Use a wild die */
    useWildDie = 0;
    rollMode;
    /* How many dice shall be rolled */
    pool;
    calcPool;
    edgePoolIgnoringCap = 0;
    copyFrom(copy) {
        this.speaker = copy.speaker;
        this.rollMode = copy.rollMode;

        this.actor = copy.actor;
        this.title = copy.title;
        this.actionText = copy.actionText;
        this.checkText = copy.checkText;
        this.rollType = copy.rollType;
        this.defendWith = copy.defendWith;
        this.threshold = copy.threshold;
        this.useWildDie = copy.useWildDie;
        this.pool = copy.pool;
        this.edgePoolIgnoringCap = copy.edgePoolIgnoringCap;
    }
    validateDialog() {}
    checkHardDiceCap(pool) {
        console.log("SR6E | checkHardDiceCap");
        // Limiting the dice pool if game settings tells us
        const hardDiceCap = game.settings.get(SYSTEM_NAME, "hardDiceCap");
        if (hardDiceCap) {
            // Devnote - Objects are a mess, apparently there's functions that use pool instead of calcPool..
            this.calcPool = (this.calcPool > 20) ? 20 : this.calcPool;
            pool = (pool > 20) ? 20 : pool;
            console.log("SR6E | limiting calcPool to 20 due to game setting", this.calcPool, pool, this.edgePoolIgnoringCap);
        }
        pool = pool + this.edgePoolIgnoringCap;
        return pool;
    }
}
var PoolUsage;
(function (PoolUsage) {
    PoolUsage[PoolUsage["OneForOne"] = 0] = "OneForOne";
    PoolUsage[PoolUsage["OneForAll"] = 1] = "OneForAll";
})(PoolUsage || (PoolUsage = {}));
/**
 * The data fro a roll known before presenting a roll dialog
 */
export class PreparedRoll extends CommonRollData {
    allowBuyHits;
    /* Does this check generate a free edge */
    freeEdge;
    /* Available edge */
    edge;
    edgeBoosts;
    /** Effective dice pool applying firing mode or other modifiers */
    calcPool;
    performer;
    copyFrom(copy) {
        super.copyFrom(copy);
        this.allowBuyHits = copy.allowBuyHits;
        this.freeEdge = copy.freeEdge;
        this.edge = copy.edge;
        this.edgeBoosts = copy.edgeBoosts;
        this.performer = copy.performer;
    }
}
export class DefenseRoll extends PreparedRoll {
    damage;
    soakType;
    allowSoak;
    constructor(threshold, soakType) {
        super();
        this.allowSoak = true;
        this.rollType = RollType.Defense;
        this.threshold = threshold;
        this.soakType = (soakType === MonitorType.STUN) ? SoakType.DAMAGE_STUN : SoakType.DAMAGE_PHYSICAL;
    }
}
export class SoakRoll extends PreparedRoll {
    monitor;
    soakType;
    // Eventually add effects
    constructor(threshold, soakType) {
        super();
        this.rollType = RollType.Soak;
        this.soakType = soakType;
        this.threshold = threshold;
    }
}
export class SkillRoll extends PreparedRoll {
    rollType = RollType.Skill;
    skillId;
    skillDef;
    skillValue;
    skillSpec;
    attrib;
    /**
     * @param skillVal {Skill}   The actors instance of that skill
     */
    constructor(actor, skillId) {
        super();
        this.skillId = skillId;
        this.skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(skillId);
        this.skillValue = actor.skills[skillId];
        this.attrib = this.skillDef.attrib;
        this.performer = actor;
    }
    copyFrom(copy) {
        super.copyFrom(copy);
        this.skillId = copy.skillId;
        this.skillDef = copy.skillDef;
        this.skillValue = copy.skillValue;
        this.attrib = copy.attrib;
    }
    /**
     * Execute
     */
    prepare(actor) { }
}
export class SpellRoll extends SkillRoll {
    rollType = RollType.Spell;
    item;
    itemId;
    spellId;
    spellName;
    spellDesc;
    spellSrc;
    spell;
    /** Radius of spells with area effect - may be increased */
    calcArea = 2;
    calcDrain;
    /** Damage of combat spells - may be amped up */
    calcDamage = 0;
    canAmpUpSpell;
    ampUp = 0;
    canIncreaseArea;
    defenseRating;
    attackRating;
    /**
     * @param skill {Skill}   The skill to roll upon
     */
    constructor(actor, item, itemId, spellItem) {
        super(actor, "sorcery");
        this.item = item;
        this.itemId = itemId;
        this.spell = spellItem;
        this.skillSpec = "spellcasting";
        this.canAmpUpSpell = spellItem.category === "combat";
        this.canIncreaseArea = spellItem.range === "line_of_sight_area" || spellItem.range === "self_area";
        if (spellItem.category === "combat") {
            if (spellItem.type == "mana") {
                this.defendWith = Defense.SPELL_DIRECT;
                this.allowSoak = false;
            }
            else {
                this.defendWith = Defense.SPELL_INDIRECT;
            }
        }
        else if (spellItem.category === "manipulation") {
            this.defendWith = Defense.SPELL_OTHER;
        }
        else if (spellItem.category === "heal") {
            if (spellItem.withEssence) {
                this.threshold = 5 - Math.ceil(actor.essence);
            }
        }
        this.calcArea = 2;
        this.calcDrain = spellItem.drain;
    }
    calculateSpellDamage() {
        console.log("SR6E | calculateSpellDamage", this);
        // console.log("SR6E | calculateSpellDamage", JSON.stringify(this));
        if (this.item.system.category === 'combat') {
            if (this.defendWith === Defense.SPELL_DIRECT) {
                this.calcDamage = 0 + this.ampUp;
            } else if (this.defendWith === Defense.SPELL_INDIRECT) {
                this.calcDamage = Math.ceil(this.actor.system.attributes.mag.pool / 2) + this.ampUp;
            }
        }
        console.log("SR6E | Spell Damage calculated: " + this.calcDamage);
    }
}
export class RitualRoll extends SkillRoll {
    rollType = RollType.Ritual;
    item;
    itemId;
    spellId;
    spellName;
    spellDesc;
    spellSrc;
    spell;

    calcDrain;

    defenseRating;
    attackRating;
    /**
     * @param skill {Skill}   The skill to roll upon
     */
    constructor(actor, item, itemId, ritualData) {
        super(actor, "sorcery");
        this.item = item;
        this.itemId = itemId;
        this.spell = ritualData;    // we keep calling it 'spell' due to legacy code
        this.skillSpec = "ritual_spellcasting";
        
        this.calcDrain = Math.max(2, ritualData.threshold * 2 );
    }
}
export class ComplexFormRoll extends SkillRoll {
    rollType = RollType.ComplexForm;
    item;
    itemId;
    formId;
    formName;
    formDesc;
    formSrc;
    form;
    calcFade;
    defenseRating;
    attackRating;
    /**
     * @param skill {Skill}   The skill to roll upon
     */
    constructor(actorSystem, item, itemId, complexFormSystem) {
        super(actorSystem, item.system.skill);
        this.item = item;
        this.itemId = itemId;
        this.form = complexFormSystem;
        if(item.system.skill === 'electronics') {
            this.skillSpec = "complex_forms";
        } else {    //cracking
            this.skillSpec = "cybercombat";
        }
        this.attrib = "res";
        this.calcFade = complexFormSystem.fading;
    }
}
function isWeapon(obj) {
    return obj.attackRating != undefined;
}
function getSystemData(obj) {
    if (game.release.generation >= 10)
        return obj.system;
    return obj.data.data;
}
export class WeaponRoll extends SkillRoll {
    rollType = RollType.Weapon;
    item;
    itemId;
    itemName;
    itemDesc;
    itemSrc;
    gear;
    weapon;
    targets;
    defenseRating;
    attackRating;
    /** Effective attack rating after applying firing mode */
    calcAttackRating = [0, 0, 0, 0, 0];
    /** Effective damage */
    calcDamage;
    /** How many units of ammunition are required */
    calcRounds;
    fireMode;
    burstMode;
    faArea;
    constructor(actor, item, itemId, gear) {
        super(actor, getSystemData(item).skill);
        this.item = item;
        this.itemId = itemId;
        this.gear = gear;
        this.skillSpec = this.gear.skillSpec;
        if (isWeapon(gear)) {
            this.weapon = gear;
            this.rollType = RollType.Weapon;
            this.defendWith = Defense.PHYSICAL;
            this.monitor = item.system.stun ? MonitorType.STUN : MonitorType.PHYSICAL;
            this.fireMode = 'SS';
        }
        this.pool = gear.pool;
    }
    get getModes() {
        let modes = {};
        for (const [modeName, mode] of Object.entries(CONFIG.SR6.FIRE_MODES)) {
            if(this.item.system.modes[modeName]) {
                modes[modeName] = mode.loc;
            }
        }
        console.log('SR6E | Retrieving weapon modes', modes)
        return modes;
    }
    
    validateDialog() {
        console.log("SR6E | Validating Weapon Dialog, WeaponRoll", this);
        if (game.user.targets.size === 2 && this.fireMode !== "FA" ) {
            if (this.fireMode !== "BF" || (this.fireMode === "BF" && this.burstMode !== "wide_burst")) {
                throw new Error(game.i18n.localize("shadowrun6.ui.notifications.two_targets_but_wrong_fire_mode"))
            }
        } else if (game.user.targets.size > 2 && this.fireMode !== "FA" ) {
            throw new Error(game.i18n.localize("shadowrun6.ui.notifications.many_targets_but_not_autofire_fire_mode"))
        }
        if (this.baseAR === 0) {
            throw new Error(game.i18n.localize("shadowrun6.ui.notifications.attack_with_no_AR"));
        }
    }
}
export class MatrixActionRoll extends SkillRoll {
    rollType = RollType.MatrixAction;
    itemName;
    itemDesc;
    itemSrc;
    action;
    targets;
    defenseRating;
    attackRating;
    constructor(actor, action) {
        super(actor, action.skill);
        this.action = action;
        this.skillSpec = this.action.spec;
    }
}
export class VehicleRoll extends PreparedRoll {
    rollType = RollType.Vehicle;
    /**
     * @param skillVal {Skill}   The actors instance of that skill
     */
    constructor() {
        super();
    }
}
export class ConfiguredWeaponRollData {
    defenseRating;
    attackRating;
    /** Effective attack rating after applying firing mode */
    calcAttackRating = [0, 0, 0, 0, 0];
    /** Effective damage */
    calcDamage;
    /** How many units of ammunition are required */
    calcRounds;
    fireMode;
    burstMode;
    faArea;
}
export class ConfiguredRoll extends CommonRollData {
    /** How was the dialog closed */
    buttonType;
    edgeBoost;
    explode;
    defRating;
    edgePlayer;
    edgeTarget;
    edge_message;
    edgeAdjusted;
    edge_use;
    /** Edge action selected  */
    edgeAction;
    /** Target tokens */
    targetIds;
    /* This methods is a horrible crime - there must be a better solution */
    updateSpecifics(copy) {
        this.targetIds = copy.targets;
        this.actionText = copy.actionText;
        this.attrib = copy.attrib;
        // In case this was a WeaponRoll
        console.log("SR6E | Copy WeaponRoll data to ConfiguredRoll", copy.calcDamage, copy.damage);
        this.calcAttackRating = copy.calcAttackRating;
        this.calcDamage = copy.calcDamage ? copy.calcDamage : copy.damage;
        this.calcRounds = copy.calcRounds;
        this.fireMode = copy.fireMode;
        this.burstMode = copy.burstMode;
        this.faArea = copy.faArea;
        console.log("SR6E | Copy SpellRoll data to ConfiguredRoll", copy.spell);
        this.allowSoak = copy.allowSoak;
        this.spell = copy.spell;
        this.calcArea = copy.calcArea;
        this.calcDrain = copy.calcDrain;
        this.canAmpUpSpell = copy.canAmpUpSpell;
        this.canIncreaseArea = copy.canIncreaseArea;
        this.defenseRating = copy.defenseRating;
        this.attackRating = copy.attackRating;
        this.spellDesc = copy.spellDesc;
        this.spellId = copy.spellId;
        this.spellName = copy.spellName;
        this.spellSrc = copy.spellSrc;
        console.log("SR6E | Copy ComplexFormRoll data to ConfiguredRoll");
        this.form = copy.form;
        this.calcFade = copy.calcFade;
        this.defenseRating = copy.defenseRating;
        this.attackRating = copy.attackRating;
        this.formDesc = copy.formDesc;
        this.formId = copy.formId;
        this.formName = copy.formName;
        this.formSrc = copy.formSrc;

        this.soakType = copy.soakType;
        this.monitor = copy.monitor;
    }
}
/**
 * Data to show in a ChatMessage
 */
export class SR6ChatMessageData {
    speaker;
    actor;
    /**
     * Text to describe what is happening,  e.g. <i>X is shooting at Y</i>
     */
    actionText;
    rollType;
    //rollMode : "publicroll" | "gmroll" | "blindroll" | "selfroll" | undefined;
    /* Opposed rolls: How to oppose? */
    defendWith;
    isOpposed;
    edge_message;
    edgeAdjusted;
    edge_use;
    /** Edge action selected  */
    edgeAction;
    /** How many dice have been rolled */
    pool;
    /** Was there a threshold? */
    threshold;
    configured;
    tooltip;
    results;
    formula;
    publicRoll;
    total;
    success;
    glitch;
    criticalglitch;
    targets;
    /** Damage after adjustment (Amp Up, Fire Mode ...) */
    damage;
    /** Which monitor to apply damage to */
    monitor;
    damageAfterSoakAlreadyApplied;
    nettoHits;
    constructor(copy) {
        console.log("SR6E | ####SR6ChatMessageData####1###", copy);
        this.speaker = copy.speaker;
        this.actor = copy.actor;
        this.actionText = copy.actionText;
        this.rollType = copy.rollType;
        this.rollMode = copy.rollMode;
        this.defendWith = copy.defendWith;
        this.threshold = copy.threshold;
        this.pool = copy.pool;
        this.isOpposed = this.defendWith != undefined;
        this.edge_message = copy.edge_message;
        this.edge_use = copy.edge_use;
        this.edgeAction = copy.edgeAction;
        this.targets = copy.targetIds;
        this.soakType = copy.soakType;
        this.monitor = copy.monitor;
        console.log("SR6E | ####SR6ChatMessageData####2###", this);
    }
}