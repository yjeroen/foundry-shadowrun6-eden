import SR6DataModel from "./base-model.mjs";

export default class SR6ConditionMonitor extends SR6DataModel {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            // This is the #Boxes; Actual maximum of value must be managed in DataModel.prepareBaseData()
            max: new fields.NumberField({required: true, nullable: false, integer: true, initial: 9, min: 9}),
            // value is the "HP", min and max should be handled in TODO JEROEN
            value: new fields.NumberField({required: true, nullable: false, integer: true, initial: 9}),
        };
    }

    /**
     * The current value of damaged boxes
     */
    get dmg() {
        return this.max - this.value;
    }
    
    parseDmgToValue(damage) {
        const s = String(damage);
        const isDelta = s.startsWith("+") || s.startsWith("-");
        const n = Number(damage);
        if (!Number.isFinite(n)) {
            throw new Error("SR6 | Invalid Dmg input");
        }
        if (this.dmg === 0 && s.startsWith("-")) {
            throw new Error("SR6 | Dmg input causes no changes");
        }
        const v = Math.trunc(n);
        const newDmg = Math.max(0,  isDelta ? this.dmg + v : v  );
        return this.max - newDmg;
    }

}