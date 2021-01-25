const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);


    module.exports.remove_all_images_for_buses = async (files)=>{
        files.front_side ? await unlinkAsync(files.front_side[0].path) : ""
        files.left_side ? await unlinkAsync(files.left_side[0].path) : ""
        files.right_side ? await unlinkAsync(files.right_side[0].path) : ""
        files.back_side ? await unlinkAsync(files.back_side[0].path) : ""
        files.driver_cabin ? await unlinkAsync(files.driver_cabin[0].path) : ""
        files.entire_inside ? await unlinkAsync(files.entire_inside[0].path) : ""
        return true;
    }