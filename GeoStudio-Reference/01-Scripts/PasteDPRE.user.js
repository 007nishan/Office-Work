// ==UserScript==
// @name         Paste DP RE Both
// @version      2.0
// @noframes
// @author       Attainment
// @namespace    AZ
// @match        https://na.geostudio.last-mile.amazon.dev/place*
// @match        https://eu.geostudio.last-mile.amazon.dev/place*
// @match        https://fe.geostudio.last-mile.amazon.dev/place*
// @grant        none
// @run-at       document-idle
// @description  Paste geocodes to DP/RE with BOAK-style UI
// ==/UserScript==

(function () {
  'use strict';

  if (window.geocodesPasteButtonsLoaded) {
    console.log("Geocodes paste buttons already loaded, skipping...");
    return;
  }
  window.geocodesPasteButtonsLoaded = true;

  let buttonPanel = null;

  /* ---------- helpers ---------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Set native value so React picks it up
  function setNativeValue(el, value) {
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

  // Try to find input by id(s) or by nearby label text
  async function findInput({ ids = [], labelRegex = null, timeout = 5000 } = {}) {
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

      await sleep(200);
    }
    return null;
  }

  async function readClipboardOrPrompt() {
    try {
      const txt = await navigator.clipboard.readText();
      return (txt && txt.trim()) ? txt.trim() : null;
    } catch (e) {
      return prompt('Paste geocode(s) here (format: "lat,lng" or two pairs separated by newline):');
    }
  }

  function extractLatLngPairs(text) {
    if (!text) return [];
    const re = /-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?/g;
    const matches = text.match(re);
    return matches ? matches.map(s => s.trim()) : [];
  }

  function isEditPanelOpen() {
    const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
    const editPanelVisible = editPanel && window.getComputedStyle(editPanel).display !== 'none';
    return editPanelVisible;
  }

  // Update panel position
  function updatePanelPosition() {
    if (!buttonPanel) return;
    const panelOpen = isEditPanelOpen();
    const rightPosition = panelOpen ? '320px' : '8px';
    buttonPanel.style.right = rightPosition;
  }

  function makeButton(label, title, action, bgColor = '#fff') {
    const container = document.createElement('div');
    container.style.position = 'relative';

    const btn = document.createElement('button');
    btn.textContent = label;
    btn.title = title;
    Object.assign(btn.style, {
      width: '48px',
      height: '24px',
      backgroundColor: bgColor,
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
      btn.style.backgroundColor = bgColor;
    });

    btn.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      ev.preventDefault();

      const clipboardText = await readClipboardOrPrompt();
      if (!clipboardText) {
        console.warn('No clipboard/text provided.');
        return;
      }

      const pairs = extractLatLngPairs(clipboardText);

      const dpInput = await findInput({
        ids: ['#input-dp-geocode', 'input[id*="dp"]', 'input.css-1k4cgj4'],
        labelRegex: /Delivery\s*Point|DP/i,
        timeout: 3000
      });

      const reInput = await findInput({
        ids: ['#input-re-geocode', 'input[id*="re"]', 'input.css-1k4cgj4'],
        labelRegex: /Road\s*Entry\s*Point|RE/i,
        timeout: 3000
      });

      if (!dpInput && !reInput) {
        console.error('DP and RE inputs not found.');
        alert('DP/RE inputs not found on this page. Check console for details.');
        return;
      }

      try {
        if (action === 'dp') {
          const value = (pairs.length ? pairs[0] : clipboardText).trim();
          if (!dpInput) { alert('DP input not found'); return; }
          setNativeValue(dpInput, value);
          dpInput.focus();
          dpInput.blur();
        } else if (action === 're') {
          const value = (pairs.length ? pairs[0] : clipboardText).trim();
          if (!reInput) { alert('RE input not found'); return; }
          setNativeValue(reInput, value);
          reInput.focus();
          reInput.blur();
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

          if (dpInput) { setNativeValue(dpInput, dpVal); dpInput.focus(); dpInput.blur(); }
          if (reInput) { setNativeValue(reInput, reVal); reInput.focus(); reInput.blur(); }
        }
      } catch (err) {
        console.error('Error while writing values to inputs:', err);
        alert('Failed to paste into DP/RE — see console for details.');
      }
    });

    container.appendChild(btn);
    return container;
  }

  function createButtonPanel() {
    if (document.getElementById('geocodesPastePanel')) {
      console.log("Geocodes paste panel already exists");
      return;
    }

    buttonPanel = document.createElement('div');
    buttonPanel.id = 'geocodesPastePanel';
    Object.assign(buttonPanel.style, {
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

    buttonPanel.appendChild(makeButton('PDP', 'Paste Delivery Point', 'dp', '#fff'));
    buttonPanel.appendChild(makeButton('PRE', 'Paste Road Entry', 're', '#fff'));
    buttonPanel.appendChild(makeButton('PBoth', 'Paste Both DP & RE', 'both', '#fff'));

    document.body.appendChild(buttonPanel);

    const observer = new MutationObserver(function() {
      updatePanelPosition();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    setTimeout(updatePanelPosition, 500);

    console.log("Geocodes paste panel created successfully");
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createButtonPanel);
    } else {
      createButtonPanel();
    }
  }

  init();

})();
