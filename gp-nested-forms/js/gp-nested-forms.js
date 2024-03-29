/**
* Nested Forms, mama!
*/

( function( $ ) {

	window.GPNestedForms = function( args ) {

		var self = this;

		// copy all args to current object: formId, fieldId
		for( prop in args ) {
			if( args.hasOwnProperty( prop ) )
				self[prop] = args[prop];
		}

		self.init = function() {

			self.id = self.getDebugId();

			self.initSession();

			// Handle init when form is reloaded via AJAX.
			if( typeof window[ 'GPNestedForms_{0}_{1}'.format( self.formId, self.fieldId ) ] !== 'undefined' ) {
				var oldGPNF = window[ 'GPNestedForms_{0}_{1}'.format( self.formId, self.fieldId ) ];
				self.entries = oldGPNF.entries;
				oldGPNF.modal.destroy();
				$( document ).off( '.{0}'.format( self.getNamespace() ) );
				gform.removeFilter( 'gform_calculation_formula', 10, 'gpnf_{0}_{1}'.format( self.formId, self.fieldId ) );
				/* Hack: fixes issue when Beaver Builder triggers ready event again without reloading UI */
				self.viewModel = oldGPNF.viewModel;
			}

			self.$parentFormContainer = $( '#gform_wrapper_{0}'.format( self.formId ) );
			self.$fieldContainer      = $( '#field_{0}_{1}'.format( self.formId, self.fieldId ) );
			self.$modalSource         = $( '.gpnf-nested-form-{0}-{1}'.format( self.formId, self.fieldId ) );
			self.formHtml             = self.getFormHtml();

			self.initModal();
			self.addColorStyles();
			self.initKnockout();
			self.initCalculations();

			window[ 'GPNestedForms_{0}_{1}'.format( self.formId, self.fieldId ) ] = self;

		};

		self.initSession = function() {
			$.post( self.ajaxUrl, self.sessionData, function( response ) { } );
		};

		self.initModal = function() {

			self.modalArgs = gform.applyFilters( 'gpnf_modal_args', {
				labels: self.modalLabels,
				colors: self.modalColors,
				footer: true,
				stickyFooter: self.modalStickyFooter,
				closeMethods: [ 'button' ],
				cssClass: [ self.modalClass, 'gpnf-modal', 'gpnf-modal-{0}-{1}'.format( self.formId, self.fieldId ) ],
				onOpen: function() { },
				onClose: function() {
					self.clearModalContent();
				},
				beforeOpen: function() { },
				beforeClose: function() { return true; }
			}, self.formId, self.fieldId, self );

			if( self.modal ) {
				self.$modal = $( self.modal.modal );
				return;
			}

			self.modal = new tingle.modal( self.modalArgs );
			self.$modal = $( self.modal.modal );

			self.bindResizeEvents();

			// Re-init modaled forms; 'gpnf_post_render' triggered on any nested form's first load every time a nested
			// form is retrieved via ajax (aka editing, first load and each page load).
			$( document ).on( 'gpnf_post_render.{0}'.format( self.getNamespace() ), function( event, formId, currentPage ) {

				var $nestedForm = $( '#gform_wrapper_' + formId );

				if( formId == self.nestedFormId && $nestedForm.length > 0 ) {

					$( document ).trigger( 'gform_post_render', [ self.nestedFormId, currentPage ] );

					self.scrollToTop();

					// Don't re-init buttons on the confirmation page; currentPage is undefined on the confirmation page.
					if( currentPage ) {
						self.handleParentMergeTag();
						self.addModalButtons();
						self.observeDefaultButtons();
					}

				}

			} );

		};

		self.initKnockout = function() {

			// Click handler for add entry button.
			$( document ).on( 'click.{0}'.format( self.getNamespace() ), '#field_{0}_{1} .gpnf-add-entry'.format( self.formId, self.fieldId ), self.openAddModal );

			// Setup Knockout to handle our Nested Form field entries.
			if( ! self.isBound( self.$fieldContainer[0] ) ) {
				self.viewModel = new EntriesModel( self.prepareEntriesForKnockout( self.entries ), self );
				ko.applyBindings( self.viewModel, self.$fieldContainer[0] );
			}

		};

		self.initCalculations = function() {

			gform.addFilter( 'gform_calculation_formula', self.parseCalcs, 10, 'gpnf_{0}_{1}'.format( self.formId, self.fieldId ) );
			self.runCalc( self.formId );

		};

		self.openAddModal = function( event ) {

			event.preventDefault();

			self.setModalContent();
			self.openModal();

		};

		self.openModal = function() {
			self.modal.open();
			self.initFormScripts();
		};

		self.scrollToTop = function() {
			// Scroll back to the top of the modal when a new page is loaded or there is a validation error.
			var modalContainerNode = $( self.modal.modal )[0];
			if( modalContainerNode.scroll ) {
				modalContainerNode.scroll( { top: 0, left: 0, behavior: 'smooth' } );
			} else {
				modalContainerNode.scrollTop = 0;
			}
		};

		self.observeDefaultButtons = function() {
			var observer = self.getDefaultButtonObserver();
			self.getDefaultButtons().each( function() {
				observer.observe( $( this )[0], { attributes: true, childList: true } );
			} );
		};

		self.getDefaultButtonObserver = function() {
			return new MutationObserver( function( mutations ) {
				mutations.forEach(function(mutation) {
					if( mutation.type == 'attributes' && mutation.attributeName == 'style' ) {
						self.addModalButtons();
					}
				} );
			} );
		};

		self.setModalContent = function( html, mode ) {

			self.setMode( typeof mode === 'undefined' ? 'add' : 'edit' );

			$( self.modal.modalBoxContent )
				.html( typeof html !== 'undefined' ? html : self.formHtml )
				.prepend( '<div class="gpnf-modal-header" style="background-color:{1}">{0}</div>'.format( self.getModalTitle(), self.modalHeaderColor ) );

			self.$modal.find( 'input[name="gpnf_nested_form_field_id"]' ).val( self.fieldId );

			self.addModalButtons();
			self.stashFormData();

			var observer = self.getDefaultButtonObserver();
			self.getDefaultButtons().each( function() {
				observer.observe( $( this )[0], { attributes: true, childList: true } );
			} );

		};

		self.clearModalContent = function() {
			$( self.modal.modalBoxContent ).html( '' );
		};

		self.setMode = function( mode ) {
			self.mode = mode;
		};

		self.getMode = function() {
			return self.mode ? self.mode : 'add';
		};

		self.getModalTitle = function() {
			return self.getMode() === 'add' ? self.modalArgs.title : self.modalArgs.editTitle;
		};

		self.addModalButtons = function() {

			self.modal.modalBoxFooter.innerHTML = '';

			self.modal.addFooterBtn( self.modalArgs.labels.cancel, 'tingle-btn tingle-btn--default gpnf-btn-cancel', function() {
				self.handleCancelClick( $( this ) );
			} );

			self.getDefaultButtons().each( function() {
				var $button = $( this );
				if( $button.css( 'display' ) !== 'none' ) {

					var label   = $button.attr( 'type' ) === 'submit' ? self.getModalTitle() : $button.val(),
						classes = [ 'tingle-btn', 'tingle-btn--primary' ];

					if( $button.hasClass( '.gform_previous_button' ) ) {
						classes.push( 'gpnf-btn-previous' );
					} else if( $button.hasClass( '.gform_next_button' ) ) {
						classes.push( 'gpnf-btn-next' );
					} else {
						classes.push( 'gpnf-btn-submit' );
					}

					self.modal.addFooterBtn( label, classes.join( ' ' ), function( event ) {
						$( event.target ).addClass( 'gpnf-spinner' );
						$button.click();
					} );

				}
			} );

			self.modal.addFooterBtn( self.modalArgs.labels.cancel, 'tingle-btn tingle-btn--default gpnf-btn-cancel-mobile', function() {
				self.handleCancelClick( $( this ) );
			} );

			// If we're in edit mode - AND - there is a form, show the delete button. Otherwise, we're showing an error message.
			if( self.mode == 'edit' && $( self.modal.modalBoxContent ).find( '.gform_wrapper' ).length > 0 ) {
				self.modal.addFooterBtn( self.modalArgs.labels.delete, 'tingle-btn tingle-btn--danger tingle-btn--pull-left gpnf-btn-delete', function() {
					var $button = $( this );
					if ( ! $button.data( 'isConfirming' ) ) {
						$button
							.data( 'isConfirming', true )
							.text( self.modalArgs.labels.confirmAction );
						setTimeout( function() {
							$button
								.data( 'isConfirming', false )
								.text( self.modalArgs.labels.delete );
						}, 3000 );
					} else {
						self.getEntryRow( self.getCurrentEntryId() ).find( '.delete a' ).click();
						self.modal.close();
					}
				} );
			}

		};

		self.addColorStyles = function() {

			if( self.$style ) {
				self.$style.remove();
			}

			self.$style = '<style type="text/css"> \
					.gpnf-modal-{0}-{1} .tingle-btn--primary { background-color: {2}; } \
					.gpnf-modal-{0}-{1} .tingle-btn--default { background-color: {3}; } \
					.gpnf-modal-{0}-{1} .tingle-btn--danger { background-color: {4}; } \
				</style>'.format( self.formId, self.fieldId, self.modalArgs.colors.primary, self.modalArgs.colors.secondary, self.modalArgs.colors.danger );

			$( 'head' ).append( self.$style );

		};

		self.getDefaultButtons = function() {
			return $( '#gform_page_{0}_{1} .gform_page_footer, #gform_{0} .gform_footer'.format( self.nestedFormId, self.getCurrentPage() ) ).find( 'input[type="button"], input[type="submit"]' );
		};

		self.handleCancelClick = function( $button ) {
			if ( $button.data( 'isConfirming' ) ) {
				self.modal.close();
			} else if ( self.hasChanges() ) {
				$button
					.data( 'isConfirming', true )
					.removeClass( 'tingle-btn--default' )
					.addClass( 'tingle-btn--danger' )
					.text( self.modalArgs.labels.confirmAction );
				setTimeout( function() {
					$button
						.data( 'isConfirming', false )
						.removeClass( 'tingle-btn--danger' )
						.addClass( 'tingle-btn--default' )
						.text( self.modalArgs.labels.cancel );
				}, 3000 );
			} else {
				self.modal.close();
			}
		};

		self.setMode = function( mode ) {
			self.mode = mode;
		};

		self.getMode = function() {
			return self.mode ? self.mode : 'add';
		};

		self.getModalTitle = function() {
			return self.getMode() === 'add' ? self.modalTitle : self.editModalTitle;
		};

		self.stashFormData = function() {
			self.formData = self.$modal.find( 'form' ).serialize();
		};

		self.hasChanges = function() {
			return self.$modal.find( 'form' ).serialize() !== self.formData;
		};

		self.bindResizeEvents = function() {

			$( document ).on( 'gpnf_post_render.{0}'.format( self.getNamespace() ), function() {
				self.modal.checkOverflow();
			} );

			$( document ).on( 'gform_post_conditional_logic.{0}'.format( self.getNamespace() ), function( event, formId ) {
				if( self.nestedFormId == formId ) {
					self.modal.checkOverflow();
				}
			} );

			gform.addAction( 'gform_list_post_item_add', function() {
				self.modal.checkOverflow();
			} );

			gform.addAction( 'gform_list_post_item_delete', function() {
				self.modal.checkOverflow();
			} );

		};

		self.isBound = function( elem ) {
			return !! ko.dataFor( elem );
	    };

		self.prepareEntriesForKnockout = function( entries ) {
			for( var i = 0; i < entries.length; i++ ) {
				entries[i] = self.prepareEntryForKnockout( entries[i] );
			}
			return entries;
		};

		self.prepareEntryForKnockout = function( entry ) {

			// IE8 hack to fix recursive loop issue; props to Josh Casey
			var entryTemplate = $.extend( {}, entry );

			for( var prop in entryTemplate ) {
				if( entry.hasOwnProperty( prop ) ) {
					var item = entry[ prop ];
					if( item.label === false ) {
						item.label = '';
					}
                    entry['f' + prop] = item;
                }
			}

            return entry;
		};

		self.refreshMarkup = function() {

			$.post( self.ajaxUrl, {
				action: 'gpnf_refresh_markup',
				nonce: GPNFData.nonces.refreshMarkup,
				gpnf_parent_form_id: self.formId,
				gpnf_nested_form_field_id: self.fieldId
			}, function( response ) {
				self.formHtml = response;
			} );

		};

        self.editEntry = function( entryId, $trigger ) {

        	var $spinner = new AjaxSpinner( $trigger, self.spinnerUrl, '' );
	        $trigger.css( { visibility: 'hidden' } );

            $.post( self.ajaxUrl, {
                action: 'gpnf_edit_entry',
	            nonce: GPNFData.nonces.editEntry,
                gpnf_entry_id: entryId,
                gpnf_parent_form_id: self.formId,
                gpnf_nested_form_field_id: self.fieldId
            }, function( response ) {

            	$spinner.destroy();
	            $trigger.css( { visibility: 'visible' } );

	            self.setModalContent( response, 'edit' );
	            self.modal.open();
                self.initFormScripts();

            } );

        };

        self.deleteEntry = function( item, $trigger ) {

	        var $spinner = new AjaxSpinner( $trigger, self.spinnerUrl, '' );
	        $trigger.css( { visibility: 'hidden' } );

        	$.post( self.ajaxUrl, {
		        action: 'gpnf_delete_entry',
		        nonce:  GPNFData.nonces.deleteEntry,
		        gpnf_entry_id: item.id
	        }, function( response ) {

		        $spinner.destroy();
		        $trigger.css( { visibility: 'visible' } );

		        if( ! response ) {
			        console.log( 'Error: no response.' );
			        return;
		        } else if( ! response.success ) {
			        console.log( 'Error:' + response.data );
			        return;
		        }

		        // Success!
		        self.viewModel.entries.remove( item );

		        self.refreshMarkup();

	        } );

        };

        self.getFormHtml = function() {

            // check stash for HTML first, required for AJAX-enabled parent forms
            var formHtml = self.$modalSource.data( 'formHtml' );
            if( ! formHtml ) {
                formHtml = self.$modalSource.html();
            }

            // stash for AJAX-enabled parent forms
            self.$modalSource.data( 'formHtml', formHtml );

            // clear the existing markup to prevent tabindex and script conflicts from multiple IDs existing in the same DOM
            self.$modalSource.html( '' );

            return formHtml;
        };

        self.initFormScripts = function( currentPage ) {

            $( document ).trigger( 'gform_post_render', [ self.nestedFormId, 1 ] );

            if( window['gformInitDatepicker'] ) {
                gformInitDatepicker();
            }

            self.handleParentMergeTag();

        };

		/**
		 * We really need a better way to trigger calculations.
		 */
		self.runCalc = function() {
			$( document ).trigger( 'gform_post_conditional_logic', [ self.formId, [], false ]  );
		};

		self.parseCalcs = function( formula, formulaField, formId, calcObj ) {

			var matches = getMatchGroups( formula, /{[^{]*?:([0-9]+):(sum|total|count)=?([0-9]*)}/i );
			$.each( matches, function( i, group ) {

				var search            = group[0],
					nestedFormFieldId = group[1],
					func              = group[2],
					targetFieldId     = group[3],
					replace           = 0;

				if( nestedFormFieldId != self.fieldId ) {
					return;
				}

				switch( func ) {
					case 'sum':
						var total = 0;
						self.viewModel.entries().forEach( function( entry ) {
							var value = 0;
							if( typeof entry[ targetFieldId ] !== 'undefined' ) {
								value = entry[ targetFieldId ].value ? entry[ targetFieldId ].value : 0;
							}
							total += parseFloat( value );
						} );
						replace = total;
						break;
					case 'total':
						var total = 0;
						self.viewModel.entries().forEach( function( entry ) {
							total += parseFloat( entry.total );
						} );
						replace = total;
						break;
					case 'count':
						replace = self.viewModel.entries().length;
						break;
				}

				formula = formula.replace( search, replace );

			} );

			return formula;
		};

		self.handleParentMergeTag = function () {

			self.$modal.find(':input').each(function () {
				var $this = $(this);
				var value = $this.data('gpnf-value');

				if ($this.data('gpnf-changed')) {
					return true;
				}

				if (!value) {
					return true;
				}

				var parentMergeTagMatches = /{Parent:(\d+(\.\d+)?)}/gi.exec(value);

				if (!parentMergeTagMatches) {
					return true;
				}

				var inputId = parentMergeTagMatches[1];

				if (isNaN(inputId)) {
					return true;
				}

				var $parentInput = self.$parentFormContainer.find('#input_' + self.formId + '_' + inputId.split('.').join('_'));
				if( $parentInput.hasClass( 'gfield_radio' ) ) {
					$parentInput = $parentInput.find( 'input:checked' );
				}

				var currentValue = $(this).val(),
					/**
					 * Filter the value of the parent merge tag before it is replaced in the field.
					 *
					 * @since 1.0-beta-8.0
					 *
					 * @param string          value           Value that will replace the parent merge tag in the field.
					 * @param float           inputId         ID of the field/input targeted by the parent merge tag.
					 * @param int             formId          ID of the current form.
					 * @param {GPNestedForms} gpnf            Current instance of the GPNestedForms object.
					 */
					parentValue = gform.applyFilters( 'gpnf_parent_merge_tag_value', $parentInput.val(), inputId, self.formId, self );

				if (currentValue != parentValue) {
					$(this).val(parentValue).change();
				}

				$(this).on('change', function () {
					$(this).data('gpnf-changed', true);
				});
			});

		};

		self.getCurrentPage = function() {
			var currentPage = $( '#gform_source_page_number_{0}'.format( self.nestedFormId ) ).val();
			return Math.max( 1, parseInt( currentPage ) );
		};

		self.getCurrentEntryId = function() {
			return self.$modal.find( 'input[name="gpnf_entry_id"]' ).val()
		};

		self.getEntryRow = function( entryId ) {
			return $( '.gpnf-nested-entries [data-entryid="' + entryId + '"]' );
		};

		self.getDebugId = function() {
			return 'xxxxxxxx'.replace( /[xy]/g, function ( c ) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
				return v.toString( 16 );
			} );
		};

		self.getNamespace = function() {
			return 'gpnf-{0}-{1}'.format( self.formId, self.fieldId );
		};

		/**
		 * Static function called via the confirmation of the nested form. Loads the newly created entry into the
		 * Nested Form field displayed on the parent form.
		 *
		 * @param args
		 */
		GPNestedForms.loadEntry = function( args ) {

			/** @var \GPNestedForms gpnf */
			var gpnf = window[ 'GPNestedForms_{0}_{1}'.format( args.formId, args.fieldId ) ];

			entry = gpnf.prepareEntryForKnockout( args.fieldValues );
			entry.id = args.entryId;

			// edit
			if( args.mode == 'edit' ) {

				// get index of entry
				var entryEditing = self.getEntryRow( entry.id );
				var replacementIndex = entryEditing.index();

				// remove old entry, add updated
				gpnf.viewModel.entries.remove( function( item ) { return item.id == entry.id } );
				gpnf.viewModel.entries.splice( replacementIndex, 0, entry );

			}
			// add
			else {


				gpnf.viewModel.entries.push( entry );
				gpnf.refreshMarkup();

			}

			gpnf.modal.close();

		};

		self.init();

	};

	var EntriesModel = function( entries, gpnf ) {

        var self = this;

        self.entries = ko.observableArray( entries );

        self.isMaxed = ko.computed( function() {
        	var max = gform.applyFilters( 'gpnf_entry_limit_max', gpnf.entryLimitMax, gpnf.formId, gpnf.fieldId, gpnf );

	        return max !== '' && self.entries().length >= max;
        } );

        self.entryIds = ko.computed( function() {
            var entryIds = [];
            $.each( self.entries(), function( i, item ) {
                entryIds.push( item.id );
            } );
            return entryIds;
        }, self );

        /**
		 * Run calculations anytime entries modified.
		 */
		self.runCalc = ko.computed( function() {
	        gpnf.runCalc();
	        return self.entries().length;
        }, self );

        self.editEntry = function( item, event ) {
            gpnf.editEntry( item.id, $( event.target ) );
        };

        self.deleteEntry = function( item, event ) {
			gpnf.deleteEntry( item, $( event.target ) );
        };

    };

	/**
	 * Event Handler
	 *
	 * GPNF outputs all inline scripts to the footer for the Nested Form. This means that scripts binding directly to
	 * the document gform_post_render event will trigger before GF's default gform_post_render function which handles
	 * setting various form data (i.e. conditional logic, number formats). If those scripts are using that data it will
	 * generate errors since that data has not yet been defined.
	 *
	 * Our first attempt at solving this involved using $._data() to prioritize our namespaced gform_post_render functions.
	 * This proved to be unreliable (though I'd be willing to revisit).
	 *
	 * Our current solution is the Event Handler. We bind to gform_post_render as early as possible (see
	 * GP_Nested_Forms::handle_event_handler()) and call our gpnfEventHandler(). This function will
	 * a) get an array of all of our namespaced gform_post_render.gpnf bindings
	 * b) unbind them, and
	 * c) call them any time this function is called.
	 *
	 * To recreate, enable the Gravity Forms Dependency Fields add-on on a nested form and disable this function.
	 */
	window.gpnfEventHandler = function( event, formId, currentPage ) {

		if( typeof window.gpnfEvents == 'undefined' ) {
			window.gpnfEvents = [];
		}

		if( window.gpnfEvents.length == 0 ) {
			var events = $._data( document ).events.gform_post_render;
			$.each( events, function( index, event ) {
				if( event.namespace == 'gpnf' ) {
					window.gpnfEvents.push( event.handler );
				}
			} );
			$( document ).off( 'gform_post_render.gpnf' );
		}

		$.each( window.gpnfEvents, function( index, event ) {
			event( event, formId, currentPage );
		} );

	};



    // # GENERAL HELPERS

	function AjaxSpinner( elem, imageSrc, inlineStyles ) {

		imageSrc     = typeof imageSrc == 'undefined' || ! imageSrc ? gf_global.base_url + '/images/spinner.gif' : imageSrc;
		inlineStyles = typeof inlineStyles != 'undefined' ? inlineStyles : '';

		this.elem = elem;
		this.image = '<img class="gfspinner" src="' + imageSrc + '" style="' + inlineStyles + '" />';

		this.init = function() {
			this.spinner = jQuery(this.image);
			jQuery(this.elem).after(this.spinner);
			return this;
		};

		this.destroy = function() {
			jQuery(this.spinner).remove();
		};

		return this.init();
	}

} )( jQuery );
