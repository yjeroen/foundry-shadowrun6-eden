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
        };
    }

    get host() {
        if (this.parent.actor?.type !== "host") return null;

        return this.parent.actor;
    }

    get installedCost() {
        if (!this.host) return;

        const hostSystem = this.host.system;

        return Math.round( this.price??0 * hostSystem.rating * hostSystem.scale );
    }

    get installedIn() {
        if (!this.embeddedInUuid || !this.actor) return undefined;

        if (this.host && !this.embeddedInUuid) return this.actor;
        
        const parsed = foundry.utils.parseUuid(this.embeddedInUuid);
        return this.actor.items.get(parsed.id);
    }

}