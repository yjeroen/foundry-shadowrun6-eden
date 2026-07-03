import { default as Shadowrun6ActorSheet } from "./SR6ActorSheet.js";

/**
 * Extend the basic Shadowrun6ActorSheet so its a limited sheet to use in Matrix Action targetting
 * @extends {ActorSheet}
 */
export class SR6MatrixTargetSheet extends Shadowrun6ActorSheet {
    /**
     * @override
     * @returns {FormApplicationOptions & DocumentSheetV1Options}
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
            classes: ["shadowrun6", "sheet", "actor"],
            template: "systems/shadowrun6-eden/templates/actor/shadowrun6-NPC-sheet-ro.html",
            width: null,
            height: 800,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "overview" }],
            initiator: null,    // Needs to be set when opening the sheet, so we know who is targeting this actor
            launcher: null,     // Needs to be set when opening the sheet, so we can maximize it again when closing this sheet
        });
    }

    get template() {
        console.log("SR6E | SR6MatrixTargetSheet get template()", this.actor.name);
        const path = "systems/shadowrun6-eden/templates/actor/";

        let template;
        if (this.options.readOnlyTemplate) template = this.options.readOnlyTemplate;
        else template = `${path}shadowrun6-${this.actor.type}-sheet-ro.html`;

        console.log("SR6E | ReadOnly sheet:", template);
        return template;
    }

    /** @inheritdoc */
    async getData(options={}) {
        const context = await super.getData(options);
        context.limited = true;
        console.log("SR6E | SR6MatrixTargetSheet getData()", context);
        return context;
    }

    /**
     * Actions performed after closing the Application.
     * @param {RenderOptions} options Provided render options
     * @inheritDoc
     */
    /** @inheritDoc */
    async close(options = {}) {
        await super.close(options);
        if (this.options.launcher) this.options.launcher.maximize();
    }
}