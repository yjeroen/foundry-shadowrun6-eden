import { WeaponRoll, SkillRoll, SpellRoll, RitualRoll, PreparedRoll, RollType, MatrixActionRoll, ComplexFormRoll } from "../dice/RollTypes.js";
import { selectAllTextOnElement } from "../util/HtmlUtilities.js";

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
export class Shadowrun6ActorSheet extends ActorSheet {
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
        console.log("SR6E | getData1() ", data);
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
            html.find(".health-phys").on("input", this._redrawBar(html, "Phy", getSystemData(this.actor).physical));
            html.find(".health-stun").on("input", this._redrawBar(html, "Stun", getSystemData(this.actor).stun));
            // Roll Skill Checks
            html.find(".skill-roll").click(this._onRollSkillCheck.bind(this));
            html.find(".spell-roll").click(this._onRollSpellCheck.bind(this));
            html.find(".ritual-roll").click(this._onRollRitualCheck.bind(this));
            html.find(".item-roll").click(this._onRollItemCheck.bind(this));
            html.find(".defense-roll").click(this._onCommonCheck.bind(this));
            html.find(".matrix-roll").click(this._onMatrixAction.bind(this));
            html.find(".complexform-roll").click(this._onRollComplexFormCheck.bind(this));
            html.find(".attributeonly-roll").click(this._onCommonCheck.bind(this));
            this.activateCreationListener(html);
            html.find(".item-delete").click((event) => {
                const itemId = this._getClosestData($(event.currentTarget), "item-id");
                console.log("SR6E | Delete item " + itemId);
                this.actor.deleteEmbeddedDocuments("Item", [itemId]);
            });

            // Edge coin flip
            html.find(".edge-coin").mousedown(async (event) => {
                const mousePress = event.which; // 1: Left Mouse Button, 2: Middle Mouse Button, 3: Right Mouse button
                const coin = event.currentTarget;
                let edge = this.actor.system.edge.value;
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

                console.log("SR6E | Edge coin  flip ====================", coin);
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
                if (!item)
                    return;
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
            $(".draggable")
                .on("dragstart", (event) => {
                console.log("SR6E | DRAG START");
                const itemId = event.currentTarget.dataset.itemId;
                if (itemId) {
                    console.log("SR6E | Item " + itemId + " dragged");
                    const itemData = getActorData(this.actor).items.find((el) => el.id === itemId);
                    event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                        type: "Item",
                        data: itemData,         //TODO: unclear if this line also needs a change to system:
                        actorId: this.actor.id
                    }));
                    event.stopPropagation();
                    return;
                }
            })
                .attr("draggable", "true");
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
        html.find('.critterpower-create').click(ev => {
            const itemData = {
                name: game.i18n.localize("shadowrun6.newitem.critterpower"),
                type: "critterpower",
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
        // if (!event.currentTarget.dataset.value)
        //     event.currentTarget.dataset.value = 0;
        // switch (event.target.parentNode.getAttribute("id")) {
        switch (monitorType) {
            case "Phy":
                console.log("SR6E | setDamage physical health to ", damageClicked);
                //Allow setting zero health by clicking again
                if (getSystemData(this.actor).physical.dmg == damageClicked) {
                    await this.actor.update({ [`system.physical.dmg`]: damageClicked - 1 });
                }
                //When going health back up, UX is more logical to gain health until the box you clicked on
                else if (getSystemData(this.actor).physical.dmg > damageClicked) {
                    await this.actor.update({ [`system.physical.dmg`]: damageClicked - 1 });
                } 
                else {
                    await this.actor.update({ [`system.physical.dmg`]: damageClicked });
                }
                break;
            case "Stun":
                console.log("SR6E | setDamage stun health to ", damageClicked);
                //Allow setting zero health by clicking again
                if (getSystemData(this.actor).stun.dmg == damageClicked) {
                    await this.actor.update({ [`system.stun.dmg`]: damageClicked - 1 });
                }
                //When going health back up, UX is more logical to gain health until the box you clicked on
                else if (getSystemData(this.actor).stun.dmg > damageClicked) {
                    await this.actor.update({ [`system.stun.dmg`]: damageClicked - 1 });
                } 
                else {
                    await this.actor.update({ [`system.stun.dmg`]: damageClicked });
                }
                break;
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
                let breakHr = document.createElement("hr");
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
        let roll = new PreparedRoll();
        roll.pool = parseInt(event.currentTarget.dataset.pool);
        roll.rollType = RollType.Common;
        let classList = event.currentTarget.classList;
        if (classList.contains("defense-roll")) {
            roll.actionText = game.i18n.localize("shadowrun6.defense." + event.currentTarget.dataset.itemId);
        }
        else if (classList.contains("attributeonly-roll") && classList.contains("attribute-poolmod")) {
            roll.actionText = game.i18n.localize("attrib." + event.currentTarget.dataset.itemId);
        }
        else if (classList.contains("attributeonly-roll")) {
            roll.actionText = game.i18n.localize("shadowrun6.derived." + event.currentTarget.dataset.itemId);
        }
        else {
            roll.actionText = game.i18n.localize("shadowrun6.rolltext." + event.currentTarget.dataset.itemId);
        }
        let dialogConfig;
        if (classList.contains("defense-roll")) {
            roll.allowBuyHits = false;
            dialogConfig = {
                useModifier: true,
                useThreshold: false
            };
        }
        else if (classList.contains("attributeonly-roll")) {
            roll.allowBuyHits = true;
            roll.useAttributeMod = classList.contains("attribute-poolmod");
            roll.attributeTested = event.currentTarget.dataset.itemId;
            roll.checkText = roll.actionText;
            dialogConfig = {
                useModifier: true,
                useThreshold: true
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
        //TODO rework dialogConfig because its not used..
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
    _onRollItemCheck(event, html) {
        console.log("SR6E | _onRollItemCheck");
        event.preventDefault();
        const attacker = getSystemData(this.actor);
        const itemId = event.currentTarget.dataset.itemId;
        let item = this.actor.items.get(itemId);
        if (!item) {
            throw new Error("onRollItemCheck for non-existing item");
        }
        if (!isGear(getSystemData(item))) {
            throw new Error("onRollItemCheck: No skill for item");
        }
        if (isWeapon(getSystemData(item))) {
            console.log("SR6E | is weapon", item);
        }
        const gear = getSystemData(item);
        let roll = new WeaponRoll(attacker, item, itemId, gear);
        roll.useWildDie = gear.wild ? 1 : 0;
        console.log("SR6E | _onRollItemCheck before ", roll);
        this.actor.rollItem(roll);
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

    async _render(...args) {
        await super._render(...args);

        // Preselect text on focusedElement to quickly enter values in combination with tabbing
        const focusedElement = $(this.element).find(':focus')?.[0];
        selectAllTextOnElement(focusedElement);
    }
}