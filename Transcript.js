// ==UserScript==
// @name         PS_HEARTBEAT - Transcript
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Auto-setup and automated search execution for Heartbeat transcript.
// @author       Nishan [nishanrh] Nishanur Rahman
// @match        https://heartbeat.cs.amazon.dev/*
// @grant        none
// ==/UserScript==

/**
 * AUTHORSHIP DECLARATION
 * Hardcoded to prevent trivial removal.
 */
Object.defineProperty(window, '_scriptAuthor', {
    value: 'Nishan [nishanrh] Nishanur Rahman',
    writable: false,
    configurable: false
});

(function () {
    'use strict';

    // Anti-tamper log that verifies authorship lock
    console.log('%cScript Author: ' + window._scriptAuthor, 'color: #00688D; font-size: 16px; font-weight: bold;');

    // ============================================================
    // UTILITIES
    // ============================================================
    function waitFor(selector, timeout, callback) {
        var elapsed = 0;
        var interval = setInterval(function () {
            var el = document.querySelector(selector);
            elapsed += 150;
            if (el) { clearInterval(interval); callback(el); }
            else if (elapsed >= timeout) { clearInterval(interval); console.warn('PS_HEARTBEAT: Timeout waiting for', selector); callback(null); }
        }, 150);
    }

    function waitForText(selector, text, timeout, callback) {
        var elapsed = 0;
        var interval = setInterval(function () {
            var els = document.querySelectorAll(selector);
            var found = null;
            els.forEach(function (el) { if (el.textContent.trim().includes(text)) found = el; });
            elapsed += 150;
            if (found) { clearInterval(interval); callback(found); }
            else if (elapsed >= timeout) { clearInterval(interval); console.warn('PS_HEARTBEAT: Timeout waiting for text:', text); callback(null); }
        }, 150);
    }

    function safeClick(el) {
        if (!el) return;
        el.scrollIntoView({ block: 'center' });
        el.click();
    }

    function setReactInput(input, value) {
        var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function fullClick(el) {
        if (!el) return;
        el.focus();
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        el.click();
    }

    // ============================================================
    // SETUP CHECK
    // ============================================================
    function isSetupComplete() {
        var hasContactIdFilter = false;
        document.querySelectorAll('p, span, div, label').forEach(function (el) {
            if (el.textContent.trim() === 'Contact ID (unencrypted)') hasContactIdFilter = true;
        });
        var hasSelectValues = document.querySelector('input[placeholder="Select values..."]');
        return hasContactIdFilter && hasSelectValues;
    }

    // ============================================================
    // AUTO-SETUP: Date Range → Last 13 months
    // ============================================================
    function setDateRange(callback) {
        console.log('PS_HEARTBEAT: Setting date range to Last 13 months...');
        var divs = document.querySelectorAll('div.css-1c02o5u');
        var dateDiv = null;
        divs.forEach(function (d) {
            if (d.textContent.trim().match(/\d{4}/) && d.querySelector('p.css-mn4iko')) dateDiv = d;
        });
        if (!dateDiv) {
            console.warn('PS_HEARTBEAT: Date div not found, skipping');
            callback();
            return;
        }
        dateDiv.click();
        console.log('PS_HEARTBEAT: Date picker opened');
        setTimeout(function () {
            var startDateInput = document.querySelector('input[placeholder="Starting Date"]');
            if (!startDateInput) {
                console.warn('PS_HEARTBEAT: Starting Date input not found, skipping');
                callback();
                return;
            }
            fullClick(startDateInput);
            console.log('PS_HEARTBEAT: Clicked Starting Date input');
            setTimeout(function () {
                var presetBtns = document.querySelectorAll('button.css-1ht4088');
                var target = null;
                presetBtns.forEach(function (b) {
                    if (b.textContent.trim() === 'Last 13 months (max)') target = b;
                });
                if (target) {
                    console.log('PS_HEARTBEAT: Clicking Last 13 months (max)');
                    safeClick(target);
                    setTimeout(function () { callback(); }, 1000);
                } else {
                    console.warn('PS_HEARTBEAT: Last 13 months preset not found');
                    callback();
                }
            }, 800);
        }, 600);
    }

    // ============================================================
    // AUTO-SETUP: Customer Experience tab
    // ============================================================
    function selectCustomerExperience(callback) {
        console.log('PS_HEARTBEAT: Looking for Customer Experience tab...');
        waitForText('button, [role="tab"], div.tab2', 'Customer Experience', 8000, function (ceTab) {
            if (ceTab) {
                console.log('PS_HEARTBEAT: Clicking Customer Experience');
                safeClick(ceTab);
            } else {
                console.warn('PS_HEARTBEAT: Customer Experience tab not found');
            }
            setTimeout(function () { callback(); }, 1500);
        });
    }

    // ============================================================
    // AUTO-SETUP: Add Contact ID (unencrypted) filter
    // ============================================================
    function addContactIdFilter(callback) {
        console.log('PS_HEARTBEAT: Adding Contact ID filter...');
        var existingField = document.querySelector('input[placeholder="Select field..."]');
        if (!existingField) {
            waitForText('button', 'Add Filter', 5000, function (addBtn) {
                if (addBtn) {
                    safeClick(addBtn);
                    console.log('PS_HEARTBEAT: Clicked Add Filter');
                    setTimeout(function () { selectContactIdField(callback); }, 1000);
                } else {
                    console.warn('PS_HEARTBEAT: Add Filter button not found');
                    callback(false);
                }
            });
        } else {
            selectContactIdField(callback);
        }
    }

    function selectContactIdField(callback) {
        var fieldInput = document.querySelector('input[placeholder="Select field..."]');
        if (!fieldInput) {
            console.log('PS_HEARTBEAT: Select field input not found. Filter may already be set.');
            callback(true);
            return;
        }
        fieldInput.focus();
        fieldInput.click();
        setReactInput(fieldInput, 'Contact ID');
        setTimeout(function () {
            fieldInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            setTimeout(function () {
                var options = document.querySelectorAll('[role="option"]');
                var target = null;
                options.forEach(function (opt) {
                    if (opt.textContent.trim().includes('Contact ID (unencrypted)')) target = opt;
                });
                if (target) {
                    console.log('PS_HEARTBEAT: Selecting Contact ID (unencrypted)');
                    safeClick(target);
                    setTimeout(function () { callback(true); }, 1000);
                } else {
                    console.warn('PS_HEARTBEAT: Contact ID option not found in dropdown');
                    callback(false);
                }
            }, 600);
        }, 500);
    }

    // ============================================================
    // FULL AUTO-SETUP SEQUENCE
    // ============================================================
    function autoSetup(callback) {
        console.log('PS_HEARTBEAT: === STARTING AUTO-SETUP ===');
        var selectValues = document.querySelector('input[placeholder="Select values..."]');
        if (selectValues) {
            console.log('PS_HEARTBEAT: Dashboard already loaded. Checking Contact ID filter...');
            var hasContactId = false;
            document.querySelectorAll('p, span').forEach(function (el) {
                if (el.textContent.trim() === 'Contact ID (unencrypted)') hasContactId = true;
            });
            if (hasContactId) {
                console.log('PS_HEARTBEAT: Contact ID filter already exists. Setup complete.');
                callback(true);
                return;
            }
            addContactIdFilter(callback);
            return;
        }
        waitForText('button', 'Create Dashboard', 5000, function (createBtn) {
            if (!createBtn) {
                console.log('PS_HEARTBEAT: No Create Dashboard button. Trying to add filter directly...');
                addContactIdFilter(callback);
                return;
            }
            console.log('PS_HEARTBEAT: Step 1 - Clicking Create Dashboard');
            safeClick(createBtn);
            setTimeout(function () {
                waitForText('button, [role="menuitem"], [role="option"], div, span', 'Start New', 5000, function (startNew) {
                    if (!startNew) { console.warn('PS_HEARTBEAT: Start New not found'); callback(false); return; }
                    console.log('PS_HEARTBEAT: Step 2 - Clicking Start New');
                    safeClick(startNew);
                    setTimeout(function () {
                        waitForText('div, span, label, button, p', 'Customer Service Contacts', 5000, function (csc) {
                            if (!csc) { console.warn('PS_HEARTBEAT: Customer Service Contacts not found'); callback(false); return; }
                            console.log('PS_HEARTBEAT: Step 3 - Selecting Customer Service Contacts');
                            safeClick(csc);
                            setTimeout(function () {
                                var createBtns = document.querySelectorAll('button');
                                var createFinal = null;
                                createBtns.forEach(function (b) {
                                    var t = b.textContent.trim();
                                    if (t === 'Create') createFinal = b;
                                });
                                if (!createFinal) { console.warn('PS_HEARTBEAT: Create button not found'); callback(false); return; }
                                console.log('PS_HEARTBEAT: Step 4 - Clicking Create');
                                safeClick(createFinal);
                                setTimeout(function () {
                                    setDateRange(function () {
                                        setTimeout(function () {
                                            selectCustomerExperience(function () {
                                                setTimeout(function () {
                                                    addContactIdFilter(function (success) {
                                                        console.log('PS_HEARTBEAT: === AUTO-SETUP COMPLETE ===');
                                                        callback(success);
                                                    });
                                                }, 1000);
                                            });
                                        }, 1000);
                                    });
                                }, 3000);
                            }, 1000);
                        });
                    }, 1000);
                });
            }, 1000);
        });
    }

    // ============================================================
    // MAIN SEARCH FUNCTION
    // ============================================================
    function executeSearch() {
        console.log('PS_HEARTBEAT: === EXECUTING SEARCH ===');

        var removeBtn = document.querySelector('button[aria-label="Remove Text Filter Value"]');
        if (removeBtn) {
            console.log('PS_HEARTBEAT: Removing existing filter chip');
            removeBtn.click();
        }

        setTimeout(function () {
            var allInputs = document.querySelectorAll('input[placeholder="Select values..."]');
            var input = allInputs[allInputs.length - 1];
            if (!input) {
                console.error('PS_HEARTBEAT: "Select values..." input not found');
                return;
            }

            navigator.clipboard.readText().then(function (clipText) {
                var searchValue = clipText.trim();
                if (!searchValue) {
                    console.error('PS_HEARTBEAT: Clipboard is empty');
                    return;
                }
                console.log('PS_HEARTBEAT: Clipboard value:', searchValue);

                input.focus();
                input.click();
                setReactInput(input, searchValue);

                setTimeout(function () {
                    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
                    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));

                    setTimeout(function () {
                        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

                        var waitForOptions = setInterval(function () {
                            var options = Array.from(document.querySelectorAll('[role="option"]'));
                            console.log('PS_HEARTBEAT: Polling for options... Found:', options.length);
                            if (options.length > 0) {
                                clearInterval(waitForOptions);
                                var target = options.find(function (el) {
                                    return el.textContent.trim().startsWith(searchValue);
                                });
                                if (target) {
                                    console.log('PS_HEARTBEAT: Clicking option:', target.getAttribute('aria-label') || target.textContent.trim().substring(0, 30));
                                    target.click();

                                    var waitForAddFilter = setInterval(function () {
                                        var freshInputs = document.querySelectorAll('input[placeholder="Select values..."]');
                                        var freshInput = freshInputs[freshInputs.length - 1];
                                        var freshFilterRow = freshInput ? freshInput.closest('.css-e7lkaq') : null;
                                        var filterBtn = freshFilterRow
                                            ? freshFilterRow.querySelector('button[data-testid="filterDrawerButtonTestSelector"]')
                                            : document.querySelector('button[data-testid="filterDrawerButtonTestSelector"]');
                                        if (filterBtn && filterBtn.textContent.trim() === 'Add Filter') {
                                            console.log('PS_HEARTBEAT: Clicking Add Filter');
                                            filterBtn.click();
                                            clearInterval(waitForAddFilter);
                                        }
                                    }, 100);
                                    setTimeout(function () { clearInterval(waitForAddFilter); }, 5000);
                                } else {
                                    console.warn('PS_HEARTBEAT: No matching option found for:', searchValue);
                                }
                            }
                        }, 100);
                        setTimeout(function () { clearInterval(waitForOptions); }, 7000);
                    }, 200);
                }, 150);

            }).catch(function (err) {
                console.error('PS_HEARTBEAT: Clipboard read failed:', err);
            });
        }, 500);
    }

    // ============================================================
    // TRIGGER ACTION
    // ============================================================
    function triggerAction() {
        if (isSetupComplete()) {
            console.log('PS_HEARTBEAT: Settings detected. Searching...');
            executeSearch();
        } else {
            console.log('PS_HEARTBEAT: Settings not detected. Running auto-setup...');
            autoSetup(function (success) {
                if (success) {
                    console.log('PS_HEARTBEAT: Auto-setup complete. Searching...');
                    setTimeout(function () { executeSearch(); }, 2000);
                } else {
                    console.error('PS_HEARTBEAT: Auto-setup failed. Please set up manually.');
                }
            });
        }
    }

    // ============================================================
    // INIT
    // ============================================================
    window.addEventListener('load', function () {
        // Automatically run the sequence on page load as all manual triggers were removed
        triggerAction();
    });

})();
