<?php
// Template Name: HFHC Midlands Page
wp_dequeue_style( 'site-css' );
$header = file_get_contents('https://hfhcmidlands.com/wp-json/tc_tap/v1/header/');
$header = str_replace('href="/','href="https://hfhcmidlands.com/',$header);
$header = str_replace('https://hfhcmidlands.com/wp-content/themes/hfhcmidlands/style.css',get_template_directory_uri() .'/assets/theme-files/hfhc-midlands/style.css',$header);
$header = str_replace('https://hfhcmidlands.com/wp-content/themes/flatsome/assets/css/fl-icons.css',get_template_directory_uri() . '/assets/theme-files/hfhc-midlands/fl-icons.css',$header);
echo $header;
//get_header();
?>
<?php wp_head(); ?>


                <section id="primary" class="content-area">
                    <main id="main" class="site-main">
                        <div id="page-header-42516968" class="page-header-wrapper">
                            <div class="page-title dark simple-title">

                                <div class="page-title-bg">
                                    <div class="title-bg fill bg-fill parallax-active" data-parallax-container=".page-title" data-parallax-background="" data-parallax="-">
                                    </div>
                                    <div class="title-overlay fill"></div>
                                </div>

                                <div class="page-title-inner container align-bottom flex-row medium-flex-wrap">
                                    <div class="title-wrapper is-xxlarge flex-col text-left medium-text-center">
                                        <h1 class="entry-title mb-0">
                                            Job Application          </h1>
                                    </div>
                                    <div class="title-content flex-col flex-right text-right medium-text-center">
                                        <div class="title-breadcrumbs pb-half pt-half"></div>      </div>
                                </div><!-- flex-row -->


                                <style scope="scope">

                                    #page-header-42516968 .page-title-inner {
                                        min-height: 350px;
                                    }
                                    #page-header-42516968 .title-bg {
                                        background-image: url(https://hfhcmidlands.com/wp-content/uploads/2018/07/interview.jpeg);
                                    }
                                </style>
                            </div><!-- .page-title -->
                        </div>

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

                    </main><!-- #main -->
                </section><!-- #primary -->

<?php
$footer = file_get_contents('https://hfhcmidlands.com/wp-json/tc_tap/v1/footer/');
$footer = str_replace('href="/','href="https://hfhcmidlands.com/',$footer);

wp_footer();
echo $footer;

//get_footer();
?>