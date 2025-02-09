function getSystemData(obj) {
    if (game.release.generation >= 10)
        return obj.system;
    return obj.data.data;
}
function getActorData(obj) {
    if (game.release.generation >= 10)
        return obj;
    return obj.data;
}
export class SR6ItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["shadowrun6", "sheet", "item"],
            width: 605
        });
    }
    get template() {
        console.log("SR6E | in template()", getSystemData(this.item));
        const path = "systems/shadowrun6-eden/templates/item/";
        console.log(`SR6E | ${path}shadowrun6-${getActorData(this.item).type}-sheet.html`);
        if (this.isEditable) {
            console.log("SR6E | ReadWrite sheet ");
            return `${path}shadowrun6-${getActorData(this.item).type}-sheet.html`;
        }
        else {
            console.log("SR6E | ReadOnly sheet", this);
            let genItem = getSystemData(this.item);
            this.item.descHtml = game.i18n.localize(getActorData(this.item).type + "." + genItem.genesisID + ".desc");
            getActorData(this.item).descHtml2 = game.i18n.localize(getActorData(this.item).type + "." + genItem.genesisID + ".desc");
            return `${path}shadowrun6-${getActorData(this.item).type}-sheet-ro.html`;
        }
    }
    /** @overrride */
    getData() {
        let data = super.getData();
        console.log('SR6E | SR6ItemSheet.getData()', data);
        data.item.system.essence = parseFloat(data.item.system.essence).toFixed(2);
        data.config = CONFIG.SR6;
        data.config.subtypeList = CONFIG.SR6.GEAR_SUBTYPES[data.item.system.type];
        return data;
    }
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);
        if (this.actor && this.actor.isOwner) {
            console.log("SR6E | is owner");
        }
        else {
            console.log("SR6E | is not owner");
        }
        if (!this.isEditable) {
            let x = html.find(".data-desc");
            console.log("SR6E | Replace descriptions for " + this.object.type + " and ", getSystemData(this.object));
            switch (this.object.type) {
                case "quality":
                    x[0].innerHTML = game.i18n.localize("quality." + getSystemData(this.object).genesisID + ".desc");
                    break;
                case "gear":
                    x[0].innerHTML = game.i18n.localize("item." + getSystemData(this.object).genesisID + ".desc");
                    break;
                default:
                    x[0].innerHTML = game.i18n.localize(this.object.type + "." + getSystemData(this.object).genesisID + ".desc");
            }
        }
        // Owner Only Listeners
        if (this.actor && this.actor.isOwner) {
            html.find("[data-field]").change(async (event) => {
                const element = event.currentTarget;
                let value;
                if (element.type == "checkbox") {
                    value = element.checked;
                }
                else {
                    value = element.value;
                }
                const itemId = getActorData(this.object)._id;
                const field = element.dataset.field;
                console.log("SR6E | Try to update field '" + field + "' of item " + itemId + " with value " + value, this.item);
                if (element.type == "number" || (element.dataset && element.dataset.dtype && element.dataset.dtype == "Number")) {
                    if(field == 'system.essence') {
                        value = parseFloat(element.value);
                        console.log('SR6E | system.essence', value);
                    } else {
                        value = parseInt(element.value);
                    }
                }
                if (this.item) {
                    await this.item.update({ [field]: value });
                }
                else {
                    await this.actor.items.get(itemId).update({ [field]: value });
                }
            });
        }
        else if (this.isEditable) {
            html.find("[data-field]").change(async (event) => {
                const element = event.currentTarget;
                let value;
                if (element.type == "checkbox") {
                    value = element.checked;
                }
                else {
                    value = element.value;
                }
                const field = element.dataset.field;
                const arrayId = element.dataset.arrayid;
                if (arrayId) {
                    await this.object.update({ [field]: [, , 3, ,] });
                }
                else {
                    await this.object.update({ [field]: value });
                }
            });
        }
        html.find("[data-array-field]").change(async (event) => {
            const element = event.currentTarget;
            const idx = parseInt($(event.currentTarget).closestData("index", "0"));
            const array = $(event.currentTarget).closestData("array");
            const field = $(event.currentTarget).closestData("array-field");
            let newValue = [];
            if (!(idx >= 0 && array !== ""))
                return;
            /* Duplicate the data from the object. Sets null & NaN to 0 */
            if (field) {
                newValue = duplicate(
                //array.split(".").reduce(function (prev, curr) {
                //	return prev ? prev[curr] : null;
                //}, (this.object as any).system) //getActorData(this.object))
                this.object.system[array.split(".")[1]]);
                newValue[idx][field] = element.value;
            }
            else {
                newValue = duplicate(
                //array.split(".").reduce(function (prev, curr) {
                //	return prev ? prev[curr] : null;
                //}, (this.object as any).system)
                this.object.system[array.split(".")[1]]);
                newValue[idx] = element.value;
            }
            /* Update the value of 'array' with newValue */
            await this.object.update({ [array]: newValue });
        });
    }
}