# Implementation Plan: Six Scripts Integration

## Overview

This plan integrates six userscripts (BOAK, GAMAutoFill, geocodeCopier, NEIPopup, Pastdeliveries, PasteDPRE) into Prophesy Pipeline Unified v2.3.4. The integration follows a 9-phase approach with clear section boundaries, namespace prefixes, and comprehensive testing to ensure all existing functionality is preserved while adding new capabilities.

## Tasks

- [x] 1. Phase 1: Foundation and Code Structure Setup
  - [x] 1.1 Create section markers and namespace documentation
    - Add clear section markers with comments for each integrated script
    - Document namespace prefix conventions (boak_, gam_, geocopy_, nei_, pastdel_, geopaste_)
    - Create section boundaries in the unified script file
    - _Requirements: 8.4, 8.5_

  - [x] 1.2 Set up test infrastructure
    - Install fast-check library for property-based testing
    - Create test file structure (8 test files)
    - Configure test runner with 100 iterations per property test
    - Add test tagging format for property references
    - _Requirements: 10.4_

  - [x] 1.3 Document shared utility functions
    - Document existing delay(), waitForElement(), showPopup() functions
    - Document isEditPanelOpen() and updatePanelPosition() functions
    - Ensure all shared functions remain unprefixed
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Phase 2: BOAK Map Tools Integration
  - [x] 2.1 Create BOAK section with namespace prefixes
    - Copy BOAK code into new section with clear markers
    - Rename all variables and functions with boak_ prefix
    - Preserve original logic without modification
    - _Requirements: 1.1, 8.4_

  - [x] 2.2 Implement BOAK button panel
    - Create panel with B, O, A, K buttons
    - Position at top: calc(57px + 130px), left: 10px, fixed positioning
    - Style buttons consistently with existing panels
    - _Requirements: 1.1, 1.2, 12.1_

  - [x] 2.3 Implement map tool button handlers
    - Implement boak_openBing() to extract address/coordinates and open Bing Maps
    - Implement boak_openOSM() to open OpenStreetMap
    - Implement boak_openADRI() to open ADRI viewer
    - Implement boak_openKibana() to open Kibana
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [x] 2.4 Implement address data extraction
    - Create boak_extractAddressData() to scrape page for address fields
    - Return object with address, lat, lon, street, unit properties
    - Handle missing fields gracefully
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [x] 2.5 Connect BOAK panel to Edit Panel Awareness
    - Implement boak_updateVisibility() using isEditPanelOpen()
    - Show panel when Edit Panel is open
    - Hide panel when Edit Panel is closed
    - _Requirements: 1.7, 1.8_

  - [x] 2.6 Write unit tests for BOAK
    - Test each button opens correct URL format
    - Test address extraction from various page states
    - Test panel positioning (Example 1 - BOAK portion)
    - Test panel visibility toggling
    - _Requirements: 1.1-1.8_

  - [x] 2.7 Write property test for BOAK
    - **Property 1: Button Panel Edit Panel Awareness (BOAK)**
    - **Validates: Requirements 1.1, 1.7**
    - **Property 2: Map Tool Button URL Opening**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

- [x] 3. Phase 3: Geocode Copy and Paste Integration
  - [x] 3.1 Create geocode copy section with namespace prefixes
    - Copy geocodeCopier code into new section
    - Rename all variables and functions with geocopy_ prefix
    - Position panel at top: calc(57px + 265px)
    - _Requirements: 4.1, 4.2, 8.4_

  - [x] 3.2 Implement geocode copy button panel
    - Create panel with CDP and CRE buttons
    - Style buttons consistently
    - Connect to Edit Panel Awareness
    - _Requirements: 4.1, 4.2, 12.2_

  - [x] 3.3 Implement clipboard copy operations
    - Implement geocopy_copyDP() to copy DP coordinates
    - Implement geocopy_copyRE() to copy RE coordinates
    - Use navigator.clipboard.writeText() with error handling
    - Show confirmation popup after successful copy
    - _Requirements: 4.3, 4.4_

  - [x] 3.4 Create geocode paste section with namespace prefixes
    - Copy PasteDPRE code into new section
    - Rename all variables and functions with geopaste_ prefix
    - Position panel at top: calc(57px + 337px)
    - _Requirements: 7.1, 7.2, 8.4_

  - [x] 3.5 Implement geocode paste button panel
    - Create panel with PDP, PRE, and PBoth buttons
    - Style buttons consistently
    - Connect to Edit Panel Awareness
    - _Requirements: 7.1, 7.2, 12.3_

  - [x] 3.6 Implement clipboard paste operations
    - Implement geopaste_pasteDP() to paste into DP field
    - Implement geopaste_pasteRE() to paste into RE field
    - Implement geopaste_pasteBoth() to paste into both fields
    - Use navigator.clipboard.readText() with error handling
    - Show confirmation popup after successful paste
    - _Requirements: 7.3, 7.4, 7.5_

  - [x] 3.7 Write unit tests for geocode copy/paste
    - Test CDP button copies DP coordinates
    - Test CRE button copies RE coordinates
    - Test PDP, PRE, PBoth buttons paste correctly
    - Test clipboard API error handling
    - Test panel positioning (Example 1 - geocode portions)
    - _Requirements: 4.1-4.5, 7.1-7.6_

  - [x] 3.8 Write property tests for geocode copy/paste
    - **Property 1: Button Panel Edit Panel Awareness (geocopy, geopaste)**
    - **Validates: Requirements 4.1, 4.5, 7.1, 7.6**
    - **Property 10: Geocode Copy to Clipboard**
    - **Validates: Requirements 4.3, 4.4**
    - **Property 17: Geocode Paste from Clipboard**
    - **Validates: Requirements 7.3, 7.4, 7.5**

- [x] 4. Checkpoint - Verify button panels working
  - Ensure all tests pass, ask the user if questions arise.

- [~] 5. Phase 4: GAMAutoFill Queue Filtering Integration
  - [ ] 5.1 Create GAMAutoFill section with namespace prefixes
    - Copy all 965 lines of GAMAutoFill code into new section
    - Rename all variables and functions with gam_ prefix
    - Preserve all original logic without modification
    - _Requirements: 2.4, 8.4_

  - [ ] 5.2 Implement GAM Issue field detection
    - Implement gam_getGAMIssueValue() to scrape page for GAM Issue field
    - Return "Yes", "No", or null
    - Handle missing field gracefully
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 5.3 Implement queue dropdown filtering logic
    - Implement gam_filterQueueDropdown() to filter dropdown options
    - When GAM Issue = "Yes", show only PBG_Queue
    - When GAM Issue = "Yes", auto-select PBG_Queue
    - When GAM Issue ≠ "Yes", show all queues
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 5.4 Set up MutationObserver for queue dropdowns
    - Implement gam_observeQueueDropdowns() as MutationObserver callback
    - Detect when queue dropdowns appear in DOM
    - Trigger filtering logic automatically
    - _Requirements: 2.5_

  - [ ] 5.5 Initialize GAMAutoFill with event listeners
    - Implement gam_init() to set up all observers and listeners
    - Ensure no conflicts with existing workflow buttons
    - _Requirements: 2.5_

  - [ ] 5.6 Write unit tests for GAMAutoFill
    - Test queue filtering when GAM Issue = "Yes"
    - Test no filtering when GAM Issue ≠ "Yes"
    - Test auto-selection of PBG queue
    - Test observer triggers on dropdown appearance
    - Test handling of missing GAM Issue field
    - _Requirements: 2.1-2.5_

  - [ ] 5.7 Write property tests for GAMAutoFill
    - **Property 3: GAM Queue Filtering and Auto-Selection**
    - **Validates: Requirements 2.1, 2.2**
    - **Property 4: GAM Queue No Filtering**
    - **Validates: Requirements 2.3**

- [~] 6. Phase 5: DP Validation Integration
  - [ ] 6.1 Create DP validation section with namespace prefixes
    - Copy DP validation code into new section
    - Rename all variables and functions with dpval_ prefix
    - _Requirements: 8.4_

  - [ ] 6.2 Implement distance calculation logic
    - Implement dpval_validateDistance(lat, lon) to calculate distance from reference point
    - Return object with valid (boolean) and distance (number) properties
    - Handle invalid coordinates gracefully
    - _Requirements: 3.1_

  - [ ] 6.3 Implement warning popup for invalid distances
    - Implement dpval_showWarning(distance) to display popup
    - Show warning when distance < 10km
    - Allow user to proceed despite warning (non-blocking)
    - _Requirements: 3.2, 3.3_

  - [ ] 6.4 Implement fallback DP field creation
    - Implement dpval_createFallbackField() to create DP input field
    - Create field when native DP field is missing
    - Ensure fallback field functions equivalently
    - _Requirements: 3.4_

  - [ ] 6.5 Set up parent/iframe message passing for DP validation
    - Implement dpval_setupMessagePassing() to configure communication
    - Implement dpval_handleMessage(event) to process messages
    - Define message types: DP_GEOCODE_UPDATE, DP_VALIDATION_RESULT
    - Validate message origins for security
    - _Requirements: 3.5, 3.6, 11.1, 11.3_

  - [ ] 6.6 Initialize DP validation
    - Implement dpval_init() to set up listeners and create fallback field
    - Ensure validation works in both parent and iframe contexts
    - _Requirements: 3.6_

  - [ ] 6.7 Write unit tests for DP validation
    - Test distance calculation accuracy
    - Test warning display for distance < 10km
    - Test no warning for distance ≥ 10km
    - Test fallback field creation
    - Test cross-context validation
    - Test invalid coordinate handling
    - _Requirements: 3.1-3.6_

  - [ ] 6.8 Write property tests for DP validation
    - **Property 5: DP Distance Calculation**
    - **Validates: Requirements 3.1**
    - **Property 6: DP Distance Warning Display**
    - **Validates: Requirements 3.2**
    - **Property 7: DP Warning Non-Blocking**
    - **Validates: Requirements 3.3**
    - **Property 8: DP Fallback Field Creation**
    - **Validates: Requirements 3.4**
    - **Property 9: DP Validation Cross-Context**
    - **Validates: Requirements 3.6**

- [~] 7. Phase 6: NEI Verification Integration
  - [ ] 7.1 Create NEI verification section with namespace prefixes
    - Copy NEIPopup code into new section
    - Rename all variables and functions with nei_ prefix
    - _Requirements: 8.4_

  - [ ] 7.2 Implement NEI verification dialog UI
    - Implement nei_createDialog() to create popup dialog
    - Include checklist: Bing, OSM, Kibana, ADRI, Past Deliveries
    - Style dialog consistently with existing popups
    - _Requirements: 5.1, 5.2_

  - [ ] 7.3 Implement NEI selection interception
    - Implement nei_interceptNEISelection(element) to intercept dropdown/radio selections
    - Display verification dialog before allowing selection
    - Block selection until user confirms
    - _Requirements: 5.1, 5.3_

  - [ ] 7.4 Implement verification confirmation logic
    - Implement nei_showVerification() to display dialog and return Promise
    - Allow NEI selection to complete when user confirms
    - Revert selection if user cancels
    - _Requirements: 5.6_

  - [ ] 7.5 Set up parent/iframe message passing for NEI verification
    - Implement nei_setupMessagePassing() to configure communication
    - Implement nei_handleMessage(event) to process messages
    - Define message types: NEI_DIALOG_CLOSE, NEI_DIALOG_OPENED
    - Validate message origins for security
    - _Requirements: 5.4, 5.5, 11.2, 11.3_

  - [ ] 7.6 Initialize NEI verification
    - Implement nei_init() to set up event listeners and message passing
    - Ensure verification works in both parent and iframe contexts
    - _Requirements: 5.4_

  - [ ] 7.7 Write unit tests for NEI verification
    - Test popup appears on NEI selection
    - Test popup content (Example 2)
    - Test selection blocked until confirmation
    - Test selection proceeds after confirmation
    - Test cross-context verification
    - _Requirements: 5.1-5.6_

  - [ ] 7.8 Write property tests for NEI verification
    - **Property 11: NEI Selection Verification Prompt**
    - **Validates: Requirements 5.1**
    - **Property 12: NEI Verification Blocking**
    - **Validates: Requirements 5.3**
    - **Property 13: NEI Verification Cross-Context**
    - **Validates: Requirements 5.4**
    - **Property 14: NEI Confirmation Allows Selection**
    - **Validates: Requirements 5.6**

- [ ] 8. Checkpoint - Verify validation and verification features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Phase 7: Auto Past Deliveries Integration
  - [ ] 9.1 Create auto past deliveries section with namespace prefixes
    - Copy Pastdeliveries code into new section
    - Rename all variables and functions with pastdel_ prefix
    - _Requirements: 8.4_

  - [ ] 9.2 Implement new case detection logic
    - Implement pastdel_detectNewCase() to monitor timer and AddressId changes
    - Return boolean indicating new case detected
    - _Requirements: 6.1, 6.5, 6.6_

  - [ ] 9.3 Implement auto-open past deliveries functionality
    - Implement pastdel_autoOpen() to open Past Deliveries panel
    - Set Attribute filter to "Count"
    - Set Filter option to "All"
    - Use existing openPastDeliveriesPanel() function
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 9.4 Set up MutationObservers for case detection
    - Implement pastdel_observeAddressId() for AddressId changes
    - Implement pastdel_observeTimer() for timer changes
    - Trigger autoOpen on new case detection
    - _Requirements: 6.5, 6.6_

  - [ ] 9.5 Implement keyboard shortcut for panel toggle
    - Implement pastdel_handleKeyPress(event) for P key
    - Toggle Past Deliveries panel on P key press
    - _Requirements: 6.4_

  - [ ] 9.6 Initialize auto past deliveries
    - Implement pastdel_init() to set up observers and keyboard listener
    - Ensure no duplication of POD panel logic
    - _Requirements: 6.1-6.6_

  - [ ] 9.7 Write unit tests for auto past deliveries
    - Test panel opens on AddressId change
    - Test filter settings (Example 3)
    - Test P key toggle functionality
    - Test timer change detection
    - _Requirements: 6.1-6.6_

  - [ ] 9.8 Write property tests for auto past deliveries
    - **Property 15: Auto-Open Past Deliveries on New Case**
    - **Validates: Requirements 6.1**
    - **Property 16: Past Deliveries Panel Toggle**
    - **Validates: Requirements 6.4**

- [ ] 10. Phase 8: Integration Testing and Regression Verification
  - [ ] 10.1 Verify existing workflow buttons preserved
    - Test all 10 workflow buttons exist and function (Example 4)
    - Verify button labels and workflows unchanged
    - _Requirements: 9.1_

  - [ ] 10.2 Verify POD panel functionality preserved
    - Test POD panel auto-trigger functionality
    - Test tracking ID highlighting
    - Test camera button click functionality
    - _Requirements: 9.2, 9.3, 9.4_

  - [ ] 10.3 Verify existing event listeners and observers preserved
    - Test all existing observers still function
    - Test no event listener conflicts
    - _Requirements: 9.5_

  - [ ] 10.4 Write property tests for existing functionality preservation
    - **Property 18: Existing POD Panel Functionality Preserved**
    - **Validates: Requirements 9.2, 9.3, 9.4**
    - **Property 19: Existing Features Regression Prevention**
    - **Validates: Requirements 9.6**

  - [ ] 10.5 Run performance tests
    - Test script initialization time < 2 seconds (Example 5)
    - Test button response time < 500ms
    - Test message passing < 100ms
    - _Requirements: 10.1, 10.2, 11.5_

  - [ ] 10.6 Write property tests for performance and messaging
    - **Property 20: Button Click Response Time**
    - **Validates: Requirements 10.2**
    - **Property 21: Message Origin Validation**
    - **Validates: Requirements 11.3**
    - **Property 22: Message Passing Failure Graceful Handling**
    - **Validates: Requirements 11.4**
    - **Property 23: Message Delivery Performance**
    - **Validates: Requirements 11.5**

  - [ ] 10.7 Run cross-component integration tests
    - Test BOAK buttons work while GAMAutoFill is filtering
    - Test geocode copy/paste work with DP validation
    - Test NEI verification works with existing workflow buttons
    - Test all panels coexist without conflicts
    - _Requirements: 8.4, 12.4_

  - [ ] 10.8 Write property test for panel layout correctness
    - **Property 24: Button Panel Layout Correctness**
    - **Validates: Requirements 12.4, 12.5, 12.6**

  - [ ] 10.9 Run all unit tests
    - Execute all 8 test files
    - Verify all unit tests pass
    - _Requirements: All_

  - [ ] 10.10 Run all property-based tests
    - Execute all 24 property tests with 100 iterations each
    - Verify all property tests pass
    - _Requirements: All_

- [ ] 11. Checkpoint - Final verification before documentation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Phase 9: Documentation and Finalization
  - [ ] 12.1 Add inline comments for complex logic
    - Comment all message passing logic
    - Comment all observer setup code
    - Comment all coordinate calculation logic
    - _Requirements: 8.5_

  - [ ] 12.2 Update userscript metadata
    - Update @version to reflect integration
    - Update @description to include new features
    - Verify @match and @grant directives
    - _Requirements: All_

  - [ ] 12.3 Verify error handling implementation
    - Verify all clipboard operations have try-catch blocks
    - Verify all message passing has origin validation
    - Verify all DOM queries have fallback behavior
    - Verify all errors are logged consistently
    - _Requirements: 11.3, 11.4_

  - [ ] 12.4 Final code review
    - Review all namespace prefixes are correct
    - Review all section markers are clear
    - Review no variable name conflicts exist
    - Review code follows existing style conventions
    - _Requirements: 8.4, 8.5_

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100 iterations each
- Unit tests validate specific examples and edge cases
- The integration preserves all existing v2.3.4 functionality while adding 6 new script capabilities
- Total estimated time: 23 hours across 9 phases
