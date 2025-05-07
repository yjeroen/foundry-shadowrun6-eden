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

export function migrateWorld() {
    if(!game.user.isGM)
        return false;
    
    game.messages.forEach(element => {
        migrateChatMessage(element);
    });
}

function migrateChatMessage(chatMessage) {
    const messageVersion = chatMessage.getFlag(SYSTEM_NAME, "version");

    // 3.1.3 - Migrate dice css from individual badged-images to css badges
    if(isVersionBelow(chatMessage._stats.systemVersion, 3, 1, 4) && !isVersionBelow(messageVersion, 3, 1, 4)) {
        console.log("SR6E | Migration | migrateChatMessage", messageVersion, chatMessage)
        let updatedMsg = {
            flags: {
                [SYSTEM_NAME]: {
                    version: game.system.version
                }
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
            // Todo: Transition from terms to result
        }

        chatMessage.update(updatedMsg);
    }
}