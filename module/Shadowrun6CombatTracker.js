import { InitiativeType } from "./dice/RollTypes.js";
export default class Shadowrun6CombatTracker extends CombatTracker {
    get template() {
        if (game.release.generation <= 9) {
            return "systems/shadowrun6-eden/templates/combat-trackerv9.html";
        }
        else {
            return "systems/shadowrun6-eden/templates/combat-tracker.html";
        }
    }
    async getData(options) {
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
    /**
     * Test if any of the extra initiatve buttons from the extended tracker
     * has been clicked. If not, process with default behaviour.
     */
    _onCombatantControl(event) {
        console.log("SR6E | ---------SR6CombatTracker._onCombatantControl", event);
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
        console.log("SR6E | ---------SR6CombatTracker._onChangeInitiativeType  change from " + combatant.initiativeType + " to " + value);
        combatant.setFlag("shadowrun6-eden", "iniType", value);
    }
}