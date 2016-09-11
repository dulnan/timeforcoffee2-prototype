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

    // set padding
    $(".tfc-viewcontainer--with-navbar").css("padding-top", ($(".tfc-navbar").height() + 10) + "px");


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

    // Hacky Shit
    $(".tfc-viewcontainer").bind('touchstart', function(e) {
        $(this).data("moved", false);

        if (this.scrollTop == 0) {
            this.scrollTop = 1;
            $(this).css("transform", "translateY(1px)");
            $(this).data("scrollhack", "plus");
        } else if (this.scrollHeight === this.scrollTop + this.offsetHeight) {
            this.scrollTop -= 1;
            $(this).css("transform", "translateY(-1px)");
            $(this).data("scrollhack", "minus");
        } else {
            $(".tfc-viewcontainer").css("transform", "translateY(0px)");
        }
    });

    $(".tfc-viewcontainer").bind('touchmove', function(e) {
        $(this).data("moved", true);
    });

    $("#tfc-viewcontainer--home").bind('scroll', function(e) {
        var scrollTop = Math.min($(this).scrollTop(), 34);
        $(".tfc-navbar").css("transform", "translateY(-" + scrollTop + "px)");
    });

    $("#tfc-viewcontainer--home").bind('touchstart touchmove touchend', function(e) {
        var scrollTop = Math.min($(this).scrollTop(), 34);
        $(".tfc-navbar").css("transform", "translateY(-" + scrollTop + "px)");
    });

    $(".tfc-viewcontainer").bind('touchend', function() {
        $(".tfc-viewcontainer").css("transform", "translateY(0px)");

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

    $(".tfc-navbar").bind('touchmove', function(e) {
        e.preventDefault();
    });
}