import SR6BaseActorData from './base-actor-model.mjs';

export default class SR6SpriteActorData extends SR6BaseActorData {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'SR6.Actor.Sprite',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };

    return {
      ...super.defineSchema(),
      foo: fields.StringField()
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    
  }

}