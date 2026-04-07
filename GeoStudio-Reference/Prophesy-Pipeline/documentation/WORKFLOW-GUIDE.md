# Prophesy Pipeline - Workflow Guide

**Version:** 1.0  
**Last Updated:** February 28, 2026

---

## 🎯 Purpose

This guide provides step-by-step instructions for using the Prophesy Pipeline scripts to automate audit workflows in GeoStudio.

---

## 🚀 Getting Started

### Prerequisites
1. Tampermonkey browser extension installed
2. Access to GeoStudio platform
3. All 10 Prophesy Pipeline scripts installed

### Initial Setup
1. Navigate to GeoStudio audit page
2. Wait for the page to fully load
3. Script buttons will appear on the right side of the screen
4. Buttons are color-coded by category for easy identification

---

## 📋 Script Categories & Usage

### Data Input (DI) Scripts

#### DI_NDPL (Position: 12px, Light Navy)
**Use Case:** No Delivery Past Location audits

**Steps:**
1. Open an audit requiring NDPL workflow
2. Click the DI_NDPL button (light navy, top position)
3. Script will automatically fill form fields
4. Review auto-filled data
5. Submit when ready

#### DI_NP_SDA_Final (Position: 56px, Blue)
**Use Case:** No Package Safe Drop Area (Final version)

**Steps:**
1. Open an audit requiring NP SDA workflow
2. Click the DI_NP_SDA_Final button (blue)
3. Wait for cascading form fields to populate
4. Verify all fields are correctly filled
5. Submit audit

#### DI_SDA (Position: 96px, Darker Blue)
**Use Case:** Safe Drop Area audits

**Steps:**
1. Open SDA audit
2. Click DI_SDA button (darker blue)
3. Script handles form automation
4. Review and submit

#### FIXED_SDA (Position: 136px, Purple)
**Use Case:** Fixed Safe Drop Area scenarios

**Steps:**
1. Open fixed SDA audit
2. Click FIXED_SDA button (purple)
3. Automated filling begins
4. Verify and submit

---

### UI Automation Scripts

#### UI1 (Position: 176px, Deep Orange)
**Use Case:** Perfect Address + DH Unavailable workflow

**Workflow:**
1. Address Type → Perfect_Address
2. Gam Issue → NO
3. CDP Type → DH Unavailable -DH Unavailable
4. Audit Resolution → NGFR
5. Source of Geocodes → Bing-OSM-KIBANA-Deliveries-Other3P
6. Pod Accuracy → SCANatUnit/Building
7. Scan Accuracy → NA
8. Audit Code → Unknown Issue
9. Transcript Analysis → WholePackageIsMissing

**Steps:**
1. Open audit form
2. Click UI1 button (deep orange)
3. Watch as script fills cascading fields
4. Wait for "Done!" popup
5. Review and submit

#### UI_0 (Position: 216px, Teal)
**Use Case:** UI automation baseline workflow

**Steps:**
1. Open appropriate audit
2. Click UI_0 button (teal)
3. Script executes automation
4. Verify results

#### UI_2 (Position: 256px, Purple)
**Use Case:** Perfect Address + Delivery Location workflow

**Workflow:**
1. Address Type → Perfect_Address
2. Gam Issue → NO
3. CDP Type → Delivery Location -Front Door/Porch
4. Audit Resolution → NGFR
5. Source of Geocodes → Bing-OSM-KIBANA-Deliveries-Other3P
6. Pod Accuracy → SCANatCDP
7. Scan Accuracy → NA
8. Audit Code → Unknown Issue
9. Transcript Analysis → WholePackageIsMissing

**Steps:**
1. Open audit form
2. Click UI_2 button (purple)
3. Wait for cascading field completion
4. Verify all fields
5. Submit audit

---

### CEM Scripts

#### CEM_0 (Position: 296px, Yellow)
**Use Case:** Customer Experience Management baseline

**Steps:**
1. Open CEM audit
2. Click CEM_0 button (yellow)
3. Script automates CEM workflow
4. Review and submit

#### CEM_1 (Position: 336px, Yellow)
**Use Case:** CEM workflow variant 1

**Steps:**
1. Open appropriate CEM audit
2. Click CEM_1 button (yellow)
3. Automation executes
4. Verify and submit

#### CEM_2 (Position: 376px, Light Yellow)
**Use Case:** CEM workflow variant 2

**Steps:**
1. Open CEM audit variant 2
2. Click CEM_2 button (light yellow, bottom position)
3. Wait for completion
4. Review and submit

---

## 🎨 Visual Indicators

### Button States

**Normal State:**
- White background
- Black text
- Gray border

**Hover State:**
- Yellow background (#ffff00)
- Indicates button is interactive

**Active/Filling State:**
- Green background
- "Filling..." text
- Indicates script is running

**Complete State:**
- "Done ✓" text
- Indicates successful completion

**Error State:**
- Red background
- "Error ✗" text
- Indicates failure (check console)

---

## 💡 Best Practices

### Before Running Scripts
1. ✓ Ensure page is fully loaded
2. ✓ Verify you're on the correct audit type
3. ✓ Check that form fields are visible
4. ✓ Close any blocking popups or dialogs

### During Script Execution
1. ✓ Don't interact with the form while script runs
2. ✓ Watch for popup notifications
3. ✓ Wait for "Done!" message before proceeding
4. ✓ Monitor console for any warnings

### After Script Completion
1. ✓ Review all auto-filled fields
2. ✓ Verify data accuracy
3. ✓ Check for any missed fields
4. ✓ Submit only after verification

---

## ⚡ Quick Tips

- **Multiple Audits:** Scripts can be run multiple times on different audits
- **Edit Panel:** Buttons automatically reposition when edit panel opens
- **Keyboard:** Use Tab to navigate between fields after script runs
- **Console:** Press F12 to view detailed script logs
- **Refresh:** If buttons don't appear, refresh the page

---

## 🔄 Common Workflows

### Workflow 1: Perfect Address Audits
1. Use UI1 for DH Unavailable scenarios
2. Use UI_2 for Delivery Location scenarios
3. Both handle Perfect_Address type automatically

### Workflow 2: SDA Audits
1. Use DI_SDA for standard SDA
2. Use FIXED_SDA for fixed scenarios
3. Use DI_NP_SDA_Final for no package situations

### Workflow 3: CEM Audits
1. Start with CEM_0 for baseline
2. Use CEM_1 or CEM_2 for variants
3. All follow similar automation patterns

---

## 📊 Script Selection Guide

**Choose your script based on:**

| Audit Type | Script to Use |
|------------|---------------|
| No delivery past location | DI_NDPL |
| No package + SDA | DI_NP_SDA_Final |
| Standard SDA | DI_SDA |
| Fixed SDA | FIXED_SDA |
| Perfect address + DH unavailable | UI1 |
| Perfect address + delivery location | UI_2 |
| UI baseline | UI_0 |
| CEM baseline | CEM_0 |
| CEM variant 1 | CEM_1 |
| CEM variant 2 | CEM_2 |

---

## 🎓 Learning Path

### Beginner
1. Start with UI_0 or CEM_0 (baseline scripts)
2. Observe how scripts interact with forms
3. Review console logs to understand flow

### Intermediate
1. Try UI1 and UI_2 (cascading field scripts)
2. Understand dependent field handling
3. Learn to troubleshoot common issues

### Advanced
1. Use all DI scripts for complex scenarios
2. Combine multiple scripts in workflows
3. Customize scripts for specific needs

---

## 📞 Need Help?

If you encounter issues:
1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review browser console (F12) for errors
3. Verify script version matches documentation
4. Ensure Tampermonkey is enabled

---

## 🔗 Related Resources

- [Master Index](../MASTER-INDEX.md)
- [UNIFIED-BRAND-KIT](../../GeoStudio-Reference/02-Brand-Kit/UNIFIED-BRAND-KIT.md)
- [Platform Architecture](../../GeoStudio-Reference/03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md)
