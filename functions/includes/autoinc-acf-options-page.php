<?php
// ******************* ACF Options Page ****************** //

if (function_exists('acf_add_options_page')) {

    acf_add_options_page(array(
        'page_title' => 'Theme General Settings',
        'menu_title' => 'Theme Settings',
        'menu_slug' => 'theme-general-settings',
        'capability' => 'edit_posts',
        'redirect' => false
    ));

    $current_user = wp_get_current_user();

    if ($current_user->user_email == 'edward@technicks.com') {
        acf_add_options_page(array(
            'page_title' => 'Master Page Settings',
            'menu_title' => 'Master Page Settings',
            'menu_slug' => 'master-page-settings',
            'capability' => 'edit_posts',
            'redirect' => false
        ));
    }

}

function get_icon($name)
{
    $res = '';
    if (have_rows('icons', 'option')):
        while (have_rows('icons', 'option')): the_row();
            $iname = get_sub_field('name');
            $icon = get_sub_field('icon');
            if ($iname == $name) {
                $res = $icon['url'];
            }
        endwhile;
    endif;

    return $res;
}

function get_secondary_logo($name)
{
    $res = '';
    if (have_rows('secondary_logos', 'option')):
        while (have_rows('secondary_logos', 'option')): the_row();
            $iname = get_sub_field('name');
            $icon = get_sub_field('logo');
            if ($iname == $name) {
                $res = $icon['url'];
            }
        endwhile;
    endif;

    return $res;
}

function get_social_media($name)
{
    $res = array();
    if (have_rows('social_media_sites', 'option')):
        while (have_rows('social_media_sites', 'option')): the_row();
            $iname = get_sub_field('name');
            $icon = get_sub_field('icon');
            $icon_reversed = get_sub_field('icon_reversed');
            $link = get_sub_field('link');
            $sharing_link = get_sub_field('sharing_link');
            $include = get_sub_field('include');
            if (($iname == $name)&&$include) {
                $res['icon'] = $icon['url'];
                $res['icon-reversed'] = $icon_reversed['url'];
                $res['link'] = $link;
                $res['sharing-link'] = $sharing_link;
            }
        endwhile;
    endif;

    return $res;
}