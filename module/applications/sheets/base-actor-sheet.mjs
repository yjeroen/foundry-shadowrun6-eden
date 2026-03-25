const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheet
 * @extends {ActorSheetV2}
 */
export default class SR6BaseActorSheet extends api.HandlebarsApplicationMixin(
    sheets.ActorSheetV2
) {
    #tabScrollCleanup = null;
    #editMode = false;
    _defaultTab = "";

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["shadowrun6", "actor"],
        position: {
            width: 600,
            height: 600,
        },
        window: {
            resizable: true,
            controls: [
                {
                    action: "configurePrototypeToken2",
                    icon: "fa-solid fa-fw fa-circle-user",
                    label: "TEST",
                    visible: true,
                    ownership: "OWNER",
                }
            ]
        },
        actions: {
            onEditImage: this._onEditImage,
            viewDoc: this._viewDoc,
            createDoc: this._createDoc,
            deleteDoc: this._deleteDoc,
            toggleEffect: this._toggleEffect,
            roll: this._onRoll,
        },
        // Custom property that's merged into `this.options`
        // dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
        form: {
            submitOnChange: true,
        },
    };

    /** @override */
    static PARTS = {
        header: {
            template: "systems/shadowrun6-eden/templates/sheets/actor/header.hbs",
        },
        tabs: {
            // Foundry-provided generic template
            template: "templates/generic/tab-navigation.hbs",
            scrollable: [""],
        },
        statblock: {
            template: "systems/shadowrun6-eden/templates/sheets/actor/statblock-tab.hbs",
            scrollable: [""],
        },
        features: {
            template: "systems/shadowrun6-eden/templates/sheets/actor/features-tab.hbs",
            scrollable: [""],
        },
        biography: {
            template: "systems/shadowrun6-eden/templates/sheets/actor/biography-tab.hbs",
            scrollable: [""],
        },
        gear: {
            template: "systems/shadowrun6-eden/templates/sheets/actor/gear-tab.hbs",
            scrollable: [""],
        },
        magic: {
            template: "systems/shadowrun6-eden/templates/sheets/actor/magic-tab.hbs",
            scrollable: [""],
        },
        effects: {
            template: "systems/shadowrun6-eden/templates/sheets/common/effects-tab.hbs",
            scrollable: [""],
        },
    };

    /** @override */
    _prepareSubmitData(event, form, formData) {
        let submitData;
        try {
             submitData = super._prepareSubmitData(event, form, formData);
        } catch (error) {
            // TODO: error very hard to localize
            // TODO sometimes (if e.g. the number was already on min, but you then go to an invalid number on a bad validation the sheet doesn't get rerendered
            ui.notifications.error(`${error.name}: ${error.message}`);
        } 
        
        return submitData;
    }

    /** @override */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        // Not all parts always render
        options.parts = ["header", "tabs"];
        
        // // Don't show the other tabs if only limited permissions view
        // if (this.document.limited) return;
        // // Control which parts show based on document subtype
        // switch (this.document.type) {
        //     case "character":
        //         options.parts.push("features", "gear", "magic", "effects");
        //         break;
        //     case "npc":
        //         options.parts.push("gear", "effects");
        //         break;
        // }
    }

    /* -------------------------------------------- */

    /** @override */
    async _prepareContext(options) {
        // Output initialization
        const context = {
            // Validates both permissions and compendium status
            editMode: this.document.isOwner && this.isEditable && this.#editMode,
            editable: this.isEditable,
            owner: this.document.isOwner,
            limited: this.document.limited,
            // Add the actor document.
            actor: this.actor,
            // Boolean if the Actor is linked
            linkedToken: this.actor.prototypeToken.actorLink,
            // Add the actor's data to context.data for easier access, as well as flags.
            system: this.actor.system,
            source: this.actor._source.system,
            flags: this.actor.flags,
            // Adding a pointer to CONFIG.SR6
            config: CONFIG.SR6,
            tabs: this._getTabs(options.parts),
            // Necessary for formInput and formFields helpers
            fields: this.document.schema.fields,
            systemFields: this.document.system.schema.fields,
        };

        // Offloading context prep to a helper function
        this._prepareItems(context);

        return context;
    }

    /** @override */
    async _preparePartContext(partId, context) {
        switch (partId) {
            case "statblock":
            case "features":
            case "magic":
            case "gear":
                context.tab = context.tabs[partId];
                break;
            case "biography":
                context.tab = context.tabs[partId];
                // Enrich biography info for display
                // Enrichment turns text like `[[/r 1d20]]` into buttons
                context.enrichedDescription = await TextEditor.enrichHTML(
                    this.actor.system.description,
                    {
                        // Whether to show secret blocks in the finished html
                        secrets: this.document.isOwner,
                        // Data to fill in for inline rolls
                        rollData: this.actor.getRollData(),
                        // Relative UUID resolution
                        relativeTo: this.actor,
                    }
                );
                context.enrichedNotes = await TextEditor.enrichHTML(
                    this.actor.system.notes,
                    {
                        secrets: this.document.isOwner,
                        rollData: this.actor.getRollData(),
                        relativeTo: this.actor,
                    }
                );
                break;
            case "effects":
                context.tab = context.tabs[partId];
                // Prepare active effects
                context.effects = game.sr6.utils.prepareActiveEffectCategories(
                    // A generator that returns all effects stored on the actor
                    // as well as any items
                    this.actor.allApplicableEffects()
                );
                break;
        }
        return context;
    }

    /**
     * Generates the data for the generic tab navigation template
     * @param {string[]} parts An array of named template parts to render
     * @returns {Record<string, Partial<ApplicationTab>>}
     * @protected
     */
    _getTabs(parts) {
        // If you have sub-tabs this is necessary to change
        const tabGroup = "primary";
        // Default tab for first time it's rendered this session
        if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = this._defaultTab;
        return parts.reduce((tabs, partId) => {
            const tab = {
                cssClass: "",
                group: tabGroup,
                // Matches tab property to
                id: "",
                // FontAwesome Icon, if you so choose
                icon: "",
                // Run through localization
                label: "SR6.Actor.Tabs.",
            };
            switch (partId) {
                case "header":
                case "tabs":
                    return tabs;
                case "statblock":
                    tab.id = "statblock";
                    tab.label += "StatBlock";
                    break;
                case "biography":
                    tab.id = "biography";
                    tab.label += "Biography";
                    break;
                case "features":
                    tab.id = "features";
                    tab.label += "Features";
                    break;
                case "gear":
                    tab.id = "gear";
                    tab.label += "gear";
                    break;
                case "magic":
                    tab.id = "magic";
                    tab.label += "Magic";
                    break;
                case "effects":
                    tab.id = "effects";
                    tab.label += "Effects";
                    break;
            }
            if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = "active";
            tabs[partId] = tab;
            return tabs;
        }, {});
    }

    /**
     * Organize and classify Items for Actor sheets.
     *
     * @param {object} context The context object to mutate
     */
    _prepareItems(context) {
        // Initialize containers.
        // You can just use `this.document.itemTypes` instead
        // if you don't need to subdivide a given type like
        // this sheet does with spells
        const gear = [];
        const features = [];
        const spells = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
            7: [],
            8: [],
            9: [],
        };

        // Iterate through items, allocating to containers
        for (let i of this.document.items) {
            // Append to gear.
            if (i.type === "gear") {
                gear.push(i);
            }
            // Append to features.
            else if (i.type === "feature") {
                features.push(i);
            }
            // Append to spells.
            else if (i.type === "spell") {
                if (i.system.spellLevel != undefined) {
                    spells[i.system.spellLevel].push(i);
                }
            }
        }

        for (const s of Object.values(spells)) {
            s.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        }

        // Sort then assign
        context.gear = gear.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        context.features = features.sort(
            (a, b) => (a.sort || 0) - (b.sort || 0)
        );
        context.spells = spells;
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {RenderOptions} options                 Provided render options
     * @protected
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        // You may want to add other special handling here
        // Foundry comes with a large number of utility classes, e.g. SearchFilter
        // That you may want to implement yourself.
        
        const nav = this.element.querySelector(".sheet-tabs.tabs");
        if (!nav) return;
        this.#tabScrollCleanup?.();
        this.#tabScrollCleanup = this._setupHoverScrollTabs(nav);
    }

    /**
     * Actions performed after a first render of the Application.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {RenderOptions} options                 Provided render options
     * @returns {Promise<void>}
     * @protected
     */
    async _onFirstRender(context, options) {
        await this._renderEditButton(options);

        const nav = this.element.querySelector(".sheet-tabs.tabs");
        if (!nav) return;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this._scrollActiveTabIntoView(nav, false);
            });
        });
    }

  /**
   * Render the outer framing HTMLElement which wraps the inner HTML of the Application.
   * @param {RenderOptions} options                 Options which configure application rendering behavior
   * @returns {Promise<HTMLElement>}
   * @protected
   */
    async _renderEditButton(options) {
        if (!this.document.isOwner || !this.isEditable) return;

        const label = game.i18n.localize("SR6.label.editButton");
        const windowTitle = this.element.querySelector(".window-header .window-title");
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "header-control icon toggleEditActor";
        editButton.dataset.tooltip = label;
        editButton.setAttribute("aria-label", label);
        editButton.dataset.action = "toggleEditActor";
        editButton.innerHTML = `<i class="fa-solid fa-toggle-off"></i>`;
                
        windowTitle.after(editButton);
    }

    /**************
     *
     *   ACTIONS
     *
     **************/

    /**
     * A generic event handler for action clicks which can be extended by subclasses.
     * Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have
     * no defined handler.
     * @param {PointerEvent} event      The originating click event
     * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
     * @protected
     */
    _onClickAction(event, target) {
        const action = target.dataset.action;
        switch ( action ) {
            case "toggleEditActor":
                this.toggleControls(false);
                this._onToggleEditActor(event);
                break;
        }
    }

    /**
     * Handle click event on the toggleEditActor button
     * @param {PointerEvent} event
     * @protected
     */
    _onToggleEditActor(event) {
        const button = event.target;
        const icon = button.querySelector("i");

        this.#editMode = !this.#editMode;
        const isEnabled = this.#editMode;
        button.setAttribute("aria-pressed", String(isEnabled));
        icon.classList.toggle("fa-toggle-off", !isEnabled);
        icon.classList.toggle("fa-toggle-on", isEnabled);
        this.render();
    }

    /**
     * Handle changing a Document's image.
     *
     * @this SR6BaseActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise}
     * @protected
     */
    static async _onEditImage(event, target) {
        const attr = target.dataset.edit;
        const current = foundry.utils.getProperty(this.document, attr);
        const { img } =
            this.document.constructor.getDefaultArtwork?.(
                this.document.toObject()
            ) ?? {};
        const fp = new FilePicker({
            current,
            type: "image",
            redirectToRoot: img ? [img] : [],
            callback: (path) => {
                this.document.update({ [attr]: path });
            },
            top: this.position.top + 40,
            left: this.position.left + 10,
        });
        return fp.browse();
    }

    /**
     * Renders an embedded document's sheet
     *
     * @this SR6BaseActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    static async _viewDoc(event, target) {
        const doc = this._getEmbeddedDocument(target);
        doc.sheet.render(true);
    }

    /**
     * Handles item deletion
     *
     * @this SR6BaseActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    static async _deleteDoc(event, target) {
        const doc = this._getEmbeddedDocument(target);
        await doc.delete();
        this.render();
    }

    /**
     * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
     *
     * @this SR6BaseActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    static async _createDoc(event, target) {
        // Retrieve the configured document class for Item or ActiveEffect
        const docCls = getDocumentClass(target.dataset.documentClass);
        // Prepare the document creation data by initializing it a default name.
        const docData = {
            name: docCls.defaultName({
                // defaultName handles an undefined type gracefully
                type: target.dataset.type,
                parent: this.actor,
            }),
        };
        switch (target.dataset.documentClass) {
                case "ActiveEffect":
                    docData.img = 'systems/shadowrun6-eden/icons/compendium/cyberware/memory_chip.svg';
                    break;
        }
        // Loop through the dataset and add it to our docData
        for (const [dataKey, value] of Object.entries(target.dataset)) {
            // These data attributes are reserved for the action handling
            if (["action", "documentClass"].includes(dataKey)) continue;
            // Nested properties require dot notation in the HTML, e.g. anything with `system`
            // An example exists in spells.hbs, with `data-system.spell-level`
            // which turns into the dataKey 'system.spellLevel'
            foundry.utils.setProperty(docData, dataKey, value);
        }

        // Finally, create the embedded document!
        await docCls.create(docData, { parent: this.actor });
        this.render();
    }

    /**
     * Determines effect parent to pass to helper
     *
     * @this SR6BaseActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    static async _toggleEffect(event, target) {
        const effect = this._getEmbeddedDocument(target);
        await effect.update({ disabled: !effect.disabled });
        this.render();
    }

    /**
     * Handle clickable rolls.
     *
     * @this SR6BaseActorSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    static async _onRoll(event, target) {
        event.preventDefault();
        const dataset = target.dataset;

        // Handle item rolls.
        switch (dataset.rollType) {
            case "item":
                const item = this._getEmbeddedDocument(target);
                if (item) return item.roll();
        }

        // Handle rolls that supply the formula directly.
        if (dataset.roll) {
            let label = dataset.label ? `[ability] ${dataset.label}` : "";
            let roll = new Roll(dataset.roll, this.actor.getRollData());
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label,
                rollMode: game.settings.get("core", "rollMode"),
            });
            return roll;
        }
    }

    /** Helper Functions */

    /**
     * Fetches the embedded document representing the containing HTML element
     *
     * @param {HTMLElement} target    The element subject to search
     * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
     */
    _getEmbeddedDocument(target) {
        const docRow = target.closest("li[data-document-class]");
        if (docRow.dataset.documentClass === "Item") {
            return this.actor.items.get(docRow.dataset.itemId);
        } else if (docRow.dataset.documentClass === "ActiveEffect") {
            const parent =
                docRow.dataset.parentId === this.actor.id
                    ? this.actor
                    : this.actor.items.get(docRow?.dataset.parentId);
            return parent.effects.get(docRow?.dataset.effectId);
        } else return console.warn("Could not find document class");
    }

    /***************
     *
     * Drag and Drop
     *
     ***************/

    /**
     * Handle the dropping of ActiveEffect data onto an Actor Sheet
     * @param {DragEvent} event                  The concluding DragEvent which contains drop data
     * @param {object} data                      The data transfer extracted from the event
     * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
     * @protected
     */
    async _onDropActiveEffect(event, data) {
        const aeCls = getDocumentClass("ActiveEffect");
        const effect = await aeCls.fromDropData(data);
        if (!this.actor.isOwner || !effect) return false;
        if (effect.target === this.actor)
            return this._onSortActiveEffect(event, effect);
        return aeCls.create(effect, { parent: this.actor });
    }

    /**
     * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
     *
     * @param {DragEvent} event
     * @param {ActiveEffect} effect
     */
    async _onSortActiveEffect(event, effect) {
        /** @type {HTMLElement} */
        const dropTarget = event.target.closest("[data-effect-id]");
        if (!dropTarget) return;
        const target = this._getEmbeddedDocument(dropTarget);

        // Don't sort on yourself
        if (effect.uuid === target.uuid) return;

        // Identify sibling items based on adjacent HTML elements
        const siblings = [];
        for (const el of dropTarget.parentElement.children) {
            const siblingId = el.dataset.effectId;
            const parentId = el.dataset.parentId;
            if (
                siblingId &&
                parentId &&
                (siblingId !== effect.id || parentId !== effect.parent.id)
            )
                siblings.push(this._getEmbeddedDocument(el));
        }

        // Perform the sort
        const sortUpdates = SortingHelpers.performIntegerSort(effect, {
            target,
            siblings,
        });

        // Split the updates up by parent document
        const directUpdates = [];

        const grandchildUpdateData = sortUpdates.reduce((items, u) => {
            const parentId = u.target.parent.id;
            const update = { _id: u.target.id, ...u.update };
            if (parentId === this.actor.id) {
                directUpdates.push(update);
                return items;
            }
            if (items[parentId]) items[parentId].push(update);
            else items[parentId] = [update];
            return items;
        }, {});

        // Effects-on-items updates
        for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
            await this.actor.items
                .get(itemId)
                .updateEmbeddedDocuments("ActiveEffect", updates);
        }

        // Update on the main actor
        return this.actor.updateEmbeddedDocuments(
            "ActiveEffect",
            directUpdates
        );
    }

    /**
     * Handle dropping of an Actor data onto another Actor sheet
     * @param {DragEvent} event            The concluding DragEvent which contains drop data
     * @param {object} data                The data transfer extracted from the event
     * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
     *                                     not permitted.
     * @protected
     */
    async _onDropActor(event, data) {
        if (!this.actor.isOwner) return false;
    }

    /* -------------------------------------------- */

    /**
     * Handle dropping of a Folder on an Actor Sheet.
     * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {object} data         The data transfer extracted from the event
     * @returns {Promise<Item[]>}
     * @protected
     */
    async _onDropFolder(event, data) {
        if (!this.actor.isOwner) return [];
        const folder = await Folder.implementation.fromDropData(data);
        if (folder.type !== "Item") return [];
        const droppedItemData = await Promise.all(
            folder.contents.map(async (item) => {
                if (!(document instanceof Item))
                    item = await fromUuid(item.uuid);
                return item;
            })
        );
        return this._onDropItemCreate(droppedItemData, event);
    }

    /**
     * Handle the final creation of dropped Item data on the Actor.
     * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
     * @param {object[]|object} itemData      The item data requested for creation
     * @param {DragEvent} event               The concluding DragEvent which provided the drop data
     * @returns {Promise<Item[]>}
     * @private
     */
    async _onDropItemCreate(itemData, event) {
        itemData = itemData instanceof Array ? itemData : [itemData];
        return this.actor.createEmbeddedDocuments("Item", itemData);
    }

    /********************
     *
     * Tab Scrolling Behavior
     *
     ********************/

    async close(options = {}) {
        this.#tabScrollCleanup?.();
        this.#tabScrollCleanup = null;
        return super.close(options);
    }

    _setupHoverScrollTabs(nav) {
        let raf = null;
        let scrollSpeed = 0;

        const edgeSize = 80;
        const maxSpeed = 5;

        const step = () => {
            if (scrollSpeed !== 0) {
                nav.scrollLeft += scrollSpeed;
                this._updateTabScrollIndicators(nav);
                raf = requestAnimationFrame(step);
            } else {
                raf = null;
            }
        };

        const startScrolling = () => {
            if (!raf) raf = requestAnimationFrame(step);
        };

        const stopScrolling = () => {
            scrollSpeed = 0;
        };

        const onMouseMove = (event) => {
            const rect = nav.getBoundingClientRect();
            const x = event.clientX - rect.left;

            if (x < edgeSize) {
                const factor = 1 - (x / edgeSize);
                scrollSpeed = -maxSpeed * factor;
                startScrolling();
            } else if (x > rect.width - edgeSize) {
                const factor = (x - (rect.width - edgeSize)) / edgeSize;
                scrollSpeed = maxSpeed * factor;
                startScrolling();
            } else {
                stopScrolling();
            }
        };

        const onMouseLeave = () => stopScrolling();
        const onScroll = () => this._updateTabScrollIndicators(nav);

        const onClick = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => this._scrollActiveTabIntoView(nav, true));
            });
        };

        const ro = new ResizeObserver(() => this._updateTabScrollIndicators(nav));
        ro.observe(nav);

        nav.addEventListener("mousemove", onMouseMove);
        nav.addEventListener("mouseleave", onMouseLeave);
        nav.addEventListener("scroll", onScroll);
        nav.addEventListener("click", onClick);

        this._updateTabScrollIndicators(nav);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            nav.removeEventListener("mousemove", onMouseMove);
            nav.removeEventListener("mouseleave", onMouseLeave);
            nav.removeEventListener("scroll", onScroll);
            nav.removeEventListener("click", onClick);
        };
    }

    _scrollActiveTabIntoView(nav, smooth = true) {
        const activeTab = nav.querySelector(".active");
        if (!activeTab) return;

        activeTab.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
            inline: "center",
            block: "nearest"
        });
    }

    _updateTabScrollIndicators(nav) {
        const maxScrollLeft = nav.scrollWidth - nav.clientWidth;
        const threshold = 4;

        nav.classList.toggle("can-scroll-left", nav.scrollLeft > threshold);
        nav.classList.toggle("can-scroll-right", nav.scrollLeft < maxScrollLeft - threshold);
        this._scrollActiveTabIntoView(nav)
    }
}
