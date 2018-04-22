
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

    promise = removeUsers([users[0],users[1]])
    console.log('Removing Items', users[0].name, users[1].name)
    console.log(userReducerPackage.getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(userReducerPackage.getComputedValues(store.getState().users))
        
}

runSample()