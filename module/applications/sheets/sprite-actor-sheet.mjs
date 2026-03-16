import SR6BaseActorSheet from "./base-actor-sheet.mjs";
const { api, sheets } = foundry.applications;

/**
 * Extend the basic SR6 ActorSheet with some very simple modifications
 * @extends {SR6BaseActorSheet}
 */
export default class SR6SpriteActorSheet extends SR6BaseActorSheet {
    _defaultTab = "statblock";

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["sprite"]
    };

    /** @override */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        // Don't show the other tabs if only limited view
        if (this.document.limited) return;

        // Control which parts show based on document subtype
        options.parts.push("statblock", "features", "biography", "effects");
    }
}
