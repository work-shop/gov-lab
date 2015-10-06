function height( target, selector ) { 
	selector.css({ 'min-height': $(window).height() * target }); 
}

function height_strict( target, selector ) { 
	selector.css({ 'height': $(window).height() * target }); 
}

function width( target, selector ) { 
	selector.css({ 'width': $(window).width() * target }); 
}

function equal_height( target, selector ) {
	selector.css({'height': selector.width() });
}

function equal_width( target, selector ) {
	selector.css({'width': selector.height() });
}

(function( $ ) {
	function recalculate() {
		for ( var selector in actionmap ) {
			var els = $(selector);
			if ( els.length > 0 ) {
				actionmap[ selector ].callback( 
					actionmap[ selector ].target,
					els
				); 
			}	
		}

		$(document).trigger('dom-is-sized');
	}

	var actionmap = 
	{ 
		'.five': {callback:height, target: 0.05},
		'.ten': {callback:height, target: 0.1},
		'.ten-strict': {callback:height_strict, target: 0.1},
		'.one-quarter': {callback:height, target: 0.25},
		'.one-quarter-strict': {callback:height_strict, target: 0.25},
		'.forty-five': {callback:height, target: 0.45},
		'.half': {callback:height_strict, target: 0.5},
		'.half-strict': {callback:height_strict, target: 0.5},
		'.half-h': {callback:width, target: 0.5},
		'.ninety': {callback: height, target: 0.9},
		'.ninety-h': {callback:width, target: 0.9},
		'.three-quarter': {callback: height, target: 0.75},
		'.three-quarter-strict': {callback: height_strict, target: 0.75},
		'.all': {callback: height, target: 1},
		'.all-h': {callback:width, target: 1},
		'.all-strict': {callback:height_strict, target: 1},
		//'.double': {callback: height, target: 2},
		'.eighty-five': {callback: height, target: 0.85},
		'.height-is-width': {callback: equal_height, target: undefined },
		//'.width-is-height': {callback: equal_width, target: undefined }
	};

	$( document ).ready( function() {
		$('.background').animate({opacity: 0}, 1000, function() { $( this ).hide(); });
		$(window).on('resize', recalculate);
		recalculate();
	});

	
	
})( jQuery );



