function isLifeform(obj) {
    return obj.attributes != undefined;
}
function deHTML(html) {
    html = html.replace(/<br\/>/gi, "\n");
    html = html.replace(/<b>(.*?)<\/b>/gi, " $1");
    return html;
}
export function attackRatingToString(val) {
    if (!val)
        return "NULL";
    return (val[0] +
        "/" +
        (val[1] != 0 ? val[1] : "-") +
        "/" +
        (val[2] != 0 ? val[2] : "-") +
        "/" +
        (val[3] != 0 ? val[3] : "-") +
        "/" +
        (val[4] != 0 ? val[4] : "-"));
}
export function fireModesToString(val) {
    let list = [];
    if (val["SS"])
        list.push(game.i18n.localize("shadowrun6.item.mode_ss"));
    if (val["SA"])
        list.push(game.i18n.localize("shadowrun6.item.mode_sa"));
    if (val["BF"])
        list.push(game.i18n.localize("shadowrun6.item.mode_bf"));
    if (val["FA"])
        list.push(game.i18n.localize("shadowrun6.item.mode_fa"));
    return list.join(', ');
}
export const defineHandlebarHelper = async function () {
    Handlebars.registerHelper("attackrating", function (val) {
        if (!val)
            return "NULL";
        return (val[0] +
            "/" +
            (val[1] != 0 ? val[1] : "-") +
            "/" +
            (val[2] != 0 ? val[2] : "-") +
            "/" +
            (val[3] != 0 ? val[3] : "-") +
            "/" +
            (val[4] != 0 ? val[4] : "-"));
    });
    Handlebars.registerHelper("firemodes", function (val) {
        let list = [];
        if (val["SS"])
            list.push(game.i18n.localize("shadowrun6.item.mode_ss"));
        if (val["SA"])
            list.push(game.i18n.localize("shadowrun6.item.mode_sa"));
        if (val["BF"])
            list.push(game.i18n.localize("shadowrun6.item.mode_bf"));
        if (val["FA"])
            list.push(game.i18n.localize("shadowrun6.item.mode_fa"));
        return list.join(', ');
    });
    Handlebars.registerHelper("spellRangeName", function (val) {
        return game.i18n.localize(CONFIG.SR6.spell_range[val]);
    });
    Handlebars.registerHelper("spellTypeName", function (val) {
        return game.i18n.localize(CONFIG.SR6.spell_type[val] + "_short");
    });
    Handlebars.registerHelper("spellDurationName", function (val) {
        return game.i18n.localize(CONFIG.SR6.spell_duration[val] + "_short");
    });
    Handlebars.registerHelper("concat", function (op1, op2) {
        return op1 + op2;
    });
    Handlebars.registerHelper("concat3", function (op1, op2, op3) {
        return op1 + op2 + op3;
    });
    Handlebars.registerHelper("ifIn", function (elem, list, options) {
        if (list.indexOf(elem) > -1) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
    Handlebars.registerHelper('getByKey', function (map, key) {
        return map.get(key);
    });
    Handlebars.registerHelper('getIniType', function (map, key) {
        return map.get(key).initiativeType;
    });
    Handlebars.registerHelper("skillAttr", getSkillAttribute);
    Handlebars.registerHelper("skillPool", getSkillPool);
    Handlebars.registerHelper("gearSubtype", getSubtypes);
    Handlebars.registerHelper("ritualFeat", getRitualFeatures);
    Handlebars.registerHelper("spellFeat", getSpellFeatures);
    Handlebars.registerHelper("matrixPool", getMatrixActionPool);
    Handlebars.registerHelper("itemNotInList", itemNotInList);
    Handlebars.registerHelper("itemTypeInList", itemTypeInList);
    Handlebars.registerHelper("itemsOfType", itemsOfType);
    Handlebars.registerHelper("itemsOfGeartype", itemsOfGeartype);
    Handlebars.registerHelper("skillPointsNotZero", skillPointsNotZero);
    Handlebars.registerHelper("sr6_description", function (itemData, type) {
        let fallback = itemData.description;
        let key = type + "." + itemData.genesisID + ".desc";
        let name = game.i18n.localize(key);
        if (name == key) {
            return fallback;
        }
        return deHTML(name);
    });

    Handlebars.registerHelper('log', function (...params) {
        const handlebarsContext = params.pop();
        const systemTag = 'SR6E | Handlebars line:' + handlebarsContext.loc.start.line + ' |';
        return console.log(systemTag, ...params);
    });

    Handlebars.registerHelper('nuyen', function (number) {
        const nuyen = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'JPY'}).format( number );
        return nuyen;
    });

    Handlebars.registerHelper('matrixAction', function (matrixAction) {
        const legality = matrixAction.illegal ? game.i18n.localize('shadowrun6.label.legality.illegal.long') : game.i18n.localize('shadowrun6.label.legality.legal.long');
        const actionTypeLabel = matrixAction.major ? game.i18n.localize('shadowrun6.adeptpower.activation_major') : game.i18n.localize('shadowrun6.adeptpower.activation_minor');
        const actionTypeIcon = matrixAction.major ? '&#10687;' : '&#10686;';
        const accessLevel = [];
        if (matrixAction.outsider) accessLevel.push( game.i18n.localize('shadowrun6.matrix.accessLevel.outsider') );
        if (matrixAction.user) accessLevel.push( game.i18n.localize('shadowrun6.matrix.accessLevel.user') );
        if (matrixAction.admin) accessLevel.push( game.i18n.localize('shadowrun6.matrix.accessLevel.admin') );

        const actionIcon = `<span title="${actionTypeLabel} (${legality}) [${accessLevel.join("/")}]" class="illegal-${matrixAction.illegal}"">${actionTypeIcon}</span>`;
        return new Handlebars.SafeString(actionIcon);
    });
    Handlebars.registerHelper("matrixAccessLevel", function (currentAccess, matrixAction) {
        let actionAllowed = false;
        if (matrixAction.outsider && matrixAction.outsider === currentAccess.outsider) actionAllowed = true;
        if (matrixAction.user && matrixAction.user === currentAccess.user) actionAllowed = true;
        if (matrixAction.admin && matrixAction.admin === currentAccess.admin) actionAllowed = true;

        if (actionAllowed === false) {
            return '-disabled disabled-roll';
        }
    });

    // Allows {if X = Y} type syntax in html using handlebars
    Handlebars.registerHelper("iff", function (a, operator, b, opts) {
        var bool = false;
        switch (operator) {
            case "==":
                bool = a == b;
                break;
            case ">":
                bool = a > b;
                break;
            case ">=":
                bool = a >= b;
                break;
            case "<":
                bool = a < b;
                break;
            case "<=":
                bool = a <= b;
                break;
            case "!=":
                bool = a != b;
                break;
            case "&&":
                bool = a && b;
                break;
            case "||":
                bool = a || b;
                break;
            case "contains":
                if (a && b) {
                    bool = a.includes(b);
                }
                else {
                    bool = false;
                }
                break;
            default:
                throw "Unknown operator " + operator;
        }
        if (bool) {
            return opts.fn(this);
        }
        else {
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper('switch', function (value, options) {
        this.switch_value = value;
        return options.fn(this);
    });
    Handlebars.registerHelper('case', function (value, options) {
        if (value == this.switch_value) {
            return options.fn(this);
        }
    });
    Handlebars.registerHelper('isOwner', function (value, options) {
        if(value) {
            if(getActor(value.actor, value.scene, value.token)?.isOwner) {
                return true
            }
        }
        return false
    });
    Handlebars.registerHelper('sort', function (items) {
        // On suppose que 'items' est un tableau d'objets avec une propriété 'sort'
            console.warn(items);
        if (Array.isArray(items.contents)) {
            console.warn(items.contents);
            return items.contents.slice().sort((a, b) => {
                if (a.sort < b.sort) return -1;
                if (a.sort > b.sort) return 1;
                return 0;
            });
        }
        return items;
    });
};
function getSystemData(obj) {
    if (game.release.generation >= 10)
        return obj.system;
    return obj.data.data;
}
function getActorData(obj) {
    if (game.release.generation >= 10)
        return obj;
    return obj.data;
}
function itemsOfType(items, type) {
    return items.filter((elem) => getActorData(elem).type == type);
}
function itemsOfGeartype(items, geartype) {
    return items.filter((elem) => getSystemData(elem).type == geartype);
}
function skillPointsNotZero(skills) {
    return Object.keys(skills)
        .filter((key) => skills[key].points > 0)
        .reduce((res, key) => (res[key] = skills[key], res), {});
}
function itemNotInList(items, item) {
    var bool = true;
    items.forEach((elem) => {
        if (getSystemData(elem).subtype == item) {
            bool = false;
        }
    });
    return bool;
}
function itemTypeInList(items, type) {
    var bool = false;
    items.forEach((elem) => {
        if (getActorData(elem).type == type) {
            bool = true;
        }
    });
    return bool;
}
function getSkillAttribute(key) {
    let skillDef = CONFIG.SR6.ATTRIB_BY_SKILL.get(key);
    if (skillDef) {
        const myElem = skillDef.attrib;
        return myElem;
    }
    else {
        return "??";
    }
}
function getSkillPool(skillId, skillSpec, actor) {
    return actor._getSkillPool(skillId, skillSpec);
}
function getSubtypes(key) {
    if (CONFIG.SR6.GEAR_SUBTYPES.get(key)) {
        const myElem = CONFIG.SR6.GEAR_SUBTYPES.get(key);
        return myElem;
    }
    else {
        return [];
    }
}
function getRitualFeatures(ritual) {
    let ret = [];
    let i18n = game.i18n;
    if (ritual.features.material_link)
        ret.push(i18n.localize("shadowrun6.ritualfeatures.material_link"));
    if (ritual.features.anchored)
        ret.push(i18n.localize("shadowrun6.ritualfeatures.anchored"));
    if (ritual.features.minion)
        ret.push(i18n.localize("shadowrun6.ritualfeatures.minion"));
    if (ritual.features.spell)
        ret.push(i18n.localize("shadowrun6.ritualfeatures.spell"));
    if (ritual.features.spotter)
        ret.push(i18n.localize("shadowrun6.ritualfeatures.spotter"));
    return ret.join(", ");
}
function getSpellFeatures(spell) {
    let ret = [];
    let i18n = game.i18n;
    if (spell.features) {
        if (spell.features.area)
            ret.push(i18n.localize("shadowrun6.spellfeatures.area"));
        if (spell.features.direct)
            ret.push(i18n.localize("shadowrun6.spellfeatures.direct"));
        if (spell.features.indirect)
            ret.push(i18n.localize("shadowrun6.spellfeatures.indirect"));
        if (spell.features.sense_single)
            ret.push(i18n.localize("shadowrun6.spellfeatures.sense_single"));
        if (spell.features.sense_multi)
            ret.push(i18n.localize("shadowrun6.spellfeatures.sense_multi"));
    }
    return ret.join(", ");
}
function getMatrixActionPool(key, actor) {
    const action = CONFIG.SR6.MATRIX_ACTIONS[key];
    const skill = getSystemData(actor).skills[action.skill];
    let pool = 0;
    if (skill) {
        pool = skill.points + skill.modifier;
        if (skill.expertise == action.specialization) {
            pool += 3;
        }
        else if (skill.specialization == action.specialization) {
            pool += 2;
        }
    }
    if (action.attrib) {
        const attrib = getSystemData(actor).attributes[action.attrib];
        pool += attrib.pool;
    }
    return pool;
}

/**
 * Create a unique id for a status condition.
 * @param {string} status     The primary status.
 * @returns {string}          A unique 16-character id.
 */
export function staticId(status) {
    if (status.length >= 16) return status.substring(0, 16);
    return status.padEnd(16, "0");
}

/**
 * Create a localized actionTest for a roll
 * @param {DOMStringMap|string} classList  The html classList of the link/button that initiated the roll.
 * @param {string} rollId     The rollId, which defines the roll type.
 * @param {string} skillSpec  Optional, in case this is a skill roll with specialization
 * @returns {actionText}      A string that is used in the Roll Dialogue and ChatMessage
 */
export function rollText(classList, rollId, skillSpec) {
    let actionText = '';
    classList = classList?.value ?? classList;
    if (classList.includes("defense-roll")) {
        actionText = game.i18n.localize("shadowrun6.defense." + rollId);
    }
    else if (classList.includes("attributeonly-roll") && classList.includes("attribute-poolmod")) {
        actionText = game.i18n.localize("attrib." + rollId);
    }
    else if (classList.includes("attributeonly-roll")) {
        actionText = game.i18n.localize("shadowrun6.derived." + rollId);
    }
    else if (rollId === "legwork") {
        if (classList.includes("legwork-roll"))
            actionText = game.i18n.localize("shadowrun6.legwork.legwork_rolltext");
        else
            actionText = game.i18n.localize("shadowrun6.legwork.loyalty_rolltext");
    }
    else if (classList.includes("skill-roll")) {
        actionText = game.i18n.localize("skill." + rollId);
        if (skillSpec !== undefined) {
            actionText += "/" + game.i18n.localize("shadowrun6.special." + rollId + "." + skillSpec);
        }
    }
    else if (classList.includes("matrix-roll")) {
        actionText = game.i18n.localize("shadowrun6.actor.nav.matrix") + ': ' + game.i18n.localize("shadowrun6.matrixaction." + rollId + ".name");
    }
    else {
        actionText = game.i18n.localize("shadowrun6.rolltext." + rollId);
    }
    return actionText;
}

export function getActor(actorId, sceneId, tokenId) {
    let actor = null;
    if (actorId && sceneId && tokenId) {
        console.debug("SR6E | Target is a token");
        // If scene and token ID is given, resolve token
        const scene = game.scenes.get(sceneId);
        if (scene) {
            const token = scene.tokens.get(tokenId);
            console.log("SR6E | Token ", token);
            actor = token.actor;
        }
    } else if (actorId) {
        console.debug("SR6E | Target isn't a token but actorId is known");
        actor = game.actors.get(actorId);
    }

    return actor;
}

export function getSelectedActor(defaultedActor = null) {
    let actor = null;

    //Use currently selected token
    if (canvas.tokens.controlled.length) {
        canvas.tokens.controlled.forEach((selectedToken) => {
            actor = selectedToken.isOwner ? selectedToken.actor : null;
        });
    }

    // Else get the player's character actor
    if (!actor) {
        actor = game.user.character; // returns null if GM or not set
    }

    if (actor === null && defaultedActor === null) {
        console.log("SR6E | No target actor found");
        ui.notifications.warn("shadowrun6.ui.notifications.Select_a_token_first", { localize: true });
    }

    // Else use the defaulted actor if its there else return null
    return actor ?? defaultedActor;
}