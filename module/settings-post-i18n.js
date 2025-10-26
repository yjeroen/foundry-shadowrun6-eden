import { SYSTEM_NAME } from "./constants.js";
export const registerSystemSettingsPosti18n = () => {
    
    const books = game.i18n.translations.PDF.book;
    const orderedBooks = Object.keys(books).sort((a, b) => books[a].localeCompare(books[b]));

    for (const id in orderedBooks) {
        game.settings.register(SYSTEM_NAME, `pdf-${orderedBooks[id]}`, {
            name: `PDF.book.${orderedBooks[id]}`,
            scope: "world",
            config: true,
            type: String,
            filePicker: "pdf",
            requiresReload: true,
            onChange: (toggle) => {
                console.log(`SR6E | Setting pdf-${orderedBooks[id]} changed to ` + toggle);
            }
        });
        game.settings.register(SYSTEM_NAME, `pdf-${orderedBooks[id]}-offset`, {
            name: "shadowrun6.settings.pdf.offset.name",
            hint: "shadowrun6.settings.pdf.offset.hint",
            scope: "world",
            config: true,
            type: Number,
            default: 0,
            requiresReload: true,
            onChange: (toggle) => {
                console.log(`SR6E | Setting pdf-${orderedBooks[id]}-offset changed to ` + toggle);
            }
        });
        game.settings.register(SYSTEM_NAME, `pdf-${orderedBooks[id]}-journalUuid`, {
            name: "PDF Journal Entry UUID",
            scope: "world",
            config: false,
            type: String,
            default: ""
        });
    }

};