const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);


    module.exports.remove_all_files_for_extension = async (files)=>{
        files.small_icon ? await unlinkAsync(files.small_icon[0].path) : ""
        files.medium_icon ? await unlinkAsync(files.medium_icon[0].path) : ""
        files.large_icon ? await unlinkAsync(files.large_icon[0].path) : ""
        files.primary_logo ? await unlinkAsync(files.primary_logo[0].path) : ""
        return true;
    }