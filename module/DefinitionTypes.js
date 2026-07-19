export class MagicOrResonanceDefinition {
    magic;
    resonance;
    useSpells;
    usePowers;
    constructor(magic = false, resonance = false, useSpells = false, usePowers = false) {
        this.magic = magic;
        this.resonance = resonance;
        this.useSpells = useSpells;
        this.usePowers = usePowers;
    }
}
export class SkillDefinition {
    attrib;
    useUntrained;
    constructor(attribute, useUntrained) {
        this.attrib = attribute;
        this.useUntrained = useUntrained;
    }
}
export class EdgeBoost {
    cost;
    id;
    when;
    opponent;
    label;
    constructor(cost, id, when, opponent) {
        this.cost = cost;
        this.id = id;
        this.when = when;
        this.opponent = opponent;
        this.label = 'shadowrun6.edge_boost.'+id
    }
}
export class EdgeAction {
    cost;
    id;
    cat;
    skill;
    label;
    constructor(cost, id, cat, skill = "") {
        this.cost = cost;
        this.id = id;
        this.cat = cat;
        this.skill = skill;
        this.label = 'hadowrun6.edge_action.'+id
    }
}
export class Program {
    id;
    type;
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }
}