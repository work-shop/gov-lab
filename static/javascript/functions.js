
//global variables
var cw,ch;
var loaded = false;
var state = 'intro';
var moving = false;


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

	};

	self.glance = function( selector, callbackID, predicate ) {

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


	function trigger() {

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
	$( window ).on( 'scroll', trigger );

	// 
	$( window ).on( 'resize', trigger );

}

/** ----------- DOCUMENT OBESERVERS --------------------------------- */
$( document ).ready( function() {

	var observer = ScrollObserver();

	observer.observe('#home-updates', 'section-unobscured', function( e ) {
		return e.top < 0 && e.bottom > 1;
	});

});

$(window).on('section-unobscured', function( undefined, element ) {
	//console.log( element );
});


/** ----------- DOCUMENT LISTENERS --------------------------------- */



/** ----------- MENU ACTIONS --------------------------------- */



$( document ).ready( function( ) {
	function cycleMenu( e ) {
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
		$('.block.half').css('height',windowHeight*.75);				
		$('.block.three-quarter').css('height',windowHeight*.75);	
	}
	else{
		$('.block.full').css('height',windowHeight);	
		$('.block.min').css('min-height',windowHeight);		
		$('.block.half').css('height',windowHeight*.75);				
		$('.block.three-quarter').css('height',windowHeight*.75);	
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

