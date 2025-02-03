import { VehicleRoll } from "../dice/RollTypes.js";
import { Shadowrun6ActorSheet } from "./SR6ActorSheet.js";
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
/**
 * Sheet for Vehicle actors
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheetVehicle extends Shadowrun6ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["shadowrun6", "sheet", "actor"],
            template: "systems/shadowrun6-eden/templates/actor/shadowrun6-Vehicle-sheet.html",
            width: 600,
            height: 800,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }],
            scrollY: [".items", ".attributes"],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
            allVehicleUser: this._getAllVehicleUsers()
        });
    }
    activateListeners(html) {
        super.activateListeners(html);
        //	   if (this.actor && this.actor.isOwner) { console.log("SR6E | is owner"); } else { console.log("SR6E | is not owner");}
        // Owner Only Listeners
        if (this.actor.isOwner) {
            html.find(".vehicle-slower").click((ev) => this._onDecelerate(ev, html));
            html.find(".vehicle-faster").click((ev) => this._onAccelerate(ev, html));
            html.find(".vehicleskill-roll").click(this._onRollVehicleSkillCheck.bind(this));
        }
    }
    static _getAllVehicleUsers() {
        const allVehicleUser = { 0: "-" };
        for (const actor of game.actors.filter((actor) => actor.type == "Player" || actor.type == "NPC")) {
            allVehicleUser[actor.id] = actor.name;
        }
        return allVehicleUser;
    }
    async _onDecelerate(event, html) {
        console.log("SR6E | _onDecelerate");
        let system = getSystemData(this.actor);
        let currentSpeed = system.vehicle.speed;
        let newSpeed = currentSpeed - (system.vehicle.offRoad ? system.accOff : system.accOn);
        if (newSpeed < 0)
            newSpeed = 0;
        const field = "system.vehicle.speed";
        await this.actor.updateSource({ [field]: newSpeed });
    }
    async _onAccelerate(event, html) {
        console.log("SR6E | _onAccelerate");
        let system = getSystemData(this.actor);
        let currentSpeed = system.vehicle.speed;
        let newSpeed = currentSpeed + (system.vehicle.offRoad ? system.accOff : system.accOn);
        if (newSpeed > system.tspd)
            newSpeed = system.tspd;
        const field = "vehicle.speed";
        await this.actor.updateSource({ [field]: newSpeed });
    }
    //-----------------------------------------------------
    /**
     * Handle rolling a Skill check
     * @param {Event} event   The originating click event
     * @private
     */
    _onRollVehicleSkillCheck(event, html) {
        console.log("SR6E | _onRollVehicleSkillCheck");
        event.preventDefault();
        if (!event.currentTarget)
            return;
        if (!event.currentTarget.dataset)
            return;
        let dataset = event.currentTarget.dataset;
        const skillId = dataset.skill;
        let actorData = getSystemData(this.actor);
        let vSkill = actorData.skills[skillId];
        console.log("SR6E | Roll skill " + skillId + " with pool " + vSkill.pool + " and a threshold " + actorData.vehicle.modifier);
        let roll = new VehicleRoll(actorData, skillId);
        roll.threshold = actorData.vehicle.modifier;
        console.log("SR6E | onRollSkillCheck before ", roll);
        this.actor.rollVehicle(roll);
    }
}