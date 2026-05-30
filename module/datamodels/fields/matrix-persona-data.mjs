import SR6MatrixIcon from "./matrix-icon-data.mjs";
import * as srFields from "./fields.mjs";

export default class SR6MatrixPersonaData extends SR6MatrixIcon {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            // attributes should be set in the Actor DataModel.prepareBaseData()
            // TODO JEROEN check if these need to be AttributeData objects
            attributes: new fields.SchemaField({
                attack: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                sleaze: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                dataProcessing: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                firewall: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
            }),
            // conditionMonitor can be overwritten with a pointer to e.g. a Character's Deck
            matrixCM: new srFields.SR6ConditionMonitorField(),
            initiative: new srFields.SR6InitiativeField(),
            overwatchScore: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
        };
    }


    /**
     * Determine whether the Overwatch Score is so high that Convergence is occuring
     * @type {boolean}
     */
    get convergence() {
        return (this.overwatchScore >= 40);
    }

    /**
     * Returns your Matrix Cybercombat Attack Rating
     * @type {number}
     */
    get attackRating() {
        return this.attributes.attack + this.attributes.sleaze;
    }

    /**
     * Returns your Matrix Cybercombat Defense Rating
     * @type {number}
     */
    get defenseRating() {
        return this.attributes.dataProcessing + this.attributes.firewall;
    }

    /**
     * Returns a Matrix Test Pool
     * @param {number} matrixAttr   Matrix Attribute
     * @param {number} physAttr     Physical Attribute
     * @return {number}             Number of dice
     */
    testPool(matrixAttr, physAttr) {
        const matrix = this.attributes[matrixAttr] ?? 0;
        const mental = foundry.utils.getProperty(this.actor, `system.attributes.${physAttr}.pool`) ?? 0;
        return matrix + mental;
    }

    /**
     * Reset your Overwatch Score.
     */
    async rebootDevice() {
        await this._updateValue("overwatchScore", 0);
    }

    checkOS() {
        if (this.actor.isOwner) {
            ui.notifications.info(game.i18n.format("shadowrun6.ui.notifications.matrix_check_os", { os: this.overwatchScore }));
            return this.overwatchScore;
        }
    }
}