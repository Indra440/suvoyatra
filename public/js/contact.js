const basicUrl = "http://localhost:3000";
const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

$(document).ready(function(){
    console.log("Its loading");

    $("#getInTouch_submit").click(function(){
        console.log("Its clicking here");
        const name = $("#getInTouch_name").val();
        const phone = $("#getInTouch_phone").val();
        const email = $("#getInTouch_email").val();
        const subject = $("#getInTouch_subject").val();
        const message = $("#getInTouch_comments").val();

        console.log("Name", name);
        console.log("Mobile", phone);
        console.log("Mail", email);
        console.log("Sub", subject);
        console.log("Comment", message);

        if(name == "" || name == null || name == undefined ||
        phone == "" || phone == null || phone == undefined ||
        email == "" || email == null || email == undefined ||
        subject == "" || subject == null || subject == undefined || 
        message == "" || message == null || message == undefined
        ){
            toastr.error("Please fill all the fields with valid details");
            return;
        }
        if(!(emailRegexp.test(email))){
            // console.log("Please enter a valid username");
            toastr.error('Please enter a valid email id');
            return false;
        }
        const data = {
            name : name,
            phone : phone,
            email : email,
            subject : subject,
            message : message
        }
        console.log("Data ",data);
        $.ajax({
            url:basicUrl+'/busRouter/sendQuery',
            type: "POST",
            data: data,
            dataType: "JSON",
            success: function(result){
                toastr.success('Message Sent successfully');
                console.log("result ",result);
                $("#getInTouch_name").val("");
                $("#getInTouch_phone").val("");
                $("#getInTouch_email").val("");
                $("#getInTouch_subject").val("");
                $("#getInTouch_comments").val("");
            },
            error: function(response) {
                toastr.error('some error is comming');
            }
        })
    })
})