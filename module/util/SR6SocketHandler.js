export default class SR6SocketHandler {
    identifier = "system.shadowrun6-eden";

    registerSocketListeners() {
        game.socket.on(this.identifier, (data) => {
            console.log('SR6 | Socket Listener Event | type:', data.type);
            switch (data.type) {
                case "opponentEdgeReroll":
                    this.#opponentEdgeReroll(data);
                    break;
                default:
                    throw new Error('unknown type');
            }
        });
    }

    emit(data) {
        console.log('SR6 | Socket emit | data:', data);
        return game.socket.emit(this.identifier, data);
    }

    edgeRerollDice(userId, chatMsgId, rolls) {
        console.log('SR6 | Socket send | edgeRerollDice send to:', game.users.get(userId).name);
        rolls = (typeof rolls === "string") ? rolls : JSON.stringify(chatMsg.rolls);
        this.emit({ 
            type: 'opponentEdgeReroll', 
            userId: userId,
            chatMsgId: chatMsgId,
            rolls: rolls 
        });
    }    

    async #opponentEdgeReroll(data) {
        console.log('SR6 | Socket message received | opponentEdgeReroll for:', game.users.get(data.userId).name);
        if (game.userId !== data.userId) return;
        console.log('SR6 | Socket processing | opponentEdgeReroll data', data);
        const chatMsg = game.messages.get(data.chatMsgId);
        await chatMsg.update({
            [`rolls`]: JSON.parse(data.rolls),
        });
    }
}