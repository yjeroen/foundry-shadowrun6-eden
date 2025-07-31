/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
import SR6Roll from "./SR6Roll.js";
import { registerSystemSettings } from "./settings.js";
import Shadowrun6Combat from "./Shadowrun6Combat.js";
import { Shadowrun6Actor } from "./Shadowrun6Actor.js";
import SR6Item from "./documents/SR6Item.js";
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
import { SYSTEM_NAME } from "./constants.js";
import EdgeRoll from "./dice/EdgeRoll.js";
import Shadowrun6Combatant from "./Shadowrun6Combatant.js";
import Shadowrun6CombatTracker from "./Shadowrun6CombatTracker.js";
import statusEffects from "./statusEffects.js";
import SR6TokenHUD from "./SR6TokenHUD.js";
import SR6Token from "./placeables/SR6Token.js";
import SR6ActiveEffectModel from "./datamodels/SR6ActiveEffectModel.mjs";
import * as utils from "./util/helper.js";
import macros from "./util/macros.js";
import Importer from "./util/Importer.js";
import { migrateWorld } from "./util/Migrations.js";
import SR6SocketHandler from './util/SR6SocketHandler.js';
import releaseNotes from "../releasenotes/releasenotes.js";

/**
 * Init hook. Called from Foundry when initializing the world
 */
Hooks.once("init", async function () {
    /**
     * Change to true for developer mode
     */
    game.debug = false;

    console.log(`SR6E | Initializing Shadowrun 6 System`);
    if (game.debug) {
        CONFIG.debug.hooks = true;
        CONFIG.debug.dice = true;
    }

    game.sr6 = {};
    game.sr6.config = CONFIG.SR6 = new SR6Config();
    game.sr6.utils = utils;
    game.sr6.macros = macros;
    game.sr6.sr6roll = SR6Roll;
    game.sr6.sockets = new SR6SocketHandler();
    game.sr6.releaseNotes = releaseNotes;
    registerSystemSettings();

    CONFIG.Combat.documentClass = Shadowrun6Combat;
    CONFIG.Combatant.documentClass = Shadowrun6Combatant;
    CONFIG.ui.combat = Shadowrun6CombatTracker;
    CONFIG.Actor.documentClass = Shadowrun6Actor;
    CONFIG.Item.documentClass = SR6Item;
    CONFIG.Dice.rolls = [SR6Roll];

    if ( game.settings.get(SYSTEM_NAME, "hackSlashMatrix") ) {
        CONFIG.SR6.MATRIX_ACTIONS = {...CONFIG.SR6.MATRIX_ACTIONS, ...CONFIG.SR6.MATRIX_ACTIONS_HS};
    }
    
    CONFIG.statusEffects = statusEffects.map(status => ({...status, _id: utils.staticId(status.id) }));
    if ( !game.settings.get(SYSTEM_NAME, "bleeding") ) {
        CONFIG.statusEffects = CONFIG.statusEffects.filter(function(effect) { return effect.id != "bleeding"; });
    }

    CONFIG.Token.hudClass = SR6TokenHUD;
    CONFIG.Token.objectClass = SR6Token;
    CONFIG.ActiveEffect.dataModels.base = SR6ActiveEffectModel;

    // Initialize socket handler
    game.sr6.sockets.registerSocketListeners();

    //	(CONFIG as any).compatibility.mode = 0;
    getData(game).initiative = "@initiative.physical.pool + (@initiative.physical.dicePool)d6";

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetPC, { types: ["Player"], makeDefault: true });
    Actors.registerSheet("shadowrun6-eden", Shadowrun6ActorSheetNPC, { types: ["NPC", "Critter", "Spirit"], makeDefault: true });
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

    if (game.release.generation >= 13) {
        document.body.classList.add('foundry-modern');
    }

    preloadHandlebarsTemplates();
    defineHandlebarHelper();
    document.addEventListener('paste', (e) => Importer.pasteEventhandler(e), false);

    $('#pause img').attr('class', 'fa-beat-fade');

    Hooks.once("diceSoNiceReady", (dice3d) => {
        dice3d.addSystem({ id: "SR6", name: "Shadowrun 6 - Eden", defaultValue: true }, true, "default");
        dice3d.addDicePreset({
            type: "d6",
            labels: [
                "1",
                "2",
                "3",
                "4",
                "systems/shadowrun6-eden/icons/SR6_D6_5_o.png",
                "systems/shadowrun6-eden/icons/SR6_D6_6_o.png"
            ],
            bumpMaps: [
                ,
                ,
                ,
                , 
                "systems/shadowrun6-eden/icons/SR6_D6_5_o_map.png",
                "systems/shadowrun6-eden/icons/SR6_D6_6_o_map.png"
            ],
            colorset: "SR6_dark",
            system: "SR6"
            , defaultValue: true
        });
        dice3d.addDicePreset({
            type: "dc",
            labels: ["systems/shadowrun6-eden/images/EdgeToken.webp", "systems/shadowrun6-eden/images/EdgeToken.webp"],
            bumpMaps: [,],
            colorset: "SR6_dark",
            system: "SR6"
            , defaultValue: true
        });
        dice3d.addColorset({
            name: "SR6_dark",
            description: "- Shadowrun 6 -",
            category: "Colors",
            foreground: "#660265",
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
            visibility: "visible",
            system: "SR6"
            , defaultValue: true
        }, "default");

    });
    /*
     * Change default icon
     */
    function onCreateItem(item, options, userId) {
        let actor = getActorData(item);
        let system = getSystemData(item);
        console.log("SR6E | onCreateItem  " + item.system.type + " with ", options);
        if (actor.img == "systems/shadowrun6-eden/icons/compendium/gear/tech_bag.svg" && CONFIG.SR6.icons[actor.type]) {
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
     * Called via var $(document).on("click", "sr6-dice-roll-v12"
     */
    Hooks.on("renderChatLog", (doc, options, userId) => {
        // Replace D20 chat icon with D6's
        if (game.release.generation < 13) {
            let chatDiceIcon = document.querySelector(".chat-control-icon .fas.fa-dice-d20");
            chatDiceIcon.setAttribute("class", "fas fa-dice sr6-dice-roll-v12");
            chatDiceIcon.setAttribute("title", game.i18n.localize("shadowrun6.roll.create"));
        }
    });
    Hooks.on("getSceneControlButtons", (controls) => {    
        if (game.release.generation >= 13) {
            const shadowrunRoll = {
                name: "shadowrunRoll",
                order: 99,
                title: "shadowrun6.roll.create",
                icon: "fa-solid fa-dice",
                onClick: () => _onClickDiceRoll(),
                button: true
            };
            controls.tokens.tools.shadowrunRoll = shadowrunRoll;
        }
    });

    Hooks.on("ready", () => {
        migrateWorld();
        game.sr6.releaseNotes();

        // Render a dice roll dialog on click for V12
        $(document).on("click", ".sr6-dice-roll-v12", (e) => {
            _onClickDiceRoll();
        });
        // make Release Note link in sidebar clickable
        const releaseNoteLink = document.querySelector("#system-releasenotes");
        releaseNoteLink.addEventListener("click", (e) => {
            game.sr6.releaseNotes({force: true});
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
    Hooks.on("hotbarDrop", async (bar, droppedData, slot) => {
        console.log("SR6E | DROP to Hotbar", droppedData);
        let macroData = {
            name: "",
            command: "",
            type: "script",
            img: "systems/shadowrun6-eden/icons/compendium/default/Default_Dice.svg"
        };
        const { type, ...data } = droppedData;

        if (type === 'Item') {
            // Do nothing, FoundryVTT Native
            return;
        } if (type === 'Roll') {
            if (data.classList.includes('weapon-roll') || data.classList.includes('spell-roll') || data.classList.includes('ritual-roll') || data.classList.includes('complexform-roll')) {
                const item = await fromUuidSync(data.uuid);
                macroData.name = item.name;
                if (data.skill==="firearms") {
                    macroData.img = "systems/shadowrun6-eden/icons/compendium/weapons/air_pistol.svg";
                } else if (data.skill==="close_combat") {
                    macroData.img = "systems/shadowrun6-eden/icons/compendium/weapons/unarmed.svg"
                } else if (data.classList.includes('spell-roll')) {
                    macroData.img = "systems/shadowrun6-eden/icons/compendium/default/acid.svg"
                } else if (data.classList.includes('ritual-roll')) {
                    macroData.img = "systems/shadowrun6-eden/icons/compendium/programs/nervescrub.svg"
                } else if (data.classList.includes('complexform-roll')) {
                    macroData.img = "systems/shadowrun6-eden/icons/compendium/the_12_days_of_cybermas/sycust_fleshweave.svg"
                }
                else {
                    // special weapons
                    macroData.img = "systems/shadowrun6-eden/icons/compendium/cyberweapons/wolvers.svg";
                }
            } else {
                macroData.name = game.sr6.utils.rollText(data.classList, data.rollId??data.skill??data.matrixId, data.skillspec);
            }
            macroData.command = `game.sr6.macros.simpletest(${JSON.stringify(data)})`;
        } else {
            console.warn("SR6E | Draggable object not supported to convert onto the hotbar", droppedData);
        }

        if (macroData.command != "" && macroData.name != "") {
            let macro = await Macro.create(macroData, { displaySheet: false });
            game.user.assignHotbarMacro(macro, slot);
        }
    });
    Hooks.on("preCreateMacro", (macro, data, options, user) => {
        if (macro.img === "icons/svg/book.svg") {
            macro.updateSource({ img: "systems/shadowrun6-eden/icons/compendium/default/Default_Container.svg" });
        }
    });

    Hooks.on("renderChatMessage", function (app, html, data) {
        console.log("SR6E | ENTER renderChatMessage");
        
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
            const actorUuid = dataset.actorUuid;
            let actorId = dataset["actorid"] ? dataset["actorid"] : dataset["targetActor"];
            let sceneId = dataset["sceneid"];
            let tokenId = dataset["targetid"] ? dataset["targetid"] : dataset["targetToken"];
            let actor;
            let token;

            if (actorUuid) {
                actor = game.actors.get(actorUuid);
            } else if (actorId && sceneId && tokenId) {
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
                //Use currently selected token
                canvas.tokens.controlled.forEach((target) => {
                    token = target;
                });
                actor = (token?.actor.isOwner) ? token?.actor : null;   
            }

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
            let dialogConfig;
            switch (rollType) {
                case RollType.ContinueExtendedTest:
                    console.log("SR6E | Processing Rollable Chatbutton for Continueing an open ended Extended Test");
                    const extendedRoll = new PreparedRoll();
                    extendedRoll.pool = parseInt(dataset.pool) - 1;
                    extendedRoll.rollType = RollType.ContinueExtendedTest;
                    extendedRoll.extendedTotal = parseInt(dataset.hits);
                    extendedRoll.extended = true;
                    extendedRoll.actionText = dataset.actionText;
                    extendedRoll.checkText = game.i18n.format("shadowrun6.dice.extended.continue");
                    extendedRoll.allowBuyHits = false;
                    extendedRoll.threshold = 0;
                    extendedRoll.interval = parseInt(dataset.interval);
                    extendedRoll.intervalScale = dataset.intervalScale;
                    extendedRoll.timePassed = parseInt(dataset.timePassed);
                    dialogConfig = {
                        useWoundModifier: false,
                        useSustainedSpellModifier: false
                    };
                    actor.rollCommonCheck(extendedRoll, dialogConfig);

                    break;
                case RollType.Legwork:
                    console.log("SR6E | Processing Rollable Chatbutton for Legwork");
                    const loyaltyRoll = new PreparedRoll();
                    loyaltyRoll.pool = actor.system.skills.influence.pool + parseInt(dataset.loyalty);
                    loyaltyRoll.rollType = RollType.Legwork;
                    loyaltyRoll.actionText = game.sr6.utils.rollText('', 'legwork');
                    loyaltyRoll.allowBuyHits = true;
                    loyaltyRoll.threshold = 1;
                    loyaltyRoll.checkText = game.i18n.format("shadowrun6.legwork.loyalty_description", { name: dataset.contact });
                    loyaltyRoll.legwork = { legworkResult: parseInt(dataset.legworkResult) };
                    dialogConfig = {
                        useWoundModifier: false,
                        useSustainedSpellModifier: false
                    };
                    actor.rollCommonCheck(loyaltyRoll, dialogConfig);
                    break;
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
                            if (button.classList.contains('damageConvertedStun')) {
                                roll.finished.damageApplied2 = false;
                            } else {
                                roll.finished.damageApplied = false;
                            }
                            roll.finished.damageApplied = false;
                            chatMessage.update({ 'rolls': [roll] });
                            actor.applyDamage( monitor, damage*-1 );
                        } else {
                            button.classList.remove("damageApplied");
                            button.classList.add("revertDamageCheck");
                        }

                    } else {
                        button.blur();
                        if (button.classList.contains('damageConvertedStun')) {
                            roll.finished.damageApplied2 = true;
                        } else {
                            roll.finished.damageApplied = true;
                        }
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
        // Collapsible Chat Dice tooltip
        html.on("click", ".chat-edge-post", (event) => {
            console.log("SR6E | Chat roll tooltip clicked for Edge");
            event.preventDefault();
            let roll = $(event.currentTarget.parentElement);
            let tip = roll.find(".chat-edge-post-collapsible");
            if (!tip.is(":visible")) {
                const chatMsg = game.messages.get( event.currentTarget.closest("[data-message-id]").dataset.messageId );
                const chatSpeakerActor = game.sr6.utils.getActor(chatMsg.speaker.actor, chatMsg.speaker.scene, chatMsg.speaker.token);
                let selectedActor;
                
                // Don't do edge boosts when its an extended test (complicated implementation & only for riggers)
                if (!chatMsg.rolls[0].configured.extended) {
                    selectedActor = game.sr6.utils.getSelectedActor();
                }
                chatMsg.edgeTooltipUsedBy = selectedActor?.uuid;
                
                if (chatSpeakerActor?.uuid === selectedActor?.uuid && selectedActor?.isOwner) {
                    if (!chatMsg.rolls[0]?.finished.edge_use)
                        tip.addClass("edgeable edge-own-roll");
                } else if (chatSpeakerActor?.uuid !== selectedActor?.uuid && selectedActor?.isOwner) {
                    if (!chatMsg.rolls[0]?.finished.edge_use_opponent)
                        tip.addClass("edgeable edge-opponent-roll");
                }
                tip.slideDown(200);
            }
            else {
                const chatMsg = game.messages.get( event.currentTarget.closest("[data-message-id]").dataset.messageId );
                chatMsg.rolls[0]?.finished?.results?.forEach((die) => {
                    die.selectedDie = false;
                });
                tip.find('li').removeClass("selectedDie");
                tip.removeClass("edgeable edge-own-roll edge-opponent-roll");
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
        
        // Implement selecting dice in chat
        html.on("click", ".edgeable.edge-own-roll .die.miss, .edgeable.edge-opponent-roll .die.hit", (event) => {
            console.log("SR6E | Dice clicked for Edge boost");
            event.preventDefault();
            const selected = event.currentTarget.classList.toggle("selectedDie");
            const chatMsg = game.messages.get( event.currentTarget.closest("[data-message-id]").dataset.messageId );
            const roll = chatMsg.rolls[0];
            const die = roll.finished.results[ event.currentTarget.dataset.index ];
            die.selectedDie = selected; // true or false dependent on .toggle
        });
        // Implement Edge Boost button in chat
        html.on("click", ".dice-tooltip.edgeable .edgePerform", (event) => {
            console.log("SR6E | Edge Boost button clicked in chat");
            event.preventDefault();
            const edgeType = event.currentTarget.form["edgeBoostSelect"].selectedOptions[0].value;
            const chatMsg = game.messages.get( event.currentTarget.closest("[data-message-id]").dataset.messageId );
            const roll = chatMsg.rolls[0];
            const selectedActor = game.sr6.utils.getSelectedActor();

            if (chatMsg?.edgeTooltipUsedBy === selectedActor?.uuid) {
                EdgeRoll.performPostEdgeBoost(chatMsg.id, edgeType);
            } else {
                html.find(".chat-edge-post").trigger( "click" );
                const msg = game.i18n.format("shadowrun6.ui.notifications.reopen_dice_tooltip");
                ui.notifications.warn(msg);
            }
        });
        
        console.log("SR6E | LEAVE renderChatMessage");
    });
    /**
     * If a player actor is created, change default token settings
     */
    Hooks.on("preCreateActor", (actor, createData, options, userId) => {
        actor.prototypeToken.updateSource({ 
            displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            displayBars: CONST.TOKEN_DISPLAY_MODES.NONE
        });
        if (actor.type === "Player") {
            actor.prototypeToken.updateSource({
                actorLink: true,
                'sight.enabled': true,
                disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY
            });
        } else if (actor.type === "NPC") {
            actor.prototypeToken.updateSource({
                prependAdjective: true
            });
        } else if (actor.type === "Vehicle") {
            actor.prototypeToken.updateSource({
                'sight.enabled': true,
                disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
                width: 2,
                height: 3
            });
        }

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
    // Shadowrun Pause button for V12
    Hooks.on("renderPause", async function (Pause, html, paused) {
        $('#pause img').attr('src', '/systems/shadowrun6-eden/images/SR6Logo3.webp');
        $('#pause img').attr('class', 'fa-beat-fade');
        $('#pause figcaption').attr('class', 'glitch'); 
    });
    // Shadowrun Pause button for V13
    Hooks.on("renderGamePause", async function (GamePause, html, options, renderOptions) {
        $('#pause img').attr('src', '/systems/shadowrun6-eden/images/SR6Logo3.webp');
        $('#pause img').attr('class', 'fa-beat-fade');
        $('#pause figcaption').attr('class', 'glitch'); 
    });
    Hooks.on("preCreateScene", (scene, createData, options, userId) => {
        // Default Grid Opacity
        scene.updateSource({ 'grid.alpha': 0 })
    });

    Hooks.on("renderSettings", async (_app, $html) => {
        const html = $html instanceof jQuery ? $html[0] : $html;
        // Additional system information resources
        const systemRow = html.querySelector(".settings-sidebar .system");
        const systemInfo = systemRow?.cloneNode(false);
        if (!(systemInfo instanceof HTMLElement)) {
            console.error("SR6 | Unexpected error attaching system information to settings sidebar");
        }

        systemInfo.classList.remove("system");
        systemInfo.classList.add("system-links");
        const links = [
            {
                url: game.system.authors.values().next().value.url,
                label: "SYSTEM.Sidebar.readme"
            },
            {
                url: game.system.bugs,
                label: "SYSTEM.Sidebar.bugs"
            },
            {
                id: "system-releasenotes",
                url: "javascript:void(0);",
                label: "SYSTEM.Sidebar.release_notes"
            }
        ].map((data) => {
            const anchor = document.createElement("a");
            anchor.innerText = game.i18n.localize(data.label);
            anchor.href = data.url ?? "";
            if (data.id) 
                anchor.id = data.id;
            else
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
function _onRenderVehicleSheet(application, html, data) {
    console.log("SR6E | _onRenderVehicleSheet for " + data.actor);
}
function _onRenderItemSheet(sheet, html, item) {
    console.log("SR6E | _onRenderItemSheet for ", item);
}
function _onClickDiceRoll (ev) {
    console.log("SR6E | sr6-dice-roll clicked  ");
    let roll = new PreparedRoll();
    roll.pool = 0;
    roll.speaker = ChatMessage.getSpeaker({ actor: this });
    roll.rollType = RollType.Common;
    doRoll(roll);
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