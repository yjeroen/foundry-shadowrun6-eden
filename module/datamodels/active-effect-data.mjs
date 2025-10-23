export default class SR6ActiveEffectData extends foundry.abstract.TypeDataModel {
  
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      level: new fields.NumberField({
              integer: true,
              initial: 1,
              min: 0
      }),
      advanced: new fields.BooleanField()
    }
  }

  async _preCreate(data, options, user) {
    console.log(`SR6E | SR6ActiveEffectData | _preCreate`);
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
    console.log(`SR6E | Increasing statusEffect ${this.parent.name} by`, increaseBy, this);
    const newLevel = this.level + increaseBy;
    await this._checkBlinded(newLevel);
    await this.parent.update({
      "system.level": Math.min(maxLevel, newLevel)
    });
  }

  async decrease(decreaseBy = 1) {
    if (!this.hasLevels) return;
    console.log(`SR6E | Decreasing statusEffect ${this.name} by`, decreaseBy);
    const newLevel = Math.max(0, this.level - decreaseBy)
    await this._checkBlinded(newLevel);
    if (newLevel === 0) {
      await this.parent.delete();
    }
    await this.parent.update({
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
    if ( !this.parent.origin ) return game.i18n.localize("None");
    let name;
    const fallbackName = this.parent?.parent?.name ?? game.i18n.localize("Unknown");
    const parentType = this.parent?.parent?.constructor.name;
    try {
      name = parentType === 'SR6Item' ? false : fromUuidSync(this.parent.origin)?.name;
    } catch(e) {}
    return name || fallbackName;
  }

}