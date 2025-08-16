import { VehicleRoll } from "../../dice/RollTypes.js";
import Shadowrun6ActorSheet from "./SR6ActorSheet.js";
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
export default class Shadowrun6ActorSheetVehicle extends Shadowrun6ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["shadowrun6", "sheet", "actor"],
            template: "systems/shadowrun6-eden/templates/actor/shadowrun6-Vehicle-sheet.html",
            width: 640,
            height: 800,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }],
            scrollY: [".items", ".attributes"],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
        });
    }

    async getData() {
        console.log("SR6E | Shadowrun6ActorSheetVehicle.getData()");
        let data = await super.getData();
// <!-- You are moving with {speed} km/h ({speedPerTurn} Meter per turn). Your modifier for checks is {modifier}. -->
        data.speed_info = game.i18n.format("shadowrun6.label.speed_detail", {
                                            speed: data.actor.system.vehicle.kmh,
                                            speedPerTurn: data.actor.system.vehicle.speed,
                                            modifier: data.actor.system.vehicle.modifier
                                        });
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        //	   if (this.actor && this.actor.isOwner) { console.log("SR6E | is owner"); } else { console.log("SR6E | is not owner");}
        // Owner Only Listeners
        if (this.actor.isOwner) {
            html.find(".vehicle-slower").click((ev) => this._onSpeedChange(false));
            html.find(".vehicle-faster").click((ev) => this._onSpeedChange(true));
            html.find(".vehicleskill-roll").click(this._onRollVehicleSkillCheck.bind(this));
        }
    }
    get allVehicleUser() {
        const allVehicleUser = { 0: "-" };
        for (const actor of game.actors.filter((actor) => actor.isOwner && (actor.type == "Player" || actor.type == "NPC") )) {
            allVehicleUser[actor.id] = actor.name;
        }
        return allVehicleUser;
    }

    async _onSpeedChange(acceleration) {
        console.log("SR6E | _onSpeedChange", this);
        let system = getSystemData(this.actor);

        let currentSpeed = system.vehicle.speed;
        let speedChangeFactor = ((system.vehicle.offRoad ? system.accOff : system.accOn) / 2);
        let newSpeed = currentSpeed + (acceleration ? speedChangeFactor : -speedChangeFactor);
        newSpeed = Math.max(0, Math.min(newSpeed, system.tspd));

        await this.actor.update({ ["system.vehicle.speed"]: newSpeed });
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

        let roll = new VehicleRoll();
        if(event.currentTarget.dataset.pool)
            roll.pool = parseInt(event.currentTarget.dataset.pool);
        if(event.currentTarget.dataset.threshold)
            roll.threshold = parseInt(event.currentTarget.dataset.threshold);
        if(event.currentTarget.dataset.caption)
            roll.checkText = event.currentTarget.dataset.caption;
        if(roll.threshold)
            roll.checkText += ` (${roll.threshold})`;
        roll.calcPool = roll.pool;
        this.actor.rollVehicle(roll);
    }
}