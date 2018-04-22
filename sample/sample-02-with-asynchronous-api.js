
import { CrudListReducerGenerator, getComputedValues, getInitialStateTemplate, getLocalList } from '../src/crud-list-reducer'

import { StoreWrapper } from 'redux-wrapper-extended'

import fakeApiServer from './fakeApiServer'

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


var store = new StoreWrapper(
    {
        users: userReducerPackage.reducer
    },
    {
        users: getInitialStateTemplate()
    })
    .getStore()

let {
    populateUsers,
    addUser,
    addUsers,
    updateUser,
    updateUsers,
    removeUser,
    removeUsers,
    markAsDeceased,
    removeDeceasedUsers
    
} = userReducerPackage.generateActions(store.dispatch)

let runSample = async () => {

    let promise = null
    promise = populateUsers('Female')
    console.log('Populating Users')
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    promise = addUser({
        name: 'Amy',
        sex: 'Female'
    })
    console.log('Adding Item', 'Amy')
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    promise = addUsers([
        {
            name: 'Alicia',
            sex: 'Female'
        },
        {
            name: 'Usher',
            sex: 'Male'
        }
    ])
    console.log('Adding Users', 'Alicia','User')
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))
    

    promise = populateUsers()
    console.log('Populating Users')
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    var users = getLocalList(store.getState().users)
    

    promise = removeUser(users[0])
    console.log('Removing Item', users[0].name)
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    promise = removeUsers([users[0],users[1],users[2],users[3]])
    console.log('Removing Users', users[0].name, users[1].name, users[2].name, users[3].name)
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    var users = getLocalList(store.getState().users)
    users = JSON.parse(JSON.stringify(users))
    users[0].name = 'Lucy O\'Donnel'
    users[1].name = 'Eleanor Rigby'
    users[2].name = 'Molly Dekker'
    
    promise = updateUser(users[0])
    console.log('Updating Item', users[0].name)
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    promise = updateUsers([users[2],users[1]])
    console.log('Updating Users', users[2].name, users[1].name)
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    promise = markAsDeceased('Amy')
    console.log('Mark as deceased', 'Amy')
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))


    await markAsDeceased('Eleanor Rigby')

    promise = removeDeceasedUsers()
    console.log('remove deceased users')
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))
    
}

runSample()