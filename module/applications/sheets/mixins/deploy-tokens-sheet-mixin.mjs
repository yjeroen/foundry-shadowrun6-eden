/**
 * Augment an Application class with methods for deploying tokens.
 *
 * @param {Constructor<ApplicationV2>} Base
 * @returns {Constructor<ApplicationV2>}
 */
export const DeployTokensSheetMixin = Base => class extends Base {

    /**
     * Create one or more tokens in free spaces near this sheet actor's token.
     *
     * @param {TokenDocument|TokenDocument[]} tokenDocuments
     * @returns {Promise<TokenDocument[]>}
     */
    async deployTokens(tokenDocuments) {
        const originToken = this.actor.token ?? this.actor.getActiveTokens(true, true).shift();
        console.log("SR6E | DeployTokensSheetMixin.deployTokens | originToken:", originToken);
        if (!originToken) return ui.notifications.error("shadowrun6.ui.notifications.needs_token_on_canvas", { localize: true });

        const scene = originToken.parent;
        const tokens = Array.isArray(tokenDocuments) ? tokenDocuments : [tokenDocuments];

        const tokenData = tokens
            .map(token => token.toObject())
            .sort((a, b) => (b.width * b.height) - (a.width * a.height));

        const occupiedBounds = canvas.tokens.placeables.map(token => ({
            x: token.document.x,
            y: token.document.y,
            width: token.w,
            height: token.h
        }));

        const positions = tokenData.map(data => {
            const position = this._findTokenPosition(data, originToken, occupiedBounds);
            occupiedBounds.push(this._getTokenBounds(data, position));
            return position;
        });

        for (const data of tokenData) {
            delete data._id;
            data.x = originToken.x;
            data.y = originToken.y;
            data.elevation = originToken.elevation;
        }

        const createdTokens = await scene.createEmbeddedDocuments("Token", tokenData);

        const updates = createdTokens.map((token, index) => ({
            _id: token.id,
            x: positions[index].x,
            y: positions[index].y,
            elevation: originToken.elevation
        }));

        const animationDuration = 1500;
        return scene.updateEmbeddedDocuments("Token", updates, {
            animation: { duration: animationDuration }
        });

        return createdTokens;
    }

    /**
     * Move one or more deployed tokens back to the origin token and delete them.
     *
     * @param {TokenDocument|TokenDocument[]} tokenDocuments
     * @returns {Promise<void>}
     */
    async retrieveTokens(tokenDocuments) {
        if (!tokenDocuments) return;
        const originToken = this.actor.token ?? this.actor.getActiveTokens(true, true).shift();
        const tokens = Array.isArray(tokenDocuments) ? tokenDocuments : [tokenDocuments];
        console.log("SR6E | DeployTokensSheetMixin.retrieveTokens | tokens:", tokens);

        const updates = tokens.map(token => ({
            _id: token.id,
            x: originToken.x,
            y: originToken.y,
            elevation: originToken.elevation
        }));

        await originToken.parent.updateEmbeddedDocuments("Token", updates);

        await Promise.all(tokens.map(async token => {
            const animation = token.object?.animationContexts.get(token.object.movementAnimationName);
            await animation?.promise;
            await token.delete();
        }));
    }

    /**
     * Find the closest available position for a token.
     *
     * @param {object} tokenData
     * @param {TokenDocument} originToken
     * @param {object[]} occupiedBounds
     * @returns {{x: number, y: number}}
     * @private
     */
    _findTokenPosition(tokenData, originToken, occupiedBounds) {
        const positions = this._getTokenPositions(originToken);

        const position = positions.find(position => {
            const bounds = this._getTokenBounds(tokenData, position);

            return this._isWithinScene(bounds)
                && !occupiedBounds.some(occupied =>
                    this._boundsOverlap(bounds, occupied)
                )
                && !originToken.object.checkCollision(
                    this._getBoundsCenter(bounds),
                    { type: "move", mode: "any" }
                );
        });

        return position ?? {
            x: originToken.x,
            y: originToken.y
        };
    }

    /**
     * Generate nearby canvas positions, ordered from closest to furthest.
     *
     * @param {TokenDocument} originToken
     * @returns {{x: number, y: number}[]}
     * @private
     */
    _getTokenPositions(originToken) {
        const gridSize = canvas.grid.size;
        const searchRadius = 7;
        const positions = [];

        for (let radius = 1; radius <= searchRadius; radius++) {
            for (let y = -radius; y <= radius; y++) {
                for (let x = -radius; x <= radius; x++) {
                    const isOuterEdge =
                        Math.abs(x) === radius ||
                        Math.abs(y) === radius;

                    if (!isOuterEdge) continue;

                    positions.push({
                        x: originToken.x + x * gridSize,
                        y: originToken.y + y * gridSize
                    });
                }
            }
        }

        return positions.sort((a, b) => {
            const distanceA = Math.hypot(
                a.x - originToken.x,
                a.y - originToken.y
            );

            const distanceB = Math.hypot(
                b.x - originToken.x,
                b.y - originToken.y
            );

            return distanceA - distanceB || b.x - a.x;
        });
    }

    /**
     * Get the pixel bounds a token would occupy at a position.
     *
     * @param {object} tokenData
     * @param {{x: number, y: number}} position
     * @returns {{x: number, y: number, width: number, height: number}}
     * @private
     */
    _getTokenBounds(tokenData, position) {
        return {
            x: position.x,
            y: position.y,
            width: tokenData.width * canvas.grid.size,
            height: tokenData.height * canvas.grid.size
        };
    }

    /**
     * Get the center point of rectangular bounds.
     *
     * @param {{x: number, y: number, width: number, height: number}} bounds
     * @returns {{x: number, y: number}}
     * @private
     */
    _getBoundsCenter(bounds) {
        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
        };
    }

    /**
     * Determine whether bounds are fully inside the scene.
     *
     * @param {{x: number, y: number, width: number, height: number}} bounds
     * @returns {boolean}
     * @private
     */
    _isWithinScene(bounds) {
        const sceneRect = canvas.dimensions.sceneRect;

        return bounds.x >= sceneRect.x
            && bounds.y >= sceneRect.y
            && bounds.x + bounds.width <= sceneRect.x + sceneRect.width
            && bounds.y + bounds.height <= sceneRect.y + sceneRect.height;
    }

    /**
     * Determine whether two rectangular areas overlap.
     * Touching edges do not count as overlap.
     *
     * @param {object} first
     * @param {object} second
     * @returns {boolean}
     * @private
     */
    _boundsOverlap(first, second) {
        return first.x < second.x + second.width
            && first.x + first.width > second.x
            && first.y < second.y + second.height
            && first.y + first.height > second.y;
    }
};