import { InitiativeType } from "./dice/RollTypes.js";
export default class Shadowrun6Combatant extends Combatant {
    edgeGained = 0;

    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);
        console.log("SR6E | Shadowrun6Combatant.preCreate");
      
        return this.updateSource({ 'flags.shadowrun6-eden.iniType': this.actor?.system?.initiative?.default ?? InitiativeType.PHYSICAL });
      }

    get initiativeType() {
        return this.getFlag("shadowrun6-eden", "iniType");
    }
    _getInitiativeFormula() {
        console.log("SR6E | Shadowrun6Combatant._getInitiativeFormula: ", this.initiativeType);
        switch (this.initiativeType) {
            case InitiativeType.PHYSICAL: return "@initiative.physical.pool + (@initiative.physical.dicePool)d6";
            case InitiativeType.ASTRAL: return "@initiative.astral.pool + (@initiative.astral.dicePool)d6";
            case InitiativeType.MATRIX: return "@initiative.matrix.pool + (@initiative.matrix.dicePool)d6";
            default:
                return super._getInitiativeFormula();
        }
    }
    rollInitiative(formula) {
        console.log("SR6E | Shadowrun6Combatant.rollInitiative: ", formula);
        return super.rollInitiative(formula);
    }
    getInitiativeRoll(formula) {
        console.log("SR6E | Shadowrun6Combatant.getInitiativeRoll: ", formula);
        return super.getInitiativeRoll(formula);
    }
}