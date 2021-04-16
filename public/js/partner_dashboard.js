const basicUrl = window.location.origin; /*"http://localhost:3000";*/
const partnerToken = localStorage.getItem("suvoyatrausertoken");
const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var partnerDetails = {};
if(!partnerToken || partnerToken == null || partnerToken == undefined){
    console.log("Its inside this");
    window.location.href = basicUrl +'/partner-login';
}
$(document).ready(function(){
    console.log("Its loading");
    let queryValue = getUrlVars()["p"];

    if(queryValue && queryValue !=null && queryValue !=undefined && queryValue !=""){
        $("#helpMenu").addClass("hide");
        $("#logout").addClass("hide");
        $(".closePartnerAccount").removeClass("hide");
    }

    fetchPartnerDetails();
    $("#logout").click(function(){
        if (confirm('Are you sure you want to logout from this account ?')) {
            // Save it!
            localStorage.removeItem("suvoyatrausertoken");
            window.location.href = basicUrl +'/partner-login';
          } else {
            // Do nothing!
            return null;
          }
    })

    $(".closePartnerAccount").click(function(){
        localStorage.removeItem("suvoyatrausertoken");
        localStorage.removeItem("SCPADID");
        window.top.close();
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
                }
            },
            error: function(response) {
                toastr.error('some error is comming');
                // console.log("Response ",response);
                fetchPartnerDetails();
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

    $("#add-update-bus").click(function(){
        resetingAddBusForm();
    })

    $("#AddBus").click(async function(){
        console.log("Its clicking here");
        const getFormData = validateAndCreatedataForAddBusForm();
        console.log("getFormData ",getFormData);
        if(getFormData != false){
            toastr.info("Please wait!!! We are processing your BUS details ");
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
                if(result != false){
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

    $("#bus-List").click(async function(){
        if(!$(this).hasClass("clicked")){
            $(this).closest("li").addClass("clicked");
            console.log("Its comming here");
            try{
                await showBusList(1);
            }catch(e){
                console.log("Error in getting bus list ",e);
            } 
        }
    })



    // $('.moreless-button').click(function () {
    //     console.log("Its clicking here");
    //     // $('.moretext').toggle();
    //     // if ($('.moreless-button').text() == "Read More") {
    //     //     $(this).text("Read less")
    //     // } else {
    //     //     $(this).text("Read more")
    //     // }
    // });

    // $("a.edit_bus_details").click(async function(){
    //     console.log("Its hitting");
    // })

    $("#add-user").click( async function(){
        if(!$(this).hasClass("clicked")){
            $(this).closest("li").addClass("clicked");
            console.log("Its comming here");
            try{
                const result = await fetchBusList();
                console.log("result ",result);
                if(result != false){
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
                    await fetchUsersList();
                }
            }catch(e){
                console.log("Error in getting bus list ",e);
            } 
        }
    })

    $("#addDriver").click(async function(){
        const bus_id = $("#driver_busname_dropdown").val();
        const driver_name = $("#driver-name").val();
        const driver_number = $("#driver-number").val();
        if(!bus_id || bus_id == null || bus_id == undefined || bus_id == ""){
            return toastr.error("Please select a Bus");
        }
        if(!driver_name || driver_name == null || driver_name == undefined || driver_name == ""||
            !driver_number || driver_number == null || driver_number == undefined || driver_number == ""){
            return toastr.error("Please fill all required fields");
        }
        if(driver_number.length != 10){
            return toastr.error("Please enter a valid mobile no");
        }
        console.log("Its here ");
        let result = await addusertobus(bus_id,driver_name,driver_number,"driver")
        if(result.status == true){
            $("#driver_busname_dropdown").val("").click()
            $("#driver-name").val("");
            $("#driver-number").val("")
            toastr.success(result.message);
            return await fetchUsersList();
            
        }
    })

    $("#addConductor").click(async function(){
        const bus_id = $("#conductor_busname_dropdown").val();
        const conductor_name = $("#conductor-name").val();
        const conductor_number = $("#conductor-number").val();
        if(!bus_id || bus_id == null || bus_id == undefined || bus_id == ""){
            return toastr.error("Please select a Bus");
        }
        console.log("conductor_name ",conductor_name);
        console.log("conductor_number ",conductor_number);

        if(!conductor_name || conductor_name == null || conductor_name == undefined || conductor_name == ""||
            !conductor_number || conductor_number == null || conductor_number == undefined || conductor_number == ""){
            return toastr.error("Please fill all required fields");
        }
        if(conductor_number.length != 10){
            return toastr.error("Please enter a valid mobile no");
        }
        console.log("Its here ");
        let result = await addusertobus(bus_id,conductor_name,conductor_number,"conductor")
        if(result.status == true){
            $("#conductor_busname_dropdown").val("").click()
            $("#conductor-name").val("");
            $("#conductor-number").val("")
            toastr.success(result.message);
            return await fetchUsersList();
            
        }
    })



    $("#busname_dropdown").change(function(){
        console.log("Its hitting here");
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
                response.responseJSON.message ? toastr.error(response.responseJSON.message) : toastr.error("Something went wrong.Please try again"); 
            } 
        })
    })
    $("#help_submit").click(function(){
        console.log("Its clicking here");7
        const name = $("#help_name").val();
        const subject = $("#help_sub").val();
        const message = $("#help_comments").val();

        if(name == "" || name == null || name == undefined ||
        subject == "" || subject == null || subject == undefined || 
        message == "" || message == null || message == undefined
        ){
            toastr.error("Please fill all the fields with valid details");
            return;
        }
        const data = {
            name : name,
            subject : subject,
            message : message
        }
        console.log("Data ",data);
        $.ajax({
            url:basicUrl+'/busRouter/sendQuery',
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            data: data,
            dataType: "JSON",
            success: function(result){
                toastr.success('Message Sent successfully');
                // console.log("result ",result);
                $("#help_name").val("");
                $("#help_sub").val("");
                $("#help_comments").val("");
            },
            error: function(response) {
                response.responseJSON.message ? 
                                        toastr.error(response.responseJSON.message) :
                                         toastr.error("Something went wrong.Please try again"); 
                // toastr.error('some error is comming');
            }
        })
    });

})

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function moreLess(cur_button){
    $(cur_button).closest(".partner-bus-result").find(".moretext").toggle();
    if ($(cur_button).val() == "Read More") {
        $(cur_button).val("Read less");
    } else {
        $(cur_button).val("Read More");
    }
}

function validateAndCreatedataForAddBusForm(){
    var fd = new FormData();
        const busId = $("#busId").val();
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

        if(!busId || busId == null || busId == undefined || busId ==""){
            if(!front_side_photo || front_side_photo == null || front_side_photo == undefined||
                !left_side_photo || left_side_photo == null || left_side_photo == undefined ||
                !right_side_photo || right_side_photo == null || right_side_photo == undefined ||
                !back_side_photo || back_side_photo == null || back_side_photo == undefined ||
                !driver_cabin_photo || driver_cabin_photo == null || driver_cabin_photo == undefined ||
                !entire_inside_photo || entire_inside_photo == null || entire_inside_photo == undefined ){
                    toastr.error('Please fill all the fields with valid data');
                    return false;
                }
        }else{
            fd.append( 'bus_id',busId);
        }

        if( !busName || busName == "" ||
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
        // for (var pair of fd.entries()) {
        //     console.log(pair[0]+ ', ' + pair[1]); 
        // }
        return fd
}

function resetingAddBusForm(){
    $('input[type=text],input[type=file],textarea', '#addBusForm').each(function() {
        $(this).val("");
    });
    $('input[type=time]', '#addBusForm').each(function() {
        $(this).val('--:--');
    });
    $("#bus-num").prop('disabled', false);
    $('option:selected', 'select[name="Bus-Type"]').removeAttr('selected');
    $('select[name="Bus-Type"]').find('option[value=""]').attr("selected",true);
    $("#Bus-Type").closest('div').find('span').text("Select One")

    $('option:selected', 'select[name="AC-Type"]').removeAttr('selected');
    $('select[name="AC-Type"]').find('option[value=""]').attr("selected",true);
    $("#AC-Type").closest('div').find('span').text("Select One")

    $('option:selected', 'select[name="Mul-Type"]').removeAttr('selected');
    $('select[name="Mul-Type"]').find('option[value=""]').attr("selected",true);
    $("#Mul-Type").closest('div').find('span').text("Select One")

    $(".input_fields_wrap").children('div.f-row').remove();

    $("#front-Photo").attr("src","").addClass('hide');                    
    $("#left-Photo").attr("src","").addClass('hide');
    $("#right-Photo").attr("src","").addClass('hide');
    $("#back-Photo").attr("src","").addClass('hide');
    $("#driver-cabin-Photo").attr("src","").addClass('hide');
    $("#entire-inside-Photo").attr("src","").addClass('hide');

    $('input[type="file"]').css({"width":"100%","display":"block"});
    $('#AddBus').val("ADD BUS")

}

async function addusertobus(bus_id,driver_name,driver_number,scenario){
    let data = {
        busId : bus_id,
        name : driver_name,
        mobileNo : driver_number,
        scenario : scenario
    }
    return new Promise((resolve,reject) =>{
        $.ajax({
            url:basicUrl+'/busRouter/addUserToBus',
            type:'POST',
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            data: data,
            dataType:'JSON',
            success:function(result){
                if(result.status == true){
                    resolve(result);
                }
            },
            error :function (response){
                const responseJSon = response.responseJSON;
                toastr.error(responseJSon.message);
            } 
        })
    })
}

async function fetchBusList(page){
    console.log("Page is here ",page);
     fetchBusListUrl = basicUrl+'/busRouter/fetchBuslist';
    if(page != undefined){
        console.log("Its inside");
        fetchBusListUrl = fetchBusListUrl + '?page='+page;
    }
    console.log("fetchBusListUrl ",fetchBusListUrl);
    return new Promise((resolve,reject) =>{
        $.ajax({
            url:fetchBusListUrl,
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
 async function showBusList(page){
    try{
        const result = await fetchBusList(page);
        console.log("result ",result);
        if(result != false){
            let busList = "";
            if(result.payload && result.payload.length > 0){
                result.payload.map((cur_bus) =>{
                    busList += '<article class="result partner-bus-result">';
                    busList += '<div class="one-fourth heightfix" style="height: 201px;"><img src="'+cur_bus.busImages.front_side+'"alt=""></div>';

                    busList += '<div class="one-half heightfix" style="height: 201px;">';
                    busList += '<h3>'+cur_bus.busName +'  ('+ cur_bus.busRoadMap.journeyForm +'-'+ cur_bus.busRoadMap.journeyTo +') </h3>';
                    busList += '<ul><li><span class="icon icon-themeenergy_user-3"></span><a href="seat-booking/seat-arangment.html" class="bus-list-sear-check">Check Seat available</a></li>';
                    busList += '<li><span class="icon icon-themeenergy_travel-bag"></span><p>Departure Time: '+cur_bus.busTiming.departureTime+ (Number(cur_bus.busTiming.departureTime.split(":")[0]) < 12 ? ' AM' :' PM')+'</p></li>';
                    let timeDifference = diff(cur_bus.busTiming.departureTime,cur_bus.busTiming.arrivalTime).split(":");
                    let  finalTimeDiff = Number(timeDifference[0]) > 0 ? Number(timeDifference[0])+ "hrs " : " ";
                    finalTimeDiff = finalTimeDiff + (Number(timeDifference[1]) > 0 ? Number(timeDifference[1])+ "mins" : "");
                    console.log("Time difference ",timeDifference);
                    busList += '<li><span class="icon icon-themeenergy_clock"></span><p>Estimated Time: ' + finalTimeDiff + '</p></li></ul></div>';
                    
                    busList += '<div class="one-fourth heightfix" style="height: 201px;"><div class="partner-edit-tab">';
                    busList += '<input class="bus_id hide" value="'+ cur_bus._id +'" />';
                    busList += '<a href="#" class="btn grey small partner-edit" onclick=" return editSeat(`'+cur_bus._id +'`)">Edit Seat</a>';
                    busList += "<a href='#' class='btn grey small partner-edit' onclick='editBusDetails(`"+cur_bus._id +"`)'>Edit Bus Detail</a>";
                    busList += '<a href="#" class="btn grey small partner-edit">Track</a><input type="button" onclick="moreLess(this)" class="btn grey small partner-edit moreless-button" value ="Read More"/>';
                    busList += '</div></div>';
                    
                    busList += '<div class="full-width  moretext"><p class="p-bus-e-date">Entry Date :<span> 10.12.2020</span></p>';
                    busList += '<div class="extra-fetures">';
                    busList += '<a>'+cur_bus.busFeature.acType+'</a> |<a>'+cur_bus.busFeature.busType+'</a> |<a>'+cur_bus.busFeature.multimediaType+'</a></div>';
                    busList += '<p>'+cur_bus.busDescription+'</p>';

                    if(cur_bus.busRoadMap.viaRoot && cur_bus.busRoadMap.viaRoot.length > 0){
                        cur_bus.busRoadMap.viaRoot.map((cur_root,index) =>{
                            busList += '<p>Root '+(index+1)+':  <span>'+cur_root.rootName+'</span></p>';
                        })
                    }
                    busList += '<div class="uploded-bus-img">';
                    busList += '<img src="'+cur_bus.busImages.front_side+'"><img src="'+cur_bus.busImages.right_side+'"><img src="'+cur_bus.busImages.left_side+'"></div>';
                    
                    busList += '<div class="uploded-bus-img-2nd">';
                    busList += '<img src="'+cur_bus.busImages.driver_cabin+'"><img src="'+cur_bus.busImages.entire_inside+'"><img src="'+cur_bus.busImages.back_side+'"></div>'; 
                    busList += '</div></article>';
                })
            }
            let pages = Number(result.totalPages);
            let current = Number(result.currentPage);
            let paginationDetails = "";
            if (pages > 0) {
                paginationDetails +='<ul class="pagination text-center" style="margin : 20px 20px;">';   
                if (current == 1) { 
                    paginationDetails += '<li class="disabled"><a>First</a></li>';
                } else { 
                    paginationDetails += '<li><a href="javascript:showBusList(1)">First</a></li>';
                } 
                var i = (Number(current) > 3 ? Number(current) - 2 : 1) 
                if (i !== 1) { 
                    paginationDetails += '<li class="disabled"><a>...</a></li>';
                } 
                for (; i <= (Number(current) + 4) && i <= pages; i++) { 
                    if (i == current) { 
                        paginationDetails += '<li class="active"><a>'+i+'</a></li>';
                    } else { 
                        paginationDetails += '<li><a href="javascript:showBusList('+i+')">'+ i +'</a></li>';
                    } 
                    if (i == Number(current) + 4 && i < pages) { 
                        paginationDetails += '<li class="disabled"><a>...</a></li>';
                    }
                } 
                if (current == pages) { 
                    paginationDetails += '<li class="disabled"><a>Last</a></li>';
                } else { 
                    paginationDetails += '<li><a href="javascript:showBusList('+pages+')">Last</a></li>';
                } 
                paginationDetails += '</ul>';
            }  
            $(".partner-bus-list").html(busList);
            $("#pagination").html(paginationDetails);
        }
    }catch(err){
        console.log("Error in getting bus list ",err);
    }
 }

 async function editSeat(self){
    $("#seat-arrangement a").trigger("click");
    let bus_name = $('select[name="busname_dropdown"]').find('option[value='+self+']').text();
    console.log($("#busname_dropdown").closest('div').find('span'));
    $("#busname_dropdown").closest('div').find('span').text(bus_name);
    $('#busname_dropdown').val(self).trigger('change');
}

 async function editBusDetails(self){
     try{
        let busId = String(self)
        if(!busId || busId == null || busId == undefined || busId == ""){
            toastr.error("Something went wrong please try again");
        }
        return new Promise((resolve,reject) =>{
           $.ajax({
               url:basicUrl+'/busRouter/fetchBusDetails',
               type: "POST",
               beforeSend: function(request) {
                   request.setRequestHeader("authorizationToken", partnerToken);
               },
               data: {busId : String(self)},
               success: function(result){
                   console.log("result ",result);
                   if(result.status == true){
                       let busDetails = result.payload;
                       $("#add-update-bus a").trigger("click");
                       
                       $("#busId").val(busDetails._id);
                       $("#busname").val(busDetails.busName);
                       $("#bus-num").val(busDetails.busNumber);
                       $("#bus-num").prop('disabled', true);
                       $("#journey-from").val(busDetails.busRoadMap.journeyForm);
                       $("#journey-to").val(busDetails.busRoadMap.journeyTo);
                       $("#Departure-time").val(busDetails.busTiming.departureTime);
                       $("#Arrival-Time").val(busDetails.busTiming.arrivalTime);

                       let viaRoot = busDetails.busRoadMap.viaRoot;
                       if(viaRoot && viaRoot.length > 0){
                           let extraField = viaRoot.length -2;
                           if(extraField > 0){
                               for(let i=extraField ; i>0; i=i-2){
                                   $(".add_field_button").trigger("click")
                               }
                           }
                            $(".viaroot_input").each(function(index){
                                if($(this).children('input').val() ==""){
                                    if(viaRoot[index]){
                                        $(this).children('input').val(viaRoot[index].rootName) 
                                    }
                                }
                            })
                       }
                       $("#seat-no").val(busDetails.busFeature.noOfSeat);

                       $('option:selected', 'select[name="Bus-Type"]').removeAttr('selected');
                       $('select[name="Bus-Type"]').find('option[value='+busDetails.busFeature.busType+']').attr("selected",true);
                       $("#Bus-Type").closest('div').find('span').text(busDetails.busFeature.busType)

                       $('option:selected', 'select[name="AC-Type"]').removeAttr('selected');
                    //    $('select[name="AC-Type"]').find('option[value='+busDetails.busFeature.acType+']').attr("selected",true);
                       $("#AC-Type").closest('div').find('span').text(busDetails.busFeature.acType)

                       $('option:selected', 'select[name="Mul-Type"]').removeAttr('selected');
                    //    $('select[name="Mul-Type"]').find('option[value='+busDetails.busFeature.multimediaType+']').attr("selected",true);
                       $("#Mul-Type").closest('div').find('span').text(busDetails.busFeature.multimediaType)

                       $('input[type="file"]').css({"width":"62%","display":"inline-block"});

                       $("#front-Photo").attr("src",busDetails.busImages.front_side).removeClass('hide');                    
                       $("#left-Photo").attr("src",busDetails.busImages.left_side).removeClass('hide');
                       $("#right-Photo").attr("src",busDetails.busImages.right_side).removeClass('hide');
                       $("#back-Photo").attr("src",busDetails.busImages.back_side).removeClass('hide');
                       $("#driver-cabin-Photo").attr("src",busDetails.busImages.driver_cabin).removeClass('hide');
                       $("#entire-inside-Photo").attr("src",busDetails.busImages.entire_inside).removeClass('hide');

                       $("#comments").val(busDetails.busDescription);

                       $("#AddBus").val("UPDATE BUS");
                   }
               },
               error: function(response) {
                   const responseJSon = response.responseJSON;
                   toastr.error(responseJSon.message);
                   console.log("Response ",response);
               }
           })
       })
     }catch(e){
        toastr.error(e.message);
     }
 }

async function addBus(formData){
    console.log("Form data is here ",formData);
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
            success: function(result){
                console.log("result ",result);
                if(result.status == true){
                    toastr.success(result.message);
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
            $("#name").val(payload.name);
            $("#help_name").val(payload.name);
            $("#email").val(payload.email);
            $("#username").val(payload.email);
            $("#password1").val("");
            $("#number").val(payload.ph_no);
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

function diff(start, end) {
    start = start.split(":");
    end = end.split(":");
    var startDate = new Date(0, 0, 0, start[0], start[1], 0);
    var endDate = new Date(0, 0, 0, end[0], end[1], 0);
    var diff = endDate.getTime() - startDate.getTime();
    var hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    var minutes = Math.floor(diff / 1000 / 60);

    // If using time pickers with 24 hours format, add the below line get exact hours
    if (hours < 0)
       hours = hours + 24;

    return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
}


const convertTime12to24 = time12h => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  };

  function reformatDate(date){
    //   console.log("Date ",date);
    let finalDatewithTime = date.replace(/T/, ' ').replace(/\..+/, '');
    let finalDate = finalDatewithTime.split(" ")[0];
    return finalDate;
}


async function fetchUsersList(){
    return new Promise((resolve,reject) =>{
        $.ajax({
            url:basicUrl+'/busRouter/fetchUsersList',
            type: "GET",
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", partnerToken);
            },
            dataType: "JSON",
            success: function(result){
                if(result.status == true){
                    if(result.payload.length > 0){
                        let userList = "";
                        extensionwiseUserList = result.payload;
                        extensionwiseUserList.map((cur_bus) =>{
                            const drivers = cur_bus.drivers;
                            if(drivers.length > 0){
                                drivers.map((cur_driver) =>{
                                    userList += '<tr role="row" class="odd bl-table-data">';
                                    userList += '<td class="sorting_1">'+cur_bus.busName+'</td>';
                                    userList += '<td class="sorting_1">'+cur_driver.name+'</td>';
                                    userList += '<td class="sorting_1">Driver</td>';
                                    userList += '<td class="sorting_1">'+reformatDate(cur_driver.assignDate)+'</td>';
                                    cur_driver.is_active == true ? 
                                    userList += '<td class="sorting_1">Active</td>':
                                    userList += '<td class="sorting_1">Inactive</td>'
                                }) 
                            }
                            const conductors = cur_bus.conductors;
                            if(conductors.length > 0){
                                conductors.map((cur_conductor) =>{
                                    userList += '<tr role="row" class="odd bl-table-data">';
                                    userList += '<td class="sorting_1">'+cur_bus.busName+'</td>';
                                    userList += '<td class="sorting_1">'+cur_conductor.name+'</td>';
                                    userList += '<td class="sorting_1">Conductor</td>';
                                    userList += '<td class="sorting_1">'+reformatDate(cur_conductor.assignDate)+'</td>';
                                    cur_conductor.is_active == true ? 
                                    userList += '<td class="sorting_1">Active</td>':
                                    userList += '<td class="sorting_1">Inactive</td>'
                                })
                            }
                        })
                        $("#example-body").html(userList);
                    }else{
                        $("#example-body").html('<h2>NO Users to Show</h2>');
                    }
                }
            },
            error: function(response) {
                const responseJSon = response.responseJSON;
            }
        }) 
    })
}