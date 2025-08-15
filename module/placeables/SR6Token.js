/**
 * A Token is an implementation of PlaceableObject which represents an Actor within a viewed Scene on the game canvas.
 * @category - Canvas
 * @see {TokenDocument}
 * @see {TokenLayer}
 */
export default class SR6Token extends Token {

    /** @override */
    static RENDER_FLAGS = {
        ...super.RENDER_FLAGS,
        refreshBorder: {propagate: ["refreshGruntGroup"]},
        refreshGruntGroup: {},
    };

    /** @override */
    _applyRenderFlags(flags) {
        if (CONFIG.debug.tokens) console.log("SR6E | Token._applyRenderFlags");
        super._applyRenderFlags(flags);
        if ( flags.refreshGruntGroup ) this._refreshGruntGroup();
        
    }

    /** @override */
    async _draw(options) {
        if (CONFIG.debug.tokens) console.log("SR6E | Token._draw");
        await super._draw(options);
        // Draw Grunt Group Icon
        this.gruntGroup ||= this.addChild(this.#drawGruntGroupName());
    }

    /** @inheritDoc */
    _onUpdate(changed, options, userId) {
        if (CONFIG.debug.tokens) console.log("SR6E | Token._onUpdate");
        super._onUpdate(changed, options, userId);
        const gruntGroupChanged = ('flags' in changed && 'shadowrun6-eden' in changed.flags);

        // Incremental refresh
        this.renderFlags.set({
            refreshGruntGroup: gruntGroupChanged
        });
  }

    /**
     * Draw a single resource bar, given provided data
     * @param {number} number       The Bar number
     * @param {PIXI.Graphics} bar   The Bar container
     * @param {Object} data         Resource data for this bar
     * @protected
     */
    _drawBar(number, bar, data) {
        if (CONFIG.debug.tokens) console.log("SR6E | Drawing SR6 styled monitor Token bars");
        const val = Number(data.value);
        const pct = Math.clamp(val, 0, data.max) / data.max;

        // Determine sizing
        const { width, height } = this.getSize();
        const bw = width;
        const bh =
            Math.max(canvas.dimensions.size / 12, 8) *
            (this.document.height >= 2 ? 1.6 : 1);
        const bs = Math.clamp(bh / 8, 1, 2);

        // Determine the color to use
        let color;
        if (number === 0) color = Color.fromRGB([1 - pct / 2, pct, 0]);
        else color = Color.fromRGB([0.5 * pct, 0.7 * pct, 0.5 + pct / 2]);

        // Physical Monitor assumed
        if (number === 0) {
            color = Color.fromRGB([0.54, 0.14, 0.47]);
        } else if (this.actor.type == "Vehicle") {
            // Matrix Monitor assumed
            color = Color.fromRGB([0, 0.78, 0.2]);
        } else {
            // Stun Monitor assumed
            color = Color.fromRGB([0, 0.66, 1]);
        }

        // Draw the bar
        bar.clear();
        bar.lineStyle(bs, 0x000000, 1.0);
        bar.beginFill(0x000000, 0.5).drawRoundedRect(0, 0, bw, bh, 3);
        bar.beginFill(color, 1.0).drawRoundedRect(0, 0, pct * bw, bh, 2);

        // Set position
        const posY = number === 0 ? height - bh : 0;
        bar.position.set(0, posY);
        return true;
    }

    /* -------------------------------------------- */

    /** @override */
    _refreshState() {
        if (CONFIG.debug.tokens) console.log("SR6E | Token._refreshState");
        super._refreshState();
        const groupId = this.document.getFlag(game.system.id, 'GruntGroupId');
        if (groupId)
            canvas.tokens.ownedTokens.forEach(async (token) => token.gruntGroup.visible = (this.border.visible && token.document.getFlag(game.system.id, 'GruntGroupId') === groupId) );
    }

    updateGruntGroupName() {
        if (CONFIG.debug.tokens) console.log("SR6E | Token.updateGruntGroupName");
        this._refreshGruntGroup();
        this.renderFlags.set({refresh: true}); // Refresh all flags
    }

    /**
     * Draw the token's Grunt Group as a text object
     * @returns {PreciseText}    The Text object for the Token nameplate
     */
    #drawGruntGroupName() {
        if (CONFIG.debug.tokens) console.log("SR6E | Token.#drawGruntGroupName");
        const groupId = this.document.getFlag(game.system.id, 'GruntGroupId');
        const group = groupId ? game.i18n.format('shadowrun6.npc.grunt_group_id', {groupId}) : '';
        const groupName = new PreciseText(group, this._getGruntGroupTextStyle());
        groupName.anchor.set(0, 1.1);
        return groupName;
    }
    /**
     * Get the text style that should be used for this Token's tooltip.
     * @returns {string}
     * @protected
     */
    _getGruntGroupTextStyle() {
        if (CONFIG.debug.tokens) console.log("SR6E | Token._getGruntGroupTextStyle");
        const style = CONFIG.canvasTextStyle.clone();
        style.strokeThickness = 0.5;
        style.fontSize = 16;
        if (canvas.dimensions.size >= 200) style.fontSize = 20;
        else if (canvas.dimensions.size < 50) style.fontSize = 12;
        style.wordWrapWidth = this.w * 2.5;
        return style;
    }
    
    /**
     * Refresh the text content, position, and visibility of the Token nameplate.
     * @protected
     */
    _refreshGruntGroup() {
        if (CONFIG.debug.tokens) console.log("SR6E | Token._refreshGruntGroup");
        const groupId = this.document.getFlag(game.system.id, 'GruntGroupId');
        const group = groupId ? game.i18n.format('shadowrun6.npc.grunt_group_id', {groupId}) : '';
        
        if (groupId === undefined) this.gruntGroup.visible = false;
        else this.gruntGroup.visible = this.border.visible;

        this.gruntGroup.text = group;
        this.gruntGroup.style = this._getGruntGroupTextStyle();
    }


    // /** @inheritdoc */
    // _onControl(options={}) {
    //     if (CONFIG.debug.tokens) console.log("SR6E | Token is selected | _onControl");
    //     super._onControl(options);

    // }
    // /** @inheritdoc */
    // _onRelease(options) {
    //     if (CONFIG.debug.tokens) console.log("SR6E | Token selection is released | _onRelease");
    //     super._onControl(options);

    // }
}
