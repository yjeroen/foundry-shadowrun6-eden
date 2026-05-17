import {SR6Config} from "../../config.js";
import SR6MatrixPersonaData from "./matrix-persona-data.mjs";
import SR6ConditionMonitor from "./condition-monitor-data.mjs";
import SR6SkillData from "./skill-data.mjs";
import SR6AttributeData from "./attribute-data.mjs";
import SR6EdgeAttributeData from "./attribute-edge-data.mjs";
import SR6InitiativeData from "./initiative-data.mjs";
const {fields} = foundry.data;

/**
 * A class object used to represent an Actors OverWatch Score
 */
export class SR6MatrixField extends fields.EmbeddedDataField {
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
export class SR6ConditionMonitorField extends fields.EmbeddedDataField {
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
export class SR6AttributeField extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6AttributeData, options, context);
    }
    
    /**
     * Refer to its rank attribute
     *  @param {FormInputConfig} config         Form element configuration parameters
     * @returns {HTMLElement|HTMLCollection}    A rendered HTMLElement for the field
     */
    _toInput(config) {
        return this.fields.rank._toInput(config);
    }
}

/**
 * Edge Attribute
 */
export class SR6EdgeAttributeField extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6EdgeAttributeData, options, context);
    }

}

/**
 * Initiative fields
 */
export class SR6InitiativeField extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6InitiativeData, options, context);
    }
    
    /**
     * Refer to its rank attribute
     *  @param {FormInputConfig} config         Form element configuration parameters
     * @returns {HTMLElement|HTMLCollection}    A rendered HTMLElement for the field
     */
    _toInput(config) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("stat-value-initiative");
        const rankInput = this.fields.rank._toInput({
             ...config,
            name: this.fieldPath + ".rank"
        });
        const diceInput = this.fields.dice._toInput({
             ...config,
            name: this.fieldPath + ".dice",
            value: foundry.utils.getProperty(config.actor, this.fieldPath + ".dice")
        });
        wrapper.append(rankInput, "+", diceInput, "D6");
        return wrapper
    }
}


/**
 * A Skill
 */
export class SR6SkillField extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor({primaryAttribute=null, useUntrained=false, ...options}={}, context={}) {
        super(SR6SkillData, options, context);
        
        this.primaryAttribute = primaryAttribute;
        this.useUntrained = useUntrained;
    }

    /**
     * The attribute ID which this skill is associated with by default, used for determining the dice pool when rolling this skill. This should be one of the following strings:
     * "body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma", "magic", or "resonance". This is not validated by the field itself.
     * @type {string}
     */
    primaryAttribute;

    /**
     * Whether or not to include untrained ranks when calculating the dice pool for this skill. 
     * This is used for skills which can be used untrained, and should be false for skills which cannot be used untrained.
     * @type {boolean}
     */
    useUntrained;
    
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
export default class SR6CommonField {

    /**
     * Armor class fields shared between characters, NPCs, and vehicles.
     *
     * @type {CommonFieldData}
     */
    static get commonFieldExample() {
        return true;
    }


}