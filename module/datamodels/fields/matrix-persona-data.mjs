import SR6MatrixIcon from "./matrix-icon-data.mjs";
import * as srFields from "./fields.mjs";

export default class SR6MatrixPersonaData extends SR6MatrixIcon {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            // attributes should be set in the Actor DataModel.prepareBaseData()
            attributes: new fields.SchemaField({
                attack: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                sleaze: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                dataProcessing: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                firewall: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
            }),
            // conditionMonitor can be overwritten with a pointer to e.g. a Character's Deck
            conditionMonitor: new srFields.SR6ConditionMonitorFields(),
            initiative: new srFields.SR6InitiativeFields(),
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