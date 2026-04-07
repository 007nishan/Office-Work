# GeoStudio Platform Architecture

**Last Updated:** February 28, 2026  
**Purpose:** Deep-dive into GeoStudio's structure, DOM organization, and data locations

---

## 🏗️ Platform Overview

GeoStudio is a React-based web application for managing delivery addresses and geocoding. It uses:
- **React** for UI components
- **CSS Modules** with generated class names (e.g., `css-1xats7y`)
- **Iframe architecture** for templates/forms
- **MutationObserver-friendly** DOM updates

---

## 📍 Key Page Sections

### 1. Header Section
```
Height: 57px (fixed)
Contains: Navigation, user info, global controls
```

### 2. Main Content Area
```
Below header
Contains: Address details, map, panels
```

### 3. Edit Panel (Right Side)
```
Class: ._3yG5UlL020qNbegyVK2vrw
Width: ~312px when open
Position: Fixed right
Visibility: Toggleable
```

### 4. Timer Display
```
Selector: .css-laozi4 .css-2lt2bb
Format: "MM:SS"
Updates: Every second
```

---

## 🎯 Critical DOM Selectors

### Address Information

#### Address ID
```javascript
// XPath method
const addressIdElement = document.evaluate(
    "//p[text()='Address ID:']/following-sibling::a/p",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
).singleNodeValue;

// Alternative: CSS class method
const addrBlocks = document.getElementsByClassName('css-wncc9b');
// Look for block with key 'AddressId'
```

#### Customer Address
```javascript
const customerAddress = document.querySelector(".css-1xats7y .css-hd6zo3");
// Returns: Full address text
```

#### Address Elements (Multiple)
```javascript
const addressElements = document.querySelectorAll('.css-1iomfh4 .css-hd6zo3');
// Returns: NodeList of address components
```

### Geocode Inputs

#### DP (Delivery Point) Geocode
```javascript
const dpInput = document.querySelector('#input-dp-geocode');
// or
const dpInput = document.querySelector('input[id*="dp"]');
// Format: "latitude, longitude"
```

#### RE (Road Entry) Geocode
```javascript
const reInput = document.querySelector('#input-re-geocode');
// or
const reInput = document.querySelector('input[id*="re"]');
// Format: "latitude, longitude"
```

#### Suggested DP (in forms)
```javascript
const suggestedDp = document.querySelector('#suggestedDp:not(#geo-suggested-dp-input)');
// or
const suggestedDp = document.querySelector('input[data-testid="suggestedDp"]');
```

### Form Elements

#### Radio Buttons (GAM Issue, etc.)
```javascript
// Find section by header
const sections = document.querySelectorAll('.css-19hedjk');
for (const section of sections) {
    const header = section.querySelector('p.css-17xh5uu');
    if (header && header.textContent.trim().toLowerCase().replace(/[_\s]/g, '') === 'gamissue') {
        // Found GAM Issue section
        const radios = section.querySelectorAll('input[type="radio"]');
    }
}
```

#### Dropdowns/Selects
```javascript
// Transfer queue selector
const queueSelector = document.querySelector('[data-testid="transfer-form-queue-selector"]');

// Get current value
const valueElement = queueSelector.querySelector('[id*="-value"]') ||
                     queueSelector.querySelector('.css-1h2ruwl');

// Generic dropdown by ID
const dropdown = document.getElementById('auditResolution');
const valueDiv = document.getElementById('auditResolution-value');
```

#### Checkboxes
```javascript
// Transfer checkbox
const transferCheckbox = document.querySelector('[data-testid="transfer-form-checkbox"]');
const isChecked = transferCheckbox.getAttribute('aria-checked') === 'true';
```

### Past Deliveries Panel

#### Panel Button
```javascript
const pastDelsBtn = Array.from(document.querySelectorAll('p.css-1oqpb4x'))
    .find(el => el.innerText.trim() === "Past deliveries");
```

#### Dropdown Boxes
```javascript
const dropdownBoxes = document.querySelectorAll('div[role="combobox"]');
// Check textContent for "Attribute" or "Recent 10"
```

#### Options in Dropdown
```javascript
const options = document.querySelectorAll('div[role="option"]');
// or
const optionsList = document.querySelector('[role="listbox"]');
```

### Dialog/Modal

#### Submit Changes Dialog
```javascript
const dialog = document.querySelector('div[role="dialog"][aria-modal="true"]');
const h2 = dialog.querySelector('h2[mdn-modal-title]');
if (h2 && h2.textContent === "Submit Changes") {
    // Found the submit dialog
}
```

#### Close Button
```javascript
const closeButton = dialog.querySelector('button[aria-label="Close"]') ||
                    dialog.querySelector('button[mdn-popover-offset]') ||
                    dialog.querySelector('button.css-148awne');
```

---

## 🔄 React Integration

### Input Field Handling

React controls input values, so direct `input.value = "..."` won't work. Use this pattern:

```javascript
function setNativeValue(element, value) {
    const descriptor = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    );
    if (descriptor && descriptor.set) {
        descriptor.set.call(element, value);
    } else {
        element.value = value;
    }
    
    // Trigger React events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Optional: Update attribute
    element.setAttribute('value', value);
}
```

### Dropdown/Select Handling

React dropdowns require keyboard events:

```javascript
// Open dropdown
dropdown.dispatchEvent(new KeyboardEvent('keydown', {
    key: ' ',
    code: 'Space',
    bubbles: true,
    cancelable: true
}));

// Navigate options
dropdown.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    bubbles: true
}));

// Select option (click the option element)
option.click();
```

---

## 🖼️ Iframe Architecture

### Parent Page
- Main GeoStudio interface
- Contains address details, map, DP/RE inputs
- URL: `https://*.geostudio.last-mile.amazon.dev/place*`

### Iframe (Templates)
- Embedded forms for editing
- Contains dropdowns, radio buttons, transfer options
- URL: `https://*.templates.geostudio.last-mile.amazon.dev/*`

### Communication Pattern

```javascript
// Parent → Iframe
iframe.contentWindow.postMessage({
    type: 'GEOSTUDIO_DP_GEOCODE',
    data: { lat: 41.123, lon: -89.456, original: "41.123, -89.456" }
}, '*');

// Iframe → Parent
window.parent.postMessage({
    type: 'NEI_CLOSE_DIALOG'
}, '*');

// Listening
window.addEventListener('message', (event) => {
    if (event.data?.type === 'GEOSTUDIO_DP_GEOCODE') {
        // Handle message
    }
});
```

---

## 📊 Data Formats

### Coordinates
```
Format: "latitude, longitude"
Example: "41.338839, -89.106049"
Validation: -90 ≤ lat ≤ 90, -180 ≤ lon ≤ 180
```

### Timer
```
Format: "MM:SS"
Example: "05:23"
Range: 0:00 to 166:40 (10000 seconds)
```

### Address ID
```
Format: Alphanumeric string
Example: "ABC123XYZ"
Location: Address details section
```

---

## 🎨 CSS Class Patterns

### Generated Classes
GeoStudio uses CSS modules with generated class names:
```
.css-1xats7y
.css-hd6zo3
.css-19hedjk
.css-17xh5uu
etc.
```

**Warning:** These may change with updates. Use data attributes or IDs when available.

### Stable Selectors
Prefer these when available:
```
[data-testid="..."]
#input-dp-geocode
#input-re-geocode
[role="dialog"]
[role="combobox"]
[role="option"]
```

---

## 🔍 Element Finding Strategies

### 1. By ID (Most Reliable)
```javascript
document.getElementById('input-dp-geocode')
```

### 2. By Data Attribute
```javascript
document.querySelector('[data-testid="transfer-form-checkbox"]')
```

### 3. By Role
```javascript
document.querySelector('[role="dialog"]')
```

### 4. By Text Content
```javascript
Array.from(document.querySelectorAll('p.css-1oqpb4x'))
    .find(el => el.innerText.trim() === "Past deliveries")
```

### 5. By XPath (For Complex Relationships)
```javascript
document.evaluate(
    "//p[text()='Address ID:']/following-sibling::a/p",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
).singleNodeValue
```

---

## ⚡ Performance Considerations

### MutationObserver Usage
```javascript
const observer = new MutationObserver((mutations) => {
    // Handle changes
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
});
```

### Debouncing
```javascript
let timeout;
function debounce(func, delay) {
    clearTimeout(timeout);
    timeout = setTimeout(func, delay);
}
```

### Singleton Pattern
```javascript
if (window.myScriptLoaded) {
    console.log("Script already loaded");
    return;
}
window.myScriptLoaded = true;
```

---

## 📚 Related Documentation

- **DOM Selectors Reference:** `DOM-SELECTORS.md`
- **Data Locations:** `DATA-LOCATIONS.md`
- **React Integration:** `REACT-INTEGRATION.md`
- **Brand Kit:** `../02-Brand-Kit/UNIFIED-BRAND-KIT.md`
