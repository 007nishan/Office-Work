// ==UserScript==
// @name         UI1 (v1.0)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  UI1 — Handles cascading/dependent form fields with proper waiting
// @match        https://na.templates.geostudio.last-mile.amazon.dev/*
// @match        https://eu.templates.geostudio.last-mile.amazon.dev/*
// @match        https://fe.templates.geostudio.last-mile.amazon.dev/*
// @match        https://na.geostudio.last-mile.amazon.dev/*
// @match        https://eu.geostudio.last-mile.amazon.dev/*
// @match        https://fe.geostudio.last-mile.amazon.dev/*
// @grant        none
// ==/UserScript==

(function () {
'use strict';

if (window.self === window.top) return;

function delay(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
}

async function waitForElement(selector, timeout) {
    timeout = timeout || 10000;
    var start = Date.now();
    while (Date.now() - start < timeout) {
        var el = document.querySelector(selector);
        if (el && el.getBoundingClientRect().width > 0) return el;
        await delay(200);
    }
    return null;
}

async function waitForRadioValue(value, timeout) {
    timeout = timeout || 10000;
    var start = Date.now();
    while (Date.now() - start < timeout) {
        var el = document.querySelector('input[type="radio"][value="' + value + '"]');
        if (el && el.getBoundingClientRect().width > 0) return el;
        await delay(200);
    }
    return null;
}

function showPopup(msg, dur) {
    var d = document.createElement('div');
    d.textContent = msg;
    Object.assign(d.style, {
        position: 'fixed', top: '10%', left: '50%',
        transform: 'translateX(-50%)', padding: '10px 20px',
        background: 'rgba(0,0,0,0.85)', color: '#fff',
        borderRadius: '8px', fontFamily: 'Amazon Ember, Arial, sans-serif',
        fontSize: '14px', zIndex: '99999'
    });
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, dur || 2000);
}

async function clickRadioByValue(value, stepName, fieldLabelHint) {
    console.log('UI1: Waiting for radio value: ' + value + (fieldLabelHint ? ' in field: ' + fieldLabelHint : ''));
    
    var timeout = 15000;
    var start = Date.now();
    var el = null;
    
    while (Date.now() - start < timeout) {
        var radios = document.querySelectorAll('input[type="radio"][value="' + value + '"]');
        
        if (radios.length === 0) {
            await delay(200);
            continue;
        }
        
        // If there's only one radio with this value, use it
        if (radios.length === 1) {
            el = radios[0];
            break;
        }
        
        // Multiple radios with same value - need to find the right one by field label
        if (fieldLabelHint) {
            for (var i = 0; i < radios.length; i++) {
                var radio = radios[i];
                var container = radio.closest('[data-field-id], fieldset, .form-field, [class*="field"], [class*="group"], [class*="section"]');
                if (container) {
                    var labelEl = container.querySelector('label, legend, [class*="label"], [class*="title"], p');
                    if (labelEl && labelEl.textContent.toLowerCase().includes(fieldLabelHint.toLowerCase())) {
                        el = radio;
                        break;
                    }
                }
            }
        }
        
        // If still not found, use the last visible one (likely the most recently rendered)
        if (!el) {
            for (var j = radios.length - 1; j >= 0; j--) {
                if (radios[j].getBoundingClientRect().width > 0) {
                    el = radios[j];
                    break;
                }
            }
        }
        
        if (el) break;
        await delay(200);
    }
    
    if (!el) {
        console.warn('UI1: Radio not found — ' + value);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }
    
    el.scrollIntoView({ block: 'center' });
    await delay(300);
    el.click();
    console.log('UI1: Clicked radio ' + value + (fieldLabelHint ? ' in ' + fieldLabelHint : ''));
    await delay(1000); // Wait for dependent fields to appear
    return true;
}

async function clickDropdown(fieldId, optionText, stepName) {
    console.log('UI1: Waiting for dropdown: ' + fieldId);
    var combo = await waitForElement('#' + fieldId, 15000);

    if (!combo) {
        console.warn('UI1: Dropdown not found — ' + fieldId);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }

    combo.scrollIntoView({ block: 'center' });
    await delay(300);

    // Call React onMouseDown handler
    var reactKey = Object.keys(combo).find(function(k) { return k.startsWith('__reactProps'); });
    if (reactKey && combo[reactKey] && combo[reactKey].onMouseDown) {
        combo[reactKey].onMouseDown({
            target: combo,
            currentTarget: combo,
            button: 0,
            bubbles: true,
            preventDefault: function() {},
            stopPropagation: function() {}
        });
        console.log('UI1: Opened dropdown ' + fieldId);
    } else {
        combo.click();
        console.log('UI1: Clicked dropdown ' + fieldId);
    }

    await delay(1200); // Wait for listbox to render

    // Find the listbox
    var list = document.querySelector('[role="listbox"]');
    if (!list) {
        console.warn('UI1: Listbox not found for ' + fieldId);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }

    // Find and click the option
    var options = list.querySelectorAll('[role="option"]');
    for (var j = 0; j < options.length; j++) {
        if (options[j].textContent.trim() === optionText) {
            options[j].scrollIntoView({ block: 'nearest' });
            await delay(200);
            options[j].click();
            console.log('UI1: Selected "' + optionText + '" in ' + fieldId);
            await delay(1000); // Wait for dependent fields to appear
            return true;
        }
    }

    console.warn('UI1: Option "' + optionText + '" not found in ' + fieldId);
    showPopup('Failed: ' + stepName, 3000);
    return false;
}

async function runFill() {
    showPopup('UI1: Filling...', 10000);
    console.log('UI1 v1.0: Starting fill');

    // 1. Address Type — Perfect_Address
    console.log('Step 1: Address Type');
    if (!await clickRadioByValue('Perfect_Address', 'Address Type')) return;

    // 2. Gam Issue — NO
    console.log('Step 2: Gam Issue');
    if (!await clickRadioByValue('NO', 'Gam Issue')) return;

    // 3. CDP Type — DH Unavailable -DH Unavailable
    console.log('Step 3: CDP Type');
    if (!await clickDropdown('cdptype', 'DH Unavailable -DH Unavailable', 'CDP Type')) return;

    // 4. Audit Resolution — NGFR
    console.log('Step 4: Audit Resolution');
    if (!await clickRadioByValue('NGFR', 'Audit Resolution')) return;

    // 5. Source of Geocodes — Bing-OSM-KIBANA-Deliveries-Other3P
    console.log('Step 5: Source of Geocodes');
    if (!await clickRadioByValue('Bing-OSM-KIBANA-Deliveries-Other3P', 'Source of Geocodes')) return;

    // 6. Pod Accuracy — SCANatUnit/Building
    console.log('Step 6: Pod Accuracy');
    if (!await clickRadioByValue('SCANatUnit/Building', 'Pod Accuracy', 'pod accuracy')) return;

    // 7. Scan Accuracy — NA
    console.log('Step 7: Scan Accuracy');
    if (!await clickRadioByValue('NA', 'Scan Accuracy', 'scan accuracy')) return;

    // 8. Audit Code — Unknown Issue
    console.log('Step 8: Audit Code');
    if (!await clickRadioByValue('Unknown Issue', 'Audit Code')) return;

    // 9. Transcript Analysis — WholePackageIsMissing
    console.log('Step 9: Transcript Analysis');
    if (!await clickDropdown('transcriptanalysis', 'WholePackageIsMissing', 'Transcript Analysis')) return;

    showPopup('UI1: Done!', 2000);
    console.log('UI1 v1.0: Fill complete');
}

async function injectButton() {
    var ready = await waitForRadioValue('Perfect_Address', 20000);

    if (!ready) { 
        console.warn('UI1: Audit form not detected'); 
        return; 
    }

    if (document.getElementById('ui1-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'ui1-btn';
    btn.textContent = 'UI1';
    var originalBgColor = '#d84315';
    Object.assign(btn.style, {
        position: 'fixed',
        top: '176px',
        right: '12px',
        zIndex: '99999',
        padding: '8px 16px',
        backgroundColor: originalBgColor,
        color: '#fff',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'Amazon Ember, Arial, sans-serif',
        transition: 'background-color 0.2s'
    });

    // UNIFIED-BRAND-KIT hover states
    btn.addEventListener('mouseenter', function() {
        if (!btn.disabled) {
            btn.style.backgroundColor = '#ffff00';
            btn.style.color = '#000';
        }
    });
    btn.addEventListener('mouseleave', function() {
        if (!btn.disabled) {
            btn.style.backgroundColor = originalBgColor;
            btn.style.color = '#fff';
        }
    });

    btn.addEventListener('click', async function () {
        btn.disabled = true;
        btn.textContent = 'Filling...';
        btn.style.backgroundColor = '#558b2f';
        try {
            await runFill();
            btn.textContent = 'Done ✓';
        } catch (err) {
            console.error('UI1 error:', err);
            btn.textContent = 'Error ✗';
            btn.style.backgroundColor = '#b71c1c';
            btn.disabled = false;
        }
    });

    document.body.appendChild(btn);
    console.log('UI1 v1.0: Button injected at top: 176px');
}

injectButton();
console.log('UI1 v1.0 loaded — iframe');

})();
