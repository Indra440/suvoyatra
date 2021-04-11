const basicUrl = window.location.origin; /*"http://localhost:3000";*/

$(document).ready(function(){
    console.log("Js is loading");
    $("#toggle-arrow-img").click(function(){
        console.log("Excghange button clicking");
        if($("#pickupLocation").val() == "" || $("#pickupLocation").val() == null ||
            $("#dropLocation").val() == "" || $("#dropLocation").val() == null
        ){
            return toastr.error("Please select pickup and drop location");
        }else{
            let dropLocation = $("#dropLocation").val();
            let pickupLocation = $("#pickupLocation").val();
            $("#pickupLocation").val(String(dropLocation)).click();
            $("#dropLocation").val(String(pickupLocation)).click();
        }

    })

    $("#findATransfer").click(async function(){
        console.log($("#departureDate").val());
        if($("#departureDate").val() == "" || $("#departureDate").val() == null){
            return toastr.error("Please select a valid date");
        }
        if($("#pickupLocation").val() == "" || $("#pickupLocation").val() == null ||
            $("#dropLocation").val() == "" || $("#dropLocation").val() == null
        ){
            return toastr.error("Please select pickup and drop location");
        }
        let formdata = $('form').serialize();
        console.log("formdata ",formdata);
        await findATransfer (1,formdata);
    })

    $(".download-btn").click(function(){
        let applinkMobile_number = $(".get-app-download-link").val();
        if(isNaN(applinkMobile_number) || String(applinkMobile_number).length !=10){
            return toastr.error("Please enter a valid 10 digit mobile number");       
        }else{
            return toastr.info("Our application is under development. We will launch it very soon");
        }
    })

})

async function findATransfer(number,query){
    window.location.href = basicUrl+'/search-result/'+number+'?'+decodeURIComponent(query)
}