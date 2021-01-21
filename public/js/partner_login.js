$(document).ready(function(){
    console.log("Its comming here");
    const basicUrl = "http://localhost:3000";


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
                window.localStorage.setItem("partnerToken", result.token);
                window.location.href = basicUrl +'/partner-dashboard';
              },
            error:function(err){
                window.location.href = basicUrl +'/partner-login';
            }
        })
    })

})