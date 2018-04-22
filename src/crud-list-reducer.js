import {ReducerWrapper, dispatchAction} from 'redux-wrapper-extended';

function finalizeWrapper(wrapper, prefix, identifyingFunc) {
  wrapper
  .addHandler(prefix+'.startLoading', (s) => {
    return {
      ...s,
      isLoading:true
    }
  })
  .addHandler(prefix+'.stopLoading', (s) => {
    return {
      ...s,
      isLoading:false
    }
  })
  .addHandler(prefix+'.clear', (s) => {
    return {
      ...s,
      itemDict: {},
      syncedItemDict:{},
      toBeAddedList:[]
    }
  })

  .addHandler(prefix+'.setItems', (s, items) => {
    let itemDict = {...s.itemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      itemDict[key] = item
    })
    return {
      ...s,
      itemDict
    }
  })
  .addHandler(prefix+'.setSyncedItems', (s, items) => {
    let itemDict = {...s.itemDict}
    let syncedItemDict = {...s.syncedItemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      itemDict[key] = item
      syncedItemDict[key] = item
    })
    return {
      ...s,
      itemDict,
      syncedItemDict
    }
  })
  .addHandler(prefix+'.setSyncedByKeys', (s, newItemDict) => {
    let itemDict = {...s.itemDict, ...newItemDict}
    let syncedItemDict = {...s.syncedItemDict, ...newItemDict}
    Object.keys(newItemDict).forEach((key)=>{
      if(newItemDict[key]==null){
        delete itemDict[key]
        delete syncedItemDict[key]
      }
    })
    return {
      ...s,
      itemDict,
      syncedItemDict
    }
  })
  .addHandler(prefix+'.startAddingItems', (s, items) => {
    let toBeAddedList = [...s.toBeAddedList, ...items]
    return {
      ...s,
      toBeAddedList
    }
  })
  .addHandler(prefix+'.completeAddingItems', (s, items) => {
    let toBeAddedList = [...s.toBeAddedList]
    items.forEach((item) => {
      let index = toBeAddedList.indexOf(item)
      toBeAddedList.splice(index, 1)
    })

    return {
      ...s,
      toBeAddedList
    }
  })
  .addHandler(prefix+'.modifyItems', (s, items) => {
    let itemDict = {...s.itemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      itemDict[key] = item
    })
    return {
      ...s,
      itemDict
    }
  })
  .addHandler(prefix+'.completeUpdatingItems', (s, items) => {
    let itemDict = {...s.itemDict}
    let syncedItemDict = {...s.syncedItemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      itemDict[key] = item
      syncedItemDict[key] = item
    })
    return {
      ...s,
      syncedItemDict
    }
  })
  .addHandler(prefix+'.startDeletingItems', (s, items) => {
    let itemDict = {...s.itemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      delete itemDict[key]
    })
    return {
      ...s,
      itemDict
    }
  })
  .addHandler(prefix+'.finishDeletingItems', (s, items) => {
    let itemDict = {...s.itemDict}
    let syncedItemDict = {...s.syncedItemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      delete itemDict[key]
      delete syncedItemDict[key]
    })
    return {
      ...s,
      itemDict,
      syncedItemDict
    }
  })
}

const Reduce = function (config){
  let {prefix, singular, plural} = config
  let reducerWrapper = ReducerWrapper({
    itemDict: {},
    syncedItemDict:{},
    toBeAddedList:[],
    isLoading: false
  })
  let actionDict = {}
  
  let obj = {
    identifiedBy(identifyingFunc) {
      finalizeWrapper(reducerWrapper, prefix, identifyingFunc)
      return obj
    },
    generate() {
      return {
        reducer: reducerWrapper.getReducer(),
        generateActions: (dispatch) => {
          let returnedActions = {}
          Object.keys(actionDict).forEach((actionName) => {
            returnedActions[actionName] = actionDict[actionName](dispatch)
          }) 
          return returnedActions
        }
      }
    },
    onPopulatingItems () {
      actionDict['set'+plural] = (dispatch) => {
        return (items) => {
          dispatchAction(dispatch, prefix+'.clear')     
          dispatchAction(dispatch, prefix+'.setItems', items)     
        } 
      }
      return obj            
    },
    onPopulatingSyncedItems (asyncFunc) {
      actionDict['set'+plural] = (dispatch) => {
        return async (params) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          try{
            let items = await asyncFunc(params)
            dispatchAction(dispatch, prefix+'.clear')     
            dispatchAction(dispatch, prefix+'.setSyncedItems', items)     
          }catch (e){
            
          }
          dispatchAction(dispatch, prefix+'.stopLoading')
        } 
      }
      return obj            
    },

    onExecutingCrudSyncedItems (methodName, asyncFunc) {
      actionDict[methodName] = (dispatch) => {
        return async (params) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          try{
            let itemDict = await asyncFunc(params)
            dispatchAction(dispatch, prefix+'.setSyncedByKeys', itemDict)     
          }catch (e){
            
          }
          dispatchAction(dispatch, prefix+'.stopLoading')
        } 
      }
      return obj            
    },


    onAddingItem (asyncFunc){
      actionDict['get'+singular] = (dispatch) => {
        return async (toBeAddedItem) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.startAddingItems', [toBeAddedItem])
          try{
            let addedItem = await asyncFunc(toBeAddedItem)
            dispatchAction(dispatch, prefix+'.completeAddingItems', [toBeAddedItem])     
            dispatchAction(dispatch, prefix+'.setSyncedItems', [addedItem])     
          }catch (e){
            
          }
          dispatchAction(dispatch, prefix+'.stopLoading')
        } 
      }
      return obj
    },  
    
    onAddingItems (asyncFunc){
      actionDict['get'+plural] = (dispatch) => {
        return async (toBeAddedItems) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.startAddingItems', toBeAddedItems)
          try{
            let addedItems = await asyncFunc(toBeAddedItems)
            dispatchAction(dispatch, prefix+'.completeAddingItems', toBeAddedItems)     
            dispatchAction(dispatch, prefix+'.setSyncedItems', addedItems)     
          }catch (e){
            
          }
          dispatchAction(dispatch, prefix+'.stopLoading')
        }         
      }
      return obj
    },
    onModifyingItem (asyncFunc){
      actionDict['modify'+singular] = (dispatch) => {
        return (item) => {
          dispatchAction(dispatch, prefix+'.setItems', [item])
        }         
      }
      return obj
    },

    onModifyingItems (asyncFunc){
      actionDict['modify'+plural] = (dispatch) => {
        return (items) => {
          dispatchAction(dispatch, prefix+'.setItems', items)
        }         
      }
      return obj
    },

    onUpdatingItem (asyncFunc){
      actionDict['modify'+plural] = (dispatch) => {
        return (toBeUpdatedItem) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.setItems', [toBeUpdatedItem])
          try{
            let updatedItem = await asyncFunc(toBeUpdatedItem)
            dispatchAction(dispatch, prefix+'.setSyncedItems', [updatedItem])     
          }catch (e){
            
          }
          dispatchAction(dispatch, prefix+'.stopLoading')
        }         
      }
      return obj
    },

    onUpdatingItems (asyncFunc){
      actionDict['modify'+plural] = (dispatch) => {
        return (toBeUpdatedItems) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.setItems', toBeUpdatedItems)
          try{
            let updatedItems = await asyncFunc(toBeUpdatedItems)
            dispatchAction(dispatch, prefix+'.setSyncedItems', updatedItems)     
          }catch (e){
            
          }
          dispatchAction(dispatch, prefix+'.stopLoading')
        }         
      }
      return obj
    },
    onDeletingItem (asyncFunc){
      actionDict['modify'+plural] = (dispatch) => {
        return (toBeDeletedItem) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.startDeletingItems', [toBeDeletedItem])
          try{
            let deletedItem = await asyncFunc(toBeDeletedItem)
            dispatchAction(dispatch, prefix+'.finishDeletingItems', [deletedItem])     
          }catch (e){
            
          }
          dispatchAction(dispatch, prefix+'.stopLoading')
        }         
      }
      return obj
    },

    onDeletingItems (asyncFunc){
      actionDict['modify'+plural] = (dispatch) => {
        return (toBeDeletedItems) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.startDeletingItems', toBeDeletedItems)
          try{
            let deletedItems = await asyncFunc(toBeDeletedItems)
            dispatchAction(dispatch, prefix+'.finishDeletingItems', deletedItems)     
          }catch (e){
            
          }
          dispatchAction(dispatch, prefix+'.stopLoading')
        }         
      }
      return obj
    }

  }
}

let CrudListReducerGenerator = { 
  Reduce
}

export {
  CrudListReducerGenerator
}