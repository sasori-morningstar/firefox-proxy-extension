document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveProxy');
    const statusDiv = document.getElementById('status');

    // Load existing proxy settings
    browser.storage.local.get("proxyConfig").then((data) => {
        if (data.proxyConfig) {
            document.getElementById('proxyType').value = data.proxyConfig.type;
            document.getElementById('proxyHost').value = data.proxyConfig.host;
            document.getElementById('proxyPort').value = data.proxyConfig.port;
            document.getElementById('proxyUsername').value = data.proxyConfig.username || '';
            document.getElementById('proxyPassword').value = data.proxyConfig.password || '';
        }
    });

    saveButton.addEventListener('click', () => {
        const proxyType = document.getElementById('proxyType').value;
        const proxyHost = document.getElementById('proxyHost').value;
        const proxyPort = parseInt(document.getElementById('proxyPort').value, 10);
        const proxyUsername = document.getElementById('proxyUsername').value;
        const proxyPassword = document.getElementById('proxyPassword').value;

        // Validate required fields
        if (!proxyHost || !proxyPort) {
            statusDiv.textContent = 'Please enter host and port';
            statusDiv.style.color = 'red';
            return;
        }

        const proxyConfig = {
            type: proxyType,
            host: proxyHost,
            port: proxyPort,
            username: proxyUsername,
            password: proxyPassword
        };

        // Send proxy configuration to background script
        browser.runtime.sendMessage({
            type: "updateProxy",
            proxy: proxyConfig
        }, (response) => {
            if (response.success) {
                statusDiv.textContent = 'Proxy settings saved and applied';
                statusDiv.style.color = 'green';
            } else {
                statusDiv.textContent = 'Failed to save proxy settings';
                statusDiv.style.color = 'red';
            }
        });
    });
});