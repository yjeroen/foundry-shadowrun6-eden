import { CurrentVehicle, Initiative, Monitor } from "./ActorTypes.js";
/**
 * Items
 */
var Duration;
(function (Duration) {
    Duration[Duration["instantaneous"] = 0] = "instantaneous";
    Duration[Duration["sustained"] = 1] = "sustained";
})(Duration || (Duration = {}));
var Activation;
(function (Activation) {
    Activation[Activation["MINOR_ACTION"] = 0] = "MINOR_ACTION";
    Activation[Activation["MAJOR_ACTION"] = 1] = "MAJOR_ACTION";
    Activation[Activation["PASSIVE"] = 2] = "PASSIVE";
})(Activation || (Activation = {}));
var EffectRange;
(function (EffectRange) {
    EffectRange[EffectRange["self"] = 0] = "self";
    EffectRange[EffectRange["los"] = 1] = "los";
})(EffectRange || (EffectRange = {}));
export class GenesisData {
    genesisID = "";
    description = "";
}
export class AdeptPower extends GenesisData {
    hasLevel = false;
    activation = Activation.MAJOR_ACTION;
    cost = 0.0;
    // For AdeptPowerValue
    choice = "";
    level = 0;
}
export class ComplexForm extends GenesisData {
    duration = Duration.sustained;
    fading = 3;
    skill = "";
    skillSpec = "";
    attrib = "res";
    threshold = 0;
    oppAttr1 = "";
    oppAttr2 = "";
    constructor(skill, skillSpec, attr1, attr2, threshold = 0) {
        super();
        this.skill = skill;
        this.skillSpec = skillSpec;
        this.oppAttr1 = attr1;
        this.oppAttr2 = attr2;
        this.threshold = threshold;
    }
}
export class CritterPower extends GenesisData {
    duration = Duration.instantaneous;
    action = Activation.MINOR_ACTION;
    range = EffectRange.self;
}
export class Gear extends GenesisData {
    type = "";
    subtype = "";
    /** Identifier of skill associated with this item */
    skill = "";
    /** Identifier of a skill specialization */
    skillSpec = "";
    /** Dicepool modifier only used when using this item */
    modifier = 0;
    /** Shall the wild die be used? */
    wild = false;
    /** Amount of dice to use. Calculated when preparing actor */
    pool = 0;
}
export class Vehicle extends Gear {
    handlOn;
    handlOff;
    accO;
    accOff;
    spdiOn;
    spdiOff;
    tspd;
    bod;
    arm;
    pil;
    sen;
    sea;
    vtype;
    vehicle = new CurrentVehicle();
}
export class Spell extends Gear {
    category = "health";
    duration = "instantaneous";
    drain = 1;
    type = "physical";
    range = "self";
    damage = "physical";
    //TODO implement alchemic spells
    alchemic;
    multiSense = false;
    isOpposed;
    withEssence;
    wildDie;
    threshold = 0;
    isSustained = false;
}
export class Weapon extends Gear {
    /** Base weapon damage */
    dmg;
    /** Is stun damage */
    stun = false;
    /** Damage representation string */
    dmgDef = "";
    /** Attack rating for 5 ranges */
    attackRating = [0, 0, 0, 0, 0];
    modes;
    strWeapon;

}
export class Armor extends Gear {
    defense;
    usedForPool;
}
export class MatrixDevice extends Gear {
    a;
    s;
    d;
    f;
    devRating;
    usedForPool;
}
export class DevicePersona {
    /** Built from devices Commlink/Cyberjack + Cyberdeck */
    base = new MatrixDevice();
    /** Final distribution */
    mod = new MatrixDevice();
}
export class LivingPersona {
    /** Defined from attributes */
    base = new MatrixDevice();
    /** Resonance distribution */
    mod = new MatrixDevice();
}
export class Persona extends Gear {
    /** */
    device = new DevicePersona();
    /** Calculated living persona */
    living = new LivingPersona();
    /** The decision which (virtual) Matrix persona to use */
    used = new MatrixDevice();
    /** Living persona -  */
    monitor = new Monitor();
    initiative = new Initiative();
}