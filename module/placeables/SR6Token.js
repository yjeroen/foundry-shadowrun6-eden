/**
 * A Token is an implementation of PlaceableObject which represents an Actor within a viewed Scene on the game canvas.
 * @category - Canvas
 * @see {TokenDocument}
 * @see {TokenLayer}
 */
export default class SR6Token extends Token {

  /**
   * Draw a single resource bar, given provided data
   * @param {number} number       The Bar number
   * @param {PIXI.Graphics} bar   The Bar container
   * @param {Object} data         Resource data for this bar
   * @protected
   */
  _drawBar(number, bar, data) {
    console.log("SR6E | Drawing SR6 styled monitor Token bars");
    const val = Number(data.value);
    const pct = Math.clamp(val, 0, data.max) / data.max;

    // Determine sizing
    const {width, height} = this.getSize();
    const bw = width;
    const bh = Math.max(canvas.dimensions.size / 12, 8) * (this.document.height >= 2 ? 1.6 : 1);
    const bs = Math.clamp(bh / 8, 1, 2);

    // Determine the color to use
    let color;
    if ( number === 0 ) color = Color.fromRGB([1 - (pct / 2), pct, 0]);
    else color = Color.fromRGB([0.5 * pct, 0.7 * pct, 0.5 + (pct / 2)]);
    
    console.log('JEROEN this', this)
    console.log('JEROEN this.actor', this.actor)
    console.log('JEROEN this.actor.type', this.actor.type)
    
    // Physical Monitor assumed
    if ( number === 0 ) {
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

}