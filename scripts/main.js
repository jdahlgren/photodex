// Initial DOM
var banner =
  '<h1>PHOTÓDEX</h1>' +
  '<h2 class="hidden-while-loading">SNAPPED: <span id="snapped-count">0</span></h2>' +
  '<h2 class="hidden-when-loaded">LOADING <span class="fa fa-spinner fa-pulse"></span></h2>';
var content =
  '<div id="entries" class="hidden-while-loading"></div>' +
  '<div id="gallery">' +
    '<img class="gallery-image previous">' +
    '<img class="gallery-image current">' +
    '<img class="gallery-image next">' +
    '<img id="close-button" src="assets/close.png">' +
  '</div>';

$(function () {
  $('#banner').append(banner);
  $('#content').append(content);

  var $window = $(window);
  var $body = $(document.body);
  var $entries = $('#entries');
  var $gallery = $('#gallery');
  var $closeButton = $('#close-button');

  var _totalLoaded = 0;

  var snaps = [];
  var _currentSnap = null;

  var keysDown = {};
  var scrollTop;			  
			
						
																					  
																							 
			 
														   
						
											
										   
										
													  
		   

	$(function () {
								  
									

	  var $window = $(window);
	  var $body = $(document.body);
	  var $entries = $('#entries');
	  var $gallery = $('#gallery');
	  var $closeButton = $('#close-button');

	  var _totalLoaded = 0;

	  var snaps = [];
	  var _currentSnap = null;

	  var keysDown = {};
	  var scrollTop;
	  var scrollDisabled = false;

		var GEN_II_START = 152;
		var GEN_III_START = 252;
	  var UNOBTAINABLE = [
		172, 173, 174, 175, 236, 238, 239, 240, 298, 360 // Babies
		182, 186, 192, 199, 208, 212, 230, 233, // Evolution items
		196, 197, 350, // Walking req.	
		254, 257, 260, 266, 267, 268, 269, 272, 282, 289,
		275, 310, 308, 321, 365// Candy evolve, not in wild
	  ];
	  var UNRELEASED = [
		235, // Smeargle
		151, 251, 385, 386  // Mythical
		276, 277, 278, 279, 283, 284, 291, 292, 293, 294,
		295, 299, 304, 305, 306, 313, 314, 323, 324, 327,
		328, 329, 330, 331, 332, 333, 334, 337, 338, 343,
		344, 345, 346, 347, 348, 351, 352, 257, 377, 367,
		368, 371, 372, 373,	374, 375, 376, 377, 378, 379,
		380, 381, 384 // Gen 3
	  ];
	  var REGIONAL = [
		83,  // Farfetch'd - Japan
		115, // Kangaskhan - Australia
		122, // Mr. Mime - Europe
		128, // Tauros - North America
		214, // Heracross - South America
		222, // Corsola - 31N-26S Latitude
		311, // Plusle -
		312, // Minun -
		335, // Zangoose -
		336, // Seviper - 
		369  // Relicanth - New Zeeland
		];
	  var OUT_OF_ROTATION = [
		144, 145, 146, // Gen 1 Birds
		243, 244, 245, // Gen 2 Dogs
		249, 250, // Gen 2 Birds
		383, // Gen 3 Legends
		225 // Seasonal
		];

	  $.get('snaps/snaps.json')
		.done(function (data) {
		  for (var i = 0; i < data.length; i++) {
			snaps.push(data[i].substring(0, 3));
		  }
		  loadSnaps();
		})
		.fail(function () {
		  alert('Failed to load Photódex information!');
		});

	  function loadSnaps() {
		if (snaps.length === 0) {
		  onLoaded();
		  return;
		}

		// var highestSnap = snaps[snaps.length - 1];
		var highestSnap = 386;
		for (var i = 1; i <= highestSnap; i++) {
		  var number = i.toString();
		  while (number.length < 3) {
			number = '0' + number;
		  }
			var generationClass;
			if(i < GEN_II_START) {
				generationClass = 'gen-i';
			}
			else if(i < GEN_III_START) {
				generationClass = 'gen-ii';
			}
			else {
				generationClass = 'gen-iii';
			}
			
		  var entry = buildEntry(number).addClass(generationClass);
		  if (UNOBTAINABLE.indexOf(i) !== -1) {
			entry.addClass('unobtainable');
		  }
		  if (UNRELEASED.indexOf(i) !== -1) {
			entry.addClass('unobtainable');
		  }
		  if (REGIONAL.indexOf(i) !== -1) {
			entry.addClass('regional');
		  }
		  if (OUT_OF_ROTATION.indexOf(i) !== -1) {
			entry.addClass('regional');
		  }
		  $entries.append(entry);
		}

		// Hacky way to ensure that last row of flex aligns to grid.
		// http://stackoverflow.com/a/22018710
		for (var i = 0; i < highestSnap; i++) {
		  $('<div/>', { "class": 'entry placeholder' }).appendTo($entries);
		}
	  }

	  $gallery.click(function (e) {
		if (e.target !== this) return;
		hideGallery();
	  });

	  $closeButton.click(hideGallery);

	  $window.swiperight(slideToPreviousSnap)
		.swipeleft(slideToNextSnap)
		.keydown(function (e) {
		  if (keysDown[e.keyCode]) return;
		  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
		  keysDown[e.keyCode] = true;
		  switch (e.keyCode) {
			case 37: // left arrow
			  return slideToPreviousSnap();
			case 39: // right arrow
			  return slideToNextSnap();
			case 27: // escape
			  return hideGallery();
		  }
		}).keyup(function (e) {
		  keysDown[e.keyCode] = false;
		}).hashchange(function () {
		  var snap = getSnapFromHash();
		  if (_currentSnap === snap) return;
		  if (snaps.indexOf(snap) !== -1) {
			showGalleryImage(snap);
		  } else {
			hideGallery();
		  }
		});

	  function buildEntry(number) {
		var $entry = $('<div/>', {
		  id: 'entry-' + number,
		  "class": 'entry',
		  text: number
		});
		if (snaps.indexOf(number) !== -1) {
		  addSnap($entry, number);
		}
		return $entry;
	  }

	  function addSnap($entry, number) {
		var $img = $('<img/>');
		$img.load(function () {
		  $img.appendTo($entry);
		  incrementTotalLoaded();
		}).error(function () {
		  incrementTotalLoaded();
		}).click(function () {
		  showGalleryImage(number);
		});
		$img.attr('src', 'snaps/thumbs/' + number + '.jpg');
	  }

	  function incrementTotalLoaded() {
		_totalLoaded++;
		if (_totalLoaded === snaps.length) {
		  onLoaded();
		}
	  }

	  function onLoaded() {
		$('#snapped-count').text(snaps.length);
		$body.removeClass('loading');
		$window.hashchange();
	  }

	  function showGalleryImage(number) {
		setCurrentSnap(number);
		setGalleryImage('current', _currentSnap);
		setGalleryImage('previous', getPreviousSnap());
		setGalleryImage('next', getNextSnap());
		disableScroll();
		$gallery.addClass('active');
	  }

	  function hideGallery() {
		setCurrentSnap(null);
		$('.gallery-image').attr('src', '');
		enableScroll();
		$gallery.removeClass('active');
	  }

	  function slideToPreviousSnap() {
		if (!galleryActive()) return;
		setCurrentSnap(getPreviousSnap());
		$('.next').remove();
		$('.current').removeClass('current').addClass('next');
		$('.previous').removeClass('previous').addClass('current');
		$('<img/>', { "class": 'gallery-image previous' }).prependTo($gallery);
		setGalleryImage('previous', getPreviousSnap());
	  }

	  function slideToNextSnap() {
		if (!galleryActive()) return;
		setCurrentSnap(getNextSnap());
		$('.previous').remove();
		$('.current').removeClass('current').addClass('previous');
		$('.next').removeClass('next').addClass('current');
		$('<img/>', { "class": 'gallery-image next' }).prependTo($gallery);
		setGalleryImage('next', getNextSnap());
	  }

	  function galleryActive() {
		return $gallery.hasClass('active');
	  }

	  function getPreviousSnap() {
		var previousIndex = (snaps.indexOf(_currentSnap) - 1 + snaps.length) % snaps.length;
		return snaps[previousIndex];
	  }

	  function getNextSnap() {
		var nextIndex = (snaps.indexOf(_currentSnap) + 1) % snaps.length;
		return snaps[nextIndex];
	  }

	  function setCurrentSnap(snap) {
		_currentSnap = snap;
		if (snap) {
		  history.replaceState(null, null, '#' + snap);
		} else {
		  clearHash();
		}
	  }

	  function setGalleryImage(position, number) {
		$('.' + position + '.gallery-image').attr('src', 'snaps/gallery/' + number + '.jpg');
	  }

	  function disableScroll() {
		if (scrollDisabled) return;
		scrollTop = $window.scrollTop();
		$body.addClass('no-scroll').css({ top: -scrollTop });
		scrollDisabled = true;
	  }

	  function enableScroll() {
		if (!scrollDisabled) return;
		$body.removeClass('no-scroll');
		$window.scrollTop(scrollTop);
		scrollDisabled = false;
	  }

	  function getSnapFromHash() {
		return location.hash.replace(/^#/, '') || null;
	  }

	  function clearHash(number) {
		if (!getSnapFromHash()) return;
		history.replaceState(null, null, location.pathname);
		$window.hashchange();
	  }
	});
});