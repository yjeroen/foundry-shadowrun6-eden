import { WeaponRoll, SkillRoll, SpellRoll, RitualRoll, PreparedRoll, RollType, MatrixActionRoll, ComplexFormRoll } from "../../dice/RollTypes.js";
import { selectAllTextOnElement } from "../../util/HtmlUtilities.js";
import { prepareActiveEffectCategories } from "../../util/helper.js";

function isLifeform(obj) {
    return obj.attributes != undefined;
}
function isGear(obj) {
    return obj.skill != undefined;
}
function isWeapon(obj) {
    return obj.attackRating != undefined;
}
function isSpell(obj) {
    return obj.drain != undefined;
}
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
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class Shadowrun6ActorSheet extends ActorSheet {
    /** @overrride */
    getData() {
        let data = super.getData();
        data.config = CONFIG.SR6;
        if (game.release.generation >= 10) {
            data.system = data.data.system;
        }
        else {
            data.system = data.data.data.data;
        }
        data.actor.system.essence = parseFloat(data.actor.system.essence).toFixed(2);
        data.matrixAccess = this._matrixAccess();
        data.matrixActionAvailable = this._matrixActionAvailable();

        // Prepare active effects // overwriting super.data.effects
        data.effects = prepareActiveEffectCategories(
          // A generator that returns all effects stored on the actor
          // as well as any items
          data.actor.allApplicableEffects()
        );

        console.log("SR6E | Shadowrun6ActorSheet.getData()", data);
        return data;
    }
    get template() {
        console.log("SR6E | in template()", getSystemData(this.actor));
        console.log("SR6E | default: ", super.template);
        const path = "systems/shadowrun6-eden/templates/actor/";
        if (this.isEditable) {
            console.log("SR6E | ReadWrite sheet ");
            return super.template;
        }
        else {
            console.log("SR6E | ReadOnly sheet", this);
            let genItem = getSystemData(this.actor);
            this.actor.descHtml = game.i18n.localize(getActorData(this.actor).type + "." + genItem.genesisID + ".desc");
            getActorData(this.actor).descHtml2 = game.i18n.localize(getActorData(this.actor).type + "." + genItem.genesisID + ".desc");
            console.log(`SR6E | ${path}shadowrun6-${getActorData(this.actor).type}-sheet-ro.html`);
            return `${path}shadowrun6-${getActorData(this.actor).type}-sheet-ro.html`;
        }
    }
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        // Owner Only Listeners
        if (this.actor.isOwner) {
            // ActiveEffect buttons
            html.find("[data-action='viewDoc']").click(this._viewDoc.bind(this));
            html.find("[data-action='createDoc']").click(this._createDoc.bind(this));
            html.find("[data-action='deleteDoc']").click(this._deleteDoc.bind(this));
            html.find("[data-action='toggleEffect']").click(this._toggleEffect.bind(this));

            // Matrix action view
            html.find(".matrix-access-switch input").click(this._onMatrixAccessSwitch.bind(this));
            html.find(".matrix-persona-attributes .matrix-attribute").click(this._onMatrixAttributesSwitch.bind(this));

            html.find(".weapon-ammo-reload").click(this._onWeaponAmmoReload.bind(this));
            html.find(".health-phys").on("input", this._redrawBar(html, "Phy", getSystemData(this.actor).physical));
            html.find(".health-stun").on("input", this._redrawBar(html, "Stun", getSystemData(this.actor).stun));
            html.find(".health-matrix").on("input", this._redrawBar(html, "Matrix", getSystemData(this.actor).persona.monitor));
            // Roll Skill Checks
            html.find(".skill-roll").click(this._onRollSkillCheck.bind(this));
            html.find(".spell-roll").click(this._onRollSpellCheck.bind(this));
            html.find(".ritual-roll").click(this._onRollRitualCheck.bind(this));
            html.find(".weapon-roll").click(this._onRollWeaponCheck.bind(this));
            html.find(".defense-roll").click(this._onCommonCheck.bind(this));
            html.find(".matrix-roll").click(this._onMatrixAction.bind(this));
            html.find(".complexform-roll").click(this._onRollComplexFormCheck.bind(this));
            html.find(".attributeonly-roll").click(this._onCommonCheck.bind(this));
            html.find(".legwork-roll").click(this._onCommonCheck.bind(this));
            this.activateCreationListener(html);
            html.find(".item-delete").click(async (event) => {
                const confirm = await foundry.applications.api.DialogV2.confirm({
                    window: { title: game.i18n.format("DOCUMENT.Delete", { type: game.i18n.localize("DOCUMENT.Item") }) },
                    content: `<strong>${game.i18n.localize("AreYouSure")}</strong><p>${game.i18n.format("SIDEBAR.DeleteWarning", { type: game.i18n.localize("DOCUMENT.Item") })}</p>`,
                    rejectClose: false,
                    modal: true
                });
                if(!confirm) return;
                
                const itemId = this._getClosestData($(event.currentTarget), "item-id");
                console.log("SR6E | Delete item " + itemId);
                this.actor.deleteEmbeddedDocuments("Item", [itemId]);
            });

            // Edge coin flip
            html.find(".edge-coin").mousedown(async (event) => {
                const mousePress = event.which; // 1: Left Mouse Button, 2: Middle Mouse Button, 3: Right Mouse button
                const coin = event.currentTarget;
                const oldEdge = this.actor.system.edge.value;
                let edge = oldEdge;
                // Check if coin isn't already being flipped
                if ( !coin.classList.contains('clickable') ) {
                    return;
                }
                // Check if edge is already 0 or 7
                if (mousePress === 3 && edge === 0) {
                    return;
                } else if (mousePress !== 3 && edge === 7) {
                    return;
                }

                let translateX = parseInt(coin.dataset.translatex); // -100 ~ 0
                let rotateY = parseInt(coin.dataset.rotatey);       // -180 ~ 0 ~ 180
                coin.classList.remove('clickable');

                if (mousePress === 3) { // Rotate left
                    rotateY = 180;
                    edge = edge - 1;
                } else {                // Rotate right
                    rotateY = -180;
                    edge = edge + 1;
                }
                translateX = -100;
                coin.dataset.translatex = translateX;
                coin.dataset.rotatey = rotateY;
                coin.style.transform = 'translateX('+translateX+'%) rotateY('+rotateY+'deg)';

                coin.querySelector('.edge-coin__face_back .edge-value').setAttribute('value', edge);
                
                // Reset
                setTimeout(async() => {
                    coin.querySelector('.edge-coin__face_front .edge-value').setAttribute('value', edge);
                    rotateY = 0;
                    translateX = 0;
                    coin.dataset.translatex = translateX;
                    coin.dataset.rotatey = rotateY;
                    coin.style.transition = 'none';
                    coin.style.transform = 'translateX('+translateX+'%) rotateY('+rotateY+'deg)';
                    setTimeout(async() => {
                        coin.style.transition = 'transform 0.6s';
                        coin.classList.add('clickable');
                        await this.actor.update({ ["system.edge.value"]: edge });
                    }, 20, edge);
                }, 650, edge);

                if (game.combats.active !== undefined) {
                    const msg = game.i18n.format("shadowrun6.ui.notifications.character_has_changed_edge", { character: this.actor.name, oldEdge: oldEdge, edge: edge  });
                    await ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                        flavor: game.i18n.localize("shadowrun6.label.edge_changes_combat"),
                        content: `<span style="font-style: italic;">${msg}</span>`
                    });
                }
                
                console.log("SR6E | Edge coin flipped", translateX, rotateY);
            });

            // Changes on input data fields
            html.find("[data-field]").change(async (event) => {
                console.log("SR6E | data-field", event);
                const element = event.currentTarget;
                let value = element.value;
                if (element.type == "number" || (element.dataset && element.dataset.dtype && element.dataset.dtype == "Number")) {
                    // TODO possibly only allow integers input and "+1" and "-1" strings
                    value = parseInt(element.value);
                }
                const itemId = this._getClosestData($(event.currentTarget), "item-id");
                const field = element.dataset.field;
                if (itemId) {
                    console.log("SR6E | Update item " + itemId + " field " + field + " with " + value);
                    let item = this.actor.items.get(itemId);
                    if (item)
                        await item.update({ [field]: value });
                }
                else {
                    // Send monitor change to the right place
                    if (field === "system.physical.dmg" || field === "system.stun.dmg") {
                        const monitorType = field.split('.').at(1);
                        console.log("SR6E | Updating actor field " + field + ", so setting damage to monitor " + monitorType + " to " + value);
                        await this.actor.applyDamage(monitorType, null, value);
                        return;
                    } else if (field === "system.persona.monitor.dmg") {
                        const monitorType = "persona.monitor";
                        console.log("SR6E | Updating actor field " + field + ", so setting damage to monitor " + monitorType + " to " + value);
                        await this.actor.applyDamage(monitorType, null, value);
                        return;
                    }

                    console.log("SR6E | Update actor field " + field + " with " + value);
                    await this.actor.update({ [field]: value });
                }
            });
            html.find("[data-check]").click(async (event) => {
                const element = event.currentTarget;
                console.log("SR6E | Came here with checked=" + element.checked + "  and value=" + element.value);
                let value = element.checked;
                const itemId = this._getClosestData($(event.currentTarget), "item-id");
                const field = element.dataset.check;
                if (itemId) {
                    console.log("SR6E | Update field " + field + " with " + value);
                    let item = this.actor.items.get(itemId);
                    if (item)
                        await item.update({ [field]: value });
                }
                else {
                    console.log("SR6E | Update actor field " + field + " with " + value);
                    await this.actor.update({ [field]: value });
                }
            });
            //Collapsible
            html.find(".collapsible").click((event) => {
                const element = event.currentTarget;
                const itemId = this._getClosestData($(event.currentTarget), "item-id");
                const item = this.actor.items.get(itemId);

                if (!item) {
                    //matrix actions collapsible
                    const content = element.parentElement.nextElementSibling;
                    // content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
                    content.style.maxHeight =  content.classList.contains("open") ? null : content.scrollHeight + "px";
                    content.classList.toggle("closed");
                    content.classList.toggle("open");
                    if (element.parentElement.classList.contains("matrix-persona-attributes")) {
                        this.options.flags.collapseMatrixAttr = content.classList.contains("open") ? "open" : "closed";
                    }
                    return;
                }
                //				console.log("SR6E | Collapsible: old styles are '"+element.classList+"'' and flag is "+item.getFlag("shadowrun6-eden","collapse-state"));
                element.classList.toggle("open");
                let content = element.parentElement.parentElement.nextElementSibling.firstElementChild.firstElementChild;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                }
                else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
                //				console.log("SR6E | Collapsible: temp style are '"+element.classList);
                let value = element.classList.contains("open") ? "open" : "closed";
                //				console.log("SR6E | Update flag 'collapse-state' with "+value);
                item.setFlag("shadowrun6-eden", "collapse-state", value);
                //				console.log("SR6E | Collapsible: new styles are '"+element.classList+"' and flag is "+item.getFlag("shadowrun6-eden","collapse-state"));
            });
            //Collapsible for lists
            html.find(".collapsible-skill").click((event) => {
                const element = event.currentTarget;
                const skillId = this._getClosestData($(event.currentTarget), "skill-id");
                const item = getSystemData(this.actor).skills[skillId];
                element.classList.toggle("open");
                let content = $(element.parentElement).find(".collapsible-content")[0];
                if (content.style.maxHeight) {
                    content.style.maxHeight = "";
                }
                else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
                let value = element.classList.contains("open") ? "open" : "closed";
                this.actor.setFlag("shadowrun6-eden", "collapse-state-" + skillId, value);
            });
            //Collapsible
            html.find("select.contdrolled").change((event) => {
                const element = event.currentTarget;
                const itemId = this._getClosestData($(event.currentTarget), "item-id");
                console.log("SR6E | SELECT ", element);
                console.log("SR6E | SELECT2", event);
                console.log("SR6E | SELECT3", event.target.value);
                console.log("SR6E | -> itemId ", itemId);
                console.log("SR6E | -> ds ", element.dataset);
            });
            /*
             * Drag & Drop
             */
            $(".sheet .draggable")
                .on("dragstart", async (event) => {
                const item = await fromUuidSync(event.currentTarget.dataset.uuid);
                console.log("SR6E | DRAG Item Start", event.currentTarget.dataset.uuid);
                event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(item.toDragData()))
            }).attr("draggable", "true");

            $( "a[draggable='true']" ).on("dragstart", (event) => {
                console.log("SR6E | a[draggable='true'] DRAG Item Start");
                const dragData = event.currentTarget.dataset;
                dragData.classList = event.currentTarget.classList;
                if (dragData.type === undefined) dragData.type = 'Other';
                if (dragData.rollId !== undefined || dragData.skill !== undefined || dragData.matrixId !== undefined)  dragData.type = 'Roll';
                console.log("SR6E | DRAG Link Start", dragData);

                // Instead we just stringify the dataset for use at Hooks.on("hotbarDrop")
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
            });
        }
        else {
            html.find(".rollable").each((i, el) => el.classList.remove("rollable"));
        }
        // Handle default listeners last so system listeners are triggered first
        super.activateListeners(html);
    }
    activateCreationListener(html) {
        console.log("SR6E | activateCreationListener");
        html.find(".adeptpower-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.adeptpower"),
                type: "adeptpower"
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".martialartstyle-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.martialartstyle"),
                type: "martialartstyle"
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".quality-create").click((ev) => this._onCreateNewEmbeddedItem("quality"));
        html.find(".echo-create").click((ev) => this._onCreateNewEmbeddedItem("echo"));
        html.find(".contact-create").click((ev) => this._onCreateNewEmbeddedItem("contact"));
        html.find(".sin-create").click((ev) => this._onCreateNewEmbeddedItem("sin"));
        html.find(".lifestyle-create").click((ev) => this._onCreateNewEmbeddedItem("lifestyle"));
        html.find(".complexform-create").click((ev) => this._onCreateNewEmbeddedItem("complexform"));
        html.find(".metamagic-create").click((ev) => this._onCreateNewEmbeddedItem("metamagic"));
        html.find(".spell-create").click((ev) => this._onCreateNewEmbeddedItem("spell"));
        html.find(".critterpower-create").click((ev) => this._onCreateNewEmbeddedItem("critterpower"));
        html.find(".ritual-create").click((ev) => this._onCreateNewEmbeddedItem("ritual"));
        html.find(".focus-create").click((ev) => this._onCreateNewEmbeddedItem("focus"));
        html.find(".weapon-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.weapon"),
                type: "gear",
                system: {
                    type: "WEAPON_FIREARMS"
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".ELECTRONICS-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "ELECTRONICS"));
        html.find(".CHEMICALS-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "CHEMICALS"));
        html.find(".BIOLOGY-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "BIOLOGY"));
        html.find(".SURVIVAL-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "SURVIVAL"));
        html.find(".SOFTWARE-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "SOFTWARE"));
        html.find(".TOOLS-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "TOOLS"));
        html.find(".NANOWARE-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "NANOWARE"));
        html.find(".GENETICS-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "GENETICS"));
        html.find(".ACCESSORY-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "ACCESSORY"));
        html.find(".ARMOR_ADDITION-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "ARMOR_ADDITION"));
        html.find(".MAGICAL-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "MAGICAL"));
        html.find(".armor-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "ARMOR"));
        html.find(".ammunition-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "AMMUNITION"));
        html.find(".bodyware-create").click((ev) => this._onCreateNewEmbeddedItem("gear", "CYBERWARE"));
        html.find(".close-weapon-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.weaponclose"),
                type: "gear",
                system: {
                    type: "WEAPON_CLOSE_COMBAT"
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".weapon-special-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.weaponspecial"),
                type: "gear",
                system: {
                    type: "WEAPON_SPECIAL"
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".martialart-style-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.martialartstyle"),
                type: "martialartstyle",
                system: {
                    genesisID: this._create_UUID()
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".martialart-tech-create").click((ev) => {
            const element = ev.currentTarget.closest(".item");
            const styleId = element.dataset.styleId;
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.martialarttech"),
                type: "martialarttech",
                system: {
                    style: styleId
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".skill-knowledge-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.skill.knowledge"),
                type: "skill",
                system: {
                    genesisID: "knowledge"
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".skill-language-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.skill.language"),
                type: "skill",
                system: {
                    genesisID: "language",
                    points: 1
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".matrix-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.matrix"),
                type: "gear",
                system: {
                    genesisID: this._create_UUID(),
                    type: "ELECTRONICS",
                    subtype: "RIGGER_CONSOLE"
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".rcc-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.rcc"),
                type: "gear",
                system: {
                    genesisID: this._create_UUID(),
                    type: "ELECTRONICS",
                    subtype: "RIGGER_CONSOLE"
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        //autosoft-create
        html.find(".autosoft-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.software"),
                type: "software",
                system: {
                    genesisID: this._create_UUID(),
                    type: "AUTOSOFT",
                    subtype: "CLEARSIGHT",
                }
            };
            const context = {
                renderSheet: true
            }
            return this.actor.createEmbeddedDocuments("Item", [itemData], context);
        });

        html.find(".vehicle-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.vehicles"),
                type: "gear",
                system: {
                    genesisID: this._create_UUID(),
                    type: "VEHICLES",
                    subtype: "CARS"
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".drone-create").click((ev) => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.drones"),
                type: "gear",
                system: {
                    genesisID: this._create_UUID(),
                    type: "DRONES",
                    subtype: "SMALL_DRONES"
                }
            };
            return this.actor.createEmbeddedDocuments("Item", [itemData]);
        });
        html.find(".item-edit").click((ev) => {
            const element = ev.currentTarget.closest(".item");
            const item = this.actor.items.get(element.dataset.itemId);
            console.log("SR6E | edit ", item);
            if (!item) {
                throw new Error("Item is null");
            }
            if (item.sheet) {
                item.sheet.render(true);
            }
        });
    }
    //-----------------------------------------------------
    _onCreateNewEmbeddedItem(type, itemtype = null) {
        let nameType = itemtype ? itemtype.toLowerCase() : type.toLowerCase();
        let itemData = {
            name: game.i18n.localize("shadowrun6.newitem." + nameType),
            type: type
        };
        if (itemtype) {
            itemData = foundry.utils.mergeObject(itemData, {
                system: {
                    type: itemtype
                }
            });
        }
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }
    //-----------------------------------------------------
    _getClosestData(jQObject, dataName, defaultValue = "") {
        let value = jQObject.closest(`[data-${dataName}]`)?.data(dataName);
        return value ? value : defaultValue;
    }
    //-----------------------------------------------------
    async _setDamage(html, damageClicked, monitorAttributes, monitorType, event) {
        if (!isLifeform(getSystemData(this.actor)) && !this.actor.type == "Vehicle")
            return;
        console.log("SR6E | setDamage", monitorType, damageClicked, monitorAttributes);
        let key = "";
        switch (monitorType) {
            case "Phy":
                key = "physical";
                break;
            case "Stun":
                key = "stun";
                break;
            case "Matrix":
                key = "persona.monitor";
                break;
        }
        await this._applyDamage(damageClicked, monitorAttributes, key);
        this.actor.checkUnconscious();
    }

    async _applyDamage(damageClicked, monitorAttributes, key) {
        console.log("SR6E | _applyDamage", damageClicked, monitorAttributes, key);
        console.log("SR6E | _applyDamage actor", this.actor);
        let damage = damageClicked;
        if (monitorAttributes.dmg == damageClicked) {
            damage = damageClicked - 1;
        }
        //When going health back up, UX is more logical to gain health until the box you clicked on
        else if (monitorAttributes.dmg > damageClicked) {
            damage = damageClicked - 1;
        }

        // check if the damage should also be applied to an item
        if (monitorAttributes.item != undefined && monitorAttributes.item != null) {
            console.log("SR6E | _applyDamage: also apply damage to item ", monitorAttributes.item);
            let item = this.actor.items.get(monitorAttributes.item);
            if (item) {
                console.log("SR6E | _applyDamage: item found, updating damage", item);
                await item.update({ ["system.dmg"]: damage });
            } else {
                console.warn("SR6E | _applyDamage: item not found, cannot update damage");
            }
        } else {
            await this.actor.update({ [`system.${key}.dmg`]: damage });
        }
    }


    //-----------------------------------------------------
    _redrawBar(html, monitorType, monitorAttributes) {
        console.log("SR6E | _redrawBar ", monitorType, monitorAttributes);
        if (!monitorAttributes || monitorAttributes.value < 0)
            return;
        //let vMax = parseInt(html.find("#data"+monitorType+"Max")[0].value);
        //let vCur = parseInt(html.find("#data"+monitorType+"Cur")[0].value);
        let perc = (monitorAttributes.value / monitorAttributes.max) * 100;
        if (html.find("#bar" + monitorType + "Cur").length == 0) {
            console.log("SR6E | _redrawBar: No such bar ", "#bar" + monitorType + "Cur");
            return;
        }
        html.find("#bar" + monitorType + "Cur")[0].style.width = perc + "%";
        let myNode = html.find("#bar" + monitorType + "Boxes")[0];
        // Only change nodes when necessary
        if (myNode.childElementCount != monitorAttributes.max) {
            // The energy bar
            // Remove previous boxes
            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }
            // Add new ones
            let i = 0;
            while (i < monitorAttributes.max) {
                i++;
                let divMonitorBox = document.createElement("div");
                let divBoxText = document.createElement("div");
                //let breakHr = document.createElement("hr");
                let text;
                if (i === monitorAttributes.max && (i % 3) === (monitorAttributes.max % 3) ) {
                    let minus = -1 * Math.ceil(i / 3);
                    text = document.createTextNode(minus.toString());
                } else if (i % 3 == 0) {
                    let minus = -1 * (i / 3);
                    text = document.createTextNode(minus.toString());
                } else {
                    text = document.createTextNode("\u00A0");
                }
                if (i < monitorAttributes.max) {
                    divMonitorBox.setAttribute("style", "border-left-width: 1px;");
                } else {
                    // divMonitorBox.setAttribute("style", "flex: 1"); // moved to layout.css
                }
                
                divMonitorBox.setAttribute("class", "monitorBox");
                divMonitorBox.addEventListener("click", this._setDamage.bind(this, html, i, monitorAttributes, monitorType));
                divBoxText.appendChild(text);
                divMonitorBox.appendChild(divBoxText);
                myNode.appendChild(divMonitorBox);

                // TODO Add line breaks later for very large monitor sizes
                // if (i === 5) {
                //     myNode.appendChild(breakHr);
                // }
            }

        }
    }
    _create_UUID() {
        var dt = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    }
    //-----------------------------------------------------
    //NOTE I don't think this function is called any longer? 
    _onRecalculatePhysicalBar(html) {
        console.log("SR6E | LE editiert  " + html);
        let vMax = parseInt(html.find("#dataPhyMax")[0].value);
        console.log("SR6E | vMax = " + vMax);
        let vCur = parseInt(html.find("#dataPhyCur")[0].value);
        console.log("SR6E | vCur = " + vCur);
        let totalVer = vMax - vCur; // Wieviel nach Verschnaufpause
        console.log("SR6E | Damage = " + totalVer);
        let percVerz = (totalVer / vMax) * 100;
        console.log("SR6E | Percent = " + percVerz);
        html.find("#barPhyCur")[0].style.width = percVerz + "%";
        let myNode = html.find("#barPhyBoxes")[0];
        // Only change nodes when necessary
        if (myNode.childElementCount != vMax) {
            // The energy bar
            // Remove previous boxes
            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }
            // Add new ones
            let i = 0;
            while (i < vMax) {
                i++;
                var div = document.createElement("div");
                let text;
                if (i % 3 == 0) {
                    // text = document.createTextNode((-(i / 3)).toString());
                    // text = document.createTextNode("\u00A0");
                    div.appendChild(document.createTextNode((-(i / 3)).toString()));
                } else {
                    // text = document.createTextNode("\u00A0");
                    div.appendChild(document.createTextNode("1"));
                }
                if (i < vMax) {
                    div.setAttribute("style", "flex: 1; border-right: solid black 1px;");
                } else {
                    div.setAttribute("style", "flex: 1");
                }
                // div.appendChild(text);
                myNode.appendChild(div);
            }
            // // The scale
            // myNode = html.find("#barPhyScale")[0];
            // while (myNode.firstChild) {
            //     myNode.removeChild(myNode.lastChild);
            // }
            // // Add new
            // i = 0;
            // while (i < vMax) {
            //     i++;
            //     var div = document.createElement("div");
            //     if (i % 3 == 0) {
            //         div.setAttribute("style", "flex: 1; border-right: solid black 1px; text-align:right;");
            //         div.appendChild(document.createTextNode((-(i / 3)).toString()));
            //     }
            //     else {
            //         div.setAttribute("style", "flex: 1");
            //         div.appendChild(document.createTextNode("\u00A0"));
            //     }
            //     myNode.insertBefore(div, myNode.childNodes[0]);
            // }
        }
    }
    //-----------------------------------------------------
    _onCommonCheck(event, html) {
        console.log("SR6E | onCommonCheck");
        event.preventDefault();
        const data = event.currentTarget.dataset;
        let classList = event.currentTarget.classList.value;
        let rollId = data.rollId;
        let roll = new PreparedRoll();
        roll.pool = parseInt(data.pool);
        roll.rollType = RollType.Common;
        roll.actionText = game.sr6.utils.rollText(classList, rollId);

        let dialogConfig;
        if (classList.includes("defense-roll")) {
            roll.allowBuyHits = false;
            roll.threshold = 1;
            if (rollId === 'damage_physical' || rollId === 'damage_astral') {
                roll.rollType = RollType.Soak;
            }
            dialogConfig = {
                useModifier: !(rollId === 'damage_physical' || rollId === 'damage_astral'), 
                useThreshold: false
            };
        }
        else if (classList.includes("attributeonly-roll")) {
            roll.allowBuyHits = true;
            roll.useAttributeMod = classList.includes("attribute-poolmod");
            roll.attributeTested = rollId;
            roll.checkText = roll.actionText;
            dialogConfig = {
                useModifier: true,
                useThreshold: true
            };
        }
        else if (rollId = "legwork") {
            roll.rollType = RollType.Legwork;
            roll.pool = parseInt(data.connection) * 2;
            roll.allowBuyHits = true;
            roll.threshold = 1;
            roll.legwork = { loyalty: parseInt(data.loyalty), contact: data.contact };
            if (classList.includes("legwork-roll"))
                roll.checkText = game.i18n.format("shadowrun6.legwork.legwork_description", { name: data.contact });
            else
                roll.checkText = game.i18n.format("shadowrun6.legwork.loyalty_description", { name: data.contact });
            dialogConfig = {
                useWoundModifier: false,
                useSustainedSpellModifier: false
            };
        }
        else {
            roll.allowBuyHits = true;
            roll.useWildDie = 1;
            dialogConfig = {
                useModifier: true,
                useThreshold: true
            };
        }
        //TODO dialogConfig.useModifier and useThreshold aren't used in Rolls._showRollDialog
        this.actor.rollCommonCheck(roll, dialogConfig);
    }
    //-----------------------------------------------------
    /**
     * Handle rolling a Skill check
     * @param {Event} event   The originating click event
     * @private
     */
    _onRollSkillCheck(event, html) {
        console.log("SR6E | onRollSkillCheck");
        event.preventDefault();
        if (!event.currentTarget)
            return;
        if (!event.currentTarget.dataset)
            return;
        let dataset = event.currentTarget.dataset;
        const skillId = dataset.skill;
        let roll = new SkillRoll(getSystemData(this.actor), skillId);
        roll.skillSpec = dataset.skillspec;
        if (dataset.threshold)
            roll.threshold = dataset.threshold;
        roll.attrib = dataset.attrib;
        console.log("SR6E | onRollSkillCheck before ", roll);
        this.actor.rollSkill(roll);
    }
    //-----------------------------------------------------
    _onRollWeaponCheck(event, html) {
        console.log("SR6E | _onRollWeaponCheck");
        event.preventDefault();
        const attacker = getSystemData(this.actor);
        const itemId = event.currentTarget.dataset.itemId;
        let item = this.actor.items.get(itemId);
        if (!item) {
            throw new Error("_onRollWeaponCheck for non-existing item");
        }
        if (!isGear(getSystemData(item))) {
            throw new Error("_onRollWeaponCheck: No skill for item");
        }
        if (isWeapon(getSystemData(item))) {
            console.log("SR6E | is weapon", item);
        }
        const gear = getSystemData(item);
        let roll = new WeaponRoll(attacker, item, itemId, gear);
        roll.useWildDie = gear.wild ? 1 : 0;
        console.log("SR6E | _onRollWeaponCheck before ", roll);
        this.actor.rollItem(roll);
    }
    //-----------------------------------------------------
    async _onWeaponAmmoReload(event) {
        console.log("SR6E | _onWeaponAmmoReload");
        event.preventDefault();
        const uuid = event.currentTarget.dataset.itemUuid;
        const weapon = await fromUuid(uuid)
        const updated = await weapon.update({ "system.ammocount": weapon.system.ammocap });
        if (updated !== undefined) {
            console.log("SR6E | Weapon's Ammo Reloaded:", updated.name, uuid);
        }
    }
    //-----------------------------------------------------
    _onRollSpellCheck(event, html) {
        console.log("SR6E | _onRollSpellCheck");
        event.preventDefault();
        if (!event.currentTarget)
            return;
        if (!event.currentTarget.dataset)
            return;
        const caster = getSystemData(this.actor);
        const itemId = event.currentTarget.dataset.itemId;
        let item = this.actor.items.get(itemId);
        if (!item) {
            throw new Error("_onRollSpellCheck for non-existing item");
        }
        const skill = caster.skills["sorcery"];
        let spellRaw = this.actor.items.get(itemId);
        if (!spellRaw) {
            console.log("SR6E | No such item: " + itemId);
            return;
        }
        const spell = getSystemData(spellRaw);
        let roll = new SpellRoll(caster, item, itemId, spell);
        roll.skillSpec = "spellcasting";
        this.actor.rollSpell(roll, false);
    }
    //-----------------------------------------------------
    _onRollRitualCheck(event, html) {
        console.log("SR6E | _onRollRitualCheck");
        event.preventDefault();
        if (!event.currentTarget)
            return;
        if (!event.currentTarget.dataset)
            return;
        const caster = getSystemData(this.actor);
        const itemId = event.currentTarget.dataset.itemId;
        let item = this.actor.items.get(itemId);
        if (!item) {
            throw new Error("_onRollRitualCheck for non-existing item");
        }
        const skill = caster.skills["sorcery"];
        let ritualRaw = this.actor.items.get(itemId);
        if (!ritualRaw) {
            console.log("SR6E | No such item: " + itemId);
            return;
        }
        const ritualData = getSystemData(ritualRaw);
        let roll = new RitualRoll(caster, item, itemId, ritualData);
        this.actor.rollSpell(roll, true);
    }
    //-----------------------------------------------------
    _onMatrixAction(event, html) {
        event.preventDefault();
        console.log("SR6E | onMatrixAction ", event.currentTarget.dataset);
        if (!event.currentTarget)
            return;
        if (!event.currentTarget.dataset)
            return;
        const attacker = getSystemData(this.actor);
        const matrixId = event.currentTarget.dataset.matrixId;
        const matrixAction = CONFIG.SR6.MATRIX_ACTIONS[matrixId];
        let roll = new MatrixActionRoll(attacker, matrixAction);
        console.log("SR6E | _onMatrixAction before ", roll);
        this.actor.performMatrixAction(roll);
    }
    //-----------------------------------------------------
    _onRollComplexFormCheck(event, html) {
        console.log("SR6E | _onRollComplexFormCheck");
        event.preventDefault();
        if (!event.currentTarget)
            return;
        if (!event.currentTarget.dataset)
            return;
        const caster = getSystemData(this.actor);
        const itemId = event.currentTarget.dataset.itemId;
        let item = this.actor.items.get(itemId);
        if (!item) {
            throw new Error("_onRollComplexFormCheck for non-existing item");
        }
        let formRaw = this.actor.items.get(itemId);
        if (!formRaw) {
            console.log("SR6E | No such item: " + itemId);
            return;
        }
        const cform = getSystemData(formRaw);
        let roll = new ComplexFormRoll(caster, item, itemId, cform);
        this.actor.rollComplexForm(roll);
    }

    async _onMatrixAttributesSwitch(event, html) {
        const clickedAttribute = event.currentTarget.firstChild;
        if (parseInt(clickedAttribute.value) === 0) return;
        const matrixAttributes = event.currentTarget.parentElement.childNodes;
        console.log("SR6E | _onMatrixAttributesSwitch attribute clicked:", clickedAttribute.dataset.field);
        clickedAttribute.classList.toggle('clicked');
        const matrixPersona = {};
        let clickedAttributes = 0;
        let activeBox1, activeBox2;
        
        matrixAttributes.forEach(attribute => {
            const attributeInput = attribute.firstChild;
            if (attributeInput?.nodeName === "INPUT"){
                const clicked = attributeInput.classList.contains('clicked');
                matrixPersona[attributeInput.dataset.field] = { value: parseInt(attributeInput.value), clicked: clicked };
                if (clicked) {
                    if (activeBox1) activeBox2 = attribute;
                    else activeBox1 = attribute;
                    clickedAttributes++;
                }
            }
        });
        if (clickedAttribute.classList.contains('clicked') && clickedAttributes === 2) {
            const updatePersona = {};
            let swappedField;
            Object.entries(matrixPersona).forEach(([field, attribute]) => {
                if (attribute.clicked) {
                    if (swappedField === undefined) {
                        swappedField = field;
                    } else {
                        updatePersona[swappedField] = attribute.value;
                        updatePersona[field] = matrixPersona[swappedField].value;
                    }
                }
            });
            const swappedCss = activeBox1.getAttribute('style');
            activeBox1.setAttribute('style', activeBox2.getAttribute('style'));
            activeBox2.setAttribute('style', swappedCss);
            //TODO add Matrix Attribute swap animation
            // await new Promise(resolve => setTimeout(resolve, 500)); // wait until CSS effect is ready

            await this.actor.update( updatePersona );
        }
    }
    async _onMatrixAccessSwitch(event, html) {
        console.log("SR6E | _onMatrixAccessSwitch to:", event.currentTarget.value);
        await new Promise(resolve => setTimeout(resolve, 500)); // wait until CSS effect is ready
        await this.actor.setFlag("shadowrun6-eden", "matrix-access", event.currentTarget.value)
    }
    _matrixAccess() {
        let matrixAccess = {
            outsider: false,
            user: false,
            admin: false
        };
        const matrixAccessLevel = this.actor.getFlag("shadowrun6-eden", "matrix-access");
        if (matrixAccessLevel === "admin") {
            matrixAccess.admin = true;
        } else if (matrixAccessLevel === "user") {
            matrixAccess.user = true;
        } else {
            matrixAccess.outsider = true;
        }
        return matrixAccess;
    }
    _matrixActionAvailable() {
        let matrixActions = Object.entries(CONFIG.SR6.MATRIX_ACTIONS).filter(([actionId, action]) => {
            action.name = game.i18n.localize('shadowrun6.matrixaction.'+actionId+'.name')
            if (action.linkedAttr === null || action.linkedAttr === undefined) return true;
            if (action.linkedAttr === "a" && this.actor.system.persona?.used?.a > 0) return true;
            if (action.linkedAttr === "s" && this.actor.system.persona?.used?.s > 0) return true;
            return false;
        });  
        matrixActions = Object.fromEntries(matrixActions.sort(function (a, b) {
            var textA = a[1].name.toUpperCase();
            var textB = b[1].name.toUpperCase();
            return textA.localeCompare(textB);
        }));
        return matrixActions;
    }

    async _render(...args) {
        await super._render(...args);

        // Preselect text on focusedElement to quickly enter values in combination with tabbing
        const focusedElement = $(this.element).find(':focus')?.[0];
        selectAllTextOnElement(focusedElement);
    }

    /**************
     *
     *   ActiveEffect Actions
     *
     **************/

    /**
     * Renders an embedded document's sheet
     *
     * @this Shadowrun6ActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    async _viewDoc(event, target) {
        if (target === undefined) target = event.target;
        const doc = this._getEmbeddedDocument(target);
        console.log("SR6E | Shadowrun6ActorSheet | ActiveEffect _viewDoc");
        doc.sheet.render(true);
    }

    /**
     * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
     *
     * @this Shadowrun6ActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    async _createDoc(event, target) {
        if (target === undefined) target = event.target;
        console.log("SR6E | Shadowrun6ActorSheet | ActiveEffect _createDoc");
        // Retrieve the configured document class for Item or ActiveEffect
        const docCls = getDocumentClass(target.dataset.documentClass);
        // Prepare the document creation data by initializing it a default name.
        // TODO .type isn't in the template so isn't set. Why is it needed?
        const docData = {
            name: docCls.defaultName({
                // defaultName handles an undefined type gracefully
                type: target.dataset.type,
                parent: this.actor,
            }),
            img: 'systems/shadowrun6-eden/icons/compendium/cyberware/memory_chip.svg'
        };
        // Loop through the dataset and add it to our docData
        for (const [dataKey, value] of Object.entries(target.dataset)) {
            // These data attributes are reserved for the action handling
            if (['action', 'documentClass'].includes(dataKey)) continue;
            // Nested properties require dot notation in the HTML, e.g. anything with `system`
            // An example exists in spells.hbs, with `data-system.spell-level`
            // which turns into the dataKey 'system.spellLevel'
            foundry.utils.setProperty(docData, dataKey, value);
        }

        // Finally, create the embedded document!
        await docCls.create(docData, { parent: this.actor });
    }

    /**
     * Handles item deletion
     *
     * @this Shadowrun6ActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    async _deleteDoc(event, target) {
        if (target === undefined) target = event.target;
        console.log("SR6E | Shadowrun6ActorSheet | ActiveEffect _deleteDoc");
        const confirm = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.format("DOCUMENT.Delete", { type: game.i18n.localize("DOCUMENT.ActiveEffect") }) },
            content: `<strong>${game.i18n.localize("AreYouSure")}</strong><p>${game.i18n.format("SIDEBAR.DeleteWarning", { type: game.i18n.localize("DOCUMENT.ActiveEffect") })}</p>`,
            rejectClose: false,
            modal: true
        });
        if(!confirm) return;
        
        const doc = this._getEmbeddedDocument(target);
        await doc.delete();
    }

    /**
     * Determines effect parent to pass to helper
     *
     * @this Shadowrun6ActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    async _toggleEffect(event, target) {
        if (target === undefined) target = event.target;
        console.log("SR6E | Shadowrun6ActorSheet | ActiveEffect _toggleEffect");
        const effect = this._getEmbeddedDocument(target);
        await effect.update({ disabled: !effect.disabled });
    }

    /**
     * Fetches the embedded document representing the containing HTML element
     *
     * @param {HTMLElement} target    The element subject to search
     * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
     */
    _getEmbeddedDocument(target) {
        const docRow = target.closest('li[data-document-class]');
        if (docRow.dataset.documentClass === 'Item') {
            return this.actor.items.get(docRow.dataset.itemId);
        } else if (docRow.dataset.documentClass === 'ActiveEffect') {
            const parent =
            docRow.dataset.parentId === this.actor.id
                ? this.actor
                : this.actor.items.get(docRow?.dataset.parentId);
            return parent.effects.get(docRow?.dataset.effectId);
        } else return console.warn('Could not find document class');
    }


}