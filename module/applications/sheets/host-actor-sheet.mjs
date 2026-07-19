import SR6BaseActorSheet from "./base-actor-sheet.mjs";
import { MatrixSheetMixin } from "./mixins/_module.mjs";
const { api, sheets } = foundry.applications;

/**
 * Extend the basic SR6 ActorSheet with some very simple modifications
 * @extends {SR6BaseActorSheet}
 */
export default class SR6HostActorSheet extends MatrixSheetMixin( SR6BaseActorSheet ) {
    _defaultTab = "summary";

    /**
     * @override
     * Auto merged with supers by Foundry
     * */
    static DEFAULT_OPTIONS = {
        classes: ["host"],
    };

    /** @inheritdoc */
    static PARTS = {
        ...super.PARTS,
        features: {
            template: "systems/shadowrun6-eden/templates/sheets/actor/features-tab.hbs",
            templates: [
                "systems/shadowrun6-eden/templates/sheets/actor/matrix-section.hbs"
            ],
            scrollable: [""],
        }
    };

    /** @override */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        
        // Don't show the other tabs if only limited view
        if (this.document.limited || this.options.limited) {
            options.parts.push("features", "description");
            this._defaultTab = "features";
            return;
        }

        // Control which parts show based on document subtype
        options.parts.push("summary", "features", "description", "effects");
    }

    async _preparePartContext(partId, context) {
        context = await super._preparePartContext(partId, context);
        switch (partId) {
            case "summary":
                context.statblock = this._statBlock();
                context.statblockDisabled = true; // Hosts don't have editable stats as they're based on Level
                this._prepareHostItems(context);
                break;
            case "features":
                context.matrixAccess = this._matrixAccess();
                context.matrixActions = this._matrixActions();
                this._prepareHostItems(context);
                break;
        }
        return context;
    }

    
    /**
     * Organize and classify Items for Sprite sheets.
     *
     * @param {object} context The context object to mutate
     */
    _prepareHostItems(context) {
        const ic = [];
        const matrixItems = [];

        for (let i of this.document.items) {
            if (i.type === "ic") {
                ic.push(i);
            }
        }
        context.ic = ic.sort((a, b) => (b.sort || 0) - (a.sort || 0));

        for (let i of this.document.items) {
            if (i.system.isElectronicMatrixDevice) {
                matrixItems.push(i);
            }
        }
        context.matrixItems = matrixItems.sort((a, b) => (b.sort || 0) - (a.sort || 0));
    }

    /** 
     * @returns {Array} This Actor's Stat Block in the correct order
     */
    _statBlock() {
        const edit = this._editMode;
        const schema = this.actor.system.schema;
        const system = edit ? this.actor._source.system : this.actor.system;
        return [
            {
                field: schema.getField('matrix.attributes.attack'),
                value: system.matrix.attributes.attack,
                rollType: "attribute"
            },
            {
                field: schema.getField('matrix.attributes.sleaze'),
                value: system.matrix.attributes.sleaze,
                rollType: "attribute"
            },
            {
                field: schema.getField('matrix.attributes.dataProcessing'),
                value: system.matrix.attributes.dataProcessing,
                rollType: "attribute"
            },
            {
                field: schema.getField('matrix.attributes.firewall'),
                value: system.matrix.attributes.firewall,
                rollType: "attribute"
            },
            {
                field: schema.getField('initiative.matrix'),
                value: system.initiative.matrix[edit ? "rank" : "text"],
                rollType: "initiative"
            },
        ];
    }

    /**
     * Handle a dropped document on the ActorSheet
     * TODO Move this validation to Item's datamodel's _preCreate once migrated from template to datamodel
     * @template {Document} TDocument
     * @param {DragEvent} event         The initiating drop event
     * @param {TDocument} document       The resolved Document class
     * @returns {Promise<TDocument|null>} A Document of the same type as the dropped one in case of a successful result,
     *                                    or null in case of failure or no action being taken
     * @protected
     */
    async _onDropDocument(event, document) {

        if (document.documentName === "Item") {
            console.log("SR6E | _onDropDocument() | Validating if this item is allowed to be dropped:", document.type, document.system.isElectronicMatrixDevice);
            if (!document.system.isElectronicMatrixDevice) {
                ui.notifications.error("shadowrun6.ui.notifications.item_not_allowed_to_be_dropped", { localize: true });
                return null;
            }
        }
        
        return super._onDropDocument(event, document);
    }

}
