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
    // system addittions must be done before super.prepareData()
    this._addDefaultFireModePenalties();

    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    this._migrateCleanUp();

    // Ugly hack; Need to call _prepareAttributes() or else actors attributes wont be recalculated. This is necessary until a full Document rework
    if (this.actor?.type === "Spirit") {
      this.actor._applySpiritPreset(this.actor.system.rating);
      this.actor._applyForce(this.actor.system.rating);
    }
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
    console.log("SR6E | SR6Item._preUpdate()", changes);
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
    console.log("SR6E | SR6Item._onUpdate()", changed);
    this._checkPersonaChanges(changed);
    this._informInCombatChanges(changed);
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
    console.log("SR6E | SR6Item._checkPersonaChanges()");
    if (this.type == "gear" && (this.system.type == "ELECTRONICS" || this.system.type == "CYBERWARE")) {
      if (changed.delete === true || changed.system?.usedForPool !== undefined) {
        await this.parent.updatePersona();
      }
    }
  }

  async _informInCombatChanges (changed) {
    if (game.combats.active === undefined) return;
    console.log("SR6E | SR6Item._informInCombatChanges()");
    let msg = "";

    if (changed.system?.ammocount !== undefined && changed.system?.ammocount === this.system.ammocap) {
      msg = game.i18n.format("shadowrun6.ui.notifications.character_has_reloaded", { character: this.actor.name, weaponName: this.name, ammoType: game.i18n.localize("shadowrun6.ammotypes."+this.system.ammoLoaded) });
    }
    if (changed.system?.ammoLoaded !== undefined) {
      msg = game.i18n.format("shadowrun6.ui.notifications.character_has_switched_ammo", { character: this.actor.name, weaponName: this.name, ammoType: game.i18n.localize("shadowrun6.ammotypes."+this.system.ammoLoaded) });
    }
    
    if (msg.length > 0) {
      await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: game.i18n.localize("shadowrun6.weapon.ammo_changes_combat"),
          content: `<span style="font-style: italic;">${msg}</span>`
      });
    }
  }
  
  _migrateCleanUp() {
    if (this.calculated === undefined) this.calculated = {};
    if (this.system.ammoLoaded === undefined && this.system.ammocap) this.system.ammoLoaded = 'regular';
    if (typeof this.system.ammocap === 'string') this.system.ammocap = parseInt(this.system.ammocap);
    if (typeof this.system.ammocount === 'string') this.system.ammocount = parseInt(this.system.ammocount);
  }

  _addDefaultFireModePenalties() {
    if (this.system.modes === undefined) return;

    this.system.modes.SA_ar_mod = -2;
    // this.system.modes.SA_dmg_mod = 1;
    this.system.modes.BF_ar_mod = -4;
    // this.system.modes.BF_dmg_mod = 2;
    this.system.modes.FA_ar_mod = -6;
    // this.system.modes.FA_dmg_mod = 0;
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
      this.calculated.attackRating[0] = parseInt(this.calculated.attackRating[0]) + parseInt(closeCombatAttackRatingAttribute);
    }
  }

  calcDamage() {
    if (this.system?.dmg === undefined || this.system?.dmg === 0) return;

    this.calculated.dmg = parseInt(foundry.utils.deepClone(this.system.dmg));
    if (this.system.skill === "close_combat" || this.system.skillSpec === "brawling") {
      if (game.settings.get(SYSTEM_NAME, "highStrengthAddsDamage")) {
        this.calculated.dmg += ( this.actor.system.attributes.str.pool >= 7 ) ? 1 : 0;
        this.calculated.dmg += ( this.actor.system.attributes.str.pool >= 10 ) ? 1 : 0;
      }
    }
  }

  calcAmmo() {
    if (this.calculated?.attackRating === undefined || this.system.ammocap === undefined) return;

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
            this.calculated.attackRating[index] = Math.max(0, parseInt(rating) + parseInt(arMod) );
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

  /**
   * Enable Active Effects on Item
   */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    if ( this.actor && this.actor?._embeddedPreparation ) this.applyActiveEffects();
  }

  /**
   * An object that tracks which tracks the changes to the data model which were applied by active effects
   * @type {object}
   */
  overrides = this.overrides ?? {};

  /**
   * Apply any transformations to the Item data which are caused by ActiveEffects.
   */
  applyActiveEffects() {
    const overrides = {};

    // Organize non-disabled effects by their application priority
    const changes = [];
    for ( const effect of this.allApplicableEffects() ) {
      if ( !effect.active ) continue;
      changes.push(...effect.changes.map(change => {
        const c = foundry.utils.deepClone(change);
        c.effect = effect;
        c.priority = c.priority ?? (c.mode * 10);
        return c;
      }));
      for ( const statusId of effect.statuses ) this.statuses.add(statusId);
    }
    changes.sort((a, b) => a.priority - b.priority);

    // Temporarily change attackRating []  --- TODO: rework attackRating into an object completely
    this.#attackRatingToObject();

    // Apply all changes
    for ( let change of changes ) {
      if ( !change.key ) continue;
      const changes = change.effect.apply(this, change);
      Object.assign(overrides, changes);
    }

    // Change attackRating back to []
    this.#attackRatingToArray();

    // Expand the set of final overrides
    this.overrides = foundry.utils.expandObject(overrides);
  }

  /**
   * Get all ActiveEffects that may apply to this Item.
   * @yields {ActiveEffect}
   * @returns {Generator<ActiveEffect, void, void>}
   */
  *allApplicableEffects() {
    for ( const effect of this.effects ) {
      // Only use effects that aren't transfered to the Actor
      if ( !effect.transfer ) yield effect;
    }
  }
  
  #attackRatingToObject() {
    if (this.system.attackRating === undefined) return;

    const arObj = {...this.system.attackRating};
    this.system.attackRating = arObj;
  }
  #attackRatingToArray() {
    if (this.system.attackRating === undefined) return;

    const arArray = Object.values(this.system.attackRating);
    this.system.attackRating = arArray;
  }

  /**
   * ITEM MODS
   */

  get itemMods() {
    const itemMods = [];
    if (!this.actor) return itemMods;
    return this.actor.items.filter(item => item.system.embeddedInUuid === this.uuid);
  }

  async addItemMod(ModUuid) {
    const mod = this.actor.items.find(item => item.uuid === ModUuid);
    return await mod.update({"system.embeddedInUuid": this.uuid});
  }

}