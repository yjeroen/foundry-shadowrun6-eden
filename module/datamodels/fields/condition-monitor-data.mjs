import SR6DataModel from "./base-model.mjs";

export default class SR6ConditionMonitor extends SR6DataModel {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            // Boxes should be set in the Actor DataModel.prepareBaseData()
            boxes: new fields.NumberField({required: true, nullable: false, integer: true, initial: 9, min: 9}),
            // Dmg is the number input field on the ActorSheet to determine how much damage the Actor has taken in total (incl Overflow)
            dmg: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
        };
    }

    /**
     * The current value of boxes that aren't damaged
     */
    get value() {
        return this.boxes - this.dmg;
    }

    // TODO: Support conditional overflow, with overflow pointer to other monitor

    /**
     * Legacy support of monitor.max
     */
    get max() {
        return this.boxes;
    }

}