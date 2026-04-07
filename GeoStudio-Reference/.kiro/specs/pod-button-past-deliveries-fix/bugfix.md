# Bugfix Requirements Document

## Introduction

The POD button (📷 POD) in the Prophesy Pipeline Unified script fails to highlight delivery points on the map because it attempts to find and click the numbered delivery button in the Past Deliveries panel without first ensuring the panel is open. This results in an error message: "⚠️ Could not find delivery button. Open Past Deliveries panel."

The bug affects the `highlightDeliveryPointOnMap` function (lines 838-935) which is called by `startPODSearchForTracking` (line 955). The function searches through DOM elements looking for the tracking ID in Past Deliveries panel rows, but if the panel is closed, no matching rows exist in the DOM, causing the search to fail.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the POD button is clicked AND the Past Deliveries panel is not open THEN the system displays error "⚠️ Could not find delivery button. Open Past Deliveries panel." without attempting to open the panel

1.2 WHEN the POD button is clicked AND the Past Deliveries panel is not open THEN the system fails to find the tracking ID in Past Deliveries panel rows because the rows are not rendered in the DOM

1.3 WHEN the POD button is clicked AND the Past Deliveries panel is not open THEN the system fails to click the numbered delivery button to isolate the delivery point on the map

1.4 WHEN the POD button is clicked AND the Past Deliveries panel is not open THEN the system fails to highlight the delivery point in Neon Orange color on the map

### Expected Behavior (Correct)

2.1 WHEN the POD button is clicked AND the Past Deliveries panel is not open THEN the system SHALL programmatically open the Past Deliveries panel before searching for the tracking ID

2.2 WHEN the POD button is clicked AND the Past Deliveries panel is successfully opened THEN the system SHALL wait for the panel content to load before searching for the tracking ID in the rows

2.3 WHEN the POD button is clicked AND the Past Deliveries panel is opened AND the tracking ID is found THEN the system SHALL click the numbered delivery button to isolate the delivery point on the map

2.4 WHEN the POD button is clicked AND the Past Deliveries panel is opened AND the tracking ID is found AND the delivery button is clicked THEN the system SHALL highlight the delivery point in Neon Orange color on the map

2.5 WHEN the POD button is clicked AND the Past Deliveries panel cannot be opened after reasonable attempts THEN the system SHALL display error "⚠️ Could not open Past Deliveries panel."

2.6 WHEN the POD button is clicked AND the Past Deliveries panel is opened but the tracking ID is not found THEN the system SHALL display error "⚠️ Could not find delivery button for tracking ID."

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the POD button is clicked AND the Past Deliveries panel is already open THEN the system SHALL CONTINUE TO search for the tracking ID without reopening the panel

3.2 WHEN the POD button is clicked THEN the system SHALL CONTINUE TO highlight the tracking ID in yellow on the page

3.3 WHEN the POD button is clicked THEN the system SHALL CONTINUE TO find and click the nearest camera button to open the POD image in a new window

3.4 WHEN the numbered delivery button is clicked THEN the system SHALL CONTINUE TO apply Neon Orange highlighting with box-shadow, border, and outline styles

3.5 WHEN the delivery point is isolated on the map THEN the system SHALL CONTINUE TO wait 800ms before highlighting the visible map marker

3.6 WHEN the map marker is highlighted THEN the system SHALL CONTINUE TO apply Neon Orange color (#FF6600) with stroke, fill, and drop-shadow effects

3.7 WHEN the map marker is highlighted THEN the system SHALL CONTINUE TO scroll the marker into view with smooth behavior

3.8 WHEN the tracking ID is invalid (N/A or '-' or empty) THEN the system SHALL CONTINUE TO return early without processing
