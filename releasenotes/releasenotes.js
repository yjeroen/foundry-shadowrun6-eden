import CONFIG from "./config.js";

/**
 * Release Note window
 * Call this function within Foundry's "ready" Hook
   * @param {object} [options]  Additional options which affect tab navigation
   * @param {number} [options.noteIndex=0]         Force changing the tab even if the new tab is already active
   * @param {boolean} [options.force=false]         Force changing the tab even if the new tab is already active
 */
export default async function releaseNotes({noteIndex=0, force=false}={}) {
    // Note template url
    const folderPath = `systems/${game.system.id}/releasenotes/notes`;

    // Config Array
    const config = CONFIG;
    const releaseNote = config[noteIndex];

    // Flag that determines if latest notes are read
    let notesRead = game.user.getFlag(game.system.id, 'releaseNoteRead');

    // Don't continue if the user already read the latest release notes
    if (releaseNote.version === notesRead && !force) {
        console.log(`Release Notes | Latest already read`);
        return;
    }

    // Loading release note markdown
    let showdownConverter   = new showdown.Converter();
    let response            = await foundry.utils.fetchWithTimeout( foundry.utils.getRoute(`${releaseNote.version}.mkd`, {prefix: folderPath}) );
    let mkd                 = await response.text();
    var html                = showdownConverter.makeHtml( mkd );
    
    console.log(`Release Notes | Displaying ${noteIndex===0?"latest":""}`, releaseNote.version);

    const buttons = [{
            label: "Open Patreon",
            icon: "fas fa-external-link-alt",
            action: "patreon"
    }];
    if ( noteIndex !== (config.length-1) ) {
        buttons.push({
            label: "Older",
            class: "icon-right",
            icon: "fa-solid fa-angles-left",
            action: "open-older"
        });
    }
    if ( noteIndex !== 0 ) {
        buttons.push({
            label: "Newer",
            icon: "fa-solid fa-angles-right",
            action: "open-newer"
        });
    }
    if ( noteIndex === 0 ) {
        buttons.push({
            label: "Mark as read",
            icon: "fa-solid fa-check",
            action: "read",
            default: true
        });
    }

    // Returns buttons.action string, or null when closed without clicking on a button
    const buttonClicked = await foundry.applications.api.DialogV2.wait({
        classes: ["releasenotes"],
        window: { title: `${game.system.title} — Release Notes ${releaseNote.version}` },
        content: html,
        modal: false,
        rejectClose: false,
        buttons: buttons
    });
    
    // Marking latest note as read
    if (config[0].version === releaseNote.version && buttonClicked) {
        console.log(`Release Notes | Setting latest read: `, releaseNote.version);
        await game.user.setFlag(game.system.id, 'releaseNoteRead', releaseNote.version);
    }

    // Determining action to be taken
    switch (buttonClicked) {
        case 'patreon':
            console.log(`Release Notes | Opening Patreon link`);
            window.open(releaseNote.url, '_blank');
            break;
        case 'open-older':
            console.log(`Release Notes | Opening older release note`);
            releaseNotes({noteIndex: noteIndex + 1});
            break;
        case 'open-newer':
            console.log(`Release Notes | Opening newer release note`);
            releaseNotes({noteIndex: noteIndex - 1, force: true});
            break;
        case 'read':
            break;
        default:
            console.log(`Release Notes | Window closed`);
            return;
    }

}