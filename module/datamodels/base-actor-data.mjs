/**
 * Base Actor DataModel for SR6e
 *
 * @extends {TypeDataModel}
 * @extends {DataModel}
 * @example notes:
 * this.parent is the Actor document
 */
export default class SR6BaseActorData extends foundry.abstract.TypeDataModel {
    static LOCALIZATION_PREFIXES = ["SR6.Actor.base", "SR6.Common"];

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
            notes: new fields.HTMLField(),
        };
    }

    /**
     * The allowed types which may exist for SR6 ActorData.
     * @type {string[]}
     */
    static get TYPES() {
        return CONFIG.SR6.NEW.ACTOR_TYPES[this.metadata?.type].types ?? [];
        if (CONFIG.SR6.NEW.ACTOR_TYPES[this.metadata?.type].constructor === Array) 
            return CONFIG.SR6.NEW.ACTOR_TYPES[this.metadata?.type];
        else
            return Object.keys(CONFIG.SR6.NEW.ACTOR_TYPES[this.metadata?.type]);
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

    /**
     * Tells you if this Actor is physically alive
     * @returns {boolean}               Actor is physically alive or not
     */
    get isLiveForm() {
        return (this.health && this.health.physicalCM && this.attributes?.body);
    }

    /**
     * Determine whether the character is dead.
     * Can be called via actor.system.isDead
     * @type {boolean}
     */
    get isDead() {
        if (!this.isLiveForm) return null;

        // Example, not applicable in SR6
        if ( this.parent.statuses.has("invulnerable") ) return false;

        return this.health.overflow.dmg >= this.health.overflow.max;
    }

    /**
     * Prepare data related to this DataModel itself, before any derived data is computed.
     *
     * Called before {@link ClientDocument#prepareBaseData} in {@link ClientDocument#prepareData}.
     */
    prepareBaseData() {
        this.#computeHealthOverflow();
    }

    /* -------------------------------------------- */

    /**
     * Apply transformations of derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     *
     * Called before {@link ClientDocument#prepareDerivedData} in {@link ClientDocument#prepareData}.
     */
    prepareDerivedData() {
        console.log('JEROEN prepareDerivedData', this)
        // Augmented Attribute can never be higher than +4
        for (const key in this.attributes) {
            const attribute = this.attributes[key];
            attribute.mod = Math.min(4, attribute.mod);
        }
        // Augmented Skill can never be higher than +4
        for (const key in this.skills) {
            const skill = this.skills[key];
            skill.mod = Math.min(4, skill.mod);
        }
    }

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
    async _preUpdate(changes, options, user) {
        console.log("SR6E | SR6BaseActorData._preUpdate", foundry.utils.duplicate(changes));
        this.#overflowConditionMonitors(changes)
    }

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
    async _onUpdate(changed, options, userId) {        
        await this.#evaluateHealth();
    }

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

    /**
     * 
     * @param {object} changes 
     */
    #overflowConditionMonitors(changes) {
        if (!this.health) return;

        let stunCM = foundry.utils.getProperty(changes, "system.health.stunCM.value") ?? foundry.utils.getProperty(this, "health.stunCM.value");
        let physicalCM = foundry.utils.getProperty(changes, "system.health.physicalCM.value") ?? foundry.utils.getProperty(this, "health.physicalCM.value");
        if (stunCM < 0) {
            physicalCM += stunCM; // stunCM is negative, so this reduces physical
            stunCM = 0;
        }
        foundry.utils.setProperty(changes, "system.health.stunCM.value", stunCM);
        foundry.utils.setProperty(changes, "system.health.physicalCM.value", physicalCM);
    }

    #computeHealthOverflow() {
        if (!this.isLiveForm) return;

        // TODO JEROEN remove after testing
        this.attributes.body.rank = 4;
        this.health.overflow = {
            max: this.attributes.body.pool * 2,
            dmg: Math.max(0, this.health.physicalCM.value * -1)
        };
        this.health.overflow.value = this.health.overflow.max - this.health.overflow.dmg;
    }

    async #evaluateHealth() {
        if (!this.isLiveForm) return;

        if (this.isDead) {
            await this.parent.toggleStatusEffect('dead', {active:true, overlay:true});
            await this.parent.toggleStatusEffect('unconscious', {active:false});
        } else if (this.health.physicalCM.dmg >= this.health.physicalCM.max || this.health.stunCM.dmg === this.health.stunCM.max) {
            await this.parent.toggleStatusEffect('dead', {active:false});
            await this.parent.toggleStatusEffect('unconscious', {active:true});
        } else {
            await this.parent.toggleStatusEffect('dead', {active:false});
            await this.parent.toggleStatusEffect('unconscious', {active:false});
        }
    }

}
