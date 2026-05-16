import SR6BaseActorSheet from "./base-actor-sheet.mjs";
const { api, sheets } = foundry.applications;

/**
 * Extend the basic SR6 ActorSheet with some very simple modifications
 * @extends {SR6BaseActorSheet}
 */
export default class SR6SpriteActorSheet extends SR6BaseActorSheet {
    _defaultTab = "summary";

    /**
     * @override
     * Auto enriched with supers by Foundry
     * */
    static DEFAULT_OPTIONS = {
        classes: ["sprite"],
    };

    /** @override */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        // Don't show the other tabs if only limited view
        if (this.document.limited) return;

        // Control which parts show based on document subtype
        options.parts.push("summary", "features", "biography", "effects");
    }

    async _preparePartContext(partId, context) {
        context = await super._preparePartContext(partId, context);
        switch (partId) {
            case "summary":
                context.statblock = this._statBlock();
                context.summary = this._contextSummary();
                break;
        }
        return context;
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
            },
            {
                field: schema.getField('matrix.attributes.sleaze'),
                value: system.matrix.attributes.sleaze,
            },
            {
                field: schema.getField('matrix.attributes.dataProcessing'),
                value: system.matrix.attributes.dataProcessing,
            },
            {
                field: schema.getField('matrix.attributes.firewall'),
                value: system.matrix.attributes.firewall,
            },
            {
                field: schema.getField('attributes.willpower'),
                value: system.attributes.willpower[edit ? "rank" : "pool"],
            },
            {
                field: schema.getField('attributes.logic'),
                value: system.attributes.logic[edit ? "rank" : "pool"],
            },
            {
                field: schema.getField('attributes.intuition'),
                value: system.attributes.intuition[edit ? "rank" : "pool"],
            },
            {
                field: schema.getField('attributes.charisma'),
                value: system.attributes.charisma[edit ? "rank" : "pool"],
            },
            {
                field: schema.getField('matrix.initiative'),
                value: system.matrix.initiative[edit ? "rank" : "text"],
            },
            {
                field: schema.getField('attributes.resonance'),
                value: system.attributes.resonance[edit ? "rank" : "pool"],
            },
        ];
    }

    _contextSummary() {
        const summary = [
            {
                label: 'Active Skills',
                items: this.actor.itemTypes.skills
            },
            {
                label: 'Knowledge Skills',
                powers: this.actor.itemTypes.powers
            },
        ];

        return summary;
    }

}
