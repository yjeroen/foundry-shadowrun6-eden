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
    this.calcAmmo();
  }

  /**
   * Pre-process an update operation for a single Document instance. Pre-operation events only occur for the client
   * which requested the operation.
   *
   * @param {object} changes            The candidate changes to the Document
   * @param {object} options            Additional options which modify the update request
   * @param {documents.BaseUser} user   The User requesting the document update
   * @returns {Promise<boolean|void>}   A return value of false indicates the update operation should be cancelled.
   * @internal
   */
  async _preUpdate(changes, options, user) {
    const allowed = await super._preUpdate(changes, options, user);
    console.log("SR6E | SR6Item._preUpdate()");
    if ( allowed === false ) return false;

    // Forward to type data model
    if ( this.system instanceof foundry.abstract.TypeDataModel ) {
      return this.system._preUpdate(changes, options, user);
    }

  }
  /**
   * Post-process an update operation for a single Document instance. Post-operation events occur for all connected
   * clients.
   *
   * @param {object} changed            The differential data that was changed relative to the documents prior values
   * @param {object} options            Additional options which modify the update request
   * @param {string} userId             The id of the User requesting the document update
   * @internal
   */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    console.log("SR6E | SR6Item._onUpdate()");
    this._checkPersonaChanges(changed);
  }

 /**
   * Pre-process a deletion operation for a single Document instance. Pre-operation events only occur for the client
   * which requested the operation.
   *
   * @param {object} options            Additional options which modify the deletion request
   * @param {documents.BaseUser} user   The User requesting the document deletion
   * @returns {Promise<boolean|void>}   A return value of false indicates the deletion operation should be cancelled.
   * @internal
   */
  async _preDelete(options, user) {
    const allowed = await super._preDelete(options, user);
    console.log("SR6E | SR6Item._preDelete()");
    if ( allowed === false ) return false;

    // Forward to type data model
    if ( this.system instanceof foundry.abstract.TypeDataModel ) {
      return this.system._preDelete(options, user);
    }
  }

  /**
   * Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected
   * clients.
   *
   * @param {object} options            Additional options which modify the deletion request
   * @param {string} userId             The id of the User requesting the document update
   * @internal
   */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    console.log("SR6E | SR6Item._onDelete()");
    this._checkPersonaChanges({delete: true});
  }

  async _checkPersonaChanges(changed) {
    console.log("SR6E | SR6Item._checkPersonaChanges()", changed);
    if (this.type == "gear" && (this.system.type == "ELECTRONICS" || this.system.type == "CYBERWARE")) {
      if (changed.delete === true || changed.system?.usedForPool !== undefined) {
        await this.parent.updatePersona();
      }
    }
  }
  
  _migrateCleanUp() {
    if (this.calculated === undefined) this.calculated = {};
    if (this.system.ammoLoaded === undefined) this.system.ammoLoaded = 'regular';
    if (typeof this.system.ammocap === 'string') this.system.ammocap = parseInt(this.system.ammocap);
    if (typeof this.system.ammocount === 'string') this.system.ammocount = parseInt(this.system.ammocount);
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

  calcAmmo() {
    if (this.calculated?.attackRating === undefined) return;

    console.log("SR6E | SR6Item | calcAmmo");
    let arMod=0, dmgMod=0, stun=this.system.stun, ammoLoaded = this.system.ammoLoaded;

    switch (ammoLoaded) {
        case "regular":
            break;
        case "apds":
            stun = false;
            arMod = 2;
            dmgMod = -1;
            break;
        case "explosive":
            stun = false;
            dmgMod = 1;
            break;
        case "flechette":
            stun = false;
            arMod = 1;
            dmgMod = -1;
            break;
        case "gel":
            stun = true;
            break;
        case "sticknshock":
            stun = true;
            arMod = 1;
            dmgMod = -1;
            break;
    }

    // Calculate item attack rating
    this.calculated.attackRating.forEach((rating, index) => {
        if (rating > 0) {
            this.calculated.attackRating[index] = Math.max(0, rating + arMod );
        }
    });

    this.calculated.dmg = Math.max(0, this.calculated.dmg + dmgMod );
    this.calculated.stun = stun;
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