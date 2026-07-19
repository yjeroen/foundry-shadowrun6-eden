/**
 * Read-only proxy for an Actor's Matrix data.
 *
 * Exposes document.system.matrix fields directly on the proxy while keeping writes
 * routed through update(), so changes go through Foundry's document workflow.
 *
 * Example:
 * const matrix = new SR6MatrixProxy(actor.uuid);
 * console.log(matrix.matrixCM);
 * await matrix.update({ "system.matrix.matrixCM": { value: 10 } });
 * await matrix.update({ matrixCM: { value: 10 } }, { relativePaths: true });
 */
export default class SR6MatrixProxy {
    /**
     * Create a proxy around the Matrix data of a Foundry document.
     * The UUID should point to an Actor or synthetic Token Actor with system.matrix data.
     */
    constructor(uuid) {
        /**
         * The UUID of the Foundry document this proxy reads from.
         * Used to resolve the current document through fromUuidSync().
         */
        this._uuid = uuid;
        this._validate();

        return new Proxy(this, this.constructor._proxyHandler);
    }

    /**
     * Validate that the UUID resolves to a document with system.matrix data.
     * Called during construction so invalid proxies fail immediately.
     */
    _validate() {
        this._document;
    }

    /**
     * Resolves and returns the current Foundry document.
     * This is intentionally resolved on access, so the proxy does not keep a stale document reference.
     */
    get _document() {
        const document = fromUuidSync(this._uuid);

        if (!document) {
            throw new Error(`No document found for UUID: ${this._uuid}`);
        }

        if (!document.system?.matrix) {
            throw new Error(`Document has no system.matrix data: ${this._uuid}`);
        }

        return document;
    }

    /**
     * Returns the document's system.matrix object.
     * Normal proxied property reads are forwarded to this object.
     */
    get _matrix() {
        return this._document.system.matrix;
    }

    /**
     * Persist changes to the Foundry document.
     * If relativePaths is true, keys are treated as relative to system.matrix.
     */
    async update(changes = {}, { relativePaths = false, ...options } = {}) {
        if (relativePaths) {
            changes = Object.fromEntries(
                Object.entries(changes).map(([key, value]) => [`system.matrix.${key}`, value])
            );
        }

        return await this._document.update(changes, options);
    }

    /**
     * Proxy behavior for SR6MatrixProxy instances.
     * Exposes class properties first, then falls back to system.matrix.
     */
    static _proxyHandler = {
        /**
         * Read proxy-owned attributes/methods first, then fall back to system.matrix.
         * This allows pan._uuid and pan.update(), while pan.matrixCM reads matrix.matrixCM.
         */
        get(target, prop, receiver) {
            if (prop in target) {
                return Reflect.get(target, prop, receiver);
            }

            const value = target._matrix[prop];

            if (typeof value === "function") {
                return value.bind(target._matrix);
            }

            return value;
        },

        /**
         * Disallow direct writes to Matrix data through the proxy.
         * Use update() so changes go through Foundry's document update workflow.
         * Allows changing _uuid so the proxy can be redirected to a different document.
         */
        set(target, prop, value, receiver) {
            if (prop === "_uuid") {
                const previousUuid = target._uuid;
                target._uuid = value;

                try {
                    target._validate();
                } catch (error) {
                    target._uuid = previousUuid;
                    throw error;
                }

                return true;
            }

            throw new Error(
                `Cannot directly set MatrixProxy property "${String(prop)}". ` +
                `Use await matrix.update(...) instead.`
            );
        },

        /**
         * Support the `in` operator for both class properties and matrix fields.
         * Example: `"matrixCM" in pan`, `"update" in pan`, and `"_uuid" in pan`.
         */
        has(target, prop) {
            return prop in target || prop in target._matrix;
        },

        /**
         * Return enumerable keys from the matrix data only.
         * This makes Object.keys(), console inspection, and spreading feel like matrix data.
         */
        ownKeys(target) {
            return Reflect.ownKeys(target._matrix);
        },

        /**
         * Provide property descriptors for matrix fields exposed through the proxy.
         * Needed for Object.keys(), object spread, and related reflection behavior.
         */
        getOwnPropertyDescriptor(target, prop) {
            if (prop in target) {
                return Reflect.getOwnPropertyDescriptor(target, prop);
            }

            if (prop in target._matrix) {
                return {
                    enumerable: true,
                    configurable: true
                };
            }

            return undefined;
        }
    };
}