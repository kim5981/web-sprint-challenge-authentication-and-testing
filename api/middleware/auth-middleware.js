const { JWT_SECRET } = require("../server")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const Users = require("../users/users-model")



const usernameUnique = async (req, res, next) => {
 try{
    const [user] = await Users.findBy({ username: req.body.username })
    user 
    ? res.status(400).json("username taken") 
    : req.user = user 
    next()
 }catch(err){
    next(err)
 }
}

const registrationReqs = async (req, res, next) => {
   try{
      const { username, password } = req.body
      !username || !username.trim() || !password || !password.trim()
      ? res.status(400).json("please provide a username and password") 
      : next()
   } catch(err){
      next(err)
   }
}

const noMissingReqBody = async (req, res, next) => {
   const { username , password } = req.body
   !username || !username.trim() || !password || !password.trim()
   ? res.status(400).json("username and password required")
   : next()
}

const checkUsernameExists = async (req, res, next) => {
   try{
      const user = Users.getByUsername({ username: req.body.username })
      if(user){
         next()
      } else {
         res.status(400).json("invalid credentials")
      }
   } catch(err){
      next(err)
   }
} 

const checkPassword = async (req, res) => {
   const credentials = req.body
   const user = await Users.getByUsername({ username: req.body.username })

   if (!user || !bcrypt.compareSync((credentials.password, user.password))){
      return res.status(401).json("invalid credentials")
   }
}



module.exports = {
    usernameUnique,
    registrationReqs,
    noMissingReqBody,
    checkUsernameExists,
    checkPassword
}