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

        var GEN1 = 0;
        var GEN2 = 1;
        var GEN3 = 2;
        var GEN4 = 3;

        var GENERATIONS = [
            {region: 'Kanto', start: 1, end: 151},
            {region: 'Johto', start: 152, end: 251},
            {region: 'Hoenn', start: 252, end: 386},
            {region: 'Sinnoh', start: 387, end: 493}
        ];

        var UNOBTAINABLE = [
            // JOHTO
            172, // Pichu
            173, // Cleffa
            174, // Igglybuff
            175, // Togepi
            182, // Bellossom
            186, // Politoed
            192, // Sunflora
            196, // Espeon
            197, // Umbreon
            199, // Slowking
            208, // Steelix
            212, // Scizor
            230, // Kingdra
            233, // Porygon2
            235, // Smeargle
            236, // Tyrogue
            238, // Smoochum
            239, // Elekid
            240, // Magby
            // HOENN
            254, // Sceptile
            257, // Blaziken
            260, // Marshtomp
            266, // Silcoon
            267, // Beautifly
            268, // Cascoon
            269, // Dustox
            291, // Ninjask
            295, // Exploud
            298, // Azurill
            308, // Medicham
            321, // Wailord
            330, // Flygon
            334, // Altaria
            350, // Milotic
            352, // Kecleon
            360, // Wynaut
            366, // Clamperl
            367, // Huntail
            368, // Gorebyss
            373, // Salamence
            385, // Jirachi
            // SINNOH
            389, // Torterra
            392, // Infernape
            395, // Empoleon
            404, // Luxio
            405, // Luxray
            406, // Budew
            407, // Roserade
            408, // Cranidos
            409, // Rampardos
            410, // Shieldon
            411, // Bastiodon
            412, // Burmy
            413, // Wormadam
            414, // Mothim
            415, // Combee
            416, // Vespiquen
            418, // Buizel
            419, // Floatzel
            420, // Cherubi
            421, // Cherrim
            422, // Shellos
            423, // Gastrodon
            424, // Ambipom
            426, // Drifblim
            429, // Mismagius
            430, // Honchkrow
            431, // Glameow
            432, // Purugly
            433, // Chingling
            435, // Skuntank
            436, // Bronzor
            437, // Bronzong
            438, // Bonsly
            439, // Mime Jr.
            440, // Happiny
            443, // Gible
            444, // Gabite
            445, // Garchomp
            446, // Munchlax
            447, // Riolu
            448, // Lucario
            449, // Hippopotas
            450, // Hippowdon
            451, // Skorupi
            452, // Drapion
            453, // Croagunk
            454, // Toxicroak
            456, // Finneon
            457, // Lumineon
            458, // Mantyke
            459, // Snover
            460, // Abomasnow
            461, // Weavile
            462, // Magnezone
            463, // Lickilicky
            464, // Rhyperior
            465, // Tangrowth
            466, // Electivire
            467, // Magmortar
            468, // Togekiss
            469, // Yanmega
            470, // Leafeon
            471, // Glaceon
            472, // Gliscor
            473, // Mamoswine
            474, // Porygon-Z
            475, // Gallade
            476, // Probopass
            477, // Dusknoir
            478, // Froslass
            479, // Rotom
            480, // Uxie
            481, // Mesprit
            482, // Azelf
            483, // Dialga
            484, // Palkia
            485, // Heatran
            486, // Regigigas
            488, // Cresselia
            489, // Phione
            490, // Manaphy
            491, // Darkrai
            492, // Shaymin
            493 // Arceus
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

            var highestSnap = GENERATIONS[GEN4].end;
            for (var i = 1; i <= highestSnap; i++) {
                var number = i.toString();
                while (number.length < 3) {
                    number = '0' + number;
                }
                var generationClass;
                if (i < GENERATIONS[GEN2].start) {
                    generationClass = 'gen-i';
                }
                else if (i < GENERATIONS[GEN3].start) {
                    generationClass = 'gen-ii';
                }
                else if (i < GENERATIONS[GEN4].start) {
                    generationClass = 'gen-iii';
                }
                else {
                    generationClass = 'gen-iiii';
                }

                var entry = buildEntry(number).addClass(generationClass);

                if (UNOBTAINABLE.indexOf(i) !== -1) {
                    entry.addClass('unobtainable');
                }

                $entries.append(entry);
            }

            // Hacky way to ensure that last row of flex aligns to grid.
            // http://stackoverflow.com/a/22018710
            for (var i = 0; i < highestSnap; i++) {
                $('<div/>', {"class": 'entry placeholder'}).appendTo($entries);
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
            $('<img/>', {"class": 'gallery-image previous'}).prependTo($gallery);
            setGalleryImage('previous', getPreviousSnap());
        }

        function slideToNextSnap() {
            if (!galleryActive()) return;
            setCurrentSnap(getNextSnap());
            $('.previous').remove();
            $('.current').removeClass('current').addClass('previous');
            $('.next').removeClass('next').addClass('current');
            $('<img/>', {"class": 'gallery-image next'}).prependTo($gallery);
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
            $body.addClass('no-scroll').css({top: -scrollTop});
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