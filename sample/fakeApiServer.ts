import { User } from './user'
var usersInServer: User[] = [
    {
        id: 1,
        sex: 'Male',
        name: 'Paul'
    },
    {
        id: 2,
        sex: 'Male',
        name: 'John'
    },
    {
        id: 3,
        sex: 'Male',
        name: 'George'
    },
    {
        id: 4,
        sex: 'Male',
        name: 'Ringo'
    },
    {
        id: 5,
        sex: 'Female',
        name: 'Lucy'
    },
    {
        id: 6,
        sex: 'Female',
        name: 'Eleanor'
    },
    {
        id: 7,
        sex: 'Female',
        name: 'Molly'
    },
    {
        id: 8,
        sex: 'Female',
        name: 'Rita'
    },
    {
        id: 9,
        sex: 'Male',
        name: 'Jude'
    },
    {
        id: 10,
        sex: 'Female',
        name: 'Anna'
    },
    {
        id: 11,
        sex: 'Male',
        name: 'Desmond'
    }
]


let wait = (timeout: number) => {
    return new Promise((res) => setTimeout(res, timeout))
}
let nextUserId = 11

let makeBrandNewUsers = (items: User[]): User[] => {
    return JSON.parse(JSON.stringify(items))
}
let makeBrandNewUser = (items: User): User => {
    return JSON.parse(JSON.stringify(items))
}

let fakeApiServer = {
    async getUsers() {
        await wait(50)
        return makeBrandNewUsers(usersInServer)
    },
    async getUserWithName(name: string): Promise<User | null> {
        var user = usersInServer.filter((u: User) => u.name == name)[0]
        await wait(50)
        if (user) {
            return makeBrandNewUser(user)
        } else {
            return null
        }
    },
    async removeDeceasedUsers() {
        var deceasedUsers = usersInServer.filter((u) => u.deceased)
        usersInServer = usersInServer.filter((u) => !u.deceased)
        await wait(50)
        return makeBrandNewUsers(deceasedUsers)
    },

    async markUserAsDeceased(id: number) {
        var user = usersInServer.filter((u) => u.id == id)[0]
        await wait(50)
        if (user) {
            user.deceased = true
            return makeBrandNewUser(user)
        } else {
            return null
        }
    },
    async getUsersByGender(sex: string) {
        var users = usersInServer.filter((u) => u.sex == sex)
        await wait(50)
        return makeBrandNewUsers(users)
    },
    async addUser(user: User) {
        nextUserId++
        usersInServer.push({
            ...user,
            id: nextUserId
        })
        await wait(50)
        return nextUserId
    },
    async addUsers(users: User[]) {
        var returnedUsers: User[] = []
        users.forEach((user) => {
            nextUserId++
            var user: User = {
                ...user,
                id: nextUserId
            }
            usersInServer.push(user)
            returnedUsers.push(user)
        })
        await wait(50)
        return makeBrandNewUsers(returnedUsers)
    },
    async removeUser(user:User) {
        let successfullyRemovedUser: User | null = null
        usersInServer = usersInServer.filter((u) => {
            if (u.id == user.id) {
                successfullyRemovedUser = u
                return false
            }
            return true
        })
        await wait(50)
        if (successfullyRemovedUser) {
            return makeBrandNewUser(successfullyRemovedUser as User)
        }
        return null

    },
    async removeUsers(users: User[]): Promise<User[]> {

        let successfullyRemovedUsers: User[] = []
        let ids = users.map(u => u.id)
        usersInServer = usersInServer.filter((u: User) => {
            if (ids.indexOf(u.id) >= 0) {
                successfullyRemovedUsers.push(u)
                return false
            }
            return true
        })
        await wait(50)
        return makeBrandNewUsers(successfullyRemovedUsers)
    },
    async updateUser(user: User) {
        let successfullyUpdatedUser: User | null = null
        usersInServer.map((u, index) => {
            if (u.id == user.id) {
                successfullyUpdatedUser = user
                usersInServer[index] = user
            }
        })
        await wait(50)
        if (successfullyUpdatedUser) {
            return makeBrandNewUser(successfullyUpdatedUser as User)
        }
        return []
    },
    async updateUsers(users: User[]) {
        let successfullyUpdatedUsers: User[] = []
        let ids = users.map(u => u.id)
        usersInServer.forEach((u, index) => {
            var index2 = ids.indexOf(u.id)
            if (index2 >= 0) {
                usersInServer[index] = users[index2]
                successfullyUpdatedUsers.push(users[index2])
            }
        })
        await wait(50)
        return makeBrandNewUsers(successfullyUpdatedUsers)
    },

}

export default fakeApiServer