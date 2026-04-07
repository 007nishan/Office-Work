// ==UserScript==
// @name         PS_HEARTBEAT
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Auto-setup, CommID search, dropdown hide+blur, feedback expand via SVG MouseEvent, global auto-copy, Left Ctrl trigger
// @author       Nishan [nishanrh] Nishanur Rahman
// @match        https://heartbeat.cs.amazon.dev/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  var btn;

  // ============================================================
  // MODULE A: GLOBAL AUTO-COPY (ALWAYS-ON)
  // ============================================================
  function enableGlobalAutoCopy() {
    if (window._globalCopyHandler) {
      document.removeEventListener('mouseup', window._globalCopyHandler);
    }
    window._globalCopyHandler = function () {
      setTimeout(function () {
        var sel = window.getSelection();
        var text = sel.toString().trim();
        if (text.length > 2) {
          var stripped = text.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
          if (stripped.length > 0) {
            navigator.clipboard.writeText(stripped).then(function () {
              console.log('PS_HEARTBEAT [AUTO-COPY]:', stripped.substring(0, 80));
            }).catch(function () {
              var ta = document.createElement('textarea');
              ta.value = stripped;
              ta.style.position = 'fixed';
              ta.style.left = '-9999px';
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              console.log('PS_HEARTBEAT [AUTO-COPY FALLBACK]:', stripped.substring(0, 80));
            });
          }
        }
      }, 50);
    };
    document.addEventListener('mouseup', window._globalCopyHandler);
    console.log('PS_HEARTBEAT: Module A — Global auto-copy ACTIVE');
  }

  // ============================================================
  // MODULE B: DROPDOWN HIDE + INPUT BLUR
  // Polls every 100ms — hides listbox and blurs input to
  // release aria-expanded focus lock blocking mouse interaction
  // ============================================================
  function hideDropdownPolling() {
    console.log('PS_HEARTBEAT: Module B — Dropdown hide+blur ACTIVE');
    var attempts = 0;
    var done = false;
    var interval = setInterval(function () {
      attempts++;
      var lb = document.querySelector('[role="listbox"]');
      var ss = document.querySelector('div.search-suggestions');
      var input = document.querySelector('input[placeholder="Select values..."]');
      if (lb || ss) {
        if (lb) lb.style.cssText += '; display:none !important; visibility:hidden !important;';
        if (ss) ss.style.cssText += '; display:none !important; visibility:hidden !important;';
        if (input) input.blur();
        if (!done) {
          done = true;
          console.log('PS_HEARTBEAT [DISMISS]: Hidden + blurred at attempt', attempts);
        }
      }
      if (attempts >= 150) {
        clearInterval(interval);
        console.log('PS_HEARTBEAT [DISMISS]: Polling stopped');
      }
    }, 100);
  }

  // ============================================================
  // MODULE C: FEEDBACK MESSAGE EXPAND
  // Finds expand SVG by path signature M2.004 16.593
  // SVGElement has no .click() — dispatches MouseEvent instead
  // Polls every 300ms until SVG appears with non-zero dimensions
  // ============================================================
  function expandFeedbackMessage() {
    console.log('PS_HEARTBEAT: Module C — SVG expand polling ACTIVE');
    var attempts = 0;
    var expanded = false;
    var interval = setInterval(function () {
      attempts++;
      var allSvgs = document.querySelectorAll('svg');
      for (var i = 0; i < allSvgs.length; i++) {
        var path = allSvgs[i].querySelector('path');
        if (path && path.getAttribute('d') &&
            path.getAttribute('d').indexOf('M2.004 16.593') !== -1) {
          var rect = allSvgs[i].getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            expanded = true;
            clearInterval(interval);
            allSvgs[i].dispatchEvent(new MouseEvent('click', {
              bubbles: true, cancelable: true, view: window
            }));
            console.log('PS_HEARTBEAT [EXPAND]: SVG clicked at attempt', attempts);
            return;
          }
        }
      }
      if (attempts % 20 === 0) {
        console.log('PS_HEARTBEAT [EXPAND]: Waiting... attempt', attempts);
      }
      if (attempts >= 200) {
        clearInterval(interval);
        console.log('PS_HEARTBEAT [EXPAND]: Timed out');
      }
    }, 300);
  }

  // ============================================================
  // UTILITIES
  // ============================================================
  function waitForText(selector, text, timeout, callback) {
    var elapsed = 0;
    var interval = setInterval(function () {
      var els = document.querySelectorAll(selector);
      var found = null;
      els.forEach(function (el) {
        if (el.textContent.trim().includes(text)) found = el;
      });
      elapsed += 150;
      if (found) { clearInterval(interval); callback(found); }
      else if (elapsed >= timeout) {
        clearInterval(interval);
        console.warn('PS_HEARTBEAT: Timeout waiting for text:', text);
        callback(null);
      }
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
  // AUTO-SETUP: Date Range
  // ============================================================
  function setDateRange(callback) {
    console.log('PS_HEARTBEAT: Setting date range...');
    var divs = document.querySelectorAll('div.css-1c02o5u');
    var dateDiv = null;
    divs.forEach(function (d) {
      if (d.textContent.trim().match(/\d{4}/) && d.querySelector('p.css-mn4iko')) dateDiv = d;
    });
    if (!dateDiv) { console.warn('PS_HEARTBEAT: Date div not found'); callback(); return; }
    dateDiv.click();
    setTimeout(function () {
      var startDateInput = document.querySelector('input[placeholder="Starting Date"]');
      if (!startDateInput) { console.warn('PS_HEARTBEAT: Starting Date not found'); callback(); return; }
      fullClick(startDateInput);
      setTimeout(function () {
        var presetBtns = document.querySelectorAll('button.css-1ht4088');
        var target = null;
        presetBtns.forEach(function (b) {
          if (b.textContent.trim() === 'Last 13 months (max)') target = b;
        });
        if (target) { safeClick(target); setTimeout(callback, 1000); }
        else { console.warn('PS_HEARTBEAT: Preset not found'); callback(); }
      }, 800);
    }, 600);
  }

  function selectCustomerExperience(callback) {
    waitForText('button, [role="tab"], div.tab2', 'Customer Experience', 8000, function (ceTab) {
      if (ceTab) safeClick(ceTab);
      else console.warn('PS_HEARTBEAT: Customer Experience tab not found');
      setTimeout(callback, 1500);
    });
  }

  function addContactIdFilter(callback) {
    var existingField = document.querySelector('input[placeholder="Select field..."]');
    if (!existingField) {
      waitForText('button', 'Add Filter', 5000, function (addBtn) {
        if (addBtn) { safeClick(addBtn); setTimeout(function () { selectContactIdField(callback); }, 1000); }
        else { console.warn('PS_HEARTBEAT: Add Filter not found'); callback(false); }
      });
    } else { selectContactIdField(callback); }
  }

  function selectContactIdField(callback) {
    var fieldInput = document.querySelector('input[placeholder="Select field..."]');
    if (!fieldInput) { callback(true); return; }
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
        if (target) { safeClick(target); setTimeout(function () { callback(true); }, 1000); }
        else { console.warn('PS_HEARTBEAT: Contact ID option not found'); callback(false); }
      }, 600);
    }, 500);
  }

  function autoSetup(callback) {
    console.log('PS_HEARTBEAT: === STARTING AUTO-SETUP ===');
    var selectValues = document.querySelector('input[placeholder="Select values..."]');
    if (selectValues) {
      var hasContactId = false;
      document.querySelectorAll('p, span').forEach(function (el) {
        if (el.textContent.trim() === 'Contact ID (unencrypted)') hasContactId = true;
      });
      if (hasContactId) { console.log('PS_HEARTBEAT: Setup complete.'); callback(true); return; }
      addContactIdFilter(callback);
      return;
    }
    waitForText('button', 'Create Dashboard', 5000, function (createBtn) {
      if (!createBtn) { addContactIdFilter(callback); return; }
      safeClick(createBtn);
      setTimeout(function () {
        waitForText('button, [role="menuitem"], [role="option"], div, span', 'Start New', 5000, function (startNew) {
          if (!startNew) { callback(false); return; }
          safeClick(startNew);
          setTimeout(function () {
            waitForText('div, span, label, button, p', 'Customer Service Contacts', 5000, function (csc) {
              if (!csc) { callback(false); return; }
              safeClick(csc);
              setTimeout(function () {
                var createFinal = null;
                document.querySelectorAll('button').forEach(function (b) {
                  if (b.textContent.trim() === 'Create') createFinal = b;
                });
                if (!createFinal) { callback(false); return; }
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
  // No option clicking — CommID not in dropdown suggestions.
  // Type value + Enter is sufficient for search to complete.
  // Wait for Add Filter button then fire B and C exactly once.
  // ============================================================
  function executeSearch() {
    console.log('PS_HEARTBEAT: === EXECUTING SEARCH ===');
    var removeBtn = document.querySelector('button[aria-label="Remove Text Filter Value"]');
    if (removeBtn) { removeBtn.click(); }

    setTimeout(function () {
      var allInputs = document.querySelectorAll('input[placeholder="Select values..."]');
      var input = allInputs[allInputs.length - 1];
      if (!input) { console.error('PS_HEARTBEAT: Select values input not found'); return; }

      navigator.clipboard.readText().then(function (clipText) {
        var searchValue = clipText.trim();
        if (!searchValue) { console.error('PS_HEARTBEAT: Clipboard empty'); return; }
        console.log('PS_HEARTBEAT: Searching for:', searchValue);

        input.focus();
        input.click();
        setReactInput(input, searchValue);

        setTimeout(function () {
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
          input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
          console.log('PS_HEARTBEAT: Enter dispatched — waiting for Add Filter');

          // Fire B and C exactly once after Add Filter appears
          var bcFired = false;
          var waitForAddFilter = setInterval(function () {
            var allFilterBtns = Array.from(document.querySelectorAll(
              'button[data-testid="filterDrawerButtonTestSelector"]'
            ));
            var filterBtn = allFilterBtns.find(function (b) {
              return b.textContent.trim() === 'Add Filter';
            });
            if (filterBtn && !bcFired) {
              bcFired = true;
              clearInterval(waitForAddFilter);
              console.log('PS_HEARTBEAT: Add Filter clicked — firing B and C');
              hideDropdownPolling();
              expandFeedbackMessage();
            }
          }, 100);
          setTimeout(function () {
            clearInterval(waitForAddFilter);
            if (!bcFired) {
              bcFired = true;
              console.warn('PS_HEARTBEAT: Add Filter not found — firing B and C anyway');
              hideDropdownPolling();
              expandFeedbackMessage();
            }
          }, 5000);

        }, 150);
      }).catch(function (err) {
        console.error('PS_HEARTBEAT: Clipboard read failed:', err);
      });
    }, 500);
  }

  // ============================================================
  // TRIGGER
  // ============================================================
  function triggerAction() {
    if (isSetupComplete()) {
      console.log('PS_HEARTBEAT: Setup detected — searching...');
      executeSearch();
    } else {
      console.log('PS_HEARTBEAT: Running auto-setup...');
      autoSetup(function (success) {
        if (success) { setTimeout(executeSearch, 2000); }
        else { console.error('PS_HEARTBEAT: Auto-setup failed.'); }
      });
    }
  }

  // ============================================================
  // BUTTON
  // ============================================================
  function createButton() {
    if (document.getElementById('ps-heartbeat-btn-v31')) return;
    btn = document.createElement('button');
    btn.id = 'ps-heartbeat-btn-v31';
    btn.textContent = 'Transcript';
    btn.setAttribute('style',
      'position:fixed;z-index:9999;padding:6px 16px;background-color:#00688D;' +
      'color:#FFFFFF;border:none;border-radius:4px;font-family:"Amazon Ember",Arial,sans-serif;' +
      'font-size:14px;font-weight:400;cursor:pointer;letter-spacing:0.3px;' +
      'box-shadow:0 2px 6px rgba(0,0,0,0.2);transition:background-color 0.15s ease;user-select:none;');
    var savedLeft = localStorage.getItem('ps_heartbeat_left_v31');
    var savedTop = localStorage.getItem('ps_heartbeat_top_v31');
    if (savedLeft && savedTop) { btn.style.left = savedLeft; btn.style.top = savedTop; }
    else { btn.style.right = '2%'; btn.style.top = '3%'; }
    btn.addEventListener('mouseenter', function () { btn.style.backgroundColor = '#004F6D'; });
    btn.addEventListener('mouseleave', function () { btn.style.backgroundColor = '#00688D'; });
    btn.addEventListener('click', function (e) { if (e._psDragIgnore) return; triggerAction(); });
    var isDragging = false, hasMoved = false, offsetX = 0, offsetY = 0;
    btn.addEventListener('mousedown', function (e) {
      isDragging = true; hasMoved = false;
      offsetX = e.clientX - btn.getBoundingClientRect().left;
      offsetY = e.clientY - btn.getBoundingClientRect().top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      hasMoved = true;
      btn.style.left = (e.clientX - offsetX) + 'px';
      btn.style.top = (e.clientY - offsetY) + 'px';
      btn.style.right = 'auto';
    });
    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      if (hasMoved) {
        localStorage.setItem('ps_heartbeat_left_v31', btn.style.left);
        localStorage.setItem('ps_heartbeat_top_v31', btn.style.top);
        btn.addEventListener('click', function suppress(ev) {
          ev._psDragIgnore = true;
          btn.removeEventListener('click', suppress);
        }, { once: true });
      }
    });
    document.body.appendChild(btn);
    console.log('PS_HEARTBEAT v3.2: Button injected');
  }

  // ============================================================
  // LEFT CTRL TRIGGER
  // ============================================================
  function setupCtrlTrigger() {
    var ctrlPressed = false;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Control' && e.location === 1 && !ctrlPressed) {
        ctrlPressed = true;
        console.log('PS_HEARTBEAT: Left Ctrl triggered');
        triggerAction();
      }
    });
    document.addEventListener('keyup', function (e) {
      if (e.key === 'Control' && e.location === 1) ctrlPressed = false;
    });
    console.log('PS_HEARTBEAT: Left Ctrl trigger enabled');
  }

  // ============================================================
  // INIT
  // ============================================================
  window.addEventListener('load', function () {
    enableGlobalAutoCopy();
    createButton();
    setupCtrlTrigger();
    setInterval(function () {
      if (!document.getElementById('ps-heartbeat-btn-v31')) {
        setTimeout(createButton, 300);
      }
    }, 1000);
    var channel = new BroadcastChannel('ps_heartbeat_channel');
    channel.onmessage = function (e) {
      if (e.data && e.data.trigger) {
        if (btn) btn.click();
        else console.warn('PS_HEARTBEAT: btn not ready');
      }
    };
  });

})();
