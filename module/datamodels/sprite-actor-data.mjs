import SR6BaseActorData from './base-actor-data.mjs';
import * as srFields from "./fields/fields.mjs";
import { InitiativeType } from "../dice/RollTypes.js";

export default class SR6SpriteActorData extends SR6BaseActorData {
    
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        'SR6.Actor.sprite'
    ];

    /**
     * Default metadata which applies to each instance of this Document type.
     * @type {object}
     */
    static metadata = Object.freeze({
        type: "sprite"
    });

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            type: new fields.StringField({required: false, nullable: true, choices: this.TYPES}),
            level: new fields.NumberField({required: true, nullable: false, blank: false, integer: true, initial: 1, min: 1, choices: CONFIG.SR6.RATING}),
            tasksOwned: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1}),
            compiledBy: new fields.DocumentUUIDField({type: "Actor"}),
            registered: new fields.BooleanField(),
            matrix: new srFields.SR6MatrixField(),
            attributes: new fields.SchemaField({
                willpower: new srFields.SR6AttributeField(),
                logic: new srFields.SR6AttributeField(),
                intuition: new srFields.SR6AttributeField(),
                charisma: new srFields.SR6AttributeField(),
                resonance: new srFields.SR6AttributeField(),
                // Example for other Actor Types:
                // edge: new srFields.SR6EdgeAttributeField(),
                // body: new srFields.SR6AttributeField()
            }),
            skills: new fields.SchemaField({
                electronics: new srFields.SR6SkillField({primaryAttribute: "logic", useUntrained: true}),
                engineering: new srFields.SR6SkillField({primaryAttribute: "logic", useUntrained: true}),
                cracking: new srFields.SR6SkillField({primaryAttribute: "logic", useUntrained: false}),
                con: new srFields.SR6SkillField({primaryAttribute: "charisma", useUntrained: true}),
            }),
            edge: new srFields.SR6EdgeAttributeField(),
            initiative: new fields.SchemaField({
                matrix: new srFields.SR6InitiativeField(),
            }),
            
            // Example for other Actor Types:
            // health: new fields.SchemaField({
            //     physicalCM: new srFields.SR6ConditionMonitorField(),
            //     stunCM: new srFields.SR6ConditionMonitorField()
            // })
        };
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
        console.log("SR6E | SR6SpriteActorData._preUpdate()", changes);
        this.#_handleTypeChange(changes);

        return await super._preUpdate(changes, options, user);;
    }

    #_handleTypeChange(changes) {
        if ( (this.type || foundry.utils.hasProperty(changes, "system.type"))  ||
             ((this.type || foundry.utils.hasProperty(changes, "system.type")) && foundry.utils.hasProperty(changes, "system.level"))
            ) {
            const type = foundry.utils.hasProperty(changes, "system.type") ? changes.system.type : this.type;
            const level = foundry.utils.hasProperty(changes, "system.level") ? changes.system.level : this.level;
            this.#_prepareSpriteBase(changes, type, level);
            this.#_prepareSpriteType(changes, type, level);
        }
    }

    #_prepareSpriteBase(changes, type, level) {
        foundry.utils.setProperty(changes, "system.matrix.conditionMonitor.max", Math.round( level / 2 ) + 8);
        foundry.utils.setProperty(changes, 'system.attributes.willpower.rank', level);
        foundry.utils.setProperty(changes, 'system.attributes.logic.rank', level);
        foundry.utils.setProperty(changes, 'system.attributes.intuition.rank', level);
        foundry.utils.setProperty(changes, 'system.attributes.charisma.rank', level);
        foundry.utils.setProperty(changes, 'system.attributes.resonance.rank', level);        
    }

    #_prepareSpriteType(changes, type, level) {
        let attack, sleaze, dataProcessing, firewall, iniRank, iniDice, skills=[];
        switch (type) {
            case 'courier':
                attack          = level
                sleaze          = level + 3
                dataProcessing  = level + 1
                firewall        = level + 2
                iniRank         = (level * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'crack':
                attack          = level
                sleaze          = level + 3
                dataProcessing  = level + 2
                firewall        = level + 1
                iniRank         = (level * 2) + 2
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'data':
                attack          = level - 1
                sleaze          = level
                dataProcessing  = level + 4
                firewall        = level + 1
                iniRank         = (level * 2) + 4
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'fault':
                attack          = level + 3
                sleaze          = level
                dataProcessing  = level + 1
                firewall        = level + 2
                iniRank         = (level * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'machine':
                attack          = level + 1
                sleaze          = level
                dataProcessing  = level + 3
                firewall        = level + 2
                iniRank         = (level * 2) + 3
                iniDice         = 4
                skills          = ['electronics', 'engineering']
                break;
            case 'assassin':
                attack          = level + 3
                sleaze          = level + 2
                dataProcessing  = level + 1
                firewall        = level
                iniRank         = (level * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'defender':
                attack          = level
                sleaze          = level + 1
                dataProcessing  = level + 2
                firewall        = level + 3
                iniRank         = (level * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'modular':
                attack          = level + 1
                sleaze          = level + 2
                dataProcessing  = level + 1
                firewall        = level + 2
                iniRank         = (level * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'music':
                attack          = level
                sleaze          = level
                dataProcessing  = level + 4
                firewall        = level
                iniRank         = (level * 2) + 4
                iniDice         = 4
                skills          = ['electronics', 'con']
                break;
            case 'primal':
                attack          = level + 3
                sleaze          = level + 1
                dataProcessing  = level + 3
                firewall        = level + 1
                iniRank         = (level * 2) + 3
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
        }
        foundry.utils.setProperty(changes, 'system.matrix.attributes.attack', attack);
        foundry.utils.setProperty(changes, 'system.matrix.attributes.sleaze', sleaze);
        foundry.utils.setProperty(changes, 'system.matrix.attributes.dataProcessing', dataProcessing);
        foundry.utils.setProperty(changes, 'system.matrix.attributes.firewall', firewall);
        foundry.utils.setProperty(changes, 'system.initiative.matrix.rank', iniRank);
        foundry.utils.setProperty(changes, 'system.initiative.matrix.dice', iniDice);
        skills.forEach((skill) => 
            foundry.utils.setProperty(changes, `system.skills.${skill}.rank`, level)
        );
    }

    /**
     * Returns the Device Level of the sprite
     */
    get deviceRating() {
        return this.level;
    }

    /**
     * Returns the lifespan in hours of the Sprite since it was compiled
     */
    get lifespan() {
        if (this.registered)
            return Infinity;
        else
            return this.level * 2;
    }

    static POWERS = {
        camouflage: "Compendium.shadowrun6-eden.sprite_powers.Item.X2zj2g8Zm2lgcZd8",
        captiveAudience: "Compendium.shadowrun6-eden.sprite_powers.Item.5mnBMgIuI56CbwVw",
        cookie: "Compendium.shadowrun6-eden.sprite_powers.Item.7OXesBXY1t9O3yzq",
        deathMark: "Compendium.shadowrun6-eden.sprite_powers.Item.efjbgwhndoTF9Y7c",
        diagnostics: "Compendium.shadowrun6-eden.sprite_powers.Item.zSKO6quhv5ao4Jxh",
        digitalScream: "Compendium.shadowrun6-eden.sprite_powers.Item.Ikqpa9QcVhhiQvoM",
        electronStorm: "Compendium.shadowrun6-eden.sprite_powers.Item.NVCrfwsAg3Wzv511",
        fractalDream: "Compendium.shadowrun6-eden.sprite_powers.Item.f815quSgPc6NkjJG",
        harmonize: "Compendium.shadowrun6-eden.sprite_powers.Item.rUPJxlqhLSLy0Rm0",
        hash: "Compendium.shadowrun6-eden.sprite_powers.Item.pd2ZLYcUJcuoZ7t8",
        modular: "Compendium.shadowrun6-eden.sprite_powers.Item.eIrm7ZniQc0VpU1D",
        override: "Compendium.shadowrun6-eden.sprite_powers.Item.1HtRoqWOOIhamzYa",
        phantom: "Compendium.shadowrun6-eden.sprite_powers.Item.MYIpOyuO8dT3aPVX",
        shield: "Compendium.shadowrun6-eden.sprite_powers.Item.j07BYRPDS55pvyng",
        stability: "Compendium.shadowrun6-eden.sprite_powers.Item.nkYbTn9VzHQmlbSD",
        suppression: "Compendium.shadowrun6-eden.sprite_powers.Item.kstnDhfPpTWOXTs1",
        trap: "Compendium.shadowrun6-eden.sprite_powers.Item.prSKOQVv7iashbVx",
        watermark: "Compendium.shadowrun6-eden.sprite_powers.Item.bGTgcmL0wBFICRng"
    };

    static POWERS_BY_TYPE = {
        courier: [
            this.POWERS.cookie,
            this.POWERS.hash
        ],
        crack: [
            this.POWERS.phantom,
            this.POWERS.suppression
        ],
        data: [
            this.POWERS.camouflage,
            this.POWERS.watermark
        ],
        fault: [
            this.POWERS.electronStorm,
            this.POWERS.trap
        ],
        machine: [
            this.POWERS.diagnostics,
            this.POWERS.override,
            this.POWERS.stability
        ],
        assassin: [
            this.POWERS.deathMark,
            this.POWERS.phantom
        ],
        defender: [
            this.POWERS.shield,
            this.POWERS.stability
        ],
        modular: [
            this.POWERS.modular
        ],
        music: [
            this.POWERS.captiveAudience,
            this.POWERS.harmonize
        ],
        primal: [
            this.POWERS.digitalScream,
            this.POWERS.fractalDream
        ]
    };

    async _onUpdate(changed, options, userId) {
        await super._onUpdate(changed, options, userId);

        const type = changed.system?.type;

        if (type) {
            // First delete old powers that were autoAdded
            const actor = this.parent;

            const deleteIDs = actor.items
                             .filter((item) => item.getFlag("shadowrun6-eden", "autoAdded") === true)
                             .map((item) => item.id);
            await actor.deleteEmbeddedDocuments("Item", deleteIDs);

            // Then autoAdd new powers
            const POWERS_BY_TYPE = this.constructor.POWERS_BY_TYPE;
            const flags = { flags: { 'shadowrun6-eden': { autoAdded: true } } };
            const uuids = POWERS_BY_TYPE[type] ?? [];
            const powers = await Promise.all(uuids.map((uuid) => fromUuid(uuid)));

            const itemData = powers
                            .map((power) => {
                                return foundry.utils.mergeObject(power.toObject(), flags, {
                                    inplace: false
                                });
                            });
            await actor.createEmbeddedDocuments("Item", itemData);
        }
        
    }

    prepareBaseInitiative() {
        this.initiative.default = InitiativeType.MATRIX;
    }

}