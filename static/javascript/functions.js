
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
	
	$('.menu-toggle').click(function(event) {
	  	event.preventDefault();
		menuToggle();
		console.log('.menu-toggle clicked');
	});

	$(".jump").click(function(e){
		e.preventDefault();
		var href = $(this).attr("href");
		href = href.toLowerCase();
		scrollLink(href);	
	});

	/* for touch scrolling, this event fires when touch point is moved*/
	document.addEventListener("touchmove", scrollStart, false);	

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



//FUNCTIONS

//keyboard pressed m or M	
$(document).keypress(function(e) {
	if(e.which == 109 || e.which == 77) {	
		if($("input:focus")){
			var elem = document.activeElement;
			if (! elem.type ){ 
				menuToggle();
				console.log('m and menu toggle');	
			}
		}
	}
});

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




$(document).on('spy-init', function() {

	var current;
	var previousBodyClass;

	spied = {};

	$('.spy .target:not(.exclude)').each( function( i,d ) { 
		spied[ $(d).attr('id') ] = true;
	});
	/**
	 * When spying on the state of the page, we're interested in:
	 * the currently-viewed element. (and performing actions on it).
	 * at any point we can:
	 * jump to
	 */

	 $(document).on('spy-recalculate', function() {
	 	decideActive(  $('.block.target:in-viewport'));
	 });

	 $(document).on('spy-repaint', function( event, d ) {
	 	if ( current != d ) {
	 		var c = $(current);
	 		    d = $( d );
	 		
	 		var b = $('body');
	 		var bodyClass = 'block-active-' + d.attr('id');

	 		b.removeClass(previousBodyClass);
	 		c.removeClass('active');
	 		d.addClass('active').addClass('activated');
	 		b.addClass(bodyClass);
	 		previousBodyClass = bodyClass;

	 		current = d;
	 	}
	 });


	 $(window).on('scroll', function() {
	 	if( !$('html').hasClass('menu-open') ) {	
	 		$(document).trigger('spy-recalculate');
	 	}
	 });

	 $(document).trigger('spy-recalculate');

	 function decideActive( candidates ) {
	 	/**
		 * Let's define an element as "active" if its body is intersecting the
		 * centerpoint of the page. Let's compute the current centerpoint, and 
		 * iterate across the blocks that are in view, decide which ones are active,
		 * and trigger the desired action on them.
		 */


		var w = $(window), doc = $(document);
		var centerline = w.scrollTop() + (w.height() / 3);

		candidates.each( function( i,d ) {
			d = $( d );

			if ( d.offset().top < centerline && (d.offset().top + d.height()) > centerline ) {
 				var s = $('.spy');

 				doc.trigger('spy-repaint', d);

 				if ( $('.spy').hasClass('falloff') && d.is( $('.falloff-link').attr('href') ) ) {
 					s.addClass('off');
 				} else {
 					s.removeClass('off');
 				}
 			}
		});
	 }

	 //currently unused
	 function decideOffset() {
	 	var w = $(window);
	 	return 0;
	 	//return ($('body').hasClass('home')) ? ((w.width() < 768) ? 350 : (w.height() / 2)) : 80;
	 }
});

function scrollStart(){
	
}

