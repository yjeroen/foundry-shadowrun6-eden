import SR6BaseActorData from './base-actor-model.mjs';

export default class SR6SpriteActorData extends SR6BaseActorData {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'SR6.Actor.Sprite',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // schema.cr = new fields.NumberField({
    //   ...requiredInteger,
    //   initial: 1,
    //   min: 0,
    // });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    
  }

}