// TODO: update tests

import { ActionContext, Store } from "vuex";

const useRootNamespace = { root: true };

export function Handler(target: any, key: string) {
    target[key]._vuexKey = key;
}

/**
 * Vuex getter handler specified in Vuex options.
 */
export type GetterHandler<TModuleState, TRootState, TResult> =
    (state: TModuleState, rootState: TRootState) => TResult;

/**
 * Vuex action handler which takes payload as specified in Vuex options.
 */
export type ActionHandlerWithPayload<TModuleState, TRootState, TPayload, TResult> =
    (injectee: ActionContext<TModuleState, TRootState>, payload: TPayload) => void | Promise<TResult>;
/**
 * Vuex action handler which does not take payload as specified in Vuex options.
 */
export type ActionHandlerNoPayload<TModuleState, TRootState, TResult> =
    (injectee: ActionContext<TModuleState, TRootState>) => void | Promise<TResult>;

/**
 * Vuex mutation handler which takes payload as specified in Vuex options.
 */
export type MutationHandlerWithPayload<TModuleState, TPayload> =
    (state: TModuleState, payload: TPayload) => void;
/**
 * Vuex mutation handler which does not take payload as specified in Vuex options.
 */
export type MutationHandlerNoPayload<TModuleState> =
    (state: TModuleState) => void;

/**
 * Function which gets value of a concrete Vuex getter.
 */
export type GetAccessor<TResult> =
    () => TResult;

/**
 * Function which dispatches a concrete Vuex action with payload.
 */
export type DispatchAccessorWithPayload<TPayload, TResult> =
    (payload: TPayload) => Promise<TResult>;
/**
 * Function which dispatches a concrete Vuex action without payload.
 */
export type DispatchAccessorNoPayload<TResult> =
    () => Promise<TResult>;

/**
 * Function which commits a concrete Vuex mutation with payload.
 */
export type CommitAccessorWithPayload<TPayload> =
    (payload: TPayload) => void;
/**
 * Function which commits a concrete Vuex mutation without payload.
 */
export type CommitAccessorNoPayload = () => void;

export interface StoreAccessors<TModuleState, TRootState> {
    /**
     * Returns a function committing mutations directed to the specified mutation handler.
     * This overload is for handlers which do not expect payload.
     */
    commit(
        store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
        handler: MutationHandlerNoPayload<TModuleState>):
            CommitAccessorNoPayload;
    /**
     * Returns a function committing mutations directed to the specified mutation handler.
     * This overload is for handlers which expect payload.
     */
    commit<TPayload>(
        store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
        handler: MutationHandlerWithPayload<TModuleState, TPayload>):
            CommitAccessorWithPayload<TPayload>;

    /**
     * Returns a function dispatching actions directed to the specified action handler.
     * This overload is for handlers which do not expect payload.
     */
    dispatch<TResult>(
        store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
        handler: ActionHandlerNoPayload<TModuleState, TRootState, TResult>):
            DispatchAccessorNoPayload<TResult>;
    /**
     * Returns a function dispatching actions directed to the specified action handler.
     * This overload is for handlers which expect payload.
     */
    dispatch<TPayload, TResult>(
        store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
        handler: ActionHandlerWithPayload<TModuleState, TRootState, TPayload, TResult>):
            DispatchAccessorWithPayload<TPayload, TResult>;

    /**
     * Returns a function returning value of the specified getter.
     */
    read<TResult>(
        store: Store<TRootState> | ActionContext<TModuleState, TRootState>,
        handler: GetterHandler<TModuleState, TRootState, TResult>):
            GetAccessor<TResult>;
}

export function getStoreAccessors<TModuleState, TRootState>(
    namespace: string): StoreAccessors<TModuleState, TRootState> {
        return {
            commit: (store: any, handler: Function) => createAccessor("commit", store, handler, namespace),
            dispatch: (store: any, handler: Function) => createAccessor("dispatch", store, handler, namespace),
            read: (store: any, handler: Function) => {
                const key = qualifyKey(handler, namespace);
                return () => {
                    return store.rootGetters
                        ? store.rootGetters[key] // ActionContext
                        : store.getters[key]; // Store
                };
            },
        };
}

function createAccessor(
    operation: string,
    store: any,
    handler: Function,
    namespace: string): any {
        const key = qualifyKey(handler, namespace);
        return (payload: any) => {
            return store[operation](key, payload, useRootNamespace);
        };
}

function qualifyKey(handler: Function, namespace?: string) {
    const key = (<any>handler).name || (<any>handler)._vuexKey;
    if (!key) {
        throw new Error("Vuex handler functions must not be anonymous. "
            + "Vuex needs a key by which it identifies a handler. "
            + "If you define handler as class member you must decorate it with @Handler.");
    }
    return namespace
        ? `${namespace}/${key}`
        : key;
}
