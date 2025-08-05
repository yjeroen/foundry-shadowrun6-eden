function skill_to_skill_id(skill) {
    skill = skill.toLowerCase();
    skill = skill.replace(/-\s+/g, ''); // Cleanup word breaks caused by line breaks
    let SKILL_MAP = game.i18n.translations.skill;
    for (const id in SKILL_MAP) {
        if (SKILL_MAP[id].toLowerCase() == skill) {
            return id;
        }
    }
    // Fallback to English check
    if (game.i18n.lang !== 'en' && game.i18n._fallback.skill) {
        console.log('SR6E | NPC Importer | Fallback check if skill is English');
        SKILL_MAP = game.i18n._fallback.skill;
        for (const id in SKILL_MAP) {
            if (SKILL_MAP[id].toLowerCase() == skill) {
                return id;
            }
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
    } else {
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
    
    // Fallback to English check
    if (game.i18n.lang !== 'en' && game.i18n._fallback.shadowrun6) {
        SPECIALIZATION_MAP = game.i18n._fallback.shadowrun6.special;
            if (skill != null) {
                for (const id in SPECIALIZATION_MAP[skill]) {
                    for (const spec_id in SPECIALIZATION_MAP[skill]) {
                        if (SPECIALIZATION_MAP[skill][spec_id].toLowerCase() == spec) {
                            return spec_id;
                        }
                    }
                }
            } else {
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
    SectionType[SectionType["Knowledge"] = 4] = "Knowledge";
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
const STATS_LINES = [
    // DE specific
    /^K$/g,
    /^K G R$/g,    // Netzgewitter
    /^K G R S W L I C/g, 

    // EN specific
    /^B$/g,
    /^B A R S W L I C/g, 

    // FR specific
    /^CON AGI RÉA FOR VOL LOG INT CHA.*/g
];
const DR_LINES = ["DR I/ID AC CM MOVE", "I/ID AC CM MOVE", "SD I/DI PA ME DÉPLACEMENT", "SD I/DI PA ME DÉPLACEMENT DRAIN", "SD I/DI PA ME DÉPLA. DRAIN", "SD I/DI PA ME DÉPLA.", "SD I/DI PA ME DÉPLA. TECHNO."]; // the french books are inconsistent
const INIT_LINES = ["Initiative:"]; // DE specific
const INIT_ASTRAL_LINES = ["Astrale Initiative:"]; // DE specific
const ACTIONS_LINE = ["Handlungen:"]; // DE specific
const STATUS_LINES = ["Zustandsmonitor:"]; // DE specific
const DEFENSE_LINES = ["Verteidigungswert:"]; // DE specific
const SKILLS_LINES = ["Fertigkeiten:", "Aktionsfertigkeiten:", "Skills:", "Compétences :"];
const SKILLS_POOLED_LINES = ["Fertigkeiten (Würfelpools):"]; // DE specific extra books
const LANG_LINES = ["Sprachfertigkeiten:"]; // DE specific extra books
const KNOWLEDGE_LINES = ["Wissensfertigkeiten:"]; // DE (Netzgewitter)
const GEAR_LINES = ["Ausrüstung:", "Gear:", "Équipement :"];
const CYBERWARE_LINES = ["Bodytech:", "Augmentations:", "Augmentations :", "Augmentations (alphaware) :"]; // FR specific alphaware
const WEAPON_LINES = ["Waffen:", "Weapons:", "Armes :"];
const SPELLS_LINES = ["Zauber:", "Spells:", "Sorts :"];
const VEHICLES_LINES = ["Fahrzeuge und Drohnen:", "Vehicles and Drones:", "Véhicules et drones :"];
const ADEPT_POWERS_LINES = ["Adeptenkräfte:", "Adept Powers:", "Powers:", "Pouvoirs d’adepte :"];
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
    else if (STATS_LINES.find((l) => line.match(l))) {
        return SectionType.Stats;
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
    else if (KNOWLEDGE_LINES.find((l) => line.startsWith(l))) {
        return SectionType.Knowledge;
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
    if (type == SectionType.Meta || type == SectionType.Age || type == SectionType.Stats) {
        content = lines[i].trim();
    }
    else if (type == SectionType.Description) {
        content = lines[i] + "\n";
    }
    else if (type != SectionType.Stats && type != SectionType.DRStats) {
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
        console.log("SR6E | NPC Importer | Matching Attributes:\n", def, '\n', matches);
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


/**
 * Language patterns to detect the language of the attribute header.
 */
const languagePatterns = {
            'de': /^KGRSWLIC/,
            'en': /^BARSWLIC/,
            'fr': /^CONAGIRÉAFORVOLLOGINTCHA/
        };

/**
 * Mapping of attribute headers to their respective english equivalents.
 * Only those attribute headers that differ from english are required.
 */
const attribute_language_mapping = {
    de: {
        "K": "B",
        "G": "A",
    },
    fr: {
        "CON": "B",
        "AGI": "A",
        "RÉA": "R",
        "FOR": "S",
        "VOL": "W",
        "LOG": "L",
        "INT": "I",
        "CHA": "C",
        "MAG": "M",
    }
};

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
    edge;
    magic;
    resonance;
    constructor(def) {
        // Separate header from values and convert whitespace charactes into simple spaces.
        let header = def.replace(/[^A-ZÀ-Ÿ]+/g, " ").replace(/\s+/g, " ").trim();
        let valuesString = def.replace(/[A-ZÀ-Ÿ]+/g, " ").replace(/\s+/g, " ").trim();

        console.log("SR6E | NPC Importer | Converted header for import:", header);

        // Normalize header to english
        const keys = this.normalizeHeader(header);

        // Merge header + values into a dictionary
        const values = valuesString.split(" ");
        const dict = {};
        for (let i = 0; i < keys.length; i++) {
            dict[keys[i]] = values[i];
        }

        console.log("SR6E | NPC Importer | Converted dict:", dict);
        this.constitution = dict["B"] ? new Attibute(dict["B"]) : undefined;
        this.agility = dict["A"] ? new Attibute(dict["A"]) : undefined;
        this.reaction = dict["R"] ? new Attibute(dict["R"]) : undefined;
        this.strength = dict["S"] ? new Attibute(dict["S"]) : undefined;
        this.willpower = dict["W"] ? new Attibute(dict["W"]) : undefined;
        this.logic = dict["L"] ? new Attibute(dict["L"]) : undefined;
        this.intuition = dict["I"] ? new Attibute(dict["I"]) : undefined;
        this.charisma = dict["C"] ? new Attibute(dict["C"]) : undefined;
        if(dict["M"] !== undefined) {
            this.magic = new Attibute(dict["M"]);
        } else if(dict["RES"] !== undefined) {
            this.resonance = new Attibute(dict["RES"]);
        }
        this.essence = dict["ESS"] ? new Attibute(dict["ESS"]) : undefined;
        this.edge = dict["EDG"] ? new Attibute(dict["EDG"]) : undefined;
    }

    /**
     * Detect the language of the attribute header.
     * @param {string} header The header of the untranslated attribute stats block.
     * @returns The detected language of the attribute header.
     */
    detectLanguage(header) {
        const normalizedHeader = header.replace(/\s+/g, "").toUpperCase();
        console.log("SR6E | NPC Importer | Normalized header for language recognition", normalizedHeader);
        
        for (const [language, pattern] of Object.entries(languagePatterns)) {
            if (pattern.test(normalizedHeader)) {
                return language;
            }
        }

        throw new Error("Unknown attribute language | header:" + header, "| normalizedHeader:", normalizedHeader);
    }

    /**
     * Converts the untranslated attribute header to a list of english attributes titles.
     * @param {string} header The untranslated header string of the attribute stats block.
     * @returns A translated attribute header list.
     */
    normalizeHeader(header) {
        const language = this.detectLanguage(header);
        const headerList = header.trim().split(" ");
        const map = attribute_language_mapping[language] ?? {};

        const normalized = headerList.map(h => map[h] ?? h);
        return normalized;
    }

    /*
     * to_vtt
     */
    to_vtt() {
        const nullAtribute = new Attibute("0").to_vtt();;
        let res = {
            "bod": this.constitution.to_vtt(),
            "agi": this.agility.to_vtt(),
            "rea": this.reaction.to_vtt(),
            "str": this.strength.to_vtt(),
            "wil": this.willpower.to_vtt(),
            "log": this.logic.to_vtt(),
            "int": this.intuition.to_vtt(),
            "cha": this.charisma.to_vtt(),
            "mag": this.magic?.to_vtt() || nullAtribute,
            "res": this.resonance?.to_vtt() || nullAtribute,
        };
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
            "system": {
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
            "system": {
                "accessories": this.mods?.join(", ") || "",
            },
            "effects": []
        });
    }
    // Some minimal heuristics to group the items
    guess_type(res) {
        if (this.name.match(/kommlink|commlink/i)) {
            res.system.type = "ELECTRONICS";
            res.system.subtype = "COMMLINK";
        }
        else if (this.name.match(/deck/i)) {
            res.system.type = "ELECTRONICS";
            res.system.subtype = "CYBERDECK";
        }
        else if (this.name.match(/panzer|armor/i)) {
            res.system.type = "ARMOR";
            res.system.subtype = "ARMOR_BODY";
        }
        else if (this.name.match(/helm|helmet/i)) {
            res.system.type = "ARMOR";
            res.system.subtype = "ARMOR_HELMET";
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
            "system": {
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
            "system": {
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
            "type": "adeptpower",
            "system": {
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
            "system": {
                "genesisID": "language",
                "points": 1,
                "modifier": 0
            },
            "effects": []
        };
    }
}
class KnowledgeSkill {
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
            "system": {
                "genesisID": "knowledge",
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
    biography;
    meta_type;
    age;
    size;
    weight;
    influence;
    desc;
    attributes;
    initiative = new Initiative("0");
    astralInitiative;
    status = new Status("0");
    defense = 0;
    skills = [];
    powers;
    languageskills;
    knowledgeSkills;
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
        console.log("SR6E | NPC Importer | Processing data:\n", data, lines);
        this.name = lines[0];
        this.biography = "";
        let i = 1;
        while (i < lines.length && isSectionStart(lines[i]) == SectionType.None) {
            this.biography += lines[i].trim() + "\n";
            i++;
        }
        while (i < lines.length) {
            let section = nextSection(lines, i);
            i = section.end;
            console.log("SR6E | NPC Importer | Processing section", SectionType[section.type], section);
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
                case SectionType.Stats: {
                    this.attributes = new Attributes(section.content);
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
                        console.log("SR6E | NPC Importer | Matches English");
                        // TODO add Physical Monitor Mod based on calculation and difference with CM 
                        this.defense = parseInt(matches_en[2]) || parseInt(matches_en[1]) || 0;
                        // This is a bit of a cheat)
                        this.initiative = new Initiative(matches_en[3] + " + " + matches_en[4] + "W6");
                        this.status = new Status(matches_en[5]);
                    }
                    else if (matches_enCritter) {
                        console.log("SR6E | NPC Importer | Matches English Critter");
                        this.defense = 0;
                        // This is a bit of a cheat
                        this.initiative = new Initiative(matches_enCritter[1] + " + " + matches_enCritter[2] + "W6");
                        this.status = new Status(matches_enCritter[3]);
                    }
                    else if (matches_fr) {
                        console.log("SR6E | NPC Importer | Matches French");
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
                case SectionType.Knowledge: {
                    this.knowledgeSkills = section.content.split(",").map(x => x.trim()).map(x => new KnowledgeSkill(x));
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
                        // Bracket check is causing issues e.g. with
                        //   "Nagelmesser (einziehbar) [Klingenwaffe | Schaden 2K | 6/–/–/–/–]"
                        //   "Bogen (Stufe 5) [Bogen | Schaden 3K | 3/5/2/–/– | 20Pfeile]"
                        //      (see Netzgewitter, p. 174, #Daemonika / p. 184 #Feral)
                        // Logic thinks the first ')' is the end of the weapon definition.
                        // Why an additional check for '(' and ')'?
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
        if(this.attributes.magic) {
            if (this.spells != undefined && this.adeptPowers != undefined) {
                return "mysticadept";
            }
            else if (this.adeptPowers != undefined) {
                return "adept";
            }
            else {
                return "magician";
            }
        } else if (this.attributes.resonance) {
            return "technomancer";
        } else
            return "mundane";
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
            "value": this.attributes.edge?.value || 0,
            "max": this.attributes.edge?.value || 0,
        };
        let initiative = {
            "physical": this.initiative.to_vtt(this.attributes.reaction.pool() + this.attributes.intuition.pool()),
        };
        if (this.astralInitiative && this.attributes.magic) {
            initiative.astral = this.astralInitiative.to_vtt(this.attributes.magic.pool());
        }
        let data = {
            "attributes": this.attributes.to_vtt(),
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
            "notes": this.biography.replace(/-\s+/g, ""),  // Cleanup word breaks caused by line breaks
        };
        let items = [];
        items = items.concat(this.languageskills?.map(x => x.to_vtt()) || []);
        items = items.concat(this.knowledgeSkills?.map(x => x.to_vtt()) || []);
        items = items.concat(this.adeptPowers?.map(x => x.to_vtt()) || []);
        items = items.concat(this.items?.map(x => x.to_vtt()) || []);
        items = items.concat(this.weapons?.map(x => x.to_vtt()) || []);
        items = items.concat(this.bodytech?.map(x => x.to_vtt()) || []);
        items = items.concat(this.programs?.map(x => x.to_vtt()) || []);
        return {
            "name": this.name,
            "type": "NPC",
            "items": items,
            "system": data,
        };
    }
}