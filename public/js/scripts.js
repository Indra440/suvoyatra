(function ($) {

	"use strict";

	$(document).ready(function () {
		const basicUrl = window.location.origin;
		transfers.init();
		let userToken = window.localStorage.getItem("suvoyatratoken");
		if(userToken && userToken != null && userToken != "" && userToken != undefined){
			$("#userMenu").append("<li id='userLogout'><a href='#'>Logout</a></li>")
		}

		$("#userLogout").click(function(){
			if (confirm('Are you sure you want to logout from this account ?')) {
				// Save it!
				localStorage.removeItem("suvoyatratoken");
				window.location.href = basicUrl +'/user-login';
			  } else {
				// Do nothing!
				return null;
			  }
		})
	});

	$(window).on('load', function () {
		transfers.load();
	});

	// ANIMATIONS
	new WOW().init();

	var transfers = {

		init: function () {

			// MOBILE MENU
			$('.main-nav').slicknav({
				prependTo: '.header .wrap',
				allowParentLinks: true,
				label: ''
			});

			// CUSTOM FORM ELEMENTS
			$('input[type=radio], input[type=checkbox],input[type=number], select').uniform();

			// SEARCH RESULTS 
			$('.information').hide();
			$('.trigger').click(function () {
				$(this).parent().parent().nextAll('.information').slideToggle(500);
			});
			$('.close').click(function () {
				$('.information').hide(500);
			});

			// FAQS
			$('.faqs dd').hide();
			$('.faqs dt').click(function () {
				$(this).next('.faqs dd').slideToggle(500);
				$(this).toggleClass('expanded');
			});

			// CONTACT FORM
			$('#contactform').submit(function () {
				var action = $(this).attr('action');
				$("#message").show(500, function () {
					$('#message').hide();
					$('#submit')
						.after('<img src="images/contact-ajax-loader.gif" class="loader" />')
						.attr('disabled', 'disabled');

					$.post(action, {
						name: $('#name').val(),
						email: $('#email').val(),
						comments: $('#comments').val()
					},
						function (data) {
							document.getElementById('message').innerHTML = data;
							$('#message').slideDown('slow');
							$('#contactform img.loader').fadeOut('slow', function () { $(this).remove() });
							$('#submit').removeAttr('disabled');
						});

				});
				return false;
			});

			// TABS
			$('.tab-content').hide().first().show();
			$('.tabs li:first').addClass('active');

			$('.tabs a').on('click', function (e) {
				e.preventDefault();
				$(this).closest('li').addClass('active').siblings().removeClass('active');
				$($(this).attr('href')).show().siblings('.tab-content').hide();
			});

			var hash = $.trim(window.location.hash);
			if (hash) $('.tabs a[href$="' + hash + '"]').trigger('click');

			// SMOOTH ANCHOR SCROLLING
			var $root = $('html, body');
			$('a.anchor').on('click', function (e) {
				var href = $.attr(this, 'href');
				if (typeof ($(href)) != 'undefined' && $(href).length > 0) {
					var anchor = '';

					if (href.indexOf("#") != -1) {
						anchor = href.substring(href.lastIndexOf("#"));
					}

					var scrollToPosition = $(anchor).offset().top - 80;

					if (anchor.length > 0) {
						$root.animate({
							scrollTop: scrollToPosition
						}, 500, function () {
							window.location.hash = anchor;
							// This hash change will jump the page to the top of the div with the same id
							// so we need to force the page to back to the end of the animation
							$('html').animate({ 'scrollTop': scrollToPosition }, 0);
						});
						e.preventDefault();
					}
				}
			});

		},
		load: function () {
			// UNIFY HEIGHT
			var maxHeight = 0;

			$('.heightfix').each(function () {
				if ($(this).height() > maxHeight) { maxHeight = $(this).height(); }
			});
			$('.heightfix').height(maxHeight);

			// PRELOADER
			$('.preloader').fadeOut();
		}
	}

})(jQuery);

// testimonial home page slider
$(".slider").owlCarousel({
    navigation : true
  });
$(".slider").owlCarousel({
	loop: true,
	autoplay: true,
	autoplayTimeout: 2000, //2000ms = 2s;
	autoplayHoverPause: true,
});
$(function () {
	$('#journey_selector').change(function () {
		$('.return').hide();
		$('#' + $(this).val()).show();
	});
});
// table user active and deactive
$(function () {
	$(".bl-table-data td button").click(function () {
		$(this).addClass("deactive");
	});
});

// $(document).ready(function () {
// 	$('.moreless-button').click(function () {
// 		$('.moretext').toggle();
// 		if ($('.moreless-button').text() == "Read more") {
// 			$(this).text("Read less")
// 		} else {
// 			$(this).text("Read more")
// 		}
// 	});
// });
// $(document).ready(function(){
// 	$(".moreless-button").click(function(){
// 	  $(".moretext").hide();
// 	});
//   });