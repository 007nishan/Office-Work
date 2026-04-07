// ==UserScript==
// @name         B.O.A.K
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Click-only menu, vertical layout, new position
// @match        https://na.geostudio.last-mile.amazon.dev/*
// @author       rohanjit@
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const styles = `
        .hover-menu {
            position: absolute;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            display: none;
            padding: 4px;
            z-index: 100000;
            top: 55px;
            left: 0;
            display: flex;
            flex-direction: column;
        }
        .hover-menu button {
            display: block;
            width: 100px;
            padding: 4px 6px;
            margin: 1px 0;
            border: none;
            border-radius: 3px;
            background: #fff;
            cursor: pointer;
            text-align: left;
            font-size: 11px;
            white-space: nowrap;
        }
        .hover-menu button:hover {
            background: #e0e0e0;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    let windows = {
        bing: null,
        osm: null,
        adri: null,
        kibana: null
    };

function extractAddressAndCoords() {
    return new Promise((resolve) => {
        try {
            const input = document.querySelector('#input-dp-geocode');
            const coords = input ? input.value.trim() : '';

            const customerAddressElement = document.querySelector(
                ".css-1xats7y .css-hd6zo3"
            );
            if (!customerAddressElement) {
                setTimeout(() => extractAddressAndCoords().then(resolve), 1000);
                return;
            }
            const address = customerAddressElement.textContent.trim();
            if (!address) {
                setTimeout(() => extractAddressAndCoords().then(resolve), 1000);
                return;
            }

            resolve({ address, coords });
        } catch (error) {
            console.error('Extraction error:', error);
            setTimeout(() => extractAddressAndCoords().then(resolve), 1000);
        }
    });
}

    function waitForElementsAndInsertPanel(geoSelector) {
        const observer = new MutationObserver(() => {
            const input = document.querySelector(geoSelector);
            const addressElements = document.querySelectorAll('.css-1iomfh4 .css-hd6zo3');
            if (input && addressElements.length > 0 && !document.querySelector('#mapToolsPanel')) {
                insertPanel(input);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function makeButton(label, title, options) {
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
        const menu = document.createElement('div');
        menu.className = 'hover-menu';
        menu.style.display = 'none';

        Object.entries(options).forEach(([text, handler]) => {
            const option = document.createElement('button');
            option.textContent = text;
            option.onclick = () => {
                menu.style.display = 'none';
                handler();
            };
            menu.appendChild(option);
        });

        btn.onclick = () => {
            document.querySelectorAll('.hover-menu').forEach(m => {
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

    function updatePanelPosition(panel) {
        const editPanel = document.querySelector('._3yG5UlL020qNbegyVK2vrw');
        const editPanelVisible = editPanel && window.getComputedStyle(editPanel).display !== 'none';
        const rightPosition = editPanelVisible ? '320px' : '8px';
        panel.style.right = rightPosition;
    }

    function insertPanel(input) {
        const panel = document.createElement('div');
        panel.id = 'mapToolsPanel';
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

        panel.appendChild(makeButton('B', 'Bing Maps', {
            'Address Search': async () => {
                const { address } = await extractAddressAndCoords();
                if (!address) return alert('Missing address!');
                const encodedAddress = encodeURIComponent(address);
                const url = `https://www.bing.com/maps?where1=${encodedAddress}`;
                openOrReuseWindow('bing', url, 'bingMapsTab');
            },
            'Coordinates': async () => {
                const { coords } = await extractAddressAndCoords();
                if (!coords) return alert('Missing coordinates!');
                const [lat, lon] = coords.split(',').map(s => s.trim());
                const url = `https://www.bing.com/maps?where1=${lat}%2C${lon}&cp=${lat}~${lon}&lvl=11.0`;
                openOrReuseWindow('bing', url, 'bingMapsTab');
            }
        }));

        panel.appendChild(makeButton('O', 'OpenStreetMap', {
            'Address Search': async () => {
                const { address } = await extractAddressAndCoords();
                if (!address) return alert('Missing address!');
                const encodedAddress = encodeURIComponent(address);
                const url = `https://www.openstreetmap.org/search?query=${encodedAddress}`;
                openOrReuseWindow('osm', url, 'osmMapsTab');
            },
            'Coordinates': async () => {
                const { coords } = await extractAddressAndCoords();
                if (!coords) return alert('Missing coordinates!');
                const [lat, lon] = coords.split(',').map(s => s.trim());
                const url = `https://www.openstreetmap.org/search?query=${lat}%2C${lon}&zoom=19#map=19/${lat}/${lon}`;
                openOrReuseWindow('osm', url, 'osmMapsTab');
            }
        }));

        panel.appendChild(makeButton('A', 'ADRI', async () => {
            const { coords } = await extractAddressAndCoords();
            if (!coords) return alert('Missing coordinates!');
            const [lat, lon] = coords.split(',').map(s => s.trim());
            const url = `https://viewer.prod-tools.maps.a2z.com/single?style=amazon-delivery-rabbit-internal&version=2.5&tileUrl=https%3A%2F%2F5.visualization.resources.maps.a2z.com%2F%7Bprefix%7D%2F4.0%2F%7Bz%7D%2F%7Bx%7D%2F%7By%7D%2Ftile.mvt&goToOption=Co-ordinates#17.08/${lat}/${lon}`;
            openOrReuseWindow('adri', url, 'adriMapsTab');
        }));

panel.appendChild(makeButton('K', 'Kibana (Street / Unit)', {
    'Street': async () => {
        const { address } = await extractAddressAndCoords();
        if (!address) return alert('Address is empty!');
        const encodedQuery = encodeURIComponent(address);
        const url = `https://search-lastmile-gis-addresses-ri43h2hevbez2rrfrs2kfi5vjq.eu-west-1.es.amazonaws.com/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(number,street,city,state,postcode,lat,lon),filters:!(),index:f9b55970-70e8-11ef-91d5-81b3830606f8,interval:auto,query:(language:lucene,query:'${encodedQuery}'),sort:!())`;
        openOrReuseWindow('kibana_street', url, 'kibanaStreetTab');
    },
    'Unit': async () => {
        const { address } = await extractAddressAndCoords();
        if (!address) return alert('Address is empty!');
        const encodedQuery = encodeURIComponent(address);
        const url = `https://search-lastmile-gis-addresses-ri43h2hevbez2rrfrs2kfi5vjq.eu-west-1.es.amazonaws.com/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(unit_number,number,street,city,state,postcode,lat_lon_string),filters:!(),index:'0e6e0f70-7124-11ef-a0fa-69aac1e0be67',interval:auto,query:(language:lucene,query:'${encodedQuery}'),sort:!())`;
        openOrReuseWindow('kibana_unit', url, 'kibanaUnitTab');
    }
}));

        document.body.appendChild(panel);
        document.addEventListener('click', function (event) {
        const isClickInside = event.target.closest('.hover-menu') || event.target.closest('button');
        if (!isClickInside) {
            document.querySelectorAll('.hover-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });

        const observer = new MutationObserver(function() {
            updatePanelPosition(panel);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        setTimeout(() => updatePanelPosition(panel), 500);
}

    function openOrReuseWindow(key, url, name) {
        if (!windows[key] || windows[key].closed) {
            windows[key] = window.open(url, name);
        } else {
            windows[key].location.href = url;
            windows[key].focus();
        }
    }

    waitForElementsAndInsertPanel('#input-dp-geocode');
})();
