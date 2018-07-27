
import { CrudListReducerGenerator, getComputedValues, ItemDict, getInitialStateTemplate, getLocalList, MultipleItemAsyncFunc, SingleOrNull, SingleItemAsyncFunc, ManyOrNull, PromiseOfSingleOrNull, PromiseOfManyOrNull, ItemContainer } from '../src'
import { StoreWrapper } from 'redux-wrapper-extended'
import { User } from './user'
import fakeApiServer from './fakeApiServer'

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
    .onPopulatingSyncedItems(async (sex?: string) => {
        if (sex) {
            return await fakeApiServer.getUsersByGender(sex)
        } else {
            return await fakeApiServer.getUsers()
        }
    })
    .onAddingItem(async (user: User) => {
        var newId = await fakeApiServer.addUser(user)
        return {
            ...user,
            id: newId
        }
    })
    .onAddingItems(async (users: User[]) => await fakeApiServer.addUsers(users))
    .onRemovingItem(async (user: User): Promise<SingleOrNull<User>> => {
        await fakeApiServer.removeUser(user)
        return user
    })
    .onRemovingItems(async (users: User[]): Promise<ManyOrNull<User>> => {
        await fakeApiServer.removeUsers(users)
        return users
    })
    .onUpdatingItem(async (user: User): Promise<SingleOrNull<User>> => {
        await fakeApiServer.updateUser(user)
        return user
    })
    .onUpdatingItems(async (users: User[]): Promise<ManyOrNull<User>> => {
        await fakeApiServer.updateUsers(users)
        return users
    })

    // yes, custom action. must return key value pair of user
    .onExecutingCrudSyncedItems('markAsDeceased', async (name: string): Promise<ItemDict<User> | null> => {
        var user: SingleOrNull<User> = await fakeApiServer.getUserWithName(name) as User
        if (!user || !user.id){
            return null
        }
        user = await fakeApiServer.markUserAsDeceased(user.id)
        if (!user || !user.id){
            return null
        }       
        let userId = (user.id as number).toString()
        return {
            [userId]: user
        }
    })

    // return id with value null would imply deletion
    .onExecutingCrudSyncedItems('removeDeceasedUsers', async (): Promise<ItemDict<User>> => {
        var deceasedUsers: User[] = await fakeApiServer.removeDeceasedUsers()
        var userDict: ItemDict<User> = {}
        deceasedUsers.forEach((u: User) => {
            let userId = (u.id as number).toString()
            userDict[userId] = null
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

let rawActions = userReducerPackage.generateActions(store.dispatch)


let populateUsers = rawActions.populateUsers as (sex?: string) => PromiseOfManyOrNull<User>
let addUser = rawActions.addUser as SingleItemAsyncFunc<User>
let addUsers = rawActions.addUsers as MultipleItemAsyncFunc<User>
let updateUser = rawActions.updateUser as SingleItemAsyncFunc<User>
let updateUsers = rawActions.updateUsers as MultipleItemAsyncFunc<User>
let removeUser = rawActions.removeUser as SingleItemAsyncFunc<User>
let removeUsers = rawActions.removeUsers as MultipleItemAsyncFunc<User>
let markAsDeceased = rawActions.markAsDeceased as (name: string) => Promise<ItemDict<User>>
let removeDeceasedUsers = rawActions.removeDeceasedUsers as () => Promise<ItemDict<User>>

export default async function () {

    let promise = null
    promise = populateUsers('Female')
    console.log('Populating Users')
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    promise = addUser({
        name: 'Amy',
        sex: 'Female',
    })
    console.log('Adding Item', 'Amy')
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    promise = addUsers([
        {
            name: 'Alicia',
            sex: 'Female',
        },
        {
            name: 'Usher',
            sex: 'Male',
        }
    ])
    console.log('Adding Users', 'Alicia', 'User')
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

    var users = getLocalList<User>(store.getState().users as ItemContainer<User>)


    promise = removeUser(users[0])
    console.log('Removing Item', users[0].name)
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    promise = removeUsers([users[0], users[1], users[2], users[3]])
    console.log('Removing Users', users[0].name, users[1].name, users[2].name, users[3].name)
    console.log(getComputedValues(store.getState().users))
    await promise
    console.log('\tthen')
    console.log(getComputedValues(store.getState().users))

    var users = getLocalList<User>(store.getState().users as ItemContainer<User>)
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

    promise = updateUsers([users[2], users[1]])
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
