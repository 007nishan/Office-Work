// ==UserScript==
// @name        Geocodes Copier in GS
// @namespace   http://tampermonkey.net/
// @version     2.3
// @description Copies DP and RE coordinates
// @author      Jaswanth V
// @match       https://na.geostudio.last-mile.amazon.dev/*
// @match       https://eu.geostudio.last-mile.amazon.dev/*
// @match       https://fe.geostudio.last-mile.amazon.dev/*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    if (window.geocodesCopyButtonsLoaded) {
        console.log("Geocodes copy buttons already loaded, skipping...");
        return;
    }
    window.geocodesCopyButtonsLoaded = true;

    let buttonPanel = null;

    function copyToClipboard(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }

    function isEditPanelOpen() {
        const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
        const editPanelVisible = editPanel && window.getComputedStyle(editPanel).display !== 'none';
        return editPanelVisible;
    }

    function updatePanelPosition() {
        if (!buttonPanel) return;
        const panelOpen = isEditPanelOpen();
        const rightPosition = panelOpen ? '320px' : '8px';
        buttonPanel.style.right = rightPosition;
    }

    function makeButton(label, title, onClick) {
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

    function createButtonPanel() {
        if (document.getElementById('geocodesCopyPanel')) {
            console.log("Geocodes copy panel already exists");
            return;
        }

        buttonPanel = document.createElement('div');
        buttonPanel.id = 'geocodesCopyPanel';
        Object.assign(buttonPanel.style, {
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
        buttonPanel.appendChild(makeButton('CDP', 'Copy Delivery Point', function() {
            const inputElement = document.getElementById('input-dp-geocode');
            if (inputElement) {
                const latLongs = inputElement.value;
                if (latLongs) {
                    copyToClipboard(latLongs);
                    console.log("DP copied:", latLongs);
                } else {
                    alert("No Delivery Point coordinates found.");
                }
            }
        }));

        // CRE - Copy RE button
        buttonPanel.appendChild(makeButton('CRE', 'Copy Road Entry', function() {
            const inputElement = document.getElementById('input-re-geocode');
            if (inputElement) {
                const latLongs = inputElement.value;
                if (latLongs) {
                    copyToClipboard(latLongs);
                    console.log("RE copied:", latLongs);
                } else {
                    alert("No Road Entry coordinates found.");
                }
            }
        }));

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

        console.log("Geocodes copy panel created successfully");
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
