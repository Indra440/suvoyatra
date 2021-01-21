var express = require('express');
var router = express.Router();
const fs = require('fs');
const controller = require('../../controller/buses');
const middleware = require('../../middleware/middleware');




router.post("/addBus",
middleware.api.buses.uploadBusimages,
async (req,res) =>{
    let files = {
        front_side_fileContent :fs.readFileSync(req.files.front_side[0].path),
        left_side_fileContent : fs.readFileSync(req.files.left_side[0].path),
        right_side_fileContent : fs.readFileSync(req.files.right_side[0].path),
        back_side_fileContent : fs.readFileSync(req.files.back_side[0].path),
        driver_cabin_fileContent : fs.readFileSync(req.files.driver_cabin[0].path),
        entire_inside_fileContent : fs.readFileSync(req.files.entire_inside[0].path),
    }

    const addBus = await controller.addBus(req.body,files);
    console.log("addBus ",addBus);
    if(addBus.status == false){
        return res.status(500).send(addBus);
    }else if(addBus.status == true){
        return res.status(200).send(addBus);
    }
})

module.exports = router;