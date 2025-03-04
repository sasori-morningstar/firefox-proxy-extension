document.addEventListener('DOMContentLoaded', () => {
    const connectProxy1Button = document.getElementById('connectProxy1');
    const connectProxy2Button = document.getElementById('connectProxy2');
    const disconnectButton = document.getElementById('disconnectProxy');
    const statusDiv = document.getElementById('status');

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
        host: "another.proxy.provider.com",
        port: 8080,
        username: "username2",
        password: "password2"
    };

    // Check proxy status on popup load
    browser.runtime.sendMessage({ type: "checkProxyStatus" }, (response) => {
        updateButtonStates(response.isConnected);
        if (response.isConnected) {
            statusDiv.textContent = `Connected to ${response.proxyConfig.host}`;
            statusDiv.className = 'connected';
        } else {
            statusDiv.textContent = 'Proxy Disconnected';
            statusDiv.className = 'disconnected';
        }
    });

    // Connect Proxy 1 button
    connectProxy1Button.addEventListener('click', () => {
        browser.runtime.sendMessage({
            type: "connectProxy",
            proxy: proxy1Config
        }, (response) => {
            if (response.success) {
                statusDiv.textContent = `Connected to ${proxy1Config.host}`;
                statusDiv.className = 'connected';
                browser.storage.local.set({ proxyConfig: proxy1Config });
                updateButtonStates(true);
            } else {
                statusDiv.textContent = 'Failed to connect proxy';
                statusDiv.className = 'disconnected';
            }
        });
    });

    // Connect Proxy 2 button
    connectProxy2Button.addEventListener('click', () => {
        browser.runtime.sendMessage({
            type: "connectProxy",
            proxy: proxy2Config
        }, (response) => {
            if (response.success) {
                statusDiv.textContent = `Connected to ${proxy2Config.host}`;
                statusDiv.className = 'connected';
                browser.storage.local.set({ proxyConfig: proxy2Config });
                updateButtonStates(true);
            } else {
                statusDiv.textContent = 'Failed to connect proxy';
                statusDiv.className = 'disconnected';
            }
        });
    });

    // Disconnect button
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
        connectProxy1Button.disabled = isConnected;
        connectProxy2Button.disabled = isConnected;
        disconnectButton.disabled = !isConnected;
    }
});