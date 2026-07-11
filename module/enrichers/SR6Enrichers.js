const LOG_PREFIX = "SR6E | Enricher";


export class SR6Enrichers {
    /**
     * Registers all custom enrichers with Foundry's TextEditor.
     */
    static register() {
        CONFIG.TextEditor.enrichers.push({
            pattern: /@(Skill|Attribute)\[([^\]]+)\](?:\{([^}]+)\})?/g,
            enricher: this.enrichRollButton.bind(this)
        });

        CONFIG.TextEditor.enrichers.push({
            pattern: /@Condition\[([^\]]+)\]/gi,
            enricher: this.enrichConditionTooltip.bind(this)
        });
    }

    /**
     * Generates an interactive roll button for Skills or Attributes.
     *
     * @param {RegExpMatchArray} match
     * @param {object} _options
     * @returns {Promise<HTMLElement>}
     */
    static async enrichRollButton(match, _options) {
        const type = match[1];
        const rawTarget = match[2].trim();
        const target = resolveRollTarget(type, rawTarget);

        // Leave invalid references visible but not clickable.
        if (!target) {
            console.warn(
                `${LOG_PREFIX} | Invalid ${type} target "${rawTarget}"`
            );

            return createInvalidEnricher(match[0]);
        }

        const customLabel = match[3]?.trim();

        const label = customLabel || game.i18n.localize(
            type === "Skill"
                ? `skill.${target}`
                : `attrib.${target}`
        );

        const anchor = document.createElement("a");

        anchor.classList.add(
            "sr6-enricher-roll",
            `sr6-${type.toLowerCase()}-roll`
        );

        anchor.dataset.sr6EnricherAction = "roll";
        anchor.dataset.rollType = type;
        anchor.dataset.rollTarget = target;

        const icon = document.createElement("i");

        icon.classList.add(
            "fas",
            type === "Skill" ? "fa-dice-d6" : "fa-dice"
        );

        anchor.append(
            icon,
            document.createTextNode(` ${label}`)
        );

        return anchor;
    }

    /**
     * Build a tooltip for an SR6 status effect.
     *
     * @param {RegExpMatchArray} match
     * @param {object} _options
     * @returns {Promise<HTMLElement>}
     */
    static async enrichConditionTooltip(match, _options) {
        const rawTarget = match[1].trim();

        const condition = CONFIG.statusEffects.find(
            effect => effect.id?.toLowerCase() === rawTarget.toLowerCase()
        );

        if (!condition) {
            console.warn(
                `${LOG_PREFIX} | Invalid Condition target "${rawTarget}"`
            );

            return createInvalidEnricher(match[0]);
        }

        const conditionLabel = game.i18n.localize(condition.name);
        const span = document.createElement("span");

        span.classList.add("sr6-enricher-condition");
        span.dataset.condition = condition.id;
        span.dataset.tooltip = conditionLabel;

        const icon = document.createElement("i");
        icon.classList.add("fas", "fa-info-circle");

        span.append(
            icon,
            document.createTextNode(` ${conditionLabel}`)
        );

        return span;
    }
}

/**
 * Resolve and validate the canonical ID for a roll enricher target.
 *
 * @param {"Skill"|"Attribute"} type
 * @param {string} rawTarget
 * @returns {string|null}
 */
function resolveRollTarget(type, rawTarget) {
    const candidate = rawTarget.trim().toLowerCase();

    switch (type) {
        case "Skill":
            return CONFIG.SR6.ATTRIB_BY_SKILL.has(candidate)
                ? candidate
                : null;

        case "Attribute":
            return CONFIG.SR6.ATTRIBUTES.includes(candidate)
                ? candidate
                : null;

        default:
            return null;
    }
}

/**
 * Preserve an invalid enricher reference as non-interactive text.
 *
 * @param {string} source
 * @returns {HTMLSpanElement}
 */
function createInvalidEnricher(source) {
    const span = document.createElement("span");
    span.textContent = source;

    return span;
}