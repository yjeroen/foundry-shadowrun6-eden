/**
 * The Application responsible for configuring a single ActiveEffect document within a parent Actor or Item.
 * @extends {ActiveEffectConfig}
 *
 * @param {SR6ActiveEffectConfig} object             The target active effect being configured
 * @param {DocumentSheetOptions} [options]  Additional options which modify this application instance
 */
export class SR6ActiveEffectConfig extends ActiveEffectConfig {

    /**
     * Foundry V12
     * Template inclusion & sheet options
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/shadowrun6-eden/templates/sheets/active-effect/v12-config.html",
            tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "effects"}],
            width: 700
        });
    }

    /**
     * Foundry V12
     * Preparing context data 
     */
    async getData(options={}) {
        const context = await super.getData(options);

        // Return rendering context
        return foundry.utils.mergeObject(context, {
            ACTIVE_EFFECT_OPTIONS: CONFIG.SR6.ACTIVE_EFFECT_OPTIONS,
        });
    }

    /**
     * Foundry V13 
     * Template inclusion & sheet options
     */
    static DEFAULT_OPTIONS = {
        position: {width: 700},
        initial: "changes"
    };
    static PARTS = {
        header: {template: "templates/sheets/active-effect/header.hbs"},
        tabs: {template: "templates/generic/tab-navigation.hbs"},
        details: {template: "templates/sheets/active-effect/details.hbs", scrollable: [""]},
        duration: {template: "templates/sheets/active-effect/duration.hbs"},
        changes: {template: "systems/shadowrun6-eden/templates/sheets/active-effect/changes.hbs", scrollable: ["ol[data-changes]"]},
        footer: {template: "templates/generic/form-footer.hbs"}
    };
    static TABS = {
        sheet: {
            tabs: [
                {id: "changes", icon: "fa-solid fa-gears"},
                {id: "details", icon: "fa-solid fa-book"},
                {id: "duration", icon: "fa-solid fa-clock"}
            ],
            initial: "changes",
            labelPrefix: "EFFECT.TABS"
        }
    };

    /**
     * Foundry V13 
     * Preparing context data 
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.ACTIVE_EFFECT_OPTIONS = CONFIG.SR6.ACTIVE_EFFECT_OPTIONS;
        console.log("SR6E | SR6ActiveEffectConfig._prepareContext()", context);
        return context;
    }

}