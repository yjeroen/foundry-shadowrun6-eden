import { Defense, MonitorType } from "./config.js";
import { SR6ChatMessageData, ReallyRoll, RollType, SoakType } from "./dice/RollTypes.js";
import { SYSTEM_NAME } from "./constants.js";
import EdgeRoll from "./dice/EdgeRoll.js";
/**
 *
 */
export default class SR6Roll extends Roll {
    finished;
    prepared;
    configured;
    results;

    static CHAT_TEMPLATE = "systems/shadowrun6-eden/templates/chat/roll-sr6.html";
    static TOOLTIP_TEMPLATE = "systems/shadowrun6-eden/templates/chat/tooltip.html";

    constructor(formula, data, options) {
        super(formula, data, options);
        this.configured = data;
        // If entered from the combat tracker, the roll type is empty but the
        // formula gives hints what is rolled
        if (formula.indexOf("@initiative") > -1) {
            this.configured.rollType = RollType.Initiative;
        }
        console.log("SR6E | In SR6Roll<init>", formula, data);
    }

    async evaluate(options) {
        console.log("SR6E | New Evaluation", this._formula);
        let die = undefined;

        console.log("SR6E | SR6Roll.evaluate | rolling the dice via Roll.evaluate()");
        //TODO remove this autohits block in favor of evaluateResults?
        if (this.configured.buttonType === ReallyRoll.AUTOHITS) { //AUTOHITS: 1
            let noOfDice = Math.floor(this.configured.pool / 4);
            let formula = SR6Roll.createFormula(noOfDice, -1, false);
            die = await new Roll(formula).evaluate();
            this._total = noOfDice;
        } else {
            die = await new Roll(this._formula).evaluate();
            this._total = die.total;
        }        
        console.log("SR6E | SR6Roll.evaluate | Roll.evaluate() finished");

        this.results = die.terms[0].results;
        let termIndex = 0;

        if (this.data.useWildDie) {
            // terms[2] contains the results for the seperate wild die
            // Attach wild-property to each result to distignuish dice later on
            const wildDiceResult = die.terms[2].results.map(dieResult => {
                dieResult.wild = true;
                return dieResult;
            });
            // Append wild dice results to regular dice results
            this.results = this.results.concat(wildDiceResult)
            termIndex += 2;
        }
        // Extended Tests
        if (this.data.extended) {
            console.log('SR6E | Start Extended Test', die.terms);
            this.data.timePassed = (this.data.timePassed??0) + this.data.interval;
            this.evaluateResult(false, true);
            this.results.map(dieResult => {
                dieResult.timeInterval = this.data.timePassed;
                return dieResult;
            });

            termIndex += 2;
            while (this._total < this.data.threshold && termIndex < die.terms.length) {
                this.data.timePassed += this.data.interval;
                if (die.terms[termIndex].results.length > 0) {
                    die.terms[termIndex].results[0].firstDieOfNextInterval = true;
                }
                die.terms[termIndex].results.map(dieResult => {
                    dieResult.timeInterval = this.data.timePassed;
                    return dieResult;
                });

                this.results = this.results.concat(die.terms[termIndex].results);
                if (this.data.useWildDie) {
                    termIndex += 2;
                    if (termIndex === die.terms.length-1) {
                        die.terms[termIndex].results[0].firstDieOfNextInterval = true;
                    }
                    const wildDiceResult = die.terms[termIndex].results.map(dieResult => {
                        dieResult.wild = true;
                        dieResult.timeInterval = this.data.timePassed;
                        return dieResult;
                    });
                    this.results = this.results.concat(wildDiceResult);
                }
                termIndex += 2;
                this.evaluateResult(false, true);
            }
            // Open ended extended test
            if (this.data.threshold === 0) {
                this.configured.extendedTotal = (this.data.extendedTotal??0) + this.total;
                this.configured.timePassed = this.data.timePassed;
            }
            console.log('SR6E | End Extended Test');
        }

        this.terms = die.terms;
        return this.evaluateResult();
    }

    evaluateResult(force=false, evalOnly=false) {
        if (this.configured.buttonType === ReallyRoll.AUTOHITS) {
            // Hits have been bought, roll was just a pseudo roll (for DiceSoNice?)
            // Turn every dice into a success
            this.results.forEach((result) => {
                result.result = 5;
                result.success = true;
                result.count = 1;
                result.classes = "die die_" + result.result;
            });
            this._formula = game.i18n.localize("shadowrun6.roll.hits_bought");
        }

        try {
            // Mark wild dice and assign count values to single die
            if (!this._evaluated || force) {
                this.modifyResults();
                if (this.configured.rollType && this.configured.rollType != RollType.Initiative) {
                    console.log("SR6E | recalculating _formula based on dice pool", this.data.pool);
                    this._total = this.calculateTotal();
                    this._formula = this.data.pool + "d6";
                }
                else {
                    console.log("SR6E | using _formula", this.formula);
                    this._formula = this.formula;
                }
                if(!evalOnly) {
                    this._evaluated = true;
                    this._prepareChatMessage();
                }
            }
            return this;
        }
        finally {
            console.log("SR6E | LEAVE evaluate()");
        }
    }

    mergeRolls(roll) {
        this._total += roll.total;
        //this.terms = this.terms.concat(roll.terms);
        this.results = this.results.concat(roll.results);
        this.configured.pool += roll.configured.pool;
        this._evaluated = false;
        return this.evaluateResult();
    }

    /**********************************************
     */
    calculateTotal() {
        console.log("SR6E | LEAVE calculateTotal", this);
        return this.results.filter(item => item.active).reduce((n, { count }) => n + count, 0);
    }

    //**********************************************
    _prepareChatMessage() {
        console.log("SR6E | _prepareChatMessage: create SR6ChatMessageData", this);
        if (this.configured?.itemId) this.options.itemId = this.configured.itemId;  // Support for AA
        this.finished = new SR6ChatMessageData(this.configured);
        this.finished.badLuck = this.finished.actor?.system?.badLuck;
        this.finished.actorTraits = this.finished.actor?.traits;
        this.finished.glitch = this.isGlitch();
        this.finished.criticalglitch = this.isCriticalGlitch();
        this.finished.success = this.isSuccess();
        this.finished.threshold = this.configured.threshold;
        this.finished.total = this.total;
        if (this.configured.rollType === RollType.Initiative) {
            this.finished.threshold = 0;
            this.finished.success = true;
            this.finished.formula = this._formula;
            this.finished.total = this.total;
        }

        if (game.settings.get(SYSTEM_NAME, "cantDodgeBullets") && this.finished.defendWith === Defense.PHYSICAL) {
            console.log("SR6E | cantDodgeBullets: calculating damage", this.configured.calcDamage, '+ (', this.finished.total, '-', this.finished.threshold, ')');
            this.finished.cantDodgeBullets = true;
            if (this.finished.success) {
                this.finished.netHits = Math.max(0, this.finished.total - this.finished.threshold);
                this.finished.damage = this.configured.calcDamage + this.finished.netHits;
                this.finished.soakType = (this.finished.monitor === MonitorType.PHYSICAL) ? SoakType.DAMAGE_PHYSICAL : SoakType.DAMAGE_STUN;
            }
        }

        this.finished.monitor = this.finished.monitor ? this.finished.monitor : MonitorType.PHYSICAL;
        if (this.finished.rollType === RollType.Soak) {
            this.finished.damage = Math.max(0, this.finished.threshold - this.finished.total);

            if (this.finished.monitor === MonitorType.PHYSICAL && this.finished.damage > 0 && game.settings.get(SYSTEM_NAME, "armorLessensDmg")) {
                // TODO for Blast Attacks, armorLessensDmg is /4 DR
                const armorLessensDmg = Math.floor(this.finished.actor.system.defenserating.physical.pool / 8);
                console.log("SR6E | armorLessensDmg, reducing damage by", armorLessensDmg);
                const newDamage = Math.max(0, this.finished.damage - armorLessensDmg);
                const convertedToStun = this.finished.damage - newDamage;
                if (newDamage === 0) {
                    this.finished.damage = convertedToStun;
                    this.finished.monitor = MonitorType.STUN;
                } else {
                    this.finished.damage = newDamage;
                    this.finished.damageConvertedStun = convertedToStun;
                }
            }

            if (this.finished.soakType === SoakType.DRAIN) {
                if ((this.finished.threshold - this.result) > this.finished.actor.system.attributes.mag.pool) {
                    this.finished.monitor = MonitorType.PHYSICAL;
                }
            }
            else if (this.finished.soakType === SoakType.FADING) {
                if ((this.finished.threshold - this.result) > this.finished.actor.system.attributes.res.pool) {
                    this.finished.monitor = MonitorType.PHYSICAL;
                }
            }
        }
        
        this.finished.targets = this.configured.targetIds;
        console.log("SR6E | targetIds in Chat message: ", this.finished.targets);
        if (this.configured.rollType == RollType.Defense) {
            console.log("SR6E | _evaluateTotal: calculating remaining damage", this.configured.damage??0, this.configured.threshold, this.total);
            this.finished.damage = Math.max(0, this.configured.damage??0 + (this.configured.threshold - this.total));
            console.log("SR6E | _evaluateTotal: remaining damage = " + this.finished.damage);
        }
    }
    /**
     * Assign base css classes
     */
    applyDiceCss() {
        this.results?.forEach((result) => {
            result.classes = 'die';
            if (result.result >= 5) 
                result.classes += ' hit';
            else 
                result.classes += ' miss';

            if (!result.active)
                result.classes += ' ignored';
            if(result.edged)
                result.classes += ' edged';

            result.classes += ' die_' + result.result;
        });
    }
    /**
     * Assign dice tooltips
     */
    applyDiceTooltips() {
        let title = "";
        this.results?.forEach((result) => {

            if (result.result >= 5) 
                if (result.wild) 
                    title = game.i18n.localize("shadowrun6.dice.wild");
                else
                title = game.i18n.localize("shadowrun6.dice.hit");
            else 
            title = game.i18n.localize("shadowrun6.dice.failed");
            
            if (!result.active)
                title += " " + game.i18n.localize("shadowrun6.dice.edge_rerolled");
            else if(result.edged)
                title += " " + game.i18n.localize("shadowrun6.dice.edge_rolled");

            result.title = title;
        });
    }
    /************************
     * If there are wild die, assign them the appropriate CSS class and increase the
     * value of the count
     * @returns TRUE, when 5s shall be ignored
     ************************/
    markWildDie() {
        let ignoreFives = [];

        this.results?.forEach(result => {
            let lastExploded = false;
            if (result.wild) {
                if (!lastExploded) {
                    result.classes += "_wild wild";
                    result.wild = true;
                    // A 5 or 6 counts as 3 hits
                    if (result.success) {
                        result.count = 3;
                    }
                    else if (result.result === 1) {
                        ignoreFives.push(result.timeInterval??true);
                    }
                }
                lastExploded = result.exploded;
            }
        });
        ignoreFives = [...new Set(ignoreFives)].sort();
        return ignoreFives;
    }
    /*****************************
     * @override
     */
    modifyResults() {
        this.applyDiceCss();
        this.applyDiceTooltips();
        let ignoreFives = this.markWildDie();
        let addedByExplosion = false;
        this.results?.forEach((result) => {
            if (addedByExplosion) {
                if (result.classes.includes("_wild")) {
                    result.classes = result.classes.substring(0, result.classes.length - 5);
                }
                if (!result.classes.includes(" exploded")) {
                    result.classes += " exploded";
                }
            }
            if (result.result == 5 && ignoreFives.length > 0 && result.classes.indexOf(" ignored") < 0) {
                if (ignoreFives.includes(result.timeInterval) || ignoreFives[0] === true) {
                    result.classes += " ignored";
                    result.classes.replace("hit", "miss");
                    result.title = game.i18n.localize("shadowrun6.dice.wild_ignored");
                    result.success = false;
                    result.count = 0;
                }
            }
            addedByExplosion = result.exploded;
        });
    }
    /**
     * Build a formula for a Shadowrun dice roll.
     * Assumes roll will be valid (e.g. you pass a positive count).
     * Used by AUTOHITS
     * @param count The number of dice to roll.
     * @param limit A limit, if any. Negative for no limit.
     * @param explode If the dice should explode on sixes.
     */
    static createFormula(count, limit = -1, explode = false) {
        console.log("SR6E | createFormula-------------------------------");
        if (!count) {
            throw new Error("createFormula: Number of dice not set");
        }
        let formula = `${count}d6`;
        if (explode) {
            formula += "x6";
        }
        if (limit > 0) {
            formula += `kh${limit}`;
        }
        return `${formula}cs>=5`;
    }
    /**
     * The number of glitches rolled.
     */
    getGlitches(critGlitchCheck=false) {
        if (!this._evaluated || !this.results) {
            return NaN;
        }
        if (this.finished.badLuck && !critGlitchCheck) {
            return this.results.filter((die) => (die.result === 1 || die.result === 2)).length;
        } else {
            return this.results.filter((die) => die.result === 1).length;
        }

    }
    /**
     * Is this roll a regular (non-critical) glitch?
     */
    isGlitch(critGlitchCheck=false) {
        if (!this._evaluated || !this.results) {
            return false;
        }
        return this.getGlitches(critGlitchCheck) > this.results.length / 2;
    }
    /**
     * Is this roll a critical glitch?
     */
    isCriticalGlitch() {
        return this.isGlitch(true) && this._total === 0;
    }
    isSuccess() {
        console.log("SR6E | SR6Roll.isSuccess for ", this);
        if (this.finished.threshold > 0) {
            return this._total >= this.finished.threshold;
        }
        else {
            return this._total > 0;
        }
    }
    /**
     * Represent the data of the Roll as an object suitable for JSON serialization.
     * @returns Structured data which can be serialized into JSON
     * @override
     */
    toJSON() {
        console.log("SR6E | SR6Roll toJSON ", this);
        const json = super.toJSON();
        json.data = this.data;
        json.configured = this.configured;
        json.finished = this.finished;
        json.results = this.results;
        return json;
    }
    /**
     * Recreate a Roll instance using a provided data object
     * @param data - Unpacked data representing the Roll
     * @returns A reconstructed Roll instance
     * @override
     */
    static fromData(data) {
        const roll = super.fromData(data);
        //console.log("SR6E | fromData ",roll);
        roll.configured = data.configured;
        roll.finished = data.finished;
        roll.results = data.results;
        //console.log("SR6E | fromData returning ",roll);
        return roll;
    }
    /*****************************************
     * @override
     ****************************************/
    getTooltip() {
        //console.log("SR6E | getTooltip = ",this);
        let parts = {};
        return renderTemplate(SR6Roll.TOOLTIP_TEMPLATE,
            {
                parts,
                finished: this.finished,
                data: this.data,
                results: this.results,
                total: this._total,
                postEdgeBoosts: EdgeRoll.postEdgeBoosts,
                postEdgeBoostsOpponent: EdgeRoll.postEdgeBoostsOpponent
            });
    }
    /*****************************************
     * Render to Chat message
     * @returns HTML
     ******************************************/
    async render(options) {
        console.log("SR6E | ENTER render");
        console.log("SR6E | options = ", options);
        console.log("SR6E | this = ", this);
        console.log("SR6E | this.data = ", this.data);
        console.log("SR6E | this.finished = ", this.finished);
        // console.log("SR6E | this.results = ", this.results);
        try {
            if (!this._evaluated) {
                await this.evaluate({ async: true });
            }
            let isPrivate = options ? options.isPrivate : false;
            if (!this.finished) {
                console.log("SR6E | #####this.finished not set#############");
                this.finished = new SR6ChatMessageData(this.configured);
            }

            // Threshold modifications that impact the succes of the current roll, must be done above (in _prepareChatMessage)
            this.finished.success = this.isSuccess();
            // Threshold modifications that impact the succes of the future rolls, must be done below

            if (this.configured) {
                this.finished.actionText = isPrivate ? "" : this.configured.actionText;
                this.finished.allowSoak = this.configured.allowSoak;
                if (this.configured.extended) {
                    const pluralRules = new Intl.PluralRules(game.i18n.lang);
                    const localizedIntervalScale = game.i18n.localize( `shadowrun6.dice.extended.intervalScale.${this.configured.intervalScale}_long_${pluralRules.select(this.configured.timePassed)}`);
                    if (this.configured.threshold === 0) {
                        this.finished.extendedResultMsg = game.i18n.format("shadowrun6.dice.extended.desc", { 
                            timePassed: this.configured.timePassed, 
                            intervalScale: localizedIntervalScale,
                            hits: this.configured.extendedTotal
                        });
                    } 
                    else if (this.finished.success) {
                        this.finished.extendedResultMsg = game.i18n.format("shadowrun6.dice.extended_success", { 
                            timePassed: this.configured.timePassed, 
                            intervalScale: localizedIntervalScale
                        });
                    }
                    else {
                        this.finished.extendedResultMsg = game.i18n.format("shadowrun6.dice.extended_failure", { 
                            timePassed: this.configured.timePassed, 
                            intervalScale: localizedIntervalScale
                        });
                    }
                }
                //TODO possible move some of these things to _prepareChatMessage() // rollType Soak already moved but kept here to keep old chatMessages working
                if (this.finished.rollType == RollType.Soak && this.finished.damage === undefined) {
                    console.log("SR6E | rollType", RollType.Soak);
                    this.finished.damage = this.finished.threshold - this.finished.total;

                } else if (this.finished.rollType === RollType.Weapon) {
                    console.log("SR6E | rollType", RollType.Weapon);
                    // this.finished.total = Attacker hits in this roll
                    // Defender must have more hits than the attacker for success, not the same
                    this.finished.threshold = this.finished.total + 1;

                } else if (this.finished.rollType === RollType.Defense) {
                    console.log("SR6E | rollType", RollType.Defense);
                    // this.finished.thresholds = Attacker hits +1 
                    // this.finished.total = Defender hits in this roll
                    if (this.finished.total <= this.finished.threshold) {
                        this.finished.damage = this.data.calcDamage + (this.finished.threshold - 1) - this.finished.total;

                        // Hardened Armor
                        if (this.finished.rollType === RollType.Defense && this.finished.soakType === SoakType.DAMAGE_PHYSICAL ) {
                            if (!(this.finished.actorTraits.immunityNormalWeapons && this.configured.defendedWith === Defense.SPELL_INDIRECT)) {
                                console.log("SR6E | Applying Hardened Armor", this.finished.actorTraits.hardenedArmor);
                                this.finished.damage = Math.max(0, this.finished.damage- this.finished.actorTraits.hardenedArmor);
                            }
                        }
                    }
                    if (this.finished.allowSoak === false) {
                        this.finished.rollType = RollType.Soak;
                    }
                } else if (this.finished.rollType === RollType.Spell) {
                    console.log("SR6E | rollType", RollType.Spell);
                    if (this.configured.spell.category === "combat") {
                        console.log("SR6E | Spell Category combat");
                        if (this.finished.defendWith === Defense.SPELL_DIRECT) {
                            console.log("SR6E | This is a Direct Combat Spell");
                            this.finished.threshold = this.finished.total + 1;
                        } else if (this.finished.defendWith === Defense.SPELL_INDIRECT) {
                            console.log("SR6E | This is a Indirect Combat Spell");
                            // Defender must have more hits than the attacker for success, not the same
                            this.finished.threshold = this.finished.total + 1;
                        }
                    }
                    if (this.configured.spell.withEssence) {
                        this.finished.netHits = this.finished.total - this.configured.threshold;
                    }
                } else if (this.finished.rollType === RollType.ComplexForm) {
                    if (this.configured.threshold && this.finished.total) {
                        // Show Net Hits in the chat message
                        this.finished.netHits = this.finished.total - this.configured.threshold;
                    }
                }
            }

            //finished.user    = (game as Game).user!.id,
            this.finished.glitch = this.isGlitch();
            this.finished.criticalglitch = this.isCriticalGlitch();
            this.finished.total = this._total;
            this.finished.configured = this.configured;
            (this.finished.results = isPrivate ? "???" : this.results),
                (this.finished.formula = isPrivate ? "???" : this._formula),
                (this.finished.publicRoll = !isPrivate);
            this.finished.tooltip = isPrivate ? "" : await this.getTooltip();
            this.finished.publicRoll = !isPrivate;

            // Fixing rollMode
            this.finished.rollMode = this.data.rollMode;

            // Setting Sprint text
            if (this.finished.configured.skillSpec === "sprinting") {
                this.finished.configured.sprintingResult = game.i18n.format("shadowrun6.derived.movement.sprint_result", { 
                    name: this.finished.actor.name,
                    metersSprinted: this.finished.actorTraits.movementSprintBase + ( this.finished.actorTraits.movementSprintMultiplier * this.finished.total )
                });
            }

            return renderTemplate(SR6Roll.CHAT_TEMPLATE, this.finished);
        }
        finally {
            console.log("SR6E | LEAVE render");
        }
    }
}