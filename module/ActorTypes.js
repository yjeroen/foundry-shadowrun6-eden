import { Persona } from "./ItemTypes.js";
export class Attribute {
    base = 0;
    mod = 0;
    modString = "";
    augment = 0;
    pool = 0;
}
export class Attributes {
    bod = new Attribute();
    agi = new Attribute();
    rea = new Attribute();
    str = new Attribute();
    wil = new Attribute();
    log = new Attribute();
    int = new Attribute();
    cha = new Attribute();
    mag = new Attribute();
    res = new Attribute();
}
export class Skill {
    points;
    specialization;
    expertise;
    modifier;
    augment;
    poolS;
    poolE;
    pool;
}
export class Skills {
    astral = new Skill();
    athletics = new Skill();
    biotech = new Skill();
    close_combat = new Skill();
    con = new Skill();
    conjuring = new Skill();
    cracking = new Skill();
    electronics = new Skill();
    enchanting = new Skill();
    engineering = new Skill();
    exotic_weapons = new Skill();
    firearms = new Skill();
    influence = new Skill();
    outdoors = new Skill();
    perception = new Skill();
    piloting = new Skill();
    sorcery = new Skill();
    stealth = new Skill();
    tasking = new Skill();
}
export class Monitor {
    mod;
    modString;
    value = 9;
    dmg;
    max;
}
export class Derived {
    composure = new Attribute();
    judge_intentions = new Attribute();
    memory = new Attribute();
    lift_carry = new Attribute();
    matrix_perception = new Attribute();
    resist_damage = new Attribute();
    resist_toxin = new Attribute();
}
export class Initiative {
    base;
    mod;
    pool;
    dice;
    diceMod;
    dicePool;
}
export class Ratings {
    astral = new Attribute();
    matrix = new Attribute();
    physical = new Attribute();
    resonance = new Attribute();
    social = new Attribute();
    vehicle = new Attribute();
}
export class Pool {
    base;
    pool = 0;
    mod = 0;
    modString;
}
export class DefensePool {
    physical = new Pool();
    astral = new Pool();
    spells_direct = new Pool();
    spells_indirect = new Pool();
    spells_other = new Pool();
    vehicle = new Pool();
    toxin = new Pool();
    damage_physical = new Pool();
    damage_astral = new Pool();
    drain = new Pool();
    fading = new Pool();
}
class Tradition {
    genesisID;
    name;
    attribute = "log";
}
export class SR6Actor {
    attackrating = new Ratings();
    defenserating = new Ratings();
}
export class Lifeform extends SR6Actor {
    attributes = new Attributes();
    derived = new Derived();
    initiative;
    physical = new Monitor();
    stun = new Monitor();
    overflow = new Monitor();
    edge = new Monitor();
    defensepool = new DefensePool();
    tradition = new Tradition();
    skills = new Skills();
    essence = 6.0;
    mortype;
    matrixIni;
    morDef;
    controlRig = 0;
}
export class Spirit extends Lifeform {
    rating;
    spiritType;
}
export class MatrixUser extends Lifeform {
    persona = new Persona();
}
export class Player extends MatrixUser {
    karma = 0;
    karma_total = 0;
    heat = 0;
    reputation = 0;
}
export var VehicleOpMode;
(function (VehicleOpMode) {
    VehicleOpMode["MANUAL"] = "manual";
    VehicleOpMode["RIGGED_AR"] = "riggedAR";
    VehicleOpMode["RIGGED_VR"] = "riggedVR";
    VehicleOpMode["RCC"] = "rcc";
    VehicleOpMode["AUTONOMOUS"] = "autonomous";
})(VehicleOpMode || (VehicleOpMode = {}));
export class CurrentVehicle {
    belongs;
    opMode = VehicleOpMode.MANUAL;
    offRoad;
    speed;
    handling;
    ar;
    dr;
    modifier;
    kmh;
}
export class VehicleSkill {
    points;
    modifier;
    pool;
}
export class VehicleSkills {
    piloting = new VehicleSkill();
    evasion = new VehicleSkill();
    stealth = new VehicleSkill();
    cracking = new VehicleSkill();
}
export class VehicleActor {
    physical = new Monitor();
    edge = new Monitor();
    initiative = {
        physical: new Initiative()
    };
    skills = new VehicleSkills();
    handleOn;
    handleOff;
    accOn;
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
    notes;
    ar = new Pool();
    dr = new Pool();
    defensepool = new DefensePool();
}