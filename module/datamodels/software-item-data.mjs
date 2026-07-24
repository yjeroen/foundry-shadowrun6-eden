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
            matrix: new fields.SchemaField({
                matrixCM: new srFields.SR6ConditionMonitorField(),
            }),
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

    /**
     * Apply transformations of derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     *
     * Called before {@link ClientDocument#prepareDerivedData} in {@link ClientDocument#prepareData}.
     */
    prepareDerivedData() {
        super.prepareDerivedData();

        if (!this.isIC) this.matrix = undefined;
    }

    /**
     * Called by {@link ClientDocument#_preUpdate}.
     *
     * @param {object} changes            The candidate changes to the Document
     * @param {object} options            Additional options which modify the update request
     * @param {documents.BaseUser} user   The User requesting the document update
     * @returns {Promise<boolean|void>}   A return value of false indicates the update operation should be cancelled.
     * @protected
     * @internal
     */
    async _preUpdate(changes, options, user) {
        await super._preUpdate(changes, options, user);

        this._updateIcIcon(changes);
    }

    _updateIcIcon(changes) {
        if (!this.isIC) return;

        const updatedTypes = changes.system?.multiTypes;
        if (!updatedTypes) return;

        const iconConfig = CONFIG.SR6.ITEM.software.IC;
        const configuredIcons = new Set(
            Object.values(iconConfig)
                .map((config) => config?.icon ?? config)
                .filter(Boolean)
        );

        if (!configuredIcons.has(this.parent.img)) return;

        const addedType = updatedTypes.find((type) => !this.multiTypes.has(type));
        if (!addedType) return;

        const icon = iconConfig[addedType]?.icon ?? iconConfig.icon;
        if (icon && icon !== this.parent.img) {
            console.log(`SR6E | SR6SoftwareItemData._preUpdate | updating IC img from "${this.parent.img}" to "${icon}"`);
            changes.img = icon;
        }
    }

}