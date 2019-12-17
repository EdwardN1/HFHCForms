jQuery(document).ready(function ($) {
    function js() {
        var e = document.getElementsByTagName("html")[0], s = "js", a = "no-js";
        e.classList ? (e.classList.add(s), e.classList.remove(a)) : (e.className += " " + s, e.className = e.className.replace(new RegExp("(^|\\b)" + a.split(" ").join("|") + "(\\b|$)", "gi"), " "))
    }

    function mobileMenu() {
        var e = ($(".js-menu-trigger"), $(".js-navigation"));
        e.toggleClass("js-menu-active")
    }

    window.onload = function () {
        js(), $(".js-menu-trigger").on("click", mobileMenu), $(".slideshow-container").fadeIn(750), $(".slideshow").slick({
            slide: ".slideshow__item",
            autoplay: !0,
            autoplaySpeed: 9e3,
            fade: !0,
            cssEase: "ease",
            pauseOnHover: !1,
            arrows: !0,
            dots: !0,
            prevArrow: '<span class="slick-prev">Prev</span>',
            nextArrow: '<span class="slick-next">Next</span>',
            appendArrows: ".slider-nav",
            appendDots: ".slider-nav"
        }), $(".open-popup").click(function () {
            $("#popUpDiv").modal({
                opacity: 60, overlayClose: !0, onShow: function () {
                    var e, s = $("body"), a = $("html"), l = s.outerWidth(!0), o = a.scrollTop();
                    $("html").css("overflow-y", "hidden"), e = $("body").outerWidth(!0), s.css("margin-right", e - l + parseInt(oldBodyMarginRight) + "px"), a.scrollTop(o), $("#simplemodal-overlay").css("width", e + "px")
                }
            })
        }), $("#closeLink").click(function () {
        });
        var e = $(".vacancy-map a"), s = $(".location-select a"), a = s.filter(".view-all");
        e.click(function () {
            var l = $(this), o = $(".vacancy-table tbody tr"), t = l.attr("class").split(/\s+/);
            return l.hasClass("active") ? (o.show(), e.removeClass("active"), o.find("td").css("backgroundColor", "white"), o.filter(":odd").find("td").css("backgroundColor", "#eff7de"), s.removeClass("selected"), a.addClass("selected")) : (o.hide(), e.removeClass("active"), l.addClass("active"), $.each(t, function (e, s) {
                o.filter("." + s).show()
            }), o.find("td").css("backgroundColor", "white"), o.filter(":visible").filter(":odd").find("td").css("backgroundColor", "#eff7de")), !1
        }), s.click(function () {
            var e = $(this), l = $(".vacancy-table tbody tr"), o = e.attr("class").split(/\s+/);
            return e.hasClass("view-all") ? (l.show(), s.removeClass("selected"), a.addClass("selected"), l.find("td").css("backgroundColor", "white"), l.filter(":odd").find("td").css("backgroundColor", "#eff7de")) : e.hasClass("selected") ? (e.removeClass("selected"), l.show(), a.addClass("selected")) : (s.removeClass("selected"), e.addClass("selected"), l.hide(), a.removeClass("selected"), $.each(o, function (e, s) {
                l.filter("." + s).show()
            }), l.find("td").css("backgroundColor", "white"), l.filter(":visible").filter(":odd").find("td").css("backgroundColor", "#eff7de")), !1
        })
    };
});