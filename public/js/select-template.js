$(document).ready(function () {
    $("select").change(function () {
        $(this).find("option:selected").each(function () {
            var optionValue = $(this).attr("value");
            if (optionValue) {
                $(".template-box").not("." + optionValue).hide();
                $("." + optionValue).show();
            } else {
                $(".template-box").hide();
            }
        });
    }).change();
});

$(document).ready(function () {
    var max_fields = 10; //maximum input boxes allowed
    var wrapper = $(".input_fields_wrap"); //Fields wrapper
    var add_button = $(".add_field_button"); //Add button ID

    var x = 1; //initlal text box count
    $(add_button).click(function (e) { //on add input button click
        e.preventDefault();
        if (x < max_fields) { //max input box allowed
            x++; //text box increment
            $(wrapper).append('<div class="f-row"><div class="one-half viaroot_input"><input type="text" id="" name="via-root" placeholder="Via Root(Optional)" /></div><div class="one-half viaroot_input"><input type="text" id="" name="via-root" placeholder="Via Root(Optional)" /></div><a href="#" class="remove_field">Remove</a></div>'); //add input box
        }
    });

    $(wrapper).on("click", ".remove_field", function (e) { //user click on remove text
        e.preventDefault(); $(this).parent('div').remove(); x--;
    })
});