const basicUrl = "http://localhost:3000";
const userToken = localStorage.getItem("suvoYatrauserToken");
const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var userDetails = {};
if(!userToken || userToken == null || userToken == undefined){
    console.log("Its inside this");
    window.location.href = basicUrl +'/user-login';
}
$(document).ready(function(){
    console.log("Its loading");
    fetchUserDetails();

    $("#logout").click(function(){
        if (confirm('Are you sure you want to logout from this account ?')) {
            // Save it!
            localStorage.removeItem("partnerToken");
            window.location.href = basicUrl +'/user-login';
          } else {
            // Do nothing!
            return null;
          }
    })

    $("#saveUserDetails").click(function(){
        console.log("Its clicking here");
        console.log("userDetails ",userDetails);
        const data = {
            name : $("#name").val() ? $("#name").val() : "",
            email : $("#email").val() ? $("#email").val() : "",
            phone : $("#number").val() ? $("#number").val() : "",
            address : $("#address").val() ? $("#address").val() : "",
            zipCode : $("#zip").val() ? $("#zip").val() : "",
            city : $("#city").val() ? $("#city").val() : "",
        }
        console.log("data ",data);
        console.log(_.isEqual(userDetails, data));
        if(_.isEqual(userDetails, data)){
            return false;
        }
        $.ajax({
            url:basicUrl+'/userRouter/ ',
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", userToken);
            },
            data: data,
            dataType: "JSON",
            success: function(result){
                toastr.success('Data saved successfully');
                console.log("result ",result);
                if(result.status == true){
                    fetchUserDetails();
                }
            },
            error: function(response) {
                toastr.error('some error is comming');
                fetchUserDetails();
            }
        })
    })
})
function fetchUserDetails(){
    $.ajax({
        url:basicUrl+'/userRouter/',
        type: "POST",
        data: {'token': userToken},
        dataType: "JSON",
        success: function(result){
            console.log("result ",result);
            console.log("Successfully validate");
            const payload = result.payload;
            $("#name").val(payload.userName);
            $("#email").val(payload.userEmail);
            $("#username").val(payload.userEmail);
            $("#number").val(payload.user_Ph_Number);
            $("#address").val(payload.streetAddress);
            $("#zip").val(payload.zipCode);
            $("#city").val(payload.city);
            userDetails.name =  $("#name").val();
            userDetails.email = $("#email").val();
            userDetails.phone = $("#number").val();
            userDetails.address = $("#address").val();
            userDetails.zipCode = $("#zip").val();
            userDetails.city = $("#city").val();
            // console.log("partnerDetails ",partnerDetails);
        },
        error: function(response) {
            console.log("Its hitting here ",response);
            localStorage.removeItem("userToken");
            window.location.href = basicUrl +'/user-login';
        }
    })   
}