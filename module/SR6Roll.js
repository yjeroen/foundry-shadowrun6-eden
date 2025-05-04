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
        console.log("SR6E | In SR6Roll<init>1(" + formula + " , ", data);
    }

    async evaluate(options) {
        console.log("SR6E | New Evaluation");
        let die = undefined;

        if (this.configured.buttonType === ReallyRoll.AUTOHITS) {
            let noOfDice = Math.floor(this.configured.pool / 4);
            let formula = SR6Roll.createFormula(noOfDice, -1, false);
            die = await new Roll(formula).evaluate();
            this._total = noOfDice;
        } else {
            die = await new Roll(this._formula).evaluate();
            this._total = die.total;
        }

        this.results = die.terms[0].results;

        if (this.data.useWildDie) {
            // terms[2] contains the results for the seperate wild die
            // Attach wild-property to each result to distignuish dice later on
            const wildDiceResult = die.terms[2].results.map(item => {
                item.wild = true;
                return item;
            });
            // Append wild dice results to regular dice results
            this.results = this.results.concat(wildDiceResult)
        }
        this.terms = die.terms;

        return this.evaluateResult();
    }

    evaluateResult(force=false) {
        if (this.configured.buttonType === ReallyRoll.AUTOHITS) {
            // Hits have been bought, roll was just a pseudo roll (for DiceSoNice?)
            // Turn every dice into a success
            this.results.forEach((result) => {
                result.result = 6;
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
                    this._total = this.calculateTotal();
                    this._formula = this.data.pool + "d6";
                }
                else {
                    this._formula = this.formula;
                }
                this._evaluated = true;
                this._prepareChatMessage();
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
        this.finished = new SR6ChatMessageData(this.configured);
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
                const armorLessensDmg = Math.floor(this.finished.actor.system.defenserating.physical.pool / 4);
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

            if (this.finished.soakType === SoakType.FADING) {
                if ((this.finished.threshold - this.result) > this.finished.actor.system.attributes.res.pool) {
                    this.finished.monitor = MonitorType.PHYSICAL;
                }
                // TODO add drain daamge
            }
        }

        this.finished.targets = this.configured.targetIds;
        console.log("SR6E | targetIds in Chat message: ", this.finished.targets);
        if (this.configured.rollType == RollType.Defense) {
            console.log("SR6E | _evaluateTotal: calculate remaining damage");
            this.finished.damage = Math.max(0, this.configured.damage + (this.configured.threshold - this.total));
            console.log("SR6E | _evaluateTotal: remaining damage = " + this.finished.damage);
        }
    }
    /**
     * Assign base css classes
     */
    applyDiceCss() {
        this.results.forEach((result) => {
            result.classes = 'die die_' + result.result;
            if (!result.active)
                result.classes += ' ignored';
            if(result.edged)
                result.classes += ' edged';
        });
    }
    /**
     * Assign dice tooltips
     */
    applyDiceTooltips() {
        let title = "";
        this.results.forEach((result) => {

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
        let ignoreFives = false;

        this.results.forEach(result => {
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
                        ignoreFives = true;
                    }
                }
                lastExploded = result.exploded;
            }
        });
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
        this.results.forEach((result) => {
            if (addedByExplosion) {
                if (result.classes.includes("_wild")) {
                    result.classes = result.classes.substring(0, result.classes.length - 5);
                }
                if (!result.classes.includes(" exploded")) {
                    result.classes += " exploded";
                }
            }
            if (result.result == 5 && ignoreFives && result.classes.indexOf(" ignored") < 0) {
                result.classes += " ignored";
                result.success = false;
                result.count = 0;
            }
            addedByExplosion = result.exploded;
        });
    }
    /**
     * Build a formula for a Shadowrun dice roll.
     * Assumes roll will be valid (e.g. you pass a positive count).
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
    getGlitches() {
        if (!this._evaluated || !this.results) {
            return NaN;
        }
        return this.results.filter((die) => die.result === 1).length;
    }
    /**
     * Is this roll a regular (non-critical) glitch?
     */
    isGlitch() {
        if (!this._evaluated || !this.results) {
            return false;
        }
        return this.getGlitches() > this.results.length / 2;
    }
    /**
     * Is this roll a critical glitch?
     */
    isCriticalGlitch() {
        return this.isGlitch() && this._total === 0;
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
        console.log("SR6E | toJSON ", this);
        const json = super.toJSON();
        //console.log("SR6E | toJSON: json=",json);
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
                //TODO possible move some of these things to _prepareChatMessage() // rolLType Soak already moved but kept here to keep old chatMessages working
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

            return renderTemplate(SR6Roll.CHAT_TEMPLATE, this.finished);
        }
        finally {
            console.log("SR6E | LEAVE render");
        }
    }
}