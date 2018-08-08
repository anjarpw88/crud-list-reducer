
import { CrudListReducerGenerator, getInitialStateTemplate, SingleItemFunc, MultipleItemsFunc } from '../src'
import { StoreWrapper } from 'redux-wrapper-extended'
import { User } from './user'

let userReducerPackage = CrudListReducerGenerator.reduce<User>({
    prefix: 'user',
    singular: 'User',
    plural: 'Users'
})
    .identifiedBy((user: User) => {
        if (user.id) {
           return user.id.toString()
        }
        return ''
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

let rawActions = userReducerPackage.generateActions(store.dispatch)

interface UserActions {
}

let populateUsersLocally = rawActions.populateUsersLocally as MultipleItemsFunc<User>
let addUserLocally = rawActions.addUserLocally as SingleItemFunc<User>
let addUsersLocally = rawActions.addUsersLocally as MultipleItemsFunc<User>
let modifyUserLocally = rawActions.modifyUserLocally as SingleItemFunc<User>
let modifyUsersLocally = rawActions.modifyUsersLocally as MultipleItemsFunc<User>
let removeUserLocally = rawActions.removeUserLocally as SingleItemFunc<User>
let removeUsersLocally = rawActions.removeUsersLocally as MultipleItemsFunc<User>
let setUserLocally = rawActions.setUserLocally as SingleItemFunc<User>
let setUsersLocally = rawActions.setUsersLocally as MultipleItemsFunc<User>



let users: User[] = [
    {
        id: 1,
        name: 'Paul',
        sex: 'male'
    },
    {
        id: 2,
        name: 'John',
        sex: 'male'
    },
    {
        id: 3,
        name: 'George',
        sex: 'male'
    },
    {
        id: 4,
        name: 'Ringo',
        sex: 'male'
    }
]


var newUsersWithId = [
    {
        id: 11,
        name: 'Freddy',
        sex: 'male'
    },
    {
        id: 12,
        name: 'Michael',
        sex: 'male'
    },
    {
        id: 13,
        name: 'Maurice',
        sex: 'male'
    }
]

export default function () {

    populateUsersLocally(users)
    console.log('Populating Items Locally')
    console.log(store.getState().users.localItemDict)


    setUserLocally(newUsersWithId[2])
    console.log('Setting Item Locally: 13')
    console.log(store.getState().users.localItemDict)

    setUsersLocally([newUsersWithId[0], newUsersWithId[1]])
    console.log('Setting Items Locally: 11 & 12')
    console.log(store.getState().users.localItemDict)


    modifyUserLocally({
        id: 4,
        name: 'Ringo Starr',
        sex: 'male'
    })
    console.log('Modifying Item Locally: 4')
    console.log(store.getState().users.localItemDict)
    modifyUsersLocally([
        {
            id: 1,
            name: 'Paul Mc Cartney',
            sex: 'male'
        },
        {
            id: 2,
            name: 'John Lennon',
            sex: 'male'
        }
    ])
    console.log('Modifying Items Locally: 1 & 2')
    console.log(store.getState().users.localItemDict)

    removeUserLocally({
        id: 4,
        name: 'does not matter',
        sex: 'male'
    })
    console.log('Removing Item Locally: 4')
    console.log(store.getState().users.localItemDict)
    removeUsersLocally([
        {
            id: 11,
            name: 'does not matter',
            sex: 'male'
        },
        {
            id: 2,
            name: 'does not matter',
            sex: 'male'
        }
    ])
    console.log('Removing Items Locally: 11 & 2')
    console.log(store.getState().users.localItemDict)

}