import { EdgeAction, EdgeBoost, MagicOrResonanceDefinition, MatrixAction, Program, SkillDefinition } from "./DefinitionTypes.js";
import { ComplexForm } from "./ItemTypes.js";
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
    Defense["MATRIX"] = "matrix";
})(Defense || (Defense = {}));
export var MonitorType;
(function (MonitorType) {
    MonitorType["PHYSICAL"] = "physical";
    MonitorType["STUN"] = "stun";
    MonitorType["SOCIAL"] = "social";
})(MonitorType || (MonitorType = {}));
export class SR6Config {

    NEW = {
        ATTRIBUTES: [
            'body',
            'agility',
            'reaction',
            'strength',
            'willpower',
            'logic',
            'intuition',
            'charisma',
            'edge',
            'magic',
            'resonance',
            'essence'
        ],
        ACTOR_TYPES: {
            sprite: {
                types: {
                    'courier': 'SR6.Actor.sprite.TYPES.courier',
                    'crack': 'SR6.Actor.sprite.TYPES.crack',
                    'data': 'SR6.Actor.sprite.TYPES.data',
                    'fault': 'SR6.Actor.sprite.TYPES.fault',
                    'machine': 'SR6.Actor.sprite.TYPES.machine',
                    'assassin': 'SR6.Actor.sprite.TYPES.assassin',
                    'defender': 'SR6.Actor.sprite.TYPES.defender',
                    'modular': 'SR6.Actor.sprite.TYPES.modular',
                    'music': 'SR6.Actor.sprite.TYPES.music',
                    'primal': 'SR6.Actor.sprite.TYPES.primal',
                }
            }
        },
        ITEM_TYPES: {
            mod: {
                types: {
                    'accessory_weapon': 'SR6.Item.mod.TYPES.accessory_weapon',
                    'weapon_mod': 'SR6.Item.mod.TYPES.weapon_mod',
                    'armor_mod': 'SR6.Item.mod.TYPES.armor_mod',
                    'accessory_electronics': 'SR6.Item.mod.TYPES.accessory_electronics',
                    'visual_enhancement': 'SR6.Item.mod.TYPES.visual_enhancement',
                    'audio_enhancement': 'SR6.Item.mod.TYPES.audio_enhancement'
                }
            }
        }
    };

    PRIMARY_ATTRIBUTES = ["bod", "agi", "rea", "str", "wil", "log", "int", "cha"];
    SECONDARY_ATTRIBUTES = ["mag", "res", "edg", "ess", "ini", "inim", "inia", "dr"];
    ATTRIBUTES = ["bod", "agi", "rea", "str", "wil", "log", "int", "cha", "mag", "res"];
    ATTRIBUTES_SELECTOPTIONS = {
        "bod": "attrib.bod", 
        "agi": "attrib.agi", 
        "rea": "attrib.rea", 
        "str": "attrib.str", 
        "wil": "attrib.wil", 
        "log": "attrib.log", 
        "int": "attrib.int", 
        "cha": "attrib.cha", 
        "mag": "attrib.mag", 
        "res": "attrib.res"
    };
    NPC_ATTRIBUTES = ["bod", "agi", "rea", "str", "wil", "log", "int", "cha", "mag", "res", "ess"];
    RATING = {1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12"};
    QUALITY_CATEGORIES = {
        ADVANTAGE: "QUALITY_CATEGORIES.ADVANTAGE", 
        DISADVANTAGE: "QUALITY_CATEGORIES.DISADVANTAGE"
    };
    WEAPON_STUN_OPTION = {
        "false": "shadowrun6.item.physical_damage",
        "true": "shadowrun6.item.stun_damage",
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
        WEAPON_SPECIAL: "shadowrun6.itemtype.WEAPON_SPECIAL"
    };
    GEAR_SUBTYPES = {
        ACCESSORY: {
            ACCESSORY: "shadowrun6.gear.subtype.ACCESSORY"
        },
        AMMUNITION: {
            AMMUNITION: "shadowrun6.gear.subtype.AMMUNITION",
            ROCKETS: "shadowrun6.gear.subtype.ROCKETS",
            MISSILES: "shadowrun6.gear.subtype.MISSILES",
            EXPLOSIVES: "shadowrun6.gear.subtype.EXPLOSIVES",
            GRENADES: "shadowrun6.gear.subtype.GRENADES",
            BOWS: "shadowrun6.gear.subtype.BOWS",
            CROSSBOWS: "shadowrun6.gear.subtype.CROSSBOWS",
            BALLISTAS: "shadowrun6.gear.subtype.BALLISTAS"
        },
        ARMOR: {
            ARMOR_BODY: "shadowrun6.gear.subtype.ARMOR_BODY",
            ARMOR_HELMET: "shadowrun6.gear.subtype.ARMOR_HELMET",
            ARMOR_SHIELD: "shadowrun6.gear.subtype.ARMOR_SHIELD",
            ARMOR_SOCIAL: "shadowrun6.gear.subtype.ARMOR_SOCIAL",
            ARMOR_CLOTHES: "shadowrun6.gear.subtype.ARMOR_CLOTHES"
        },
        ARMOR_ADDITION: {},
        BIOLOGY: {
            BIOTECH: "shadowrun6.gear.subtype.BIOTECH",
            SLAP_PATCHES: "shadowrun6.gear.subtype.SLAP_PATCHES"
        },
        BIOWARE: {
            BIOWARE_STANDARD: "shadowrun6.gear.subtype.BIOWARE_STANDARD",
            BIOWARE_CULTURED: "shadowrun6.gear.subtype.BIOWARE_CULTURED",
            BIOWARE_IMPLANT_WEAPON: "shadowrun6.gear.subtype.BIOWARE_IMPLANT_WEAPON", // Key changed in Commlink to BIOWARE_WEAPON
            BIOWARE_DERMAL: "shadowrun6.gear.subtype.BIOWARE_DERMAL",
            BIOSENSE: "shadowrun6.gear.subtype.BIOSENSE",
            SYMBIONTS: "shadowrun6.gear.subtype.SYMBIONT"
        },
        CHEMICALS: {
            INDUSTRIAL_CHEMICALS: "shadowrun6.gear.subtype.INDUSTRIAL_CHEMICALS",
            TOXINS: "shadowrun6.gear.subtype.TOXINS",
            DRUGS: "shadowrun6.gear.subtype.DRUGS",
            BTL: "shadowrun6.gear.subtype.BTL",
            PERFUME: "shadowrun6.gear.subtype.PERFUME",
            ESPIONAGE: "shadowrun6.gear.subtype.ESPIONAGE"
        },
        CYBERWARE: {
            CYBER_HEADWARE: "shadowrun6.gear.subtype.CYBER_HEADWARE",
            CYBERJACK: "shadowrun6.gear.subtype.CYBERJACK",
            CYBER_BODYWARE: "shadowrun6.gear.subtype.CYBER_BODYWARE",
            CYBER_EYEWARE: "shadowrun6.gear.subtype.CYBER_EYEWARE",
            CYBER_EARWARE: "shadowrun6.gear.subtype.CYBER_EARWARE",
            CYBER_IMPLANT_WEAPON: "shadowrun6.gear.subtype.CYBER_IMPLANT_WEAPON",
            CYBER_LIMBS: "shadowrun6.gear.subtype.CYBER_LIMBS",
            COMMLINK: "shadowrun6.gear.subtype.COMMLINK",
            CYBERDECK: "shadowrun6.gear.subtype.CYBERDECK",
            CYBERNETIC_RESTRAINT: "shadowrun6.gear.subtype.CYBERNETIC_RESTRAINT",
            COSMETIC: "shadowrun6.gear.subtype.COSMETIC"
        },
        CODEMODS: {
            ATTRIBUTE_CODEMOD: "shadowrun6.gear.subtype.ATTRIBUTE_CODEMOD",
            CORE_CODEMOD: "shadowrun6.gear.subtype.ATTRIBUTE_CODEMOD",
            PROCESSOR: "shadowrun6.gear.subtype.PROCESSOR",
            IO: "shadowrun6.gear.subtype.IO",
            DIGITAL_WEAPON: "shadowrun6.gear.subtype.DIGITAL_WEAPON"
        },
        DRONES: {
            MICRODRONES: "shadowrun6.gear.subtype.MICRODRONES",
            MINIDRONES: "shadowrun6.gear.subtype.MINIDRONES",
            SMALL_DRONES: "shadowrun6.gear.subtype.SMALL_DRONES",
            MEDIUM_DRONES: "shadowrun6.gear.subtype.MEDIUM_DRONES",
            LARGE_DRONES: "shadowrun6.gear.subtype.LARGE_DRONES"
        },
        DRONE_MICRO: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC"
        },
        DRONE_MINI: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC"
        },
        DRONE_SMALL: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC",
            ANTHRO: "shadowrun6.gear.subtype.ANTHRO"
        },
        DRONE_MEDIUM: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC",
            ANTHRO: "shadowrun6.gear.subtype.ANTHRO"
        },
        DRONE_LARGE: {
            GROUND: "shadowrun6.gear.subtype.GROUND",
            AIR: "shadowrun6.gear.subtype.AIR",
            AQUATIC: "shadowrun6.gear.subtype.AQUATIC",
            ANTHRO: "shadowrun6.gear.subtype.ANTHRO"
        },
        ELECTRONICS: {
            COMMLINK: "shadowrun6.gear.subtype.COMMLINK",
            CYBERDECK: "shadowrun6.gear.subtype.CYBERDECK",
            ELECTRONIC_ACCESSORIES: "shadowrun6.gear.subtype.ELECTRONIC_ACCESSORIES",
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
            COMPLEMENTARY_GENETIC_MODS: "shadowrun6.gear.subtype.COMPLEMENTARY_GENETIC_MODS",
            TRANSGENICS: "shadowrun6.gear.subtype.TRANSGENICS",
            TRANSGENIC_BIOWARE: "shadowrun6.gear.subtype.TRANSGENIC_BIOWARE",
        },
        MAGICAL: {
            MAGIC_SUPPLIES: "shadowrun6.gear.subtype.MAGIC_SUPPLIES"
        },
        NANOWARE: {
            NANITES_COSMETIC: "shadowrun6.gear.subtype.NANITES_COSMETIC",
            NANITES_THERAPEUTIC: "shadowrun6.gear.subtype.NANITES_THERAPEUTIC",
            NANITES_BIOAMP: "shadowrun6.gear.subtype.NANITES_BIOAMP",
            NANITES_UTILITIES: "shadowrun6.gear.subtype.NANITES_UTILITIES",
            NANITES_TRANSIENT: "shadowrun6.gear.subtype.NANITES_TRANSIENT",
            NANO_CYBERWARE: "shadowrun6.gear.subtype.NANO_CYBERWARE",
            NANOTECH_KIT: "shadowrun6.gear.subtype.NANOTECH_KIT"
        },
        SOFTWARE: {
            AUTOSOFT: "shadowrun6.gear.subtype.AUTOSOFT",
            BASIC_PROGRAM: "shadowrun6.gear.subtype.BASIC_PROGRAM",
            HACKING_PROGRAM: "shadowrun6.gear.subtype.HACKING_PROGRAM",
            RIGGER_PROGRAM: "shadowrun6.gear.subtype.RIGGER_PROGRAM",
            SKILLSOFT: "shadowrun6.gear.subtype.SKILLSOFT",
            TAC_NET: "shadowrun6.gear.subtype.TAC_NET",
            ESOFT: "shadowrun6.gear.subtype.ESOFT",
            OTHER_PROGRAMS: "shadowrun6.gear.subtype.OTHER_PROGRAMS"
        },
        SURVIVAL: {
            SURVIVAL_GEAR: "shadowrun6.gear.subtype.SURVIVAL_GEAR",
            WINTER_GEAR: "shadowrun6.gear.subtype.WINTER_GEAR",
            GRAPPLE_GUN: "shadowrun6.gear.subtype.GRAPPLE_GUN"
        },
        TOOLS: {
            TOOLS: "shadowrun6.gear.subtype.TOOLS",
            SPARE_PARTS: "shadowrun6.gear.subtype.SPARE_PARTS"
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
            SPECIAL_VEHICLES: "shadowrun6.gear.subtype.SPECIAL_VEHICLES"
        },
        WEAPON_CLOSE_COMBAT: {
            BLADES: "shadowrun6.gear.subtype.BLADES",
            CLUBS: "shadowrun6.gear.subtype.CLUBS",
            WHIPS: "shadowrun6.gear.subtype.WHIPS",
            UNARMED: "shadowrun6.gear.subtype.UNARMED",
            OTHER_CLOSE: "shadowrun6.gear.subtype.OTHER_CLOSE"
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
            ASSAULT_CANNON: "shadowrun6.gear.subtype.ASSAULT_CANNON"
        },
        WEAPON_RANGED: {
            BOWS: "shadowrun6.gear.subtype.BOWS",
            CROSSBOWS: "shadowrun6.gear.subtype.CROSSBOWS",
            THROWING: "shadowrun6.gear.subtype.THROWING"
        },
        WEAPON_SPECIAL: {
            LAUNCHERS: "shadowrun6.gear.subtype.LAUNCHERS",
            THROWERS: "shadowrun6.gear.subtype.THROWERS",
            DMSO: "shadowrun6.gear.subtype.DMSO",
            DART: "shadowrun6.gear.subtype.DART",
            OTHER_SPECIAL: "shadowrun6.gear.subtype.OTHER_SPECIAL"
        }
    };
    GEAR_SUBTYPES_OLD = new Map([
        ["ACCESSORY", []],
        ["AMMUNITION", ["AMMUNITION", "ROCKETS", "MISSILES", "EXPLOSIVES", "GRENADES"]],
        ["ARMOR", ["ARMOR_BODY", "ARMOR_HELMET", "ARMOR_SHIELD"]],
        ["ARMOR_ADDITION", []],
        ["BIOLOGY", ["BIOTECH", "SLAP_PATCHES"]],
        ["BIOWARE", ["BIOWARE_STANDARD", "BIOWARE_CULTURED", "BIOWARE_IMPLANT_WEAPON"]],
        ["CHEMICALS", ["INDUSTRIAL_CHEMICALS", "TOXINS", "DRUGS", "BTL"]],
        ["CYBERWARE",
            [
                "CYBER_HEADWARE",
                "CYBERJACK",
                "CYBER_BODYWARE",
                "CYBER_EYEWARE",
                "CYBER_EARWARE",
                "CYBER_IMPLANT_WEAPON",
                "CYBER_LIMBS",
                "COMMLINK",
                "CYBERDECK"
            ]
        ],
        ["DRONES", ["MICRODRONES", "MINIDRONES", "SMALL_DRONES", "MEDIUM_DRONES", "LARGE_DRONES"]],
        ["ELECTRONICS",
            [
                "COMMLINK",
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
                "TAC_NET"
            ]
        ],
        ["GENETICS", []],
        ["MAGICAL", ["MAGIC_SUPPLIES"]],
        ["NANOWARE", []],
        ["SOFTWARE", ["AUTOSOFT"]],
        ["SURVIVAL", ["SURVIVAL_GEAR", "GRAPPLE_GUN"]],
        ["TOOLS", ["TOOLS"]],
        ["VEHICLES", ["BIKES", "CARS", "TRUCKS", "BOATS", "SUBMARINES", "FIXED_WING", "ROTORCRAFT", "VTOL", "WALKER"]],
        ["WEAPON_CLOSE_COMBAT", ["BLADES", "CLUBS", "WHIPS", "UNARMED", "OTHER_CLOSE"]],
        ["WEAPON_FIREARMS",
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
                "ASSAULT_CANNON"
            ]
        ],
        ["WEAPON_RANGED", ["BOWS", "CROSSBOWS", "THROWING"]],
        ["WEAPON_SPECIAL", ["LAUNCHERS", "THROWERS", "OTHER_SPECIAL"]]
    ]);
    GEAR_SUBTYPES2 = {
        ELECTRONICS: [
            "COMMLINK",
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
            "TAC_NET"
        ]
    };
    SKILLS_WEAPON = {
        firearms: "skill.firearms", 
        close_combat: "skill.close_combat", 
        exotic_weapons: "skill.exotic_weapons", 
        athletics: "skill.athletics", 
        engineering: "skill.engineering"
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
        TARGETING: "shadowrun6.autosoft_types.targeting"
    };
    MATRIX_INITIATIVE_TYPES = {
        ar: "shadowrun6.matrixini.ar", 
        vrcold: "shadowrun6.matrixini.vrcold",
        vrhot: "shadowrun6.matrixini.vrhot"
    };
    MOR_TYPES = {
        mundane: "shadowrun6.mortype.mundane",
        magician: "shadowrun6.mortype.magician",
        mysticadept: "shadowrun6.mortype.mysticadept",
        technomancer: "shadowrun6.mortype.technomancer",
        adept: "shadowrun6.mortype.adept",
        aspectedmagician: "shadowrun6.mortype.aspectedmagician"
    };
    MOR_DEFINITIONS = {
        mundane: new MagicOrResonanceDefinition(),
        magician: new MagicOrResonanceDefinition(true, false, true, false),
        mysticadept: new MagicOrResonanceDefinition(true, false, true, true),
        technomancer: new MagicOrResonanceDefinition(false, true, false, false),
        adept: new MagicOrResonanceDefinition(true, false, false, true),
        aspectedmagician: new MagicOrResonanceDefinition(true, false, true, false)
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
        task: "shadowrun6.spirittype.task"
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
        ["tasking", new SkillDefinition("res", false)]
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
        new EdgeBoost(5, "create_special", "ANYTIME")
    ];
    EDGE_ACTIONS = [
        new EdgeAction(1, "shank", "COMBAT"),
        new EdgeAction(2, "bring_the_drama", "SOCIAL", "con"),
        new EdgeAction(2, "fire_from_cover", "COMBAT"),
        new EdgeAction(2, "knockout_blow", "COMBAT"),
        new EdgeAction(4, "anticipation", "COMBAT"),
        new EdgeAction(4, "big_speech", "SOCIAL", "influence"),
        new EdgeAction(5, "called_shot_disarm", "COMBAT"),
        new EdgeAction(5, "called_shot_vitals", "COMBAT")
    ];
    FIRE_MODES = {
        "SS": {
            "loc": "shadowrun6.item.firemode.SS",
            "firing_options": ["single_shot"]
        },
        "SA": {
            "loc": "shadowrun6.item.firemode.SA",
            "firing_options": ["single_shot", "double_shot"]
        },
        "BF": {
            "loc": "shadowrun6.item.firemode.BF",
            "firing_options": ["narrow_burst", "wide_burst"]
        },
        "FA": {
            "loc": "shadowrun6.item.firemode.FA",
            "firing_options": ["area_fire"]
        }
    }
    icons = {
        adeptpower: {
            default: "systems/shadowrun6-eden/icons/compendium/default/explosion.svg"
        },
        complexform: {
            default: "systems/shadowrun6-eden/icons/compendium/the_12_days_of_cybermas/sycust_fleshweave.svg"
        },
        contact: {
            default: "systems/shadowrun6-eden/icons/compendium/status/human_shield.svg"
        },
        critterpower: {
            default: "systems/shadowrun6-eden/icons/compendium/default/default-demon.svg"
        },
        echo: {
            default: "systems/shadowrun6-eden/icons/compendium/gear/bug_detector.svg"
        },
        focus: {
            default: "systems/shadowrun6-eden/icons/compendium/clothing/generic_jewelry.svg"
        },
        gear: {
            default: "systems/shadowrun6-eden/icons/compendium/gear/tech_bag.svg"
        },
        skill: {
            default: "systems/shadowrun6-eden/icons/compendium/default/Default_Skill.svg"
        },
        lifestyle: {
            default: "systems/shadowrun6-eden/icons/compendium/clothing/generic_jacket.svg"
        },
        martialartstyle: {
            default: "systems/shadowrun6-eden/icons/compendium/default/Default_Melee.svg"
        },
        martialarttech: {
            default: "systems/shadowrun6-eden/icons/compendium/default/Default_Melee.svg"
        },
        metamagic: {
            default: "systems/shadowrun6-eden/icons/compendium/default/daze.svg"
        },
        quality: {
            default: "systems/shadowrun6-eden/icons/compendium/default/Default_Skill.svg"
        },
        ritual: {
            default: "systems/shadowrun6-eden/icons/compendium/programs/nervescrub.svg"
        },
        sin: {
            default: "systems/shadowrun6-eden/icons/compendium/default/Default_Role.svg"
        },
        software: {
            default: "systems/shadowrun6-eden/icons/compendium/default/Default_Program.svg"
        },
        spell: {
            default: "systems/shadowrun6-eden/icons/compendium/default/acid.svg"
        },
        mod: {
            default: "systems/shadowrun6-eden/icons/compendium/black-chrome/explicit-memory-stimulator.svg"
        }
    };
    spell_range = {
        line_of_sight: "shadowrun6.spell.range_line_of_sight",
        line_of_sight_area: "shadowrun6.spell.range_line_of_sight_area",
        touch: "shadowrun6.spell.range_touch",
        self: "shadowrun6.spell.range_self",
        self_area: "shadowrun6.spell.range_self_area"
    };
    spell_category = {
        combat: "shadowrun6.spell.category_combat",
        detection: "shadowrun6.spell.category_detection",
        health: "shadowrun6.spell.category_health",
        illusion: "shadowrun6.spell.category_illusion",
        manipulation: "shadowrun6.spell.category_manipulation"
    };
    spell_type = {
        physical: "shadowrun6.spell.type_physical",
        mana: "shadowrun6.spell.type_mana"
    };
    combat_spell_type = {
        spells_direct: "shadowrun6.spellfeatures.direct",
        spells_indirect: "shadowrun6.spellfeatures.indirect"
    };
    spell_duration = {
        instantaneous: "shadowrun6.spell.duration_instantaneous",
        sustained: "shadowrun6.spell.duration_sustained",
        permanent: "shadowrun6.spell.duration_permanent",
        limited: "shadowrun6.spell.duration_limited",
        always: "shadowrun6.spell.duration_always",
        special: "shadowrun6.spell.duration_special"
    };
    spell_damage = {
        physical: "shadowrun6.spell.damage_physical",
        stun: "shadowrun6.spell.damage_stun",
        physical_special: "shadowrun6.spell.damage_physical_special",
        stun_special: "shadowrun6.spell.damage_stun_special"
    };
    tradition_attributes = {
        bod: "attrib.bod",
        log: "attrib.log",
        cha: "attrib.cha",
        int: "attrib.int"
    };
    adeptpower_activation = {
        passive: "shadowrun6.adeptpower.activation_passive",
        minor_action: "shadowrun6.adeptpower.activation_minor",
        major_action: "shadowrun6.adeptpower.activation_major"
    };
    critterpower_action = {
        auto: "shadowrun6.critterpower.action.auto",
        minor: "shadowrun6.critterpower.action.minor",
        major: "shadowrun6.critterpower.action.major"
    };
    skill_special = {
        astral: {
            astral_combat: "shadowrun6.special.astral.astral_combat",
            astral_signatures: "shadowrun6.special.astral.astral_signatures",
            emotional_stress: "shadowrun6.special.astral.emotional_stress",
            spirit_types: "shadowrun6.special.astral.spirit_types"
        },
        athletics: {
            climbing: "shadowrun6.special.athletics.climbing",
            flying: "shadowrun6.special.athletics.flying",
            free_fall: "shadowrun6.special.athletics.free_fall",
            gymnastics: "shadowrun6.special.athletics.gymnastics",
            sprinting: "shadowrun6.special.athletics.sprinting",
            swimming: "shadowrun6.special.athletics.swimming",
            throwing: "shadowrun6.special.athletics.throwing",
            archery: "shadowrun6.special.athletics.archery"
        },
        biotech: {
            biotechnology: "shadowrun6.special.biotech.biotechnology",
            cybertechnology: "shadowrun6.special.biotech.cybertechnology",
            first_aid: "shadowrun6.special.biotech.first_aid",
            medicine: "shadowrun6.special.biotech.medicine"
        },
        close_combat: {
            blades: "shadowrun6.special.close_combat.blades",
            clubs: "shadowrun6.special.close_combat.clubs",
            unarmed: "shadowrun6.special.close_combat.unarmed"
        },
        con: {
            acting: "shadowrun6.special.con.acting",
            disguise: "shadowrun6.special.con.disguise",
            impersonation: "shadowrun6.special.con.impersonation",
            performance: "shadowrun6.special.con.performance"
        },
        conjuring: {
            banishing: "shadowrun6.special.conjuring.banishing",
            summoning: "shadowrun6.special.conjuring.summoning"
        },
        cracking: {
            cybercombat: "shadowrun6.special.cracking.cybercombat",
            electronic_warfare: "shadowrun6.special.cracking.electronic_warfare",
            hacking: "shadowrun6.special.cracking.hacking"
        },
        electronics: {
            computer: "shadowrun6.special.electronics.computer",
            hardware: "shadowrun6.special.electronics.hardware",
            software: "shadowrun6.special.electronics.software",
            complex_forms: "shadowrun6.special.electronics.complex_forms"
        },
        enchanting: {
            alchemy: "shadowrun6.special.enchanting.alchemy",
            artificing: "shadowrun6.special.enchanting.artificing",
            disenchanting: "shadowrun6.special.enchanting.disenchanting"
        },
        engineering: {
            aeronautics_mechanic: "shadowrun6.special.engineering.aeronautics_mechanic",
            armorer: "shadowrun6.special.engineering.armorer",
            automotive_mechanic: "shadowrun6.special.engineering.automotive_mechanic",
            demolitions: "shadowrun6.special.engineering.demolitions",
            gunnery: "shadowrun6.special.engineering.gunnery",
            industrial_mechanic: "shadowrun6.special.engineering.industrial_mechanic",
            lockpicking: "shadowrun6.special.engineering.lockpicking",
            nautical_mechanic: "shadowrun6.special.engineering.nautical_mechanic"
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
            other: "shadowrun6.special.exotic_weapons.other"
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
            assault_cannons: "shadowrun6.special.firearms.assault_cannons"
        },
        influence: {
            etiquette: "shadowrun6.special.influence.etiquette",
            instruction: "shadowrun6.special.influence.instruction",
            intimidation: "shadowrun6.special.influence.intimidation",
            leadership: "shadowrun6.special.influence.leadership",
            negotiation: "shadowrun6.special.influence.negotiation"
        },
        outdoors: {
            navigation: "shadowrun6.special.outdoors.navigation",
            survival: "shadowrun6.special.outdoors.survival",
            tracking_woods: "shadowrun6.special.outdoors.tracking_woods",
            tracking_desert: "shadowrun6.special.outdoors.tracking_desert",
            tracking_urban: "shadowrun6.special.outdoors.tracking_urban",
            tracking_other: "shadowrun6.special.outdoors.tracking_other"
        },
        perception: {
            visual: "shadowrun6.special.perception.visual",
            aural: "shadowrun6.special.perception.aural",
            tactile: "shadowrun6.special.perception.tactile",
            scent: "shadowrun6.special.perception.scent",
            taste: "shadowrun6.special.perception.taste",
            perception_woods: "shadowrun6.special.perception.perception_woods",
            perception_desert: "shadowrun6.special.perception.perception_desert",
            perception_urban: "shadowrun6.special.perception.perception_urban",
            perception_other: "shadowrun6.special.perception.perception_other"
        },
        piloting: {
            ground_craft: "shadowrun6.special.piloting.ground_craft",
            aircraft: "shadowrun6.special.piloting.aircraft",
            watercraft: "shadowrun6.special.piloting.watercraft"
        },
        sorcery: {
            counterspelling: "shadowrun6.special.sorcery.counterspelling",
            ritual_spellcasting: "shadowrun6.special.sorcery.ritual_spellcasting",
            spellcasting: "shadowrun6.special.sorcery.spellcasting"
        },
        stealth: {
            disguise: "shadowrun6.special.stealth.disguise",
            palming: "shadowrun6.special.stealth.palming",
            sneaking: "shadowrun6.special.stealth.sneaking",
            camouflage: "shadowrun6.special.stealth.camouflage"
        },
        tasking: {
            compiling: "shadowrun6.special.tasking.compiling",
            decompiling: "shadowrun6.special.tasking.decompiling",
            registering: "shadowrun6.special.tasking.registering"
        }
    };
    VEHICLE_TYPE = {
        GROUND: "shadowrun6.vehicle.type.groundcraft",
        WATER: "shadowrun6.vehicle.type.watercraft",
        AIR: "shadowrun6.vehicle.type.aircraft"
    };
    VEHICLE_MODE = {
        manual: "shadowrun6.vehicle.mode.manual",
        riggedAR: "shadowrun6.vehicle.mode.riggedAR",
        riggedVR: "shadowrun6.vehicle.mode.riggedVR",
        rcc: "shadowrun6.vehicle.mode.rcc",
        autonomous: "shadowrun6.vehicle.mode.autonomous"
    };
    CONTROL_RIG_RATING = {
        "0": "shadowrun6.label.not_present",
        "1": "shadowrun6.label.rating1",
        "2": "shadowrun6.label.rating2",
        "3": "shadowrun6.label.rating3"
    };
    MATRIX_ACTIONS = {
        // MatrixAction(id, skill, specialization, attrib, illegal, major, outsider, user, admin, attr1, attr2, linkedAttr, threshold = 0)
        backdoor_entry: new MatrixAction("backdoor_entry", "cracking", "hacking", "log", true, true, true, false, false, "wil", "f", "s"),
        brute_force: new MatrixAction("brute_force", "cracking", "cybercombat", "log", true, true, true, true, true, "wil", "f", "a"),
        change_icon: new MatrixAction("change_icon", null, null, null, false, false, false, true, true),
        check_os: new MatrixAction("check_os", "cracking", "electronic_warfare", "log", true, true, false, false, true, null, null, null, 4),
        control_device: new MatrixAction("control_device", "electronics", "software", "log", false, true, false, true, true, "wil", "f"),
        crack_file: new MatrixAction("crack_file", "cracking", "hacking", "log", true, true, false, true, true, undefined, null),
        crash_program: new MatrixAction("crash_program", "cracking", "cybercombat", "log", true, true, false, false, true, "d", "dr"),
        data_spike: new MatrixAction("data_spike", "cracking", "cybercombat", "log", true, true, false, true, true, "d", "f", "a"),
        disarm_data_bomb: new MatrixAction("disarm_data_bomb", "cracking", "cybercombat", "log", false, true, false, true, true, "dr", "dr"),
        edit_file: new MatrixAction("edit_file", "electronics", "computer", "log", false, true, false, true, true, "int", "f"),
        encrypt_file: new MatrixAction("encrypt_file", "electronics", "computer", "log", false, true, false, true, true, null, null),
        enter_host: new MatrixAction("enter_host", null, null, null, false, false, true, true, true, null, null),
        erase_matrix_signature: new MatrixAction("erase_matrix_signature", "electronics", "computer", "log", true, true, false, true, true, "wil", "f"),
        format_device: new MatrixAction("format_device", "electronics", "software", "log", false, true, false, false, true, "wil", "f"),
        full_matrix_defense: new MatrixAction("full_matrix_defense", null, null, null, false, true, true, true, true, null, null),
        hash_check: new MatrixAction("hash_check", "electronics", "computer", "log", true, true, false, true, true, null, null),
        hide: new MatrixAction("hide", "cracking", "electronic_warfare", "int", true, true, true, true, true, "int", "d"),
        jack_out: new MatrixAction("jack_out", "electronics", "software", "wil", false, true, true, true, true, "cha", "d"),
        jam_signals: new MatrixAction("jam_signals", "cracking", "electronic_warfare", "log", true, true, false, false, true, null, null),
        jump_rigged: new MatrixAction("jump_rigged", "electronics", "software", "log", false, true, false, true, true, "wil", "f"),
        matrix_perception: new MatrixAction("matrix_perception", "electronics", "computer", "int", false, true, true, true, true, "wil", "s"),
        matrix_search: new MatrixAction("matrix_search", "electronics", "computer", "int", false, true, true, true, true, null, null),
        probe: new MatrixAction("probe", "cracking", "hacking", "log", true, true, true, true, true, "wil", "f", "s"),
        reboot_device: new MatrixAction("reboot_device", "electronics", "software", "log", false, true, false, false, true, "log", "wil"),
        reconfigure: new MatrixAction("reconfigure", null, null, null, false, false, false, false, true, null, null),
        send_message: new MatrixAction("send_message", null, null, null, false, false, true, true, true, null, null),
        set_data_bomb: new MatrixAction("set_data_bomb", "electronics", "software", "log", true, true, false, false, true, "dr", "dr"),
        snoop: new MatrixAction("snoop", "cracking", "electronic_warfare", "log", true, true, false, false, true, "d", "f"),
        spoof_command: new MatrixAction("spoof_command", "cracking", "hacking", "log", true, true, true, true, true, "d", "f"),
        switch_ifmode: new MatrixAction("switch_ifmode", null, null, null, false, false, false, false, true, null, null),
        tarpit: new MatrixAction("tarpit", "cracking", "cybercombat", "log", true, true, true, true, true, "d", "f", "a"),
        trace_icon: new MatrixAction("trace_icon", "electronics", "software", "int", true, true, false, false, true, "wil", "s")
    };
    MATRIX_ACTIONS_HS = {
        // MatrixAction(id, skill, specialization, attrib, illegal, major, outsider, user, admin, attr1, attr2, linkedAttr, threshold = 0)
        // TODO add Matrix Edge Actions (HS p.31)
        calibration: new MatrixAction("calibration", "electronics", "computer", "log", false, true, false, true, true, null, null),
        delayed_command: new MatrixAction("delayed_command", "cracking", "hacking", "log", true, true, true, true, true, "d", "f"),
        denial_of_service: new MatrixAction("denial_of_service", "cracking", "electronic_warfare", "log", true, true, true, false, false, "wil", "f"),
        device_lock: new MatrixAction("device_lock", "cracking", "cybercombat", "log", true, true, true, true, true, "wil", "f"),
        garbage_in_out: new MatrixAction("garbage_in_out", "cracking", "electronic_warfare", "log", true, true, false, true, true, "wil", "f"),
        known_exploit: new MatrixAction("known_exploit", "cracking", "hacking", "log", true, true, true, false, false, "wil", "f", "s"),
        masquerade: new MatrixAction("masquerade", "cracking", "electronic_warfare", "log", true, true, true, false, false, "int", "d"),
        metahuman_middle: new MatrixAction("metahuman_middle", "cracking", "electronic_warfare", "log", true, true, true, false, false, "int", "d"),
        modify_icon: new MatrixAction("modify_icon", "electronics", "software", "log", true, true, false, false, true, "int", "d"),
        pop_up: new MatrixAction("pop_up", "cracking", "cybercombat", "log", true, true, true, false, false, "int", "d"),
        squelch: new MatrixAction("squelch", "electronics", "software", "log", true, false, true, false, false, "int", "s"),
        subvert_infrastructure: new MatrixAction("subvert_infrastructure", "electronics", "software", "log", true, true, false, false, true, "wil", "f"),
        threat_analysis: new MatrixAction("threat_analysis", "electronics", "computer", "log", false, true, true, true, true, null, null),
        virtual_aim: new MatrixAction("virtual_aim", null, null, null, false, false, true, false, false, null, null),
        watchdog: new MatrixAction("watchdog", "cracking", "electronic_warfare", "log", true, false, false, true, true, "wil", "f")
    };
    COMPLEX_FORMS = {
        list: {
            cleaner: new ComplexForm("electronics", "complex_forms", null, null),
            diffusion: new ComplexForm("electronics", "complex_forms", "wil", "f"),
            editor: new ComplexForm(null, null, null),
            emulate: new ComplexForm(null, null, null),
            infusion: new ComplexForm("electronics", "complex_forms", null, null, 4),
            mirrored_persona: new ComplexForm("electronics", "complex_forms", null, null),
            pulse_storm: new ComplexForm("electronics", "complex_forms", "log", "d"),
            puppeteer: new ComplexForm(null, null, null),
            resonance_channel: new ComplexForm("electronics", "complex_forms", null, null),
            resonance_spike: new ComplexForm("cracking", "cybercombat", "wil", "f"),
            resonance_veil: new ComplexForm("electronics", "complex_forms", "int", "d"),
            static_bomb: new ComplexForm("electronics", "complex_forms", "int", "d"),
            static_veil: new ComplexForm("electronics", "complex_forms", "f", "f"),
            stitches: new ComplexForm("electronics", "complex_forms", null, null),
            tattletale: new ComplexForm("electronics", "complex_forms", null, null)
        },
        skills: {
            "cracking": "skill.cracking",
            "electronics": "skill.electronics"
        },
        spec: {
            "cybercombat": "shadowrun6.special.electronics.complex_forms.cybercombat",
            "complex_forms": "shadowrun6.special.electronics.complex_forms"
        },
        attributes: {
            "devRating": "shadowrun6.label.devicerating.long",
            "a": "shadowrun6.label.attack.long",
            "s": "shadowrun6.label.sleaze.long",
            "d": "shadowrun6.label.dataproc.long",
            "f": "shadowrun6.label.firewall.long",
            "wil": "attrib.wil",
            "log": "attrib.log",
            "int": "attrib.int"
        }
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
        new Program("trace", 1)
    ];
    LIFESTYLE_TYPE = {
        street: "shadowrun6.lifestyle.street",
        squatter: "shadowrun6.lifestyle.squatter",
        low: "shadowrun6.lifestyle.low",
        middle: "shadowrun6.lifestyle.middle",
        high: "shadowrun6.lifestyle.high",
        luxury: "shadowrun6.lifestyle.luxury"
    };
    SIN_QUALITY = {
        REAL_SIN: "shadowrun6.sin.real_sin",
        ANYONE: "shadowrun6.sin.anyone",
        ROUGH_MATCH: "shadowrun6.sin.rough_match",
        GOOD_MATCH: "shadowrun6.sin.good_match",
        SUPERFICIALLY_PLAUSIBLE: "shadowrun6.sin.superficially_plausible",
        HIGHLY_PLAUSIBLE: "shadowrun6.sin.highly_plausible",
        SECOND_LIFE: "shadowrun6.sin.second_life"
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
        sticknshock: "shadowrun6.ammotypes.sticknshock"
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
        system_attributes_bod_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.bod")}),
        system_attributes_agi_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.agi")}),
        system_attributes_rea_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.rea")}),
        system_attributes_str_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.str")}),
        system_attributes_wil_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.wil")}),
        system_attributes_log_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.log")}),
        system_attributes_int_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.int")}),
        system_attributes_cha_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.cha")}),
        system_edge_max: game.i18n.localize("attrib.edg")+" "+game.i18n.localize("shadowrun6.label.attribute"),                                 // TODO: move system.edge to system.attributes.edge
        system_attributes_mag_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.mag")}),
        system_attributes_res_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.res")}),
        system_attributes_essence_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.ess")}),

        // ----------- Weapon Mods ----------- //
        system_attackRating_0: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.localize("shadowrun6.label.attack_rating")+" ("+game.i18n.localize("shadowrun6.roll.ar_0")+")",
        system_attackRating_1: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.localize("shadowrun6.label.attack_rating")+" ("+game.i18n.localize("shadowrun6.roll.ar_1")+")",
        system_attackRating_2: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.localize("shadowrun6.label.attack_rating")+" ("+game.i18n.localize("shadowrun6.roll.ar_2")+")",
        system_attackRating_3: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.localize("shadowrun6.label.attack_rating")+" ("+game.i18n.localize("shadowrun6.roll.ar_3")+")",
        system_attackRating_4: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.localize("shadowrun6.label.attack_rating")+" ("+game.i18n.localize("shadowrun6.roll.ar_4")+")",

        system_modes_SA__ar__mod: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.label.attack_rating_short")})+" ("+game.i18n.localize("shadowrun6.item.mode_sa")+")",
        // system_modes_SA__dmg__mod: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.localize("shadowrun6.label.damage_short")+" "+game.i18n.localize("shadowrun6.active_effect.Modifier")+" ("+game.i18n.localize("shadowrun6.item.mode_sa")+")",
        system_modes_BF__ar__mod: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.label.attack_rating_short")})+" ("+game.i18n.localize("shadowrun6.item.mode_bf")+")",
        system_modes_FA__ar__mod: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.label.attack_rating_short")})+" ("+game.i18n.localize("shadowrun6.item.mode_fa")+")",
        
        system_dmg: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.label.damage_short")}),
        system_stun: game.i18n.localize("shadowrun6.active_effect.weapon.mod")+" "+game.i18n.localize("shadowrun6.active_effect.stunOrPhysical"),

        system_defense: game.i18n.localize("shadowrun6.active_effect.armor.mod")+" "+game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.dr")}),
        system_social: game.i18n.localize("shadowrun6.active_effect.armor.mod")+" "+game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.item.social_rating")}),

        // ----------- Less used Actor Effects ----------- //
        system_physical_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.monitor.physical_monitor")}),
        system_stun_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.monitor.stun_monitor")}),

        system_attackrating_physical_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.attack_rating.physical")}),
        system_attackrating_astral_mod:game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.attack_rating.astral")}),             // Magic AR
        system_attackrating_matrix_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.attack_rating.matrix")}),
        // system_attackrating_social_mod: "shadowrun6.active_effect.attackrating.social.mod",          // TODO: Social AR not yet implemented
        // system_attackrating_vehicle_mod: "shadowrun6.active_effect.attackrating.vehicle.mod",        // TODO: Vehicle AR not yet implemented

        system_defenserating_physical_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.defense_rating.physical")}),       // TODO: Add defenserating.xx.pool to Actor so you can override
        system_defenserating_astral_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.defense_rating.astral")}),           // Magic DR
        system_defenserating_matrix_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.defense_rating.matrix")}),
        // system_defenserating_social_mod: "shadowrun6.active_effect.defenserating.social.mod",        // TODO: Social DR not yet implemented
        // system_defenserating_vehicle_mod: "shadowrun6.active_effect.defenserating.vehicle.mod",      // TODO: Vehicle DR not yet implemented

        system_defensepool_physical_mod: "shadowrun6.active_effect.defensepool.physical.mod",
        system_defensepool_astral_mod: "shadowrun6.active_effect.defensepool.astral.mod",               // Magic defense pool 
        system_defensepool_spells__direct_mod: "shadowrun6.active_effect.defensepool.spells_direct.mod",
        system_defensepool_spells__indirect_mod: "shadowrun6.active_effect.defensepool.spells_indirect.mod",
        system_defensepool_toxin_mod: "shadowrun6.active_effect.defensepool.toxin.mod",
        system_defensepool_damage__physical_mod: "shadowrun6.active_effect.defensepool.damage_physical.mod",
        system_defensepool_damage__astral_mod: "shadowrun6.active_effect.defensepool.damage_astral.mod",
        system_defensepool_drain_mod: "shadowrun6.active_effect.defensepool.drain.mod",
        system_defensepool_matrix_mod: "shadowrun6.active_effect.defensepool.matrix.mod",
        // system_defensepool_vehicle_mod: "shadowrun6.active_effect.defensepool.vehicle.mod",      // TODO: Vehicle def pool not yet implemented

        system_derived_composure_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.derived.composure")}),
        system_derived_judge__intentions_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.derived.judge_intentions")}),
        system_derived_memory_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.derived.memory")}),
        system_derived_lift__carry_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.derived.lift_carry")}),
        system_derived_matrix__perception_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("shadowrun6.derived.matrix_perception")}),

        system_initiative_physical_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.ini")}),
        system_initiative_physical_diceMod: "shadowrun6.active_effect.initiative.physical.diceMod",
        system_initiative_astral_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.inia")}),
        system_initiative_astral_diceMod: "shadowrun6.active_effect.initiative.astral.diceMod",
        system_initiative_matrix_mod: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.localize("attrib.inim")}),
        system_initiative_matrix_diceMod: "shadowrun6.active_effect.initiative.matrix.diceMod",

        system_skills_astral_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.astral")})}),
        system_skills_athletics_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.athletics")})}),
        system_skills_biotech_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.biotech")})}),
        system_skills_close__combat_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.close_combat")})}),
        system_skills_con_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.con")})}),
        system_skills_conjuring_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.conjuring")})}),
        system_skills_cracking_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.cracking")})}),
        system_skills_electronics_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.electronics")})}),
        system_skills_enchanting_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.enchanting")})}),
        system_skills_exotic__weapons_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.exotic_weapons")})}),
        system_skills_firearms_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.firearms")})}),
        system_skills_influence_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.influence")})}),
        system_skills_outdoors_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.outdoors")})}),
        system_skills_perception_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.perception")})}),
        system_skills_piloting_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.piloting")})}),
        system_skills_sorcery_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.sorcery")})}),
        system_skills_stealth_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.stealth")})}),
        system_skills_tasking_modifier: game.i18n.format("shadowrun6.active_effect.Modifier", {attribute: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.tasking")})}),
        
        system_attributes_agi_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.localize("attrib.agi")}),
        system_attributes_str_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.localize("attrib.str")}),

        system_skills_astral_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.astral")})}),
        system_skills_athletics_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.athletics")})}),
        system_skills_biotech_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.biotech")})}),
        system_skills_close__combat_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.close_combat")})}),
        system_skills_con_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.con")})}),
        system_skills_conjuring_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.conjuring")})}),
        system_skills_cracking_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.cracking")})}),
        system_skills_electronics_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.electronics")})}),
        system_skills_enchanting_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.enchanting")})}),
        system_skills_exotic__weapons_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.exotic_weapons")})}),
        system_skills_firearms_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.firearms")})}),
        system_skills_influence_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.influence")})}),
        system_skills_outdoors_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.outdoors")})}),
        system_skills_perception_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.perception")})}),
        system_skills_piloting_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.piloting")})}),
        system_skills_sorcery_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.sorcery")})}),
        system_skills_stealth_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.stealth")})}),
        system_skills_tasking_pool: game.i18n.format("shadowrun6.active_effect.Pool", {pool: game.i18n.format("shadowrun6.active_effect.Skill", {skill: game.i18n.localize("skill.tasking")})})

    };
}