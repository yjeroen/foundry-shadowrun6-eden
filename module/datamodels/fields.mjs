import {SR6Config} from "../config.js";
import SR6MatrixPersona from "./property-matrix-persona-model.mjs";
const {fields} = foundry.data;

/**
 * A class object used to represent an Actors OverWatch Score
 */
// export class OverwatchField extends fields.SchemaField {
export class SR6MatrixFields extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        super(SR6MatrixPersona, options, context);
    }
}