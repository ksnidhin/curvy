const STORES = [
  { id: 'amazon', name: 'Amazon India', icon: '🛒', domains: ['amazon.in', '.amazon.in'] },
  { id: 'myntra', name: 'Myntra', icon: '👗', domains: ['myntra.com', '.myntra.com'] },
  { id: 'flipkart', name: 'Flipkart', icon: '📦', domains: ['flipkart.com', '.flipkart.com'] },
  { id: 'ajio', name: 'Ajio', icon: '🛍️', domains: ['ajio.com', '.ajio.com'] },
  { id: 'meesho', name: 'Meesho', icon: '🏷️', domains: ['meesho.com', '.meesho.com'] },
  { id: 'tatacliq', name: 'Tata CLiQ', icon: '✨', domains: ['tatacliq.com', '.tatacliq.com'] },
  { id: 'nykaa', name: 'Nykaa', icon: '💄', domains: ['nykaa.com', '.nykaa.com', 'nykaafashion.com'] }
];

let selectedFormat = 'json';
let storeCookiesCache = {};
let activeTabCookieStr = '';
let activeTabDomain = '';

function showToast(msg, isError = false) {
  const toast = document.getElementById('toastMsg');
  toast.textContent = msg;
  toast.className = isError ? 'toast toast-error' : 'toast toast-success';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

async function getCookiesForStore(store) {
  const map = new Map();
  for (const domain of store.domains) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      cookies.forEach(c => {
        if (!map.has(c.name)) map.set(c.name, c.value);
      });
    } catch (e) {
      console.warn(`Error reading domain ${domain}`, e);
    }
  }
  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

document.addEventListener('DOMContentLoaded', async () => {
  const btnFetchAll = document.getElementById('btnFetchAll');
  const fmtJson = document.getElementById('fmtJson');
  const fmtText = document.getElementById('fmtText');
  const storeGrid = document.getElementById('storeGrid');
  const totalBadge = document.getElementById('totalBadge');
  const btnCopyCurrentTab = document.getElementById('btnCopyCurrentTab');
  const curvyUrlInput = document.getElementById('curvyUrl');
  const btnSyncServer = document.getElementById('btnSyncServer');

  // Load saved Curvy URL
  chrome.storage.local.get(['curvyAdminUrl'], (res) => {
    if (res.curvyAdminUrl) curvyUrlInput.value = res.curvyAdminUrl;
  });

  // Check Active Tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const urlObj = new URL(tab.url);
      activeTabDomain = urlObj.hostname;
      const cookies = await chrome.cookies.getAll({ url: tab.url });
      activeTabCookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      btnCopyCurrentTab.innerHTML = `<span>🌐 Copy Current Tab (${activeTabDomain})</span>`;
    }
  } catch (e) {}

  // Format Toggles
  fmtJson.addEventListener('click', () => {
    selectedFormat = 'json';
    fmtJson.classList.add('active');
    fmtText.classList.remove('active');
  });

  fmtText.addEventListener('click', () => {
    selectedFormat = 'text';
    fmtText.classList.add('active');
    fmtJson.classList.remove('active');
  });

  // Scan all stores
  let totalCookieCount = 0;
  let detectedStoresCount = 0;

  for (const store of STORES) {
    const cookieStr = await getCookiesForStore(store);
    storeCookiesCache[store.id] = cookieStr;
    const count = cookieStr ? cookieStr.split('; ').length : 0;
    if (count > 0) {
      totalCookieCount += count;
      detectedStoresCount++;
    }

    const pill = document.createElement('div');
    pill.className = 'store-pill';
    pill.innerHTML = `
      <span class="name">${store.icon} ${store.name}</span>
      <span class="count ${count === 0 ? 'zero' : ''}">${count > 0 ? `${count} cookies` : '0'}</span>
    `;
    storeGrid.appendChild(pill);
  }

  totalBadge.textContent = `${totalCookieCount} Cookies in ${detectedStoresCount} Stores`;

  // 1-Click Copy All Cookies
  btnFetchAll.addEventListener('click', async () => {
    const payloadObj = {};
    const textBlocks = [];

    for (const store of STORES) {
      const cookies = storeCookiesCache[store.id] || (await getCookiesForStore(store));
      if (cookies) {
        payloadObj[store.id] = cookies;
        textBlocks.push(`=== ${store.name.toUpperCase()} ===\n${cookies}\n`);
      }
    }

    // Also include current tab if not in main stores
    if (activeTabDomain && activeTabCookieStr) {
      payloadObj['currentTab'] = activeTabCookieStr;
      textBlocks.push(`=== CURRENT TAB (${activeTabDomain}) ===\n${activeTabCookieStr}\n`);
    }

    let textToCopy = '';
    if (selectedFormat === 'json') {
      textToCopy = JSON.stringify(payloadObj, null, 2);
    } else {
      textToCopy = textBlocks.join('\n');
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      btnFetchAll.classList.add('copied');
      btnFetchAll.innerHTML = `<span>✓ ALL COOKIES COPIED!</span>`;
      showToast(`🎉 Copied ${detectedStoresCount} stores (${totalCookieCount} cookies)! Paste into Curvy Admin.`);
      setTimeout(() => {
        btnFetchAll.classList.remove('copied');
        btnFetchAll.innerHTML = `<span>⚡ FETCH & COPY ALL COOKIES</span>`;
      }, 2500);
    }).catch(err => {
      showToast('Failed to copy to clipboard', true);
    });
  });

  // Copy Current Tab Only
  btnCopyCurrentTab.addEventListener('click', () => {
    if (!activeTabCookieStr) {
      showToast(`No cookies detected on current tab (${activeTabDomain})`, true);
      return;
    }
    navigator.clipboard.writeText(activeTabCookieStr).then(() => {
      showToast(`Copied ${activeTabDomain} cookies!`);
    });
  });

  // 1-Click Sync to Curvy Admin
  btnSyncServer.addEventListener('click', async () => {
    const targetUrl = curvyUrlInput.value.trim().replace(/\/$/, '');
    if (!targetUrl) {
      showToast('Please enter your Curvy Admin URL', true);
      return;
    }

    chrome.storage.local.set({ curvyAdminUrl: targetUrl });
    btnSyncServer.disabled = true;
    btnSyncServer.textContent = 'Syncing...';

    try {
      const payload = {};
      let activeCount = 0;
      for (const store of STORES) {
        const cookies = storeCookiesCache[store.id] || (await getCookiesForStore(store));
        if (cookies) {
          payload[store.id] = cookies;
          activeCount++;
        }
      }

      const res = await fetch(`${targetUrl}/api/admin/cookies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showToast(`✅ Synced cookies for ${activeCount} stores to Curvy Server!`);
    } catch (err) {
      showToast(`Sync failed: ${err.message}`, true);
    } finally {
      btnSyncServer.disabled = false;
      btnSyncServer.textContent = '🚀 1-Click Sync All to Server';
    }
  });
});
