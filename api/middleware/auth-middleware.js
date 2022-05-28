const Users = require("../users/users-model")


const usernameUnique = async (req, res, next) => {
const { username } = req.body
const user = await Users.getByUsername(username)

user
? res.status(400).json("username taken")
: next()
}

const checkReqBody = async (req, res, next) => {
   const { username , password } = req.body
   !username || !password 
   ? res.status(400).json("username and password required")
   : next()
}

const usernameInDB = async (req, res, next) => {
   const { username } = req.body
   const user = await Users.getByUsername(username)
   if(user){
      req.user = user
      next()
   } else {
      res.status(400).json("invalid credentials")
   }
} 

const checkPassword = async (req, res, next) => {
   const credentials = req.body
   const user = await Users.getByUsername({ username: req.body.username })
   !bcrypt.compareSync((credentials.password, user.password))
   ? res.status(401).json("invalid credentials")
   : next()
}



module.exports = {
    usernameUnique,
    checkReqBody,
    usernameInDB,
    checkPassword
}