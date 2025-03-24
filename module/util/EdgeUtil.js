import { RollType } from "../dice/RollTypes.js";
import SR6Roll from "../SR6Roll.js";
import { getActor } from "./helper.js";

export default class EdgeUtil {
    static get postEdgeBoosts() {
        return CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when == "POST");
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
     * Called when a change happens in the Edge Action or Edge Action
     * selection.
     */
    static onEdgeBoostActionChange(event, when = "Post", chatMsg, html, data) {
        console.log("_onEdgeBoostActionChange");
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
    static async peformPostEdgeBoost(chatMsgId, edgeBoost, dieIndex = null) {
        let chatMsg = game.messages.get(chatMsgId);
        console.log("SR6E | Performing edge boost with type " + edgeBoost, chatMsg);

        let roll = chatMsg.rolls[0];
        const speaker = chatMsg.speaker;

        let actor = getActor(speaker.actor, speaker.scene, speaker.token);

        if (!actor) {
            actor = game.actors.get(roll.finished.actor._id);
        }

        if (actor.type == "Vehicle") {
            let ownerActor = actor._getOwnerActor();
            if (!ownerActor) {
                ui.notifications.error("shadowrun6.ui.notifications.vehicle_has_no_owner", { localize: true });
                return;
            }

            actor = ownerActor;
        }

        if (!actor.isOwner) {
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

        const edgeCost = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.id == edgeBoost)[0].cost;
        if (actor?.system.edge.value < edgeCost) {
            const msg = game.i18n.format("shadowrun6.ui.notifications.you_require_more_edge", { edge: edgeCost - actor.system.edge.value });
            ui.notifications.error(msg);
            return;
        }

        let edgeSpent = false;

        switch (edgeBoost) {
            case "plus_1_roll":
                let index = dieIndex;
                if (!index) {
                    // Turn a 4 into a 5 by default
                    let rollResults = roll.finished.results;
                    for (let i = 0; i < rollResults.length; i++) {
                        const element = rollResults[i];
                        if (element.result == 4) {
                            index = i;
                            break;
                        }
                    }

                    if (index == null) {
                        ui.notifications.error("shadowrun6.ui.notifications.no_die_with_a_4", { localize: true });
                        return;
                    }
                }

                edgeSpent = EdgeUtil.plusOneOnIndex(chatMsg, boostTitle, index);
                break;

            case "reroll_one":
                edgeSpent = await EdgeUtil.reRoll(chatMsg, boostTitle, 1, dieIndex);
                break;

            case "reroll_failed":
                edgeSpent = await EdgeUtil.reRoll(chatMsg, boostTitle, -1);
                break;

            default:
                console.error(`SR6E | Unhandled edge type ${edgeBoost}`);
                return;
        }

        if (edgeCost && edgeSpent)
            EdgeUtil.payEdge(edgeCost, actor);
    }

    static plusOneOnIndex(chatMsg, boostTitle, index) {
        // Change dice
        let roll = chatMsg.rolls[0];

        const element = roll.finished.results[index];

        if (element.result == 6) {
            ui.notifications.error("shadowrun6.ui.notifications.cant_increase_die", { localize: true });
            console.error("SR6E | Can't increase roll!");
            return false;
        }

        element.result++;
        element.success = element.result > 4;
        element.count = element.success ? 1 : 0;
        EdgeUtil.markRollResultEdged([element], true, true);
        roll.evaluateResult(true);

        roll.finished.edge_use = boostTitle;
        roll.data.edge_use = boostTitle;

        chatMsg.update({
            [`rolls`]: chatMsg.rolls,
        });

        return true;
    } 

    static async reRoll(chatMsg, boostTitle, limit, index = null) {
        // Get dice to reroll  and calculate reroll pool
        let roll = chatMsg.rolls[0];
        let rerolled = null;

        // When a limit is given, ensure the player has selected a dice to reroll
        if(limit >= 0 && !index) {
            ui.notifications.error("shadowrun6.ui.notifications.reroll_failed_requires_index", { localize: true });
            return false;
        }

        if (index) {
            rerolled = [roll.finished.results[index]];
        } else {
            rerolled = roll.finished.results.filter(result => result.result < 5);
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
        EdgeUtil.markRollResultEdged(rerolled, true, true);

        // Prepare + evaluate reroll
        const rerollFormula = SR6Roll.createFormula(rerollPool);

        let rerollData = JSON.parse(JSON.stringify(roll.data));
        rerollData.edge_use = boostTitle;
        rerollData.pool = rerollPool;
        rerollData.useWildDie = false;
        rerollData.explode = false;

        let reroll = new SR6Roll(rerollFormula, rerollData);
        reroll.configured = JSON.parse(JSON.stringify(roll.configured));
        reroll.configured.edge_use = rerollData.edge_use;
        reroll.configured.pool = rerollPool;
        reroll.configured.edge_message = "";
        await reroll.evaluate();

        // We modify the previous roll but as DiceSoNice reacts on roll.toMessage
        // we have to trigger DSN manually
        if (game.dice3d) {
            game.dice3d.showForRoll(reroll, game.user, true);
        }

        EdgeUtil.markRollResultEdged(reroll.results, true, true);

        // Merge results of original and reroll
        roll.mergeRolls(reroll);

        // Update chat message
        const msg = game.i18n.format("shadowrun6.roll.edge.edge_spent", { boostTitle: boostTitle });
        // Reset threshold to configured because attacks set threshold to successes + 1
        // resulting in a "Failed" marking of the post edged roll.
        roll.finished.threshold = roll.configured.threshold;
        roll.finished.edge_use = msg;
        roll.data.edge_use = roll.finished.edge_use;

        chatMsg.update({
            [`rolls`]: chatMsg.rolls,
        });

        return true;
    }

    static markRollResultEdged(rollResult, active, edged) {
        rollResult.forEach((element) => {
            element.active = active;
            element.edged = edged;
        });
    }

    static payEdge(edgeCost, actor) {
        if (edgeCost > 0) {
            if (actor) {
                actor.update({ system: { edge: { value: actor.system.edge.value - edgeCost } } });
                const msg = game.i18n.format("shadowrun6.ui.notifications.character_has_spent_edge", { actor: actor.name, edge: edgeCost });
                ui.notifications.info(msg);
            } else {
                const msg = game.i18n.format("shadowrun6.ui.notifications.reduce_edge_from_actor", { edge: edgeCost });
                ui.notifications.info(msg);
            }
        }
    }
}
