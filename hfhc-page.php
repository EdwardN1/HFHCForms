<?php
// Template Name: HFHC Page

$header = file_get_contents('https://hfhc.making.me.uk/wp-json/tc_tap/v1/header/');
$header = str_replace('href="/','href="https://hfhc.making.me.uk/',$header);
echo $header;
//get_header();
?>
<?php wp_head(); ?>
<div class="content grid-container">

		<div class="inner-content grid-x grid-margin-x grid-padding-x">

		    <main class="main small-12 large-12 medium-12 cell" role="main">

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

		</div> <!-- end #inner-content -->

	</div> <!-- end #content -->

<?php
$footer = file_get_contents('https://hfhc.making.me.uk/wp-json/tc_tap/v1/footer/');
$footer = str_replace('href="/','href="https://hfhc.making.me.uk/',$footer);
wp_footer();
?>
<style>
    .gform_wrapper .gf_progressbar_percentage span {
        font-size: 14px;
    }
</style>
<?php
echo $footer;

//get_footer();
?>