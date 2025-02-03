import SR6Roll from "../SR6Roll.js";
function getSystemData(obj) {
    if (game.release.generation >= 10)
        return obj.system;
    return obj.data.data;
}
export default class EdgeUtil {
    //-------------------------------------------------------------
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
        console.log("SR6E | _onEdgeBoostActionChange");
        if (event.currentTarget.name === "edgeBoost") {
            const boostsSelect = event.currentTarget;
            let boostId = boostsSelect.children[boostsSelect.selectedIndex].dataset.itemBoostid;
            console.log("SR6E |  boostId = " + boostId);
            chatMsg.system.edgeBoost = boostId;
        }
        else if (event.currentTarget.name === "edgeAction") {
            const actionSelect = event.currentTarget;
            let actionId = actionSelect.children[actionSelect.selectedIndex].dataset.itemActionid;
            console.log("SR6E |  actionId = " + actionId);
            chatMsg.system.edgeAction = actionId;
            data.edge_use = game.i18n.localize("shadowrun6.edge_action." + actionId);
        }
        // Ignore this, if there is no actor
        if (!data.actor) {
            console.log("SR6E | Ignore because no actor");
            return;
        }
        if (!event || !event.currentTarget) {
            console.log("SR6E | Ignore because no current target");
            return;
        }
        console.log("SR6E |  target is " + event.currentTarget.name);
        /*		if (event.currentTarget.name === "edgeBoost") {
            const boostsSelect = event.currentTarget;
            let boostId = boostsSelect.children[boostsSelect.selectedIndex].dataset.itemBoostid;
            console.log("SR6E |  boostId = "+boostId);
            data.edgeBoost = boostId;
           if (boostId==="edge_action") {
                this._updateEdgeActions(this._element[0].getElementsByClassName("edgeActions")[0] , this.data.edge);
            } else {
                this._updateEdgeActions(this._element[0].getElementsByClassName("edgeActions")[0] , 0);
            }
            if (boostId!="none") {
                data.edge_use = (game as Game).i18n.localize("shadowrun6.edge_boost."+boostId)
            } else {
                data.edge_use="";
            }
            this._performEdgeBoostOrAction(data, boostId);
        } else if (event.currentTarget.name === "edgeAction") {
            const actionSelect = event.currentTarget;
            let actionId = actionSelect.children[actionSelect.selectedIndex].dataset.itemActionid;
            console.log("SR6E |  actionId = "+actionId);
            data.edgeAction = actionId;
            data.edge_use = game.i18n.localize("shadowrun6.edge_action."+actionId)
            this._performEdgeBoostOrAction(data, actionId);
        }
*/
    }
    //-------------------------------------------------------------
    _performEdgeBoostOrAction(data, boostOrActionId) {
        console.log("SR6E | ToDo: performEgdeBoostOrAction " + boostOrActionId);
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
    async _payEdge(cost, user, actor) {
        console.log("SR6E | ENTER: _payEdge(" + cost + "," + user + "," + actor + ")");
        let system = getSystemData(actor);
        system.edge.value -= cost;
        if (system.edge.value < 0) {
            system.edge.value = 0;
        }
        await actor.update({ [`edge.value`]: system.edge.value });
        /*		let er = new Roll(cost+"dc", {}, {
            blind: true,
            flavor: "Edge"
        });
        */
        let er = new Roll(cost + "dc", {}, {});
        await er.evaluate();
        if (game.dice3d) {
            game.dice3d.showForRoll(er);
        }
        //		let edgeChat = await er.toMessage();
        //		console.log("SR6E | edgeChat = ",edgeChat);
        //		edgeChat.delete();
    }
    //-------------------------------------------------------------
    _getFailedIndices(results, max) {
        let indices = [];
        for (let i = 0; i < results.length; i++) {
            if (results[i].count == 0 && indices.length < max) {
                indices.push(i);
            }
        }
        return indices;
    }
    //-------------------------------------------------------------
    _getPlusOneIndex(results) {
        let indices = [];
        for (let i = 0; i < results.length; i++) {
            if (results[i].count == 0 && results[i].result === 4) {
                return i;
            }
        }
        return -1;
    }
    //-------------------------------------------------------------
    async _rerollIndices(chatMsg, roll, indices, html) {
        console.log("SR6E | _rerollIndices ", indices);
        let rollData = {};
        rollData.pool = indices.length;
        rollData.formula = rollData.pool + "d6";
        rollData.modifier = 0;
        rollData.buttonType = 0;
        rollData.edge_use = "reroll";
        rollData.actionText = "Reroll";
        let r = new SR6Roll("", rollData);
        let diceHtml = html.find(".dice-rolls");
        try {
            await r.evaluate();
            r.toMessage(rollData);
            let newTotal = roll._total + r.total;
            roll._total = newTotal;
            // Change previous results
            for (var i = 0; i < indices.length; i++) {
                let index = indices[i];
                roll.data.results[index] = r.results[i];
            }
            // Try to update html
            diceHtml.children().each(function (i, obj) {
                $(obj).attr("class", roll.data.results[i].classes);
            });
            html.find(".spend_edge").append('<h4 class="highlight" style="margin:0px">Rerolled</h4>');
            html.find(".resulttext").empty();
            html
                .find(".resulttext")
                .append(game.i18n.localize("shadowrun6.roll.success") +
                ": <b>" +
                newTotal +
                "</b> " +
                game.i18n.localize("shadowrun6.roll.successes"));
            // Update message
            roll.results = roll.data.results;
            await chatMsg.update({
                [`roll`]: roll.toJSON(),
                ["content"]: html[0].innerHTML
            });
        }
        catch (err) {
            console.error("SR6E | sr6_roll error: " + err);
            console.error("SR6E | sr6_roll error: " + err.stack);
            ui.notifications.error(game.i18n.localize("shadowrun6.ui.notifications.Dice_roll_evaluation_failed")+`: ${err.message}`);
        }
    }
    //-------------------------------------------------------------
    async _performPlusOne(chatMsg, roll, index, html) {
        console.log("SR6E | _performPlus1 ");
        let newResult = roll.data.results[index].result + 1;
        let newTotal = roll._total;
        // Change previous results
        roll.data.results[index].result = newResult;
        roll.data.results[index].classes = "die die_" + newResult;
        if (roll.data.results[index].result >= 5) {
            roll.data.results[index].success = true;
            newTotal++;
        }
        let diceHtml = html.find(".dice-rolls");
        try {
            roll._total = newTotal;
            // Try to update html
            diceHtml.children().each(function (i, obj) {
                $(obj).attr("class", roll.data.results[i].classes);
            });
            html.find(".spend_edge").append('<h4 class="highlight" style="margin:0px">+1 to one die</h4>');
            html.find(".resulttext").empty();
            html
                .find(".resulttext")
                .append(game.i18n.localize("shadowrun6.roll.success") +
                ": <b>" +
                newTotal +
                "</b> " +
                game.i18n.localize("shadowrun6.roll.successes"));
            // Update message
            roll.results = roll.data.results;
            await chatMsg.update({
                [`roll`]: roll.toJSON(),
                ["content"]: html[0].innerHTML
            });
        }
        catch (err) {
            console.error("SR6E | sr6_roll error: " + err);
            console.error("SR6E | sr6_roll error: " + err.stack);
            ui.notifications.error(game.i18n.localize("shadowrun6.ui.notifications.Dice_roll_evaluation_failed")+`: ${err.message}`);
        }
    }
    //-------------------------------------------------------------
    static peformPostEdgeBoost(chatMsg, html, data, btnPerform, edgeBoosts, edgeActions) {
        console.log("SR6E | ToDo performPostEdgeBoost");
        console.log("SR6E | chatMsg = ", chatMsg);
        console.log("SR6E |    data = ", data);
        console.log("SR6E |    html = ", html);
        /*
        console.log("SR6E | results = ",chatMsg._roll.data.results);
        let results = chatMsg._roll.data.results;

        let user  = (game as Game).users!.get(data.message.user);
        let actor = (game as Game).actors!.get(chatMsg._roll.data.actor._id);
        let diceHtml = html.find(".message-content");

        let boostOrActionId = chatMsg.data.edgeBoost;
        if (boostOrActionId==='edge_action') {
            boostOrActionId = chatMsg.data.edgeAction;
        }
        console.log("SR6E | to perform: "+boostOrActionId);

        // Remove "Spending Edge"
        html.find(".spend_edge").empty();


        switch (boostOrActionId) {
        case "reroll_one":
            console.debug("Reroll one die");
            chatMsg._roll._payEdge(1, user, actor);
            chatMsg._roll._rerollIndices(chatMsg, chatMsg._roll, chatMsg._roll._getFailedIndices(results,1), diceHtml);
            break;
        case "plus_1_roll":
            console.debug("+1 to single roll");
            chatMsg._roll._payEdge(2, user, actor);
            // ToDo: Find a 4 or at least a 1
            chatMsg._roll._performPlusOne(chatMsg, chatMsg._roll, chatMsg._roll._getPlusOneIndex(results), diceHtml);
            break;
        case "reroll_failed":
            console.debug("Reroll all failed");
            chatMsg._roll._payEdge(4, user, actor);
            chatMsg._roll._rerollIndices(chatMsg, chatMsg._roll, chatMsg._roll._getFailedIndices(results,Number.MAX_VALUE), diceHtml);
            break;
        default:
            console.log("SR6E | ToDo: Support edge action "+boostOrActionId);
        }
    */
        /*
        let rollData = {};
        rollData.pool = 2;
        rollData.formula = rollData.pool + "d6";
        rollData.modifier= 0;
        rollData.buttonType=0;
        rollData.edge_use=false;
        let r = new SR6Roll("", rollData);
        try {
        console.log("SR6E | Call r.evaluate: "+r);
        r.evaluate();
            console.log("SR6E |  toMessage  data = ",data);
            console.log("SR6E |  toMessage  r    = ",r);
            console.log("SR6E |  Reroll = ",r.results);
            r.toMessage(rollData);

            let chatOptions = foundry.utils.mergeObject( {
                from: "peformPostEdgeBoost.chatOptionsMerged",
                user: game.user.id,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                sound: CONFIG.sounds.dice,
                roll: r
            },
                data
            );
            //chatOptions.content = r.render(chatOptions);
            //ChatMessage.create(chatOptions);
        } catch (err) {
        console.error("SR6E | sr6_roll error: "+err);
        console.error("SR6E | sr6_roll error: "+err.stack);
            ui.notifications.error(game.i18n.localize("shadowrun6.ui.notifications.Dice_roll_evaluation_failed")+`: ${err.message}`);
        }
        */
    }
}