// ==UserScript==
// @name         NEI-POPUP
// @author       RDR
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Shows popup when NEI is selected
// @match        https://na.templates.geostudio.last-mile.amazon.dev/*
// @match        https://eu.templates.geostudio.last-mile.amazon.dev/*
// @match        https://fe.templates.geostudio.last-mile.amazon.dev/*
// @match        https://na.geostudio.last-mile.amazon.dev/*
// @match        https://eu.geostudio.last-mile.amazon.dev/*
// @match        https://fe.geostudio.last-mile.amazon.dev/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const isIframe = window !== window.top;
    let isProcessing = false;

    const DROPDOWN_IDS = ['auditResolution', 'actionTakenRemarks', 'actionTaken'];

    const NEI_PATTERNS = ['NEI', 'NEI-', 'NEI_', 'NEI (UTL)'];

    function isNeiValue(text) {
        const trimmedText = text.trim();
        return NEI_PATTERNS.some(pattern =>
            trimmedText === pattern ||
            trimmedText.startsWith(pattern)
        );
    }

    function createPopup() {
        const existingPopup = document.getElementById('nei-popup');
        if (existingPopup) return existingPopup;

        const overlay = document.createElement('div');
        overlay.id = 'nei-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 99999;
            display: none;
        `;
        document.body.appendChild(overlay);

        const popup = document.createElement('div');
        popup.id = 'nei-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border: 2px solid #232f3e;
            border-radius: 8px;
            z-index: 100000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: none;
            font-family: Arial, sans-serif;
            min-width: 400px;
            max-width: 500px;
        `;
        popup.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #232f3e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    NEI Verification Required
                </h3>
                <p style="margin: 0; line-height: 1.5; color: #444;">
                    You have selected this case as <strong>NEI</strong>. Have you verified all the following sources?
                </p>
                <ul style="margin: 15px 0; padding-left: 20px; color: #444; line-height: 1.6;">
                    <li>Bing Maps</li>
                    <li>OpenStreetMap (OSM)</li>
                    <li>Kibana</li>
                    <li>NDP</li>
                    <li>Regrid</li>
                    <li>Gateway</li>
                    <li>Deliveries</li>
                    <li>UPID Deliveries</li>
                </ul>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button id="nei-no" style="
                    padding: 8px 16px;
                    border: 1px solid #232f3e;
                    background: white;
                    color: #232f3e;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                ">No, Review Again</button>
                <button id="nei-yes" style="
                    padding: 8px 16px;
                    background: #232f3e;
                    border: 1px solid #232f3e;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                ">Yes, Proceed</button>
            </div>
        `;

        const buttons = popup.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseover', function() {
                if (this.id === 'nei-yes') {
                    this.style.backgroundColor = '#374357';
                } else {
                    this.style.backgroundColor = '#f8f8f8';
                }
            });
            button.addEventListener('mouseout', function() {
                if (this.id === 'nei-yes') {
                    this.style.backgroundColor = '#232f3e';
                } else {
                    this.style.backgroundColor = 'white';
                }
            });
        });

        document.body.appendChild(popup);
        return popup;
    }

    function showPopup(popup) {
        if (!isProcessing) {
            isProcessing = true;
            const overlay = document.getElementById('nei-overlay');
            if (overlay) overlay.style.display = 'block';
            popup.style.display = 'block';
        }
    }

    function hidePopup(popup) {
        popup.style.display = 'none';
        const overlay = document.getElementById('nei-overlay');
        if (overlay) overlay.style.display = 'none';
        isProcessing = false;
    }

    function closeParentDialog() {
        const findAndClickCloseButton = () => {
            const dialog = document.querySelector('div[role="dialog"][aria-modal="true"]');

            if (dialog) {
                const h2 = dialog.querySelector('h2[mdn-modal-title]');
                if (h2 && h2.textContent === "Submit Changes") {
                    const closeButton =
                        dialog.querySelector('button[aria-label="Close"]') ||
                        dialog.querySelector('button[mdn-popover-offset]') ||
                        dialog.querySelector('button.css-148awne');

                    if (closeButton) {
                        closeButton.click();
                        return true;
                    }
                }
            }
            return false;
        };

        if (!findAndClickCloseButton()) {
            setTimeout(() => {
                if (!findAndClickCloseButton()) {
                    setTimeout(findAndClickCloseButton, 500);
                }
            }, 100);
        }
    }

    function setupNeiListener(popup) {
        DROPDOWN_IDS.forEach(id => {
            const container = document.getElementById(id);
            if (!container || container._neiObserverAttached) return;

            const valueDiv = document.getElementById(`${id}-value`) ||
                            container.querySelector('[mdn-select-value]') ||
                            container.querySelector('[id$="-value"]');

            if (!valueDiv) return;

            container._neiObserverAttached = true;
            console.log(`NEI-POPUP: Attached observer to ${id}`);

            if (isNeiValue(valueDiv.textContent)) {
                showPopup(popup);
            }

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    const currentText = valueDiv.textContent;
                    console.log(`NEI-POPUP: Value changed in ${id}: "${currentText}"`);

                    if (isNeiValue(currentText)) {
                        showPopup(popup);
                    }
                });
            });

            observer.observe(valueDiv, {
                characterData: true,
                childList: true,
                subtree: true
            });
        });

        const radioButtons = Array.from(document.querySelectorAll('input[type="radio"]'))
            .filter(radio => NEI_PATTERNS.some(p => radio.value.includes(p)));

        radioButtons.forEach(radio => {
            if (radio._neiListenerAttached) return;
            radio._neiListenerAttached = true;

            radio.addEventListener('change', (event) => {
                if (event.target.checked) {
                    showPopup(popup);
                }
            });
        });
    }

    function initializeIframe() {
        const popup = createPopup();

        document.getElementById('nei-yes').addEventListener('click', () => {
            hidePopup(popup);
        });

        document.getElementById('nei-no').addEventListener('click', () => {
            hidePopup(popup);
            window.parent.postMessage({ type: 'NEI_CLOSE_DIALOG' }, '*');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.style.display === 'block') {
                hidePopup(popup);
                window.parent.postMessage({ type: 'NEI_CLOSE_DIALOG' }, '*');
            }
        });

        document.getElementById('nei-overlay').addEventListener('click', () => {
            hidePopup(popup);
            window.parent.postMessage({ type: 'NEI_CLOSE_DIALOG' }, '*');
        });

        setupNeiListener(popup);

        const observer = new MutationObserver(() => {
            setupNeiListener(popup);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        [1000, 2000, 3000].forEach(delay => {
            setTimeout(() => setupNeiListener(popup), delay);
        });
    }

    function initializeParent() {
        const allowedOrigins = [
            'https://na.templates.geostudio.last-mile.amazon.dev',
            'https://eu.templates.geostudio.last-mile.amazon.dev',
            'https://fe.templates.geostudio.last-mile.amazon.dev',
            'https://na.geostudio.last-mile.amazon.dev',
            'https://eu.geostudio.last-mile.amazon.dev',
            'https://fe.geostudio.last-mile.amazon.dev'
        ];

        window.addEventListener('message', function(event) {
            if (!allowedOrigins.some(origin => event.origin.includes(origin.split('//')[1]))) return;

            if (event.data.type === 'NEI_CLOSE_DIALOG') {
                closeParentDialog();
            }
        });
    }

    if (isIframe) {
        initializeIframe();
    } else {
        initializeParent();
    }
})();
