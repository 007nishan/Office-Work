// ==UserScript==
// @name         CEM_2 (v1.0 - FAST)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  CEM_2 — Triple speed with reduced delays
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
    console.log('CEM_2: Waiting for radio value: ' + value + (fieldLabelHint ? ' in field: ' + fieldLabelHint : ''));
    
    var timeout = 15000;
    var start = Date.now();
    var el = null;
    
    while (Date.now() - start < timeout) {
        var radios = document.querySelectorAll('input[type="radio"][value="' + value + '"]');
        
        if (radios.length === 0) {
            await delay(200);
            continue;
        }
        
        if (radios.length === 1) {
            el = radios[0];
            break;
        }
        
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
        console.warn('CEM_2: Radio not found — ' + value);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }
    
    el.scrollIntoView({ block: 'center' });
    await delay(100);
    el.click();
    console.log('CEM_2: Clicked radio ' + value + (fieldLabelHint ? ' in ' + fieldLabelHint : ''));
    await delay(333);
    return true;
}

async function clickDropdown(fieldId, optionText, stepName) {
    console.log('CEM_2: Waiting for dropdown: ' + fieldId);
    var combo = await waitForElement('#' + fieldId, 15000);

    if (!combo) {
        console.warn('CEM_2: Dropdown not found — ' + fieldId);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }

    combo.scrollIntoView({ block: 'center' });
    await delay(100);

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
        console.log('CEM_2: Opened dropdown ' + fieldId);
    } else {
        combo.click();
        console.log('CEM_2: Clicked dropdown ' + fieldId);
    }

    await delay(400);

    var list = document.querySelector('[role="listbox"]');
    if (!list) {
        console.warn('CEM_2: Listbox not found for ' + fieldId);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }

    var options = list.querySelectorAll('[role="option"]');
    for (var j = 0; j < options.length; j++) {
        if (options[j].textContent.trim() === optionText) {
            options[j].scrollIntoView({ block: 'nearest' });
            await delay(67);
            options[j].click();
            console.log('CEM_2: Selected "' + optionText + '" in ' + fieldId);
            await delay(333);
            return true;
        }
    }

    console.warn('CEM_2: Option "' + optionText + '" not found in ' + fieldId);
    showPopup('Failed: ' + stepName, 3000);
    return false;
}

async function runFill() {
    showPopup('CEM_2: Filling...', 10000);
    console.log('CEM_2 v1.0: Starting fill');

    console.log('Step 1: Address Type');
    if (!await clickRadioByValue('Perfect_Address', 'Address Type')) return;

    console.log('Step 2: Gam Issue');
    if (!await clickRadioByValue('NO', 'Gam Issue')) return;

    console.log('Step 3: CDP Type');
    if (!await clickDropdown('cdptype', 'Delivery Location -Rear Door/Porch', 'CDP Type')) return;

    console.log('Step 4: Audit Resolution');
    if (!await clickRadioByValue('NGFR', 'Audit Resolution')) return;

    console.log('Step 5: Source of Geocodes');
    if (!await clickRadioByValue('Bing-OSM-KIBANA-Deliveries-Other3P', 'Source of Geocodes')) return;

    console.log('Step 6: Pod Accuracy');
    if (!await clickRadioByValue('SCANnotatCDP', 'Pod Accuracy', 'pod accuracy')) return;

    console.log('Step 7: Scan Accuracy');
    if (!await clickRadioByValue('NA', 'Scan Accuracy', 'scan accuracy')) return;

    console.log('Step 8: Audit Code');
    if (!await clickRadioByValue('Customer Expectation Mismatch', 'Audit Code')) return;

    console.log('Step 9: Transcript Analysis');
    if (!await clickDropdown('transcriptanalysis', 'NA', 'Transcript Analysis')) return;

    showPopup('CEM_2: Done!', 2000);
    console.log('CEM_2 v1.0: Fill complete');
}

async function injectButton() {
    var ready = await waitForRadioValue('Perfect_Address', 20000);

    if (!ready) { 
        console.warn('CEM_2: Audit form not detected'); 
        return; 
    }

    if (document.getElementById('cem-2-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'cem-2-btn';
    btn.textContent = 'CEM_2';
    var originalBgColor = '#fff176';
    Object.assign(btn.style, {
        position: 'fixed',
        top: '376px',
        right: '12px',
        zIndex: '99999',
        padding: '8px 16px',
        backgroundColor: originalBgColor,
        color: '#000',
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
        }
    });
    btn.addEventListener('mouseleave', function() {
        if (!btn.disabled) {
            btn.style.backgroundColor = originalBgColor;
        }
    });

    btn.addEventListener('click', async function () {
        btn.disabled = true;
        btn.textContent = 'Filling...';
        btn.style.backgroundColor = '#aed581';
        try {
            await runFill();
            btn.textContent = 'Done ✓';
        } catch (err) {
            console.error('CEM_2 error:', err);
            btn.textContent = 'Error ✗';
            btn.style.backgroundColor = '#b71c1c';
            btn.disabled = false;
        }
    });

    document.body.appendChild(btn);
    console.log('CEM_2 v1.0: Button injected at top: 376px');
}

injectButton();
console.log('CEM_2 v1.0 loaded — iframe');

})();
