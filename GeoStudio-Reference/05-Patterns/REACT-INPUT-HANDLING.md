# React Input Handling Pattern

**Pattern Type:** DOM Manipulation  
**Difficulty:** Intermediate  
**Used In:** PasteDPRE, GAMAutoFill

---

## 🎯 Problem

GeoStudio uses React to manage form inputs. Setting `input.value = "..."` directly doesn't work because React doesn't detect the change.

---

## ✅ Solution

Use the native value setter and trigger React events:

```javascript
function setNativeValue(element, value) {
    if (!element) return;
    
    try {
        // Get the native value setter from HTMLInputElement prototype
        const descriptor = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
        );
        
        if (descriptor && descriptor.set) {
            // Call the native setter
            descriptor.set.call(element, value);
        } else {
            // Fallback
            element.value = value;
        }
    } catch (e) {
        // Fallback
        element.value = value;
    }
    
    // Trigger React/DOM listeners
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Keep attribute consistent (optional but recommended)
    try {
        element.setAttribute('value', value);
    } catch (e) {
        // Ignore if setAttribute fails
    }
}
```

---

## 📖 Usage Examples

### Example 1: Set DP Geocode
```javascript
const dpInput = document.querySelector('#input-dp-geocode');
setNativeValue(dpInput, '41.338839, -89.106049');

// Optional: Focus and blur to trigger validation
dpInput.focus();
dpInput.blur();
```

### Example 2: Set Multiple Inputs
```javascript
const dpInput = document.querySelector('#input-dp-geocode');
const reInput = document.querySelector('#input-re-geocode');

setNativeValue(dpInput, '41.338839, -89.106049');
setNativeValue(reInput, '41.340000, -89.110000');

// Trigger focus/blur for both
[dpInput, reInput].forEach(input => {
    if (input) {
        input.focus();
        input.blur();
    }
});
```

### Example 3: With Validation
```javascript
function setAndValidate(input, value) {
    if (!input) {
        console.error('Input element not found');
        return false;
    }
    
    setNativeValue(input, value);
    input.focus();
    input.blur();
    
    // Check if value was set
    if (input.value === value) {
        console.log('✅ Value set successfully');
        return true;
    } else {
        console.error('❌ Value not set correctly');
        return false;
    }
}

const dpInput = document.querySelector('#input-dp-geocode');
setAndValidate(dpInput, '41.338839, -89.106049');
```

---

## 🔍 Why This Works

1. **Native Setter:** React uses the native value setter internally. By calling it directly, we bypass React's virtual DOM but still trigger its internal mechanisms.

2. **Event Dispatching:** The `input` and `change` events notify React that the value has changed, causing it to update its internal state.

3. **Attribute Sync:** Setting the `value` attribute keeps the DOM in sync with the input's value property.

---

## ⚠️ Common Pitfalls

### ❌ Don't Do This
```javascript
// This won't work with React
input.value = 'new value';
```

### ❌ Don't Do This
```javascript
// Missing event dispatching
const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
);
descriptor.set.call(input, 'new value');
// React won't know the value changed!
```

### ✅ Do This
```javascript
setNativeValue(input, 'new value');
input.focus();
input.blur();
```

---

## 🧪 Testing

```javascript
// Test if the pattern works
function testReactInput() {
    const input = document.querySelector('#input-dp-geocode');
    if (!input) {
        console.error('Input not found');
        return;
    }
    
    const testValue = '41.123, -89.456';
    console.log('Before:', input.value);
    
    setNativeValue(input, testValue);
    input.focus();
    input.blur();
    
    console.log('After:', input.value);
    console.log('Success:', input.value === testValue);
}

testReactInput();
```

---

## 🔗 Related Patterns

- **Element Finding:** `ELEMENT-FINDING.md`
- **Validation:** `VALIDATION-PATTERN.md`
- **Async Operations:** `ASYNC-OPERATIONS.md`

---

## 📚 Real-World Examples

### From PasteDPRE.user.js
```javascript
async function pasteToInput(input, value) {
    if (!input) return;
    
    setNativeValue(input, value);
    input.focus();
    input.blur();
    
    // Wait for React to process
    await new Promise(r => setTimeout(r, 100));
}
```

### From GAMAutoFill.user.js
```javascript
function getDPFieldValue() {
    const nativeField = getNativeDPField();
    if (nativeField && nativeField.value.trim()) {
        return nativeField.value.trim();
    }
    
    const fallbackField = document.getElementById('geo-suggested-dp-input');
    if (fallbackField && fallbackField.value.trim()) {
        return fallbackField.value.trim();
    }
    
    return null;
}
```

---

## 💡 Pro Tips

1. **Always check if element exists** before calling `setNativeValue`
2. **Use focus/blur** to trigger validation
3. **Add small delays** (100-200ms) after setting values to let React process
4. **Test with React DevTools** to verify state updates
5. **Handle errors gracefully** with try-catch blocks
