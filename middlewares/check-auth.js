//middleware to authorize protected routes i.e edit, delete,create

//sending token => may be in request body but 'get' doesn't have body
             // => may be query params
             // => may be in headers(we are doing)

const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    if(req.method==='OPTIONS'){
        return next();
    }

    try{
        const token = req.headers.authorization.split(' ')[1];      //'Bearer ' + Token
        if(!token){
            throw Error('Authentication failed!');
        }
        const decodedToken = jwt.verify(token,process.env.JWT_KEY);
        req.userData = {userId:decodedToken.userId};                //adding userId to request
        next(); 

    }catch(err){
        console.log(err);
        const error = new Error('Authentication failed!')
        error.statusCode = 403;
        return next(error);
    }
}