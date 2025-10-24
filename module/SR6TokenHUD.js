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
  static DEFAULT_OPTIONS = {
    actions: {
      effect: {handler: SR6TokenHUD.#onToggleEffectV2, buttons: [0, 2]}
    }
  };

  /**
   * V13
   *  @override 
   * */
  static PARTS = {
    hud: {
      root: true,
      template: "systems/shadowrun6-eden/templates/hud/token-hud.hbs"
    }
  };

  /**
   * V13
   * Handle toggling a token status effect icon
   * @param {PointerEvent} event
   * @param {HTMLButtonElement} target
   * @param {boolean} [target.active]   Enable or disable the effect
   * @param {boolean} [target.overlay]   Toggle the overlay effect?
   * @returns {Promise<void>}
   */
  static async #onToggleEffectV2(event, target) {
    console.log('SR6E | SR6TokenHUD#onToggleEffectV2');
    event.preventDefault();
    event.stopPropagation();
    if ( !this.actor ) return ui.notifications.warn("HUD.WarningEffectNoActor", {localize: true});
    const statusId = target.dataset.statusId;
    const active = target.classList.contains("active");
    const overlay = event.ctrlKey;

    const effect = this.actor.effects.get( utils.staticId(statusId) );

    if ( effect !== undefined && effect?.system.hasLevels && !overlay && !(effect?.system.level === 1 && event.button === 2) ) {
      if ( event.button === 2 ) {
        await effect.system.decrease();
      } else {
        await effect.system.increase();
      }
    } else {
      await this.actor.toggleStatusEffect(statusId, {
        active: !active,
        overlay: overlay
      });
    }
  }

  /**
   * V12
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

  /**
   * V12
   */
  toggleStatusTray(active) {
    console.log('SR6E | SR6TokenHUD.toggleStatusTray', active);
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

  /**
   * V13 data for the token-hud.hbs template
   * Get the valid status effect choices.
   * @returns {{[id: string]: {
   *   id: string;
   *   _id: string;
   *   title: string;
   *   src: string;
   *   isActive: boolean;
   *   isOverlay: boolean;
   *   cssClass: string;
   *   level: integer;
   * }}}
   * @protected
   */
  _getStatusEffectChoices() {
    const choices = super._getStatusEffectChoices();

    // Update the status of effects which are active for the token actor
    const activeEffects = this.actor?.effects || [];
    for ( const effect of activeEffects ) {
      for ( const statusId of effect.statuses ) {
        const status = choices[statusId];
        if ( !status ) continue;
        if ( status._id ) {
          if ( status._id !== effect.id ) continue;
        } else {
          if ( effect.statuses.size !== 1 ) continue;
        }
        if (effect.system.hasLevels && effect.system.level) {
          status.level = effect.system.level;
        }
        break;
      }
    }

    return choices;
  }

} 