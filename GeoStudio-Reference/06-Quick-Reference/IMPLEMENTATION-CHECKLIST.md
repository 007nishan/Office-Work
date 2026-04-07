# Implementation Checklist

**Purpose:** Step-by-step guide for creating new GeoStudio Tampermonkey scripts

---

## 📋 Pre-Development

### 1. Define Purpose
- [ ] What problem does this script solve?
- [ ] Which GeoStudio page(s) will it run on?
- [ ] Will it work in parent page, iframe, or both?
- [ ] What user interactions are needed?

### 2. Research
- [ ] Identify target DOM elements (IDs, classes, selectors)
- [ ] Check if elements are React-controlled
- [ ] Determine if edit panel awareness is needed
- [ ] Review similar existing scripts for patterns

### 3. Plan UI
- [ ] Sketch button panel layout
- [ ] Choose button labels and tooltips
- [ ] Decide on positioning (top offset)
- [ ] Plan hover states and interactions

---

## 🛠️ Development

### 4. Script Header
```javascript
// ==UserScript==
// @name         Your Script Name
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Brief description
// @match        https://na.geostudio.last-mile.amazon.dev/*
// @match        https://eu.geostudio.last-mile.amazon.dev/*
// @match        https://fe.geostudio.last-mile.amazon.dev/*
// @author       Your Name
// @grant        none
// ==/UserScript==
```

- [ ] Set appropriate @match patterns
- [ ] Add @noframes if script should not run in iframes
- [ ] Set @run-at if timing matters (document-idle, document-end)

### 5. Singleton Pattern
```javascript
(function() {
    'use strict';
    
    if (window.yourScriptLoaded) {
        console.log("Script already loaded, skipping...");
        return;
    }
    window.yourScriptLoaded = true;
    
    // Your code here
})();
```

- [ ] Implement singleton to prevent duplicate execution
- [ ] Use unique flag name

### 6. Create UI Components

#### Button Panel
```javascript
const panel = document.createElement('div');
panel.id = 'uniquePanelId';
Object.assign(panel.style, {
    position: 'fixed',
    top: 'calc(57px + 130px)',  // Adjust offset
    right: '8px',
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
});
```

- [ ] Use unique panel ID
- [ ] Follow brand kit styling
- [ ] Set appropriate z-index
- [ ] Include transition for smooth UX

#### Buttons
```javascript
const btn = document.createElement('button');
btn.textContent = 'Label';
btn.title = 'Tooltip';
Object.assign(btn.style, {
    width: '24px',  // or 42px, 48px
    height: '24px',
    backgroundColor: '#fff',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
});

btn.addEventListener('mouseenter', () => {
    btn.style.backgroundColor = '#ffff00';
});
btn.addEventListener('mouseleave', () => {
    btn.style.backgroundColor = '#fff';
});
```

- [ ] Set descriptive labels
- [ ] Add helpful tooltips
- [ ] Implement hover states
- [ ] Choose appropriate button width

### 7. Edit Panel Awareness
```javascript
function isEditPanelOpen() {
    const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
    return editPanel && window.getComputedStyle(editPanel).display !== 'none';
}

function updatePanelPosition(panel) {
    if (!panel) return;
    const panelOpen = isEditPanelOpen();
    const rightPosition = panelOpen ? '320px' : '8px';
    panel.style.right = rightPosition;
}

const observer = new MutationObserver(() => updatePanelPosition(panel));
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
});

setTimeout(() => updatePanelPosition(panel), 500);
```

- [ ] Implement edit panel detection
- [ ] Set up MutationObserver
- [ ] Add initial position update with delay

### 8. Core Functionality

#### Element Finding
```javascript
async function findElement(selector, timeout = 5000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
        const element = document.querySelector(selector);
        if (element) return element;
        await new Promise(r => setTimeout(r, 200));
    }
    return null;
}
```

- [ ] Use robust element finding with retries
- [ ] Handle element not found gracefully
- [ ] Add appropriate timeouts

#### React Input Handling
```javascript
function setNativeValue(element, value) {
    if (!element) return;
    const descriptor = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    );
    if (descriptor && descriptor.set) {
        descriptor.set.call(element, value);
    } else {
        element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}
```

- [ ] Use setNativeValue for React inputs
- [ ] Trigger focus/blur for validation
- [ ] Add error handling

### 9. Error Handling
```javascript
try {
    // Your code
} catch (error) {
    console.error('Script error:', error);
    // Graceful degradation
}
```

- [ ] Wrap risky operations in try-catch
- [ ] Log errors to console
- [ ] Provide user feedback when appropriate

### 10. Initialization
```javascript
function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPanel);
    } else {
        createPanel();
    }
}

init();
```

- [ ] Handle both loading and loaded states
- [ ] Use appropriate timing (DOMContentLoaded, setTimeout, etc.)

---

## 🧪 Testing

### 11. Functional Testing
- [ ] Test on all matched URLs (na, eu, fe)
- [ ] Test with edit panel open and closed
- [ ] Test with different address types
- [ ] Test error cases (missing elements, invalid data)
- [ ] Test with other scripts running

### 12. UI Testing
- [ ] Verify button panel positioning
- [ ] Check hover states
- [ ] Test transitions and animations
- [ ] Verify z-index (panel not covered/covering)
- [ ] Test on different screen sizes

### 13. Performance Testing
- [ ] Check for memory leaks
- [ ] Verify MutationObserver doesn't cause lag
- [ ] Test with multiple tabs open
- [ ] Monitor console for errors

---

## 📝 Documentation

### 14. Code Comments
- [ ] Add comments for complex logic
- [ ] Document function parameters and return values
- [ ] Explain non-obvious decisions

### 15. Console Logging
```javascript
console.log('✅ Script initialized');
console.log('⚠️ Warning message');
console.error('❌ Error message');
```

- [ ] Add initialization log
- [ ] Log important actions
- [ ] Use emoji for visual distinction

---

## 🚀 Deployment

### 16. Version Control
- [ ] Set version number in header
- [ ] Document changes in comments
- [ ] Keep backup of previous version

### 17. Distribution
- [ ] Test in clean Tampermonkey install
- [ ] Verify @match patterns are correct
- [ ] Share with team/users

---

## 🔄 Maintenance

### 18. Monitoring
- [ ] Watch for GeoStudio updates
- [ ] Monitor user feedback
- [ ] Check console for errors

### 19. Updates
- [ ] Increment version number
- [ ] Test thoroughly before deploying
- [ ] Document breaking changes

---

## 📚 Reference Checklist

### Brand Kit Compliance
- [ ] Colors match unified palette
- [ ] Typography follows specifications
- [ ] Spacing uses standard scale
- [ ] Shadows and effects are consistent
- [ ] Transitions are smooth (0.3s ease)

### Pattern Usage
- [ ] Singleton pattern implemented
- [ ] Edit panel awareness (if UI panel)
- [ ] React input handling (if manipulating inputs)
- [ ] Robust element finding
- [ ] Proper error handling

### Code Quality
- [ ] No console errors
- [ ] No memory leaks
- [ ] Clean, readable code
- [ ] Proper indentation
- [ ] Meaningful variable names

---

## 🎯 Common Pitfalls to Avoid

- [ ] ❌ Not using singleton pattern (script runs multiple times)
- [ ] ❌ Direct input.value assignment (React doesn't detect)
- [ ] ❌ Hardcoded delays without retries (elements not found)
- [ ] ❌ Missing edit panel awareness (UI covered)
- [ ] ❌ Wrong z-index (panel covered or covering)
- [ ] ❌ No error handling (script breaks on edge cases)
- [ ] ❌ Generated CSS classes without fallbacks (breaks on updates)
- [ ] ❌ Missing transition (jarring UX)
- [ ] ❌ No user feedback (unclear if action succeeded)
- [ ] ❌ Blocking operations (UI freezes)

---

## 📖 Quick Links

- **Brand Kit:** `../02-Brand-Kit/UNIFIED-BRAND-KIT.md`
- **Platform Analysis:** `../03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md`
- **Patterns:** `../05-Patterns/`
- **Examples:** `../01-Scripts/`
