import * as utils from "./util/helper.js";
export default class SR6TokenHUD extends TokenHUD {

  /** @inheritDoc */
  getData(options={}) {
    let data = super.getData(options);

    // Player, NPC, Critter, Spirit, Vehicle
    data.classes += ' ' + this.actor.type + '-hud';

    return data;
  }

  /**
   * V12 listeners
   */
  activateListeners(html) {
      super.activateListeners(html);
      const effectsTray = html.find(".status-effects");
      effectsTray.off("click", ".effect-control");
      effectsTray.off("contextmenu", ".effect-control");
      effectsTray.on("click", ".effect-control", event => this.#onToggleEffect(event, {active: true}));
      effectsTray.on("contextmenu", ".effect-control", event => this.#onToggleEffect(event, {active: false}));
      
      // html.find("div[data-action='effects']").click((event) => this.#onClickStatusEffects(event));
  }

  /**
   * V13 listeners & default options
   *  @inheritDoc 
   */
  // static DEFAULT_OPTIONS = {
  //   actions: {
  //     effect: {handler: SR6TokenHUD.#onToggleEffect, buttons: [0, 2]}
  //   }
  // };

  /**
   * Handle toggling a token status effect icon
   * @param {PointerEvent} event      The click event to toggle the effect
   * @param {object} [options]        Options which modify the toggle
   * @param {boolean} [options.active]   Enable or disable the effect
   * @param {boolean} [options.overlay]   Toggle the overlay effect?
   */
  async #onToggleEffect(event, options) {
    console.log('SR6E | SR6TokenHUD#onToggleEffect', event, options);
    event.preventDefault();
    event.stopPropagation();
    if ( !this.actor ) return ui.notifications.warn("HUD.WarningEffectNoActor", {localize: true});
    const statusId = event.currentTarget.dataset.statusId;
    if (event.ctrlKey) options.overlay = true;

    const effect = this.actor.effects.get( utils.staticId(statusId) );

    if ( effect !== undefined && effect?.system.hasLevels && !( effect?.system.level === 1 && options.active === false ) ) {
      if ( options.active === true ) {
        await effect.system.increase();
      } else {
        await effect.system.decrease();
      }
    } else {
      await this.actor.toggleStatusEffect(statusId, options);
    }
  }

  toggleStatusTray(active) {
    if (active) {
      // updating status effects HUD
      this.actor.effects.forEach(effect => {
        if (effect.system.hasLevels) {  
          const [mainStatus] = effect.statuses;
          let effectControl = this.element[0].querySelector("img[data-status-id='"+mainStatus+"']");
          const wrapper = document.createElement('div');
          wrapper.setAttribute("class", "effect-control-wrapper");
          effectControl.parentNode.insertBefore(wrapper, effectControl);
          wrapper.appendChild(effectControl);
          const badge = document.createElement('i');
          badge.setAttribute("class", "badge");
          badge.appendChild(document.createTextNode(effect.system.level));
          wrapper.appendChild(badge);
        }

      });
    }

    super.toggleStatusTray(active);
  }

} 