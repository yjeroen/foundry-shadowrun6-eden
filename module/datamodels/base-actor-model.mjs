/**
 * Base Actor DataModel for SR6e
 * 
 * @extends {TypeDataModel}
 * @extends {DataModel}
 * @example notes:
 * this.parent is the Actor document
 */
export default class SR6BaseActorData extends foundry.abstract.TypeDataModel {

  static LOCALIZATION_PREFIXES = ["SR6.Actor.base"];

  static defineSchema() {
    const fields = foundry.data.fields;
    
    // schema.initiative? //HOSTS have 99

    // const requiredInteger = { required: true, nullable: false, integer: true };
    // schema.health = new fields.SchemaField({
    //   value: new fields.NumberField({
    //                ...requiredInteger,
    //                initial: 10,
    //                min: 0,
    //   }),
    //   max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
    // });
    // schema.power = new fields.SchemaField({
    //   value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
    //   max: new fields.NumberField({ ...requiredInteger, initial: 5 }),
    // });

    return {
      description: new fields.HTMLField(),
      notes: new fields.HTMLField()
    }
  }

  /**
   * Prepare data related to this DataModel itself, before any derived data is computed.
   *
   * Called before {@link ClientDocument#prepareBaseData} in {@link ClientDocument#prepareData}.
   */
  prepareBaseData() {
    super.prepareDerivedData();

    // prepare system base data

  }
  
  /**
   * Apply transformations of derivations to the values of the source data object.
   * Compute data fields whose values are not stored to the database.
   *
   * Called before {@link ClientDocument#prepareDerivedData} in {@link ClientDocument#prepareData}.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // prepare system derived data

    // > Example:
    // Make sure HP cannot exceed its maximum, even by Active Efffects.
    // this.health.value = Math.min(this.health.value, this.health.max);

  }

  /**
   * Migrate candidate source data for this DataModel which may require initial cleaning or transformations.
   * The source parameter is either original data retrieved from disk or provided by an update operation.
   * @param {object} source           The candidate source data from which the model will be constructed
   * @returns {object}                Migrated source data, if necessary
   */
  static migrateData(source) {
    // >> Example:
    // const proficiencies = source.proficiencies ?? {};
    // if ( "weapons" in proficiencies ) {
    //   proficiencies.weapons = proficiencies.weapons.map(weapon => {
    //     return weapon === "bmr" ? "boomerang" : weapon;
    //   });
    // }

    return super.migrateData(source);
  }
  
  // >> Example getter
  /**
   * Determine whether the character is dead.
   * Can be called via actor.system.dead
   * @type {boolean}
   */
  // get dead() {
  //   const invulnerable = CONFIG.specialStatusEffects.INVULNERABLE;
  //   if ( this.parent.statuses.has("invulnerable") ) return false;
  //   return this.health.value <= this.health.min;
  // }

}