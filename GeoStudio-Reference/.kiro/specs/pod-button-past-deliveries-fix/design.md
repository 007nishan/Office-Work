# POD Button Past Deliveries Panel Fix - Design

## Overview

The POD button fails to highlight delivery points on the map because it attempts to find and click the numbered delivery button in the Past Deliveries panel without first ensuring the panel is open. This design document specifies how to detect if the panel is open, programmatically open it if needed, wait for content to load, and integrate this logic into the existing `highlightDeliveryPointOnMap` function with proper error handling.

The fix follows a defensive programming approach: check if the panel is already open (preserve existing behavior), open it if needed (fix the bug), wait for content to load (ensure reliability), then proceed with the existing search logic.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when the POD button is clicked and the Past Deliveries panel is not open
- **Property (P)**: The desired behavior - the system should open the Past Deliveries panel before searching for the tracking ID
- **Preservation**: Existing behavior when the panel is already open, and all other POD button functionality (highlighting, camera button clicking, map marker highlighting)
- **highlightDeliveryPointOnMap**: The function in `Prophesy_Pipeline_Unified_v2.0.user.js` (lines 838-935) that searches for the tracking ID and highlights the delivery point
- **Past Deliveries Panel**: The UI panel containing delivery rows with numbered buttons, accessed by clicking the "Past deliveries" button (element: `p.css-1oqpb4x`)
- **Panel Open State**: Determined by the presence of delivery rows in the DOM (`tr, div[class*="row"], div[class*="item"], div[class*="delivery"]`) that contain tracking IDs

## Bug Details

### Fault Condition

The bug manifests when the POD button is clicked and the Past Deliveries panel is not currently open. The `highlightDeliveryPointOnMap` function immediately searches for delivery rows in the DOM, but if the panel is closed, these rows are not rendered, causing the search to fail with the error message "⚠️ Could not find delivery button. Open Past Deliveries panel."

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { podButtonClicked: boolean, panelOpen: boolean, trackingId: string }
  OUTPUT: boolean
  
  RETURN input.podButtonClicked = true
         AND input.panelOpen = false
         AND input.trackingId NOT IN ['N/A', '-', '', null, undefined]
         AND deliveryRowsNotFoundInDOM()
END FUNCTION
```

### Examples

- **Example 1**: User clicks POD button with tracking ID "TBA123456789" while Past Deliveries panel is closed
  - Expected: System opens panel, waits for content, finds tracking ID, clicks button, highlights marker
  - Actual: System displays error "⚠️ Could not find delivery button. Open Past Deliveries panel."

- **Example 2**: User clicks POD button with tracking ID "TBA987654321" while Past Deliveries panel is closed
  - Expected: System opens panel, waits for content, finds tracking ID, clicks button, highlights marker
  - Actual: System fails to find delivery rows because they're not in the DOM

- **Example 3**: User clicks POD button with tracking ID "TBA111222333" while Past Deliveries panel is already open
  - Expected: System immediately finds tracking ID, clicks button, highlights marker (no panel opening needed)
  - Actual: Works correctly (this is the preservation case)

- **Edge Case**: User clicks POD button but the "Past deliveries" button element is not found in the DOM
  - Expected: System displays error "⚠️ Could not open Past Deliveries panel."

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When the Past Deliveries panel is already open, the system must continue to search for the tracking ID without reopening the panel
- The system must continue to highlight the tracking ID in yellow on the page
- The system must continue to find and click the nearest camera button to open the POD image
- The numbered delivery button highlighting (Neon Orange with box-shadow, border, outline) must remain unchanged
- The 800ms wait before highlighting the map marker must remain unchanged
- The map marker highlighting (Neon Orange #FF6600 with stroke, fill, drop-shadow) must remain unchanged
- The smooth scroll behavior for the map marker must remain unchanged
- Early return for invalid tracking IDs (N/A, '-', empty) must remain unchanged

**Scope:**
All inputs where the Past Deliveries panel is already open should be completely unaffected by this fix. This includes:
- Existing search logic for finding tracking IDs in delivery rows
- Button clicking and highlighting behavior
- Map marker highlighting and scrolling behavior
- Error handling for tracking IDs not found in the panel

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Missing Panel State Check**: The function does not check if the Past Deliveries panel is open before searching for delivery rows
   - The function immediately queries for `tr, div[class*="row"], div[class*="item"], div[class*="delivery"]`
   - If the panel is closed, these elements are not rendered in the DOM
   - The search fails and displays an error message

2. **No Panel Opening Logic**: The function assumes the user has manually opened the panel
   - The error message tells the user to "Open Past Deliveries panel" manually
   - There is no attempt to programmatically open the panel

3. **No Content Loading Wait**: Even if we add panel opening logic, we need to wait for the panel content to load
   - The panel opening is asynchronous (requires clicking a button and waiting for UI update)
   - Delivery rows are populated after the panel opens
   - Without waiting, the search would still fail

## Correctness Properties

Property 1: Fault Condition - Open Past Deliveries Panel Before Search

_For any_ POD button click where the Past Deliveries panel is not open and the tracking ID is valid, the fixed function SHALL programmatically open the Past Deliveries panel, wait for the panel content to load (delivery rows to appear in the DOM), then search for the tracking ID and proceed with the existing highlighting logic.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Existing Behavior When Panel is Open

_For any_ POD button click where the Past Deliveries panel is already open, the fixed function SHALL produce exactly the same behavior as the original function, immediately searching for the tracking ID without reopening the panel and preserving all existing highlighting, clicking, and scrolling functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `Prophesy-Pipeline/scripts/Prophesy_Pipeline_Unified_v2.0.user.js`

**Function**: `highlightDeliveryPointOnMap` (lines 838-935)

**Specific Changes**:

1. **Add Panel State Detection Function**: Create a helper function to check if the Past Deliveries panel is open
   - Check for the presence of delivery rows in the DOM
   - Use the same selector as the existing code: `tr, div[class*="row"], div[class*="item"], div[class*="delivery"]`
   - Return true if rows exist and contain delivery-related content, false otherwise

2. **Add Panel Opening Function**: Create a helper function to programmatically open the Past Deliveries panel
   - Find the "Past deliveries" button using selector: `p.css-1oqpb4x` with text content "Past deliveries"
   - Scroll the button into view using `scrollIntoView({ behavior: "smooth", block: "center" })`
   - Click the button to open the panel
   - Return true if button found and clicked, false otherwise

3. **Add Content Loading Wait Function**: Create a helper function to wait for panel content to load
   - Use a polling mechanism with a maximum wait time (e.g., 5 seconds)
   - Check every 200ms if delivery rows have appeared in the DOM
   - Return true if rows appear within the timeout, false otherwise

4. **Integrate Panel Opening Logic**: Modify `highlightDeliveryPointOnMap` to check and open the panel before searching
   - At the start of the function (after the invalid tracking ID check), check if the panel is open
   - If not open, attempt to open it and wait for content to load
   - If opening fails or content doesn't load, display error "⚠️ Could not open Past Deliveries panel."
   - If successful, proceed with the existing search logic

5. **Error Handling**: Add specific error messages for different failure scenarios
   - Panel button not found: "⚠️ Could not find Past Deliveries button."
   - Panel content failed to load: "⚠️ Past Deliveries panel opened but content did not load."
   - Tracking ID not found after panel is open: "⚠️ Could not find delivery button for tracking ID."

### Implementation Pseudocode

```javascript
// Helper function to check if Past Deliveries panel is open
function isPastDeliveriesPanelOpen() {
    var rows = document.querySelectorAll('tr, div[class*="row"], div[class*="item"], div[class*="delivery"]');
    // Panel is considered open if we have rows with delivery-related content
    return rows.length > 10; // Threshold to distinguish from other page elements
}

// Helper function to open Past Deliveries panel
async function openPastDeliveriesPanel() {
    var pastDelsBtn = Array.from(document.querySelectorAll('p.css-1oqpb4x'))
        .find(el => el.innerText.trim() === "Past deliveries");
    
    if (!pastDelsBtn) {
        console.error('❌ Could not find Past Deliveries button');
        return false;
    }
    
    pastDelsBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    pastDelsBtn.click();
    console.log('✓ Clicked Past Deliveries button');
    return true;
}

// Helper function to wait for panel content to load
async function waitForPanelContent(maxWaitMs = 5000, pollIntervalMs = 200) {
    var startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
        if (isPastDeliveriesPanelOpen()) {
            console.log('✓ Past Deliveries panel content loaded');
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    console.error('❌ Past Deliveries panel content did not load within timeout');
    return false;
}

// Modified highlightDeliveryPointOnMap function
async function highlightDeliveryPointOnMap(trackingId) {
    if (!trackingId || trackingId === 'N/A' || trackingId === '-') return;
    
    console.log('=== Prophesy POD: Map Marker Highlight ===');
    console.log('Searching for tracking ID:', trackingId);
    
    // Check if Past Deliveries panel is open
    if (!isPastDeliveriesPanelOpen()) {
        console.log('Past Deliveries panel is not open. Opening...');
        
        var opened = await openPastDeliveriesPanel();
        if (!opened) {
            showPopup('⚠️ Could not find Past Deliveries button.', 3000);
            return;
        }
        
        // Wait for panel content to load
        var loaded = await waitForPanelContent();
        if (!loaded) {
            showPopup('⚠️ Past Deliveries panel opened but content did not load.', 3000);
            return;
        }
    } else {
        console.log('✓ Past Deliveries panel is already open');
    }
    
    // Existing search logic continues here...
    var found = false;
    var pastDelRows = document.querySelectorAll('tr, div[class*="row"], div[class*="item"], div[class*="delivery"]');
    // ... rest of existing code ...
}
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (panel closed, POD button fails), then verify the fix works correctly (panel opens automatically) and preserves existing behavior (panel already open, no change).

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate clicking the POD button with the Past Deliveries panel closed. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Panel Closed - Valid Tracking ID**: Click POD button with tracking ID "TBA123456789" while panel is closed (will fail on unfixed code - displays error message)
2. **Panel Closed - Different Tracking ID**: Click POD button with tracking ID "TBA987654321" while panel is closed (will fail on unfixed code - displays error message)
3. **Panel Closed - Tracking ID in Middle of List**: Click POD button with tracking ID that appears in the middle of the Past Deliveries list while panel is closed (will fail on unfixed code)
4. **Panel Button Not Found**: Simulate scenario where "Past deliveries" button element is removed from DOM (may fail on unfixed code with generic error)

**Expected Counterexamples**:
- Error message "⚠️ Could not find delivery button. Open Past Deliveries panel." is displayed
- Possible causes: delivery rows not in DOM, search logic fails immediately, no attempt to open panel

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (panel closed, valid tracking ID), the fixed function produces the expected behavior (opens panel, waits for content, finds tracking ID, highlights marker).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := highlightDeliveryPointOnMap_fixed(input.trackingId)
  ASSERT panelWasOpened(result)
  ASSERT contentWasLoaded(result)
  ASSERT trackingIdWasFound(result)
  ASSERT deliveryButtonWasClicked(result)
  ASSERT mapMarkerWasHighlighted(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (panel already open), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT highlightDeliveryPointOnMap_original(input) = highlightDeliveryPointOnMap_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first with panel already open, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Panel Already Open - Valid Tracking ID**: Observe that POD button works correctly when panel is open on unfixed code, then write test to verify this continues after fix
2. **Panel Already Open - Tracking ID Highlighting**: Observe that tracking ID is highlighted in yellow on unfixed code, then write test to verify this continues after fix
3. **Panel Already Open - Camera Button Clicking**: Observe that camera button is clicked on unfixed code, then write test to verify this continues after fix
4. **Panel Already Open - Map Marker Highlighting**: Observe that map marker is highlighted in Neon Orange on unfixed code, then write test to verify this continues after fix

### Unit Tests

- Test `isPastDeliveriesPanelOpen()` with various DOM states (no rows, few rows, many rows)
- Test `openPastDeliveriesPanel()` with button present and button missing scenarios
- Test `waitForPanelContent()` with immediate load, delayed load, and timeout scenarios
- Test error handling for each failure scenario (button not found, content not loaded, tracking ID not found)
- Test that invalid tracking IDs (N/A, '-', empty) still return early without processing

### Property-Based Tests

- Generate random tracking IDs and verify that the function either finds them (if they exist in the panel) or displays appropriate error messages
- Generate random DOM states (panel open/closed) and verify that the function behaves correctly in each case
- Generate random timing scenarios (fast load, slow load) and verify that the wait logic handles them correctly

### Integration Tests

- Test full POD button flow with panel closed: click POD button, verify panel opens, verify content loads, verify tracking ID is found, verify button is clicked, verify marker is highlighted
- Test full POD button flow with panel already open: click POD button, verify no panel opening occurs, verify tracking ID is found immediately, verify button is clicked, verify marker is highlighted
- Test error recovery: click POD button with panel closed but button element missing, verify appropriate error message is displayed
- Test multiple consecutive POD button clicks with different tracking IDs
