$(document).ready(function(){
    console.log("Its comming here");
    const basicUrl = window.location.origin; /*"http://localhost:3000";*/


    $("#login").click(function(){
        console.log("Its clicked");
        let data = {
            username : $("#username").val(),
            password : $("#password").val()
        }
        $.ajax({
            url: basicUrl + "/partnerRouter/partner-login",
            type: "POST",
            data: data,
            dataType: "JSON",
            success: function(result){
                window.localStorage.setItem("suvoyatrausertoken", result.token);
                window.location.href = basicUrl +'/partner-dashboard';
              },
            error:function(response){
                // console.log("Error ",err);
                response.responseJSON.message ? toastr.error(response.responseJSON.message) : toastr.error("Something went wrong please try again"); 
                // window.location.href = basicUrl +'/partner-login';
            }
        })
    })

})