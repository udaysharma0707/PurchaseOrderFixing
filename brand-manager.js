/**
 * ==========================================
 * 🏷️ BRAND MANAGEMENT SYSTEM - ZOHO STYLE
 * Complete dropdown + modal management
 * ==========================================
 */
// ✅ FIX: Define ENDPOINT if not already defined
if (typeof ENDPOINT === 'undefined') {
  // Get current domain and script path
  const currentUrl = window.location.href;
  const path = currentUrl.split('/').slice(0, -1).join('/');
  ENDPOINT = path + '/index.html'; // Fallback - will use fetch directly
  
  // Better approach: use relative path to your Google Apps Script
  ENDPOINT = 'https://script.google.com/macros/s/AKfycbynh0pSzDaX3_xJTZXR9_g_SSQmPAlEthITon6uIFWFXctB5ZV3zAiaYv-W2bWalQ99/exec';
}
// Global state
let cachedBrands = [];
let brandCacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ==========================================
// 1️⃣ REGULAR EDIT PRODUCT MODAL (index.html)
// ==========================================

/**
 * Load brands from server and populate dropdown
 */
async function loadAndShowBrandDropdown(modalType = 'regular') {
  try {
    console.log('🔄 Loading brands for:', modalType);
    
    // Check cache validity
    if (cachedBrands.length > 0 && Date.now() < brandCacheExpiry) {
      console.log('✅ Using cached brands');
      renderBrandList(cachedBrands, modalType);
      return;
    }
    
    // Fetch from server
    const url = typeof ENDPOINT !== 'undefined' && ENDPOINT.includes('script.google.com')    ? `${ENDPOINT}?action=getBrands`   : `${ENDPOINT}?action=getBrands`;  const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch brands');
    
    const data = await response.json();
    if (!data.success || !data.brands) {
      throw new Error(data.error || 'Invalid response');
    }
    
    cachedBrands = data.brands;
    brandCacheExpiry = Date.now() + CACHE_DURATION;
    
    console.log('✅ Loaded ' + cachedBrands.length + ' brands');
    renderBrandList(cachedBrands, modalType);
    
  } catch (error) {
    console.error('❌ Error loading brands:', error);
    showBrandError(modalType, 'Failed to load brands');
  }
}

/**
 * Show brand dropdown for regular modal
 */
function showBrandDropdown() {
  console.log('📂 Showing brand dropdown (regular)');
  const dropdown = document.getElementById('brandDropdownList');
  if (dropdown) {
    dropdown.style.display = 'block';
    loadAndShowBrandDropdown('regular');
  }
}

/**
 * Hide brand dropdown for regular modal
 */
function hideBrandDropdown() {
  const dropdown = document.getElementById('brandDropdownList');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

/**
 * Filter brands in regular modal dropdown
 */
function filterBrandDropdown() {
  const input = document.getElementById('brand');
  const searchTerm = (input?.value || '').toLowerCase().trim();
  
  console.log('🔍 Filtering brands with term:', searchTerm);
  
  if (searchTerm.length === 0) {
    renderBrandList(cachedBrands, 'regular');
    return;
  }
  
  const filtered = cachedBrands.filter(brand =>
    brand.toLowerCase().includes(searchTerm)
  );
  
  renderBrandList(filtered, 'regular', searchTerm);
}

/**
 * Select brand in regular modal
 */
function selectBrand(brandName) {
  console.log('✅ Selected brand (regular):', brandName);
  const input = document.getElementById('brand');
  if (input) {
    input.value = brandName;
    input.dispatchEvent(new Event('change'));
  }
  hideBrandDropdown();
}

/**
 * Render brand list in dropdown
 */
function renderBrandList(brands, modalType = 'regular', searchTerm = '') {
  let dropdownId, inputId;
  
  if (modalType === 'regular') {
    dropdownId = 'brandDropdownList';
    inputId = 'brand';
  } else if (modalType === 'photo') {
    dropdownId = 'brandDropdownListPhoto';
    inputId = 'photoProductBrand';
  } else if (modalType === 'group') {
    dropdownId = 'brandDropdownListGroup';
    inputId = 'groupManufacturer';
  }
  
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  
  if (brands.length === 0) {
    dropdown.innerHTML = `
      <div style="padding:12px;text-align:center;color:#999;">
        No brands found
      </div>
    `;
    return;
  }
  
  const currentValue = document.getElementById(inputId)?.value?.toLowerCase() || '';
  
  let html = `<div style="padding:8px 0;">`;
  
  // Search box (if filtering)
  if (searchTerm) {
    html += `
      <div style="padding:8px 12px;border-bottom:1px solid #eee;">
        <small style="color:#666;">Found ${brands.length} brand(s)</small>
      </div>
    `;
  }
  
  // Brand list
  brands.forEach(brand => {
    const isSelected = brand.toLowerCase() === currentValue;
    const checkmark = isSelected ? '✓' : '';
    
    html += `
      <div 
        style="
          padding:12px;
          cursor:pointer;
          background:${isSelected ? '#e3f2fd' : '#fff'};
          border-bottom:1px solid #f0f0f0;
          display:flex;
          justify-content:space-between;
          align-items:center;
        "
        onmouseover="this.style.background='#f5f5f5'"
        onmouseout="this.style.background='${isSelected ? '#e3f2fd' : '#fff'}'"
        onclick="selectBrand${modalType === 'photo' ? 'Photo' : modalType === 'group' ? 'Group' : ''}('${brand.replace(/'/g, "\\'")}')"
      >
        <span>${brand}</span>
        <span style="color:#2196F3;font-weight:bold;">${checkmark}</span>
      </div>
    `;
  });
  
  html += `</div>`;
  dropdown.innerHTML = html;
}

/**
 * Show brand error message
 */
function showBrandError(modalType, message) {
  let dropdownId;
  
  if (modalType === 'regular') dropdownId = 'brandDropdownList';
  else if (modalType === 'photo') dropdownId = 'brandDropdownListPhoto';
  else if (modalType === 'group') dropdownId = 'brandDropdownListGroup';
  
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) {
    dropdown.innerHTML = `
      <div style="padding:12px;text-align:center;color:#d32f2f;">
        ❌ ${message}
      </div>
    `;
  }
}

// ==========================================
// 2️⃣ PHOTO MODAL FUNCTIONS
// ==========================================

function showBrandDropdownPhoto() {
  const dropdown = document.getElementById('brandDropdownListPhoto');
  if (dropdown) {
    dropdown.style.display = 'block';
    loadAndShowBrandDropdown('photo');
  }
}

function hideBrandDropdownPhoto() {
  const dropdown = document.getElementById('brandDropdownListPhoto');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

function filterBrandDropdownPhoto() {
  const input = document.getElementById('photoProductBrand');
  const searchTerm = (input?.value || '').toLowerCase().trim();
  
  if (searchTerm.length === 0) {
    renderBrandList(cachedBrands, 'photo');
    return;
  }
  
  const filtered = cachedBrands.filter(brand =>
    brand.toLowerCase().includes(searchTerm)
  );
  
  renderBrandList(filtered, 'photo', searchTerm);
}

function selectBrandPhoto(brandName) {
  console.log('✅ Selected brand (photo):', brandName);
  const input = document.getElementById('photoProductBrand');
  if (input) {
    input.value = brandName;
    input.dispatchEvent(new Event('change'));
  }
  hideBrandDropdownPhoto();
}

// ==========================================
// 3️⃣ GROUP MODAL FUNCTIONS
// ==========================================

function showBrandDropdownGroup() {
  const dropdown = document.getElementById('brandDropdownListGroup');
  if (dropdown) {
    dropdown.style.display = 'block';
    loadAndShowBrandDropdown('group');
  }
}

function hideBrandDropdownGroup() {
  const dropdown = document.getElementById('brandDropdownListGroup');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

function filterBrandDropdownGroup() {
  const input = document.getElementById('groupManufacturer');
  const searchTerm = (input?.value || '').toLowerCase().trim();
  
  if (searchTerm.length === 0) {
    renderBrandList(cachedBrands, 'group');
    return;
  }
  
  const filtered = cachedBrands.filter(brand =>
    brand.toLowerCase().includes(searchTerm)
  );
  
  renderBrandList(filtered, 'group', searchTerm);
}

function selectBrandGroup(brandName) {
  console.log('✅ Selected brand (group):', brandName);
  const input = document.getElementById('groupManufacturer');
  if (input) {
    input.value = brandName;
    input.dispatchEvent(new Event('change'));
  }
  hideBrandDropdownGroup();
}

// ==========================================
// 4️⃣ MANAGE BRANDS MODAL
// ==========================================

/**
 * Open Manage Brands Modal
 */
function openManageBrandsModal(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  console.log('🔧 Opening Manage Brands Modal');
  openManageBrandsModalHelper('regular');
}


function openManageBrandsModalPhoto() {
  console.log('🔧 Opening Manage Brands Modal (photo)');
  openManageBrandsModalHelper('photo');
}

function openManageBrandsModalGroup() {
  console.log('🔧 Opening Manage Brands Modal (group)');
  openManageBrandsModalHelper('group');
}

/**
 * Helper function to open manage brands modal
 */
function openManageBrandsModalHelper(sourceModal) {
  const existing = document.getElementById('manageBrandsModal');
  if (existing) existing.remove();
  
  const html = `
    <div id="manageBrandsModal" style="
      position:fixed;
      top:0;
      left:0;
      width:100%;
      height:100%;
      background:rgba(0,0,0,0.5);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:10000;
    ">
      <div style="
        background:#fff;
        border-radius:8px;
        width:90%;
        max-width:500px;
        max-height:80vh;
        overflow-y:auto;
        box-shadow:0 4px 12px rgba(0,0,0,0.15);
      ">
        <!-- Header -->
        <div style="
          padding:20px;
          border-bottom:1px solid #eee;
          display:flex;
          justify-content:space-between;
          align-items:center;
          sticky:top:0;
          background:#fff;
          z-index:1;
        ">
          <h3 style="margin:0;font-size:18px;font-weight:600;">🏷️ Manage Brands</h3>
          <button onclick="closeManageBrandsModal()" style="
            background:none;
            border:none;
            font-size:24px;
            cursor:pointer;
            color:#999;
          ">✕</button>
        </div>
        
        <!-- Add New Brand -->
        <div style="padding:20px;border-bottom:1px solid #eee;">
          <label style="display:block;font-weight:600;margin-bottom:8px;">Add New Brand</label>
          <div style="display:flex;gap:8px;">
            <input 
              id="newBrandInput" 
              type="text" 
              placeholder="Enter brand name..."
              style="flex:1;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:14px;"
              onkeypress="if(event.key==='Enter') addNewBrand()"
            />
            <button 
              onclick="addNewBrand()" 
              style="
                padding:10px 16px;
                background:#2196F3;
                color:#fff;
                border:none;
                border-radius:4px;
                cursor:pointer;
                font-weight:600;
              "
            >
              ➕ Add
            </button>
          </div>
          <div id="brandAddStatus" style="margin-top:8px;"></div>
        </div>
        
        <!-- Existing Brands -->
        <div style="padding:20px;">
          <label style="display:block;font-weight:600;margin-bottom:12px;">Existing Brands</label>
          <div id="brandsListContainer" style="max-height:300px;overflow-y:auto;"></div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
  
  // Load and display brands
  loadExistingBrands(sourceModal);
}

/**
 * Load and display existing brands in manager
 */
async function loadExistingBrands(sourceModal) {
  try {
    const container = document.getElementById('brandsListContainer');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;color:#999;">⏳ Loading brands...</div>';
    
    // ✅ Build URL with detailed logging
    const fullUrl = `${ENDPOINT}?action=getBrands`;
    console.log('🔍 DEBUG INFO:');
    console.log('  - ENDPOINT:', ENDPOINT);
    console.log('  - Full URL:', fullUrl);
    console.log('  - Timestamp:', new Date().toLocaleTimeString());
    
    // Show loading info in modal
    container.innerHTML = `
      <div style="padding:15px;background:#f0f0f0;border-radius:4px;margin-bottom:10px;">
        <div style="font-size:12px;color:#666;margin-bottom:8px;">
          <strong>🔍 Debug Info:</strong><br>
          URL: <code style="background:#fff;padding:4px;border-radius:2px;">${fullUrl}</code>
        </div>
      </div>
      <div style="text-align:center;color:#999;">Loading...</div>
    `;
    
    const response = await fetch(fullUrl);
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}\nResponse: ${errorText.substring(0, 200)}`);
    }
    
    let data;
    try {
      data = await response.json();
      console.log('✅ Parsed JSON:', data);
    } catch (jsonErr) {
      const textContent = await response.text();
      console.error('❌ Failed to parse JSON:', jsonErr);
      console.error('Response text:', textContent);
      throw new Error(`Invalid JSON response: ${textContent.substring(0, 200)}`);
    }
    
    // Check response structure
    if (!data) {
      throw new Error('Response is null or undefined');
    }
    
    if (!data.success) {
      const errorMsg = data.error || data.message || 'Unknown error';
      console.error('❌ Backend error:', errorMsg);
      throw new Error(`Backend Error: ${errorMsg}`);
    }
    
    if (!data.brands) {
      console.warn('⚠️ No brands property in response. Data:', data);
      throw new Error('Response missing "brands" array. Received: ' + JSON.stringify(data));
    }
    
    const brands = data.brands;
    console.log('✅ Loaded brands count:', brands.length);
    
    cachedBrands = brands;
    brandCacheExpiry = Date.now() + CACHE_DURATION;
    
    if (brands.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">📭 No brands yet. Add one above!</div>';
      return;
    }
    
    let html = '';
    brands.forEach((brand, index) => {
      try {
        html += `
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:12px;
            border:1px solid #eee;
            border-radius:4px;
            margin-bottom:8px;
            background:#f9f9f9;
          ">
            <span style="font-weight:500;">${escapeHtml(brand)}</span>
            <div style="display:flex;gap:8px;">
              <button 
                onclick="editBrandName('${brand.replace(/'/g, "\\'")}')" 
                style="
                  padding:6px 10px;
                  background:#FF9800;
                  color:#fff;
                  border:none;
                  border-radius:4px;
                  cursor:pointer;
                  font-size:12px;
                "
              >
                ✏️ Edit
              </button>
              <button 
                onclick="deleteBrandName('${brand.replace(/'/g, "\\'")}')" 
                style="
                  padding:6px 10px;
                  background:#f44336;
                  color:#fff;
                  border:none;
                  border-radius:4px;
                  cursor:pointer;
                  font-size:12px;
                "
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        `;
      } catch (brandErr) {
        console.error('❌ Error rendering brand at index ' + index + ':', brand, brandErr);
      }
    });
    
    container.innerHTML = html;
    console.log('✅ Brands rendered successfully');
    
  } catch (error) {
    console.error('❌ ERROR LOADING BRANDS:', error);
    console.error('  - Error message:', error.message);
    console.error('  - Error stack:', error.stack);
    
    const container = document.getElementById('brandsListContainer');
    if (container) {
      container.innerHTML = `
        <div style="
          color:#d32f2f;
          background:#ffebee;
          border:1px solid #ef5350;
          border-radius:4px;
          padding:15px;
          text-align:left;
          font-family:monospace;
          font-size:12px;
        ">
          <div style="font-weight:bold;margin-bottom:8px;">❌ ERROR LOADING BRANDS</div>
          <div style="margin-bottom:8px;color:#c62828;">
            <strong>Message:</strong><br>
            ${escapeHtml(error.message)}
          </div>
          <div style="background:#fff;padding:8px;border-radius:2px;margin-bottom:8px;max-height:100px;overflow-y:auto;color:#666;">
            <strong>Details:</strong><br>
            ENDPOINT: <code>${ENDPOINT}</code><br>
            URL: <code>${ENDPOINT}?action=getBrands</code>
          </div>
          <div style="color:#666;font-size:11px;">
            💡 Check browser console (F12) for more details
          </div>
        </div>
      `;
    }
  }
}


/**
 * Add new brand
 */
async function addNewBrand() {
  try {
    const input = document.getElementById('newBrandInput');
    const brandName = (input?.value || '').trim();
    
    if (!brandName) {
      showBrandStatus('error', '❌ Brand name cannot be empty');
      return;
    }
    
    showBrandStatus('loading', '⏳ Adding brand...');
    
    const response = await fetch(`${ENDPOINT}?action=addBrand&brandName=${encodeURIComponent(brandName)}`);
    if (!response.ok) throw new Error('Server error');
    
    const data = await response.json();
    
    if (!data.success) {
      showBrandStatus('error', '❌ ' + (data.error || 'Failed to add brand'));
      return;
    }
    
    showBrandStatus('success', '✅ Brand added successfully!');
    input.value = '';
    
    // Reload brands list
    setTimeout(() => {
      loadExistingBrands();
    }, 500);
    
  } catch (error) {
    console.error('❌ Error adding brand:', error);
    showBrandStatus('error', '❌ ' + error.message);
  }
}

/**
 * Edit brand name
 */
function editBrandName(oldName) {
  const newName = prompt(`📝 Rename "${oldName}" to:`, oldName);
  if (!newName || newName.trim() === '' || newName === oldName) return;
  
  updateBrandName(oldName, newName.trim());
}

/**
 * Update brand name on server
 */
async function updateBrandName(oldName, newName) {
  try {
    console.log('✏️ Updating brand:', oldName, '→', newName);
    
    const response = await fetch(
      `${ENDPOINT}?action=updateBrand&oldName=${encodeURIComponent(oldName)}&newName=${encodeURIComponent(newName)}`
    );
    
    if (!response.ok) throw new Error('Server error');
    
    const data = await response.json();
    
    if (!data.success) {
      alert('❌ Error: ' + (data.error || 'Failed to update brand'));
      return;
    }
    
    alert('✅ Brand updated successfully!');
    loadExistingBrands();
    
  } catch (error) {
    console.error('❌ Error updating brand:', error);
    alert('❌ Error: ' + error.message);
  }
}

/**
 * Delete brand
 */
async function deleteBrandName(brandName) {
  if (!confirm(`🗑️ Delete "${brandName}"? This will remove it from all products.`)) {
    return;
  }
  
  try {
    console.log('🗑️ Deleting brand:', brandName);
    
    const response = await fetch(
      `${ENDPOINT}?action=deleteBrand&brandName=${encodeURIComponent(brandName)}`
    );
    
    if (!response.ok) throw new Error('Server error');
    
    const data = await response.json();
    
    if (!data.success) {
      alert('❌ Error: ' + (data.error || 'Failed to delete brand'));
      return;
    }
    
    alert('✅ Brand deleted successfully!');
    loadExistingBrands();
    
  } catch (error) {
    console.error('❌ Error deleting brand:', error);
    alert('❌ Error: ' + error.message);
  }
}

/**
 * Show status message in manage brands modal
 */
function showBrandStatus(type, message) {
  const statusEl = document.getElementById('brandAddStatus');
  if (!statusEl) return;
  
  let color = '#2196F3';
  if (type === 'error') color = '#f44336';
  if (type === 'success') color = '#4caf50';
  
  statusEl.innerHTML = `
    <div style="
      padding:10px;
      background:${color}20;
      border:1px solid ${color};
      border-radius:4px;
      color:${color};
      font-size:14px;
    ">
      ${message}
    </div>
  `;
}

/**
 * Close manage brands modal
 */
function closeManageBrandsModal() {
  const modal = document.getElementById('manageBrandsModal');
  if (modal) {
    modal.remove();
    // Refresh all dropdowns
    cachedBrands = [];
    brandCacheExpiry = 0;
  }
}

/**
 * Helper: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================
// 🔍 BRAND AUTOCOMPLETE - EDIT FORM
// ==========================================

/**
 * When user focuses on brand field - show top 5 brands
 */
function onBrandFieldFocus() {
  console.log('📌 Brand field focused');
  
  // Load top 5 brands
  fetch(ENDPOINT + '?action=getLatestBrands&count=5')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.brands) {
        console.log('✅ Loaded top 5 brands:', data.brands);
        showBrandDropdown(data.brands);
      }
    })
    .catch(error => console.error('❌ Error loading brands:', error));
}

/**
 * When user types in brand field - filter brands
 */
function onBrandFieldInput() {
  const input = document.getElementById('productBrand');
  const value = input.value.trim();
  
  console.log('📝 Brand field input:', value);
  
  // If empty, show top 5
  if (!value) {
    onBrandFieldFocus();
    return;
  }
  
  // Search for matching brands
  fetch(ENDPOINT + '?action=searchBrands&searchTerm=' + encodeURIComponent(value))
    .then(response => response.json())
    .then(data => {
      if (data.success && data.brands) {
        console.log('✅ Found brands:', data.brands);
        
        if (data.brands.length === 0) {
          // No matches - show save new brand button
          showSaveNewBrandIcon();
          hideBrandDropdown();
        } else {
          // Show filtered brands
          showBrandDropdown(data.brands);
          hideSaveNewBrandIcon();
        }
      }
    })
    .catch(error => console.error('❌ Error searching brands:', error));
}

/**
 * Handle keyboard events in brand field
 */
function onBrandFieldKeydown(event) {
  const dropdown = document.getElementById('brandAutocompleteDropdown');
  
  // Close dropdown on Escape
  if (event.key === 'Escape') {
    hideBrandDropdown();
  }
  
  // Close dropdown on Enter (select already filled value)
  if (event.key === 'Enter') {
    hideBrandDropdown();
  }
}

/**
 * Display brand dropdown with suggestions
 */
function showBrandDropdown(brands) {
  const dropdown = document.getElementById('brandAutocompleteDropdown');
  
  if (!brands || brands.length === 0) {
    hideBrandDropdown();
    return;
  }
  
  // Build dropdown HTML
  let html = '';
  brands.forEach(brand => {
    html += `
      <div 
        onclick="selectBrand('${brand.replace(/'/g, "\\'")}')"
        style="
          padding: 12px 15px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        "
        onmouseover="this.style.backgroundColor = '#f5f5f5';"
        onmouseout="this.style.backgroundColor = 'transparent';"
      >
        • ${brand}
      </div>
    `;
  });
  
  dropdown.innerHTML = html;
  dropdown.style.display = 'block';
  
  console.log(`✅ Showing ${brands.length} brands in dropdown`);
}

/**
 * Hide brand dropdown
 */
function hideBrandDropdown() {
  const dropdown = document.getElementById('brandAutocompleteDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

/**
 * Select brand from dropdown
 */
function selectBrand(brandName) {
  console.log('✅ Selected brand:', brandName);
  
  const input = document.getElementById('productBrand');
  input.value = brandName;
  
  // Hide dropdown and save icon
  hideBrandDropdown();
  hideSaveNewBrandIcon();
}

/**
 * Show save new brand icon
 */
function showSaveNewBrandIcon() {
  const icon = document.getElementById('saveBrandIcon');
  if (icon) {
    icon.style.display = 'block';
  }
}

/**
 * Hide save new brand icon
 */
function hideSaveNewBrandIcon() {
  const icon = document.getElementById('saveBrandIcon');
  if (icon) {
    icon.style.display = 'none';
  }
}

/**
 * Save new brand from edit form
 */
function saveNewBrandFromEditForm() {
  console.log('💾 Saving new brand from edit form');
  
  const input = document.getElementById('productBrand');
  const brandName = input.value.trim();
  
  if (!brandName) {
    console.warn('⚠️ Brand name empty');
    return;
  }
  
  // Disable button
  const saveBtn = document.getElementById('saveBrandIcon');
  if (saveBtn) saveBtn.disabled = true;
  
  // Save to backend
  fetch(ENDPOINT + '?action=addBrand&brandName=' + encodeURIComponent(brandName))
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ New brand saved:', brandName);
        hideSaveNewBrandIcon();
        
        // Show success briefly
        const originalText = saveBtn.textContent;
        if (saveBtn) {
          saveBtn.textContent = '✅ Saved!';
          saveBtn.style.background = '#4CAF50';
          
          setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '#4CAF50';
            saveBtn.disabled = false;
          }, 1500);
        }
      } else {
        console.error('❌ Failed to save brand:', data.error);
        if (saveBtn) saveBtn.disabled = false;
      }
    })
    .catch(error => {
      console.error('❌ Error saving brand:', error);
      if (saveBtn) saveBtn.disabled = false;
    });
}

// ==========================================
// AUTO-HIDE BRAND AUTOCOMPLETE DROPDOWN ON OUTSIDE CLICK
// ==========================================

document.addEventListener('click', function(event) {
  const brandAutocompleteDropdown = document.getElementById('brandAutocompleteDropdown');
  const productBrand = document.getElementById('productBrand');
  const saveBrandIcon = document.getElementById('saveBrandIcon');
  
  // Check if click is outside dropdown, input, and save button
  if (brandAutocompleteDropdown && productBrand) {
    if (!brandAutocompleteDropdown.contains(event.target) && 
        event.target !== productBrand && 
        event.target !== saveBrandIcon) {
      hideBrandDropdown();
    }
  }
});


// ==========================================
// 🏷️ BRAND AUTOCOMPLETE - GROUP FORM
// ==========================================

/**
 * When user focuses on group brand field - show top 5 brands
 */
function onGroupBrandFieldFocus() {
  console.log('📌 Group brand field focused');
  
  fetch(ENDPOINT + '?action=getLatestBrands&count=5')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.brands) {
        console.log('✅ Loaded top 5 brands for group');
        showGroupBrandDropdown(data.brands);
      }
    })
    .catch(error => console.error('❌ Error:', error));
}

/**
 * When user types in group brand field - filter brands
 */
function onGroupBrandFieldInput() {
  const input = document.getElementById('groupManufacturer');
  const value = input.value.trim();
  
  if (!value) {
    onGroupBrandFieldFocus();
    return;
  }
  
  fetch(ENDPOINT + '?action=searchBrands&searchTerm=' + encodeURIComponent(value))
    .then(response => response.json())
    .then(data => {
      if (data.success && data.brands) {
        if (data.brands.length === 0) {
          showSaveGroupBrandIcon();
          hideGroupBrandDropdown();
        } else {
          showGroupBrandDropdown(data.brands);
          hideSaveGroupBrandIcon();
        }
      }
    })
    .catch(error => console.error('❌ Error:', error));
}

/**
 * Handle keyboard events in group brand field
 */
function onGroupBrandFieldKeydown(event) {
  if (event.key === 'Escape') {
    hideGroupBrandDropdown();
  }
  if (event.key === 'Enter') {
    hideGroupBrandDropdown();
  }
}

/**
 * Display group brand dropdown
 */
function showGroupBrandDropdown(brands) {
  const dropdown = document.getElementById('groupBrandAutocompleteDropdown');
  if (!brands || brands.length === 0) {
    hideGroupBrandDropdown();
    return;
  }
  
  let html = '';
  brands.forEach(brand => {
    html += `
      <div 
        onclick="selectGroupBrand('${brand.replace(/'/g, "\\'")}')"
        style="
          padding: 12px 15px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        "
        onmouseover="this.style.backgroundColor = '#f5f5f5';"
        onmouseout="this.style.backgroundColor = 'transparent';"
      >
        • ${brand}
      </div>
    `;
  });
  
  dropdown.innerHTML = html;
  dropdown.style.display = 'block';
}

/**
 * Hide group brand dropdown
 */
function hideGroupBrandDropdown() {
  const dropdown = document.getElementById('groupBrandAutocompleteDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

/**
 * Select brand from group dropdown
 */
function selectGroupBrand(brandName) {
  console.log('✅ Selected group brand:', brandName);
  document.getElementById('groupManufacturer').value = brandName;
  hideGroupBrandDropdown();
  hideSaveGroupBrandIcon();
}

/**
 * Show save group brand icon
 */
function showSaveGroupBrandIcon() {
  const icon = document.getElementById('saveGroupBrandIcon');
  if (icon) icon.style.display = 'block';
}

/**
 * Hide save group brand icon
 */
function hideSaveGroupBrandIcon() {
  const icon = document.getElementById('saveGroupBrandIcon');
  if (icon) icon.style.display = 'none';
}

/**
 * Save new brand from group form
 */
function saveNewBrandFromGroupForm() {
  console.log('💾 Saving new brand from group form');
  
  const input = document.getElementById('groupManufacturer');
  const brandName = input.value.trim();
  
  if (!brandName) return;
  
  const saveBtn = document.getElementById('saveGroupBrandIcon');
  if (saveBtn) saveBtn.disabled = true;
  
  fetch(ENDPOINT + '?action=addBrand&brandName=' + encodeURIComponent(brandName))
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ New group brand saved');
        hideSaveGroupBrandIcon();
        
        if (saveBtn) {
          const originalText = saveBtn.textContent;
          saveBtn.textContent = '✅ Saved!';
          setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
          }, 1500);
        }
      } else {
        if (saveBtn) saveBtn.disabled = false;
      }
    })
    .catch(error => {
      console.error('❌ Error:', error);
      if (saveBtn) saveBtn.disabled = false;
    });
}

/**
 * Auto-hide group brand dropdown on outside click
 */
document.addEventListener('click', function(event) {
  const groupDropdown = document.getElementById('groupBrandAutocompleteDropdown');
  const groupInput = document.getElementById('groupManufacturer');
  const saveGroupIcon = document.getElementById('saveGroupBrandIcon');
  
  if (groupDropdown && groupInput) {
    if (!groupDropdown.contains(event.target) && 
        event.target !== groupInput && 
        event.target !== saveGroupIcon) {
      hideGroupBrandDropdown();
    }
  }
});



