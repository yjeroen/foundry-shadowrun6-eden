import SR6DataModel from "./base-model.mjs";

export default class SR6InitiativeData extends SR6DataModel {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            rank: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1, positive: true}),
            dice: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1, max: 5})
        };
    }

    get text() {
        return `${this.rank} + ${this.dice}D6`;
    }

    get actions() {
        return {
            major: 1,
            minor: 1+this.dice,
            // TODO localize
            text: `${this.rank} Major, ${1+this.dice} Minor`
        };
    }

    validate(options) {
        if (this.name) {
            if (this.name !== "initiative") throw new Error(`${this.name} is not a valid name for the SR6AttributeData class`);
        }
        return super.validate(options);
    }

}