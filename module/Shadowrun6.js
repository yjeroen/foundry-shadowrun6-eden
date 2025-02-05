/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
import SR6Roll, { SR6RollChatMessage } from "./SR6Roll.js";
import { registerSystemSettings } from "./settings.js";
import Shadowrun6Combat from "./Shadowrun6Combat.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import { SR6Config } from "./config.js";
import { Shadowrun6ActorSheetPC } from "./sheets/ActorSheetPC.js";
import { Shadowrun6ActorSheetNPC } from "./sheets/ActorSheetNPC.js";
import { Shadowrun6ActorSheetVehicle } from "./sheets/ActorSheetVehicle.js";
//import { Shadowrun6ActorSheetVehicleCompendium } from "./sheets/ActorSheetVehicleCompendium.js";
import { SR6ItemSheet } from "./sheets/SR6ItemSheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { defineHandlebarHelper } from "./util/helper.js";
import { PreparedRoll, RollType } from "./dice/RollTypes.js";
import { doRoll } from "./Rolls.js";
import EdgeUtil from "./util/EdgeUtil.js";
import Shadowrun6Combatant from "./Shadowrun6Combatant.js";
import Shadowrun6CombatTracker from "./Shadowrun6CombatTracker.js";
import Importer from "./util/Importer.js";
const diceIconSelector = "#chat-controls .chat-control-icon .fa-dice";

/**
 * Change to true for developer mode
 */
// CONFIG.debug.hooks = true;
// CONFIG.debug.dice = true;

/**
 * Init hook. Called from Foundry when initializing the world
 */
Hooks.once("init", async function () {

    console.log(`SR6E | Initializing Shadowrun 6 System`);

    CONFIG.SR6 = new SR6Config();

    CONFIG.ChatMessage.documentClass = SR6RollChatMessage;
    CONFIG.Combat.documentClass = Shadowrun6Combat;
    CONFIG.Combatant.documentClass = Shadowrun6Combatant;
    CONFIG.ui.combat = Shadowrun6CombatTracker;
    CONFIG.Actor.documentClass = Shadowrun6Actor;
    CONFIG.Dice.rolls = [SR6Roll];
    //	(CONFIG as any).compatibility.mode = 0;
    getData(game).initiative = "@initiative.physical.pool + (@initiative.physical.dicePool)d6";
    registerSystemSettings();
    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetPC, { types: ["Player"], makeDefault: true });
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetNPC, { types: ["NPC", "Critter", "Spirit"], makeDefault: true });

    //TODO Improve Vehicle Actor & Sheet
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetVehicle, { types: ["Vehicle"], makeDefault: true });

    Items.registerSheet("shadowrun6-eden", SR6ItemSheet, {
        types: [
            "gear",
            "martialarttech",
            "martialartstyle",
            "quality",
            "spell",
            "adeptpower",
            "ritual",
            "metamagic",
            "focus",
            "echo",
            "complexform",
            "sin",
            "contact",
            "lifestyle",
            "critterpower",
            "software"
        ],
        makeDefault: true
    });
    preloadHandlebarsTemplates();
    defineHandlebarHelper();
    document.addEventListener('paste', (e) => Importer.pasteEventhandler(e), false);

    Hooks.once("diceSoNiceReady", (dice3d) => {
        dice3d.addSystem({ id: "SR6", name: "Shadowrun 6 - Eden" }, "default");
        dice3d.addDicePreset({
            type: "d6",
            labels: [
                "",
                "2",
                "3",
                "4",
                "5",
                "6"
                //        "systems/shadowrun6-eden/icons/SR6_D6_5_o.png",
                //        "systems/shadowrun6-eden/icons/SR6_D6_6_o.png"
            ],
            bumpMaps: [
                ,
                ,
                ,
                ,
                , //        "systems/shadowrun6-eden/icons/SR6_D6_5_o.png",
                //        "systems/shadowrun6-eden/icons/SR6_D6_6_o.png"
            ],
            colorset: "SR6_dark",
            system: "SR6"
        });
        dice3d.addDicePreset({
            type: "dc",
            labels: ["systems/shadowrun6-eden/images/EdgeToken.webp", "systems/shadowrun6-eden/images/EdgeToken.webp"],
            bumpMaps: [,],
            colorset: "SR6_dark",
            system: "SR6"
        });
        dice3d.addColorset({
            name: "SR6_light",
            description: "SR 6 Pink",
            category: "SR6",
            foreground: "#470146",
            background: "#f7c8f6",
            outline: "#2e2b2e",
            texture: "none",
            edge: "#9F8003",
            material: "glass",
            font: "Arial Black",
            fontScale: {
                d6: 1.1,
                df: 2.5
            },
            visibility: "hidden"
        }, "no");
        dice3d.addColorset({
            name: "SR6_dark",
            description: "SR 6 Pink Dark",
            category: "SR6",
            foreground: "#470146",
            background: "#000000",
            outline: "#2e2b2e",
            texture: "none",
            edge: "#470146",
            material: "metal",
            font: "Arial Black",
            fontScale: {
                d6: 1.1,
                df: 2.5
            },
            visibility: "visible"
        }, "default");

    });
    /*
     * Change default icon
     */
    function onCreateItem(item, options, userId) {
        let actor = getActorData(item);
        let system = getSystemData(item);
        console.log("SR6E | onCreateItem  " + item.system.type + " with ", options);
        if (actor.img == "icons/svg/item-bag.svg" && CONFIG.SR6.icons[actor.type]) {
            actor.img = CONFIG.SR6.icons[actor.type].default;
            item.updateSource({ ["img"]: actor.img });
        }
        // If it is a compendium item, copy over text description
        let key = actor.type + "." + system.genesisID;
        console.log("SR6E | Item with genesisID - check for " + key);
        if (!game.i18n.localize(key + "name").startsWith(key)) {
            system.description = game.i18n.localize(key + ".desc");
            actor.name = game.i18n.localize(key + ".name");
            item.updateSource({ ["description"]: system.description });
        }
        console.log("SR6E | onCreateItem: " + actor.img);
    }
    Hooks.on("createItem", (doc, options, userId) => onCreateItem(doc, options, userId));
    
    /*
     * Change chat dice icon
     */
    Hooks.on("renderChatLog", (doc, options, userId) => {
        // Replace D20 chat icon with D6's
        let chatDiceIcon = document.querySelector(".chat-control-icon .fas.fa-dice-d20");
        chatDiceIcon.setAttribute("class", "fas fa-dice");
    });
    Hooks.on("ready", () => {
        // Render a dice roll dialog on click
        $(document).on("click", diceIconSelector, (ev) => {
            console.log("SR6E | diceIconSelector clicked  ", ev);
            ev.preventDefault();
            // Roll and return
            let roll = new PreparedRoll();
            roll.pool = 0;
            roll.speaker = ChatMessage.getSpeaker({ actor: this });
            roll.rollType = RollType.Common;
            doRoll(roll);
        });
    });
    Hooks.on("renderShadowrun6ActorSheetPC", (doc, options, userId) => {
        console.log("SR6E | renderShadowrun6ActorSheetPC hook called", doc);
    });
    Hooks.on("renderShadowrun6ActorSheetVehicle", (app, html, data) => {
        //    console.log("SR6E | renderShadowrun6ActorSheetVehicle hook called");
        _onRenderVehicleSheet(app, html, data);
    });
    Hooks.on("renderSR6ItemSheet", (app, html, data) => {
        console.log("SR6E | renderSR6ItemSheet hook called");
        _onRenderItemSheet(app, html, data);
    });
    Hooks.on("dropCanvasData", (doc, data) => {
        console.log("SR6E | dropCanvasData hook called", doc);
    });
    /*
     * Something has been dropped on the HotBar
     */
    Hooks.on("hotbarDrop", async (bar, data, slot) => {
        console.log("SR6E | DROP to Hotbar");
        let macroData = {
            name: "",
            type: "script",
            img: "icons/svg/dice-target.svg",
            command: ""
        };
        /*    // For items, memorize the skill check
    if (data.type === "Item") {
      console.log("SR6E | Item dropped " + data);
      if (data.id) {
        data.data = game.items.get(data.id).data;
      }
      if (data.data) {
        macroData.name = data.data.name;
        macroData.img = data.data.img;

        let actorId = data.actorId || "";

        if (actorId && game.user.isGM) {
          const actorName = game.actors.get(actorId)?.data.name;
          macroData.name += ` (${actorName})`;
        }

        macroData.command = `game.shadowrun6.itemCheck("${data.data.type}","${data.data.name}","${actorId}","${data.data.id}")`;

      }
    };

    if (macroData.command != "" && macroData.name != "") {
      let macro = await Macro.create(macroData, { displaySheet: false });

      game.user.assignHotbarMacro(macro, slot);
    }*/
    });
    Hooks.on("renderChatMessage", function (app, html, data) {
        console.log("SR6E | ENTER renderChatMessage");
        registerChatMessageEdgeListener(this, app, html, data);

        html.on("click", ".chat-edge", (ev) => {
            let event = ev;
            event.preventDefault();
            let roll = $(event.currentTarget);
            let tip = roll.find(".chat-edge-collapsible");
            if (!tip.is(":visible")) {
                tip.slideDown(200);
            }
            else {
                tip.slideUp(200);
            }
        });
        html.find(".rollable").click((event) => {
            //TODO allow multiple targets
            console.log("SR6E | ENTER renderChatMessage.rollable.click -> event.currentTarget = ", event.currentTarget);
            const button = event.currentTarget;
            const dataset = button.dataset;
            let actorId = dataset["actorid"] ? dataset["actorid"] : dataset["targetActor"];
            let sceneId = dataset["sceneid"];
            let tokenId = dataset["targetid"] ? dataset["targetid"] : dataset["targetToken"];
            let actor;
            let token;

            if (actorId && sceneId && tokenId) {
                console.log("SR6E | Target is a token");
                // If scene and token ID is given, resolve token
                let scene = game.scenes.get(sceneId);
                if (scene) {
                    token = scene.tokens.get(tokenId);
                    console.log("SR6E | Token ", token);
                    actor = token.actor;
                }
            } else if (actorId) {
                console.log("SR6E | Target isn't a token but actorId is known");
                actor = game.actors.get(actorId);
            } else if (game.user.targets.size) {
                console.log("SR6E | No original target, selecting current user target");
                //Use current target token
                game.user.targets.forEach((target) => {
                    token = target;
                });
                actor = (token?.actor.isOwner) ? token?.actor : null;
            } else {
                console.log("SR6E | No targets, selecting current token selected");
                //Use current target token
                canvas.tokens.controlled.forEach((target) => {
                    token = target;
                });
                actor = (token?.actor.isOwner) ? token?.actor : null;   
            }

            console.log(actor, (!actor));
            if (!actor) {
                console.log("SR6E | No owned target found - use player's character if possible");
                actor = game.user.character;
            }
            if (actor) {
                console.log("SR6E | Actor targetted by roll", actor);
                if (!actor.isOwner) {
                    console.log("SR6E | Current user not owner of target ", actor.name);
                    ui.notifications.warn("shadowrun6.ui.notifications.You_are_not_owner_of_the_target", { localize: true });
                    return;
                }
            } else {
                console.log("SR6E | No target actor found");
                ui.notifications.warn("shadowrun6.ui.notifications.Target_or_select_a_token_before_rolling", { localize: true });
                return;
            }
            const rollType = dataset.rollType;
            console.log("SR6E | Clicked on rollable : " + rollType);
            console.log("SR6E | dataset : ", dataset);
            const threshold = parseInt(dataset.threshold);
            const damage = dataset.damage ? parseInt(dataset.damage) : 0;
            console.log("SR6E | Target actor ", actor);
            console.log("SR6E | Target actor ", actor.name);
            switch (rollType) {
                case RollType.Defense:
                    /* Avoid being hit/influenced */
                    console.log("SR6E | TODO: call rollDefense with threshold " + threshold);
                    if (actor) {
                        const defendWith = dataset.defendWith;
                        const monitor = dataset.monitor;
                        actor.rollDefense(defendWith, threshold, damage, monitor);
                    }
                    break;
                case RollType.Soak:
                    /* Resist incoming netto damage */
                    //TODO call rollSoak with threshold ?
                    // console.log("SR6E | TODO: call rollSoak with threshold " + threshold + " on monitor " + dataset.soakWith);
                    if (actor) {
                        let soak = dataset.soak;
                        actor.rollSoak(soak, damage);
                    }
                    break;
                case RollType.Damage:
                    /* Do not roll - just apply damage */
                    const monitor = dataset.monitor;
                    const chatMessageId = event.target.closest(".chat-message").dataset.messageId;
                    const chatMessage = game.messages.get(chatMessageId);
                    const roll = chatMessage.rolls[0];

                    if (button.classList.contains('damageApplied') || button.classList.contains('revertDamageCheck')) {
                        // Damage was applied in the past, reverting back
                        button.blur();
                        if (button.classList.contains('revertDamageCheck')) {
                            button.classList.remove("revertDamageCheck");
                            roll.finished.damageApplied = false;
                            chatMessage.update({ 'rolls': [roll] });
                            actor.applyDamage( monitor, damage*-1 );
                        } else {
                            button.classList.remove("damageApplied");
                            button.classList.add("revertDamageCheck");
                        }

                    } else {
                        button.blur();
                        roll.finished.damageApplied = true;
                        chatMessage.update({ 'rolls': [roll] });
                        actor.applyDamage( monitor, damage );
                    }
                    console.log("SR6E | Applied "+monitor+" "+damage+" damage to", actor);
                    break;
            }
            /*
            if (rollType === RollType.Defense) {
                    const actor = (game as Game).actors!.get(targetId);
                console.log("SR6E | Target actor ",actor);
                    console.log("SR6E | TODO: call rollDefense with threshold "+threshold);
                    if (actor) {
                        let defendWith : Defense = (dataset.defendWith! as Defense);
                        let damage     : number  = (dataset.damage)?parseInt(dataset.damage):0;
                        (actor as Shadowrun6Actor).rollDefense(defendWith, threshold, damage);
                    }
            }
                */
        });
        html.on("click", ".chat-edge", (event) => {
            event.preventDefault();
            let roll = $(event.currentTarget);
            let tip = roll.find(".chat-edge-collapsible");
            if (!tip.is(":visible")) {
                tip.slideDown(200);
            }
            else {
                tip.slideUp(200);
            }
        });
        html.on("click", ".chat-edge-post", (event) => {
            event.preventDefault();
            let roll = $(event.currentTarget.parentElement);
            let tip = roll.find(".chat-edge-post-collapsible");
            if (!tip.is(":visible")) {
                tip.slideDown(200);
            }
            else {
                tip.slideUp(200);
            }
        });
        html.on("click", ".chat-spell", (event) => {
            console.log("SR6E | chat-spell");
            event.preventDefault();
            let roll = $(event.currentTarget);
            let tip = roll.find(".chat-spell-collapsible");
            if (!tip.is(":visible")) {
                tip.slideDown(200);
            }
            else {
                tip.slideUp(200);
            }
        });

        console.log("SR6E | LEAVE renderChatMessage");
    });
    /**
     * If a player actor is created, change default token settings
     */
    Hooks.on("preCreateActor", (actor, createData, options, userId) => {
        actor.prototypeToken.updateSource({ displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER });
        if (actor.type === "Player") {
            actor.prototypeToken.updateSource({ actorLink: true });
            actor.prototypeToken.updateSource({ 'sight.enabled': true });
            actor.prototypeToken.updateSource({ disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY });
        } else if (actor.type === "NPC") {
            actor.prototypeToken.updateSource({ prependAdjective: true });
        }
    });
    Hooks.on("preUpdateCombatant", (combatant, createData, options, userId) => {
        console.log("SR6E | Combatant with initiative " + createData.initiative);
    });
    Hooks.on("preUpdateCombat", (combat, createData, options, userId) => {
        let realCombat = getData(combat);
        console.log("SR6E | Combat with turn " + createData.turn + " in round " + realCombat.round);
    });
    Hooks.on("deleteCombat", (combat, createData, userId) => {
        console.log("SR6E | End Combat");
    });
    Hooks.once("dragRuler.ready", (SpeedProvider) => {
        class FictionalGameSystemSpeedProvider extends SpeedProvider {
            get colors() {
                return [
                    { id: "walk", default: 0x00ff00, name: "shadowrun6-eden.speeds.walk" },
                    { id: "dash", default: 0xffff00, name: "shadowrun6-eden.speeds.dash" },
                    { id: "run", default: 0xff8000, name: "shadowrun6-eden.speeds.run" }
                ];
            }
            getRanges(token) {
                const baseSpeed = 5; //token.actor.system.derived.speed not implemented
                // A character can always walk it's base speed and dash twice it's base speed
                const ranges = [
                    { range: 10, color: "walk" },
                    { range: 15, color: "dash" }
                ];
                // Characters that aren't wearing armor are allowed to run with three times their speed
                // TODO isWearingArmor is not implemented
                // if (!token.actor.isWearingArmor) {
                //     ranges.push({ range: baseSpeed * 3, color: "dash" });
                // }
                return ranges;
            }
        }
        // @ts-ignore
        dragRuler.registerSystem("shadowrun6-eden", FictionalGameSystemSpeedProvider);
    });

    Hooks.on("preCreateScene", (scene, createData, options, userId) => {
        // Default Grid Opacity
        scene.updateSource({ 'grid.alpha': 0 })
    });

    Hooks.on("renderSettings", async (_app, $html) => {
        const html = $html[0];
        // Additional system information resources
        const systemRow = html.querySelector(".settings-sidebar li.system");
        const systemInfo = systemRow?.cloneNode(false);
        if (!(systemInfo instanceof HTMLLIElement)) {
            throw ErrorPF2e("Unexpected error attaching system information to settings sidebar");
        }

        systemInfo.classList.remove("system");
        systemInfo.classList.add("system-links");
        const links = [
            {
                url: game.system.url,
                label: "SYSTEM.Sidebar.readme"
            },
            {
                url: game.system.bugs,
                label: "SYSTEM.Sidebar.bugs"
            },
            {
                url: game.system.url+'/labels/enhancement',
                label: "SYSTEM.Sidebar.feature"
            }
        ].map((data) => {
            const anchor = document.createElement("a");
            anchor.href = data.url;
            anchor.innerText = game.i18n.localize(data.label);
            anchor.target = "_blank";
            return anchor;
        });
        systemInfo.append(...links);
        systemRow?.after(systemInfo);
        systemInfo?.after(document.createElement("hr"));
    });

});

$.fn.closestData = function (dataName, defaultValue = "") {
    let value = this.closest(`[data-${dataName}]`)?.data(dataName);
    return value ? value : defaultValue;
};
/* -------------------------------------------- */
function registerChatMessageEdgeListener(event, chatMsg, html, data) {
    if (!chatMsg.isOwner) {
        console.log("SR6E | I am not owner of that chat message from " + data.alias);
        return;
    }
    // React to changed edge boosts and actions
    let boostSelect = html.find(".edgeBoosts");
    let edgeActions = html.find(".edgeActions");
    if (boostSelect) {
        boostSelect.change((event) => EdgeUtil.onEdgeBoostActionChange(event, "POST", chatMsg, html, data));
        boostSelect.keyup((event) => EdgeUtil.onEdgeBoostActionChange(event, "POST", chatMsg, html, data));
    }
    // chatMsg.roll is a SR6Roll
    let btnPerform = html.find(".edgePerform");
    let roll = getRoll(chatMsg);
    if (btnPerform && roll) {
        btnPerform.click((event) => EdgeUtil.peformPostEdgeBoost(chatMsg, html, data, btnPerform, boostSelect, edgeActions));
    }
}
function _onRenderVehicleSheet(application, html, data) {
    console.log("SR6E | _onRenderVehicleSheet for " + data.actor);
}
function _onRenderItemSheet(sheet, html, item) {
    console.log("SR6E | _onRenderItemSheet for ", item);
}
function getData(obj) {
    if (game.release.generation >= 10)
        return obj;
    return obj.data;
}
function getRoll(obj) {
    if (game.release.generation >= 10)
        return obj.rolls[0];
    return obj.roll;
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