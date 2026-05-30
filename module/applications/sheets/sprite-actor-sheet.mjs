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
                context.statblockDisabled = true; // Sprites don't have editable stats as they're based on Level
                context.sprite = this._contextSprite();
                break;
            case "features":
                this._prepareSpriteItems(context)
                break;
        }
        return context;
    }

    
    /**
     * Organize and classify Items for Sprite sheets.
     *
     * @param {object} context The context object to mutate
     */
    _prepareSpriteItems(context) {
        const spritePowers = [];

        for (let i of this.document.items) {
            // Append to gear.
            if (i.type === "spritepower") {
                spritePowers.push(i);
            }
        }
        context.spritePowers = spritePowers.sort((a, b) => (a.sort || 0) - (b.sort || 0));
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
                field: schema.getField('attributes.willpower'),
                value: system.attributes.willpower[edit ? "rank" : "pool"],
                rollType: "attribute"
            },
            {
                field: schema.getField('attributes.logic'),
                value: system.attributes.logic[edit ? "rank" : "pool"],
                rollType: "attribute"
            },
            {
                field: schema.getField('attributes.intuition'),
                value: system.attributes.intuition[edit ? "rank" : "pool"],
                rollType: "attribute"
            },
            {
                field: schema.getField('attributes.charisma'),
                value: system.attributes.charisma[edit ? "rank" : "pool"],
                rollType: "attribute"
            },
            {
                field: schema.getField('matrix.initiative'),
                value: system.matrix.initiative[edit ? "rank" : "text"],
                rollType: "initiative"
            },
            {
                field: schema.getField('attributes.resonance'),
                value: system.attributes.resonance[edit ? "rank" : "pool"],
                rollType: "attribute"
            },
        ];
    }

    _contextSprite() {
        const pluralRules = new Intl.PluralRules(game.i18n.lang);
        const localizedIntervalScale = game.i18n.localize( `shadowrun6.dice.extended.intervalScale.hour_long_${pluralRules.select(this.actor.system.lifespan)}`);
        const lifespanLeft = game.i18n.format("SR6.label.lifespan_left", { number: this.actor.system.lifespan, intervalScale: localizedIntervalScale });

        const sprite = {
            lifespan: lifespanLeft
        };

        return sprite;
    }

}
