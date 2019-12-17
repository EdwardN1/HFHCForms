<?php
/**
 * Created by PhpStorm.
 * User: Edward Nickerson
 * Date: 22/05/2019
 * Time: 11:04
 */


//The following declaration targets field 36 in form 3 which should be The Employment History List
add_filter( 'gform_field_validation_3_148', 'validate_employment_history', 10, 4 );

function validate_employment_history( $result, $value, $form, $field ) {
    /*if ( ! $result['is_valid'] && $result['message'] == 'This field is required. Please complete all fields.' ) {
        //address failed validation because of a required item not being filled out
        //do custom validation
        $street  = rgar( $value, $field->id . '.1' );
        $street2 = rgar( $value, $field->id . '.2' );
        $city    = rgar( $value, $field->id . '.3' );
        $state   = rgar( $value, $field->id . '.4' );
        $zip     = rgar( $value, $field->id . '.5' );
        $country = rgar( $value, $field->id . '.6' );
        //check to see if the values you care about are filled out
        if ( empty( $street ) || empty( $city ) || empty( $state ) ) {
            $result['is_valid'] = false;
            $result['message']  = 'This field is required. Please enter at least a street, city, and state.';
        } else {
            $result['is_valid'] = true;
            $result['message']  = '';
        }
    }*/

    /**
     *  We can get the child entries from the cookie:
     */
   /* $cookie_name = 'gpnf_form_session_'.$form['id'];
    if ( isset( $_COOKIE[ $cookie_name ] ) ) {
        $cookie = json_decode( stripslashes( $_COOKIE[ $cookie_name ] ), true );
        $eFieldID = $cookie['hash'];
        if($eFieldID) {
            $search_criteria = array();
            $search_criteria['field_filters'][] = array( 'key' => 'gpnf_entry_parent_form', 'value' => $form['id'] );
            $search_criteria['field_filters'][] = array( 'key' => 'gpnf_entry_parent', 'value' => $eFieldID );
            $search_criteria['field_filters'][] = array( 'key' => 'gpnf_entry_nested_form_field', 'value' => '148' );
            $entries = GFAPI::get_entries( '5',$search_criteria);
            error_log(print_r($entries,true));
        }


    } else {
        error_log('$cookie_name ' .$cookie_name.' not found :(');
    }*/

    /**
     *  Or we can get them from GFFormsModel::get_current_lead()
     */

    /*$current_form_entry = GFFormsModel::get_current_lead();
    if($current_form_entry['148']) {
        $search_criteria = array();
        $sorting = array( 'key' => '4', 'direction' => 'ASC', 'is_numeric' => false );
        $search_criteria['field_filters']['mode'] = 'any';
        $eFieldIDs = explode(',', $current_form_entry['148']);
        foreach ($eFieldIDs as $eFieldID) {
            $search_criteria['field_filters'][] = array( 'key' => 'id', 'value' => $eFieldID );
        }
        $entries = GFAPI::get_entries( '5',$search_criteria,$sorting);
        $arr = array();

        foreach ($entries as $entry) {
            $fromDate = $entry['4']. ' 00:00:00';
            $toDate = $entry['5']. ' 23:59:59';
            $arr[] = array('from'=>$fromDate,'to'=>$toDate);
        }

        if(date_gaps($arr)) {
            $result['is_valid'] = false;
            $result['message']  = 'There are gaps in your Employment history please fill these in below.';
        }
    }*/

    /**
     *  Or we can get them from rgpost( 'input_148' )
     */

    $current_form_entry = rgpost( 'input_148' );
    $dob = strtotime(rgpost( 'input_7' ));
    $ageAt18 = strtotime('+18 years',$dob);
    error_log('DOB = '. date('Y-m-d',$dob).' | at 18 = '.date('Y-m-d',$ageAt18));
    if($current_form_entry) {
        $search_criteria = array();
        $sorting = array( 'key' => '4', 'direction' => 'ASC', 'is_numeric' => false );
        $search_criteria['field_filters']['mode'] = 'any';
        $eFieldIDs = explode(',', $current_form_entry);
        foreach ($eFieldIDs as $eFieldID) {
            $search_criteria['field_filters'][] = array( 'key' => 'id', 'value' => $eFieldID );
        }
        $entries = GFAPI::get_entries( '5',$search_criteria,$sorting);
        $arr = array();
	    $fromDate = date('Y-m-d',$dob). ' 00:00:00';
	    $toDate = date('Y-m-d',$ageAt18). ' 23.59.59';
	    $arr[] = array('from'=>$fromDate,'to'=>$toDate);
        foreach ($entries as $entry) {
            $fromDate = $entry['4']. ' 00:00:00';
            $toDate = $entry['5']. ' 23:59:59';
            $arr[] = array('from'=>$fromDate,'to'=>$toDate);
        }
	    $fromDate = date('Y-m-d'). ' 00:00:00';
	    $toDate = date('Y-m-d'). ' 23.59.59';
	    $arr[] = array('from'=>$fromDate,'to'=>$toDate);
        if(date_gaps($arr)) {
            $result['is_valid'] = false;
            $result['message']  = 'There are gaps in your Employment history. You need to account for all your time in Employment or on a Break since you were 18 years old.';
        }
    }

    return $result;
}

function date_gaps($arr) {
    $gap = false;
    For($i=0; $i<count($arr)-1; $i++){ //I count to -1 due to $i+1 in the calculation below
        $diff = strtotime ($arr[$i+1]['from']) - strtotime ($arr[$i]['to']);
        If($diff >1){ // if there is more than one second gap
            $gap = true;
            error_log("key " . $i . " to " . ($i+1) .". Missing " .$diff . " seconds");
        }
    }
    return $gap;
}

add_action('rest_api_init', function () {
    register_rest_route( 'hfhc/v1', 'application-form-entries/',array(
        'methods'  => 'GET',
        'callback' => 'get_all_application_form_entries'
    ));
});
function get_all_application_form_entries($request) {

    $formID = $request['formid'];
    $key = $request['key'];
    $secret = $request['secret'];
    $startDate = $request['start_date'];
    $endDate = $request['end_date'];
    $search_criteria = array();
    $search_criteria['start_date'] = $startDate;
    $search_criteria['end_date'] = $endDate;
    $validated = ($key=='ck_eaa609cb52781c972c240f29c09d862362ba20fc')&&($secret=='cs_2ac451c6374194900a5bdd0bc6e3cac7d5fbbd67');
    //error_log('$formid = '.$formID);
    if(empty($search_criteria)) {
        $entries = GFAPI::get_entries( $formID );
    } else {
        $entries = GFAPI::get_entries( $formID , $search_criteria);
    }


    if (empty($entries)||!($formID)||!$validated) {
        return new WP_Error( 'empty_entries', 'there are no entries', array('status' => 404) );

    }

    $response = new WP_REST_Response($entries);
    $response->set_status(200);

    return $response;
}
