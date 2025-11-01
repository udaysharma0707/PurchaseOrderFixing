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
  ENDPOINT = 'https://script.google.com/macros/s/AKfycbxE_7-q-V3erJ1Cr3byU6X_ABgJddWrt8A7MrdYb3XSvTywY5MTK1tvktukHbtHtuY0/exec';
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
    
    container.innerHTML = '<div style="text-align:center;color:#999;">Loading...</div>';
    
    const url = typeof ENDPOINT !== 'undefined' && ENDPOINT.includes('script.google.com')    ? `${ENDPOINT}?action=getBrands`   : `${ENDPOINT}?action=getBrands`;  const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    if (!data.success || !data.brands) {
      throw new Error(data.error || 'Invalid response');
    }
    
    const brands = data.brands;
    cachedBrands = brands;
    brandCacheExpiry = Date.now() + CACHE_DURATION;
    
    if (brands.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">No brands yet</div>';
      return;
    }
    
    let html = '';
    brands.forEach(brand => {
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
    });
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('❌ Error loading brands:', error);
    document.getElementById('brandsListContainer').innerHTML = `
      <div style="color:#d32f2f;text-align:center;">
        ❌ ${error.message}
      </div>
    `;
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
// AUTO-HIDE DROPDOWNS ON OUTSIDE CLICK
// ==========================================

document.addEventListener('click', function(event) {
  const brandInputs = ['brand', 'photoProductBrand', 'groupManufacturer'];
  
  const isClickInsideDropdown = event.target.closest('.brand-dropdown-wrapper') ||
                                event.target.closest('.brand-dropdown-wrapper-photo') ||
                                event.target.closest('.brand-dropdown-wrapper-group');
  
  if (!isClickInsideDropdown) {
    hideBrandDropdown();
    hideBrandDropdownPhoto();
    hideBrandDropdownGroup();
  }
});


