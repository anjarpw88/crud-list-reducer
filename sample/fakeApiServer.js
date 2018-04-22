
var usersInServer = [
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

let wait = (timeout) => {
    return new Promise((res) => setTimeout(res, timeout))
}
let nextUserId = 11

let fakeApiServer = {
    async getUsers(){
        await wait(1000)
        return usersInServer
    },    
    async getUsersByGender(sex){
        var users = usersInServer.filter((u)=>u.sex==sex)
        await wait(1000)
        return users
    },
    async addUser(user) {
        nextUserId++
        usersInServer.push({
            ...user,
            id:nextUserId
        })
        await wait(1000)
        return nextUserId
    },
    async addUsers(users) {
        var returnedUsers = []
        users.forEach((user)=>{
            nextUserId++
            var user = {
                ...user,
                id:nextUserId
            }
            usersInServer.push(user)
            returnedUsers.push(user)    
        })
        await wait(1000)
        return returnedUsers
    },
    async removeUser(user) {
        var successfullyRemovedUser = null
        usersInServer = usersInServer.filter((u) =>{
            if(u.id != user.id){
                successfullyRemovedUser = u
                return false
            }
            return true
        })
        await wait(1000)
        return successfullyRemovedUser
        
    },
    async removeUsers(users) {
        var successfullyRemovedUsers = []
        ids = users.map(u=>u.id)
        usersInServer = usersInServer.filter((u) =>{
            if(ids.indexOf(u.id)>=0){
                successfullyRemovedUser.push(u)
                return false
            }
            return true
        })
        await wait(1000)
        return successfullyRemovedUsers
        
    }
    
}

export default fakeApiServer