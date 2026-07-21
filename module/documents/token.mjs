/**
 * The client-side Token document which extends the TokenDocument document model.
 *
 * The following fields must no be altered from source during data preparation:
 * `x`, `y`, `elevation`, `width`, `height`, `shape`.
 *
 * ### Hook Events
 * - {@link hookEvents.moveToken}
 * - {@link hookEvents.pauseToken}
 * - {@link hookEvents.preMoveToken}
 * - {@link hookEvents.stopToken}
 *
 * @extends TokenDocument
 * @category Documents
 *
 * @see {@link foundry.documents.TokenDocument}: The document that is extended
 * @see {@link foundry.documents.Scene}: The Scene document type which contains Token documents
 * @see {@link foundry.applications.sheets.TokenConfig}: The Token configuration application
 */
export default class SR6TokenDocument extends foundry.documents.TokenDocument {

    /**
     * Post-process a deletion operation for a single Document instance. Post-operation events occur for all connected
     * clients.
     *
     * @param {object} options            Additional options which modify the deletion request
     * @param {string} userId             The id of the User requesting the document update
     * @protected
     */
    _onDelete(options, userId) {
        super._onDelete(options, userId);
        this._checkDeployedHostItem();
        return true;
    }

    _checkDeployedHostItem() {
        const deployedItemUuid = this.getFlag("shadowrun6-eden", "deployedItemUuid");
        if (!deployedItemUuid) return;

        const item = foundry.utils.fromUuidSync(deployedItemUuid);
        console.log("SR6E | SR6TokenDocument | This is a deployedItem from a Host Actor | cancelling deployment of", item.name, item.uuid);
        item.unsetFlag("shadowrun6-eden", "isDeployedItem");
    }

}