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
        $(this).css("padding-top", ($(this).parent().siblings(".tfc-navbar").height()) + "px");
    });

    $(".tfc-navbar").each(function() {
        $(this).data("originalHeight", $(this).height());
        $(this).data("minHeight", parseInt($(this).css('min-height'),10));
        $(this).data("maxHeight", parseInt($(this).css('max-height'),10));
    });




    // Navbar Searching
    $(".tfc-navbar-search-overlay-button").click(function(e) {
        e.stopPropagation();
        $("body").addClass("tfc--prepare-viewstate-search");
        setTimeout(function() {
            $("body").addClass("tfc--viewstate-search");
        }, 50);

        $(".tfc-navbar-search-input").focus();
    })

    $(".tfc-navbar-search-button").click(function() {
        $("body").removeClass("tfc--viewstate-search");
        setTimeout(function() {
            $("body").removeClass("tfc--prepare-viewstate-search");
        }, 520);
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
    $(".tfc-scrollview").bind('touchstart', function(e) {
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

    $(".tfc-scrollview").bind('touchmove', function(e) {
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
        var stationName = $(".tfc-h1--detail");
        var stationdepartures = $(".tfc-station-departures-list");
        var minHeight = navbar.data("minHeight");
        var originalHeight = navbar.data("originalHeight");
        var newHeight = originalHeight - scrollTop;

        navbar.height(newHeight);

        navbarBorder.css("opacity", function() {
            return scrollTop / 100;
        });

        var s = Math.min(Math.max(1 - (scrollTop - 20)/200, 0.7), 1);

        stationName.css("transform", "scale("+ s +")");
        // stationdepartures.css("transform", "scale("+ s +")");


        if (scrollTop > 1) {
            navbar.addClass("tfc-navbar--fixed");
        } else {
            navbar.removeClass("tfc-navbar--fixed");
        }
    });


    $(".tfc-scrollview").bind('touchend', function() {
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
                }

                setTimeout(function() {
                    $(".tfc-view--home").removeClass("tfc-view--transition-back");
                    $(".tfc-view--detail").removeClass("tfc-view--transition-back");
                }, 630);
            }
        }

        // ScrollHack Stuff
        $(".tfc-scrollview").css("transform", "translateY(0px)");
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
        $("body").addClass("tfc--prepare-viewstate-detail");
        $(".tfc-view--home").addClass("tfc-view--transition");
        $(".tfc-view--detail").addClass("tfc-view--transition");
        setTimeout(function() {
            $("body").addClass("tfc--viewstate-detail");
        }, 50);
        setTimeout(function() {
            $(".tfc-view--home").removeClass("tfc-view--transition");
            $(".tfc-view--detail").removeClass("tfc-view--transition");
        }, 630);
    })

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