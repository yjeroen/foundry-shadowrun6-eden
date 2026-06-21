import SR6DataModel from "./base-model.mjs";
import * as srFields from "./fields.mjs";

export default class SR6MatrixPAN extends SR6DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            // TODO V14 persisted: false in v14, so this administratorUuid isnt saved to the DB
            administratorUuid: new fields.DocumentUUIDField({type: "Actor"}),
            _name: new fields.StringField({required: false}),
        };
    }

    get administrator() {
        return foundry.utils.fromUuidSync(this.administratorUuid);
    }

    get name() {
        return this.administrator.system?.pan?._name || `${this.administrator.name}'s PAN`;;
    }

    get isSlaved() {
        return this.administratorUuid !== this.actor.uuid;
    }

    /**
     * Personal Remote Device Limit, is dependent on your own Persona, not based on a PAN coordinator
     */
    get deviceLimit() {
        const TECHNOMANCER = Boolean( this.actor.system.mortype == "technomancer" );
        const persona = this.actor.system.persona ?? {};
        const remoteDeviceLimit = TECHNOMANCER ? persona.living?.base?.deviceRating : persona.accessDevice?.system?.matrix?.deviceRating;
        return remoteDeviceLimit;
    }

}