import { SYSTEM_NAME } from "../constants.js";

/**
 * Player -> GM bridge for the handful of actions where a player legitimately needs to write to a
 * document they do not own: hitting a target in combat, hacking someone else's device, healing an
 * ally's NPC drone, and so on.
 *
 */
export default class SR6GMBridge {

    static QUERY_NAME = `${SYSTEM_NAME}.gmRequest`;

    static registerQueries() {
        CONFIG.queries[SR6GMBridge.QUERY_NAME] = SR6GMBridge.#onQuery;
        console.log(`SR6E | SR6GMBridge | Registered query "${SR6GMBridge.QUERY_NAME}"`);
    }

    static async adjustEdge(target, delta) {
        return SR6GMBridge.#dispatch("adjustEdge", {
            uuid: SR6GMBridge.#uuidOf(target),
            delta
        });
    }

    static async setMatrixAccess(target, initiator, level) {
        return SR6GMBridge.#dispatch("setMatrixAccess", {
            uuid: SR6GMBridge.#uuidOf(target),
            initiatorUuid: SR6GMBridge.#uuidOf(initiator),
            level
        });
    }

    static async applyDamage(target, damageData) {
        return SR6GMBridge.#dispatch("applyDamage", {
            uuid: SR6GMBridge.#uuidOf(target),
            damageData
        });
    }

    static get isAvailable() {
        return SR6GMBridge.#isEnabled && !!game.users.activeGM;
    }

    static async #dispatch(action, payload) {
        const document = await SR6GMBridge.#resolve(payload.uuid);
        if (!document) {
            console.warn(`SR6E | SR6GMBridge | "${action}" targets an unresolvable UUID`, payload.uuid);
            return false;
        }

        // No round trip needed when this client owns the document already.
        if (document.isOwner) return SR6GMBridge.#execute(action, payload, game.user);

        if (!SR6GMBridge.#isEnabled) {
            ui.notifications.warn("shadowrun6.ui.notifications.You_are_not_owner_of_the_target", { localize: true });
            return false;
        }

        const gm = game.users.activeGM;
        if (!gm) {
            ui.notifications.warn("shadowrun6.ui.notifications.gm_bridge.no_gm_connected", { localize: true });
            return false;
        }

        console.log(`SR6E | SR6GMBridge | Asking GM ${gm.name} to run "${action}"`, payload);
        try {
            return await gm.query(SR6GMBridge.QUERY_NAME, { action, payload });
        }
        catch (err) {
            console.error(`SR6E | SR6GMBridge | GM refused or failed "${action}"`, err);
            ui.notifications.warn("shadowrun6.ui.notifications.gm_bridge.request_failed", { localize: true });
            return false;
        }
    }

    static async #onQuery({ action, payload } = {}, { userId } = {}) {
        const user = game.users.get(userId);
        if (!user) throw new Error(`Unknown requesting user "${userId}"`);
        if (!SR6GMBridge.#isEnabled) throw new Error("The GM has disabled player action requests");

        console.log(`SR6E | SR6GMBridge | Running "${action}" on behalf of ${user.name}`, payload);
        return SR6GMBridge.#execute(action, payload, user);
    }

    static async #execute(action, payload, user) {
        const handler = SR6GMBridge.#ACTIONS[action];
        if (!handler) throw new Error(`Unknown SR6GMBridge action "${action}"`);
        return handler(payload ?? {}, user);
    }

    static #ACTIONS = {

        async adjustEdge({ uuid, delta }, user) {
            const actor = await SR6GMBridge.#requireDocument(uuid, "Actor");
            const adjustment = SR6GMBridge.#requireInteger(delta, -7, 7, "delta");

            const current = actor.system.edge?.value;
            if (current === undefined) throw new Error(`${actor.name} has no Edge to adjust`);

            const max = actor.system.edge.max ?? 7;
            const updated = Math.clamp(current + adjustment, 0, Math.min(7, max));
            if (updated === current) return false;

            await actor.update({ "system.edge.value": updated });
            console.log(`SR6E | SR6GMBridge | Edge of ${actor.name} set to ${updated} for ${user.name}`);
            return true;
        },

        async setMatrixAccess({ uuid, initiatorUuid, level }, user) {
            const ACCESS_LEVELS = ["outsider", "user", "admin"];
            if (!ACCESS_LEVELS.includes(level)) throw new Error(`Invalid access level "${level}"`);

            const target = await SR6GMBridge.#requireDocument(uuid, ["Actor", "Item"]);
            const initiator = await SR6GMBridge.#requireDocument(initiatorUuid, ["Actor", "Item"]);

            // Access is recorded per initiator. A player may only change the access level held by
            // an icon they themselves control, never one held by somebody else.
            if (!initiator.testUserPermission(user, "OWNER")) {
                throw new Error(`${user.name} does not own the initiator ${initiator.name}`);
            }

            const safeUuid = initiator.uuid.replaceAll(".", "_");
            await target.setFlag(SYSTEM_NAME, `matrix-access.${safeUuid}`, level);
            console.log(`SR6E | SR6GMBridge | ${initiator.name} now has "${level}" access on ${target.name}`);
            return true;
        },

        async applyDamage({ uuid, damageData }, user) {
            const actor = await SR6GMBridge.#requireDocument(uuid, "Actor");
            if (foundry.utils.getType(damageData) !== "Object") throw new Error("Invalid damageData");

            // Damage arrives from a chat card dataset, so everything in it is a string until it is
            // coerced. Re-coerce here rather than trusting what the requesting client sent.
            const damage = SR6GMBridge.#requireInteger(damageData.damage, -1000, 1000, "damage");

            return actor.applyDamage({ ...damageData, damage });
        }
    };

    static get #isEnabled() {
        return game.settings.get(SYSTEM_NAME, "gmAppliesPlayerActions");
    }

    static #uuidOf(target) {
        return typeof target === "string" ? target : target?.uuid;
    }

    static async #resolve(uuid) {
        if (typeof uuid !== "string" || !uuid.length) return null;
        try {
            return (await fromUuid(uuid)) ?? null;
        }
        catch (err) {
            console.warn("SR6E | SR6GMBridge | Could not resolve UUID", uuid, err);
            return null;
        }
    }

    static async #requireDocument(uuid, documentNames) {
        const document = await SR6GMBridge.#resolve(uuid);
        if (!document) throw new Error(`No document found for UUID "${uuid}"`);

        const acceptable = Array.isArray(documentNames) ? documentNames : [documentNames];
        if (!acceptable.includes(document.documentName)) {
            throw new Error(`"${uuid}" is a ${document.documentName}, expected ${acceptable.join(" or ")}`);
        }
        if (document.pack) throw new Error(`"${uuid}" lives in a compendium and cannot be modified`);

        return document;
    }

    static #requireInteger(value, min, max, label) {
        const number = Number(value);
        if (!Number.isInteger(number)) throw new Error(`"${label}" must be an integer, got "${value}"`);
        if ((number < min) || (number > max)) {
            throw new Error(`"${label}" must be between ${min} and ${max}, got ${number}`);
        }
        return number;
    }
}
