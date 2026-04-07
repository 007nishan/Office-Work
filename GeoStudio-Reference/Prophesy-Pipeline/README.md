# Prophesy Pipeline Scripts

**Version:** 1.0  
**Last Updated:** February 28, 2026  
**Purpose:** Complete collection of Prophesy pipeline automation scripts with UNIFIED-BRAND-KIT styling

---

## 📋 Overview

The Prophesy Pipeline consists of 10 Tampermonkey scripts that automate various audit workflows in GeoStudio. All scripts follow the UNIFIED-BRAND-KIT design system for consistent UI/UX.

---

## 🎯 Script Categories

### Data Input (DI) Scripts
Scripts that handle data entry and form filling for different audit scenarios.

- **DI_NDPL** - No Delivery Past Location
- **DI_NP_SDA** - No Package Safe Drop Area
- **DI_NP_SDA_Final** - Final version of No Package SDA
- **FIXED_SDA** - Fixed Safe Drop Area

### UI Scripts
Scripts that handle user interface automation for specific audit types.

- **UI_0** - UI automation variant 0
- **UI1** - UI automation variant 1 (Perfect Address, DH Unavailable)
- **UI_2** - UI automation variant 2 (Perfect Address, Delivery Location)

### CEM Scripts
Customer Experience Management scripts for audit workflows.

- **CEM_0** - CEM workflow variant 0
- **CEM_1** - CEM workflow variant 1
- **CEM_2** - CEM workflow variant 2

---

## 🎨 Design System

All scripts implement the UNIFIED-BRAND-KIT with:

- **Translucent effects**: Smooth transitions and hover states
- **Consistent borders**: 1px solid #ccc on all buttons
- **Hover feedback**: Yellow (#ffff00) hover state
- **Smooth transitions**: 0.2s background-color transitions
- **No button overlap**: 40px minimum spacing
- **Consistent color coding**: By category
- **Edit panel awareness**: Auto-repositioning (future enhancement)
- **Singleton pattern**: Prevents duplicates

**Latest Update (v1.1):** All scripts updated with complete UNIFIED-BRAND-KIT compliance including borders, transitions, and hover states. See [UNIFIED-BRAND-KIT-UPDATES.md](./UNIFIED-BRAND-KIT-UPDATES.md) for details.

---

## 📍 Button Positions

Scripts are positioned vertically on the right side of the screen:

| Script | Position | Color |
|--------|----------|-------|
| DI_NDPL | 12px | Light Navy (#5c6bc0) |
| DI_NP_SDA_Final | 56px | Blue (#1565c0) |
| DI_SDA | 96px | Darker Blue (#0d47a1) |
| FIXED_SDA | 136px | Purple (#4a148c) |
| UI1 | 176px | Deep Orange (#d84315) |
| UI_0 | 216px | Teal (#00695c) |
| UI_2 | 256px | Purple (#6a1b9a) |
| CEM_0 | 296px | Yellow (#fdd835) |
| CEM_1 | 336px | Yellow (#ffeb3b) |
| CEM_2 | 376px | Light Yellow (#fff176) |

---

## 🚀 Quick Start

**New to Prophesy Pipeline?** Check out the [Quick Start Guide](./QUICK-START.md) for a 5-minute setup!

## 📦 Installation

1. Install Tampermonkey browser extension
2. Click on any script file in the `scripts/` directory
3. Tampermonkey will detect the userscript and prompt for installation
4. Click "Install" to activate the script

For detailed installation instructions, see [QUICK-START.md](./QUICK-START.md)

---

## 📁 Directory Structure

```
Prophesy-Pipeline/
├── README.md                          # This file
├── QUICK-START.md                     # 5-minute setup guide
├── MASTER-INDEX.md                    # Complete documentation index
├── COMPLETION-STATUS.md               # Project completion status
├── scripts/
│   ├── DI_NDPL_v1.0.user.js
│   ├── DI_NP_SDA_Final_v1.6.user.js
│   ├── DI_SDA_v1.0.user.js
│   ├── FIXED_SDA_v1.0.user.js
│   ├── UI_0_v1.0.user.js
│   ├── UI1_v1.0.user.js
│   ├── UI_2_v1.0.user.js
│   ├── CEM_0_v1.0.user.js
│   ├── CEM_1_v1.0.user.js
│   └── CEM_2_v1.0.user.js
└── documentation/
    ├── WORKFLOW-GUIDE.md              # Step-by-step usage guide
    └── TROUBLESHOOTING.md             # Common issues and solutions
```

---

## 📚 Related Documentation

- **GeoStudio Reference**: `../GeoStudio-Reference/`
- **BOAK Brand Kit**: `../GeoStudio-Reference/02-Brand-Kit/UNIFIED-BRAND-KIT.md`
- **Platform Architecture**: `../GeoStudio-Reference/03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md`

---

## ✅ Features

- ✓ Complete UNIFIED-BRAND-KIT styling compliance
- ✓ Border styling (1px solid #ccc)
- ✓ Smooth transitions (0.2s)
- ✓ Yellow hover states (#ffff00)
- ✓ No button overlap (40px minimum spacing)
- ✓ Consistent color coding by category
- ✓ Error handling with visual feedback
- ✓ Singleton pattern (prevents duplicates)

---

## 🔧 Maintenance

All scripts follow the same design patterns and can be updated consistently. Refer to the UNIFIED-BRAND-KIT documentation for styling guidelines when making modifications.
