<?php
/**
 * Created by PhpStorm.
 * User: Edward Nickerson
 * Date: 22/05/2019
 * Time: 11:04
 */


//The following declaration targets field 36 in form 3 which should be The Employment History List
//add_filter( 'gform_field_validation_3_148', 'validate_employment_history', 10, 4 );

add_filter( 'gform_field_validation', 'substitute_messages', 10, 4 );

function substitute_messages( $result, $value, $form, $field ) {
	if(! $result['is_valid']) {
		if($result['message'] == 'Please enter a minimum of 1 another job') {
			$result['message'] = 'Please add at least one job or break';
		}
	}

	return $result;
}

if(have_rows('check_for_date_gaps_in_these_fields','option')) {
	while (have_rows('check_for_date_gaps_in_these_fields','option')): the_row();
		$form_number = get_sub_field('form_number');
		$field_number = get_sub_field('f_number');
		add_filter( 'gform_field_validation_'.$form_number.'_'.$field_number, 'validate_employment_history', 10, 4 );
	endwhile;
}

function validate_employment_history( $result, $value, $form, $field ) {
	if(! $result['is_valid'] && $result['message'] == 'Please enter a minimum of 1 another job.') {
		$result['message'] = 'Please add at least one job or break';
	}
    $current_form_entry = rgpost( 'input_'.$field->id );
    $dob = strtotime(rgpost( 'input_7' ));
    $ageAt18 = strtotime('+18 years',$dob);
    //error_log('DOB = '. date('Y-m-d',$dob).' | at 18 = '.date('Y-m-d',$ageAt18));
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
	    //error_log('$entries size = '.sizeof($entries));
	    if(sizeof($entries!=0)) {
		    if(date_gaps($arr)) {
			    $result['is_valid'] = false;
			    $result['message']  = 'There are gaps in your Employment history. You need to account for all your time in Employment or on a Break since you were 18 years old.';
		    }
	    } else {
		    $result['is_valid'] = false;
		    $result['message']  = 'Please enter your employment history.';
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
            //error_log("key " . $i . " to " . ($i+1) .". Missing " .$diff . " seconds");
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
