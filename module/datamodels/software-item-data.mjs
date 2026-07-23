import SR6ModItemData from './mod-item-data.mjs';
import * as srFields from "./fields/fields.mjs";

export default class SR6SoftwareItemData extends SR6ModItemData {
    
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        'SR6.Item.software'
    ];

    /**
     * Default metadata which applies to each instance of this Document type.
     * @type {object}
     */
    static metadata = Object.freeze({
        type: "software"
    });

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            subtype: new fields.StringField({required: false, choices: this.SUBTYPES}),
            multiTypes: new fields.SetField(new fields.StringField({required: true, blank: false, choices: this.MULTITYPES})),
        };
    }

    /** @inheritDoc */
    static migrateData(source) {
        const typeOptions = this.TYPES;
        if (!Object.hasOwn(typeOptions, source.type)) source.type = undefined;
        
        const subtypeOptions = this.SUBTYPES;
        if (!Object.hasOwn(subtypeOptions, source.subtype)) source.subtype = undefined;

        return super.migrateData(source);
    }

    get installedCost() {
        const price = this.price ?? 0;
        if (this.actor?.type !== "host" || this.type !== "IC") return price;

        const hostSystem = this.actor.system;

        return Math.round( price * hostSystem.rating * hostSystem.scale );
    }

    get installedIn() {
        if (["host", "Vehicle"].includes(this.actor?.type) && !this.embeddedInUuid) return this.actor;

        if (!this.embeddedInUuid || !this.actor) return undefined;

        const parsed = foundry.utils.parseUuid(this.embeddedInUuid);
        return this.actor.items.get(parsed.id);
    }

    get isIC() {
        return Boolean(this.type === "IC");
    }
    
    get isElectronicMatrixDevice() {
        return Boolean(this.actor?.type === "host");
    }

}