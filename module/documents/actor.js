import { Attribute, Derived, DefensePool, Pool, Ratings, Monitor, CurrentVehicle, Initiative, VehicleOpMode, VehicleSkills, VehicleSkill } from "../ActorTypes.js";
import { SYSTEM_NAME } from "../constants.js";
import { Defense, MonitorType } from "../config.js";
import { DevicePersona, LivingPersona, MatrixDevice, Persona } from "../ItemTypes.js";
//import { doRoll } from "./dice/CommonRoll.js";
import { doRoll } from "../Rolls.js";
import { RollType, DefenseRoll, SoakType, SoakRoll, TokenData } from "../dice/RollTypes.js";
import { getActor } from "../util/helper.js";
function isLifeform(obj) {
    return obj.attributes != undefined;
}
function isSpiritOrSprite(obj) {
    return obj.rating != undefined;
}
function isMatrixUser(obj) {
    return obj.persona != undefined;
}
function isPlayer(obj) {
    return obj.karma != undefined;
}
function isGear(obj) {
    return obj.skill != undefined;
}
function isVehicle(obj) {
    return obj.skill != undefined && (obj.type === "VEHICLES" || obj.type === "DRONES");
}
function isSpell(obj) {
    return obj.category != undefined;
}
function isWeapon(obj) {
    return ((obj.type === "WEAPON_FIREARMS" || obj.type === "WEAPON_CLOSE_COMBAT" || obj.type === "WEAPON_RANGED" || obj.type === "WEAPON_SPECIAL") &&
        obj.dmg != undefined);
}
function isArmor(obj) {
    return obj.defense != undefined;
}
function isComplexForm(obj) {
    return obj.fading != undefined;
}
function isMatrixDevice(obj) {
    return obj.d != undefined && (obj.type == "ELECTRONICS" || obj.type == 'CYBERWARE');
}
function getSystemData(obj) {
    if (game.release.generation >= 10)
        return obj.system;
    return obj.data.data;
}
function getActorData(obj) {
    if (game.release.generation >= 10)
        return obj;
    return obj.data;
}
function getItemData(obj) {
    if (game.release.generation >= 10)
        return obj;
    return obj.data;
}
export default class Shadowrun6Actor extends Actor {
    static LOCALIZATION_PREFIXES = ["SR6.Common"];

    /** 
     * Set default artwork for newly created Actors
     */
    static getDefaultArtwork(actorData) {
        const src = {
            Player: "systems/shadowrun6-eden/icons/compendium/default/Default_Clothing.svg",
            NPC: "systems/shadowrun6-eden/icons/compendium/status/human_shield.svg",
            Critter: "systems/shadowrun6-eden/icons/compendium/cyberweapons/cybersnake.svg",
            Spirit: "systems/shadowrun6-eden/icons/compendium/all-about-drones/savannah-panther.svg",
            Vehicle: "systems/shadowrun6-eden/icons/compendium/black-chrome/badger-corporate-bus.svg",
            sprite: "systems/shadowrun6-eden/icons/compendium/programs/imp.svg",
        }[actorData.type] ?? this.DEFAULT_ICON;

        return { img: src, texture: { src } };
    }

    /** @inheritDoc */
    prepareEmbeddedDocuments() {
        this._embeddedPreparation = true;
        super.prepareEmbeddedDocuments();
        delete this._embeddedPreparation;
    }
    /**
     * @Override
     */
    prepareData() {
        // This also calls Item Active Effects
        super.prepareData();

        // Modern DataModel Actors skip legacy data load flow
        if (this.system instanceof foundry.abstract.DataModel) return;
        

        console.log("SR6E | Shadowrun6Actor.prepareData() ", this);
        const actorData = getActorData(this);
        const system = getSystemData(this);
        if (isPlayer(system)) {
            if (!system.karma)
                system.karma = 0;
            if (!system.karma_total)
                system.karma_total = 0;
            if (!system.heat)
                system.heat = 0;
            if (!system.reputation)
                system.reputation = 0;
        }
        try {
            if (actorData.type === "Spirit") {
                const force = parseInt(system.rating);
                this._applySpiritPreset(force);
                this._applyForce(force);
            }
            this._prepareAttributes();
            this._prepareDerivedAttributes();
            if (actorData.type != "Vehicle" && actorData.type != "Critter") {
                this._preparePersona();
                this._prepareAttackRatings();
                this._prepareDefenseRatings();
                this._prepareSkills();
                this._prepareDefensePools();
                this._prepareVehiclePools();
                this._calculateEssence();
                if (isLifeform(system) && system.mortype) {
                    system.morDef = CONFIG.SR6.MOR_DEFINITIONS[system.mortype];
                }
            }
            if (actorData.type === "Critter") {
                this._prepareAttackRatings();
                this._prepareDefenseRatings();
                this._prepareSkills();
                this._prepareDefensePools();
                this._calculateEssence();
                //     this._prepareItemPools();
            }
            if (actorData.type === "Vehicle") {
                // Get owner actor
                if (system.vehicle.belongs) {
                    let owner = game.actors.get(system.vehicle.belongs);
                    if (owner) {
                        // It can happen that we pass here before the owner is fully initialized
                        // Make sure the owner has all the skills prepared
                        owner.prepareData();
                        this.owner = owner;
                    }
                }             

                this._prepareVehicleAttackRatings();
                this._prepareVehicleDefenseRatings();
                this._prepareDerivedVehicleAttributes();
                this._prepareVehicleActorSkills();
                this._prepareVehicleActorItems();
            }


            if (actorData.type != "Vehicle" && actorData.type != "Critter") {
                this._prepareItemPools();
            }
        }
        catch (err) {
            console.log(`SR6E | Error ${err.message}`, err.stack);
        }
        console.log("SR6E | Shadowrun6Actor.prepareData() ", actorData.name + " = " + actorData.type);
    }
    /**
     * @Override
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
        // Modern DataModel Actors skip legacy data load flow
        if (this.system instanceof foundry.abstract.DataModel) {
            await super._preUpdate(changes, options, user);
            return;
        }
        
        const allowed = await super._preUpdate(changes, options, user);
        console.log("SR6E | Shadowrun6Actor._preUpdate()");
        if ( allowed === false ) return false;

        changes = this._tokenBarsToMonitorDmg(changes);

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
        // Modern DataModel Actors skip legacy data load flow
        if (this.system instanceof foundry.abstract.DataModel) {
            super._onUpdate(changed, options, userId);
            return;
        }

        super._onUpdate(changed, options, userId);
        console.log("SR6E | Shadowrun6Actor._onUpdate()");
        this._checkPersonaChanges(changed);
    }
    
    /**
     * Called to change physical and stun total value to damage
     * system.physical.value = system.physical.max - system.physical.dmg;
     * @param {object} changes          Changes object from preUpdate
     */
    _tokenBarsToMonitorDmg(changes) {
        if (changes.system?.physical?.value >= 0) {
            console.log("SR6E | changing physical.value to phsyical.dmg");
            changes.system.physical = { dmg: this.system.physical.max - changes.system.physical.value }
        }
        if (changes.system?.stun?.value >= 0) {
            console.log("SR6E | changing stun.value to stun.dmg");
            changes.system.stun = { dmg: this.system.stun.max - changes.system.stun.value }
        }
        return changes;
    }

    //---------------------------------------------------------
    /**
     * Apply the force rating as a attribute and skill modifier
     */
    _applySpiritPreset(force) {
        const system = getSystemData(this);
        // Only run on spirits
        if (!isSpiritOrSprite(system))
            return;
        if (!system.defenserating)
            system.defenserating = new Ratings();
        switch (system.spiritType) {
            case 'air':
                system.attributes.bod.mod = -2;
                system.attributes.agi.mod = 3;
                system.attributes.rea.mod = 4;
                system.attributes.str.mod = -3;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = 0;
                system.attributes.int.mod = 0;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force+2;
                system.initiative.physical.base = (force * 2)+4;
                system.skills["astral"].points = 1;
                system.skills["athletics"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["exotic_weapons"].points = 1;
                system.skills["perception"].points = 1;
                break;
            case 'beasts':
                system.attributes.bod.mod = 2;
                system.attributes.agi.mod = 1;
                system.attributes.rea.mod = 0;
                system.attributes.str.mod = 2;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = 0;
                system.attributes.int.mod = 0;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force+2;
                system.initiative.physical.base = (force * 2);
                system.skills["astral"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["perception"].points = 1;
                break;
            case 'earth':
                system.attributes.bod.mod = 4;
                system.attributes.agi.mod = -2;
                system.attributes.rea.mod = -1;
                system.attributes.str.mod = 4;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = -1;
                system.attributes.int.mod = 0;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force+4;
                system.initiative.physical.base = (force * 2)-1;
                system.skills["astral"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["exotic_weapons"].points = 1;
                system.skills["perception"].points = 1;
                break;
            case 'fire':
                system.attributes.bod.mod = 1;
                system.attributes.agi.mod = 2;
                system.attributes.rea.mod = 3;
                system.attributes.str.mod = -2;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = 0;
                system.attributes.int.mod = 1;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force+1;
                system.initiative.physical.base = (force * 2)+4;
                system.skills["astral"].points = 1;
                system.skills["athletics"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["exotic_weapons"].points = 1;
                system.skills["perception"].points = 1;
                break;
            case 'kin':
                system.attributes.bod.mod = 1;
                system.attributes.agi.mod = 0;
                system.attributes.rea.mod = 2;
                system.attributes.str.mod = -2;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = 0;
                system.attributes.int.mod = 1;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force+1;
                system.initiative.physical.base = (force * 2)+3;
                system.skills["astral"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["perception"].points = 1;
                system.skills["sorcery"].points = 1;
                break;
            case 'water':
                system.attributes.bod.mod = 0;
                system.attributes.agi.mod = 1;
                system.attributes.rea.mod = 2;
                system.attributes.str.mod = 0;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = 0;
                system.attributes.int.mod = 0;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force;
                system.initiative.physical.base = (force * 2);
                system.skills["astral"].points = 1;
                system.skills["athletics"].points = 1;
                system.skills["athletics"].specialization = "swimming";
                system.skills["close_combat"].points = 1;
                system.skills["exotic_weapons"].points = 1;
                system.skills["perception"].points = 1;
                break;
            case 'plant':
                system.attributes.bod.mod = 2;
                system.attributes.agi.mod = -1;
                system.attributes.rea.mod = 0;
                system.attributes.str.mod = 1;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = -1;
                system.attributes.int.mod = 0;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force+2;
                system.initiative.physical.base = (force * 2);
                system.skills["astral"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["exotic_weapons"].points = 1;
                system.skills["perception"].points = 1;
                system.skills["sorcery"].points = 1;
                break;
            case 'guardian':
                system.attributes.bod.mod = 1;
                system.attributes.agi.mod = 2;
                system.attributes.rea.mod = 3;
                system.attributes.str.mod = 2;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = 0;
                system.attributes.int.mod = 0;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = (force * 2)+1;
                system.initiative.physical.base = (force * 2)+3;
                system.skills["astral"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["exotic_weapons"].points = 1;
                system.skills["perception"].points = 1;
                break;
            case 'guidance':
                system.attributes.bod.mod = 3;
                system.attributes.agi.mod = -1;
                system.attributes.rea.mod = 2;
                system.attributes.str.mod = 1;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = 0;
                system.attributes.int.mod = 0;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force+3;
                system.initiative.physical.base = (force * 2)+2;
                system.skills["astral"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["perception"].points = 1;
                system.skills["sorcery"].points = 1;
                break;
            case 'task':
                system.attributes.bod.mod = 0;
                system.attributes.agi.mod = 0;
                system.attributes.rea.mod = 2;
                system.attributes.str.mod = 2;
                system.attributes.wil.mod = 0;
                system.attributes.log.mod = 0;
                system.attributes.int.mod = 0;
                system.attributes.cha.mod = 0;
                system.attributes.mag.mod = 0;
                system.defenserating.physical.base = force;
                system.initiative.physical.base = (force * 2)+2;
                system.skills["astral"].points = 1;
                system.skills["close_combat"].points = 1;
                system.skills["perception"].points = 1;
                break;
        }
    }
    //---------------------------------------------------------
    /**
     * Apply the force rating as a attribute and skill modifier
     */
    _applyForce(force) {
        const system = getSystemData(this);
        // Only run on spirits
        if (isSpiritOrSprite(system)) {
            system.mortype = "mysticadept";
            CONFIG.SR6.PRIMARY_ATTRIBUTES.forEach((attr) => {
                system.attributes[attr].base = force;
            });
            CONFIG.SR6.ATTRIB_BY_SKILL.forEach(function (skillDef, id) {
                let skill = system.skills[id];
                skill.modifier = 0;
                if (skill.points > 0) {
                    skill.points = force;
                }
            });
            // Magic rating
            system.attributes.mag.base = force;
            system.essence = force;
            //Set initiative dice to 2d6 for phy and 3d6 for astral
            system.initiative.physical.dice = 2;
            system.initiative.astral.dice = 3;
            
            system.defenserating.astral.base = force;
            system.initiative.physical.base = force * 2;
            system.initiative.physical.pool = system.initiative.physical.base + system.initiative.physical.mod;
            system.initiative.physical.dicePool = Math.min(5, system.initiative.physical.dice + system.initiative.physical.diceMod);
            system.initiative.actions = system.initiative.physical.dicePool + 1;
            system.initiative.astral.base = force * 2;
            system.initiative.astral.pool = system.initiative.astral.base + system.initiative.astral.mod;
            system.initiative.astral.dicePool = system.initiative.astral.dice + system.initiative.astral.diceMod;

            system.physical.max = 8 + Math.round(force / 2) + system.physical.mod;
            system.physical.value = system.physical.max - system.physical.dmg;
            system.stun.max = 0;
            system.stun.value = 0;
            system.stun.dmg = 0;
            system.stun.mod = 0;
        }
    }
    //---------------------------------------------------------
    /*
     * Calculate the final attribute values
     */
    _prepareAttributes() {
        const system = getSystemData(this);
        // Only run on lifeforms
        if (isLifeform(system)) {
            CONFIG.SR6.ATTRIBUTES.forEach((attr) => {
                if (!(system.attributes[attr].base) || parseInt(system.attributes[attr].base) < 1)
                    system.attributes[attr].base = 1;
                if (!(system.attributes[attr].mod)) //Allow negative mods OLD: //  || (system.attributes[attr].mod < 0 && !isSpiritOrSprite(system))
                    system.attributes[attr].mod = 0;

                // Attribute Pool cannot be lower than 1 and cannot apply a Mod higher than 4
                if (parseInt(system.attributes[attr].mod) > 4 ) 
                    system.attributes[attr].modString = game.i18n.localize("attrib.max_augment");
                system.attributes[attr].pool = Math.max(1, parseInt(system.attributes[attr].base) + Math.min(4, parseInt(system.attributes[attr].mod)) );
            });
            if (system.edge.value > 7) {
                system.edge.value = 7;
            }
        }
    }
    //---------------------------------------------------------
    /*
     * Calculate the attributes like Initiative
     */
    _prepareDerivedAttributes() {
        console.log("SR6E | Shadowrun6Actor._prepareDerivedAttributes()");
        //TODO validate attributes max and integere
        const actorData = getActorData(this);
        const system = getSystemData(this);
        if (!isLifeform(system))
            return;
        const data = system;

        // correcting wrongly entered monitor fields
        if (data.physical?.dmg < 0) data.physical.dmg = 0;
        if (data.stun?.dmg < 0) data.stun.dmg = 0;
        if (data.overflow?.dmg < 0) data.overflow.dmg = 0;

        // Don't calculate monitors and initiative for spirits
        if (actorData.type != "Spirit") {
            if (data.physical) {
                data.physical.mod = data.physical.mod ?? 0;
                data.physical.base = 8 + Math.round(data.attributes["bod"].pool / 2);
                data.physical.max = data.physical.base + data.physical.mod;
                data.physical.value = data.physical.max - data.physical.dmg;
                data.overflow.max = data.attributes["bod"].pool * 2;
                data.overflow.value = 100-Math.round(data.overflow.dmg / data.overflow.max * 100);
            }
            if (data.stun) {
                data.stun.mod = data.stun.mod ?? 0;
                data.stun.base = 8 + Math.round(data.attributes["wil"].pool / 2);
                data.stun.max = data.stun.base + data.stun.mod;
                data.stun.value = data.stun.max - data.stun.dmg;
            }
            if (data.initiative) {
                data.initiative.physical.base = data.attributes["rea"].pool + data.attributes["int"].pool;
                data.initiative.physical.pool = data.initiative.physical.base + data.initiative.physical.mod;
                data.initiative.physical.dicePool = Math.min(5, data.initiative.physical.dice + data.initiative.physical.diceMod);
                data.initiative.actions = data.initiative.physical.dicePool + 1;
                data.initiative.astral.base = data.attributes["log"].pool + data.attributes["int"].pool;
                data.initiative.astral.pool = data.initiative.astral.base + data.initiative.astral.mod;
                data.initiative.astral.dicePool = data.initiative.astral.dice + data.initiative.astral.diceMod;
                if (!data.initiative.matrix)
                    data.initiative.matrix = new Initiative;
                data.initiative.matrix.base = data.attributes["rea"].pool + data.attributes["int"].pool;
                data.initiative.matrix.pool = data.initiative.matrix.base + data.initiative.matrix.mod;
                data.initiative.matrix.dicePool = data.initiative.matrix.dice + data.initiative.matrix.diceMod;
            }
        }
        if (!data.derived) {
            data.derived = new Derived();
        }
        // Composure
        if (data.derived.composure) {
            data.derived.composure.base = data.attributes["wil"].pool + data.attributes["cha"].pool;
            data.derived.composure.pool = data.derived.composure.base + data.derived.composure.mod;
        }
        // Judge Intentions
        if (data.derived.judge_intentions) {
            data.derived.judge_intentions.base = data.attributes["wil"].pool + data.attributes["int"].pool;
            data.derived.judge_intentions.pool = data.derived.judge_intentions.base + data.derived.judge_intentions.mod;
        }
        // Memory
        if (data.derived.memory) {
            data.derived.memory.base = data.attributes["log"].pool + data.attributes["int"].pool;
            data.derived.memory.pool = data.derived.memory.base + data.derived.memory.mod;
        }
        // Lift/Carry
        if (data.derived.lift_carry) {
            data.derived.lift_carry.base = data.attributes["bod"].pool + data.attributes["wil"].pool;
            data.derived.lift_carry.pool = data.derived.lift_carry.base + data.derived.lift_carry.mod;
        }
        // Soak / Damage Resistance
        if (data.derived.resist_damage) {
            data.derived.resist_damage.base = data.attributes["bod"].pool;
            data.derived.resist_damage.pool = data.derived.resist_damage.base + data.derived.resist_damage.mod;
        }
        // Toxin Resistance
        if (data.derived.resist_toxin) {
            data.derived.resist_toxin.base = data.attributes["bod"].pool + data.attributes["wil"].pool;
            data.derived.resist_toxin.pool = data.derived.resist_toxin.base + data.derived.resist_toxin.mod;
        }
        // Matrix perception
        if (data.derived.matrix_perception) {
            data.derived.matrix_perception.base = data.skills["electronics"].points + data.skills["electronics"].modifier + data.attributes["int"].pool;
            data.derived.matrix_perception.pool = data.derived.matrix_perception.base + data.derived.matrix_perception.mod;
        }
    }
    //---------------------------------------------------------
    /*
     * Calculate the attack ratings
     */
    _prepareAttackRatings() {
        const system = getSystemData(this);
        if (!isLifeform(system))
            return;

        this.createAttackRatingProperties(system);
        
        /* Physical Attack Rating - used for unarmed combat */
        system.attackrating.physical.base = system.attributes["rea"].pool + system.attributes["str"].pool;
        system.attackrating.physical.modString = game.i18n.localize("attrib.rea_short") + " " + system.attributes["rea"].pool + " ";
        system.attackrating.physical.modString += game.i18n.localize("attrib.str_short") + " " + system.attributes["str"].pool;
        system.attackrating.physical.pool = system.attackrating.physical.base;
        if (system.attackrating.physical.mod) {
            system.attackrating.physical.pool += system.attackrating.physical.mod;
            system.attackrating.physical.modString += " + " + system.attackrating.physical.mod;
        }
        if (system.tradition) {
            let traditionAttr = system.attributes[system.tradition.attribute];
            system.attackrating.astral.base = system.attributes["mag"].pool + traditionAttr.pool;
            system.attackrating.astral.modString = game.i18n.localize("attrib.mag_short") + " " + system.attributes["mag"].pool + " ";
            system.attackrating.astral.modString +=
                game.i18n.localize("attrib." + system.tradition.attribute + "_short") + " " + system.attributes[system.tradition.attribute].pool;
            system.attackrating.astral.pool = system.attackrating.astral.base;
        }
        if (system.attackrating.astral.mod) {
            system.attackrating.astral.pool += system.attackrating.astral.mod;
            system.attackrating.astral.modString += " + " + system.attackrating.astral.mod;
        }
        if (isMatrixUser(system)) {
            console.log("SR6E | prepareAttackRatings:", system.persona.used);
            if (system.persona && system.persona.used) {
                // Matrix attack rating (Angriff + Schleicher)
                system.attackrating.matrix.base = system.persona.used.a + system.persona.used.s;
                system.attackrating.matrix.pool = system.attackrating.matrix.base;
                if (system.attackrating.matrix.mod) {
                    system.attackrating.matrix.pool += system.attackrating.matrix.mod;
                    system.attackrating.matrix.modString += " + " + system.attackrating.matrix.mod;
                }
                switch (system.matrixIni) {
                    case "ar":
                        system.initiative.matrix.base = system.attributes["rea"].pool + system.attributes["int"].pool;
                        system.initiative.matrix.dice = 1;
                        break;
                    case "vrcold":
                        system.initiative.matrix.base = system.attributes["int"].pool + (system.persona.used.d ?? system.persona.device.base.d);
                        system.initiative.matrix.dice = 2;
                        break;
                    case "vrhot":
                        system.initiative.matrix.base = system.attributes["int"].pool + (system.persona.used.d ?? system.persona.device.base.d);
                        system.initiative.matrix.dice = 3;
                        break;
                }
                system.initiative.matrix.pool = system.initiative.matrix.base + system.initiative.matrix.mod;
                system.initiative.matrix.dicePool = system.initiative.matrix.dice + system.initiative.matrix.diceMod;
            }
            // Resonance attack rating (Electronics + Resonance)
            system.attackrating.resonance.base = system.persona.used.a + system.attributes["res"].pool;
            system.attackrating.resonance.modString = game.i18n.localize("skill.electronics") + " + ";
            system.attackrating.resonance.modString += game.i18n.localize("attrib.res_short");
            system.attackrating.resonance.pool = system.attackrating.resonance.base;
            if (system.attackrating.resonance.mod) {
                system.attackrating.resonance.pool += system.attackrating.resonance.mod;
                system.attackrating.resonance.modString += " + " + system.attackrating.resonance.mod;
            }
        }
        else {
            system.attackrating.matrix.base = 0;
        }
        // Vehicle combat attack rating (Pilot + Sensor)
        system.attackrating.vehicle.base = 0; //data.attributes["rea"].pool + data.attributes["str"].pool;
        system.attackrating.vehicle.pool = system.attackrating.vehicle.base;
        if (system.attackrating.vehicle.mod) {
            system.attackrating.vehicle.pool += system.attackrating.vehicle.mod;
            system.attackrating.vehicle.modString += " + " + system.attackrating.vehicle.mod;
        }
        // Social value
        system.attackrating.social.base = system.attributes["cha"].pool;
        system.attackrating.social.modString = game.i18n.localize("attrib.cha_short") + " " + system.attributes["cha"].pool;
        system.attackrating.social.pool = system.attackrating.social.base;
        if (system.attackrating.social.mod) {
            system.attackrating.social.pool += system.attackrating.social.mod;
            system.attackrating.social.modString += " + " + system.attackrating.social.mod;
        }
        /*
        items.forEach(function (item, key) {
            if (item.type == "gear" && item.data.data.type == "ARMOR") {
                if (item.data.data.usedForPool) {
                    data.attackrating.social.pool += item.data.data.social;
                    data.attackrating.social.modString += " +" + item.data.data.social + " " + item.name;
                }
            }
        });
        */
    }    

    //---------------------------------------------------------
    /*
     * Calculate the attributes like Initiative
     */
    // TODO possible rework, these are only (re)calculated in certain situations
    _prepareDefenseRatings() {
        const actorData = getActorData(this);
        const system = getSystemData(this);
        if (!isLifeform(system))
            return;
        const data = system;
        const items = actorData.items;
        if (!isLifeform(data))
            return;

        this.createDefenseRatingProperties(system);
        
        // Store volatile
        // Physical Defense Rating
        data.defenserating.physical.base = data.attributes["bod"].pool;
        data.defenserating.physical.modString = game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
        data.defenserating.physical.pool = data.defenserating.physical.base;
        if (data.defenserating.physical.mod) {
            data.defenserating.physical.pool += data.defenserating.physical.mod;
            data.defenserating.physical.modString += " + " + data.defenserating.physical.mod;
        }
        items.forEach((item) => {
            let itemSystem = getSystemData(item);
            if (item.type == "gear" && itemSystem.type == "ARMOR" && isArmor(itemSystem)) {
                if (itemSystem.usedForPool) {
                    data.defenserating.physical.pool += parseInt(itemSystem.defense);
                    data.defenserating.physical.modString += " + " + itemSystem.defense + " " + item.name;
                }
            }
        });
        // Astral Defense Rating
        data.defenserating.astral.base = data.attributes["int"].pool;
        data.defenserating.astral.modString = game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
        data.defenserating.astral.pool = data.defenserating.astral.base;
        if (data.defenserating.astral.mod) {
            data.defenserating.astral.pool += data.defenserating.astral.mod;
            data.defenserating.astral.modString += " + " + data.defenserating.astral.mod;
        }
        // Matrix defense
        if (isMatrixUser(data)) {
            console.log("SR6E | prepareDefenseRatings:", data.persona.used);
            data.defenserating.matrix.base = data.persona.used.d + data.persona.used.f;
            data.defenserating.matrix.modString = ""; //(game as Game).i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
            data.defenserating.matrix.pool = data.defenserating.matrix.base;
            if (data.defenserating.matrix.mod) {
                data.defenserating.matrix.pool += data.defenserating.matrix.mod;
                data.defenserating.matrix.modString += " + " + data.defenserating.matrix.mod;
            }
        }
        // Social Defense Rating
        data.defenserating.social.base = data.attributes["cha"].pool;
        data.defenserating.social.modString = game.i18n.localize("attrib.cha_short") + " " + data.attributes["cha"].pool;
        data.defenserating.social.pool = data.defenserating.social.base;
        if (data.defenserating.social.mod) {
            data.defenserating.social.pool += data.defenserating.social.mod;
            data.defenserating.social.modString += " + " + data.defenserating.social.mod;
        }
        /*
            items.forEach(function (item, key) {
                if (item.type == "gear" && item.data.data.type == "ARMOR") {
                    if (item.data.data.usedForPool) {
                        data.defenserating.social.pool += item.data.data.social;
                        data.defenserating.social.modString += " +" + item.data.data.social + " " + item.name;
                    }
                }
            });
            */
    }

    //---------------------------------------------------------
    /*
     * Calculate the final attribute values
     */
    _prepareSkills() {
        const actorData = getActorData(this);
        const system = getSystemData(this);
        if (!isLifeform(system))
            return;
        const data = system;
        // Only calculate for PCs - ignore for NPCs/Critter
        // if (actorData.type === "Player" || actorData.type === "NPC") {
        if (actorData.type !== "Vehicle") {
            CONFIG.SR6.ATTRIB_BY_SKILL.forEach(function (skillDef, id) {
                let attr = skillDef.attrib;
                let attribVal = data.attributes[attr].pool;
                data.skills[id].pool = attribVal + data.skills[id].points + data.skills[id].modifier;
                if (data.skills[id].points == 0) {
                    if(skillDef.useUntrained) {
                        data.skills[id].pool = attribVal - 1 + data.skills[id].modifier;
                    } else {
                        data.skills[id].pool = 0 + data.skills[id].modifier;
                    }
                }
                data.skills[id].poolS = 0;
                data.skills[id].poolE = 0;
                if (data.skills[id].specialization) {
                    if(id == 'exotic_weapons') {
                        data.skills[id].exotic = true;
                        data.skills[id].poolS = data.skills[id].pool;
                    } else {
                        data.skills[id].poolS = data.skills[id].pool + 2;
                    }
                }
                if (data.skills[id].expertise) {
                    if(id == 'exotic_weapons') {
                        data.skills[id].exotic = true;
                        data.skills[id].poolE = data.skills[id].pool;
                    } else {
                        data.skills[id].poolE = data.skills[id].pool + 3;
                    }
                }
                if (data.skills[id].pool < 0) {
                    data.skills[id].pool = 0;
                }
                if (data.skills[id].poolS < 0) {
                    data.skills[id].poolS = 0;
                }
                if (data.skills[id].poolE < 0) {
                    data.skills[id].poolE = 0;
                }
            });
        }
    }    

    //---------------------------------------------------------
    /*
     * Calculate the attributes like Initiative
     */
    _prepareDefensePools() {
        const system = getSystemData(this);
        console.log("SR6E | _prepareDefensePools - based on:", system.attributes);
        if (!isLifeform(system))
            return;
        const data = system;
        if (!data.defensepool)
            data.defensepool = new DefensePool();
        if (!data.defensepool.physical)
            data.defensepool.physical = new Pool();
        if (!data.defensepool.astral)
            data.defensepool.astral = new Pool();
        if (!data.defensepool.spells_direct)
            data.defensepool.spells_direct = new Pool();
        if (!data.defensepool.spells_indirect)
            data.defensepool.spells_indirect = new Pool();
        if (!data.defensepool.spells_other)
            data.defensepool.spells_other = new Pool();
        if (!data.defensepool.vehicle)
            data.defensepool.vehicle = new Pool();
        if (!data.defensepool.toxin)
            data.defensepool.toxin = new Pool();
        if (!data.defensepool.damage_physical)
            data.defensepool.damage_physical = new Pool();
        if (!data.defensepool.damage_astral)
            data.defensepool.damage_astral = new Pool();
        if (!data.defensepool.drain)
            data.defensepool.drain = new Pool();
        if (!data.defensepool.fading)
            data.defensepool.fading = new Pool();
        // Physical Defense Test
        data.defensepool.physical.base = data.attributes["rea"].pool + data.attributes["int"].pool;
        data.defensepool.physical.modString = " " + game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
        data.defensepool.physical.modString += " " + game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
        data.defensepool.physical.pool = data.defensepool.physical.base;
        if (data.defensepool.physical.mod) {
            data.defensepool.physical.pool += data.defensepool.physical.mod;
            data.defensepool.physical.modString += " + " + data.defensepool.physical.mod;
        }
        // Astral(Combat) Defense Test
        data.defensepool.astral.base = data.attributes["log"].pool + data.attributes["int"].pool;
        data.defensepool.astral.modString = " " + game.i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
        data.defensepool.astral.modString += " " + game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
        data.defensepool.astral.pool = data.defensepool.astral.base;
        if (data.defensepool.astral.mod) {
            data.defensepool.astral.pool += data.defensepool.astral.mod;
            data.defensepool.astral.modString += " + " + data.defensepool.astral.mod;
        }
        // Direct combat spell defense test
        data.defensepool.spells_direct.base = data.attributes["wil"].pool + data.attributes["int"].pool;
        data.defensepool.spells_direct.modString = " " + game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
        data.defensepool.spells_direct.modString += " " + game.i18n.localize("attrib.int_short") + " " + data.attributes["int"].pool;
        data.defensepool.spells_direct.pool = data.defensepool.spells_direct.base;
        if (data.defensepool.spells_direct.mod) {
            data.defensepool.spells_direct.pool += data.defensepool.spells_direct.mod;
            data.defensepool.spells_direct.modString += " + " + data.defensepool.spells_direct.mod;
        }
        // Indirect combat spell defense test
        data.defensepool.spells_indirect.base = data.attributes["rea"].pool + data.attributes["wil"].pool;
        data.defensepool.spells_indirect.modString = " " + game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
        data.defensepool.spells_indirect.modString += " " + game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
        data.defensepool.spells_indirect.pool = data.defensepool.spells_indirect.base;
        if (data.defensepool.spells_indirect.mod) {
            data.defensepool.spells_indirect.pool += data.defensepool.spells_indirect.mod;
            data.defensepool.spells_indirect.modString += " + " + data.defensepool.spells_indirect.mod;
        }
        // Other spell defense test
        data.defensepool.spells_other.base = data.attributes["log"].pool + data.attributes["wil"].pool;
        data.defensepool.spells_other.modString = " " + game.i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
        data.defensepool.spells_other.modString += " " + game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
        data.defensepool.spells_other.pool = data.defensepool.spells_other.base;
        if (data.defensepool.spells_other.mod) {
            data.defensepool.spells_other.pool += data.defensepool.spells_other.mod;
            data.defensepool.spells_other.modString += " + " + data.defensepool.spells_other.mod;
        }
        // Vehicle combat defense
        data.defensepool.vehicle.base = data.skills["piloting"].pool + data.attributes["rea"].pool;
        data.defensepool.vehicle.modString = " " + game.i18n.localize("skill.piloting") + " " + data.skills["piloting"].pool;
        data.defensepool.vehicle.modString += " " + game.i18n.localize("attrib.rea_short") + " " + data.attributes["rea"].pool;
        data.defensepool.vehicle.pool = data.defensepool.vehicle.base;
        if (data.defensepool.vehicle.mod) {
            data.defensepool.vehicle.pool += data.defensepool.vehicle.mod;
            data.defensepool.vehicle.modString += " + " + data.defensepool.vehicle.mod;
        }
        // Resist toxin
        data.defensepool.toxin.base = data.attributes["bod"].pool + data.attributes["wil"].pool;
        data.defensepool.toxin.modString = " " + game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
        data.defensepool.toxin.modString += " " + game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
        data.defensepool.toxin.pool = data.defensepool.toxin.base;
        if (data.defensepool.toxin.mod) {
            data.defensepool.toxin.pool += data.defensepool.toxin.mod;
            data.defensepool.toxin.modString += " + " + data.defensepool.toxin.mod;
        }
        // Resist physical damage
        data.defensepool.damage_physical.base = data.attributes["bod"].pool;
        data.defensepool.damage_physical.modString = " " + game.i18n.localize("attrib.bod_short") + " " + data.attributes["bod"].pool;
        data.defensepool.damage_physical.pool = data.defensepool.damage_physical.base;
        if (data.defensepool.damage_physical.mod) {
            data.defensepool.damage_physical.pool += data.defensepool.damage_physical.mod;
            data.defensepool.damage_physical.modString += " + " + data.defensepool.damage_physical.mod;
        }
        // Resist astral damage
        data.defensepool.damage_astral.base = data.attributes["wil"].pool;
        data.defensepool.damage_astral.modString = " " + game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
        data.defensepool.damage_astral.pool = data.defensepool.damage_astral.base;
        if (data.defensepool.damage_astral.mod) {
            data.defensepool.damage_astral.pool += data.defensepool.damage_astral.mod;
            data.defensepool.damage_astral.modString += " + " + data.defensepool.damage_astral.mod;
        }
        // Resist drain
        if (data.tradition) {
            let traditionAttr = data.attributes[data.tradition.attribute];
            data.defensepool.drain.base = traditionAttr.pool + data.attributes["wil"].pool;
            data.defensepool.drain.modString =
                " " + game.i18n.localize("attrib." + data.tradition.attribute + "_short") + " " + traditionAttr.pool;
            data.defensepool.drain.modString += " " + game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
            data.defensepool.drain.pool = data.defensepool.drain.base;
            if (data.defensepool.drain.mod) {
                data.defensepool.drain.pool += data.defensepool.drain.mod;
                data.defensepool.drain.modString += " + " + data.defensepool.drain.mod;
            }
        }
        // Resist fading
        data.defensepool.fading.base = data.attributes["wil"].pool + data.attributes["log"].pool;
        data.defensepool.fading.modString = " " + game.i18n.localize("attrib.wil_short") + " " + data.attributes["wil"].pool;
        data.defensepool.fading.modString += " " + game.i18n.localize("attrib.log_short") + " " + data.attributes["log"].pool;
        data.defensepool.fading.pool = data.defensepool.fading.base;
        if (data.defensepool.fading.mod) {
            data.defensepool.fading.pool += data.defensepool.fading.mod;
            data.defensepool.fading.modString += " + " + data.defensepool.fading.mod;
        }
    }
    //---------------------------------------------------------
    /*
     * Calculate the pool when using items with assigned skills
     */
    _prepareItemPools() {
        const actorData = getActorData(this);
        const system = getSystemData(this);
        if (!isLifeform(system))
            return;
        const itemUser = system;
        actorData.items.forEach((tmpItem) => {
            let item = getItemData(tmpItem);
            let system = getSystemData(tmpItem);
            if (item.type == "gear" && system && isGear(system)) {
                let gear = system;
                if (gear.skill && gear.skill != "") {
                    //item.data.pool = tmpItem.actor.system.skills[item.data.skill].pool;
                    const strWeapon = (game.settings.get(SYSTEM_NAME, "rollStrengthCombat") && item.system.strWeapon) ? 'str' : undefined;
                    gear.pool = this._getSkillPool(gear.skill, gear.skillSpec, strWeapon);
                    gear.pool = gear.pool + +gear.modifier;
                }
            }
            if (tmpItem.type == "gear" && isWeapon(system)) {
                if (system.stun) {
                    if (system.stun === "false") {
                        system.stun = false;
                    }
                    else if (system.stun === "true") {
                        system.stun = true;
                    }
                }
                const suffix = (item.calculated.stun ?? system.stun)
                    ? game.i18n.localize("shadowrun6.item.stun_damage")
                    : game.i18n.localize("shadowrun6.item.physical_damage");
                system.dmgDef = item.calculated.dmg + suffix;
            }
            if (tmpItem.type == "complexform" && isComplexForm(system)) {
                if (!system.skill) {
                    let cform = CONFIG.SR6.COMPLEX_FORMS.list[system.genesisID];
                    if (cform && cform.skill) {
                        system.skill = cform.skill;
                        system.oppAttr1 = cform.opposedAttr1;
                        system.oppAttr2 = cform.opposedAttr2;
                        system.threshold = cform.threshold;
                    }
                }
            }
        });
    }
    //---------------------------------------------------------
    /*
     * Calculate the pool when using items with assigned skills
     */
    _prepareVehiclePools() {
        const actorData = getActorData(this);
        const systemRaw = getSystemData(this);
        if (!isLifeform(systemRaw))
            return;
        const system = systemRaw;
        if (!system.controlRig) {
            system.controlRig = 0;
        }
        actorData.items.forEach((tmpItem) => {
            // Any kind of gear
            if (tmpItem.type == "gear" && isVehicle(getSystemData(tmpItem))) {
                let vehicleData = getSystemData(tmpItem);
                if (!vehicleData.vehicle) {
                    vehicleData.vehicle = new CurrentVehicle();
                }
                let current = vehicleData.vehicle;
                //if (!current.attrib)  current.attrib="rea";
                if (!current.ar)
                    current.ar = new Pool();
                if (!current.dr)
                    current.dr = new Pool();
                if (!current.handling)
                    current.handling = new Pool();
                let specialization = vehicleData.vtype;
                if ("GROUND" === specialization) {
                    specialization = "ground_craft";
                }
                if ("WATER" === specialization) {
                    specialization = "watercraft";
                }
                if ("AIR" === specialization) {
                    specialization = "aircraft";
                }
                // Set specialization if none exists
                if (!vehicleData.skillSpec && specialization) {
                    vehicleData.skillSpec = specialization;
                }
                let opMode = current.opMode;
                let rigRating = system.controlRig;
                let modRig = "";
                if (rigRating > 0) {
                    modRig = " + " + game.i18n.localize("shadowrun6.item.vehicle.rigRating.long") + " (" + rigRating + ")";
                }
                switch (opMode) {
                    case "manual":
                        rigRating = 0;
                        modRig = "";
                    case "riggedAR":
                        current.ar.pool = system.skills.piloting.points + vehicleData.sen + +rigRating;
                        current.ar.modString =
                            game.i18n.localize("skill.piloting") +
                                "(" +
                                system.skills.piloting.points +
                                ") + " +
                                game.i18n.localize("shadowrun6.item.vehicle.sensor.long") +
                                " (" +
                                vehicleData.sen +
                                ")" +
                                modRig;
                        current.dr.pool = system.skills.piloting.points + vehicleData.arm + +rigRating;
                        current.dr.modString =
                            game.i18n.localize("skill.piloting") +
                                "(" +
                                system.skills.piloting.points +
                                ") + " +
                                game.i18n.localize("shadowrun6.item.vehicle.armor.long") +
                                " (" +
                                vehicleData.arm +
                                ")" +
                                modRig;
                        current.handling.pool = this._getSkillPool("piloting", specialization, "rea") + +rigRating;
                        current.handling.modString =
                            game.i18n.localize("skill.piloting") +
                                "(" +
                                system.skills.piloting.points +
                                ") + " +
                                game.i18n.localize("attrib.rea_short") +
                                "(" +
                                system.attributes.rea.pool +
                                ")" +
                                modRig;
                        break;
                    case "riggedVR":
                        //item.data.vehicle.attrib="int";
                        current.ar.pool = system.skills.piloting.points + vehicleData.sen + +rigRating;
                        current.ar.modString =
                            game.i18n.localize("skill.piloting") +
                                "(" +
                                system.skills.piloting.points +
                                ") + " +
                                game.i18n.localize("shadowrun6.item.vehicle.sensor.long") +
                                " (" +
                                vehicleData.sen +
                                ")" +
                                modRig;
                        current.dr.pool = system.skills.piloting.points + vehicleData.arm + +rigRating;
                        current.dr.modString =
                            game.i18n.localize("skill.piloting") +
                                "(" +
                                system.skills.piloting.points +
                                ") + " +
                                game.i18n.localize("shadowrun6.item.vehicle.armor.long") +
                                " (" +
                                vehicleData.arm +
                                ")" +
                                modRig;
                        current.handling.pool = this._getSkillPool("piloting", specialization, "int") + +rigRating;
                        current.handling.modString =
                            game.i18n.localize("skill.piloting") +
                                "(" +
                                system.skills.piloting.points +
                                ") + " +
                                game.i18n.localize("attrib.int_short") +
                                "(" +
                                system.attributes.int.pool +
                                ")" +
                                modRig;
                        break;
                    default:
                }
            }
        });
    }

    _prepareVehicleAttackRatings() {
        this.createAttackRatingProperties(this.system);
    }

    _prepareVehicleDefenseRatings() {
        this.createDefenseRatingProperties(this.system);
    }

    //---------------------------------------------------------
    /*
     * Calculate the attributes like Initiative
     */
    _prepareDerivedVehicleAttributes() {
        const system = getSystemData(this);
        // Monitors
        if (system.physical) {
            if (!system.physical.mod)
                system.physical.mod = 0;
            let base = 8 + Math.round(system.bod / 2);
            system.physical.max = +base + system.physical.mod;
            system.physical.value = system.physical.max - system.physical.dmg;
        }
        // Use "stun" as matrix condition
        if (system.stun) {
            if (!system.stun.mod)
                system.stun.mod = 0;
            // 8 + (Device Rating / 2) where Dev.Rat. is Sensor
            let base = 8 + Math.round(system.sen / 2);
            system.stun.max = +base + system.stun.mod;
            system.stun.value = system.stun.max - system.stun.dmg;
        }
        // Test modifier depending on speed
        let interval = system.vehicle.offRoad ? system.spdiOff : system.spdiOn;
        if (interval <= 1)
            interval = 1;
        let modifier = Math.floor(system.vehicle.speed / interval);
        // Modify with physical monitor
        modifier += Math.floor(system.physical.dmg / 3);
        system.vehicle.modifier = modifier;
        system.vehicle.kmh = Math.round(system.vehicle.speed * 1.2);
    }
    //---------------------------------------------------------
    _prepareVehicleActorSkills() {
        console.debug("SR6E | _prepareVehicleActorSkills", this);
        const vehicleSystem = this.system;

        // Prepare skills for first use
        if(!vehicleSystem.initiative)
            vehicleSystem.initiative = { 
                physical: new Initiative()
            };

        if (!vehicleSystem.skills)
            vehicleSystem.skills = new VehicleSkills();
        if (!vehicleSystem.skills.piloting)
            vehicleSystem.skills.piloting = new VehicleSkill();
        if (!vehicleSystem.skills.evasion)
            vehicleSystem.skills.evasion = new VehicleSkill();
        if(!vehicleSystem.skills.perception)
            vehicleSystem.skills.perception = new VehicleSkill();
        if(!vehicleSystem.skills.cracking)
            vehicleSystem.skills.cracking = new VehicleSkill();

        if(!vehicleSystem.ar)
            vehicleSystem.ar = new Pool();  // Attack rating (vehicle as weapon)
        if(!vehicleSystem.dr)
            vehicleSystem.dr = new Pool();  // Defense rating        

        let dr = vehicleSystem.defenserating.physical;
        
        switch (vehicleSystem.vehicle.opMode) {
            case VehicleOpMode.AUTONOMOUS:
                vehicleSystem.initiative.physical.base = vehicleSystem.pil * 2;
                if(isNaN(vehicleSystem.initiative.physical.mod))
                    vehicleSystem.initiative.physical.mod = 0
                vehicleSystem.initiative.physical.pool = vehicleSystem.initiative.physical.base + vehicleSystem.initiative.physical.mod;

                vehicleSystem.initiative.physical.dice = 3;
                if(isNaN(vehicleSystem.initiative.physical.diceMod))
                    vehicleSystem.initiative.physical.diceMod = 0
                vehicleSystem.initiative.physical.dicePool = vehicleSystem.initiative.physical.dice + vehicleSystem.initiative.physical.diceMod;

                const maneuverRating = this.getHighestAutosoftRating(this.items, "MANEUVER");

                vehicleSystem.ar.points = maneuverRating;
                vehicleSystem.ar.pool = vehicleSystem.ar.points + vehicleSystem.ar.mod + vehicleSystem.pil;

                dr.base = maneuverRating + vehicleSystem.arm;                
                if(!dr.mod) 
                    dr.mod = 0;
                dr.pool = dr.base + dr.mod;

                vehicleSystem.skills.piloting.points = maneuverRating;
                vehicleSystem.skills.piloting.pool = vehicleSystem.skills.piloting.points + vehicleSystem.skills.piloting.modifier + vehicleSystem.pil;

                vehicleSystem.skills.evasion.points = this.getHighestAutosoftRating(this.items, "EVASION");
                vehicleSystem.skills.evasion.pool = vehicleSystem.skills.evasion.points + vehicleSystem.skills.evasion.modifier + vehicleSystem.pil;

                vehicleSystem.skills.perception.points = this.getHighestAutosoftRating(this.items, "CLEARSIGHT");
                vehicleSystem.skills.perception.pool = vehicleSystem.skills.perception.points + vehicleSystem.skills.perception.modifier + vehicleSystem.sen;

                vehicleSystem.skills.cracking.points = this.getHighestAutosoftRating(this.items, "ELECTRONIC_WARFARE");
                vehicleSystem.skills.cracking.pool = vehicleSystem.skills.cracking.points + vehicleSystem.skills.cracking.modifier + vehicleSystem.sen;
                
                vehicleSystem.skills.stealth.points = this.getHighestAutosoftRating(this.items, "STEALTH");
                vehicleSystem.skills.stealth.pool = vehicleSystem.skills.stealth.points + vehicleSystem.skills.stealth.modifier + vehicleSystem.pil;
            break;

            case VehicleOpMode.MANUAL:
            case VehicleOpMode.RIGGED_AR:
            case VehicleOpMode.RIGGED_VR:
                // Get owner actor
                let owner = undefined;
                if (vehicleSystem.vehicle.belongs) {
                    owner = game.actors.get(vehicleSystem.vehicle.belongs);
                }             

                if (!owner) {
                    console.log("SR6E | Vehicle", this.name,"doesn't have an owner set yet", vehicleSystem.vehicle.belongs);
                    return;
                }        
            
                let ownerSystem = owner.system;
                const controlRigRating = ownerSystem.controlRig ? parseInt(ownerSystem.controlRig) : 0;

                const speedAndDamageModifier = vehicleSystem.vehicle.modifier; 

                let ownerPilotingMod = 0;
                if(ownerSystem.skills.piloting.specialization == vehicleSystem.vtype)
                    ownerPilotingMod = 2;
                else if(ownerSystem.skills.piloting.expertise == vehicleSystem.vtype)
                    ownerPilotingMod = 3;    

                const ownerPilotingPointsSpecialized = ownerSystem.skills.piloting.points + ownerPilotingMod;
                const physicalAttribute = vehicleSystem.vehicle.opMode !== VehicleOpMode.RIGGED_VR ? "rea" : "int";
                const opModeDependingValues = { 
                    initiativeBase: {
                        manual: ownerSystem.attributes["int"].pool, 
                        riggedAR: ownerSystem.attributes["int"].base, 
                        riggedVR: ownerSystem.attributes["int"].pool 
                    },
                    initiativeDicePool: { 
                        manual: ownerSystem.initiative.physical.dicePool, 
                        riggedAR: 1, 
                        riggedVR: ownerSystem.initiative.matrix.dicePool 
                    },
                    physicalAttributeValue: {
                        manual: ownerSystem.attributes[physicalAttribute].pool,
                        riggedAR: ownerSystem.attributes[physicalAttribute].base,
                        riggedVR: ownerSystem.attributes[physicalAttribute].pool
                    }
                };

                vehicleSystem.initiative.physical.base = opModeDependingValues.physicalAttributeValue[vehicleSystem.vehicle.opMode] + opModeDependingValues.initiativeBase[vehicleSystem.vehicle.opMode];
                if(isNaN(vehicleSystem.initiative.physical.mod))
                    vehicleSystem.initiative.physical.mod = 0
                vehicleSystem.initiative.physical.pool = vehicleSystem.initiative.physical.base + vehicleSystem.initiative.physical.mod;
                
                vehicleSystem.initiative.physical.dice = opModeDependingValues.initiativeDicePool[vehicleSystem.vehicle.opMode];
                if(isNaN(vehicleSystem.initiative.physical.diceMod))
                    vehicleSystem.initiative.physical.diceMod = 0
                vehicleSystem.initiative.physical.dicePool = vehicleSystem.initiative.physical.dice + vehicleSystem.initiative.physical.diceMod;

                vehicleSystem.ar.points = ownerPilotingPointsSpecialized + vehicleSystem.sen;
                vehicleSystem.ar.pool = vehicleSystem.ar.points + vehicleSystem.ar.mod;

                dr.base = ownerPilotingPointsSpecialized + vehicleSystem.arm;
                if(!dr.mod) 
                    dr.mod = 0;
                dr.pool = dr.base + dr.mod;

                vehicleSystem.skills.piloting.points = ownerPilotingPointsSpecialized + controlRigRating + opModeDependingValues.physicalAttributeValue[vehicleSystem.vehicle.opMode] - speedAndDamageModifier;
                vehicleSystem.skills.piloting.pool = vehicleSystem.skills.piloting.points + vehicleSystem.skills.piloting.modifier;

                vehicleSystem.skills.evasion.points = ownerPilotingPointsSpecialized + controlRigRating + opModeDependingValues.physicalAttributeValue[vehicleSystem.vehicle.opMode] - speedAndDamageModifier;
                vehicleSystem.skills.evasion.pool = vehicleSystem.skills.evasion.points + vehicleSystem.skills.evasion.modifier;

                vehicleSystem.skills.perception.points = ownerSystem.skills.perception.pool;
                vehicleSystem.skills.perception.pool = vehicleSystem.skills.perception.points + vehicleSystem.skills.perception.modifier;

                vehicleSystem.skills.cracking.points = ownerSystem.skills.cracking.pool;
                vehicleSystem.skills.cracking.pool = vehicleSystem.skills.cracking.points + vehicleSystem.skills.cracking.modifier;
                
                vehicleSystem.skills.stealth.points = ownerSystem.skills.stealth.pool;
                vehicleSystem.skills.stealth.pool = vehicleSystem.skills.stealth.points + vehicleSystem.skills.stealth.modifier;
                break;

            default:
                console.log("SR6E | Undefined VehicleOpMode", vehicleSystem.vehicle.opMode);
                break;
        }
    }

    _prepareVehicleActorItems() {
        console.debug("SR6E | _prepareVehicleActorItems", this);
        const vehicleSystem = this.system;
        const vehicleWeapons = this.items.filter(item => item.type == "gear" && isWeapon(item.system));
        vehicleWeapons.forEach((item) => {
            let system = item.system;
            let gear = system;
            if (gear.skill && gear.skill != "") {
                switch (vehicleSystem.vehicle.opMode) {
                    case "autonomous":
                        const targetingRating = this.getHighestAutosoftRating(this.items, "TARGETING");
                        gear.pool = targetingRating + vehicleSystem.sen + gear.modifier;
                        break;
                    case "manual":
                    case "riggedAR":
                    case "riggedVR":
                        if (this.system.vehicle.belongs) {
                            let ownerActor = game.actors.get(this.system.vehicle.belongs);
                            if (ownerActor) {
                                gear.pool = ownerActor._getSkillPool("engineering", "gunnery", "log")
                                    + gear.modifier
                                    - this.system.vehicle.modifier;
                            } else {
                                console.log("SR6E | Vehicle owner not found", this, vehicleSystem.vehicle.belongs);
                            }
                        }
                        break;
                    default:
                        console.log("SR6E | Undefined VehicleOpMode", vehicleSystem.vehicle.opMode);
                        break;
                }
                    
            }
        });
    }

    _getOwnerActor(sceneId = null, tokenId = null) {
        let actor = null;
        if(this.type == "Vehicle") {
            if(this.system.vehicle.belongs) {
                //Todo: Can only assign actors directly, not (unlinked) token actors
                actor = getActor(this.system.vehicle.belongs);
            }
        }

        return actor;
    }
    //---------------------------------------------------------
    /*
     *
     */
    async _checkPersonaChanges(changes) {
        console.log("SR6E | Shadowrun6Actor._checkPersonaChanges()", changes);
        if (this.system.mortype == "technomancer") {
            if (changes.system?.attributes !== undefined || changes.system?.persona?.living?.mod !== undefined) {
                await this.updatePersona();
            }
        } else {
            if (changes.system?.persona?.device?.mod !== undefined) {
                await this.updatePersona();
            }
        }
      }
    async updatePersona() {
        console.debug("SR6E | updatePersona after enabling/disabling matrix device");
        const system = getSystemData(this);
        let updatedPersona = {};
        this._preparePersona();
        if (system.mortype == "technomancer") {
            updatedPersona = {
                [`system.persona.used.a`]: parseInt(system.persona.living.base.a??0) + parseInt(system.persona.living.mod.a??0),
                [`system.persona.used.s`]: parseInt(system.persona.living.base.s??0) + parseInt(system.persona.living.mod.s??0),
                [`system.persona.used.d`]: parseInt(system.persona.living.base.d??0) + parseInt(system.persona.living.mod.d??0),
                [`system.persona.used.f`]: parseInt(system.persona.living.base.f??0) + parseInt(system.persona.living.mod.f??0)
            };
        } else {
            updatedPersona = {
                [`system.persona.used.a`]: parseInt(system.persona.device.base.a??0) + parseInt(system.persona.device.base.a?(system.persona.device.mod.a??0):0),
                [`system.persona.used.s`]: parseInt(system.persona.device.base.s??0) + parseInt(system.persona.device.base.s?(system.persona.device.mod.s??0):0),
                [`system.persona.used.d`]: parseInt(system.persona.device.base.d??0) + parseInt(system.persona.device.base.d?(system.persona.device.mod.d??0):0),
                [`system.persona.used.f`]: parseInt(system.persona.device.base.f??0) + parseInt(system.persona.device.base.f?(system.persona.device.mod.f??0):0)
            };
        }
        await this.update(updatedPersona);
    }
    _preparePersona() {
        //TODO figure out what devRating is still used for
        const actorData = getActorData(this);
        const system = getSystemData(this);
        if (!system.persona)
            system.persona = new Persona();
        if (!system.persona.used)
            system.persona.used = new MatrixDevice();
        if (!system.persona.device)
            system.persona.device = new DevicePersona();
        if (!system.persona.device.base)
            system.persona.device.base = new MatrixDevice();
        if (!system.persona.device.mod)
            system.persona.device.mod = new MatrixDevice();
        if (!system.persona.living)
            system.persona.living = new LivingPersona();
        if (!system.persona.living.mod)
            system.persona.living.mod = new MatrixDevice();
        if (!system.persona.monitor)
            system.persona.monitor = new Monitor();
        if (!system.persona.initiative)
            system.persona.initiative = new Initiative();
        system.persona.device.base.a = 0;
        system.persona.device.base.s = 0;
        system.persona.device.base.d = 0;
        system.persona.device.base.f = 0;
        actorData.items.forEach((tmpItem) => {
            const systemItem = getSystemData(tmpItem);
            if (tmpItem.type == "gear" && isMatrixDevice(systemItem)) {
                let item = getSystemData(tmpItem);
                if (item.subtype == "COMMLINK" || item.subtype == "CYBERJACK" || item.subtype == "RIGGER_CONSOLE") {
                    if (item.usedForPool) {
                        system.persona.device.base.d = parseInt(item.d);
                        system.persona.device.base.f = parseInt(item.f);
                        if (!system.persona.monitor.max) {
                            system.persona.monitor.max = parseInt(item.subtype == "COMMLINK" ? item.devRating : item.devRating) / 2 + 8;
                        }
                    }
                }
                if (item.subtype == "CYBERDECK") {
                    if (item.usedForPool) {
                        system.persona.device.base.a = (item.a);
                        system.persona.device.base.s = (item.s);
                        system.persona.monitor.max = parseInt(item.devRating) / 2 + 8;
                    }
                }
            }
        });
        console.log("SR6E | preparePersona: device=", system.persona.device);
        // Living persona
        if (system.mortype == "technomancer") {
            if (!system.persona.living)
                system.persona.living = new LivingPersona();
            if (!system.persona.living.base)
                system.persona.living.base = new MatrixDevice();
            if (!system.persona.living.mod)
                system.persona.living.mod = new MatrixDevice();
            system.persona.living.base.a = parseInt(system.attributes["cha"].pool);
            system.persona.living.base.s = parseInt(system.attributes["int"].pool);
            system.persona.living.base.d = parseInt(system.attributes["log"].pool);
            system.persona.living.base.f = parseInt(system.attributes["wil"].pool);
            system.persona.living.base.devRating = parseInt(system.attributes["res"].pool);
            // Initiative: Data processing + Intuition
            system.persona.initiative = new Initiative();
            system.persona.initiative.base = system.persona.living.base.d + parseInt(system.attributes["int"].pool);
        }
        /*
        if (actorData.skills) {
            // Attack pool
            actorData.persona.attackPool = actorData.skills["cracking"].points + actorData.skills["cracking"].modifier;
            if (actorData.skills.expertise=="cybercombat") { actorData.persona.attackPool+=3} else
            if (actorData.skills.specialization=="cybercombat") { actorData.persona.attackPool+=2}
            actorData.persona.attackPool += actorData.attributes["log"].pool;
        }

        // Damage
        actorData.persona.damage = Math.ceil(actorData.persona.used.a/2);
        */
    }
    //---------------------------------------------------------
    /*
     * Calculate the attributes like Initiative
     */
    _calculateEssence() {
        const data2 = getSystemData(this);
        const actorData = getActorData(this);
        if (!isLifeform(data2))
            return;
        const system = data2;
        
        let essence = parseFloat(actorData.system.attributes.essence.pool);
        actorData.items.forEach((tmpItem) => {
            let item = getItemData(tmpItem);
            let itemSystem = getSystemData(tmpItem);
            if (item.type == "gear" && itemSystem && itemSystem.essence) {
                essence -= parseFloat(itemSystem.essence);
            }
        });
        system.essence = parseFloat(essence).toFixed(2);
    }
    //---------------------------------------------------------
    _getWoundModifierPerMonitor(monitor) {
        /* Get the penalties for physical and stun damage. Every 3 boxes = -1 penalty */
        let remain = monitor.max - monitor.dmg;
        let modifier = Math.floor(monitor.dmg / 3);
        // In the last row, if the last box is full the modifier is increased by one
        if (remain > 0 && monitor.max % 3 == remain)
            modifier++;
        return modifier;
    }
    //---------------------------------------------------------
    getWoundModifier() {
        const data = getSystemData(this);
        let woundModifier = this._getWoundModifierPerMonitor(data.physical) + this._getWoundModifierPerMonitor(data.stun);
        /* Return the combined penalties from physical and stun damage */
        console.log("SR6E | Current Wound Penalties: " + woundModifier);
        return woundModifier;
    }
    //---------------------------------------------------------
    getSustainedSpellsModifier() {
        const actorData = getActorData(this);
        const items = actorData.items;
        let sustainedCount = 0;
        let sustainedModifier = 0;
        items.forEach((item) => {
            let itemSystem = getSystemData(item);
            if (item.type == "spell" && itemSystem.duration == "sustained") {
                if (itemSystem.isSustained) {
                    sustainedCount++;
                }
            }
        });
        // if (sustainedCount > 0) {                    //unclear why this block was here originally
        //     sustainedCount = sustainedCount - 1;
        // }
        sustainedModifier = sustainedCount * 2;
        console.log("SR6E | Sustained Spells Modifier: " + sustainedModifier);
        return sustainedModifier;
    }
    //---------------------------------------------------------
    /**
     * Convert skill, optional skill specialization and optional threshold
     * into a roll name for display
     * @param {string} skillId      The skill id (e.g. "con")
     * @param {string} spec         The skill specialization
     * @param {int}    threshold    Optional threshold
     * @return Roll name
     */
    _getSkillCheckText(roll) {
        // Build test name
        let rollName = game.i18n.localize("skill." + roll.skillId);
        if (roll.skillSpec) {
            rollName += "/" + game.i18n.localize("shadowrun6.special." + roll.skillId + "." + roll.skillSpec);
        }
        rollName += " + ";
        // Attribute
        let useAttrib = roll.attrib != undefined ? roll.attrib : CONFIG.SR6.ATTRIB_BY_SKILL.get(roll.skillId).attrib;
        let attrName = game.i18n.localize("attrib." + useAttrib);
        rollName += attrName;
        if (roll.threshold && roll.threshold > 0) {
            rollName += " (" + roll.threshold + ")";
        }
        return rollName;
    }
    //---------------------------------------------------------
    _getVehicleCheckText(roll) {
        // Build test name
        let rollName = game.i18n.localize("shadowrun6.vehicle.skill." + roll.skillId);
        if (roll.threshold && roll.threshold > 0) {
            rollName += " (" + roll.threshold + ")";
        }
        return rollName;
    }
    //---------------------------------------------------------
    /**
     * Calculate the skill pool
     * @param {string} skillId      The skill id (e.g. "con")
     * @param {string} spec         Optional: The skill specialization
     * @return Roll name
     */
    _getSkillPool(skillId, spec, attrib = undefined) {
        const system = getSystemData(this);
        if (!skillId)
            throw "Skill ID may not be undefined";
        const skl = system.skills[skillId];
        if (!skillId) {
            throw "Unknown skill '" + skillId + "'";
        }
        let skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(skillId);
        if (!attrib) {
            attrib = skillDef.attrib;
        }
        // Calculate pool
        let value = skl.points + skl.modifier;
        if (skl.points == 0) {
            if (skillDef.useUntrained) {
                value -= 1;
            }
            else
                return 0;
        }
        if (spec) {
            if (spec == skl.expertise) {
                value += 3;
            }
            else if (spec == skl.specialization) {
                value += 2;
            }
        }
        // Add attribute
        value = parseInt("" + value);
        value += parseInt(system.attributes[attrib].pool);
        return value;
    }
    //---------------------------------------------------------
    /**
     * Return a translated complex form name
     * @param {Object} spell      The spell to cast
     * @return Roll name
     */
    _getComplexFormName(complex, item) {
        if (complex.genesisID) {
            const key = "shadowrun6.compendium.complexform." + complex.genesisID;
            let name = game.i18n.localize(key);
            if (key != name)
                return name;
        }
        if (item)
            return item.name;
        throw new Error("Spell: No genesisID and no item");
    }
    //---------------------------------------------------------
    /**
     * Return a translated spell name
     * @param {Object} spell      The spell to cast
     * @return Roll name
     */
    _getSpellName(spell, item) {
        if (spell.genesisID) {
            const key = "shadowrun6.compendium.spell." + spell.genesisID;
            let name = game.i18n.localize(key);
            if (key != name)
                return name;
        }
        if (item)
            return item.name;
        throw new Error("Spell: No genesisID and no item");
    }
    //---------------------------------------------------------
    /**
     * Return a translated gear name
     * @param {Object} item   The gear to use
     * @return Display name
     */
    _getGearName(gear, item) {
        if (gear.genesisID) {
            const key = "shadowrun6.compendium.gear." + gear.genesisID;
            let name = game.i18n.localize(key);
            if (key != name)
                return name;
        }
        if (item)
            return item.name;
        throw new Error("Gear: No genesisID and no item");
    }
    //---------------------------------------------------------
    /**
     * @param {Function} func   function to return value from actor
     * @return Value
     */
    _getHighestDefenseRating(map) {
        let highest = 0;
        for (var it = game.user.targets.values(), val = null; (val = it.next().value);) {
            //console.log("SR6E | _getHighestDefenseRating: Target Token: val = ", val);
            let token = val;
            let actor = token.actor;
            let here = map(actor);
            console.log("SR6E | Defense Rating of ", token, " is ", here);
            if (here > highest)
                highest = here;
        }
        return highest;
    }
    //---------------------------------------------------------
    /**
     * @param roll	Skill roll to manipulate
     */
    updateSkillRoll(roll, attrib) {
        // Prepare check text
        roll.checkText = this._getSkillCheckText(roll);
        // Calculate pool
        roll.pool = this._getSkillPool(roll.skillId, roll.skillSpec, attrib);
        roll.calcPool = roll.pool;
        console.log("SR6E | updateSkillRoll()", roll);
    }
    //---------------------------------------------------------
    /**
     * Roll a simple skill test
     * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
     * @param {string} skillId      The skill id (e.g. "con")
     * @param {string} spec         The skill specialization
     * @param {int}    threshold    Optional threshold
     * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
     */
    rollSkill(roll) {
        console.log("SR6E | rollSkill(", roll, ")");
        roll.actor = this;
        // Prepare check text
        roll.checkText = this._getSkillCheckText(roll);
        // Find attribute
        let skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(roll.skillId);
        if (!roll.attrib)
            roll.attrib = skillDef.attrib;
        roll.actionText = roll.checkText; // (game as Game).i18n.format("shadowrun6.roll.actionText.skill");
        // Calculate pool
        roll.pool = this._getSkillPool(roll.skillId, roll.skillSpec);
        console.log("SR6E | rollSkill(", roll, ")");
        roll.allowBuyHits = true;
        roll.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(roll);
    }
    //-------------------------------------------------------------
    /*
     *
     */
    rollItem(roll) {
        console.log("SR6E | rollItem(", roll, ")");
        roll.actor = this;
        // Prepare check text
        roll.checkText = this._getSkillCheckText(roll);
        // Calculate pool
        if (roll.pool == 0) {
            roll.pool = this._getSkillPool(roll.skillId, roll.skillSpec);
        }
        console.log("SR6E | rollItem(", roll, ")");
        let item = roll.gear;
        roll.allowBuyHits = true;
        // If present, replace item name, description and source references from compendium
        roll.itemName = roll.item.name;
        if (roll.gear.description) {
            roll.itemDesc = roll.gear.description;
        }
        if (roll.gear.genesisID) {
            let key = "item." + roll.gear.genesisID + ".";
            if (!game.i18n.localize(key + "name").startsWith(key)) {
                // A translation exists
                roll.itemName = game.i18n.localize(key + "name");
                roll.itemDesc = game.i18n.localize(key + "desc");
                roll.itemSrc = game.i18n.localize(key + "src");
            }
        }
        switch (game.user.targets.size) {
            case 0:
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.attack_target_none", { name: roll.itemName });
                break;
            case 1:
                let targetName = game.user.targets.values().next().value.name;
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.attack_target_one", { name: roll.itemName, target: targetName });
                break;
            default:
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.attack_target_multiple", { name: roll.itemName });
        }
        // Prepare check text
        let checkText = this._getSkillCheckText(roll);
        roll.targets = Array.from(game.user.targets.values(), token => new TokenData(token));
        console.log("SR6E | Roll targets ", roll.targets);
        let highestDefenseRating = this._getHighestDefenseRating((a) => {
            console.log("SR6E | Determine defense rating of ", a);
            return a.system.defenserating.physical.pool;
        });
        console.log("SR6E | Highest defense rating of targets: " + highestDefenseRating);
        if (highestDefenseRating > 0)
            roll.defenseRating = highestDefenseRating;
        roll.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(roll);
    }
    //-------------------------------------------------------------
    /**
     * Roll a spell test. Some spells are opposed, some are simple tests.
     * @param {object} SkillRoll    The RitualRoll or SpellRoll object
     * @param {boolean} ritual      TRUE if ritual spellcasting is used
     * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
     */
    rollSpell(roll, ritual) {
        console.log("SR6E | rollSpell( roll=", roll, "ritual=", ritual);
        roll.skillSpec = ritual ? "ritual_spellcasting" : "spellcasting";
        roll.threshold = 0;
        // If present, replace spell name, description and source references from compendium
        roll.spellName = this._getSpellName(roll.spell, roll.item);

        if (roll.spell.description) {
            roll.spellDesc = roll.spell.description;
        }
        if (roll.spell.genesisID) {
            let key = (ritual ? "ritual." : "spell.") + roll.spell.genesisID + ".";
            if (!game.i18n.localize(key + "name").startsWith(key)) {
                // A translation exists
                roll.spellName = game.i18n.localize(key + "name");
                roll.spellDesc = game.i18n.localize(key + "desc");
                roll.spellSrc = game.i18n.localize(key + "src");
            }
        }
        // Prepare action text
        switch (game.user.targets.size) {
            case 0:
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.cast_target_none", { name: roll.spellName });
                break;
            case 1:
                let targetName = game.user.targets.values().next().value.name;
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.cast_target_one", { name: roll.spellName, target: targetName });
                break;
            default:
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.cast_target_multiple", { name: roll.spellName });
        }
        roll.actor = this;
        // Prepare check text
        roll.checkText = this._getSkillCheckText(roll);
        // Calculate pool
        roll.pool = this._getSkillPool(roll.skillId, roll.skillSpec);
        // Determine whether or not the spell is an opposed test
        // and what defense eventually applies
        roll.attackRating = roll.performer.attackrating.astral.pool;
        let highestDefenseRating = this._getHighestDefenseRating((a) => a.system.defenserating.physical.pool);
        console.log("SR6E | Highest defense rating of targets: " + highestDefenseRating);

        if (highestDefenseRating > 0)
            roll.defenseRating = highestDefenseRating;

        roll.canAmpUpSpell = roll.spell.category === "combat";
        roll.canIncreaseArea = roll.spell.range === "line_of_sight_area" || roll.spell.range === "self_area";

        roll.targets = Array.from(game.user.targets.values(), token => new TokenData(token));
        console.log("SR6E | Roll targets ", roll.targets);

        if (roll.spell.category === "combat") {
               roll.defendWith = roll.spell.combatSpellType;
               roll.monitor = roll.item.system.damage;
        }
        else if (roll.spell.category === "manipulation") {
            roll.defendWith = Defense.SPELL_OTHER;
        }
        else if (roll.spell.category === "health") {
            if (roll.spell.withEssence) {
                console.log("SR6E | Heal spell interacting with Essense");
                if (roll.spell.range ==="self" && isLifeform(this.system)) {
                    roll.threshold = 5 - Math.ceil(this.system.essence);

                } else if (roll.spell.range !=="self") {
                    console.log("SR6E | Not a self only target, must use a target");
                    let token;
                    if (game.user.targets.size) {
                        //Use current target token
                        game.user.targets.forEach((target) => {
                            token = target;
                        });
                        if(isLifeform(token.actor.system)) {
                            roll.threshold = 5 - Math.ceil(token.actor.system.essence);
                        } else {
                            ui.notifications.warn("shadowrun6.ui.notifications.Target_is_not_a_life_form", { localize: true });
                            return;
                        }
                    } else {
                        ui.notifications.warn("shadowrun6.ui.notifications.Target_a_token_before_rolling", { localize: true });
                        return;
                    }

                }
                
            }
        }

        if (roll.item.type === 'ritual') {
            roll.threshold = roll.item.system.threshold;
        }

        roll.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(roll);
    }
    //-------------------------------------------------------------
    /**
     */
    rollDefense(defendWith, threshold, damage, monitor) {
        console.log("SR6E | rollDefense: ", defendWith, threshold, damage, monitor);
        const data = getSystemData(this);

        if (!isLifeform(data)) {
            throw "Can only roll defenses for lifeforms";
        }
        let defensePool = undefined;
        let rollData = new DefenseRoll(threshold, monitor);
        let gameI18n = game.i18n;
        switch (defendWith) {
            case Defense.PHYSICAL:
                defensePool = data.defensepool.physical;
                // In combat defense, the defender must have MORE hits than the attacker to completely defend
                rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.defense." + defendWith, { threshold: 0 });
                rollData.checkText = gameI18n.localize("attrib.rea") + " + " + gameI18n.localize("attrib.int") + " (" + threshold + ")";
                break;
            case Defense.SPELL_INDIRECT:
                defensePool = data.defensepool.spells_indirect;
                rollData.actionText = gameI18n.localize("shadowrun6.roll.actionText.defense." + defendWith);
                rollData.checkText = gameI18n.localize("attrib.rea") + " + " + gameI18n.localize("attrib.wil") + " (" + threshold + ")";
                break;
            case Defense.SPELL_DIRECT:
                rollData.allowSoak = false;
                defensePool = data.defensepool.spells_direct;
                rollData.actionText = gameI18n.localize("shadowrun6.roll.actionText.defense." + defendWith);
                rollData.checkText = gameI18n.localize("attrib.wil") + " + " + gameI18n.localize("attrib.int") + " (" + threshold + ")";
                break;
            case Defense.SPELL_OTHER:
                defensePool = data.defensepool.spells_other;
                rollData.actionText = gameI18n.localize("shadowrun6.roll.actionText.defense." + defendWith);
                rollData.checkText = gameI18n.localize("attrib.wil") + " + " + gameI18n.localize("attrib.int");
                break;
            default:
                console.log("SR6E | Error! Don't know how to handle defense rolls for " + defendWith);
                ui.notifications.error("SR6E | Error! Don't know (yet) how to handle defense rolls for " + defendWith);
                return;
        }
        console.log("SR6E | Defend with pool ", defensePool);
        // Prepare action text
        console.log("SR6E | DefenseRoll ", rollData);
        rollData.damage = damage;
        rollData.actor = this;
        rollData.allowBuyHits = false;
        rollData.pool = defensePool.pool;
        rollData.rollType = RollType.Defense;
        rollData.performer = data;
        rollData.speaker = ChatMessage.getSpeaker({ actor: this });
        console.log("SR6E | Defend roll config ", rollData);
        return doRoll(rollData);
    }
    //-------------------------------------------------------------
    /**
     */
    rollSoak(soak, damage) {
        console.log("SR6E | rollSoak: " + damage + " " + soak);
        const data = this.system;
        if (!isLifeform(data)) {
            throw "Can only roll defenses for lifeforms";
        }
        let defensePool = undefined;
        let rollData = new SoakRoll(damage, soak);
        let gameI18n = game.i18n;
        switch (soak) {
            case SoakType.DAMAGE_PHYSICAL:
                defensePool = data.defensepool.damage_physical;
                rollData.monitor = MonitorType.PHYSICAL;
                rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.soak." + soak, { damage: damage });
                rollData.checkText = gameI18n.localize("attrib.bod") + " (" + damage + ")";
                break;
            case SoakType.DAMAGE_STUN:
                defensePool = data.defensepool.damage_physical;
                rollData.monitor = MonitorType.STUN;
                rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.soak." + soak, { damage: damage });
                rollData.checkText = gameI18n.localize("attrib.bod") + " (" + damage + ")";
                break;
            case SoakType.DRAIN:
                defensePool = data.defensepool.drain;
                rollData.monitor = MonitorType.STUN; 
                rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.soak." + soak, { damage: damage });
                rollData.checkText = gameI18n.localize("attrib.wil") + " + ? (" + damage + ")";
                if (data.tradition != null) {
                    rollData.checkText =
                        gameI18n.localize("attrib.wil") + " + " + gameI18n.localize("attrib." + data.tradition.attribute) + " (" + damage + ")";
                }
                break;
            case SoakType.FADING:
                defensePool = data.defensepool.fading;
                rollData.monitor = MonitorType.STUN;
                rollData.actionText = gameI18n.format("shadowrun6.roll.actionText.soak." + soak, { damage: damage });
                rollData.checkText = gameI18n.localize("attrib.wil") + " + ? (" + damage + ")";
                if (data.tradition != null) {
                    rollData.checkText =
                        gameI18n.localize("attrib.wil") + " + " + gameI18n.localize("attrib." + data.tradition.attribute) + " (" + damage + ")";
                }
                break;
            default:
                console.log("SR6E | Error! Don't know how to handle soak pool for " + soak);
                throw "Error! Don't know how to handle soak pool for " + soak;
        }
        console.log("SR6E | Defend with pool ", defensePool);
        // Prepare action text
        console.log("SR6E | before ", rollData);
        rollData.threshold = damage;
        console.log("SR6E | after ", rollData);
        rollData.actor = this;
        rollData.allowBuyHits = false;
        rollData.pool = defensePool.pool;
        rollData.performer = data;
        rollData.speaker = ChatMessage.getSpeaker({ actor: this });
        console.log("SR6E | Soak roll config ", rollData);
        return doRoll(rollData);
    }
    //---------------------------------------------------------
    /**
     */
    rollVehicle(roll) {
        console.log("SR6E | rollVehicle", roll);
        roll.actor = this;
        
        if(roll.skillValue) {
            roll.checkText = this._getVehicleCheckText(roll);
            roll.pool = roll.skillValue.pool;
        }
        roll.actionText = roll.checkText;
        roll.allowBuyHits = true;
        roll.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(roll);

    }
    //---------------------------------------------------------
    /**
     */
    performMatrixAction(roll) {
        console.log("SR6E | ToDo performMatrixAction:", roll);
        if (!isLifeform(this.system)) {
            throw new Error("Must be executed by an Actor with Lifeform data");
        }
        let action = roll.action;
        roll.attrib = action.attrib;
        roll.skillId = action.skill;
        roll.skillSpec = action.specialization;
        roll.threshold = action.threshold;
        // Prepare action text
        roll.actionText = game.i18n.localize("shadowrun6.matrixaction." + action.id + ".name");
        // Prepare check text
        if (!action.skill) {
            //TODO matrix actions without a test
            console.log("SR6E | ToDo: matrix actions without a test");
            return;
        }
        roll.checkText = this._getSkillCheckText(roll);
        // Calculate pool
        roll.pool = this._getSkillPool(action.skill, action.specialization, action.attrib);
        /*
        // Roll and return
        let data = foundry.utils.mergeObject(options, {
            pool: value,
            actionText: actionText,
            checkText  : checkText,
            attackRating : this.data.data.attackrating.matrix.pool,
            matrixAction: action,
            skill: action.skill,
            spec: action.spec,
            threshold: action.threshold,
            isOpposed: action.opposedAttr1!=null,
            rollType: "matrixaction",
            isAllowDefense: action.opposedAttr1!=null,
            useThreshold: action.threshold!=0,
            buyHits: true
        });
        */
        roll.actor = this;
        roll.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(roll);
    }
    //-------------------------------------------------------------
    /**
     * Roll a complex form test. Some complex forms are opposed, some are simple tests.
     * @param {string} itemId       The item id of the spell
     * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
     */
    rollComplexForm(roll) {
        console.log("SR6E | rollComplexForm( roll=", roll);
        roll.threshold = roll.item.system.threshold ? roll.item.system.threshold : 0;
        // If present, replace spell name, description and source references from compendium
        roll.formName = this._getComplexFormName(roll.form, roll.item);
        if (roll.form.description) {
            roll.formDesc = roll.form.description;
        }
        if (roll.form.genesisID) {
            let key = "complex_form." + roll.form.genesisID + ".";
            if (!game.i18n.localize(key + "name").startsWith(key)) {
                // A translation exists
                roll.formName = game.i18n.localize(key + "name");
                roll.formDesc = game.i18n.localize(key + "desc");
                roll.formSrc = game.i18n.localize(key + "src");
            }
        }
        // Prepare action text
        switch (game.user.targets.size) {
            case 0:
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.cast_target_none", { name: roll.formName });
                break;
            case 1:
                let targetName = game.user.targets.values().next().value.name;
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.cast_target_one", { name: roll.formName, target: targetName });
                break;
            default:
                roll.actionText = game.i18n.format("shadowrun6.roll.actionText.cast_target_multiple", { name: roll.formName });
        }
        roll.actor = this;
        // Prepare check text
        roll.checkText = this._getSkillCheckText(roll);
        
        roll.defendWith = Defense.MATRIX;

        // Calculate pool
        roll.pool = this._getSkillPool(roll.skillId, roll.skillSpec, roll.attrib);
        roll.attackRating = this._getSkillPool('electronics', '', 'res');

        let highestDefenseRating = this._getHighestDefenseRating((a) => a.system.defenserating.matrix.pool);
        console.log("SR6E | Highest matrix defense rating of targets: " + highestDefenseRating);
        if (highestDefenseRating > 0)
            roll.defenseRating = highestDefenseRating;
        roll.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(roll);
    }
    //-------------------------------------------------------------
    async applyDamage(monitor, damage, newDmg) {
        console.log("SR6E | applyDamage", monitor, damage, newDmg);
        const data = this.system;
        const damageObj = data[monitor];
        console.log("SR6E | applyDamage | damageObj =", damageObj);
        let overflow = (data.overflow?.dmg) ? data.overflow.dmg : 0;
        let physicalOverflow = 0;

        newDmg = (typeof newDmg !== 'undefined') ? newDmg : overflow + damageObj.dmg + damage;
        // Did damage overflow the monitor?
        let newOverflow = Math.max(0, newDmg - damageObj.max);

        if (newOverflow > 0 && monitor === 'stun') {
            //need to overflow into physical instead
            physicalOverflow = newOverflow;
            newOverflow = 0;
        }

        console.log("SR6E | applyDamage newDmg=", newDmg, "   overflow=", overflow);
        // Ensure actual damage is not higher than pool
        newDmg = Math.min(Math.max(0, newDmg), damageObj.max);

        await this.update({
            [`system.` + monitor + `.dmg`]: newDmg,
            [`system.overflow.dmg`]: newOverflow
        });
        await this.checkUnconscious();
        console.log("SR6E | applyDamage | Added " + damage + " to monitor " + monitor + " of " + this.name + " which results in overflow " + newOverflow + " on " + this.name);
        this._prepareDerivedAttributes();

        if (physicalOverflow > 0) {
            //Overflowing into physical instead
            console.log("SR6E | applyDamage | Overflowing stun into physical of " + physicalOverflow + " on " + this.name);
            await this.applyDamage('physical', physicalOverflow);
            ui.notifications.warn("shadowrun6.ui.notifications.do_not_revert_damage", { localize: true });
        }
    }

    async checkUnconscious() {
        if (this.system.physical.dmg === this.system.physical.max || this.system.stun.dmg === this.system.stun.max) {
            await this.toggleStatusEffect('unconscious', {active:true});
        } else {
            await this.toggleStatusEffect('unconscious', {active:false});
        }
    }
    //-------------------------------------------------------------
    /*
     *
     */
    rollCommonCheck(roll, dialogConfig, options = {}) {
        console.log("SR6E | rollCommonCheck");
        roll.dialogConfig = dialogConfig;
        roll.actor = this;
        roll.speaker = ChatMessage.getSpeaker({ actor: this });
        return doRoll(roll);
    }
    /***************************************
     *
     **************************************/
    getMaxEdgeGainThisRound() {
        return 2;
    }

    // Calculate autosoft ratings
    getHighestAutosoftRating(itemList, autosoftCategory) {
        const autosoftList = itemList.filter(item => item.type == "software" 
            && item.system.subtype == autosoftCategory 
            && item.system.type == "AUTOSOFT");

        if(!autosoftList || autosoftList.length == 0) {
            return 0;
        }
        let highestRating = autosoftList.reduce((max, cur) => 
                                {
                                    let c = cur.system.rating;
                                    let m = max.system ? max.system.rating : 0;
                                    return c > m ? c : m, autosoftList[0];
                                })?.system.rating;
        if(!highestRating) 
            highestRating = 0;

        return highestRating;
    }

    createAttackRatingProperties(system) {
        if (!system.attackrating)
            system.attackrating = new Ratings();
        if (!system.attackrating.physical)
            system.attackrating.physical = new Attribute();
        if (!system.attackrating.astral)
            system.attackrating.astral = new Attribute();
        if (!system.attackrating.vehicle)
            system.attackrating.vehicle = new Attribute();
        if (!system.attackrating.matrix)
            system.attackrating.matrix = new Attribute();
        if (!system.attackrating.social)
            system.attackrating.social = new Attribute();
        if (!system.attackrating.resonance)
            system.attackrating.resonance = new Attribute();
    }

    createDefenseRatingProperties(system) {
        if (!system.defenserating)
            system.defenserating = new Ratings();
        if (!system.defenserating.physical)
            system.defenserating.physical = new Attribute();
        if (!system.defenserating.astral)
            system.defenserating.astral = new Attribute();
        if (!system.defenserating.vehicle)
            system.defenserating.vehicle = new Attribute();
        if (!system.defenserating.matrix)
            system.defenserating.matrix = new Attribute();
        if (!system.defenserating.social)
            system.defenserating.social = new Attribute();
        if (!system.defenserating.resonance)
            system.defenserating.resonance = new Attribute();
    }

    //-------------------------------------------------------------
    async importFromJSON(json) {
        console.log("SR6E | importFromJSON");
        const sourceData = JSON.parse(json);
        // Checking if user is trying to import GENESIS or COMMLINK data
        if (sourceData.system === "SHADOWRUN6") {
            ui.notifications.error("shadowrun6.ui.notifications.wrong_import_file", { localize: true });
            return;
        }

        return super.importFromJSON(JSON.stringify(sourceData));
    }

    get gruntGroup() {
        const gruntGroup = {}
        gruntGroup.id = this.token?.getFlag(game.system.id, 'GruntGroupId');
        let groupMembers = 0;
        if (gruntGroup.id) {
            canvas.tokens.ownedTokens.forEach(async (token) => {
                if (token.document.getFlag(game.system.id, 'GruntGroupId') === gruntGroup.id)
                    groupMembers++;
            });
        }
        gruntGroup.members = groupMembers;
        gruntGroup.diceMod = Math.max(0, Math.floor( (groupMembers - 1) / 2 ) );
        gruntGroup.arMod   = groupMembers - 1;

        return gruntGroup;
    }

}