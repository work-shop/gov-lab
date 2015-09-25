
//global variables
var cw,ch;
var loaded = false;
var state = 'intro';
var moving = false;

$(document).on('dom-is-sized', function() {
	$('#loading-background').fadeOut(350, function() { $(this).remove(); });
});

//initial events, and general event binding
jQuery(document).ready(function($) {



	view();
	
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

	/* for touch scrolling, this event fires when touch point is moved*/
	//document.addEventListener("touchmove", scrollStart, false);	

});//end document.ready


//called when the user resizes the window
$(window).resize(function() {

	view();	
	
});//end window.resize


$(window).scroll(function() { 

	//number of pixels after which we consider the user to have begun to scroll
	var after = 60;
	       
	if($(this).scrollTop() >= after && $("body").hasClass('before')){
		$("body").removeClass('before').addClass('after');
		console.log('adding after');
	} 
	else if($(this).scrollTop() < after && $("body").hasClass('after')){
		$("body").removeClass('after').addClass('before');	
		console.log('removing after');
	} 
		
});//end window.scroll


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
	 * [observe description]
	 * @param  {[type]} selector   [description]
	 * @param  {[type]} callbackID [description]
	 * @param  {[type]} predicate  [description]
	 * @return {[type]}            [description]
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


$( window ).on( 'aside-absolute', function() {
	console.log('aside-absolute');

	$('aside').css({'position': 'absolute', 'top': '0%'});
	observer.observeOnce('*[aside-enter]', 'aside-fixed', function( observation ) {
		return observation.top >= 0;
	});
});

$( window ).on( 'aside-fixed', function() {
	console.log('aside-fixed');

	area = ($('aside').offset().top - $('*[aside-enter]').offset().top);//+ $('header').outerHeight();

	$('aside').css({'position': 'fixed', 'top': area+"px"});

	observer.observeOnce('*[aside-enter]', 'aside-absolute', function( observation ) {
		return observation.top < 0;
	});
});

$( window ).on( 'aside-unfix', function( e ) {
	console.log('aside-unfix');
	$('aside').addClass('open');
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

	header.width( "inherit" );

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
	key.addClass('active');
}

$(document).ready( function() {

	['#projects-list', '#news-list'].forEach( function( list ) {
		$( list ).height( $( list ).height() );
	});

	$('*[data-sort-key]').on('click', function() {

		activate( $(this) );

		filter( $(this).data('sort-key'), $('*[data-sort-value]') );

	});
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

//animate jump links
function scrollLink(destination){
	$('html,body').animate({
		scrollTop: $(destination).offset().top - 100
	},1500);
}

//open and close the menu
function menuToggle(){	
	if($('body').hasClass('menu-closed')){
		$('#menu').removeClass('closed');
		$('#menu').addClass('open');
		$('body').removeClass('menu-closed');
		$('body').addClass('menu-open');
	}
	
	else if($('body').hasClass('menu-open')){
		$('#menu').removeClass('open');
		$('#menu').addClass('closed');
		$('body').removeClass('menu-open');
		$('body').addClass('menu-closed');
	}
	
}


//measure, resize, and adjust the viewport
function view(){
	
	windowHeight = $(window).height();
	windowWidth = $(window).width();

	
	if($(window).width() >= 768){		
		$('.block.full').css('height',windowHeight);	
		$('.block.min').css('min-height',windowHeight);		
		$('.block.half').css('height',windowHeight*0.75);				
		$('.block.three-quarter').css('height',windowHeight*0.75);	
	}
	else{
		$('.block.full').css('height',windowHeight);	
		$('.block.min').css('min-height',windowHeight);		
		$('.block.half').css('height',windowHeight*0.75);				
		$('.block.three-quarter').css('height',windowHeight*0.75);	
	}
	
	//if the loadPage function has not been called yet, call it
	if(!loaded){
		loadPage();
	}		

}

//once all elements are sized, slideshows initialized, fade in the content
function loadPage(){
	loaded = true;
	
	flexsliderSetup();

	setTimeout(function(){
		$('.loading').addClass('loaded');
		$('.landing').removeClass('landing').addClass('landed');
		view();
		if ( $('.spy').length > 0 ) { $(document).trigger('spy-init'); }	
	},500);	
		
}

