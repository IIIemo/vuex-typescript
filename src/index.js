"use strict";
// TODO: update tests
Object.defineProperty(exports, "__esModule", { value: true });
var useRootNamespace = { root: true };
function Handler(target, key) {
    target[key]._vuexKey = key;
}
exports.Handler = Handler;
function getStoreAccessors(namespace) {
    return {
        commit: function (store, handler) { return createAccessor("commit", store, handler, namespace); },
        dispatch: function (store, handler) { return createAccessor("dispatch", store, handler, namespace); },
        read: function (store, handler) {
            var key = qualifyKey(handler, namespace);
            return function () {
                return store.rootGetters
                    ? store.rootGetters[key] // ActionContext
                    : store.getters[key]; // Store
            };
        },
    };
}
exports.getStoreAccessors = getStoreAccessors;
function createAccessor(operation, store, handler, namespace) {
    var key = qualifyKey(handler, namespace);
    return function (payload) {
        return store[operation](key, payload, useRootNamespace);
    };
}
function qualifyKey(handler, namespace) {
    var key = handler.name || handler._vuexKey;
    if (!key) {
        throw new Error("Vuex handler functions must not be anonymous. "
            + "Vuex needs a key by which it identifies a handler. "
            + "If you define handler as class member you must decorate it with @Handler.");
    }
    return namespace
        ? namespace + "/" + key
        : key;
}
//# sourceMappingURL=index.js.map