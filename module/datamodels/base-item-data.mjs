/**
 * Base Item DataModel for SR6e
 *
 * @extends {TypeDataModel}
 * @extends {DataModel}
 * @example notes:
 * this.parent is the Item document
 */
export default class SR6BaseItemData extends foundry.abstract.TypeDataModel {
    static LOCALIZATION_PREFIXES = ["SR6.Item.base", "SR6.Common"];

    static defineSchema() {
        const fields = foundry.data.fields;

        // const requiredInteger = { required: true, nullable: false, integer: true };
        // schema.health = new fields.SchemaField({
        //   value: new fields.NumberField({
        //                ...requiredInteger,
        //                initial: 10,
        //                min: 0,
        //   }),
        //   max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
        // });
        // schema.power = new fields.SchemaField({
        //   value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
        //   max: new fields.NumberField({ ...requiredInteger, initial: 5 }),
        // });

        return {
            description: new fields.HTMLField(),
            genesisID: new fields.StringField({required: false, nullable: true}),
            availDef: new fields.StringField({required: false, nullable: true, initial: "1L"}),
            price: new fields.NumberField({required: true, nullable: false, initial: 0, min: 0}),
            product: new fields.StringField({required: false, choices: CONFIG.SR6.PDF_OPTIONS.BOOKS}),
            page: new fields.NumberField({required: false, nullable: true, initial: null, min: 1}),
        };
    }

    /**
     * The allowed types which may exist for SR6 ItemData.
     * @type {string[]}
     */
    static get TYPES() {
        return CONFIG.SR6.NEW.ITEM_TYPES[this.metadata?.type].types ?? [];
        return Object.keys(CONFIG.SR6.NEW.ITEM_TYPES[this.metadata?.type]?.types ?? {});
    }

    get actor() {
        return this.parent.actor;
    }

    /**
     * Migrate candidate source data for this DataModel which may require initial cleaning or transformations.
     * The source parameter is either original data retrieved from disk or provided by an update operation.
     * @param {object} source           The candidate source data from which the model will be constructed
     * @returns {object}                Migrated source data, if necessary
     */
    static migrateData(source) {
        // >> Example:
        // const proficiencies = source.proficiencies ?? {};
        // if ( "weapons" in proficiencies ) {
        //   proficiencies.weapons = proficiencies.weapons.map(weapon => {
        //     return weapon === "bmr" ? "boomerang" : weapon;
        //   });
        // }

        return super.migrateData(source);
    }

    // >> Example getter
    /**
     * Determine whether the character is dead.
     * Can be called via actor.system.dead
     * @type {boolean}
     */
    // get dead() {
    //   const invulnerable = CONFIG.specialStatusEffects.INVULNERABLE;
    //   if ( this.parent.statuses.has("invulnerable") ) return false;
    //   return this.health.value <= this.health.min;
    // }

    /**
     * Prepare data related to this DataModel itself, before any derived data is computed.
     *
     * Called before {@link ClientDocument#prepareBaseData} in {@link ClientDocument#prepareData}.
     */
    prepareBaseData() {}

    /* -------------------------------------------- */

    /**
     * Apply transformations of derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     *
     * Called before {@link ClientDocument#prepareDerivedData} in {@link ClientDocument#prepareData}.
     */
    prepareDerivedData() {}

    /* -------------------------------------------- */

    /**
     * Convert this Document to some HTML display for embedding purposes.
     * @param {DocumentHTMLEmbedConfig} config  Configuration for embedding behavior.
     * @param {EnrichmentOptions} [options]     The original enrichment options for cases where the Document embed content
     *                                          also contains text that must be enriched.
     * @returns {Promise<HTMLElement|HTMLCollection|null>}
     */
    async toEmbed(config, options={}) {
    return null;
    }

    /* -------------------------------------------- */
    /*  Database Operations                         */
    /* -------------------------------------------- */

    /**
     * Called by {@link ClientDocument#_preCreate}.
     *
     * @param {object} data                         The initial data object provided to the document creation request
     * @param {object} options                      Additional options which modify the creation request
     * @param {documents.BaseUser} user             The User requesting the document creation
     * @returns {Promise<boolean|void>}             Return false to exclude this Document from the creation operation
     * @internal
     */
    async _preCreate(data, options, user) {}

    /* -------------------------------------------- */

    /**
     * Called by {@link ClientDocument#_onCreate}.
     *
     * @param {object} data                         The initial data object provided to the document creation request
     * @param {object} options                      Additional options which modify the creation request
     * @param {string} userId                       The id of the User requesting the document update
     * @protected
     * @internal
     */
    _onCreate(data, options, userId) {}

    /* -------------------------------------------- */

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
    async _preUpdate(changes, options, user) {}

    /* -------------------------------------------- */

    /**
     * Called by {@link ClientDocument#_onUpdate}.
     *
     * @param {object} changed            The differential data that was changed relative to the documents prior values
     * @param {object} options            Additional options which modify the update request
     * @param {string} userId             The id of the User requesting the document update
     * @protected
     * @internal
     */
    _onUpdate(changed, options, userId) {}

    /* -------------------------------------------- */


    /**
     * Called by {@link ClientDocument#_preDelete}.
     *
     * @param {object} options            Additional options which modify the deletion request
     * @param {documents.BaseUser} user   The User requesting the document deletion
     * @returns {Promise<boolean|void>}   A return value of false indicates the deletion operation should be cancelled.
     * @protected
     * @internal
     */
    async _preDelete(options, user) {}

    /* -------------------------------------------- */

    /**
     * Called by {@link ClientDocument#_onDelete}.
     *
     * @param {object} options            Additional options which modify the deletion request
     * @param {string} userId             The id of the User requesting the document update
     * @protected
     * @internal
     */
    _onDelete(options, userId) {}

}
