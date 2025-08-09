import SR6MatrixIcon from "./property-matrix-icon-model.mjs";

export default class SR6MatrixPersona extends SR6MatrixIcon {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
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