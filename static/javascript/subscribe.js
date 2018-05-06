'use strict';

(function($) {
	$(document).ready( function() {

		setupAjaxChimp();
        //$('#mailchimp-response').slideUp();

		$(document).keyup(function(e) {
		  if (e.keyCode == 27 && $('.subscribe-trigger').hasClass('open') ) transition_form_overlay();   // close with esc key
		});

	});
})( jQuery );

function setupAjaxChimp() {
	$('#mc-embedded-subscribe-form').ajaxChimp({
		callback: function( resp ) {

			console.log( resp );

            var response = $('#mailchimp-response');
            var fields = $('#mailchimp-fields');

            if ( resp.result === "success" ) {

                response.find('h4').text('Thanks for joining our mailing list!');
                response.slideDown();
                fields.remove();


            } else {

                response.find('h4').text('Oops! Something isn\'t quite right.');
                response.slideDown();
                setupAjaxChimp();

            }

			// if ( resp.result == "success" ) close_form_overlay_success( resp.msg );
		 	// else close_form_overlay_failure( resp.msg );
		}
	});
}

function close_form_overlay_success( msg ) {
	console.log('success callback');
	//transition_form_overlay();
	replace_with( 'success', msg );

}

function close_form_overlay_failure( msg ) {
	console.log('failure callback');
	//transition_form_overlay();
	replace_with( 'failure', msg );
}

function transition_form_overlay() {
	$('.overlay.subscribe-trigger').click()
}



function replace_with( status, text )	{
	var content = $('#mc-embedded-subscribe-form');

	$('#mc-embedded-subscribe-form' ).replaceWith(

		$('<div>').attr('id', 'subscribe-response').attr('class', 'row mb1 mt1 ' + status )
			.append(
			$('<div>').attr('class','col-sm-offset-1 col-sm-10')
				.append(
				$('<div>').addClass( (status=="failure") ? 'bg-white' : 'bg-brand' )
					.append(
						$('<h3>').attr('class', ((status=="failure") ? 'brand' : 'white') + 'centered p1').text( text )
					))
			)
	);

	if ( status == 'failure' ) {
		$('#subscribe-response').after(
			$('<div>').attr('id', 'subscribe-response-button').attr('class', 'pointer row mb1 mt1 ' + status )
			.append(
			$('<div>').attr('class','col-sm-offset-1 col-sm-10')
				.append(
				$('<div>').addClass('bg-brand')
					.append(
						$('<h3>').attr('class', 'white centered p1').text( 'Try again.' )
					))
			).on( 'click', function() {

				$( this ).remove();
				$('#subscribe-response').replaceWith( content );

				setupAjaxChimp();

			} )
		);
	}
}
