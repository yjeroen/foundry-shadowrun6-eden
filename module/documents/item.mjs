import { SYSTEM_NAME } from "../constants.js";
import * as ItemTypes from "../ItemTypes.js";
import { SpritePowerRoll } from "../dice/RollTypes.js";
import { SR6ConditionMonitorField } from "../datamodels/fields/fields.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class SR6Item extends Item {
  calculated = {}
  static DEFAULT_ICON = "systems/shadowrun6-eden/icons/compendium/gear/tech_bag.svg";

  /**
   * Augment the basic Item data model with additional dynamic data.
   * TODO rework move to prepareBaseData() and prepareDerivedData()
   */
  prepareData() {
    // system addittions must be done before super.prepareData()
    this._addDefaultFireModePenalties();

    this._prepareElectronicMatrixDevice();

    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    this._migrateCleanUp();
    // console.log("SR6E | SR6Item.prepareData() DEBUG", this);

    // Modern DataModel Actors skip legacy data load flow
    if (this.actor?.system instanceof foundry.abstract.DataModel) return;

    // Ugly hack; Need to call _prepareAttributes() or else actors attributes wont be recalculated. This is necessary until a full Document rework
    if (this.actor?.type === "Spirit") {
      this.actor._applySpiritPreset(this.actor.system.rating);
      this.actor._applyForce(this.actor.system.rating);
    }
    this.actor?._prepareAttributes();

  }

  prepareDerivedData() {
    if (this.type === 'spritepower') {
      switch (this.system.skill) {
        case "electronics":
            this.system.skillSpec = "complex_forms";
            break;
        case "cracking":
            this.system.skillSpec = "cybercombat";
            break;
      }
    }
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
    this._updateItemModSheet(changed, options);
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

    await this._updateInstalledItemMods();

    // Forward to type data model
    if ( this.system instanceof foundry.abstract.TypeDataModel ) {
      return await this.system._preDelete(options, user);
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
    if (!this.isOwner || this.type!=="gear") return false;

    const GEAR = CONFIG.SR6.GEAR;
    if ( this.parent && GEAR.SUBTYPES_MATRIX_ACCESS.has(this.system.subtype) ) {
      await this.parent.updatePersona();
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

  /** @inheritDoc */
  static migrateData(source) {
    if (typeof source.system?.stun === 'string') source.system.stun = (source.system.stun === "true");
    if (typeof source.system?.ammocap === 'string') source.system.ammocap = parseInt(source.system.ammocap) || 0;
    if (typeof source.system?.fading === 'string') source.system.fading = parseInt(source.system.fading) || 0;
    if (typeof source.system?.threshold === 'string') source.system.threshold = parseInt(source.system.threshold) || 0;
    if (typeof source.system?.ammocount === 'string') source.system.ammocount = parseInt(source.system.ammocount) || 0;
    if (typeof source.system?.priceDef === 'string') source.system.priceDef = ( isNaN(parseInt(source.system.priceDef)) ? parseInt(source.system.price) : parseInt(source.system.priceDef) );
    if (typeof source.system?.dmg === 'string') source.system.dmg = parseInt(source.system.dmg) || 0;
    if (source.system?.attackRating && typeof source.system?.attackRating[0] === 'string') source.system.attackRating = source.system?.attackRating.map(ar => parseInt(ar));
    if (typeof source.system?.defense === 'string') source.system.defense = parseInt(source.system.defense) || 0;
    if (typeof source.system?.capacity === 'string') source.system.capacity = parseInt(source.system.capacity) || 0;
    if (typeof source.system?.social === 'string') source.system.social = parseInt(source.system.social) || 0;
    if (typeof source.system?.rating === 'string') source.system.rating = parseInt(source.system.rating) || 0;
    if (typeof source.system?.matrix?.deviceRating === 'string') source.system.matrix.deviceRating = parseInt(source.system.matrix.deviceRating) || 0;

    // TODO Currently all Gear items have a matrix.deviceRating; with change to DataModel this should only be for Electronic Matrix Devices
    if (source.type === "gear" && source.system?.devRating !== undefined) {
      source.system.matrix ??= {};
      source.system.matrix.deviceRating = parseInt(source.system.devRating) || 2;
      source.system.devRating = null;
    }

    if (source.type === "gear" && source.system?.isElectronicMatrixDevice) {
      const matrixCmValue = source.system?.matrix?.matrixCM?.value;
      if (matrixCmValue === null || matrixCmValue === undefined) {
        source.system.matrix ??= {};
        source.system.matrix.matrixCM ??= {};
        source.system.matrix.matrixCM.value  = Math.ceil(source.system.matrix.deviceRating / 2) + 8;
      }
    }

    return super.migrateData(source);
  }
  
  _migrateCleanUp() {
    if (this.calculated === undefined) this.calculated = {};
    if (this.system?.ammoLoaded === undefined && this.system?.ammocap) this.system.ammoLoaded = 'regular';
    if (this.system?.ammocap === null || this.system?.ammocap === "") this.system.ammocap = 0;
  }

  /**
   * Preparing the Gear System to be an Electronic Matrix Device
   * Related template data attributes:
   *    this.system.isElectronicMatrixDevice
   *    this.system.matrix.hasWirelessInterface
   *    this.system.matrix.hasDataCableInterface
   *    this.system.matrix.wirelessActive
   *    this.system.matrix.matrixCM.value
   *    this.system.matrix.deviceRating
   * TODO: Should no longer be necessary once Item is properly migrated to DataModel
   */
  _prepareElectronicMatrixDevice() {
    if (this.type !== 'gear') return;
    const GEAR = CONFIG.SR6.GEAR;
    const typeConfig = GEAR[this.system.type];
    if (!typeConfig) return;
    const subtypeConfig = typeConfig.subtypes[this.system.subtype];
    if (!subtypeConfig) return;

    if (this.system.type === "CYBERWARE") {
      this.system.matrix.hasDataCableInterface = true;
    }
    if (
      subtypeConfig.showMatrixDeviceConfig === CONFIG.SR6.MATRIX_DEVICE_CONFIG.ALWAYS
      || this.system.matrix.hasWirelessInterface ===  true
      || this.system.matrix.hasDataCableInterface ===  true
    ) {
      this.system.isElectronicMatrixDevice = true;
    }

    if (!this.system.isElectronicMatrixDevice) return;
    console.log("SR6E | SR6Item | preparing Gear item as an Electronic Matrix Device");
    
    if (
      GEAR.TYPES_WITH_ALWAYS_WIFI.has(this.system.type)
      || GEAR.SUBTYPES_MATRIX_ACCESS.has(this.system.subtype)
    ) {
      this.system.matrix.hasWirelessInterface =  true;
    }

    const deviceRating = Number(this.system.matrix.deviceRating) || 0;
    const sensor = Number(this.system.sen) || 0;
    if (this.system.matrix?.matrixCM?.value === null) {
      this.system.matrix.matrixCM.value = Math.ceil(deviceRating / 2) + 8;
    }
    const matrixCM = foundry.utils.deepClone(this.system.matrix?.matrixCM ?? {});

    if (this.system.type === "VEHICLES" || this.system.type === "DRONES") {
      matrixCM.max = Math.ceil(sensor / 2) + 8;
    } else {
      matrixCM.max = Math.ceil(deviceRating / 2) + 8;
    }

    this.system.matrix.matrixCM = new SR6ConditionMonitorField().initialize(matrixCM);

  }

  get onlineOnMatrix() {
    return this.system.isElectronicMatrixDevice 
            && 
           (
            ( this.system.matrix.hasWirelessInterface && this.system.matrix.wirelessActive )
            ||
            ( this.system.matrix.hasDataCableInterface )
           )
  }

  _addDefaultFireModePenalties() {
    if (this.system.modes === undefined) return;

    // Firing Mode PENALTIES
    this.system.modes.SA_ar_mod = -2;
    // this.system.modes.SA_dmg_mod = 1;
    this.system.modes.BF_ar_mod = -4;
    // this.system.modes.BF_dmg_mod = 2;
    this.system.modes.FA_ar_mod = -6;
    // this.system.modes.FA_dmg_mod = 0;

    // Used for Item Mods like Smartgun System
    this.system.modes.dicePoolMod = 0
  }

  get calculatedAttackRating() {
    if (this.system.attackRating === undefined || !this.actor) return null;

    const attackRating = foundry.utils.deepClone(this.system.attackRating);

    if (this.system.skill === "close_combat" || this.system.skillSpec === "brawling" || this.system.skillSpec === "whips") {
      let closeCombatAttackRatingAttribute = this.actor.system.attributes.str.pool;
      if (this.system.skillSpec === "whips") {
        closeCombatAttackRatingAttribute = this.actor.system.attributes.rea.pool;
      }
      if (game.settings.get(SYSTEM_NAME, "rollStrengthCombat") && this.system.strWeapon === true) {
        closeCombatAttackRatingAttribute = this.actor.system.attributes.agi.pool;
      }
      if (parseInt(this.system.attackRating[0]) === 0 && this.system.skill === "close_combat" && this.system.skillSpec === "unarmed") {
        closeCombatAttackRatingAttribute += this.actor.system.attributes.rea.pool;
      }
      attackRating[0] = parseInt(this.system.attackRating[0]) + parseInt(closeCombatAttackRatingAttribute);
    }

    attackRating.forEach((rating, index) => {
        if (rating === 0) {
          // Setting to -1 to transform to "-" in helper
          attackRating[index] = -1;
        }
        else if (rating > 0) {
            attackRating[index] = Math.max(0, parseInt(rating) + this.ammoLoaded.arMod );
        }
    });

    return attackRating;
  }

  get ammoLoaded() {
    let arMod=0, dmgMod=0, stun=false, ammoLoaded = this.system.ammoLoaded;

    switch (ammoLoaded) {
        case "regular":
            break;
        case "apds":
            arMod = 2;
            dmgMod = -1;
            break;
        case "explosive":
            dmgMod = 1;
            break;
        case "flechette":
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
    return {
      name: ammoLoaded,
      arMod: arMod,
      dmgMod: dmgMod,
      stun: stun
    }
  }

  get calculatedDamage() {
    if (this.system?.dmg === undefined || !this.actor) return null;
    
    let dmg = parseInt(foundry.utils.deepClone(this.system.dmg));

    if (this.system.skill === "close_combat" || this.system.skillSpec === "brawling") {
      if (game.settings.get(SYSTEM_NAME, "highStrengthAddsDamage")) {
        dmg += ( this.actor.system.attributes.str.pool >= 7 ) ? 1 : 0;
        dmg += ( this.actor.system.attributes.str.pool >= 10 ) ? 1 : 0;
      }
    }

    dmg = Math.max(0, dmg + this.ammoLoaded.dmgMod );

    return dmg;
  }

  get calculatedStun() {
    const stun = this.ammoLoaded.stun || this.system.stun;
    return stun;
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
    const type = game.i18n.localize(`TYPES.Item.${this.type}`);
    const label = `[${type}] ${this.name}`;

    // If it's a rollable power
    if (this.type === "spritepower" && this.system.skill) {
      const rollConfig = new SpritePowerRoll(item);
      return this.actor.rollResonanceAbility(rollConfig);
    }
    // If there's no roll data, send a chat message.
    else if (!this.system.formula) {
      this.toChat();
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

  get defaultTestPool() {
    if (!this.system.skill) return undefined;

    if (this.type === "spritepower" || this.type === "complexform") {
      const rollConfig = new SpritePowerRoll(this);
      return this.actor._getSkillPool(rollConfig.skillId, rollConfig.skillSpec, rollConfig.attrib);
    }
  }

  /**
   * Sends the Name and Description of the Item to Chat
   * @returns {boolean}  Success of chat message 
   */
  toChat() {
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const type = game.i18n.localize(`TYPES.Item.${this.type}`);
    const label = `[${type}] ${this.name}`;

    return ChatMessage.create({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label,
      content: this.system.description ?? '',
    });
  }

  /**
   * Enable Active Effects on Item
   */
  prepareEmbeddedDocuments() {
    // console.log("SR6E | SR6Item.prepareEmbeddedDocuments() DEBUG", this.uuid, this.name);
    super.prepareEmbeddedDocuments();
    if ( this.actor && this.actor._embeddedPreparation ) this.applyActiveEffects();
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
      if ( change.key.substring(0,19) === 'system.attackRating'
           && change.mode === CONST.ACTIVE_EFFECT_MODES.ADD 
           && foundry.utils.getProperty(this, change.key) === 0
          ) {
        // Don't allow Gear Mods to upgrade a weapon's AR if its already 0
        continue;
      }
      if ( typeof change.value === "string" && change.value?.startsWith('@actor') && this.actor) {
        const key = change.value.substring(7);
        change.value = foundry.utils.getProperty(this.actor, key);
      }
      if ( typeof change.value === "string" && change.value?.startsWith('@item')) {
        const key = change.value.substring(6);
        change.value = foundry.utils.getProperty(this, key);
      }

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
  *allApplicableEffects(returnAll=false) {
    const effects = this.effects;

    // Lets first apply Active Effects embedded in this item, to this Item
    for ( const effect of this.effects ) {
      // Only use effects that aren't transfered to the Actor
      if ( returnAll || !effect.transfer ) yield effect;
    }
    
    // Then look onthe Actor for any Items that are modded into this one
    if (this.actor) {
      for (const item of this.actor.items) {
        if (item.system.installedIn?.id === this.id) {
          for ( const effect of item.effects ) {
            if ( !effect.transfer ) yield effect;
          }
        }
      }
    }

  }

  /**
   * Retrieve the list of ActiveEffects that are embedded on this Item, or on its Mods
   * @type {ActiveEffect[]}
   */
  get allEffects() {
    const effects = [];
    for ( const effect of this.allApplicableEffects(true) ) {
      effects.push(effect);
    }
    return effects;
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
    return this.actor.items.filter(item => item.system.installedIn?.id === this.id);
  }

  async addItemMod(ModUuid) {
    const mod = this.actor.items.find(item => item.uuid === ModUuid);
    return await mod.update({"system.embeddedInUuid": this.uuid});
  }

  _updateItemModSheet(changed, options) {
    if (options.itemThatWasModded) {
      const itemThatWasModded = this.actor.items.get(options.itemThatWasModded);
      itemThatWasModded.render();
    }
    if (changed.name && this.actor) {
      for (const item of this.actor.items) {
        // Check if there are any items embedded into this one, and if so rerender their open sheet
        if (item.system.installedIn?.id === this.id) {
            item.render();
        }
      }
    }
  }

  async _updateInstalledItemMods() {
    if (this.actor) {
      for (const item of this.actor.items) {
        // Check if there are any items embedded into this one, and if so uninstall them
        if (item.system.installedIn?.id === this.id) {
          await item.update({'system.embeddedInUuid': null});
        }
      }
    }
  }

  get collapsedStateOnSheet() {
    const state = this.getFlag("shadowrun6-eden","collapse-state");
    return state ?? "closed";
  }

  get isPrimaryAccessDevice() {
    if (this.type !== "gear") return false;
    return this.id === this.actor?.system?.persona?.accessDevice?.id;
  }

  get isAccessDevice() {
    if (this.type !== "gear") return false;
    return CONFIG.SR6.GEAR.SUBTYPES_MATRIX_ACCESS.has(this.system.subtype);
  }

  /**
   * 
   * @param {object}   [config]                        Options provided to determine a Matrix Access Level from initiator to this Actor
   * @param {SR6Actor} [config.initiator]              An Actor that wants to check what their ACL it towards this Actor
   * @returns {string} The matrix-access flag for the UUID of the Initiator
   */
  yourMatrixAccessLevel(config={}) {
    const {initiator} = config;
    const safeUuid = initiator.uuid.replaceAll(".", "_");

    if (this.actor.system.pan.isSlaved) {
      // This Item belongs to an Actor that has a Slaved PAN
      if (this.actor.uuid === initiator.uuid) {
        // This Item's Actor is the Initiator
        return "admin"
      }
      if (this.actor.system.pan.administrator.uuid === initiator.uuid) {
        // This Item's Actor has a PanAdmin (due to being slaved), and it is the Initiator
        return "admin"
      }
      if (this.actor.system.pan.administrator.uuid === initiator.system.pan.administrator.uuid) {
        // This Item's Actor has a PanAdmin (due to being slaved), and it is the same PAN that the initiator joined
        return "user"
      }
    } else {
      // This Item belongs to an Actor that is its own Pan Admin
      if (this.actor.uuid === initiator.uuid) {
        // This Item's Actor is the Initiator's
        return "admin"
      }
      if (this.actor.uuid === initiator.system.pan.administrator.uuid) {
        // This Item's Actor is my (the ininitator's) Pan Admin
        return "user"
      }

    }
    
    return this.getFlag("shadowrun6-eden", `matrix-access.${safeUuid}`) ?? "outsider";
  }

}