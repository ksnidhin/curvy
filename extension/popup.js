document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('api-url');
  const secretTokenInput = document.getElementById('secret-token');
  const saveBtn = document.getElementById('save-settings');
  const importBtn = document.getElementById('import-btn');
  const statusDiv = document.getElementById('status');
  const toggleSettings = document.getElementById('toggle-settings');

  // Load settings
  chrome.storage.sync.get(['apiUrl', 'secretToken'], (result) => {
    if (result.apiUrl) apiUrlInput.value = result.apiUrl;
    if (result.secretToken) secretTokenInput.value = result.secretToken;
    
    if (!result.apiUrl || !result.secretToken) {
      document.body.classList.add('show-settings');
      showStatus('Please configure your API settings first.', 'error');
    }
  });

  toggleSettings.addEventListener('click', () => {
    document.body.classList.toggle('show-settings');
  });

  saveBtn.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim().replace(/\/$/, ''); // remove trailing slash
    const secretToken = secretTokenInput.value.trim();

    if (!apiUrl || !secretToken) {
      showStatus('Both fields are required', 'error');
      return;
    }

    chrome.storage.sync.set({ apiUrl, secretToken }, () => {
      showStatus('Settings saved!', 'success');
      setTimeout(() => document.body.classList.remove('show-settings'), 1000);
    });
  });

  importBtn.addEventListener('click', async () => {
    chrome.storage.sync.get(['apiUrl', 'secretToken'], async (result) => {
      if (!result.apiUrl || !result.secretToken) {
        showStatus('Please configure API settings first.', 'error');
        document.body.classList.add('show-settings');
        return;
      }

      importBtn.disabled = true;
      showStatus('Extracting data from page...', '');

      try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Inject and run content script
        const injectionResult = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });

        const scrapedData = injectionResult[0]?.result;
        
        if (!scrapedData || !scrapedData.title) {
          throw new Error("Could not find product data on this page.");
        }

        // Add the URL of the page we scraped
        scrapedData.url = tab.url;

        showStatus('Sending to Curvy Girls...', '');

        // Send to API
        const response = await fetch(`${result.apiUrl}/api/extension/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-extension-token': result.secretToken
          },
          body: JSON.stringify(scrapedData)
        });

        const apiData = await response.json();

        if (!response.ok) {
          throw new Error(apiData.error || 'Failed to send to server');
        }

        showStatus('Success! Product Imported.', 'success');
        
        // Open the admin page in a new tab if success
        setTimeout(() => {
          window.close(); // close popup
        }, 2000);

      } catch (err) {
        showStatus(err.message, 'error');
      } finally {
        importBtn.disabled = false;
      }
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = type;
  }
});
