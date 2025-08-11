import SR6DataModel from "./base-model.mjs";

export default class SR6MatrixIcon extends SR6DataModel {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            iconDescription: new fields.HTMLField(),
            _iconImg: new fields.FilePathField({categories: ["IMAGE"]})
        };
    }

    get iconImg() {
        if (this._iconImg === null) {
            return this.actor.img;
        } else {
            return this._iconImg;
        }
    }
    set iconImg(img) {
        this._iconImg = img;
    }

}