<?php

class GPNF_GravityView {

	private static $instance = null;

	public static function get_instance() {
		if( null == self::$instance ) {
			self::$instance = new self;
		}
		return self::$instance;
	}

	private function __construct() {

		add_action( 'gravityview_template_form_options', array( $this, 'add_widget_template_field' ), 10, 5 );

		add_action( 'gpnf_pre_nested_forms_markup', array( $this, 'remove_gravityview_edit_hooks' ) );
		add_action( 'gpnf_nested_forms_markup', array( $this, 'add_gravityview_edit_hooks' ) );

	}

	public function gravityview_edit_render_instance() {

		if ( ! method_exists( 'GravityView_Edit_Entry', 'getInstance' ) ) {
			return null;
		}

		$edit_entry_instance = GravityView_Edit_Entry::getInstance();
		$render_instance = $edit_entry_instance->instances['render'];

		return $render_instance;

	}

	/**
	 * GravityView adds a few hooks such as changing the submit buttons and changing the field value.
	 * These don't work well with the Nested Form so we need to temporarily unhook the filters/actions and re-add them.
	 */
	public function remove_gravityview_edit_hooks() {

		if ( $render_instance = $this->gravityview_edit_render_instance() ) {
			remove_filter( 'gform_submit_button', array( $render_instance, 'render_form_buttons') );
			remove_filter( 'gform_field_input', array( $render_instance, 'modify_edit_field_input') );
		}

	}

	public function add_gravityview_edit_hooks() {

		if ( $render_instance = $this->gravityview_edit_render_instance() ) {
			add_filter( 'gform_submit_button', array( $render_instance, 'render_form_buttons') );
			add_filter( 'gform_field_input', array( $render_instance, 'modify_edit_field_input'), 10, 5 );
		}

	}

	/**
	 * Add different templates for controlling how Nested Form fields are displayed in a GravityView.
	 */
	public function add_widget_template_field( $field_options, $template_id, $field_id, $context, $input_type ) {

		$field_options['gnf_template'] = array(
			'type'    => 'select',
			'label'   => __( 'GP Nested Forms Template:', 'gp-nested-forms' ),
			'desc'    => __( 'Select how the nested entries should be displayed.', 'gp-nested-forms' ),
			'options' => array(
				'simple'  => 'Simple',
				'summary' => 'Summary',
			),
			'class'   => 'widefat',
			'value'   => 'read',
		);

		return $field_options;

	}

}

function gpnf_gravityview() {
	return GPNF_GravityView::get_instance();
}
