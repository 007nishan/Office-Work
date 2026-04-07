# Prophesy Pipeline - Master Index

**Version:** 1.0  
**Last Updated:** February 28, 2026

---

## 📖 Quick Navigation

### Getting Started
- [Quick Start Guide](./QUICK-START.md) - 5-minute setup and first use

### Core Documentation
- [README](./README.md) - Overview and installation guide
- [Workflow Guide](./documentation/WORKFLOW-GUIDE.md) - Step-by-step usage instructions
- [Troubleshooting](./documentation/TROUBLESHOOTING.md) - Common issues and solutions
- [Completion Status](./COMPLETION-STATUS.md) - Project status and metrics

### Scripts by Category

#### Data Input (DI) Scripts
- [DI_NDPL](./scripts/DI_NDPL_v1.0.user.js) - No Delivery Past Location
- [DI_NP_SDA_Final](./scripts/DI_NP_SDA_Final_v1.6.user.js) - No Package Safe Drop Area (Final)
- [DI_SDA](./scripts/DI_SDA_v1.0.user.js) - Safe Drop Area
- [FIXED_SDA](./scripts/FIXED_SDA_v1.0.user.js) - Fixed Safe Drop Area

#### UI Automation Scripts
- [UI_0](./scripts/UI_0_v1.0.user.js) - UI automation variant 0
- [UI1](./scripts/UI1_v1.0.user.js) - UI automation variant 1
- [UI_2](./scripts/UI_2_v1.0.user.js) - UI automation variant 2

#### CEM Scripts
- [CEM_0](./scripts/CEM_0_v1.0.user.js) - CEM workflow variant 0
- [CEM_1](./scripts/CEM_1_v1.0.user.js) - CEM workflow variant 1
- [CEM_2](./scripts/CEM_2_v1.0.user.js) - CEM workflow variant 2

---

## 🎨 Design System Reference

All scripts implement the UNIFIED-BRAND-KIT:
- Translucent panels with backdrop blur
- Consistent 40px button spacing
- Color-coded by category
- Edit panel awareness
- Smooth transitions

For detailed styling specifications, see:
- [UNIFIED-BRAND-KIT](../GeoStudio-Reference/02-Brand-Kit/UNIFIED-BRAND-KIT.md)

---

## 📊 Script Comparison

| Script | Button Position | Primary Color | Use Case |
|--------|----------------|---------------|----------|
| DI_NDPL | 12px | Light Navy | No delivery past location audits |
| DI_NP_SDA_Final | 56px | Blue | No package SDA (final version) |
| DI_SDA | 96px | Darker Blue | Safe drop area audits |
| FIXED_SDA | 136px | Purple | Fixed SDA scenarios |
| UI1 | 176px | Deep Orange | Perfect address + DH unavailable |
| UI_0 | 216px | Teal | UI automation baseline |
| UI_2 | 256px | Purple | Perfect address + delivery location |
| CEM_0 | 296px | Yellow | CEM baseline workflow |
| CEM_1 | 336px | Yellow | CEM variant 1 |
| CEM_2 | 376px | Light Yellow | CEM variant 2 |

---

## 🔗 External References

### GeoStudio Reference System
- [Main README](../GeoStudio-Reference/README.md)
- [Platform Architecture](../GeoStudio-Reference/03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md)
- [Implementation Patterns](../GeoStudio-Reference/05-Patterns/)
- [Quick Reference](../GeoStudio-Reference/06-Quick-Reference/)

### Related Scripts
- [BOAK](../GeoStudio-Reference/01-Scripts/BOAK.user.js) - Map tools panel
- [Pastdeliveries](../GeoStudio-Reference/01-Scripts/Pastdeliveries.user.js) - Past deliveries viewer
- [geocodeCopier](../GeoStudio-Reference/01-Scripts/geocodeCopier.user.js) - Geocode copier

---

## 📝 Version History

### v1.0 (February 28, 2026)
- Initial organized release
- Applied UNIFIED-BRAND-KIT styling to all 10 scripts
- Established consistent button positioning (40px spacing)
- Created comprehensive documentation structure
- Ensured no button overlap across all scripts

---

## 🎯 Future Enhancements

- [ ] Add keyboard shortcuts for quick access
- [ ] Implement script configuration panel
- [ ] Add analytics/usage tracking
- [ ] Create unified settings management
- [ ] Add script update notifications

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting Guide](./documentation/TROUBLESHOOTING.md)
2. Review [GeoStudio Architecture](../GeoStudio-Reference/03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md)
3. Consult [Implementation Patterns](../GeoStudio-Reference/05-Patterns/)
