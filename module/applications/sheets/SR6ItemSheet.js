import { selectAllTextOnElement } from "../../util/HtmlUtilities.js";
import { prepareActiveEffectCategories } from "../../util/helper.js";
import { SYSTEM_NAME } from "../../constants.js";

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
export default class SR6ItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["shadowrun6", "sheet", "item"],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}],
            width: null,
            submitOnChange: false,  // Implemented manually via v10 listeners
        });
    }
    get template() {
        console.log("SR6E | in template()", getSystemData(this.item));
        const path = "systems/shadowrun6-eden/templates/item/";
        console.log(
            `SR6E | ${path}shadowrun6-${
                getActorData(this.item).type
            }-sheet.html`
        );
        if (this.isEditable) {
            console.log("SR6E | ReadWrite sheet ");
            return `${path}shadowrun6-${
                getActorData(this.item).type
            }-sheet.html`;
        } else {
            console.log("SR6E | ReadOnly sheet", this);
            let genItem = getSystemData(this.item);
            this.item.descHtml = game.i18n.localize(
                getActorData(this.item).type + "." + genItem.genesisID + ".desc"
            );
            getActorData(this.item).descHtml2 = game.i18n.localize(
                getActorData(this.item).type + "." + genItem.genesisID + ".desc"
            );
            return `${path}shadowrun6-${
                getActorData(this.item).type
            }-sheet-ro.html`;
        }
    }
    /** @overrride */
    async getData() {
        let data = await super.getData();
        console.log("SR6E | SR6ItemSheet.getData()", data);
        if (data.item.system.essence !== undefined) {
            data.item.system.essence = parseFloat(
                data.item.system.essence
            ).toFixed(2);
        }
        if (data.item.system.devRating) {
            data.item.maxtrixMonitor =
                Math.ceil(data.item.system.devRating / 2) + 8;
        } else if (
            data.item.system.type === "VEHICLES" ||
            data.item.system.type === "DRONES"
        ) {
            data.item.maxtrixMonitor = Math.ceil(data.item.system.sen / 2) + 8;
        }
        if (game.settings.get(SYSTEM_NAME, "rollStrengthCombat")) {
            data.rollStrengthCombat = true;
        }
        if (
            game.settings.get(SYSTEM_NAME, "highStrengthReducesRecoil") &&
            data.item.system.skill !== "close_combat" &&
            data.item.system.skillSpec !== "brawling"
        ) {
            data.highStrengthReducesRecoil = true;
        }
        data.config = CONFIG.SR6;
        data.config.subtypeList =
            CONFIG.SR6.GEAR_SUBTYPES[data.item.system.type];

        // Prepare active effects
        data.effects = prepareActiveEffectCategories(data.item.allEffects);

        // Only for FoundryVTT moden DataModels
        if (this.document.system instanceof foundry.abstract.DataModel) {
            // Necessary for formInput and formFields helpers
            data.fields = this.document.schema.fields;
            data.systemFields = this.document.system.schema.fields;
            // data.systemFields.type.dataset = { field: data.systemFields.type.fieldPath };    // Alternative for formInput to work due to SR6ItemSheet currently being dependent on 'data-field' changes
        }

        // HTML enriching for sheets
        this.item.enriched = {};
        this.item.enriched.description = await this.enrichedHTML(this.item.system.description);
        if (this.item.system.accessories) this.item.enriched.accessories = await this.enrichedHTML(this.item.system.accessories);
        if (this.actor) {
            for (const item of this.actor.items) {
                // HTML enriching Gear Mods
                if (item.system.installedIn?.id === this.item.id) {
                    item.enriched = {};
                    item.enriched.description = await this.enrichedHTML(item.system.description);
                }
            }
        }

        return data;
    }

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        /*
        * Drag & Drop
        */
        $(".sheet .draggable").on("dragstart", async (event) => {
            const item = await fromUuidSync(event.currentTarget.dataset.uuid);
            console.log("SR6E | DRAG Item Start", event.currentTarget.dataset.uuid);
            event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(item.toDragData()))
        }).attr("draggable", "true");

        if (this.item.isOwner) {
            // ActiveEffect buttons
            html.find("[data-action='viewDoc']").click(
                this._viewEffect.bind(this)
            );
            html.find("[data-action='createDoc']").click(
                this._createEffect.bind(this)
            );
            html.find("[data-action='deleteDoc']").click(
                this._deleteEffect.bind(this)
            );
            html.find("[data-action='toggleEffect']").click(
                this._toggleEffect.bind(this)
            );
            html.find(".item-edit").click(
                this._editItem.bind(this)
            );
            html.find(".item-delete").click(
                this._deleteItem.bind(this)
            );
            html.find("[data-action='uninstallMod']").click(
                this._uninstallMod.bind(this)
            );
            html.find(".collapsible").click(
                this._collapsibleItems.bind(this)
            );
            html.find(".mod-create").click((ev) => this._onCreateNewEmbeddedItem("mod"));
        }

        // Unclear why super is called; TODO rework whole itemsheet so it uses Foundry listeners instead
        // super.activateListeners(html);
        if (this.actor && this.actor.isOwner) {
            console.log("SR6E | is owner of actor");
        } else {
            console.log("SR6E | is not owner of actor");
        }

        // Owner Only Listeners
        if (this.actor && this.actor.isOwner) {
            html.find("[data-field]").change(async (event) => {
                const element = event.currentTarget;
                let value;
                if (element.type == "checkbox") {
                    value = element.checked;
                } else {
                    value = element.value;
                }
                const itemId = getActorData(this.object)._id;
                const field = element.dataset.field;
                console.log(
                    "SR6E | Try to update field '" +
                        field +
                        "' of item " +
                        itemId +
                        " with value " +
                        value,
                    this.item
                );
                if (
                    element.type == "number" ||
                    (element.dataset &&
                        element.dataset.dtype &&
                        element.dataset.dtype == "Number")
                ) {
                    if (field == "system.essence") {
                        value = parseFloat(element.value);
                        console.log("SR6E | system.essence", value);
                    } else {
                        value = isNaN(parseInt(element.value))
                            ? 0
                            : parseInt(element.value);
                    }
                }
                if (this.item) {
                    await this.item.update({ [field]: value });
                } else {
                    await this.actor.items
                        .get(itemId)
                        .update({ [field]: value });
                }
            });

            html.find(".editor-content").each((i, div) =>
                this._activateEditor(div)
            );
        } else if (this.isEditable) {
            html.find("[data-field]").change(async (event) => {
                const element = event.currentTarget;
                let value;
                if (element.type == "checkbox") {
                    value = element.checked;
                } else {
                    value = element.value;
                }
                const field = element.dataset.field;
                const arrayId = element.dataset.arrayid;
                if (arrayId) {
                    await this.object.update({ [field]: [, , 3, ,] });
                } else {
                    await this.object.update({ [field]: value });
                }
            });

            html.find(".editor-content").each((i, div) =>
                this._activateEditor(div)
            );
        }
        // Attack Rating fields
        html.find("[data-array-field]").change(async (event) => {
            const element = event.currentTarget;
            const idx = parseInt(
                $(event.currentTarget).closestData("index", "0")
            );
            const array = $(event.currentTarget).closestData("array");
            const field = $(event.currentTarget).closestData("array-field");
            let newValue = [];
            if (!(idx >= 0 && array !== "")) return;
            /* Duplicate the data from the object. Sets null & NaN to 0 */
            if (field) {
                newValue = foundry.utils.duplicate(
                    this.object._source.system[array.split(".")[1]]
                );
                newValue[idx][field] = parseInt(element.value);
            } else {
                newValue = foundry.utils.duplicate(
                    this.object._source.system[array.split(".")[1]]
                );
                newValue[idx] = parseInt(element.value);
            }
            /* Update the value of 'array' with newValue */
            await this.object.update({ [array]: newValue });
        });
    }

    async _render(...args) {
        await super._render(...args);

        // Preselect text on focusedElement to quickly enter values in combination with tabbing
        const focusedElement = $(this.element).find(":focus")?.[0];
        selectAllTextOnElement(focusedElement);
    }

    /**************
     *
     *   ACTIONS
     *
     **************/

    /**
     * Renders an embedded document's sheet
     *
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    _viewEffect(event, target) {
        if (target === undefined) target = event.target;
        const effect = this._getEffect(target);
        effect.sheet.render(true);
    }

    /**
     * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
     *
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    async _createEffect(event, target) {
        if (target === undefined) target = event.target;
        // Retrieve the configured document class for ActiveEffect
        const aeCls = getDocumentClass("ActiveEffect");
        // Prepare the document creation data by initializing it a default name.
        // As of v12, you can define custom Active Effect subtypes just like Item subtypes if you want
        const effectData = {
            name: aeCls.defaultName({
                // defaultName handles an undefined type gracefully
                type: target.dataset.type,
                parent: this.item,
            }),
            origin: this.item.uuid,
            img: "systems/shadowrun6-eden/icons/compendium/cyberware/memory_chip.svg",
        };
        // Loop through the dataset and add it to our effectData
        for (const [dataKey, value] of Object.entries(target.dataset)) {
            // These data attributes are reserved for the action handling
            if (["action", "documentClass"].includes(dataKey)) continue;
            // Nested properties require dot notation in the HTML, e.g. anything with `system`
            // An example exists in spells.hbs, with `data-system.spell-level`
            // which turns into the dataKey 'system.spellLevel'
            foundry.utils.setProperty(effectData, dataKey, value);
        }

        // Finally, create the embedded document!
        await aeCls.create(effectData, { parent: this.item });
    }

    /**
     * Handles item deletion
     *
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    async _deleteEffect(event, target) {
        if (target === undefined) target = event.target;
        console.log("SR6E | SR6ItemSheet | ActiveEffect _deleteEffect");
        const confirm = await foundry.applications.api.DialogV2.confirm({
            window: {
                title: game.i18n.format("DOCUMENT.Delete", {
                    type: game.i18n.localize("DOCUMENT.ActiveEffect"),
                }),
            },
            content: `<strong>${game.i18n.localize(
                "AreYouSure"
            )}</strong><p>${game.i18n.format("SIDEBAR.DeleteWarning", {
                type: game.i18n.localize("DOCUMENT.ActiveEffect"),
            })}</p>`,
            rejectClose: false,
            modal: true,
        });
        if (!confirm) return;

        const effect = this._getEffect(target);
        await effect.delete();
    }

    /**
     * Determines effect parent to pass to helper
     *
     * @this SR6ItemSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    async _toggleEffect(event, target) {
        if (target === undefined) target = event.target;
        const effect = this._getEffect(target);
        await effect.update({ disabled: !effect.disabled });
        this.render();
        const itemThatWasModded = this.item.system.installedIn;
        if (itemThatWasModded) itemThatWasModded.render();
    }

    /** Helper Functions */

    /**
     * Fetches the row with the data for the rendered embedded document
     *
     * @this SR6ItemSheet
     * @param {HTMLElement} target  The element with the action
     * @returns {HTMLLIElement} The document's row
     */
    _getEffect(target) {
        const li = target.closest(".effect");
        const parentId = li?.dataset?.parentId;
        const effectId = li?.dataset?.effectId
        if (parentId === this.item.id)
            return this.item.effects.get(effectId);
        else 
            return this.actor.items.get(parentId).effects.get(effectId);
    }

    
    /**
     * Get Editor Safe Description
     */
    async enrichedHTML(htmlString) {
        return await TextEditor.enrichHTML(
            htmlString,
            {
                // Whether to show secret blocks in the finished html
                secrets: this.item.isOwner,
                // Data to fill in for inline rolls
                rollData: this.item.getRollData(),
                // Relative UUID resolution
                relativeTo: this.item,
            }
        );
    }


    /**
     * *************** Handle Item on Item drop 
     * *************** And ActiveEffect drops
     */

    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector.
     * @param {string} selector       The candidate HTML selector for dragging
     * @returns {boolean}             Can the current user drag this selector?
     * @protected
     */
    _canDragStart(selector) {
        return this.isEditable;
    }
    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop(selector) {
        return this.isEditable;
    }

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);
        const actor = this.actor;
        console.log("SR6E | SR6ItemSheet | _onDrop", event, data);
        const allowed = Hooks.call("dropItemSheetData", actor, this, data);
        if (allowed === false) return;

        // Handle different data types
        switch (data.type) {
            case "ActiveEffect":
                return this._onDropActiveEffect(event, data);
            case "Item":
                return this._onDropItem(event, data);
        }
    }

    async _onDropActiveEffect(event, data) {
        const effect = await ActiveEffect.implementation.fromDropData(data);
        if ( !this.actor.isOwner || !effect ) return false;
        if ( effect.target === this.item ) return false;
        console.log("SR6E | SR6ItemSheet | _onDropActiveEffect", effect.name);
        return ActiveEffect.create(effect.toObject(), {parent: this.item});
    }
    
    async _onDropItem(event, data) {
        if ( !this.actor || !this.actor?.isOwner ) return false;
        let droppedItem = await Item.implementation.fromDropData(data);
        console.log("SR6E | SR6ItemSheet | _onDropItem", droppedItem);

        if ( droppedItem.type !== 'mod' ) return false;

        if ( droppedItem.actor?.uuid === this.actor?.uuid ) {
            // Moving a Gear Mod from not installed to installed
            console.log("SR6E | SR6ItemSheet | _onDropItem | Installing Mod", droppedItem.name, 'on', this.item.name);
            await droppedItem.update({'system.embeddedInUuid': this.item.uuid});
        } else {
            // Add Gear Mod to my actor as it isn't there yet
            const itemData = droppedItem.toObject();
            itemData.system.embeddedInUuid = this.item.uuid;
            console.log("SR6E | SR6ItemSheet | _onDropItem | Creating an Installed Mod on Actor", droppedItem.name);
            await this._onDropItemEmbedOnActor(itemData);
        }
        this.render();
    }

    async _onDropItemEmbedOnActor(itemData) {
        itemData = itemData instanceof Array ? itemData : [itemData];
        return this.actor.createEmbeddedDocuments("Item", itemData);
    }

    async _onCreateNewEmbeddedItem(type, itemSystemType = null) {
        // Currently only support Mod Items
        if (type !== 'mod') return;

        let itemData = {
            name: game.i18n.localize("shadowrun6.newitem." + type),
            type: type,
            system: {
                embeddedInUuid: this.item.uuid
            }
        };
        if (itemSystemType) itemData.system.type = itemSystemType;
        await this._onDropItemEmbedOnActor(itemData);
        this.render();
    }

    async _editItem(event) {
        const item = this._getItem(event);
        console.log("SR6E | Editing Item ", item);
        if (!item) throw new Error("Item is null");

        if (item.sheet) item.sheet.render(true);
    }

    async _deleteItem(event) {
        const confirm = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.format("DOCUMENT.Delete", { type: game.i18n.localize("DOCUMENT.Item") }) },
            content: `<strong>${game.i18n.localize("AreYouSure")}</strong><p>${game.i18n.format("SIDEBAR.DeleteWarning", { type: game.i18n.localize("DOCUMENT.Item") })}</p>`,
            rejectClose: false,
            modal: true
        });
        if(!confirm) return;
        
        const item = this._getItem(event);
        console.log("SR6E | Delete item " + item.id);
        await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
        this.render();
    }

    _getItem(event) {
        const element = event.currentTarget.closest(".item");
        const item = this.actor?.items.get(element.dataset.itemId);
        return item;
    }
    
    async _uninstallMod(event) {
        const item = this._getItem(event);
        console.log("SR6E | Uninstalling Mod ", item);
        if (!item) throw new Error("Item is null");

        if (item.type !== 'mod') return;

        const itemThatWasModded = item.system.installedIn;
        await item.update({'system.embeddedInUuid': null}, {itemThatWasModded: itemThatWasModded.id});
    }

    async _collapsibleItems(event) {
        const element = event.currentTarget;
        // const itemId = this._getClosestData($(event.currentTarget), "item-id");
        const item = this._getItem(event);

        element.classList.toggle("closed");
        element.classList.toggle("open");
        let content = element.parentElement.parentElement.nextElementSibling.firstElementChild.firstElementChild;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
        content.classList.toggle("closed");
        content.classList.toggle("open");
    }

}
