import SR6BaseActorSheet from "./base-actor-sheet.mjs";
import { DeployTokensSheetMixin } from "./mixins/_module.mjs";
import { MatrixSheetMixin } from "./mixins/_module.mjs";
const { api, sheets } = foundry.applications;

/**
 * Extend the basic SR6 ActorSheet with some very simple modifications
 * @extends {SR6BaseActorSheet}
 */
export default class SR6HostActorSheet extends DeployTokensSheetMixin ( MatrixSheetMixin( SR6BaseActorSheet ) ) {
    _defaultTab = "summary";

    /**
     * @override
     * Auto merged with supers by Foundry
     * */
    static DEFAULT_OPTIONS = {
        classes: ["host"],
        actions: {
            deployToken: this._onDeployToken,
            retrieveToken: this._onRetrieveToken,
            viewAnyDoc: this._viewAnyDoc
        },
    };

    /** @inheritdoc */
    static PARTS = {
        ...super.PARTS,
        summary: {
             ...super.PARTS.summary,
            templates: [
                "systems/shadowrun6-eden/templates/sheets/actor/summary-tab/host.hbs",
                "systems/shadowrun6-eden/templates/sheets/actor/summary-tab/host-host.hbs",
                "systems/shadowrun6-eden/templates/sheets/actor/summary-tab/host-device.hbs",
            ]
        },
        network: {
            template: "systems/shadowrun6-eden/templates/sheets/actor/network-tab.hbs",
            scrollable: [""],
        },
        description: {
             ...super.PARTS.description,
            templates: [
                "systems/shadowrun6-eden/templates/sheets/actor/description-tab/host.hbs"
            ]
        }
    };

    /** @override */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        this.deployedItem = this.actor.system.deployedItem;
        
        // Don't show the other tabs if only limited view
        if (this.document.limited || this.options.limited) {
            options.parts.push("summary", "description");
            return;
        }

        if (this.deployedItem) {
            options.parts.push("summary", "description", "effects");
            return;
        }

        // Control which parts show based on document subtype
        options.parts.push("summary", "network", "description", "effects");
    }

    async _preparePartContext(partId, context) {
        context = await super._preparePartContext(partId, context);
        this._prepareHeader(context);
        
        if (this.deployedItem) {
            context.deployedItem = this.deployedItem;
            context.installedIn = this.actor.token.baseActor;
        }

        switch (partId) {
            case "summary":
                context.statblock = this._statBlock();
                context.host = this._hostContext();
                if (this.deployedItem) {
                    context.enriched.description = await this._prepareEnrichedHTML(this.actor.system.description);
                } else {
                    this._prepareHostItems(context);
                }
                break;
            case "network":
                context.tab = context.tabs[partId];
                context.matrixAccess = this._matrixAccess();
                context.matrixActions = this._matrixActions();
                this._prepareHostItems(context);
                break;
            case "description":
                if (this.deployedItem) break;
                context.enriched.sculpting = await this._prepareEnrichedHTML(this.actor.system.sculpting);
                context.enriched.outsiderAccess = await this._prepareEnrichedHTML(this.actor.system.outsiderAccess);
                break;
        }
        return context;
    }

    /**
     * Prepare traits below the name on the header of the sheet
     * @param {object} context The context object to mutate
     */
    _prepareHeader(context) {
        const systemFields = context.systemFields;
        const system = context.system;
        const limited = context.limited;

        if (this.deployedItem) {
            const itemSystem = this.deployedItem.system;
            context.traits = [
                {
                    field: { label: game.i18n.localize("shadowrun6.item.type") },
                    value: game.i18n.localize(`shadowrun6.itemtype.${itemSystem.type}`)
                },
                {
                    field: { label: game.i18n.localize("shadowrun6.item.subtype") },
                    value: game.i18n.localize(`shadowrun6.gear.subtype.${itemSystem.subtype}`)
                },
            ];
            return;
        }

        context.traits = [
            {
                dontShowOnLimited: limited,
                field: systemFields.rating,
                value: system.rating
            },
            {
                field: systemFields.type,
                value: system.type
            },
        ];

    }

    /**
     * Organize and classify Items for Sprite sheets.
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
                i.isDeployedItem = i.getFlag("shadowrun6-eden", "isDeployedItem");
                matrixItems.push(i);
            }
        }
        context.matrixItems = matrixItems.sort((a, b) => (b.sort || 0) - (a.sort || 0));
    }

    /** 
     * Builds context for this host's sheet
     * @returns {object} Host context
     */
    _hostContext() {
        const host = {};

        const hostType = this.actor.system.type;
        const rating = this.actor.system.rating;
        const attributes = this.actor._source.system.matrix.attributes;
        const modifiers = Object.values(attributes).map(value => value - rating);
        let isValid;

        switch (hostType) {
            case "foundation": {
                const requiredModifiers = [0, 1, 2, 3];
                isValid = requiredModifiers.every(modifier => modifiers.includes(modifier));
                break;
            }

            case "framework": {
                const loweredAttributeCount = modifiers.filter(modifier => modifier === -1).length;
                const maximumAttributeCount = modifiers.filter(modifier => modifier === 4).length;
                const allocatedPoints = modifiers.reduce((total, modifier) => total + Math.max(modifier, 0), 0);
                const availablePoints = loweredAttributeCount ? 7 : 6;

                isValid = modifiers.every(modifier => modifier >= -1 && modifier <= 4)
                    && loweredAttributeCount <= 1
                    && maximumAttributeCount <= 1
                    && allocatedPoints === availablePoints;
                break;
            }
        }

        if (!isValid) host.attributeError = game.i18n.localize(`SR6.Actor.host.FIELDS.rating.error.${hostType}`);

        return host;
    }

    /**
     * @returns {Array} This Actor's Stat Block in the correct order
     */
    _statBlock() {
        const edit = this._editMode;
        const schema = this.actor.system.schema;
        const system = edit ? this.actor._source.system : this.actor.system;
        const statBlock = [];

        if (!this.deployedItem) {
            statBlock.push({
                field: schema.getField("rating"),
                value: system.rating,
                rollType: "attribute",
                readOnly: true
            });
        }

        statBlock.push(
            {
                field: schema.getField("matrix.attributes.attack"),
                value: system.matrix.attributes.attack,
                rollType: "attribute"
            },
            {
                field: schema.getField("matrix.attributes.sleaze"),
                value: system.matrix.attributes.sleaze,
                rollType: "attribute"
            },
            {
                field: schema.getField("matrix.attributes.dataProcessing"),
                value: system.matrix.attributes.dataProcessing,
                rollType: "attribute"
            },
            {
                field: schema.getField("matrix.attributes.firewall"),
                value: system.matrix.attributes.firewall,
                rollType: "attribute"
            }
        );

        if (this.deployedItem) {
            statBlock.push({
                field: schema.getField("initiative.matrix"),
                value: system.initiative.matrix[edit ? "rank" : "text"],
                rollType: "initiative"
            });
        }

        return statBlock;
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

    /**
     * Deploy an additional linked token for the sheet actor.
     *
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {Shadowrun6ActorSheet}
     */
    static async _onDeployToken(event, target) {
        const deployedItemUuid = target.dataset.itemUuid;
        const item = foundry.utils.fromUuidSync(deployedItemUuid);
        await item.setFlag("shadowrun6-eden", 'isDeployedItem', true);

        const tokenDocument = await this.actor.getTokenDocument({
            name: item.name,
            actorLink: false,
            "texture.src": item.img,
            "bar1.attribute": "matrix.matrixCM",
            flags: {
                "shadowrun6-eden": {
                    deployedItemUuid
                }
            }
        });

        // Calls DeployTokensSheetMixin.deployTokens()
        return this.deployTokens(tokenDocument);
    }

    /**
     * Retrieve the token deployed for an Item.
     *
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {Shadowrun6ActorSheet}
     */
    static async _onRetrieveToken(event, target) {
        const deployedItemUuid = target.dataset.itemUuid;
        const item = foundry.utils.fromUuidSync(deployedItemUuid);

        const deployedToken = canvas.scene.tokens.find(token =>
            token.getFlag("shadowrun6-eden", "deployedItemUuid") === deployedItemUuid
        );

        await this.retrieveTokens(deployedToken);
        await item.unsetFlag("shadowrun6-eden", "isDeployedItem");
    }

    /**
     * Don't render an Edit Button on the Sheet if this is a Deployed Item
     */
    async _renderEditButton(options) {
        if (!this.deployedItem) return await super._renderEditButton(options)

        const label = game.i18n.localize("SR6.Actor.host.matrixItems.editTitle");
        const windowTitle = this.element.querySelector(".window-header .window-title");
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "header-control icon editDeployedItem";
        editButton.dataset.tooltip = label;
        editButton.setAttribute("aria-label", label);
        editButton.dataset.action = "viewAnyDoc";
        editButton.dataset.docUuid = this.deployedItem.uuid;
        editButton.innerHTML = `<i class="fas fa-edit"></i>`;
                
        windowTitle.after(editButton);
    }

    /**
     * Renders a document sheet based on a docUuid
     *
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    static async _viewAnyDoc(event, target) {
        const docUuid = target.dataset.docUuid;
        const doc = await foundry.utils.fromUuid(docUuid);
        doc.sheet.render(true);
    }

}
