# Prophesy Pipeline - Troubleshooting Guide

**Version:** 1.0  
**Last Updated:** February 28, 2026

---

## 🔍 Common Issues & Solutions

### Issue: Buttons Not Appearing

**Symptoms:**
- Script buttons don't show up on the page
- Page loads but no UI elements from scripts

**Possible Causes & Solutions:**

1. **Tampermonkey Not Enabled**
   - Solution: Click Tampermonkey icon → Enable
   - Verify scripts are active in dashboard

2. **Wrong Page/URL**
   - Solution: Verify you're on a GeoStudio audit page
   - Check URL matches script @match patterns
   - Supported domains:
     - `na.geostudio.last-mile.amazon.dev`
     - `eu.geostudio.last-mile.amazon.dev`
     - `fe.geostudio.last-mile.amazon.dev`

3. **Page Not Fully Loaded**
   - Solution: Wait 5-10 seconds after page load
   - Refresh page (Ctrl+R or Cmd+R)
   - Check browser console for errors

4. **Script Conflicts**
   - Solution: Disable other Tampermonkey scripts temporarily
   - Re-enable one by one to identify conflict
   - Check for duplicate script installations

5. **Browser Cache**
   - Solution: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear browser cache
   - Restart browser

---

### Issue: Script Fails During Execution

**Symptoms:**
- Button shows "Error ✗"
- Script stops mid-execution
- Some fields filled, others empty

**Possible Causes & Solutions:**

1. **Form Fields Not Ready**
   - Solution: Wait longer before clicking button
   - Ensure all form sections are expanded
   - Check that dependent fields are visible

2. **Network Latency**
   - Solution: Increase timeout values in script
   - Wait for page to fully stabilize
   - Check internet connection

3. **Form Structure Changed**
   - Solution: Verify GeoStudio hasn't updated form layout
   - Check browser console for specific errors
   - Update script if selectors changed

4. **React State Issues**
   - Solution: Refresh page and try again
   - Clear form and restart
   - Check for React errors in console

---

### Issue: Fields Not Filling Correctly

**Symptoms:**
- Some fields remain empty
- Wrong values selected
- Dropdowns don't open

**Possible Causes & Solutions:**

1. **Timing Issues**
   - Solution: Scripts include delays, but may need adjustment
   - Wait for previous field to complete before next
   - Check console logs for timing warnings

2. **Dropdown Not Opening**
   - Solution: Ensure dropdown is visible on screen
   - Scroll to dropdown manually first
   - Check if dropdown is disabled

3. **Radio Button Not Clicking**
   - Solution: Verify radio button value exists
   - Check for multiple radios with same value
   - Review field label hints in script

4. **Cascading Fields Not Appearing**
   - Solution: Increase wait time between steps
   - Manually trigger first field to test
   - Verify dependent field logic in form

---

### Issue: Button Position Problems

**Symptoms:**
- Buttons overlap each other
- Buttons hidden behind other elements
- Buttons not repositioning with edit panel

**Possible Causes & Solutions:**

1. **Z-Index Conflicts**
   - Solution: Check for other scripts with high z-index
   - Verify z-index is 99999 in script
   - Inspect element to see actual z-index

2. **Edit Panel Not Detected**
   - Solution: Check edit panel selector: `._3yG5UlL020qNbegyVK2vrw`
   - Verify edit panel awareness code is present
   - Manually test panel open/close

3. **Multiple Script Instances**
   - Solution: Check for duplicate button IDs
   - Ensure singleton pattern is working
   - Remove and reinstall script

4. **CSS Conflicts**
   - Solution: Check for conflicting styles
   - Verify `!important` not overriding styles
   - Inspect computed styles in DevTools

---

### Issue: Popup Messages Not Showing

**Symptoms:**
- No "Filling..." or "Done!" messages
- Silent failures
- Can't tell if script is running

**Possible Causes & Solutions:**

1. **Popup Blocked**
   - Solution: Check if popup is created but hidden
   - Verify z-index is high enough (100000)
   - Look for popup in DOM inspector

2. **Timing Too Fast**
   - Solution: Popup may disappear too quickly
   - Increase popup duration in script
   - Check console for completion messages

3. **CSS Not Applied**
   - Solution: Verify popup styles are applied
   - Check for CSS conflicts
   - Inspect popup element styles

---

### Issue: Script Works Inconsistently

**Symptoms:**
- Works sometimes, fails other times
- Different behavior on different audits
- Random failures

**Possible Causes & Solutions:**

1. **Race Conditions**
   - Solution: Increase wait times in script
   - Add more robust element waiting
   - Check for async timing issues

2. **Form Variations**
   - Solution: Different audit types may have different forms
   - Verify script matches audit type
   - Check for conditional fields

3. **Browser Performance**
   - Solution: Close unnecessary tabs
   - Restart browser
   - Check CPU/memory usage

4. **GeoStudio Updates**
   - Solution: Platform may have changed
   - Check for script updates
   - Review recent GeoStudio changes

---

## 🛠️ Debugging Tools

### Browser Console (F12)

**What to Look For:**
- Script load messages: "UI1 v1.0 loaded — iframe"
- Button injection: "UI1 v1.0: Button injected at top: 176px"
- Step execution: "Step 1: Address Type"
- Errors: Red text indicating failures
- Warnings: Yellow text for potential issues

**Common Console Messages:**

```
✓ Good: "UI1 v1.0: Fill complete"
✓ Good: "UI1: Clicked radio Perfect_Address"
⚠ Warning: "UI1: Radio not found — value"
✗ Error: "UI1 error: TypeError..."
```

### Tampermonkey Dashboard

**Check:**
- Script is enabled (green checkmark)
- Script version matches documentation
- No conflicting scripts
- Correct @match patterns

### Browser DevTools

**Inspect Elements:**
1. Right-click button → Inspect
2. Check computed styles
3. Verify z-index and position
4. Look for conflicting CSS

**Network Tab:**
1. Check for failed requests
2. Verify API calls complete
3. Look for timeout errors

---

## 🔧 Advanced Troubleshooting

### Modify Script Timeouts

If scripts fail due to slow loading:

```javascript
// Find this in script:
timeout = timeout || 10000;

// Increase to:
timeout = timeout || 20000;  // 20 seconds
```

### Add Debug Logging

Add console logs to track execution:

```javascript
console.log('DEBUG: Current step:', stepName);
console.log('DEBUG: Element found:', el);
```

### Test Individual Functions

Open console and test functions manually:

```javascript
// Test element waiting
await waitForElement('#input-dp-geocode', 10000);

// Test radio clicking
await clickRadioByValue('Perfect_Address', 'Test');
```

---

## 📋 Diagnostic Checklist

Before reporting issues, verify:

- [ ] Tampermonkey is enabled
- [ ] Script is active in dashboard
- [ ] Correct GeoStudio URL
- [ ] Page fully loaded (wait 10 seconds)
- [ ] No browser console errors
- [ ] Other scripts disabled (test isolation)
- [ ] Browser cache cleared
- [ ] Latest script version installed
- [ ] Form fields are visible
- [ ] No blocking popups or dialogs

---

## 🚨 Error Messages Explained

### "Radio not found — value"
**Meaning:** Script couldn't find radio button with specified value  
**Solution:** Check if form has changed, verify field is visible

### "Dropdown not found — fieldId"
**Meaning:** Dropdown element not present in DOM  
**Solution:** Wait longer, check if field is conditional

### "Listbox not found for fieldId"
**Meaning:** Dropdown opened but options didn't render  
**Solution:** Increase delay after dropdown click

### "Option 'text' not found in fieldId"
**Meaning:** Dropdown opened but specific option missing  
**Solution:** Verify option text matches exactly (case-sensitive)

### "Audit form not detected"
**Meaning:** Script couldn't find expected form elements  
**Solution:** Verify you're on correct audit page type

---

## 🔄 Recovery Steps

### If Script Hangs:
1. Refresh page (Ctrl+R)
2. Wait for full page load
3. Try script again
4. If persists, restart browser

### If Form Partially Filled:
1. Don't submit incomplete form
2. Manually complete missing fields
3. Or refresh and run script again
4. Report pattern if repeatable

### If Multiple Failures:
1. Disable all scripts
2. Enable one script at a time
3. Test each individually
4. Identify problematic script
5. Check for updates or conflicts

---

## 📞 Getting Help

### Information to Provide:

1. **Script Details:**
   - Script name and version
   - Button position and color
   - When issue started

2. **Environment:**
   - Browser and version
   - Tampermonkey version
   - Operating system

3. **Error Details:**
   - Console error messages
   - Steps to reproduce
   - Screenshots if helpful

4. **What You've Tried:**
   - Troubleshooting steps attempted
   - Results of each attempt
   - Any patterns noticed

---

## 🔗 Additional Resources

- [Workflow Guide](./WORKFLOW-GUIDE.md) - Proper usage instructions
- [Master Index](../MASTER-INDEX.md) - Complete documentation
- [UNIFIED-BRAND-KIT](../../GeoStudio-Reference/02-Brand-Kit/UNIFIED-BRAND-KIT.md) - Design system
- [Platform Architecture](../../GeoStudio-Reference/03-Platform-Analysis/GEOSTUDIO-ARCHITECTURE.md) - Technical details

---

## 💡 Prevention Tips

### Best Practices:
1. Keep scripts updated
2. Test on non-critical audits first
3. Always review auto-filled data
4. Report issues promptly
5. Document workarounds

### Maintenance:
1. Periodically check for script updates
2. Clear browser cache weekly
3. Monitor GeoStudio platform changes
4. Keep Tampermonkey updated
5. Backup script configurations

---

**Last Updated:** February 28, 2026  
**Version:** 1.0
