/**
 * Augment an Application class with Matrix methods
 * @param {Constructor<ApplicationV2>} BaseApplication
 */

export const MatrixSheetMixin = Base => class extends Base {
    
    async _onMatrixAttributesSwitch(event, html) {
        const clickedAttribute = event.currentTarget.firstChild;
        if (parseInt(clickedAttribute.value) === 0) return;
        const matrixAttributes = event.currentTarget.parentElement.childNodes;
        console.log("SR6E | _onMatrixAttributesSwitch attribute clicked:", clickedAttribute.dataset.field);
        clickedAttribute.classList.toggle('clicked');
        const matrixPersona = {};
        let clickedAttributes = 0;
        let activeBox1, activeBox2;
        
        matrixAttributes.forEach(attribute => {
            const attributeInput = attribute.firstChild;
            if (attributeInput?.nodeName === "INPUT"){
                const clicked = attributeInput.classList.contains('clicked');
                matrixPersona[attributeInput.dataset.field] = { value: parseInt(attributeInput.value), clicked: clicked };
                if (clicked) {
                    if (activeBox1) activeBox2 = attribute;
                    else activeBox1 = attribute;
                    clickedAttributes++;
                }
            }
        });
        if (clickedAttribute.classList.contains('clicked') && clickedAttributes === 2) {
            const updatePersona = {};
            let swappedField;
            Object.entries(matrixPersona).forEach(([field, attribute]) => {
                if (attribute.clicked) {
                    if (swappedField === undefined) {
                        swappedField = field;
                    } else {
                        updatePersona[swappedField] = attribute.value;
                        updatePersona[field] = matrixPersona[swappedField].value;
                    }
                }
            });
            const swappedCss = activeBox1.getAttribute('style');
            activeBox1.setAttribute('style', activeBox2.getAttribute('style'));
            activeBox2.setAttribute('style', swappedCss);
            //TODO add Matrix Attribute swap animation
            // await new Promise(resolve => setTimeout(resolve, 500)); // wait until CSS effect is ready

            await this.actor.update( updatePersona );
        }
    }
    async _onMatrixAccessSwitch(event, html) {
        console.log("SR6E | _onMatrixAccessSwitch to:", event.currentTarget.value);
        await new Promise(resolve => setTimeout(resolve, 500)); // wait until CSS effect is ready
        await this.actor.setFlag("shadowrun6-eden", "matrix-access", event.currentTarget.value)
    }
    _matrixAccess() {
        let matrixAccess = {
            outsider: false,
            user: false,
            admin: false
        };
        const matrixAccessLevel = this.actor.getFlag("shadowrun6-eden", "matrix-access");
        if (matrixAccessLevel === "admin") {
            matrixAccess.admin = true;
        } else if (matrixAccessLevel === "user") {
            matrixAccess.user = true;
        } else {
            matrixAccess.outsider = true;
        }
        return matrixAccess;
    }
    _matrixActionAvailable() {
        let matrixActions = Object.entries(CONFIG.SR6.MATRIX_ACTIONS).filter(([actionId, action]) => {
            action.name = game.i18n.localize('shadowrun6.matrixaction.'+actionId+'.name')
            if (action.skill === "cracking" && !this.actor.system.skills.cracking.pool) return false
            if (action.linkedAttr === null || action.linkedAttr === undefined) return true;
            if (action.linkedAttr === "a" && this.actor.system.persona?.used?.a > 0) return true;
            if (action.linkedAttr === "s" && this.actor.system.persona?.used?.s > 0) return true;
            return false;
        });  
        matrixActions = Object.fromEntries(matrixActions.sort(function (a, b) {
            var textA = a[1].name.toUpperCase();
            var textB = b[1].name.toUpperCase();
            return textA.localeCompare(textB);
        }));
        return matrixActions;
    }

};