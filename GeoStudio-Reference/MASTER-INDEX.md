# GeoStudio Reference - Master Index

**Complete Reference Documentation for GeoStudio Tampermonkey Script Development**

---

## 📁 Directory Structure

```
GeoStudio-Reference/
├── README.md                    # Overview and quick start
├── MASTER-INDEX.md             # This file - complete navigation
│
├── 01-Scripts/                 # Original source code
│   ├── _ALL-SCRIPTS.md         # Scripts index
│   ├── BOAK.user.js
│   ├── Pastdeliveries.user.js
│   ├── geocodeCopier.user.js
│   ├── PasteDPRE.user.js       # (To be added)
│   ├── GAMAutoFill.user.js     # (To be added)
│   └── NEIPopup.user.js        # (To be added)
│
├── 02-Brand-Kit/               # Design system
│   └── UNIFIED-BRAND-KIT.md    # Complete brand specifications
│
├── 03-Platform-Analysis/       # GeoStudio deep-dive
│   └── GEOSTUDIO-ARCHITECTURE.md
│
├── 05-Patterns/                # Reusable code patterns
│   ├── REACT-INPUT-HANDLING.md
│   └── EDIT-PANEL-AWARENESS.md
│
└── 06-Quick-Reference/         # Guides and checklists
    └── IMPLEMENTATION-CHECKLIST.md
```

---

## 🚀 Quick Navigation

### I Want To...

#### Build a New Script
1. Start: `06-Quick-Reference/IMPLEMENTATION-CHECKLIST.md`
2. Design: `02-Brand-Kit/UNIFIED-BRAND-KIT.md`
3. Reference: `01-Scripts/` (similar examples)

#### Understand GeoStudio
1. Architecture: `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md`
2. Examples: `01-Scripts/` (see how scripts interact with platform)

#### Learn a Specific Pattern
1. Browse: `05-Patterns/`
2. See in action: `01-Scripts/` (real implementations)

#### Copy Existing Code
1. Scripts: `01-Scripts/` (complete source code)
2. Patterns: `05-Patterns/` (reusable snippets)

---

## 📚 Complete File Listing

### 01-Scripts/ - Source Code

| File | Description | Key Features |
|------|-------------|--------------|
| `_ALL-SCRIPTS.md` | Index of all scripts | Overview, cross-references |
| `BOAK.user.js` | Map tools panel | Multi-option buttons, window reuse, address extraction |
| `Pastdeliveries.user.js` | Auto-configure past deliveries | Timer detection, keyboard shortcut, retry logic |
| `geocodeCopier.user.js` | Copy DP/RE coordinates | Clipboard API, simple buttons |
| `PasteDPRE.user.js` | Paste DP/RE coordinates | React input handling, clipboard parsing |
| `GAMAutoFill.user.js` | GAM triage controller | Distance validation, queue filtering, iframe communication |
| `NEIPopup.user.js` | NEI verification popup | Modal dialog, checklist, parent-iframe messaging |

### 02-Brand-Kit/ - Design System

| File | Description | Contents |
|------|-------------|----------|
| `UNIFIED-BRAND-KIT.md` | Complete design system | Colors, typography, layout, components, animations |

**Key Sections:**
- 🎨 Color Palette (primary, accent, status, neutral)
- 📝 Typography (fonts, sizes, weights, line heights)
- 📐 Layout & Spacing (z-index, spacing scale, border radius, positioning)
- 🎯 Visual Effects (shadows, backdrop filters, transitions, animations)
- 🧩 Component Specifications (panels, buttons, menus, popups)
- 🎭 Interactive States (hover, disabled, focus)
- 📏 Responsive Behavior (edit panel awareness)
- 🔧 Implementation Guidelines (code examples)
- ✅ Checklist for New Scripts

### 03-Platform-Analysis/ - GeoStudio Deep-Dive

| File | Description | Contents |
|------|-------------|----------|
| `GEOSTUDIO-ARCHITECTURE.md` | Platform structure | DOM organization, selectors, React integration, iframe architecture |

**Key Sections:**
- 🏗️ Platform Overview
- 📍 Key Page Sections (header, content, edit panel, timer)
- 🎯 Critical DOM Selectors (address, geocodes, forms, dialogs)
- 🔄 React Integration (input handling, dropdown handling)
- 🖼️ Iframe Architecture (parent-iframe communication)
- 📊 Data Formats (coordinates, timer, address ID)
- 🎨 CSS Class Patterns (generated vs stable selectors)
- 🔍 Element Finding Strategies
- ⚡ Performance Considerations

### 05-Patterns/ - Reusable Code Patterns

| File | Description | When to Use |
|------|-------------|-------------|
| `REACT-INPUT-HANDLING.md` | Setting input values in React | Manipulating DP/RE fields, form inputs |
| `EDIT-PANEL-AWARENESS.md` | Detecting and responding to edit panel | Creating button panels on right side |

**Additional Patterns (To Be Added):**
- `SINGLETON-PATTERN.md` - Preventing duplicate script execution
- `MUTATION-OBSERVERS.md` - Watching for DOM changes
- `ELEMENT-FINDING.md` - Robust element location with retries
- `IFRAME-COMMUNICATION.md` - Parent-iframe messaging
- `ASYNC-OPERATIONS.md` - Handling promises and delays
- `VALIDATION-PATTERN.md` - Input validation and error handling
- `POPUP-CREATION.md` - Creating notification popups
- `KEYBOARD-SHORTCUTS.md` - Adding keyboard controls

### 06-Quick-Reference/ - Guides and Checklists

| File | Description | Use For |
|------|-------------|---------|
| `IMPLEMENTATION-CHECKLIST.md` | Step-by-step development guide | Building new scripts from scratch |

**Additional References (To Be Added):**
- `COMMON-SELECTORS.md` - Quick selector reference
- `TROUBLESHOOTING.md` - Common issues and solutions
- `CODE-SNIPPETS.md` - Copy-paste code blocks

---

## 🎯 Learning Paths

### Path 1: Beginner - First Script
1. Read: `README.md`
2. Study: `02-Brand-Kit/UNIFIED-BRAND-KIT.md` (focus on components)
3. Follow: `06-Quick-Reference/IMPLEMENTATION-CHECKLIST.md`
4. Reference: `01-Scripts/geocodeCopier.user.js` (simplest example)
5. Pattern: `05-Patterns/EDIT-PANEL-AWARENESS.md`

**Goal:** Create a simple button panel that copies data

### Path 2: Intermediate - Form Manipulation
1. Study: `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md` (React section)
2. Pattern: `05-Patterns/REACT-INPUT-HANDLING.md`
3. Reference: `01-Scripts/PasteDPRE.user.js`
4. Build: Script that sets input values

**Goal:** Create a script that manipulates form inputs

### Path 3: Advanced - Complex Automation
1. Study: `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md` (complete)
2. Reference: `01-Scripts/GAMAutoFill.user.js` (most complex)
3. Patterns: All patterns in `05-Patterns/`
4. Build: Script with validation, communication, and automation

**Goal:** Create a script with multiple features and error handling

---

## 🔍 Search by Topic

### Colors
- **File:** `02-Brand-Kit/UNIFIED-BRAND-KIT.md`
- **Section:** Color Palette
- **Variables:** `--primary-white`, `--accent-yellow`, `--success-bg`, etc.

### Typography
- **File:** `02-Brand-Kit/UNIFIED-BRAND-KIT.md`
- **Section:** Typography
- **Variables:** `--font-size-sm`, `--font-weight-bold`, etc.

### Button Styling
- **File:** `02-Brand-Kit/UNIFIED-BRAND-KIT.md`
- **Section:** Component Specifications → Panel Button
- **Examples:** All scripts in `01-Scripts/`

### Input Manipulation
- **File:** `05-Patterns/REACT-INPUT-HANDLING.md`
- **Examples:** `01-Scripts/PasteDPRE.user.js`, `01-Scripts/GAMAutoFill.user.js`

### DOM Selectors
- **File:** `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md`
- **Section:** Critical DOM Selectors
- **Quick Ref:** `06-Quick-Reference/COMMON-SELECTORS.md` (to be added)

### Edit Panel
- **File:** `05-Patterns/EDIT-PANEL-AWARENESS.md`
- **Examples:** All scripts with button panels

### Popups/Modals
- **File:** `02-Brand-Kit/UNIFIED-BRAND-KIT.md` (styling)
- **Examples:** `01-Scripts/GAMAutoFill.user.js`, `01-Scripts/NEIPopup.user.js`

### Iframe Communication
- **File:** `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md` (Iframe Architecture section)
- **Examples:** `01-Scripts/GAMAutoFill.user.js`, `01-Scripts/NEIPopup.user.js`

### MutationObserver
- **File:** `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md` (Performance section)
- **Pattern:** `05-Patterns/MUTATION-OBSERVERS.md` (to be added)
- **Examples:** All scripts

### Keyboard Shortcuts
- **Example:** `01-Scripts/Pastdeliveries.user.js` (P key)
- **Pattern:** `05-Patterns/KEYBOARD-SHORTCUTS.md` (to be added)

---

## 📊 Script Comparison Matrix

| Feature | BOAK | Past Deliveries | Geocode Copier | Paste DPRE | GAM AutoFill | NEI Popup |
|---------|------|-----------------|----------------|------------|--------------|-----------|
| Button Panel | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Edit Panel Aware | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| React Input | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Dropdown Menu | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Popup/Modal | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Iframe Comm | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Auto-Detection | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Validation | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Keyboard Shortcut | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ (Esc) |
| Window Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Complexity | Medium | Medium | Low | Medium | High | Medium |

---

## 🛠️ Common Tasks

### Task: Create a Button Panel
1. **Design:** `02-Brand-Kit/UNIFIED-BRAND-KIT.md` → Component Specifications
2. **Pattern:** `05-Patterns/EDIT-PANEL-AWARENESS.md`
3. **Example:** `01-Scripts/BOAK.user.js`
4. **Checklist:** `06-Quick-Reference/IMPLEMENTATION-CHECKLIST.md` → Step 6

### Task: Set Input Value
1. **Pattern:** `05-Patterns/REACT-INPUT-HANDLING.md`
2. **Selector:** `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md` → Geocode Inputs
3. **Example:** `01-Scripts/PasteDPRE.user.js`

### Task: Show a Popup
1. **Design:** `02-Brand-Kit/UNIFIED-BRAND-KIT.md` → Popup/Modal
2. **Example:** `01-Scripts/GAMAutoFill.user.js` → showPopup function

### Task: Detect Element Changes
1. **Platform:** `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md` → Performance
2. **Pattern:** `05-Patterns/MUTATION-OBSERVERS.md` (to be added)
3. **Example:** All scripts use MutationObserver

### Task: Communicate Between Iframe and Parent
1. **Platform:** `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md` → Iframe Architecture
2. **Pattern:** `05-Patterns/IFRAME-COMMUNICATION.md` (to be added)
3. **Example:** `01-Scripts/GAMAutoFill.user.js`

---

## ✅ Quality Checklist

Before considering your script complete, verify:

### Design Compliance
- [ ] Colors from unified palette
- [ ] Typography matches specifications
- [ ] Spacing uses standard scale
- [ ] Components follow brand kit

### Functionality
- [ ] Singleton pattern implemented
- [ ] Edit panel awareness (if UI panel)
- [ ] React input handling (if manipulating inputs)
- [ ] Error handling for edge cases
- [ ] User feedback for actions

### Code Quality
- [ ] No console errors
- [ ] Clean, readable code
- [ ] Meaningful variable names
- [ ] Comments for complex logic

### Testing
- [ ] Works on all regions (na, eu, fe)
- [ ] Works with edit panel open/closed
- [ ] Handles missing elements gracefully
- [ ] No conflicts with other scripts

---

## 🔄 Maintenance

### When GeoStudio Updates
1. Check: `03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md` → CSS Class Patterns
2. Test: All scripts for broken selectors
3. Update: Selectors in affected scripts
4. Document: Changes in script comments

### When Adding New Scripts
1. Add source: `01-Scripts/[name].user.js`
2. Update index: `01-Scripts/_ALL-SCRIPTS.md`
3. Update matrix: This file → Script Comparison Matrix
4. Document patterns: `05-Patterns/` (if new patterns used)

---

## 📞 Support

### Troubleshooting
1. Check: `06-Quick-Reference/TROUBLESHOOTING.md` (to be added)
2. Review: Script console logs
3. Verify: Element selectors in `03-Platform-Analysis/`

### Contributing
- Add new patterns to `05-Patterns/`
- Update brand kit if new styles emerge
- Document platform changes in `03-Platform-Analysis/`

---

## 📝 Notes

- This reference is based on scripts cached February 27-28, 2026
- GeoStudio uses generated CSS classes that may change
- Always prefer stable selectors (IDs, data attributes) when available
- Test thoroughly after GeoStudio updates

---

**Last Updated:** February 28, 2026  
**Version:** 1.0  
**Status:** Core documentation complete, additional patterns to be added
