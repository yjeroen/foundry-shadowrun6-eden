import {SR6Config} from "../../config.js";
import SR6MatrixPersonaData from "./matrix-persona-data.mjs";
import SR6ConditionMonitor from "./condition-monitor-data.mjs";
import SR6SkillData from "./skill-data.mjs";
import SR6AttributeData from "./attribute-data.mjs";
import SR6InitiativeData from "./initiative-data.mjs";
const {fields} = foundry.data;

/**
 * A class object used to represent an Actors OverWatch Score
 */
export class SR6MatrixFields extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6MatrixPersonaData, options, context);
    }
}

/**
 * A Condition Monitor
 */
export class SR6ConditionMonitorFields extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6ConditionMonitor, options, context);
    }
}

/**
 * A (physical/mental/special) Attribute
 */
export class SR6AttributeFields extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6AttributeData, options, context);
    }
}

/**
 * Initiative fields
 */
export class SR6InitiativeFields extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6InitiativeData, options, context);
    }
}


/**
 * A Skill
 */
export class SR6SkillFields extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6SkillData, options, context);
    }
}

/**
 * A subclass of [StringField]{@link StringField} that is used specifically for the SR6SkillData "specialization" and "expertises" fields.
 */
export class SkillSpecializationField extends fields.StringField {
    /** @inheritdoc */
    static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
        choices: true
    });
    }

    /**
     * Test whether a provided value is a valid choice from the allowed specialization set
     * @param {string} value      The provided value
     * @returns {boolean}         Is the choice valid?
     * @protected
     */
    _isValidChoice(value) {
        if (this.name !== "specializations" && this.name !== "expertise") {
            throw new Error(`SkillSpecializationField must only be used with the system name "specializations" or "expertise"`);
        }
        if (this.parent.name) {
            let choices = CONFIG.SR6.skill_special[this.parent.name];
            if (Object.hasOwn(choices, value)) return true;
            else throw new Error(`is not a valid skill specialization for the SR6SkillData class`);
        }
        return true;
    }

}

/**
 * Shared contents of the attributes schema between various actor types.
 */
export default class SR6CommonFields {

    /**
     * Armor class fields shared between characters, NPCs, and vehicles.
     *
     * @type {CommonFieldData}
     */
    static get commonFieldExample() {
        return true;
    }


}