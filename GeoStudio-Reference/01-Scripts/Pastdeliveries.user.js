// ==UserScript==
// @name         GeoStudio Past Deliveries Automation + P Shortcut
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automates past deliveries selection; shortcut key = P
// @match        https://*.geostudio.last-mile.amazon.dev/*
// @author       rohanjit@
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    class DeliveryAutomation {
        constructor() {
            this.prevTimerVal = '';
            this.prevAddrId = null;
            this.retryAttempt = 0;
        }

        checkTimerChange(timerVal) {
            if (timerVal !== this.prevTimerVal) {
                const [currMin, currSec] = timerVal.split(':').map(Number);
                const [lastMin, lastSec] = (this.prevTimerVal || '0:0').split(':').map(Number);
                const currTotal = currMin * 60 + currSec;
                const lastTotal = lastMin * 60 + lastSec;
                if (currTotal > lastTotal && currTotal >= 1 && currTotal <= 10000) {
                    this.prevTimerVal = timerVal;
                    return true;
                }
            }
            this.prevTimerVal = timerVal;
            return false;
        }

        extractAddressId() {
            const addrBlocks = document.getElementsByClassName('css-wncc9b');
            for (let block of addrBlocks) {
                const keyElem = block.querySelector('.css-1wmy4xi');
                const valueElem = block.querySelector('.css-189kjnx');
                if (keyElem?.textContent.trim() === 'AddressId') {
                    return valueElem?.textContent.trim() || null;
                }
            }
            return null;
        }

        async configureAttributeAndFilter() {
            try {
                const pastDelsBtn = Array.from(document.querySelectorAll('p.css-1oqpb4x'))
                    .find(el => el.innerText.trim() === "Past deliveries");
                if (!pastDelsBtn) return false;

                pastDelsBtn.scrollIntoView({ behavior: "smooth", block: "center" });
                pastDelsBtn.click();
                await new Promise(r => setTimeout(r, 1500));

                const dropdownBoxes = document.querySelectorAll('div[role="combobox"]');
                let attrFound = false;

                dropdownBoxes.forEach(box => {
                    if (box.textContent.includes('Attribute')) {
                        attrFound = true;
                        box.dispatchEvent(new KeyboardEvent('keydown', {
                            key: ' ',
                            code: 'Space',
                            bubbles: true,
                            cancelable: true
                        }));

                        setTimeout(() => {
                            const optSelectors = ['div[role="option"]', 'li', 'div', 'span'];
                            optSelectors.forEach(selector => {
                                document.querySelectorAll(selector).forEach(menuItem => {
                                    if (menuItem.textContent.trim() === 'Count') {
                                        menuItem.click();
                                        menuItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                                        menuItem.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                                    }
                                });
                            });

                            setTimeout(() => {
                                document.querySelectorAll('div[role="combobox"]').forEach(filterBox => {
                                    if (filterBox.textContent.includes('Recent 10')) {
                                        filterBox.dispatchEvent(new KeyboardEvent('keydown', {
                                            key: ' ',
                                            code: 'Space',
                                            bubbles: true,
                                            cancelable: true
                                        }));

                                        setTimeout(() => {
                                            document.querySelectorAll('div[role="option"], li, div, span').forEach(opt => {
                                                if (opt.textContent.trim() === 'All') {
                                                    opt.click();
                                                    opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                                                    opt.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                                                }
                                            });
                                        }, 100);
                                    }
                                });
                            }, 100);
                        }, 100);
                    }
                });

                return attrFound;
            } catch (error) {
                return false;
            }
        }

        async processPastDelsSequence() {
            try {
                const success = await this.configureAttributeAndFilter();
                if (success) {
                    this.retryAttempt = 0;
                    return true;
                } else {
                    if (this.retryAttempt < 1) {
                        this.retryAttempt++;
                        await new Promise(r => setTimeout(r, 2000));
                        return await this.processPastDelsSequence();
                    }
                    this.retryAttempt = 0;
                    return false;
                }
            } catch (error) {
                this.retryAttempt = 0;
                return false;
            }
        }

        async refreshPanelData() {
            const timerElement = document.querySelector(".css-laozi4 .css-2lt2bb");
            if (timerElement) {
                const timerVal = timerElement.textContent.trim();
                if (this.checkTimerChange(timerVal)) {
                    await new Promise(r => setTimeout(r, 2000));
                    await this.processPastDelsSequence();
                    return;
                }
            }

            const currAddrId = this.extractAddressId();
            if (currAddrId && currAddrId !== this.prevAddrId) {
                this.prevAddrId = currAddrId;
                await new Promise(r => setTimeout(r, 2000));
                await this.processPastDelsSequence();
            }
        }

        startDataMonitoring() {
            this.refreshPanelData();
            setTimeout(() => this.startDataMonitoring(), 1000);
        }

        init() {
            console.log("🚀 GeoStudio Past Deliveries Automation started");
            this.startDataMonitoring();
        }
    }

    setTimeout(() => {
        const autoDelivery = new DeliveryAutomation();
        autoDelivery.init();

        // ⌨️ Just "P" key (case-insensitive)
        document.addEventListener("keydown", (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
            if (e.key.toLowerCase() === "p") {
                console.log("⌨️ 'P' key triggered: Running Past Deliveries sequence manually...");
                autoDelivery.processPastDelsSequence();
            }
        });

    }, 2000);
})();
