
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

    $("#AddBus").click(async function(){
        console.log("Its clicking here");
        const getFormData = validateAndCreatedataForAddBusForm();
        console.log("getFormData ",getFormData);
        if(getFormData != false){
            toastr.info("Please wait!!! We are adding your BUS ");
            await addBus(getFormData);
        }
    })

    $("#seat-arrangement").click(async function(){
        console.log("Its hitting here");
        if(!$(this).hasClass("clicked")){
            $(this).closest("li").addClass("clicked");
            try{
                const result = await fetchBusList();
                console.log("result ",result);
                if(fetchBusList != false){
                    console.log("Result is here");
                    // console.log("result ",result);
                    let busList = '<option selected disabled value="">Select One</option>';
                    if(result.payload && result.payload.length > 0){
                        result.payload.map((cur_bus)=>{
                            busList += '<option value="'+ cur_bus._id +'">'+cur_bus.busName+'</option>';
                        })
                    }
                    // console.log("Bus list is here ",busList);
                    $("#busname_dropdown").html(busList);
                    $("#busname_dropdown").val("").click();
                    $('#template_dropdown').val("").click();
                    $(".template-box").hide();
                }
            }catch(e){
                console.log("Error in getting bus list ",e);
            } 
        }
    })

    $("#add-user").click( async function(){
        if(!$(this).hasClass("clicked")){
            $(this).closest("li").addClass("clicked");
            console.log("Its comming here");
            try{
                const result = await fetchBusList();
                console.log("result ",result);
                if(fetchBusList != false){
                    console.log("Result is here");
                    // console.log("result ",result);
                    let busList = '<option selected disabled value="">Select One</option>';
                    if(result.payload && result.payload.length > 0){
                        result.payload.map((cur_bus)=>{
                            busList += '<option value="'+ cur_bus._id +'">'+cur_bus.busName+'</option>';
                        })
                    }
                    // console.log("Bus list is here ",busList);
                    $("#conductor_busname_dropdown").html(busList);
                    $("#conductor_busname_dropdown").val("").click();
                    $("#driver_busname_dropdown").html(busList);
                    $("#driver_busname_dropdown").val("").click();
                }
            }catch(e){
                console.log("Error in getting bus list ",e);
            } 
        }
    })

    $("#busname_dropdown").change(function(){
        console.log("Its hitting here");
        console.log("Bus id ",);
        if($(this).val() == ""||$(this).val() == undefined){
            toastr.error("Please select a valid Bus");
            return;
        }
        const data ={
            busId :$(this).val() 
        }  
        $.ajax({
            url:basicUrl+'/busRouter/fetchseatTemplateForBus',
            type:'POST',
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            data:data,
            dataType:'JSON',
            success:function(result){
                if(result.status == true){
                    console.log("Result is here");
                    let template = result.payload.template;
                    if(template && template !=""){
                        $("#template_dropdown").val(String(template)).click();
                        $(".template-box").not("." + template).hide();
                        $("." + template).show();
                    }else{
                        $(".template-box").hide();
                    }
                }
            },
            error :function (response){
                console.log("response ",response.responseJSON);   
                response.responseJSON.message ? toastr.error(response.responseJSON.message) : toastr.error("Something went wrong while fetching the bus list"); 
            } 
        })
    })

    $("#saveTemplate").click(function(){
        console.log("its clicking here");
        const busId = $("#busname_dropdown").val();
        const template = $("#template_dropdown").val();
        console.log("template ",typeof(template));
        if(!busId || busId == ""){
            toastr.error("Please selct a Bus from Buslist");
            return;
        }
        if(!template || template == ""){
            toastr.error("Please selct a seat template");
            return;
        }
        if($.trim(template) !="Template1" && $.trim(template) != "Template2"){
            console.log("Its hitting")
            console.log("template",template);
            toastr.error("Please select a valid tepmlate");
            return;
        }
        const data = {
            busId : $("#busname_dropdown").val(),
            updateTemplate : $("#template_dropdown").val()
        }
        $.ajax({
            url:basicUrl+'/busRouter/updateSeatTemplate',
            type:'POST',
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            data:data,
            dataType:'JSON',
            success:function(result){
                if(result.status == true){
                    toastr.success(result.message);
                }
            },
            error :function (response){
                console.log("response ",response.responseJSON);   
                response.responseJSON.message ? toastr.error(response.responseJSON.message) : toastr.error("Something went wrong while fetching the bus list"); 
            } 
        })
    })

})

function validateAndCreatedataForAddBusForm(){
    var fd = new FormData();
        const front_side_photo = $("#Upload-front-Photo")[0].files[0];
        const left_side_photo = $("#Upload-left-Photo")[0].files[0];
        const right_side_photo = $("#Upload-right-Photo")[0].files[0];
        const back_side_photo = $("#Upload-back-Photo")[0].files[0];
        const driver_cabin_photo = $("#Upload-cabin-Photo")[0].files[0];
        const entire_inside_photo = $("#Upload-Inside-Photo")[0].files[0];
        const busName = $("#busname").val();
        const busnumber = $("#bus-num").val();
        const journeyForm = $("#journey-from").val();
        const journeyTo = $("#journey-to").val();
        const departureTime = $("#Departure-time").val();
        const arrivalTime = $("#Arrival-Time").val();
        const noOfSeat = $("#seat-no").val();
        const busType = $("#Bus-Type").val();
        const acType = $("#AC-Type").val();
        const multimediaType = $("#Mul-Type").val();
        const busDescription = $("#comments").val();

        if(!front_side_photo || front_side_photo == null || front_side_photo == undefined||
            !left_side_photo || left_side_photo == null || left_side_photo == undefined ||
            !right_side_photo || right_side_photo == null || right_side_photo == undefined ||
            !back_side_photo || back_side_photo == null || back_side_photo == undefined ||
            !driver_cabin_photo || driver_cabin_photo == null || driver_cabin_photo == undefined ||
            !entire_inside_photo || entire_inside_photo == null || entire_inside_photo == undefined ||
            !busName || busName == "" ||
            !busnumber || busnumber == "" ||
            !journeyForm || journeyForm == ""||
            !journeyTo || journeyTo == "" ||
            !departureTime || departureTime == ""||
            !arrivalTime || arrivalTime == ""||
            !noOfSeat || noOfSeat == ""||
            !busType || busType == ""||
            !acType || acType == ""||
            !multimediaType || multimediaType == ""||
            !busDescription || busDescription == ""
            ){
                toastr.error('Please fill all the fields with valid data');
                return false;
            }

        fd.append( 'front_side',front_side_photo);
        fd.append( 'left_side',left_side_photo);
        fd.append( 'right_side',right_side_photo);
        fd.append( 'back_side',back_side_photo);
        fd.append( 'driver_cabin',driver_cabin_photo);
        fd.append( 'entire_inside',entire_inside_photo);
            
        fd.append( 'busName', busName);
        fd.append( 'busnumber', busnumber);
        fd.append( 'journeyForm', journeyForm);
        fd.append( 'journeyTo', journeyTo);
        fd.append( 'departureTime', departureTime);
        fd.append( 'arrivalTime', arrivalTime);
        let viaroot = [];
        $(".viaroot_input").each(function(){
            if($(this).children('input').val() !=""){
                viaroot.push({"rootName":$(this).children('input').val()}) 
            }
        })
        console.log("viaroot first ",viaroot);
        fd.append( 'viaRoot', JSON.stringify(viaroot));
        fd.append( 'noOfSeat', noOfSeat);
        fd.append( 'busType', busType);
        fd.append( 'acType', acType);
        fd.append( 'multimediaType', multimediaType);
        fd.append( 'busDescription', busDescription);

        // Display the key/value pairs
        for (var pair of fd.entries()) {
            console.log(pair[0]+ ', ' + pair[1]); 
        }
        return fd
}

function resetingAddBusForm(){
    $('input[type=text],input[type=file],textarea', '#addBusForm').each(function() {
        $(this).val("");
    })
    $('input[type=time]', '#addBusForm').each(function() {
        $(this).val('--:--');
    })
}

async function fetchBusList(){
    return new Promise((resolve,reject) =>{
        $.ajax({
            url:basicUrl+'/busRouter/fetchBuslist',
            type:'GET',
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            dataType:'JSON',
            success:function(result){
                if(result.status == true){
                    resolve(result);
                }
            },
            error :function (response){
                console.log("response ",response);
                toastr.error("Something went wrong while fetching the bus list");
                reject(false);
            } 
        })
    })
}
async function addBus(formData){
    return new Promise((resolve,reject) =>{
        $.ajax({
            url:basicUrl+'/busRouter/addBus',
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(result){
                console.log("result ",result);
                if(result.status == true){
                    toastr.success('Bus added successfully');
                    resetingAddBusForm();
                }
            },
            error: function(response) {
                const responseJSon = response.responseJSON;
                // console.log("Response ",responseJSon);
                toastr.error(responseJSon.message);
                console.log("Response ",response);
            }
        })
    })
}

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