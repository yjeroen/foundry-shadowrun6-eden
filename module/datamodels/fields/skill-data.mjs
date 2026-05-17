import SR6DataModel from "./base-model.mjs";
import {SkillSpecializationField} from "./fields.mjs";

export default class SR6SkillData extends SR6DataModel {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            rank: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
            mod: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0, max: 4}),
            // TODO Replaced ArrayField with TypedObjectField in V13 >> Remove comments after testing
            // specializations: new fields.ArrayField(new SkillSpecializationField()),
            specializations: new fields.TypedObjectField(new SkillSpecializationField()),
            expertise: new SkillSpecializationField()
        };
    }

    get name() {
        return this.schema.name;
    }

    get pool() {
        return this.rank + this.mod;
    }

    get defaultSkillTest() {
        return this.skillTest();
    }

    skillTest(attribute=null) {
        if (this.rank === 0 && !this.schema.useUntrained) return 0;

        if (attribute === null) attribute = this.schema.primaryAttribute;
        const skillPool = this.pool + (this.rank === 0 && this.schema.useUntrained ? -1 : 0);
        const attributePool = foundry.utils.getProperty(this.actor, `system.attributes.${attribute}.pool`) ?? 0;
        return skillPool + attributePool;
    }
    
    validate(options) {
        if (this.name) {
            let choices = CONFIG.SR6.skill_special;
            if (! Object.hasOwn(choices, this.name)) throw new Error(`${this.name} is not a valid skill name for the SR6SkillData class`);
        }
        return super.validate(options);
    }

}