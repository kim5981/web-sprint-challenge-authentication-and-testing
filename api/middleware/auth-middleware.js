const { JWT_SECRET } = require("../server")
const jwt = require("jsonwebtoken")

const Users = require("../users/users-model")



const usernameUnique = async (req, res, next) => {
 try{
    const [user] = await Users.findBy({ username: req.body.username })
    !user 
    ? next({ status: 401, message: "username taken"})
    : req.user = user 
    next()
 }catch(err){
    next(err)
 }
}

const 

module.exports = {
    usernameUnique
}