var express = require('express');
var router = express.Router();
const middleware = require('../../middleware/middleware');
const controller = require('../../controller/users');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/user-login',
    middleware.api.users.userLogin,
    async (req,res,next)=>{
    try{
        const flag = req.flag;
        let userLogin = await controller.userLogin(req.body.username,flag);
        if(userLogin.status == false){
            return res.status(500).send(userLogin);
        }else{
            return res.status(200).send(userLogin);
        }
    }catch(err){
        return res.status(500).send(err);
    }    
})

router.post('/user-otpchecking',
middleware.api.users.userOtpChecking,
    async (req,res,next) =>{
        try{
            
            const user = req.user;
            let userOtpChecking = await controller.userOptSubmit(user,req.body.otp);
            if(userOtpChecking.status == false){
                return res.status(500).send(userOtpChecking);
            }else{
                return res.status(200).send(userOtpChecking);
            }
        }catch(err){
            return res.status(500).send(err);
        }
    }
)

module.exports = router;
