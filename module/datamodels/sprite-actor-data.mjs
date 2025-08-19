import SR6BaseActorData from './base-actor-data.mjs';
import * as srFields from "./fields/fields.mjs";

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
            rating: new fields.NumberField({required: true, nullable: false, blank: false, integer: true, initial: 1, min: 1, choices: CONFIG.SR6.RATING}),
            tasksOwned: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1}),
            compiledBy: new fields.DocumentUUIDField({type: "Actor"}),
            registered: new fields.BooleanField(),
            matrix: new srFields.SR6MatrixFields(),
            attributes: new fields.SchemaField({
                willpower: new srFields.SR6AttributeFields(),
                logic: new srFields.SR6AttributeFields(),
                intuition: new srFields.SR6AttributeFields(),
                charisma: new srFields.SR6AttributeFields(),
                resonance: new srFields.SR6AttributeFields(),
            }),
            skills: new fields.SchemaField({
                electronics: new srFields.SR6SkillFields(),
                engineering: new srFields.SR6SkillFields(),
                cracking: new srFields.SR6SkillFields(),
                con: new srFields.SR6SkillFields()
            })
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
        if ( (this.type || foundry.utils.hasProperty(changes, "system.type"))  ||
             ((this.type || foundry.utils.hasProperty(changes, "system.type")) && foundry.utils.hasProperty(changes, "system.rating"))
            ) {
            const type = foundry.utils.hasProperty(changes, "system.type") ? changes.system.type : this.type;
            const rating = foundry.utils.hasProperty(changes, "system.rating") ? changes.system.rating : this.rating;
            this.#_prepareSpriteBase(changes, type, rating);
            this.#_prepareSpriteType(changes, type, rating);
        }
        return true;
    }

    #_prepareSpriteBase(changes, type, rating) {
        foundry.utils.setProperty(changes, "system.matrix.conditionMonitor.boxes", Math.round( rating / 2 ) + 8);
        foundry.utils.setProperty(changes, 'system.attributes.willpower.rank', rating);
        foundry.utils.setProperty(changes, 'system.attributes.logic.rank', rating);
        foundry.utils.setProperty(changes, 'system.attributes.intuition.rank', rating);
        foundry.utils.setProperty(changes, 'system.attributes.charisma.rank', rating);
        foundry.utils.setProperty(changes, 'system.attributes.resonance.rank', rating);        
    }

    #_prepareSpriteType(changes, type, rating) {
        let attack, sleaze, dataProcessing, firewall, iniRank, iniDice, skills=[];
        switch (type) {
            case 'courier':
                attack          = rating
                sleaze          = rating + 3
                dataProcessing  = rating + 1
                firewall        = rating + 2
                iniRank         = (rating * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'crack':
                attack          = rating
                sleaze          = rating + 3
                dataProcessing  = rating + 2
                firewall        = rating + 1
                iniRank         = (rating * 2) + 2
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'data':
                attack          = rating - 1
                sleaze          = rating
                dataProcessing  = rating + 4
                firewall        = rating + 1
                iniRank         = (rating * 2) + 4
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'fault':
                attack          = rating + 3
                sleaze          = rating
                dataProcessing  = rating + 1
                firewall        = rating + 2
                iniRank         = (rating * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'machine':
                attack          = rating + 1
                sleaze          = rating
                dataProcessing  = rating + 3
                firewall        = rating + 2
                iniRank         = (rating * 2) + 3
                iniDice         = 4
                skills          = ['electronics', 'engineering']
                break;
            case 'assassin':
                attack          = rating + 3
                sleaze          = rating + 2
                dataProcessing  = rating + 1
                firewall        = rating
                iniRank         = (rating * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'defender':
                attack          = rating
                sleaze          = rating + 1
                dataProcessing  = rating + 2
                firewall        = rating + 3
                iniRank         = (rating * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'modular':
                attack          = rating + 1
                sleaze          = rating + 2
                dataProcessing  = rating + 1
                firewall        = rating + 2
                iniRank         = (rating * 2) + 1
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
            case 'music':
                attack          = rating
                sleaze          = rating
                dataProcessing  = rating + 4
                firewall        = rating
                iniRank         = (rating * 2) + 4
                iniDice         = 4
                skills          = ['electronics', 'con']
                const notes     = `Skill Con: Performance only`
                foundry.utils.setProperty(changes, 'system.notes', 
                    (foundry.utils.hasProperty(changes, "system.notes") ? changes.system.notes += ' '+notes : notes)
                );
                break;
            case 'primal':
                attack          = rating + 3
                sleaze          = rating + 1
                dataProcessing  = rating + 3
                firewall        = rating + 1
                iniRank         = (rating * 2) + 3
                iniDice         = 4
                skills          = ['electronics', 'cracking']
                break;
        }
        foundry.utils.setProperty(changes, 'system.matrix.attributes.attack', attack);
        foundry.utils.setProperty(changes, 'system.matrix.attributes.sleaze', sleaze);
        foundry.utils.setProperty(changes, 'system.matrix.attributes.dataProcessing', dataProcessing);
        foundry.utils.setProperty(changes, 'system.matrix.attributes.firewall', firewall);
        foundry.utils.setProperty(changes, 'system.matrix.initiative.rank', iniRank);
        foundry.utils.setProperty(changes, 'system.matrix.initiative.dice', iniDice);
        skills.forEach((skill) => 
            foundry.utils.setProperty(changes, `system.skills.${skill}.rank`, rating)
        );
    }

    /**
     * Returns the Device Rating of the sprite
     */
    get deviceRating() {
        return this.rating;
    }

    /**
     * Returns the lifespan in hours of the Sprite since it was compiled
     */
    get lifeSpan() {
        if (this.registered)
            return Infinity;
        else
            return this.rating * 2;
    }

}