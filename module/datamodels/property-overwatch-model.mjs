
export default class SR6Overwatch extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            score: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
        };
    }


    /**
     * Determine whether the Overwatch Score is so high that Convergence is occuring
     * @type {boolean}
     */
    get convergence() {
        return (this.score >= 40);
    }

    reset() {
        this.score = 0;
    }
}