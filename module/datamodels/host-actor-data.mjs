import SR6BaseActorData from './base-actor-data.mjs';
import * as srFields from "./fields/fields.mjs";
import { InitiativeType } from "../dice/RollTypes.js";

export default class SR6HostActorData extends SR6BaseActorData {
    
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        'SR6.Actor.matrixBase',
        'SR6.Actor.host'
    ];

    /**
     * Default metadata which applies to each instance of this Document type.
     * @type {object}
     */
    static metadata = Object.freeze({
        type: "host"
    });

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),

            rating: new fields.NumberField({required: true, nullable: false, blank: false, integer: true, initial: 4, min: 1, choices: CONFIG.SR6.RATING}),
            type: new fields.StringField({required: false, nullable: true, choices: this.TYPES}),

            resolutionGrade: new fields.NumberField({required: true, nullable: false, integer: true, initial: 3, min: 1, max: 6, choices: CONFIG.SR6.HOSTS.resolutionGrades}),
            scale: new fields.NumberField({required: true, nullable: false, integer: true, initial: 2, min: 1, max: 6, choices: CONFIG.SR6.HOSTS.scales}),
            convergenceThreshold: new fields.NumberField({required: true, nullable: false, integer: true, initial: 40, min: 0}),
            // description is renamed to "Icon Description"
            sculpting: new fields.HTMLField(),
            outsiderAccess: new fields.HTMLField(),
            // notes is renamed to "Security Response"

            matrix: new fields.SchemaField({
                attributes: new fields.SchemaField({
                    attack: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                    sleaze: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                    dataProcessing: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
                    firewall: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
                }),
                // Adding matrixCM here in prepareDerivedData() in case the Token represents an Item ??
            }),
           
            initiative: new fields.SchemaField({
                matrix: new srFields.SR6InitiativeField(),
            }),
        };
    }

    get deployedItem() {
        const uuid = this.parent.token?.getFlag("shadowrun6-eden", 'deployedItemUuid');
        const deployedItem = foundry.utils.fromUuidSync(uuid);
        return deployedItem;
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        this._prepareMatrixInitiative();

        this.parent.name = `//${this.parent._source.name}`;
        if (!this.deployedItem || !this.parent.token) return;
        // Override Actor
        this.parent.name += `//:${this.deployedItem.name}`;
        this.parent.img = this.deployedItem.img;
        this.matrix.matrixCM = this.deployedItem.system.matrix.matrixCM;
        this.matrix.attributes = this.parent.token.baseActor.system.matrix.attributes;
    }

    _prepareMatrixInitiative() {
        this.initiative.default = InitiativeType.MATRIX;
        if (this.deployedItem) {
            this.initiative.matrix.rank = Math.round(this.matrix.dataProcessing * 2);
            this.initiative.matrix.dice = 3;

        } else {
            this.initiative.matrix.rank = 99;
            this.initiative.formula = "@initiative.matrix.rank";
        }

    }


}