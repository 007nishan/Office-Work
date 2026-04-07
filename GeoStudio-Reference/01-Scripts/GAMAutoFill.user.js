// ==UserScript==
// @name         GeoStudio GAM DP Triage Controller
// @author       @nthakurn @ggopaamz @nkadaver
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  GAM Triage Controller - Queue filtering based on Gam Issue with DP validation (10km minimum distance) and auto PBG selection
// @match        https://na.geostudio.last-mile.amazon.dev/*
// @match        https://na.templates.geostudio.last-mile.amazon.dev/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const isInIframe = window.self !== window.top;
    let storedDPGeocode = null;
    let currentSelectedQueue = null;
    let currentGamIssueValue = null;
    let isScriptClicking = false;
    let transferLocked = false;

    const DPRE_QUEUES = [
        'RDR_DPRE_PIPELINE_NA_PID',
        'RDR_DPRE_PIPELINE_NA',
        'RDR_DPRE_PIPELINE_NA_EG',
        'RDR_DPRE_PIPELINE_POM'
    ];

    const PBG_QUEUES = [
        'PBG_Hierarchy_Places_P0_L1',
        'PBG_Hierarchy_Places_P2_L1'
    ];

    function calcDist(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const latDiff = (lat2 - lat1) * Math.PI / 180;
        const lonDiff = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
                  Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                  Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return dist;
    }

    function parseCoordinates(value) {
        if (!value || typeof value !== 'string') return null;
        const trimmed = value.trim();
        if (!trimmed || !trimmed.includes(',')) return null;

        try {
            const [lat, lon] = trimmed.split(',').map(coord => parseFloat(coord.trim()));
            if (isNaN(lat) || isNaN(lon)) return null;
            if (lat < -90 || lat > 90) return null;
            if (lon < -180 || lon > 180) return null;
            if (lat === 0 && lon === 0) return null;
            return { lat, lon, original: trimmed };
        } catch (error) {
            return null;
        }
    }

    function isDpreQueue(queueName) {
        if (!queueName) return false;
        return DPRE_QUEUES.some(queue =>
            queueName.toUpperCase().includes(queue.toUpperCase())
        );
    }

    function isPbgQueue(queueName) {
        if (!queueName) return false;
        return PBG_QUEUES.some(queue =>
            queueName.toUpperCase().includes(queue.toUpperCase())
        );
    }

    function getGamIssueSection() {
        const sections = document.querySelectorAll('.css-19hedjk');
        for (const section of sections) {
            const header = section.querySelector('p.css-17xh5uu');
            if (header) {
                const headerText = header.textContent.trim().toLowerCase().replace(/[_\s]/g, '');
                if (headerText === 'gamissue') {
                    return section;
                }
            }
        }
        return null;
    }

    function getCurrentGamIssueValue() {
        const section = getGamIssueSection();
        if (!section) return null;

        const radios = section.querySelectorAll('input[type="radio"]');
        for (const radio of radios) {
            if (radio.checked || radio.getAttribute('aria-checked') === 'true') {
                return radio.value;
            }
        }
        return null;
    }

    function isGamIssueYes() {
        const value = getCurrentGamIssueValue();
        return value === 'Yes';
    }

    function isGamIssueNo() {
        const value = getCurrentGamIssueValue();
        return value === 'No';
    }

    function getNativeDPField() {
        return document.querySelector('input#suggestedDp:not(#geo-suggested-dp-input)') ||
               document.querySelector('input[data-testid="suggestedDp"]:not(#geo-suggested-dp-input)');
    }

    function hasNativeDPField() {
        return getNativeDPField() !== null;
    }

    function getCurrentSelectedQueue() {
        const queueSelector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
        if (queueSelector) {
            const valueElement = queueSelector.querySelector('[id*="-value"]') ||
                                 queueSelector.querySelector('.css-1h2ruwl');
            if (valueElement) {
                const value = valueElement.textContent.trim();
                return value && value !== 'Select...' && value !== 'Select a queue to transfer to' ? value : null;
            }
        }
        return null;
    }

    function isTransferEnabled() {
        const checkbox = document.querySelector('[data-testid="transfer-form-checkbox"]');
        return checkbox && checkbox.getAttribute('aria-checked') === 'true';
    }

    function disableTransfer() {
        if (isScriptClicking) return;
        const checkbox = document.querySelector('[data-testid="transfer-form-checkbox"]');
        if (checkbox && checkbox.getAttribute('aria-checked') === 'true') {
            isScriptClicking = true;
            checkbox.click();
            isScriptClicking = false;
        }
    }

    function enableTransfer() {
        const checkbox = document.querySelector('[data-testid="transfer-form-checkbox"]');
        if (checkbox && checkbox.getAttribute('aria-checked') === 'false') {
            isScriptClicking = true;
            checkbox.click();
            isScriptClicking = false;
        }
    }

    function autoSelectPbgTransfer() {
        transferLocked = true;

        enableTransfer();

        setTimeout(() => {
            const selector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
            if (selector) {
                const click = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                selector.dispatchEvent(click);
                selector.focus();

                const key = new KeyboardEvent('keydown', {
                    key: 'ArrowDown',
                    code: 'ArrowDown',
                    bubbles: true
                });
                selector.dispatchEvent(key);

                setTimeout(() => {
                    const options = document.querySelectorAll('[role="option"]');
                    let selected = false;

                    for (const option of options) {
                        const optionText = option.textContent.trim();
                        if (optionText === 'PBG_Hierarchy_Places_P0_L1') {
                            isScriptClicking = true;
                            option.click();
                            isScriptClicking = false;
                            currentSelectedQueue = optionText;
                            selected = true;
                            break;
                        }
                    }

                    if (!selected) {
                        for (const option of options) {
                            const optionText = option.textContent.trim();
                            if (optionText === 'PBG_Hierarchy_Places_P2_L1') {
                                isScriptClicking = true;
                                option.click();
                                isScriptClicking = false;
                                currentSelectedQueue = optionText;
                                selected = true;
                                break;
                            }
                        }
                    }

                    if (selected) {
                        showPopup('success', 'Auto-Selected',
                            'PBG queue has been automatically selected because <strong>GAM Issue = Yes</strong>.<br><br>' +
                            '<em>Transfer selection is locked.</em>');
                        applyTransferLock();
                    }
                }, 600);
            }
        }, 400);
    }

    function applyTransferLock() {
        const checkbox = document.querySelector('[data-testid="transfer-form-checkbox"]');
        if (checkbox) {
            checkbox.style.opacity = '0.6';
            checkbox.style.pointerEvents = 'none';
            checkbox.style.cursor = 'not-allowed';
        }

        const queueSelector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
        if (queueSelector) {
            queueSelector.style.opacity = '0.6';
            queueSelector.style.pointerEvents = 'none';
            queueSelector.style.cursor = 'not-allowed';
        }

        addLockIndicator();
    }

    function removeTransferLock() {
        transferLocked = false;

        const checkbox = document.querySelector('[data-testid="transfer-form-checkbox"]');
        if (checkbox) {
            checkbox.style.opacity = '1';
            checkbox.style.pointerEvents = 'auto';
            checkbox.style.cursor = 'pointer';
        }

        const queueSelector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
        if (queueSelector) {
            queueSelector.style.opacity = '1';
            queueSelector.style.pointerEvents = 'auto';
            queueSelector.style.cursor = 'pointer';
        }

        removeLockIndicator();
    }

    function addLockIndicator() {
        if (document.getElementById('geo-transfer-lock-indicator')) return;

        const queueSelector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
        if (!queueSelector) return;

        const indicator = document.createElement('div');
        indicator.id = 'geo-transfer-lock-indicator';
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 8px 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; font-size: 12px; color: #856404;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span><strong>Locked:</strong> GAM Issue = Yes auto-selected PBG queue</span>
            </div>
        `;

        queueSelector.parentElement.appendChild(indicator);
    }

    function removeLockIndicator() {
        const indicator = document.getElementById('geo-transfer-lock-indicator');
        if (indicator) indicator.remove();
    }

    function handleGamIssueChange(newValue) {
        if (newValue === 'Yes') {
            removeFallbackDPField();
            setTimeout(() => autoSelectPbgTransfer(), 100);
        } else {
            removeTransferLock();

            const currentQueue = getCurrentSelectedQueue();
            if (currentQueue && isPbgQueue(currentQueue)) {
                disableTransfer();
                currentSelectedQueue = null;
            }
        }
    }

    function createPopupStyles() {
        if (document.getElementById('geo-popup-styles')) return;

        const style = document.createElement('style');
        style.id = 'geo-popup-styles';
        style.textContent = `
            @keyframes geo-slideIn {
                from { transform: translateX(110%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes geo-slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(110%); opacity: 0; }
            }
            .geo-popup {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                padding: 16px !important;
                border-radius: 8px !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
                font-size: 14px !important;
                width: 380px !important;
                max-width: 90vw !important;
                box-shadow: 0 5px 15px rgba(0,0,0,0.15) !important;
                z-index: 1000000 !important;
                animation: geo-slideIn 0.4s ease !important;
                display: flex !important;
                align-items: flex-start !important;
                gap: 12px !important;
            }
            .geo-popup-error {
                background: #fdecea !important;
                border-left: 5px solid #d32f2f !important;
                color: #16191f !important;
            }
            .geo-popup-warning {
                background: #fffbe6 !important;
                border-left: 5px solid #ff9800 !important;
                color: #16191f !important;
            }
            .geo-popup-success {
                background: #e8f5e9 !important;
                border-left: 5px solid #4caf50 !important;
                color: #16191f !important;
            }

            .geo-popup-close {
                background: transparent;
                border: none;
                color: #555;
                font-size: 22px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                opacity: 0.7;
            }
            .geo-popup-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    function showPopup(type, title, message) {
        createPopupStyles();
        removeAllPopups();

        const popup = document.createElement('div');
        popup.className = `geo-popup geo-popup-${type}`;

        const icons = {
            error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
        };

        const titleColors = { error: '#d32f2f', warning: '#c77700', success: '#2e7d32' };

        popup.innerHTML = `
            <div style="flex-shrink: 0; margin-top: 2px;">${icons[type]}</div>
            <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-weight: 700; color: ${titleColors[type]}; font-size: 16px;">${title}</span>
                    <button class="geo-popup-close">&times;</button>
                </div>
                <div style="line-height: 1.5;">${message}</div>
            </div>
        `;

        document.body.appendChild(popup);

        popup.querySelector('.geo-popup-close').addEventListener('click', () => removePopup(popup));
        setTimeout(() => removePopup(popup), 8000);

        return popup;
    }

    function removePopup(popup) {
        if (!popup || !popup.parentElement) return;
        popup.style.animation = 'geo-slideOut 0.4s ease forwards';
        setTimeout(() => popup.remove(), 400);
    }

    function removeAllPopups() {
        document.querySelectorAll('.geo-popup').forEach(p => p.remove());
    }

    function createFallbackDPField() {
        if (document.getElementById('geo-suggested-dp-container')) {
            return document.getElementById('geo-suggested-dp-input');
        }

        const transferSection = document.querySelector('.css-1c02o5u') ||
                               document.querySelector('[data-testid="transfer-form-checkbox"]')?.closest('.css-1c02o5u') ||
                               document.querySelector('[data-testid="transfer-form-checkbox"]')?.closest('.css-1d7jqjm')?.parentElement;

        if (!transferSection) return null;

        const container = document.createElement('div');
        container.id = 'geo-suggested-dp-container';
        container.className = 'css-19hedjk';
        container.innerHTML = `
            <div class="css-1d7jqjm">
                <div class="css-p2ifpm">
                    <p class="css-17xh5uu" style="color: #0073bb; font-weight: 600;">Suggested DP (Required for DPRE)</p>
                </div>
                <hr class="css-bzs9xz">
                <div class="css-dfrd9x">
                    <div class="css-ub972y">
                        <div class="css-1hl3vig" mdn-input-box="" style="border: 2px solid #0073bb;">
                            <div class="css-14lg5yy">
                                <div class="css-e7lkaq">
                                    <input
                                        id="geo-suggested-dp-input"
                                        data-testid="geo-suggestedDp"
                                        class="css-11lb4kk"
                                        type="text"
                                        placeholder="latitude, longitude (e.g., 41.338839, -89.106049)"
                                        style="width: 100%;"
                                    >
                                </div>
                            </div>
                        </div>

                        <p id="geo-dp-hint" style="margin-top: 8px; font-size: 12px; color: #666;">
                             New DP must be at least 10km from current DP location
                        </p>
                    </div>
                </div>
            </div>
        `;

        transferSection.parentElement.insertBefore(container, transferSection);

        const input = document.getElementById('geo-suggested-dp-input');
        if (input) {
            input.addEventListener('input', () => {
                const hint = document.getElementById('geo-dp-hint');
                if (hint) {
                    hint.style.color = '#666';
                    hint.textContent = 'New DP must be at least 10km from current DP location';
                }
            });

            input.addEventListener('blur', () => {
                validateDPField();
            });
        }

        return input;
    }

    function removeFallbackDPField() {
        const container = document.getElementById('geo-suggested-dp-container');
        if (container) container.remove();
    }

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

    function validateDPField() {
        const dpValue = getDPFieldValue();
        const hint = document.getElementById('geo-dp-hint');

        if (!dpValue) {
            if (hint) {
                hint.style.color = '#d32f2f';
                hint.textContent = 'Please enter DP coordinates';
            }
            return { valid: false, error: 'Please enter DP coordinates' };
        }

        const coords = parseCoordinates(dpValue);
        if (!coords) {
            if (hint) {
                hint.style.color = '#d32f2f';
                hint.textContent = 'Invalid format. Use: latitude, longitude';
            }
            return { valid: false, error: 'Invalid format. Use: latitude, longitude (e.g., 41.338839, -89.106049)' };
        }

        if (!storedDPGeocode) {
            if (hint) {
                hint.style.color = '#ff9800';
                hint.textContent = 'Waiting for current DP geocode...';
            }
            return { valid: false, error: 'Waiting for current DP geocode from main page...' };
        }

        const distance = calcDist(
            storedDPGeocode.lat,
            storedDPGeocode.lon,
            coords.lat,
            coords.lon
        );

        if (distance < 10000) {
            const distanceKm = (distance / 1000).toFixed(2);
            if (hint) {
                hint.style.color = '#d32f2f';
                hint.textContent = `Distance: ${distanceKm}km (minimum required: 10km)`;
            }
            return {
                valid: false,
                error: `Distance too short: ${distanceKm}km. Required: minimum 10km from current DP`
            };
        }

        const distanceKm = (distance / 1000).toFixed(2);
        if (hint) {
            hint.style.color = '#4caf50';
            hint.textContent = `Valid! Distance: ${distanceKm}km from current DP`;
        }

        return { valid: true, coords: coords, distance: distance };
    }

    function filterQueueOptions() {
        const optionsList = document.querySelector('[role="listbox"]') ||
                           document.querySelector('[id*="options-list"]');

        if (!optionsList) return;

        const options = optionsList.querySelectorAll('[role="option"]');
        const gamYes = isGamIssueYes();
        const gamNo = isGamIssueNo();

        options.forEach(option => {
            const optionText = option.textContent.trim();
            let shouldDisable = false;

            if (gamYes && isDpreQueue(optionText)) {
                shouldDisable = true;
            } else if (gamNo && isPbgQueue(optionText)) {
                shouldDisable = true;
            }

            if (shouldDisable) {
                option.style.opacity = '0.4';
                option.style.pointerEvents = 'none';
                option.style.cursor = 'not-allowed';
                option.style.backgroundColor = '#f0f0f0';
                option.style.textDecoration = 'line-through';
            } else {
                option.style.opacity = '1';
                option.style.pointerEvents = 'auto';
                option.style.cursor = 'pointer';
                option.style.backgroundColor = '';
                option.style.textDecoration = 'none';
            }
        });
    }

    function validateQueueSelection(selectedQueue) {
        if (!selectedQueue) return true;

        if (transferLocked && isPbgQueue(selectedQueue)) {
            return true;
        }

        if (isGamIssueYes() && isDpreQueue(selectedQueue)) {
            showPopup('error', 'Queue Blocked',
                '<strong>DPRE queues</strong> are not allowed when <strong>GAM Issue = Yes</strong>.<br><br>Please select a PBG queue instead.');
            return false;
        }

        if (isGamIssueNo() && isPbgQueue(selectedQueue)) {
            showPopup('error', 'Queue Blocked',
                '<strong>PBG queues</strong> are not allowed when <strong>GAM Issue = No</strong>.<br><br>Please select a DPRE queue instead.');
            return false;
        }

        if (isGamIssueNo() && isDpreQueue(selectedQueue)) {
            const dpValue = getDPFieldValue();

            if (!dpValue) {
                const existingField = getNativeDPField() || document.getElementById('geo-suggested-dp-input');

                if (!existingField) {
                    createFallbackDPField();
                }

                showPopup('warning', 'DP Required',
                    'DPRE queues require a <strong>Suggested DP</strong> coordinate.<br><br>' +
                    '• Enter coordinates in the Suggested DP field<br>' +
                    '• Must be at least <strong>10km</strong> from current DP<br>' +
                    '• Then select the queue again');

                disableTransfer();
                return false;
            }

            const validation = validateDPField();
            if (!validation.valid) {
                showPopup('error', 'DP Validation Failed', validation.error);
                disableTransfer();
                return false;
            }
        }

        return true;
    }

    function handleQueueSelection(selectedQueue) {
        if (currentSelectedQueue === selectedQueue) return;
        currentSelectedQueue = selectedQueue;

        if (!isDpreQueue(selectedQueue) || isGamIssueYes()) {
            removeFallbackDPField();
        }

        const isValid = validateQueueSelection(selectedQueue);
        if (!isValid) {
            currentSelectedQueue = null;
        }
    }

    function closeParentDialog() {
        const findAndClickClose = () => {
            const dialog = document.querySelector('div[role="dialog"][aria-modal="true"]');
            if (dialog) {
                const closeButton = dialog.querySelector('button[aria-label="Close"]') ||
                                   dialog.querySelector('button.css-148awne');
                if (closeButton) {
                    closeButton.click();
                    return true;
                }
            }
            return false;
        };

        if (!findAndClickClose()) {
            setTimeout(findAndClickClose, 200);
        }
    }

    function setupGamIssueListeners() {
        const section = getGamIssueSection();
        if (!section) return;

        const radios = section.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            if (radio._geoListener) return;
            radio._geoListener = true;

            radio.addEventListener('change', () => {
                if (radio.checked) {
                    const newValue = radio.value;
                    currentGamIssueValue = newValue;

                    handleGamIssueChange(newValue);

                    setTimeout(filterQueueOptions, 100);

                    if (!transferLocked) {
                        const currentQueue = getCurrentSelectedQueue();
                        if (currentQueue) {
                            const isValid = validateQueueSelection(currentQueue);
                            if (!isValid) {
                                disableTransfer();
                            }
                        }
                    }
                }
            });
        });
    }

    function setupQueueSelectorListeners() {
        const queueSelector = document.querySelector('[data-testid="transfer-form-queue-selector"]');
        if (!queueSelector || queueSelector._geoListener) return;
        queueSelector._geoListener = true;

        queueSelector.addEventListener('click', (e) => {
            if (transferLocked) {
                e.preventDefault();
                e.stopPropagation();
                showPopup('warning', 'Transfer Locked',
                    'Transfer queue is locked because <strong>GAM Issue = Yes</strong>.<br><br>' +
                    'Change GAM Issue to <strong>No</strong> to select a different queue.');
                return;
            }

            setTimeout(filterQueueOptions, 50);
            setTimeout(filterQueueOptions, 150);
        });

        const observer = new MutationObserver(() => {
            if (isScriptClicking) return;

            const currentQueue = getCurrentSelectedQueue();
            if (currentQueue && currentQueue !== currentSelectedQueue) {
                handleQueueSelection(currentQueue);
            }
        });

        observer.observe(queueSelector, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function setupOptionClickListener() {
        document.addEventListener('click', (e) => {
            if (isScriptClicking) return;

            const option = e.target.closest('[role="option"]');
            if (!option) return;

            const optionText = option.textContent.trim();

            if (isDpreQueue(optionText) || isPbgQueue(optionText)) {
                setTimeout(() => {
                    const isValid = validateQueueSelection(optionText);
                    if (!isValid) {
                        disableTransfer();
                    }
                }, 100);
            }
        }, true);
    }

    function setupTransferCheckboxListener() {
        const checkbox = document.querySelector('[data-testid="transfer-form-checkbox"]');
        if (!checkbox || checkbox._geoListener) return;
        checkbox._geoListener = true;

        checkbox.addEventListener('click', (e) => {
            if (transferLocked && !isScriptClicking) {
                e.preventDefault();
                e.stopPropagation();
                showPopup('warning', 'Transfer Locked',
                    'Transfer is locked because <strong>GAM Issue = Yes</strong>.<br><br>' +
                    'Change GAM Issue to <strong>No</strong> to modify transfer settings.');
                return;
            }

            setTimeout(() => {
                if (isTransferEnabled() && !transferLocked) {
                    const currentQueue = getCurrentSelectedQueue();
                    if (currentQueue) {
                        const isValid = validateQueueSelection(currentQueue);
                        if (!isValid) {
                            disableTransfer();
                        }
                    }
                }
            }, 100);
        }, true);
    }

    function setupParentPageCommunication() {
        if (isInIframe) return;

        let currentAddressId = null;
        let currentDPGeocode = null;

        function getAddressId() {
            try {
                const element = document.evaluate(
                    "//p[text()='Address ID:']/following-sibling::a/p",
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                return element ? element.textContent.trim() : null;
            } catch (error) {
                return null;
            }
        }

        function getDPElement() {
            return document.querySelector('input#input-dp-geocode');
        }

        function captureInitialDPGeocode(addressId) {
            if (!addressId) return;
            const dpElement = getDPElement();
            if (!dpElement || !dpElement.value) {
                setTimeout(() => captureInitialDPGeocode(addressId), 1000);
                return;
            }
            const coords = parseCoordinates(dpElement.value);
            if (coords) {
                currentDPGeocode = coords;
                broadcastDPToIframes(coords);
            }
        }

        function broadcastDPToIframes(coords) {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'GEOSTUDIO_DP_GEOCODE',
                        data: coords
                    }, '*');
                } catch (e) {}
            });
        }

        function handleNewCase(newAddressId) {
            if (newAddressId === currentAddressId) return;
            currentAddressId = newAddressId;
            currentDPGeocode = null;
            setTimeout(() => captureInitialDPGeocode(newAddressId), 500);
        }

        window.addEventListener('message', (event) => {
            if (event.data?.type === 'REQUEST_DP_GEOCODE') {
                if (currentDPGeocode) {
                    event.source.postMessage({
                        type: 'GEOSTUDIO_DP_GEOCODE',
                        data: currentDPGeocode
                    }, '*');
                }
            } else if (event.data?.type === 'GEOSTUDIO_CLOSE_DIALOG') {
                closeParentDialog();
            }
        });

        const addressId = getAddressId();
        if (addressId) {
            handleNewCase(addressId);
        }

        const observer = new MutationObserver(() => {
            const newAddressId = getAddressId();
            if (newAddressId && newAddressId !== currentAddressId) {
                handleNewCase(newAddressId);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function setupIframeCommunication() {
        if (!isInIframe) return;

        window.addEventListener('message', (event) => {
            if (event.data?.type === 'GEOSTUDIO_DP_GEOCODE') {
                storedDPGeocode = event.data.data;
            }
        });

        function requestDPGeocode() {
            try {
                window.parent.postMessage({ type: 'REQUEST_DP_GEOCODE' }, '*');
            } catch (e) {}
        }

        setTimeout(requestDPGeocode, 500);
        setInterval(requestDPGeocode, 3000);
    }

    function checkInitialGamState() {
        const currentValue = getCurrentGamIssueValue();
        currentGamIssueValue = currentValue;

        if (currentValue === 'Yes') {
            setTimeout(() => autoSelectPbgTransfer(), 500);
        }
    }

    function init() {
        setupParentPageCommunication();
        setupIframeCommunication();

        setupGamIssueListeners();
        setupQueueSelectorListeners();
        setupOptionClickListener();
        setupTransferCheckboxListener();

        checkInitialGamState();

        setInterval(() => {
            setupGamIssueListeners();
            setupQueueSelectorListeners();
            setupTransferCheckboxListener();

            if (!transferLocked) {
                const currentQueue = getCurrentSelectedQueue();
                if (currentQueue && currentQueue !== currentSelectedQueue) {
                    handleQueueSelection(currentQueue);
                }
            }
        }, 2000);

        const observer = new MutationObserver((mutations) => {
            let shouldSetup = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.querySelector?.('[data-testid="transfer-form-queue-selector"]') ||
                                node.querySelector?.('.css-17xh5uu') ||
                                node.matches?.('[role="listbox"]')) {
                                shouldSetup = true;
                                break;
                            }
                        }
                    }
                }
                if (shouldSetup) break;
            }

            if (shouldSetup) {
                setupGamIssueListeners();
                setupQueueSelectorListeners();
                setupTransferCheckboxListener();
                setTimeout(filterQueueOptions, 100);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        console.log('GeoStudio GAM DP Triage Controller v2.3 initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
