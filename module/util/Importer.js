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
                let npc = new NPC(rawData.trim());
                let actor = await Actor.create(npc.to_vtt());
                if (game.settings.get(SYSTEM_NAME, "importToCompendium")) {
                    await game.packs.get("world.npcs").importDocument(actor);
                    await actor?.delete();
                }
            }
            catch (e) {
                console.error('SR6E |', e, rawData);
            }
        });
    }
}