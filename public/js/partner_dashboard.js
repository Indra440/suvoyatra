
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
            name : $("#name").val() ? $("#name").val() : "",
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


    $("#AddBus").click(function(){
        console.log("Its clicking here");
        var fd = new FormData();
        fd.append( 'front_side',$("#Upload-front-Photo")[0].files[0]);
        fd.append( 'left_side',$("#Upload-left-Photo")[0].files[0]);
        fd.append( 'right_side',$("#Upload-right-Photo")[0].files[0]);
        fd.append( 'back_side',$("#Upload-back-Photo")[0].files[0]);
        fd.append( 'driver_cabin',$("#Upload-cabin-Photo")[0].files[0]);
        fd.append( 'entire_inside',$("#Upload-Inside-Photo")[0].files[0]);
        fd.append( 'busName', $("#busname").val());
        fd.append( 'busnumber', $("#bus-num").val());
        fd.append( 'journeyForm', $("#journey-from").val());
        fd.append( 'journeyTo', $("#journey-to").val());
        fd.append( 'departureTime', $("#Departure-time").val());
        fd.append( 'rrivalTime', $("#Arrival-Time").val());
        fd.append( 'viaRoot1', $("#via-root-1").val());
        fd.append( 'viaRoot2', $("#via-root-2").val());
        fd.append( 'noOfSeat', $("#seat-no").val());
        fd.append( 'busType', $("#Bus-Type").val());
        fd.append( 'acType', $("#AC-Type").val());
        fd.append( 'multimediaType', $("#Mul-Type").val());
        fd.append( 'busDescription', $("#comments").val());
        // Display the key/value pairs
        for (var pair of fd.entries()) {
            console.log(pair[0]+ ', ' + pair[1]); 
        }
        // const formdata = {
        //     busName : $("#busname val() ? $("#busname").val() : "",
        //     busnumber : $("#bus-num").val() ? $("#bus-num").val() : "",
        //     journeyForm : $("#journey-from").val() ? $("#journey-from").val() : "",
        //     journeyTo : $("#journey-to").val() ? $("#journey-to").val() : "",
        //     departureTime : $("#Departure-time").val() ? $("#Departure-time").val() : "",
        //     arrivalTime : $("#Arrival-Time").val() ? $("#Arrival-Time").val() : "",
        //     viaRoot1 : $("#via-root-1").val() ? $("#via-root-1").val() : "",
        //     viaRoot2 : $("#via-root-2").val() ? $("#via-root-2").val() : "",
        //     noOfSeat : $("#seat-no").val() ? $("#seat-no").val() : "",
        //     busType : $("#Bus-Type").val() ? $("#Bus-Type").val() : "",
        //     acType : $("#AC-Type").val() ? $("#AC-Type").val() : "",
        //     multimediaType : $("#Mul-Type").val() ? $("#Mul-Type").val() : "",
        //     front_side : $("#Upload-front-Photo").prop('files'),
        //     left_side : $('#Upload-left-Photo').prop('files'),
        //     right_side : $("#Upload-right-Photo").prop('files'),
        //     back_side : $("#Upload-back-Photo").prop('files'),
        //     driver_cabin: $("#Upload-cabin-Photo").prop('files'),
        //     entire_inside : $("#Upload-Inside-Photo").prop('files'),
        //     busDescription : $("#comments").val() ? $("#comments").val() : "",

        // }
        // console.log("data ", formdata);
        $.ajax({
             url:basicUrl+'/busRouter/addBus',
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(result){
                console.log("result ",result);
                if(result.status == true){
                    toastr.success('Data saved successfully');
                }
            },
            error: function(response) {
                toastr.error('some error is comming');
                console.log("Response ",response);
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