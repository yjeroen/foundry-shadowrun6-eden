import SR6Roll from "../SR6Roll.js";
function getSystemData(obj) {
    if (game.release.generation >= 10)
        return obj.system;
    return obj.data.data;
}
export default class EdgeUtil {
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
    
    //-------------------------------------------------------------
    static peformPostEdgeBoost(chatMsgId, edgeBoost) {
        let chatMsg = game.messages.get(chatMsgId);
        console.log("Performing edge boost with type " + edgeBoost, chatMsg);

        let roll = chatMsg.rolls[0];

        let actor = game.actors.get(roll.finished.actor._id);
        let isOwner = EdgeUtil.isRollOwner(roll);
        
        if(!isOwner) {
            ui.notifications.error("Nur der Besitzer des Charakters darf diese Aktion durchführen.");
            return;
        }

        let edgeBoostDefinition = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.id == edgeBoost)[0];
        if(!edgeBoostDefinition) {
            throw new Error("Unknown edge boost", edgeBoost);
        }

        const boostTitle = game.i18n.localize(`shadowrun6.edge_boost.${edgeBoost}`)
        if(edgeBoostDefinition.when != "POST") {
            ui.notifications.error(`"${boostTitle}" ist keine Handlung, die nach einem Wurf durchgeführt werden kann.`)
            return;
        }

        const edgeCost = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.id == edgeBoost)[0].cost;
        if(actor?.system.edge.value < edgeCost) {
            ui.notifications.error(`Du benötigst noch ${edgeCost - actor.system.edge.value} Edge für diese Handlung.`);
            return;
        }

        switch (edgeBoost) {
            case "plus_1_roll":
                // Increase 4 to 5
                let index = -1;
                let rollResults = roll.finished.results;
                for (let i = 0; i < rollResults.length; i++) {
                    const element = rollResults[i];
                    if(element.result == 4) {
                        index = i;
                        EdgeUtil.plusOneOnIndex(boostTitle, index, chatMsg, edgeCost, actor);
                        break;
                    }
                }

                if(index < 0) {
                    ui.notifications.error(`Dein Wurf enthält keine 4.`);
                    return; 
                }    

                break;

            case "reroll_one":
                // Reroll one dice
                EdgeUtil.reRoll(roll, boostTitle, 1, chatMsg, edgeCost, actor);
                break;
            
            case "reroll_failed":
                // Reroll all dice < 5
                // Todo: 
                //  * Calculate a sum of all rolls?
                EdgeUtil.reRoll(roll, boostTitle, -1, chatMsg, edgeCost, actor);
                
                break;

            default:
                console.error(`Unhandled edge type ${edgeBoost}`);
                ui.notifications.error(`Unhandled edge type ${edgeBoost}`);
                return;
        }        
    }

    static isRollOwner(roll) {
        if(roll.finished.actor) {
            let actor = game.actors.get(roll.finished.actor._id);
            return actor.isOwner;
        } else {
            return chatMsg.user.id == game.user.id;
        }
    }

    static plusOneOnIndex(boostTitle, index, chatMsg, edgeCost = undefined, actor = undefined) {
        // Change dice
        let roll = chatMsg.rolls[0];
        if(!EdgeUtil.isRollOwner(roll)) {
            ui.notifications.error("Nur der Besitzer des Charakters darf diese Aktion durchführen.");
            return;
        }

        const element = roll.finished.results[index];

        if(element.result == 6) {
            ui.notifications.error("Wurf kann nicht weiter erhöht werden!");
            console.error("Wurf kann nicht weiter erhöht werden!");
            return;
        }

        element.result++;
        element.classes = `die die_${element.result}`;
        element.success = element.result > 4;

        // Increase _total when we switched from 4 to 5
        if(element.result == 5) {
            roll._total++;
        }

        roll.finished.edge_use = boostTitle;
        roll.data.edge_use = boostTitle;

        chatMsg.update({
            [`rolls`]: chatMsg.rolls,
        });

        if(edgeCost)
            EdgeUtil.payEdge(edgeCost, actor);
    }

    static reRoll(roll, boostTitle, limit, chatMsg = undefined, edgeCost = undefined, actor = undefined) {
        let rerollPool = roll.finished.results.filter(result => result.result < 5).length;
        if(rerollPool == 0) {
            ui.notifications.info("Es zeigen bereits alle Würfel Erfolge.");
            return;
        } else {
            if(limit > 0) {
                rerollPool = Math.min(limit, rerollPool);
            }
        }

        const rerollFormula = SR6Roll.createFormula(rerollPool);

        let rerollData = roll.data;
        rerollData.edge_use = boostTitle;
        rerollData.pool = rerollPool;
        
        let reroll = new SR6Roll(rerollFormula, rerollData);
        reroll.configured = roll.configured;
        reroll.configured.edge_use = rerollData.edge_use;
        reroll.configured.pool = rerollPool;
        reroll.configured.edge_message = "";
        reroll.evaluate();                
        reroll._total += roll.total;
        reroll.toMessage({ speaker: { alias: reroll.configured.actor.name }});

        if(chatMsg) {
            roll.finished.edge_use = "Edge eingesetzt: " + boostTitle;
            roll.data.edge_use = roll.finished.edge_use;

            chatMsg.update({
                [`rolls`]: chatMsg.rolls,
            });
        }

        if(edgeCost)
            EdgeUtil.payEdge(edgeCost, actor);
    }

    static payEdge(edgeCost, actor) {
        if(edgeCost > 0) {
            if(actor) {
                actor.update({ system: { edge: { value: actor.system.edge.value - edgeCost }}});
                ui.notifications.info(`${actor.name} wurden ${edgeCost} Edge abgezogen.`);
            } else {
                ui.notifications.info(`Bitte ziehe ${edgeCost} Edge vom Charakter ab.`);
            }
        }
    }
}
