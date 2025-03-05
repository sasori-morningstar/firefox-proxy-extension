document.addEventListener('DOMContentLoaded', () => {
    const selectedProxyInput = document.getElementById('proxy');
    const powerButton = document.getElementsByClassName('power-btn')[0];
    const uptimeElement = document.getElementById('uptime');
    const downtimeElement = document.getElementById("downtime");
    let isRunning = false;

    // Fetch actual ip address info
    fetchIpInfo();

    // Define two different proxy configurations
    const proxy1Config = {
        type: "http",
        host: "rotating.proxyempire.io",
        port: 9001,
        username: "AcpVQtYstcLT4Q7d",
        password: "wifi;fr;;;"
    };

    const proxy2Config = {
        type: "http",
        host: "rotating.proxyempire.io",
        port: 9001,
        username: "AcpVQtYstcLT4Q7d",
        password: "wifi;fr;;;"
    };

    // Check proxy status on popup load
    browser.runtime.sendMessage({ type: "checkProxyStatus" }, (response) => {
        if (response.isConnected) {
            powerButton.classList.add('power-clicked');
            isRunning = true;
        } else {
            powerButton.classList.remove('power-clicked');
            isRunning = false;
        }
        fetchIpInfo();
    });

    // Power button
    powerButton.addEventListener('click', () => {
        if(!isRunning){
            const proxyValue = selectedProxyInput.value;
            let proxyConfig;

            if (proxyValue === "proxy1") {
                proxyConfig = proxy1Config;
            } else if (proxyValue === "proxy2") {
                proxyConfig = proxy2Config;
            } else {
                console.error("Invalid proxy selection");
                return;
            }

            // IMPORTANT: Pass the proxy configuration in the message
            browser.runtime.sendMessage({ 
                type: "connectProxy", 
                proxy: proxyConfig  // Add this line
            }, (response) => {
                if (response.success) {
                    powerButton.classList.add('power-clicked');
                    browser.storage.local.set({ proxyConfig: proxyConfig });
                    fetchIpInfo();
                    isRunning = true;
                }
            });
        } else {
            browser.runtime.sendMessage({ type: "disconnectProxy" }, (response) => {
                if (response.success) {
                    powerButton.classList.remove('power-clicked');
                    browser.storage.local.remove("proxyConfig");
                    fetchIpInfo();
                    isRunning = false;
                }
            });
        }
    });

    selectedProxyInput.addEventListener('change', () => {
        if(isRunning){
            browser.runtime.sendMessage({ type: "disconnectProxy" }, (response) => {
                if (response.success) {
                    powerButton.classList.remove('power-clicked');
                    browser.storage.local.remove("proxyConfig");
                    fetchIpInfo();
                    isRunning = false;
                }
            });
        }

        const proxyValue = selectedProxyInput.value;
        let proxyConfig;

        if (proxyValue === "proxy1") {
            proxyConfig = proxy1Config;
        } else if (proxyValue === "proxy2") {
            proxyConfig = proxy2Config;
        } else {
            console.error("Invalid proxy selection");
            return;
        }

        browser.runtime.sendMessage({ 
            type: "connectProxy", 
            proxy: proxyConfig  // Add this line
        }, (response) => {
            if (response.success) {
                powerButton.classList.add('power-clicked');
                browser.storage.local.set({ proxyConfig: proxyConfig });
                fetchIpInfo();
                isRunning = true;
            }
        });
    });

    function fetchIpInfo(){
        fetch('https://ipinfo.io/json')
        .then(response => response.json())
        .then(data => {
            const { ip, org, city, region, country } = data;
            const isp = `${org.split(' ')[1]} ${org.split(' ')[2] || ''}`;
            document.getElementById('ip').textContent = ip || 'N/A';
            document.getElementById('isp').textContent = isp || 'N/A';
            document.getElementById('city').textContent = city || 'N/A';
            document.getElementById('region').textContent = region || 'N/A';
            document.getElementById('country').textContent = country || 'N/A';
        })
        .catch(error => {
            console.error("Error fetching IP info:", error);
        });
    }
    // Function to format speed
    function formatSpeed(speedInBps) {
        if (speedInBps < 1000) {
            return `${speedInBps.toFixed(1)} bps`;
        } else if (speedInBps < 1000000) {
            return `${(speedInBps / 1000).toFixed(1)} kbps`;
        } else {
            return `${(speedInBps / 1000000).toFixed(1)} Mbps`;
        }
    }
    // Function to track network speeds
    function trackNetworkSpeeds() {
        // Use browser.webRequest to track network traffic
        let downloadBytes = 0;
        let uploadBytes = 0;
        let startTime = Date.now();

        // Listener for download tracking
        browser.webRequest.onResponseStarted.addListener(
            (details) => {
                if (details.type !== 'main_frame') {
                    downloadBytes += details.responseSize || 0;
                }
            },
            { urls: ["<all_urls>"] }
        );

        // Listener for upload tracking
        browser.webRequest.onBeforeRequest.addListener(
            (details) => {
                if (details.method === 'POST' || details.method === 'PUT') {
                    uploadBytes += details.requestBody?.raw?.length || 0;
                }
            },
            { urls: ["<all_urls>"] },
            ["requestBody"]
        );

        // Update speed every 2 seconds
        setInterval(() => {
            const currentTime = Date.now();
            const elapsedSeconds = (currentTime - startTime) / 1000;

            const downloadSpeed = downloadBytes / elapsedSeconds;
            const uploadSpeed = uploadBytes / elapsedSeconds;

            // Update UI
            downtimeElement.textContent = formatSpeed(downloadSpeed);
            uptimeElement.textContent = formatSpeed(uploadSpeed);

            // Reset counters
            downloadBytes = 0;
            uploadBytes = 0;
            startTime = currentTime;
        }, 2000);
    }

    // Start tracking network speeds
    trackNetworkSpeeds();
});