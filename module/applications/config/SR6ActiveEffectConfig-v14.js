/**
 * The Application responsible for configuring a single ActiveEffect document within a parent Actor or Item.
 * @extends {ActiveEffectConfig}
 *
 * @param {SR6ActiveEffectConfig} object             The target active effect being configured
 * @param {DocumentSheetOptions} [options]  Additional options which modify this application instance
 */
export default class SR6ActiveEffectConfigV14 extends foundry.applications.sheets.ActiveEffectConfig {

    /**
     * Foundry V14
     * Template inclusion & sheet options
     */
    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        position: { width: 700 },
        form: {
            submitOnChange: true,
            submitOnClose: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        ...super.PARTS,
        changes: {
            template: "systems/shadowrun6-eden/templates/sheets/active-effect/changes-v14.hbs",
            templates: ["systems/shadowrun6-eden/templates/sheets/active-effect/change-v14.hbs"],
            scrollable: ["ol[data-changes]"]
        },
    };
    
    /** @override */
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

        context.tabs.changes.usage_tips = game.i18n._fallback.shadowrun6 ? 
                                          game.i18n._fallback.shadowrun6.active_effect.usage_tips : 
                                          game.i18n.translations.shadowrun6.active_effect.usage_tips;

        console.log("SR6E | SR6ActiveEffectConfig._prepareContext()", context);
        return context;
    }

    /**
     * Foundry V14
     * Prepare render context for a single change object.
     * @param {object} context                   Data for rendering the change row
     * @param {EffectChangeData} context.change  A copy of the change from the Effect's source array
     * @param {number} context.index             The change object's index in the array
     * @param {DataSchema} context.fields        The defined fields of the change data
     * @param {number} context.defaultPriority   The change type's default priority
     * @param {Record<string, string>} context.changeTypes All change types and their localized labels
     * @returns {Promise<string>}
     * @protected
     */
    async _renderChange(context) {
        const {change, index} = context;
        if ( ("value" in change) && (typeof change.value !== "string") ) change.value = JSON.stringify(change.value);
        Object.assign(
        change,
        ["key", "type", "value", "phase", "priority"].reduce((paths, fieldName) => {
            if ( fieldName in change ) paths[`${fieldName}Path`] = `system.changes.${index}.${fieldName}`;
            return paths;
        }, {}));
        const changeType = ActiveEffect.CHANGE_TYPES[change.type];
        context.changeType = changeType;
        // SR6 Change URL template
        context.ACTIVE_EFFECT_OPTIONS = CONFIG.SR6.ACTIVE_EFFECT_OPTIONS;
        context.advanced = this.document.system.advanced;
        return changeType?.render?.(context) ?? renderTemplate("systems/shadowrun6-eden/templates/sheets/active-effect/change-v14.hbs", context);
    }

    /**
     * Foundry V13
     * Listener on changing the form
     */
    async _onChangeForm(formConfig, event) {
        super._onChangeForm(formConfig, event);
        console.log("SR6E | SR6ActiveEffectConfig._onChangeForm()");
        if (event.target?.name === "system.advanced") {
            await this._toggleAdvancedConfig();
        }
    }

    /**
     * Toggling the Advanced Config with input keys instead of select keys
     */
    async _toggleAdvancedConfig(event) {
        console.log("SR6E | SR6ActiveEffectConfig._toggleAdvancedConfig()", this.document.system.advanced);
        return this.submit({preventClose: true}).then(() => this.render());
    }

}