import { Shadowrun6ActorSheet } from "./SR6ActorSheet.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CompendiumActorSheetNPC extends Shadowrun6ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["shadowrun6", "sheet", "actor"],
            template: "systems/shadowrun6-eden/templates/compendium-actor-npc-sheet.html",
            width: 700,
            height: 800,
            editable: false
        });
    }
}