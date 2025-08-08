import {SR6Config} from "../config.js";
import SR6Overwatch from "./property-overwatch-model.mjs";
const {fields} = foundry.data;

/**
 * A class object used to represent an Actors OverWatch Score
 */
export class OverwatchField extends fields.EmbeddedDataField {
    /**
     * @param {DataFieldOptions} [options]        Options which configure the behavior of the field
     * @param {DataFieldContext} [context]        Additional context which describes the field
     */
    constructor(options={}, context={}) {
        // const fields = foundry.data.fields;
        console.warn('DEBUG SR6Overwatch=', SR6Overwatch);
        console.warn('DEBUG isSubclass(SR6Overwatch, foundry.abstract.DataModel)=',  foundry.utils.isSubclass(SR6Overwatch, foundry.abstract.DataModel));
        console.warn('DEBUG EmbeddedDataField=', fields.EmbeddedDataField);
        
        super(new fields.EmbeddedDataField(SR6Overwatch), options, context);
    }
}