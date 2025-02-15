export default class SR6ActiveEffectModel extends foundry.abstract.TypeDataModel {
  
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      level: new fields.NumberField({
              integer: true,
              initial: 1,
              min: 0
      }),
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
    await this.parent.update({
      "system.level": Math.min(maxLevel, this.level + increaseBy)
    });
  }

  async decrease(decreaseBy = 1) {
    if (!this.hasLevels) return;
    const newLevel = Math.max(0, this.level - decreaseBy)
    if (newLevel === 0) {
      await this.parent.delete();
    }
    await this.parent.update({
      "system.level": newLevel
    });
  }

}