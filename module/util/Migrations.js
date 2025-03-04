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
    game.messages.forEach(element => {
        migrateChatMessage(element);
    });
}

function migrateChatMessage(chatMessage) {
    //return false;
    if(!game.user.isGM)
        return false;

    const messageVersion = chatMessage.getFlag(SYSTEM_NAME, "version");

    // 3.1.3 - Migrate dice css from individual badged-images to css badges
    if(isVersionBelow(messageVersion, 3, 1, 3)) {
        // Migrate dice css from individual badged-images to css badges
        chatMessage.rolls[0].results.forEach(result => {
            result.classes = result.classes.replace(/(die_[1-6])_exploded_ignored/, "$1 exploded ignored");
            result.classes = result.classes.replace(/(die_[1-6])_exploded/, "$1 exploded");
            result.classes = result.classes.replace(/(die_[1-6])_ignored/, "$1 ignored");

        });
        chatMessage.update({
            rolls: chatMessage.rolls,
            flags: {
                [SYSTEM_NAME]: {
                    version: game.system.version
                }
            }
        });
        return true;
    }
    else {
        return false;
    }
}