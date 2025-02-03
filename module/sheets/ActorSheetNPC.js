import { Shadowrun6ActorSheet } from "./SR6ActorSheet.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheetNPC extends Shadowrun6ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["shadowrun6", "sheet", "actor"],
            template: "systems/shadowrun6-eden/templates/actor/shadowrun6-NPC-sheet.html",
            width: 700,
            height: 800,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }],
            scrollY: [".items", ".attributes"],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
        });
    }
}