# Requirements Document

## Introduction

This document specifies the requirements for integrating six additional userscripts (BOAK, GAMAutoFill, geocodeCopier, NEIPopup, Pastdeliveries, and PasteDPRE) into the Prophesy Pipeline Unified script (v2.3.4). The integration must preserve all existing functionality while adding new capabilities for map tools, queue filtering, geocode management, NEI verification, and automated past deliveries access.

## Glossary

- **Unified_Script**: The Prophesy Pipeline Unified userscript (v2.3.4) that contains workflow buttons, POD panel, and basic features
- **Button_Panel**: A UI panel containing one or more clickable buttons positioned at specific coordinates
- **Edit_Panel**: The Prophesy Pipeline interface panel where case editing occurs
- **Edit_Panel_Awareness**: Logic that detects when the Edit Panel is open/closed and shows/hides UI elements accordingly
- **Parent_Window**: The main browser window containing the Prophesy Pipeline application
- **Iframe**: An embedded frame within the Parent Window used by Prophesy Pipeline
- **Message_Passing**: Communication mechanism between Parent Window and Iframe using postMessage API
- **GAM_Issue**: A field in Prophesy Pipeline indicating whether a case has a GAM (Geographic Address Management) issue
- **DP**: Delivery Point - the geocode coordinates for a delivery location
- **RE**: Road Entry - the geocode coordinates for road access to a location
- **NEI**: "Not Enough Information" - a status value indicating insufficient data to complete a case
- **Tracking_ID**: A unique identifier for tracking cases in the Prophesy Pipeline system
- **POD_Panel**: "Past Orders/Deliveries" panel that displays historical delivery information
- **Workflow_Button**: A button that triggers a specific workflow sequence (DI_NDPL, DI_NP_SDA, etc.)
- **Queue**: A work queue in Prophesy Pipeline where cases are routed for processing
- **PBG_Queue**: A specific queue for cases with GAM issues
- **DP_Validation**: Logic that verifies Delivery Point coordinates are at least 10km from a reference point
- **Geocode**: Geographic coordinates (latitude/longitude) for a location
- **ADRI**: Address Data Repository Interface - a mapping tool
- **Kibana**: A data visualization tool used for address lookup

## Requirements

### Requirement 1: Integrate BOAK Map Tools

**User Story:** As a case worker, I want quick access to multiple mapping tools (Bing, OpenStreetMap, ADRI, Kibana), so that I can verify addresses and coordinates efficiently.

#### Acceptance Criteria

1. WHEN the Edit Panel is open, THE Unified_Script SHALL display a Button Panel containing B, O, A, and K buttons
2. THE Button_Panel SHALL be positioned at top: calc(57px + 130px) relative to the viewport
3. WHEN the B button is clicked, THE Unified_Script SHALL open Bing Maps with either the current address or coordinates
4. WHEN the O button is clicked, THE Unified_Script SHALL open OpenStreetMap with either the current address or coordinates
5. WHEN the A button is clicked, THE Unified_Script SHALL open ADRI viewer with the current location data
6. WHEN the K button is clicked, THE Unified_Script SHALL open Kibana with either street or unit information
7. WHEN the Edit Panel is closed, THE Unified_Script SHALL hide the BOAK Button Panel
8. THE Unified_Script SHALL use Edit Panel Awareness to control BOAK Button Panel visibility

### Requirement 2: Integrate GAMAutoFill Queue Filtering

**User Story:** As a case worker, I want automatic queue filtering based on GAM Issue status, so that cases are routed to the correct queue without manual intervention.

#### Acceptance Criteria

1. WHEN a transfer queue dropdown is displayed AND GAM_Issue equals "Yes", THE Unified_Script SHALL filter the queue list to show only PBG_Queue
2. WHEN a transfer queue dropdown is displayed AND GAM_Issue equals "Yes", THE Unified_Script SHALL auto-select PBG_Queue
3. WHEN GAM_Issue does not equal "Yes", THE Unified_Script SHALL display all available queues without filtering
4. THE Unified_Script SHALL preserve the original 965-line GAMAutoFill logic without modification
5. THE Unified_Script SHALL maintain all GAMAutoFill event listeners and observers

### Requirement 3: Integrate DP Coordinate Validation

**User Story:** As a case worker, I want automatic validation of Delivery Point coordinates, so that I can identify invalid geocodes that are too close to reference points.

#### Acceptance Criteria

1. WHEN a Delivery Point geocode is entered, THE Unified_Script SHALL calculate the distance from a reference point
2. IF the distance is less than 10km, THEN THE Unified_Script SHALL display a popup notification warning the user
3. THE Unified_Script SHALL allow the user to proceed despite the warning
4. WHEN the native DP field is missing, THE Unified_Script SHALL create a fallback DP field
5. THE Unified_Script SHALL use Parent/Iframe Message Passing to communicate DP geocode data between windows
6. THE Unified_Script SHALL handle DP validation in both Parent Window and Iframe contexts

### Requirement 4: Integrate Geocode Copy Functionality

**User Story:** As a case worker, I want to copy Delivery Point and Road Entry coordinates to the clipboard, so that I can paste them into other tools or fields.

#### Acceptance Criteria

1. WHEN the Edit Panel is open, THE Unified_Script SHALL display a Button Panel containing CDP and CRE buttons
2. THE Button_Panel SHALL be positioned at top: calc(57px + 265px) relative to the viewport
3. WHEN the CDP button is clicked, THE Unified_Script SHALL copy the Delivery Point coordinates to the clipboard
4. WHEN the CRE button is clicked, THE Unified_Script SHALL copy the Road Entry coordinates to the clipboard
5. WHEN the Edit Panel is closed, THE Unified_Script SHALL hide the geocode copy Button Panel
6. THE Unified_Script SHALL use Edit Panel Awareness to control geocode copy Button Panel visibility

### Requirement 5: Integrate NEI Verification Popup

**User Story:** As a case worker, I want a verification prompt when selecting NEI status, so that I confirm I have checked all required data sources before marking a case as having insufficient information.

#### Acceptance Criteria

1. WHEN NEI is selected in any dropdown or radio button, THE Unified_Script SHALL display a verification popup
2. THE popup SHALL list all required data sources (Bing, OSM, Kibana, etc.) for verification
3. THE popup SHALL require user confirmation before allowing the NEI selection to proceed
4. THE Unified_Script SHALL handle NEI verification in both Parent Window and Iframe contexts
5. THE Unified_Script SHALL use Parent/Iframe Message Passing to close the verification dialog across window boundaries
6. WHEN the user confirms verification, THE Unified_Script SHALL allow the NEI selection to complete

### Requirement 6: Integrate Automatic Past Deliveries Panel

**User Story:** As a case worker, I want the Past Deliveries panel to open automatically on new cases, so that I can immediately see historical delivery information without manual navigation.

#### Acceptance Criteria

1. WHEN a new case is loaded (detected by AddressId change), THE Unified_Script SHALL automatically open the Past Deliveries panel
2. THE Unified_Script SHALL set the Attribute filter to "Count"
3. THE Unified_Script SHALL set the Filter option to "All"
4. WHEN the P key is pressed, THE Unified_Script SHALL toggle the Past Deliveries panel
5. THE Unified_Script SHALL monitor timer changes to detect new case loads
6. THE Unified_Script SHALL monitor AddressId changes to detect new case loads

### Requirement 7: Integrate Geocode Paste Functionality

**User Story:** As a case worker, I want to paste Delivery Point and Road Entry coordinates from the clipboard, so that I can quickly populate geocode fields with previously copied values.

#### Acceptance Criteria

1. WHEN the Edit Panel is open, THE Unified_Script SHALL display a Button Panel containing PDP, PRE, and PBoth buttons
2. THE Button_Panel SHALL be positioned at top: calc(57px + 337px) relative to the viewport
3. WHEN the PDP button is clicked, THE Unified_Script SHALL paste clipboard contents into the Delivery Point field
4. WHEN the PRE button is clicked, THE Unified_Script SHALL paste clipboard contents into the Road Entry field
5. WHEN the PBoth button is clicked, THE Unified_Script SHALL paste clipboard contents into both Delivery Point and Road Entry fields
6. WHEN the Edit Panel is closed, THE Unified_Script SHALL hide the geocode paste Button Panel
7. THE Unified_Script SHALL use Edit Panel Awareness to control geocode paste Button Panel visibility

### Requirement 8: Consolidate Shared Utility Functions

**User Story:** As a developer, I want shared utility functions consolidated into a single implementation, so that the codebase is maintainable and avoids duplication.

#### Acceptance Criteria

1. THE Unified_Script SHALL implement a single delay utility function used by all integrated scripts
2. THE Unified_Script SHALL implement a single waitForElement utility function used by all integrated scripts
3. THE Unified_Script SHALL implement a single Edit Panel Awareness mechanism used by all button panels
4. THE Unified_Script SHALL use unique variable names to avoid conflicts between integrated scripts
5. THE Unified_Script SHALL organize code into logical sections with clear comments indicating which original script each section came from

### Requirement 9: Preserve Existing Functionality

**User Story:** As a case worker, I want all existing Unified Script features to continue working, so that my current workflow is not disrupted by the integration.

#### Acceptance Criteria

1. THE Unified_Script SHALL maintain all 10 existing Workflow Buttons (DI_NDPL, DI_NP_SDA, etc.)
2. THE Unified_Script SHALL maintain the POD panel with auto-trigger functionality
3. THE Unified_Script SHALL maintain Tracking ID highlighting functionality
4. THE Unified_Script SHALL maintain camera click functionality
5. THE Unified_Script SHALL maintain all existing event listeners and observers
6. WHEN any existing feature is tested, THE Unified_Script SHALL produce the same behavior as version 2.3.4

### Requirement 10: Maintain Performance Standards

**User Story:** As a case worker, I want the integrated script to load and execute quickly, so that my productivity is not impacted by performance degradation.

#### Acceptance Criteria

1. WHEN the Unified_Script loads, THE script SHALL complete initialization within 2 seconds
2. WHEN any button is clicked, THE Unified_Script SHALL respond within 500 milliseconds
3. THE Unified_Script SHALL not cause visible lag or freezing in the Prophesy Pipeline interface
4. THE Unified_Script SHALL use efficient DOM queries and event delegation where possible
5. THE Unified_Script SHALL minimize redundant DOM mutations and reflows

### Requirement 11: Handle Parent/Iframe Communication

**User Story:** As a developer, I want robust parent/iframe message passing, so that features requiring cross-window communication work reliably.

#### Acceptance Criteria

1. THE Unified_Script SHALL implement message passing for GAMAutoFill DP geocode communication
2. THE Unified_Script SHALL implement message passing for NEIPopup dialog closure
3. THE Unified_Script SHALL validate message origins to prevent security vulnerabilities
4. THE Unified_Script SHALL handle message passing failures gracefully without breaking functionality
5. WHEN a message is sent between Parent Window and Iframe, THE Unified_Script SHALL deliver the message within 100 milliseconds

### Requirement 12: Position Button Panels Correctly

**User Story:** As a case worker, I want all button panels positioned correctly on screen, so that they are accessible and do not overlap with existing UI elements.

#### Acceptance Criteria

1. THE BOAK Button Panel SHALL be positioned at top: calc(57px + 130px)
2. THE geocode copy Button Panel SHALL be positioned at top: calc(57px + 265px)
3. THE geocode paste Button Panel SHALL be positioned at top: calc(57px + 337px)
4. THE Button Panels SHALL not overlap with existing Workflow Buttons or POD panel
5. THE Button Panels SHALL remain visible and accessible when the Edit Panel is open
6. THE Button Panels SHALL use fixed or absolute positioning to remain stable during page scrolling
