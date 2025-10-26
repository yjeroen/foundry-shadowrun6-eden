/**
 * An Application responsible for displaying and editing a single pdf-type JournalEntryPage Document.
 * @extends JournalEntryPagePDFSheet
 */
export default class PDFSheet extends foundry.applications.sheets.journal.JournalEntryPagePDFSheet {
    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["read-only-pdf"],
        window: {
            icon: "fa-solid fa-file"
        }
    };

    /** @inheritDoc */
    static EDIT_PARTS = {
        content: {
            template: "systems/shadowrun6-eden/templates/sheets/journal/pdf-journal.hbs",
            root: true
        }
    };

    /** @inheritDoc */
    static VIEW_PARTS = {
        content: {
            template: "systems/shadowrun6-eden/templates/sheets/journal/pdf-journal.hbs",
            root: true
        }
    };
}