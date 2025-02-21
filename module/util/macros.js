export default {
    simpletest(rollData) {
        let rollWith = [], token, actorSheet;
        const classList = rollData.classList;
        const eventSub = {
            preventDefault() {},
            currentTarget: { 
                classList: { value: classList },
                dataset: { 
                    rollId: rollData.rollId,
                    pool: rollData.pool,
                    skill: rollData.skill,
                    skillspec: rollData.skillspec,
                    matrixId: rollData.matrixId,
                    itemId: rollData.itemId
                } 
            }
        }

        // Use currently selected token(s)
        canvas.tokens.controlled.forEach((target) => {
            token = target;
            actorSheet = (token?.actor.isOwner) ? rollWith.push( token?.actor.sheet ) : null;
        });

        // Use own Actor if no tokens selected
        if (rollWith.length === 0 && game.user.character !== null) {
            actorSheet = rollWith.push( game.user.character.sheet );
        }

        rollWith.forEach((actorSheet) => {
            if (classList.includes('attributeonly-roll') || classList.includes('defense-roll')) {
                actorSheet._onCommonCheck(eventSub);
            } else if (classList.includes('skill-roll')) {
                actorSheet._onRollSkillCheck(eventSub);
            } else if (classList.includes('matrix-roll')) {
                actorSheet._onMatrixAction(eventSub);
            } else if (classList.includes('weapon-roll')) {
                actorSheet._onRollWeaponCheck(eventSub);
            } else if (classList.includes('spell-roll')) {
                actorSheet._onRollSpellCheck(eventSub);
            } else if (classList.includes('ritual-roll')) {
                actorSheet._onRollRitualCheck(eventSub);
            } else if (classList.includes('complexform-roll')) {
                actorSheet._onRollComplexFormCheck(eventSub);
            }
        });

        if (actorSheet === undefined) {
            ui.notifications.warn("shadowrun6.ui.notifications.No_actor_or_tokens_selected", { localize: true });
        } else 
        if (actorSheet === null) {
            ui.notifications.warn("shadowrun6.ui.notifications.You_are_not_owner_of_the_tokens", { localize: true });
        }
        
    }
}