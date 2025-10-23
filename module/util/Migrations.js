import { SYSTEM_NAME } from "../constants.js";

function isVersionBelow(version, major, minor, patch) {
    if(!version)
        return true;
    
    const [vMajor, vMinor, vPatch] = version.split('.').map(Number);
    if (vMajor < major) return true;
    if (vMajor === major && vMinor < minor) return true;
    if (vMajor === major && vMinor === minor && vPatch < patch) return true;
    return false;
}
function docIsVersionBelow(document, major, minor, patch) {
    return (    isVersionBelow(document._stats.systemVersion, major, minor, patch) 
             && isVersionBelow(document.getFlag(SYSTEM_NAME, "versionMigrated"), major, minor, patch)
            );
}
function progressNotification(percentage, progressMsg) {
    if (foundry.utils.isNewerVersion(game.version, '13')) {
        if (percentage == 0) {
            progressMsg = ui.notifications.info("shadowrun6.ui.notifications.migration.in_progress", {progress: true, console: false, localize: true});
            progressMsg.update({pct: 0.05, message: "shadowrun6.ui.notifications.migration.in_progress", console: false, localize: true});
            return progressMsg;
        } else {
            progressMsg.update({pct: percentage, message: "shadowrun6.ui.notifications.migration.in_progress", console: false, localize: true});
        }
    }
}

export async function migrateWorld() {
    if(!game.user.isGM)
        return false;
    
    game.messages.forEach(element => {  // 3.1.4
        migrateChatMessage(element);
    });

    await migrateCombatSpells();    // 3.2.1
    await addUnarmedItems();        // 3.3.5
}

function migrateChatMessage(chatMessage) {
    const messageVersion = chatMessage.getFlag(SYSTEM_NAME, "version");

    // 3.1.3 - Migrate dice css from individual badged-images to css badges
    if(isVersionBelow(chatMessage._stats.systemVersion, 3, 1, 4) && !isVersionBelow(messageVersion, 3, 1, 4)) {
        console.log("SR6E | Migration | migrateChatMessage", messageVersion, chatMessage)
        let updatedMsg = {
            flags: {
                [SYSTEM_NAME]: { version: '3.2.1' }
            }
        };

        // Migrate dice css from individual badged-images to css badges
        if(chatMessage.rolls.length) {
            chatMessage.rolls[0]?.results?.forEach(result => {
                result.classes = result.classes.replace(/(die_[1-6])_exploded_ignored/, "$1 exploded ignored");
                result.classes = result.classes.replace(/(die_[1-6])_exploded/, "$1 exploded");
                result.classes = result.classes.replace(/(die_[1-6])_ignored/, "$1 ignored");
            });
            chatMessage.rolls[0]?.applyDiceCss();

            updatedMsg.rolls = chatMessage.rolls;
        }

        chatMessage.update(updatedMsg);
    }
}

async function migrateCombatSpells() {
    let migrating = false;
    const itemsToMigrate = [];

    // Checking if there are items to Migrate
    game.items.forEach(item => {
        if ( docIsVersionBelow(item, 3,2,1) && item.system.category === "combat" ) {
            migrating = true;
            itemsToMigrate.push(item);
        }
    });
    game.actors.forEach(actor => {
        if ( docIsVersionBelow(actor, 3,2,1)) {
            actor.items.forEach(item => {
                if ( docIsVersionBelow(item, 3,2,1) && item.system.category === "combat" ) {
                    migrating = true;
                    itemsToMigrate.push(item);
                }
            });
        }
    });
    
    // Don't migrate if there's nothing to do
    if (!migrating) return;
         
    // Prepare migration
    console.log("SR6E | Migration | migrating Combat Spells due to changes in 3.2.1", itemsToMigrate)
    const migrationMsg = ui.notifications.error("shadowrun6.ui.notifications.migration.start", {permanent: true, console: false, localize: true});
    let progressedItem = 0;
    const msg = progressNotification(0); //v13 only
    const flag = { [SYSTEM_NAME]: { versionMigrated: '3.2.1' } };

    // Migrate items
    for (const item of itemsToMigrate) { 
        if (item.actor) await item.actor.update({flags: flag});
        await item.update({flags: flag, 'system.combatSpellType': item.system.type=="mana" ? "spells_direct" : "spells_indirect"});
        progressedItem++;
        // await new Promise(resolve => setTimeout(resolve, 2000)); // testing behavior via timeout wait
        progressNotification(progressedItem / itemsToMigrate.length, msg);
    };

    ui.notifications.remove(migrationMsg);
    ui.notifications.info("shadowrun6.ui.notifications.migration.completed", { console: false, localize: true });
    console.log("SR6E | Migration | Completed")
}

async function addUnarmedItems() {
    let migrating = false;
    const actorsToMigrate = [];

    // Checking if there are actors to Migrate
    game.actors.forEach(actor => {
        if ( 
            docIsVersionBelow(actor, 3,3,5) && !actor.items.getName(game.i18n.localize("shadowrun6.gear.subtype.UNARMED")) 
            && ( actor.type === "Player" || actor.type === "NPC")
           ) {
            migrating = true;
            actorsToMigrate.push(actor);
        }
    });
    
    // Don't migrate if there's nothing to do
    if (!migrating) return;
         
    // Prepare migration
    console.log("SR6E | Migration | migrating Actors due to changes in 3.3.5 to add Unarmed weapon", actorsToMigrate)
    const migrationMsg = ui.notifications.error("shadowrun6.ui.notifications.migration.start", {permanent: true, console: false, localize: true});
    let progressedItem = 0;
    const msg = progressNotification(0); //v13 only
    const flag = { [SYSTEM_NAME]: { versionMigrated: '3.3.5' } };

    // Migrate actors
    for (const actor of actorsToMigrate) {
        await actor._addUnarmed();
        await actor.update({flags: flag});
        progressedItem++;
        progressNotification(progressedItem / actorsToMigrate.length, msg);
    };

    ui.notifications.remove(migrationMsg);
    ui.notifications.info("shadowrun6.ui.notifications.migration.completed", { console: false, localize: true });
    console.log("SR6E | Migration | Completed")
}