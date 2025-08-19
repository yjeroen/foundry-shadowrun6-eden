import SR6DataModel from "./base-model.mjs";
import {SkillSpecializationField} from "./fields.mjs";

export default class SR6SkillData extends SR6DataModel {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            rank: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
            // TODO: Look into replacing ArrayField with TypedObjectField in V13
            specializations: new fields.ArrayField(new SkillSpecializationField()),
            expertise: new SkillSpecializationField()
        };
    }

    get name() {
        return this.schema.name;
    }

    validate(options) {
        if (this.name) {
            let choices = CONFIG.SR6.skill_special;
            if (! Object.hasOwn(choices, this.name)) throw new Error(`${this.name} is not a valid skill name for the SR6SkillData class`);
        }
        return super.validate(options);
    }

}