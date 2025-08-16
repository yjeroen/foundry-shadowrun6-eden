import SR6BaseItemData from './base-item-data.mjs';
// import SR6LegacyItemData from './legacy-gear-item-data.mjs';
import * as srFields from "./fields/fields.mjs";

export default class SR6ModItemData extends SR6BaseItemData {
    
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        'SR6.Item.mod'
    ];

    /**
     * Default metadata which applies to each instance of this Document type.
     * @type {object}
     */
    static metadata = Object.freeze({
        type: "mod"
    });

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            embeddedInUuid: new fields.DocumentUUIDField({type: "Item"}),
            type: new fields.StringField({required: false, choices: this.TYPES}),
            // TODO: work out subtype fields
            // mount: new fields.StringField({required: false, nullable: true, choices: this.MOUNT_OPTIONS}),
        };
    }

    get installedIn() {
        if (!this.embeddedInUuid) return undefined;
        const parsed = foundry.utils.parseUuid(this.embeddedInUuid);
        if (this.actor?.id === parsed.primaryId) return this.actor.items.get(parsed.id);
        return undefined
    }

    _onUpdate(changed, options, userId) {
        console.log("SR6E | SR6ModItemData | _onUpdate", changed, options, userId);
        if (this.embeddedInUuid) {
            // Making sure the Item that this mod is installed in gets a rerender if its sheets are open
            this.installedIn.render();
        }
    }

}