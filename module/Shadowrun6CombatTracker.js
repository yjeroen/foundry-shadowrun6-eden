import { InitiativeType } from "./dice/RollTypes.js";
export default class Shadowrun6CombatTracker extends CombatTracker {

    /** Foundry V13 */
    get template() {
        if (game.release.generation <= 9) {
            return "systems/shadowrun6-eden/templates/sidebar/combat-tracker-v9.html";
        }
        else if (game.release.generation <= 12) {
            return "systems/shadowrun6-eden/templates/sidebar/combat-tracker-v12.html";
        }
    }
    /** Foundry V13 */
    static PARTS = {
        header: {
            template: "templates/sidebar/tabs/combat/header.hbs"
        },
        tracker: {
            template: "systems/shadowrun6-eden/templates/sidebar/combat-tracker.hbs"
        },
        footer: {
            template: "templates/sidebar/tabs/combat/footer.hbs"
        }
    };
    static DEFAULT_OPTIONS = {
        actions: {
            togglePhysical: Shadowrun6CombatTracker.#onShadowrunControls,
            toggleMatrix: Shadowrun6CombatTracker.#onShadowrunControls,
            toggleAstral: Shadowrun6CombatTracker.#onShadowrunControls
        }
    };

    /**
     * Handle performing some action for an individual combatant.
     * @this {Shadowrun6CombatTracker}
     * @param {event} event
     * @param {target} target
     */
    static #onShadowrunControls(event, target) {
        console.log("SR6E | SR6CombatTracker.#onShadowrunControls", event, target);
        const { combatantId } = target.closest("[data-combatant-id]")?.dataset ?? {};
        const combatant = this.viewed?.combatants.get(combatantId);
        if ( !combatant ) return;

        switch ( target.dataset.action ) {
            case "togglePhysical": return this._onChangeInitiativeType(combatant, InitiativeType.PHYSICAL);
            case "toggleMatrix": return this._onChangeInitiativeType(combatant, InitiativeType.MATRIX);
            case "toggleAstral": return this._onChangeInitiativeType(combatant, InitiativeType.ASTRAL);
        }
    }

    /** Foundry V12 */
    async getData(options) {
        console.log("SR6E | SR6CombatTracker.getData");
        let data = await super.getData(options);
        if (data != undefined) {
            data.combats.forEach(function (combat) {
                if (combat.active) {
                    combat.turns.forEach(function (combatant) {
                        let iniType = combatant.getFlag("shadowrun6-eden", "iniType");
                        data.turns.forEach(function (activeTrackerCombatant) {
                            if (combatant.id === activeTrackerCombatant.id) {
                                activeTrackerCombatant.isPhysical = iniType == InitiativeType.PHYSICAL;
                                activeTrackerCombatant.isMatrix = iniType == InitiativeType.MATRIX;
                                activeTrackerCombatant.isAstral = iniType == InitiativeType.ASTRAL;
                            }
                        });
                    });
                }
            });
        }
        return data;
    }
    /** Foundry V13 */
    async _prepareTurnContext(combat, combatant, index) {
        const turn = await super._prepareTurnContext(combat, combatant, index);
        // console.log("SR6E | SR6CombatTracker._prepareTurnContext", combatant, turn);
        
        const iniType = combatant.getFlag("shadowrun6-eden", "iniType");
        turn.isPhysical = iniType == InitiativeType.PHYSICAL;
        turn.isMatrix = iniType == InitiativeType.MATRIX;
        turn.isAstral = iniType == InitiativeType.ASTRAL;

        return turn;
    }

    /**
     * Test if any of the extra initiatve buttons from the extended tracker
     * has been clicked. If not, process with default behaviour.
     */
    _onCombatantControl(event, target) {
        console.log("SR6E | SR6CombatTracker._onCombatantControl", event, target);
        if (game.release.generation <= 12) {
            return this._onCombatantControl_V12(event);
        }

        return super._onCombatantControl(event, target);
    }

    _onCombatantControl_V12(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const li = btn.closest(".combatant");
        const combat = this.viewed;
        const c = combat.combatants.get(li.dataset.combatantId);
        // Switch control action
        switch (btn.dataset.control) {
            case "togglePhysical":
                return this._onChangeInitiativeType(c, InitiativeType.PHYSICAL);
            case "toggleMatrix":
                return this._onChangeInitiativeType(c, InitiativeType.MATRIX);
            case "toggleAstral":
                return this._onChangeInitiativeType(c, InitiativeType.ASTRAL);
        }
        return super._onCombatantControl(event);
    }

    async _onChangeInitiativeType(combatant, value) {
        console.log("SR6E | SR6CombatTracker._onChangeInitiativeType change from " + combatant.initiativeType + " to " + value);
        await combatant.setFlag("shadowrun6-eden", "iniType", value);
    }
}