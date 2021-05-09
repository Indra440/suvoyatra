const basicUrl = window.location.origin; /*"http://localhost:3000";*/
const busUserToken = localStorage.getItem("suvoyatrausertoken");
const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var bususerDetails = {};
var currentLocation = {};
const positionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0
}

if(!busUserToken || busUserToken == null || busUserToken == undefined){
    console.log("Its inside this");
    // window.location.href = basicUrl +'/partner-login';
}


$(document).ready(function(){
    console.log("Its loading");

    fetchbususerDetails();

    
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
            console.log("pos ",pos);
            console.log("Positions ",pos.coords);
            var crd = pos.coords;
            currentLocation.lat = crd.latitude;
            currentLocation.long = crd.longitude;
        },err =>{
            toastr.info("Not able to fetch your location.Please allow location");
            console.error("error in getting location ",err);
        },positionOptions)
    }

    const socket = io();

    socket.on('connect',function(){
        console.log("Connected to server");
    })

    setInterval(() => {
        console.log("It's hitting");
        navigator.geolocation.getCurrentPosition(pos=>{
            var crd = pos.coords;
            if(currentLocation.lat != crd.latitude || currentLocation.lang != crd.longitude){
                currentLocation.lat = crd.latitude;
                currentLocation.long = crd.longitude;
                socket.emit('updateLocation',{token:busUserToken,pos:currentLocation})
            }
        },err =>{
            toastr.info("Not able to fetch your location.Please allow location");
            console.error("error in getting location ",err);
        },positionOptions)

    }, 3000);



    // fetchUsersList();
    $("#logout").click(function(){
        if (confirm('Are you sure you want to logout from this account ?')) {
            // Save it!
            localStorage.removeItem("suvoyatrausertoken");
            window.location.href = basicUrl +'/users-login';
          } else {
            // Do nothing!
            return null;
          }
    })

    $("#savebususerDetails").click(function(){
        console.log("Its clicking here");
        console.log("bususerDetails ",bususerDetails);
        const data = {
            name : $("#name").val() ? $("#name").val() : "",
            email : $("#email").val() ? $("#email").val() : "",
            mobile : $("#number").val() ? $("#number").val() : "",
            address : $("#address").val() ? $("#address").val() : "",
            zipCode : $("#zip").val() ? $("#zip").val() : "",
            city : $("#city").val() ? $("#city").val() : "",
        }
        console.log(_.isEqual(bususerDetails, data));
        if(_.isEqual(bususerDetails, data)){
            return false;
        }
        console.log("data ",data);
        $.ajax({
            url:basicUrl+'/bususer/save-bususer-details',
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", busUserToken);
            },
            data: data,
            dataType: "JSON",
            success: function(result){
                toastr.success('Data saved successfully');
                console.log("result ",result);
                if(result.status == true){
                    fetchbususerDetails();
                }
            },
            error: function(response) {
                toastr.error('some error is comming');
                console.log("Response ",response);
                fetchbususerDetails();
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
        // if(!(emailRegexp.test(payload.username))){
        //     // console.log("Please enter a valid username");
        //     toastr.error('Please enter a valid username');
        //     return false;
        // }
        if(payload.newPassword != payload.confirmPassword){
            toastr.error("New and confirm Password didn't matched");
            return false;
        }

        $.ajax({
            url:basicUrl+'/bususer/change-password',
            type:'POST',
            beforeSend: function(request) {
                request.setRequestHeader("authorizationToken", busUserToken);
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

    $("#booking-list").click(async function(){
        // var todayDate = new Date();
        // var day = ("0" + todayDate.getDate()).slice(-2);
        // var month = ("0" + (todayDate.getMonth() + 1)).slice(-2);
        // var todaysetDate = todayDate.getFullYear()+"-"+(month)+"-"+(day) ;
        // $("#end_date").val(todaysetDate);
        // let pastDay = ("0" + (todayDate.getDate()-7)).slice(-2);
        // let pastMonth = ("0" + (todayDate.getMonth() + 1)).slice(-2);
        // let pastsetDate = todayDate.getFullYear()+"-"+(pastMonth)+"-"+(pastDay) ;
        // $("#start_date").val(pastsetDate);
        try{
            $.ajax({
                url:basicUrl+'/bususer/fetch-booking-list',
                type:'GET',
                beforeSend: function(request) {
                    request.setRequestHeader("authorizationToken", busUserToken);
                },
                dataType:'JSON',
                success:function(result){
                    console.log("Result ",result);
                    if(result.status == true){
                        let bookingList = "";
                        if(result.payload && result.payload.length > 0){
                            result.payload.map((cur_booking)=>{
                                bookingList += "<tr>";
                                bookingList += "<td>"+cur_booking._id+"</td>";
                                bookingList += "<td>"+cur_booking.ticketNo+"</td>";
                                bookingList += "<td>"+cur_booking.pickupLocation+"</td>";
                                bookingList += "<td>"+cur_booking.dropLocation+"</td>";
                                bookingList += "<td>"+cur_booking.bookingAmmount+"</td>";
                                let seats = "";
                                cur_booking.bookingSeat.map(cur_seat =>{
                                    seats += cur_seat.seatNo + " "
                                })
                                bookingList += "<td>"+seats+"</td>";
                                let passanger = "";
                                cur_booking.passengersDetails.map(cur_passenger =>{
                                    passanger += cur_passenger.passengerName + "("+cur_passenger.passengerAge+ ")"+"\n";
                                })
                                bookingList += "<td>"+passanger+"</td>";
                                bookingList += "</tr>";
                            });
                        }else{
                            bookingList += "<tr><td colspan='7' style='text-align:center'><h4> No Booking Found </h4></td></tr>"
                        }
                        console.log("bookingList ",bookingList);
                        $("#today-booking-list").html(bookingList);
                    }
                },
                error :function (response){
                    console.log("response ",response);
                } 
            })
        }catch(e){
            console.log("Error in getting bus list ",e);
        }
    })

    $("#start_date").change( async function(){
        await filterBookingHistory();
    })

    $("#end_date").change(async function(){
        await filterBookingHistory();
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

 function reformatDateTime(date){
    //   console.log("Date ",date);
    let finalDatewithTime = date.replace(/T/, ' ').replace(/\..+/, '');
    // let finalDate = finalDatewithTime.split(" ")[0];
    return finalDatewithTime;
}


function fetchbususerDetails(){
    $.ajax({
        url:basicUrl+'/bususer/check-bususer-status',
        type: "POST",
        data: {'token':busUserToken},
        dataType: "JSON",
        success: function(result){
            console.log("result ",result);
            console.log("Successfully validate");
            const payload = result.payload;
            $("#name").val(payload.name);
            $("#email").val(payload.email);
            $("#username").val(payload.mobile);
            $("#password1").val("");
            $("#number").val(payload.mobile);
            $("#address").val(payload.streetAddress);
            $("#zip").val(payload.zipCode);
            $("#city").val(payload.city);
            $(".account-type").html(result.flag);
            bususerDetails.name =  $("#name").val();
            bususerDetails.email = $("#email").val();
            bususerDetails.mobile = $("#number").val();
            bususerDetails.address = $("#address").val();
            bususerDetails.zipCode = $("#zip").val();
            bususerDetails.city = $("#city").val();
            // console.log("bususerDetails ",bususerDetails);
        },
        error: function(response) {
            console.log("Its hitting here ",response);
            localStorage.removeItem("suvoyatrausertoken");
            window.location.href = basicUrl +'/users-login';
        }
    })   
}

// function diff(start, end) {
//     start = start.split(":");
//     end = end.split(":");
//     var startDate = new Date(0, 0, 0, start[0], start[1], 0);
//     var endDate = new Date(0, 0, 0, end[0], end[1], 0);
//     var diff = endDate.getTime() - startDate.getTime();
//     var hours = Math.floor(diff / 1000 / 60 / 60);
//     diff -= hours * 1000 * 60 * 60;
//     var minutes = Math.floor(diff / 1000 / 60);

//     // If using time pickers with 24 hours format, add the below line get exact hours
//     if (hours < 0)
//        hours = hours + 24;

//     return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
// }

// const convertTime12to24 = time12h => {
//     const [time, modifier] = time12h.split(" ");
//     let [hours, minutes] = time.split(":");
//     if (hours === "12") {
//       hours = "00";
//     }
//     if (modifier === "PM") {
//       hours = parseInt(hours, 10) + 12;
//     }
//     return `${hours}:${minutes}`;
//   };

//   function reformatDate(date){
//     //   console.log("Date ",date);
//     let finalDatewithTime = date.replace(/T/, ' ').replace(/\..+/, '');
//     let finalDate = finalDatewithTime.split(" ")[0];
//     return finalDate;
// }