export default class SR6ActiveEffectData extends foundry.abstract.TypeDataModel {
  
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      level: new fields.NumberField({
              integer: true,
              initial: 1,
              min: 0
      }),
      advanced: new fields.BooleanField(),
      importedSource: new fields.StringField({required: false, nullable: true}),
    }
  }

  async _preCreate(data, options, user) {
    console.log(`SR6E | SR6ActiveEffectData | _preCreate`);
    this.parent.updateSource({ img: "systems/shadowrun6-eden/icons/compendium/cyberware/memory_chip.svg" });

    const origin = await fromUuidSync(data.origin);
    if (origin?.type === "mod") {
      return this.parent.updateSource({ 'transfer': false });
    }
  }

  get hasLevels() {
    const [mainStatus] = this.parent.statuses;
    const statusEffect = CONFIG.statusEffects.find(e => e.id === mainStatus);
    if (statusEffect !== undefined) {
      if (statusEffect?.hasLevels === true)
        return true;
    }
    return false;
  }
  
  get maxLevel() {
    const [mainStatus] = this.parent.statuses;
    const statusEffect = CONFIG.statusEffects.find(e => e.id === mainStatus);
    if (statusEffect !== undefined) {
      return statusEffect.maxLevel;
    }
    return 1;
  }

  async increase(increaseBy = 1) {
    const maxLevel = this.maxLevel ?? 99;
    if (!this.hasLevels || this.level === maxLevel) return;
    console.log(`SR6E | Increasing statusEffect ${this.parent.name} by`, increaseBy);
    const newLevel = this.level + increaseBy;
    const name = game.i18n.localize( CONFIG.statusEffects.find(e => e._id === this.parent._id).name );
    await this._checkBlinded(newLevel);
    await this.parent.update({
      "name": `${name} (${newLevel})`,
      "system.level": Math.min(maxLevel, newLevel)
    });
  }

  async decrease(decreaseBy = 1) {
    if (!this.hasLevels) return;
    console.log(`SR6E | Decreasing statusEffect ${this.parent.name} by`, decreaseBy);
    const newLevel = Math.max(0, this.level - decreaseBy);
    const name = game.i18n.localize( CONFIG.statusEffects.find(e => e._id === this.parent._id).name );
    await this._checkBlinded(newLevel);
    if (newLevel === 0) {
      await this.parent.delete();
    }
    await this.parent.update({
      "name": `${name} (${newLevel})`,
      "system.level": newLevel
    });
  }

  async _checkBlinded(newLevel) {
    if(this.parent.id === game.sr6.utils.staticId('blinding')) {
      if(newLevel === this.maxLevel){
        await this.parent.target.toggleStatusEffect('blind', {active:true});
      } else {
        await this.parent.target.toggleStatusEffect('blind', {active:false});
      }
    }
  }

  /**
   * ActiveEffect.sourceName doesn't have a fallback for Imported/Exported characters
   * So adding ActiveEffect.system.sourceName
   */
  get sourceName() {
    if ( this.importedSource ) return this.importedSource;
    if ( !this.parent.origin ) return game.i18n.localize("None");
    let name;
    const fallbackName = this.parent?.parent?.name ?? game.i18n.localize("Unknown");
    const parentType = this.parent?.parent?.constructor.name;
    try {
      name = parentType === 'SR6Item' ? false : fromUuidSync(this.parent.origin)?.name;
    } catch(e) {}
    return name || fallbackName;
  }

  /**
   * Called by  {@link ClientDocument#_preCreate}.
   * Modifications to the pending Document instance must be performed using {@link updateSource}.
   * Migrate ActorV1 Attribute keys to ActorV2 keys
   * TODO: Remove once all Actors are migrated to DataModel
   *
   * @param {object} data                         The initial data object provided to the document creation request
   * @param {object} options                      Additional options which modify the creation request
   * @param {documents.BaseUser} user             The User requesting the document creation
   * @returns {Promise<boolean|void>}             Return false to exclude this Document from the creation operation
   * @internal
   */
  async _preCreate(data, options, user) {
    const converted = this.#migrateV1keysToV2(data);
    if (converted) this.parent.updateSource(data);
  }

  /**
   * Called by {@link ClientDocument#_preUpdate}.
   * Migrate ActorV1 Attribute keys to ActorV2 keys
   * TODO: Remove once all Actors are migrated to DataModel
   *
   * @param {object} changes            The candidate changes to the Document
   * @param {object} options            Additional options which modify the update request
   * @param {documents.BaseUser} user   The User requesting the document update
   * @returns {Promise<boolean|void>}   A return value of false indicates the update operation should be cancelled.
   * @protected
   * @internal
   */
  async _preUpdate(changes, options, user) {
    this.#migrateV1keysToV2(changes);
  }

  async #migrateV1keysToV2(data) {
    const actor = [this.parent?.parent, this.parent?.parent?.parent]
                  .find((candidate) => candidate instanceof game.sr6.documents.Shadowrun6Actor);

    if (actor.system instanceof foundry.abstract.DataModel) {
      let converted = false;

      for (const change of data.changes ?? []) {
        const newKey = CONFIG.SR6.EFFECT_CONVERSION_TOV2[change.key];
        if (!newKey) continue;
        change.key = newKey;
        converted = true;
      }

      if (converted) {
        console.log("SR6E | SR6ActiveEffectData | Migrating Actor V1 keys to V2", data);
        ui.notifications.info("shadowrun6.ui.notifications.effect_migration_to_v2", { localize: true });
        foundry.utils.mergeObject(data, {
          system: {
            advanced: true
          }
        });
        return true;
      }
      
    }
  }

}