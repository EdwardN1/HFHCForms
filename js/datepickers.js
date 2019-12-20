jQuery(document).ready(function ($) {
    for (i=1; i < 10; i++) {
        $('.date_'+i+' td[class*="_cell'+i+'"] input').addClass('datepicker');
    }

});