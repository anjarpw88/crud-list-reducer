import {ReducerWrapper, dispatchAction} from 'redux-wrapper-extended';

function finalizeWrapper(wrapper, prefix, plural, identifyingFunc) {
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
      localItemDict: {},
      syncedItemDict:{},
      toBeAddedList:[]
    }
  })

  .addHandler(prefix+'.set' + plural, (s, items) => {
    let localItemDict = {...s.localItemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      localItemDict[key] = item
    })
    return {
      ...s,
      localItemDict
    }
  })
  .addHandler(prefix+'.setSynced' + plural, (s, items) => {
    let localItemDict = {...s.localItemDict}
    let syncedItemDict = {...s.syncedItemDict}
    items.forEach((item) => {
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
  .addHandler(prefix+'.setSyncedByKeys', (s, newItemDict) => {
    let localItemDict = {...s.localItemDict, ...newItemDict}
    let syncedItemDict = {...s.syncedItemDict, ...newItemDict}
    Object.keys(newItemDict).forEach((key)=>{
      if(newItemDict[key]==null){
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
  .addHandler(prefix+'.startAdding' + plural, (s, items) => {
    let toBeAddedList = [...s.toBeAddedList, ...items]
    return {
      ...s,
      toBeAddedList
    }
  })
  .addHandler(prefix+'.completeAdding' + plural, (s, items) => {
    let toBeAddedList = [...s.toBeAddedList]
    items.forEach((item) => {
      let index = toBeAddedList.indexOf(item)
      if(index >= 0 && index < toBeAddedList.length){
        toBeAddedList.splice(index, 1)
      }
    })

    return {
      ...s,
      toBeAddedList
    }
  })
  .addHandler(prefix+'.modify' + plural, (s, items) => {
    let localItemDict = {...s.localItemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      localItemDict[key] = item
    })
    return {
      ...s,
      localItemDict
    }
  })
  .addHandler(prefix+'.completeUpdating' + plural, (s, items) => {
    let localItemDict = {...s.localItemDict}
    let syncedItemDict = {...s.syncedItemDict}
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
  .addHandler(prefix+'.startRemoving' + plural, (s, items) => {
    let localItemDict = {...s.localItemDict}
    items.forEach((item) => {
      let key = identifyingFunc(item)
      delete localItemDict[key]
    })
    return {
      ...s,
      localItemDict
    }
  })
  .addHandler(prefix+'.finishRemoving' + plural, (s, items) => {
    let localItemDict = {...s.localItemDict}
    let syncedItemDict = {...s.syncedItemDict}
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


let getInitialStateTemplate = () => {
  return {
    localItemDict: {},
    syncedItemDict:{},
    toBeAddedList:[],
    isLoading: false
  }
}

const Reduce = function (config){
  let {prefix, singular, plural} = config



  let reducerWrapper = new ReducerWrapper(getInitialStateTemplate())
  let actionDict = {}
  
  let obj = {
    identifiedBy(identifyingFunc) {
      finalizeWrapper(reducerWrapper, prefix, plural, identifyingFunc)
      return obj
    },
    generate() {
      obj.onPopulatingItemsLocally()
      obj.onSettingItemLocally()
      obj.onSettingItemsLocally()
      obj.onModifyingItemLocally()
      obj.onModifyingItemsLocally()
      obj.onRemovingItemLocally()
      obj.onRemovingItemsLocally()
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
    onSettingItemLocally () {
      actionDict['set'+singular+'Locally'] = (dispatch) => {
        return (item) => {
          dispatchAction(dispatch, prefix+'.set' + plural, [item])     
        } 
      }
      return obj            
    },
    
    onSettingItemsLocally () {
      actionDict['set'+plural+'Locally'] = (dispatch) => {
        return (items) => {
          dispatchAction(dispatch, prefix+'.set' + plural, items)     
        } 
      }
      return obj            
    },
    
    onPopulatingItemsLocally () {
      actionDict['populate'+plural+'Locally'] = (dispatch) => {
        return (items) => {
          dispatchAction(dispatch, prefix+'.clear')     
          dispatchAction(dispatch, prefix+'.set' + plural, items)     
        } 
      }
      return obj            
    },
    onPopulatingSyncedItems (asyncFunc) {
      actionDict['populate'+plural] = (dispatch) => {
        return async (params) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          try{
            let items = await asyncFunc(params)
            dispatchAction(dispatch, prefix+'.clear')     
            dispatchAction(dispatch, prefix+'.setSynced' + plural, items)     
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
            let localItemDict = await asyncFunc(params)
            dispatchAction(dispatch, prefix+'.setSyncedByKeys', localItemDict)     
          }catch (e){
            throw (e)
          }finally{
            dispatchAction(dispatch, prefix+'.stopLoading')
          }
        } 
      }
      return obj            
    },

    onAddingItem (asyncFunc){
      actionDict['add'+singular] = (dispatch) => {
        return async (toBeAddedItem) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.startAdding' + plural, [toBeAddedItem])
          try{
            let addedItem = await asyncFunc(toBeAddedItem)
            dispatchAction(dispatch, prefix+'.completeAdding' + plural, [toBeAddedItem])     
            dispatchAction(dispatch, prefix+'.setSynced' + plural, [addedItem])     
          }catch (e){
            throw (e)
          }finally{
            dispatchAction(dispatch, prefix+'.stopLoading')
          }
        } 
      }
      return obj
    },  
    
    onAddingItems (asyncFunc){
      actionDict['add'+plural] = (dispatch) => {
        return async (toBeAddedItems) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.startAdding' + plural, toBeAddedItems)
          try{
            let addedItems = await asyncFunc(toBeAddedItems)
            dispatchAction(dispatch, prefix+'.completeAdding' + plural, toBeAddedItems)     
            dispatchAction(dispatch, prefix+'.setSynced' + plural, addedItems)     
          }catch (e){
            throw (e)
          }finally{
            dispatchAction(dispatch, prefix+'.stopLoading')
          }
        }         
      }
      return obj
    },


    onModifyingItemLocally (){
      actionDict['modify'+singular+'Locally'] = (dispatch) => {
        return (item) => {
          dispatchAction(dispatch, prefix+'.set' + plural, [item])
        }         
      }
      return obj
    },

    onModifyingItemsLocally (){
      actionDict['modify'+plural+'Locally'] = (dispatch) => {
        return (items) => {
          dispatchAction(dispatch, prefix+'.set' + plural, items)
        }         
      }
      return obj
    },

    onUpdatingItem (asyncFunc){
      actionDict['update'+singular] = (dispatch) => {
        return async (toBeUpdatedItem) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.set' + plural, [toBeUpdatedItem])
          try{
            let updatedItem = await asyncFunc(toBeUpdatedItem)
            dispatchAction(dispatch, prefix+'.setSynced' + plural, [updatedItem])     
          }catch (e){
            throw (e)
          }finally{
            dispatchAction(dispatch, prefix+'.stopLoading')
          }
        }         
      }
      return obj
    },

    onUpdatingItems (asyncFunc){
      actionDict['update'+plural] = (dispatch) => {
        return async (toBeUpdatedItems) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.set' + plural, toBeUpdatedItems)
          try{
            let updatedItems = await asyncFunc(toBeUpdatedItems)
            dispatchAction(dispatch, prefix+'.setSynced' + plural, updatedItems)     
          }catch (e){
            throw (e)
          }finally{
            dispatchAction(dispatch, prefix+'.stopLoading')
          }
        }         
      }
      return obj
    },

    onRemovingItemLocally (){
      actionDict['remove'+singular+'Locally'] = (dispatch) => {
        return (toBeRemovedItem) => {
          dispatchAction(dispatch, prefix+'.startRemoving' + plural, [toBeRemovedItem])
        }         
      }
      return obj
    },

    onRemovingItemsLocally (){
      actionDict['remove'+plural+'Locally'] = (dispatch) => {
        return (toBeRemovedItems) => {
          dispatchAction(dispatch, prefix+'.startRemoving' + plural, toBeRemovedItems)
        }         
      }
      return obj
    },

    onRemovingItem (asyncFunc){
      actionDict['remove'+singular] = (dispatch) => {
        return async (toBeRemovedItem) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.startRemoving' + plural, [toBeRemovedItem])
          try{
            let removedItem = await asyncFunc(toBeRemovedItem)
            dispatchAction(dispatch, prefix+'.finishRemoving' + plural, [removedItem])     
          }catch (e){
            throw (e)
          }finally{
            dispatchAction(dispatch, prefix+'.stopLoading')
          }
        }         
      }
      return obj
    },

    onRemovingItems (asyncFunc){
      actionDict['remove'+plural] = (dispatch) => {
        return async (toBeRemovedItems) => {
          dispatchAction(dispatch, prefix+'.startLoading')
          dispatchAction(dispatch, prefix+'.startRemoving' + plural, toBeRemovedItems)
          try{
            let removedItems = await asyncFunc(toBeRemovedItems)
            dispatchAction(dispatch, prefix+'.finishRemoving' + plural, removedItems)     
          }catch (e){
            throw (e)
          }finally{
            dispatchAction(dispatch, prefix+'.stopLoading')
          }
        }         
      }
      return obj
    }

  }
  return obj
}

let CrudListReducerGenerator = { 
  Reduce
}
let getLocalList = (state) => {
  var list = Object.keys(state.localItemDict).map((key) => state.localItemDict[key])
  list.concat(state.toBeAddedList)
  return list
}
let getSyncedList = (state) => {
  return Object.keys(state.syncedItemDict).map((key) => state.syncedItemDict[key])
}
let isLoading = (state) => state.isLoading
let getComputedValues = function (state) {
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