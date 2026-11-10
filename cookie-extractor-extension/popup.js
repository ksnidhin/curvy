const STORES = [
  { id: 'amazon', name: 'Amazon India', icon: '🛒', domains: ['amazon.in', '.amazon.in'] },
  { id: 'myntra', name: 'Myntra', icon: '👗', domains: ['myntra.com', '.myntra.com'] },
  { id: 'flipkart', name: 'Flipkart', icon: '📦', domains: ['flipkart.com', '.flipkart.com'] },
  { id: 'ajio', name: 'Ajio', icon: '🛍️', domains: ['ajio.com', '.ajio.com'] },
  { id: 'meesho', name: 'Meesho', icon: '🏷️', domains: ['meesho.com', '.meesho.com'] }
];

async function getCookiesForStore(store) {
  const cookieMap = new Map();
  for (const domain of store.domains) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      cookies.forEach(c => {
        if (!cookieMap.has(c.name)) {
          cookieMap.set(c.name, c.value);
        }
      });
    } catch (e) {
      console.warn(`Failed getting cookies for ${domain}:`, e);
    }
  }
  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btnElement.textContent;
    btnElement.textContent = 'Copied! ✓';
    btnElement.classList.add('copied');
    setTimeout(() => {
      btnElement.textContent = originalText;
      btnElement.classList.remove('copied');
    }, 1500);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const storesList = document.getElementById('storesList');
  const activeTabStore = document.getElementById('activeTabStore');
  const activeTabCard = document.getElementById('activeTabCard');
  const btnCopyActive = document.getElementById('btnCopyActive');
  const btnCopyActiveUrl = document.getElementById('btnCopyActiveUrl');
  const curvyUrlInput = document.getElementById('curvyUrl');
  const btnSyncServer = document.getElementById('btnSyncServer');
  const syncStatus = document.getElementById('syncStatus');

  // Load saved Curvy URL
  chrome.storage.local.get(['curvyAdminUrl'], (res) => {
    if (res.curvyAdminUrl) {
      curvyUrlInput.value = res.curvyAdminUrl;
    }
  });

  // Check Active Tab
  let activeStoreMatch = null;
  let activeTabUrl = '';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      activeTabUrl = tab.url;
      const urlObj = new URL(tab.url);
      activeStoreMatch = STORES.find(s => s.domains.some(d => urlObj.hostname.includes(d.replace(/^\./, ''))));
      if (activeStoreMatch) {
        activeTabStore.textContent = `${activeStoreMatch.icon} ${activeStoreMatch.name}`;
        activeTabCard.classList.add('highlight');
      } else {
        activeTabStore.textContent = urlObj.hostname;
      }
    }
  } catch (e) {
    activeTabStore.textContent = 'None';
  }

  btnCopyActiveUrl.addEventListener('click', () => {
    if (activeTabUrl) {
      copyToClipboard(activeTabUrl, btnCopyActiveUrl);
    }
  });

  btnCopyActive.addEventListener('click', async () => {
    if (activeStoreMatch) {
      const cookies = await getCookiesForStore(activeStoreMatch);
      copyToClipboard(cookies, btnCopyActive);
    } else {
      // Try extracting for current tab host
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
          const cookies = await chrome.cookies.getAll({ url: tab.url });
          const str = cookies.map(c => `${c.name}=${c.value}`).join('; ');
          copyToClipboard(str, btnCopyActive);
        }
      } catch (err) {
        btnCopyActive.textContent = 'No cookies';
      }
    }
  });

  // Render all supported stores
  const storeCookiesCache = {};
  for (const store of STORES) {
    const item = document.createElement('div');
    item.className = 'store-item';

    const cookieStr = await getCookiesForStore(store);
    storeCookiesCache[store.id] = cookieStr;
    const cookieCount = cookieStr ? cookieStr.split('; ').length : 0;

    item.innerHTML = `
      <div>
        <div class="store-name">${store.icon} ${store.name}</div>
        <div class="store-count ${cookieCount > 0 ? 'has-cookies' : ''}">
          ${cookieCount > 0 ? `${cookieCount} cookies detected` : 'No session cookies'}
        </div>
      </div>
      <button class="btn-copy" id="btn-copy-${store.id}">Copy</button>
    `;

    storesList.appendChild(item);

    const copyBtn = item.querySelector(`#btn-copy-${store.id}`);
    copyBtn.addEventListener('click', () => {
      copyToClipboard(storeCookiesCache[store.id] || '', copyBtn);
    });
  }

  // Handle Copy All Stores Cookies At Once
  const btnCopyAllStores = document.getElementById('btnCopyAllStores');
  if (btnCopyAllStores) {
    btnCopyAllStores.addEventListener('click', async () => {
      const payload = {};
      let storeCount = 0;
      for (const store of STORES) {
        const cookies = storeCookiesCache[store.id] || (await getCookiesForStore(store));
        if (cookies) {
          payload[store.id] = cookies;
          storeCount++;
        }
      }
      const jsonString = JSON.stringify(payload, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        const orig = btnCopyAllStores.textContent;
        btnCopyAllStores.textContent = `Copied All (${storeCount} Stores)! ✓`;
        btnCopyAllStores.style.background = '#15803d';
        setTimeout(() => {
          btnCopyAllStores.textContent = orig;
        }, 2000);
      });
    });
  }

  // Handle 1-Click Server Sync
  btnSyncServer.addEventListener('click', async () => {
    const targetUrl = curvyUrlInput.value.trim().replace(/\/$/, '');
    if (!targetUrl) {
      syncStatus.className = 'status-msg status-error';
      syncStatus.textContent = 'Please enter your Curvy Admin URL';
      return;
    }

    // Save URL for future use
    chrome.storage.local.set({ curvyAdminUrl: targetUrl });

    btnSyncServer.disabled = true;
    btnSyncServer.textContent = 'Syncing...';
    syncStatus.textContent = '';

    try {
      const payload = {};
      let activeCount = 0;
      for (const store of STORES) {
        const cookies = await getCookiesForStore(store);
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

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      syncStatus.className = 'status-msg status-success';
      syncStatus.textContent = `✅ Synced cookies for ${activeCount} stores to Curvy!`;
    } catch (err) {
      syncStatus.className = 'status-msg status-error';
      syncStatus.textContent = `Sync failed: ${err.message}`;
    } finally {
      btnSyncServer.disabled = false;
      btnSyncServer.textContent = '🚀 1-Click Sync All Cookies to Server';
    }
  });
});
