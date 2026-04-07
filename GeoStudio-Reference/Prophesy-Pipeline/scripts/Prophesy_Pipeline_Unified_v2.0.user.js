// ==UserScript==
// @name         Prophesy Pipeline Unified (v2.4.0 - Six Scripts Integration)
// @namespace    http://tampermonkey.net/
// @version      2.4.0
// @description  Consolidates all 10 Prophesy Pipeline workflows + POD panel + 6 integrated scripts (BOAK, GAMAutoFill, geocodeCopier, NEIPopup, Pastdeliveries, PasteDPRE)
// @match        https://na.templates.geostudio.last-mile.amazon.dev/*
// @match        https://eu.templates.geostudio.last-mile.amazon.dev/*
// @match        https://fe.templates.geostudio.last-mile.amazon.dev/*
// @match        https://na.geostudio.last-mile.amazon.dev/*
// @match        https://eu.geostudio.last-mile.amazon.dev/*
// @match        https://fe.geostudio.last-mile.amazon.dev/*
// @grant        none
// ==/UserScript==

/*
 * ============================================================================
 * NAMESPACE CONVENTIONS
 * ============================================================================
 * 
 * To avoid variable conflicts, each integrated script uses a unique prefix:
 * 
 * - boak_      : BOAK Map Tools (Bing, OpenStreetMap, ADRI, Kibana buttons)
 * - gam_       : GAMAutoFill (Queue filtering based on GAM Issue status)
 * - geocopy_   : geocodeCopier (Copy DP/RE coordinates to clipboard)
 * - nei_       : NEIPopup (NEI verification dialog)
 * - pastdel_   : Pastdeliveries (Auto-open past deliveries panel)
 * - geopaste_  : PasteDPRE (Paste DP/RE coordinates from clipboard)
 * - dpval_     : DP Validation (Distance validation for delivery points)
 * 
 * Shared utility functions (delay, waitForElement, showPopup, isEditPanelOpen, 
 * updatePanelPosition) remain unprefixed and are used by all scripts.
 * 
 * ============================================================================
 */

(function () {
'use strict';

// Context detection
const IS_IFRAME = window.self !== window.top;
const ENABLE_WORKFLOW_BUTTONS = IS_IFRAME;
const ENABLE_POD_PANEL = !IS_IFRAME;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
function delay(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

/**
 * Wait for an element to appear and become visible
 * @param {string} selector - CSS selector for the element
 * @param {number} timeout - Maximum wait time in milliseconds (default: 10000)
 * @returns {Promise<Element|null>} The element if found and visible, null if timeout
 */
async function waitForElement(selector, timeout) {
    timeout = timeout || 10000;
    var start = Date.now();
    while (Date.now() - start < timeout) {
        var el = document.querySelector(selector);
        if (el && el.getBoundingClientRect().width > 0) {
            return el;
        }
        await delay(200);
    }
    return null;
}

/**
 * Wait for a radio button with specific value to appear and become visible
 * @param {string} value - Value attribute of the radio button
 * @param {number} timeout - Maximum wait time in milliseconds (default: 10000)
 * @returns {Promise<Element|null>} The radio element if found and visible, null if timeout
 */
async function waitForRadioValue(value, timeout) {
    timeout = timeout || 10000;
    var start = Date.now();
    while (Date.now() - start < timeout) {
        var el = document.querySelector('input[type="radio"][value="' + value + '"]');
        if (el && el.getBoundingClientRect().width > 0) {
            return el;
        }
        await delay(200);
    }
    return null;
}

/**
 * Display a temporary popup notification
 * @param {string} message - Text to display in the popup
 * @param {number} duration - Display time in milliseconds (default: 2000)
 */
function showPopup(message, duration) {
    var popup = document.createElement('div');
    popup.textContent = message;
    Object.assign(popup.style, {
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        borderRadius: '8px',
        fontFamily: 'Amazon Ember, Arial, sans-serif',
        fontSize: '14px',
        zIndex: '99999'
    });
    document.body.appendChild(popup);
    setTimeout(function () {
        popup.remove();
    }, duration || 2000);
}

// ============================================================================
// EDIT PANEL AWARENESS FUNCTIONS
// ============================================================================

/**
 * Check if the GeoStudio edit panel is currently open
 * @returns {boolean} True if edit panel is open, false otherwise
 */
function isEditPanelOpen() {
    var editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
    return editPanel && window.getComputedStyle(editPanel).display !== 'none';
}

/**
 * Update button panel position based on edit panel state
 * @param {HTMLElement} panel - The button panel element
 */
function updatePanelPosition(panel) {
    var panelOpen = isEditPanelOpen();
    panel.style.right = panelOpen ? '320px' : '8px';
}


// ============================================================================
// WORKFLOW REGISTRY
// ============================================================================

/**
 * Registry of all 10 workflow configurations
 * Each workflow defines: id, label, color, textColor, and fill sequence
 */
const WORKFLOWS = {
    DI_NDPL: {
        id: 'di-ndpl-btn',
        label: 'DI_NDPL',
        color: '#5c6bc0',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANnotatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Driver Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    DI_NP_SDA: {
        id: 'di-np-sda-btn',
        label: 'DI_NP_SDA',
        color: '#1565c0',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'NO-POD/No Scan Data', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'SCANatDifferentAddress', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Driver Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    DI_SDA: {
        id: 'di-sda-btn',
        label: 'DI_SDA',
        color: '#0d47a1',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatDifferentAddress', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'NA', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'Driver Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    FIXED_SDA: {
        id: 'fixed-sda-btn',
        label: 'FIXED_SDA',
        color: '#4a148c',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'FIXED', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatDifferentAddress', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'NA', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'Geocode/Geofence Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    UI1: {
        id: 'ui1-btn',
        label: 'UI1',
        color: '#d84315',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'DH Unavailable -DH Unavailable', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatUnit/Building', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Unknown Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'WholePackageIsMissing', step: 'Transcript Analysis' }
        ]
    },
    UI_0: {
        id: 'ui-0-btn',
        label: 'UI_0',
        color: '#00695c',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'DH Unavailable -DH Unavailable', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'NO-POD/No Scan Data', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'SCANatUnit/Building', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Unknown Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'WholePackageIsMissing', step: 'Transcript Analysis' }
        ]
    },
    UI_2: {
        id: 'ui-2-btn',
        label: 'UI_2',
        color: '#6a1b9a',
        textColor: '#fff',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Front Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Unknown Issue', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'WholePackageIsMissing', step: 'Transcript Analysis' }
        ]
    },
    CEM_0: {
        id: 'cem-0-btn',
        label: 'CEM_0',
        color: '#fdd835',
        textColor: '#000',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Package Placement -Under Object', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANatUnit/Building', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Customer Expectation Mismatch', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    CEM_1: {
        id: 'cem-1-btn',
        label: 'CEM_1',
        color: '#ffeb3b',
        textColor: '#000',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Package Placement -Other Specific Spots', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANnotatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Customer Expectation Mismatch', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    },
    CEM_2: {
        id: 'cem-2-btn',
        label: 'CEM_2',
        color: '#fff176',
        textColor: '#000',
        sequence: [
            { type: 'radio', value: 'Perfect_Address', step: 'Address Type' },
            { type: 'radio', value: 'NO', step: 'Gam Issue' },
            { type: 'dropdown', fieldId: 'cdptype', option: 'Delivery Location -Rear Door/Porch', step: 'CDP Type' },
            { type: 'radio', value: 'NGFR', step: 'Audit Resolution' },
            { type: 'radio', value: 'Bing-OSM-KIBANA-Deliveries-Other3P', step: 'Source of Geocodes' },
            { type: 'radio', value: 'SCANnotatCDP', step: 'Pod Accuracy', hint: 'pod accuracy' },
            { type: 'radio', value: 'NA', step: 'Scan Accuracy', hint: 'scan accuracy' },
            { type: 'radio', value: 'Customer Expectation Mismatch', step: 'Audit Code' },
            { type: 'dropdown', fieldId: 'transcriptanalysis', option: 'NA', step: 'Transcript Analysis' }
        ]
    }
};


// ============================================================================
// FORM INTERACTION FUNCTIONS
// ============================================================================

/**
 * Find and click a radio button with the specified value
 * Handles disambiguation when multiple radios share the same value
 * @param {string} value - Value attribute of the radio button
 * @param {string} stepName - Human-readable step name for error messages
 * @param {string} fieldLabelHint - Optional field label text to disambiguate multiple radios
 * @returns {Promise<boolean>} True on success, false on failure
 */
async function clickRadioByValue(value, stepName, fieldLabelHint) {
    console.log('Prophesy Unified: Waiting for radio value: ' + value + (fieldLabelHint ? ' in field: ' + fieldLabelHint : ''));
    
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
        console.warn('Prophesy Unified: Radio not found — ' + value);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }
    
    el.scrollIntoView({ block: 'center' });
    await delay(100);
    el.click();
    console.log('Prophesy Unified: Clicked radio ' + value + (fieldLabelHint ? ' in ' + fieldLabelHint : ''));
    await delay(333);
    return true;
}

/**
 * Open a React dropdown and select the specified option
 * @param {string} fieldId - DOM ID of the combobox element
 * @param {string} optionText - Exact text of the option to select
 * @param {string} stepName - Human-readable step name for error messages
 * @returns {Promise<boolean>} True on success, false on failure
 */
async function clickDropdown(fieldId, optionText, stepName) {
    console.log('Prophesy Unified: Waiting for dropdown: ' + fieldId);
    var combo = await waitForElement('#' + fieldId, 15000);

    if (!combo) {
        console.warn('Prophesy Unified: Dropdown not found — ' + fieldId);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }

    combo.scrollIntoView({ block: 'center' });
    await delay(100);

    // Attempt React onMouseDown handler invocation
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
        console.log('Prophesy Unified: Opened dropdown ' + fieldId + ' (React handler)');
    } else {
        combo.click();
        console.log('Prophesy Unified: Clicked dropdown ' + fieldId + ' (fallback)');
    }

    await delay(400);

    // Find the listbox
    var list = document.querySelector('[role="listbox"]');
    if (!list) {
        console.warn('Prophesy Unified: Listbox not found for ' + fieldId);
        showPopup('Failed: ' + stepName, 3000);
        return false;
    }

    // Find and click the option
    var options = list.querySelectorAll('[role="option"]');
    for (var j = 0; j < options.length; j++) {
        if (options[j].textContent.trim() === optionText) {
            options[j].scrollIntoView({ block: 'nearest' });
            await delay(67);
            options[j].click();
            console.log('Prophesy Unified: Selected "' + optionText + '" in ' + fieldId);
            await delay(333);
            return true;
        }
    }

    console.warn('Prophesy Unified: Option "' + optionText + '" not found in ' + fieldId);
    showPopup('Failed: ' + stepName, 3000);
    return false;
}


// ============================================================================
// WORKFLOW EXECUTION ENGINE
// ============================================================================

/**
 * Execute the fill sequence for the specified workflow
 * @param {string} workflowName - Key from WORKFLOWS registry
 * @returns {Promise<void>}
 */
async function runWorkflow(workflowName) {
    var workflow = WORKFLOWS[workflowName];
    if (!workflow) {
        console.error('Prophesy Unified: Unknown workflow — ' + workflowName);
        return;
    }

    var button = document.getElementById(workflow.id);
    if (!button) {
        console.error('Prophesy Unified: Button not found — ' + workflow.id);
        return;
    }

    // Update button to filling state
    button.disabled = true;
    button.textContent = 'Filling...';
    button.style.backgroundColor = '#7cb342';

    // Show start popup
    showPopup(workflow.label + ': Filling...', 10000);
    console.log('Prophesy Unified v2.0: Starting ' + workflow.label + ' workflow');

    try {
        // Execute each step in sequence
        for (var i = 0; i < workflow.sequence.length; i++) {
            var step = workflow.sequence[i];
            console.log('Prophesy Unified: Step ' + (i + 1) + ' - ' + step.step);

            var success = false;
            if (step.type === 'radio') {
                success = await clickRadioByValue(step.value, step.step, step.hint);
            } else if (step.type === 'dropdown') {
                success = await clickDropdown(step.fieldId, step.option, step.step);
            }

            if (!success) {
                // Step failed - halt execution
                button.textContent = 'Error ✗';
                button.style.backgroundColor = '#b71c1c';
                button.disabled = false;
                return;
            }
        }

        // All steps succeeded
        button.textContent = 'Done ✓';
        showPopup(workflow.label + ': Done!', 2000);
        console.log('Prophesy Unified v2.0: ' + workflow.label + ' workflow complete');

    } catch (err) {
        console.error('Prophesy Unified: Workflow error — ' + workflow.label, err);
        button.textContent = 'Error ✗';
        button.style.backgroundColor = '#b71c1c';
        button.disabled = false;
    }
}


// ============================================================================
// UI COMPONENTS
// ============================================================================

/**
 * Create the button panel container
 * @returns {HTMLElement} The panel element
 */
function createButtonPanel() {
    var panel = document.createElement('div');
    panel.id = 'prophesy-unified-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        top: 'calc(57px + 200px)', // Position below NEI/DFE buttons but visible in iframe
        right: '8px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: '99999',
        padding: '6px',
        gap: '6px',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        maxHeight: 'calc(100vh - 57px - 220px)', // Ensure it fits in viewport
        overflowY: 'auto' // Add scroll if needed
    });
    return panel;
}

/**
 * Create a workflow button
 * @param {Object} workflow - Workflow configuration object
 * @returns {HTMLElement} The button element
 */
function createWorkflowButton(workflow) {
    var button = document.createElement('button');
    button.id = workflow.id;
    button.textContent = workflow.label;
    
    // Use Brand Kit standard: white background with black text
    var originalBgColor = '#fff';
    var originalTextColor = '#000';
    
    Object.assign(button.style, {
        padding: '8px 16px',
        backgroundColor: originalBgColor,
        color: originalTextColor,
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        transition: 'background-color 0.2s',
        width: '100%',
        textAlign: 'center'
    });

    // Yellow hover state per Brand Kit
    button.addEventListener('mouseenter', function() {
        if (!button.disabled) {
            button.style.backgroundColor = '#ffff00';
            button.style.color = '#000';
        }
    });
    
    button.addEventListener('mouseleave', function() {
        if (!button.disabled) {
            button.style.backgroundColor = originalBgColor;
            button.style.color = originalTextColor;
        }
    });

    // Click handler
    button.addEventListener('click', function() {
        // Find the workflow key that matches this workflow's label
        for (var key in WORKFLOWS) {
            if (WORKFLOWS.hasOwnProperty(key) && WORKFLOWS[key].label === workflow.label) {
                runWorkflow(key);
                break;
            }
        }
    });

    return button;
}


// ============================================================================
// INITIALIZATION SYSTEM
// ============================================================================

/**
 * Inject the button panel into the page
 */
async function injectButtonPanel() {
    // Wait for audit form to appear
    var ready = await waitForRadioValue('Perfect_Address', 20000);
    
    if (!ready) {
        console.warn('Prophesy Unified: Audit form not detected');
        return;
    }

    // Singleton pattern - check if panel already exists
    if (document.getElementById('prophesy-unified-panel')) {
        console.log('Prophesy Unified: Panel already exists, skipping injection');
        return;
    }

    // Create panel
    var panel = createButtonPanel();

    // Create and append all workflow buttons
    for (var workflowName in WORKFLOWS) {
        if (WORKFLOWS.hasOwnProperty(workflowName)) {
            var workflow = WORKFLOWS[workflowName];
            var button = createWorkflowButton(workflow);
            panel.appendChild(button);
        }
    }

    // Append panel to body
    document.body.appendChild(panel);

    // Set up MutationObserver for edit panel awareness
    var observer = new MutationObserver(function() {
        updatePanelPosition(panel);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    // Initial position update
    setTimeout(function() {
        updatePanelPosition(panel);
    }, 500);

    console.log('Prophesy Unified v2.0: Button panel injected');
}


// ============================================================================
// POD PANEL FUNCTIONALITY (Main Window Only)
// ============================================================================

if (ENABLE_POD_PANEL) {
    // Inject highlight style
    (function() {
        var style = document.createElement('style');
        style.innerHTML = '.tracking-highlight{background-color:yellow!important;color:black!important;padding:1px 2px;border-radius:2px;}';
        document.head.appendChild(style);
    })();

    var lastKnownTrackingId = null;

    /**
     * Remove all tracking ID highlights from the page
     */
    function removeHighlights() {
        document.querySelectorAll('.tracking-highlight').forEach(function(el) {
            el.replaceWith(document.createTextNode(el.textContent));
        });
    }

    /**
     * Highlight all instances of the tracking ID on the page
     * CRITICAL: This must always work and persist
     * @param {string} text - Tracking ID to highlight
     * @returns {number} Number of matches found
     */
    function highlightAllMatches(text) {
        if (!text || text === 'N/A' || text === '-') return 0;
        
        // Remove old highlights first
        removeHighlights();
        
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                // Don't highlight inside the POD panel itself
                return node.parentElement && !node.parentElement.closest('#r_pod_case_details_panel')
                    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        
        var count = 0;
        var node;
        var nodesToReplace = [];
        
        // Collect all nodes that need replacement
        while ((node = walker.nextNode())) {
            if (node.nodeValue.includes(text)) {
                nodesToReplace.push(node);
            }
        }
        
        // Replace nodes with highlighted versions
        nodesToReplace.forEach(function(node) {
            var parts = node.nodeValue.split(text);
            var frag = document.createDocumentFragment();
            parts.forEach(function(part, i) {
                frag.appendChild(document.createTextNode(part));
                if (i < parts.length - 1) {
                    var span = document.createElement('span');
                    span.className = 'tracking-highlight';
                    span.textContent = text;
                    // Add data attribute to make it persistent
                    span.setAttribute('data-tracking-id', text);
                    frag.appendChild(span);
                    count++;
                }
            });
            node.replaceWith(frag);
        });
        
        console.log('✓ Prophesy POD: Highlighted ' + count + ' instances of tracking ID: ' + text);
        return count;
    }

    /**
     * Find the nearest camera button to a highlighted element
     * @param {HTMLElement} highlightEl - The highlighted element
     * @returns {HTMLElement|null} The nearest camera button
     */
    function findNearestCameraButton(highlightEl) {
        var hr = highlightEl.getBoundingClientRect();
        var nearestBtn = null;
        var nearestDist = Infinity;
        
        document.querySelectorAll('button[aria-label="View photo"]').forEach(function(btn) {
            var r = btn.getBoundingClientRect();
            var d = Math.sqrt(Math.pow(r.left - hr.left, 2) + Math.pow(r.top - hr.top, 2));
            if (d < nearestDist) {
                nearestDist = d;
                nearestBtn = btn;
            }
        });
        
        return nearestBtn;
    }

    /**
     * Click camera button to open POD image
     * CRITICAL: This is a basic feature that must ALWAYS work
     * @param {HTMLElement} btn - Camera button element
     */
    function clickCameraButton(btn) {
        if (!btn) return;
        try {
            btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            btn.click();
            console.log('Prophesy POD: Clicked camera button');
        } catch (err) {
            console.error('Prophesy POD: Error clicking camera button', err);
        }
    }

    /**
     * Check if Past Deliveries panel is open by detecting the button state
     * CRITICAL: This must be accurate to prevent toggling the panel closed
     * @returns {boolean} True if panel is open with delivery rows visible
     */
    function isPastDeliveriesPanelOpen() {
        // Method 1: Check if the Past Deliveries button has an "expanded" or "active" state
        var pastDelsBtn = Array.from(document.querySelectorAll('p.css-1oqpb4x'))
            .find(function(el) { return el.innerText.trim() === "Past deliveries"; });
        
        if (pastDelsBtn) {
            // Check parent elements for expanded/collapsed state indicators
            var parent = pastDelsBtn.closest('button, div[role="button"], [class*="accordion"], [class*="collapsible"]');
            if (parent) {
                var ariaExpanded = parent.getAttribute('aria-expanded');
                if (ariaExpanded === 'true') {
                    console.log('✓ Prophesy POD: Panel is OPEN (aria-expanded=true)');
                    return true;
                } else if (ariaExpanded === 'false') {
                    console.log('✗ Prophesy POD: Panel is CLOSED (aria-expanded=false)');
                    return false;
                }
            }
        }
        
        // Method 2: Check for visible delivery rows with tracking IDs
        var rows = document.querySelectorAll('tr, div[class*="row"], div[class*="item"], div[class*="delivery"]');
        var deliveryRowCount = 0;
        
        for (var i = 0; i < Math.min(rows.length, 30); i++) {
            var text = rows[i].textContent || '';
            // Look for tracking ID pattern (TBA followed by alphanumeric)
            if (/TBA[A-Z0-9]{10,}/.test(text)) {
                deliveryRowCount++;
            }
        }
        
        // Panel is considered open if we have multiple delivery rows
        var isOpen = deliveryRowCount >= 3;
        console.log('Prophesy POD: isPastDeliveriesPanelOpen() - Found ' + deliveryRowCount + ' delivery rows, panel open: ' + isOpen);
        return isOpen;
    }

    /**
     * Open Past Deliveries panel by finding and clicking the button
     * @returns {Promise<boolean>} True if button found and clicked, false otherwise
     */
    async function openPastDeliveriesPanel() {
        // First check if panel is already open
        if (isPastDeliveriesPanelOpen()) {
            console.log('✓ Prophesy POD: Past Deliveries panel is already open, skipping click');
            return true;
        }
        
        var pastDelsBtn = Array.from(document.querySelectorAll('p.css-1oqpb4x'))
            .find(function(el) { return el.innerText.trim() === "Past deliveries"; });
        
        if (!pastDelsBtn) {
            console.error('❌ Prophesy POD: Could not find Past Deliveries button');
            return false;
        }
        
        pastDelsBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        await delay(300); // Wait for scroll to complete
        pastDelsBtn.click();
        console.log('✓ Prophesy POD: Clicked Past Deliveries button');
        return true;
    }

    /**
     * Wait for Past Deliveries panel to be fully loaded with content
     * @param {number} maxWaitMs - Maximum wait time in milliseconds (default: 15000)
     * @param {number} pollIntervalMs - Polling interval in milliseconds (default: 300)
     * @returns {Promise<boolean>} True if content loaded, false if timeout
     */
    async function waitForPastDeliveriesLoaded(maxWaitMs, pollIntervalMs) {
        maxWaitMs = maxWaitMs || 15000; // 15 seconds max wait
        pollIntervalMs = pollIntervalMs || 300;
        var startTime = Date.now();
        
        console.log('⏳ Waiting for Past Deliveries panel to fully load...');
        
        while (Date.now() - startTime < maxWaitMs) {
            // Check if we have multiple delivery rows with tracking IDs
            var rows = document.querySelectorAll('tr, div[class*="row"], div[class*="item"], div[class*="delivery"]');
            var deliveryRowCount = 0;
            
            for (var i = 0; i < Math.min(rows.length, 30); i++) {
                var text = rows[i].textContent || '';
                // Look for tracking ID pattern (TBA followed by alphanumeric)
                if (/TBA[A-Z0-9]{10,}/.test(text)) {
                    deliveryRowCount++;
                }
            }
            
            // Consider loaded if we have at least 3 delivery rows
            if (deliveryRowCount >= 3) {
                var elapsed = Date.now() - startTime;
                console.log('✓ Past Deliveries loaded after ' + elapsed + 'ms (' + deliveryRowCount + ' delivery rows found)');
                return true;
            }
            
            await delay(pollIntervalMs);
        }
        
        console.warn('⚠ Past Deliveries did not load within ' + maxWaitMs + 'ms timeout');
        return false;
    }

    /**
     * Highlight delivery point on the GeoStudio map by clicking the Past Deliveries button
     * @param {string} trackingId - Tracking ID to find on map
     */
    async function highlightDeliveryPointOnMap(trackingId) {
        if (!trackingId || trackingId === 'N/A' || trackingId === '-') return;
        
        console.log('=== Prophesy POD: Map Marker Highlight ===');
        console.log('Searching for tracking ID:', trackingId);
        
        // Check if Past Deliveries panel is open, if not try to open it
        if (!isPastDeliveriesPanelOpen()) {
            console.log('Prophesy POD: Past Deliveries panel is not open. Attempting to open...');
            
            var opened = await openPastDeliveriesPanel();
            if (!opened) {
                showPopup('⚠️ Could not find Past Deliveries button.', 3000);
                console.log('=== End Highlight ===');
                return;
            }
            
            // Wait for panel content to load
            var loaded = await waitForPastDeliveriesLoaded();
            if (!loaded) {
                showPopup('⚠️ Past Deliveries panel opened but content did not load.', 3000);
                console.log('=== End Highlight ===');
                return;
            }
        } else {
            console.log('✓ Prophesy POD: Past Deliveries panel is already open');
        }
        
        // Find the tracking ID in the Past Deliveries panel
        var found = false;
        var pastDelRows = document.querySelectorAll('tr, div[class*="row"], div[class*="item"], div[class*="delivery"]');
        
        console.log('Searching through ' + pastDelRows.length + ' potential delivery rows');
        
        for (var i = 0; i < pastDelRows.length; i++) {
            var row = pastDelRows[i];
            var rowText = row.textContent || '';
            
            if (rowText.includes(trackingId)) {
                console.log('✓ Found tracking ID in row:', row);
                console.log('Row text:', rowText.substring(0, 200));
                
                // Find the red/green numbered button in this row
                var buttons = row.querySelectorAll('button, [role="button"], div[class*="button"], span[class*="button"]');
                console.log('Found ' + buttons.length + ' buttons in row');
                
                for (var j = 0; j < buttons.length; j++) {
                    var btn = buttons[j];
                    var btnText = btn.textContent.trim();
                    var btnStyle = window.getComputedStyle(btn);
                    var bgColor = btnStyle.backgroundColor;
                    
                    console.log('Button ' + j + ':', {
                        text: btnText,
                        backgroundColor: bgColor,
                        element: btn
                    });
                    
                    // Check if it's a numbered button (contains only digits or is red/green)
                    if (/^\d+$/.test(btnText) || bgColor.includes('rgb(255') || bgColor.includes('rgb(0, 128')) {
                        console.log('✓ Found numbered delivery button:', btn);
                        console.log('Clicking button to isolate delivery point on map...');
                        
                        // Highlight the button itself
                        btn.style.boxShadow = '0 0 20px 8px rgba(255,102,0,1)';
                        btn.style.border = '3px solid #FF6600';
                        btn.style.outline = '3px solid #FF6600';
                        
                        // Click the button to isolate the delivery point
                        btn.click();
                        
                        // Wait a moment for map to update, then highlight the visible marker
                        setTimeout(function() {
                            // Now find and highlight the single visible map marker
                            var mapMarkers = document.querySelectorAll('circle, path[class*="marker"], div[class*="marker"]');
                            console.log('After click, found ' + mapMarkers.length + ' map markers');
                            
                            mapMarkers.forEach(function(marker) {
                                var isVisible = marker.getBoundingClientRect().width > 0;
                                if (isVisible) {
                                    console.log('Highlighting visible map marker:', marker);
                                    
                                    // Apply Neon Orange highlighting
                                    marker.style.fill = '#FF6600';
                                    marker.style.stroke = '#FF6600';
                                    marker.style.strokeWidth = '5px';
                                    marker.style.filter = 'drop-shadow(0 0 15px rgba(255,102,0,1))';
                                    
                                    if (marker.tagName === 'circle') {
                                        marker.setAttribute('fill', '#FF6600');
                                        marker.setAttribute('stroke', '#FF6600');
                                        marker.setAttribute('stroke-width', '5');
                                        var currentR = parseInt(marker.getAttribute('r')) || 8;
                                        marker.setAttribute('r', currentR + 5);
                                    }
                                    
                                    // Scroll marker into view
                                    marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            });
                            
                            showPopup('✓ Delivery point isolated and highlighted!', 2000);
                        }, 800);
                        
                        found = true;
                        break;
                    }
                }
                
                if (found) break;
            }
        }
        
        if (!found) {
            console.warn('❌ Could not find numbered button for tracking ID:', trackingId);
            showPopup('⚠️ Could not find delivery button for tracking ID.', 3000);
        }
        
        console.log('=== End Highlight ===');
    }

    /**
     * Start POD search: highlight tracking ID and open camera
     * CRITICAL: These are basic features that must ALWAYS work
     * @param {string} trackingId - Tracking ID to search for
     */
    function startPODSearchForTracking(trackingId) {
        if (!trackingId || trackingId === 'N/A' || trackingId === '-') return;
        
        console.log('=== Prophesy POD: Starting POD Search ===');
        console.log('Tracking ID:', trackingId);
        
        // Store the tracking ID
        lastKnownTrackingId = trackingId;
        
        // STEP 1: HIGHLIGHT TRACKING ID (CRITICAL - MUST ALWAYS WORK)
        var matchCount = highlightAllMatches(trackingId);
        console.log('✓ Highlighted ' + matchCount + ' matches');
        showPopup('📷 POD: ' + matchCount + ' match(es) found', 1800);
        
        // STEP 2: CLICK CAMERA BUTTON (CRITICAL - MUST ALWAYS WORK)
        setTimeout(function() {
            var highlightEl = document.querySelector('.tracking-highlight');
            if (highlightEl) {
                var btn = findNearestCameraButton(highlightEl);
                if (btn) {
                    console.log('✓ Found camera button, clicking...');
                    clickCameraButton(btn);
                    highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    console.warn('⚠ Camera button not found');
                }
            } else {
                console.warn('⚠ No highlighted element found');
            }
        }, 300);
        
        // MAP HIGHLIGHTING DISABLED - It was causing Past Deliveries panel to reload multiple times
        // The basic features (highlighting + camera) work perfectly without it
        
        console.log('=== End POD Search ===');
    }

    // Field mapping system
    var fieldMap = [
        { key: 'TrackingId', labels: ['TrackingId', 'trackingid'] },
        { key: 'DPVended', labels: ['DPVended', 'suggested_pdp'] },
        { key: 'REVended', labels: ['REVended', 'suggested_pre'] },
        { key: 'Defecttype', labels: ['Defecttype', 'DefectType'] },
        { key: 'orderingorderid1', labels: ['orderingorderid1'] },
        { key: 'orderingorderid2', labels: ['orderingorderid2'] },
        { key: 'PrevAuditDate', labels: ['workdate', 'PrevAuditDate', 'WorkDate'] },
        { key: 'ComId1', labels: ['ComId1', 'comid1'] },
        { key: 'ComId2', labels: ['ComId2', 'comid2'] }
    ];

    var caseDetailsPanel = null;
    var lastAddressId = null;
    var lastTimerValue = '';
    var isProcessing = false;

    /**
     * Format latitude/longitude values
     * @param {string} val - Raw geocode value
     * @returns {string} Formatted geocode
     */
    function formatLatLon(val) {
        if (!val || val === 'N/A') return val;
        if (/, *-/.test(val)) return val;
        var m = val.match(/^([+-]?\d+(?:\.\d+)?)[\s]*-([\d.+-].*)$/);
        if (m) return m[1] + ', -' + m[2].replace(/^\+/, '');
        return val.replace(/\s*-\s*/g, ', -');
    }

    /**
     * Create the floating POD panel
     * @returns {HTMLElement} The panel element
     */
    function createFloatingPanel() {
        if (caseDetailsPanel) return caseDetailsPanel;
        
        caseDetailsPanel = document.createElement('div');
        caseDetailsPanel.id = 'r_pod_case_details_panel';
        caseDetailsPanel.style.cssText = 
            'position:fixed; top:50px; right:400px; width:auto; max-width:560px;' +
            'background-color:rgba(0,0,0,0.6); color:white; border-radius:10px;' +
            'padding:15px; z-index:99998; font-family:"Roboto",Arial,sans-serif;' +
            'font-size:14px; line-height:1.4; display:block;' +
            'box-shadow:0 4px 12px rgba(0,0,0,0.2); cursor:move; user-select:none;';
        
        document.body.appendChild(caseDetailsPanel);

        // Make draggable
        var isDragging = false;
        var offsetX = 0;
        var offsetY = 0;
        
        caseDetailsPanel.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - caseDetailsPanel.offsetLeft;
            offsetY = e.clientY - caseDetailsPanel.offsetTop;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            caseDetailsPanel.style.left = (e.clientX - offsetX) + 'px';
            caseDetailsPanel.style.top = (e.clientY - offsetY) + 'px';
            caseDetailsPanel.style.right = 'auto';
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        // Delegated click handlers
        caseDetailsPanel.addEventListener('click', function(e) {
            var panel = caseDetailsPanel;

            // ComId1 click-to-copy
            if (e.target.id === 'r_comid1_link') {
                var v = panel.dataset.comId1Value;
                if (v && v !== 'N/A' && v !== '-') {
                    navigator.clipboard.writeText(v).then(function() {
                        showPopup('ComId1 copied: ' + v, 1500);
                    }).catch(function() {});
                }
            }

            // ComId2 click-to-copy
            if (e.target.id === 'r_comid2_link') {
                var v = panel.dataset.comId2Value;
                if (v && v !== 'N/A' && v !== '-') {
                    navigator.clipboard.writeText(v).then(function() {
                        showPopup('ComId2 copied: ' + v, 1500);
                    }).catch(function() {});
                }
            }

            // POD Search button
            if (e.target.id === 'r_pod_search_btn') {
                e.preventDefault();
                e.stopPropagation();
                var tid = panel.dataset.trackingIdValue;
                if (tid && tid !== 'N/A' && tid !== '-') {
                    startPODSearchForTracking(tid);
                }
            }
        });

        return caseDetailsPanel;
    }

    /**
     * Update the floating panel with case details
     * @param {Object} caseDetails - Case detail data
     */
    function updateFloatingPanel(caseDetails) {
        caseDetails = caseDetails || {};
        var panel = createFloatingPanel();

        var trackingIdValue = caseDetails['TrackingId'] || '-';
        var dpVendedRaw = caseDetails['DPVended'] || 'N/A';
        var revendedRaw = caseDetails['REVended'] || 'N/A';
        var defectTypeValue = caseDetails['Defecttype'] || 'N/A';
        var prevAuditDateValue = caseDetails['PrevAuditDate'] || '-';
        var comId1Value = caseDetails['ComId1'] || '-';
        var comId2Value = caseDetails['ComId2'] || '-';
        var dpVendedValue = dpVendedRaw !== 'N/A' ? formatLatLon(dpVendedRaw) : '-';
        var revendedValue = revendedRaw !== 'N/A' ? formatLatLon(revendedRaw) : '-';

        // Store in shared reference for auto POD trigger
        lastKnownTrackingId = trackingIdValue;

        // Store in dataset for click handlers
        panel.dataset.trackingIdValue = trackingIdValue;
        panel.dataset.comId1Value = comId1Value;
        panel.dataset.comId2Value = comId2Value;

        panel.innerHTML = 
            '<div style="margin-bottom:10px;display:flex;align-items:center;flex-wrap:wrap;gap:6px;">' +
            '<strong>Tracking ID:</strong>' +
            '<span style="margin-left:8px;color:#00d4ff;">' + trackingIdValue + '</span>' +
            '<button id="r_pod_search_btn" title="Highlight Tracking ID + open photo + highlight on map" ' +
            'style="padding:2px 9px;background:#1a73e8;color:#fff;border:none;border-radius:4px;' +
            'font-size:12px;font-weight:700;cursor:pointer;margin-left:4px;font-family:Arial,sans-serif;line-height:1.5;">' +
            '📷 POD</button>' +
            '</div>' +
            '<div style="margin:6px 0;"><strong>DPVended:</strong> <span style="margin-left:8px;">' + dpVendedValue + '</span></div>' +
            '<div style="margin:6px 0;"><strong>REVended:</strong> <span style="margin-left:8px;">' + revendedValue + '</span></div>' +
            '<div style="margin:6px 0;"><strong>DefectType:</strong> <span>' + defectTypeValue + '</span></div>' +
            '<div style="margin:6px 0;"><strong>PrevAuditDate:</strong> <span style="margin-left:8px;color:#ffd700;">' + prevAuditDateValue + '</span></div>' +
            '<div style="margin:6px 0;"><strong>ComId1:</strong> <span id="r_comid1_link" style="margin-left:8px;cursor:pointer;text-decoration:underline;">' + comId1Value + '</span></div>' +
            '<div style="margin:6px 0;"><strong>ComId2:</strong> <span id="r_comid2_link" style="margin-left:8px;cursor:pointer;text-decoration:underline;">' + comId2Value + '</span></div>';
    }

    /**
     * Extract case details from the page
     * @returns {Object} Case details object
     */
    function extractCaseDetails() {
        var labelToKey = {};
        fieldMap.forEach(function(f) {
            f.labels.forEach(function(l) {
                labelToKey[l] = f.key;
            });
        });

        var d = {};
        document.querySelectorAll('.css-wncc9b').forEach(function(item) {
            var rawKey = item.querySelector('.css-1wmy4xi');
            var v = item.querySelector('.css-189kjnx');
            if (rawKey && v) {
                var canon = labelToKey[rawKey.textContent.trim()];
                if (canon && !d[canon]) {
                    d[canon] = v.textContent.trim() || 'N/A';
                }
            }
        });
        return d;
    }

    /**
     * Find AddressId from the page
     * @returns {string|null} AddressId value
     */
    function findAddressId() {
        var items = document.getElementsByClassName('css-wncc9b');
        for (var i = 0; i < items.length; i++) {
            var k = items[i].querySelector('.css-1wmy4xi');
            var v = items[i].querySelector('.css-189kjnx');
            if (k && k.textContent.trim() === 'AddressId' && v) {
                return v.textContent.trim();
            }
        }
        return null;
    }

    /**
     * Check if task panel is open
     * @returns {boolean} True if open
     */
    function isTaskPanelOpen() {
        return !!document.querySelector('.css-14it2a2 .css-2lt2bb');
    }

    /**
     * Check if timer indicates a new case
     * @param {string} timerValue - Current timer value
     * @returns {boolean} True if new case detected
     */
    function isNewCase(timerValue) {
        if (timerValue === lastTimerValue) {
            lastTimerValue = timerValue;
            return false;
        }
        
        var parts = timerValue.split(':');
        var cm = parseInt(parts[0]) || 0;
        var cs = parseInt(parts[1]) || 0;
        
        var lastParts = lastTimerValue.split(':');
        var lm = parseInt(lastParts[0]) || 0;
        var ls = parseInt(lastParts[1]) || 0;
        
        var curr = cm * 60 + cs;
        var last = lm * 60 + ls;
        
        lastTimerValue = timerValue;
        return curr > last && curr >= 1 && curr <= 10000;
    }

    /**
     * Process a new case - automatically opens task details to load data, then closes it
     * CRITICAL: Auto-triggers POD search (highlighting + camera) after case loads AND Past Deliveries loads
     */
    async function processNewCase() {
        if (isProcessing) return;
        isProcessing = true;
        
        console.log('=== Prophesy POD: NEW CASE DETECTED ===');
        
        var taskButtons = document.getElementsByClassName('css-14x4p4v');
        console.log('Prophesy POD: Found ' + taskButtons.length + ' task buttons');
        
        if (taskButtons.length > 0) {
            var wasClosed = !isTaskPanelOpen();
            console.log('Prophesy POD: Task panel was closed:', wasClosed);
            
            // Open task details to load data
            if (wasClosed) {
                console.log('Prophesy POD: Clicking task button to open...');
                taskButtons[0].click();
                
                // Wait for panel to open and data to load
                setTimeout(async function() {
                    console.log('Prophesy POD: Extracting case details...');
                    var caseDetails = extractCaseDetails();
                    updateFloatingPanel(caseDetails);
                    console.log('Prophesy POD: Case details loaded:', caseDetails);
                    
                    // Close task details to restore original state
                    setTimeout(async function() {
                        console.log('Prophesy POD: Clicking task button to close...');
                        taskButtons[0].click();
                        console.log('Prophesy POD: Task details closed, restored original state');
                        
                        // CRITICAL: Wait for Past Deliveries to fully load before auto-triggering
                        var loaded = await waitForPastDeliveriesLoaded(15000, 300);
                        
                        if (loaded) {
                            var trackingId = lastKnownTrackingId;
                            if (trackingId && trackingId !== '-' && trackingId !== 'N/A') {
                                console.log('🎯 AUTO-TRIGGERING POD SEARCH for: ' + trackingId);
                                startPODSearchForTracking(trackingId);
                            } else {
                                console.warn('⚠ Cannot auto-trigger: Invalid tracking ID:', trackingId);
                            }
                        } else {
                            console.warn('⚠ Past Deliveries not loaded, skipping auto-trigger');
                        }
                        
                        isProcessing = false;
                    }, 400);
                }, 1200);
            } else {
                // If it was already open, just extract and wait for Past Deliveries before auto-trigger
                setTimeout(async function() {
                    console.log('Prophesy POD: Extracting case details (panel already open)...');
                    var caseDetails = extractCaseDetails();
                    updateFloatingPanel(caseDetails);
                    
                    // CRITICAL: Wait for Past Deliveries to fully load before auto-triggering
                    var loaded = await waitForPastDeliveriesLoaded(15000, 300);
                    
                    if (loaded) {
                        var trackingId = lastKnownTrackingId;
                        if (trackingId && trackingId !== '-' && trackingId !== 'N/A') {
                            console.log('🎯 AUTO-TRIGGERING POD SEARCH for: ' + trackingId);
                            startPODSearchForTracking(trackingId);
                        } else {
                            console.warn('⚠ Cannot auto-trigger: Invalid tracking ID:', trackingId);
                        }
                    } else {
                        console.warn('⚠ Past Deliveries not loaded, skipping auto-trigger');
                    }
                    
                    isProcessing = false;
                }, 500);
            }
        } else {
            console.log('Prophesy POD: No task buttons found');
            isProcessing = false;
        }
    }

    /**
     * Check and update panel periodically
     */
    function checkAndUpdatePanel() {
        var timerEl = document.querySelector('.css-laozi4 .css-2lt2bb');
        if (timerEl) {
            var tv = timerEl.textContent.trim();
            if (isNewCase(tv)) {
                lastAddressId = null;
                processNewCase();
                return;
            }
        }
        
        // Update if task panel is open and address changed
        if (isTaskPanelOpen()) {
            var addrId = findAddressId();
            if (addrId && addrId !== lastAddressId) {
                lastAddressId = addrId;
                updateFloatingPanel(extractCaseDetails());
            }
        }
    }

    /**
     * Start checking for updates
     */
    function startChecking() {
        checkAndUpdatePanel();
        setTimeout(startChecking, 200);
    }

    setTimeout(startChecking, 2000);
    console.log('📋 POD floating panel loaded (v2.3.4) - AUTO POD search with Past Deliveries wait');
}


// ============================================================================
// INITIALIZATION
// ============================================================================

// ============================================================================
// SECTION: BOAK Map Tools (from BOAK.user.js)
// Requirements: 1.1-1.8
// Provides quick access to 4 mapping tools: Bing, OpenStreetMap, ADRI, Kibana
// ============================================================================

// BOAK: Shared window references for reusing tabs
let boak_windows = {
    bing: null,
    osm: null,
    adri: null,
    kibana_street: null,
    kibana_unit: null
};

/**
 * BOAK: Extract address and coordinates from the page
 * @returns {Promise<Object>} Object with address and coords properties
 */
function boak_extractAddressAndCoords() {
    return new Promise((resolve) => {
        try {
            const input = document.querySelector('#input-dp-geocode');
            const coords = input ? input.value.trim() : '';

            const customerAddressElement = document.querySelector(
                ".css-1xats7y .css-hd6zo3"
            );
            if (!customerAddressElement) {
                setTimeout(() => boak_extractAddressAndCoords().then(resolve), 1000);
                return;
            }
            const address = customerAddressElement.textContent.trim();
            if (!address) {
                setTimeout(() => boak_extractAddressAndCoords().then(resolve), 1000);
                return;
            }

            resolve({ address, coords });
        } catch (error) {
            console.error('BOAK: Extraction error:', error);
            setTimeout(() => boak_extractAddressAndCoords().then(resolve), 1000);
        }
    });
}

/**
 * BOAK: Open Bing Maps with address search
 */
async function boak_openBingAddress() {
    const { address } = await boak_extractAddressAndCoords();
    if (!address) {
        showPopup('Missing address!', 2000);
        return;
    }
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.bing.com/maps?where1=${encodedAddress}`;
    boak_openOrReuseWindow('bing', url, 'bingMapsTab');
}

/**
 * BOAK: Open Bing Maps with coordinates
 */
async function boak_openBingCoords() {
    const { coords } = await boak_extractAddressAndCoords();
    if (!coords) {
        showPopup('Missing coordinates!', 2000);
        return;
    }
    const [lat, lon] = coords.split(',').map(s => s.trim());
    const url = `https://www.bing.com/maps?where1=${lat}%2C${lon}&cp=${lat}~${lon}&lvl=11.0`;
    boak_openOrReuseWindow('bing', url, 'bingMapsTab');
}

/**
 * BOAK: Open OpenStreetMap with address search
 */
async function boak_openOSMAddress() {
    const { address } = await boak_extractAddressAndCoords();
    if (!address) {
        showPopup('Missing address!', 2000);
        return;
    }
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.openstreetmap.org/search?query=${encodedAddress}`;
    boak_openOrReuseWindow('osm', url, 'osmMapsTab');
}

/**
 * BOAK: Open OpenStreetMap with coordinates
 */
async function boak_openOSMCoords() {
    const { coords } = await boak_extractAddressAndCoords();
    if (!coords) {
        showPopup('Missing coordinates!', 2000);
        return;
    }
    const [lat, lon] = coords.split(',').map(s => s.trim());
    const url = `https://www.openstreetmap.org/search?query=${lat}%2C${lon}&zoom=19#map=19/${lat}/${lon}`;
    boak_openOrReuseWindow('osm', url, 'osmMapsTab');
}

/**
 * BOAK: Open ADRI viewer with coordinates
 */
async function boak_openADRI() {
    const { coords } = await boak_extractAddressAndCoords();
    if (!coords) {
        showPopup('Missing coordinates!', 2000);
        return;
    }
    const [lat, lon] = coords.split(',').map(s => s.trim());
    const url = `https://viewer.prod-tools.maps.a2z.com/single?style=amazon-delivery-rabbit-internal&version=2.5&tileUrl=https%3A%2F%2F5.visualization.resources.maps.a2z.com%2F%7Bprefix%7D%2F4.0%2F%7Bz%7D%2F%7Bx%7D%2F%7By%7D%2Ftile.mvt&goToOption=Co-ordinates#17.08/${lat}/${lon}`;
    boak_openOrReuseWindow('adri', url, 'adriMapsTab');
}

/**
 * BOAK: Open Kibana with street search
 */
async function boak_openKibanaStreet() {
    const { address } = await boak_extractAddressAndCoords();
    if (!address) {
        showPopup('Address is empty!', 2000);
        return;
    }
    const encodedQuery = encodeURIComponent(address);
    const url = `https://search-lastmile-gis-addresses-ri43h2hevbez2rrfrs2kfi5vjq.eu-west-1.es.amazonaws.com/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(number,street,city,state,postcode,lat,lon),filters:!(),index:f9b55970-70e8-11ef-91d5-81b3830606f8,interval:auto,query:(language:lucene,query:'${encodedQuery}'),sort:!())`;
    boak_openOrReuseWindow('kibana_street', url, 'kibanaStreetTab');
}

/**
 * BOAK: Open Kibana with unit search
 */
async function boak_openKibanaUnit() {
    const { address } = await boak_extractAddressAndCoords();
    if (!address) {
        showPopup('Address is empty!', 2000);
        return;
    }
    const encodedQuery = encodeURIComponent(address);
    const url = `https://search-lastmile-gis-addresses-ri43h2hevbez2rrfrs2kfi5vjq.eu-west-1.es.amazonaws.com/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(unit_number,number,street,city,state,postcode,lat_lon_string),filters:!(),index:'0e6e0f70-7124-11ef-a0fa-69aac1e0be67',interval:auto,query:(language:lucene,query:'${encodedQuery}'),sort:!())`;
    boak_openOrReuseWindow('kibana_unit', url, 'kibanaUnitTab');
}

/**
 * BOAK: Open or reuse a window/tab
 * @param {string} key - Window reference key
 * @param {string} url - URL to open
 * @param {string} name - Window name
 */
function boak_openOrReuseWindow(key, url, name) {
    if (!boak_windows[key] || boak_windows[key].closed) {
        boak_windows[key] = window.open(url, name);
    } else {
        boak_windows[key].location.href = url;
        boak_windows[key].focus();
    }
}

/**
 * BOAK: Create a button with optional dropdown menu
 * @param {string} label - Button label
 * @param {string} title - Button tooltip
 * @param {Object|Function} options - Either a function for click or object for dropdown menu
 * @returns {HTMLElement} Button container element
 */
function boak_makeButton(label, title, options) {
    const container = document.createElement('div');
    container.style.position = 'relative';

    const btn = document.createElement('button');
    btn.textContent = label;
    btn.title = title;
    Object.assign(btn.style, {
        width: '24px',
        height: '24px',
        backgroundColor: '#fff',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    if (options && typeof options === 'object') {
        // Create dropdown menu
        const menu = document.createElement('div');
        menu.className = 'boak-hover-menu';
        Object.assign(menu.style, {
            position: 'absolute',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'none',
            padding: '4px',
            zIndex: '100000',
            top: '0',
            left: '30px',
            flexDirection: 'column'
        });

        Object.entries(options).forEach(([text, handler]) => {
            const option = document.createElement('button');
            option.textContent = text;
            Object.assign(option.style, {
                display: 'block',
                width: '100px',
                padding: '4px 6px',
                margin: '1px 0',
                border: 'none',
                borderRadius: '3px',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '11px',
                whiteSpace: 'nowrap'
            });
            option.onmouseenter = () => option.style.background = '#e0e0e0';
            option.onmouseleave = () => option.style.background = '#fff';
            option.onclick = () => {
                menu.style.display = 'none';
                handler();
            };
            menu.appendChild(option);
        });

        btn.onclick = () => {
            document.querySelectorAll('.boak-hover-menu').forEach(m => {
                if (m !== menu) m.style.display = 'none';
            });
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        };

        container.appendChild(btn);
        container.appendChild(menu);
    } else if (typeof options === 'function') {
        btn.onclick = options;
        container.appendChild(btn);
    }

    return container;
}

/**
 * BOAK: Create and inject the BOAK button panel
 * @returns {HTMLElement} The panel element
 */
function boak_createPanel() {
    // Check if panel already exists
    if (document.getElementById('boak-panel')) {
        return document.getElementById('boak-panel');
    }

    const panel = document.createElement('div');
    panel.id = 'boak-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        top: 'calc(57px + 130px)',
        right: '8px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: '99999',
        padding: '6px',
        gap: '6px',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease'
    });

    // Add B button (Bing Maps)
    panel.appendChild(boak_makeButton('B', 'Bing Maps', {
        'Address Search': boak_openBingAddress,
        'Coordinates': boak_openBingCoords
    }));

    // Add O button (OpenStreetMap)
    panel.appendChild(boak_makeButton('O', 'OpenStreetMap', {
        'Address Search': boak_openOSMAddress,
        'Coordinates': boak_openOSMCoords
    }));

    // Add A button (ADRI)
    panel.appendChild(boak_makeButton('A', 'ADRI', boak_openADRI));

    // Add K button (Kibana)
    panel.appendChild(boak_makeButton('K', 'Kibana (Street / Unit)', {
        'Street': boak_openKibanaStreet,
        'Unit': boak_openKibanaUnit
    }));

    document.body.appendChild(panel);

    // Close menus when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInside = event.target.closest('.boak-hover-menu') || event.target.closest('button');
        if (!isClickInside) {
            document.querySelectorAll('.boak-hover-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });

    // Set up Edit Panel Awareness
    boak_updateVisibility();
    const observer = new MutationObserver(boak_updateVisibility);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    return panel;
}

/**
 * BOAK: Update panel visibility based on Edit Panel state
 */
function boak_updateVisibility() {
    const panel = document.getElementById('boak-panel');
    if (!panel) return;

    const editPanelOpen = isEditPanelOpen();
    panel.style.display = editPanelOpen ? 'flex' : 'none';
    
    // Also update position
    const rightPosition = editPanelOpen ? '320px' : '8px';
    panel.style.right = rightPosition;
}

/**
 * BOAK: Initialize BOAK functionality
 */
async function boak_init() {
    // Wait for the DP geocode input to appear
    const input = await waitForElement('#input-dp-geocode', 20000);
    if (!input) {
        console.warn('BOAK: DP geocode input not found, skipping initialization');
        return;
    }

    // Create the panel
    boak_createPanel();
    console.log('BOAK: Map tools panel initialized');
}


// ============================================================================
// SECTION: Geocode Copy (from geocodeCopier.user.js)
// Requirements: 4.1-4.5
// Provides buttons to copy DP and RE coordinates to clipboard
// ============================================================================

/**
 * Geocode Copy: Copy text to clipboard
 * @param {string} text - Text to copy
 */
function geocopy_copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
}

/**
 * Geocode Copy: Create a button
 * @param {string} label - Button label
 * @param {string} title - Button tooltip
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Button container element
 */
function geocopy_makeButton(label, title, onClick) {
    const container = document.createElement('div');
    container.style.position = 'relative';

    const btn = document.createElement('button');
    btn.textContent = label;
    btn.title = title;
    Object.assign(btn.style, {
        width: '42px',
        height: '24px',
        backgroundColor: '#fff',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s'
    });

    btn.onclick = onClick;

    btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = '#ffff00';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = '#fff';
    });

    container.appendChild(btn);
    return container;
}

/**
 * Geocode Copy: Create and inject the geocode copy button panel
 * @returns {HTMLElement} The panel element
 */
function geocopy_createPanel() {
    // Check if panel already exists
    if (document.getElementById('geocopy-panel')) {
        return document.getElementById('geocopy-panel');
    }

    const panel = document.createElement('div');
    panel.id = 'geocopy-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        top: 'calc(57px + 265px)',
        right: '8px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: '99999',
        padding: '6px',
        gap: '6px',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease'
    });

    // CDP - Copy DP button
    panel.appendChild(geocopy_makeButton('CDP', 'Copy Delivery Point', function() {
        const inputElement = document.getElementById('input-dp-geocode');
        if (inputElement) {
            const latLongs = inputElement.value;
            if (latLongs) {
                geocopy_copyToClipboard(latLongs);
                showPopup('DP copied: ' + latLongs, 2000);
                console.log("Geocopy: DP copied:", latLongs);
            } else {
                showPopup('No Delivery Point coordinates found', 2000);
            }
        }
    }));

    // CRE - Copy RE button
    panel.appendChild(geocopy_makeButton('CRE', 'Copy Road Entry', function() {
        const inputElement = document.getElementById('input-re-geocode');
        if (inputElement) {
            const latLongs = inputElement.value;
            if (latLongs) {
                geocopy_copyToClipboard(latLongs);
                showPopup('RE copied: ' + latLongs, 2000);
                console.log("Geocopy: RE copied:", latLongs);
            } else {
                showPopup('No Road Entry coordinates found', 2000);
            }
        }
    }));

    document.body.appendChild(panel);

    // Set up Edit Panel Awareness
    geocopy_updateVisibility();
    const observer = new MutationObserver(geocopy_updateVisibility);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    return panel;
}

/**
 * Geocode Copy: Update panel visibility based on Edit Panel state
 */
function geocopy_updateVisibility() {
    const panel = document.getElementById('geocopy-panel');
    if (!panel) return;

    const editPanelOpen = isEditPanelOpen();
    panel.style.display = editPanelOpen ? 'flex' : 'none';
    
    // Also update position
    const rightPosition = editPanelOpen ? '320px' : '8px';
    panel.style.right = rightPosition;
}

/**
 * Geocode Copy: Initialize geocode copy functionality
 */
async function geocopy_init() {
    // Wait for the DP geocode input to appear
    const input = await waitForElement('#input-dp-geocode', 20000);
    if (!input) {
        console.warn('Geocopy: DP geocode input not found, skipping initialization');
        return;
    }

    // Create the panel
    geocopy_createPanel();
    console.log('Geocopy: Copy panel initialized');
}


// ============================================================================
// SECTION: Geocode Paste (from PasteDPRE.user.js)
// Requirements: 7.1-7.6
// Provides buttons to paste DP and RE coordinates from clipboard
// ============================================================================

/**
 * Geocode Paste: Set native value so React picks it up
 * @param {HTMLElement} el - Input element
 * @param {string} value - Value to set
 */
function geopaste_setNativeValue(el, value) {
    if (!el) return;
    try {
        const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        if (descriptor && descriptor.set) {
            descriptor.set.call(el, value);
        } else {
            el.value = value;
        }
    } catch (e) {
        el.value = value;
    }
    // trigger React/DOM listeners
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    // keep attribute consistent
    try { el.setAttribute('value', value); } catch (e) { /*ignore*/ }
}

/**
 * Geocode Paste: Try to find input by id(s) or by nearby label text
 * @param {Object} options - Search options
 * @returns {Promise<HTMLElement|null>} Input element or null
 */
async function geopaste_findInput({ ids = [], labelRegex = null, timeout = 5000 } = {}) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
        for (const sel of ids) {
            try {
                const el = document.querySelector(sel);
                if (el) return el;
            } catch (e) { /* ignore invalid selectors */ }
        }

        if (labelRegex) {
            const elements = Array.from(document.querySelectorAll('p, label, span, div'));
            const label = elements.find(n => {
                try { return n.textContent && labelRegex.test(n.textContent.trim()); } catch (e) { return false; }
            });
            if (label) {
                const tries = [
                    label.querySelector && label.querySelector('input'),
                    label.parentElement && label.parentElement.querySelector && label.parentElement.querySelector('input'),
                    label.nextElementSibling && label.nextElementSibling.querySelector && label.nextElementSibling.querySelector('input'),
                    label.closest && label.closest('div') && label.closest('div').querySelector && label.closest('div').querySelector('input')
                ];
                for (const c of tries) if (c) return c;
                const container = label.closest ? label.closest('div') : null;
                if (container) {
                    const fallback = container.querySelector('input');
                    if (fallback) return fallback;
                }
            }
        }

        await delay(200);
    }
    return null;
}

/**
 * Geocode Paste: Read clipboard or prompt user
 * @returns {Promise<string|null>} Clipboard text or null
 */
async function geopaste_readClipboardOrPrompt() {
    try {
        const txt = await navigator.clipboard.readText();
        return (txt && txt.trim()) ? txt.trim() : null;
    } catch (e) {
        return prompt('Paste geocode(s) here (format: "lat,lng" or two pairs separated by newline):');
    }
}

/**
 * Geocode Paste: Extract lat/lng pairs from text
 * @param {string} text - Text to parse
 * @returns {Array<string>} Array of lat/lng pairs
 */
function geopaste_extractLatLngPairs(text) {
    if (!text) return [];
    const re = /-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?/g;
    const matches = text.match(re);
    return matches ? matches.map(s => s.trim()) : [];
}

/**
 * Geocode Paste: Create a button
 * @param {string} label - Button label
 * @param {string} title - Button tooltip
 * @param {string} action - Action type ('dp', 're', or 'both')
 * @returns {HTMLElement} Button container element
 */
function geopaste_makeButton(label, title, action) {
    const container = document.createElement('div');
    container.style.position = 'relative';

    const btn = document.createElement('button');
    btn.textContent = label;
    btn.title = title;
    Object.assign(btn.style, {
        width: '48px',
        height: '24px',
        backgroundColor: '#fff',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s'
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = '#ffff00';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = '#fff';
    });

    btn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        ev.preventDefault();

        const clipboardText = await geopaste_readClipboardOrPrompt();
        if (!clipboardText) {
            showPopup('No clipboard/text provided', 2000);
            console.warn('Geopaste: No clipboard/text provided.');
            return;
        }

        const pairs = geopaste_extractLatLngPairs(clipboardText);

        const dpInput = await geopaste_findInput({
            ids: ['#input-dp-geocode', 'input[id*="dp"]', 'input.css-1k4cgj4'],
            labelRegex: /Delivery\s*Point|DP/i,
            timeout: 3000
        });

        const reInput = await geopaste_findInput({
            ids: ['#input-re-geocode', 'input[id*="re"]', 'input.css-1k4cgj4'],
            labelRegex: /Road\s*Entry\s*Point|RE/i,
            timeout: 3000
        });

        if (!dpInput && !reInput) {
            console.error('Geopaste: DP and RE inputs not found.');
            showPopup('DP/RE inputs not found on this page', 3000);
            return;
        }

        try {
            if (action === 'dp') {
                const value = (pairs.length ? pairs[0] : clipboardText).trim();
                if (!dpInput) { 
                    showPopup('DP input not found', 2000);
                    return;
                }
                geopaste_setNativeValue(dpInput, value);
                dpInput.focus();
                dpInput.blur();
                showPopup('DP pasted: ' + value, 2000);
                console.log('Geopaste: DP pasted:', value);
            } else if (action === 're') {
                const value = (pairs.length ? pairs[0] : clipboardText).trim();
                if (!reInput) { 
                    showPopup('RE input not found', 2000);
                    return;
                }
                geopaste_setNativeValue(reInput, value);
                reInput.focus();
                reInput.blur();
                showPopup('RE pasted: ' + value, 2000);
                console.log('Geopaste: RE pasted:', value);
            } else if (action === 'both') {
                let dpVal, reVal;
                if (pairs.length >= 2) {
                    dpVal = pairs[0];
                    reVal = pairs[1];
                } else if (pairs.length === 1) {
                    dpVal = pairs[0];
                    reVal = pairs[0];
                } else {
                    dpVal = clipboardText.trim();
                    reVal = clipboardText.trim();
                }

                if (dpInput) { 
                    geopaste_setNativeValue(dpInput, dpVal); 
                    dpInput.focus(); 
                    dpInput.blur(); 
                }
                if (reInput) { 
                    geopaste_setNativeValue(reInput, reVal); 
                    reInput.focus(); 
                    reInput.blur(); 
                }
                showPopup('Both pasted: DP=' + dpVal + ', RE=' + reVal, 2000);
                console.log('Geopaste: Both pasted - DP:', dpVal, 'RE:', reVal);
            }
        } catch (err) {
            console.error('Geopaste: Error while writing values to inputs:', err);
            showPopup('Failed to paste into DP/RE', 3000);
        }
    });

    container.appendChild(btn);
    return container;
}

/**
 * Geocode Paste: Create and inject the geocode paste button panel
 * @returns {HTMLElement} The panel element
 */
function geopaste_createPanel() {
    // Check if panel already exists
    if (document.getElementById('geopaste-panel')) {
        return document.getElementById('geopaste-panel');
    }

    const panel = document.createElement('div');
    panel.id = 'geopaste-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        top: 'calc(57px + 337px)',
        right: '8px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: '99999',
        padding: '6px',
        gap: '6px',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease'
    });

    panel.appendChild(geopaste_makeButton('PDP', 'Paste Delivery Point', 'dp'));
    panel.appendChild(geopaste_makeButton('PRE', 'Paste Road Entry', 're'));
    panel.appendChild(geopaste_makeButton('PBoth', 'Paste Both DP & RE', 'both'));

    document.body.appendChild(panel);

    // Set up Edit Panel Awareness
    geopaste_updateVisibility();
    const observer = new MutationObserver(geopaste_updateVisibility);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    return panel;
}

/**
 * Geocode Paste: Update panel visibility based on Edit Panel state
 */
function geopaste_updateVisibility() {
    const panel = document.getElementById('geopaste-panel');
    if (!panel) return;

    const editPanelOpen = isEditPanelOpen();
    panel.style.display = editPanelOpen ? 'flex' : 'none';
    
    // Also update position
    const rightPosition = editPanelOpen ? '320px' : '8px';
    panel.style.right = rightPosition;
}

/**
 * Geocode Paste: Initialize geocode paste functionality
 */
async function geopaste_init() {
    // Wait for the DP geocode input to appear
    const input = await waitForElement('#input-dp-geocode', 20000);
    if (!input) {
        console.warn('Geopaste: DP geocode input not found, skipping initialization');
        return;
    }

    // Create the panel
    geopaste_createPanel();
    console.log('Geopaste: Paste panel initialized');
}


// ============================================================================
// INITIALIZATION
// ============================================================================

if (ENABLE_WORKFLOW_BUTTONS) {
    injectButtonPanel();
    console.log('Prophesy Pipeline Unified v2.4.0 loaded — iframe (workflow buttons)');
}

if (ENABLE_POD_PANEL) {
    console.log('Prophesy Pipeline Unified v2.4.0 loaded — main window (POD panel + AUTO POD with wait)');
}

// Initialize BOAK Map Tools (works in iframe context)
if (ENABLE_WORKFLOW_BUTTONS) {
    boak_init();
    geocopy_init();
    geopaste_init();
}

})();