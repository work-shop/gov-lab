(function($) {
	$(document).ready( function() {

		$('#mc-embedded-subscribe-form').ajaxChimp({
			callback: function( resp ) {
				console.log( resp );

				if ( resp.result == "success" ) close_form_overlay_success( resp.msg );
			 	//else close_form_overlay_failure( resp.msg );
			}
		});

		$(document).keyup(function(e) {
		  if (e.keyCode == 27 && $('.subscribe-trigger').hasClass('open') ) transition_form_overlay();   // close with esc key
		});

	});
})( jQuery );

function close_form_overlay_success( msg ) {
	console.log('success callback');
	transition_form_overlay();
	replace_with( 'success', msg );
	
}

function close_form_overlay_failure( msg ) {
	console.log('failure callback');
	transition_form_overlay();
	replace_with( 'failure', msg );
}

function transition_form_overlay() {
	$('.overlay.subscribe-trigger').click()
}

function replace_with( status, text )	{
	$('#subscribe-button' ).replaceWith(
		$('<div>').addClass( status )
			     .addClass('col-sm-8')
			     .addClass( 'col-sm-offset-2')
			     .addClass('white')
			     .addClass('centered')
			     .append( 
			     		$('<h5>').text( text )
				)
	);
}