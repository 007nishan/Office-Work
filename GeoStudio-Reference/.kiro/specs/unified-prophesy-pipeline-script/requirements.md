# Requirements Document

## Introduction

This document specifies the requirements for consolidating all 10 Prophesy Pipeline TamperMonkey scripts into a single unified script. The unified script will provide a streamlined user experience by eliminating the need to install and manage multiple separate scripts, while maintaining all existing functionality and ensuring compliance with the GeoStudio Unified Brand Kit standards.

## Glossary

- **Unified_Script**: The consolidated TamperMonkey script that combines all 10 individual Prophesy Pipeline scripts
- **Button_Panel**: A fixed-position UI container that holds all workflow buttons in a vertical layout
- **Workflow_Button**: An individual button within the panel that triggers a specific audit form filling sequence
- **Form_Filler**: The automated system that populates GeoStudio audit form fields
- **Audit_Form**: The GeoStudio web form that requires automated field population
- **Brand_Kit**: The GeoStudio design system specification document that defines visual styling standards
- **TamperMonkey**: A browser extension that allows custom JavaScript to run on web pages
- **React_Component**: A UI element in the GeoStudio platform built with React framework
- **Field_Disambiguation**: The process of identifying the correct form field when multiple fields share the same value
- **POD_Panel**: A draggable floating panel that displays case details including Tracking ID, geocodes, and communication identifiers
- **Tracking_ID**: A unique identifier for a delivery package (format: TBA followed by alphanumeric characters)
- **ComId**: Communication identifier fields (ComId1, ComId2) that contain reference numbers for case communication
- **Camera_Button**: A button with aria-label "View photo" that opens the proof of delivery image
- **GeoStudio_Map**: The interactive map interface that displays delivery points and geographic information
- **Field_Mapping_System**: The canonical key and label variant system used to extract case details from multiple page formats

## Requirements

### Requirement 1: Script Consolidation

**User Story:** As a GeoStudio auditor, I want to install a single TamperMonkey script instead of 10 separate scripts, so that I can simplify my workflow setup and avoid script management overhead.

#### Acceptance Criteria

1. THE Unified_Script SHALL contain all functionality from the 10 individual scripts (DI_NDPL, DI_NP_SDA_Final, DI_SDA, FIXED_SDA, UI1, UI_0, UI_2, CEM_0, CEM_1, CEM_2)
2. THE Unified_Script SHALL match all URL patterns that the individual scripts matched
3. THE Unified_Script SHALL execute only in iframe contexts (not in top-level windows)
4. THE Unified_Script SHALL include all shared utility functions (delay, waitForElement, waitForRadioValue, showPopup, clickRadioByValue, clickDropdown)
5. THE Unified_Script SHALL maintain separate fill sequences for each of the 10 workflows

### Requirement 2: Button Panel Layout

**User Story:** As a GeoStudio auditor, I want all workflow buttons displayed in a single organized panel, so that I can easily see and access all available workflows without visual clutter.

#### Acceptance Criteria

1. THE Button_Panel SHALL display all 10 Workflow_Buttons in a vertical layout
2. THE Button_Panel SHALL use a fixed position on the page
3. THE Button_Panel SHALL have a translucent white background with backdrop blur effect
4. THE Button_Panel SHALL include proper spacing between buttons to prevent overlap
5. THE Button_Panel SHALL comply with Brand_Kit specifications for panels (border, border-radius, box-shadow, z-index)
6. THE Button_Panel SHALL be positioned at top: calc(57px + 130px) and right: 8px by default
7. THE Button_Panel SHALL use flexbox layout with column direction and 6px gap between buttons

### Requirement 3: Brand Kit Compliance

**User Story:** As a GeoStudio auditor, I want the unified script to follow the established design standards, so that the UI feels consistent with other GeoStudio tools.

#### Acceptance Criteria

1. THE Unified_Script SHALL apply all Brand_Kit color specifications from UNIFIED-BRAND-KIT.md
2. THE Unified_Script SHALL apply all Brand_Kit typography specifications (font-family, font-size, font-weight)
3. THE Unified_Script SHALL apply all Brand_Kit spacing and layout specifications
4. THE Unified_Script SHALL implement yellow hover states (#ffff00) on all buttons
5. THE Unified_Script SHALL include 0.2s transition effects for background color changes
6. THE Unified_Script SHALL use 1px solid #ccc borders on all buttons
7. THE Unified_Script SHALL use 6px border-radius on buttons and 12px on the panel
8. THE Unified_Script SHALL maintain proper z-index hierarchy (99999 for panel, 100000 for modals)

### Requirement 4: Button Identification

**User Story:** As a GeoStudio auditor, I want each button to be clearly labeled with its workflow name, so that I can quickly identify which workflow to use for each audit scenario.

#### Acceptance Criteria

1. WHEN the Button_Panel is rendered, THE Unified_Script SHALL display buttons with labels: DI_NDPL, DI_NP_SDA, DI_SDA, FIXED_SDA, UI1, UI_0, UI_2, CEM_0, CEM_1, CEM_2
2. THE Unified_Script SHALL assign unique background colors to each button matching the original script colors
3. THE Unified_Script SHALL assign unique DOM IDs to each button for singleton pattern enforcement
4. THE Unified_Script SHALL use consistent button dimensions (padding: 8px 16px)
5. THE Unified_Script SHALL display button text in 14px bold Amazon Ember font

### Requirement 5: Workflow Execution

**User Story:** As a GeoStudio auditor, I want to click a workflow button and have the form automatically filled with the correct values, so that I can complete audits quickly and accurately.

#### Acceptance Criteria

1. WHEN a Workflow_Button is clicked, THE Form_Filler SHALL execute the corresponding fill sequence
2. WHEN a fill sequence starts, THE Workflow_Button SHALL display "Filling..." text and change to a green background
3. WHEN a fill sequence completes successfully, THE Workflow_Button SHALL display "Done ✓" text
4. IF a fill sequence encounters an error, THEN THE Workflow_Button SHALL display "Error ✗" text and change to red background
5. WHILE a fill sequence is running, THE Workflow_Button SHALL be disabled to prevent duplicate execution
6. THE Form_Filler SHALL display popup notifications for fill start, completion, and errors

### Requirement 6: Form Field Interaction

**User Story:** As a GeoStudio auditor, I want the script to reliably interact with all form field types, so that the automation works consistently across different audit scenarios.

#### Acceptance Criteria

1. THE Form_Filler SHALL handle radio button selection with field label disambiguation
2. THE Form_Filler SHALL handle dropdown selection using React component interaction
3. THE Form_Filler SHALL wait for elements to become visible before interaction (15 second timeout)
4. THE Form_Filler SHALL scroll elements into view before clicking them
5. THE Form_Filler SHALL wait for dependent fields to appear after selections (1000ms for standard workflows, 333ms for fast workflows)
6. WHEN multiple radio buttons share the same value, THE Form_Filler SHALL use field label hints to select the correct one
7. THE Form_Filler SHALL use React onMouseDown handlers for dropdown interaction when available

### Requirement 7: Workflow-Specific Fill Sequences

**User Story:** As a GeoStudio auditor, I want each workflow button to execute its specific field selection sequence, so that different audit scenarios are handled correctly.

#### Acceptance Criteria

1. THE DI_NDPL workflow SHALL select: Perfect_Address, NO, "Delivery Location -Front Door/Porch", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, SCANnotatCDP, NA, "Driver Issue", NA
2. THE DI_NP_SDA workflow SHALL select: Perfect_Address, NO, "Delivery Location -Front Door/Porch", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, "NO-POD/No Scan Data", SCANatDifferentAddress, "Driver Issue", NA
3. THE DI_SDA workflow SHALL select: Perfect_Address, NO, "Delivery Location -Front Door/Porch", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, SCANatDifferentAddress, NA, "Driver Issue", NA
4. THE FIXED_SDA workflow SHALL select: Perfect_Address, NO, "Delivery Location -Front Door/Porch", FIXED, Bing-OSM-KIBANA-Deliveries-Other3P, SCANatDifferentAddress, NA, "Geocode/Geofence Issue", NA
5. THE UI1 workflow SHALL select: Perfect_Address, NO, "DH Unavailable -DH Unavailable", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, "SCANatUnit/Building", NA, "Unknown Issue", WholePackageIsMissing
6. THE UI_0 workflow SHALL select: Perfect_Address, NO, "DH Unavailable -DH Unavailable", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, "NO-POD/No Scan Data", "SCANatUnit/Building", "Unknown Issue", WholePackageIsMissing
7. THE UI_2 workflow SHALL select: Perfect_Address, NO, "Delivery Location -Front Door/Porch", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, SCANatCDP, NA, "Unknown Issue", WholePackageIsMissing
8. THE CEM_0 workflow SHALL select: Perfect_Address, NO, "Package Placement -Under Object", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, "SCANatUnit/Building", NA, "Customer Expectation Mismatch", NA
9. THE CEM_1 workflow SHALL select: Perfect_Address, NO, "Package Placement -Other Specific Spots", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, SCANnotatCDP, NA, "Customer Expectation Mismatch", NA
10. THE CEM_2 workflow SHALL select: Perfect_Address, NO, "Delivery Location -Rear Door/Porch", NGFR, Bing-OSM-KIBANA-Deliveries-Other3P, SCANnotatCDP, NA, "Customer Expectation Mismatch", NA

### Requirement 8: Error Handling and Feedback

**User Story:** As a GeoStudio auditor, I want clear feedback when something goes wrong, so that I can understand what happened and take corrective action.

#### Acceptance Criteria

1. WHEN a form field is not found, THE Form_Filler SHALL log a warning to the console with the field identifier
2. WHEN a form field is not found, THE Form_Filler SHALL display a popup notification with the failed step name
3. WHEN a form field is not found, THE Form_Filler SHALL stop the fill sequence and return false
4. WHEN an exception occurs during filling, THE Form_Filler SHALL catch the error and update the button to show "Error ✗"
5. WHEN an exception occurs during filling, THE Form_Filler SHALL log the error to the console
6. WHEN an exception occurs during filling, THE Form_Filler SHALL re-enable the button to allow retry

### Requirement 9: Singleton Pattern

**User Story:** As a GeoStudio auditor, I want the script to prevent duplicate button panels from appearing, so that the UI remains clean even if the script runs multiple times.

#### Acceptance Criteria

1. WHEN the Unified_Script initializes, THE Unified_Script SHALL check if the Button_Panel already exists
2. IF the Button_Panel already exists, THEN THE Unified_Script SHALL not create a new panel
3. THE Unified_Script SHALL use a unique DOM ID for the Button_Panel to enable duplicate detection
4. THE Unified_Script SHALL wait for the audit form to be detected before creating the Button_Panel
5. THE Unified_Script SHALL wait up to 20 seconds for the Perfect_Address radio button to appear

### Requirement 10: Performance Optimization

**User Story:** As a GeoStudio auditor, I want the script to execute workflows as quickly as possible, so that I can complete audits efficiently and match the speed of successful scripts like GAMAutoFill and BOAK.

#### Acceptance Criteria

1. THE Unified_Script SHALL use optimized timing for ALL workflows with 333ms delays after selections (not 1000ms)
2. THE Unified_Script SHALL use 100ms delays before clicking elements after scrolling (not 300ms)
3. THE Unified_Script SHALL use 400ms delays after opening dropdowns to allow listbox rendering (not 1200ms)
4. THE Unified_Script SHALL use 67ms delays for option scrolling in dropdowns (not 200ms)
5. THE Unified_Script SHALL use 200ms polling intervals when waiting for elements to appear
6. THE Unified_Script SHALL complete workflows 2-3x faster than the original individual TamperMonkey scripts
7. THE Unified_Script SHALL align timing performance with BrandKit/GeoStudio standards and successful scripts (GAMAutoFill, BOAK)
8. THE Unified_Script SHALL maintain reliability while using optimized timing (no increase in failure rates)

### Requirement 11: Console Logging

**User Story:** As a developer debugging the script, I want detailed console logs for each action, so that I can troubleshoot issues and verify correct execution.

#### Acceptance Criteria

1. THE Unified_Script SHALL log when it loads and confirms iframe context
2. THE Unified_Script SHALL log when the Button_Panel is injected
3. THE Form_Filler SHALL log the start of each fill sequence with workflow name and version
4. THE Form_Filler SHALL log each step number and field name before interaction
5. THE Form_Filler SHALL log successful field interactions with the selected value
6. THE Form_Filler SHALL log warnings when fields are not found
7. THE Form_Filler SHALL log completion of fill sequences

### Requirement 12: URL Pattern Matching

**User Story:** As a GeoStudio auditor, I want the script to work on all GeoStudio environments, so that I can use it regardless of which region or environment I'm accessing.

#### Acceptance Criteria

1. THE Unified_Script SHALL match URLs: https://na.templates.geostudio.last-mile.amazon.dev/*
2. THE Unified_Script SHALL match URLs: https://eu.templates.geostudio.last-mile.amazon.dev/*
3. THE Unified_Script SHALL match URLs: https://fe.templates.geostudio.last-mile.amazon.dev/*
4. THE Unified_Script SHALL match URLs: https://na.geostudio.last-mile.amazon.dev/*
5. THE Unified_Script SHALL match URLs: https://eu.geostudio.last-mile.amazon.dev/*
6. THE Unified_Script SHALL match URLs: https://fe.geostudio.last-mile.amazon.dev/*

### Requirement 13: Button Color Differentiation

**User Story:** As a GeoStudio auditor, I want each workflow button to have a distinct color, so that I can quickly identify workflows visually and distinguish between similar workflow names.

#### Acceptance Criteria

1. THE DI_NDPL button SHALL use background color #5c6bc0 (Light Navy)
2. THE DI_NP_SDA button SHALL use background color #1565c0 (Blue)
3. THE DI_SDA button SHALL use background color #0d47a1 (Darker Blue)
4. THE FIXED_SDA button SHALL use background color #4a148c (Purple)
5. THE UI1 button SHALL use background color #d84315 (Deep Orange)
6. THE UI_0 button SHALL use background color #00695c (Teal)
7. THE UI_2 button SHALL use background color #6a1b9a (Purple)
8. THE CEM_0 button SHALL use background color #fdd835 (Yellow) with black text
9. THE CEM_1 button SHALL use background color #ffeb3b (Yellow) with black text
10. THE CEM_2 button SHALL use background color #fff176 (Light Yellow) with black text

### Requirement 14: Popup Notification System

**User Story:** As a GeoStudio auditor, I want visual notifications when workflows start and complete, so that I have clear feedback about the automation status without watching the console.

#### Acceptance Criteria

1. WHEN a workflow starts, THE Unified_Script SHALL display a popup with text "[Workflow]: Filling..." for 10 seconds
2. WHEN a workflow completes, THE Unified_Script SHALL display a popup with text "[Workflow]: Done!" for 2 seconds
3. WHEN a step fails, THE Unified_Script SHALL display a popup with text "Failed: [Step Name]" for 3 seconds
4. THE popup notifications SHALL appear at top: 10%, left: 50% with centered transform
5. THE popup notifications SHALL have black background (rgba(0,0,0,0.85)) with white text
6. THE popup notifications SHALL use 8px border-radius and 10px 20px padding
7. THE popup notifications SHALL use z-index 99999 to appear above other content

### Requirement 15: Script Metadata

**User Story:** As a TamperMonkey user, I want the script to have proper metadata, so that I can identify it in my script manager and understand its purpose.

#### Acceptance Criteria

1. THE Unified_Script SHALL have @name "Prophesy Pipeline Unified (v2.0)"
2. THE Unified_Script SHALL have @namespace "http://tampermonkey.net/"
3. THE Unified_Script SHALL have @version "2.0.0"
4. THE Unified_Script SHALL have @description that explains it consolidates all 10 workflows
5. THE Unified_Script SHALL have @grant "none" to indicate no special permissions required
6. THE Unified_Script SHALL include all 6 @match directives for URL patterns

### Requirement 16: POD Panel ComId Field Display

**User Story:** As a GeoStudio auditor, I want to see both ComId1 and ComId2 values in the POD floating panel, so that I have complete communication identifier information for each case.

#### Acceptance Criteria

1. THE POD_Panel SHALL extract ComId1 value from case details using field labels: 'ComId1', 'comid1'
2. THE POD_Panel SHALL extract ComId2 value from case details using field labels: 'ComId2', 'comid2'
3. THE POD_Panel SHALL display ComId1 in the floating panel with label "ComId1:"
4. THE POD_Panel SHALL display ComId2 in the floating panel with label "ComId2:"
5. WHEN ComId1 or ComId2 values are not found, THE POD_Panel SHALL display "-" as the default value
6. THE POD_Panel SHALL include ComId1 and ComId2 in the field mapping system with canonical keys

### Requirement 17: Click-to-Copy for ComId Fields

**User Story:** As a GeoStudio auditor, I want to click on ComId1 or ComId2 values to copy them to my clipboard, so that I can quickly paste these identifiers into other tools or forms.

#### Acceptance Criteria

1. WHEN ComId1 value is clicked, THE POD_Panel SHALL copy the ComId1 value to the system clipboard
2. WHEN ComId2 value is clicked, THE POD_Panel SHALL copy the ComId2 value to the system clipboard
3. THE POD_Panel SHALL display ComId1 and ComId2 values with cursor:pointer style to indicate clickability
4. THE POD_Panel SHALL use delegated click handlers on the panel container to survive innerHTML swaps
5. THE POD_Panel SHALL store ComId1 value in dataset.comId1Value for click handler access
6. THE POD_Panel SHALL store ComId2 value in dataset.comId2Value for click handler access
7. WHEN ComId value is "N/A" or "-", THE POD_Panel SHALL not perform clipboard copy operation

### Requirement 18: Enhanced POD Button Functionality

**User Story:** As a GeoStudio auditor, I want the POD button to highlight the tracking ID, open the associated image, and highlight the delivery point on the map, so that I can quickly locate and verify delivery information across multiple views.

#### Acceptance Criteria

1. WHEN the "📷 POD" button is clicked, THE POD_Panel SHALL highlight all instances of the Tracking ID on the page with yellow background
2. WHEN the "📷 POD" button is clicked, THE POD_Panel SHALL find the nearest camera button to the highlighted Tracking ID
3. WHEN the "📷 POD" button is clicked, THE POD_Panel SHALL click the nearest camera button to open the POD image
4. WHEN the "📷 POD" button is clicked, THE POD_Panel SHALL open the POD image in a new window positioned on the left side of the screen
5. WHEN the "📷 POD" button is clicked, THE POD_Panel SHALL scroll the highlighted Tracking ID into view with smooth behavior
6. WHEN the "📷 POD" button is clicked, THE POD_Panel SHALL highlight the corresponding delivery point on the GeoStudio map in Neon Orange color
7. THE POD_Panel SHALL attempt to click the nearest camera button up to 3 times with 800ms intervals
8. THE POD_Panel SHALL display a popup notification showing the number of Tracking ID matches found

### Requirement 19: POD Panel Order ID Field Removal

**User Story:** As a GeoStudio auditor, I want the POD floating panel to show only relevant information, so that the panel remains clean and focused on essential case details.

#### Acceptance Criteria

1. THE POD_Panel SHALL NOT display "Order ID 1" field in the floating panel UI
2. THE POD_Panel SHALL NOT display "Order ID 2" field in the floating panel UI
3. THE POD_Panel SHALL continue to extract orderingorderid1 value from case details for internal use
4. THE POD_Panel SHALL continue to extract orderingorderid2 value from case details for internal use
5. THE POD_Panel SHALL maintain orderingorderid1 and orderingorderid2 in the field mapping system
6. THE POD_Panel SHALL store orderingorderid1 and orderingorderid2 values in dataset for potential future use
