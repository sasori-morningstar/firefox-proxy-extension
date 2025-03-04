// Global variable to store current proxy configuration and listeners
let currentProxyConfig = null;
let proxyListener = null;
let authListener = null;

// Proxy configuration function
function setupProxyRouting(proxyConfig) {
    try {
        // Remove any existing proxy listeners first
        if (proxyListener) {
            browser.proxy.onRequest.removeListener(proxyListener);
        }

        // Store the current proxy configuration
        currentProxyConfig = proxyConfig;

        // Create a new proxy listener function
        proxyListener = (requestInfo) => {
            return {
                type: proxyConfig.type.toUpperCase(),
                host: proxyConfig.host,
                port: proxyConfig.port,
                username: proxyConfig.username,
                password: proxyConfig.password
            };
        };

        // Add the proxy listener
        browser.proxy.onRequest.addListener(
            proxyListener,
            { urls: ["<all_urls>"] }
        );

        // Handle proxy authentication
        authListener = (details) => {
            // If credentials are provided, automatically return them
            if (proxyConfig.username && proxyConfig.password) {
                return {
                    authCredentials: {
                        username: proxyConfig.username,
                        password: proxyConfig.password
                    }
                };
            }
            // If no credentials, allow default browser behavior
            return {};
        };

        browser.webRequest.onAuthRequired.addListener(
            authListener,
            { urls: ["<all_urls>"] },
            ["blocking"]
        );

        console.log("Proxy routing configured:", proxyConfig);
        return true;
    } catch (error) {
        console.error("Error setting up proxy routing:", error);
        return false;
    }
}

// Function to disconnect proxy
function disconnectProxy() {
    try {
        // Remove proxy listener if it exists
        if (proxyListener) {
            browser.proxy.onRequest.removeListener(proxyListener);
            proxyListener = null;
        }

        // Remove authentication listener if it exists
        if (authListener) {
            browser.webRequest.onAuthRequired.removeListener(authListener);
            authListener = null;
        }

        // Clear current proxy configuration
        currentProxyConfig = null;

        console.log("Proxy disconnected");
        return true;
    } catch (error) {
        console.error("Error disconnecting proxy:", error);
        return false;
    }
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "connectProxy") {
        const success = setupProxyRouting(request.proxy);
        sendResponse({ success: success });
        return true;
    }

    if (request.type === "disconnectProxy") {
        const success = disconnectProxy();
        sendResponse({ success: success });
        return true;
    }

    if (request.type === "checkProxyStatus") {
        sendResponse({ 
            isConnected: currentProxyConfig !== null,
            proxyConfig: currentProxyConfig
        });
        return true;
    }
});

// On startup, check if we had a previous proxy configuration
browser.runtime.onStartup.addListener(async () => {
    const { proxyConfig } = await browser.storage.local.get("proxyConfig");
    if (proxyConfig) {
        setupProxyRouting(proxyConfig);
    }
});