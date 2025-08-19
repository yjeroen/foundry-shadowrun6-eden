import Importer from "./Importer.js";

export default class SR6Keybindings {

    static initialize() {
        const {SHIFT, CONTROL, ALT} = KeyboardManager.MODIFIER_KEYS;
        if ( game.view !== "game" ) {
            console.warning(`SR6E | Cannot initialize keybindings due to not being in the game.`);
            return;
        }

        game.keybindings.register("shadowrun6-eden", "formGruntGroup", {
            name: "shadowrun6.KEYBINDINGS.formGruntGroup",
            uneditable: [
                {key: "KeyG", modifiers: [SHIFT]},
            ],
            onDown: SR6Keybindings._onFormGruntGroup
        });

        // game.keybindings.register("shadowrun6-eden", "bindTokenControlGroup", {
        //     name: "shadowrun6.KEYBINDINGS.bindTokenControlGroup",
        //     uneditable: [
        //         {key: "Digit1", modifiers: [CONTROL]},
        //         {key: "Digit2", modifiers: [CONTROL]},
        //         {key: "Digit3", modifiers: [CONTROL]}
        //     ],
        //     onDown: SR6Keybindings._onBindTokenControlGroup
        // });

        // game.keybindings.register("shadowrun6-eden", "selectTokenControlGroup", {
        //     name: "shadowrun6.KEYBINDINGS.selectTokenControlGroup",
        //     uneditable: [
        //         {key: "Digit1", modifiers: [SHIFT]},
        //         {key: "Digit2", modifiers: [SHIFT]},
        //         {key: "Digit3", modifiers: [SHIFT]}
        //     ],
        //     onDown: SR6Keybindings._onSelectTokenControlGroup
        // });

        document.addEventListener('paste', (e) => {
            if ( e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA"
                && !e.target.parentElement?.classList?.contains('ProseMirror')
                && !e.target.offsetParent?.classList?.contains('ProseMirror')
                && !e.target.className?.includes('ProseMirror')    ) {

                console.log("SR6E | Pasting text | Triggering NPC Importer by event:", e);
                Importer.pasteEventhandler(e);
                
            }
        }, false);
    }

    /**
     * Handle forming a Grunt Group with the selected tokens
     * @param {KeyboardEventContext} context    The context data of the event
     * @private
     */
    static async _onFormGruntGroup(context) {
        if (!canvas.ready || !canvas.tokens.controlled.length) return false;
        const tokens = [];
        canvas.tokens.controlled.forEach((token) => {
            if (token.isOwner && !token.document.actorLink) tokens.push(token);
            else token.release();
        });
        if (!tokens.length) {
            ui.notifications.warn(game.i18n.format("shadowrun6.ui.notifications.form_grunt_group_failed"), { console: false });
            return false;
        }

        // Let's check if we need to dismantle the Grunt Group!
        // Get first Token of the selection document's GruntGroupId via .find(() => true)
        const oldGruntGroupId = tokens.find(() => true).document.getFlag(game.system.id, 'GruntGroupId');
        const dismantleGruntGroup = tokens.every((token) => token.document.getFlag(game.system.id, 'GruntGroupId') === oldGruntGroupId);
        if (oldGruntGroupId !== undefined && dismantleGruntGroup) {
            console.log(`SR6E | Keybind SHIFT-G | Dismantling Grunt Group ${oldGruntGroupId}`);
            ui.notifications.info(game.i18n.format("shadowrun6.ui.notifications.dismantle_grunt_group"), { console: false });
            tokens.forEach(async (token) => {
                await token.document.unsetFlag(game.system.id, 'GruntGroupId');
                token.updateGruntGroupName();
            });
            return true;
        }

        if (tokens.length === 1) {
            ui.notifications.warn(game.i18n.format("shadowrun6.ui.notifications.grunt_group_takes_two"), { console: false });
            return false;
        }

        // Else let's form the Grunt Group!
        const sceneGruntGroups = [];
        let newGruntGroupId = 1;
        canvas.scene.tokens.forEach((tokenDoc) => {
            const groupId = tokenDoc.getFlag(game.system.id, 'GruntGroupId');
            if (groupId) sceneGruntGroups.push(groupId);
        });
        sceneGruntGroups.sort((a, b) => a.id - b.id);
        sceneGruntGroups.forEach((groupId) => newGruntGroupId = (groupId == newGruntGroupId ? newGruntGroupId+1 : newGruntGroupId) );
        
        console.log(`SR6E | Keybind SHIFT-G | Form Grunt Group ${newGruntGroupId} with Tokens`, tokens);
        ui.notifications.info(game.i18n.format("shadowrun6.ui.notifications.form_grunt_group"), { console: false });
        tokens.forEach(async (token) => {
            await token.document.setFlag(game.system.id, 'GruntGroupId', newGruntGroupId);
            token.updateGruntGroupName();
        });
        return true;
    }

    /**
     * Handle Select all action
     * @param {KeyboardEventContext} context    The context data of the event
     * @private
     */
    static _onSelectTokenControlGroup(context) {
        const key = KeyboardManager.getKeycodeDisplayString(context.key);
        if (!canvas.ready) return false;
        console.log(`SR6E | Keybind SHIFT-${key} | Select Token Control Group ${key}.`);
        ui.notifications.info(game.i18n.format("shadowrun6.ui.notifications.select_control_group", { controlGroup: key }), { console: false });

        canvas.activeLayer.controlAll();
        return true;
    }

    static async _onBindTokenControlGroup(context) {
        if (!canvas.ready || !canvas.tokens.controlled.length) return false;
        const tokens = [];
        canvas.tokens.controlled.forEach((selectedToken) => {
            if (selectedToken.isOwner) tokens.push(selectedToken.id);
        });
        if (!tokens.length) return false;

        // TODO: rework and save in Tokens instead
        const controlGroups = game.user.getFlag(game.system.id, 'TokenControlGroups') ?? {};
        const key = KeyboardManager.getKeycodeDisplayString(context.key);
        console.log(`SR6E | Keybind CTRL-${key} | Bind Tokens Control Group ${key}.`, tokens);
        ui.notifications.info(game.i18n.format("shadowrun6.ui.notifications.bind_control_group", { controlGroup: key }), { console: false });

        const controlGroup = {};
        controlGroup[key] = {
            tokens: tokens,
        };
        if (controlGroups[canvas.scene.id]) {
            controlGroups[canvas.scene.id][key] = controlGroup
        }
        Object.defineProperty(controlGroups, canvas.scene.uuid, { 
            value: controlGroup
        });
        await game.user.setFlag(game.system.id, 'TokenControlGroups', controlGroups);
        // canvas.activeLayer.controlAll();
        console.log('controlGroups', controlGroups);
        return true;
    }



}