
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

let makeBrandNew = (item) => {
    return JSON.parse(JSON.stringify(item))
}

let fakeApiServer = {
    async getUsers(){
        await wait(50)
        return makeBrandNew(usersInServer)
    },
    async getUserWithName(name) {
        var user = usersInServer.filter((u)=>u.name==name)[0]
        await wait(50)
        if(user) {
            return makeBrandNew(user)        
        }else {
            return null
        }
    },   
    async removeDeceasedUsers(){
        var deceasedUsers = usersInServer.filter((u)=>u.deceased)
        usersInServer = usersInServer.filter((u)=>!u.deceased)
        await wait(50)
        return makeBrandNew(deceasedUsers)        
    },
    
    async markUserAsDeceased(id) {
        var user = usersInServer.filter((u)=>u.id==id)[0]
        await wait(50)
        if (user) {
            user.deceased = true
            return makeBrandNew(user)        
        }else{
            return null
        }
    },    
    async getUsersByGender(sex){
        var users = usersInServer.filter((u)=>u.sex==sex)
        await wait(50)
        return makeBrandNew(users)
    },
    async addUser(user) {
        nextUserId++
        usersInServer.push({
            ...user,
            id:nextUserId
        })
        await wait(50)
        return makeBrandNew(nextUserId)
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
        await wait(50)
        return makeBrandNew(returnedUsers)
    },
    async removeUser(user) {
        let successfullyRemovedUser = null
        usersInServer = usersInServer.filter((u) =>{
            if(u.id == user.id){
                successfullyRemovedUser = u
                return false
            }
            return true
        })
        await wait(50)
        return makeBrandNew(successfullyRemovedUser)
        
    },
    async removeUsers(users) {

        let successfullyRemovedUsers = []
        let ids = users.map(u=>u.id)
        usersInServer = usersInServer.filter((u) =>{
            if(ids.indexOf(u.id)>=0){
                successfullyRemovedUsers.push(u)
                return false
            }
            return true
        })
        await wait(50)
        return makeBrandNew(successfullyRemovedUsers)        
    },
    async updateUser(user){
        let successfullyUpdatedUser = null
        usersInServer.map((u, index) =>{
            if(u.id == user.id){
                successfullyUpdatedUser = user
                usersInServer[index] = user
            }
        })
        await wait(50)
        return makeBrandNew(successfullyUpdatedUser)               
    },
    async updateUsers(users) {
        let successfullyUpdatedUsers = []
        let ids = users.map(u=>u.id)
        usersInServer.forEach((u, index) =>{
            var index2 = ids.indexOf(u.id)
            if(index2>=0){
                usersInServer[index] = users[index2]
                successfullyUpdatedUsers.push(users[index2])
            }
        })
        await wait(50)
        return makeBrandNew(successfullyUpdatedUsers)        
    },
    
}

export default fakeApiServer