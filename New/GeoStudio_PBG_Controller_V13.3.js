// ==UserScript==
// @name         GeoStudio PBG Controller V13.3 (Complete)
// @namespace    http://tampermonkey.net/
// @version      13.3
// @description  Translucent Case Data Panel + Heartbeat + Full GAM DP Triage + UPID + Submit Protection
// @author       nishanrh
// @match        https://na.geostudio.last-mile.amazon.dev/*
// @match        https://eu.geostudio.last-mile.amazon.dev/*
// @match        https://fe.geostudio.last-mile.amazon.dev/*
// @match        https://na.templates.geostudio.last-mile.amazon.dev/*
// @match        https://eu.templates.geostudio.last-mile.amazon.dev/*
// @match        https://fe.templates.geostudio.last-mile.amazon.dev/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const IS_IFRAME = window.self !== window.top;
  const IS_MAIN   = !IS_IFRAME;

  // ═══════════════════════════════════════════════════════════
  // SECTION 1 — SHARED UTILITIES
  // ═══════════════════════════════════════════════════════════

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function waitFor(selectorOrFn, timeout = 10000, interval = 200) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const el = typeof selectorOrFn === 'function'
          ? selectorOrFn()
          : document.querySelector(selectorOrFn);
        if (el) return el;
      } catch (e) {}
      await delay(interval);
    }
    return null;
  }


  // ═══════════════════════════════════════════════════════════
  // SECTION 2 — MAIN PAGE: CASE DATA PANEL
  // ═══════════════════════════════════════════════════════════
  if (IS_MAIN) {

    let casePanel       = null;
    let isPanelVisible  = true;
    let panelPosition   = JSON.parse(localStorage.getItem('pbg_panel_position_v13')) || { top: '57px', right: '8px' };
    let currentTrackingId = null;
    let heartbeatWindow   = null;
    // const heartbeatChannel removed for cross-domain

    // ── Styles ──────────────────────────────────────────────
    const style = document.createElement('style');
    style.innerHTML = `
      #pbg_case_panel {
        position: fixed; display: flex; flex-direction: column;
        background-color: rgba(255,255,255,0.5); border: 1px solid #ccc;
        border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        backdrop-filter: blur(6px); z-index: 99999; padding: 0;
        font-family: 'Amazon Ember', Arial, sans-serif; font-size: 12px;
        user-select: none; transition: all 0.3s ease; min-width: 200px;
      }
      #pbg_case_panel.hidden { display: none !important; }
      .pbg-topbar {
        background-color: rgba(255,255,255,0.5); backdrop-filter: blur(6px);
        color: #000; padding: 8px 12px; border-radius: 12px 12px 0 0;
        border-bottom: 1px solid #ccc; cursor: pointer;
        display: flex; justify-content: space-between; align-items: center;
        font-weight: bold; font-size: 11px; transition: background-color 0.2s;
      }
      .pbg-topbar:hover { background-color: rgba(255,255,0,0.3); }
      .pbg-close-btn {
        background: none; border: none; color: #000; font-size: 18px;
        cursor: pointer; padding: 0; width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 4px; transition: background-color 0.2s; font-weight: bold;
      }
      .pbg-close-btn:hover { background-color: rgba(0,0,0,0.1); }
      .pbg-body { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
      .pbg-row  { display: flex; align-items: center; gap: 8px; }
      .pbg-label { font-weight: bold; color: #000; min-width: 80px; font-size: 11px; }
      .pbg-value {
        color: #000; background: #fff; padding: 4px 8px; border-radius: 4px;
        border: 1px solid #ccc; cursor: pointer; font-size: 11px;
        transition: background-color 0.2s;
      }
      .pbg-value:hover { background-color: #ffff00; }
      .tracking-highlight {
        background-color: yellow !important; color: black !important;
        padding: 1px 2px; border-radius: 2px;
      }
    `;
    document.head.appendChild(style);

    // ── Panel creation ───────────────────────────────────────
    function createCasePanel() {
      if (casePanel) return casePanel;
      casePanel = document.createElement('div');
      casePanel.id = 'pbg_case_panel';
      casePanel.style.top   = panelPosition.top;
      casePanel.style.right = panelPosition.right;
      casePanel.style.left  = panelPosition.left || 'auto';
      casePanel.innerHTML = `
        <div class="pbg-topbar" id="pbg_topbar">
          <span id="pbg_tracking_title" style="cursor:pointer;">-</span>
          <button class="pbg-close-btn" id="pbg_close_btn">×</button>
        </div>
        <div class="pbg-body">
          <div class="pbg-row"><span class="pbg-label">CID_1:</span><span class="pbg-value" id="pbg_cid1">-</span></div>
          <div class="pbg-row"><span class="pbg-label">CID_2:</span><span class="pbg-value" id="pbg_cid2">-</span></div>
          <div class="pbg-row"><span class="pbg-label">AID:</span><span class="pbg-value" id="pbg_aid">-</span></div>
          <div class="pbg-row"><span class="pbg-label">Defect Type:</span><span class="pbg-value" id="pbg_defect">-</span></div>
        </div>`;
      document.body.appendChild(casePanel);

      // Drag
      let isDragging = false, offsetX = 0, offsetY = 0;
      const topbar = document.getElementById('pbg_topbar');
      topbar.addEventListener('mousedown', (e) => {
        if (e.target.id === 'pbg_close_btn' || e.target.id === 'pbg_tracking_title') return;
        isDragging = true;
        offsetX = e.clientX - casePanel.offsetLeft;
        offsetY = e.clientY - casePanel.offsetTop;
      });
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        casePanel.style.left  = (e.clientX - offsetX) + 'px';
        casePanel.style.top   = (e.clientY - offsetY) + 'px';
        casePanel.style.right = 'auto';
      });
      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          panelPosition = { top: casePanel.style.top, left: casePanel.style.left, right: casePanel.style.right };
          localStorage.setItem('pbg_panel_position_v13', JSON.stringify(panelPosition));
        }
      });

      // Close
      document.getElementById('pbg_close_btn').addEventListener('click', (e) => {
        e.stopPropagation();
        casePanel.classList.add('hidden');
        isPanelVisible = false;
      });

      // Copy clicks
      document.getElementById('pbg_aid').addEventListener('click',    function () { copyToClipboard(this.textContent); });
      document.getElementById('pbg_defect').addEventListener('click', function () { copyToClipboard(this.textContent); });

      // CID → Heartbeat
      document.getElementById('pbg_cid1').addEventListener('click', function () {
        if (this.textContent && this.textContent !== '-' && this.textContent !== 'N/A')
          openHeartbeatAndClickTranscript(this.textContent);
      });
      document.getElementById('pbg_cid2').addEventListener('click', function () {
        if (this.textContent && this.textContent !== '-' && this.textContent !== 'N/A')
          openHeartbeatAndClickTranscript(this.textContent);
      });

      // Tracking ID → Past Deliveries
      document.getElementById('pbg_tracking_title').addEventListener('click', () => {
        if (currentTrackingId && currentTrackingId !== '-')
          openPastDeliveriesAndSearch(currentTrackingId);
      });

      return casePanel;
    }

    function copyToClipboard(text) {
      if (!text || text === '-' || text === 'N/A') return;
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    function openHeartbeatAndClickTranscript(cidValue) {
      copyToClipboard(cidValue);
      const url = 'https://heartbeat.cs.amazon.dev/#/';
      if (!heartbeatWindow || heartbeatWindow.closed) {
        heartbeatWindow = window.open(url, 'HeartbeatWindow');
        setTimeout(() => heartbeatChannel.postMessage({ trigger: true, cidValue }), 3000);
      } else {
        heartbeatWindow.focus();
        heartbeatChannel.postMessage({ trigger: true, cidValue });
      }
    }

    // Left Shift toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Shift' && e.location === 1) {
        if (!casePanel) createCasePanel();
        isPanelVisible = !isPanelVisible;
        casePanel.classList.toggle('hidden', !isPanelVisible);
      }
    });

    // ── Case extraction & panel update ──────────────────────

    // Reads the Address ID from the page header (always visible, no drawer needed)
    function getAddressIdFromPage() {
      try {
        // Primary: XPath on "Address ID:" label → sibling link → p
        const el = document.evaluate(
          "//p[text()='Address ID:']/following-sibling::a/p",
          document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
        ).singleNodeValue;
        if (el) return el.textContent.trim();
      } catch (e) {}
      // Fallback: label scan
      try {
        const label = Array.from(document.querySelectorAll('p')).find(p => p.textContent.trim() === 'Address ID:');
        return label?.nextElementSibling?.querySelector('p')?.textContent.trim() || null;
      } catch (e) {}
      return null;
    }

    // Opens the case details drawer, scrapes all fields, closes it — mirrors V12.0 DOMExtractor
    async function extractCaseDetailsFromDrawer() {
      const DRAWER_BTN_SELECTOR = 'button[mdn-popover-offset="-12"][aria-controls="task"]';
      const ITEM_SELECTOR       = '.css-wncc9b';
      const KEY_SELECTOR        = '.css-1wmy4xi';
      const VAL_SELECTOR        = '.css-189kjnx';
      const FIELDS = [
        'TrackingId', 'TRACKING_ID', 'ComId1', 'orderingorderid1',
        'ComId2', 'orderingorderid2', 'Defecttype', 'DefectType',
        'defecttype', 'CountofContacts', 'DefectRate', 'pbgEnabled',
        'TaskTemplateId', 'Queue Name', 'ProcessedInRDR',
      ];

      try {
        const btn = document.querySelector(DRAWER_BTN_SELECTOR);
        if (!btn) return null;

        btn.click();
        await delay(1000); // wait for drawer to open

        const details = {};
        document.querySelectorAll(ITEM_SELECTOR).forEach(item => {
          const key = item.querySelector(KEY_SELECTOR)?.textContent.trim();
          const val = item.querySelector(VAL_SELECTOR)?.textContent.trim();
          if (key && val) details[key] = val;
        });

        btn.click(); // close drawer
        return details;
      } catch (e) {
        return null;
      }
    }

    function updateCasePanel(details) {
      if (!casePanel) createCasePanel();
      // TrackingId — try both casings
      currentTrackingId = details['TrackingId'] || details['TRACKING_ID'] || '-';
      // DefectType — try all casings
      const defect = details['Defecttype'] || details['DefectType'] || details['defecttype'] || '-';
      // Address ID comes from getAddressIdFromPage(), not the drawer
      const aid = getAddressIdFromPage() || '-';

      document.getElementById('pbg_tracking_title').textContent = currentTrackingId;
      document.getElementById('pbg_aid').textContent    = aid;
      document.getElementById('pbg_defect').textContent = defect;
      document.getElementById('pbg_cid1').textContent   = details['ComId1'] || '-';
      document.getElementById('pbg_cid2').textContent   = details['ComId2'] || '-';
    }

    // ── Past Deliveries ──────────────────────────────────────
    function isPastDeliveriesOpen() {
      for (const acc of document.querySelectorAll('.MuiAccordion-root')) {
        const p = acc.querySelector('p.css-1oqpb4x');
        if (p && p.textContent.trim() === 'Past deliveries') return acc.classList.contains('Mui-expanded');
      }
      return false;
    }

    async function openPastDeliveriesAndSearch(trackingId) {
      if (!trackingId || trackingId === '-') return;
      if (!isPastDeliveriesOpen()) {
        const btn = Array.from(document.querySelectorAll('p.css-1oqpb4x'))
          .find(el => el.textContent.trim() === 'Past deliveries');
        if (btn) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          btn.click();
          await delay(1500);
          await configurePastDeliveriesFilters();
          await delay(2000);
        }
      }
      const matchCount = highlightAllMatchesOptimized(trackingId);
      if (matchCount > 0) {
        setTimeout(() => {
          const first = document.querySelector('.tracking-highlight');
          if (first) {
            const btn = findNearestCameraButton(first);
            if (btn) btn.click();
            first.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      } else {
        showNotification('No matching TID found in Past Deliveries');
      }
    }

    async function configurePastDeliveriesFilters() {
      for (const dropdown of document.querySelectorAll('div[role="combobox"]')) {
        const text = dropdown.textContent;
        if (text.includes('Attribute')) {
          dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
          await delay(200);
          const opt = Array.from(document.querySelectorAll('[role="option"], li')).find(o => o.textContent.trim() === 'Count');
          if (opt) opt.click();
          await delay(200);
        }
        if (text.includes('Recent 10')) {
          dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
          await delay(200);
          const opt = Array.from(document.querySelectorAll('[role="option"], li')).find(o => o.textContent.trim() === 'All');
          if (opt) opt.click();
          await delay(200);
        }
      }
    }

    function showNotification(message) {
      const n = document.createElement('div');
      n.textContent = message;
      Object.assign(n.style, {
        position: 'fixed', top: '20px', right: '20px',
        backgroundColor: 'rgba(0,0,0,0.85)', color: '#fff',
        padding: '12px 20px', borderRadius: '8px', zIndex: '100000',
        fontFamily: 'Amazon Ember, Arial, sans-serif', fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      });
      document.body.appendChild(n);
      setTimeout(() => n.remove(), 3000);
    }

    function highlightAllMatchesOptimized(text) {
      if (!text || text === '-') return 0;
      document.querySelectorAll('.tracking-highlight').forEach(el => el.replaceWith(document.createTextNode(el.textContent)));
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
          if (node.parentElement?.closest('#pbg_case_panel')) return NodeFilter.FILTER_REJECT;
          return node.nodeValue?.includes(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      let node, count = 0;
      while ((node = walker.nextNode())) {
        const parts = node.nodeValue.split(text);
        const frag  = document.createDocumentFragment();
        parts.forEach((part, i) => {
          frag.appendChild(document.createTextNode(part));
          if (i < parts.length - 1) {
            const span = document.createElement('span');
            span.className   = 'tracking-highlight';
            span.textContent = text;
            frag.appendChild(span);
            count++;
          }
        });
        node.replaceWith(frag);
      }
      return count;
    }

    function findNearestCameraButton(highlightEl) {
      const hr = highlightEl.getBoundingClientRect();
      let nearestBtn = null, nearestDist = Infinity;
      document.querySelectorAll('button[aria-label="View photo"]').forEach(btn => {
        const r = btn.getBoundingClientRect();
        const d = Math.sqrt((r.left - hr.left) ** 2 + (r.top - hr.top) ** 2);
        if (d < nearestDist) { nearestDist = d; nearestBtn = btn; }
      });
      return nearestBtn;
    }

    // ── Case monitor (rAF loop) ──────────────────────────────
    // Uses getAddressIdFromPage() — always visible in the DOM, no drawer needed.
    // When a new address is detected, opens the drawer to extract all fields,
    // then updates the panel. Mirrors V12.0 CaseDetailsManager flow.
    let lastAddressId  = null;
    let lastCheckTime  = 0;
    let isExtracting   = false;

    function monitorCases() {
      const now = Date.now();
      if (now - lastCheckTime >= 500) {
        lastCheckTime = now;
        const aid = getAddressIdFromPage();
        if (aid && aid !== lastAddressId && !isExtracting) {
          lastAddressId = aid;
          isExtracting  = true;
          extractCaseDetailsFromDrawer().then(details => {
            if (details) updateCasePanel(details);
            isExtracting = false;
          }).catch(() => { isExtracting = false; });
        }
      }
      requestAnimationFrame(monitorCases);
    }

    // ── Submit button protection (receives msg from iframe) ──
    let _transferRequired = false, _transferReason = '', _submitStyle = null;

    function _getSubmitBtn() {
      return document.querySelector('#submit-btn') || document.querySelector('button[aria-controls="submit"]');
    }

    function _handleTransferRequiredState(required, reason) {
      const newReason = reason || _transferReason || 'Select a transfer task before submitting';
      _transferRequired = required;
      if (required) _transferReason = newReason;
      const btn = _getSubmitBtn();
      if (!btn) return;
      if (required) {
        if (!_submitStyle) {
          _submitStyle = { opacity: btn.style.opacity, cursor: btn.style.cursor, pointerEvents: btn.style.pointerEvents, title: btn.title };
        }
        btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed'; btn.style.pointerEvents = 'none';
        btn.title = newReason;
        if (!document.getElementById('pbg-submit-warning')) {
          const w = document.createElement('div');
          w.id = 'pbg-submit-warning';
          w.style.cssText = 'position:fixed;top:20px;right:20px;background:#d32f2f;color:#fff;padding:16px;border-radius:8px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 5px 15px rgba(0,0,0,0.15);max-width:380px;line-height:1.5;display:flex;align-items:flex-start;gap:12px;border-left:5px solid #b71c1c;';
          w.innerHTML = `<div style="flex-shrink:0;margin-top:2px;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div style="flex-grow:1;"><div style="font-size:16px;font-weight:700;margin-bottom:4px;">Transfer Required</div><div id="pbg-submit-warning-msg" style="font-size:13px;font-weight:400;opacity:0.95;">${newReason}</div></div>`;
          document.body.appendChild(w);
        } else {
          const msgEl = document.getElementById('pbg-submit-warning-msg');
          if (msgEl && newReason !== _transferReason) msgEl.textContent = newReason;
        }
      } else {
        _transferReason = '';
        if (_submitStyle) {
          btn.style.opacity = _submitStyle.opacity || '';
          btn.style.cursor  = _submitStyle.cursor  || '';
          btn.style.pointerEvents = _submitStyle.pointerEvents || '';
          btn.title = _submitStyle.title || '';
          _submitStyle = null;
        }
        document.getElementById('pbg-submit-warning')?.remove();
      }
    }

    setInterval(() => { if (_transferRequired) _handleTransferRequiredState(true, _transferReason); }, 1000);

    // ── DP Geocode broadcasting to iframes ───────────────────
    let _currentAddressId = null, _currentDPGeocode = null;

    function _parseCoords(value) {
      if (!value || !value.includes(',')) return null;
      try {
        const [lat, lon] = value.split(',').map(c => parseFloat(c.trim()));
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180 || (lat === 0 && lon === 0)) return null;
        return { lat, lon, original: value.trim() };
      } catch { return null; }
    }

    function _broadcastDPToIframes(coords) {
      document.querySelectorAll('iframe').forEach(iframe => {
        try { iframe.contentWindow.postMessage({ type: 'GEOSTUDIO_DP_GEOCODE', data: coords }, '*'); } catch (e) {}
      });
    }

    function _captureInitialDPGeocode(addressId) {
      if (!addressId) return;
      const dpEl = document.querySelector('input#input-dp-geocode');
      if (!dpEl || !dpEl.value) { setTimeout(() => _captureInitialDPGeocode(addressId), 1000); return; }
      const coords = _parseCoords(dpEl.value);
      if (coords) { _currentDPGeocode = coords; _broadcastDPToIframes(coords); }
    }

    window.addEventListener('message', (event) => {
      if (event.data?.type === 'REQUEST_DP_GEOCODE' && _currentDPGeocode)
        event.source.postMessage({ type: 'GEOSTUDIO_DP_GEOCODE', data: _currentDPGeocode }, '*');
      if (event.data?.type === 'GEOSTUDIO_TRANSFER_REQUIRED')
        _handleTransferRequiredState(event.data.required, event.data.reason);
    });

    new MutationObserver(() => {
      const newId = getAddressIdFromPage();
      if (newId && newId !== _currentAddressId) {
        _currentAddressId = newId; _currentDPGeocode = null;
        setTimeout(() => _captureInitialDPGeocode(newId), 500);
      }
    }).observe(document.body, { childList: true, subtree: true });

    // ── Right-click selected TBA → open logistics tab ────────
    let _podTab = null;
    document.addEventListener('contextmenu', (e) => {
      const sel = window.getSelection()?.toString()?.trim();
      if (sel && /^TBA[a-zA-Z0-9]+$/.test(sel)) {
        e.preventDefault();
        const url = `https://logistics.amazon.com/internal/performance/daf-tool?pageId=da_focus_tool&tabId=tba-deliveries-daily-tab&timeFrame=Daily&trackingId=${sel}`;
        if (!_podTab || _podTab.closed) _podTab = window.open(url, 'r_podTab');
        else { _podTab.location.href = url; _podTab.focus(); }
      }
    });

    // ── Init ─────────────────────────────────────────────────
    setTimeout(() => {
      createCasePanel();
      monitorCases();
      const initId = getAddressIdFromPage();
      if (initId) { _currentAddressId = initId; setTimeout(() => _captureInitialDPGeocode(initId), 500); }
      console.log('✅ GeoStudio PBG Controller V13.3 loaded (Main Window)');
    }, 1000);

  } // end IS_MAIN


  // ═══════════════════════════════════════════════════════════
  // SECTION 3 — IFRAME: GAM DP TRIAGE + UPID + NEI
  // ═══════════════════════════════════════════════════════════
  if (IS_IFRAME) {

    // ── Constants ────────────────────────────────────────────
    const DPRE_QUEUES = ['RDR_DPRE_PIPELINE_NA_PID','RDR_DPRE_PIPELINE_NA','RDR_DPRE_PIPELINE_NA_EG','RDR_DPRE_PIPELINE_POM'];
    const PBG_QUEUES  = ['PBG_Hierarchy_Places_P0_L1','PBG_Hierarchy_Places_P2_L1'];
    const UPID_QUEUE  = 'RDR_COMBINED_UPID_TRIAGE';

    // ── State ────────────────────────────────────────────────
    let storedDPGeocode      = null;
    let currentSelectedQueue = null;
    let currentGamIssueValue = null;
    let isScriptClicking     = false;
    let transferLocked       = false;
    let upidTransferLocked   = false;

    // ── Shared helpers ───────────────────────────────────────
    async function selectDropdownByText(fieldIdOrEl, optionText) {
      let dropdown = typeof fieldIdOrEl === 'string' ? document.getElementById(fieldIdOrEl) : fieldIdOrEl;
      if (!dropdown) dropdown = Array.from(document.querySelectorAll('[id]')).find(e => (e.id || '').toLowerCase() === (fieldIdOrEl || '').toLowerCase());
      if (!dropdown) return false;
      dropdown.dispatchEvent(new Event('mousedown', { bubbles: true }));
      await delay(150);
      const listId = dropdown.getAttribute('aria-controls');
      const list   = listId ? document.getElementById(listId) : document.querySelector('[role="listbox"], [role="presentation"]');
      if (!list) return false;
      const opt = Array.from(list.querySelectorAll('[role="option"], li')).find(o => o.textContent.trim() === optionText);
      if (opt) { opt.click(); await delay(200); return true; }
      return false;
    }

    async function selectRadioByValue(value) {
      const input = document.querySelector(`input[type="radio"][value="${value}"]`);
      if (input) { input.scrollIntoView({ behavior: 'smooth', block: 'center' }); input.click(); await delay(120); return true; }
      return false;
    }

    function createSmallButton(label, action, containerButtonsArr = []) {
      const btn = document.createElement('button');
      btn.textContent = label;
      Object.assign(btn.style, {
        padding: '6px 10px', backgroundColor: '#ccc', border: '2px solid #ccc',
        borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
        fontFamily: 'Amazon Ember, Arial, sans-serif', marginLeft: '8px'
      });
      btn.addEventListener('click', async () => {
        containerButtonsArr.forEach(b => { b.style.backgroundColor = '#ccc'; b.style.color = '#000'; });
        btn.style.backgroundColor = 'green'; btn.style.color = '#fff';
        await delay(80);
        try { await action(); } catch (e) { console.error(e); }
      });
      return btn;
    }

    // ── Utility ──────────────────────────────────────────────
    function calcDist(lat1, lon1, lat2, lon2) {
      const R = 6371000;
      const a = Math.sin((lat2-lat1)*Math.PI/180/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin((lon2-lon1)*Math.PI/180/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function parseCoordinates(value) {
      if (!value || typeof value !== 'string' || !value.includes(',')) return null;
      try {
        const [lat, lon] = value.split(',').map(c => parseFloat(c.trim()));
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180 || (lat === 0 && lon === 0)) return null;
        return { lat, lon, original: value.trim() };
      } catch { return null; }
    }

    function isDpreQueue(q) { return q ? DPRE_QUEUES.some(dq => q.toUpperCase().includes(dq.toUpperCase())) : false; }
    function isPbgQueue(q)  { return q ? PBG_QUEUES.some(pq => q.toUpperCase().includes(pq.toUpperCase()))  : false; }

    // ── GAM section helpers ──────────────────────────────────
    function getGamIssueSection() {
      for (const sec of document.querySelectorAll('.css-19hedjk')) {
        const h = sec.querySelector('p.css-17xh5uu');
        if (h && h.textContent.trim().toLowerCase().replace(/[_\s]/g, '') === 'gamissue') return sec;
      }
      return null;
    }

    function getCurrentGamIssueValue() {
      const sec = getGamIssueSection(); if (!sec) return null;
      for (const r of sec.querySelectorAll('input[type="radio"]')) {
        if (r.checked || r.getAttribute('aria-checked') === 'true') return r.value;
      }
      return null;
    }

    function isGamIssueYes() { return getCurrentGamIssueValue() === 'Yes'; }
    function isGamIssueNo()  { return getCurrentGamIssueValue() === 'No';  }

    // Legacy compatibility
    async function selectGAMIssueYes() {
      const checkbox = document.querySelector('div[role="checkbox"][data-testid="transfer-form-checkbox"]');
      if (!checkbox) return false;
      if (checkbox.getAttribute('aria-checked') === 'true') return true;
      checkbox.click(); await delay(120); return true;
    }

    async function setupGAMIssueListener() {
      const gamLabel = await waitFor(() =>
        Array.from(document.querySelectorAll('p, span, div')).find(el => el.textContent.trim() === 'GAMIssue'), 8000);
      if (!gamLabel) return;
      const container = gamLabel.closest('div') || gamLabel.parentElement;
      if (!container) return;
      const getCheckbox = () => document.querySelector('div[role="checkbox"][data-testid="transfer-form-checkbox"]');
      function extractValue(opt) {
        return opt.value || opt.getAttribute('value') || opt.textContent.trim();
      }
      function applyCheckboxState(value) {
        const cb = getCheckbox(); if (!cb) return;
        const checked = cb.getAttribute('aria-checked') === 'true';
        if (value === 'Yes' && !checked) cb.click();
        if ((value === 'No' || value === 'NA') && checked) cb.click();
      }
      const options = Array.from(container.querySelectorAll('input[type="radio"],[role="radio"],[data-testid*="radio"],button[role="radio"],div[role="radio"],span[role="radio"]'));
      options.forEach(opt => {
        opt.addEventListener('click',  () => applyCheckboxState(extractValue(opt)));
        opt.addEventListener('change', () => applyCheckboxState(extractValue(opt)));
      });
    }

    // ── Transfer helpers ─────────────────────────────────────
    function getCurrentSelectedQueue() {
      const qs = document.querySelector('[data-testid="transfer-form-queue-selector"]');
      if (qs) {
        const v = qs.querySelector('[id*="-value"]') || qs.querySelector('.css-1h2ruwl');
        if (v) { const t = v.textContent.trim(); return t && t !== 'Select...' && t !== 'Select a queue to transfer to' ? t : null; }
      }
      return null;
    }

    function isTransferEnabled() {
      const cb = document.querySelector('[data-testid="transfer-form-checkbox"]');
      return cb && cb.getAttribute('aria-checked') === 'true';
    }

    function disableGAMTransfer() {
      if (isScriptClicking) return;
      const cb = document.querySelector('[data-testid="transfer-form-checkbox"]');
      if (cb && cb.getAttribute('aria-checked') === 'true') { isScriptClicking = true; cb.click(); isScriptClicking = false; }
    }

    function enableGAMTransfer() {
      const cb = document.querySelector('[data-testid="transfer-form-checkbox"]');
      if (cb && cb.getAttribute('aria-checked') === 'false') { isScriptClicking = true; cb.click(); isScriptClicking = false; }
    }

    // ── Lock UI ──────────────────────────────────────────────
    function applyLockUI() {
      const cb = document.querySelector('[data-testid="transfer-form-checkbox"]');
      const qs = document.querySelector('[data-testid="transfer-form-queue-selector"]');
      const locked = transferLocked || upidTransferLocked;

      if (cb) { cb.style.opacity = locked ? '0.6' : '1'; cb.style.pointerEvents = locked ? 'none' : 'auto'; cb.style.cursor = locked ? 'not-allowed' : 'pointer'; }
      if (qs) { qs.style.opacity = locked ? '0.6' : '1'; qs.style.pointerEvents = locked ? 'none' : 'auto'; qs.style.cursor = locked ? 'not-allowed' : 'pointer'; }

      document.getElementById('geo-transfer-lock-indicator')?.remove();
      if (transferLocked && qs?.parentElement) {
        const ind = document.createElement('div');
        ind.id = 'geo-transfer-lock-indicator';
        ind.innerHTML = '<div style="display:flex;align-items:center;gap:6px;margin-top:8px;padding:8px 12px;background:#fff3cd;border:1px solid #ffc107;border-radius:4px;font-size:12px;color:#856404;"><span>🔒 <strong>Locked:</strong> GAM Issue = Yes auto-selected PBG queue</span></div>';
        qs.parentElement.appendChild(ind);
      }

      document.getElementById('upid-transfer-lock-indicator')?.remove();
      if (upidTransferLocked && qs?.parentElement) {
        const ind = document.createElement('div');
        ind.id = 'upid-transfer-lock-indicator';
        ind.innerHTML = '<div style="display:flex;align-items:center;gap:6px;margin-top:8px;padding:8px 12px;background:#fff3cd;border:1px solid #ffc107;border-radius:4px;font-size:12px;color:#856404;"><span>🔒 <strong>Locked:</strong> Upid Geocode Accuracy = No auto-selected UPID queue</span></div>';
        qs.parentElement.appendChild(ind);
      }
    }

    // ── GAM Popup styles & display ───────────────────────────
    function injectGAMPopupStyles() {
      if (document.getElementById('geo-popup-styles')) return;
      const s = document.createElement('style');
      s.id = 'geo-popup-styles';
      s.textContent = `
        @keyframes geo-slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes geo-slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(110%);opacity:0}}
        .geo-popup{position:fixed!important;top:20px!important;right:20px!important;padding:16px!important;border-radius:8px!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;font-size:14px!important;width:380px!important;max-width:90vw!important;box-shadow:0 5px 15px rgba(0,0,0,.15)!important;z-index:1000000!important;animation:geo-slideIn .4s ease!important;display:flex!important;align-items:flex-start!important;gap:12px!important}
        .geo-popup-error{background:#fdecea!important;border-left:5px solid #d32f2f!important;color:#16191f!important}
        .geo-popup-warning{background:#fffbe6!important;border-left:5px solid #ff9800!important;color:#16191f!important}
        .geo-popup-success{background:#e8f5e9!important;border-left:5px solid #4caf50!important;color:#16191f!important}
        .geo-popup-close{background:transparent;border:none;color:#555;font-size:22px;cursor:pointer;padding:0;line-height:1;opacity:.7}
        .geo-popup-close:hover{opacity:1}
      `;
      document.head.appendChild(s);
    }

    function showGAMPopup(type, title, message) {
      injectGAMPopupStyles();
      document.querySelectorAll('.geo-popup').forEach(p => p.remove());
      const icons = {
        error:   `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      };
      const titleColors = { error: '#d32f2f', warning: '#c77700', success: '#2e7d32' };
      const popup = document.createElement('div');
      popup.className = `geo-popup geo-popup-${type}`;
      popup.innerHTML = `<div style="flex-shrink:0;margin-top:2px;">${icons[type]||''}</div><div style="flex-grow:1;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-weight:700;color:${titleColors[type]||'#000'};font-size:16px;">${title}</span><button class="geo-popup-close">&times;</button></div><div style="line-height:1.5;">${message}</div></div>`;
      document.body.appendChild(popup);
      popup.querySelector('.geo-popup-close').addEventListener('click', () => {
        popup.style.animation = 'geo-slideOut 0.4s ease forwards';
        setTimeout(() => popup.remove(), 400);
      });
      setTimeout(() => { popup.style.animation = 'geo-slideOut 0.4s ease forwards'; setTimeout(() => popup.remove(), 400); }, 8000);
    }


    // ── Auto-select PBG queue (GAM=Yes) ─────────────────────
    function autoSelectPbgTransfer() {
      transferLocked     = true;
      upidTransferLocked = false;
      document.getElementById('upid-transfer-lock-indicator')?.remove();
      document.getElementById('geo-transfer-lock-indicator')?.remove();
      const cb = document.querySelector('[data-testid="transfer-form-checkbox"]');
      const qs = document.querySelector('[data-testid="transfer-form-queue-selector"]');
      if (cb) { cb.style.opacity = '1'; cb.style.pointerEvents = 'auto'; cb.style.cursor = 'pointer'; }
      if (qs) { qs.style.opacity = '1'; qs.style.pointerEvents = 'auto'; qs.style.cursor = 'pointer'; }
      enableGAMTransfer();
      setTimeout(() => {
        const selector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
        if (!selector) { applyLockUI(); return; }
        isScriptClicking = true;
        selector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        selector.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true, view: window }));
        isScriptClicking = false;
        setTimeout(() => {
          let found = false;
          for (const opt of document.querySelectorAll('[role="option"]')) {
            const t = opt.textContent.trim();
            if (t === 'PBG_Hierarchy_Places_P0_L1' || t === 'PBG_Hierarchy_Places_P2_L1') {
              isScriptClicking = true; opt.click(); isScriptClicking = false;
              currentSelectedQueue = t; found = true; break;
            }
          }
          applyLockUI();
          if (found) showGAMPopup('success', 'Auto-Selected', 'PBG queue auto-selected because <strong>GAM Issue = Yes</strong>.');
          setTimeout(broadcastTransferState, 300);
        }, 500);
      }, 300);
    }

    // ── Auto-select UPID queue (UPID=No) ────────────────────
    function autoSelectUpidQueue() {
      transferLocked     = false;
      upidTransferLocked = true;
      document.getElementById('geo-transfer-lock-indicator')?.remove();
      document.getElementById('upid-transfer-lock-indicator')?.remove();
      const cb = document.querySelector('[data-testid="transfer-form-checkbox"]');
      const qs = document.querySelector('[data-testid="transfer-form-queue-selector"]');
      if (cb) { cb.style.opacity = '1'; cb.style.pointerEvents = 'auto'; cb.style.cursor = 'pointer'; }
      if (qs) { qs.style.opacity = '1'; qs.style.pointerEvents = 'auto'; qs.style.cursor = 'pointer'; }
      enableGAMTransfer();
      setTimeout(() => {
        const selector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
        if (!selector) { applyLockUI(); return; }
        isScriptClicking = true;
        selector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        selector.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true, view: window }));
        isScriptClicking = false;
        setTimeout(() => {
          let found = false;
          for (const opt of document.querySelectorAll('[role="option"]')) {
            if (opt.textContent.trim() === UPID_QUEUE) {
              isScriptClicking = true; opt.click(); isScriptClicking = false;
              currentSelectedQueue = UPID_QUEUE; found = true; break;
            }
          }
          applyLockUI();
          if (found) showGAMPopup('success', 'UPID Queue Auto-Selected',
            `<strong>${UPID_QUEUE}</strong> auto-selected because <strong>Upid Geocode Accuracy = No</strong>.`);
          setTimeout(broadcastTransferState, 300);
        }, 500);
      }, 300);
    }

    // ── Queue validation & filtering ─────────────────────────
    function validateQueueSelection(selectedQueue) {
      if (!selectedQueue) return true;
      if (transferLocked   && isPbgQueue(selectedQueue))       return true;
      if (upidTransferLocked && selectedQueue === UPID_QUEUE)  return true;
      if (isGamIssueYes() && isDpreQueue(selectedQueue)) {
        showGAMPopup('error', 'Queue Blocked', '<strong>DPRE queues</strong> are not allowed when <strong>GAM Issue = Yes</strong>. Please select a PBG queue instead.');
        return false;
      }
      return true;
    }

    function filterQueueOptions() {
      const optionsList = document.querySelector('[role="listbox"]') || document.querySelector('[id*="options-list"]');
      if (!optionsList) return;
      const gamYes = isGamIssueYes();
      optionsList.querySelectorAll('[role="option"]').forEach(option => {
        const t = option.textContent.trim();
        const shouldDisable = gamYes && isDpreQueue(t);
        option.style.opacity         = shouldDisable ? '0.4' : '1';
        option.style.pointerEvents   = shouldDisable ? 'none' : 'auto';
        option.style.cursor          = shouldDisable ? 'not-allowed' : 'pointer';
        option.style.backgroundColor = shouldDisable ? '#f0f0f0' : '';
        option.style.textDecoration  = shouldDisable ? 'line-through' : 'none';
      });
    }

    function handleQueueSelection(selectedQueue) {
      if (currentSelectedQueue === selectedQueue) return;
      currentSelectedQueue = selectedQueue;
      const isValid = validateQueueSelection(selectedQueue);
      if (!isValid) currentSelectedQueue = null;
    }

    // ── Broadcast transfer state to parent ───────────────────
    function broadcastTransferState() {
      const gamYes  = isGamIssueYes();
      const upidNo  = isUpidNo();
      const needsTransfer = gamYes || upidNo;
      const hasTransfer   = isTransferEnabled() && !!getCurrentSelectedQueue();
      const required = needsTransfer && !hasTransfer;
      let reason = '';
      if (required) {
        if (gamYes && upidNo)  reason = '⚠ GAM Issue = Yes & UPID = No: select transfer task before submitting';
        else if (gamYes)       reason = '⚠ GAM Issue = Yes: select PBG transfer task before submitting';
        else if (upidNo)       reason = '⚠ UPID Correction = No: select UPID transfer task before submitting';
      }
      try { window.parent.postMessage({ type: 'GEOSTUDIO_TRANSFER_REQUIRED', required, reason }, '*'); } catch (e) {}
    }

    // ── GAM Issue change handler ─────────────────────────────
    function handleGamIssueChange(newValue) {
      if (newValue === 'Yes') {
        upidTransferLocked = false;
        setTimeout(() => autoSelectPbgTransfer(), 100);
      } else {
        transferLocked = false;
        const upidVal = getUpidGeocodeValue();
        if (upidVal && upidVal.toLowerCase() === 'no') {
          setTimeout(() => autoSelectUpidQueue(), 100);
        } else {
          upidTransferLocked = false;
          applyLockUI();
          const cq = getCurrentSelectedQueue();
          if (cq && isPbgQueue(cq)) { disableGAMTransfer(); currentSelectedQueue = null; }
        }
      }
      setTimeout(broadcastTransferState, 800);
    }

    // ── UPID Geocode Accuracy helpers ────────────────────────
    function getUpidGeocodeSection() {
      for (const lbl of document.querySelectorAll('p.css-17xh5uu')) {
        if (lbl.textContent.trim().toLowerCase().replace(/\s+/g, '') === 'upidgeocodeaccuracy')
          return lbl.closest('.css-19hedjk') || lbl.closest('div') || lbl.parentElement;
      }
      return null;
    }

    function getUpidGeocodeValue() {
      const sec = getUpidGeocodeSection(); if (!sec) return null;
      const selected = sec.querySelector('div.css-1prjt9m');
      if (selected) return selected.textContent.trim();
      for (const r of sec.querySelectorAll('input[type="radio"]')) { if (r.checked) return r.value.trim(); }
      for (const el of sec.querySelectorAll('[role="radio"]')) { if (el.getAttribute('aria-checked') === 'true') return el.textContent.trim(); }
      return null;
    }

    function isUpidNo() {
      const v = getUpidGeocodeValue();
      return v && v.toLowerCase() === 'no';
    }

    function handleUpidChange(value) {
      if (isGamIssueYes()) { upidTransferLocked = false; return; }
      if (value && value.toLowerCase() === 'no') {
        setTimeout(() => autoSelectUpidQueue(), 100);
      } else {
        upidTransferLocked = false;
        applyLockUI();
        const cq = getCurrentSelectedQueue();
        if (cq === UPID_QUEUE) { disableGAMTransfer(); currentSelectedQueue = null; }
      }
      setTimeout(broadcastTransferState, 800);
    }

    // ── Listener setup functions ─────────────────────────────
    function setupGamIssueListenersGAM() {
      const sec = getGamIssueSection(); if (!sec) return;
      sec.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio._geoListener) return; radio._geoListener = true;
        radio.addEventListener('change', () => {
          if (radio.checked) {
            currentGamIssueValue = radio.value;
            handleGamIssueChange(radio.value);
            setTimeout(filterQueueOptions, 100);
            if (!transferLocked) {
              const cq = getCurrentSelectedQueue();
              if (cq) { const isValid = validateQueueSelection(cq); if (!isValid) disableGAMTransfer(); }
            }
          }
        });
      });
    }

    function setupQueueSelectorListenersGAM() {
      const qs = document.querySelector('[data-testid="transfer-form-queue-selector"]');
      if (!qs || qs._geoListener) return; qs._geoListener = true;
      qs.addEventListener('click', (e) => {
        if (transferLocked && !isScriptClicking) {
          e.preventDefault(); e.stopPropagation();
          showGAMPopup('warning', 'Transfer Locked', 'Transfer is locked because GAM Issue = Yes. Change GAM Issue to No to modify transfer settings.');
          return;
        }
        setTimeout(filterQueueOptions, 50); setTimeout(filterQueueOptions, 150);
      });
      new MutationObserver(() => {
        if (isScriptClicking) return;
        const cq = getCurrentSelectedQueue();
        if (cq && cq !== currentSelectedQueue) handleQueueSelection(cq);
      }).observe(qs, { childList: true, subtree: true, characterData: true });
    }

    function setupTransferCheckboxListenerGAM() {
      const cb = document.querySelector('[data-testid="transfer-form-checkbox"]');
      if (!cb || cb._geoListener) return; cb._geoListener = true;
      cb.addEventListener('click', (e) => {
        if (transferLocked && !isScriptClicking) {
          e.preventDefault(); e.stopPropagation();
          showGAMPopup('warning', 'Transfer Locked', 'Transfer is locked because GAM Issue = Yes. Change GAM Issue to No to modify transfer settings.');
          return;
        }
        setTimeout(() => {
          if (isTransferEnabled() && !transferLocked) {
            const cq = getCurrentSelectedQueue();
            if (cq) { const isValid = validateQueueSelection(cq); if (!isValid) disableGAMTransfer(); }
          }
        }, 100);
      }, true);
    }

    function setupOptionClickListenerGAM() {
      document.addEventListener('click', (e) => {
        if (isScriptClicking) return;
        const option = e.target.closest('[role="option"]');
        if (!option) return;
        const optionText = option.textContent.trim();
        if (isDpreQueue(optionText) || isPbgQueue(optionText)) {
          setTimeout(() => { const isValid = validateQueueSelection(optionText); if (!isValid) disableGAMTransfer(); }, 100);
        }
      }, true);
    }

    function setupUpidGeocodeListener() {
      const sec = getUpidGeocodeSection();
      if (!sec || sec._upidListener) return;
      sec._upidListener = true;
      sec.querySelectorAll('input[type="radio"]').forEach(r => {
        if (r._upidBound) return; r._upidBound = true;
        r.addEventListener('change', () => { if (r.checked) handleUpidChange(r.value); });
      });
      sec.addEventListener('click', () => {
        setTimeout(() => handleUpidChange(getUpidGeocodeValue() || ''), 100);
      });
      new MutationObserver(() => {
        if (isGamIssueYes()) return;
        if (isUpidNo() && !upidTransferLocked) handleUpidChange('no');
        else if (!isUpidNo() && upidTransferLocked) handleUpidChange('other');
      }).observe(sec, { attributes: true, subtree: true, attributeFilter: ['class', 'aria-checked'] });
    }

    function setupIframeCommunication() {
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'GEOSTUDIO_DP_GEOCODE') storedDPGeocode = event.data.data;
      });
      function requestDPGeocode() {
        try { window.parent.postMessage({ type: 'REQUEST_DP_GEOCODE' }, '*'); } catch (e) {}
      }
      setTimeout(requestDPGeocode, 500);
      setInterval(requestDPGeocode, 3000);
    }

    function applyInitialQueueState() {
      const gamVal  = getCurrentGamIssueValue();
      const upidVal = getUpidGeocodeValue();
      if (gamVal === 'Yes') {
        upidTransferLocked = false;
        autoSelectPbgTransfer();
        return;
      }
      if (upidVal && upidVal.toLowerCase() === 'no') {
        transferLocked = false;
        autoSelectUpidQueue();
        return;
      }
      transferLocked = false; upidTransferLocked = false;
      applyLockUI(); broadcastTransferState();
    }

    // Close parent dialog (called via postMessage)
    function closeParentDialog() {
      const findAndClickClose = () => {
        const dialog = document.querySelector('div[role="dialog"][aria-modal="true"]');
        if (dialog) {
          const btn = dialog.querySelector('button[aria-label="Close"]') || dialog.querySelector('button.css-148awne');
          if (btn) { btn.click(); return true; }
        }
        return false;
      };
      if (!findAndClickClose()) setTimeout(findAndClickClose, 200);
    }

    window.addEventListener('message', (event) => {
      if (event.data?.type === 'GEOSTUDIO_CLOSE_DIALOG') closeParentDialog();
    });

    // ── NEI handler ──────────────────────────────────────────
    async function handleNEI_main() {
      showSimplePopup('NEI selected');
      await selectDropdownByText('GAMIssue', 'NA');
      await selectRadioByValue('No SDPP issue');
      await selectDropdownByText('CDPType', 'NA');
      await selectDropdownByText('GeocodeAccuracy', 'NEI');
      await selectDropdownByText('SourceOfGeocodes', 'NA');
      await selectDropdownByText('PODScanAccuracy', 'NO-POD');
      await selectDropdownByText('ScanLocationAccuracy', 'Others(remarks)');
      await selectDropdownByText('TranscriptAnalysis', 'NA');
      showSimplePopup('NEI applied', 1200);
    }

    async function injectButtonsNearGeocode() {
      let geocodeEl = document.getElementById('GeocodeAccuracy');
      if (!geocodeEl) {
        const labelNode = Array.from(document.querySelectorAll('p, span, label, div'))
          .find(el => el.textContent?.trim() === 'Geocode Accuracy');
        if (labelNode) geocodeEl = labelNode.closest('div')?.querySelector('[role="combobox"], [id*="Geocode"]') || null;
      }
      if (!geocodeEl || !geocodeEl.parentElement) return;
      const buttons = [];
      const neiBtn  = createSmallButton('NEI', handleNEI_main, buttons);
      buttons.push(neiBtn);
      const wrapper = document.createElement('div');
      wrapper.style.display = 'inline-flex'; wrapper.style.alignItems = 'center';
      wrapper.appendChild(neiBtn);
      geocodeEl.parentElement.appendChild(wrapper);
    }

    // ── Init iframe ──────────────────────────────────────────
    (async function initIframe() {
      await delay(600);

      injectButtonsNearGeocode();
      setupGAMIssueListener();   // legacy checkbox sync
      setupIframeCommunication();
      setupGamIssueListenersGAM();
      setupQueueSelectorListenersGAM();
      setupOptionClickListenerGAM();
      setupTransferCheckboxListenerGAM();

      // smartPreWarm: loads queue options into DOM before auto-select fires
      (async function smartPreWarm() {
        for (let attempt = 0; attempt < 25; attempt++) {
          const checkbox = document.querySelector('[data-testid="transfer-form-checkbox"]');
          const selector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
          if (checkbox && selector) {
            const wasEnabled = checkbox.getAttribute('aria-checked') === 'true';
            if (!wasEnabled) { isScriptClicking = true; checkbox.click(); isScriptClicking = false; await delay(300); }
            selector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await delay(400);
            document.body.click();
            await delay(150);
            if (!wasEnabled && !transferLocked && !upidTransferLocked) {
              isScriptClicking = true; checkbox.click(); isScriptClicking = false;
            }
            setupUpidGeocodeListener();
            applyInitialQueueState();
            return;
          }
          await delay(400);
        }
      })();

      // Periodic re-setup for dynamic DOM
      setInterval(() => {
        setupGamIssueListenersGAM();
        setupQueueSelectorListenersGAM();
        setupTransferCheckboxListenerGAM();
        setupUpidGeocodeListener();
        broadcastTransferState();
        if (!transferLocked) {
          const cq = getCurrentSelectedQueue();
          if (cq && cq !== currentSelectedQueue) handleQueueSelection(cq);
        }
      }, 2000);

      // MutationObserver — re-attaches listeners when new form elements appear
      new MutationObserver((mutations) => {
        let shouldSetup = false;
        for (const m of mutations) {
          if (m.type === 'childList') {
            for (const node of m.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE &&
                  (node.querySelector?.('[data-testid="transfer-form-queue-selector"]') ||
                   node.querySelector?.('.css-17xh5uu') ||
                   node.matches?.('[role="listbox"]'))) {
                shouldSetup = true; break;
              }
            }
          }
          if (shouldSetup) break;
        }
        if (shouldSetup) {
          setupGamIssueListenersGAM();
          setupQueueSelectorListenersGAM();
          setupTransferCheckboxListenerGAM();
          setupUpidGeocodeListener();
          setTimeout(filterQueueOptions, 100);
        }
      }).observe(document.body, { childList: true, subtree: true });

      console.log('✅ GeoStudio PBG Controller V13.3 loaded (Iframe)');
    })();

  } // end IS_IFRAME

})();
