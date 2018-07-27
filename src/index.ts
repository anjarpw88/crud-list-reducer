import { ReducerWrapper, dispatchAction } from 'redux-wrapper-extended';
import { Reducer, Dispatch, AnyAction } from 'redux'

export interface ItemDict<T> {
  [key: string]: SingleOrNull<T>
}

export interface ItemContainer<T> {
  localItemDict: ItemDict<T>,
  syncedItemDict: ItemDict<T>,
  toBeAddedList: T[],
  isLoading: boolean
}

export interface CrudReducerConfig {
  prefix: string,
  singular: string,
  plural: string
}

export type AnyFunc = ((...args: any[]) => any)
export type DispatchFunc = (d: Dispatch<AnyAction>) => AnyFunc

export interface DispatchFuncDict {
  [key: string]: DispatchFunc
}

export interface FuncDict {
  [key: string]: (...args: any[]) => any
}
export type SingleOrNull<T> = T | null
export type ManyOrNull<T> = T[] | null
export type PromiseOfSingleOrNull<T> = Promise<SingleOrNull<T>> | null
export type PromiseOfManyOrNull<T> = Promise<ManyOrNull<T>> | null
export type SingleItemFunc<T> = (input: T) => SingleOrNull<T>
export type MultipleItemFunc<T> = (input: T[]) => ManyOrNull<T>
export type SingleItemAsyncFunc<T> = (input: T) => PromiseOfSingleOrNull<T>
export type MultipleItemAsyncFunc<T> = (input: T[]) => PromiseOfManyOrNull<T>

export interface ReducerPackage<T> {
  reducer: Reducer<T>
  generateActions: (dispatch: Dispatch<AnyAction>) => FuncDict
}
export interface ComputedValues<T> {
  localList: T[],
  syncedList: T[],
  isLoading: boolean
}


function finalizeWrapper<T>(wrapper: ReducerWrapper<ItemContainer<T>>, config: CrudReducerConfig, identifyingFunc: (item: T) => string) {
  wrapper
    .addHandler(config.prefix + '.startLoading', (s: ItemContainer<T>): ItemContainer<T> => {
      return {
        ...s,
        isLoading: true
      }
    })
    .addHandler(config.prefix + '.stopLoading', (s: ItemContainer<T>): ItemContainer<T> => {
      return {
        ...s,
        isLoading: false
      }
    })
    .addHandler(config.prefix + '.clear', (s: ItemContainer<T>): ItemContainer<T> => {
      return {
        ...s,
        localItemDict: {},
        syncedItemDict: {},
        toBeAddedList: []
      }
    })

    .addHandler(config.prefix + '.set' + config.plural, (s: ItemContainer<T>, items: T[]): ItemContainer<T> => {
      let localItemDict = { ...s.localItemDict }
      items.forEach((item: T) => {
        let key = identifyingFunc(item)
        localItemDict[key] = item
      })
      return {
        ...s,
        localItemDict
      }
    })
    .addHandler(config.prefix + '.setSynced' + config.plural, (s: ItemContainer<T>, items: T[]): ItemContainer<T> => {
      let localItemDict: ItemDict<T> = { ...s.localItemDict }
      let syncedItemDict: ItemDict<T> = { ...s.syncedItemDict }
      items.forEach((item: T) => {
        let key = identifyingFunc(item)
        localItemDict[key] = item
        syncedItemDict[key] = item
      })
      return {
        ...s,
        localItemDict,
        syncedItemDict
      }
    })
    .addHandler(config.prefix + '.setSyncedByKeys', (s: ItemContainer<T>, newItemDict: ItemDict<T>): ItemContainer<T> => {
      let localItemDict = { ...s.localItemDict, ...newItemDict }
      let syncedItemDict = { ...s.syncedItemDict, ...newItemDict }
      Object.keys(newItemDict).forEach((key: string) => {
        if (newItemDict[key] == null) {
          delete localItemDict[key]
          delete syncedItemDict[key]
        }
      })
      return {
        ...s,
        localItemDict,
        syncedItemDict
      }
    })
    .addHandler(config.prefix + '.startAdding' + config.plural, (s: ItemContainer<T>, items: T[]): ItemContainer<T> => {
      let toBeAddedList = [...s.toBeAddedList, ...items]
      return {
        ...s,
        toBeAddedList
      }
    })
    .addHandler(config.prefix + '.completeAdding' + config.plural, (s: ItemContainer<T>, items: T[]): ItemContainer<T> => {
      let toBeAddedList = [...s.toBeAddedList]
      items.forEach((item) => {
        let index = toBeAddedList.indexOf(item)
        if (index >= 0 && index < toBeAddedList.length) {
          toBeAddedList.splice(index, 1)
        }
      })

      return {
        ...s,
        toBeAddedList
      }
    })
    .addHandler(config.prefix + '.modify' + config.plural, (s: ItemContainer<T>, items: T[]): ItemContainer<T> => {
      let localItemDict = { ...s.localItemDict }
      items.forEach((item) => {
        let key = identifyingFunc(item)
        localItemDict[key] = item
      })
      return {
        ...s,
        localItemDict
      }
    })
    .addHandler(config.prefix + '.completeUpdating' + config.plural, (s: ItemContainer<T>, items: T[]): ItemContainer<T> => {
      let localItemDict = { ...s.localItemDict }
      let syncedItemDict = { ...s.syncedItemDict }
      items.forEach((item) => {
        let key = identifyingFunc(item)
        localItemDict[key] = item
        syncedItemDict[key] = item
      })
      return {
        ...s,
        syncedItemDict
      }
    })
    .addHandler(config.prefix + '.startRemoving' + config.plural, (s: ItemContainer<T>, items: T[]): ItemContainer<T> => {
      let localItemDict = { ...s.localItemDict }
      items.forEach((item) => {
        let key = identifyingFunc(item)
        delete localItemDict[key]
      })
      return {
        ...s,
        localItemDict
      }
    })
    .addHandler(config.prefix + '.finishRemoving' + config.plural, (s: ItemContainer<T>, items: T[]): ItemContainer<T> => {
      let localItemDict = { ...s.localItemDict }
      let syncedItemDict = { ...s.syncedItemDict }
      items.forEach((item) => {
        let key = identifyingFunc(item)
        delete localItemDict[key]
        delete syncedItemDict[key]
      })
      return {
        ...s,
        localItemDict,
        syncedItemDict
      }
    })
}


let getInitialStateTemplate = <T>(): ItemContainer<T> => {
  return {
    localItemDict: {},
    syncedItemDict: {},
    toBeAddedList: [],
    isLoading: false
  }
}

class CrudListReducerGenerator<T> {
  config: CrudReducerConfig
  reducerWrapper: ReducerWrapper<ItemContainer<T>>

  dispatchFuncDict: DispatchFuncDict

  constructor(config: CrudReducerConfig) {
    this.config = config
    this.reducerWrapper = new ReducerWrapper(getInitialStateTemplate())
    this.dispatchFuncDict = {}
  }

  identifiedBy(identifyingFunc: (item: T) => string): CrudListReducerGenerator<T> {
    finalizeWrapper(this.reducerWrapper, this.config, identifyingFunc)
    return this
  }

  static reduce<T>(config: CrudReducerConfig): CrudListReducerGenerator<T> {
    return new CrudListReducerGenerator(config)
  }

  generate(): ReducerPackage<ItemContainer<T>> {
    this.onPopulatingItemsLocally()
    this.onSettingItemLocally()
    this.onSettingItemsLocally()
    this.onModifyingItemLocally()
    this.onModifyingItemsLocally()
    this.onRemovingItemLocally()
    this.onRemovingItemsLocally()
    return {
      reducer: this.reducerWrapper.getReducer(),
      generateActions: (dispatch: Dispatch<AnyAction>) => {
        let returnedActions: FuncDict = {}
        Object.keys(this.dispatchFuncDict).forEach((actionName) => {
          returnedActions[actionName] = this.dispatchFuncDict[actionName](dispatch)
        })
        return returnedActions
      }
    }
  }


  onSettingItemLocally(): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['set' + this.config.singular + 'Locally'] = (dispatch: Dispatch<AnyAction>): SingleItemFunc<T> => {
      return (item: T): T => {
        dispatchAction(dispatch, this.config.prefix + '.set' + this.config.plural, [item])
        return item
      }
    }
    return this
  }

  onSettingItemsLocally(): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['set' + this.config.plural + 'Locally'] = (dispatch: Dispatch<AnyAction>): MultipleItemFunc<T> => {
      return (items: T[]): T[] => {
        dispatchAction(dispatch, this.config.prefix + '.set' + this.config.plural, items)
        return items
      }
    }
    return this
  }

  onPopulatingItemsLocally(): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['populate' + this.config.plural + 'Locally'] = (dispatch: Dispatch<AnyAction>): MultipleItemFunc<T> => {
      return (items: T[]): T[] => {
        dispatchAction(dispatch, this.config.prefix + '.clear')
        dispatchAction(dispatch, this.config.prefix + '.set' + this.config.plural, items)
        return items
      }
    }
    return this
  }

  onPopulatingSyncedItems(asyncFunc: (...args: any[]) => Promise<ManyOrNull<T>>): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['populate' + this.config.plural] = (dispatch: Dispatch<AnyAction>): (...args: any[]) => PromiseOfManyOrNull<T> => {
      return async (...params: any[]): Promise<ManyOrNull<T>> => {
        dispatchAction(dispatch, this.config.prefix + '.startLoading')
        let items: ManyOrNull<T> = null
        try {
          items = await asyncFunc.apply(null, params)
          dispatchAction(dispatch, this.config.prefix + '.clear')
          dispatchAction(dispatch, this.config.prefix + '.setSynced' + this.config.plural, items)
        } catch (e) {
          throw e
        } finally {
          dispatchAction(dispatch, this.config.prefix + '.stopLoading')
          return items
        }

      }
    }
    return this
  }

  onExecutingCrudSyncedItems(methodName: string, asyncFunc: (...args: any[]) => Promise<any>): CrudListReducerGenerator<T> {
    this.dispatchFuncDict[methodName] = (dispatch: Dispatch<AnyAction>): (...args: any[]) => Promise<ItemDict<T>> => {
      return async (...params: any[]): Promise<ItemDict<T>> => {
        dispatchAction(dispatch, this.config.prefix + '.startLoading')
        let localItemDict: ItemDict<T> = {}
        try {
          localItemDict = await asyncFunc.apply(null, params)
          dispatchAction(dispatch, this.config.prefix + '.setSyncedByKeys', localItemDict)
        } catch (e) {
          throw (e)
        } finally {
          dispatchAction(dispatch, this.config.prefix + '.stopLoading')
          return localItemDict
        }
      }
    }
    return this
  }

  onAddingItem(asyncFunc: SingleItemAsyncFunc<T>): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['add' + this.config.singular] = (dispatch: Dispatch<AnyAction>): SingleItemAsyncFunc<T> => {
      return async (toBeAddedItem: T): Promise<SingleOrNull<T>> => {
        dispatchAction(dispatch, this.config.prefix + '.startLoading')
        dispatchAction(dispatch, this.config.prefix + '.startAdding' + this.config.plural, [toBeAddedItem])
        let addedItem: SingleOrNull<T> = null
        try {
          addedItem = await asyncFunc(toBeAddedItem)
          dispatchAction(dispatch, this.config.prefix + '.completeAdding' + this.config.plural, [toBeAddedItem])
          dispatchAction(dispatch, this.config.prefix + '.setSynced' + this.config.plural, [addedItem])
        } catch (e) {
          throw (e)
        } finally {
          dispatchAction(dispatch, this.config.prefix + '.stopLoading')
          return addedItem
        }
      }
    }
    return this
  }

  onAddingItems(asyncFunc: MultipleItemAsyncFunc<T>): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['add' + this.config.plural] = (dispatch: Dispatch<AnyAction>): MultipleItemAsyncFunc<T> => {
      return async (toBeAddedItems: T[]): Promise<ManyOrNull<T>> => {
        dispatchAction(dispatch, this.config.prefix + '.startLoading')
        dispatchAction(dispatch, this.config.prefix + '.startAdding' + this.config.plural, toBeAddedItems)
        let addedItems: ManyOrNull<T> = null
        try {
          addedItems = await asyncFunc(toBeAddedItems)
          dispatchAction(dispatch, this.config.prefix + '.completeAdding' + this.config.plural, toBeAddedItems)
          dispatchAction(dispatch, this.config.prefix + '.setSynced' + this.config.plural, addedItems)
        } catch (e) {
          throw (e)
        } finally {
          dispatchAction(dispatch, this.config.prefix + '.stopLoading')
          return addedItems
        }
      }
    }
    return this
  }

  onModifyingItemLocally(): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['modify' + this.config.singular + 'Locally'] = (dispatch: Dispatch<AnyAction>): SingleItemFunc<T> => {
      return (item: T): T => {
        dispatchAction(dispatch, this.config.prefix + '.set' + this.config.plural, [item])
        return item
      }
    }
    return this
  }

  onModifyingItemsLocally(): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['modify' + this.config.plural + 'Locally'] = (dispatch: Dispatch<AnyAction>): MultipleItemFunc<T> => {
      return (items: T[]): T[] => {
        dispatchAction(dispatch, this.config.prefix + '.set' + this.config.plural, items)
        return items
      }
    }
    return this
  }

  onUpdatingItem(asyncFunc: SingleItemAsyncFunc<T>): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['update' + this.config.singular] = (dispatch: Dispatch<AnyAction>): SingleItemAsyncFunc<T> => {
      return async (toBeUpdatedItem: T): Promise<SingleOrNull<T>> => {
        dispatchAction(dispatch, this.config.prefix + '.startLoading')
        dispatchAction(dispatch, this.config.prefix + '.set' + this.config.plural, [toBeUpdatedItem])
        let updatedItem: SingleOrNull<T> = null
        try {
          updatedItem = await asyncFunc(toBeUpdatedItem)
          dispatchAction(dispatch, this.config.prefix + '.setSynced' + this.config.plural, [updatedItem])
        } catch (e) {
          throw (e)
        } finally {
          dispatchAction(dispatch, this.config.prefix + '.stopLoading')
          return updatedItem
        }
      }
    }
    return this
  }

  onUpdatingItems(asyncFunc: MultipleItemAsyncFunc<T>): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['update' + this.config.plural] = (dispatch: Dispatch<AnyAction>): MultipleItemAsyncFunc<T> => {
      return async (toBeUpdatedItems: T[]): Promise<ManyOrNull<T>> => {
        dispatchAction(dispatch, this.config.prefix + '.startLoading')
        dispatchAction(dispatch, this.config.prefix + '.set' + this.config.plural, toBeUpdatedItems)
        let updatedItems: ManyOrNull<T> = null
        try {
          updatedItems = await asyncFunc(toBeUpdatedItems)
          dispatchAction(dispatch, this.config.prefix + '.setSynced' + this.config.plural, updatedItems)
        } catch (e) {
          throw (e)
        } finally {
          dispatchAction(dispatch, this.config.prefix + '.stopLoading')
          return updatedItems
        }
      }
    }
    return this
  }

  onRemovingItemLocally(): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['remove' + this.config.singular + 'Locally'] = (dispatch: Dispatch<AnyAction>): SingleItemFunc<T> => {
      return (toBeRemovedItem: T): T => {
        dispatchAction(dispatch, this.config.prefix + '.startRemoving' + this.config.plural, [toBeRemovedItem])
        return toBeRemovedItem
      }
    }
    return this
  }

  onRemovingItemsLocally(): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['remove' + this.config.plural + 'Locally'] = (dispatch: Dispatch<AnyAction>): MultipleItemFunc<T> => {
      return (toBeRemovedItems: T[]): T[] => {
        dispatchAction(dispatch, this.config.prefix + '.startRemoving' + this.config.plural, toBeRemovedItems)
        return toBeRemovedItems
      }
    }
    return this
  }

  onRemovingItem(asyncFunc: SingleItemAsyncFunc<T>): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['remove' + this.config.singular] = (dispatch: Dispatch<AnyAction>): SingleItemAsyncFunc<T> => {
      return async (toBeRemovedItem: T): Promise<SingleOrNull<T>> => {
        dispatchAction(dispatch, this.config.prefix + '.startLoading')
        dispatchAction(dispatch, this.config.prefix + '.startRemoving' + this.config.plural, [toBeRemovedItem])
        let removedItem: SingleOrNull<T> = null
        try {
          removedItem = await asyncFunc(toBeRemovedItem)
          dispatchAction(dispatch, this.config.prefix + '.finishRemoving' + this.config.plural, [removedItem])
        } catch (e) {
          throw (e)
        } finally {
          dispatchAction(dispatch, this.config.prefix + '.stopLoading')
          return removedItem
        }
      }
    }
    return this
  }

  onRemovingItems(asyncFunc: MultipleItemAsyncFunc<T>): CrudListReducerGenerator<T> {
    this.dispatchFuncDict['remove' + this.config.plural] = (dispatch: Dispatch<AnyAction>): MultipleItemAsyncFunc<T> => {
      return async (toBeRemovedItems: T[]): Promise<ManyOrNull<T>> => {
        dispatchAction(dispatch, this.config.prefix + '.startLoading')
        dispatchAction(dispatch, this.config.prefix + '.startRemoving' + this.config.plural, toBeRemovedItems)
        let removedItems: ManyOrNull<T> = null
        try {
          removedItems = await asyncFunc(toBeRemovedItems)
          dispatchAction(dispatch, this.config.prefix + '.finishRemoving' + this.config.plural, removedItems)
        } catch (e) {
          throw (e)
        } finally {
          dispatchAction(dispatch, this.config.prefix + '.stopLoading')
          return removedItems
        }
      }
    }
    return this
  }

}


let getLocalList = <T>(state: ItemContainer<T>): T[] => {
  var list = Object.keys(state.localItemDict)
    .filter(u => u != null)
    .map((key) => state.localItemDict[key] as T)
  list.concat(state.toBeAddedList)
  return list
}
let getSyncedList = <T>(state: ItemContainer<T>): T[] => {
  return Object.keys(state.syncedItemDict)
    .filter(u => u != null)
    .map((key) => state.syncedItemDict[key] as T)
}
let isLoading = <T>(state: ItemContainer<T>) => state.isLoading
let getComputedValues = function <T>(state: ItemContainer<T>): ComputedValues<T> {
  return {
    localList: getLocalList(state),
    syncedList: getSyncedList(state),
    isLoading: isLoading(state),
  }
}

export {
  CrudListReducerGenerator,
  getInitialStateTemplate,
  getLocalList,
  getSyncedList,
  isLoading,
  getComputedValues
}