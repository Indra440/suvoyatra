var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/user-login',async (req,res,next)=>{
    console.log("Its comming here");
    let userLogin = await controller.partnerLogin(req.body);
   
})
// router.post('/user-account',async (req,res,next)=>{
//     console.log("Its comming here");
// })
module.exports = router;
