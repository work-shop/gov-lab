
//global variables
var cw,ch;
var loaded = false;
var state = 'intro';
var moving = false;

/**
 * 'dom-is-sized' is triggered when the sizing module finishes a 
 * resize. We listen for the first of these, and remove the "curtain"
 * which 
 */
$(document).one('dom-is-sized', function() {
	$('#loading-background').fadeOut(600, function() { $(this).remove(); });
});



//initial events, and general event binding
jQuery(document).ready(function($) {
	
	$('#backtotop').click(function(event) {
	  	event.preventDefault();
		$('body,html').animate({scrollTop:0},2000);
	});

	$(".jump").click(function(e){
		e.preventDefault();
		var href = $(this).attr("href");
		href = href.toLowerCase();
		scrollLink(href);	
	});



	$('a.link').click(function(){
		$('html, body').animate({
			scrollTop: $( $.attr(this, 'href') ).offset().top - 50
		}, 750);


		return false;
	});

	// this set of listeners breaks out of the animation gracefully if the user scrolls.
	$(window).on( "mousewheel", function() { $('html, body').stop(); });
	$(window).on( "touchmove", function() { $('html, body').stop(); });

	/* for touch scrolling, this event fires when touch point is moved*/
	//document.addEventListener("touchmove", scrollStart, false);	

});//end document.ready


/** ----------- MENU RELATED FUNCTIONALITY --------------------------------- */

/**
 * This class implements fine-grained scrolling control. 
 * Given an array of elements to watch, the observer sets up
 * events on the dom that fire when requested elements pass
 * specified predicates. 
 *
 * @param {Map[Selector -> Map[String -> -1 <= x <= 1]} watched. 
 * A map from selectors to maps from callback names to percentage values. 
 * The callbacks are installed and fire when that percentage of the element
 * has passed either the top ( for specified x > 0 ) or bottom of the frame (for x < 0 ).
 */
function ScrollObserver( watched ) {
	if ( ! (this instanceof ScrollObserver ) ) return new ScrollObserver( watched );
	var self = this;

	var DEBUG 		= false;

	self.direction 	= 1;

	self.base 		= $(window).scrollTop();

	self.offset 	= window.innerHeight;

	self.top = function() { return self.base; };

	self.bottom = function() { return self.base + self.offset; };

	$(window).on( 'resize', function( e ) {  self.offset = window.innerHeight; });

	$(window).on( 'scroll', function( e ) { 
		var scrollTop = $(window).scrollTop();

		if ( self.base < scrollTop ) { self.direction = 1; }
		else { self.direction = -1; }

		self.base = $(window).scrollTop(); 
	});




	var observed = {};

	var diffed = {};

	/**
	 * The observe routine observes the position of an element with respect to the 
	 * current window frame, and triggers an event on the window when the predicate
	 * is fulfilled
	 * 
	 * @param  {string} selector   a DOM selector to observe
	 * @param  {string} callbackID the name of an event to fire on the satisfaction of predicate
	 * @param  {Object -> Boolean} a boolean-valued function indicating whether to trigger callbackID
	 */
	self.observe = function( selector, callbackID, predicate ) {

		if ( ! observed[ selector ] ) {

			observed[ selector ] = {};

		} 

		observed[ selector ][ callbackID ] = predicate;

		triggerObserved();

	};

	self.observeOnce = function( selector, callbackID, predicate ) {

		self.observe( selector, callbackID, function( element ) {

			var accepted = predicate( element );

			if ( accepted ) { self.forget( selector, callbackID ); }

			return accepted;

		});
	};

	self.forget = function( selector, callbackID ) {

		if ( selector && callbackID ) {

			if ( observed[ selector ] ) { delete observed[ selector ][ callbackID ]; }

		} else if ( selector ) {

			if ( observed[ selector ] ) { delete observed[ selector ]; }

		} else {

			observed = {};

		}
		
	};


	self.diff = function( selectorA, selectorB, callbackID, predicate ) {
		if ( ! diffed[ selectorA ] ) {

			diffed[ selectorA ] = {};

		} 

		if ( !diffed[ selectorA ][ selectorB ] ) {

			diffed[ selectorA ][ selectorB ] = {};

		}

		diffed[ selectorA ][ selectorB ][ callbackID ] = predicate;

		triggerDiffed();
	};

	self.diffOnce = function( selectorA, selectorB, callbackID, predicate ) {
		self.diff( selectorA, selectorB, callbackID, function( element ) {

			var accepted = predicate( element );

			if ( accepted ) { self.undiff( selectorA, selectorB, callbackID ); }

			return accepted;

		});
	};

	self.undiff = function( selectorA, selectorB, callbackID ) {

		if ( selectorA && selectorB && callbackID ) {

			if ( diffed[ selectorA ] && diffed[ selectorA ][ selectorB ] ) { delete diffed[ selectorA ][ selectorB ][ callbackID ]; }

		} else if ( selectorA && selectorB ) {

			if ( diffed[ selectorA ] ) { delete diffed[ selectorA ][ selectorB ]; }

		} else if ( selectorA ) {

			if ( diffed[ selectorA ] ) { delete diffed[ selectorA ]; }

		} else {

			diffed = {};
		}
		
	};


	function triggerDiffed() {

		for ( var selectorA in diffed ) {

			var selectedAs = $( selectorA );

			if ( selectedAs.length ) {

				for ( var selectorB in diffed[ selectorA ] ) {

					var selectedBs = $( selectorB );

					if ( selectedBs.length ) {

						selectedAs.each( function( i, A ) {

							A = $( A );

							var ATop 	= A.offset().top;

							var ABot 	= ATop + A.outerHeight();

							selectedBs.each( function( j, B ) {

								B = $( B );

								var BTop 	= B.offset().top;

								var BBot 	= BTop + B.outerHeight();

								var elementAttributes = {
									top: {
										top: BTop - ATop,
										bottom: BBot - ATop
									},
									bottom: {
										top: BTop - ABot,
										bottom: BBot - ABot
									}
								};

								for ( var trigger in diffed[ selectorA ][ selectorB ] ) {

									if ( diffed[ selectorA ][ selectorB ][ trigger ]( elementAttributes ) ) { 
										$( window ).trigger( trigger, A, B ); 
									} 

								}


							});

						});

					}

				}

			}

		}


	}

	function triggerObserved() {

		for ( var selector in observed ) {

			var selected = $( selector );

			if ( selected.length ) {

				selected.each( function ( i, element ) {

					element = $( element );

					var elementTop 		= element.offset().top ;

					var elementBottom 	= elementTop + element.outerHeight();

					for ( var trigger in observed[ selector ] ) {

						var topPosition = (1 / (elementBottom - elementTop)) * ( self.top() - elementBottom ) + 1;

						var botPosition = (1 / (elementBottom - elementTop)) * ( self.bottom() - elementBottom ) + 1;

						if (DEBUG) console.log('----');
						if (DEBUG) console.log( 'top: ele(%f) top(%f)', elementTop, self.top() );
						if (DEBUG) console.log( topPosition );
						if (DEBUG) console.log( 'bottom: ele(%f) bot(%f)', elementBottom, self.bottom() );
						if (DEBUG) console.log( botPosition );

						var elementAttributes = {

							element: element,
							above: topPosition > 1,
							below: botPosition < 0,
							top: topPosition,
							bottom: botPosition,
							direction: self.direction

						};

						if ( observed[ selector ][ trigger ]( elementAttributes ) ) { 
							$( window ).trigger( trigger, element ); 
						} 
					}

				});

			}

		}
	}

	/**
	 * @todo refactor : requestAnimationFrame
	 */
	$( window ).on( 'scroll', triggerObserved );
	$( window ).on( 'scroll', triggerDiffed );

	// 
	$( window ).on( 'resize', triggerObserved );
	$( window ).on( 'scroll', triggerDiffed );

}

/** ----------- DOCUMENT OBESERVERS --------------------------------- */


var observer;


/** ----------- DOCUMENT LISTENERS --------------------------------- */



/** ----------- MENU ACTIONS --------------------------------- */



$( document ).ready( function( ) {
	function cycleMenu( e ) {
		e.preventDefault();

		if ( $('menu').hasClass( 'open' ) ) {

			$('menu').removeClass( 'open' ).addClass('closed');
			$('#overlay').fadeOut( $('menu').css('transition-duration') );
			$( document.body ).css({overflow: 'scroll'});

		} else {

			$('menu').removeClass( 'closed' ).addClass('open');
			$('#overlay').fadeIn( $('menu').css('transition-duration') );
			$( document.body ).css({overflow: 'hidden'});

		}
	}

	$('.menu-trigger').on('click', cycleMenu);
});




/** ----------- SIDEBAR ACTIONS --------------------------------- */

$( document).ready( function() {
	if ( !observer ) observer = ScrollObserver();

	$('aside').css({'top': 0 + "px"});

	observer.observeOnce('*[aside-enter]', 'aside-fixed', function( observation ) {
		return observation.top >= 0;
	});

	observer.diffOnce('aside', '*[aside-exit]', 'aside-unfix', function( diff ) {
		return diff.bottom.top >= 50;
	});

	observer.observeOnce('header', 'header-fix', function( observation ) {
		return observation.top >= 1;
	});
	
});

var asideFresh = true;

$( window ).on( 'aside-absolute', function() {
	console.log('aside-absolute');

	//area = $('aside').offset().top;

	$('aside').animate({'position': 'absolute', 'top': 20 + "px"});
	//$('aside').animate({'position': 'absolute', 'top':  "px"});
	$('aside').css({'position': 'absolute'});

	observer.observeOnce('*[aside-enter]', 'aside-fixed', function( observation ) {
		return observation.top >= 0;
	});
});

$( window ).on( 'aside-fixed', function() {
	console.log('aside-fixed');


	
	//var area = ($('aside').offset().top) - $('*[aside-enter]').offset().top + $('header').outerHeight();//+ $('header').outerHeight();
	
	var area = $('header').outerHeight();

	//area = $('aside').offset().top + 20;
	//
	
	$('aside').animate({'top': area+"px"});

	//$('aside').animate({'top': (area+20)+"px"});
	$('aside').css({'position': 'fixed'});

	observer.observeOnce('*[aside-enter]', 'aside-absolute', function( observation ) {
		return observation.top < 0;
	});
});

$( window ).on( 'aside-unfix', function( e ) {
	if ( asideFresh ) {

		$('aside').delay( 750 ).queue( function( next ) {
			$('aside').addClass('open');
			next();
		});

		asideFresh = false;

	} else {

		$('aside').addClass('open');

	}
	
	observer.diffOnce('aside', '*[aside-exit]', 'aside-fix', function( diff ) {
		return diff.bottom.top <= 50;
	});

});

$( window ).on( 'aside-fix', function( e ) {
	$('aside').removeClass('open');
	observer.diffOnce('aside', '*[aside-exit]', 'aside-unfix', function( diff ) {
		return diff.bottom.top >= 50;
	});
});

// HEADER ACTUAL LOGIC

$( window ).on('resize', function() {
	$('header').width( window.innerWidth );
});

$( window ).on( 'header-fix', function() {

	var header = $('header');

	var w = header.outerWidth();
	var h = header.outerHeight();

	header.width( w );

	var shadowElement = $('<div>')
		.attr('id', 'header-shadow')
		.width( w )
		.height( h );

	header.css({'position': 'fixed'});
	shadowElement.insertBefore( header );
	header.animate({
		top: 0,
	});

	observer.observeOnce('#header-shadow', 'header-unfix', function( o ) {return o.top <= 0.05;});
});

$( window ).on('header-unfix', function() {
	var header = $('header');

	$('#header-shadow').remove();

	//header.width( "inherit" );

	header.css({'position': 'static'});
	header.css({'top': '-25%'});

	observer.observeOnce('header', 'header-fix', function( o ) { return o.top >= 1; });
});


/** ----------- SORTING ACTIONS --------------------------------- */


function transitionIn( set ) {
	set.fadeIn( 350 );
}

function transitionOut( set ) {
	set.fadeOut( 350 );
}

function filter(key, set) {
	var inSet = set.filter( function( i, element ) {
		return $( this ).data('sort-value').indexOf( key.trim() ) !== -1;
	});

	var outSet = set.filter( function( i, element ) {
		return $( this ).data('sort-value').indexOf( key.trim() ) === -1;
	});

	if ( outSet.length ) {

		outSet.fadeOut( 175, function() {
			inSet.fadeIn( 175 );
		});

	} else if ( inSet.length ) {

		inSet.fadeIn( 175 );

	}
}

function activate( key ) {
	$('*[data-sort-key]').removeClass('active');
	$('*[data-sort-key="' + ( key.data('sort-key') ) + '"]').addClass('active');
	key.addClass('active');
}

$(document).ready( function() {

	

	$('*[data-sort-key]').on('click', function() {

		activate( $(this) );

		filter( $(this).data('sort-key'), $('*[data-sort-value]') );

	});

	// $(window).resize( function() {
	// 	// ['#projects-list', '#news-list'].forEach( function( list ) {
	// 	// 	$( list ).height( $( list ).height() );
	// 	// });
	// });
});



//FUNCTIONS

//keyboard pressed m or M	

//keyboard pressed up arrow	
$(document).keypress(function(e) {
	if(e.which == 38){	
		if($("input:focus")){
			var elem = document.activeElement;
			if (! elem.type ){ 

			}
		}
	}	
});	

//keyboard pressed left arrow	
$(document).keypress(function(e) {
	if(e.which == 37) {	
		if($("input:focus")){
			var elem = document.activeElement;
			if (! elem.type ){ 

			}
		}
	}	
});			


//keyboard pressed right arrow	
$(document).keypress(function(e) {
	if(e.which == 39) {	
		if($("input:focus")){
			var elem = document.activeElement;
			if (! elem.type ){ 

			}
		}
	}	
});			


//initialize flexslider slideshows
function flexsliderSetup(){
	$('.flexslider').flexslider({	
	      animation: 'fade',
	      slideshowSpeed: 8000,           
		  animationSpeed: 700,
	      directionNav: true,
	      controlNav: true
	 });	 		 
	 	 	
}
