# crud-list-reducer

## Problems Statement: 

* You want to manage the list of homogenous object structure

* Each item could be identified by a unique id, or function that return a unique value 

* It acts as single source of truth, but capability to be synchronized with API calls

* localized states:

```js
{
    localItemDict: {},  // state at local
    syncedItemDict:{},  // state that marked as synchronized
    toBeAddedList:[],   // to be added list, which is still unable to be keyed into dictionary/map
    isLoading: false    // loading flag that changes while calling API
}
```


## Sample

You could do something like this

```js

let userReducerPackage = CrudListReducerGenerator.Reduce({
    prefix: 'user',
    singular: 'User',
    plural: 'Users'
})
.identifiedBy((user) => user.id)
.onPopulatingSyncedItems(async (sex) => {
    if(sex) {
        return await fakeApiServer.getUsersByGender(sex)
    } else {
        return await fakeApiServer.getUsers()
    }
})
.onAddingItem( async (user) => {
    var newId = await fakeApiServer.addUser(user)
    return {
        ...user,
        id:newId
    }
})
.onAddingItems( async (users) => await fakeApiServer.addUsers(users))
.onRemovingItem( async (user) => {
    await fakeApiServer.removeUser(user)
    return user
})
.onRemovingItems( async (users) => {
    await fakeApiServer.removeUsers(users)
    return users
})
.onUpdatingItem( async (user) => {
    await fakeApiServer.updateUser(user)
    return user
})
.onUpdatingItems( async (users) => {
    await fakeApiServer.updateUsers(users)
    return users
})

// yes, custom action. must return key value pair of user
.onExecutingCrudSyncedItems ('markAsDeceased', async (name) => {
    var user = await fakeApiServer.getUserWithName(name)
    user = await fakeApiServer.markUserAsDeceased(user.id)
    return {
        [user.id]: user
    }
})

// return id with value null would imply deletion
.onExecutingCrudSyncedItems ('removeDeceasedUsers', async (name) => {
    var deceasedUsers = await fakeApiServer.removeDeceasedUsers()
    var userDict = {}
    deceasedUsers.forEach((u) => {
        userDict[u.id] = null
    })
    return userDict
})


.generate()

```

which generate:

* reducer

* function to generate actions

     it will generate the following actions:
     
     * populateUsers
     
     * addUser
     
     * addUsers
     
     * removeUser
     
     * removeUsers
     
     * updateUser
     
     * updateUsers
     
     * markAsDeceased
     
     * removeDeceasedUsers

     as well as function that will always be available
 
     *  populateUsersLocally,
     
     *  addUserLocally,
     
     *  addUsersLocally,
     
     *  modifyUserLocally,
     
     *  modifyUsersLocally,
     
     *  removeUserLocally,
     
     *  removeUsersLocally,
     
     *  setUserLocally,
     
     *  setUsersLocally

Internally, every action will call one or more of these reducer actions

* user.startLoading

* user.stopLoading

* user.set

* user.setSynced

* user.setSyncedByKeys

* user.startAdding

* user.stopAdding

* user.startRemoving

* user.stopRemoving


##other static methods:

```js
export {
  CrudListReducerGenerator,
  
  
  /**
   * getInitialStateTemplate(), return:
   * {
   *     localItemDict: {},  // state at local
   *     syncedItemDict:{},  // state that marked as synchronized
   *     toBeAddedList:[],   // to be added list, which is still unable to be keyed into dictionary/map
   *     isLoading: false    // loading flag that changes while calling API
   * }
   */
  getInitialStateTemplate,

  /**
   * getLocalList(store.dispatch), return:
   * localItemDict, which is flattened into list and concatenated with toBeAddedList
   */
  getLocalList,

  /**
   * getSyncedList(store.dispatch), return:
   * syncedItemDict, which is flattened into list
   */
  getSyncedList,

  /**
   * isLoading(store.dispatch), return:
   * return isLoading flag
   */  
  isLoading,

  /**
   * getComputedValues(store.dispatch), return:
   * return {
   *    syncedList,
   *    localList,
   *    isLoading
   * }
   */  
  getComputedValues
}
```


##FOR DETAIL IMPLEMENTATION, check /sample