const basicUrl = window.location.origin; /*"http://localhost:3000";*/

$(document).ready(function(){

    $("#user_login").click(function(){
        const username = $("#username").val();
        console.log("username ",username);
        if($("#checkbox").prop('checked') != true){
            toastr.error("Please accept our Terms And conditions");
            return;
        }
        toastr.info("Please wait for sometime we are processing your data.");
        $.ajax({
            url:basicUrl+'/users/user-login',
            type:'POST',
            data:{username:username},
            dataType:'JSON',
            success:function(result){
                if(result.status == true){
                    toastr.info(result.message);
                    if(result.payload && result.payload.id){
                        const finalUrl = basicUrl + "/user-otp-submit/"+ result.payload.id;
                        setTimeout(function(){
                             window.location.href = finalUrl;
                            }, 3000)
                    }else{
                        toastr.error("User id not found");
                    }
                }
            },
            error :function (response){
                const responseJSON = response.responseJSON;
                toastr.error(responseJSON.message);
                console.log("response ",response);
            } 
        })
    })
})