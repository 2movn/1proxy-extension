// Xử lý xác thực proxy cho manifest v3
chrome.webRequest.onAuthRequired.addListener(
    async function(details, callback) {
        chrome.storage.local.get(['savedProxyData'], function(result) {
            if (result.savedProxyData && result.savedProxyData.username && result.savedProxyData.password) {
                callback({
                    authCredentials: {
                        username: result.savedProxyData.username,
                        password: result.savedProxyData.password
                    }
                });
            } else {
                callback();
            }
        });
    },
    { urls: ["<all_urls>"] },
    ["asyncBlocking"]
);

// Khởi tạo cài đặt khi extension được cài đặt
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({
        'apiKey': '',
        'isProxyEnabled': true,
        'savedProxyData': null
    });
});

// Xử lý thay đổi proxy
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateProxy') {
        const { config, ...proxyData } = request.proxyData;

        // Áp dụng cấu hình proxy
        chrome.proxy.settings.set(
            { value: config, scope: 'regular' },
            function() {
                // Lưu thông tin proxy
                chrome.storage.local.set({
                    'savedProxyData': proxyData
                });
                sendResponse({ success: true });
            }
        );
        return true;
    }
    
    if (request.action === 'disableProxy') {
        chrome.proxy.settings.clear({ scope: 'regular' }, function() {
            chrome.storage.local.set({ 'savedProxyData': null });
            sendResponse({ success: true });
        });
        return true;
    }
});

