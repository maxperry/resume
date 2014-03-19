$(function() {

	var direction = 'newest';

	setupTimeline();

	/**
	 * Get the timestamp (milliseconds) given the year.
	 * If beginning is true, timestamp is 1/1/year 12:00:00:000
	 * If beginning is false, timestamp is 12/31/year 23:59:59:999
	 */
	function getTimestamp(year, beginning){
		if (beginning)
			return Date.parse('January 1, ' + year);
		else
			return Date.parse('December 31, ' + year) + 86400000 - 1 ; // plus 1 day, minus 1 millisecond
	}

	/**
	 * Load the data into Isotope
	 */
	function setupTimeline(){

		$('.timeline').imagesLoaded(function(){
			$('.timeline').isotope({
				itemSelector : '.item',
				transformsEnabled: true,
				layoutMode: 'spineAlign',
				spineAlign:{
					gutterWidth: 56
				},
				getSortData: {
					timestamp: function($elem){
						return parseFloat($elem.find('.timestamp').text());
					}
				},
				sortBy: 'timestamp',
				sortAscending: false,
				itemPositionDataEnabled: true
			});
			adjustLine();

		});

/*
		// add open/close buttons to each post
		$('#timeline .item.post').each(function(){
			$(this).find('.inner').append('<a href="#" class="open-close"></a>');
		});

		$('#timeline .item a.open-close').click(function(e){
			$(this).siblings('.body').slideToggle(function(){
				$('#timeline').isotope('reLayout');
			});
			$(this).parents('.post').toggleClass('closed');
			$('#expand-collapse-buttons a').removeClass('active');
			e.preventDefault();
		});
*/
	}

	/*
	 * Set the timestamp of the year markers to either the beginning or end of
	 * the year
	 */
	function updateYearMarkers(beginning){
		$('.year-marker').each(function(){
			var $this = $(this);
			var year = parseInt($this.find('.year').text());
			var timestamp = getTimestamp(year, beginning);
			$this.find('.timestamp').text(timestamp);
		});
	}

	/*
	 * Keep the actual line from extending beyond the last item's date tab
	 */
	function adjustLine(){
		$('.item.last').each(function (){
			var itemPosition = $(this).data('isotope-item-position');
			var dateHeight = $(this).find('.marker').height();
			var dateOffset = $(this).find('.marker').position();
			var innerMargin = parseInt($(this).find('.inner').css('marginTop'));
			var lineHeight = itemPosition.y + innerMargin + dateOffset.top + (dateHeight / 2);
			$(this).closest('.timeline').find('.line').height(lineHeight);
		});
		
	}

	$('.timeline').resize(function(){ // uses "jQuery resize event" plugin
		adjustLine();
	});
});



/*
 * Isotope custom layout mode spineAlign
 */

$.Isotope.prototype._spineAlignReset = function() {
	this.spineAlign = {
		colA: 0,
		colB: 0,
		lastY: -60
	};
};
$.Isotope.prototype._spineAlignLayout = function( $elems ) {
	var instance = this,
		props = this.spineAlign,
		gutterWidth = Math.round( this.options.spineAlign && this.options.spineAlign.gutterWidth ) || 0,
		centerX = Math.round(this.element.width() / 2);

	$elems.each(function(i, val){
		var $this = $(this);
		$this.removeClass('last').removeClass('top');
		if (i == $elems.length - 1)
			$this.addClass('last');
		var x, y;
		if ($this.hasClass('year-marker')){
			var width = $this.width();
			x = centerX - (width / 2);
			if (props.colA >= props.colB){
				y = props.colA;
				if (y == 0) $this.addClass('top');
				props.colA += $this.outerHeight(true);
				props.colB = props.colA;
			}
			else{
				y = props.colB;
				if (y == 0) $this.addClass('top');
				props.colB += $this.outerHeight(true);
				props.colA = props.colB;
			}
		}
		else{
			$this.removeClass('left').removeClass('right');
			var isColA = props.colB >= props.colA;
			if (isColA)
				$this.addClass('left');
			else
				$this.addClass('right');
			x = isColA ?
				centerX - ( $this.outerWidth(true) + gutterWidth / 2 ) : // left side
				centerX + (gutterWidth / 2); // right side
			y = isColA ? props.colA : props.colB;
			if (y - props.lastY <= 60){
				var extraSpacing = 60 - Math.abs(y - props.lastY);
				$this.find('.inner').css('marginTop', extraSpacing);
				props.lastY = y + extraSpacing;
			}
			else{
				$this.find('.inner').css('marginTop', 0);
				props.lastY = y;
			}
			props[( isColA ? 'colA' : 'colB' )] += $this.outerHeight(true);
		}
		instance._pushPosition( $this, x, y );
	});
};
$.Isotope.prototype._spineAlignGetContainerSize = function() {
	var size = {};
	size.height = this.spineAlign[( this.spineAlign.colB > this.spineAlign.colA ? 'colB' : 'colA' )];
	return size;
};
$.Isotope.prototype._spineAlignResizeChanged = function() {
	return true;
};

