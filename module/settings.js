import { SYSTEM_NAME } from "./constants.js";
export const registerSystemSettings = () => {
    /**
     * Track the system version upon which point a migration was last applied
     */
    game.settings.register(SYSTEM_NAME, "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });
    /**
     * Register resting variants
     */
    game.settings.register(SYSTEM_NAME, "maxEdgePerRound", {
        name: "shadowrun6.settings.maxEdgePerRound.name",
        hint: "shadowrun6.settings.maxEdgePerRound.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 2,
        onChange: (max) => {
            console.log("SR6E | maxEdgePerRound adjusted to " + max);
            game.settings.set(SYSTEM_NAME, "maxEdgePerRound", max);
            //      game.actors.forEach(actor => {
            //        if (actor.type == "character") {
            //          actor.prepareData();
            //        }
            //      });
        }
    });
    game.settings.register(SYSTEM_NAME, "importToCompendium", {
        name: "shadowrun6.settings.importToCompendium.name",
        hint: "shadowrun6.settings.importToCompendium.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: (toggle) => {
            console.log("SR6E | importToCompendium changed to " + toggle);
            game.settings.set(SYSTEM_NAME, "importToCompendium", toggle);
        }
    });
    game.settings.register(SYSTEM_NAME, "hardDiceCap", {
        name: "shadowrun6.settings.hardDiceCap.name",
        hint: "shadowrun6.settings.hardDiceCap.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
        onChange: (toggle) => {
            console.log("SR6E | Setting hardDiceCap changed to " + toggle);
            game.settings.set(SYSTEM_NAME, "hardDiceCap", toggle);
        }
    });
    game.settings.register(SYSTEM_NAME, "bleeding", {
        name: "shadowrun6.settings.bleeding.name",
        hint: "shadowrun6.settings.bleeding.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
        onChange: (toggle) => {
            console.log("SR6E | Setting bleeding changed to " + toggle);
            game.settings.set(SYSTEM_NAME, "bleeding", toggle);
        }
    });
    game.settings.register(SYSTEM_NAME, "armorLessensDmg", {
        name: "shadowrun6.settings.armorLessensDmg.name",
        hint: "shadowrun6.settings.armorLessensDmg.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
        onChange: (toggle) => {
            console.log("SR6E | Setting armorLessensDmg changed to " + toggle);
            game.settings.set(SYSTEM_NAME, "armorLessensDmg", toggle);
        }
    });
    game.settings.register(SYSTEM_NAME, "rollStrengthCombat", {
        name: "shadowrun6.settings.rollStrengthCombat.name",
        hint: "shadowrun6.settings.rollStrengthCombat.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
        onChange: (toggle) => {
            console.log("SR6E | Setting rollStrengthCombat changed to " + toggle);
            game.settings.set(SYSTEM_NAME, "rollStrengthCombat", toggle);
        }
    });
};