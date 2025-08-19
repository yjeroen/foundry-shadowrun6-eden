import SR6DataModel from "./base-model.mjs";

export default class SR6AttributeData extends SR6DataModel {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            rank: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1, positive: true}),
            mod: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0, max: 4}),
        };
    }

    get pool() {
        return this.rank + this.mod;
    }

    validate(options) {
        if (this.name) {
            let choices = CONFIG.SR6.NEW.ATTRIBUTES;
            if (! Object.hasOwn(choices, this.name)) throw new Error(`${this.name} is not a valid attribute name for the SR6AttributeData class`);
        }
        return super.validate(options);
    }

}