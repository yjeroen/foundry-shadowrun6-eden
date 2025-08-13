import Shadowrun6ActorSheet from "./SR6ActorSheet.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class Shadowrun6ActorSheetNPC extends Shadowrun6ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["shadowrun6", "sheet", "actor"],
            template: "systems/shadowrun6-eden/templates/actor/shadowrun6-NPC-sheet.html",
            width: 830,
            height: 600,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }],
            scrollY: [".items", ".attributes"],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
        });
    }

    /** @overrride */
    getData() {
        let data = super.getData();
        if (this.token)
            data.gruntGroupId = this.token.getFlag(game.system.id, 'GruntGroupId');
        // Not sure yet if we need to display the whole grunt group tokens
        // if (data.gruntGroupId)
        //     data.gruntGroup = canvas.scene.tokens.filter((tokenDoc) => tokenDoc.getFlag(game.system.id, 'GruntGroupId') === data.gruntGroupId);
        
        return data;
    }

}