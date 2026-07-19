import SR6MatrixIcon from "./matrix-icon-data.mjs";
import * as srFields from "./fields.mjs";

export default class SR6MatrixDeviceData extends SR6MatrixIcon {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            // attributes should be set in the Item DataModel.prepareBaseData()
            // TODO JEROEN check if these need to be AttributeData objects
            attributes: new fields.SchemaField({
                attack: new fields.NumberField({required: false, nullable: true, integer: true, initial: null, min: 0}),
                sleaze: new fields.NumberField({required: false, nullable: true, integer: true, initial: null, min: 0}),
                dataProcessing: new fields.NumberField({required: false, nullable: true, integer: true, initial: null, min: 0}),
                firewall: new fields.NumberField({required: false, nullable: true, integer: true, initial: null, min: 0})
            }),
            matrixCM: new srFields.SR6ConditionMonitorField(),
            deviceRating: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
            hasWirelessInterface: new fields.BooleanField(),
            hasDataCableInterface: new fields.BooleanField(),
            wirelessActive: new fields.BooleanField(),
        };
    }


    /**
     * Returns the Data Processing of your Electronic Matric Device
     * @type {number}
     */
    get dataProcessing() {
        return this.attributes.dataProcessing ?? this.deviceRating * 2 ;
    }

    /**
     * Returns the Firewall of your Electronic Matric Device
     * @type {number}
     */
    get firewall() {
        return this.attributes.firewall ?? this.deviceRating * 2 ;
    }

}