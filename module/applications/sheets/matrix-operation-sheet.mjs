const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { DOCUMENT_OWNERSHIP_LEVELS } = foundry.CONST;
import { MatrixSheetMixin } from "./mixins/_module.mjs";

/**
 * Create an app that contains matrix actions that can affect Items
 * @extends ItemSheetV2
 * @mixes HandlebarsApplicationMixin
 */
export class SR6MatrixOperationSheet extends MatrixSheetMixin( HandlebarsApplicationMixin(ItemSheetV2) ) {

    static DEFAULT_OPTIONS = {
        id: "sr6-matrix-operation-{id}",
        classes: ["shadowrun6", "sr6", "item", "matrix-operations"],
        viewPermission: DOCUMENT_OWNERSHIP_LEVELS.NONE,
        editPermission: DOCUMENT_OWNERSHIP_LEVELS.OWNER,    //Review later to determine if USER/ADMIN can be used
        tag: "form",
        form: {
            submitOnChange: true
        },
        window: {
            icon: "fas fa-terminal",
            resizable: true,
        },
        position: {
            width: 560,
            height: 460,
        },
        actions: {
            onTrackClick: SR6MatrixOperationSheet.#onTrackClick,
        },
    };

    static PARTS = {
        body: {
            template:
                "systems/shadowrun6-eden/templates/sheets/matrix/operations-sheet.hbs",
            templates: [
                "systems/shadowrun6-eden/templates/item/item-settings.hbs",
                "systems/shadowrun6-eden/templates/sheets/common/matrix-cm.hbs",
                "systems/shadowrun6-eden/templates/sheets/matrix/actions-section.hbs"
            ],
            scrollable: [".matrix-operations-body"]
        },
    };

    /** @override */
    get title() {
        const {id, name} = this.document;
        return `${game.i18n.localize("shadowrun6.matrix.icon")}: ${name || id}`;
    }

    get initiator() {
        return this.options.initiator;
    }

    get defender() {
        return this.item.actor.system.pan.administrator;
    }

    get isInitiatorAdmin() {
        return this.initiator.uuid === this.item.actor.uuid || this.initiator.uuid === this.defender.uuid;
    }

    /**
     * Prepares the render context for the sheet.
     * @override
     * @param {object} options - Context preparation options passed by Foundry.
     * @returns {Promise<object>} The prepared sheet context.
     */
    async _prepareContext(options) {
        console.log("SR6E | SR6MatrixOperationSheet._prepareContext", this);
        /**
         * super._prepareContext(options) returns:
         * @property {SR6Item} document
         * @property {boolean} editable
         * @property {object} fields
         * @property {string} partId
         * @property {string} rootId
         * @property {object} source
         * @property {User} user
         */
        const context = await super._prepareContext(options);

        return {
            ...context,
            config: CONFIG.SR6,
            item: this.item,
            initiator: this.initiator,
            defender: this.defender,
            hud: this._preparedHud,
            isInitiatorAdmin: this.isInitiatorAdmin,
            matrixAccess: this._matrixAccess(),
            matrixActions: this._matrixActions(),
        };
    }

    get _preparedHud() {
        const system = this.document.system;
        const hud = { show: true };

        hud.matrixCM = SR6MatrixOperationSheet.#cmSlotContext(system.matrix.matrixCM);
        if (system.matrix.hasWirelessInterface) {
            hud.showWifi = true;
        }
        if (CONFIG.SR6.GEAR.TYPES_WITH_AMMO.has(system.type) && system.subtype) {
            hud.showAmmo = true;
        }
        if (system.matrix.matrixCM.value === 0) {
            hud.bricked = true;
        }

        return hud;
    }

    /** @override */
    _matrixAccess() {
        if (this.isInitiatorAdmin) return { admin: true };
        else return super._matrixAccess();
    }

    /** @override */
    _matrixActions() {
        if (this.initiator.system instanceof foundry.abstract.DataModel) return super._matrixActions(this.initiator);
        else return this._matrixActionsV1();
    }

    _matrixActionsV1() {
        const system = this.initiator.system;
        const persona = system.persona;
        const crackingPool = system.skills.cracking.pool;

        const actions = Object.entries(CONFIG.SR6.MATRIX_ACTIONS).map(([id, action]) => ({
            id,
            ...action,
            name: game.i18n.localize(`shadowrun6.matrixaction.${id}.name`),
            testPool: action.skill ? game.sr6.utils.getMatrixActionPool(id, this.initiator) : null,   //.pool is the main difference between ActorV1 and ActorV2-Datamodel
            skillName: action.skill ? game.i18n.localize(`skill.${action.skill}`) + ` (${game.i18n.localize(`shadowrun6.special.${action.skill}.${action.specialization}`)})` : null,
        }));

        const matrixActions = actions
            .filter((action) => {
                if (action.skill === "cracking" && !crackingPool) return false;
                if (action.linkedAttr === null || action.linkedAttr === undefined) return true;
                if (action.linkedAttr === "a" && persona?.used?.a > 0) return true;
                if (action.linkedAttr === "s" && persona?.used?.s > 0) return true;
                return false;
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        const splitIndex = Math.ceil(matrixActions.length / 2);

        return {
            left: matrixActions.slice(0, splitIndex),
            right: matrixActions.slice(splitIndex)
        };
    }

    static #cmSlotContext(conditionMonitor) {
        const boxes = conditionMonitor.max;
        const dmg = conditionMonitor.dmg;
        const slots = [];

        let i = 0;
        while (i < boxes) {
            i++;
            const slot = { active: true, penalty: null };
            if (i === boxes && (i % 3) === (boxes % 3) ) {
                slot.penalty = -1 * Math.ceil(i / 3);
            } else if (i % 3 == 0) {
                slot.penalty = -1 * (i / 3);
            }
            if (i <= dmg) {
                slot.active = false;
            }
            if (i === boxes) slot.first = true;
            if (i === 1) slot.last = true;
            slots.unshift(slot);
        }

        return slots;
    }

    /**
     * Handling clicking on the Matrix Track
     *
     * @this SR6MatrixOperationSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target  Foundry action target: the element with data-action="onTrackClick"
     * @private
     */
    static async #onTrackClick(event, target) {
        event.stopPropagation();            // Don't trigger other events
        const html = event.currentTarget;   // <form> whole app
        const clickedEl = event.target;     // div.slot or its inner span - The element actually clicked

        const track = target;
        const tracks = track.closest(".matrix-track");
        const conditionMonitor = track.dataset.conditionMonitor;
        const slotClicked = clickedEl.closest(".slot");
        
        // Check if clicked outside a slot or track is inactive
        if (!slotClicked || track.classList.contains('inactive')) return; 

        const allSlots = [...track.querySelector(".slots").children];
        const index = allSlots.indexOf(slotClicked);
        console.log(`SR6E | _onTrackClick | Condition Monitor: ${conditionMonitor} | Slot clicked: ${index}`);

        // Toggling slots up to where clicked
        const clickedWasActive = slotClicked.classList.contains("active");
        const maxActiveIndex = clickedWasActive ? index - 1 : index;
        allSlots.forEach((slot, i) => {
            slot.classList.toggle("active", i <= maxActiveIndex);
        });

        // Pulsating track
		track.classList.add('is-pulsing'); // animation
		tracks.classList.add('inactive');
		
        // Track Config
        let trackColor, attr, deltaTrack;
        let newValue = maxActiveIndex + 1;
        if (conditionMonitor === "matrix") {
            trackColor = "green"
            attr = "system.matrix.matrixCM.value";
            deltaTrack = newValue - this.document.system.matrix.matrixCM.value;
        }

        // TODO Showing delta within portrait
        // const combatText = event.currentTarget.querySelector('.track-delta');
        // combatText.textContent = `${deltaTrack > 0 ? "+" : ""}${deltaTrack}`;
        // combatText.classList.remove('disabled', 'is-pulsing', 'red', 'blue', 'green');
        // combatText.classList.add('is-pulsing', trackColor); // animation

        // combatText.onanimationend = () => {
            setTimeout(() => {
                // combatText.classList.add('disabled'); // animation
                setTimeout(() => {
                    // Update actor and re-render sheet
                    console.log(`SR6E | _onTrackClick | Updating`, this.document.documentName, attr, newValue);
                    this.document.update({ [attr]: newValue });
                }, 200);
            }, 200);
        // };   
    }

    /**
     * Actions performed after closing the Application.
     * Post-close steps are not awaited by the close process.
     * @param {RenderOptions} options Provided render options
     * @protected
     */
    _onClose(options) {
        if (this.options.launcher) this.options.launcher.maximize();
    }
}
