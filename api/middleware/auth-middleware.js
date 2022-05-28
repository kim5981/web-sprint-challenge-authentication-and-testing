const { JWT_SECRET } = require("../server")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const Users = require("../users/users-model")



const usernameUnique = async (req, res, next) => {
 try{
    const [user] = await Users.findBy({ username: req.body.username })
    user 
    ? res.status(400).json("username taken") 
    : next()
 }catch(err){
    next(err)
 }
}

const registrationReqs = async (req, res, next) => {
   try{
      const { username, password } = req.body
      !username || !username.trim() || !password || !password.trim()
      ? res.status(400).json("username and password required") 
      : next()
   } catch(err){
      next(err)
   }
}

const checkReqBody = async (req, res, next) => {
   const { username , password } = req.body
   !username || !username.trim() || !password || !password.trim()
   ? res.status(400).json("username and password required")
   : next()
}

const checkUsernameExists = async (req, res, next) => {
   try{
      const user = Users.getByUsername({ username: req.body.username })
      !user
      ? req.user = user
      : res.status(400).json("invalid credentials")
   } catch(err){
      next(err)
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
    registrationReqs,
    checkReqBody,
    checkUsernameExists,
    checkPassword
}