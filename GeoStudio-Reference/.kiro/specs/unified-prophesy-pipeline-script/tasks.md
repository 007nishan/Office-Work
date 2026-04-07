# Implementation Plan: Unified Prophesy Pipeline TamperMonkey Script

## Overview

This implementation plan breaks down the unified Prophesy Pipeline script into discrete coding tasks. The script consolidates 10 individual TamperMonkey scripts into a single unified solution with a vertical button panel, optimized timing, and Brand Kit compliance. Each task builds incrementally toward a complete, testable implementation.

## Tasks

- [x] 1. Set up TamperMonkey script structure and metadata
  - Create the main script file with TamperMonkey metadata block
  - Add @name, @namespace, @version, @description, @grant directives
  - Add all 6 @match URL patterns for GeoStudio environments (na, eu, fe)
  - Wrap script in IIFE with 'use strict'
  - Add iframe context check at script start
  - _Requirements: 1.2, 1.3, 12.1-12.6, 15.1-15.6_

- [x] 2. Implement utility functions
  - [x] 2.1 Create delay() function
    - Implement Promise-based delay function
    - _Requirements: 1.4_
  
  - [x] 2.2 Create waitForElement() function
    - Implement polling with 200ms intervals and configurable timeout
    - Check for element existence and visibility (width > 0)
    - Return element or null on timeout
    - _Requirements: 1.4, 6.3, 10.5_
  
  - [x] 2.3 Create waitForRadioValue() function
    - Implement polling for radio buttons with specific value
    - Check for visibility before returning
    - Use 200ms polling interval
    - _Requirements: 1.4, 6.3, 10.5_
  
  - [x] 2.4 Create showPopup() function
    - Create popup element with message and duration parameters
    - Apply Brand Kit styling (black background, white text, 8px border-radius)
    - Position at top 10%, centered horizontally
    - Auto-remove after duration
    - _Requirements: 1.4, 5.6, 14.4-14.7_
  
  - [ ]* 2.5 Write unit tests for utility functions
    - Test delay() timing accuracy
    - Test waitForElement() with visible and hidden elements
    - Test waitForElement() timeout behavior
    - Test waitForRadioValue() with existing and missing radios
    - Test showPopup() creation and removal
    - _Requirements: 1.4_

- [x] 3. Implement edit panel awareness functions
  - [x] 3.1 Create isEditPanelOpen() function
    - Query for edit panel element by class selector
    - Check if element exists and display is not 'none'
    - Return boolean
    - _Requirements: 2.6_
  
  - [x] 3.2 Create updatePanelPosition() function
    - Accept panel element as parameter
    - Call isEditPanelOpen() to check state
    - Set panel.style.right to '320px' if open, '8px' if closed
    - _Requirements: 2.6_
  
  - [ ]* 3.3 Write unit tests for edit panel awareness
    - Test isEditPanelOpen() with open panel
    - Test isEditPanelOpen() with closed panel
    - Test updatePanelPosition() adjusts right position correctly
    - _Requirements: 2.6_

- [x] 4. Create workflow registry with all 10 configurations
  - Define WORKFLOWS constant as object with 10 workflow entries
  - For each workflow, specify: id, label, color, textColor, sequence array
  - Include complete fill sequences for: DI_NDPL, DI_NP_SDA, DI_SDA, FIXED_SDA
  - Include complete fill sequences for: UI1, UI_0, UI_2
  - Include complete fill sequences for: CEM_0, CEM_1, CEM_2
  - Each sequence step should have: type, value/fieldId/option, step name, optional hint
  - _Requirements: 1.1, 1.5, 4.1, 4.2, 7.1-7.10, 13.1-13.10_

- [ ]* 4.1 Write property test for workflow registry completeness
  - **Property 1: Workflow Registry Completeness**
  - **Validates: Requirements 1.1, 1.5**
  - Test all 10 expected workflows exist in WORKFLOWS
  - Test each workflow has required fields (id, label, color, textColor, sequence)
  - Use fast-check with constantFrom for workflow names
  - _Requirements: 1.1, 1.5_

- [x] 5. Implement form interaction functions
  - [x] 5.1 Create clickRadioByValue() function
    - Accept value, stepName, and optional fieldLabelHint parameters
    - Poll for radio buttons with matching value (15 second timeout)
    - If multiple radios found and hint provided, use hint to disambiguate
    - If multiple radios without hint, use last visible radio
    - Scroll element into view and wait 100ms
    - Click the radio button
    - Wait 333ms for dependent fields to appear
    - Return true on success, false on failure
    - Log warnings and show popup on failure
    - _Requirements: 1.4, 6.1, 6.3, 6.4, 6.5, 6.6, 8.1-8.3, 10.1, 10.2_
  
  - [x] 5.2 Create clickDropdown() function
    - Accept fieldId, optionText, and stepName parameters
    - Wait for combobox element (15 second timeout)
    - Scroll element into view and wait 100ms
    - Attempt React onMouseDown handler invocation
    - Fallback to regular click if React handler not found
    - Wait 400ms for listbox to render
    - Find and click option with matching text
    - Scroll option into view and wait 67ms before clicking
    - Wait 333ms for dependent fields to appear
    - Return true on success, false on failure
    - Log warnings and show popup on failure
    - _Requirements: 1.4, 6.2, 6.3, 6.4, 6.5, 6.7, 8.1-8.3, 10.1-10.4_
  
  - [ ]* 5.3 Write unit tests for form interaction functions
    - Test clickRadioByValue() with single radio
    - Test clickRadioByValue() with multiple radios and hint
    - Test clickRadioByValue() with multiple radios without hint
    - Test clickRadioByValue() timeout and error handling
    - Test clickDropdown() with React handler
    - Test clickDropdown() with fallback click
    - Test clickDropdown() option selection
    - Test clickDropdown() timeout and error handling
    - _Requirements: 6.1-6.7_

- [x] 6. Implement workflow execution engine
  - [x] 6.1 Create runWorkflow() function
    - Accept workflowName parameter
    - Get workflow configuration from WORKFLOWS registry
    - Get button element by workflow ID
    - Update button to "Filling..." state with green background and disable
    - Show popup: "[Workflow]: Filling..." (10 second duration)
    - Log workflow start with name and version
    - Loop through sequence steps and execute each
    - For radio steps, call clickRadioByValue()
    - For dropdown steps, call clickDropdown()
    - Halt execution if any step returns false
    - On success: update button to "Done ✓", show success popup, log completion
    - On error: update button to "Error ✗" with red background, re-enable, log error
    - Wrap entire execution in try-catch
    - _Requirements: 5.1-5.6, 8.4-8.6, 11.3-11.7_
  
  - [ ]* 6.2 Write unit tests for workflow execution
    - Test runWorkflow() executes all steps in sequence
    - Test runWorkflow() halts on step failure
    - Test runWorkflow() updates button states correctly
    - Test runWorkflow() handles exceptions
    - Test runWorkflow() with mock workflow configuration
    - _Requirements: 5.1-5.6_
  
  - [ ]* 6.3 Write property tests for workflow execution
    - **Property 5: Workflow Execution Trigger**
    - **Validates: Requirements 5.1**
    - **Property 6: Button State During Execution**
    - **Validates: Requirements 5.2, 5.5**
    - **Property 7: Button State After Success**
    - **Validates: Requirements 5.3**
    - **Property 8: Button State After Error**
    - **Validates: Requirements 5.4, 8.4, 8.6**
    - _Requirements: 5.1-5.5_

- [x] 7. Create button panel UI component
  - [x] 7.1 Implement createButtonPanel() helper function
    - Create div element with ID 'prophesy-unified-panel'
    - Apply Brand Kit styling: translucent background, backdrop blur, border, border-radius, box-shadow
    - Set position to fixed with top: calc(57px + 130px), right: 8px
    - Set flexbox layout with column direction and 6px gap
    - Set z-index to 99999
    - Return panel element
    - _Requirements: 2.1-2.7, 3.1-3.8_
  
  - [ ]* 7.2 Write unit tests for button panel creation
    - Test panel has correct ID
    - Test panel has correct styling properties
    - Test panel uses flexbox column layout
    - Test panel has correct z-index
    - _Requirements: 2.1-2.7_
  
  - [ ]* 7.3 Write property test for button panel styling
    - **Property 2: Button Visual Identity** (partial - panel styling)
    - **Validates: Requirements 4.2-4.5, 13.1-13.10**
    - _Requirements: 2.1-2.7_

- [x] 8. Create workflow buttons with event handlers
  - [x] 8.1 Implement createWorkflowButton() helper function
    - Accept workflow configuration object as parameter
    - Create button element with workflow ID
    - Set button text to workflow label
    - Apply Brand Kit button styling: padding, border, border-radius, font
    - Set background color and text color from workflow config
    - Add mouseenter event listener for yellow hover state
    - Add mouseleave event listener to restore original color
    - Add click event listener that calls runWorkflow()
    - Return button element
    - _Requirements: 3.1-3.8, 4.1-4.5, 5.1, 13.1-13.10_
  
  - [ ]* 8.2 Write unit tests for button creation
    - Test button has correct ID, label, colors
    - Test button has correct styling
    - Test hover event listeners work correctly
    - Test click handler is attached
    - Test hover state doesn't apply when button is disabled
    - _Requirements: 3.1-3.8, 4.1-4.5_
  
  - [ ]* 8.3 Write property tests for button behavior
    - **Property 2: Button Visual Identity**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 13.1-13.10**
    - **Property 3: Yellow Hover State**
    - **Validates: Requirements 3.4**
    - **Property 4: Button Border Consistency**
    - **Validates: Requirements 3.6**
    - _Requirements: 3.4, 3.6, 4.2-4.5_

- [x] 9. Implement initialization system
  - [x] 9.1 Create injectButtonPanel() function
    - Wait for audit form to appear (Perfect_Address radio, 20 second timeout)
    - If form not detected, log warning and exit
    - Check if panel already exists using getElementById
    - If panel exists, log message and exit (singleton pattern)
    - Call createButtonPanel() to create panel element
    - Loop through WORKFLOWS and create button for each using createWorkflowButton()
    - Append each button to panel
    - Append panel to document.body
    - Set up MutationObserver for edit panel awareness
    - Call updatePanelPosition() after 500ms delay
    - Log successful injection
    - _Requirements: 1.1, 2.1-2.7, 4.1-4.5, 9.1-9.5, 11.2_
  
  - [x] 9.2 Add initialization call at end of IIFE
    - Call injectButtonPanel()
    - Add console log: "Prophesy Pipeline Unified v2.0 loaded — iframe"
    - _Requirements: 11.1_
  
  - [ ]* 9.3 Write unit tests for initialization
    - Test injectButtonPanel() waits for audit form
    - Test singleton pattern prevents duplicate panels
    - Test panel is appended to document.body
    - Test all 10 buttons are created and appended
    - Test MutationObserver is set up
    - Test initialization logs appear
    - _Requirements: 9.1-9.5, 11.1-11.2_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests and verify they pass
  - Check console for any errors or warnings
  - Ensure all tests pass, ask the user if questions arise

- [ ] 11. Add comprehensive error handling and logging
  - [ ] 11.1 Add console logging to all major functions
    - Add workflow start logs with name and version
    - Add step logs with step number and field name
    - Add success logs with selected values
    - Add warning logs for fields not found
    - Add completion logs for workflows
    - _Requirements: 11.3-11.7_
  
  - [ ] 11.2 Verify error handling in all interaction functions
    - Ensure clickRadioByValue() logs warnings and shows popups on failure
    - Ensure clickDropdown() logs warnings and shows popups on failure
    - Ensure runWorkflow() catches exceptions and updates button state
    - Ensure all errors are logged to console
    - _Requirements: 8.1-8.6_
  
  - [ ]* 11.3 Write property tests for error handling and logging
    - **Property 22: Error Logging on Field Not Found**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - **Property 23: Exception Logging**
    - **Validates: Requirements 8.5**
    - **Property 24: Workflow Start Logging**
    - **Validates: Requirements 11.3**
    - **Property 25: Step Logging**
    - **Validates: Requirements 11.4**
    - **Property 26: Success Logging**
    - **Validates: Requirements 11.5**
    - **Property 27: Field Not Found Warning Logging**
    - **Validates: Requirements 11.6**
    - **Property 28: Workflow Completion Logging**
    - **Validates: Requirements 11.7**
    - _Requirements: 8.1-8.6, 11.3-11.7_

- [ ] 12. Add popup notification system
  - [ ] 12.1 Verify showPopup() implementation
    - Ensure popup appears at correct position
    - Ensure popup has correct styling
    - Ensure popup auto-removes after duration
    - _Requirements: 14.4-14.7_
  
  - [ ] 12.2 Add popup calls in runWorkflow()
    - Add popup on workflow start: "[Workflow]: Filling..." (10 seconds)
    - Add popup on workflow completion: "[Workflow]: Done!" (2 seconds)
    - Add popup on step failure: "Failed: [Step Name]" (3 seconds)
    - _Requirements: 5.6, 14.1-14.3_
  
  - [ ]* 12.3 Write property tests for popup notifications
    - **Property 9: Popup Notification on Workflow Start**
    - **Validates: Requirements 5.6, 14.1**
    - **Property 10: Popup Notification on Workflow Completion**
    - **Validates: Requirements 5.6, 14.2**
    - **Property 11: Popup Notification on Step Failure**
    - **Validates: Requirements 5.6, 14.3**
    - **Property 12: Popup Positioning and Styling**
    - **Validates: Requirements 14.4, 14.5, 14.6, 14.7**
    - _Requirements: 5.6, 14.1-14.7_

- [ ] 13. Implement optimized timing throughout
  - [ ] 13.1 Verify timing in clickRadioByValue()
    - Ensure 100ms delay after scrollIntoView
    - Ensure 333ms delay after radio click
    - _Requirements: 10.1, 10.2_
  
  - [ ] 13.2 Verify timing in clickDropdown()
    - Ensure 100ms delay after scrollIntoView for dropdown
    - Ensure 400ms delay after opening dropdown
    - Ensure 67ms delay after scrolling option
    - Ensure 333ms delay after option click
    - _Requirements: 10.1-10.4_
  
  - [ ] 13.3 Verify polling intervals
    - Ensure waitForElement() uses 200ms intervals
    - Ensure waitForRadioValue() uses 200ms intervals
    - _Requirements: 10.5_
  
  - [ ]* 13.4 Write property tests for timing
    - **Property 17: Post-Selection Delay**
    - **Validates: Requirements 6.5, 10.1**
    - **Property 18: Pre-Click Scroll Delay**
    - **Validates: Requirements 10.2**
    - **Property 19: Dropdown Listbox Rendering Delay**
    - **Validates: Requirements 10.3**
    - **Property 20: Option Scroll Delay**
    - **Validates: Requirements 10.4**
    - **Property 21: Element Polling Interval**
    - **Validates: Requirements 10.5**
    - _Requirements: 10.1-10.5_

- [ ] 14. Add radio button disambiguation logic
  - [ ] 14.1 Enhance clickRadioByValue() with disambiguation
    - When multiple radios found and hint provided, search for parent container
    - Find label/legend containing hint text
    - Select radio in matching container
    - If still not found, use last visible radio
    - _Requirements: 6.1, 6.6_
  
  - [ ]* 14.2 Write property test for radio disambiguation
    - **Property 13: Radio Button Disambiguation**
    - **Validates: Requirements 6.1, 6.6**
    - Test with multiple radios sharing same value
    - Test hint-based selection
    - Test fallback to last visible radio
    - _Requirements: 6.1, 6.6_

- [ ] 15. Add React dropdown interaction logic
  - [ ] 15.1 Enhance clickDropdown() with React handler detection
    - Search for React props key (starts with __reactProps)
    - Call onMouseDown with synthetic event object
    - Fallback to regular click if React handler not found
    - _Requirements: 6.2, 6.7_
  
  - [ ]* 15.2 Write property test for React dropdown interaction
    - **Property 14: React Dropdown Interaction**
    - **Validates: Requirements 6.2, 6.7**
    - Test React handler invocation
    - Test fallback to regular click
    - _Requirements: 6.2, 6.7_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Run complete test suite (unit tests and property tests)
  - Verify all 28 correctness properties pass
  - Check console for any errors or warnings
  - Ensure all tests pass, ask the user if questions arise

- [x] 17. Integration and final validation
  - [x] 17.1 Verify all 10 workflow sequences are correct
    - Cross-reference each workflow sequence with requirements 7.1-7.10
    - Ensure field values, dropdown options, and hints match exactly
    - _Requirements: 7.1-7.10_
  
  - [x] 17.2 Verify Brand Kit compliance
    - Check all colors match Brand Kit specifications
    - Check all typography matches (Amazon Ember, 14px bold)
    - Check all spacing and layout matches
    - Check hover states and transitions
    - _Requirements: 3.1-3.8_
  
  - [x] 17.3 Verify URL pattern matching
    - Ensure all 6 @match directives are present
    - Verify patterns cover na, eu, fe environments
    - Verify patterns cover both templates and main domains
    - _Requirements: 12.1-12.6_
  
  - [x] 17.4 Verify script metadata
    - Check @name is "Prophesy Pipeline Unified (v2.0)"
    - Check @version is "2.0.0"
    - Check @description explains consolidation
    - Check @grant is "none"
    - _Requirements: 15.1-15.6_
  
  - [ ]* 17.5 Write integration tests
    - Test complete workflow execution from button click to completion
    - Test workflow execution with simulated form fields
    - Test error recovery and retry
    - Test multiple workflows in sequence
    - Test panel position updates when edit panel opens/closes
    - _Requirements: 1.1-1.5, 5.1-5.6_

- [ ] 18. Final checkpoint - Complete validation
  - Run all tests one final time
  - Verify script loads without errors
  - Verify iframe context check works
  - Verify singleton pattern prevents duplicates
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The script uses JavaScript and will be deployed as a TamperMonkey userscript
- All timing values are optimized (333ms, 100ms, 400ms, 67ms) per requirements 10.1-10.5
- The implementation follows the exact structure specified in the design document

- [ ] 19. Add ComId2 to field mapping system
  - [ ] 19.1 Add ComId2 entry to R_fieldMap array
    - Add entry with label variants: "ComId2", "Com Id 2", "Com ID 2"
    - Set key to 'comId2'
    - _Requirements: 16.1, 16.2_
  
  - [ ] 19.2 Update extractCaseDetails to handle ComId2
    - Ensure ComId2 is extracted from case details
    - Store ComId2 value in case data object
    - _Requirements: 16.1, 16.2_
  
  - [ ]* 19.3 Test ComId2 extraction with label variants
    - Test extraction with "ComId2" label
    - Test extraction with "Com Id 2" label
    - Test extraction with "Com ID 2" label
    - Verify value is stored correctly
    - _Requirements: 16.1, 16.2_

- [ ] 20. Update POD panel HTML template
  - [ ] 20.1 Add ComId2 display row to HTML template
    - Add row with label "ComId2:" and value placeholder
    - Add r_comid2_link ID to value span
    - Add cursor:pointer styling to ComId2 value span
    - Store comId2Value in dataset attribute
    - _Requirements: 16.3, 19.1_
  
  - [ ] 20.2 Remove Order ID 1 and Order ID 2 display rows
    - Remove Order ID 1 row from HTML template
    - Remove Order ID 2 row from HTML template
    - Keep Order ID 1 and Order ID 2 in dataset for potential future use
    - _Requirements: 19.2, 19.3_
  
  - [ ] 20.3 Add cursor:pointer styling to ComId1 field
    - Update ComId1 value span with cursor:pointer style
    - Ensure consistent styling with ComId2
    - _Requirements: 17.1_
  
  - [ ] 20.4 Update dataset storage for ComId values
    - Store comId1Value in dataset attribute
    - Store comId2Value in dataset attribute
    - Ensure values are accessible for click handlers
    - _Requirements: 16.3, 17.1_

- [ ] 21. Implement ComId click-to-copy handlers
  - [ ] 21.1 Add click handler for r_comid1_link
    - Implement delegated click handler on POD panel
    - Get comId1Value from dataset
    - Validate value (skip 'N/A' and '-')
    - Copy to clipboard using navigator.clipboard.writeText
    - Show success popup notification
    - _Requirements: 17.1, 17.2, 17.3_
  
  - [ ] 21.2 Add click handler for r_comid2_link
    - Implement delegated click handler on POD panel
    - Get comId2Value from dataset
    - Validate value (skip 'N/A' and '-')
    - Copy to clipboard using navigator.clipboard.writeText
    - Show success popup notification
    - _Requirements: 17.1, 17.2, 17.3_
  
  - [ ]* 21.3 Test delegated click handlers survive innerHTML swaps
    - Test handlers work after POD panel content is updated
    - Test handlers work with multiple POD searches
    - Verify clipboard copy functionality
    - Verify validation skips 'N/A' and '-' values
    - _Requirements: 17.1, 17.2, 17.3_

- [ ] 22. Enhance POD search with map highlighting
  - [ ] 22.1 Implement highlightDeliveryPointOnMap function
    - Accept tracking ID as parameter
    - Search for map marker with matching tracking ID
    - Apply Neon Orange (#FF6600) styling with glow effect
    - Add box-shadow for glow: 0 0 10px 3px rgba(255,102,0,0.8)
    - Store reference to highlighted element for cleanup
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [ ] 22.2 Add clearMapHighlights function
    - Remove Neon Orange styling from previously highlighted elements
    - Clear stored references
    - Reset to original marker styling
    - _Requirements: 18.3_
  
  - [ ] 22.3 Integrate map highlighting into startPODSearchForTracking
    - Call clearMapHighlights before new search
    - Call highlightDeliveryPointOnMap after finding tracking ID
    - Ensure highlighting works with various map marker types
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [ ]* 22.4 Test map highlighting with various marker types
    - Test with standard map markers
    - Test with custom map markers
    - Test with multiple markers on map
    - Test clearing highlights between searches
    - Verify Neon Orange color and glow effect
    - _Requirements: 18.1, 18.2, 18.3_

- [ ] 23. Test POD panel enhancements
  - [ ]* 23.1 Test ComId1 and ComId2 extraction
    - Test extraction with all label variants
    - Test values are stored in dataset
    - Test values display correctly in POD panel
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [ ]* 23.2 Test ComId click-to-copy functionality
    - Test ComId1 click copies to clipboard
    - Test ComId2 click copies to clipboard
    - Test validation skips 'N/A' values
    - Test validation skips '-' values
    - Test success popup appears
    - _Requirements: 17.1, 17.2, 17.3_
  
  - [ ]* 23.3 Test POD search highlights tracking ID
    - Test tracking ID is highlighted in case details
    - Test highlighting persists during POD search
    - _Requirements: 18.1_
  
  - [ ]* 23.4 Test POD search finds nearest camera button
    - Test nearest camera button is found and clicked
    - Test POD search completes successfully
    - _Requirements: 18.2_
  
  - [ ]* 23.5 Test POD search highlights map delivery point
    - Test delivery point is highlighted on map
    - Test Neon Orange color is applied
    - Test glow effect is visible
    - Test highlighting clears between searches
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [ ]* 23.6 Test Order ID fields not displayed but stored
    - Test Order ID 1 is not visible in POD panel
    - Test Order ID 2 is not visible in POD panel
    - Test Order ID 1 is stored in dataset
    - Test Order ID 2 is stored in dataset
    - _Requirements: 19.2, 19.3_

- [ ] 24. Final checkpoint - POD panel enhancements complete
  - Run all POD panel enhancement tests
  - Verify ComId2 extraction and display
  - Verify click-to-copy functionality
  - Verify map highlighting works correctly
  - Verify Order ID fields are hidden but stored
  - Ensure all tests pass, ask the user if questions arise
