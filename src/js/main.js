$( document ).ready(function() {
    init();
});

// Attach FastClick to remove 300ms click delay
// on touch devices
$(function() {
    FastClick.attach(document.body);
});


function init() {

    // Add Class to body indicating we can use 0.5px
    // borders
    if (window.devicePixelRatio && devicePixelRatio >= 2) {
        var testElem = document.createElement('div');
        testElem.style.border = '.5px solid transparent';
        document.body.appendChild(testElem);
        if (testElem.offsetHeight == 1) {
            document.body.classList.add('tfc--retina');
        }
        document.body.removeChild(testElem);
    }

    // check if -webkit-backdrop-filter is supported
    if ("webkitBackdropFilter" in document.body.style) {
        $("body").addClass("tfc--backdropFilter");
    }

    // set padding-top of the viewcontainers that have a navbar
    // to the height of the navbar that belongs to them
    $(".tfc-viewcontainer--with-navbar").each(function() {
        // console.log();
        $(this).css("padding-top", function() {
            return (parseInt($(this).css("padding-top"),10) + $(this).parent().siblings(".tfc-navbar").height()) + "px";
        });
    });

    $(".tfc-navbar").each(function() {
        $(this).data("originalHeight", $(this).height());
        $(this).data("minHeight", parseInt($(this).css('min-height'),10));
        $(this).data("maxHeight", parseInt($(this).css('max-height'),10));
    });


    // Navbar Searching

    // Switch to ViewState Search
    $(".tfc-navbar-search-overlay-button").click(function(e) {
        e.stopPropagation();
        $("body").addClass("tfc--prepare-viewstate-search");
        setTimeout(function() {
            $("body").addClass("tfc--viewstate-search");
        }, 50);
        setTimeout(function() {
            $("body").addClass("tfc--finish-viewstate-search");
        }, 320);

        $(".tfc-navbar-search-input").focus();
    })

    // Switch Back from ViewState Search
    $(".tfc-navbar-search-button").click(function() {
        $("body").removeClass("tfc--finish-viewstate-search");
        setTimeout(function() {
            $("body").removeClass("tfc--viewstate-search");
        }, 50);
        setTimeout(function() {
            $("body").removeClass("tfc--prepare-viewstate-search");
        }, 520);
    })


    function getStationDepartureRect() {

    }


    // Switch to ViewState Detail Edit
    $(".tfc-filter-button").click(function(e) {
        e.stopPropagation();
        $("body").addClass("tfc--prepare-viewstate-detail-edit");

        var sr = $(".tfc-departure-type--station-departure")[0].getBoundingClientRect();
        var er = $(".tfc-departure-type--detail-edit")[0].getBoundingClientRect();

        var sTop  = sr.top;
        var eLeft = er.left;

        var sListWidthMargin = $(".tfc-departure-type--station-departure").outerWidth(true);
        var sListWidth = $(".tfc-departure-type--station-departure").outerWidth();
        var eListHeight = $(".tfc-list-item--detail-edit").outerHeight();

        $(".tfc-departure-type--detail-edit").each(function(i) {
            sLeft = (sr.left + sListWidthMargin * i);
            eTop  = (er.top + eListHeight * i);

            var x = Math.abs(eLeft - sLeft);

            if (eTop - sTop > 0) {
                var y = "-" + Math.abs(eTop - sTop);
            } else {
                var y = Math.abs((sTop - eTop));
            }

            // because we use transition-origin: center, subtract the width of the station
            // departure icon from the final calculations

            x = x - sListWidth;
            y = y - sListWidth;

            $(this).css("transform", "translate(" + x + "px," + y + "px) scale(0.33333333)");
        });

        setTimeout(function() {
            $(".tfc-departure-type--detail-edit").each(function(i) {
                var delay = 1 - (i * 0.07);
                var duration = (i * 0.1) + 0.5;
                $(this).css("transition-delay", (0 + (i * 0.1)) + "s");
                $(this).css("transition-duration", (0.6) + "s");
                $('.tfc-list-item-directions--detail-edit:eq('+i+')').css("transition-delay", (1.3 + (i * 0.1)) + "s");
                $('.tfc-radio-button--detail-edit:eq('+i+')').css("transition-delay", (1.3 + (i * 0.1)) + "s");
            });
            $(".tfc-departure-type--detail-edit").addClass("tfc-departure-type--detail-edit--original-pos");
            $("body").addClass("tfc--viewstate-detail-edit");
        }, 50);

        setTimeout(function() {
            // $(".tfc-departure-type--detail-edit").css("transition-delay", "");
            $("body").addClass("tfc--finish-viewstate-detail-edit");
            $("tfc-scrollview--detail-edit").addClass("tfc-scrollview--enabled");
        }, 150);

        setTimeout(function() {
            $(".tfc-departure-type--detail-edit").addClass("tfc-departure-type--detail-edit--original-scale");
        }, 1500);

    })

    var lastDetailScrollY;
    var currentDetailScrollY;

    var touchStartTime, touchStartPosY;
    var touchCurrentTime, touchCurrentPosY, touchStartTransitionPosY;
    var touchEndTime, touchEndPosY;
    var touchSpeed, touchDistance, touchDirection, touchDistanceStart;

    var moveDistance;
    var isTransitioning;
    var whereToTransitionTo;

    // Hacky Shit
    $(".tfc-scrollview--enabled").bind('touchstart', function(e) {
        var touch = e.changedTouches[0];

        touchDistanceStart = false;
        isTransitioning = false;
        moveDistance = false;

        // set the timestamp and position of the first touch
        touchStartTime = new Date().getTime();
        touchStartPosY = touch.pageY;
        touchEndPosY = touch.pageY;



        $(this).data("scrollhack", false);
        $(this).data("moved", false);
        $(this).data("transitionMove", false);

        if (this.scrollTop == 0) {
            this.scrollTop = 1;
            $(this).css("transform", "translateY(1px)");
            $(this).data("scrollhack", "plus");

        } else if (this.scrollHeight === this.scrollTop + this.offsetHeight) {
            this.scrollTop -= 1;
            $(this).css("transform", "translateY(-1px)");
            $(this).data("scrollhack", "minus");
        } else {
            $(".tfc-scrollview").css("transform", "translateY(0px)");
        }
    });

    $(".tfc-scrollview--enabled").bind('touchmove', function(e) {
        $(this).data("moved", true);

        var touch = e.changedTouches[0];

        if (isTransitioning == true) {
            e.preventDefault();
            $(this).addClass("tfc-scrollview--locked");
        } else {
            $(this).removeClass("tfc-scrollview--locked");
        }
        touchCurrentPosY = touch.pageY;

        if (Math.abs(touchCurrentPosY - touchEndPosY) > 5) {
            if (touchCurrentPosY > touchEndPosY) {
                touchDirection = "down";
            } else {
                touchDirection = "up";
            }
            // save current touch info for touchEnd
            touchEndTime = new Date().getTime();
            touchEndPosY = touchCurrentPosY;
        }

        touchDistance = touchStartPosY - touchCurrentPosY;


        if ($(this).hasClass("tfc-scrollview--detail")) {

            if (touchDistance < 0 && $(".tfc-scrollview--detail").scrollTop() <= 1) {
                if (isTransitioning == false) {
                    isTransitioning = true;
                    touchStartTransitionPosY = touchCurrentPosY;
                }
                moveDistance = touchCurrentPosY - touchStartTransitionPosY;
                if (moveDistance > 0) {
                    $(".tfc-view--detail").css("transform", "translateY("+ moveDistance +"px)");

                    var opacity = Math.min(((moveDistance / $(window).height())),1);
                    var scale = Math.min(( (( moveDistance / $(window).height() ) / 10) + 0.9 ),1);

                    $(".tfc-view--home").css("opacity", opacity);
                    $(".tfc-view--home").css("transform", "scale(" + scale + ")");
                } else {
                    $(".tfc-view--detail").css("transform", "");
                }
            } else {
                isTransitioning = false;
                $(".tfc-view--detail").css("transform", "");
            }
        }

    });



    $(".tfc-scrollview--detail").bind('scroll', function() {
        var scrollTop = $(this).scrollTop();
        var navbar = $(".tfc-navbar--detail");
        var navbarBorder = $(".tfc-navbar--detail .tfc-navbar-border");
        var navbarBackground = $(".tfc-navbar--detail .tfc-navbar-background");
        var stationName = $(".tfc-h1--detail");
        var filterButton = $(".tfc-filter-button");
        var stationdepartures = $(".tfc-station-departures-list");
        var minHeight = navbar.data("minHeight");
        var originalHeight = navbar.data("originalHeight");
        // var newHeight = originalHeight - scrollTop;

        navbar.css("height", function() {
            return originalHeight - scrollTop + 40;
        });

        // navbarBorder.css("opacity", function() {
        //     return scrollTop / 100;
        // });

        navbarBackground.css("opacity", function() {
            return 1 - scrollTop / 100;
        });

        navbarBorder.css("transform", function() {
            var y = Math.max($(this).data("originalOffsetY") - scrollTop, 0);
            return "translateY("+ y +"px)"
        });
        
        filterButton.css("transform", function() {
            var y = Math.max($(this).data("originalOffsetY") - scrollTop, 0);
            return "translateY("+ y +"px)"
        });

        stationName.css("transform", function() {
            var s = Math.min(Math.max(1 - (scrollTop - 50)/200, 0.64), 1);
            var y = Math.max($(this).data("originalOffsetY") - scrollTop, 0.5);
            return "translateY("+ y +"px) scale("+ s +")";
        });


        // stationdepartures.css("transform", "scale("+ s +")");


        if (scrollTop > 1) {
            navbar.addClass("tfc-navbar--fixed");
        } else {
            navbar.removeClass("tfc-navbar--fixed");
        }
    });


    $(".tfc-scrollview--enabled").bind('touchend', function() {
        if ($(this).hasClass("tfc-scrollview--detail")) {
            // Calculate the speed/velocity of the touchgesture
            // in px per millisecond
            touchSpeed = Math.abs(touchEndPosY - touchStartPosY)/(touchEndTime - touchStartTime) || 0;

            if (touchSpeed > 0.4) {
                whereToTransitionTo = touchDirection;
                transitioningToNewPage = true;
            } else if (touchSpeed == 0) {
                whereToTransitionTo = "up";
                transitioningToNewPage = true;
            } else {
                whereToTransitionTo = "up";
                transitioningToNewPage = false;
            }


            if (isTransitioning == true) {
                $(".tfc-view--home").addClass("tfc-view--transition-back");
                $(".tfc-view--detail").addClass("tfc-view--transition-back");

                var transitionDuration = Math.max(Math.min(1 - touchSpeed, 0.6), 0.2);
                $(".tfc-view--home").css("transition-duration", 0.5);
                $(".tfc-view--detail").css("transition-duration", 0.5);

                if (whereToTransitionTo === "up") {
                    $(".tfc-view--detail").css("transform", "");
                    $(".tfc-view--home").css("opacity", "");
                    $(".tfc-view--home").css("transform", "");
                } else {
                    $(".tfc-view--detail").css("transform", "");
                    $(".tfc-view--home").css("opacity", "");
                    $(".tfc-view--home").css("transform", "");
                    $("body").removeClass("tfc--viewstate-detail");
                    var stateObj = { foo: "bar" };
                    history.replaceState(stateObj, "Home", "?home");
                }

                setTimeout(function() {
                    $(".tfc-view--home").removeClass("tfc-view--transition-back");
                    $(".tfc-view--detail").removeClass("tfc-view--transition-back");
                }, 630);
            }
        }

        // ScrollHack Stuff
        $(this).css("transform", "translateY(0px)");
        $(this).removeClass("tfc-scrollview--locked");

        if ($(this).data("moved") == false) {
            if ($(this).data("scrollhack") == "plus") {
                this.scrollTop = 0;
            }
            if ($(this).data("scrollhack") == "minus") {
                this.scrollTop += 1;
            }
        }
        $(this).data("scrollhack", false);
        $(this).data("moved", false);
    });

    $(".tfc-scrollview--searchresults").bind('scroll', function() {
        $(".tfc-navbar-search-input").blur();
    });






    // Transitioning to Detail View
    $(".tfc-list-item--classic").click(function(e) {
        e.stopPropagation();

        var stateObj = { foo: "bar" };
        history.pushState(stateObj, "Detail Page", "?detail");

        $("body").addClass("tfc--prepare-viewstate-detail");
        $(".tfc-view--home").addClass("tfc-view--transition");
        $(".tfc-view--detail").addClass("tfc-view--transition");
        setTimeout(function() {
            $("body").addClass("tfc--viewstate-detail");

            // Init Detail View
            a = parseInt($(".tfc-h1--detail").css('transform').split(/[()]/)[1].split(',')[5],10);
            $(".tfc-h1--detail").data("originalOffsetY", a);

            b = parseInt($(".tfc-filter-button").css('transform').split(/[()]/)[1].split(',')[5],10);
            $(".tfc-filter-button").data("originalOffsetY", b);

            c = parseInt($(".tfc-navbar-border--detail").css('transform').split(/[()]/)[1].split(',')[5],10);
            $(".tfc-navbar-border--detail").data("originalOffsetY", c);

        }, 50);
        setTimeout(function() {
            $(".tfc-view--home").removeClass("tfc-view--transition");
            $(".tfc-view--detail").removeClass("tfc-view--transition");
        }, 630);
    });

    $(window).bind("popstate", function() {
        $(".tfc-view--detail").removeClass("tfc-view--transition");
        $("body").removeClass("tfc--prepare-viewstate-detail");
        $("body").removeClass("tfc--viewstate-detail");
    });

    // $(".tfc-departing-now").bind('animationiteration', function() {
    //     if ($(this).html() == 0) {
    //         $(this).html(59);
    //     } else {
    //         $(this).html($(this).html() - 1);
    //     }
    // });


    $(".tfc-navbar--home").bind('touchmove', function(e) {
        e.preventDefault();
    });

    $(".tfc-navbar--detail").bind('touchmove', function(e) {
        e.preventDefault();
    });
}