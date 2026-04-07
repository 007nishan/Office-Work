# Edit Panel Awareness Pattern

**Pattern Type:** Layout/Positioning  
**Difficulty:** Easy  
**Used In:** BOAK, PasteDPRE, geocodeCopier

---

## 🎯 Problem

GeoStudio has a right-side edit panel that can be opened/closed. When open, it takes up ~312px of space. Button panels positioned on the right need to adjust their position to avoid being covered by the edit panel.

---

## ✅ Solution

Detect the edit panel's visibility and adjust panel positioning dynamically:

```javascript
function isEditPanelOpen() {
    const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
    const editPanelVisible = editPanel && 
                             window.getComputedStyle(editPanel).display !== 'none';
    return editPanelVisible;
}

function updatePanelPosition(panel) {
    if (!panel) return;
    const panelOpen = isEditPanelOpen();
    const rightPosition = panelOpen ? '320px' : '8px';
    panel.style.right = rightPosition;
}
```

---

## 📖 Complete Implementation

### Step 1: Create Your Panel
```javascript
const panel = document.createElement('div');
panel.id = 'myPanel';
Object.assign(panel.style, {
    position: 'fixed',
    top: 'calc(57px + 130px)',
    right: '8px',  // Initial position
    // ... other styles
    transition: 'all 0.3s ease'  // Smooth transition
});

document.body.appendChild(panel);
```

### Step 2: Set Up MutationObserver
```javascript
const observer = new MutationObserver(function() {
    updatePanelPosition(panel);
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
});
```

### Step 3: Initial Position Update
```javascript
// Update position after a short delay to ensure DOM is ready
setTimeout(() => updatePanelPosition(panel), 500);
```

---

## 🎨 Visual Behavior

```
Edit Panel Closed:
┌─────────────────────────────┐
│                             │
│                             │
│                      [Panel]│ ← 8px from right
│                             │
└─────────────────────────────┘

Edit Panel Open:
┌──────────────────┬──────────┐
│                  │  Edit    │
│                  │  Panel   │
│           [Panel]│  (312px) │ ← 320px from right
│                  │          │
└──────────────────┴──────────┘
```

---

## 📋 Full Example

```javascript
(function() {
    'use strict';
    
    let buttonPanel = null;
    
    function isEditPanelOpen() {
        const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
        return editPanel && window.getComputedStyle(editPanel).display !== 'none';
    }
    
    function updatePanelPosition() {
        if (!buttonPanel) return;
        const panelOpen = isEditPanelOpen();
        const rightPosition = panelOpen ? '320px' : '8px';
        buttonPanel.style.right = rightPosition;
    }
    
    function createPanel() {
        buttonPanel = document.createElement('div');
        buttonPanel.id = 'myButtonPanel';
        Object.assign(buttonPanel.style, {
            position: 'fixed',
            top: 'calc(57px + 130px)',
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
            transition: 'all 0.3s ease'
        });
        
        // Add buttons here
        // ...
        
        document.body.appendChild(buttonPanel);
        
        // Set up observer
        const observer = new MutationObserver(updatePanelPosition);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Initial update
        setTimeout(updatePanelPosition, 500);
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPanel);
    } else {
        createPanel();
    }
})();
```

---

## 🔧 Customization

### Different Offsets
```javascript
// For panels at different vertical positions
const topOffsets = {
    boak: 'calc(57px + 130px)',
    copier: 'calc(57px + 265px)',
    paste: 'calc(57px + 337px)'
};

panel.style.top = topOffsets.boak;
```

### Different Right Positions
```javascript
// If you need different spacing
function updatePanelPosition(panel) {
    const panelOpen = isEditPanelOpen();
    const rightPosition = panelOpen ? '330px' : '16px';  // Custom values
    panel.style.right = rightPosition;
}
```

### Multiple Panels
```javascript
const panels = [panel1, panel2, panel3];

function updateAllPanels() {
    const panelOpen = isEditPanelOpen();
    const rightPosition = panelOpen ? '320px' : '8px';
    
    panels.forEach(panel => {
        if (panel) {
            panel.style.right = rightPosition;
        }
    });
}
```

---

## ⚠️ Important Notes

### Edit Panel Selector
```javascript
// This selector is specific to GeoStudio
const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
```

**Warning:** This is a generated CSS class and may change with GeoStudio updates. If the pattern stops working, inspect the edit panel element to find the new class name.

### Transition Timing
```css
transition: 'all 0.3s ease'
```

This provides smooth animation when the panel moves. Adjust timing as needed:
- `0.2s` - Faster
- `0.5s` - Slower
- `0.3s ease` - Standard (recommended)

---

## 🧪 Testing

```javascript
// Test the detection
function testEditPanelDetection() {
    console.log('Edit panel open:', isEditPanelOpen());
    
    // Manually toggle the edit panel in GeoStudio
    // Then run this again to verify detection
}

testEditPanelDetection();
```

---

## 🔗 Related Patterns

- **Singleton Pattern:** `SINGLETON-PATTERN.md`
- **MutationObserver:** `MUTATION-OBSERVERS.md`
- **Panel Creation:** `../02-Brand-Kit/UNIFIED-BRAND-KIT.md`

---

## 💡 Pro Tips

1. **Always include transition** for smooth UX
2. **Use setTimeout** for initial position to ensure DOM is ready
3. **Monitor both style and class changes** in MutationObserver
4. **Test with edit panel open and closed** during development
5. **Consider mobile/responsive** if needed (though GeoStudio is desktop-focused)

---

## 📚 Real-World Examples

### From BOAK.user.js
```javascript
function updatePanelPosition(panel) {
    const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
    const editPanelVisible = editPanel && 
                             window.getComputedStyle(editPanel).display !== 'none';
    const rightPosition = editPanelVisible ? '320px' : '8px';
    panel.style.right = rightPosition;
}
```

### From PasteDPRE.user.js
```javascript
function updatePanelPosition() {
    if (!buttonPanel) return;
    const panelOpen = isEditPanelOpen();
    const rightPosition = panelOpen ? '320px' : '8px';
    buttonPanel.style.right = rightPosition;
}
```

### From geocodeCopier.user.js
```javascript
const observer = new MutationObserver(function() {
    updatePanelPosition(panel);
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
});
```
