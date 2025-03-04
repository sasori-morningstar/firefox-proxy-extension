document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectProxy');
    const disconnectButton = document.getElementById('disconnectProxy');
    const statusDiv = document.getElementById('status');

    // Hardcoded proxy configuration
    const proxyConfig = {
        type: "http",
        host: "rotating.proxyempire.io",
        port: 9001,
        username: "AcpVQtYstcLT4Q7d",
        password: "wifi;fr;;;"
    };

    // Check proxy status on popup load
    browser.runtime.sendMessage({ type: "checkProxyStatus" }, (response) => {
        updateButtonStates(response.isConnected);
        if (response.isConnected) {
            statusDiv.textContent = 'Proxy Connected';
            statusDiv.className = 'connected';
        } else {
            statusDiv.textContent = 'Proxy Disconnected';
            statusDiv.className = 'disconnected';
        }
    });

    connectButton.addEventListener('click', () => {
        browser.runtime.sendMessage({
            type: "connectProxy",
            proxy: proxyConfig
        }, (response) => {
            if (response.success) {
                statusDiv.textContent = 'Proxy Connected';
                statusDiv.className = 'connected';
                browser.storage.local.set({ proxyConfig: proxyConfig });
                updateButtonStates(true);
            } else {
                statusDiv.textContent = 'Failed to connect proxy';
                statusDiv.className = 'disconnected';
            }
        });
    });

    disconnectButton.addEventListener('click', () => {
        browser.runtime.sendMessage({
            type: "disconnectProxy"
        }, (response) => {
            if (response.success) {
                statusDiv.textContent = 'Proxy Disconnected';
                statusDiv.className = 'disconnected';
                browser.storage.local.remove("proxyConfig");
                updateButtonStates(false);
            } else {
                statusDiv.textContent = 'Failed to disconnect proxy';
                statusDiv.className = 'disconnected';
            }
        });
    });

    function updateButtonStates(isConnected) {
        connectButton.disabled = isConnected;
        disconnectButton.disabled = !isConnected;
    }
});