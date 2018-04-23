
import { CrudListReducerGenerator, getInitialStateTemplate } from '../lib/crud-list-reducer'
import { StoreWrapper } from 'redux-wrapper-extended'

let userReducerPackage = CrudListReducerGenerator.Reduce({
    prefix: 'user',
    singular: 'User',
    plural: 'Users'
})
.identifiedBy((user) => user.id)
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
    populateUsersLocally,
    addUserLocally,
    addUsersLocally,
    modifyUserLocally,
    modifyUsersLocally,
    removeUserLocally,
    removeUsersLocally,
    setUserLocally,
    setUsersLocally
} = userReducerPackage.generateActions(store.dispatch)


populateUsersLocally([
    {
        id: 1,
        name: 'Paul'
    },
    {
        id: 2,
        name: 'John'
    },
    {
        id: 3,
        name: 'George'
    },
    {
        id: 4,
        name: 'Ringo'
    }    
])
console.log('Populating Items Locally')
console.log(store.getState().users.localItemDict)

var newUsersWithId = [
    {
        id: 11,
        name: 'Freddy'
    },
    {
        id: 12,
        name: 'Michael'
    },
    {
        id: 13,
        name: 'Maurice'
    }    
]

setUserLocally(newUsersWithId[2])
console.log('Setting Item Locally: 13')
console.log(store.getState().users.localItemDict)

setUsersLocally([newUsersWithId[0], newUsersWithId[1]])
console.log('Setting Items Locally: 11 & 12')
console.log(store.getState().users.localItemDict)


modifyUserLocally({
    id: 4,
    name: 'Ringo Starr'
})
console.log('Modifying Item Locally: 4')
console.log(store.getState().users.localItemDict)
modifyUsersLocally([
    {
        id: 1,
        name: 'Paul Mc Cartney'
    },
    {
        id: 2,
        name: 'John Lennon'
    }
])
console.log('Modifying Items Locally: 1 & 2')
console.log(store.getState().users.localItemDict)

removeUserLocally({
    id: 4,
})
console.log('Removing Item Locally: 4')
console.log(store.getState().users.localItemDict)
removeUsersLocally([
    {
        id: 11,
    },
    {
        id: 2,
    }
])
console.log('Removing Items Locally: 11 & 2')
console.log(store.getState().users.localItemDict)

