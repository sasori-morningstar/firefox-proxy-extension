// Function to configure proxy for all web requests
function setupProxyRouting(proxyConfig) {
    try {
        // Remove any existing proxy settings
        browser.proxy.settings.clear({});

        if (!proxyConfig || !proxyConfig.host) {
            console.log("No proxy configuration found. Skipping proxy setup.");
            return;
        }

        // Construct comprehensive proxy configuration
        const proxySettings = {
            proxyType: "manual",
            http: `${proxyConfig.type}://${proxyConfig.host}:${proxyConfig.port}`,
            https: `${proxyConfig.type}://${proxyConfig.host}:${proxyConfig.port}`,
            socks: `${proxyConfig.type}://${proxyConfig.host}:${proxyConfig.port}`,
            httpProxyAll: true
        };

        // Set proxy settings
        browser.proxy.settings.set({ value: proxySettings });

        // Interceptor for all web requests to ensure proxy usage
        browser.proxy.onRequest.addListener(
            (details) => {
                return {
                    type: proxyConfig.type.toUpperCase(),
                    host: proxyConfig.host,
                    port: proxyConfig.port
                };
            },
            { urls: ["<all_urls>"] }
        );

        // Handle proxy authentication if credentials are provided
        if (proxyConfig.username && proxyConfig.password) {
            browser.webRequest.onAuthRequired.addListener(
                (details, callback) => {
                    callback({
                        authCredentials: {
                            username: proxyConfig.username,
                            password: proxyConfig.password
                        }
                    });
                },
                { urls: ["<all_urls>"] },
                ["blocking"]
            );
        }

        console.log("Proxy routing configured:", proxySettings);
    } catch (error) {
        console.error("Error setting up proxy routing:", error);
    }
}

// Listen for messages from popup to update proxy
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "updateProxy") {
        // Save proxy configuration to local storage
        browser.storage.local.set({ proxyConfig: request.proxy }, () => {
            setupProxyRouting(request.proxy);
            sendResponse({ success: true });
        });
        return true;
    }
});

// Initialize proxy on extension startup
browser.runtime.onStartup.addListener(async () => {
    const { proxyConfig } = await browser.storage.local.get("proxyConfig");
    if (proxyConfig) {
        setupProxyRouting(proxyConfig);
    }
});

// Initialize proxy on extension installation
browser.runtime.onInstalled.addListener(async () => {
    const { proxyConfig } = await browser.storage.local.get("proxyConfig");
    if (proxyConfig) {
        setupProxyRouting(proxyConfig);
    }
});