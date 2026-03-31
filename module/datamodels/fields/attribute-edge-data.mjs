import SR6AttributeData from "./attribute-data.mjs";

export default class SR6EdgeAttributeData extends SR6AttributeData {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            rank: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1, positive: true}),
            mod: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0, max: 4}),
            current: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 0, max: 7}),
        };
    }

    /**
     * Reset your Edge.
     */
    async reset() {
        await this._updateValue( "current", Math.min(7, this.rank+this.mod) );
    }

}