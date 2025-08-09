/**
 * System specific DataModel with extra helpers
 */

export default class SR6DataModel extends foundry.abstract.DataModel {
    get actor() {
        let schema = "", pointer = this;
        while (schema !== "system") {
            schema = pointer.schema.name;
            pointer = this.parent;
        }
        return pointer.parent;
    }

    async _updateValue(property="", value) {
        let uri = property, schema = "", pointer = this;
        while (schema !== "system") {
            schema = pointer.schema.name;
            uri = schema + "." + uri;
            pointer = this.parent;
        }
        console.log('JEROEN uri', uri, value);
        return await pointer.parent.update({[uri]: value});
    }
}