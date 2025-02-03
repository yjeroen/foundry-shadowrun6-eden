function skill_to_skill_id(skill) {
    skill = skill.toLowerCase();
    let SKILL_MAP = game.i18n.translations.skill;
    for (const id in SKILL_MAP) {
        if (SKILL_MAP[id].toLowerCase() == skill) {
            return id;
        }
    }
    throw new Error("Skill not found: " + skill);
}
function spec_to_spec_id(skill, spec) {
    spec = spec.toLowerCase();
    let SPECIALIZATION_MAP = game.i18n.translations.shadowrun6.special;
    if (skill != null) {
        for (const id in SPECIALIZATION_MAP[skill]) {
            for (const spec_id in SPECIALIZATION_MAP[skill]) {
                if (SPECIALIZATION_MAP[skill][spec_id].toLowerCase() == spec) {
                    return spec_id;
                }
            }
        }
    }
    else {
        for (const skill in SPECIALIZATION_MAP) {
            for (const id in SPECIALIZATION_MAP[skill]) {
                for (const spec_id in SPECIALIZATION_MAP[skill]) {
                    if (SPECIALIZATION_MAP[skill][spec_id].toLowerCase() == spec) {
                        return spec_id;
                    }
                }
            }
        }
    }
    return undefined;
}
function pool_to_skill_lvl(attrs, skill, pool) {
    switch (skill) {
        case "astral": {
            return pool - attrs.intuition.pool();
        }
        case "athletics": {
            return pool - attrs.agility.pool();
        }
        case "biotech": {
            return pool - attrs.logic.pool();
        }
        case "close_combat": {
            return pool - attrs.agility.pool();
        }
        case "con": {
            return pool - attrs.charisma.pool();
        }
        case "conjuring": {
            return pool - (attrs.special?.pool() || 0);
        }
        case "cracking": {
            return pool - attrs.logic.pool();
        }
        case "electronics": {
            return pool - attrs.logic.pool();
        }
        case "enchanting": {
            return pool - (attrs.special?.pool() || 0);
        }
        case "engineering": {
            return pool - attrs.logic.pool();
        }
        case "exotic_weapons waffen": {
            return pool - attrs.agility.pool();
        }
        case "firearms": {
            return pool - attrs.agility.pool();
        }
        case "influence": {
            return pool - attrs.charisma.pool();
        }
        case "outdoors": {
            return pool - attrs.intuition.pool();
        }
        case "perception": {
            return pool - attrs.intuition.pool();
        }
        case "piloting": {
            return pool - attrs.reaction.pool();
        }
        case "sorcery": {
            return pool - (attrs.special?.pool() || 0);
        }
        case "stealth": {
            return pool - attrs.agility.pool();
        }
        case "tasking": {
            return pool - (attrs.special?.pool() || 0);
        }
    }
    ;
    return pool;
}
var SectionType;
(function (SectionType) {
    SectionType[SectionType["None"] = 0] = "None";
    SectionType[SectionType["Meta"] = 1] = "Meta";
    SectionType[SectionType["Stats"] = 2] = "Stats";
    SectionType[SectionType["DRStats"] = 3] = "DRStats";
    SectionType[SectionType["StatsWithMagic"] = 4] = "StatsWithMagic";
    SectionType[SectionType["StatsWithResonance"] = 5] = "StatsWithResonance";
    SectionType[SectionType["StatsAlternate"] = 6] = "StatsAlternate";
    SectionType[SectionType["Status"] = 7] = "Status";
    SectionType[SectionType["Initiative"] = 8] = "Initiative";
    SectionType[SectionType["Actions"] = 9] = "Actions";
    SectionType[SectionType["Defense"] = 10] = "Defense";
    SectionType[SectionType["Skills"] = 11] = "Skills";
    SectionType[SectionType["SkillsPooled"] = 12] = "SkillsPooled";
    SectionType[SectionType["Equipment"] = 13] = "Equipment";
    SectionType[SectionType["Cyberware"] = 14] = "Cyberware";
    SectionType[SectionType["Weapons"] = 15] = "Weapons";
    SectionType[SectionType["Spells"] = 16] = "Spells";
    SectionType[SectionType["Vehicles"] = 17] = "Vehicles";
    SectionType[SectionType["AdeptPowers"] = 18] = "AdeptPowers";
    SectionType[SectionType["AstralInitiative"] = 19] = "AstralInitiative";
    SectionType[SectionType["ComplexForms"] = 20] = "ComplexForms";
    SectionType[SectionType["MetaMagic"] = 21] = "MetaMagic";
    SectionType[SectionType["Initiation"] = 22] = "Initiation";
    SectionType[SectionType["Languages"] = 23] = "Languages";
    SectionType[SectionType["Persona"] = 24] = "Persona";
    SectionType[SectionType["Power"] = 25] = "Power";
    SectionType[SectionType["Age"] = 26] = "Age";
    SectionType[SectionType["Influence"] = 27] = "Influence";
    SectionType[SectionType["Programs"] = 28] = "Programs";
    SectionType[SectionType["Description"] = 29] = "Description";
})(SectionType || (SectionType = {}));
const STATS_LINES = ["K G R S W L I C ESS", "K G R S W L I C EDG ESS", "B A R S W L I C ESS", "CON AGI RÉA FOR VOL LOG INT CHA ESS"];
const ALTERNATE_STATS_LNIE = ["K", "B"];
const STATS_MAGIC_LINES = ["K G R S W L I C M ESS", "K G R S W L I C EDG M ESS", "B A R S W L I C M ESS", "CON AGI RÉA FOR VOL LOG INT CHA MAG ESS"];
const STATS_RES_LINES = ["K G R S W L I C RES ESS", "K G R S W L I C EDG R ESS", "B A R S W L I C RS ESS", "CON AGI RÉA FOR VOL LOG INT CHA RES ESS"];
const DR_LINES = ["DR I/ID AC CM MOVE", "I/ID AC CM MOVE", "SD I/DI PA ME DÉPLACEMENT", "SD I/DI PA ME DÉPLACEMENT DRAIN", "SD I/DI PA ME DÉPLA. DRAIN", "SD I/DI PA ME DÉPLA.", "SD I/DI PA ME DÉPLA. TECHNO."]; // the french books are inconsistent
const INIT_LINES = ["Initiative:"]; // DE specific
const INIT_ASTRAL_LINES = ["Astrale Initiative:"]; // DE specific
const ACTIONS_LINE = ["Handlungen:"]; // DE specific
const STATUS_LINES = ["Zustandsmonitor:"]; // DE specific
const DEFENSE_LINES = ["Verteidigungswert:"]; // DE specific
const SKILLS_LINES = ["Fertigkeiten:", "Skills:", "Compétences :"];
const SKILLS_POOLED_LINES = ["Fertigkeiten (Würfelpools):"]; // DE specific extra books
const LANG_LINES = ["Sprachfertigkeiten:"]; // DE specific extra books
const GEAR_LINES = ["Ausrüstung:", "Gear:", "Équipement :"];
const CYBERWARE_LINES = ["Bodytech:", "Augmentations:", "Augmentations :", "Augmentations (alphaware) :"]; // FR specific alphaware
const WEAPON_LINES = ["Waffen:", "Weapons:", "Armes :"];
const SPELLS_LINES = ["Zauber:", "Spells:", "Sorts :"];
const VEHICLES_LINES = ["Fahrzeuge und Drohnen:", "Vehicles and Drones:", "Véhicules et drones :"];
const ADEPT_POWERS_LINES = ["Adeptenkräfte:", "Powers:", "Pouvoirs d’adepte :"];
const COMPLEX_FORMS_LINES = ["Komplexe Formen:", "Complex Forms:", "Formes complexes :"];
const METAMAGIC_LINES = ["Metamagie:", "Metamagics:", "Métamagies :"];
const INITIATION_LINES = ["Initiatengrad:", "Initiate Grade:", "Grade d’initié :"];
const PROGRAMS_LINES = ["Programme:", "Programs:"]; // FR rolls this into equipment
const PERSONA_LINES = ["Lebende Persona:"]; // DE specific
const POWERS_LINES = ["Kräfte:"]; // DE specific
const AGE_LINES = ["Alter"]; // DE specific extra books
const INFLUENCE_LINES = ["Einflussstufe"]; // DE specific extra books
const DESC_LINES = ["Bevorzugte Zahlungsmethode"]; // DE specific extra books
function isSectionStart(line) {
    if (line.match(/^(.*?\s+)?(Mensch|Zwerg|Ork|Troll|Elfe|Elf|Drache|Drachin|Geist)(in)?$/)) {
        return SectionType.Meta;
    }
    else if (ALTERNATE_STATS_LNIE.find((l) => line == l)) { // Note we check for equality here since this is an alternate table representation
        return SectionType.StatsAlternate;
    }
    else if (STATS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Stats;
    }
    else if (STATS_MAGIC_LINES.find((l) => line.startsWith(l))) {
        return SectionType.StatsWithMagic;
    }
    else if (STATS_RES_LINES.find((l) => line.startsWith(l))) {
        return SectionType.StatsWithResonance;
    }
    else if (DR_LINES.find((l) => line.startsWith(l))) {
        return SectionType.DRStats;
    }
    else if (INIT_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Initiative;
    }
    else if (INIT_ASTRAL_LINES.find((l) => line.startsWith(l))) {
        return SectionType.AstralInitiative;
    }
    else if (ACTIONS_LINE.find((l) => line.startsWith(l))) {
        return SectionType.Actions;
    }
    else if (STATUS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Status;
    }
    else if (DEFENSE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Defense;
    }
    else if (SKILLS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Skills;
    }
    else if (SKILLS_POOLED_LINES.find((l) => line.startsWith(l))) {
        return SectionType.SkillsPooled;
    }
    else if (LANG_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Languages;
    }
    else if (GEAR_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Equipment;
    }
    else if (CYBERWARE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Cyberware;
    }
    else if (PROGRAMS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Programs;
    }
    else if (WEAPON_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Weapons;
    }
    else if (SPELLS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Spells;
    }
    else if (VEHICLES_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Vehicles;
    }
    else if (ADEPT_POWERS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.AdeptPowers;
    }
    else if (COMPLEX_FORMS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.ComplexForms;
    }
    else if (METAMAGIC_LINES.find((l) => line.startsWith(l))) {
        return SectionType.MetaMagic;
    }
    else if (INITIATION_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Initiation;
    }
    else if (PERSONA_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Persona;
    }
    else if (POWERS_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Power;
    }
    else if (AGE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Age;
    }
    else if (INFLUENCE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Influence;
    }
    else if (DESC_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Description;
    }
    else {
        return SectionType.None;
    }
}
function nextSection(lines, i) {
    let type = isSectionStart(lines[i]);
    let content = "";
    if (type == SectionType.Meta || type == SectionType.Age || type == SectionType.StatsAlternate) {
        content = lines[i].trim();
    }
    else if (type == SectionType.Description) {
        content = lines[i] + "\n";
    }
    else if (type != SectionType.Stats && type != SectionType.StatsWithMagic && type != SectionType.StatsWithResonance && type != SectionType.DRStats) {
        content = lines[i].split(":", 2)[1].trim();
    }
    i++;
    while (i < lines.length && isSectionStart(lines[i]) == SectionType.None) {
        if (type == SectionType.Description) {
            content += lines[i] + "\n";
        }
        else {
            content += " " + lines[i].trim();
        }
        i++;
    }
    if (type == SectionType.StatsAlternate) {
        let header = content.replace(/[^A-Z]+/g, " ").replace(/\s+/g, " ").trim();
        content = content.replace(/[A-Z]+/g, " ").replace(/\s+/g, " ").trim();
        if (STATS_LINES.find((l) => header.startsWith(l))) {
            type = SectionType.Stats;
        }
        else if (STATS_MAGIC_LINES.find((l) => header.startsWith(l))) {
            type = SectionType.StatsWithMagic;
        }
        else if (STATS_RES_LINES.find((l) => header.startsWith(l))) {
            type = SectionType.StatsWithResonance;
        }
        else {
            throw new Error("Invalid stats line: " + header);
        }
    }
    return new Section(type, i, content.trim());
}
class Skill {
    id;
    value;
    modified_value;
    specialization;
    specialisation_value;
    expertise;
    expertise_value;
    constructor(def, attrs) {
        //                         1     2         3             4       5          6       7
        let matches = def.match(/(.*?) (\d+)(?:\((\d+)\))?(?: \((.*?) \+(\d+)(?:, (.*?) \+(\d+))?\))?/);
        if (matches != null) {
            this.id = skill_to_skill_id(matches[1]);
            this.value = parseInt(matches[2]);
            this.modified_value = this.value;
            if (matches[3] != null) {
                this.modified_value = parseInt(matches[3]);
            }
            ;
            if (matches[4] != null) {
                this.specialization = spec_to_spec_id(this.id, matches[4]);
            }
            if (matches[5] != null) {
                this.specialisation_value = parseInt(matches[5]);
            }
            if (matches[6] != null) {
                this.specialization = spec_to_spec_id(this.id, matches[6]);
            }
            if (matches[7] != null) {
                this.expertise_value = parseInt(matches[7]);
            }
            if (attrs) {
                this.value = pool_to_skill_lvl(attrs, this.id, this.value);
                this.modified_value = pool_to_skill_lvl(attrs, this.id, this.modified_value);
            }
            return this;
        }
        else {
            throw new Error("Invalid skill: " + def);
        }
    }
    /**
     * to_vtt
     */
    to_vtt(attrs) {
        let res = {
            "points": this.value,
            "augment": 0
        };
        if (this.modified_value) {
            res.modifier = this.modified_value - this.value;
        }
        if (this.specialization) {
            res.specialization = this.specialization;
        }
        if (this.expertise) {
            res.expertise = this.specialization;
        }
        return res;
    }
}
export class Attibute {
    value;
    modified_value;
    adjustment;
    constructor(def) {
        let matches = def.match(/([\d,.]+)(?:\(([+]?)(\d+)\))?/);
        if (matches != null) {
            this.value = parseFloat(matches[1].replace(",", "."));
            if (matches[2] == "+" && matches[3] != null) {
                this.adjustment = parseInt(matches[3]);
            }
            else if (matches[3] != null) {
                this.modified_value = parseInt(matches[3]);
            }
        }
        else {
            throw new Error("Invalid attribute: " + def);
        }
    }
    /**
     * to_vtt
     */
    to_vtt() {
        return {
            "base": this.value,
            "mod": this.pool() - this.value,
            "pool": this.pool(),
            "modString": this.adjustment ? this.adjustment.toString() : ""
        };
    }
    /**
     * pool
     */
    pool() {
        return this.modified_value || this.value;
    }
}
class Attributes {
    constitution;
    agility;
    reaction;
    strength;
    willpower;
    logic;
    intuition;
    charisma;
    essence;
    special;
    edge;
    constructor(def, has_special = false) {
        def = def.replace(/\s+\(/g, "(");
        let parts = def.split(" ").map(def => {
            return new Attibute(def);
        });
        if (parts.length >= 9) {
            this.constitution = parts[0];
            this.agility = parts[1];
            this.reaction = parts[2];
            this.strength = parts[3];
            this.willpower = parts[4];
            this.logic = parts[5];
            this.intuition = parts[6];
            this.charisma = parts[7];
            if (parts.length == 9 && !has_special) {
                this.essence = parts[8];
            }
            else if (parts.length == 10 && !has_special) {
                this.edge = parts[8];
                this.essence = parts[9];
            }
            else if (parts.length == 10) {
                this.special = parts[8];
                this.essence = parts[9];
            }
            else if (parts.length == 11 && has_special) {
                this.edge = parts[8];
                this.special = parts[9];
                this.essence = parts[10];
            }
            else {
                throw new Error("Invalid attributes: " + def);
            }
        }
        else {
            throw new Error("Invalid attributes: " + def);
        }
    }
    /*
     * to_vtt
     */
    to_vtt(mortype) {
        let res = {
            "bod": this.constitution.to_vtt(),
            "agi": this.agility.to_vtt(),
            "rea": this.reaction.to_vtt(),
            "str": this.strength.to_vtt(),
            "wil": this.willpower.to_vtt(),
            "log": this.logic.to_vtt(),
            "int": this.intuition.to_vtt(),
            "cha": this.charisma.to_vtt(),
        };
        switch (mortype) {
            case Special.Magic: {
                res["mag"] = this.special?.to_vtt();
                break;
            }
            case Special.Resonance: {
                res["res"] = this.special?.to_vtt();
                break;
            }
        }
        return res;
    }
}
class Cyberware {
    level;
    mods;
    name;
    constructor(def) {
        def = def.trim();
        let matches = def.trim().match(/(.+?)\s*\[Stufe (\d+?)\],?/);
        if (matches != null) {
            this.name = matches[1];
            this.level = parseInt(matches[2]);
            return this;
        }
        matches = def.match(/(.+?)\s*\[Stufe (\d+?);(.*)\],?/);
        if (matches != null) {
            this.name = matches[1];
            this.level = parseInt(matches[2]);
            this.mods = matches[3].split(",").map(x => x.trim());
            return this;
        }
        matches = def.match(/(.+?)\s*\[(.+?)\],?/);
        if (matches != null) {
            this.name = matches[1];
            this.mods = matches[2].split(",").map(x => x.trim());
            return this;
        }
        matches = def.trim().match(/(.+?)\s+(\d+?),?/);
        if (matches != null) {
            this.name = matches[1];
            this.level = parseInt(matches[2]);
            return this;
        }
        this.name = def.replace(/,$/, "");
    }
    /**
     * to_vtt
     */
    to_vtt() {
        return {
            "name": this.name,
            "type": "gear",
            "data": {
                "type": "CYBERWARE",
                "accessories": this.mods?.join(", ") || "",
            },
        };
    }
}
class Item {
    mods;
    name;
    constructor(def) {
        def = def.trim();
        let matches = def.match(/(.+?)\s*\[(.+?)\],?/);
        if (matches != null) {
            this.name = matches[1];
            this.mods = matches[2].split(/[,;]/).map(x => x.trim());
            return this;
        }
        this.name = def.replace(/,$/, "");
    }
    /**
     * to_vtt
     */
    to_vtt() {
        return this.guess_type({
            "name": this.name,
            "type": "gear",
            "data": {
                "accessories": this.mods?.join(", ") || "",
            },
            "effects": []
        });
    }
    // Some minimal heuristics to group the items
    guess_type(res) {
        if (this.name.match(/kommlink|commlink/i)) {
            res.data.type = "ELECTRONICS";
            res.data.subtype = "COMMLINK";
        }
        else if (this.name.match(/deck/i)) {
            res.data.type = "ELECTRONICS";
            res.data.subtype = "CYBERDECK";
        }
        else if (this.name.match(/panzer|armor/i)) {
            res.data.type = "ARMOR";
            res.data.subtype = "ARMOR_BODY";
        }
        else if (this.name.match(/helm|helmet/i)) {
            res.data.type = "ARMOR";
            res.data.subtype = "ARMOR_HELMET";
        }
        return res;
    }
}
const WEAPON_MAPPING = {
    "Waffenlos": "waffenloser kampf",
    "Wurfwaffe": "werfen",
    "Gewehr": "gewehre",
    "Granate": "werfen",
};
class Weapon {
    name;
    type;
    damage;
    damage_type;
    modi = [];
    attack_value = [0, 0, 0, 0, 0];
    ammo;
    mods = [];
    detonation_range;
    constructor(name, attrs) {
        this.name = name;
        //  Fix possible issue with words being split by `-`
        attrs = attrs.replace(/([A-Za-z]+)-\s*([a-z]+)/, "$1$2");
        let data = attrs.split(/[|,]/).map(x => x.trim());
        this.type = data[0];
        // FIXME internationalize
        let damage = data[1].match(/(?:Schaden|DV) (\d+)(.*)/);
        if (damage == null) {
            this.damage = data[1];
        }
        else {
            this.damage = parseInt(damage[1]);
            this.damage_type = damage[2];
        }
        let i = 2;
        if (data[i] == null) {
            return;
        }
        // FIXME internationalize
        let detonation_range1 = data[i].match(/(:?Sprengwirkung|Blast) (\d+).*/);
        if (detonation_range1 !== null) {
            this.detonation_range = parseInt(detonation_range1[1]);
            i++;
        }
        if (data[i] == null) {
            return;
        }
        if (!data[i].startsWith("Angriffswerte")) {
            this.modi = data[i].split("/").map(x => x.trim());
            i++;
        }
        if (data[i] == null) {
            return;
        }
        // FIXME internationalize
        let attack_value = data[i].match(/(?:(?:Angriffswerte|Attack Ratings) )?(.+)/);
        if (attack_value !== null) {
            this.attack_value = attack_value[1].split("/").map(x => {
                if (x == "-") {
                    return 0;
                }
                else {
                    return parseInt(x) || 0;
                }
            });
            while (this.attack_value.length < 5) {
                this.attack_value.push(0);
            }
            i++;
        }
        if (data[i] == null) {
            return;
        }
        // FIXME internationalize
        let detonation_range = data[i].match(/Sprengwirkung (\d+).*/);
        if (detonation_range !== null) {
            this.detonation_range = parseInt(detonation_range[1]);
            i++;
        }
    }
    skill() {
        // we need this to avoiud recursiuon
        const mapping = {
            "blades": "close_combat",
            "clubs": "close_combat",
            "unarmed": "close_combat",
            "gunnery": "engineering",
            "assault_cannons": "firearms",
            "holdouts": "firearms",
            "machine_pistols": "firearms",
            "pistols_heavy": "firearms",
            "pistols_light": "firearms",
            "rifles": "firearms",
            "shotguns": "firearms",
            "submachine_guns": "firearms",
            "tasers": "firearms",
            "whips": "firearms",
            "archery": "athletics",
            "throwing": "athletics"
        };
        // FIXME
        let spec_id = this.spec();
        if (spec_id == null) {
            return undefined;
        }
        else {
            return mapping[spec_id];
        }
    }
    item_type() {
        let skill = this.skill();
        if (skill == null) {
            return "WEAPON_RANGED";
        }
        else {
            return "WEAPON_" + skill.toUpperCase();
        }
    }
    item_subtype() {
        let spec = this.spec();
        if (spec == null) {
            return "THROWING";
        }
        else {
            return spec.toUpperCase();
        }
    }
    spec() {
        // Check for normal sigular and plural forms as well
        return spec_to_spec_id(null, WEAPON_MAPPING[this.type] || this.type) ||
            spec_to_spec_id(null, this.type + "n") || spec_to_spec_id(null, this.type + "s");
    }
    accessories() {
        return this.mods.join(", ");
    }
    /**
     * to_vtt
     */
    to_vtt() {
        return {
            "name": this.name,
            "type": "gear",
            "data": {
                "dmgDef": this.damage.toString() + this.damage_type,
                "dmg": this.damage,
                "stun": this.damage_type != "S",
                "attackRating": this.attack_value,
                "modes": {
                    "BF": this.modi.includes("BF"),
                    "FA": this.modi.includes("FA"),
                    "SA": this.modi.includes("SA"),
                    "SS": this.modi.includes("SS"),
                },
                "type": this.item_type(),
                "subtype": this.item_subtype(),
                "skill": this.skill(),
                "skillSpec": this.spec(),
                "accessories": this.accessories(),
            },
            "effects": []
        };
    }
}
class Spell {
    name;
    constructor(name) {
        this.name = name;
    }
    /**
     * to_vtt
     */
    to_vtt() {
        return {
            "name": this.name,
            "type": "spell",
        };
    }
}
class Program {
    name;
    constructor(name) {
        this.name = name;
    }
    /**
     * to_vtt
     */
    to_vtt() {
        return {
            "name": this.name,
            "type": "gear",
            "data": {
                // FIXME: we don't have a type/subtype for programs
                "type": "ELECTRONICS",
                "subtype": "ELECTRONIC_ACCESSORIES",
            }
        };
    }
}
class Vehicles {
    name;
    constructor(name) {
        this.name = name;
    }
}
class AdeptPower {
    name;
    constructor(name) {
        this.name = name;
    }
    /**
     * to_vtt
     */
    to_vtt() {
        return {
            "name": this.name,
            "type": "quality",
            "data": {
                "category": "ADEPT_WAY",
                "level": false,
                "value": 1,
                "modifier": []
            },
            "effects": []
        };
    }
}
class ComplexForm {
    name;
    constructor(name) {
        this.name = name;
    }
}
class MetaMagic {
    name;
    constructor(name) {
        this.name = name;
    }
}
class Language {
    name;
    constructor(name) {
        this.name = name;
    }
    /**
     * to_vtt
     */
    to_vtt() {
        return {
            "name": this.name,
            "type": "skill",
            "data": {
                "genesisID": "language",
                "points": 1,
                "modifier": 0
            },
            "effects": []
        };
    }
}
class Persona {
    name;
    constructor(name) {
        this.name = name;
    }
    /**
     * to_vtt
     */
    to_vtt() {
        // FIXME
        return {
            "device": {
                "mod": {
                    "a": null,
                    "s": null,
                    "d": null,
                    "f": null
                }
            }
        };
    }
}
class Power {
    name;
    constructor(name) {
        this.name = name;
    }
}
class MetaType {
    name;
    constructor(name) {
        this.name = name;
    }
}
class Status {
    body;
    will;
    constructor(def) {
        let matches = def.match(/(\d+)(?:\/(\d+))?/);
        if (matches != null) {
            this.body = parseInt(matches[1]);
            if (matches[2] != null) {
                this.will = parseInt(matches[2]);
            }
            else {
                this.will = this.body;
            }
        }
        else {
            throw new Error("Could not parse status: " + def);
        }
    }
}
class Initiative {
    initiative;
    die;
    constructor(def) {
        let matches = def.match(/^(\d+)\s+[+]\s+(\d+)[WwDd]6/);
        if (matches == null) {
            this.initiative = parseInt(def);
        }
        else if (matches.length == 3) {
            this.initiative = parseInt(matches[1]);
            this.die = parseInt(matches[2]);
        }
        else {
            throw new Error("Invalid Initiative: " + def);
        }
    }
    /**
     * to_vtt
     */
    to_vtt(base) {
        return {
            "mod": this.initiative - base,
            "dice": this.die || 0
        };
    }
}
var Special;
(function (Special) {
    Special[Special["None"] = 0] = "None";
    Special[Special["Magic"] = 1] = "Magic";
    Special[Special["Resonance"] = 2] = "Resonance";
})(Special || (Special = {}));
class Section {
    type;
    end;
    content;
    constructor(type, end, content) {
        this.type = type;
        this.end = end;
        this.content = content;
    }
}
export class NPC {
    name;
    meta_type;
    age;
    size;
    weight;
    influence;
    desc;
    attributes;
    special = Special.None;
    initiative = new Initiative("0");
    astralInitiative;
    status = new Status("0");
    defense = 0;
    skills = [];
    powers;
    languageskills;
    persona;
    complexForms;
    initiation;
    metaMagic;
    adeptPowers;
    spells;
    bodytech;
    items = [];
    vehicles = [];
    programs;
    weapons = [];
    constructor(data) {
        let lines = data.trim().split("\n");
        this.name = lines[0];
        let i = 1;
        while (i < lines.length && isSectionStart(lines[i]) == SectionType.None) {
            this.name += " " + lines[i].trim();
            i++;
        }
        while (i < lines.length) {
            let section = nextSection(lines, i);
            i = section.end;
            switch (section.type) {
                case SectionType.Meta: {
                    this.meta_type = new MetaType(section.content);
                    break;
                }
                case SectionType.Age: {
                    let matcehs = section.content.match(/^Alter: (\d+)\s+Größe\/Gewicht: ([\d,]+) m\/(\d+) kg$/);
                    if (matcehs != null) {
                        this.age = parseInt(matcehs[1]);
                        this.size = parseFloat(matcehs[2].replace(",", "."));
                        this.weight = parseInt(matcehs[3]);
                    }
                    else {
                        this.age = parseInt(section.content);
                    }
                    break;
                }
                case SectionType.Influence: {
                    this.influence = parseInt(section.content);
                    break;
                }
                case SectionType.Description: {
                    this.desc = section.content;
                    break;
                }
                case SectionType.StatsWithMagic: {
                    this.special = Special.Magic;
                    this.attributes = new Attributes(section.content, true);
                    break;
                }
                case SectionType.StatsWithResonance: {
                    this.special = Special.Resonance;
                    this.attributes = new Attributes(section.content, true);
                    break;
                }
                case SectionType.Stats: {
                    this.attributes = new Attributes(section.content, false);
                    break;
                }
                case SectionType.DRStats: {
                    //                                       1        2           3      4                      5         6        8     9
                    //                                       2     (  7   )       4   /  1     A1  ,   I2       9       / 9       10  / 15   /+  1
                    let matches_en = section.content.match(/(\d+)(?:\((\d*)\))?\s+(\d+)\/(\d+)\s+A\d+,\s*I\d+\s+(\d+)(?:(\/\d+))?\s+\d+\/\d+\/\+\d+/);
                    //                                        1      2                      3         4        8     9
                    //                                        4   /  1     A1  ,   I2       9       / 9       10  / 15   /+  1
                    let matches_enCritter = section.content.match(/(\d+)\/(\d+)\s+A\d+,\s*I\d+\s+(\d+)(?:(\/\d+))?\s+\d+\/\d+\/\+\d+/);
                    // 9 12/1 (physique) 10/2 (astrale) MAJ 1, MIN 2 (physique) MAJ 1, MIN 3 (astrale) 11 10/15/+1 12
                    let matches_fr = section.content.match(/^(\d+)\s+(\d+)\/(\d+)(?:\s*\([^)]+\))?(?:\s*[^\/]+?\/.+?\s*\([^)]+\))*\s+MAJ\s+\d+,\s*MIN\s+\d+(?:\s*\([^)]+\))?(?:\s*MAJ\s*\d+,\s*MIN\s*\d+\s*\([^)]+\))*\s+(\d+)(?:\s+\([^)]+\))?(?:\s+\d+\s+\([^)]+\))*\s+\d+\/\s*\d+\/\s*\+\d(?:\s+\d+)?$/);
                    if (matches_en) {
                        console.log("SR6E | Test 1");
                        this.defense = parseInt(matches_en[2]) || parseInt(matches_en[1]) || 0;
                        // This is a bit of a cheat)
                        this.initiative = new Initiative(matches_en[3] + " + " + matches_en[4] + "W6");
                        this.status = new Status(matches_en[5]);
                    }
                    else if (matches_enCritter) {
                        console.log("SR6E | Test 2");
                        this.defense = 0;
                        // This is a bit of a cheat
                        this.initiative = new Initiative(matches_enCritter[1] + " + " + matches_enCritter[2] + "W6");
                        this.status = new Status(matches_enCritter[3]);
                    }
                    else if (matches_fr) {
                        this.defense = parseInt(matches_fr[1]);
                        // This is a bit of a cheat
                        this.initiative = new Initiative(matches_fr[2] + " + " + matches_fr[3] + "W6");
                        this.status = new Status(matches_fr[4]);
                    }
                    else {
                        throw new Error("Could not parse DR stats: " + section.content);
                    }
                    break;
                }
                case SectionType.Status: {
                    this.status = new Status(section.content);
                    break;
                }
                case SectionType.Initiation: {
                    this.initiation = parseInt(section.content);
                    break;
                }
                case SectionType.Initiative: {
                    this.initiative = new Initiative(section.content);
                    break;
                }
                case SectionType.AstralInitiative: {
                    this.astralInitiative = new Initiative(section.content);
                    break;
                }
                case SectionType.Defense: {
                    this.defense = parseInt(section.content);
                    break;
                }
                case SectionType.SkillsPooled:
                case SectionType.Skills: {
                    let attributes = (section.type == SectionType.SkillsPooled) ? this.attributes : undefined;
                    let j = 0;
                    let in_brackets = false;
                    let skill = "";
                    while (j < section.content.length) {
                        switch (section.content[j]) {
                            case "(": {
                                in_brackets = true;
                                break;
                            }
                            case ")": {
                                in_brackets = false;
                                break;
                            }
                            case ",": {
                                if (!in_brackets) {
                                    this.skills.push(new Skill(skill.trim(), attributes));
                                    skill = "";
                                    j++;
                                }
                                break;
                            }
                        }
                        skill += section.content[j];
                        j++;
                    }
                    this.skills.push(new Skill(skill.trim(), attributes));
                    break;
                }
                case SectionType.Languages: {
                    this.languageskills = section.content.split(",").map(x => x.trim()).map(x => new Language(x));
                    break;
                }
                case SectionType.Equipment: {
                    let j = 0;
                    let in_brackets = false;
                    let item = "";
                    while (j < section.content.length) {
                        switch (section.content[j]) {
                            case "[": {
                                in_brackets = true;
                                break;
                            }
                            case "]": {
                                in_brackets = false;
                                break;
                            }
                            case ",": {
                                if (!in_brackets) {
                                    this.items.push(new Item(item.trim()));
                                    item = "";
                                    j++;
                                }
                                break;
                            }
                        }
                        item += section.content[j];
                        j++;
                    }
                    this.items.push(new Item(item.trim()));
                    break;
                }
                case SectionType.Cyberware: {
                    let matches = section.content.match(/\s*.+?(?:\[.*?\])?(?:,|$)/g);
                    if (matches !== null) {
                        this.bodytech = matches.map(x => new Cyberware(x.trim()));
                    }
                    else {
                        throw new Error("Invalid bodytech: " + section.content);
                    }
                    break;
                }
                case SectionType.Weapons: {
                    let j = 0;
                    let in_brackets = false;
                    let expected_close = "]";
                    let name = "";
                    let attrs = "";
                    while (j < section.content.length) {
                        let c = section.content[j];
                        switch (c) {
                            case "[": {
                                if (!in_brackets) {
                                    expected_close = "]";
                                }
                                in_brackets = true;
                                j++;
                                continue;
                            }
                            case "(": {
                                if (!in_brackets) {
                                    expected_close = ")";
                                }
                                in_brackets = true;
                                j++;
                                continue;
                            }
                            case ")":
                            case "]": {
                                if (in_brackets && c == expected_close) {
                                    in_brackets = false;
                                    this.weapons.push(new Weapon(name, attrs));
                                    name = "";
                                    attrs = "";
                                }
                                j++;
                                continue;
                            }
                        }
                        if (in_brackets) {
                            attrs += c;
                        }
                        else {
                            name += c;
                        }
                        j++;
                    }
                    break;
                }
                case SectionType.Spells: {
                    this.spells = section.content.split(",").map(x => new Spell(x.trim()));
                    break;
                }
                case SectionType.Vehicles: {
                    this.vehicles = section.content.split(",").map(x => new Vehicles(x.trim()));
                    break;
                }
                case SectionType.AdeptPowers: {
                    this.adeptPowers = section.content.split(",").map(x => new AdeptPower(x.trim()));
                    break;
                }
                case SectionType.Programs: {
                    this.programs = section.content.split(",").map(x => new Program(x.trim()));
                    break;
                }
                case SectionType.ComplexForms: {
                    this.complexForms = section.content.split(",").map(x => new ComplexForm(x.trim()));
                    break;
                }
                case SectionType.MetaMagic: {
                    this.metaMagic = section.content.split(",").map(x => new MetaMagic(x.trim()));
                    break;
                }
                case SectionType.Persona: {
                    this.persona = new Persona(section.content);
                    break;
                }
                case SectionType.Power: {
                    this.powers = section.content.split(",").map(x => new Power(x.trim()));
                    break;
                }
            }
        }
        if (!this.attributes) {
            throw new Error("Invalid stats block");
        }
    }
    skills_to_vtt() {
        let skills = {};
        for (let skill of this.skills) {
            skills[skill.id] = skill.to_vtt(this.attributes);
        }
        return skills;
    }
    defenserating() {
        return {};
    }
    mortype() {
        switch (this.special) {
            case Special.Magic:
                if (this.spells != undefined && this.adeptPowers != undefined) {
                    return "mysticadept";
                }
                else if (this.adeptPowers != undefined) {
                    return "adept";
                }
                else {
                    return "magician";
                }
            case Special.Resonance:
                return "technomancer";
            default:
                return "mundane";
        }
    }
    /**
     * to_vtt
     */
    to_vtt() {
        let physical = {
            "base": this.status.body,
            "value": this.status.body,
        };
        let stun = {
            "base": this.status.will,
            "value": this.status.will,
        };
        let edge = {
            "value": this.attributes.edge || 0,
            "max": this.attributes.edge || 0,
        };
        let initiative = {
            "physical": this.initiative.to_vtt(this.attributes.reaction.pool() + this.attributes.intuition.pool()),
        };
        if (this.astralInitiative && this.attributes.special) {
            initiative.astral = this.astralInitiative.to_vtt(this.attributes.special.pool());
        }
        let data = {
            "attributes": this.attributes.to_vtt(this.special),
            "metatype": this.meta_type,
            "gender": "",
            "physical": physical,
            "stun": stun,
            "edge": edge,
            "defenserating": this.defenserating(),
            "initiative": initiative,
            "skills": this.skills_to_vtt(),
            "name": this.name,
            "mortype": this.mortype(),
            "persona": this.persona?.to_vtt() || {},
            "attackrating": {
                "physical": {
                    "mod": 0
                },
                "astral": {
                    "mod": 0
                },
                "matrix": {
                    "mod": 0
                }
            },
        };
        let items = [];
        items = items.concat(this.languageskills?.map(x => x.to_vtt()) || []);
        items = items.concat(this.adeptPowers?.map(x => x.to_vtt()) || []);
        items = items.concat(this.items?.map(x => x.to_vtt()) || []);
        items = items.concat(this.weapons?.map(x => x.to_vtt()) || []);
        items = items.concat(this.bodytech?.map(x => x.to_vtt()) || []);
        items = items.concat(this.programs?.map(x => x.to_vtt()) || []);
        return {
            "name": this.name,
            "type": "NPC",
            "items": items,
            "data": data,
        };
    }
}