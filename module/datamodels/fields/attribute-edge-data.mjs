import SR6AttributeData from "./attribute-data.mjs";

export default class SR6EdgeAttributeData extends SR6AttributeData {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            rank: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1, positive: true}),
            mod: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0, max: 4}),
            current: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0, max: 7}),
        };
    }

    get pool() {
        return this.rank + this.mod;
    }

    /**
     * Reset your Edge.
     */
    async reset() {
        await this._updateValue( "current", Math.min(7, this.rank+this.mod) );
    }

    /**
     * Legacy conversion for rolls
     * TODO - this is a temporary solution to allow Edge to be used in rolls without refactoring all rolls to use the new data model. This should be removed once rolls are updated to use the new data model and test against the pool instead of current/max values.
     */
    get value() {
        return this.current;
    }
    set value(newValue) {
        // this._updateValue("current", newValue);
        this.current = newValue;
    }
    get max() {
        return this.pool;
    }
}