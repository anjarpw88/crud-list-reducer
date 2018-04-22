
import { CrudListReducerGenerator } from '../src/crud-list-reducer'

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

.generate()


var store = new StoreWrapper(
    {
        users: userReducerPackage.reducer
    },
    {
        users: userReducerPackage.initialState
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
    
} = userReducerPackage.generateActions(store.dispatch)

let runSample = async () => {

    let promise = null
    promise = populateUsers('Female')
    console.log('Populating Items')
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))

    promise = addUser({
        name: 'Amy',
        sex: 'Female'
    })
    console.log('Adding Item', 'Amy')
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))

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
    console.log('Adding Items', 'Alicia','User')
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    

    promise = populateUsers()
    console.log('Populating Items')
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))

    var users = userReducerPackage.getLocalList(store.getState().users)
    

    promise = removeUser(users[0])
    console.log('Removing Item', users[0].name)
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))

    promise = removeUsers([users[0],users[1],users[2],users[3]])
    console.log('Removing Items', users[0].name, users[1].name, users[2].name, users[3].name)
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))

    var users = userReducerPackage.getLocalList(store.getState().users)
    users = JSON.parse(JSON.stringify(users))
    users[0].name = 'Lucy O\'Donnel'
    users[1].name = 'Eleanor Rigby'
    users[2].name = 'Molly Dekker'
    
    promise = updateUser(users[0])
    console.log('Updating Item', users[0].name)
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))

    promise = updateUsers([users[2],users[1]])
    console.log('Updating Items', users[2].name, users[1].name)
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))

}

runSample()