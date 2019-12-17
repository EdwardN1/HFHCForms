<?php
// Template Name: Home From Homecare Page

$header = file_get_contents('https://www.homefromhomecare.com/wp-json/tc_tap/v1/header/');
$header = str_replace('href="/', 'href="https://www.homefromhomecare.com/', $header);
$header = str_replace('http://', 'https://', $header);
$header = str_replace('https://www.homefromhomecare.com/css/font/', get_template_directory_uri() . '/assets/styles/fonts/', $header);
//$header = str_replace("<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js?ver=1.9.1'></script>", '', $header);
//$header = str_replace("<script src=\"https://www.homefromhomecare.com/js/dist/app.min.js\" type=\"text/javascript\"></script>", '', $header);
//$header = str_replace('<script type="text/javascript" src=""></script>', '', $header);
//$header = str_replace('<head>', "<head><script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js?ver=1.12.4'></script>", $header);
$headerArray = explode('</head>', $header);
if (!empty($headerArray)) {
    echo $headerArray[0];
    wp_head();
    echo '<style>body{ background-image:url("https://www.homefromhomecare.com/css/img/ui/background-1400.jpg"); background-size: cover;}</style>';
    echo '</head>';
    echo $headerArray[1];
} else {
    echo $header;
}
//get_header();
?>
<?php //wp_head(); ?>


            <main class="main" role="main">

                <?php

                /* Start the Loop */
                while ( have_posts() ) :
                    the_post();

                    get_template_part( 'template-parts/content/content', 'page' );

                    // If comments are open or we have at least one comment, load up the comment template.
                    /*if ( comments_open() || get_comments_number() ) {
                        comments_template();
                    }*/

                endwhile; // End of the loop.
                ?>

            </main> <!-- end #main -->

            <?php //get_sidebar(); ?>



<?php
$footer = file_get_contents('https://www.homefromhomecare.com/wp-json/tc_tap/v1/footer/');
$footer = str_replace('href="/', 'href="https://www.homefromhomecare.com/', $footer);
$footer = str_replace('<script src="https://www.homefromhomecare.com/js/dist/app.min.js" type="text/javascript"></script>', '<script src="' . get_template_directory_uri() . '/assets/theme-files/old-hfhc/app-new.js" type="text/javascript"></script>', $footer);
//$footer = str_replace("<script src=\"https://www.homefromhomecare.com/js/dist/app.min.js\" type=\"text/javascript\"></script>", '', $footer);
//$footer = str_replace("<script type='text/javascript' src='https://hfhcforms.making.me.uk/wp-includes/js/jquery/ui/datepicker.min.js?ver=1.11.4'></script>", '', $footer);
//$footer = str_replace("<script type='text/javascript' src='https://hfhcforms.making.me.uk/wp-content/plugins/gravityforms/js/datepicker.min.js?ver=2.4.9.2'></script>", '', $footer);
$footerArray = explode('<script src="https://www.homefromhomecare.com/js/dist/slick.min.js" type="text/javascript"></script>', $footer);
if (!empty($footerArray)) {
    echo $footerArray[0];
    ?>
    <style>
        .menu .button, .menu a {
            padding: 7px 0;
        }
        .footer {
            margin-top: 0;
        }
        .entry-content.row {
            margin-top: -25px;
        }
    </style>
    <?php
    wp_footer();
    echo '<script src="https://www.homefromhomecare.com/js/dist/slick.min.js" type="text/javascript"></script>';
    echo $footerArray[1];
} else {
    echo $footer;
}


//get_footer();
?>