const basicUrl = "http://localhost:3000";

$(document).ready(function(){
    console.log("Js is loading");
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
})

async function findATransfer(number,query){
    window.location.href = basicUrl+'/search-result/'+number+'?'+decodeURIComponent(query)
}