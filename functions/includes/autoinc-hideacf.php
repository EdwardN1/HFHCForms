<?php
/**
 * Created by PhpStorm.
 * User: Edward Nickerson
 * Date: 21/01/2019
 * Time: 18:20
 */

add_filter('acf/settings/show_admin', 'show_acf');

function show_acf() {
    $current_user = wp_get_current_user();
	$ret = true;
	$email = (string) $current_user->user_email;
	if($email != 'edward@technicks.com') {
		$ret = false;
	}
	return $ret;
}