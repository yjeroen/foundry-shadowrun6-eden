import { EdgeAction, EdgeBoost, MagicOrResonanceDefinition, Program, SkillDefinition } from "./DefinitionTypes.js";
import { RollType, ReallyRoll, SoakType, DirectDamage } from "./dice/RollTypes.js";
import { ComplexForm } from "./ItemTypes.js";
import { SYSTEM_NAME } from "./constants.js";
export var Defense;
(function (Defense) {
    Defense["PHYSICAL"] = "physical";
    Defense["STUN"] = "stun";
    Defense["SPELL_DIRECT"] = "spells_direct";
    Defense["SPELL_INDIRECT"] = "spells_indirect";
    Defense["SPELL_OTHER"] = "spells_other";
    Defense["TOXIN"] = "toxins";
    Defense["DAMAGE"] = "damage";
    Defense["DRAIN"] = "drain";
    Defense["FADING"] = "fading";
    Defense["ITEM_DEFINED"] = "item_defined";
    Defense["MATRIX"] = "matrix";
    Defense["DIRECT_DAMAGE"] = "direct_damage";
})(Defense || (Defense = {}));
export var MonitorType;
(function (MonitorType) {
    MonitorType["PHYSICAL"] = "physical";
    MonitorType["STUN"] = "stun";
    MonitorType["SOCIAL"] = "social";
    MonitorType["MATRIX"] = "matrix";
})(MonitorType || (MonitorType = {}));
export class SR6Config {
    DATA_ENTRY = false;
    informedGm = {};

    NEW = {
        ATTRIBUTES: [
            "body",
            "agility",
            "reaction",
            "strength",
            "willpower",
            "logic",
            "intuition",
            "charisma",
            "edge",
            "magic",
            "resonance",
            "essence",
        ],
        ACTOR_TYPES: {
            sprite: {
                types: {
                    courier: "SR6.Actor.sprite.TYPES.courier",
                    crack: "SR6.Actor.sprite.TYPES.crack",
                    data: "SR6.Actor.sprite.TYPES.data",
                    fault: "SR6.Actor.sprite.TYPES.fault",
                    machine: "SR6.Actor.sprite.TYPES.machine",
                    assassin: "SR6.Actor.sprite.TYPES.assassin",
                    defender: "SR6.Actor.sprite.TYPES.defender",
                    modular: "SR6.Actor.sprite.TYPES.modular",
                    music: "SR6.Actor.sprite.TYPES.music",
                    primal: "SR6.Actor.sprite.TYPES.primal",
                },
            },
        },
        ITEM_TYPES: {
            mod: {
                types: {
                    accessory_weapon: "SR6.Item.mod.TYPES.accessory_weapon",
                    weapon_mod: "SR6.Item.mod.TYPES.weapon_mod",
                    armor_mod: "SR6.Item.mod.TYPES.armor_mod",
                    accessory_electronics:
                        "SR6.Item.mod.TYPES.accessory_electronics",
                    visual_enhancement: "SR6.Item.mod.TYPES.visual_enhancement",
                    audio_enhancement: "SR6.Item.mod.TYPES.audio_enhancement",
                },
            },
        },
    };

    ATTRIBUTE_TO_V2 = {
        bod: "body",
        agi: "agility",
        rea: "reaction",
        str: "strength",
        wil: "willpower",
        log: "logic",
        int: "intuition",
        cha: "charisma",
        mag: "magic",
        res: "resonance",
        ess: "essence",
        essence: "essence",
        a: "attack",
        s: "sleaze",
        d: "dataProcessing",
        f: "firewall",
        rating: "rating",
    };
    SYSTEMPATH_TO_V2 = {
        "attributes.bod.pool": "attributes.body.pool",
        "attributes.agi.pool": "attributes.agility.pool",
        "attributes.rea.pool": "attributes.reaction.pool",
        "attributes.agi.pool": "attributes.agility.pool",
        "attributes.str.pool": "attributes.strength.pool",
        "attributes.wil.pool": "attributes.willpower.pool",
        "attributes.log.pool": "attributes.logic.pool",
        "attributes.int.pool": "attributes.intuition.pool",
        "attributes.cha.pool": "attributes.charisma.pool",
        "attributes.mag.pool": "attributes.magic.pool",
        "attributes.res.pool": "attributes.resonance.pool",

        "persona.used.a": "matrix.attributes.attack",
        "persona.used.s": "matrix.attributes.sleaze",
        "persona.used.d": "matrix.attributes.dataProcessing",
        "persona.used.f": "matrix.attributes.firewall",

    };
    /**
     * Temporary mapping of v1 attribute abbreviations to v2 attribute names. This is used for converting old rolls and other references to attributes until all code is updated to use the new attribute names. The keys are the v1 abbreviations, and the values are the v2 attribute names.
     */
    attributeV2toV1(attribute) {
        return Object.entries(this.ATTRIBUTE_TO_V2).find(
            ([key, value]) => value === attribute,
        )?.[0];
    }

    PRIMARY_ATTRIBUTES = [
        "bod",
        "agi",
        "rea",
        "str",
        "wil",
        "log",
        "int",
        "cha",
    ];
    SECONDARY_ATTRIBUTES = [
        "mag",
        "res",
        "edg",
        "ess",
        "ini",
        "inim",
        "inia",
        "dr",
    ];
    ATTRIBUTES = [
        "bod",
        "agi",
        "rea",
        "str",
        "wil",
        "log",
        "int",
        "cha",
        "mag",
        "res",
    ];
    ATTRIBUTES_SELECTOPTIONS = {
        bod: "attrib.bod",
        agi: "attrib.agi",
        rea: "attrib.rea",
        str: "attrib.str",
        wil: "attrib.wil",
        log: "attrib.log",
        int: "attrib.int",
        cha: "attrib.cha",
        mag: "attrib.mag",
        res: "attrib.res",
    };
    NPC_ATTRIBUTES = [
        "bod",
        "agi",
        "rea",
        "str",
        "wil",
        "log",
        "int",
        "cha",
        "mag",
        "res",
        "ess",
    ];
    RATING = {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        10: "10",
        11: "11",
        12: "12",
    };
    DEVICE_RATING = {
        0: "0",
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
    };
    QUALITY_CATEGORIES = {
        ADVANTAGE: "QUALITY_CATEGORIES.ADVANTAGE",
        DISADVANTAGE: "QUALITY_CATEGORIES.DISADVANTAGE",
    };
    WEAPON_STUN_OPTION = {
        false: "shadowrun6.item.physical_damage",
        true: "shadowrun6.item.stun_damage",
    };

    MATRIX_DEVICE_CONFIG = {
        NEVER: 0,
        OPTIONAL: 1,
        ALWAYS: 2,
    };

    GEAR = {
        TYPES_WITH_AMMO: new Set([
            "WEAPON_FIREARMS",
            "WEAPON_RANGED",
            "WEAPON_SPECIAL",
        ]),
        TYPES_WITH_ALWAYS_WIFI: new Set([
            "WEAPON_FIREARMS",
            "WEAPON_SPECIAL"
        ]),
        SUBTYPES_MATRIX_ACCESS: new Set([   // Also always have wifi
            "COMMLINK",
            "CYBERJACK",
            "RIGGER_CONSOLE",
            "DATATERM",
            "CYBERDECK",
            "CYBERTERM",
        ]),

        ACCESSORY: {
            label: "shadowrun6.itemtype.ACCESSORY",
            subtypes: {
                ACCESSORY: {
                    label: "shadowrun6.gear.subtype.ACCESSORY",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
            },
        },
        AMMUNITION: {
            label: "shadowrun6.itemtype.AMMUNITION",
            subtypes: {
                AMMUNITION: {
                    label: "shadowrun6.gear.subtype.AMMUNITION",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                ROCKETS: {
                    label: "shadowrun6.gear.subtype.ROCKETS",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                MISSILES: {
                    label: "shadowrun6.gear.subtype.MISSILES",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                EXPLOSIVES: {
                    label: "shadowrun6.gear.subtype.EXPLOSIVES",
                    showRating: true,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                GRENADES: {
                    label: "shadowrun6.gear.subtype.GRENADES",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BOWS: {
                    label: "shadowrun6.gear.subtype.BOWS",
                    showRating: true,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                CROSSBOWS: {
                    label: "shadowrun6.gear.subtype.CROSSBOWS",
                    showRating: true,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BALLISTAS: {
                    label: "shadowrun6.gear.subtype.BALLISTAS",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        ARMOR: {
            label: "shadowrun6.itemtype.ARMOR",
            subtypes: {
                ARMOR_BODY: {
                    label: "shadowrun6.gear.subtype.ARMOR_BODY",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                ARMOR_HELMET: {
                    label: "shadowrun6.gear.subtype.ARMOR_HELMET",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                ARMOR_SHIELD: {
                    label: "shadowrun6.gear.subtype.ARMOR_SHIELD",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                ARMOR_SOCIAL: {
                    label: "shadowrun6.gear.subtype.ARMOR_SOCIAL",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                ARMOR_CLOTHES: {
                    label: "shadowrun6.gear.subtype.ARMOR_CLOTHES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        ARMOR_ADDITION: {
            label: "shadowrun6.itemtype.ARMOR_ADDITION",
            subtypes: {},
        },
        BIOLOGY: {
            label: "shadowrun6.itemtype.BIOLOGY",
            subtypes: {
                BIOTECH: {
                    label: "shadowrun6.gear.subtype.BIOTECH",
                    showRating: true,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                SLAP_PATCHES: {
                    label: "shadowrun6.gear.subtype.SLAP_PATCHES",
                    showRating: true,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        BIOWARE: {
            label: "shadowrun6.itemtype.BIOWARE",
            subtypes: {
                BIOWARE_STANDARD: {
                    label: "shadowrun6.gear.subtype.BIOWARE_STANDARD",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BIOWARE_CULTURED: {
                    label: "shadowrun6.gear.subtype.BIOWARE_CULTURED",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BIOWARE_IMPLANT_WEAPON: {
                    label: "shadowrun6.gear.subtype.BIOWARE_IMPLANT_WEAPON",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BIOWARE_DERMAL: {
                    label: "shadowrun6.gear.subtype.BIOWARE_DERMAL",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BIOSENSE: {
                    label: "shadowrun6.gear.subtype.BIOSENSE",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                SYMBIONTS: {
                    label: "shadowrun6.gear.subtype.SYMBIONT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        CHEMICALS: {
            label: "shadowrun6.itemtype.CHEMICALS",
            subtypes: {
                INDUSTRIAL_CHEMICALS: {
                    label: "shadowrun6.gear.subtype.INDUSTRIAL_CHEMICALS",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                TOXINS: {
                    label: "shadowrun6.gear.subtype.TOXINS",
                    showRating: true,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                DRUGS: {
                    label: "shadowrun6.gear.subtype.DRUGS",
                    showRating: true,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BTL: {
                    label: "shadowrun6.gear.subtype.BTL",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                PERFUME: {
                    label: "shadowrun6.gear.subtype.PERFUME",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                ESPIONAGE: {
                    label: "shadowrun6.gear.subtype.ESPIONAGE",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        CYBERWARE: {
            label: "shadowrun6.itemtype.CYBERWARE",
            GRADES: {
                0: "Omega/Used (DR 0)",
                1: "Exo (DR 1)",
                2: "Standard (DR 2)",
                3: "Alpha (DR 3)",
                4: "Beta (DR 4)",
                6: "Delta (DR 6)",
                7: "Gamma (DR 7)",
            },
            subtypes: {
                CYBER_HEADWARE: {
                    label: "shadowrun6.gear.subtype.CYBER_HEADWARE",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBERJACK: {
                    label: "shadowrun6.gear.subtype.CYBERJACK",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBER_BODYWARE: {
                    label: "shadowrun6.gear.subtype.CYBER_BODYWARE",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBER_EYEWARE: {
                    label: "shadowrun6.gear.subtype.CYBER_EYEWARE",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBER_EARWARE: {
                    label: "shadowrun6.gear.subtype.CYBER_EARWARE",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBER_IMPLANT_WEAPON: {
                    label: "shadowrun6.gear.subtype.CYBER_IMPLANT_WEAPON",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBER_LIMBS: {
                    label: "shadowrun6.gear.subtype.CYBER_LIMBS",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                COMMLINK: {
                    label: "shadowrun6.gear.subtype.COMMLINK",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBERDECK: {
                    label: "shadowrun6.gear.subtype.CYBERDECK",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBERNETIC_RESTRAINT: {
                    label: "shadowrun6.gear.subtype.CYBERNETIC_RESTRAINT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                COSMETIC: {
                    label: "shadowrun6.gear.subtype.COSMETIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
        CODEMODS: {
            label: "shadowrun6.itemtype.CODEMODS",
            subtypes: {
                ATTRIBUTE_CODEMOD: {
                    label: "shadowrun6.gear.subtype.ATTRIBUTE_CODEMOD",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                CORE_CODEMOD: {
                    label: "shadowrun6.gear.subtype.ATTRIBUTE_CODEMOD",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                PROCESSOR: {
                    label: "shadowrun6.gear.subtype.PROCESSOR",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                IO: {
                    label: "shadowrun6.gear.subtype.IO",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                DIGITAL_WEAPON: {
                    label: "shadowrun6.gear.subtype.DIGITAL_WEAPON",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        DRONES: {
            label: "shadowrun6.itemtype.DRONES",
            subtypes: {
                MICRODRONES: {
                    label: "shadowrun6.gear.subtype.MICRODRONES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                MINIDRONES: {
                    label: "shadowrun6.gear.subtype.MINIDRONES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                SMALL_DRONES: {
                    label: "shadowrun6.gear.subtype.SMALL_DRONES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                MEDIUM_DRONES: {
                    label: "shadowrun6.gear.subtype.MEDIUM_DRONES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                LARGE_DRONES: {
                    label: "shadowrun6.gear.subtype.LARGE_DRONES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
        DRONE_MICRO: {
            label: "shadowrun6.gear.subtype.MICRODRONES",
            subtypes: {
                GROUND: {
                    label: "shadowrun6.gear.subtype.GROUND",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AIR: {
                    label: "shadowrun6.gear.subtype.AIR",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AQUATIC: {
                    label: "shadowrun6.gear.subtype.AQUATIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
        DRONE_MINI: {
            label: "shadowrun6.gear.subtype.MINIDRONES",
            subtypes: {
                GROUND: {
                    label: "shadowrun6.gear.subtype.GROUND",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AIR: {
                    label: "shadowrun6.gear.subtype.AIR",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AQUATIC: {
                    label: "shadowrun6.gear.subtype.AQUATIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
        DRONE_SMALL: {
            label: "shadowrun6.gear.subtype.SMALL_DRONES",
            subtypes: {
                GROUND: {
                    label: "shadowrun6.gear.subtype.GROUND",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AIR: {
                    label: "shadowrun6.gear.subtype.AIR",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AQUATIC: {
                    label: "shadowrun6.gear.subtype.AQUATIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                ANTHRO: {
                    label: "shadowrun6.gear.subtype.ANTHRO",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
        DRONE_MEDIUM: {
            label: "shadowrun6.gear.subtype.MEDIUM_DRONES",
            subtypes: {
                GROUND: {
                    label: "shadowrun6.gear.subtype.GROUND",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AIR: {
                    label: "shadowrun6.gear.subtype.AIR",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AQUATIC: {
                    label: "shadowrun6.gear.subtype.AQUATIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                ANTHRO: {
                    label: "shadowrun6.gear.subtype.ANTHRO",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
        DRONE_LARGE: {
            label: "shadowrun6.gear.subtype.LARGE_DRONES",
            subtypes: {
                GROUND: {
                    label: "shadowrun6.gear.subtype.GROUND",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AIR: {
                    label: "shadowrun6.gear.subtype.AIR",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AQUATIC: {
                    label: "shadowrun6.gear.subtype.AQUATIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                ANTHRO: {
                    label: "shadowrun6.gear.subtype.ANTHRO",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
        ELECTRONICS: {
            label: "shadowrun6.itemtype.ELECTRONICS",
            subtypes: {
                COMMLINK: {
                    label: "shadowrun6.gear.subtype.COMMLINK",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBERDECK: {
                    label: "shadowrun6.gear.subtype.CYBERDECK",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                ELECTRONIC_ACCESSORIES: {
                    label: "shadowrun6.gear.subtype.ELECTRONIC_ACCESSORIES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                RIGGER_CONSOLE: {
                    label: "shadowrun6.gear.subtype.RIGGER_CONSOLE",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                RFID: {
                    label: "shadowrun6.gear.subtype.RFID",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                COMMUNICATION: {
                    label: "shadowrun6.gear.subtype.COMMUNICATION",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                ID_CREDIT: {
                    label: "shadowrun6.gear.subtype.ID_CREDIT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                IMAGING: {
                    label: "shadowrun6.gear.subtype.IMAGING",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                OPTICAL: {
                    label: "shadowrun6.gear.subtype.OPTICAL",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                AUDIO: {
                    label: "shadowrun6.gear.subtype.AUDIO",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                SENSOR_HOUSING: {
                    label: "shadowrun6.gear.subtype.SENSOR_HOUSING",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                SECURITY: {
                    label: "shadowrun6.gear.subtype.SECURITY",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                BREAKING: {
                    label: "shadowrun6.gear.subtype.BREAKING",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                TAC_NET: {
                    label: "shadowrun6.gear.subtype.TAC_NET",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                DATATERM: {
                    label: "shadowrun6.gear.subtype.DATATERM",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                CYBERTERM: {
                    label: "shadowrun6.gear.subtype.CYBERTERM",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                INSTRUMENT: {
                    label: "shadowrun6.gear.subtype.INSTRUMENT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                BTLS: {
                    label: "shadowrun6.gear.subtype.BTLS",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        GENETICS: {
            label: "shadowrun6.itemtype.GENETICS",
            subtypes: {
                THERAPEUTIC: {
                    label: "shadowrun6.gear.subtype.THERAPEUTIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                AUGMENTICS: {
                    label: "shadowrun6.gear.subtype.AUGMENTICS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                COMPLEMENTARY_GENETIC_MODS: {
                    label: "shadowrun6.gear.subtype.COMPLEMENTARY_GENETIC_MODS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                TRANSGENICS: {
                    label: "shadowrun6.gear.subtype.TRANSGENICS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                TRANSGENIC_BIOWARE: {
                    label: "shadowrun6.gear.subtype.TRANSGENIC_BIOWARE",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        MAGICAL: {
            label: "shadowrun6.itemtype.MAGICAL",
            subtypes: {
                MAGICAL_FORMULA: {
                    label: "shadowrun6.gear.subtype.MAGICAL_FORMULA",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                MAGIC_SUPPLIES: {
                    label: "shadowrun6.gear.subtype.MAGIC_SUPPLIES",
                    showRating: true,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                MAGIC_LODGE: {
                    label: "shadowrun6.gear.subtype.MAGIC_LODGE",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        NANOWARE: {
            label: "shadowrun6.itemtype.NANOWARE",
            subtypes: {
                NANITES_COSMETIC: {
                    label: "shadowrun6.gear.subtype.NANITES_COSMETIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                NANITES_THERAPEUTIC: {
                    label: "shadowrun6.gear.subtype.NANITES_THERAPEUTIC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                NANITES_BIOAMP: {
                    label: "shadowrun6.gear.subtype.NANITES_BIOAMP",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                NANITES_UTILITIES: {
                    label: "shadowrun6.gear.subtype.NANITES_UTILITIES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                NANITES_TRANSIENT: {
                    label: "shadowrun6.gear.subtype.NANITES_TRANSIENT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                NANO_CYBERWARE: {
                    label: "shadowrun6.gear.subtype.NANO_CYBERWARE",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                NANOTECH_KIT: {
                    label: "shadowrun6.gear.subtype.NANOTECH_KIT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        SOFTWARE: {
            label: "shadowrun6.itemtype.SOFTWARE",
            subtypes: {
                AUTOSOFT: {
                    label: "shadowrun6.gear.subtype.AUTOSOFT",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BASIC_PROGRAM: {
                    label: "shadowrun6.gear.subtype.BASIC_PROGRAM",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                HACKING_PROGRAM: {
                    label: "shadowrun6.gear.subtype.HACKING_PROGRAM",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                RIGGER_PROGRAM: {
                    label: "shadowrun6.gear.subtype.RIGGER_PROGRAM",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                SKILLSOFT: {
                    label: "shadowrun6.gear.subtype.SKILLSOFT",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                TAC_NET: {
                    label: "shadowrun6.gear.subtype.TAC_NET",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                ESOFT: {
                    label: "shadowrun6.gear.subtype.ESOFT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                OTHER_PROGRAMS: {
                    label: "shadowrun6.gear.subtype.OTHER_PROGRAMS",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        SURVIVAL: {
            label: "shadowrun6.itemtype.SURVIVAL",
            subtypes: {
                SURVIVAL_GEAR: {
                    label: "shadowrun6.gear.subtype.SURVIVAL_GEAR",
                    showRating: true,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                WINTER_GEAR: {
                    label: "shadowrun6.gear.subtype.WINTER_GEAR",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                GRAPPLE_GUN: {
                    label: "shadowrun6.gear.subtype.GRAPPLE_GUN",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
            },
        },
        TOOLS: {
            label: "shadowrun6.itemtype.TOOLS",
            subtypes: {
                TOOLS: {
                    label: "shadowrun6.gear.subtype.TOOLS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                SPARE_PARTS: {
                    label: "shadowrun6.gear.subtype.SPARE_PARTS",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        VEHICLES: {
            label: "shadowrun6.itemtype.VEHICLES",
            subtypes: {
                AIRSHIP: {
                    label: "shadowrun6.gear.subtype.AIRSHIP",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                ATVS: {
                    label: "shadowrun6.gear.subtype.ATVS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BIKES: {
                    label: "shadowrun6.gear.subtype.BIKES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BOATS: {
                    label: "shadowrun6.gear.subtype.BOATS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                BUS: {
                    label: "shadowrun6.gear.subtype.BUS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                CARS: {
                    label: "shadowrun6.gear.subtype.CARS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                HOVERCRAFT: {
                    label: "shadowrun6.gear.subtype.HOVERCRAFT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                LAV: {
                    label: "shadowrun6.gear.subtype.LAV",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                LTAV: {
                    label: "shadowrun6.gear.subtype.LTAV",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                GRAV: {
                    label: "shadowrun6.gear.subtype.GRAV",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                TRACKED: {
                    label: "shadowrun6.gear.subtype.TRACKED",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                MOD_TRAILER: {
                    label: "shadowrun6.gear.subtype.MOD_TRAILER",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                TRUCKS: {
                    label: "shadowrun6.gear.subtype.TRUCKS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                SHIPS: {
                    label: "shadowrun6.gear.subtype.SHIPS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                SUBMARINES: {
                    label: "shadowrun6.gear.subtype.SUBMARINES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                PWC: {
                    label: "shadowrun6.gear.subtype.PWC",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                FIXED_WING: {
                    label: "shadowrun6.gear.subtype.FIXED_WING",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                ROTORCRAFT: {
                    label: "shadowrun6.gear.subtype.ROTORCRAFT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                VANS: {
                    label: "shadowrun6.gear.subtype.VANS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                VTOL: {
                    label: "shadowrun6.gear.subtype.VTOL",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                WALKER: {
                    label: "shadowrun6.gear.subtype.WALKER",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                SPACECRAFT: {
                    label: "shadowrun6.gear.subtype.SPACECRAFT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
                SPECIAL_VEHICLES: {
                    label: "shadowrun6.gear.subtype.SPECIAL_VEHICLES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        WEAPON_CLOSE_COMBAT: {
            label: "shadowrun6.itemtype.WEAPON_CLOSE_COMBAT",
            subtypes: {
                BLADES: {
                    label: "shadowrun6.gear.subtype.BLADES",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                CLUBS: {
                    label: "shadowrun6.gear.subtype.CLUBS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                WHIPS: {
                    label: "shadowrun6.gear.subtype.WHIPS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                UNARMED: {
                    label: "shadowrun6.gear.subtype.UNARMED",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                OTHER_CLOSE: {
                    label: "shadowrun6.gear.subtype.OTHER_CLOSE",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
            },
        },
        WEAPON_FIREARMS: {
            label: "shadowrun6.itemtype.WEAPON_FIREARMS",
            subtypes: {
                TASERS: {
                    label: "shadowrun6.gear.subtype.TASERS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                HOLDOUTS: {
                    label: "shadowrun6.gear.subtype.HOLDOUTS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                PISTOLS_LIGHT: {
                    label: "shadowrun6.gear.subtype.PISTOLS_LIGHT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                MACHINE_PISTOLS: {
                    label: "shadowrun6.gear.subtype.MACHINE_PISTOLS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                PISTOLS_HEAVY: {
                    label: "shadowrun6.gear.subtype.PISTOLS_HEAVY",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                SUBMACHINE_GUNS: {
                    label: "shadowrun6.gear.subtype.SUBMACHINE_GUNS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                SHOTGUNS: {
                    label: "shadowrun6.gear.subtype.SHOTGUNS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                RIFLE_ASSAULT: {
                    label: "shadowrun6.gear.subtype.RIFLE_ASSAULT",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                RIFLE_HUNTING: {
                    label: "shadowrun6.gear.subtype.RIFLE_HUNTING",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                RIFLE_SNIPER: {
                    label: "shadowrun6.gear.subtype.RIFLE_SNIPER",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                LMG: {
                    label: "shadowrun6.gear.subtype.LMG",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                MMG: {
                    label: "shadowrun6.gear.subtype.MMG",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                HMG: {
                    label: "shadowrun6.gear.subtype.HMG",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                ASSAULT_CANNON: {
                    label: "shadowrun6.gear.subtype.ASSAULT_CANNON",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
        WEAPON_RANGED: {
            label: "shadowrun6.itemtype.WEAPON_RANGED",
            subtypes: {
                BOWS: {
                    label: "shadowrun6.gear.subtype.BOWS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                CROSSBOWS: {
                    label: "shadowrun6.gear.subtype.CROSSBOWS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.OPTIONAL,
                },
                THROWING: {
                    label: "shadowrun6.gear.subtype.THROWING",
                    showRating: false,
                    showCountable: true,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.NEVER,
                },
            },
        },
        WEAPON_SPECIAL: {
            label: "shadowrun6.itemtype.WEAPON_SPECIAL",
            subtypes: {
                LAUNCHERS: {
                    label: "shadowrun6.gear.subtype.LAUNCHERS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                THROWERS: {
                    label: "shadowrun6.gear.subtype.THROWERS",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                DMSO: {
                    label: "shadowrun6.gear.subtype.DMSO",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                DART: {
                    label: "shadowrun6.gear.subtype.DART",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
                OTHER_SPECIAL: {
                    label: "shadowrun6.gear.subtype.OTHER_SPECIAL",
                    showRating: false,
                    showCountable: false,
                    showMatrixDeviceConfig: this.MATRIX_DEVICE_CONFIG.ALWAYS,
                },
            },
        },
    };

    GEAR_TYPES = {
        ACCESSORY: "shadowrun6.itemtype.ACCESSORY",
        AMMUNITION: "shadowrun6.itemtype.AMMUNITION",
        ARMOR: "shadowrun6.itemtype.ARMOR",
        ARMOR_ADDITION: "shadowrun6.itemtype.ARMOR_ADDITION",
        BIOLOGY: "shadowrun6.itemtype.BIOLOGY",
        BIOWARE: "shadowrun6.itemtype.BIOWARE",
        CHEMICALS: "shadowrun6.itemtype.CHEMICALS",
        CYBERWARE: "shadowrun6.itemtype.CYBERWARE",
        CODEMODS: "shadowrun6.itemtype.CODEMODS",
        DRONES: "shadowrun6.itemtype.DRONES",
        DRONE_MICRO: "shadowrun6.gear.subtype.MICRODRONES",
        DRONE_MINI: "shadowrun6.gear.subtype.MINIDRONES",
        DRONE_SMALL: "shadowrun6.gear.subtype.SMALL_DRONES",
        DRONE_MEDIUM: "shadowrun6.gear.subtype.MEDIUM_DRONES",
        DRONE_LARGE: "shadowrun6.gear.subtype.LARGE_DRONES",
        ELECTRONICS: "shadowrun6.itemtype.ELECTRONICS",
        GENETICS: "shadowrun6.itemtype.GENETICS",
        MAGICAL: "shadowrun6.itemtype.MAGICAL",
        NANOWARE: "shadowrun6.itemtype.NANOWARE",
        SOFTWARE: "shadowrun6.itemtype.SOFTWARE",
        SURVIVAL: "shadowrun6.itemtype.SURVIVAL",
        TOOLS: "shadowrun6.itemtype.TOOLS",
        VEHICLES: "shadowrun6.itemtype.VEHICLES",
        WEAPON_CLOSE_COMBAT: "shadowrun6.itemtype.WEAPON_CLOSE_COMBAT",
        WEAPON_FIREARMS: "shadowrun6.itemtype.WEAPON_FIREARMS",
        WEAPON_RANGED: "shadowrun6.itemtype.WEAPON_RANGED",
        WEAPON_SPECIAL: "shadowrun6.itemtype.WEAPON_SPECIAL",
    };
    GEAR_SUBTYPES = {
        ACCESSORY: {
            ACCESSORY: "shadowrun6.gear.subtype.ACCESSORY",
        },
        AMMUNITION: {
            AMMUNITION: "shadowrun6.gear.subtype.AMMUNITION",
            ROCKETS: "shadowrun6.gear.subtype.ROCKETS",
            MISSILES: "shadowrun6.gear.subtype.MISSILES",
            EXPLOSIVES: "shadowrun6.gear.subtype.EXPLOSIVES",
            GRENADES: "shadowrun6.gear.subtype.GRENADES",
            BOWS: "shadowrun6.gear.subtype.BOWS",
            CROSSBOWS: "shadowrun6.gear.subtype.CROSSBOWS",
            BALLISTAS: "shadowrun6.gear.subtype.BALLISTAS",
        },
        ARMOR: {
            ARMOR_BODY: "shadowrun6.gear.subtype.ARMOR_BODY",
            ARMOR_HELMET: "shadowrun6.gear.subtype.ARMOR_HELMET",
            ARMOR_SHIELD: "shadowrun6.gear.subtype.ARMOR_SHIELD",
            ARMOR_SOCIAL: "shadowrun6.gear.subtype.ARMOR_SOCIAL",
            ARMOR_CLOTHES: "shadowrun6.gear.subtype.ARMOR_CLOTHES",
        },
        ARMOR_ADDITION: {},
        BIOLOGY: {
            BIOTECH: "shadowrun6.gear.subtype.BIOTECH",
            SLAP_PATCHES: "shadowrun6.gear.subtype.SLAP_PATCHES",
        },
        BIOWARE: {
            BIOWARE_STANDARD: "shadowrun6.gear.subtype.BIOWARE_STANDARD",
            BIOWARE_CULTURED: "shadowrun6.gear.subtype.BIOWARE_CULTURED",
            BIOWARE_IMPLANT_WEAPON:
                "shadowrun6.gear.subtype.BIOWARE_IMPLANT_WEAPON", // Key changed in Commlink to BIOWARE_WEAPON
            BIOWARE_DERMAL: "shadowrun6.gear.subtype.BIOWARE_DERMAL",
            BIOSENSE: "shadowrun6.gear.subtype.BIOSENSE",
            SYMBIONTS: "shadowrun6.gear.subtype.SYMBIONT",
        },
        CHEMICALS: {
            INDUSTRIAL_CHEMICALS:
                "shadowrun6.gear.subtype.INDUSTRIAL_CHEMICALS",
            TOXINS: "shadowrun6.gear.subtype.TOXINS",
            DRUGS: "shadowrun6.gear.subtype.DRUGS",
            BTL: "shadowrun6.gear.subtype.BTL",
            PERFUME: "shadowrun6.gear.subtype.PERFUME",
            ESPIONAGE: "shadowrun6.gear.subtype.ESPIONAGE",
        },
        CYBERWARE: {
            CYBER_HEADWARE: "shadowrun6.gear.subtype.CYBER_HEADWARE",
            CYBERJACK: "shadowrun6.gear.subtype.CYBERJACK",
            CYBER_BODYWARE: "shadowrun6.gear.subtype.CYBER_BODYWARE",
            CYBER_EYEWARE: "shadowrun6.gear.subtype.CYBER_EYEWARE",
            CYBER_EARWARE: "shadowrun6.gear.subtype.CYBER_EARWARE",
            CYBER_IMPLANT_WEAPON:
                "shadowrun6.gear.subtype.CYBER_IMPLANT_WEAPON",
            CYBER_LIMBS: "shadowrun6.gear.subtype.CYBER_LIMBS",
            COMMLINK: "shadowrun6.gear.subtype.COMMLINK",
            CYBERDECK: "shadowrun6.gear.subtype.CYBERDECK",
            CYBERNETIC_RESTRAINT:
                "shadowrun6.gear.subtype.CYBERNETIC_RESTRAINT",
            COSMETIC: "shadowrun6.gear.subtype.COSMETIC",
        },
        CODEMODS: {
            ATTRIBUTE_CODEMOD: "shadowrun6.gear.subtype.ATTRIBUTE_CODEMOD",
            CORE_CODEMOD: "shadowrun6.gear.subtype.ATTRIBUTE_CODEMOD",
            PROCESSOR: "shadowrun6.gear.subtype.PROCESSOR",
            IO: "shadowrun6.gear.subtype.IO",
            DIGITAL_WEAPON: "shadowrun6.gear.subtype.DIGITAL_WEAPON",
        },
        DRONES: {
            MICRODRONES: "shadowrun6.gear.subtype.MICRODRONES",
            MINIDRONES: "shadowrun6.gear.subtype.MINIDRONES",
            SMALL_DRONES: "shadowrun6.gear.subtype.SMALL_DRONES",
            MEDIUM_DRONES: "shadowrun6.gear.subtype.MEDIUM_DRONES",
            LARGE_DRONES: "shadowrun6.gear.subtype.LARGE_DRONES",
        },
        DRONE_MICRO: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC",
        },
        DRONE_MINI: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC",
        },
        DRONE_SMALL: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC",
            ANTHRO: "shadowrun6.gear.subtype.ANTHRO",
        },
        DRONE_MEDIUM: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC",
            ANTHRO: "shadowrun6.gear.subtype.ANTHRO",
        },
        DRONE_LARGE: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC",
            ANTHRO: "shadowrun6.gear.subtype.ANTHRO",
        },
        ELECTRONICS: {
            COMMLINK: "shadowrun6.gear.subtype.COMMLINK",
            CYBERDECK: "shadowrun6.gear.subtype.CYBERDECK",
            ELECTRONIC_ACCESSORIES:
                "shadowrun6.gear.subtype.ELECTRONIC_ACCESSORIES",
            RIGGER_CONSOLE: "shadowrun6.gear.subtype.RIGGER_CONSOLE",
            RFID: "shadowrun6.gear.subtype.RFID",
            COMMUNICATION: "shadowrun6.gear.subtype.COMMUNICATION",
            ID_CREDIT: "shadowrun6.gear.subtype.ID_CREDIT",
            IMAGING: "shadowrun6.gear.subtype.IMAGING",
            OPTICAL: "shadowrun6.gear.subtype.OPTICAL",
            AUDIO: "shadowrun6.gear.subtype.AUDIO",
            SENSOR_HOUSING: "shadowrun6.gear.subtype.SENSOR_HOUSING",
            SECURITY: "shadowrun6.gear.subtype.SECURITY",
            BREAKING: "shadowrun6.gear.subtype.BREAKING",
            TAC_NET: "shadowrun6.gear.subtype.TAC_NET",
            DATATERM: "shadowrun6.gear.subtype.DATATERM",
            CYBERTERM: "shadowrun6.gear.subtype.CYBERTERM",
            INSTRUMENT: "shadowrun6.gear.subtype.INSTRUMENT",
            BTLS: "shadowrun6.gear.subtype.BTLS",
        },

        // /** Hack&Slash custom cyberdecks */
        // CYBERDECK(
        //         ItemSubType.CORE,
        //         ItemSubType.CASES,
        //         ItemSubType.CASE_MODS,
        //         ItemSubType.CORE_OPTIONAL
        //         ),
        GENETICS: {
            THERAPEUTIC: "shadowrun6.gear.subtype.THERAPEUTIC",
            AUGMENTICS: "shadowrun6.gear.subtype.AUGMENTICS",
            COMPLEMENTARY_GENETIC_MODS:
                "shadowrun6.gear.subtype.COMPLEMENTARY_GENETIC_MODS",
            TRANSGENICS: "shadowrun6.gear.subtype.TRANSGENICS",
            TRANSGENIC_BIOWARE: "shadowrun6.gear.subtype.TRANSGENIC_BIOWARE",
        },
        MAGICAL: {
            MAGICAL_FORMULA: "shadowrun6.gear.subtype.MAGICAL_FORMULA",
            MAGIC_SUPPLIES: "shadowrun6.gear.subtype.MAGIC_SUPPLIES",
            MAGIC_LODGE: "shadowrun6.gear.subtype.MAGIC_LODGE",
        },
        NANOWARE: {
            NANITES_COSMETIC: "shadowrun6.gear.subtype.NANITES_COSMETIC",
            NANITES_THERAPEUTIC: "shadowrun6.gear.subtype.NANITES_THERAPEUTIC",
            NANITES_BIOAMP: "shadowrun6.gear.subtype.NANITES_BIOAMP",
            NANITES_UTILITIES: "shadowrun6.gear.subtype.NANITES_UTILITIES",
            NANITES_TRANSIENT: "shadowrun6.gear.subtype.NANITES_TRANSIENT",
            NANO_CYBERWARE: "shadowrun6.gear.subtype.NANO_CYBERWARE",
            NANOTECH_KIT: "shadowrun6.gear.subtype.NANOTECH_KIT",
        },
        SOFTWARE: {
            AUTOSOFT: "shadowrun6.gear.subtype.AUTOSOFT",
            BASIC_PROGRAM: "shadowrun6.gear.subtype.BASIC_PROGRAM",
            HACKING_PROGRAM: "shadowrun6.gear.subtype.HACKING_PROGRAM",
            RIGGER_PROGRAM: "shadowrun6.gear.subtype.RIGGER_PROGRAM",
            SKILLSOFT: "shadowrun6.gear.subtype.SKILLSOFT",
            TAC_NET: "shadowrun6.gear.subtype.TAC_NET",
            ESOFT: "shadowrun6.gear.subtype.ESOFT",
            OTHER_PROGRAMS: "shadowrun6.gear.subtype.OTHER_PROGRAMS",
        },
        SURVIVAL: {
            SURVIVAL_GEAR: "shadowrun6.gear.subtype.SURVIVAL_GEAR",
            WINTER_GEAR: "shadowrun6.gear.subtype.WINTER_GEAR",
            GRAPPLE_GUN: "shadowrun6.gear.subtype.GRAPPLE_GUN",
        },
        TOOLS: {
            TOOLS: "shadowrun6.gear.subtype.TOOLS",
            SPARE_PARTS: "shadowrun6.gear.subtype.SPARE_PARTS",
        },
        VEHICLES: {
            AIRSHIP: "shadowrun6.gear.subtype.AIRSHIP",
            ATVS: "shadowrun6.gear.subtype.ATVS",
            BIKES: "shadowrun6.gear.subtype.BIKES",
            BOATS: "shadowrun6.gear.subtype.BOATS",
            BUS: "shadowrun6.gear.subtype.BUS",
            CARS: "shadowrun6.gear.subtype.CARS",
            HOVERCRAFT: "shadowrun6.gear.subtype.HOVERCRAFT",
            LAV: "shadowrun6.gear.subtype.LAV",
            LTAV: "shadowrun6.gear.subtype.LTAV",
            GRAV: "shadowrun6.gear.subtype.GRAV",
            TRACKED: "shadowrun6.gear.subtype.TRACKED",
            MOD_TRAILER: "shadowrun6.gear.subtype.MOD_TRAILER",
            TRUCKS: "shadowrun6.gear.subtype.TRUCKS",
            SHIPS: "shadowrun6.gear.subtype.SHIPS",
            SUBMARINES: "shadowrun6.gear.subtype.SUBMARINES",
            PWC: "shadowrun6.gear.subtype.PWC",
            FIXED_WING: "shadowrun6.gear.subtype.FIXED_WING",
            ROTORCRAFT: "shadowrun6.gear.subtype.ROTORCRAFT",
            VANS: "shadowrun6.gear.subtype.VANS",
            VTOL: "shadowrun6.gear.subtype.VTOL",
            WALKER: "shadowrun6.gear.subtype.WALKER",
            SPACECRAFT: "shadowrun6.gear.subtype.SPACECRAFT",
            SPECIAL_VEHICLES: "shadowrun6.gear.subtype.SPECIAL_VEHICLES",
        },
        WEAPON_CLOSE_COMBAT: {
            BLADES: "shadowrun6.gear.subtype.BLADES",
            CLUBS: "shadowrun6.gear.subtype.CLUBS",
            WHIPS: "shadowrun6.gear.subtype.WHIPS",
            UNARMED: "shadowrun6.gear.subtype.UNARMED",
            OTHER_CLOSE: "shadowrun6.gear.subtype.OTHER_CLOSE",
        },
        WEAPON_FIREARMS: {
            TASERS: "shadowrun6.gear.subtype.TASERS",
            HOLDOUTS: "shadowrun6.gear.subtype.HOLDOUTS",
            PISTOLS_LIGHT: "shadowrun6.gear.subtype.PISTOLS_LIGHT",
            MACHINE_PISTOLS: "shadowrun6.gear.subtype.MACHINE_PISTOLS",
            PISTOLS_HEAVY: "shadowrun6.gear.subtype.PISTOLS_HEAVY",
            SUBMACHINE_GUNS: "shadowrun6.gear.subtype.SUBMACHINE_GUNS",
            SHOTGUNS: "shadowrun6.gear.subtype.SHOTGUNS",
            RIFLE_ASSAULT: "shadowrun6.gear.subtype.RIFLE_ASSAULT",
            RIFLE_HUNTING: "shadowrun6.gear.subtype.RIFLE_HUNTING",
            RIFLE_SNIPER: "shadowrun6.gear.subtype.RIFLE_SNIPER",
            LMG: "shadowrun6.gear.subtype.LMG",
            MMG: "shadowrun6.gear.subtype.MMG",
            HMG: "shadowrun6.gear.subtype.HMG",
            ASSAULT_CANNON: "shadowrun6.gear.subtype.ASSAULT_CANNON",
        },
        WEAPON_RANGED: {
            BOWS: "shadowrun6.gear.subtype.BOWS",
            CROSSBOWS: "shadowrun6.gear.subtype.CROSSBOWS",
            THROWING: "shadowrun6.gear.subtype.THROWING",
        },
        WEAPON_SPECIAL: {
            LAUNCHERS: "shadowrun6.gear.subtype.LAUNCHERS",
            THROWERS: "shadowrun6.gear.subtype.THROWERS",
            DMSO: "shadowrun6.gear.subtype.DMSO",
            DART: "shadowrun6.gear.subtype.DART",
            OTHER_SPECIAL: "shadowrun6.gear.subtype.OTHER_SPECIAL",
        },
    };
    GEAR_SUBTYPES_OLD = new Map([
        ["ACCESSORY", []],
        [
            "AMMUNITION",
            ["AMMUNITION", "ROCKETS", "MISSILES", "EXPLOSIVES", "GRENADES"],
        ],
        ["ARMOR", ["ARMOR_BODY", "ARMOR_HELMET", "ARMOR_SHIELD"]],
        ["ARMOR_ADDITION", []],
        ["BIOLOGY", ["BIOTECH", "SLAP_PATCHES"]],
        [
            "BIOWARE",
            ["BIOWARE_STANDARD", "BIOWARE_CULTURED", "BIOWARE_IMPLANT_WEAPON"],
        ],
        ["CHEMICALS", ["INDUSTRIAL_CHEMICALS", "TOXINS", "DRUGS", "BTL"]],
        [
            "CYBERWARE",
            [
                "CYBER_HEADWARE",
                "CYBERJACK",
                "CYBER_BODYWARE",
                "CYBER_EYEWARE",
                "CYBER_EARWARE",
                "CYBER_IMPLANT_WEAPON",
                "CYBER_LIMBS",
                "COMMLINK",
                "CYBERDECK",
            ],
        ],
        [
            "DRONES",
            [
                "MICRODRONES",
                "MINIDRONES",
                "SMALL_DRONES",
                "MEDIUM_DRONES",
                "LARGE_DRONES",
            ],
        ],
        [
            "ELECTRONICS",
            [
                "COMMLINK",
                "DATATERM",
                "CYBERTERM",
                "CYBERDECK",
                "ELECTRONIC_ACCESSORIES",
                "RIGGER_CONSOLE",
                "RFID",
                "COMMUNICATION",
                "ID_CREDIT",
                "IMAGING",
                "OPTICAL",
                "AUDIO",
                "SENSOR_HOUSING",
                "SECURITY",
                "BREAKING",
                "TAC_NET",
            ],
        ],
        ["GENETICS", []],
        ["MAGICAL", ["MAGIC_SUPPLIES"]],
        ["NANOWARE", []],
        ["SOFTWARE", ["AUTOSOFT"]],
        ["SURVIVAL", ["SURVIVAL_GEAR", "GRAPPLE_GUN"]],
        ["TOOLS", ["TOOLS"]],
        [
            "VEHICLES",
            [
                "BIKES",
                "CARS",
                "TRUCKS",
                "BOATS",
                "SUBMARINES",
                "FIXED_WING",
                "ROTORCRAFT",
                "VTOL",
                "WALKER",
            ],
        ],
        [
            "WEAPON_CLOSE_COMBAT",
            ["BLADES", "CLUBS", "WHIPS", "UNARMED", "OTHER_CLOSE"],
        ],
        [
            "WEAPON_FIREARMS",
            [
                "TASERS",
                "HOLDOUTS",
                "PISTOLS_LIGHT",
                "MACHINE_PISTOLS",
                "PISTOLS_HEAVY",
                "SUBMACHINE_GUNS",
                "SHOTGUNS",
                "RIFLE_ASSAULT",
                "RIFLE_HUNTING",
                "RIFLE_SNIPER",
                "LMG",
                "MMG",
                "HMG",
                "ASSAULT_CANNON",
            ],
        ],
        ["WEAPON_RANGED", ["BOWS", "CROSSBOWS", "THROWING"]],
        ["WEAPON_SPECIAL", ["LAUNCHERS", "THROWERS", "OTHER_SPECIAL"]],
    ]);
    GEAR_SUBTYPES2 = {
        ELECTRONICS: [
            "COMMLINK",
            "DATATERM",
            "CYBERTERM",
            "CYBERDECK",
            "ELECTRONIC_ACCESSORIES",
            "RIGGER_CONSOLE",
            "RFID",
            "COMMUNICATION",
            "ID_CREDIT",
            "IMAGING",
            "OPTICAL",
            "AUDIO",
            "SENSOR_HOUSING",
            "SECURITY",
            "BREAKING",
            "TAC_NET",
        ],
    };
    SKILLS_WEAPON = {
        firearms: "skill.firearms",
        close_combat: "skill.close_combat",
        exotic_weapons: "skill.exotic_weapons",
        athletics: "skill.athletics",
        engineering: "skill.engineering",
    };
    SOFTWARE_TYPES = {
        AUTOSOFT: "shadowrun6.gear.subtype.AUTOSOFT",
        DATASOFT: "shadowrun6.gear.subtype.DATASOFT",
        HACKING: "shadowrun6.gear.subtype.HACKING_PROGRAM",
        MAPSOFT: "shadowrun6.gear.subtype.MAPSOFT",
        SHOPSOFT: "shadowrun6.gear.subtype.SHOPSOFT",
        STANDARD: "shadowrun6.gear.subtype.BASIC_PROGRAM",
        TALENTSOFT: "shadowrun6.gear.subtype.TALENTSOFT",
        TEACHSOFT: "shadowrun6.gear.subtype.TEACHSOFT",
    };
    AUTOSOFT_TYPES = {
        CLEARSIGHT: "shadowrun6.autosoft_types.clearsight",
        ELECTRONIC_WARFARE: "shadowrun6.autosoft_types.electronic_warfare",
        EVASION: "shadowrun6.autosoft_types.evasion",
        MANEUVER: "shadowrun6.autosoft_types.maneuver",
        STEALTH: "shadowrun6.autosoft_types.stealth",
        TARGETING: "shadowrun6.autosoft_types.targeting",
    };
    MATRIX_INITIATIVE_TYPES = {
        ar: "shadowrun6.matrixini.ar",
        vrcold: "shadowrun6.matrixini.vrcold",
        vrhot: "shadowrun6.matrixini.vrhot",
    };
    MOR_TYPES = {
        mundane: "shadowrun6.mortype.mundane",
        magician: "shadowrun6.mortype.magician",
        mysticadept: "shadowrun6.mortype.mysticadept",
        technomancer: "shadowrun6.mortype.technomancer",
        adept: "shadowrun6.mortype.adept",
        aspectedmagician: "shadowrun6.mortype.aspectedmagician",
    };
    MOR_DEFINITIONS = {
        mundane: new MagicOrResonanceDefinition(),
        magician: new MagicOrResonanceDefinition(true, false, true, false),
        mysticadept: new MagicOrResonanceDefinition(true, false, true, true),
        technomancer: new MagicOrResonanceDefinition(false, true, false, false),
        adept: new MagicOrResonanceDefinition(true, false, false, true),
        aspectedmagician: new MagicOrResonanceDefinition(
            true,
            false,
            true,
            false,
        ),
    };
    NPC_SUBTYPES = ["npc", "critter", "spirit", "sprite"];
    SPIRIT_TYPES = {
        air: "shadowrun6.spirittype.air",
        beasts: "shadowrun6.spirittype.beasts",
        earth: "shadowrun6.spirittype.earth",
        fire: "shadowrun6.spirittype.fire",
        kin: "shadowrun6.spirittype.kin",
        water: "shadowrun6.spirittype.water",
        plant: "shadowrun6.spirittype.plant",
        guardian: "shadowrun6.spirittype.guardian",
        guidance: "shadowrun6.spirittype.guidance",
        task: "shadowrun6.spirittype.task",
    };
    ATTRIB_BY_SKILL = new Map([
        ["astral", new SkillDefinition("int", false)],
        ["athletics", new SkillDefinition("agi", true)],
        ["biotech", new SkillDefinition("log", false)],
        ["close_combat", new SkillDefinition("agi", true)],
        ["con", new SkillDefinition("cha", true)],
        ["conjuring", new SkillDefinition("mag", false)],
        ["cracking", new SkillDefinition("log", false)],
        ["electronics", new SkillDefinition("log", true)],
        ["enchanting", new SkillDefinition("mag", false)],
        ["engineering", new SkillDefinition("log", true)],
        ["exotic_weapons", new SkillDefinition("agi", false)],
        ["firearms", new SkillDefinition("agi", true)],
        ["influence", new SkillDefinition("cha", true)],
        ["outdoors", new SkillDefinition("int", true)],
        ["perception", new SkillDefinition("int", true)],
        ["piloting", new SkillDefinition("rea", true)],
        ["sorcery", new SkillDefinition("mag", false)],
        ["stealth", new SkillDefinition("agi", true)],
        ["tasking", new SkillDefinition("res", false)],
    ]);
    EDGE_BOOSTS = [
        new EdgeBoost(1, "reroll_one", "POST", "OPPONENT"),
        new EdgeBoost(1, "plus_3_ini", "ANYTIME"),
        new EdgeBoost(2, "plus_1_roll", "POST"),
        new EdgeBoost(2, "give_ally_1_edge", "ANYTIME"),
        new EdgeBoost(2, "negate_1_edge", "PRE"),
        new EdgeBoost(3, "buy_auto_hit", "ANYTIME"),
        new EdgeBoost(3, "heal_1_stun", "ANYTIME"),
        new EdgeBoost(4, "add_edge_pool", "PRE"),
        new EdgeBoost(4, "heal_1_physic", "ANYTIME"),
        new EdgeBoost(4, "reroll_failed", "POST"),
        new EdgeBoost(5, "count_2_glitch", "PRE", "OPPONENT"),
        new EdgeBoost(5, "create_special", "ANYTIME"),
    ];
    EDGE_ACTIONS = [
        new EdgeAction(1, "shank", "COMBAT"),
        new EdgeAction(2, "bring_the_drama", "SOCIAL", "con"),
        new EdgeAction(2, "fire_from_cover", "COMBAT"),
        new EdgeAction(2, "knockout_blow", "COMBAT"),
        new EdgeAction(4, "anticipation", "COMBAT"),
        new EdgeAction(4, "big_speech", "SOCIAL", "influence"),
        new EdgeAction(5, "called_shot_disarm", "COMBAT"),
        new EdgeAction(5, "called_shot_vitals", "COMBAT"),
    ];
    FIRE_MODES = {
        SS: {
            loc: "shadowrun6.item.firemode.SS",
            firing_options: ["single_shot"],
        },
        SA: {
            loc: "shadowrun6.item.firemode.SA",
            firing_options: ["single_shot", "double_shot"],
        },
        BF: {
            loc: "shadowrun6.item.firemode.BF",
            firing_options: ["narrow_burst", "wide_burst"],
        },
        FA: {
            loc: "shadowrun6.item.firemode.FA",
            firing_options: ["area_fire"],
        },
    };
    icons = {
        adeptpower: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/explosion.svg",
        },
        complexform: {
            default:
                "systems/shadowrun6-eden/icons/compendium/the_12_days_of_cybermas/sycust_fleshweave.svg",
        },
        spritepower: {
            default:
                "systems/shadowrun6-eden/icons/compendium/programs/nervescrub.svg",
        },
        contact: {
            default:
                "systems/shadowrun6-eden/icons/compendium/status/human_shield.svg",
        },
        critterpower: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/default-demon.svg",
        },
        echo: {
            default:
                "systems/shadowrun6-eden/icons/compendium/gear/bug_detector.svg",
        },
        focus: {
            default:
                "systems/shadowrun6-eden/icons/compendium/clothing/generic_jewelry.svg",
        },
        gear: {
            default:
                "systems/shadowrun6-eden/icons/compendium/gear/tech_bag.svg",
        },
        skill: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/Default_Skill.svg",
        },
        lifestyle: {
            default:
                "systems/shadowrun6-eden/icons/compendium/clothing/generic_jacket.svg",
        },
        martialartstyle: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/Default_Melee.svg",
        },
        martialarttech: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/Default_Melee.svg",
        },
        metamagic: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/daze.svg",
        },
        quality: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/Default_Skill.svg",
        },
        ritual: {
            default:
                "systems/shadowrun6-eden/icons/compendium/programs/nervescrub.svg",
        },
        sin: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/Default_Role.svg",
        },
        software: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/Default_Program.svg",
        },
        spell: {
            default:
                "systems/shadowrun6-eden/icons/compendium/default/acid.svg",
        },
        mod: {
            default:
                "systems/shadowrun6-eden/icons/compendium/black-chrome/explicit-memory-stimulator.svg",
        },
    };
    spell_range = {
        line_of_sight: "shadowrun6.spell.range_line_of_sight",
        line_of_sight_area: "shadowrun6.spell.range_line_of_sight_area",
        touch: "shadowrun6.spell.range_touch",
        self: "shadowrun6.spell.range_self",
        self_area: "shadowrun6.spell.range_self_area",
    };
    spell_category = {
        combat: "shadowrun6.spell.category_combat",
        detection: "shadowrun6.spell.category_detection",
        health: "shadowrun6.spell.category_health",
        illusion: "shadowrun6.spell.category_illusion",
        manipulation: "shadowrun6.spell.category_manipulation",
    };
    spell_type = {
        physical: "shadowrun6.spell.type_physical",
        mana: "shadowrun6.spell.type_mana",
    };
    combat_spell_type = {
        spells_direct: "shadowrun6.spellfeatures.direct",
        spells_indirect: "shadowrun6.spellfeatures.indirect",
    };
    spell_duration = {
        instantaneous: "shadowrun6.spell.duration_instantaneous",
        sustained: "shadowrun6.spell.duration_sustained",
        permanent: "shadowrun6.spell.duration_permanent",
        limited: "shadowrun6.spell.duration_limited",
        always: "shadowrun6.spell.duration_always",
        special: "shadowrun6.spell.duration_special",
    };
    spell_damage = {
        physical: "shadowrun6.spell.damage_physical",
        stun: "shadowrun6.spell.damage_stun",
        physical_special: "shadowrun6.spell.damage_physical_special",
        stun_special: "shadowrun6.spell.damage_stun_special",
    };
    tradition_attributes = {
        bod: "attrib.bod",
        log: "attrib.log",
        cha: "attrib.cha",
        int: "attrib.int",
    };
    adeptpower_activation = {
        passive: "shadowrun6.adeptpower.activation_passive",
        minor_action: "shadowrun6.adeptpower.activation_minor",
        major_action: "shadowrun6.adeptpower.activation_major",
    };
    critterpower_action = {
        auto: "shadowrun6.critterpower.action.auto",
        minor: "shadowrun6.critterpower.action.minor",
        major: "shadowrun6.critterpower.action.major",
    };
    skill_special = {
        astral: {
            astral_combat: "shadowrun6.special.astral.astral_combat",
            astral_signatures: "shadowrun6.special.astral.astral_signatures",
            emotional_stress: "shadowrun6.special.astral.emotional_stress",
            spirit_types: "shadowrun6.special.astral.spirit_types",
        },
        athletics: {
            climbing: "shadowrun6.special.athletics.climbing",
            flying: "shadowrun6.special.athletics.flying",
            free_fall: "shadowrun6.special.athletics.free_fall",
            gymnastics: "shadowrun6.special.athletics.gymnastics",
            sprinting: "shadowrun6.special.athletics.sprinting",
            swimming: "shadowrun6.special.athletics.swimming",
            throwing: "shadowrun6.special.athletics.throwing",
            archery: "shadowrun6.special.athletics.archery",
        },
        biotech: {
            biotechnology: "shadowrun6.special.biotech.biotechnology",
            cybertechnology: "shadowrun6.special.biotech.cybertechnology",
            first_aid: "shadowrun6.special.biotech.first_aid",
            medicine: "shadowrun6.special.biotech.medicine",
        },
        close_combat: {
            blades: "shadowrun6.special.close_combat.blades",
            clubs: "shadowrun6.special.close_combat.clubs",
            unarmed: "shadowrun6.special.close_combat.unarmed",
        },
        con: {
            acting: "shadowrun6.special.con.acting",
            disguise: "shadowrun6.special.con.disguise",
            impersonation: "shadowrun6.special.con.impersonation",
            performance: "shadowrun6.special.con.performance",
        },
        conjuring: {
            banishing: "shadowrun6.special.conjuring.banishing",
            summoning: "shadowrun6.special.conjuring.summoning",
        },
        cracking: {
            cybercombat: "shadowrun6.special.cracking.cybercombat",
            electronic_warfare:
                "shadowrun6.special.cracking.electronic_warfare",
            hacking: "shadowrun6.special.cracking.hacking",
        },
        electronics: {
            computer: "shadowrun6.special.electronics.computer",
            hardware: "shadowrun6.special.electronics.hardware",
            software: "shadowrun6.special.electronics.software",
            complex_forms: "shadowrun6.special.electronics.complex_forms",
        },
        enchanting: {
            alchemy: "shadowrun6.special.enchanting.alchemy",
            artificing: "shadowrun6.special.enchanting.artificing",
            disenchanting: "shadowrun6.special.enchanting.disenchanting",
        },
        engineering: {
            aeronautics_mechanic:
                "shadowrun6.special.engineering.aeronautics_mechanic",
            armorer: "shadowrun6.special.engineering.armorer",
            automotive_mechanic:
                "shadowrun6.special.engineering.automotive_mechanic",
            demolitions: "shadowrun6.special.engineering.demolitions",
            gunnery: "shadowrun6.special.engineering.gunnery",
            industrial_mechanic:
                "shadowrun6.special.engineering.industrial_mechanic",
            lockpicking: "shadowrun6.special.engineering.lockpicking",
            nautical_mechanic:
                "shadowrun6.special.engineering.nautical_mechanic",
        },
        exotic_weapons: {
            chainsaws: "shadowrun6.special.exotic_weapons.chainsaws",
            brawling: "shadowrun6.special.exotic_weapons.brawling",
            air: "shadowrun6.special.exotic_weapons.air",
            emitter: "shadowrun6.special.exotic_weapons.emitter",
            laser: "shadowrun6.special.exotic_weapons.laser",
            launchers: "shadowrun6.special.exotic_weapons.launchers",
            spray: "shadowrun6.special.exotic_weapons.spray",
            whips: "shadowrun6.special.exotic_weapons.whips",
            other: "shadowrun6.special.exotic_weapons.other",
        },
        firearms: {
            tasers: "shadowrun6.special.firearms.tasers",
            holdouts: "shadowrun6.special.firearms.holdouts",
            pistols_light: "shadowrun6.special.firearms.pistols_light",
            pistols_heavy: "shadowrun6.special.firearms.pistols_heavy",
            machine_pistols: "shadowrun6.special.firearms.machine_pistols",
            machine_guns: "shadowrun6.special.firearms.machine_guns",
            submachine_guns: "shadowrun6.special.firearms.submachine_guns",
            rifles: "shadowrun6.special.firearms.rifles",
            shotguns: "shadowrun6.special.firearms.shotguns",
            assault_cannons: "shadowrun6.special.firearms.assault_cannons",
        },
        influence: {
            etiquette: "shadowrun6.special.influence.etiquette",
            instruction: "shadowrun6.special.influence.instruction",
            intimidation: "shadowrun6.special.influence.intimidation",
            leadership: "shadowrun6.special.influence.leadership",
            negotiation: "shadowrun6.special.influence.negotiation",
        },
        outdoors: {
            navigation: "shadowrun6.special.outdoors.navigation",
            survival: "shadowrun6.special.outdoors.survival",
            tracking_woods: "shadowrun6.special.outdoors.tracking_woods",
            tracking_desert: "shadowrun6.special.outdoors.tracking_desert",
            tracking_urban: "shadowrun6.special.outdoors.tracking_urban",
            tracking_other: "shadowrun6.special.outdoors.tracking_other",
        },
        perception: {
            visual: "shadowrun6.special.perception.visual",
            aural: "shadowrun6.special.perception.aural",
            tactile: "shadowrun6.special.perception.tactile",
            scent: "shadowrun6.special.perception.scent",
            taste: "shadowrun6.special.perception.taste",
            perception_woods: "shadowrun6.special.perception.perception_woods",
            perception_desert:
                "shadowrun6.special.perception.perception_desert",
            perception_urban: "shadowrun6.special.perception.perception_urban",
            perception_other: "shadowrun6.special.perception.perception_other",
        },
        piloting: {
            ground_craft: "shadowrun6.special.piloting.ground_craft",
            aircraft: "shadowrun6.special.piloting.aircraft",
            watercraft: "shadowrun6.special.piloting.watercraft",
        },
        sorcery: {
            counterspelling: "shadowrun6.special.sorcery.counterspelling",
            ritual_spellcasting:
                "shadowrun6.special.sorcery.ritual_spellcasting",
            spellcasting: "shadowrun6.special.sorcery.spellcasting",
        },
        stealth: {
            disguise: "shadowrun6.special.stealth.disguise",
            palming: "shadowrun6.special.stealth.palming",
            sneaking: "shadowrun6.special.stealth.sneaking",
            camouflage: "shadowrun6.special.stealth.camouflage",
        },
        tasking: {
            compiling: "shadowrun6.special.tasking.compiling",
            decompiling: "shadowrun6.special.tasking.decompiling",
            registering: "shadowrun6.special.tasking.registering",
        },
    };
    VEHICLE_TYPE = {
        GROUND: "shadowrun6.vehicle.type.groundcraft",
        WATER: "shadowrun6.vehicle.type.watercraft",
        AIR: "shadowrun6.vehicle.type.aircraft",
    };
    VEHICLE_MODE = {
        manual: "shadowrun6.vehicle.mode.manual",
        riggedAR: "shadowrun6.vehicle.mode.riggedAR",
        riggedVR: "shadowrun6.vehicle.mode.riggedVR",
        rcc: "shadowrun6.vehicle.mode.rcc",
        autonomous: "shadowrun6.vehicle.mode.autonomous",
    };
    CONTROL_RIG_RATING = {
        0: "shadowrun6.label.not_present",
        1: "shadowrun6.label.rating1",
        2: "shadowrun6.label.rating2",
        3: "shadowrun6.label.rating3",
    };
    // MatrixAction
    MATRIX_ACTIONS = {
        backdoor_entry: {
            id: "backdoor_entry",
            skill: "cracking",
            specialization: "hacking",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: false,
            admin: false,
            attr1: "wil",
            attr2: "f",
            linkedAttr: "s",
            threshold: 0,
            targets: ["host", "device", "living_network"],

            // TODO THINK ABOUT SELF ONLY ACTIONS WITHOUT TARGET

             async onMatrixActionRoll(matrixActionRoll) {
                const initiator = foundry.utils.fromUuidSync(matrixActionRoll.matrixInitiatorUuid);
                const defender = foundry.utils.fromUuidSync(matrixActionRoll.matrixTargetUuid);
                if (!initiator || !defender) {
                    matrixActionRoll.matrixActionDescription = "shadowrun6.matrix.no_target";
                    return;
                }

             },

            // // Initial Matrix Test by Initiator
            // async onSuccess(resultData) {
            //     console.log("SR6 | backdoor_entry | onSuccess", resultData);
            //     const { initiator, defender, hits, netHits } = resultData;

            // },

            // // Failed Test in case rolling against a threshold
            // async onFailure(resultData) {
            //     console.log("SR6 | backdoor_entry | onFailure", resultData);
            //     const { initiator, defender, hits, netHits } = resultData;

            // },

            // async onDefenseRoll(defenseRoll) {

            // },

            // // Succesfully defended against the action of Initiator
            // async onSuccesfulDefense(resultData) {
            //     console.log("SR6 | backdoor_entry | onSuccesfulDefense", resultData);
            //     const { initiator, defender, hits, netHits } = resultData;

            // },

            // Failed to defend against the action of Initiator - Success of Opposed Test!
            async onFailedDefense(resultData) {
                console.log("SR6 | backdoor_entry | onFailedDefense", resultData);
                const { initiator, defender, hits, netHits } = resultData;
                const safeUuid = initiator.uuid.replaceAll(".", "_");
                return await defender.setFlag("shadowrun6-eden", `matrix-access.${safeUuid}`, "admin")
            },

           

        },
        brute_force: {
            id: "brute_force",
            skill: "cracking",
            specialization: "cybercombat",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: "a",
            threshold: 0,
            targets: ["host", "device", "living_network"],

            async onMatrixActionRoll(matrixActionRoll) {
                const initiator = foundry.utils.fromUuidSync(matrixActionRoll.matrixInitiatorUuid);
                const defender = foundry.utils.fromUuidSync(matrixActionRoll.matrixTargetUuid);
                if (!initiator || !defender) {
                    matrixActionRoll.matrixActionDescription = "shadowrun6.matrix.no_target";
                    return;
                }
                const accessLevel = defender.yourMatrixAccessLevel({ initiator: initiator, limitedViewOverride: true });
                if (accessLevel !== "outsider") return;

                const immediateAdmin = await foundry.applications.api.DialogV2.confirm({
                    window: { title: game.i18n.localize("shadowrun6.matrixaction.brute_force.name") },
                    content: game.i18n.localize("shadowrun6.matrixaction.brute_force.onClick"),
                    rejectClose: false,
                    modal: true
                });
                if ( immediateAdmin ) {
                    console.info("SR6E | brute_force | Initiator chose to Brute Force to ADMIN access level | Defender gets +4 Defense Rating");
                    matrixActionRoll.matrixActionDescription = "shadowrun6.matrixaction.brute_force.to_admin";
                    matrixActionRoll.defenseRating += 4;
                    matrixActionRoll.matrixActionOption = "brute_force_admin";
                } else {
                    console.info("SR6E | brute_force | Initiator chose to Brute Force to USER access level");
                }
            },

            async onDefenseRoll(defenseRoll) {
                if (defenseRoll.matrixActionOption === "brute_force_admin") {
                    console.info("SR6E | brute_force | Initiator chose to Brute Force to ADMIN access level | Defender gets +2 Firewall as a Bonus Dice Modifier", defenseRoll);
                    defenseRoll.matrixActionDescription = "shadowrun6.matrixaction.brute_force.to_admin";
                    defenseRoll.modifier = (defenseRoll.modifier || 0) + 2;
                }
            },
            
            async onFailedDefense(resultData) {
                console.log("SR6 | brute_force | onFailedDefense", resultData);
                const { initiator, defender, hits, netHits } = resultData;
                const safeUuid = initiator.uuid.replaceAll(".", "_");
                const accessLevel = defender.yourMatrixAccessLevel({ initiator: initiator, limitedViewOverride: true });

                if (resultData.matrixActionOption === "brute_force_admin" || accessLevel === "user") {
                    return await defender.setFlag("shadowrun6-eden", `matrix-access.${safeUuid}`, "admin")
                } else {
                    return await defender.setFlag("shadowrun6-eden", `matrix-access.${safeUuid}`, "user")
                }
            },

        },
        change_icon: {
            id: "change_icon",
            skill: null,
            specialization: null,
            attrib: null,
            illegal: false,
            major: false,
            outsider: false,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["persona", "device"]
        },
        check_os: {
            id: "check_os",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 4,
            _onSuccess: { showOs: true },
            targets: ["yourself"]
        },
        control_device: {
            id: "control_device",
            skill: "electronics",
            specialization: "software",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        crack_file: {
            id: "crack_file",
            skill: "cracking",
            specialization: "hacking",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["device", "file"]
        },
        crash_program: {
            id: "crash_program",
            skill: "cracking",
            specialization: "cybercombat",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: "d",
            attr2: "dr",
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { crashProgram: true },
            targets: ["device"]
        },
        data_spike: {
            id: "data_spike",
            skill: "cracking",
            specialization: "cybercombat",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "d",
            attr2: "f",
            linkedAttr: "a",
            threshold: 0,
            _onSuccess: { damage: "Math.ceil({a}/2)" },
            targets: ["persona", "device"],

            getDamage: function (actor) {
                const damage = Math.ceil(actor.getMatrixPool("a") / 2);
                return damage;
            }

        },
        disarm_data_bomb: {
            id: "disarm_data_bomb",
            skill: "cracking",
            specialization: "cybercombat",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: "dr",
            attr2: "dr",
            linkedAttr: null,
            threshold: 0,
            targets: ["device", "file"]
        },
        edit_file: {
            id: "edit_file",
            skill: "electronics",
            specialization: "computer",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: "int",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device", "file"]
        },
        encrypt_file: {
            id: "encrypt_file",
            skill: "electronics",
            specialization: "computer",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["device", "file"]
        },
        enter_host: {
            id: "enter_host",
            skill: null,
            specialization: null,
            attrib: null,
            illegal: false,
            major: false,
            outsider: true,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["host"]
        },
        erase_matrix_signature: {
            id: "erase_matrix_signature",
            skill: "electronics",
            specialization: "computer",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["techno", "sprite"]
        },
        format_device: {
            id: "format_device",
            skill: "electronics",
            specialization: "software",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        full_matrix_defense: {
            id: "full_matrix_defense",
            skill: null,
            specialization: null,
            attrib: null,
            illegal: false,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { fullMatrixDefense: true },
            targets: ["yourself"]
        },
        hash_check: {
            id: "hash_check",
            skill: "electronics",
            specialization: "computer",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["device", "file"]
        },
        hide: {
            id: "hide",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "int",
            illegal: true,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "int",
            attr2: "d",
            linkedAttr: null,
            threshold: 0,
            targets: ["persona"]
        },
        jack_out: {
            id: "jack_out",
            skill: "electronics",
            specialization: "software",
            attrib: "wil",
            illegal: false,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "cha",
            attr2: "d",
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { jackOut: true },
            targets: ["yourself"],

            async onMatrixActionRoll(matrixActionRoll) {
                matrixActionRoll.matrixActionDescription = "shadowrun6.matrixaction.jack_out.link_locked";
                matrixActionRoll.matrixTargetName = matrixActionRoll.actor.name;    // Initiators name
             },

            // Only rolled optionally if the Initiator was link-locked
            async onDefenseRoll(defenseRoll) {
                defenseRoll.matrixActionDescription = "shadowrun6.matrixaction.jack_out.lock_link";
                defenseRoll.matrixTargetName = defenseRoll.actor.name;    // Defenders name
                defenseRoll.noMatrixResultButton = true;
            },

            // Initial Matrix Test by Initiator
            async onSuccess(resultData) {
                console.log("SR6 | jack_out | onSuccess", resultData);
                const { initiator, defender, hits, netHits } = resultData;
                await game.sr6.utils.resetAccessLevels( initiator.uuid );
                const matrixIni = initiator.system.matrixIni;
                if (matrixIni !== "ar") {
                    // Dumpshock
                    const damageData = {
                        soakType: SoakType.BIO_FEEDBACK,
                        monitor: matrixIni === "vrcold" ? MonitorType.STUN : MonitorType.PHYSICAL,
                        damage: 3
                    }
                    const directDamage = new DirectDamage(initiator, damageData);
                    await directDamage.toChat();
                }
                return true;
            },
            
            async onSuccesfulDefense(resultData) {
                // Only here to trigger the <span> message
            },
            async onFailedDefense(resultData) {
                // Only here to trigger the <span> message
            },

        },
        jam_signals: {
            id: "jam_signals",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        jump_rigged: {
            id: "jump_rigged",
            skill: "electronics",
            specialization: "software",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        matrix_perception: {
            id: "matrix_perception",
            skill: "electronics",
            specialization: "computer",
            attrib: "int",
            illegal: false,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "s",
            linkedAttr: null,
            threshold: 0,
            targets: ["persona", "device", "host", "file", "sprite"]
        },
        matrix_search: {
            id: "matrix_search",
            skill: "electronics",
            specialization: "computer",
            attrib: "int",
            illegal: false,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["yourself"]
        },
        probe: {
            id: "probe",
            skill: "cracking",
            specialization: "hacking",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: "s",
            threshold: 0,
            _onSuccess: { action: "backdoor_entry" },
            targets: ["host", "device", "living_network"]
        },
        reboot_device: {
            id: "reboot_device",
            skill: "electronics",
            specialization: "software",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: "log",
            attr2: "wil",
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { rebootDevice: true },
            targets: ["device", "persona"],
            
            async onMatrixActionRoll(matrixActionRoll) {
                matrixActionRoll.matrixActionDescription = "shadowrun6.matrixaction.reboot_device.forced_to_reboot";
                matrixActionRoll.matrixTargetName = matrixActionRoll.actor.name;    // Initiators name
             },

            // Only rolled optionally if the Initiator was link-locked
            async onDefenseRoll(defenseRoll) {
                defenseRoll.matrixTargetName = defenseRoll.actor.name;    // Defenders name
                if (!defenseRoll.matrixTargetUuid) defenseRoll.matrixTargetUuid = defenseRoll.actor.uuid;
            },

            // This button is used if you Reboot Device yourself
            async onSuccess(resultData) {
                console.log("SR6 | reboot_device | onSuccess", resultData);
                const { initiator, defender, hits, netHits } = resultData;
                await game.sr6.utils.resetAccessLevels( initiator.uuid );
                // TODO add reboot devices
                return true;
            },
            
            // This button is used if someone else forces you to Reboot Device
            async onFailedDefense(resultData) {
                console.log("SR6 | reboot_device | onFailedDefense", resultData);
                const { initiator, defender, hits, netHits } = resultData;
                await game.sr6.utils.resetAccessLevels( defender.uuid );
                // TODO add reboot devices
                return true;
            },

        },
        reconfigure: {
            id: "reconfigure",
            skill: null,
            specialization: null,
            attrib: null,
            illegal: false,
            major: false,
            outsider: false,
            user: false,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["yourself"]
        },
        // Added by the Official FAQ
        relinquish_access: {
            id: "relinquish_access",
            skill: "electronics",
            specialization: "software",
            attrib: null,
            illegal: false,
            major: false,
            outsider: false,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["host", "device", "living_network"],

            async relinquishAccess(resultData) {
                console.log("SR6 | relinquish_access", resultData);
                const { initiator, defender } = resultData;
                const initiatorSafeUuid = initiator.uuid.replaceAll(".", "_");
                await defender.setFlag(
                    "shadowrun6-eden",
                    `matrix-access.${initiatorSafeUuid}`,
                    "outsider"
                );
                return true;
            },

            // Initial Matrix Test by Initiator
            async onSuccess(resultData) {
                return this.relinquishAccess(resultData);
            },
            // Initial Matrix Test by Initiator > same result even if failed
            async onFailure(resultData) {
                return this.relinquishAccess(resultData);
            },

        },
        send_message: {
            id: "send_message",
            skill: null,
            specialization: null,
            attrib: null,
            illegal: false,
            major: false,
            outsider: true,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["yourself"]
        },
        set_data_bomb: {
            id: "set_data_bomb",
            skill: "electronics",
            specialization: "software",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: "dr",
            attr2: "dr",
            linkedAttr: null,
            threshold: 0,
            targets: ["file"]
        },
        snoop: {
            id: "snoop",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: "d",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device", "persona"]
        },
        spoof_command: {
            id: "spoof_command",
            skill: "cracking",
            specialization: "hacking",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "d",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        switch_ifmode: {
            id: "switch_ifmode",
            skill: null,
            specialization: null,
            attrib: null,
            illegal: false,
            major: false,
            outsider: false,
            user: false,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["yourself"]
        },
        tarpit: {
            id: "tarpit",
            skill: "cracking",
            specialization: "cybercombat",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "d",
            attr2: "f",
            linkedAttr: "a",
            threshold: 0,
            _onSuccess: { tarpit: true, damage: 1 },
            targets: ["persona", "device", "ic", "sprite"],
            
            getDamage: function (actor) {
                const damage = 1;
                return damage;
            }

        },
        trace_icon: {
            id: "trace_icon",
            skill: "electronics",
            specialization: "software",
            attrib: "int",
            illegal: true,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: "wil",
            attr2: "s",
            linkedAttr: null,
            threshold: 0,
            targets: ["persona", "device", "physical"]
        }
    };
    // TODO add Matrix Edge Actions (HS p.31)
    MATRIX_ACTIONS_HS = {
        calibration: {
            id: "calibration",
            skill: "electronics",
            specialization: "computer",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { calibration: true },
            targets: ["yourself"]
        },
        delayed_command: {
            id: "delayed_command",
            skill: "cracking",
            specialization: "hacking",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "d",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        denial_of_service: {
            id: "denial_of_service",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: game.settings.get(SYSTEM_NAME, "dosPopupMatrix"),
            admin: game.settings.get(SYSTEM_NAME, "dosPopupMatrix"),
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { denialOfService: true },
            targets: ["persona", "device"]
        },
        device_lock: {
            id: "device_lock",
            skill: "cracking",
            specialization: "cybercombat",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { deviceLock: true },
            targets: ["device"]
        },
        garbage_in_out: {
            id: "garbage_in_out",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        known_exploit: {
            id: "known_exploit",
            skill: "cracking",
            specialization: "hacking",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: false,
            admin: false,
            attr1: "wil",
            attr2: "f",
            linkedAttr: "s",
            threshold: 0,
            targets: ["host", "device", "living_network"],

            async onMatrixActionRoll(matrixActionRoll) {
                matrixActionRoll.matrixActionDescription = "shadowrun6.roll.edge.noEdgeUse";
                matrixActionRoll.noEdgeGain = true;
                matrixActionRoll.noEdgeSpend = true;
                matrixActionRoll.matrixActionOption = "known_exploit";
            },
            
            async onDefenseRoll(defenseRoll) {
                defenseRoll.matrixActionDescription = "shadowrun6.roll.edge.tempEdge";
                defenseRoll.tempEdge = true;
            },
            
            async onFailedDefense(resultData) {
                console.log("SR6 | known_exploit | onFailedDefense", resultData);
                const { initiator, defender, hits, netHits } = resultData;
                const safeUuid = initiator.uuid.replaceAll(".", "_");
                return await defender.setFlag("shadowrun6-eden", `matrix-access.${safeUuid}`, "admin")
            },

        },
        masquerade: {
            id: "masquerade",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: false,
            admin: false,
            attr1: "int",
            attr2: "d",
            linkedAttr: null,
            threshold: 0,
            targets: ["persona"]
        },
        metahuman_middle: {
            id: "metahuman_middle",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: false,
            admin: false,
            attr1: "int",
            attr2: "d",
            linkedAttr: null,
            threshold: 0,
            targets: ["yourself"]
        },
        modify_icon: {
            id: "modify_icon",
            skill: "electronics",
            specialization: "software",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: "int",
            attr2: "d",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        pop_up: {
            id: "pop_up",
            skill: "cracking",
            specialization: "cybercombat",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: true,
            user: game.settings.get(SYSTEM_NAME, "dosPopupMatrix"),
            admin: game.settings.get(SYSTEM_NAME, "dosPopupMatrix"),
            attr1: "int",
            attr2: "d",
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { popUp: true },
            targets: ["device", "persona"]
        },
        squelch: {
            id: "squelch",
            skill: "electronics",
            specialization: "software",
            attrib: "log",
            illegal: true,
            major: false,
            outsider: true,
            user: false,
            admin: false,
            attr1: "int",
            attr2: "s",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        subvert_infrastructure: {
            id: "subvert_infrastructure",
            skill: "electronics",
            specialization: "software",
            attrib: "log",
            illegal: true,
            major: true,
            outsider: false,
            user: false,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device"]
        },
        threat_analysis: {
            id: "threat_analysis",
            skill: "electronics",
            specialization: "computer",
            attrib: "log",
            illegal: false,
            major: true,
            outsider: true,
            user: true,
            admin: true,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            _onSuccess: { threatAnalysis: true },
            targets: ["yourself"]
        },
        virtual_aim: {
            id: "virtual_aim",
            skill: null,
            specialization: null,
            attrib: null,
            illegal: false,
            major: false,
            outsider: true,
            user: false,
            admin: false,
            attr1: null,
            attr2: null,
            linkedAttr: null,
            threshold: 0,
            targets: ["yourself"]
        },
        watchdog: {
            id: "watchdog",
            skill: "cracking",
            specialization: "electronic_warfare",
            attrib: "log",
            illegal: true,
            major: false,
            outsider: false,
            user: true,
            admin: true,
            attr1: "wil",
            attr2: "f",
            linkedAttr: null,
            threshold: 0,
            targets: ["device", "persona"]
        },
    };
    COMPLEX_FORMS = {
        list: {
            cleaner: new ComplexForm(
                "electronics",
                "complex_forms",
                null,
                null,
            ),
            diffusion: new ComplexForm(
                "electronics",
                "complex_forms",
                "wil",
                "f",
            ),
            editor: new ComplexForm(null, null, null),
            emulate: new ComplexForm(null, null, null),
            infusion: new ComplexForm(
                "electronics",
                "complex_forms",
                null,
                null,
                4,
            ),
            mirrored_persona: new ComplexForm(
                "electronics",
                "complex_forms",
                null,
                null,
            ),
            pulse_storm: new ComplexForm(
                "electronics",
                "complex_forms",
                "log",
                "d",
            ),
            puppeteer: new ComplexForm(null, null, null),
            resonance_channel: new ComplexForm(
                "electronics",
                "complex_forms",
                null,
                null,
            ),
            resonance_spike: new ComplexForm(
                "cracking",
                "cybercombat",
                "wil",
                "f",
            ),
            resonance_veil: new ComplexForm(
                "electronics",
                "complex_forms",
                "int",
                "d",
            ),
            static_bomb: new ComplexForm(
                "electronics",
                "complex_forms",
                "int",
                "d",
            ),
            static_veil: new ComplexForm(
                "electronics",
                "complex_forms",
                "f",
                "f",
            ),
            stitches: new ComplexForm(
                "electronics",
                "complex_forms",
                null,
                null,
            ),
            tattletale: new ComplexForm(
                "electronics",
                "complex_forms",
                null,
                null,
            ),
        },
        skills: {
            cracking: "skill.cracking",
            electronics: "skill.electronics",
        },
        spec: {
            cybercombat:
                "shadowrun6.special.electronics.complex_forms.cybercombat",
            complex_forms: "shadowrun6.special.electronics.complex_forms",
        },
        attributes: {
            a: "shadowrun6.label.attack.long",
            s: "shadowrun6.label.sleaze.long",
            d: "shadowrun6.label.dataproc.long",
            f: "shadowrun6.label.firewall.long",
            wil: "attrib.wil",
            log: "attrib.log",
            int: "attrib.int",
            bod: "attrib.bod",
            essence: "attrib.ess",
            rating: "SR6.Common.FIELDS.rating.label",
        },
    };
    SPRITE_POWERS = {
        skills: {
            con: "skill.con",
            cracking: "skill.cracking",
            electronics: "skill.electronics",
        },
    };

    PROGRAMS = [
        // Legal
        new Program("browse", 0),
        new Program("baby_monitor", 0),
        new Program("configurator", 0),
        new Program("edit", 0),
        new Program("encryption", 0),
        new Program("signal_scrubber", 0),
        new Program("toolbox", 0),
        new Program("virtual_machine", 0),
        // Hacking
        new Program("armor", 1),
        new Program("biofeedback", 1),
        new Program("biofeedback_filter", 1),
        new Program("blackout", 1),
        new Program("decryption", 1),
        new Program("defuse", 1),
        new Program("exploit", 1),
        new Program("fork", 1),
        new Program("lockdown", 1),
        new Program("overclock", 1),
        new Program("stealth", 1),
        new Program("trace", 1),
    ];
    LIFESTYLE_TYPE = {
        street: "shadowrun6.lifestyle.street",
        squatter: "shadowrun6.lifestyle.squatter",
        low: "shadowrun6.lifestyle.low",
        middle: "shadowrun6.lifestyle.middle",
        high: "shadowrun6.lifestyle.high",
        luxury: "shadowrun6.lifestyle.luxury",
    };
    SIN_QUALITY = {
        REAL_SIN: "shadowrun6.sin.real_sin",
        ANYONE: "shadowrun6.sin.anyone",
        ROUGH_MATCH: "shadowrun6.sin.rough_match",
        GOOD_MATCH: "shadowrun6.sin.good_match",
        SUPERFICIALLY_PLAUSIBLE: "shadowrun6.sin.superficially_plausible",
        HIGHLY_PLAUSIBLE: "shadowrun6.sin.highly_plausible",
        SECOND_LIFE: "shadowrun6.sin.second_life",
    };
    EXTENDED_INTERVALS = {
        round: "shadowrun6.dice.extended.intervalScale.round_short",
        minute: "shadowrun6.dice.extended.intervalScale.minute_short",
        hour: "shadowrun6.dice.extended.intervalScale.hour_short",
        day: "shadowrun6.dice.extended.intervalScale.day_short",
        week: "shadowrun6.dice.extended.intervalScale.week_short",
        month: "shadowrun6.dice.extended.intervalScale.month_short",
    };
    AMMO_TYPES = {
        regular: "shadowrun6.ammotypes.regular",
        apds: "shadowrun6.ammotypes.apds",
        explosive: "shadowrun6.ammotypes.explosive",
        flechette: "shadowrun6.ammotypes.flechette",
        gel: "shadowrun6.ammotypes.gel",
        sticknshock: "shadowrun6.ammotypes.sticknshock",
    };
    // TODO: Add modification cap of 4
    // TODO: Add defensepool.xx.pool to Actor so you can override
    // TODO: Add system.walk and system.sprint to actorsheet
    // TODO: Add skills.xx.pool to Actor._prepareSkills so you can override
    // TODO: Allow multipliers with Rating
    // TODO: extend ActiveEffect class and add the Change Mode option for "Add if not 0", for AR increases
    // TODO: Add equip/unequip option to gear tab & effects tab in actorsheet
    // TODO: Add Wild die option for actors (always) and items (when using the item)
    // TODO: Add Concealability threshold to gear
    // TODO: Add items on items
    ACTIVE_EFFECT_OPTIONS = {
        // ----------- Most used Actor Effects ----------- //
        system_attributes_bod_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.bod") },
        ),
        system_attributes_agi_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.agi") },
        ),
        system_attributes_rea_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.rea") },
        ),
        system_attributes_str_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.str") },
        ),
        system_attributes_wil_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.wil") },
        ),
        system_attributes_log_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.log") },
        ),
        system_attributes_int_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.int") },
        ),
        system_attributes_cha_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.cha") },
        ),
        system_attributes_mag_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.mag") },
        ),
        system_attributes_res_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.res") },
        ),
        system_attributes_essence_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.ess") },
        ),
        system_edge_max:
            game.i18n.localize("attrib.edg") +
            " " +
            game.i18n.localize("shadowrun6.label.attribute"), // TODO: move system.edge to system.attributes.edge

        // ----------- Weapon Mods ----------- //
        system_attackRating_0:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.label.attack_rating") +
            " (" +
            game.i18n.localize("shadowrun6.roll.ar_0") +
            ")",
        system_attackRating_1:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.label.attack_rating") +
            " (" +
            game.i18n.localize("shadowrun6.roll.ar_1") +
            ")",
        system_attackRating_2:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.label.attack_rating") +
            " (" +
            game.i18n.localize("shadowrun6.roll.ar_2") +
            ")",
        system_attackRating_3:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.label.attack_rating") +
            " (" +
            game.i18n.localize("shadowrun6.roll.ar_3") +
            ")",
        system_attackRating_4:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.label.attack_rating") +
            " (" +
            game.i18n.localize("shadowrun6.roll.ar_4") +
            ")",

        system_modes_SA__ar__mod:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.format("shadowrun6.active_effect.Modifier", {
                attribute: game.i18n.localize(
                    "shadowrun6.label.attack_rating_short",
                ),
            }) +
            " (" +
            game.i18n.localize("shadowrun6.item.mode_sa") +
            ")",
        // system_modes_SA__dmg__mod: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.localize("shadowrun6.label.damage_short")+" "+game.i18n.localize("shadowrun6.active_effect.Modifier")+" ("+game.i18n.localize("shadowrun6.item.mode_sa")+")",
        system_modes_BF__ar__mod:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.format("shadowrun6.active_effect.Modifier", {
                attribute: game.i18n.localize(
                    "shadowrun6.label.attack_rating_short",
                ),
            }) +
            " (" +
            game.i18n.localize("shadowrun6.item.mode_bf") +
            ")",
        system_modes_FA__ar__mod:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.format("shadowrun6.active_effect.Modifier", {
                attribute: game.i18n.localize(
                    "shadowrun6.label.attack_rating_short",
                ),
            }) +
            " (" +
            game.i18n.localize("shadowrun6.item.mode_fa") +
            ")",
        system_dmg:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.format("shadowrun6.active_effect.Modifier", {
                attribute: game.i18n.localize("shadowrun6.label.damage_short"),
            }),
        system_stun:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.active_effect.stunOrPhysical"),
        system_modes_dicePoolMod:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.active_effect.dicePoolMod"),
        system_wild:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.active_effect.wild"),
        system_ammocap:
            game.i18n.localize("shadowrun6.active_effect.weapon.mod") +
            " " +
            game.i18n.localize("shadowrun6.weapon.ammo_cap"),

        // ----------- Armor Mods ----------- //
        system_defense:
            game.i18n.localize("shadowrun6.active_effect.armor.mod") +
            " " +
            game.i18n.format("shadowrun6.active_effect.Modifier", {
                attribute: game.i18n.localize("attrib.dr"),
            }),
        system_social:
            game.i18n.localize("shadowrun6.active_effect.armor.mod") +
            " " +
            game.i18n.format("shadowrun6.active_effect.Modifier", {
                attribute: game.i18n.localize("shadowrun6.item.social_rating"),
            }),

        // ----------- Less used Actor Effects ----------- //
        system_dicePoolMod: game.i18n.format(
            "shadowrun6.active_effect.dicePoolMod",
        ),
        system_badLuck: game.i18n.format("shadowrun6.active_effect.badLuck"),
        system_painTolerance: game.i18n.format(
            "shadowrun6.active_effect.painTolerance",
        ),
        traits_movementRate: game.i18n.format(
            "shadowrun6.active_effect.movementRate",
        ),
        traits_movementSprintBase: game.i18n.format(
            "shadowrun6.active_effect.movementSprintBase",
        ),
        traits_movementSprintMultiplier: game.i18n.format(
            "shadowrun6.active_effect.movementSprintMultiplier",
        ),
        traits_hardenedArmor: game.i18n.format(
            "shadowrun6.active_effect.hardenedArmor",
        ),
        traits_immunityNormalWeapons: game.i18n.format(
            "shadowrun6.active_effect.immunityNormalWeapons",
        ),

        system_physical_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.monitor.physical_monitor",
                ),
            },
        ),
        system_stun_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {
            attribute: game.i18n.localize("shadowrun6.monitor.stun_monitor"),
        }),
        system_overflow_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.monitor.overflow_monitor",
                ),
            },
        ),

        system_attackrating_physical_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.attack_rating.physical",
                ),
            },
        ),
        system_attackrating_astral_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.attack_rating.astral",
                ),
            },
        ), // Magic AR
        system_attackrating_matrix_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.attack_rating.matrix",
                ),
            },
        ),
        // system_attackrating_social_mod: "shadowrun6.active_effect.attackrating.social.mod",          // TODO: Social AR not yet implemented
        // system_attackrating_vehicle_mod: "shadowrun6.active_effect.attackrating.vehicle.mod",        // TODO: Vehicle AR not yet implemented

        system_defenserating_physical_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.defense_rating.physical",
                ),
            },
        ), // TODO: Add defenserating.xx.pool to Actor so you can override
        system_defenserating_astral_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.defense_rating.astral",
                ),
            },
        ), // Magic DR
        system_defenserating_matrix_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.defense_rating.matrix",
                ),
            },
        ),
        // system_defenserating_social_mod: "shadowrun6.active_effect.defenserating.social.mod",        // TODO: Social DR not yet implemented
        // system_defenserating_vehicle_mod: "shadowrun6.active_effect.defenserating.vehicle.mod",      // TODO: Vehicle DR not yet implemented

        system_defensepool_physical_mod:
            "shadowrun6.active_effect.defensepool.physical.mod",
        system_defensepool_astral_mod:
            "shadowrun6.active_effect.defensepool.astral.mod", // Magic defense pool
        system_defensepool_spells__direct_mod:
            "shadowrun6.active_effect.defensepool.spells_direct.mod",
        system_defensepool_spells__indirect_mod:
            "shadowrun6.active_effect.defensepool.spells_indirect.mod",
        system_defensepool_toxin_mod:
            "shadowrun6.active_effect.defensepool.toxin.mod",
        system_defensepool_damage__physical_mod:
            "shadowrun6.active_effect.defensepool.damage_physical.mod",
        system_defensepool_damage__astral_mod:
            "shadowrun6.active_effect.defensepool.damage_astral.mod",
        system_defensepool_drain_mod:
            "shadowrun6.active_effect.defensepool.drain.mod",
        system_defensepool_fading_mod:
            "shadowrun6.active_effect.defensepool.fading.mod",
        // system_defensepool_vehicle_mod: "shadowrun6.active_effect.defensepool.vehicle.mod",      // TODO: Vehicle def pool not yet implemented

        system_derived_composure_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("shadowrun6.derived.composure") },
        ),
        system_derived_judge__intentions_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.derived.judge_intentions",
                ),
            },
        ),
        system_derived_memory_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("shadowrun6.derived.memory") },
        ),
        system_derived_lift__carry_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("shadowrun6.derived.lift_carry") },
        ),
        system_derived_matrix__perception_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.localize(
                    "shadowrun6.derived.matrix_perception",
                ),
            },
        ),

        system_initiative_physical_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.ini") },
        ),
        system_initiative_physical_diceMod:
            "shadowrun6.active_effect.initiative.physical.diceMod",
        system_initiative_astral_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.inia") },
        ),
        system_initiative_astral_diceMod:
            "shadowrun6.active_effect.initiative.astral.diceMod",
        system_initiative_matrix_mod: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            { attribute: game.i18n.localize("attrib.inim") },
        ),
        system_initiative_matrix_diceMod:
            "shadowrun6.active_effect.initiative.matrix.diceMod",

        system_skills_astral_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.astral"),
                }),
            },
        ),
        system_skills_athletics_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.athletics"),
                }),
            },
        ),
        system_skills_biotech_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.biotech"),
                }),
            },
        ),
        system_skills_close__combat_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.close_combat"),
                }),
            },
        ),
        system_skills_con_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.con"),
                }),
            },
        ),
        system_skills_conjuring_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.conjuring"),
                }),
            },
        ),
        system_skills_cracking_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.cracking"),
                }),
            },
        ),
        system_skills_electronics_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.electronics"),
                }),
            },
        ),
        system_skills_enchanting_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.enchanting"),
                }),
            },
        ),
        system_skills_engineering_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.engineering"),
                }),
            },
        ),
        system_skills_exotic__weapons_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.exotic_weapons"),
                }),
            },
        ),
        system_skills_firearms_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.firearms"),
                }),
            },
        ),
        system_skills_influence_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.influence"),
                }),
            },
        ),
        system_skills_outdoors_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.outdoors"),
                }),
            },
        ),
        system_skills_perception_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.perception"),
                }),
            },
        ),
        system_skills_piloting_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.piloting"),
                }),
            },
        ),
        system_skills_sorcery_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.sorcery"),
                }),
            },
        ),
        system_skills_stealth_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.stealth"),
                }),
            },
        ),
        system_skills_tasking_modifier: game.i18n.format(
            "shadowrun6.active_effect.Modifier",
            {
                attribute: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.tasking"),
                }),
            },
        ),

        system_attributes_agi_pool: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            { pool: game.i18n.localize("attrib.agi") },
        ),
        system_attributes_str_pool: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            { pool: game.i18n.localize("attrib.str") },
        ),

        system_skills_astral_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.astral"),
                }),
            },
        ),
        system_skills_athletics_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.athletics"),
                }),
            },
        ),
        system_skills_biotech_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.biotech"),
                }),
            },
        ),
        system_skills_close__combat_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.close_combat"),
                }),
            },
        ),
        system_skills_con_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.con"),
                }),
            },
        ),
        system_skills_conjuring_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.conjuring"),
                }),
            },
        ),
        system_skills_cracking_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.cracking"),
                }),
            },
        ),
        system_skills_electronics_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.electronics"),
                }),
            },
        ),
        system_skills_enchanting_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.enchanting"),
                }),
            },
        ),
        system_skills_engineering_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.engineering"),
                }),
            },
        ),
        system_skills_exotic__weapons_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.exotic_weapons"),
                }),
            },
        ),
        system_skills_firearms_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.firearms"),
                }),
            },
        ),
        system_skills_influence_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.influence"),
                }),
            },
        ),
        system_skills_outdoors_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.outdoors"),
                }),
            },
        ),
        system_skills_perception_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.perception"),
                }),
            },
        ),
        system_skills_piloting_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.piloting"),
                }),
            },
        ),
        system_skills_sorcery_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.sorcery"),
                }),
            },
        ),
        system_skills_stealth_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.stealth"),
                }),
            },
        ),
        system_skills_tasking_points: game.i18n.format(
            "shadowrun6.active_effect.Pool",
            {
                pool: game.i18n.format("shadowrun6.active_effect.Skill", {
                    skill: game.i18n.localize("skill.tasking"),
                }),
            },
        ),
    };

    EFFECT_CONVERSION_TOV2 = {
        "system.attributes.bod.mod": "system.attributes.body.mod",
        "system.attributes.agi.mod": "system.attributes.agility.mod",
        "system.attributes.rea.mod": "system.attributes.reaction.mod",
        "system.attributes.str.mod": "system.attributes.strength.mod",
        "system.attributes.wil.mod": "system.attributes.willpower.mod",
        "system.attributes.log.mod": "system.attributes.logic.mod",
        "system.attributes.int.mod": "system.attributes.intuition.mod",
        "system.attributes.cha.mod": "system.attributes.charisma.mod",
        "system.attributes.mag.mod": "system.attributes.magic.mod",
        "system.attributes.res.mod": "system.attributes.resonance.mod",
        "system.attributes.essence.mod": "system.attributes.essence.mod",
        "system.edge.max": "system.edge.mod",

        // 'system.attackRating.0': 'system.attackRating.0',
        // 'system.attackRating.1': 'system.attackRating.1',
        // 'system.attackRating.2': 'system.attackRating.2',
        // 'system.attackRating.3': 'system.attackRating.3',
        // 'system.attackRating.4': 'system.attackRating.4',

        // 'system.modes.SA_ar_mod': 'system.modes.SA_ar_mod',
        // 'system.modes.BF_ar_mod': 'system.modes.BF_ar_mod',
        // 'system.modes.FA_ar_mod': 'system.modes.FA_ar_mod',
        // 'system.dmg': 'system.dmg',
        // 'system.stun': 'system.stun',
        // 'system.modes.dicePoolMod': 'system.modes.dicePoolMod',
        // 'system.wild': 'system.wild',
        // 'system.ammocap': 'system.ammocap',

        // 'system.defense': 'system.defense',
        // 'system.social': 'system.social',

        // 'system.dicePoolMod': 'system.dicePoolMod',
        // 'system.badLuck': 'system.badLuck',
        // 'system.painTolerance': 'system.painTolerance',
        // 'traits.movementRate': 'traits.movementRate',
        // 'traits.movementSprintBase': 'traits.movementSprintBase',
        // 'traits.movementSprintMultiplier': 'traits.movementSprintMultiplier',
        // 'traits.hardenedArmor': 'traits.hardenedArmor',
        // 'traits.immunityNormalWeapons': 'traits.immunityNormalWeapons',

        "system.physical.mod": "system.physical.mod",
        "system.stun.mod": "system.stun.mod",
        "system.overflow.mod": "system.overflow.mod",

        // 'system.attackrating.physical.mod': 'system.attackRating.physical.mod',
        // 'system.attackrating.astral.mod': 'system.attackRating.astral.mod',
        "system.attackrating.matrix.mod": "system.matrix.attackRating",

        // 'system.defenserating.physical.mod': 'system.defenseRating.physical.mod',
        // 'system.defenserating.astral.mod': 'system.defenseRating.astral.mod',
        "system.defenserating.matrix.mod": "system.matrix.defenseRating",

        // 'system.defensepool.physical.mod': 'system.defensePool.physical.mod',
        // 'system.defensepool.astral.mod': 'system.defensePool.astral.mod',
        // 'system.defensepool.spells_direct.mod': 'system.defensePool.spells_direct.mod',
        // 'system.defensepool.spells_indirect.mod': 'system.defensePool.spells_indirect.mod',
        // 'system.defensepool.toxin.mod': 'system.defensePool.toxin.mod',
        // 'system.defensepool.damage_physical.mod': 'system.defensePool.damage_physical.mod',
        // 'system.defensepool.damage_astral.mod': 'system.defensePool.damage_astral.mod',
        // 'system.defensepool.drain.mod': 'system.defensePool.drain.mod',
        // 'system.defensepool.fading.mod': 'system.defensePool.fading.mod',

        // 'system.derived.composure.mod': 'system.derived.composure.mod',
        // 'system.derived.judge_intentions.mod': 'system.derived.judge_intentions.mod',
        // 'system.derived.memory.mod': 'system.derived.memory.mod',
        // 'system.derived.lift_carry.mod': 'system.derived.lift_carry.mod',
        // 'system.derived.matrix_perception.mod': 'system.derived.matrix_perception.mod',

        "system.initiative.physical.mod": "system.initiative.physical.rank",
        "system.initiative.physical.diceMod": "system.initiative.physical.dice",
        "system.initiative.astral.mod": "system.initiative.astral.rank",
        "system.initiative.astral.diceMod": "system.initiative.astral.dice",
        "system.initiative.matrix.mod": "system.initiative.matrix.rank",
        "system.initiative.matrix.diceMod": "system.initiative.matrix.dice",

        "system.skills.astral.modifier": "system.skills.astral.mod",
        "system.skills.athletics.modifier": "system.skills.athletics.mod",
        "system.skills.biotech.modifier": "system.skills.biotech.mod",
        "system.skills.close_combat.modifier": "system.skills.close_combat.mod",
        "system.skills.con.modifier": "system.skills.con.mod",
        "system.skills.conjuring.modifier": "system.skills.conjuring.mod",
        "system.skills.cracking.modifier": "system.skills.cracking.mod",
        "system.skills.electronics.modifier": "system.skills.electronics.mod",
        "system.skills.enchanting.modifier": "system.skills.enchanting.mod",
        "system.skills.engineering.modifier": "system.skills.engineering.mod",
        "system.skills.exotic_weapons.modifier":
            "system.skills.exotic_weapons.mod",
        "system.skills.firearms.modifier": "system.skills.firearms.mod",
        "system.skills.influence.modifier": "system.skills.influence.mod",
        "system.skills.outdoors.modifier": "system.skills.outdoors.mod",
        "system.skills.perception.modifier": "system.skills.perception.mod",
        "system.skills.piloting.modifier": "system.skills.piloting.mod",
        "system.skills.sorcery.modifier": "system.skills.sorcery.mod",
        "system.skills.stealth.modifier": "system.skills.stealth.mod",
        "system.skills.tasking.modifier": "system.skills.tasking.mod",

        "system.attributes.agi.pool": "system.attributes.agility.pool",
        "system.attributes.str.pool": "system.attributes.strength.pool",

        "system.skills.astral.points": "system.skills.astral.rank",
        "system.skills.athletics.points": "system.skills.athletics.rank",
        "system.skills.biotech.points": "system.skills.biotech.rank",
        "system.skills.close_combat.points": "system.skills.close_combat.rank",
        "system.skills.con.points": "system.skills.con.rank",
        "system.skills.conjuring.points": "system.skills.conjuring.rank",
        "system.skills.cracking.points": "system.skills.cracking.rank",
        "system.skills.electronics.points": "system.skills.electronics.rank",
        "system.skills.enchanting.points": "system.skills.enchanting.rank",
        "system.skills.engineering.points": "system.skills.engineering.rank",
        "system.skills.exotic_weapons.points":
            "system.skills.exotic_weapons.rank",
        "system.skills.firearms.points": "system.skills.firearms.rank",
        "system.skills.influence.points": "system.skills.influence.rank",
        "system.skills.outdoors.points": "system.skills.outdoors.rank",
        "system.skills.perception.points": "system.skills.perception.rank",
        "system.skills.piloting.points": "system.skills.piloting.rank",
        "system.skills.sorcery.points": "system.skills.sorcery.rank",
        "system.skills.stealth.points": "system.skills.stealth.rank",
        "system.skills.tasking.points": "system.skills.tasking.rank",
    };

    PDF_OPTIONS = {
        BOOKS: {
            astral_ways: "PDF.book.astral_ways",
            bestial_nature: "PDF.book.bestial_nature",
            body_shop: "PDF.book.body_shop",
            collapsing_now: "PDF.book.collapsing_now",
            companion: "PDF.book.companion",
            core: "PDF.book.core",
            core_seattle: "PDF.book.core_seattle",
            core_berlin: "PDF.book.core_berlin",
            de_alpen: "PDF.book.de_alpen",
            de_berlin2080: "PDF.book.de_berlin2080",
            de_bundeswehr: "PDF.book.de_bundeswehr",
            de_feuerlaeufer: "PDF.book.de_feuerlaeufer",
            de_other: "PDF.book.de_other",
            de_piraten: "PDF.book.de_piraten",
            de_revierbericht: "PDF.book.de_revierbericht",
            de_sota2081: "PDF.book.de_sota2081",
            de_sota2082: "PDF.book.de_sota2082",
            de_sota2083: "PDF.book.de_sota2083",
            de_westphalen: "PDF.book.de_westphalen",
            dealers_of_death: "PDF.book.dealers_of_death",
            double_clutch: "PDF.book.double_clutch",
            emerald: "PDF.book.emerald",
            firing_squad: "PDF.book.firing_squad",
            hack_slash: "PDF.book.hack_slash",
            kechibi: "PDF.book.kechibi",
            krime: "PDF.book.krime",
            lofwyr: "PDF.book.lofwyr",
            no_future: "PDF.book.no_future",
            power_plays: "PDF.book.power_plays",
            shadow_cast: "PDF.book.shadow_cast",
            sif_new_orleans: "PDF.book.sif_new_orleans",
            slip_streams: "PDF.book.slip_streams",
            smooth_operations: "PDF.book.smooth_operations",
            street_wyrd: "PDF.book.street_wyrd",
            tarnished_star: "PDF.book.tarnished_star",
        },
        CODES: {
            astral_ways: "PDF.code.astral_ways",
            bestial_nature: "PDF.code.bestial_nature",
            body_shop: "PDF.code.body_shop",
            collapsing_now: "PDF.code.collapsing_now",
            companion: "PDF.code.companion",
            core: "PDF.code.core",
            de_alpen: "PDF.code.de_alpen",
            de_berlin2080: "PDF.code.de_berlin2080",
            de_bundeswehr: "PDF.code.de_bundeswehr",
            de_feuerlaeufer: "PDF.code.de_feuerlaeufer",
            de_other: "PDF.code.de_other",
            de_piraten: "PDF.code.de_piraten",
            de_revierbericht: "PDF.code.de_revierbericht",
            de_sota2081: "PDF.code.de_sota2081",
            de_sota2082: "PDF.code.de_sota2082",
            de_sota2083: "PDF.code.de_sota2083",
            de_westphalen: "PDF.code.de_westphalen",
            dealers_of_death: "PDF.code.dealers_of_death",
            double_clutch: "PDF.code.double_clutch",
            emerald: "PDF.code.emerald",
            firing_squad: "PDF.code.firing_squad",
            hack_slash: "PDF.code.hack_slash",
            kechibi: "PDF.code.kechibi",
            krime: "PDF.code.krime",
            lofwyr: "PDF.code.lofwyr",
            no_future: "PDF.code.no_future",
            power_plays: "PDF.code.power_plays",
            shadow_cast: "PDF.code.shadow_cast",
            sif_new_orleans: "PDF.code.sif_new_orleans",
            slip_streams: "PDF.code.slip_streams",
            smooth_operations: "PDF.code.smooth_operations",
            street_wyrd: "PDF.code.street_wyrd",
            tarnished_star: "PDF.code.tarnished_star",
        },
    };

    icon = {
        // AUTHOR: Richard9394 | LICENSE: Apache License | https://www.svgrepo.com/svg/431315/terminal-box
        terminal: `<i class="sr6-icon sr6-icon-terminal" aria-hidden="true">
                        <svg viewBox="3 3 18 18" xmlns="http://www.w3.org/2000/svg" focusable="false">
                            <path
                            class="sr6-icon-primary"
                            d="m 19,3 c 1.1046,0 2,0.89543 2,2 v 14 c 0,1.1046 -0.8954,2 -2,2 H 5 C 3.89543,21 3,20.1046 3,19 V 5 C 3,3.89543 3.89543,3 5,3 Z m 0,2 H 5 v 14 h 14 z m -2.9999,9.0001 c 0.5523,0 1,0.4477 1,1 0,0.51285 -0.386027,0.935509 -0.883376,0.993273 L 16.0001,16.0001 h -2 c -0.5523,0 -1,-0.4477 -1,-1 0,-0.51285 0.386027,-0.935509 0.883376,-0.993272 L 14.0001,14.0001 Z M 9.05037,8.46459 11.8788,11.293 c 0.3905,0.3905 0.3905,1.0237 0,1.4142 l -2.82843,2.8285 c -0.39052,0.3905 -1.02369,0.3905 -1.41421,0 -0.39053,-0.3906 -0.39053,-1.0237 0,-1.4143 L 9.75748,12.0001 7.63616,9.8788 c -0.39053,-0.39052 -0.39053,-1.02369 0,-1.41421 0.39052,-0.39053 1.02369,-0.39053 1.41421,0 z"
                            />
                        </svg>
                    </i>`,
        // Edited by yeroon | AUTHOR: boxicons | LICENSE: CC Attribution License | https://www.svgrepo.com/svg/334935/terminal
        darkTerminal: `<i class="sr6-icon sr6-icon-darkTerminal" aria-hidden="true">
                            <svg viewBox="0 0 16.05 16.05" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                <path
                                class="sr6-icon-primary"
                                d="M 14.048753,0 H 2.0012469 C 0.89598875,0 0,0.89822872 0,2.00625 v 12.0375 C 0,15.151771 0.89598875,16.05 2.0012469,16.05 H 14.048753 C 15.154011,16.05 16.05,15.151771 16.05,14.04375 V 2.00625 C 16.05,0.89822872 15.154011,0 14.048753,0 Z M 3.2155175,12.163584 1.5606359,10.565166 3.8550655,8.025 1.5606359,5.4848344 3.2155175,3.8864156 6.8648286,8.025 Z M 14.369364,12.0975 H 7.785 V 9.91125 h 6.584364 z"
                                />
                            </svg>
                        </i>`,
        
    };
}