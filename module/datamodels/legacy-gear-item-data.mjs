import SR6BaseItemData from './base-item-data.mjs';
import * as srFields from "./fields/fields.mjs";

export default class SR6LegacyGearItemData extends SR6BaseItemData {
    
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            // "modifier": 0,
            // "wild"    : false,
            // "pool"    : 0

            // "type": "WEAPON_FIREARMS",   // Already included in mod-item-data.mjs
			// "subtype": "",
			// "count":  0,
			// "countable": false,
			// "ammocap": 0,
			// "ammocount": 0,
			// "ammoLoaded": "regular",
			// "customName": "",
			// "usedForPool": false,
			// "notes": "",
			// "accessories": "",
			// "needsRating": false,
			// "rating": 0,
			// "skill": "",
			// "skillSpec": "",
			// "dmg": 0,
			// "stun": false,
			// "dmgDef": "",
			// "attackRating": [0,0,0,0,0],
			// "modes": {
			// 	"BF": false,
			// 	"FA": false,
			// 	"SA": false,
			// 	"SS": false
			// },
			// "defense": 0,
			// "social": 0,
			// "essence": 0,
			// "capacity": 0,
			// "natural" : false,
			// "devRating": 0,
			// "a": 0,
			// "s": 0,
			// "d": 0,
			// "f": 0,
			// "progSlots": 0,
			// "handlOn": 0,
			// "handlOff": 0,
			// "accOn": 0,
			// "accOff": 0,
			// "spdiOn": 0,
			// "spdiOff": 0,
			// "tspd": 0,
			// "bod": 0,
			// "arm": 0,
			// "pil": 0,
			// "sen": 0,
			// "sea": 0,
			// "vtype": "",
			// "vehicle": {
			// 	"opMode": "manual"
			// },
			// "strWeapon": false,
			// "dualHand": false,

                // {
                // "name": "Dragonfly-alpha four-barrel",
                // "type": "gear",
                // "data": {
                //     "genesisID": "ammo_shotgun",
                //     "type": "AMMUNITION",
                //     "subtype": "AMMUNITION",
                //     "availDef": "2 (L)",
                //     "avail": 2,
                //     "price": 22,
                //     "needsRating": false,
                //     "rating": 0,
                //     "wild": false,
                //     "customName": "Dragonfly-alpha four-barrel",
                //     "notes": "These endodonts attach",
                //     "countable": true,
                //     "count": 1
                // },
                // "effects": []
                // },

            // {
            //     "name": "Mortimer o.L. Greatcoats",
            //     "type": "gear",
            //     "data": {
            //         "defense": 4,
            //         "social": 4,
            //         "genesisID": "mortimer_greatcoats",
            //         "type": "ARMOR",
            //         "subtype": "ARMOR_SOCIAL",
            //         "availDef": "5",
            //         "avail": 5,
            //         "price": 4000,
            //         "accessories": "Water-Repellent Coating, Electrochromic Feature, Electricity Resistance, Rating 2, Fire Resistance, Rating 3, Programmable Camouflage Package",
            //         "needsRating": false,
            //         "rating": 0,
            //         "wild": false,
            //         "countable": false,
            //         "count": 0
            //     },
            //     "effects": []
            //     },

            // type: new fields.StringField({required: false, nullable: true, choices: this.TYPES}),
            // rating: new fields.NumberField({required: true, nullable: false, blank: false, integer: true, initial: 1, min: 1, choices: CONFIG.SR6.RATING}),
            // tasksOwned: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 1}),
            // compiledBy: new fields.DocumentUUIDField({type: "Actor"}),
            // registered: new fields.BooleanField(),
            // matrix: new srFields.SR6MatrixFields(),
            // attributes: new fields.SchemaField({
            //     willpower: new srFields.SR6AttributeFields(),
            //     logic: new srFields.SR6AttributeFields(),
            //     intuition: new srFields.SR6AttributeFields(),
            //     charisma: new srFields.SR6AttributeFields(),
            //     resonance: new srFields.SR6AttributeFields(),
            // }),
            // skills: new fields.SchemaField({
            //     electronics: new srFields.SR6SkillFields(),
            //     engineering: new srFields.SR6SkillFields(),
            //     cracking: new srFields.SR6SkillFields(),
            //     con: new srFields.SR6SkillFields()
            // })
        };
    }

}