
const basicUrl = "http://localhost:3000";
const partnerToken = localStorage.getItem("partnerToken");
const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var partnerDetails = {};
if(!partnerToken || partnerToken == null || partnerToken == undefined){
    console.log("Its inside this");
    window.location.href = basicUrl +'/partner-login';
}
$(document).ready(function(){
    console.log("Its loading");
    fetchPartnerDetails();

    $("#logout").click(function(){
        if (confirm('Are you sure you want to logout from this account ?')) {
            // Save it!
            localStorage.removeItem("partnerToken");
            window.location.href = basicUrl +'/partner-login';
          } else {
            // Do nothing!
            return null;
          }
    })

    $("#savePartnerDetails").click(function(){
        console.log("Its clicking here");
        console.log("partnerDetails ",partnerDetails);
        const data = {
            name: $("#name").val() ? $("#name").val() : "",
            email : $("#email").val() ? $("#email").val() : "",
            phone : $("#number").val() ? $("#number").val() : "",
            address : $("#address").val() ? $("#address").val() : "",
            zipCode : $("#zip").val() ? $("#zip").val() : "",
            city : $("#city").val() ? $("#city").val() : "",
        }
        console.log("data ",data);
        console.log(_.isEqual(partnerDetails, data));
        if(_.isEqual(partnerDetails, data)){
            return false;
        }
        $.ajax({
            url:basicUrl+'/partnerRouter/save-partner-details',
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            data: data,
            dataType: "JSON",
            success: function(result){
                toastr.success('Data saved successfully');
                console.log("result ",result);
                if(result.status == true){
                    fetchPartnerDetails();
                    // let curpartnerDetails = result.payload;
                    // $("#name").val(curpartnerDetails.partnerName);
                    // $("#email").val(curpartnerDetails.partenrEmail);
                    // $("#username").val(curpartnerDetails.partenrEmail);
                    // $("#number").val(curpartnerDetails.partner_Ph_Number);
                    // $("#address").val(curpartnerDetails.streetAddress);
                    // $("#zip").val(curpartnerDetails.zipCode);
                    // $("#city").val(curpartnerDetails.city);
                }
            },
            error: function(response) {
                toastr.error('some error is comming');
                // console.log("Response ",response);
                fetchPartnerDetails();
                // $("#name").val(partnerDetails.name);
                // $("#email").val(partnerDetails.email);
                // $("#number").val(partnerDetails.phone);
                // $("#address").val(partnerDetails.address);
                // $("#zip").val(partnerDetails.zipCode);
                // $("#city").val(partnerDetails.city);
            }
        })
    })

    $("#passwordChange").click(function(){
        let payload ={
          username : $("#username").val(),
          currentPassword : $("#password1").val(),
          newPassword : $("#password2").val(),
          confirmPassword : $("#password3").val()
        }
        if(payload.username == "" || payload.currentPassword == "" || 
            payload.newPassword == "" || payload.confirmPassword == ""){
            toastr.error("Please fill all the fields");
            return false;
        }
        if(!(emailRegexp.test(payload.username))){
            // console.log("Please enter a valid username");
            toastr.error('Please enter a valid username');
            return false;
        }
        if(payload.newPassword != payload.confirmPassword){
            toastr.error("New and confirm Password didn't matched");
            return false;
        }

        $.ajax({
            url:basicUrl+'/partnerRouter/change-password',
            type:'POST',
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            data:payload,
            dataType:'JSON',
            success:function(result){
                if(result.status == true){
                    toastr.success('Password changed successfully');
                    $("#password1").val("");
                    $("#password2").val("");
                    $("#password3").val("");
                }
            },
            error :function (response){
                console.log("response ",response);
                toastr.error(response.message);
                $("#password1").val("");
                $("#password2").val("");
                $("#password3").val("");
            } 
        })
    })
    
})

function fetchPartnerDetails(){
    $.ajax({
        url:basicUrl+'/partnerRouter/check-partner-status',
        type: "POST",
        data: {'token':partnerToken},
        dataType: "JSON",
        success: function(result){
            console.log("result ",result);
            console.log("Successfully validate");
            const payload = result.payload;
            $("#name").val(payload.partnerName);
            $("#email").val(payload.partenrEmail);
            $("#username").val(payload.partenrEmail);
            $("#password1").val("");
            $("#number").val(payload.partner_Ph_Number);
            $("#address").val(payload.streetAddress);
            $("#zip").val(payload.zipCode);
            $("#city").val(payload.city);
            partnerDetails.name =  $("#name").val();
            partnerDetails.email = $("#email").val();
            partnerDetails.phone = $("#number").val();
            partnerDetails.address = $("#address").val();
            partnerDetails.zipCode = $("#zip").val();
            partnerDetails.city = $("#city").val();
            // console.log("partnerDetails ",partnerDetails);
        },
        error: function(response) {
            console.log("Its hitting here ",response);
            localStorage.removeItem("partnerToken");
            window.location.href = basicUrl +'/partner-login';
        }
    })   
}