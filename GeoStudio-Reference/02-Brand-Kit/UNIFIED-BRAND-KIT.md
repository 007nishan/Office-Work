# GeoStudio Unified Brand Kit

**Version:** 1.0  
**Last Updated:** February 28, 2026  
**Purpose:** Complete design system for GeoStudio Tampermonkey scripts

---

## 🎨 Color Palette

### Primary Colors
```css
--primary-white: #fff
--primary-white-translucent: rgba(255, 255, 255, 0.5)
--primary-white-opaque: rgba(255, 255, 255, 0.95)
--primary-black: #000
--primary-gray-border: #ccc
```

### Accent Colors
```css
--accent-yellow: #ffff00        /* Hover state */
--accent-blue: #0073bb          /* Highlights, required fields */
--accent-amazon-dark: #232f3e   /* Amazon brand color */
--accent-amazon-hover: #374357  /* Amazon hover state */
```

### Status Colors
```css
/* Success */
--success-bg: #e8f5e9
--success-border: #4caf50
--success-text: #2e7d32
--success-icon: #4caf50

/* Error */
--error-bg: #fdecea
--error-border: #d32f2f
--error-text: #d32f2f
--error-icon: #d32f2f

/* Warning */
--warning-bg: #fffbe6
--warning-bg-alt: #fff3cd
--warning-border: #ff9800
--warning-border-alt: #ffc107
--warning-text: #c77700
--warning-text-alt: #856404
--warning-icon: #ff9800
```

### Neutral Colors
```css
--neutral-gray-light: #f0f0f0
--neutral-gray-medium: #e0e0e0
--neutral-gray-dark: #666
--neutral-gray-darker: #555
--neutral-gray-text: #444
--neutral-gray-bg: #f8f8f8
```

---

## 📝 Typography

### Font Families
```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif
```

### Font Sizes
```css
--font-size-xs: 11px      /* Menu items, small labels */
--font-size-sm: 12px      /* Buttons, hints, body text */
--font-size-md: 14px      /* Standard text, popups */
--font-size-lg: 16px      /* Popup titles */
--font-size-xl: 18px      /* Section headers */
--font-size-xxl: 22px     /* Close buttons */
```

### Font Weights
```css
--font-weight-normal: 400
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Line Heights
```css
--line-height-tight: 1
--line-height-normal: 1.5
--line-height-relaxed: 1.6
```

---

## 📐 Layout & Spacing

### Z-Index Hierarchy
```css
--z-index-panel: 99999          /* Button panels */
--z-index-menu: 100000          /* Dropdown menus */
--z-index-overlay: 99999        /* Modal overlays */
--z-index-modal: 100000         /* Modal dialogs */
```

### Spacing Scale
```css
--spacing-xs: 1px
--spacing-sm: 4px
--spacing-md: 6px
--spacing-lg: 8px
--spacing-xl: 12px
--spacing-xxl: 16px
--spacing-xxxl: 30px
```

### Border Radius
```css
--radius-sm: 3px      /* Menu items */
--radius-md: 4px      /* Buttons */
--radius-lg: 8px      /* Menus, popups */
--radius-xl: 12px     /* Panels */
```

### Panel Positioning
```css
/* Standard button panel */
position: fixed
top: calc(57px + 130px)    /* Header + offset */
right: 8px                  /* Default */
right: 320px                /* When edit panel open */

/* Variations */
--panel-top-boak: calc(57px + 130px)
--panel-top-copier: calc(57px + 265px)
--panel-top-paste: calc(57px + 337px)
```

---

## 🎯 Visual Effects

### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0,0,0,0.2)      /* Menus */
--shadow-md: 0 4px 12px rgba(0,0,0,0.1)     /* Panels */
--shadow-lg: 0 4px 12px rgba(0,0,0,0.15)    /* Popups */
--shadow-xl: 0 5px 15px rgba(0,0,0,0.15)    /* Elevated popups */
```

### Backdrop Filters
```css
--backdrop-blur: blur(6px)    /* Panel backgrounds */
```

### Transitions
```css
--transition-fast: 0.2s
--transition-standard: 0.3s ease
--transition-slow: 0.4s ease
```

### Animations
```css
@keyframes slideIn {
    from { transform: translateX(110%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(110%); opacity: 0; }
}
```

---

## 🧩 Component Specifications

### Button Panel (Standard)
```css
{
    position: fixed;
    top: calc(57px + 130px);
    right: 8px;
    display: flex;
    flexDirection: column;
    backgroundColor: rgba(255, 255, 255, 0.5);
    border: 1px solid #ccc;
    borderRadius: 12px;
    boxShadow: 0 4px 12px rgba(0,0,0,0.1);
    zIndex: 99999;
    padding: 6px;
    gap: 6px;
    backdropFilter: blur(6px);
    pointerEvents: auto;
    boxSizing: border-box;
    transition: all 0.3s ease;
}
```

### Panel Button (24x24)
```css
{
    width: 24px;
    height: 24px;
    backgroundColor: #fff;
    color: #000;
    fontWeight: bold;
    fontSize: 12px;
    border: 1px solid #ccc;
    borderRadius: 4px;
    cursor: pointer;
    display: flex;
    alignItems: center;
    justifyContent: center;
}
```

### Panel Button (42x24 - wider variant)
```css
{
    width: 42px;
    height: 24px;
    /* ... rest same as 24x24 */
}
```

### Panel Button (48x24 - widest variant)
```css
{
    width: 48px;
    height: 24px;
    /* ... rest same as 24x24 */
}
```

### Dropdown Menu
```css
.hover-menu {
    position: absolute;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ccc;
    borderRadius: 8px;
    boxShadow: 0 2px 8px rgba(0,0,0,0.2);
    display: none;
    padding: 4px;
    zIndex: 100000;
    top: 55px;
    left: 0;
    display: flex;
    flexDirection: column;
}

.hover-menu button {
    display: block;
    width: 100px;
    padding: 4px 6px;
    margin: 1px 0;
    border: none;
    borderRadius: 3px;
    background: #fff;
    cursor: pointer;
    textAlign: left;
    fontSize: 11px;
    whiteSpace: nowrap;
}

.hover-menu button:hover {
    background: #e0e0e0;
}
```

### Popup/Modal
```css
.popup {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px;
    borderRadius: 8px;
    fontFamily: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    fontSize: 14px;
    width: 380px;
    maxWidth: 90vw;
    boxShadow: 0 5px 15px rgba(0,0,0,0.15);
    zIndex: 1000000;
    animation: slideIn 0.4s ease;
    display: flex;
    alignItems: flex-start;
    gap: 12px;
}
```

### Popup Variants
```css
.popup-error {
    background: #fdecea;
    borderLeft: 5px solid #d32f2f;
    color: #16191f;
}

.popup-warning {
    background: #fffbe6;
    borderLeft: 5px solid #ff9800;
    color: #16191f;
}

.popup-success {
    background: #e8f5e9;
    borderLeft: 5px solid #4caf50;
    color: #16191f;
}
```

### NEI Dialog
```css
{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border: 2px solid #232f3e;
    borderRadius: 8px;
    zIndex: 100000;
    boxShadow: 0 4px 12px rgba(0,0,0,0.15);
    fontFamily: Arial, sans-serif;
    minWidth: 400px;
    maxWidth: 500px;
}
```

---

## 🎭 Interactive States

### Button Hover
```css
/* Standard hover */
background: #ffff00;

/* Gray hover */
background: #e0e0e0;

/* Amazon button hover */
background: #374357;

/* Light gray hover */
background: #f8f8f8;
```

### Disabled State
```css
{
    opacity: 0.4 or 0.6;
    pointerEvents: none;
    cursor: not-allowed;
    backgroundColor: #f0f0f0;  /* Optional */
    textDecoration: line-through;  /* Optional */
}
```

### Focus State
```css
/* Typically handled by browser defaults */
/* Or custom outline if needed */
outline: 2px solid #0073bb;
```

---

## 📏 Responsive Behavior

### Edit Panel Awareness
```javascript
function isEditPanelOpen() {
    const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
    return editPanel && window.getComputedStyle(editPanel).display !== 'none';
}

function updatePanelPosition(panel) {
    const panelOpen = isEditPanelOpen();
    panel.style.right = panelOpen ? '320px' : '8px';
}
```

### Popup Responsiveness
```css
maxWidth: 90vw;  /* Ensures popups don't overflow on small screens */
```

---

## 🔧 Implementation Guidelines

### 1. Creating a Button Panel
```javascript
const panel = document.createElement('div');
panel.id = 'uniquePanelId';
Object.assign(panel.style, {
    position: 'fixed',
    top: 'calc(57px + 130px)',  // Adjust offset as needed
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

### 2. Creating a Button
```javascript
const btn = document.createElement('button');
btn.textContent = 'Label';
btn.title = 'Tooltip';
Object.assign(btn.style, {
    width: '24px',
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

### 3. Creating a Popup
```javascript
function showPopup(type, title, message) {
    const popup = document.createElement('div');
    popup.className = `popup popup-${type}`;
    
    const icons = {
        error: '❌ SVG',
        warning: '⚠️ SVG',
        success: '✅ SVG'
    };
    
    popup.innerHTML = `
        <div style="flex-shrink: 0;">${icons[type]}</div>
        <div style="flex-grow: 1;">
            <div style="font-weight: 700; font-size: 16px;">${title}</div>
            <div style="line-height: 1.5;">${message}</div>
        </div>
    `;
    
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 8000);
}
```

---

## ✅ Checklist for New Scripts

- [ ] Use unified color palette
- [ ] Follow typography specifications
- [ ] Implement edit panel awareness
- [ ] Use standard z-index hierarchy
- [ ] Apply consistent spacing
- [ ] Include hover states
- [ ] Add transitions for smooth UX
- [ ] Test with edit panel open/closed
- [ ] Ensure singleton pattern (prevent duplicates)
- [ ] Add proper cleanup on removal

---

## 📚 Related Documentation

- **Platform Analysis:** `../03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md`
- **Component Patterns:** `../05-Patterns/`
- **Script Examples:** `../01-Scripts/`
- **Quick Reference:** `../06-Quick-Reference/COMMON-SELECTORS.md`
