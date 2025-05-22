document.addEventListener('DOMContentLoaded', function () {
    // Khởi tạo các biến DOM elements đúng với giao diện
    const apiKeyInput = document.getElementById('apiKey');
    const proxyListInput = document.getElementById('proxyList');
    const saveBtn = document.getElementById('saveBtn');
    const randomBtn = document.getElementById('randomBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusDiv = document.getElementById('status');
    const proxyInfoDiv = document.getElementById('proxyInfo');
    const ipInfoDiv = document.getElementById('ipInfo');
    const apiInputGroup = document.getElementById('apiInputGroup');
    const listInputGroup = document.getElementById('listInputGroup');
    const proxyTypeRadios = document.getElementsByName('proxyType');
    const protocolRadios = document.getElementsByName('protocol');

    let isProxyActive = false;

    // Kiểm tra input để enable/disable nút Save
    function checkInputs() {
        try {
            const selectedType = document.querySelector('input[name="proxyType"]:checked')?.value || 'api';
            const hasApiKey = apiKeyInput && apiKeyInput.value.trim() !== '';
            const hasProxyList = proxyListInput && proxyListInput.value.trim() !== '';
            
            if (saveBtn) {
                saveBtn.disabled = !(selectedType === 'api' ? hasApiKey : hasProxyList);
            }
            
            if (randomBtn) {
                randomBtn.disabled = !(hasApiKey || hasProxyList);
                randomBtn.textContent = isProxyActive ? 'Change Proxy' : 'Start';
            }

            if (stopBtn) {
                stopBtn.disabled = !isProxyActive;
            }
        } catch (error) {
            console.error('Error in checkInputs:', error);
        }
    }

    // Xử lý radio buttons
    if (proxyTypeRadios.length > 0) {
        proxyTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                try {
                    if (apiInputGroup && listInputGroup) {
                        if (this.value === 'api') {
                            apiInputGroup.style.display = 'block';
                            listInputGroup.style.display = 'none';
                        } else {
                            apiInputGroup.style.display = 'none';
                            listInputGroup.style.display = 'block';
                        }
                    }
                    checkInputs();
                } catch (error) {
                    console.error('Error in radio change:', error);
                }
            });
        });
    }

    // Thêm event listeners cho input fields
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', checkInputs);
    }

    if (proxyListInput) {
        proxyListInput.addEventListener('input', checkInputs);
    }

    // Hiển thị thông báo
    function showStatus(message, isError = false) {
        try {
            if (statusDiv) {
                statusDiv.textContent = message;
                statusDiv.className = 'status ' + (isError ? 'error' : 'success');
                statusDiv.style.display = 'block';
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 3000);
            }
        } catch (error) {
            console.error('Error in showStatus:', error);
        }
    }

    // Hiển thị thông tin proxy
    function showProxyInfo(proxyData) {
        try {
            if (!proxyInfoDiv) return;
            
            const elements = {
                protocol: document.getElementById('currentProtocol'),
                ip: document.getElementById('currentIp'),
                port: document.getElementById('currentPort'),
                username: document.getElementById('currentUsername'),
                password: document.getElementById('currentPassword'),
                location: document.getElementById('currentLocation')
            };

            if (elements.protocol) elements.protocol.textContent = proxyData.scheme?.toUpperCase() || '-';
            if (elements.ip) elements.ip.textContent = proxyData.host || '-';
            if (elements.port) elements.port.textContent = proxyData.port || '-';
            if (elements.username) elements.username.textContent = proxyData.username || '-';
            if (elements.password) elements.password.textContent = proxyData.password || '-';
            if (elements.location) elements.location.textContent = proxyData.geo_local || '-';

            proxyInfoDiv.classList.add('active');
        } catch (error) {
            console.error('Error in showProxyInfo:', error);
        }
    }

    // Hiển thị thông tin IP
    function showIpInfo(data) {
        try {
            if (!ipInfoDiv) return;
            
            const elements = {
                ip: document.getElementById('currentPublicIp'),
                timezone: document.getElementById('currentTimezone'),
                city: document.getElementById('currentCity'),
                country: document.getElementById('currentCountry')
            };

            if (elements.ip) elements.ip.textContent = data.ip || '-';
            if (elements.timezone) elements.timezone.textContent = data.timezone || '-';
            if (elements.city) elements.city.textContent = data.city || '-';
            if (elements.country) elements.country.textContent = data.country || '-';
        } catch (error) {
            console.error('Error in showIpInfo:', error);
        }
    }

    // Lấy proxy từ API
    async function getProxyFromApi(apiKey) {
        try {
            const response = await fetch(`https://1proxy.net/api/premium/roat-proxy?key=${apiKey}`);
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            if (data.status !== 'SUCCESS') {
                throw new Error(data.message || 'API request failed');
            }

            const selectedProtocol = document.querySelector('input[name="protocol"]:checked')?.value || 'http';
            return {
                host: data.data.ip,
                port: data.data.port,
                username: data.data.username,
                password: data.data.password,
                geo_local: data.data.geo_local,
                scheme: selectedProtocol
            };
        } catch (error) {
            throw new Error('Không thể lấy proxy từ API: ' + error.message);
        }
    }

    // Lấy random proxy từ danh sách
    function getRandomProxy(proxyList) {
        try {
            // Parse JSON string thành array
            const proxies = JSON.parse(proxyList);
            
            if (!Array.isArray(proxies) || proxies.length === 0) {
                throw new Error('Danh sách proxy trống');
            }

            const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
            const selectedProtocol = document.querySelector('input[name="protocol"]:checked')?.value || 'http';
            
            return {
                host: randomProxy.ip,
                port: randomProxy.port,
                username: randomProxy.username,
                password: randomProxy.password,
                geo_local: randomProxy.geo_local,
                scheme: selectedProtocol
            };
        } catch (error) {
            throw new Error('Không thể lấy proxy từ danh sách: ' + error.message);
        }
    }

    // Hàm chuyển đổi JSON thành text theo dòng
    function formatProxyListToText(proxyList) {
        try {
            // Nếu là string JSON, parse thành array
            const proxies = typeof proxyList === 'string' ? JSON.parse(proxyList) : proxyList;
            
            // Format mỗi proxy thành một dòng
            return proxies.map(proxy => {
                if (proxy.username && proxy.password) {
                    return `${proxy.ip}:${proxy.port}:${proxy.username}:${proxy.password}`;
                }
                return `${proxy.ip}:${proxy.port}`;
            }).join('\n');
        } catch (error) {
            console.error('Error formatting proxy list:', error);
            return '';
        }
    }

    // Hàm chuyển đổi text thành JSON
    function formatTextToProxyList(text) {
        try {
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line !== '');

            return lines.map(line => {
                const parts = line.split(':');
                return {
                    ip: parts[0],
                    port: parseInt(parts[1]),
                    username: parts[2] || '',
                    password: parts[3] || '',
                    scheme: 'http'
                };
            });
        } catch (error) {
            console.error('Error parsing proxy list:', error);
            return [];
        }
    }

    // Lưu cấu hình
    async function saveConfig() {
        try {
            const selectedType = document.querySelector('input[name="proxyType"]:checked')?.value;
            const selectedProtocol = document.querySelector('input[name="protocol"]:checked')?.value;
            
            if (!selectedType || !selectedProtocol) {
                throw new Error('Vui lòng chọn loại proxy và protocol');
            }

            const apiKey = apiKeyInput?.value.trim() || '';
            let proxyList = proxyListInput?.value.trim() || '';
            
            if (selectedType === 'api' && !apiKey) {
                throw new Error('Vui lòng nhập API key');
            }
            
            if (selectedType === 'list' && !proxyList) {
                throw new Error('Vui lòng nhập danh sách proxy');
            }

            // Chuyển đổi proxyList thành JSON nếu là danh sách
            if (selectedType === 'list') {
                const proxyArray = formatTextToProxyList(proxyList);
                proxyList = JSON.stringify(proxyArray);
            }

            // Lưu vào chrome.storage.local
            await chrome.storage.local.set({
                proxyType: selectedType,
                protocol: selectedProtocol,
                apiKey,
                proxyList,
                lastUpdated: new Date().toISOString()
            });

            showStatus('Đã lưu cấu hình thành công');
            if (randomBtn) randomBtn.disabled = false;
        } catch (error) {
            showStatus(error.message, true);
        }
    }

    // Random proxy
    async function randomProxy() {
        try {
            // Khóa nút Change trong 5 giây
            if (randomBtn) {
                randomBtn.disabled = true;
                let countdown = 5;
                const originalText = randomBtn.textContent;
                randomBtn.textContent = `Đợi ${countdown}s...`;
                
                const countdownInterval = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        randomBtn.textContent = `Đợi ${countdown}s...`;
                    } else {
                        clearInterval(countdownInterval);
                        randomBtn.textContent = originalText;
                        randomBtn.disabled = false;
                    }
                }, 1000);
            }

            const { proxyType, apiKey, proxyList } = await chrome.storage.local.get(['proxyType', 'apiKey', 'proxyList']);
            let proxyData;

            if (proxyType === 'api' && apiKey) {
                proxyData = await getProxyFromApi(apiKey);
            } else if (proxyType === 'list' && proxyList) {
                proxyData = getRandomProxy(proxyList);
            } else {
                throw new Error('Chưa có cấu hình proxy');
            }

            const selectedProtocol = document.querySelector('input[name="protocol"]:checked')?.value || 'http';
            proxyData.scheme = selectedProtocol;

            const config = {
                mode: "fixed_servers",
                rules: {
                    singleProxy: {
                        scheme: proxyData.scheme,
                        host: proxyData.host,
                        port: proxyData.port
                    },
                    bypassList: [
                        proxyData.host,
                        '127.0.0.1',
                        '192.168.1.*',
                        '*.1proxy.net',
                        '*.ipviet.store',
                        'localhost',
                        '*.local'
                    ]
                }
            };

            if (proxyData.scheme === 'socks5') {
                // Cấu hình cho SOCKS5
                config.rules.singleProxy = {
                    scheme: 'socks5',
                    host: proxyData.host,
                    port: proxyData.port
                };

                // Thêm cấu hình proxy DNS cho SOCKS5
                await chrome.proxy.settings.set({
                    value: {
                        mode: "fixed_servers",
                        rules: {
                            singleProxy: {
                                scheme: "socks5",
                                host: proxyData.host,
                                port: proxyData.port
                            },
                            bypassList: config.rules.bypassList
                        }
                    },
                    scope: 'regular'
                });

                // Cấu hình WebRTC để sử dụng proxy
                await chrome.privacy.network.webRTCIPHandlingPolicy.set({
                    value: 'disable_non_proxied_udp'
                });

                // Cấu hình DNS cho SOCKS5
                await chrome.proxy.settings.set({
                    value: {
                        mode: "fixed_servers",
                        rules: {
                            singleProxy: {
                                scheme: "socks5",
                                host: proxyData.host,
                                port: proxyData.port
                            },
                            bypassList: config.rules.bypassList
                        }
                    },
                    scope: 'regular'
                });
            } else {
                // Cấu hình cho HTTP
                await chrome.proxy.settings.set({
                    value: config,
                    scope: 'regular'
                });

                // Reset WebRTC policy về mặc định cho HTTP
                await chrome.privacy.network.webRTCIPHandlingPolicy.set({
                    value: 'default'
                });
            }

            // Nếu đang có proxy active, gửi message để disable trước
            if (isProxyActive) {
                await chrome.runtime.sendMessage({
                    action: 'disableProxy'
                });
            }

            // Đợi một chút để đảm bảo proxy cũ đã được tắt
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Cập nhật proxy mới
            await chrome.runtime.sendMessage({
                action: 'updateProxy',
                proxyData: {
                    ...proxyData,
                    config
                }
            });

            // Lưu thông tin proxy hiện tại
            await chrome.storage.local.set({
                'savedProxyData': proxyData
            });

            showProxyInfo(proxyData);
            showStatus('Đã cập nhật proxy thành công');
            isProxyActive = true;
            checkInputs();
            
            // Đợi một chút trước khi kiểm tra IP
            setTimeout(checkCurrentIp, 2000);
        } catch (error) {
            showStatus(error.message, true);
            // Reset nút nếu có lỗi
            if (randomBtn) {
                randomBtn.disabled = false;
                randomBtn.textContent = isProxyActive ? 'Change Proxy' : 'Start';
            }
        }
    }

    // Dừng proxy
    async function stopProxy() {
        try {
            // Gửi message để disable proxy
            await chrome.runtime.sendMessage({
                action: 'disableProxy'
            });
            
            // Reset WebRTC policy
            await chrome.privacy.network.webRTCIPHandlingPolicy.set({
                value: 'default'
            });
            
            // Xóa thông tin proxy hiện tại
            await chrome.storage.local.remove(['savedProxyData']);
            
            // Reset giao diện
            if (proxyInfoDiv) {
                const elements = {
                    protocol: document.getElementById('currentProtocol'),
                    ip: document.getElementById('currentIp'),
                    port: document.getElementById('currentPort'),
                    username: document.getElementById('currentUsername'),
                    password: document.getElementById('currentPassword'),
                    location: document.getElementById('currentLocation')
                };

                if (elements.protocol) elements.protocol.textContent = '-';
                if (elements.ip) elements.ip.textContent = '-';
                if (elements.port) elements.port.textContent = '-';
                if (elements.username) elements.username.textContent = '-';
                if (elements.password) elements.password.textContent = '-';
                if (elements.location) elements.location.textContent = '-';

                proxyInfoDiv.classList.remove('active');
            }
            
            showStatus('Đã dừng proxy');
            isProxyActive = false;
            checkInputs();
            
            // Kiểm tra IP sau khi dừng proxy
            setTimeout(checkCurrentIp, 2000);
        } catch (error) {
            console.error('Error stopping proxy:', error);
            showStatus('Không thể dừng proxy: ' + error.message, true);
        }
    }

    // Kiểm tra IP hiện tại
    async function checkCurrentIp() {
        try {
            const response = await fetch('https://ipgeo.gologin.com', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error('Không thể kiểm tra IP');
            }
            
            const data = await response.json();
            showIpInfo(data);
        } catch (error) {
            console.error('Error checking IP:', error);
            showStatus('Không thể kiểm tra IP: ' + error.message, true);
            
            // Hiển thị thông tin lỗi trên giao diện
            if (ipInfoDiv) {
                const elements = {
                    ip: document.getElementById('currentPublicIp'),
                    timezone: document.getElementById('currentTimezone'),
                    city: document.getElementById('currentCity'),
                    country: document.getElementById('currentCountry')
                };

                if (elements.ip) elements.ip.textContent = 'Lỗi kết nối';
                if (elements.timezone) elements.timezone.textContent = '-';
                if (elements.city) elements.city.textContent = '-';
                if (elements.country) elements.country.textContent = '-';
            }
        }
    }

    // Thêm event listeners cho các nút
    if (saveBtn) {
        saveBtn.addEventListener('click', saveConfig);
    }

    if (randomBtn) {
        randomBtn.addEventListener('click', randomProxy);
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', stopProxy);
    }

    // Load cấu hình đã lưu
    chrome.storage.local.get(['proxyType', 'protocol', 'apiKey', 'proxyList', 'savedProxyData'], function(result) {
        try {
            // Load loại proxy (API/List)
            if (result.proxyType && proxyTypeRadios.length > 0) {
                const radio = document.querySelector(`input[name="proxyType"][value="${result.proxyType}"]`);
                if (radio) {
                    radio.checked = true;
                    // Hiển thị/ẩn input group tương ứng
                    if (apiInputGroup && listInputGroup) {
                        if (result.proxyType === 'api') {
                            apiInputGroup.style.display = 'block';
                            listInputGroup.style.display = 'none';
                        } else {
                            apiInputGroup.style.display = 'none';
                            listInputGroup.style.display = 'block';
                        }
                    }
                }
            }
            
            // Load protocol
            if (result.protocol && protocolRadios.length > 0) {
                const radio = document.querySelector(`input[name="protocol"][value="${result.protocol}"]`);
                if (radio) radio.checked = true;
            }
            
            // Load API key
            if (result.apiKey && apiKeyInput) {
                apiKeyInput.value = result.apiKey;
            }
            
            // Load proxy list
            if (result.proxyList && proxyListInput) {
                proxyListInput.value = formatProxyListToText(result.proxyList);
            }

            // Load thông tin proxy đang active
            if (result.savedProxyData && proxyInfoDiv) {
                showProxyInfo(result.savedProxyData);
                isProxyActive = true;
            }
            
            // Kiểm tra và cập nhật trạng thái các button
            checkInputs();
            
            // Kiểm tra IP hiện tại
            setTimeout(checkCurrentIp, 1000);
        } catch (error) {
            console.error('Error loading saved config:', error);
            showStatus('Không thể tải cấu hình đã lưu', true);
        }
    });

    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Get Proxy functionality
    const getProxyApiKey = document.getElementById('getProxyApiKey');
    const getProxyBtn = document.getElementById('getProxyBtn');
    const getProxyList = document.getElementById('getProxyList');
    const proxyCount = document.getElementById('proxyCount');
    const totalProxies = document.getElementById('totalProxies');
    const apiStatus = document.getElementById('apiStatus');

    async function getProxyListFromApi() {
        try {
            const apiKey = getProxyApiKey.value.trim();
            if (!apiKey) {
                showStatus('Vui lòng nhập API key', true);
                return;
            }

            apiStatus.textContent = 'Đang tải...';
            const response = await fetch(`https://1proxy.net/api/premium/list-proxy-package?key=${apiKey}&limit=5000&page=1`);
            
            if (!response.ok) {
                throw new Error('Không thể kết nối đến API');
            }

            const data = await response.json();
            
            if (data.status !== 'SUCCESS') {
                throw new Error(data.message || 'Lỗi từ API');
            }

            // Format proxy list thành JSON
            const proxyList = data.data.map(proxy => ({
                ip: proxy.ip,
                port: proxy.port,
                username: proxy.username || '',
                password: proxy.password || '',
                geo_local: proxy.geo_local || '',
                scheme: 'http'
            }));

            // Lưu proxyList dưới dạng JSON vào storage
            await chrome.storage.local.set({
                'proxyList': JSON.stringify(proxyList)
            });

            // Format để hiển thị
            const displayList = formatProxyListToText(proxyList);

            // Update UI
            getProxyList.value = displayList;
            proxyCount.textContent = proxyList.length;
            totalProxies.textContent = data.total;
            apiStatus.textContent = 'Thành công';
            showStatus('Đã lấy danh sách proxy thành công');

            // Copy to main proxy list if it's empty
            const mainProxyList = document.getElementById('proxyList');
            if (!mainProxyList.value.trim()) {
                mainProxyList.value = displayList;
                checkInputs();
            }
        } catch (error) {
            console.error('Error getting proxy list:', error);
            apiStatus.textContent = 'Lỗi';
            showStatus(error.message, true);
        }
    }

    if (getProxyBtn) {
        getProxyBtn.addEventListener('click', getProxyListFromApi);
    }

    // Change API functionality
    const changeApiLink = document.getElementById('changeApiLink');
    const changeApiBtn = document.getElementById('changeApiBtn');
    const changeApiStatus = document.getElementById('changeApiStatus');

    // Load saved API link
    chrome.storage.local.get(['changeApiLink'], function(result) {
        if (result.changeApiLink && changeApiLink) {
            changeApiLink.value = result.changeApiLink;
        }
    });

    // Hàm xử lý link
    function processApiLink(link) {
        // Xóa ký tự @ nếu có ở đầu
        link = link.replace(/^@/, '');
        
        // Kiểm tra và thêm http:// nếu cần
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            link = 'http://' + link;
        }
        
        return link;
    }

    async function sendChangeApiRequest() {
        try {
            let apiLink = changeApiLink.value.trim();
            if (!apiLink) {
                showStatus('Vui lòng nhập API link', true);
                return;
            }

            // Xử lý link
            apiLink = processApiLink(apiLink);

            // Lưu API link đã xử lý
            await chrome.storage.local.set({
                'changeApiLink': apiLink
            });

            // Cập nhật giá trị hiển thị
            changeApiLink.value = apiLink;

            changeApiStatus.textContent = 'Đang xử lý...';
            changeApiStatus.className = 'status';

            const response = await fetch(apiLink);
            const data = await response.json();

            if (response.ok && data.status === true) {
                changeApiStatus.textContent = 'Đã gửi lệnh thành công';
                changeApiStatus.className = 'status success';
                showStatus('Đã gửi lệnh thành công');
            } else {
                throw new Error(data.message || 'Lỗi không xác định');
            }
        } catch (error) {
            console.error('Error sending change API request:', error);
            changeApiStatus.textContent = error.message;
            changeApiStatus.className = 'status error';
            showStatus(error.message, true);
        }
    }

    if (changeApiBtn) {
        changeApiBtn.addEventListener('click', sendChangeApiRequest);
    }
});
