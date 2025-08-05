import { RollDialog } from "./RollDialog.js";
import SR6Roll from "./SR6Roll.js";
import { ConfiguredRoll, ReallyRoll, RollType } from "./dice/RollTypes.js";
import { SYSTEM_NAME } from "./constants.js";
function isLifeform(obj) {
    return obj.attributes != undefined;
}
function isWeapon(obj) {
    return obj.attackRating != undefined;
}
function isSpell(obj) {
    return obj.drain != undefined;
}
function getSystemData(obj) {
    if (!obj)
        return null;
    if (game.release.generation >= 10)
        return obj.system;
    return obj.data.data;
}
export async function doRoll(data) {
    console.log("SR6E | ENTER doRoll ", data);
    try {
        // Create ll instance
        const _r = await _showRollDialog(data);
        console.log("SR6E | returned from _showRollDialog with ", _r);
        if (_r) {
            // NOT SURE WHY data WAS ORIGINALLY USED - NEED TO PAY ATTENTION TO REGRESSION DUE TO SWITCHING TO _r
            // console.log("SR6E | ==============Calling toRoll() with data", data);
            // _r.toMessage(data, { rollMode: data.rollMode });
            console.log("SR6E | ==============Calling toRoll() with _r.configured", _r);
            _r.toMessage(_r.configured, { rollMode: _r.configured.rollMode });
        }
        return _r;
    }
    finally {
        console.log("SR6E | LEAVE doRoll");
    }
}
//-------------------------------------------------------------
/**
 * @param data { PreparedRoll} Roll configuration from the UI
 * @return {Promise<Roll>}
 * @private
 */
async function _showRollDialog(data) {
    console.log("SR6E | ENTER _showRollDialog", data);
    try {
        let lifeform;
        let dia2;
        data.rollMode = game.settings.get('core', 'rollMode');

        if (!data.interval)
            data.interval = 1;
        if (!data.modifier)
            data.modifier = 0;
        if (data.actor) {
            if (!isLifeform(getSystemData(data.actor))) {
                console.log("SR6E | Actor is not a lifeform");
            }
            lifeform = getSystemData(data.actor);
            data.edge = data.actor ? lifeform.edge.value : 0;
        }
        if (!data.calcPool || data.calcPool == 0) {
            data.calcPool = data.pool;
            if (data.actor) {
                data.useWoundModifier = data.dialogConfig?.useWoundModifier === false ? false : true;
                data.useSustainedSpellModifier = data.dialogConfig?.useSustainedSpellModifier === false ? false : true;

                // Don't use wound modifier on Resist Damage tests
                if (data.rollType == RollType.Soak) {
                    data.useWoundModifier = false;
                   
                }
                // Only use sustained modifier on action tests
                if (data.actionText.substring(0,6) == 'Resist') {
                    data.useSustainedSpellModifier = false;
                }
                
                data.calcPool -= (data.useWoundModifier             ? data.actor.getWoundModifier() : 0);
                data.calcPool -= (data.useSustainedSpellModifier    ? data.actor.getSustainedSpellsModifier() : 0);
            }
        }
        /*
         * Edge, Edge Boosts and Edge Actions
         */
        data.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter((boost) => boost.when == "PRE" && boost.cost <= data.edge);
        if (data.rollType == RollType.Weapon) {
            data.calcPool = data.pool;
            data.calcAttackRating = [...data.item.calculated.attackRating];
            data.calcDamage = data.item.calculated.dmg;
            if (game.settings.get(SYSTEM_NAME, "highStrengthReducesRecoil") ) {
                data.dualHand = data.item.system.dualHand;
            }
            if ( game.settings.get(SYSTEM_NAME, "cantDodgeBullets") ) {
                data.cantDodgeBullets = true;
                data.threshold = 0;
                // Calculating the highest defense pool of all targets
                let targetDefensePool = 0
                game.user.targets.forEach((token) => {
                    targetDefensePool = Math.max(targetDefensePool, token.actor.system.defensepool.physical.pool);
                });
                data.threshold += Math.floor( targetDefensePool / 6 );
                data.cantDodgeBulletsBaseThreshold = data.threshold;
            }
        }
        else if (data.RollType == RollType.ContinueExtendedTest) {
            // possible add things here? Currently they're in shadowrun6.js
        }
        data.edgeBoosts.unshift({ id:'none', label: ' - ' });
        data.edgeBoosts.push({ id:'edge_action', label: 'shadowrun6.edge_boost.edge_action' });

        /*
         * data SpellRoll
         */
        if (data.rollType == RollType.Spell && lifeform != null) {
            data.calculateSpellDamage();
        }
        
        data.calcPool = (data.calcPool < 0 ) ? 0 : data.calcPool; 
        data.checkHardDiceCap();

        // Render modal dialog
        let template = "systems/shadowrun6-eden/templates/dialog/configurable-roll-dialog.html";
        let dialogData = {
            //checkText: data.extraText,
            data: data,
            CONFIG: CONFIG,
            rollModes: CONFIG.Dice.rollModes
        };

        const html = await renderTemplate(template, dialogData);
        const rollTitle = data.title ? data.title : 'Roll Dialog';
        const title = data.actor ? data.actor.name + ': ' + rollTitle : rollTitle;
        // Also prepare a ConfiguredRoll
        console.log("SR6E | ###Create ConfiguredRoll");
        let dialogResult = new ConfiguredRoll();
        dialogResult.copyFrom(data);
        dialogResult.updateSpecifics(data);
        console.log("SR6E | ### ConfiguredRoll input", data);
        console.log("SR6E | ### ConfiguredRoll", dialogResult);
        // Create the Dialog window
        return new Promise((resolve) => {
            console.log("SR6E | _showRollDialog prepared buttons");
            let buttons;
            if (data.allowBuyHits) {
                buttons = {
                    bought: {
                        icon: '<i class="fas fa-dollar-sign"></i>',
                        label: game.i18n.localize("shadowrun6.rollType.bought"),
                        callback: (html) => {
                            const form = html[0].querySelector("form");
                            data.validateDialog(form); // XxxRoll.validateDialog()
                            resolve(_dialogClosed(ReallyRoll.AUTOHITS, form, data, dia2, dialogResult));
                        }
                    },
                    normal: {
                        icon: '<i class="fas fa-dice-six"></i>',
                        label: game.i18n.localize("shadowrun6.rollType.normal"),
                        callback: (html) => {
                            const form = html[0].querySelector("form");
                            data.validateDialog(form); // XxxRoll.validateDialog()
                            resolve(_dialogClosed(ReallyRoll.ROLL, form, data, dia2, dialogResult));
                        }
                    }
                };
            }
            else {
                buttons = {
                    normal: {
                        icon: '<i class="fas fa-dice-six"></i>',
                        label: game.i18n.localize("shadowrun6.rollType.normal"),
                        callback: (html) => {
                            console.log("SR6E | doRoll: in callback");
                            resolve(_dialogClosed(ReallyRoll.ROLL, html[0].querySelector("form"), data, dia2, dialogResult));
                            console.log("SR6E | end callback");
                        }
                    }
                };
            }
            const diagData = {
                title: title,
                content: html,
                render: (html) => {
                    console.log("SR6E | Register interactivity in the rendered dialog", this);
                    // Set roll mode to default from chat window
                    let chatRollMode = $(".roll-type-select").val();
                    $("select[name='rollMode']").not(".roll-type-select").val(chatRollMode);
                },
                buttons: buttons,
                default: "normal"
            };
            const myDialogOptions = {
                width: 550,
                jQuery: true,
                resizeable: true,
                actor: data.actor,
                prepared: data,
                dialogResult: dialogResult
            };
            console.log("SR6E | create RollDialog");
            dia2 = new RollDialog(diagData, myDialogOptions);
            dia2.render(true);
            console.log("SR6E | showRollDialog after render()");
        });
        return new Promise((resolve) => { });
    }
    finally {
        console.log("SR6E | LEAVE _showRollDialog");
    }
}
async function _dialogClosed(type, form, prepared, dialog, configured) {
    console.log("SR6E | ENTER _dialogClosed(type=" + type + ")##########");
    console.log("SR6E | dialogClosed: prepared=", prepared, prepared.calcDamage);
    configured.updateSpecifics(prepared);
    console.log("SR6E | dialogClosed: configured=", configured, configured.calcDamage);
    if (prepared.rollType == "weapon") {
    }
    /* Check if attacker gets edge */
    if (configured.actor && configured.edgePlayer > 0) {
        console.log("SR6E | Actor " + configured.actor.name + " " + configured.actor._id + " gets " + configured.edgePlayer + " Edge");
        prepared.edge = getSystemData(configured.actor).edge.value + configured.edgePlayer;
        await configured.actor.update({ ["system.edge.value"]: prepared.edge });
        let combat = game.combat;
        if (combat) {
            console.log("SR6E | In combat: mark edge gained in combatant " + configured.edgePlayer + " Edge");
            let combatant = combat.getCombatantByActor(configured.actor._id);
            if (combatant) {
                combatant.edgeGained += configured.edgePlayer;
            }
        }
    }
    try {
        if (!dialog.modifier)
            dialog.modifier = 0;
        let system = getSystemData(prepared.actor);
        
        if (prepared.actor && isLifeform(system)) {
            // Pay eventuallly selected edge boost
            if (configured.edgeBoost && configured.edgeBoost != "none") {
                console.log("SR6E | Edge Boost selected: " + configured.edgeBoost);
                if (configured.edgeBoost === "edge_action") {
                    if (configured.edgeAction === undefined) {
                        console.log("SR6E | Edge Action selected as boost, without an actual Action | Unsetting edgeBoost");
                        configured.edgeBoost = undefined;
                        configured.edge_use = undefined;
                    }
                    //TODO: handle edge action and costs on roll
                    console.log("SR6E | ToDo: handle edge action");
                }
                else {
                    let boost = CONFIG.SR6.EDGE_BOOSTS.find((boost) => boost.id == configured.edgeBoost);
                    console.log("SR6E | Pay " + boost.cost + " edge for Edge Boost: " + game.i18n.localize("shadowrun6.edge_boost." + configured.edgeBoost));
                    system.edge.value = prepared.edge - boost.cost;
                    // Pay Edge cost
                    console.log("SR6E | Update Edge to " + (prepared.edge - boost.cost));
                    await prepared.actor.update({ ["system.edge.value"]: system.edge.value });
                }
            }
            else {
                if (prepared.edge > 0) {
                    console.log("SR6E | Update Edge to " + prepared.edge);
                    await prepared.actor.update({ ["system.edge.value"]: prepared.edge });
                }
            }
        }
        //configured.edgeBoosts = CONFIG.SR6.EDGE_BOOSTS.filter(boost => boost.when=="POST");
        let formula = "";
        let isPrivate = false;
        if (form) {
            console.log("SR6E | ---prepared.targets = ", prepared.targets);
            console.log("SR6E | ---configured.targetIds = ", configured.targetIds);
            configured.threshold = (typeof form.threshold.value === "number" || (typeof form.threshold.value === "string" && form.threshold.value.length > 0)) ? parseInt(form.threshold.value) : 0;
            configured.useWildDie = form.useWildDie.checked ? 1 : 0;
            configured.explode = form.explode.checked;
            configured.extended = form.extended.checked;
            if (configured.extended) {
                configured.interval = parseInt(form.interval.value);
                configured.intervalScale = form.interval_scale.value;
                configured.timePassed = (form.timePassed?.value === undefined) ? 0 : parseInt(form.timePassed.value);
            }
            configured.buttonType = type;
            dialog.modifier = parseInt(form.modifier.value);
            if (!dialog.modifier)
                dialog.modifier = 0;
            configured.defRating = form.defRating ? parseInt(form.defRating.value) : 0;
            console.log("SR6E | rollMode = ", form.rollMode.value);
            configured.rollMode = form.rollMode.value;
            let base = configured.pool ? configured.pool : 0;
            let mod = dialog.modifier ? dialog.modifier : 0;
            let woundMod = (form.useWoundModifier.checked && prepared.actor) ? prepared.actor.getWoundModifier() : 0;
            let sustMod = (form.useSustainedSpellModifier.checked && prepared.actor) ? prepared.actor.getSustainedSpellsModifier() : 0;
            configured.pool = +base + +mod + -woundMod + -sustMod;
            prepared.calcPool = configured.pool;
            
            prepared.checkHardDiceCap();
            /* Check for a negative pool! Set to 0 if negative so the universe doesn't explode */
            if (configured.pool < 0)
                configured.pool = 0;
            /* Build the roll formula */
            console.log("SR6E | _dialogClosed configured", configured);
            formula = createFormula(configured, dialog);

            configured.pool = configured.checkHardDiceCap(configured.pool);
        }
        console.log("SR6E | _dialogClosed: ", formula);
        // Execute the roll
        return new SR6Roll(formula, configured);
    }
    catch (err) {
        console.log("SR6E | Oh NO! " + err.stack);
    }
    finally {
        console.log("SR6E | LEAVE _dialogClosed()");
    }
    return this;
}
/*
 * Convert ConfiguredRoll into a Foundry roll formula
 */
function createFormula(roll, dialog) {
    console.log("SR6E | createFormula-------------------------------");
    console.log("SR6E | --pool = " + roll.pool);
    console.log("SR6E | --modifier = " + dialog.modifier);
    dialog.modifier = 0;
    let regular = (roll.pool ? roll.pool : 0) + (dialog.modifier ? dialog.modifier : 0);
    regular = roll.checkHardDiceCap(regular);   // adding edgePoolIgnoringCap
    let wild = 0;
    let formula = '';

    let originalDicePool = regular;
    //check for Extended Test
    //only extend within this throw if it isnt an open ended extended test
    let dicepoolThrows = (roll.extended && roll.threshold>0) ? originalDicePool : 1;

    while (dicepoolThrows > 0) {
        if ((roll.extended && roll.threshold>0) && dicepoolThrows < originalDicePool) {
            formula += " + "
            regular = dicepoolThrows;
        }

        if (roll.useWildDie > 0) {
            regular -= roll.useWildDie;
            wild = roll.useWildDie;
        }
        formula += `${regular}d6`;
        if (roll.explode) {
            formula += "x6";
        }
        formula += "cs>=5";
        if (wild > 0) {
            formula += " + " + wild + "d6";
            if (roll.explode) {
                formula += "x6";
            }
            formula += "cs>=5";
        }

        dicepoolThrows--;
    }

    return formula;
}