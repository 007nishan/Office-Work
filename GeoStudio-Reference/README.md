# GeoStudio Tampermonkey Scripts - Complete Reference

**Created:** February 28, 2026  
**Purpose:** Comprehensive reference documentation for GeoStudio Tampermonkey script development

## 📁 Directory Structure

```
GeoStudio-Reference/
├── README.md (this file)
├── 01-Scripts/              # Original script source code
├── 02-Brand-Kit/            # Unified design system
├── 03-Platform-Analysis/    # GeoStudio platform deep-dive
├── 04-Script-Analysis/      # Individual script breakdowns
├── 05-Patterns/             # Reusable code patterns
└── 06-Quick-Reference/      # Cheat sheets and guides
```

## 🚀 Quick Start

1. **Building a new script?** Start with `02-Brand-Kit/UNIFIED-BRAND-KIT.md`
2. **Need to understand GeoStudio?** Read `03-Platform-Analysis/`
3. **Want to see how existing scripts work?** Check `04-Script-Analysis/`
4. **Looking for code patterns?** Browse `05-Patterns/`
5. **Need quick reference?** Use `06-Quick-Reference/`

## 📚 Documentation Index

### Scripts (01-Scripts/)
- `BOAK.user.js` - Map tools panel (Bing, OSM, ADRI, Kibana)
- `GAMAutoFill.user.js` - GAM triage controller with DP validation
- `Pastdeliveries.user.js` - Past deliveries automation
- `PasteDPRE.user.js` - Paste DP/RE coordinates
- `geocodeCopier.user.js` - Copy DP/RE coordinates
- `NEIPopup.user.js` - NEI verification popup

### Brand Kit (02-Brand-Kit/)
- `UNIFIED-BRAND-KIT.md` - Complete design system
- `COLOR-PALETTE.md` - All colors with usage guidelines
- `TYPOGRAPHY.md` - Font specifications
- `COMPONENTS.md` - Reusable UI components

### Platform Analysis (03-Platform-Analysis/)
- `GEOSTUDIO-ARCHITECTURE.md` - Platform structure
- `DOM-SELECTORS.md` - Key CSS selectors and XPath
- `DATA-LOCATIONS.md` - Where data lives in the DOM
- `REACT-INTEGRATION.md` - Working with React components

### Script Analysis (04-Script-Analysis/)
- Individual analysis files for each script
- Step-by-step workflow breakdowns
- Integration point documentation

### Patterns (05-Patterns/)
- `SINGLETON-PATTERN.md`
- `EDIT-PANEL-AWARENESS.md`
- `REACT-INPUT-HANDLING.md`
- `ELEMENT-FINDING.md`
- `MUTATION-OBSERVERS.md`
- `IFRAME-COMMUNICATION.md`
- And more...

### Quick Reference (06-Quick-Reference/)
- `IMPLEMENTATION-CHECKLIST.md`
- `COMMON-SELECTORS.md`
- `TROUBLESHOOTING.md`

## 🎯 Use Cases

### Creating a New Button Panel
1. Reference: `02-Brand-Kit/COMPONENTS.md` → Button Panel section
2. Pattern: `05-Patterns/EDIT-PANEL-AWARENESS.md`
3. Example: `01-Scripts/BOAK.user.js`

### Adding Input Field Manipulation
1. Pattern: `05-Patterns/REACT-INPUT-HANDLING.md`
2. Example: `01-Scripts/PasteDPRE.user.js`

### Implementing Auto-Detection
1. Pattern: `05-Patterns/MUTATION-OBSERVERS.md`
2. Example: `01-Scripts/Pastdeliveries.user.js`

### Parent-Iframe Communication
1. Pattern: `05-Patterns/IFRAME-COMMUNICATION.md`
2. Example: `01-Scripts/GAMAutoFill.user.js`

## 📝 Notes

- All scripts follow the unified brand kit for consistency
- Cross-references are provided throughout documentation
- Each pattern includes working code examples
- Platform analysis is based on actual DOM inspection

## 🔄 Updates

This reference is based on scripts cached on February 27-28, 2026. If GeoStudio's structure changes, some selectors may need updating.

---

**To move this to your Desktop:** Copy the entire `GeoStudio-Reference` folder to `C:/Users/nishanrh/Desktop/`
