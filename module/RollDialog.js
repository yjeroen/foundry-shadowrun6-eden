import { SYSTEM_NAME } from "./constants.js";
import { SR6ChatMessageData, RollType } from "./dice/RollTypes.js";
import { MonitorType } from "./config.js";
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
function isItemRoll(obj) {
    return obj.rollType != undefined;
}
function isSkillRoll(obj) {
    return obj.skillId != undefined;
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
 * Special Shadowrun 6 instance of the RollDialog
 */
export class RollDialog extends Dialog {
    html;
    actor;
    prepared;
    /** This field is used to return all settings made in the roll dialog */
    dialogResult;
    /** Edge after applying gain and boost cost */
    edge = 0;
    edgeSpending = 0;
    /** Dice added or substracted to the pool */
    modifier = 0;
    constructor(data, options) {
        console.log("SR6E | RollDialog<init>()", options);
        super(data, options);
        let rOptions = options;
        this.actor = rOptions.actor;
        this.prepared = rOptions.prepared;
        this.dialogResult = rOptions.dialogResult;
        this.edge = this.actor ? getSystemData(this.actor).edge.value : 0;
    }
    /********************************************
     * React to changes on the dialog
     ********************************************/
    activateListeners(html) {
        super.activateListeners(html);
        this.html = html;
        // React to attack/defense rating changes
        //    	html.find('.calc-edge').show(this._onCalcEdge.bind(this));
        html.find("select[name='distance']").change(this._recalculateBaseAR.bind(this));
        html.find("select[name='fireMode']").change(this._onFiringModeChange.bind(this));
        html.find("select[name='bfType']").change(this._onBurstModeChange.bind(this));
        html.find("select[name='fullAutoArea']").change(this._onAreaChange.bind(this));
        html.find("select[name='ammoLoaded']").change(this._onAmmoChange.bind(this));
        /*
        if (!this.data.target) {
        html.find('.calc-edge').show(this._onNoTarget.bind(this));
        }
        */
        html.find(".calc-edge-edit").change(this._onCalcEdge.bind(this));
        html.find(".calc-edge-edit").keyup(this._onCalcEdge.bind(this));
        html.show(this._onCalcEdge.bind(this));
        // React to changed edge boosts and actions
        html.find(".edgeBoosts").change(this._onEdgeBoostActionChange.bind(this));
        html.find(".edgeBoosts").keyup(this._onEdgeBoostActionChange.bind(this));
        html.find(".edgeActions").change(this._onEdgeBoostActionChange.bind(this));
        html.find(".edgeActions").keyup(this._onEdgeBoostActionChange.bind(this));
        html.show(this._onFiringModeChange.bind(this));
        // React to changed amp up
        html.find("#ampUp").change(this._onSpellConfigChange.bind(this));
        // React to changed amp up
        html.find("#incArea").change(this._onSpellConfigChange.bind(this));
        this._recalculateBaseAR();
        // React to attribute change
        html.find(".rollAttributeSelector").change(this._onAttribChange.bind(this));
        // React to Modifier checkboxes
        html.find("#useWoundModifier").change(this._updateDicePool.bind(this));
        html.find("#useSustainedSpellModifier").change(this._updateDicePool.bind(this));
        html.find("#useGruntGroup").change(this._useGruntGroup.bind(this));
        // React to change in modifier
        html.find("#modifier").change(this._updateDicePool.bind(this));
        // Show Threshold and Interval fields when extended tests is enabled.
        html.find(".extended-test").change(this._onExtendedTestCheckbox.bind(this));
    }
    //-------------------------------------------------------------
    _recalculateBaseAR() {
        let prepared = this.options ? this.options.prepared : this.prepared;
        const distanceElement = document.getElementById("distance");
        if ( game.settings.get(SYSTEM_NAME, "cantDodgeBullets") && distanceElement) {
            const optionSelected = distanceElement.options[distanceElement.selectedIndex];
            this.dialogResult.threshold = this.prepared.cantDodgeBulletsBaseThreshold + parseInt(optionSelected.dataset.distance);
            prepared.threshold = this.dialogResult.threshold;
            document.getElementById("threshold").value = this.dialogResult.threshold;
        }
        if (!distanceElement)
            return;
        let ar = parseInt(distanceElement.value);
        const arElement = document.getElementById("baseAR");
        arElement.textContent = ar.toString();
        prepared.baseAR = ar;
        this._onCalcEdge(event);
    }
    //-------------------------------------------------------------
    /*
     * Called when something edge gain relevant changes on the
     * HTML form
     */
    _onCalcEdge(event) {
        console.log("SR6E | RollDialog._onCalcEdge");
        let configured = this.dialogResult;
        let prepared = this.prepared;
        if (!configured.actor)
            return;
        try {
            configured.edgePlayer = 0;
            configured.edgeTarget = 0;
            // Check situational edge
            const situationA = document.getElementById("situationalEdgeA");
            if (situationA && situationA.checked) {
                configured.edgePlayer++;
            }
            const situationD = document.getElementById("situationalEdgeD");
            if (situationD && situationD.checked) {
                configured.edgeTarget++;
            }
            const drElement = document.getElementById("dr");
            if ( drElement && !isNaN(parseInt(drElement.value)) ) {
                const dr = drElement.value ? parseInt(drElement.value) : 0;
                const arModElem = document.getElementById("arMod");
                if (isItemRoll(prepared)) {
                    const arElement = document.getElementById("baseAR");
                    let ar = arElement.textContent ? parseInt(arElement.textContent) : 0;
                    //					let ar = parseInt( (arElement.children[arElement.selectedIndex] as HTMLOptionElement).value );
                    if (arModElem.value && parseInt(arModElem.value) != 0) {
                        ar += parseInt(arModElem.value);
                    }
                    let finalAR = ar;
                    let result = ar - dr;
                    if (result >= 4) {
                        configured.edgePlayer++;
                    }
                    else if (result <= -4) {
                        configured.edgeTarget++;
                    }
                }
                else {
                    let ar = prepared.calcAttackRating[0];
                    if (arModElem.value && parseInt(arModElem.value) != 0) {
                        ar += parseInt(arModElem.value);
                    }
                    let result = ar - dr;
                    if (result >= 4) {
                        configured.edgePlayer++;
                    }
                    else if (result <= -4) {
                        configured.edgeTarget++;
                    }
                }
            }
            // Set new edge value
            let actor = getSystemData(configured.actor);
            let capped = false;
            // Limit the maximum edge
            let max = game.settings.get(SYSTEM_NAME, "maxEdgePerRound");
            let combat = game.combat;
            if (combat) {
                max = combat.getMaxEdgeGain(configured.actor);
            }
            // Check if the gained edge would be more than the player may get per round
            if (configured.edgePlayer > max) {
                console.log("SR6E | Reduce edge gain of attacker to " + max);
                configured.edgePlayer = Math.min(configured.edgePlayer, max);
                capped = true;
            }
            // Check if new Edge value would be >7
            if (actor.edge.value + configured.edgePlayer > 7) {
                configured.edgePlayer = Math.max(0, 7 - actor.edge.value);
                capped = true;
            }
            this.edge = Math.min(7, actor.edge.value + configured.edgePlayer);
            // Update in dialog
            let edgeValue = this._element[0].getElementsByClassName("edge-value")[0];
            if (edgeValue) {
                edgeValue.innerText = this.edge.toString();
            }
            // Update selection of edge boosts
            this._updateEdgeBoosts(this._element[0].getElementsByClassName("edgeBoosts")[0], this.edge);
            let newEdgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter((boost) => boost.when == "PRE" && boost.cost <= this.edge);
            // Prepare text for player
            let innerText = "";
            let speaker = configured.speaker;
            if (configured.edgePlayer) {
                if (capped) {
                    configured.edgePlayer = max;
                    innerText = game.i18n.format("shadowrun6.roll.edge.gain_player_capped", {
                        name: speaker.alias,
                        value: configured.edgePlayer,
                        capped: max
                    });
                }
                else {
                    innerText = game.i18n.format("shadowrun6.roll.edge.gain_player", { name: speaker.alias, value: configured.edgePlayer });
                }
            }
            if (configured.edgeTarget != 0) {
                //configured.targets
                //TODO automatic target - name recognition & edge increase
                let targetName = game.i18n.localize("shadowrun6.roll.edge.add_manually_to_target"); //this.targetName ? this.targetName : (game as Game).i18n.localize("shadowrun6.roll.target");
                if(innerText != "") {
                    innerText += "\r\n";
                }
                innerText += game.i18n.format("shadowrun6.roll.edge.gain_player", { name: targetName, value: configured.edgeTarget });
            }
            if (configured.edgePlayer == 0 && configured.edgeTarget == 0) {
                innerText += "  " + game.i18n.localize("shadowrun6.roll.edge.no_gain");
            }
            configured.edge_message = innerText;
            let edgeLabel = document.getElementById("edgeLabel");
            if (edgeLabel) {
                edgeLabel.innerText = innerText;
            }
        }
        catch (err) {
            console.log("SR6E | Exception: " + err.message , err);
        }
    }
    //-------------------------------------------------------------
    _updateEdgeBoosts(elem, available) {
        console.log("SR6E | RollDialog._updateEdgeBoosts");
        let newEdgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter((boost) => boost.when == "PRE" && boost.cost <= available);
        // Node for inserting new data before
        let insertBeforeElem;
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
        console.log("SR6E | RollDialog._updateEdgeActions");
        let newEdgeActions = CONFIG.SR6.EDGE_ACTIONS.filter((action) => action.cost <= available);
        // Remove previous data
        var array = Array.from(elem.children);
        array.forEach((child) => {
            if (child.value != "none") {
                elem.removeChild(child)
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

    /**
     * Called when the Extended Test checkbox is clicked
     * @param {event} event 
     */
    _onExtendedTestCheckbox(event) {
        console.log("SR6E | _onExtendedTestCheckbox");
        const checked = event.target.checked;
        const elements = this.html.find('.needed-for-extended');
        const threshold = this.html.find('#threshold');

        elements.each(function() {
            if ( checked ) {
                this.classList.remove('hidden')
                if ( this.classList.contains('threshold') && threshold.val()==false ) {
                    threshold.val(0);
                }
            } else {
                // checking ==false instead of ===, so it also hides when value is 0
                if ( this.classList.contains('threshold') && threshold.val()==false ) {
                    this.classList.add('hidden')
                } else if ( !this.classList.contains('threshold') ) {
                    this.classList.add('hidden')
                }
            }
        });

        
    }

    //-------------------------------------------------------------
    /*
     * Called when a change happens in the Edge Action or Edge Action
     * selection.
     */
    _onEdgeBoostActionChange(event) {
        console.log("SR6E | _onEdgeBoostActionChange");
        console.log("SR6E | _onEdgeBoostActionChange  this=", this);
        console.log("SR6E | _onEdgeBoostActionChange  event=", event);
        let actor = this.options.actor;
        let prepared = this.options.prepared;
        let configured = this.dialogResult;
        // Ignore this, if there is no actor
        if (!actor) {
            return;
        }
        if (!event || !event.currentTarget) {
            return;
        }
        if (event.currentTarget.name === "edgeBoost") {
            const boostsSelect = event.currentTarget;
            // let boostId = boostsSelect.children[boostsSelect.selectedIndex].dataset.itemBoostid;
            let boostId = boostsSelect.value;
            console.log("SR6E |  boostId = " + boostId);
            configured.edgeBoost = boostId;
            if (boostId === "edge_action") {
                this._updateEdgeActions(this._element[0].getElementsByClassName("edgeActions")[0], this.edge);
            }
            else {
                this._updateEdgeActions(this._element[0].getElementsByClassName("edgeActions")[0], 0);
            }
            if (boostId != "none") {
                configured.edge_use = game.i18n.format("shadowrun6.roll.edge.edge_spent", { boostTitle: game.i18n.localize("shadowrun6.edge_boost." + boostId) });
            }
            else {
                configured.edge_use = "";
            }
            this._performEdgeBoostOrAction(configured, boostId);
        }
        else if (event.currentTarget.name === "edgeAction") {
            const actionSelect = event.currentTarget;
            let actionId = actionSelect.children[actionSelect.selectedIndex].dataset.itemActionid;
            console.log("SR6E |  actionId = " + actionId);
            configured.edgeAction = actionId;
            configured.edge_use = game.i18n.format("shadowrun6.roll.edge.edge_action_spent", { actionTitle: game.i18n.localize("shadowrun6.edge_action." + actionId) });
            this._performEdgeBoostOrAction(configured, actionId);
        }
    }
    //-------------------------------------------------------------
    _useGruntGroup(event) {
        const gruntGroup = this.actor.gruntGroup;
        const useGruntGroup = (gruntGroup.id && document.getElementById("useGruntGroup")?.checked)
        this._updateDicePool(event);

        // Recalculate firing modes
        const fireModeElement = document.getElementById("fireMode");
        if (!fireModeElement) {
            this._prepareFireModeAR((useGruntGroup?gruntGroup.arMod:0), 0, '');
            return;
        }

        switch (fireModeElement.value) {
            case "SS":
                this._onFiringModeChange(event);
                break;
            case "SA":
                this._onFiringModeChange(event);
                break;
            case "BF":
                this._onBurstModeChange(event);
                break;
            case "FA":
                this._onAreaChange(event);
                break;
        }
    }
    //-------------------------------------------------------------
    _updateDicePool(event) {
        const gruntGroup = this.actor.gruntGroup;
        const useGruntGroup = (gruntGroup.id && document.getElementById("useGruntGroup")?.checked)
        // Get the value of the user entered modifier ..
        let userModifier = parseInt(document.getElementById("modifier").value);
        this.modifier = userModifier ? userModifier : 0;

        // Get the value of the checkbox if the calculated wound penality should be used
        let useWoundModifier = document.getElementById("useWoundModifier").checked;
        let useSustainModifier = document.getElementById("useSustainedSpellModifier").checked;

        // Calculate new sum
        console.log("SR6E | updateDicePool: ", this);
        let woundMod = (this.actor) ? this.actor.getWoundModifier() : 0;
        let sustainedMod = (this.actor) ? this.actor.getSustainedSpellsModifier() : 0;
        if (this.actor) {
            console.log("SR6E | updateDicePool2: ", this.prepared.pool, this.modifier, woundMod, sustainedMod);
        }
        this.prepared.calcPool = this.prepared.pool + this.modifier - (useWoundModifier?woundMod:0) - (useSustainModifier?sustainedMod:0) 
                                    + (useGruntGroup && this.options.prepared.rollType == RollType.Weapon ? gruntGroup.diceMod : 0);
        this.prepared.checkHardDiceCap();
        $("label[name='dicePool']")[0].innerText = this.prepared.calcPool.toString();
    }
    //-------------------------------------------------------------
    _performEdgeBoostOrAction(data, boostOrActionId) {
        let prepared = this.options.prepared;
        let configured = this.dialogResult;
        // Get the value of the user entered modifier ..
        let userModifier = parseInt(document.getElementById("modifier").value);
        this.modifier = userModifier ? userModifier : 0;
        
        // Get edge info
        const boostSelected = CONFIG.SR6.EDGE_BOOSTS.find((boost) => boost.id == boostOrActionId);
        const actionSelected = CONFIG.SR6.EDGE_ACTIONS.find((action) => action.id == boostOrActionId);
        console.log("SR6E | Selected Edge Boost: `" + game.i18n.localize("shadowrun6.edge_boost." + boostOrActionId) + "`, that costs " + boostSelected?.cost);

        this.edge += this.edgeSpending; // Add old edge spend back to the edge counter in the dialog
        if (boostSelected && boostSelected?.cost) {
            this.edge = this.edge - boostSelected.cost;
            this.edgeSpending = boostSelected.cost;
        } else if (actionSelected && actionSelected?.cost) {
            this.edge = this.edge - actionSelected.cost;
            this.edgeSpending = actionSelected.cost;
        } else {
            this.edgeSpending = 0;
        }
        $("label[name='edgePool']")[0].innerText = this.edge.toString();

        console.log("SR6E | TODO: performEgdeBoostOrAction " + boostOrActionId);
        if (boostOrActionId == "edge_action") {
            //TODO: automate edge actions
            // Costs are also not automatically substracted in Rolls.js #219
            return;
        }
        switch (boostOrActionId) {
            case "add_edge_pool":
                data.explode = true;
                console.log("SR6E | add_edge_pool setting edgePoolIgnoringCap to ", getSystemData(data.actor).edge.max);
                prepared.edgePoolIgnoringCap = getSystemData(data.actor).edge.max;
                configured.edgePoolIgnoringCap = getSystemData(data.actor).edge.max;
                break;
        }
        // Update content on dialog
        $("input[name='modifier']")[0].value = this.modifier;
        //($("input[name='explode' ]")[0] as HTMLInputElement).value = data.explode;
        $("input[name='explode' ]")[0].checked = data.explode;
        this._updateDicePool(data);
    }
    //-------------------------------------------------------------
    _onSpellConfigChange() {
        let ampUpElement = document.getElementById("ampUp");
        let incElement = document.getElementById("incArea");
        let prepared = this.options.prepared;
        if (!isLifeform(getSystemData(prepared.actor)))
            return;
        
        let incSelect = incElement ? parseInt(incElement.value) : 0;
        
        // update Spell Damage
        prepared.ampUp = ampUpElement ? parseInt(ampUpElement.value) : 0;
        prepared.calculateSpellDamage();

        prepared.calcDrain = (+prepared.spell.drain + +prepared.ampUp * 2 + +incSelect);
        prepared.calcArea = 2 + incSelect * 2;

        this.html.find("td[id='spellDrain']").text(prepared.calcDrain.toString());
        this.html.find("span[id='spellDmg']").text(prepared.calcDamage.toString());
        this.html.find("span[id='spellArea']").text(prepared.calcArea.toString());
    }
    //-------------------------------------------------------------
    _onFiringModeChange(event) {
        const gruntGroup = this.actor.gruntGroup;
        const useGruntGroup = (gruntGroup.id && document.getElementById("useGruntGroup")?.checked)
        let prepared = this.options.prepared;
        let fireModeElement = document.getElementById("fireMode");
        if (!fireModeElement)
            return;
        let newMode = fireModeElement.value;
        let arMod = useGruntGroup ? gruntGroup.arMod : 0;   // default 0
        let dmgMod = 0;
        let rounds = 1;
        prepared.fireMode = newMode;
        console.log('SR6E | _onFiringModeChange', this, prepared);

        switch (newMode) {
            case "SS":
                this.html.find(".onlyFA").css("display", "none");
                this.html.find(".onlyBF").css("display", "none");
                break;
            case "SA":
                this.html.find(".onlyFA").css("display", "none");
                this.html.find(".onlyBF").css("display", "none");
                rounds = 2;
                arMod += Math.min(0, parseInt(prepared.item.system.modes.SA_ar_mod)); // -2 default
                dmgMod = 1;
                break;
            case "BF":
                this.html.find(".onlyFA").css("display", "none");
                this.html.find(".onlyBF").css("display", "table-cell");
                rounds = 4;
                arMod += Math.min(0, parseInt(prepared.item.system.modes.BF_ar_mod)); // -4 default
                dmgMod = 2;
                break;
            case "FA":
                rounds = 10;
                arMod = Math.min(0, arMod + prepared.item.system.modes.FA_ar_mod); // -6 default
                this.html.find(".onlyFA").css("display", "table-cell");
                this.html.find(".onlyBF").css("display", "none");
                let fullAutoElement = document.getElementById("fullAutoArea");
                fullAutoElement.value = 1;
                break;
        }

        this._prepareFireModeAR(arMod, dmgMod, rounds);
        this._recalculateBaseAR();
    }
    //-------------------------------------------------------------
    _onBurstModeChange(event, extraArMod=0) {
        console.log("SR6E | _onBurstModeChange");
        const gruntGroup = this.actor.gruntGroup;
        const useGruntGroup = (gruntGroup.id && document.getElementById("useGruntGroup")?.checked)
        let prepared = this.options.prepared;
        let fireModeElement = document.getElementById("bfType");
        if (!fireModeElement)
            return;
        let arMod = 0;
        let dmgMod = 0;
        let rounds = 4;

        switch (fireModeElement.value) {
            case "wide_burst":
                // TODO implement anticipation; i.e. two rolls to the two targets
                arMod = prepared.item.system.modes.SA_ar_mod; // -2 default
                dmgMod = 1;
                if (game.user.targets.size !== 2) {
                    ui.notifications.error("shadowrun6.ui.notifications.You_can_only_choose_Wide_Burst_when_you_target_two_tokens", { localize: true });
                    fireModeElement.value = 'narrow_burst';
                    arMod = prepared.item.system.modes.BF_ar_mod; // -4 default
                    dmgMod = 2;
                }
                break;
            case "narrow_burst":
                arMod = prepared.item.system.modes.BF_ar_mod; // -4 default
                dmgMod = 2;
                break;
        }

        arMod += (useGruntGroup ? gruntGroup.arMod : 0);
        prepared.burstMode = fireModeElement.value;
        this._prepareFireModeAR(arMod, dmgMod, rounds);
        this._recalculateBaseAR();
    }
    //-------------------------------------------------------------
    _prepareFireModeAR(arMod, dmgMod, rounds) {
        console.log('SR6E | _prepareFireModeAR: arMod', arMod ,'dmgMod', dmgMod,'rounds', rounds);
        let prepared = this.options.prepared;
        let poolMod = 0;    //not used?

        if (game.settings.get(SYSTEM_NAME, "highStrengthReducesRecoil") && this.dialogResult.dualHand && arMod < 0) {
            const actorStrength = this.actor.system.attributes.str.pool;
            let strengthArReduction = 0;
            strengthArReduction += ( actorStrength >= 7 ) ? 1 : 0;
            strengthArReduction += ( actorStrength >= 10 ) ? 1 : 0;
            arMod = Math.min(0, arMod + strengthArReduction);
            console.log('SR6E | _prepareFireModeAR: dual handedness, changing arMod to', arMod);
        }

        // Calculate changed attack rating
        prepared.calcAttackRating = [...prepared.item.calculated.attackRating];
        prepared.calcAttackRating.forEach((element, index) => {
            if (parseInt(element) >= 0)
                prepared.calcAttackRating[index] = Math.max(0, parseInt(element) + parseInt(arMod) );
        });
        this.html.find("td[name='calcAR']").text(game.sr6.utils.attackRatingToString(prepared.calcAttackRating));
        // Update the range selector for attack rating
        this.html
            .find("select[name='distance']")
            .children("option")
            .each(function () {
            let idx = parseInt(this.getAttribute("name"));
            this.setAttribute("data-item-ar", prepared.calcAttackRating[idx].toString());
            this.setAttribute("value", prepared.calcAttackRating[idx].toString());
            const distanceArText = prepared.calcAttackRating[idx] >= 0 ? prepared.calcAttackRating[idx].toString() : "-";
            this.text = game.i18n.localize("shadowrun6.roll.ar_" + idx) + " (" + distanceArText + ")";
        });
        this.html.find("select[name='distance']").change();
        // Calculate modified damage
        prepared.calcDamage = parseInt(prepared.item.calculated.dmg) + dmgMod;
        this.html.find("span[name='calcDamage']").text(prepared.calcDamage.toString());
        // Calculate modified pool
        prepared.calcPool = prepared.pool + poolMod;
        prepared.calcRounds = rounds ?? prepared.calcRounds;
        this.html.find("td[name='calcRounds']").text(prepared.calcRounds.toString());
    }
    //-------------------------------------------------------------
    _onAreaChange(event) {
        const gruntGroup = this.actor.gruntGroup;
        const useGruntGroup = (gruntGroup.id && document.getElementById("useGruntGroup")?.checked)
        console.log("SR6E | _onAreaChanged");
        let prepared = this.options.prepared;
        let fullAutoElement = document.getElementById("fullAutoArea");
        if (!fullAutoElement)
            return;
        let arMod = 0 + (useGruntGroup?gruntGroup.arMod:0) + prepared.item.system.modes.FA_ar_mod; // -6 default
        let dmgMod = 0;
        let rounds = 10;

        arMod -= (fullAutoElement.value - 1) * 2;

        prepared.faArea = fullAutoElement.value;
        this._prepareFireModeAR(arMod, dmgMod, rounds);
        this._recalculateBaseAR();
    }
    //-------------------------------------------------------------
    async _onAmmoChange(event) {
        console.log("SR6E | _onAmmoChange | updating item calculcated attributes");
        const prepared = this.options.prepared;   // WeaponRoll
        const ammoLoadedElement = document.getElementById("ammoLoaded");
        if (!ammoLoadedElement)
            return;

        // Update the weapon
        await this.prepared.item.update({"system.ammoLoaded": ammoLoadedElement.value})
        
        // Recalculate firing modes
        const fireModeElement = document.getElementById("fireMode");
        if (!fireModeElement)
            return;

        switch (fireModeElement.value) {
            case "SS":
                this._onFiringModeChange();
                break;
            case "SA":
                this._onFiringModeChange();
                break;
            case "BF":
                this._onBurstModeChange();
                break;
            case "FA":
                this._onAreaChange();
                break;
        }

        // Updating DV type
        const suffix = prepared.item.calculated.stun ? game.i18n.localize("shadowrun6.item.stun_damage") : game.i18n.localize("shadowrun6.item.physical_damage");
        this.html.find("span[name='calcDamagedMonitor']").text( suffix );
        prepared.monitor = prepared.item.calculated.stun ? MonitorType.STUN : MonitorType.PHYSICAL ;

    }
    //-------------------------------------------------------------
    _onAttribChange(event) {
        console.log("SR6E | _onAttribChange ", this);
        let actor = this.options.actor;
        let prepared = this.options.prepared;
        let configured = this.options.dialogResult;
        // Ignore this, if there is no actor
        if (!actor) {
            return;
        }
        if (!event || !event.currentTarget) {
            return;
        }
        if (isSkillRoll(prepared)) {
            console.log("SR6E | isSkillRoll ", prepared.skillId);
            const attribSelect = event.currentTarget;
            let newAttrib = attribSelect.children[attribSelect.selectedIndex].value;
            console.log("SR6E |  use attribute = " + newAttrib);
            prepared.attrib = newAttrib;
            actor.updateSkillRoll(prepared, newAttrib);
            prepared.actionText = prepared.checkText;
        } else if (prepared.useAttributeMod) {
            console.log("SR6E | is Attribute Roll ", prepared.actionText);
            const attribSelect = event.currentTarget;
            let newAttrib = attribSelect.children[attribSelect.selectedIndex].value;
            console.log("SR6E |  use attribute = " + newAttrib);
            prepared.pool = this.actor.system.attributes[prepared.attributeTested].pool;
            prepared.checkText = game.i18n.localize("attrib." + prepared.attributeTested)
            if (newAttrib) {
                prepared.checkText += ' + ' + game.i18n.localize("attrib." + newAttrib);
                prepared.pool += this.actor.system.attributes[newAttrib].pool;
            }
            prepared.calcPool = prepared.pool;
            prepared.actionText = prepared.checkText;
        }
        console.log("SR6E | new check: " + prepared.checkText);
        console.log("SR6E | new pool: " + prepared.pool);
        configured.checkText = prepared.checkText;
        configured.pool = prepared.pool;
        document.getElementById("rolldia-checkText").textContent = prepared.checkText;
        this._updateDicePool(configured);
    }
    //-------------------------------------------------------------
    _onNoTarget() {
        document.getElementById("noTargetLabel").innerText = game.i18n.localize("shadowrun6.roll.notarget");
    }
    //-------------------------------------------------------------
    // Note: this isn't called on close of the Dialog, legacy code?
    onClose() {
        console.log("SR6E | To Do: onClose()------------------------------------");
        const options = this.options;
        let prepared = options.prepared;
        let configured = options.dialogResult;
        return new SR6ChatMessageData(configured);
    }
}