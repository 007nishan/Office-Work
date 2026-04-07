# Design Document: Unified Prophesy Pipeline TamperMonkey Script

## Overview

### Purpose

This design document specifies the architecture and implementation approach for consolidating 10 individual Prophesy Pipeline TamperMonkey scripts into a single unified script. The unified script will provide a streamlined user experience with a vertical button panel containing all workflow buttons, while maintaining all existing functionality and ensuring compliance with the GeoStudio Unified Brand Kit standards.

### Background

Currently, GeoStudio auditors must install and manage 10 separate TamperMonkey scripts (DI_NDPL, DI_NP_SDA, DI_SDA, FIXED_SDA, UI1, UI_0, UI_2, CEM_0, CEM_1, CEM_2), each providing a single button for a specific audit workflow. This creates management overhead and visual clutter. The unified script consolidates all workflows into a single installation with an organized vertical button panel.

### Goals

- Consolidate all 10 workflow scripts into one unified script
- Provide a clean, organized vertical button panel with all workflow buttons
- Maintain 100% functional parity with individual scripts
- Comply with GeoStudio Unified Brand Kit design standards
- Optimize performance with reduced timing delays (333ms selection delays, 100ms click delays)
- Implement robust error handling and user feedback
- Support all GeoStudio environments (na, eu, fe)

### Non-Goals

- Modifying the underlying GeoStudio platform
- Adding new workflows beyond the existing 10
- Supporting browsers other than those compatible with TamperMonkey
- Implementing workflow customization or configuration UI

## Architecture

### High-Level Architecture


The unified script follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    TamperMonkey Script                       │
│                  (Prophesy Pipeline Unified)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Initialization Layer                      │
│  - Iframe context check                                      │
│  - Singleton pattern enforcement                             │
│  - Audit form detection                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   Iframe Context          │   │   Main Window Context     │
│   (Form Filling)          │   │   (POD Panel)             │
└───────────────────────────┘   └───────────────────────────┘
                │                           │
                ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer                                │
│  - Button panel creation                                     │
│  - Button rendering (10 workflow buttons)                    │
│  - Edit panel awareness                                      │
│  - Popup notifications                                       │
│  - POD floating panel (main window)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Workflow Engine                            │
│  - Workflow configuration registry                           │
│  - Fill sequence orchestration                               │
│  - Button state management                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Form Interaction Layer                      │
│  - Radio button interaction (with disambiguation)            │
│  - Dropdown interaction (React-aware)                        │
│  - Element waiting and polling                               │
│  - Scroll and visibility handling                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Utility Layer                             │
│  - Delay functions                                           │
│  - Element finding                                           │
│  - Console logging                                           │
│  - Error handling                                            │
└─────────────────────────────────────────────────────────────┘
```

### POD Panel Architecture (Main Window Only)

```
┌─────────────────────────────────────────────────────────────┐
│                    POD Panel System                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Field Mapping System                        │
│  - Canonical key definitions                                 │
│  - Label variant mappings                                    │
│  - Case detail extraction                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Panel Rendering                             │
│  - HTML template generation                                  │
│  - Dataset storage (ComId1, ComId2, OrderIDs)                │
│  - Draggable positioning                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Delegated Click Handlers                        │
│  - ComId1/ComId2 click-to-copy                               │
│  - Geocode paste actions                                     │
│  - Tracking ID navigation                                    │
│  - POD search trigger                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  POD Search Engine                           │
│  - Tracking ID highlighting                                  │
│  - Nearest camera button detection                           │
│  - Camera click retry mechanism                              │
│  - Scroll to highlight                                       │
│  - Map delivery point highlighting                           │
└─────────────────────────────────────────────────────────────┘
```

### Execution Flow

1. **Script Load**: TamperMonkey loads script on matching URL
2. **Context Check**: Verify execution in iframe (not top-level window)
3. **Form Detection**: Wait for audit form to appear (Perfect_Address radio)
4. **Singleton Check**: Verify button panel doesn't already exist
5. **Panel Creation**: Inject button panel with all 10 workflow buttons
6. **Event Binding**: Attach click handlers to each button
7. **Edit Panel Monitoring**: Set up MutationObserver for panel position updates
8. **User Interaction**: User clicks workflow button
9. **Workflow Execution**: Execute fill sequence for selected workflow
10. **Feedback**: Update button state and show popup notifications



## Components and Interfaces

### 1. Button Panel Component

The button panel is the primary UI component that contains all workflow buttons.

**Responsibilities:**
- Render vertical layout of 10 workflow buttons
- Position itself relative to edit panel state
- Apply Brand Kit styling (translucent background, backdrop blur, shadows)
- Enforce singleton pattern to prevent duplicates

**Styling Specifications:**
```javascript
{
    position: 'fixed',
    top: 'calc(57px + 130px)',  // Header (57px) + offset (130px)
    right: '8px',                // Default position (320px when edit panel open)
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid #ccc',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: '99999',
    padding: '6px',
    gap: '6px',
    backdropFilter: 'blur(6px)',
    pointerEvents: 'auto',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
}
```

**DOM Structure:**
```html
<div id="prophesy-unified-panel">
  <button id="di-ndpl-btn">DI_NDPL</button>
  <button id="di-np-sda-btn">DI_NP_SDA</button>
  <button id="di-sda-btn">DI_SDA</button>
  <button id="fixed-sda-btn">FIXED_SDA</button>
  <button id="ui1-btn">UI1</button>
  <button id="ui-0-btn">UI_0</button>
  <button id="ui-2-btn">UI_2</button>
  <button id="cem-0-btn">CEM_0</button>
  <button id="cem-1-btn">CEM_1</button>
  <button id="cem-2-btn">CEM_2</button>
</div>
```

### 2. Workflow Button Component

Individual buttons within the panel that trigger specific workflows.

**Responsibilities:**
- Display workflow name
- Show current state (idle, filling, done, error)
- Handle click events
- Apply workflow-specific color
- Implement hover states per Brand Kit

**Styling Specifications:**
```javascript
{
    padding: '8px 16px',
    backgroundColor: '<workflow-specific-color>',
    color: '#fff',  // or '#000' for yellow buttons
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Amazon Ember, Arial, sans-serif',
    transition: 'background-color 0.2s',
    width: '100%',
    textAlign: 'center'
}
```

**Button States:**
- **Idle**: Original background color, enabled
- **Hover**: Yellow background (#ffff00), black text (if not disabled)
- **Filling**: Green background (#7cb342), text "Filling...", disabled
- **Done**: Green background, text "Done ✓", disabled
- **Error**: Red background (#b71c1c), text "Error ✗", enabled (allows retry)

**Button Colors by Workflow:**
- DI_NDPL: #5c6bc0 (Light Navy)
- DI_NP_SDA: #1565c0 (Blue)
- DI_SDA: #0d47a1 (Darker Blue)
- FIXED_SDA: #4a148c (Purple)
- UI1: #d84315 (Deep Orange)
- UI_0: #00695c (Teal)
- UI_2: #6a1b9a (Purple)
- CEM_0: #fdd835 (Yellow) with black text
- CEM_1: #ffeb3b (Yellow) with black text
- CEM_2: #fff176 (Light Yellow) with black text



### 3. Workflow Configuration Registry

A data structure that defines all 10 workflows and their fill sequences.

**Structure:**
```javascript
const WORKFLOWS = {
    DI_NDPL: {
        id: 'di-ndpl-btn',
        label: 'DI_NDPL',
        color: '#5c6bc0',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANnotatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Driver Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    DI_NP_SDA: {
        id: 'di-np-sda-btn',
        label: 'DI_NP_SDA',
        color: '#1565c0',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'NO-POD/No Scan Data', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'SCANatDifferentAddress', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Driver Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    // ... (similar structure for remaining 8 workflows)
};
```

**Field Types:**
- `radio`: Radio button selection with optional field label hint for disambiguation
- `dropdown`: Dropdown/combobox selection with React-aware interaction

### 4. Form Interaction Functions

#### clickRadioByValue(value, stepName, fieldLabelHint)

Finds and clicks a radio button with the specified value, handling disambiguation when multiple radios share the same value.

**Parameters:**
- `value` (string): The value attribute of the radio button
- `stepName` (string): Human-readable step name for error messages
- `fieldLabelHint` (string, optional): Field label text to disambiguate multiple radios

**Algorithm:**
1. Poll for radio buttons with matching value (15 second timeout, 200ms intervals)
2. If only one radio found, use it
3. If multiple radios found and hint provided:
   - Find parent container (fieldset, form-field, etc.)
   - Search for label/legend containing hint text
   - Select radio in matching container
4. If still not found, use last visible radio (most recently rendered)
5. Scroll element into view
6. Wait 100ms for scroll completion
7. Click the radio button
8. Wait 333ms for dependent fields to appear
9. Return true on success, false on failure

**Error Handling:**
- Log warning if radio not found
- Show popup notification with failed step name
- Return false to halt workflow execution



#### clickDropdown(fieldId, optionText, stepName)

Opens a React dropdown and selects the specified option.

**Parameters:**
- `fieldId` (string): The DOM ID of the combobox element
- `optionText` (string): The exact text of the option to select
- `stepName` (string): Human-readable step name for error messages

**Algorithm:**
1. Wait for combobox element to appear (15 second timeout, 200ms intervals)
2. Scroll element into view
3. Wait 100ms for scroll completion
4. Attempt React onMouseDown handler invocation:
   - Find React props key (starts with `__reactProps`)
   - Call onMouseDown with synthetic event object
   - Fallback to regular click if React handler not found
5. Wait 400ms for listbox to render
6. Find listbox element with `[role="listbox"]`
7. Search for option with matching text in `[role="option"]` elements
8. Scroll option into view
9. Wait 67ms for scroll completion
10. Click the option
11. Wait 333ms for dependent fields to appear
12. Return true on success, false on failure

**Error Handling:**
- Log warning if dropdown or listbox not found
- Log warning if option not found
- Show popup notification with failed step name
- Return false to halt workflow execution

### 5. Utility Functions

#### delay(ms)

Returns a Promise that resolves after the specified milliseconds.

```javascript
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### waitForElement(selector, timeout)

Polls for an element matching the selector until it appears and is visible.

**Parameters:**
- `selector` (string): CSS selector
- `timeout` (number): Maximum wait time in milliseconds (default: 10000)

**Returns:** Element or null

**Algorithm:**
1. Poll every 200ms until timeout
2. Check if element exists and has width > 0 (visible)
3. Return element if found, null if timeout

#### waitForRadioValue(value, timeout)

Polls for a radio button with the specified value until it appears and is visible.

**Parameters:**
- `value` (string): Radio button value attribute
- `timeout` (number): Maximum wait time in milliseconds (default: 10000)

**Returns:** Element or null

**Algorithm:**
1. Poll every 200ms until timeout
2. Check if radio exists and has width > 0 (visible)
3. Return radio if found, null if timeout

#### showPopup(message, duration)

Displays a temporary popup notification.

**Parameters:**
- `message` (string): Text to display
- `duration` (number): Display time in milliseconds (default: 2000)

**Styling:**
```javascript
{
    position: 'fixed',
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    background: 'rgba(0,0,0,0.85)',
    color: '#fff',
    borderRadius: '8px',
    fontFamily: 'Amazon Ember, Arial, sans-serif',
    fontSize: '14px',
    zIndex: '99999'
}
```

#### isEditPanelOpen()

Detects if the GeoStudio edit panel is currently open.

**Returns:** Boolean

**Algorithm:**
1. Query for edit panel element: `._3yG5UlL020qNbegyVK2vrw`
2. Check if element exists and display is not 'none'
3. Return true if open, false otherwise

#### updatePanelPosition(panel)

Updates the button panel's right position based on edit panel state.

**Parameters:**
- `panel` (HTMLElement): The button panel element

**Algorithm:**
1. Check if edit panel is open
2. Set panel.style.right to '320px' if open, '8px' if closed



### 6. Workflow Execution Engine

#### runWorkflow(workflowName)

Executes the fill sequence for the specified workflow.

**Parameters:**
- `workflowName` (string): Key from WORKFLOWS registry

**Algorithm:**
1. Get workflow configuration from registry
2. Get button element by workflow ID
3. Update button state to "Filling..." with green background
4. Disable button
5. Show popup: "[Workflow]: Filling..." (10 second duration)
6. Log workflow start with version
7. For each step in sequence:
   - Log step number and name
   - If type is 'radio': call clickRadioByValue()
   - If type is 'dropdown': call clickDropdown()
   - If step returns false, halt execution and show error
8. If all steps succeed:
   - Update button text to "Done ✓"
   - Show popup: "[Workflow]: Done!" (2 second duration)
   - Log completion
9. If any step fails or exception occurs:
   - Update button text to "Error ✗"
   - Change button background to red (#b71c1c)
   - Re-enable button (allow retry)
   - Log error to console

**Error Handling:**
- Wrap entire execution in try-catch
- Catch any exceptions and update button to error state
- Log all errors to console
- Show popup notifications for failures

### 7. Initialization System

#### injectButtonPanel()

Creates and injects the button panel into the page.

**Algorithm:**
1. Wait for audit form to appear (Perfect_Address radio, 20 second timeout)
2. If form not detected, log warning and exit
3. Check if panel already exists (singleton pattern)
4. If panel exists, exit without creating duplicate
5. Create panel div with ID 'prophesy-unified-panel'
6. Apply Brand Kit styling
7. For each workflow in WORKFLOWS:
   - Create button element
   - Set ID, text, colors per workflow config
   - Apply button styling
   - Add hover event listeners (yellow hover state)
   - Add click event listener (calls runWorkflow)
   - Append button to panel
8. Append panel to document.body
9. Set up MutationObserver for edit panel awareness
10. Call updatePanelPosition() after 500ms delay
11. Log successful injection

#### Singleton Pattern Implementation

```javascript
if (document.getElementById('prophesy-unified-panel')) {
    console.log('Prophesy Unified: Panel already exists, skipping injection');
    return;
}
```

#### Edit Panel Awareness Setup

```javascript
const observer = new MutationObserver(() => {
    updatePanelPosition(panel);
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
});

setTimeout(() => updatePanelPosition(panel), 500);
```



## Data Models

### Workflow Configuration Object

```javascript
{
    id: string,              // DOM ID for button element
    label: string,           // Display text for button
    color: string,           // Background color (hex)
    textColor: string,       // Text color (hex)
    sequence: Step[]         // Array of fill steps
}
```

### Step Object

```javascript
{
    type: 'radio' | 'dropdown',  // Field interaction type
    value?: string,              // Radio button value (for radio type)
    fieldId?: string,            // Dropdown element ID (for dropdown type)
    option?: string,             // Dropdown option text (for dropdown type)
    step: string,                // Human-readable step name
    hint?: string                // Field label hint for disambiguation (optional)
}
```

### Button State

```javascript
{
    text: string,           // Button text content
    backgroundColor: string, // Current background color
    disabled: boolean       // Whether button is disabled
}
```

**State Transitions:**
```
Idle → Filling → Done
  ↓       ↓
  └─────→ Error → Idle (on retry)
```

### POD Panel Field Mapping Object

```javascript
{
    key: string,      // Canonical field key
    labels: string[]  // Array of page label variants that map to this key
}
```

**Example:**
```javascript
{ 
    key: 'ComId1', 
    labels: ['ComId1', 'comid1'] 
}
```

### POD Panel Case Details Object

```javascript
{
    TrackingId: string,        // Tracking ID (e.g., "TBA123456789")
    DPVended: string,          // Delivery point geocode (raw format)
    REVended: string,          // Scan geocode (raw format)
    Defecttype: string,        // Defect type classification
    orderingorderid1: string,  // Order ID 1 (extracted but not displayed)
    orderingorderid2: string,  // Order ID 2 (extracted but not displayed)
    PrevAuditDate: string,     // Previous audit date
    ComId1: string,            // Communication ID 1
    ComId2: string             // Communication ID 2
}
```

**Default Values:**
- Missing fields: 'N/A'
- Empty fields: '-'

### POD Panel Dataset Storage

```javascript
{
    trackingIdValue: string,   // Current tracking ID
    dpValue: string,           // Raw DPVended value
    scanValue: string,         // Raw REVended value
    orderId1Value: string,     // Order ID 1 (for internal use)
    orderId2Value: string,     // Order ID 2 (for internal use)
    comId1Value: string,       // ComId1 for click handler
    comId2Value: string        // ComId2 for click handler
}
```

### POD Camera State Object

```javascript
{
    attempts: number,      // Number of camera button click attempts
    intervalId: number     // setInterval ID for retry mechanism
}
```

**Stored in Map:**
```javascript
podCameraState: Map<string, PODCameraState>
// Key: tracking ID
// Value: camera state object
```

### Complete Workflow Registry

```javascript
const WORKFLOWS = {
    DI_NDPL: {
        id: 'di-ndpl-btn',
        label: 'DI_NDPL',
        color: '#5c6bc0',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANnotatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Driver Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    DI_NP_SDA: {
        id: 'di-np-sda-btn',
        label: 'DI_NP_SDA',
        color: '#1565c0',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'NO-POD/No Scan Data', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'SCANatDifferentAddress', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Driver Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    DI_SDA: {
        id: 'di-sda-btn',
        label: 'DI_SDA',
        color: '#0d47a1',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatDifferentAddress', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'NA', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'Driver Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    FIXED_SDA: {
        id: 'fixed-sda-btn',
        label: 'FIXED_SDA',
        color: '#4a148c',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'FIXED', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatDifferentAddress', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'NA', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'Geocode/Geofence Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    UI1: {
        id: 'ui1-btn',
        label: 'UI1',
        color: '#d84315',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'DH Unavailable -DH Unavailable', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatUnit/Building', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Unknown Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'WholePackageIsMissing', step: 'Transcript Analysis' }
        ]
    },
    UI_0: {
        id: 'ui-0-btn',
        label: 'UI_0',
        color: '#00695c',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'DH Unavailable -DH Unavailable', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'NO-POD/No Scan Data', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'SCANatUnit/Building', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Unknown Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'WholePackageIsMissing', step: 'Transcript Analysis' }
        ]
    },
    UI_2: {
        id: 'ui-2-btn',
        label: 'UI_2',
        color: '#6a1b9a',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Unknown Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'WholePackageIsMissing', step: 'Transcript Analysis' }
        ]
    },
    CEM_0: {
        id: 'cem-0-btn',
        label: 'CEM_0',
        color: '#fdd835',
        textColor: '#000',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Package Placement -Under Object', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatUnit/Building', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Customer Expectation Mismatch', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    CEM_1: {
        id: 'cem-1-btn',
        label: 'CEM_1',
        color: '#ffeb3b',
        textColor: '#000',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Package Placement -Other Specific Spots', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANnotatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Customer Expectation Mismatch', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    CEM_2: {
        id: 'cem-2-btn',
        label: 'CEM_2',
        color: '#fff176',
        textColor: '#000',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Rear Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANnotatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Customer Expectation Mismatch', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    }
};
```



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Button styling properties** (3.1-3.8, 4.2-4.5, 13.1-13.10) can be consolidated into comprehensive properties about button appearance
2. **Logging properties** (11.3-11.7) can be combined into properties about logging at different workflow stages
3. **Popup notification properties** (14.1-14.7) can be consolidated into properties about popup behavior
4. **Error handling properties** (8.1-8.6) overlap and can be combined
5. **Timing properties** (10.1-10.5) can be consolidated into properties about consistent timing across operations

The following properties represent the unique, non-redundant validation requirements:

### Property 1: Workflow Registry Completeness

For any of the 10 expected workflows (DI_NDPL, DI_NP_SDA, DI_SDA, FIXED_SDA, UI1, UI_0, UI_2, CEM_0, CEM_1, CEM_2), the WORKFLOWS registry should contain a configuration object with id, label, color, textColor, and sequence fields.

**Validates: Requirements 1.1, 1.5**

### Property 2: Button Visual Identity

For any button in the button panel, the button should have a unique background color matching its workflow configuration, a unique DOM ID, consistent padding (8px 16px), and 14px bold Amazon Ember font.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5, 13.1-13.10**

### Property 3: Yellow Hover State

For any workflow button, when the mouse enters the button and the button is not disabled, the background color should change to #ffff00 (yellow).

**Validates: Requirements 3.4**

### Property 4: Button Border Consistency

For any workflow button, the border should be "1px solid #ccc".

**Validates: Requirements 3.6**

### Property 5: Workflow Execution Trigger

For any workflow button, when clicked, the corresponding workflow's fill sequence should be executed.

**Validates: Requirements 5.1**

### Property 6: Button State During Execution

For any workflow button, when its fill sequence starts, the button text should change to "Filling...", the background should change to green, and the button should be disabled.

**Validates: Requirements 5.2, 5.5**

### Property 7: Button State After Success

For any workflow button, when its fill sequence completes successfully, the button text should change to "Done ✓".

**Validates: Requirements 5.3**

### Property 8: Button State After Error

For any workflow button, when its fill sequence encounters an error, the button text should change to "Error ✗", the background should change to red (#b71c1c), and the button should be re-enabled.

**Validates: Requirements 5.4, 8.4, 8.6**

### Property 9: Popup Notification on Workflow Start

For any workflow, when its fill sequence starts, a popup notification should appear with text "[Workflow]: Filling..." and remain visible for 10 seconds.

**Validates: Requirements 5.6, 14.1**

### Property 10: Popup Notification on Workflow Completion

For any workflow, when its fill sequence completes successfully, a popup notification should appear with text "[Workflow]: Done!" and remain visible for 2 seconds.

**Validates: Requirements 5.6, 14.2**

### Property 11: Popup Notification on Step Failure

For any workflow step that fails, a popup notification should appear with text "Failed: [Step Name]" and remain visible for 3 seconds.

**Validates: Requirements 5.6, 14.3**

### Property 12: Popup Positioning and Styling

For any popup notification, it should be positioned at top: 10%, left: 50% with translateX(-50%), have black background rgba(0,0,0,0.85), white text, 8px border-radius, 10px 20px padding, and z-index 99999.

**Validates: Requirements 14.4, 14.5, 14.6, 14.7**

### Property 13: Radio Button Disambiguation

For any radio button value that appears in multiple fields, when a field label hint is provided, the clickRadioByValue function should select the radio button within the container whose label contains the hint text.

**Validates: Requirements 6.1, 6.6**

### Property 14: React Dropdown Interaction

For any dropdown field, the clickDropdown function should attempt to invoke the React onMouseDown handler before falling back to a regular click.

**Validates: Requirements 6.2, 6.7**

### Property 15: Element Visibility Waiting

For any form element (radio or dropdown), the interaction function should wait for the element to become visible (width > 0) before attempting interaction, with a 15 second timeout.

**Validates: Requirements 6.3**

### Property 16: Scroll Before Click

For any clickable element (radio or dropdown option), the interaction function should call scrollIntoView before clicking the element.

**Validates: Requirements 6.4**

### Property 17: Post-Selection Delay

For any form field selection (radio or dropdown), after the selection is made, the function should wait 333ms before proceeding to allow dependent fields to appear.

**Validates: Requirements 6.5, 10.1**

### Property 18: Pre-Click Scroll Delay

For any element that is scrolled into view, the interaction function should wait 100ms after scrolling before clicking.

**Validates: Requirements 10.2**

### Property 19: Dropdown Listbox Rendering Delay

For any dropdown that is opened, the function should wait 400ms after opening to allow the listbox to render before searching for options.

**Validates: Requirements 10.3**

### Property 20: Option Scroll Delay

For any dropdown option that is scrolled into view, the function should wait 67ms after scrolling before clicking.

**Validates: Requirements 10.4**

### Property 21: Element Polling Interval

For any element waiting operation (waitForElement, waitForRadioValue), the polling interval should be 200ms.

**Validates: Requirements 10.5**

### Property 22: Error Logging on Field Not Found

For any form field that is not found within the timeout period, the interaction function should log a warning to the console with the field identifier, display a popup notification with the failed step name, and return false.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 23: Exception Logging

For any exception that occurs during workflow execution, the error should be logged to the console.

**Validates: Requirements 8.5**

### Property 24: Workflow Start Logging

For any workflow that begins execution, a console log should be written with the workflow name and version.

**Validates: Requirements 11.3**

### Property 25: Step Logging

For any step in a workflow sequence, before the interaction occurs, a console log should be written with the step number and field name.

**Validates: Requirements 11.4**

### Property 26: Success Logging

For any successful field interaction, a console log should be written with the selected value.

**Validates: Requirements 11.5**

### Property 27: Field Not Found Warning Logging

For any field that is not found, a warning should be logged to the console.

**Validates: Requirements 11.6**

### Property 28: Workflow Completion Logging

For any workflow that completes successfully, a console log should be written indicating completion.

**Validates: Requirements 11.7**

### Property 29: ComId Field Extraction with Label Variants

For any ComId field (ComId1 or ComId2) and any of its label variants ('ComId1'/'comid1' or 'ComId2'/'comid2'), when extracting case details, the field should be correctly extracted and mapped to its canonical key regardless of which label variant is present in the page.

**Validates: Requirements 16.1, 16.2**

### Property 30: ComId Click-to-Copy

For any ComId field (ComId1 or ComId2) with a valid value (not 'N/A' or '-'), when the field is clicked in the POD panel, the value should be copied to the system clipboard.

**Validates: Requirements 17.1, 17.2**

### Property 31: Tracking ID Highlighting

For any tracking ID value (not 'N/A' or '-'), when the POD search is triggered, all text instances of that tracking ID on the page should be wrapped in span elements with class 'tracking-highlight' and yellow background styling.

**Validates: Requirements 18.1**

### Property 32: Nearest Camera Button Detection

For any highlighted tracking ID element and any set of camera buttons on the page, the findNearestCameraButton function should return the camera button with the smallest Euclidean distance from the highlight element's position.

**Validates: Requirements 18.2, 18.3**

### Property 33: POD Search Match Count Accuracy

For any tracking ID and any page content, when POD search is triggered, the popup notification should display a match count that equals the actual number of times the tracking ID appears in the page text.

**Validates: Requirements 18.8**

### Property 34: Map Delivery Point Highlighting

For any tracking ID, when POD search is triggered, the corresponding delivery point marker on the map should be styled with Neon Orange color (#FF6600) and elevated z-index.

**Validates: Requirements 18.6**



## Error Handling

### Error Categories

1. **Element Not Found Errors**
   - Radio button with specified value not found
   - Dropdown element not found
   - Listbox not rendered after dropdown click
   - Option not found in listbox

2. **Timeout Errors**
   - Element wait timeout (15 seconds for form fields, 20 seconds for audit form detection)
   - Polling timeout in waitForElement/waitForRadioValue

3. **Execution Errors**
   - Exceptions during workflow execution
   - React handler invocation failures
   - DOM manipulation errors

4. **Initialization Errors**
   - Audit form not detected (Perfect_Address radio not found)
   - Iframe context check failure

### Error Handling Strategy

#### Element Not Found

When a form field is not found:
1. Log warning to console with field identifier
2. Display popup notification: "Failed: [Step Name]" (3 second duration)
3. Return false from interaction function
4. Halt workflow execution
5. Update button to error state
6. Re-enable button to allow retry

#### Timeout Handling

When an element wait times out:
1. Return null from wait function
2. Calling function checks for null and handles as "element not found"
3. Follow element not found error handling

#### Exception Handling

Wrap workflow execution in try-catch:
```javascript
try {
    await runWorkflow(workflowName);
    // Update button to success state
} catch (err) {
    console.error('Workflow error:', err);
    button.textContent = 'Error ✗';
    button.style.backgroundColor = '#b71c1c';
    button.disabled = false;  // Allow retry
}
```

#### Initialization Failures

If audit form not detected:
1. Log warning: "Audit form not detected"
2. Exit without creating button panel
3. Script remains loaded for potential future page changes

If not in iframe context:
1. Exit immediately at script start
2. No logging or UI changes

### Error Recovery

**User-Initiated Retry:**
- After error state, button remains enabled
- User can click button again to retry workflow
- Button resets to idle state on retry click

**No Automatic Retry:**
- Script does not automatically retry failed operations
- User must manually trigger retry by clicking button again

**Graceful Degradation:**
- If React handler not found, fallback to regular click
- If field label hint doesn't match, use last visible radio
- If element not found, halt workflow but keep script functional

### Error Feedback

**Console Logging:**
- All errors logged with descriptive messages
- Include field identifiers, step names, and error details
- Use console.warn for expected failures (element not found)
- Use console.error for unexpected exceptions

**Visual Feedback:**
- Button text changes to "Error ✗"
- Button background changes to red (#b71c1c)
- Popup notification shows failed step name
- Button remains enabled for retry

**No Silent Failures:**
- Every error produces console output
- Every error produces visual feedback
- User always knows when something went wrong

### POD Panel Error Handling

**Field Extraction Errors:**
- Missing fields default to 'N/A' or '-'
- No error thrown for missing optional fields
- Log warning if critical fields (TrackingId) missing

**Click Handler Errors:**
- Clipboard API failures caught silently (no user alert)
- Invalid values ('N/A', '-') skip clipboard operation
- Log clipboard errors to console for debugging

**POD Search Errors:**
- No tracking ID: skip search, no error
- No camera buttons found: complete search without clicking
- No highlights found: clear interval, log warning
- Map container not found: log warning, continue with other operations

**Map Highlighting Errors:**
- Map container not found: log warning, skip highlighting
- No matching marker: log warning, no error thrown
- Marker styling errors: catch and log, don't break search

**Retry Mechanism Errors:**
- Interval cleared on error to prevent memory leaks
- State map cleaned up after completion or error
- Maximum 3 attempts enforced to prevent infinite loops



## Testing Strategy

### Dual Testing Approach

The unified script requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests:**
- Specific examples and edge cases
- Integration points between components
- Error conditions and boundary cases
- Concrete scenarios that demonstrate correct behavior

**Property-Based Tests:**
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Validation of invariants across all workflows
- Testing with generated data to find edge cases

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across all possible inputs.

### Property-Based Testing Configuration

**Library Selection:**
- JavaScript: Use `fast-check` library for property-based testing
- Installation: `npm install --save-dev fast-check`

**Test Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: unified-prophesy-pipeline-script, Property {number}: {property_text}`

**Example Property Test Structure:**
```javascript
const fc = require('fast-check');

// Feature: unified-prophesy-pipeline-script, Property 1: Workflow Registry Completeness
test('All expected workflows exist in registry', () => {
    fc.assert(
        fc.property(
            fc.constantFrom('DI_NDPL', 'DI_NP_SDA', 'DI_SDA', 'FIXED_SDA', 
                           'UI1', 'UI_0', 'UI_2', 'CEM_0', 'CEM_1', 'CEM_2'),
            (workflowName) => {
                const workflow = WORKFLOWS[workflowName];
                expect(workflow).toBeDefined();
                expect(workflow).toHaveProperty('id');
                expect(workflow).toHaveProperty('label');
                expect(workflow).toHaveProperty('color');
                expect(workflow).toHaveProperty('textColor');
                expect(workflow).toHaveProperty('sequence');
                expect(Array.isArray(workflow.sequence)).toBe(true);
            }
        ),
        { numRuns: 100 }
    );
});
```

### Unit Testing Strategy

**Component Testing:**
1. **Button Panel Creation**
   - Test panel is created with correct ID
   - Test panel has correct styling
   - Test panel contains 10 buttons
   - Test singleton pattern prevents duplicates

2. **Button Creation**
   - Test each button has correct ID, label, color
   - Test button hover states
   - Test button click handlers are attached

3. **Utility Functions**
   - Test delay() resolves after specified time
   - Test waitForElement() finds visible elements
   - Test waitForElement() returns null on timeout
   - Test showPopup() creates and removes popup

4. **Form Interaction Functions**
   - Test clickRadioByValue() with single radio
   - Test clickRadioByValue() with multiple radios and hint
   - Test clickRadioByValue() with multiple radios without hint
   - Test clickDropdown() with React handler
   - Test clickDropdown() with fallback click
   - Test clickDropdown() option selection

5. **Workflow Execution**
   - Test runWorkflow() executes all steps in sequence
   - Test runWorkflow() halts on step failure
   - Test runWorkflow() updates button states correctly
   - Test runWorkflow() handles exceptions

6. **Error Handling**
   - Test element not found produces warning and popup
   - Test timeout returns null
   - Test exception caught and logged
   - Test button error state after failure

7. **Edit Panel Awareness**
   - Test isEditPanelOpen() detects open panel
   - Test isEditPanelOpen() detects closed panel
   - Test updatePanelPosition() adjusts right position
   - Test MutationObserver triggers position update

**Integration Testing:**
1. Test complete workflow execution from button click to completion
2. Test workflow execution with simulated form fields
3. Test error recovery and retry
4. Test multiple workflows in sequence
5. Test panel position updates when edit panel opens/closes

**Edge Cases:**
1. Test behavior when audit form never appears
2. Test behavior when script runs in top-level window
3. Test behavior when panel already exists
4. Test behavior when React handler is missing
5. Test behavior when listbox doesn't render
6. Test behavior with very slow page loads
7. Test POD panel with missing ComId fields
8. Test POD panel with invalid ComId values ('N/A', '-')
9. Test POD search with no tracking ID matches
10. Test POD search with no camera buttons on page
11. Test nearest camera button with single camera
12. Test map highlighting with no map container

### POD Panel Testing

**Component Testing:**
1. **Field Mapping System**
   - Test extraction with all label variants
   - Test extraction with missing fields
   - Test canonical key lookup
   - Test first-found-value-only behavior

2. **HTML Template Rendering**
   - Test ComId1 and ComId2 display
   - Test Order ID fields not displayed
   - Test dataset storage for all fields
   - Test clickable element styling

3. **Delegated Click Handlers**
   - Test ComId1 click-to-copy
   - Test ComId2 click-to-copy
   - Test clipboard copy with valid values
   - Test clipboard copy skipped for 'N/A' and '-'
   - Test handler survives innerHTML swap

4. **Tracking ID Highlighting**
   - Test highlight all matches
   - Test highlight count accuracy
   - Test highlight styling applied
   - Test previous highlights cleared
   - Test POD panel excluded from highlighting

5. **Nearest Camera Button Detection**
   - Test Euclidean distance calculation
   - Test with multiple camera buttons
   - Test with single camera button
   - Test with no camera buttons
   - Test with camera buttons at various positions

6. **POD Search Retry Mechanism**
   - Test 3 retry attempts
   - Test 800ms interval timing
   - Test state cleanup after completion
   - Test state cleanup on new search

7. **Map Delivery Point Highlighting**
   - Test marker selection by tracking ID
   - Test Neon Orange styling applied
   - Test z-index elevation
   - Test previous highlights cleared
   - Test with no matching marker

**Property-Based Testing for POD Panel:**

```javascript
// Feature: unified-prophesy-pipeline-script, Property 29: ComId Field Extraction with Label Variants
test('ComId fields extracted correctly with any label variant', () => {
    fc.assert(
        fc.property(
            fc.record({
                comId1Label: fc.constantFrom('ComId1', 'comid1'),
                comId1Value: fc.string(),
                comId2Label: fc.constantFrom('ComId2', 'comid2'),
                comId2Value: fc.string()
            }),
            (testCase) => {
                // Create mock case detail blocks with label variants
                const mockBlocks = createMockCaseDetails(testCase);
                const extracted = extractCaseDetails(mockBlocks);
                
                expect(extracted.ComId1).toBe(testCase.comId1Value);
                expect(extracted.ComId2).toBe(testCase.comId2Value);
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: unified-prophesy-pipeline-script, Property 31: Tracking ID Highlighting
test('All tracking ID instances highlighted on page', () => {
    fc.assert(
        fc.property(
            fc.string({ minLength: 5, maxLength: 20 }).filter(s => s !== 'N/A' && s !== '-'),
            fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
            (trackingId, pageTexts) => {
                // Create page with tracking ID embedded in various texts
                const page = createMockPage(trackingId, pageTexts);
                const expectedCount = countOccurrences(pageTexts, trackingId);
                
                const actualCount = highlightAllMatches(trackingId);
                
                expect(actualCount).toBe(expectedCount);
                expect(document.querySelectorAll('.tracking-highlight').length).toBe(expectedCount);
            }
        ),
        { numRuns: 100 }
    );
});

// Feature: unified-prophesy-pipeline-script, Property 32: Nearest Camera Button Detection
test('Nearest camera button selected by minimum distance', () => {
    fc.assert(
        fc.property(
            fc.record({
                highlightX: fc.integer({ min: 0, max: 1000 }),
                highlightY: fc.integer({ min: 0, max: 1000 }),
                cameras: fc.array(
                    fc.record({
                        x: fc.integer({ min: 0, max: 1000 }),
                        y: fc.integer({ min: 0, max: 1000 })
                    }),
                    { minLength: 1, maxLength: 10 }
                )
            }),
            (testCase) => {
                const mockHighlight = createMockElement(testCase.highlightX, testCase.highlightY);
                const mockCameras = testCase.cameras.map(c => createMockCameraButton(c.x, c.y));
                
                const nearest = findNearestCameraButton(mockHighlight);
                
                // Calculate expected nearest
                const distances = testCase.cameras.map(c => 
                    Math.sqrt((c.x - testCase.highlightX) ** 2 + (c.y - testCase.highlightY) ** 2)
                );
                const minDistance = Math.min(...distances);
                const expectedIndex = distances.indexOf(minDistance);
                
                expect(nearest).toBe(mockCameras[expectedIndex]);
            }
        ),
        { numRuns: 100 }
    );
});
```

### Manual Testing Checklist

**Visual Testing:**
- [ ] Button panel appears in correct position
- [ ] All 10 buttons are visible and properly spaced
- [ ] Button colors match specifications
- [ ] Hover states work (yellow background)
- [ ] Panel moves when edit panel opens/closes
- [ ] Popups appear in correct position
- [ ] Button text updates during workflow execution
- [ ] POD panel displays ComId1 and ComId2 fields
- [ ] POD panel does not display Order ID fields
- [ ] ComId fields have cursor:pointer styling
- [ ] Tracking ID highlights appear in yellow
- [ ] Map delivery points highlight in Neon Orange

**Functional Testing:**
- [ ] Each workflow button executes correct sequence
- [ ] Form fields are filled with correct values
- [ ] Workflows complete successfully
- [ ] Error states display correctly
- [ ] Retry after error works
- [ ] Console logs appear as expected
- [ ] Singleton pattern prevents duplicate panels
- [ ] ComId1 click copies to clipboard
- [ ] ComId2 click copies to clipboard
- [ ] ComId click does nothing for 'N/A' or '-'
- [ ] POD button highlights all tracking ID instances
- [ ] POD button finds and clicks nearest camera
- [ ] POD button scrolls to highlighted tracking ID
- [ ] POD button highlights delivery point on map
- [ ] POD button retries camera click 3 times
- [ ] POD button shows match count in popup
- [ ] Field extraction works with all label variants
- [ ] Delegated click handlers survive innerHTML swaps

**Cross-Environment Testing:**
- [ ] Test on na.templates.geostudio.last-mile.amazon.dev
- [ ] Test on eu.templates.geostudio.last-mile.amazon.dev
- [ ] Test on fe.templates.geostudio.last-mile.amazon.dev
- [ ] Test on na.geostudio.last-mile.amazon.dev
- [ ] Test on eu.geostudio.last-mile.amazon.dev
- [ ] Test on fe.geostudio.last-mile.amazon.dev

**Performance Testing:**
- [ ] Workflows complete in reasonable time (< 10 seconds)
- [ ] No noticeable lag or freezing
- [ ] Timing delays are appropriate (not too fast or slow)
- [ ] Multiple rapid clicks don't cause issues

### Test Data

**Mock Form Structure:**
```html
<div class="audit-form">
    <input type="radio" value="Perfect_Address" />
    <input type="radio" value="NO" />
    <div id="cdptype" role="combobox"></div>
    <input type="radio" value="NGFR" />
    <!-- ... more form fields -->
</div>
```

**Mock Workflow Configuration:**
```javascript
const TEST_WORKFLOW = {
    id: 'test-btn',
    label: 'TEST',
    color: '#000000',
    textColor: '#ffffff',
    sequence: [
        { type: 'radio', value: 'TestValue', step: 'Test Step' }
    ]
};
```

### Continuous Testing

**Pre-Commit:**
- Run all unit tests
- Run property-based tests
- Check for console errors

**Pre-Release:**
- Run full test suite
- Manual testing on all environments
- Performance validation
- Cross-browser testing (Chrome, Firefox, Edge)



## Performance Optimization

### Timing Optimization Strategy

The unified script uses optimized timing values based on successful scripts (GAMAutoFill, BOAK) and Brand Kit standards:

**Optimized Delays:**
- Post-selection delay: 333ms (down from 1000ms in original scripts)
- Pre-click scroll delay: 100ms (down from 300ms in original scripts)
- Dropdown listbox rendering: 400ms (down from 1200ms in original scripts)
- Option scroll delay: 67ms (down from 200ms in original scripts)
- Element polling interval: 200ms (unchanged)

**Performance Impact:**
- Expected workflow completion time: 3-5 seconds (down from 9-15 seconds)
- 2-3x faster than original individual scripts
- Maintains reliability with appropriate wait times for React rendering

### Optimization Techniques

**1. Efficient Element Finding**
- Use specific selectors to minimize DOM traversal
- Cache element references when possible
- Poll with reasonable intervals (200ms) to balance responsiveness and CPU usage

**2. Minimal DOM Manipulation**
- Create button panel once at initialization
- Update button states by modifying properties, not recreating elements
- Use CSS transitions for smooth visual changes

**3. Asynchronous Operations**
- All delays use Promises (async/await) to avoid blocking
- Non-blocking popup creation and removal
- Asynchronous workflow execution

**4. React-Aware Interactions**
- Direct React handler invocation when available (faster than simulating events)
- Fallback to regular clicks when React handlers not found
- Minimal delay after React interactions (React updates are fast)

**5. Singleton Pattern**
- Single panel creation check prevents duplicate work
- Early exit if panel already exists
- No redundant event listener attachment

### Performance Monitoring

**Console Timing Logs:**
```javascript
console.log('Workflow started:', Date.now());
// ... workflow execution
console.log('Workflow completed:', Date.now());
```

**Performance Metrics to Track:**
- Time from button click to workflow start
- Time per step in workflow
- Total workflow execution time
- Time to panel creation after page load

**Performance Targets:**
- Panel creation: < 1 second after audit form detection
- Workflow execution: < 10 seconds for any workflow
- Button state update: < 50ms
- Popup display: < 100ms

### Memory Management

**No Memory Leaks:**
- Popup elements are removed after timeout
- Event listeners attached only once
- MutationObserver properly scoped
- No global variable pollution (IIFE wrapper)

**Efficient Event Handling:**
- Single MutationObserver for edit panel awareness
- Event listeners attached to buttons, not document
- No polling loops (only during element waiting)

## Implementation Notes

### TamperMonkey Script Structure

```javascript
// ==UserScript==
// @name         Prophesy Pipeline Unified (v2.0)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Consolidates all 10 Prophesy Pipeline workflows into one unified script
// @match        https://na.templates.geostudio.last-mile.amazon.dev/*
// @match        https://eu.templates.geostudio.last-mile.amazon.dev/*
// @match        https://fe.templates.geostudio.last-mile.amazon.dev/*
// @match        https://na.geostudio.last-mile.amazon.dev/*
// @match        https://eu.geostudio.last-mile.amazon.dev/*
// @match        https://fe.geostudio.last-mile.amazon.dev/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    
    // Iframe context check
    if (window.self === window.top) return;
    
    // Utility functions
    // ...
    
    // Workflow registry
    const WORKFLOWS = { /* ... */ };
    
    // Form interaction functions
    // ...
    
    // Workflow execution engine
    // ...
    
    // Initialization
    injectButtonPanel();
    
    console.log('Prophesy Pipeline Unified v2.0 loaded — iframe');
})();
```

### Code Organization

**Section Order:**
1. TamperMonkey metadata block
2. IIFE wrapper start
3. Iframe context check
4. Utility functions (delay, waitForElement, waitForRadioValue, showPopup)
5. Edit panel awareness functions (isEditPanelOpen, updatePanelPosition)
6. Workflow registry (WORKFLOWS constant)
7. Form interaction functions (clickRadioByValue, clickDropdown)
8. Workflow execution engine (runWorkflow)
9. Initialization system (injectButtonPanel)
10. POD panel field mapping system (main window only)
11. POD panel HTML template and rendering (main window only)
12. POD panel delegated click handlers (main window only)
13. POD search highlighting and camera detection (main window only)
14. Map delivery point highlighting (main window only)
15. POD panel initialization and monitoring (main window only)
16. Initialization call
17. Load confirmation log
18. IIFE wrapper end

**Context-Specific Features:**
- Iframe context: Workflow buttons, form filling, edit panel awareness
- Main window context: POD panel, field extraction, tracking ID search, map highlighting

### Browser Compatibility

**Target Browsers:**
- Chrome 90+ (primary)
- Firefox 88+ (secondary)
- Edge 90+ (secondary)

**JavaScript Features Used:**
- ES6+ syntax (const, let, arrow functions, async/await)
- Promises
- Object.assign
- Array methods (find, forEach, querySelectorAll)
- Template literals
- Destructuring (minimal)

**No Polyfills Required:**
- All features supported in target browsers
- TamperMonkey provides ES6+ environment

### Deployment

**Installation:**
1. Install TamperMonkey browser extension
2. Create new script in TamperMonkey
3. Paste unified script code
4. Save and enable script
5. Navigate to GeoStudio audit form
6. Button panel should appear automatically

**Updates:**
1. Increment @version in metadata
2. Update script in TamperMonkey
3. TamperMonkey will prompt users to update
4. Users can enable auto-update for seamless updates

**Rollback:**
- Keep previous version available
- Users can disable unified script and re-enable individual scripts
- No data loss (script doesn't store data)

## Security Considerations

**No External Dependencies:**
- Script is self-contained
- No external API calls
- No data transmission
- No third-party libraries

**Minimal Permissions:**
- @grant none (no special permissions)
- Only manipulates current page DOM
- No access to other tabs or windows
- No file system access

**Safe DOM Manipulation:**
- Only creates UI elements (panel, buttons, popups)
- Only interacts with form fields
- No script injection
- No eval() or Function() constructor

**User Privacy:**
- No data collection
- No analytics or tracking
- No cookies or local storage
- All operations local to page

**Input Validation:**
- Workflow names validated against registry
- Element selectors are static (no user input)
- No SQL or command injection risks
- No XSS vulnerabilities

## Maintenance and Evolution

### Version History

**v2.0.0 (Current):**
- Initial unified script release
- Consolidates all 10 individual scripts
- Optimized timing (333ms delays)
- Brand Kit compliance
- Edit panel awareness

**Future Versions:**
- v2.1.0: Additional workflows if needed
- v2.2.0: Customization options
- v2.3.0: Performance improvements

### Maintenance Tasks

**Regular:**
- Monitor GeoStudio platform changes
- Update selectors if form structure changes
- Verify Brand Kit compliance
- Test on new browser versions

**As Needed:**
- Add new workflows
- Adjust timing values if reliability issues
- Update colors or styling per Brand Kit updates
- Fix bugs reported by users

### Extension Points

**Adding New Workflows:**
1. Add workflow configuration to WORKFLOWS registry
2. Define fill sequence with steps
3. Assign unique ID, label, and colors
4. No code changes needed in functions

**Modifying Timing:**
1. Update delay values in clickRadioByValue and clickDropdown
2. Test for reliability
3. Document changes in version notes

**Styling Updates:**
1. Update styling objects in injectButtonPanel
2. Ensure Brand Kit compliance
3. Test visual appearance

### Known Limitations

**Platform Dependencies:**
- Relies on GeoStudio form structure (radio buttons, dropdowns)
- Depends on React implementation details (onMouseDown handler)
- Edit panel selector is generated class (may change)

**Timing Assumptions:**
- Assumes 333ms is sufficient for dependent fields to render
- Assumes 400ms is sufficient for listbox rendering
- May need adjustment for slow connections or devices

**No Configuration UI:**
- Timing values are hardcoded
- Workflow sequences are hardcoded
- No user customization without editing script

**Single Page Context:**
- Only works in iframe context
- Doesn't persist across page navigations
- Must re-initialize on each page load

## POD Panel Components (Main Window Only)

The POD (Proof of Delivery) panel is a floating panel that displays case details and provides quick access to tracking information, geocodes, and communication identifiers. This section documents the new features added in Requirements 16-19.

### 8. POD Panel Field Mapping System

The POD panel uses a canonical key system with label variants to extract case details from multiple page formats.

**Responsibilities:**
- Map multiple page label variants to canonical field keys
- Extract field values from GeoStudio case detail blocks
- Support case-insensitive label matching
- Provide fallback values when fields not found

**Field Mapping Structure:**
```javascript
const R_fieldMap = [
    { key: 'TrackingId',       labels: ['TrackingId',   'trackingid']                      },
    { key: 'DPVended',         labels: ['DPVended',     'suggested_pdp']                    },
    { key: 'REVended',         labels: ['REVended',     'suggested_pre']                    },
    { key: 'Defecttype',       labels: ['Defecttype',   'DefectType']                       },
    { key: 'orderingorderid1', labels: ['orderingorderid1']                                 },
    { key: 'orderingorderid2', labels: ['orderingorderid2']                                 },
    { key: 'PrevAuditDate',    labels: ['workdate',     'PrevAuditDate', 'WorkDate']        },
    { key: 'ComId1',           labels: ['ComId1',       'comid1']                            },
    { key: 'ComId2',           labels: ['ComId2',       'comid2']                            }
];
```

**Extraction Algorithm:**
1. Build label-to-canonical-key lookup map from R_fieldMap
2. Query all case detail blocks with class `.css-wncc9b`
3. For each block:
   - Extract label from `.css-1wmy4xi` element
   - Extract value from `.css-189kjnx` element
   - Look up canonical key from label
   - Store first-found value per canonical key (no overwrite)
4. Return object with canonical keys and extracted values

**Example Extraction:**
```javascript
function extractCaseDetails() {
    const labelToKey = {};
    R_fieldMap.forEach(f => f.labels.forEach(l => { labelToKey[l] = f.key; }));
    
    const d = {};
    document.querySelectorAll('.css-wncc9b').forEach(item => {
        const rawKey = item.querySelector('.css-1wmy4xi')?.textContent.trim();
        const v      = item.querySelector('.css-189kjnx')?.textContent.trim();
        const canon  = labelToKey[rawKey];
        if (canon && !d[canon]) d[canon] = v || 'N/A';
    });
    return d;
}
```

### 9. POD Panel HTML Template Component

The POD panel displays extracted case details in a draggable floating panel.

**Responsibilities:**
- Render case details with proper formatting
- Display ComId1 and ComId2 fields
- Exclude Order ID fields from display (but maintain in dataset)
- Provide clickable elements for copy/navigation actions
- Store field values in dataset for delegated click handlers

**Updated HTML Template:**
```html
<div style="margin-bottom:10px;display:flex;align-items:center;flex-wrap:wrap;gap:6px;">
    <strong>Tracking ID:</strong>
    <a href="#" id="r_open_tracking_link"
       title="Open in logistics.amazon.com"
       style="margin-left:8px;color:#00d4ff;text-decoration:none;cursor:pointer;font-weight:bold;">
        ${trackingIdValue}
    </a>
    <button id="r_pod_search_btn"
        title="Highlight Tracking ID on page + open nearest photo + scroll to it"
        style="padding:2px 9px;background:#1a73e8;color:#fff;border:none;
               border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;
               margin-left:4px;font-family:Arial,sans-serif;line-height:1.5;">
        📷 POD
    </button>
</div>
<div style="margin:6px 0;">
    <strong>DPVended:</strong>
    <span id="r_dpvended_link" style="margin-left:8px;cursor:pointer;">${dpVendedValue}</span>
</div>
<div style="margin:6px 0;">
    <strong>REVended:</strong>
    <span id="r_scangeocodes_link" style="margin-left:8px;cursor:pointer;">${revendedValue}</span>
</div>
<div style="margin:6px 0;">
    <strong>DefectType:</strong>
    <span>${defectTypeValue}</span>
</div>
<div style="margin:6px 0;">
    <strong>PrevAuditDate:</strong>
    <span style="margin-left:8px;color:#ffd700;">${prevAuditDateValue}</span>
</div>
<div style="margin:6px 0;">
    <strong>ComId1:</strong>
    <span id="r_comid1_link" style="margin-left:8px;cursor:pointer;color:#00d4ff;">${comId1Value}</span>
</div>
<div style="margin:6px 0;">
    <strong>ComId2:</strong>
    <span id="r_comid2_link" style="margin-left:8px;cursor:pointer;color:#00d4ff;">${comId2Value}</span>
</div>
```

**Key Changes from Requirements 16-19:**
- Added ComId2 field display with label "ComId2:"
- Removed Order ID 1 and Order ID 2 display rows
- Added cursor:pointer and color styling to ComId fields
- ComId fields use unique IDs for click handler targeting

**Dataset Storage:**
```javascript
panel.dataset.trackingIdValue  = trackingIdValue;
panel.dataset.dpValue          = dpVendedRaw;
panel.dataset.scanValue        = revendedRaw;
panel.dataset.orderId1Value    = orderingOrderId1Value;  // stored but not displayed
panel.dataset.orderId2Value    = orderingOrderId2Value;  // stored but not displayed
panel.dataset.comId1Value      = comId1Value;
panel.dataset.comId2Value      = comId2Value;
```

### 10. Delegated Click Handler Component

The POD panel uses delegated click handlers attached to the panel container to survive innerHTML swaps during updates.

**Responsibilities:**
- Handle clicks on ComId1 and ComId2 fields
- Copy ComId values to clipboard
- Handle clicks on geocode fields (DPVended, REVended)
- Handle clicks on tracking ID link
- Handle clicks on POD search button
- Validate values before performing actions

**Click Handler Implementation:**
```javascript
R_caseDetailsPanel.addEventListener('click', e => {
    const panel = R_caseDetailsPanel;
    
    // ComId1 click-to-copy
    if (e.target.id === 'r_comid1_link') {
        const v = panel.dataset.comId1Value;
        if (v && v !== 'N/A' && v !== '-') {
            navigator.clipboard.writeText(v).catch(() => {});
        }
    }
    
    // ComId2 click-to-copy
    if (e.target.id === 'r_comid2_link') {
        const v = panel.dataset.comId2Value;
        if (v && v !== 'N/A' && v !== '-') {
            navigator.clipboard.writeText(v).catch(() => {});
        }
    }
    
    // DPVended geocode paste
    if (e.target.id === 'r_dpvended_link') {
        const raw = panel.dataset.dpValue;
        if (raw && raw !== 'N/A') R_handlePasteToGeocode(formatLatLon(raw), ', ');
    }
    
    // REVended geocode paste
    if (e.target.id === 'r_scangeocodes_link') {
        const raw = panel.dataset.scanValue;
        if (raw && raw !== 'N/A') R_handlePasteToGeocode(formatLatLon(raw), ', ');
    }
    
    // Tracking ID link
    if (e.target.id === 'r_open_tracking_link') {
        e.preventDefault();
        const tid = R_selectedTrackingId || panel.dataset.trackingIdValue;
        if (tid && tid !== 'N/A') openTrackingTab(tid, false);
    }
    
    // POD Search button
    if (e.target.id === 'r_pod_search_btn') {
        e.preventDefault(); 
        e.stopPropagation();
        const tid = R_selectedTrackingId || panel.dataset.trackingIdValue;
        if (tid && tid !== 'N/A' && tid !== '-') startPODSearchForTracking(tid);
    }
});
```

**Validation Rules:**
- Skip clipboard copy if value is 'N/A' or '-'
- Skip geocode paste if value is 'N/A'
- Skip tracking actions if tracking ID is 'N/A' or '-'
- Use silent failure for clipboard operations (no error alerts)

### 11. Enhanced POD Search Component

The POD search functionality highlights tracking IDs, finds nearest camera buttons, and opens POD images.

**Responsibilities:**
- Highlight all instances of tracking ID on page
- Find nearest camera button to highlighted tracking ID
- Click camera button to open POD image
- Scroll highlighted tracking ID into view
- Retry camera button click up to 3 times
- Display match count in popup notification

**Tracking ID Highlighting Algorithm:**
```javascript
function highlightAllMatches(text) {
    if (!text || text === 'N/A' || text === '-') return 0;
    removeHighlights();  // Clear previous highlights
    
    const walker = document.createTreeWalker(
        document.body, 
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: node =>
                node.parentElement && 
                !node.parentElement.closest('#r_pod_case_details_panel')
                    ? NodeFilter.FILTER_ACCEPT 
                    : NodeFilter.FILTER_REJECT
        }
    );
    
    let count = 0, node;
    while ((node = walker.nextNode())) {
        if (!node.nodeValue.includes(text)) continue;
        
        const parts = node.nodeValue.split(text);
        const frag = document.createDocumentFragment();
        
        parts.forEach((part, i) => {
            frag.appendChild(document.createTextNode(part));
            if (i < parts.length - 1) {
                const span = document.createElement('span');
                span.className = 'tracking-highlight';
                span.textContent = text;
                frag.appendChild(span);
                count++;
            }
        });
        
        node.replaceWith(frag);
    }
    
    return count;
}
```

**Highlight Styling:**
```css
.tracking-highlight {
    background-color: yellow !important;
    color: black !important;
    padding: 1px 2px;
    border-radius: 2px;
}
```

**Nearest Camera Button Detection:**
```javascript
function findNearestCameraButton(highlightEl) {
    const hr = highlightEl.getBoundingClientRect();
    let nearestBtn = null, nearestDist = Infinity;
    
    document.querySelectorAll('button[aria-label="View photo"]').forEach(btn => {
        const r = btn.getBoundingClientRect();
        const d = Math.sqrt((r.left - hr.left) ** 2 + (r.top - hr.top) ** 2);
        if (d < nearestDist) { 
            nearestDist = d; 
            nearestBtn = btn; 
        }
    });
    
    return nearestBtn;
}
```

**POD Search Execution with Retry:**
```javascript
function startPODSearchForTracking(trackingId) {
    if (!trackingId || trackingId === 'N/A' || trackingId === '-') return;
    
    // Clear any stale camera run
    if (podCameraState.has(trackingId)) {
        clearInterval(podCameraState.get(trackingId).intervalId);
        podCameraState.delete(trackingId);
    }
    
    const matchCount = highlightAllMatches(trackingId);
    showPopup(`📷 POD: ${matchCount} match(es) found`, 1800);
    
    let attempts = 0;
    const intervalId = setInterval(() => {
        const highlightEl = document.querySelector('.tracking-highlight');
        if (!highlightEl) { 
            clearInterval(intervalId); 
            return; 
        }
        
        const btn = findNearestCameraButton(highlightEl);
        if (btn) {
            btn.click();
            highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            attempts++;
        }
        
        if (attempts >= 3) clearInterval(intervalId);
    }, 800);
    
    podCameraState.set(trackingId, { attempts, intervalId });
}
```

**Retry Configuration:**
- Maximum attempts: 3
- Retry interval: 800ms
- Scroll behavior: smooth, centered
- State tracking: Map stores intervalId and attempt count per tracking ID

**POD Image Window Positioning:**
- Camera button click opens image in new window/tab
- Window positioning handled by browser (left side positioning requires browser-specific window.open parameters)
- Window reuse: Same window reference for multiple POD searches

### 12. Map Delivery Point Highlighting Component

The POD search should highlight the corresponding delivery point on the GeoStudio map in Neon Orange color.

**Responsibilities:**
- Locate delivery point marker on map corresponding to tracking ID
- Apply Neon Orange highlight color (#FF6600 or similar)
- Ensure highlight is visible and distinct from other markers
- Clear previous highlights before applying new ones

**Implementation Approach:**

**Map Marker Selection:**
```javascript
function highlightDeliveryPointOnMap(trackingId) {
    if (!trackingId || trackingId === 'N/A' || trackingId === '-') return;
    
    // Clear previous map highlights
    clearMapHighlights();
    
    // Find map container
    const mapContainer = document.querySelector('[class*="map"], [id*="map"]');
    if (!mapContainer) {
        console.warn('Map container not found');
        return;
    }
    
    // Find marker elements (implementation depends on map library used)
    // Common selectors for Leaflet, Google Maps, Mapbox
    const markers = mapContainer.querySelectorAll(
        '[class*="marker"], [class*="pin"], svg[class*="marker"]'
    );
    
    // Find marker associated with tracking ID
    // This may require querying marker data attributes or nearby text
    markers.forEach(marker => {
        const markerData = marker.getAttribute('data-tracking-id') || 
                          marker.getAttribute('title') ||
                          marker.textContent;
        
        if (markerData && markerData.includes(trackingId)) {
            applyNeonOrangeHighlight(marker);
        }
    });
}

function applyNeonOrangeHighlight(markerElement) {
    // Store original styling for restoration
    if (!markerElement.dataset.originalStyle) {
        markerElement.dataset.originalStyle = markerElement.style.cssText;
    }
    
    // Apply Neon Orange highlight
    Object.assign(markerElement.style, {
        backgroundColor: '#FF6600',
        borderColor: '#FF6600',
        boxShadow: '0 0 10px #FF6600, 0 0 20px #FF6600',
        filter: 'brightness(1.2)',
        zIndex: '9999'
    });
    
    // For SVG markers
    if (markerElement.tagName === 'svg' || markerElement.querySelector('svg')) {
        const svg = markerElement.tagName === 'svg' ? markerElement : markerElement.querySelector('svg');
        svg.style.fill = '#FF6600';
        svg.style.stroke = '#FF6600';
        svg.style.filter = 'drop-shadow(0 0 5px #FF6600)';
    }
}

function clearMapHighlights() {
    document.querySelectorAll('[data-original-style]').forEach(marker => {
        marker.style.cssText = marker.dataset.originalStyle;
        delete marker.dataset.originalStyle;
    });
}
```

**Integration with POD Search:**
```javascript
function startPODSearchForTracking(trackingId) {
    if (!trackingId || trackingId === 'N/A' || trackingId === '-') return;
    
    // Clear any stale camera run
    if (podCameraState.has(trackingId)) {
        clearInterval(podCameraState.get(trackingId).intervalId);
        podCameraState.delete(trackingId);
    }
    
    const matchCount = highlightAllMatches(trackingId);
    showPopup(`📷 POD: ${matchCount} match(es) found`, 1800);
    
    // Highlight delivery point on map
    highlightDeliveryPointOnMap(trackingId);
    
    let attempts = 0;
    const intervalId = setInterval(() => {
        const highlightEl = document.querySelector('.tracking-highlight');
        if (!highlightEl) { 
            clearInterval(intervalId); 
            return; 
        }
        
        const btn = findNearestCameraButton(highlightEl);
        if (btn) {
            btn.click();
            highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            attempts++;
        }
        
        if (attempts >= 3) clearInterval(intervalId);
    }, 800);
    
    podCameraState.set(trackingId, { attempts, intervalId });
}
```

**Neon Orange Color Specification:**
- Primary color: #FF6600
- Glow effect: box-shadow with multiple layers
- Brightness boost: filter brightness(1.2)
- Z-index elevation: 9999 to ensure visibility

**Map Library Compatibility:**
- Leaflet: Target `.leaflet-marker-icon` elements
- Google Maps: Target `[role="button"]` with map marker attributes
- Mapbox: Target `.mapboxgl-marker` elements
- Generic fallback: Query by class patterns containing "marker" or "pin"

**Notes:**
- Map marker selection may require adjustment based on actual GeoStudio map implementation
- Marker data association (tracking ID to marker) depends on map data structure
- Consider adding delay before highlighting to ensure map is fully loaded

