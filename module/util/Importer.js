import { NPC } from "./npc.js";
import { SYSTEM_NAME } from "../constants.js";
export default class Importer {
    static async pasteEventhandler(e) {
        let rawData = "";
        if (e instanceof ClipboardEvent) {
            rawData = e.clipboardData.getData("text");
        }
        else {
            rawData = await navigator.clipboard.readText();
        }
        rawData = rawData.replace(/(\r\n|\n|\r)/gm, "\n");
        if (game.packs.get("world.npcs") === undefined) {
            await CompendiumCollection.createCompendium({
                type: 'Actor',
                name: "npcs",
                label: "NPCs",
                path: "",
                private: false,
                package: "sr6",
                system: "shadowrun6-eden",
            });
        }
        await rawData.split(/\n\n/).forEach(async (rawData) => {
            try {
                const npc = new NPC(rawData.trim());
                const actor = await Actor.create(npc.to_vtt());
                let msg = game.i18n.format("shadowrun6.ui.notifications.statblock_import.success", { actor: actor.name });
                if (game.settings.get(SYSTEM_NAME, "importToCompendium")) {
                    await game.packs.get("world.npcs").importDocument(actor);
                    await actor?.delete();
                    msg += game.i18n.format("shadowrun6.ui.notifications.statblock_import.npc_compendium");
                } else {
                    msg += game.i18n.format("shadowrun6.ui.notifications.statblock_import.actor_tab");
                }
                ui.notifications.info(msg, { localize: false, console: false });
                console.log('SR6E | NPC Importer | Succesfully imported', actor.name);
            }
            catch (e) {
                console.error('SR6E | NPC Importer |', e, rawData);
                ui.notifications.error("shadowrun6.ui.notifications.statblock_import.error", { localize: true, console: false });
            }
        });
    }
}