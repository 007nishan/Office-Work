# Prophesy Pipeline - Quick Start Guide

**Get up and running in 5 minutes!**

---

## 🚀 Installation (2 minutes)

### Step 1: Install Tampermonkey
If you don't have it already:
- Chrome/Edge: [Tampermonkey on Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/)
- Firefox: [Tampermonkey on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

### Step 2: Install Scripts
1. Open any script file in `Prophesy-Pipeline/scripts/`
2. Copy the entire script content
3. Click Tampermonkey icon → Dashboard
4. Click "+" (Create new script)
5. Paste the script content
6. Press Ctrl+S (or Cmd+S) to save
7. Repeat for all 10 scripts

---

## 🎯 First Use (3 minutes)

### Step 1: Navigate to GeoStudio
Open any of these URLs:
- `https://na.geostudio.last-mile.amazon.dev/`
- `https://eu.geostudio.last-mile.amazon.dev/`
- `https://fe.geostudio.last-mile.amazon.dev/`

### Step 2: Open an Audit
Navigate to any audit form that requires automation

### Step 3: Wait for Buttons
Script buttons will appear on the right side of the screen after 5-10 seconds

### Step 4: Click a Button
Choose the appropriate script for your audit type and click its button

### Step 5: Review & Submit
Wait for "Done!" popup, review auto-filled fields, then submit

---

## 📍 Which Script to Use?

### Quick Reference Table

| Your Audit Type | Use This Script | Button Color |
|----------------|-----------------|--------------|
| No delivery past location | DI_NDPL | Light Navy |
| No package + SDA | DI_NP_SDA_Final | Blue |
| Standard SDA | DI_SDA | Darker Blue |
| Fixed SDA | FIXED_SDA | Purple |
| Perfect address + DH unavailable | UI1 | Deep Orange |
| Perfect address + delivery location | UI_2 | Purple |
| UI baseline | UI_0 | Teal |
| CEM baseline | CEM_0 | Yellow |
| CEM variant 1 | CEM_1 | Yellow |
| CEM variant 2 | CEM_2 | Light Yellow |

---

## 🎨 Button Locations

All buttons appear vertically stacked on the right side:

```
┌─────────────────────┐
│  DI_NDPL      (12px)│  ← Top
│  DI_NP_SDA    (56px)│
│  DI_SDA       (96px)│
│  FIXED_SDA   (136px)│
│  UI1         (176px)│
│  UI_0        (216px)│
│  UI_2        (256px)│
│  CEM_0       (296px)│
│  CEM_1       (336px)│
│  CEM_2       (376px)│  ← Bottom
└─────────────────────┘
```

---

## ⚡ Common Workflows

### Workflow 1: Perfect Address Audits
1. Open audit form
2. Click **UI1** (DH Unavailable) or **UI_2** (Delivery Location)
3. Wait for "Done!" message
4. Review fields
5. Submit

### Workflow 2: SDA Audits
1. Open audit form
2. Click **DI_SDA** (standard) or **FIXED_SDA** (fixed)
3. Wait for completion
4. Verify data
5. Submit

### Workflow 3: CEM Audits
1. Open CEM audit
2. Click **CEM_0**, **CEM_1**, or **CEM_2**
3. Wait for automation
4. Check fields
5. Submit

---

## 🔍 Troubleshooting

### Buttons Not Showing?
- Wait 10 seconds after page load
- Refresh page (Ctrl+R)
- Check Tampermonkey is enabled
- Verify you're on correct URL

### Script Fails?
- Check browser console (F12)
- Ensure form is fully loaded
- Try refreshing and running again
- See [Troubleshooting Guide](./documentation/TROUBLESHOOTING.md)

### Wrong Fields Filled?
- Verify you clicked correct script
- Check audit type matches script
- Review console logs for errors

---

## 💡 Pro Tips

1. **Wait for Page Load**: Always wait 5-10 seconds before clicking buttons
2. **Don't Interact**: Don't touch the form while script is running
3. **Watch Popups**: Pay attention to "Filling..." and "Done!" messages
4. **Review Always**: Always review auto-filled data before submitting
5. **Console is Your Friend**: Press F12 to see detailed logs

---

## 📚 Learn More

- **Detailed Workflows**: [WORKFLOW-GUIDE.md](./documentation/WORKFLOW-GUIDE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./documentation/TROUBLESHOOTING.md)
- **Complete Index**: [MASTER-INDEX.md](./MASTER-INDEX.md)
- **UNIFIED-BRAND-KIT**: [../GeoStudio-Reference/02-Brand-Kit/UNIFIED-BRAND-KIT.md](../GeoStudio-Reference/02-Brand-Kit/UNIFIED-BRAND-KIT.md)

---

## ✅ Success Checklist

Before your first use:
- [ ] Tampermonkey installed
- [ ] All 10 scripts installed
- [ ] Scripts enabled in Tampermonkey dashboard
- [ ] On correct GeoStudio URL
- [ ] Audit form is open

During use:
- [ ] Waited for page to fully load
- [ ] Buttons appeared on right side
- [ ] Clicked appropriate script button
- [ ] Watched for "Done!" popup
- [ ] Reviewed all auto-filled fields

---

## 🎓 Learning Path

### Day 1: Get Familiar
- Install all scripts
- Try UI_0 or CEM_0 (baseline scripts)
- Observe how automation works

### Day 2: Practice
- Try different script types
- Learn which script for which audit
- Get comfortable with the workflow

### Day 3: Master
- Use scripts in production
- Understand error messages
- Troubleshoot issues independently

---

## 🚨 Important Reminders

1. **Always Review**: Scripts automate filling, but YOU verify accuracy
2. **Don't Submit Blindly**: Check every field before submitting
3. **Report Issues**: If something seems wrong, check console and report
4. **Keep Updated**: Check for script updates periodically
5. **Test First**: Try on non-critical audits first

---

## 📞 Need Help?

1. Check [Troubleshooting Guide](./documentation/TROUBLESHOOTING.md)
2. Review browser console (F12) for errors
3. Verify script version matches documentation
4. Ensure Tampermonkey is enabled

---

**You're ready to go! Start with a simple audit and work your way up.** 🎉

---

*Last Updated: February 28, 2026*
