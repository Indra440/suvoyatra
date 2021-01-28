$(document).ready(function(){

    $("#user_login").click(function(){
        const username = $("#username").val();
        console.log("username ",username);
        if($("#checkbox").prop('checked') != true){
            toastr.error("Please accept our Terms And conditions")
        }
    })
})