# Design Document: Six Scripts Integration

## Overview

This design document outlines the technical approach for integrating six userscripts (BOAK, GAMAutoFill, geocodeCopier, NEIPopup, Pastdeliveries, and PasteDPRE) into the Prophesy Pipeline Unified script v2.3.4. The integration consolidates 4 additional button panels, complex queue filtering logic, parent/iframe message passing, and shared utilities while preserving all existing functionality.

### Design Goals

1. **Minimal Disruption**: Preserve all existing Unified Script v2.3.4 functionality without modification
2. **Code Organization**: Maintain clear separation between integrated script sections for maintainability
3. **Performance**: Ensure no degradation in load time or responsiveness
4. **Conflict Avoidance**: Prevent variable name collisions and event listener conflicts
5. **Extensibility**: Structure code to allow future script integrations

### Integration Scope

**Scripts to Integrate:**
- BOAK (4 map tool buttons: Bing, OpenStreetMap, ADRI, Kibana)
- GAMAutoFill (965 lines of queue filtering logic)
- geocodeCopier (Copy DP/RE coordinates)
- NEIPopup (NEI verification dialog)
- Pastdeliveries (Auto-open past deliveries panel)
- PasteDPRE (Paste DP/RE coordinates)

**Existing Components to Preserve:**
- 10 workflow buttons (DI_NDPL, DI_NP_SDA, etc.)
- POD panel with auto-trigger
- Tracking ID highlighting
- Camera click functionality
- All existing event listeners and observers

## Architecture

### High-Level Structure

The integrated script will follow a modular architecture with clear section boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                    Userscript Metadata                       │
│                  (@name, @match, @grant)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Shared Utilities Section                   │
│  - delay(), waitForElement(), showPopup()                    │
│  - Edit Panel Awareness (isEditPanelOpen)                    │
│  - updatePanelPosition()                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Existing Workflow Engine Section                │
│  - clickRadioByValue(), clickDropdown()                      │
│  - runWorkflow(), workflow definitions                       │
│  - createButtonPanel(), injectButtonPanel()                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Existing POD Panel Section                      │
│  - highlightAllMatches(), findNearestCameraButton()          │
│  - openPastDeliveriesPanel(), startPODSearchForTracking()    │
│  - createFloatingPanel(), checkAndUpdatePanel()              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         NEW: BOAK Map Tools Section (Requirement 1)          │
│  - createBOAKPanel(), openBingMap(), openOSM()               │
│  - openADRI(), openKibana()                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│      NEW: GAMAutoFill Section (Requirement 2)                │
│  - 965 lines of queue filtering logic                        │
│  - MutationObserver for queue dropdowns                      │
│  - filterQueuesByGAMStatus()                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│    NEW: DP Validation Section (Requirement 3)                │
│  - validateDPDistance(), createFallbackDPField()             │
│  - Parent/Iframe message passing for DP data                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│    NEW: Geocode Copy Section (Requirement 4)                 │
│  - createGeocodeCopyPanel(), copyDPToClipboard()             │
│  - copyREToClipboard()                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│    NEW: NEI Verification Section (Requirement 5)             │
│  - createNEIVerificationDialog(), interceptNEISelection()    │
│  - Parent/Iframe message passing for dialog closure          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  NEW: Auto Past Deliveries Section (Requirement 6)           │
│  - detectNewCase(), autoOpenPastDeliveries()                 │
│  - Keyboard shortcut handler (P key)                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│    NEW: Geocode Paste Section (Requirement 7)                │
│  - createGeocodePastePanel(), pasteDPFromClipboard()         │
│  - pasteREFromClipboard(), pasteBothFromClipboard()          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Initialization Section                      │
│  - Initialize all panels and event listeners                 │
│  - Start observers and monitoring                            │
└─────────────────────────────────────────────────────────────┘
```

### Component Organization Strategy

**Section Markers**: Each integrated script section will be clearly marked with comments:
```javascript
// ============================================================
// SECTION: BOAK Map Tools (from BOAK.user.js)
// Requirements: 1.1-1.8
// ============================================================
```

**Namespace Strategy**: To avoid variable conflicts, each integrated script will use prefixed naming:
- BOAK: `boak_` prefix (e.g., `boak_panel`, `boak_openBing`)
- GAMAutoFill: `gam_` prefix (e.g., `gam_filterQueues`, `gam_observer`)
- geocodeCopier: `geocopy_` prefix (e.g., `geocopy_panel`, `geocopy_copyDP`)
- NEIPopup: `nei_` prefix (e.g., `nei_dialog`, `nei_verify`)
- Pastdeliveries: `pastdel_` prefix (e.g., `pastdel_autoOpen`, `pastdel_detectNew`)
- PasteDPRE: `geopaste_` prefix (e.g., `geopaste_panel`, `geopaste_pasteDP`)

**Shared Utilities**: Functions used by multiple scripts will remain unprefixed and be consolidated in the Shared Utilities section.

## Components and Interfaces

### 1. Shared Utilities (Consolidated)

These utilities are used across multiple integrated scripts and will be implemented once:

```javascript
// Already exists in v2.3.4
function delay(ms)
function waitForElement(selector, timeout)
function showPopup(message, duration)
function isEditPanelOpen()
function updatePanelPosition(panel)
```

**Design Decision**: Keep existing implementations unchanged. All integrated scripts will use these shared functions.

### 2. BOAK Map Tools Component

**Purpose**: Provide quick access to 4 mapping tools (Bing, OpenStreetMap, ADRI, Kibana)

**Interface**:
```javascript
function boak_createPanel()
  // Creates button panel with B, O, A, K buttons
  // Returns: HTMLElement (panel)

function boak_openBing()
  // Extracts address/coordinates from page
  // Opens Bing Maps in new tab

function boak_openOSM()
  // Extracts address/coordinates from page
  // Opens OpenStreetMap in new tab

function boak_openADRI()
  // Extracts location data from page
  // Opens ADRI viewer in new tab

function boak_openKibana()
  // Extracts street/unit information from page
  // Opens Kibana in new tab

function boak_extractAddressData()
  // Scrapes current page for address fields
  // Returns: {address, lat, lon, street, unit}

function boak_updateVisibility()
  // Shows/hides panel based on Edit Panel state
  // Called by Edit Panel Awareness observer
```

**Positioning**: `top: calc(57px + 130px)`, `left: 10px`, `position: fixed`

**Edit Panel Awareness**: Uses existing `isEditPanelOpen()` function to show/hide panel

### 3. GAMAutoFill Queue Filtering Component

**Purpose**: Automatically filter transfer queue dropdown to show only PBG queue when GAM Issue = "Yes"

**Interface**:
```javascript
function gam_init()
  // Sets up MutationObserver for queue dropdowns
  // Initializes all event listeners

function gam_filterQueueDropdown(dropdownElement)
  // Reads GAM Issue field value
  // Filters dropdown options if GAM Issue = "Yes"
  // Auto-selects PBG queue

function gam_getGAMIssueValue()
  // Scrapes page for GAM Issue field
  // Returns: "Yes" | "No" | null

function gam_observeQueueDropdowns()
  // MutationObserver callback
  // Detects when queue dropdowns appear in DOM
```

**Integration Strategy**: 
- Preserve all 965 lines of original logic
- Wrap in clearly marked section
- Use `gam_` prefix for all variables and functions
- Do not modify existing workflow button logic

### 4. DP Validation Component

**Purpose**: Validate Delivery Point coordinates are at least 10km from reference point

**Interface**:
```javascript
function dpval_init()
  // Sets up message passing listeners
  // Creates fallback DP field if needed

function dpval_validateDistance(lat, lon)
  // Calculates distance from reference point
  // Returns: {valid: boolean, distance: number}

function dpval_showWarning(distance)
  // Displays popup warning if distance < 10km
  // Allows user to proceed

function dpval_createFallbackField()
  // Creates DP input field if native field missing
  // Returns: HTMLElement

function dpval_setupMessagePassing()
  // Configures parent/iframe communication
  // Handles DP geocode data exchange

function dpval_handleMessage(event)
  // Message handler for cross-window communication
  // Validates origin and processes DP data
```

**Message Passing Protocol**:
```javascript
// Parent → Iframe
{type: 'DP_GEOCODE_UPDATE', lat: number, lon: number}

// Iframe → Parent
{type: 'DP_VALIDATION_RESULT', valid: boolean, distance: number}
```

### 5. Geocode Copy Component

**Purpose**: Copy DP and RE coordinates to clipboard

**Interface**:
```javascript
function geocopy_createPanel()
  // Creates button panel with CDP, CRE buttons
  // Returns: HTMLElement (panel)

function geocopy_copyDP()
  // Extracts DP coordinates from page
  // Copies to clipboard
  // Shows confirmation popup

function geocopy_copyRE()
  // Extracts RE coordinates from page
  // Copies to clipboard
  // Shows confirmation popup

function geocopy_extractCoordinates()
  // Scrapes page for DP and RE fields
  // Returns: {dp: string, re: string}

function geocopy_updateVisibility()
  // Shows/hides panel based on Edit Panel state
```

**Positioning**: `top: calc(57px + 265px)`, `left: 10px`, `position: fixed`

### 6. NEI Verification Component

**Purpose**: Prompt user to verify data sources before selecting NEI status

**Interface**:
```javascript
function nei_init()
  // Sets up event listeners for NEI selections
  // Configures message passing

function nei_createDialog()
  // Creates verification popup dialog
  // Returns: HTMLElement (dialog)

function nei_showVerification()
  // Displays dialog with checklist
  // Returns: Promise<boolean> (user confirmed)

function nei_interceptNEISelection(element)
  // Intercepts dropdown/radio selection
  // Shows verification dialog
  // Allows/blocks selection based on confirmation

function nei_setupMessagePassing()
  // Configures parent/iframe communication
  // Handles dialog closure across windows

function nei_handleMessage(event)
  // Message handler for cross-window communication
  // Processes dialog closure events
```

**Message Passing Protocol**:
```javascript
// Parent → Iframe
{type: 'NEI_DIALOG_CLOSE', confirmed: boolean}

// Iframe → Parent
{type: 'NEI_DIALOG_OPENED'}
```

**Verification Checklist**:
- Bing Maps checked
- OpenStreetMap checked
- Kibana checked
- ADRI checked
- Past Deliveries checked

### 7. Auto Past Deliveries Component

**Purpose**: Automatically open Past Deliveries panel on new cases

**Interface**:
```javascript
function pastdel_init()
  // Sets up observers for case changes
  // Configures keyboard shortcut

function pastdel_detectNewCase()
  // Monitors timer and AddressId changes
  // Returns: boolean (new case detected)

function pastdel_autoOpen()
  // Opens Past Deliveries panel
  // Sets Attribute filter to "Count"
  // Sets Filter option to "All"

function pastdel_observeAddressId()
  // MutationObserver for AddressId changes
  // Triggers autoOpen on change

function pastdel_observeTimer()
  // MutationObserver for timer changes
  // Detects new case loads

function pastdel_handleKeyPress(event)
  // Keyboard event handler
  // Toggles Past Deliveries panel on 'P' key
```

**Integration with Existing POD Panel**: 
- Uses existing `openPastDeliveriesPanel()` function
- Does not duplicate POD panel logic
- Adds auto-trigger behavior only

### 8. Geocode Paste Component

**Purpose**: Paste DP and RE coordinates from clipboard

**Interface**:
```javascript
function geopaste_createPanel()
  // Creates button panel with PDP, PRE, PBoth buttons
  // Returns: HTMLElement (panel)

async function geopaste_pasteDP()
  // Reads clipboard
  // Pastes into DP field
  // Shows confirmation popup

async function geopaste_pasteRE()
  // Reads clipboard
  // Pastes into RE field
  // Shows confirmation popup

async function geopaste_pasteBoth()
  // Reads clipboard
  // Pastes into both DP and RE fields
  // Shows confirmation popup

function geopaste_findDPField()
  // Locates DP input field on page
  // Returns: HTMLElement

function geopaste_findREField()
  // Locates RE input field on page
  // Returns: HTMLElement

function geopaste_updateVisibility()
  // Shows/hides panel based on Edit Panel state
```

**Positioning**: `top: calc(57px + 337px)`, `left: 10px`, `position: fixed`

**Clipboard API**: Uses `navigator.clipboard.readText()` with proper error handling

## Data Models

### Button Panel Configuration

```javascript
const PANEL_POSITIONS = {
  workflow: { top: '57px', left: '10px' },           // Existing
  pod: { top: 'calc(57px + 65px)', left: '10px' },   // Existing
  boak: { top: 'calc(57px + 130px)', left: '10px' }, // New
  geocopy: { top: 'calc(57px + 265px)', left: '10px' }, // New
  geopaste: { top: 'calc(57px + 337px)', left: '10px' } // New
};
```

### Message Passing Event Types

```javascript
const MESSAGE_TYPES = {
  DP_GEOCODE_UPDATE: 'DP_GEOCODE_UPDATE',
  DP_VALIDATION_RESULT: 'DP_VALIDATION_RESULT',
  NEI_DIALOG_CLOSE: 'NEI_DIALOG_CLOSE',
  NEI_DIALOG_OPENED: 'NEI_DIALOG_OPENED'
};
```

### Coordinate Format

```javascript
// Standard format for DP and RE coordinates
{
  dp: "latitude,longitude",  // e.g., "-33.8688,151.2093"
  re: "latitude,longitude"   // e.g., "-33.8690,151.2095"
}
```

### GAM Issue Values

```javascript
const GAM_ISSUE_VALUES = {
  YES: 'Yes',
  NO: 'No',
  UNKNOWN: null
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, I need to analyze each acceptance criterion for testability.


### Property Reflection

After analyzing all 72 acceptance criteria, I've identified the following redundancies and consolidation opportunities:

**Redundancy Group 1: Panel Positioning**
- Criteria 1.2, 4.2, 7.2, 12.1, 12.2, 12.3 all test specific CSS positioning values
- These are all examples of the same pattern and can be consolidated into a single example test
- Consolidation: One example test that verifies all three panel positions

**Redundancy Group 2: Panel Visibility on Edit Panel Open**
- Criteria 1.1, 4.1, 7.1 all test that panels appear when Edit Panel is open
- These are instances of the same property applied to different panels
- Consolidation: One property that states "For any button panel, when Edit Panel is open, the panel should be visible"

**Redundancy Group 3: Panel Hiding on Edit Panel Close**
- Criteria 1.7, 4.5, 7.6 all test that panels hide when Edit Panel closes
- These are instances of the same property applied to different panels
- Consolidation: One property that states "For any button panel, when Edit Panel is closed, the panel should be hidden"

**Redundancy Group 4: Map Tool Button Clicks**
- Criteria 1.3, 1.4, 1.5, 1.6 all test that clicking a button opens a specific URL
- These are instances of the same pattern (button click → URL open) with different parameters
- Consolidation: One property that states "For any map tool button, clicking it should open the correct mapping service URL"

**Redundancy Group 5: Geocode Copy Operations**
- Criteria 4.3, 4.4 test clipboard copy for DP and RE
- These are instances of the same operation on different fields
- Consolidation: One property that states "For any geocode field (DP or RE), clicking the copy button should copy that field's value to clipboard"

**Redundancy Group 6: Geocode Paste Operations**
- Criteria 7.3, 7.4, 7.5 test clipboard paste for DP, RE, and both
- These are instances of the same operation with different targets
- Consolidation: One property that states "For any paste button, clicking it should paste clipboard contents into the specified geocode field(s)"

**Redundancy Group 7: GAM Queue Filtering**
- Criteria 2.1 and 2.2 both test behavior when GAM_Issue = "Yes"
- 2.1 tests filtering, 2.2 tests auto-selection
- These can be combined: filtering to show only PBG implies auto-selection when there's only one option
- Consolidation: One property that combines filtering and auto-selection

**Redundancy Group 8: Panel Positioning Stability**
- Criteria 12.4, 12.5, 12.6 all test aspects of panel positioning and visibility
- 12.4 tests non-overlap, 12.5 tests visibility, 12.6 tests positioning type
- These can be combined into one comprehensive property about panel layout correctness
- Consolidation: One property that ensures panels are correctly positioned, visible, and non-overlapping

**Properties to Keep Separate:**
- DP validation (3.1, 3.2, 3.3) - each tests a distinct aspect of the validation flow
- NEI verification (5.1, 5.3, 5.6) - each tests a distinct step in the verification process
- Message passing security (11.3, 11.4, 11.5) - each tests a different aspect of message handling
- Existing functionality preservation (9.1-9.6) - regression tests for different features

### Correctness Properties

### Property 1: Button Panel Edit Panel Awareness

*For any* button panel (BOAK, geocode copy, geocode paste), when the Edit Panel is open, the panel should be visible, and when the Edit Panel is closed, the panel should be hidden.

**Validates: Requirements 1.1, 1.7, 4.1, 4.5, 7.1, 7.6**

### Property 2: Map Tool Button URL Opening

*For any* map tool button (B, O, A, K), when clicked, the script should extract the appropriate address or coordinate data from the page and open the corresponding mapping service URL in a new tab.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 3: GAM Queue Filtering and Auto-Selection

*For any* transfer queue dropdown, when GAM_Issue equals "Yes", the dropdown should display only the PBG_Queue option and automatically select it.

**Validates: Requirements 2.1, 2.2**

### Property 4: GAM Queue No Filtering

*For any* transfer queue dropdown, when GAM_Issue does not equal "Yes", the dropdown should display all available queues without filtering.

**Validates: Requirements 2.3**

### Property 5: DP Distance Calculation

*For any* Delivery Point geocode entered, the script should calculate the distance from the reference point and return a numeric distance value.

**Validates: Requirements 3.1**

### Property 6: DP Distance Warning Display

*For any* Delivery Point geocode where the calculated distance is less than 10km, the script should display a popup warning notification to the user.

**Validates: Requirements 3.2**

### Property 7: DP Warning Non-Blocking

*For any* DP distance warning displayed, the user should be able to proceed with their action despite the warning (warning is informational, not blocking).

**Validates: Requirements 3.3**

### Property 8: DP Fallback Field Creation

*For any* page where the native DP field is missing, the script should create a fallback DP input field that functions equivalently.

**Validates: Requirements 3.4**

### Property 9: DP Validation Cross-Context

*For any* Delivery Point geocode, the validation logic should function correctly in both Parent Window and Iframe contexts, producing consistent results.

**Validates: Requirements 3.6**

### Property 10: Geocode Copy to Clipboard

*For any* geocode field (DP or RE), when the corresponding copy button is clicked, the script should extract the field's coordinate value and copy it to the clipboard.

**Validates: Requirements 4.3, 4.4**

### Property 11: NEI Selection Verification Prompt

*For any* dropdown or radio button where NEI is selected, the script should display a verification popup before allowing the selection to proceed.

**Validates: Requirements 5.1**

### Property 12: NEI Verification Blocking

*For any* NEI selection attempt, the selection should not complete until the user confirms the verification popup.

**Validates: Requirements 5.3**

### Property 13: NEI Verification Cross-Context

*For any* NEI selection, the verification logic should function correctly in both Parent Window and Iframe contexts.

**Validates: Requirements 5.4**

### Property 14: NEI Confirmation Allows Selection

*For any* NEI verification popup, when the user confirms verification, the NEI selection should complete successfully.

**Validates: Requirements 5.6**

### Property 15: Auto-Open Past Deliveries on New Case

*For any* new case load (detected by AddressId change), the script should automatically open the Past Deliveries panel.

**Validates: Requirements 6.1**

### Property 16: Past Deliveries Panel Toggle

*For any* state of the Past Deliveries panel (open or closed), pressing the P key should toggle the panel to the opposite state.

**Validates: Requirements 6.4**

### Property 17: Geocode Paste from Clipboard

*For any* paste button (PDP, PRE, PBoth), when clicked, the script should read the clipboard contents and paste them into the specified geocode field(s).

**Validates: Requirements 7.3, 7.4, 7.5**

### Property 18: Existing POD Panel Functionality Preserved

*For any* tracking ID, the POD panel should continue to auto-trigger, highlight matches, and enable camera button clicks as in version 2.3.4.

**Validates: Requirements 9.2, 9.3, 9.4**

### Property 19: Existing Features Regression Prevention

*For any* existing feature from version 2.3.4, the integrated script should produce identical behavior to the original version.

**Validates: Requirements 9.6**

### Property 20: Button Click Response Time

*For any* button in the integrated script, when clicked, the script should respond (execute the button's action) within 500 milliseconds.

**Validates: Requirements 10.2**

### Property 21: Message Origin Validation

*For any* postMessage event received, the script should validate the message origin and reject messages from untrusted origins.

**Validates: Requirements 11.3**

### Property 22: Message Passing Failure Graceful Handling

*For any* message passing failure (timeout, invalid format, etc.), the script should handle the error gracefully and continue functioning without breaking.

**Validates: Requirements 11.4**

### Property 23: Message Delivery Performance

*For any* message sent between Parent Window and Iframe, the message should be delivered and processed within 100 milliseconds.

**Validates: Requirements 11.5**

### Property 24: Button Panel Layout Correctness

*For any* button panel, the panel should be positioned at its specified coordinates, remain visible when Edit Panel is open, use fixed positioning, and not overlap with other panels.

**Validates: Requirements 12.4, 12.5, 12.6**

### Example Tests

The following acceptance criteria are best tested with specific examples rather than property-based tests:

**Example 1: Panel Position Coordinates**
- BOAK panel positioned at `top: calc(57px + 130px)`
- Geocode copy panel positioned at `top: calc(57px + 265px)`
- Geocode paste panel positioned at `top: calc(57px + 337px)`
- **Validates: Requirements 1.2, 4.2, 7.2, 12.1, 12.2, 12.3**

**Example 2: NEI Verification Checklist Content**
- Verification popup contains checklist items: Bing, OSM, Kibana, ADRI, Past Deliveries
- **Validates: Requirements 5.2**

**Example 3: Past Deliveries Filter Settings**
- Attribute filter set to "Count"
- Filter option set to "All"
- **Validates: Requirements 6.2, 6.3**

**Example 4: Existing Workflow Buttons Present**
- All 10 workflow buttons exist: DI_NDPL, DI_NP_SDA, DI_NP_SDNA, DI_NP_SDNA_NOPOD, DI_NP_SDNA_NOPOD_NOMAP, DI_NP_SDNA_NOMAP, DI_NP_SDA_NOMAP, DI_NP_SDA_NOPOD, DI_NP_SDA_NOPOD_NOMAP, DI_NDPL_NOMAP
- **Validates: Requirements 9.1**

**Example 5: Script Initialization Time**
- Script completes initialization within 2 seconds of page load
- **Validates: Requirements 10.1**

## Error Handling

### Error Categories and Strategies

#### 1. DOM Element Not Found Errors

**Scenario**: Required page elements (fields, buttons, panels) are not found

**Strategy**:
- Use `waitForElement()` with timeout for elements that may load asynchronously
- Provide fallback behavior when optional elements are missing
- Log warnings for missing elements but continue execution
- For critical elements (e.g., Edit Panel), retry with exponential backoff

**Example**:
```javascript
async function boak_extractAddressData() {
  try {
    const addressField = await waitForElement('#address-field', 5000);
    return addressField.value;
  } catch (error) {
    console.warn('BOAK: Address field not found, using fallback');
    return null; // Allow script to continue
  }
}
```

#### 2. Clipboard API Errors

**Scenario**: Clipboard read/write operations fail due to permissions or browser restrictions

**Strategy**:
- Wrap all clipboard operations in try-catch blocks
- Show user-friendly error messages via popup
- Provide fallback instructions (e.g., "Please copy manually")
- Check for clipboard API availability before attempting operations

**Example**:
```javascript
async function geocopy_copyDP() {
  if (!navigator.clipboard) {
    showPopup('Clipboard not available. Please copy manually.', 3000);
    return;
  }
  
  try {
    await navigator.clipboard.writeText(dpValue);
    showPopup('DP copied to clipboard', 2000);
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    showPopup('Copy failed. Please try again or copy manually.', 3000);
  }
}
```

#### 3. Message Passing Errors

**Scenario**: postMessage communication fails between parent and iframe

**Strategy**:
- Validate message origin before processing
- Use timeout mechanism for message responses
- Provide fallback behavior when message passing fails
- Log all message passing errors for debugging

**Example**:
```javascript
function dpval_handleMessage(event) {
  // Validate origin
  if (!event.origin.match(/^https:\/\/.*\.prophesy\.com$/)) {
    console.warn('Message from untrusted origin:', event.origin);
    return;
  }
  
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'DP_GEOCODE_UPDATE') {
      dpval_validateDistance(data.lat, data.lon);
    }
  } catch (error) {
    console.error('Message processing failed:', error);
    // Continue execution - don't break on message errors
  }
}
```

#### 4. Coordinate Validation Errors

**Scenario**: Invalid coordinate formats or calculation errors

**Strategy**:
- Validate coordinate format before calculations
- Handle edge cases (null, undefined, empty string)
- Provide sensible defaults for invalid inputs
- Show user-friendly error messages for invalid coordinates

**Example**:
```javascript
function dpval_validateDistance(lat, lon) {
  // Validate inputs
  if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
    console.warn('Invalid coordinates:', lat, lon);
    return { valid: false, distance: null, error: 'Invalid coordinates' };
  }
  
  // Validate ranges
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return { valid: false, distance: null, error: 'Coordinates out of range' };
  }
  
  // Perform calculation
  try {
    const distance = calculateDistance(lat, lon, REF_LAT, REF_LON);
    return { valid: distance >= 10, distance: distance };
  } catch (error) {
    console.error('Distance calculation failed:', error);
    return { valid: false, distance: null, error: 'Calculation failed' };
  }
}
```

#### 5. Queue Filtering Errors

**Scenario**: GAM Issue field not found or queue dropdown manipulation fails

**Strategy**:
- Check for GAM Issue field existence before filtering
- Validate dropdown element before manipulation
- Preserve original dropdown state if filtering fails
- Log filtering errors but don't block user interaction

**Example**:
```javascript
function gam_filterQueueDropdown(dropdownElement) {
  try {
    const gamIssue = gam_getGAMIssueValue();
    
    if (gamIssue === null) {
      console.warn('GAM Issue field not found, skipping filter');
      return; // Don't filter if we can't determine GAM status
    }
    
    if (gamIssue === 'Yes') {
      // Filter dropdown
      const options = dropdownElement.querySelectorAll('option');
      options.forEach(opt => {
        if (opt.value !== 'PBG_Queue') {
          opt.style.display = 'none';
        }
      });
      dropdownElement.value = 'PBG_Queue';
    }
  } catch (error) {
    console.error('Queue filtering failed:', error);
    // Don't modify dropdown if filtering fails
  }
}
```

#### 6. Panel Creation and Positioning Errors

**Scenario**: Button panel creation fails or positioning is incorrect

**Strategy**:
- Validate parent container exists before creating panels
- Use defensive CSS with fallback positioning
- Check for panel existence before showing/hiding
- Retry panel creation if initial attempt fails

**Example**:
```javascript
function boak_createPanel() {
  try {
    // Check if panel already exists
    if (document.getElementById('boak-panel')) {
      return document.getElementById('boak-panel');
    }
    
    const panel = document.createElement('div');
    panel.id = 'boak-panel';
    panel.style.cssText = `
      position: fixed;
      top: calc(57px + 130px);
      left: 10px;
      z-index: 10000;
    `;
    
    // Validate panel was created successfully
    if (!panel.style.position) {
      throw new Error('Panel styling failed');
    }
    
    document.body.appendChild(panel);
    return panel;
  } catch (error) {
    console.error('BOAK panel creation failed:', error);
    return null;
  }
}
```

#### 7. Event Listener Conflicts

**Scenario**: Multiple event listeners interfere with each other or with existing page functionality

**Strategy**:
- Use event delegation where possible to minimize listener count
- Check for existing listeners before adding new ones
- Use unique identifiers for all event handlers
- Remove listeners properly on cleanup

**Example**:
```javascript
function nei_init() {
  // Use event delegation on document level
  document.addEventListener('change', function nei_changeHandler(event) {
    const target = event.target;
    
    // Only handle NEI selections
    if (target.tagName === 'SELECT' || target.type === 'radio') {
      const selectedValue = target.value || target.options?.[target.selectedIndex]?.text;
      
      if (selectedValue && selectedValue.includes('NEI')) {
        event.preventDefault();
        nei_showVerification().then(confirmed => {
          if (confirmed) {
            // Allow selection to proceed
            target.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            // Revert selection
            target.selectedIndex = 0;
          }
        });
      }
    }
  }, true); // Use capture phase to intercept before other handlers
}
```

### Error Logging Strategy

All errors will be logged with consistent formatting for debugging:

```javascript
function logError(component, action, error) {
  console.error(`[Prophesy Pipeline Unified] ${component} - ${action} failed:`, error);
}

// Usage
logError('BOAK', 'openBingMap', error);
logError('GAMAutoFill', 'filterQueues', error);
```

### User-Facing Error Messages

Error messages shown to users will be:
- Clear and actionable
- Non-technical (avoid stack traces or error codes)
- Brief (2-3 seconds display time for non-critical errors)
- Consistent in styling with existing popups

## Testing Strategy

### Dual Testing Approach

This integration requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
**Property Tests**: Verify universal properties across all inputs using randomization

### Property-Based Testing Configuration

**Library Selection**: 
- JavaScript: Use `fast-check` library for property-based testing
- Minimum 100 iterations per property test
- Each test tagged with reference to design document property

**Tag Format**:
```javascript
// Feature: six-scripts-integration, Property 1: Button Panel Edit Panel Awareness
```

### Test Organization

Tests will be organized by component section:

```
tests/
├── shared-utilities.test.js
├── boak-map-tools.test.js
├── gam-autofill.test.js
├── dp-validation.test.js
├── geocode-copy.test.js
├── nei-verification.test.js
├── auto-past-deliveries.test.js
├── geocode-paste.test.js
├── integration.test.js
└── regression.test.js
```

### Unit Test Coverage

**BOAK Map Tools**:
- Test each button opens correct URL format
- Test address extraction from various page states
- Test coordinate extraction and formatting
- Test panel visibility toggling
- Test panel positioning (Example 1)

**GAMAutoFill**:
- Test queue filtering when GAM Issue = "Yes"
- Test no filtering when GAM Issue ≠ "Yes"
- Test auto-selection of PBG queue
- Test observer triggers on dropdown appearance
- Test handling of missing GAM Issue field

**DP Validation**:
- Test distance calculation accuracy
- Test warning display for distance < 10km
- Test no warning for distance ≥ 10km
- Test fallback field creation
- Test cross-context validation
- Test invalid coordinate handling

**Geocode Copy**:
- Test CDP button copies DP coordinates
- Test CRE button copies RE coordinates
- Test clipboard API error handling
- Test panel visibility toggling

**NEI Verification**:
- Test popup appears on NEI selection
- Test popup content (Example 2)
- Test selection blocked until confirmation
- Test selection proceeds after confirmation
- Test cross-context verification

**Auto Past Deliveries**:
- Test panel opens on AddressId change
- Test filter settings (Example 3)
- Test P key toggle functionality
- Test timer change detection

**Geocode Paste**:
- Test PDP button pastes to DP field
- Test PRE button pastes to RE field
- Test PBoth button pastes to both fields
- Test clipboard API error handling

**Regression Tests**:
- Test all 10 workflow buttons exist (Example 4)
- Test POD panel functionality preserved
- Test tracking ID highlighting preserved
- Test camera click functionality preserved
- Test initialization time (Example 5)

### Property-Based Test Coverage

Each correctness property will have a corresponding property-based test:

**Property 1: Button Panel Edit Panel Awareness**
```javascript
// Feature: six-scripts-integration, Property 1: Button Panel Edit Panel Awareness
fc.assert(
  fc.property(
    fc.constantFrom('boak-panel', 'geocopy-panel', 'geopaste-panel'),
    fc.boolean(),
    (panelId, editPanelOpen) => {
      // Setup: Set Edit Panel state
      mockEditPanelState(editPanelOpen);
      
      // Execute: Update panel visibility
      updateAllPanelVisibility();
      
      // Verify: Panel visibility matches Edit Panel state
      const panel = document.getElementById(panelId);
      const isVisible = panel.style.display !== 'none';
      return isVisible === editPanelOpen;
    }
  ),
  { numRuns: 100 }
);
```

**Property 2: Map Tool Button URL Opening**
```javascript
// Feature: six-scripts-integration, Property 2: Map Tool Button URL Opening
fc.assert(
  fc.property(
    fc.constantFrom('B', 'O', 'A', 'K'),
    fc.record({
      address: fc.string(),
      lat: fc.double({ min: -90, max: 90 }),
      lon: fc.double({ min: -180, max: 180 })
    }),
    (buttonId, locationData) => {
      // Setup: Mock page with location data
      mockPageData(locationData);
      
      // Execute: Click button
      const url = getMapURLForButton(buttonId, locationData);
      
      // Verify: URL contains expected domain and data
      const expectedDomain = getExpectedDomain(buttonId);
      return url.includes(expectedDomain) && 
             (url.includes(locationData.address) || 
              url.includes(locationData.lat.toString()));
    }
  ),
  { numRuns: 100 }
);
```

**Property 3-24**: Similar property-based tests for each remaining property

### Performance Testing

**Initialization Time**:
- Measure time from script start to completion of initialization
- Target: < 2 seconds
- Test with various page load states

**Button Response Time**:
- Measure time from button click to action completion
- Target: < 500 milliseconds
- Test all button types

**Message Passing Performance**:
- Measure time from message send to message received
- Target: < 100 milliseconds
- Test parent→iframe and iframe→parent

### Integration Testing

**Cross-Component Tests**:
- Test BOAK buttons work while GAMAutoFill is filtering
- Test geocode copy/paste work with DP validation
- Test NEI verification works with existing workflow buttons
- Test all panels coexist without conflicts

**Regression Testing**:
- Run all existing v2.3.4 tests against integrated version
- Verify identical behavior for all existing features
- Test with real Prophesy Pipeline pages (manual testing)

### Test Execution Strategy

1. **Unit tests**: Run on every code change (fast feedback)
2. **Property tests**: Run before commits (comprehensive coverage)
3. **Integration tests**: Run before releases (cross-component verification)
4. **Performance tests**: Run weekly (detect performance regressions)
5. **Manual regression tests**: Run before major releases (real-world validation)

### Mocking Strategy

**DOM Mocking**:
- Use JSDOM for simulating Prophesy Pipeline page structure
- Mock Edit Panel, fields, dropdowns, buttons
- Mock iframe structure for message passing tests

**API Mocking**:
- Mock `navigator.clipboard` for clipboard tests
- Mock `window.open` for URL opening tests
- Mock `postMessage` for message passing tests

**Time Mocking**:
- Use fake timers for performance tests
- Mock `setTimeout` and `setInterval` for async tests

## Implementation Plan

### Phase 1: Foundation (Estimated: 2 hours)

**Objective**: Prepare the codebase structure for integration

**Tasks**:
1. Create section markers in the unified script
2. Add namespace prefixes to all new variables/functions
3. Document all existing functions that will be shared
4. Set up test infrastructure with fast-check library

**Deliverables**:
- Unified script with clear section boundaries
- Test file structure created
- Namespace conventions documented

### Phase 2: BOAK Integration (Estimated: 3 hours)

**Objective**: Integrate BOAK map tools functionality

**Tasks**:
1. Copy BOAK code into new section
2. Rename all variables/functions with `boak_` prefix
3. Create BOAK panel with B, O, A, K buttons
4. Implement address/coordinate extraction logic
5. Implement URL opening for each map service
6. Connect to Edit Panel Awareness
7. Write unit tests and property tests

**Deliverables**:
- BOAK section in unified script
- 4 functional map tool buttons
- Tests passing

### Phase 3: Geocode Copy/Paste Integration (Estimated: 2 hours)

**Objective**: Integrate geocode copy and paste functionality

**Tasks**:
1. Copy geocodeCopier code into new section
2. Copy PasteDPRE code into new section
3. Rename variables with `geocopy_` and `geopaste_` prefixes
4. Create both button panels
5. Implement clipboard operations with error handling
6. Connect to Edit Panel Awareness
7. Write unit tests and property tests

**Deliverables**:
- Geocode copy section in unified script
- Geocode paste section in unified script
- 5 functional buttons (CDP, CRE, PDP, PRE, PBoth)
- Tests passing

### Phase 4: GAMAutoFill Integration (Estimated: 4 hours)

**Objective**: Integrate complex queue filtering logic

**Tasks**:
1. Copy all 965 lines of GAMAutoFill code
2. Rename variables with `gam_` prefix
3. Preserve all observers and event listeners
4. Test queue filtering with various GAM Issue values
5. Ensure no conflicts with existing workflow buttons
6. Write unit tests and property tests

**Deliverables**:
- GAMAutoFill section in unified script
- Queue filtering functional
- Tests passing

### Phase 5: DP Validation Integration (Estimated: 3 hours)

**Objective**: Integrate DP coordinate validation with message passing

**Tasks**:
1. Copy DP validation code into new section
2. Rename variables with `dpval_` prefix
3. Implement distance calculation logic
4. Implement warning popup
5. Set up parent/iframe message passing
6. Create fallback DP field logic
7. Write unit tests and property tests

**Deliverables**:
- DP validation section in unified script
- Distance validation functional
- Message passing working
- Tests passing

### Phase 6: NEI Verification Integration (Estimated: 3 hours)

**Objective**: Integrate NEI verification popup with message passing

**Tasks**:
1. Copy NEIPopup code into new section
2. Rename variables with `nei_` prefix
3. Create verification dialog UI
4. Implement NEI selection interception
5. Set up parent/iframe message passing
6. Write unit tests and property tests

**Deliverables**:
- NEI verification section in unified script
- Verification popup functional
- Message passing working
- Tests passing

### Phase 7: Auto Past Deliveries Integration (Estimated: 2 hours)

**Objective**: Integrate automatic past deliveries panel opening

**Tasks**:
1. Copy Pastdeliveries code into new section
2. Rename variables with `pastdel_` prefix
3. Implement AddressId change detection
4. Implement timer change detection
5. Implement P key toggle
6. Connect to existing POD panel functions
7. Write unit tests and property tests

**Deliverables**:
- Auto past deliveries section in unified script
- Auto-open functional
- P key toggle functional
- Tests passing

### Phase 8: Integration Testing (Estimated: 3 hours)

**Objective**: Verify all components work together

**Tasks**:
1. Run all unit tests
2. Run all property tests
3. Test cross-component interactions
4. Test with real Prophesy Pipeline pages
5. Verify no performance degradation
6. Run regression tests

**Deliverables**:
- All tests passing
- Integration verified
- Performance benchmarks met

### Phase 9: Documentation and Cleanup (Estimated: 1 hour)

**Objective**: Finalize documentation and code quality

**Tasks**:
1. Add inline comments for complex logic
2. Update userscript metadata
3. Create user guide for new features
4. Document known limitations
5. Final code review

**Deliverables**:
- Well-documented code
- User guide
- Release notes

**Total Estimated Time**: 23 hours

### Risk Mitigation

**Risk 1: Variable Name Conflicts**
- Mitigation: Use strict namespace prefixes for all new code
- Verification: Search for duplicate variable names before integration

**Risk 2: Event Listener Conflicts**
- Mitigation: Use event delegation and unique handler names
- Verification: Test all event-driven features together

**Risk 3: Performance Degradation**
- Mitigation: Profile script execution time at each phase
- Verification: Run performance tests after each integration

**Risk 4: Message Passing Failures**
- Mitigation: Implement robust error handling and fallbacks
- Verification: Test message passing in various scenarios

**Risk 5: Regression of Existing Features**
- Mitigation: Run regression tests after each integration phase
- Verification: Manual testing with real Prophesy Pipeline pages

### Success Criteria

The integration is successful when:
1. All 24 correctness properties pass property-based tests (100 iterations each)
2. All 5 example tests pass
3. All existing v2.3.4 features continue to work identically
4. Script initialization completes in < 2 seconds
5. Button response time is < 500 milliseconds
6. Message passing completes in < 100 milliseconds
7. No console errors during normal operation
8. All 6 integrated scripts function as expected
9. Code is well-organized with clear section boundaries
10. Documentation is complete and accurate

