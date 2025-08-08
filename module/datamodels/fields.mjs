import {SR6Config} from "../config.js";
const {fields} = foundry.data;

/**
 * A class object used to represent an Actors OverWatch Score
 */
export class OverwatchScoreField extends fields.SchemaField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super({
            value: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
        }, options, context);
    }

    /**
     * Determine whether the Overwatch Score is so high that Convergence is occuring
     * @type {boolean}
     */
    get convergence() {
        return (this.value >= 40);
    }

    reset() {
        this.value = 0;
    }
}