import { MatrixActionRoll } from "../../../dice/RollTypes.js";

/**
 * Augment an Application class with Matrix methods
 * @param {Constructor<ApplicationV2>} BaseApplication
 */

export const MatrixSheetMixin = Base => class extends Base {

    /** @override */
    static DEFAULT_OPTIONS = {
        actions: {
            switchMatrixAccess: this._onSwitchMatrixAccess,
            openTargetsMatrixSheet: this._openTargetsMatrixSheet,
            toggleMatrixActionDesc: this._toggleMatrixActionDesc,
            matrixRoll: this._onMatrixRoll
        },
    };

    _matrixActions(actor = this.actor) {
        const system = actor.system;
        const matrixActions = Object.entries(CONFIG.SR6.MATRIX_ACTIONS)
            .filter(([actionId, action]) => {
                if (this.document.limited || this.options.limited) {
                    if (action.skill === "cracking" && !this.initiator.getSystemProperty("skills.cracking.pool")) return false
                    if (action.linkedAttr === "a" && !this.initiator.getSystemProperty("persona.used.a")) return false;
                    if (action.linkedAttr === "s" && !this.initiator.getSystemProperty("persona.used.s")) return false;
                     // TODO JEROEN evaluate if this should not be only OUTSIDER actions
                    if (this.actor.isActorV2 && action.targets?.includes("physical")) return false;  // ActorV2 DataModel actors are currently only used for Matrix Icons
                    if (action.targets?.includes("persona") && action.outsider) return true;
                    return false;
                }
                
                if (action.skill === "cracking" && !system.skills.cracking.defaultTestPool) return false;
                if (action.linkedAttr == null) return true;
                if (action.linkedAttr === "a" && system.matrix.attributes.attack > 0) return true;
                if (action.linkedAttr === "s" && system.matrix.attributes.sleaze > 0) return true;
                return false;
            })
            .map(([actionId, action]) => {
                return {
                    id: actionId,
                    ...action,
                    name: game.i18n.localize(`shadowrun6.matrixaction.${actionId}.name`),
                    //TODO JEROEN: Add specialization support
                    testPool: action.skill ? system.skills[action.skill].defaultTestPool : null,
                    skillName: action.skill ? game.i18n.localize(`skill.${action.skill}`) + ` (${game.i18n.localize(`shadowrun6.special.${action.skill}.${action.specialization}`)})` : null,
                };
            })
            .sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

        const splitIndex = Math.ceil(matrixActions.length / 2);

        return {
            left: matrixActions.slice(0, splitIndex),
            right: matrixActions.slice(splitIndex)
        };
    }

    get #matrixUserSafeUuid() {
        const actor = this.initiator ?? this.actor;
        return actor.uuid.replaceAll(".", "_");
    }

    _matrixAccess() {
        console.log(`SR6E | MatrixSheetMixin._matrixAccess() | START`);
        let matrixAccessLevel;
        if (this.item) {
            matrixAccessLevel = this.item.yourMatrixAccessLevel({ initiator: this.initiator });
        } else {
            // Only Actor currently using this sheet is Sprite
            // matrixAccessLevel = this.document.getFlag("shadowrun6-eden", `matrix-access.${this.#matrixUserSafeUuid}`) ?? "outsider";
            matrixAccessLevel = this.actor.yourMatrixAccessLevel({ initiator: this.initiator, fromReferenceSection: true, limitedViewOverride: this.options.limited });
        }
        console.log(`SR6E | MatrixSheetMixin._matrixAccess() | END`, matrixAccessLevel, this.#matrixUserSafeUuid);

        return {
            outsider: matrixAccessLevel === "outsider",
            user: matrixAccessLevel === "user",
            admin: matrixAccessLevel === "admin"
        };
    }

    /**
     * Switches the Matrix Access Level
     *
     * @this SR6BaseActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    static async _onSwitchMatrixAccess(event, target) {
        const container = target.closest(".matrix-access-container");
        if (container?.classList.contains("inactive")) return;

        const switchEl = target.closest(".matrix-access-switch");
        const newAccessLevel = target.dataset.value;
        if (!newAccessLevel || !switchEl) return;

        console.log("SR6E | _onSwitchMatrixAccess to:", newAccessLevel);

        for (const option of switchEl.querySelectorAll(".matrix-access-option")) {
            option.classList.toggle("active", option === target);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
         // wait until CSS effect is ready
        await this.document.setFlag(
            "shadowrun6-eden",
            `matrix-access.${this.#matrixUserSafeUuid}`,
            newAccessLevel
        );
    }

    static async _openTargetsMatrixSheet(event) {
        console.log("SR6E | MatrixSheetMixin | _openTargetsMatrixSheet");
        const initiator = this.actor;
        const targets = game.user.targets;
        if (!targets.size) return ui.notifications.warn("shadowrun6.ui.notifications.Target_a_token_first", { localize: true });

        for (const target of targets) {
            let matrixActorSheet;
            if (target.actor.isActorV2) {
                const Sheet = target.actor._getSheetClass();
                matrixActorSheet = new Sheet({ document: target.actor, initiator: initiator, launcher: initiator.sheet, limited: true, viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE });
            } else {
                matrixActorSheet = new game.sr6.applications.SR6MatrixTargetSheet(target.actor, { initiator: initiator, launcher: initiator.sheet }); //V1 sheet has different arguements than V2
            }
            await this.minimize();
            matrixActorSheet.render(true);
        }
    }

    /**
     * Toggles the description of an Item, either by showing the description or sending it to chat if right-clicked
     *
     * @this SR6BaseActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    static async _toggleMatrixActionDesc(event, target) {
        const row = target.closest("li.matrix-action");
        const content = row?.querySelector(`.collapsible-content`);
        if (!content) return;

        const isOpen = !target.classList.contains("open");
        target.classList.toggle("open", isOpen);
        target.classList.toggle("closed", !isOpen);
        content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : null;
        content.classList.toggle("open", isOpen);
        content.classList.toggle("closed", !isOpen);
    }

    static async _onMatrixRoll(event, target) {
        const data = target.dataset;
        console.log("SR6E | _onMatrixRoll ", data);
        if (!data) return;

        const initiator = this.initiator ?? this.actor;
        const isIni = this.initiator.uuid === this.actor.uuid;
        const matrixTarget = this.item ?? (isIni ? undefined : this.actor);
        const sheetHasActor = Boolean(this.actor);

        const matrixAction = CONFIG.SR6.MATRIX_ACTIONS[ data.matrixId ];
        let roll = new MatrixActionRoll(initiator, matrixAction, { target: matrixTarget, fromReferenceSection: sheetHasActor, limitedViewOverride: this.options.limited });
        
        // modify MatrixActionRoll if necessary
        if (matrixAction.onMatrixActionRoll) {
            await matrixAction.onMatrixActionRoll(roll);
        }

        if (!matrixAction.skill) {
            return await roll.toChat();
        }
        
        console.log("SR6E | _onMatrixRoll before ", initiator.name, roll);
        initiator.performMatrixAction(roll);
    }

};