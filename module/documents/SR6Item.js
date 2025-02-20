import { SYSTEM_NAME } from "../constants.js";
import * as ItemTypes from "../ItemTypes.js";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class SR6Item extends Item {
  calculated = {}
  static DEFAULT_ICON = "systems/shadowrun6-eden/icons/compendium/gear/tech_bag.svg";

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    this._migrateCleanUp();
    
    // Ugly hack; Need to call _prepareAttributes() or else actors attributes wont be recalculated. This is necessary until a full Document rework
    this.actor?._prepareAttributes();
    this.calcAttackRating();
    this.calcDamage();
  }

  _migrateCleanUp() {
    if (this.calculated === undefined) this.calculated = {};      
  }

  calcAttackRating() {
    if (this.system.attackRating === undefined) return;

    this.calculated.attackRating = foundry.utils.deepClone(this.system.attackRating);
    if (this.system.skill === "close_combat" || this.system.skillSpec === "brawling" || this.system.skillSpec === "whips") {
      let closeCombatAttackRatingAttribute = this.actor.system.attributes.str.pool;
      if (this.system.skillSpec === "whips") {
        closeCombatAttackRatingAttribute = this.actor.system.attributes.rea.pool;
      }
      if (game.settings.get(SYSTEM_NAME, "rollStrengthCombat") && this.system.strWeapon === true) {
        closeCombatAttackRatingAttribute = this.actor.system.attributes.agi.pool;
      }
      this.calculated.attackRating[0] = parseInt(this.calculated.attackRating[0]) + closeCombatAttackRatingAttribute;
    }
  }

  calcDamage() {
    if (this.system?.dmg === undefined) return;

    this.calculated.dmg = parseInt(foundry.utils.deepClone(this.system.dmg));
    if (this.system.skill === "close_combat" || this.system.skillSpec === "brawling") {
      if (game.settings.get(SYSTEM_NAME, "highStrengthAddsDamage")) {
        this.calculated.dmg += ( this.actor.system.attributes.str.pool >= 7 ) ? 1 : 0;
        this.calculated.dmg += ( this.actor.system.attributes.str.pool >= 10 ) ? 1 : 0;
      }
    }
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const rollData = { ...this.system };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll(event) {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData.actor);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}