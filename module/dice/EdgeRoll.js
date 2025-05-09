import { RollType } from "./RollTypes.js";
import SR6Roll from "../SR6Roll.js";
import { getActor } from "../util/helper.js";
import { getSelectedActor } from "../util/helper.js";

export default class EdgeRoll {
    static get postEdgeBoosts() {
        return CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when == "POST");
    }
    static get postEdgeBoostsOpponent() {
        return CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when == "POST").filter(boost => boost.opponent == "OPPONENT");
    }

    //-------------------------------------------------------------
    // Used in RollDialog
    static updateEdgeBoosts(elem, available, when = "POST") {
        let newEdgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter((boost) => boost.when == when && boost.cost <= available);
        // Node for inserting new data before
        let insertBeforeElem = {};
        // Remove previous data
        var array = Array.from(elem.children);
        array.forEach((child) => {
            if (child.value != "none" && child.value != "edge_action") {
                elem.removeChild(child);
            }
            if (child.value == "edge_action") {
                insertBeforeElem = child;
            }
        });
        // Add new data
        newEdgeBoosts.forEach((boost) => {
            let opt = document.createElement("option");
            opt.setAttribute("value", boost.id);
            opt.setAttribute("data-item-boostid", boost.id);
            let cont = document.createTextNode(game.i18n.localize("shadowrun6.edge_boost." + boost.id) + " - (" + boost.cost + ")");
            opt.appendChild(cont);
            elem.insertBefore(opt, insertBeforeElem);
        });
    }
    //-------------------------------------------------------------
    // Used in RollDialog
    _updateEdgeActions(elem, available) {
        let newEdgeActions = CONFIG.SR6.EDGE_ACTIONS.filter((action) => action.cost <= available);
        // Remove previous data
        var array = Array.from(elem.children);
        array.forEach((child) => {
            if (child.value != "none") {
                elem.removeChild(child);
            }
        });
        // Add new data
        newEdgeActions.forEach((action) => {
            let opt = document.createElement("option");
            opt.setAttribute("value", action.id);
            opt.setAttribute("data-item-actionid", action.id);
            let cont = document.createTextNode(game.i18n.localize("shadowrun6.edge_action." + action.id) + " - (" + action.cost + ")");
            opt.appendChild(cont);
            elem.appendChild(opt);
        });
    }
    //-------------------------------------------------------------
    /*
     * Called when a change happens in the Edge Action or Edge Action selection.
     */
    static onEdgeBoostActionChange(event, when = "Post", chatMsg, html, data) {
        console.log("EdgeRoll._onEdgeBoostActionChange");
        if (event.currentTarget.name === "edgeBoost") {
            const boostsSelect = event.currentTarget;
            let boostId = boostsSelect.children[boostsSelect.selectedIndex].dataset.itemBoostid;
            console.log(" boostId = " + boostId);
            chatMsg.data.edgeBoost = boostId;
        }
        else if (event.currentTarget.name === "edgeAction") {
            const actionSelect = event.currentTarget;
            let actionId = actionSelect.children[actionSelect.selectedIndex].dataset.itemActionid;
            console.log(" actionId = " + actionId);
            chatMsg.data.edgeAction = actionId;
            //TODO EdgeRoll._onEdgeBoostActionChange not in use; edge_use is only used in case the actor themselves are edging, not if an opponent does
            data.edge_use = game.i18n.localize("shadowrun6.edge_action." + actionId);
        }
        // Ignore this, if there is no actor
        if (!data.actor) {
            console.log("Ignore because no actor");
            return;
        }
        if (!event || !event.currentTarget) {
            console.log("Ignore because no current target");
            return;
        }
        console.log(" target is " + event.currentTarget.name);
    }
    //-------------------------------------------------------------
    _performEdgeBoostOrAction(data, boostOrActionId) {
        console.log("ToDo: performEgdeBoostOrAction " + boostOrActionId);
        if (boostOrActionId == "edge_action") {
            return;
        }
        data.explode = false;
        data.modifier = 0;
        switch (boostOrActionId) {
            case "add_edge_pool":
                data.explode = true;
                break;
        }
        // Update content on dialog
        $("input[name='modifier']")[0].value = data.modifier;
        $("input[name='explode' ]")[0].value = data.explode;
        $("input[name='explode' ]")[0].checked = data.explode;
        //this._updateDicePool(data);
    }

    /**
     * Perform an edge boost on a roll. Checks for roll ownership and edge availability.
     * @param {String} chatMsgId The chat message containing the roll to be edged
     * @param {String} edgeBoost The key of the edge boost to be performed
     * @param {Number} dieIndex An optional die index to be affected by the edge boost (drag & drop)
     * @returns 
     */
    static async performPostEdgeBoost(chatMsgId, edgeBoost, dieIndex = null) {
        let chatMsg = game.messages.get(chatMsgId);
        console.log("SR6E | Performing edge boost with type " + edgeBoost, chatMsg);
        const speaker = chatMsg.speaker;
        let roll = chatMsg.rolls[0];

        // Get default actor (he performed this roll)
        const defaultActor = getActor(speaker.actor, speaker.scene, speaker.token) ?? game.actors.get(roll.finished.actor._id);
        // But use the selected actor or the player's actor where possible
        let actor = getSelectedActor(defaultActor); 
        // In case the selected actor is a subsidiary (without edge) of someone else, get the actual owner
        if (actor.type == "Vehicle") {
            let ownerActor = actor._getOwnerActor();
            if (!ownerActor) {
                ui.notifications.error("shadowrun6.ui.notifications.vehicle_has_no_owner", { localize: true });
                return;
            }
            actor = ownerActor;
        }
        console.log("SR6E | Actor that is trying to spend edge:", actor.name, actor.uuid);
        console.log("SR6E | Actor that performed the roll:", defaultActor.name, defaultActor.uuid);
        const spendEdgeSelf = (defaultActor.uuid === actor.uuid);
        console.log("SR6E | Actor is spending Edge on their own roll:", spendEdgeSelf);

        //TODO add later "Count 2s as glitches for the target"
        if (!actor.isOwner && edgeBoost !== 'reroll_one') {
            ui.notifications.error("shadowrun6.ui.notifications.only_owner_is_allowed_to_spend_edge", { localize: true });
            return;
        }

        let edgeBoostDefinition = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.id == edgeBoost)[0];
        if (!edgeBoostDefinition) {
            throw new Error("Unknown edge boost", edgeBoost);
        }

        const boostTitle = game.i18n.localize(`shadowrun6.edge_boost.${edgeBoost}`)
        if (edgeBoostDefinition.when != "POST") {
            const msg = game.i18n.format("shadowrun6.ui.notifications.edge_boost_is_not_post_edge", { boostTitle: boostTitle });
            ui.notifications.error(msg);
            return;
        }

        let edgeCost = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.id == edgeBoost)[0].cost;
        let edgeSpent = false;

        //TODO rework so edge costs is more safely handled
        switch (edgeBoost) {
            case "plus_1_roll":
                if (!dieIndex) {
                    // Check if there are 1's or 4's, else provide a warning
                    let rollResults = roll.finished.results;
                    for (let i = 0; i < rollResults.length; i++) {
                        if (rollResults[i].result == 1 || rollResults[i].result == 4) {
                            dieIndex = i;
                            break;
                        }
                    }
                    if (dieIndex == null) {
                        ui.notifications.error("shadowrun6.ui.notifications.no_die_with_a_1_or_4", { localize: true });
                        return;
                    }
                    //bump selected dice
                    let dice = chatMsg.rolls[0].finished.results;
                    let numberOfDice = dice.filter(die => die.selectedDie === true).length;

                    if (numberOfDice == 0) {
                        ui.notifications.error("shadowrun6.ui.notifications.reroll_failed_requires_index", { localize: true });
                        return;
                    }
                    if (!EdgeRoll.enoughEdge(actor, edgeCost * numberOfDice)){
                        return;
                    }
                    numberOfDice = 0; // Reset to count how many dice we spend edge on
                    await Promise.all(dice.map(async (die, dieIndex) => {
                        if (die.selectedDie === true) {
                            edgeSpent = await EdgeRoll.plusOneOnIndex(chatMsg, boostTitle, dieIndex);
                            if (edgeSpent) numberOfDice++;
                        }
                    }));
                    edgeCost = edgeCost * numberOfDice;

                }
                break;

            case "reroll_one":
                if (!dieIndex) {
                    let dice = chatMsg.rolls[0].finished.results;
                    let numberOfDice = dice.filter(die => die.selectedDie === true).length;
                    if (numberOfDice == 0) {
                        ui.notifications.error("shadowrun6.ui.notifications.reroll_failed_requires_index", { localize: true });
                        return;
                    }
                    if (!EdgeRoll.enoughEdge(actor, edgeCost * numberOfDice)){
                        return;
                    } else {
                        edgeCost = edgeCost * numberOfDice;
                    }
                    await Promise.all(dice.map(async (die, dieIndex) => {
                        if (die.selectedDie === true) {
                            edgeSpent = await EdgeRoll.reRoll(chatMsg, boostTitle, 1, dieIndex, spendEdgeSelf);
                            if (!edgeSpent) return;
                        }
                    }));

                } else {
                    edgeSpent = await EdgeRoll.reRoll(chatMsg, boostTitle, 1, dieIndex, spendEdgeSelf);
                }
                break;

            case "reroll_failed":
                if (!EdgeRoll.enoughEdge(actor, edgeCost)){
                    return;
                }
                edgeSpent = await EdgeRoll.reRoll(chatMsg, boostTitle, -1);
                break;

            default:
                console.error(`SR6E | Unhandled edge type ${edgeBoost}`);
                return;
        }

        if (edgeCost && edgeSpent) {
            EdgeRoll.payEdge(actor, edgeCost, edgeBoost, spendEdgeSelf);
        }
    }

    static async plusOneOnIndex(chatMsg, boostTitle, index) {
        // Change dice
        let roll = chatMsg.rolls[0];
        // const element = roll.finished.results[index];
        const element = roll.results[index];

        if (element.result == 6) {
            ui.notifications.error("shadowrun6.ui.notifications.cant_increase_die", { localize: true });
            console.error("SR6E | Can't increase roll, as it's a 6");
            return false;
        } else if ([2,3,5].indexOf(element.result) !== -1) {
            ui.notifications.error("shadowrun6.ui.notifications.cant_increase_die", { localize: true });
            console.error("SR6E | Can't increase roll, as it wouldn't result in a change of successes");
            return false;
        }

        element.result++;
        element.success = element.result > 4;
        element.count = element.success ? 1 : 0;
        EdgeRoll.markRollResultEdged([element], true, true);
        roll.evaluateResult(true);

        const msg = game.i18n.format("shadowrun6.roll.edge.edge_spent", { boostTitle: boostTitle });
        roll.data.edge_use = roll.finished.edge_use = msg;

        if (chatMsg.isOwner) {
            await chatMsg.update({
                [`rolls`]: chatMsg.rolls,
            });
        } else if (game.users.get( chatMsg.author.id ).active) {
            game.sr6.sockets.edgeUpdateDice(chatMsg.author.id, chatMsg.id, JSON.stringify(chatMsg.rolls));
        } else {
            ui.notifications.error("shadowrun6.ui.notifications.owner_not_logged_in", { localize: true });
            return false;
        }

        return true;
    } 

    static async reRoll(chatMsg, boostTitle, limit, index = null, spendEdgeSelf = true) {
        // Get dice to reroll  and calculate reroll pool
        let roll = chatMsg.rolls[0];
        let rerolled = null;

        // This Edge Boost cannot be used if a glitch or critical glitch is rolled.
        if (limit < 0 && roll.finished.glitch) {
            ui.notifications.error("shadowrun6.ui.notifications.edge_boost_cannot_be_used_glitch", { localize: true });
            return;
        }

        // When a limit is given, ensure the player has selected a dice to reroll
        if(limit >= 0 && index === null) {
            ui.notifications.error("shadowrun6.ui.notifications.reroll_failed_requires_index", { localize: true });
            return false;
        }

        if (index !== null && index >= 0) {
            rerolled = [roll.finished.results[index]];
        } else if (limit < 0) {
            // reroll all failed
            rerolled = roll.finished.results.filter(result => result.result < 5).filter(result => result.edged !== true);
        } else {
            console.error("SR6E | EdgeRoll.reRoll index/limit unknown error");
            return false;
        }

        let rerollPool = rerolled.length;
        if (rerollPool == 0) {
            ui.notifications.info("shadowrun6.ui.notifications.all_dice_are_successes", { localize: true });
            return false;
        } else {
            if (limit > 0) {
                rerollPool = Math.min(limit, rerollPool);
            }
        }

        // Mark rerolled dice as inactive + edged
        EdgeRoll.markRollResultEdged(rerolled, false, true);

        // Prepare + evaluate reroll
        const rerollFormula = SR6Roll.createFormula(rerollPool);

        let rerollData = JSON.parse(JSON.stringify(roll.data));
        if (spendEdgeSelf === true) rerollData.edge_use = boostTitle;
        if (spendEdgeSelf === false) rerollData.edge_use_opponent = boostTitle;
        rerollData.pool = rerollPool;
        rerollData.useWildDie = false;
        rerollData.explode = false;

        let reroll = new SR6Roll(rerollFormula, rerollData);
        reroll.configured = JSON.parse(JSON.stringify(roll.configured));
        if (rerollData.edge_use) reroll.configured.edge_use = rerollData.edge_use;
        if (rerollData.edge_use_opponent) reroll.configured.edge_use_opponent = rerollData.edge_use_opponent;
        reroll.configured.pool = rerollPool;
        reroll.configured.edge_message = "";
        await reroll.evaluate();

        // We modify the previous roll but as DiceSoNice reacts on roll.toMessage
        // we have to trigger DSN manually
        if (game.dice3d) {
            game.dice3d.showForRoll(reroll, game.user, true);
        }

        EdgeRoll.markRollResultEdged(reroll.results, true, true);

        // Merge results of original and reroll
        roll.mergeRolls(reroll);
        roll.finished.edge_use = reroll.finished.edge_use;
        roll.finished.edge_use_opponent = reroll.finished.edge_use_opponent;

        // Update chat message
        const msg = game.i18n.format("shadowrun6.roll.edge.edge_spent", { boostTitle: boostTitle });
        // Reset threshold to configured because attacks set threshold to successes + 1
        // resulting in a "Failed" marking of the post edged roll.
        roll.finished.threshold = roll.configured.threshold;
        if (spendEdgeSelf === true) roll.data.edge_use = roll.finished.edge_use = msg;
        if (spendEdgeSelf === false) roll.data.edge_use_opponent = roll.finished.edge_use_opponent = game.i18n.localize("shadowrun6.roll.edge.opponent")+' '+msg;
        
        if (chatMsg.isOwner) {
            await chatMsg.update({
                [`rolls`]: chatMsg.rolls,
            });
        } else if (game.users.get( chatMsg.author.id ).active) {
            game.sr6.sockets.edgeUpdateDice(chatMsg.author.id, chatMsg.id, JSON.stringify(chatMsg.rolls));
        } else {
            ui.notifications.error("shadowrun6.ui.notifications.owner_not_logged_in", { localize: true });
            return false;
        }

        return true;
    }

    static markRollResultEdged(rollResult, active, edged) {
        rollResult.forEach((die) => {
            die.active = active;
            die.edged = edged;
            die.selectedDie = false;
        });
    }

    static enoughEdge(actor, edgeCost) {
        console.log(`SR6E | enoughEdge | Actor's Edge ${actor?.system.edge.value} vs Edge Boost cost ${edgeCost}`);
        if (actor?.system.edge.value < edgeCost) {
            const msg = game.i18n.format("shadowrun6.ui.notifications.you_require_more_edge", { edge: edgeCost - actor.system.edge.value });
            ui.notifications.error(msg);
            return false;
        } else {
            return true;
        }
    }

    static async payEdge(actor, edgeCost, edgeBoost, spendEdgeSelf) {
        if (edgeCost > 0) {
            let msg = '';
            if (actor) {
                msg = game.i18n.format("shadowrun6.ui.notifications.character_has_spent_edge", { actor: actor.name, edge: edgeCost, edgeBoost: game.i18n.localize("shadowrun6.edge_boost." + edgeBoost) });
                await actor.update({
                    system: {
                        edge: { value: actor.system.edge.value - edgeCost }
                    } 
                });
                if (spendEdgeSelf === false) {
                    await ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor: actor }),
                        flavor: game.i18n.localize("shadowrun6.roll.edge.opponent_edge_boost"),
                        content: `<span style="font-style: italic;">${msg}</span>`
                    });
                }
            } else {
                msg = game.i18n.format("shadowrun6.ui.notifications.reduce_edge_from_actor", { edge: edgeCost });
            }
            ui.notifications.info(msg);
        }
    }
}
