import SR6BaseActorData from './base-actor-model.mjs';
import * as srFields from "./fields.mjs";

export default class SR6SpriteActorData extends SR6BaseActorData {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        'SR6.Actor.Sprite',
    ];

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            rating: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1}),
            registeredTo: new fields.DocumentUUIDField({type: "Actor"}),
            overwatchScore: new srFields.OverwatchScoreField(),
            // attributes: new fields.SchemaFields({

            // }),
        }
    }

    // Matrix Condition Monitor is (L /2) + 8
    // lifespan (rating x 2) hours (unless they are registered
    // Overwatch Score
    // Device Rating and Resonance equal to their rating
    // Their Matrix attributes, initiative, Matrix Condition Monitor, and skills are based on their type and rating
    // Types: Courier Sprite, etc
    // Derived: Attack, Sleaze, Data Processing, Firewall, Initiative, Resonance
    // Skills, Powers

    prepareDerivedData() {
        super.prepareDerivedData();

        console.log('JEROEN SR6SpriteActorData parent', this.parent);
    }

    /**
     * Determine whether the Sprite is registered
     * Can be called via actor.system.dead
     * @type {boolean}
     */
    get registered() {
        return (this.registeredTo !== null);
    }


}