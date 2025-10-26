import { SYSTEM_NAME } from "../constants.js";

export async function pdfJournalInit() {
    if(!game.user.isGM)
        return false;
    
    console.log("SR6E | Initializing PDF Journals");
    const books = CONFIG.SR6.PDF_OPTIONS.BOOKS; // Object
    const booksConfigured = new Map();

    for (const id in books) {
        const src = game.settings.get(SYSTEM_NAME, `pdf-${id}`);
        if (src) {
            booksConfigured.set(id, {
                src: src,
                offset: game.settings.get(SYSTEM_NAME, `pdf-${id}-offset`),
                journalUuid: game.settings.get(SYSTEM_NAME, `pdf-${id}-journalUuid`)
            });
        }
    }
    // console.log("SR6E | Initializing PDF Journals | Books Configured:", booksConfigured);

    const folder = game.journal.folders.getName( game.i18n.localize("PDF.folder") )
                   ?? await Folder.create({type: "JournalEntry", name: game.i18n.localize("PDF.folder"), color: '#b82a93'});
    // console.log("SR6E | Initializing PDF Journals | Folder:", folder);

    for (const [key, value] of booksConfigured.entries()) {
        // console.log("SR6E | Initializing PDF Journals | Initializing:", key, value);
        const dataJournal = {
                name: game.i18n.localize(`PDF.book.${key}`),
                folder: folder.id,
                'ownership.default': CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
                'flags.core.locked': true
        };
        const dataJournalEntry = {
                name: game.i18n.localize(`PDF.book.${key}`),
                type: "pdf",
                src: value.src,
                'flags.core.sheetClass': "shadowrun6-eden.PDFSheet"
        };

        let pdfJournalEntry = fromUuidSync( value.journalUuid );
        if (pdfJournalEntry) {
            const updatedJournal = await pdfJournalEntry.parent.update( dataJournal );
            const updatedEntry = await pdfJournalEntry.update( dataJournalEntry );
            if (updatedJournal || updatedEntry) console.log("SR6E | Initializing PDF Journals | Journal", key, "was changed, reverted back");
        }

        if (!pdfJournalEntry) {
            // console.log("SR6E | Initializing PDF Journals | Creating a new Journal for:", key);
            const journal = await foundry.documents.JournalEntry.create( dataJournal );
            // console.log("SR6E | Initializing PDF Journals | Creating a new PDF Entry on:", journal);
            [pdfJournalEntry] = await journal.createEmbeddedDocuments("JournalEntryPage", [ dataJournalEntry ]);
            console.log("SR6E | Initializing PDF Journals | Created PDF Entry:", pdfJournalEntry.uuid, pdfJournalEntry);
            await game.settings.set(SYSTEM_NAME, `pdf-${key}-journalUuid`, pdfJournalEntry.uuid);
        }

        console.log("SR6E | Initializing PDF Journals | Initialized:", pdfJournalEntry);

    }
}

