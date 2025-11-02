/**
 * ==========================================
 * BRAND MANAGEMENT MODULE
 * File: brand-manager.js
 * ==========================================
 */

// ===== GLOBAL VARIABLES =====
let cachedBrands = [];
let currentBrandId = null;

/**
 * ==========================================
 * SECTION 1: NAVIGATION FUNCTIONS
 * ==========================================
 */

// Navigate to Brands Page
function navigateToBrands() {
  console.log('🏷️ Navigating to Brands');
  
  currentPage = 'brands';
  
  // === STEP 1: Get page elements ===
  const mainApp = document.getElementById('mainApp');
  const allProductsPage = document.getElementById('allProductsPage');
  const productGroupsPage = document.getElementById('productGroupsPage');
  const customersPage = document.getElementById('customersPage');
  const brandsPage = document.getElementById('brandsPage');
  const groupDetailPage = document.getElementById('groupDetailPage');
  
  // === STEP 2: Hide all other pages ===
  if (mainApp) {
    mainApp.style.display = 'none';
    mainApp.classList.remove('active');
  }
  
  if (allProductsPage) {
    allProductsPage.classList.remove('active');
    allProductsPage.style.display = 'none';
  }
  
  if (productGroupsPage) {
    productGroupsPage.classList.remove('active');
    productGroupsPage.style.display = 'none';
  }
  
  if (customersPage) {
    customersPage.classList.remove('active');
    customersPage.style.display = 'none';
  }
  
  if (groupDetailPage) {
    groupDetailPage.classList.remove('active');
    groupDetailPage.style.display = 'none';
  }
  
  // === STEP 3: Show brands page ===
  if (brandsPage) {
    brandsPage.classList.add('active');
    brandsPage.style.display = 'block';
    console.log('✅ Brands page displayed');
  } else {
    console.error('❌ brandsPage element not found!');
    return;
  }
  
  // === STEP 4: Hide the blue navbar ===
  const navbar = document.querySelector('.navbar.navbar-dark.bg-primary');
  if (navbar) {
    navbar.style.display = 'none';
  }
  
  // === STEP 5: Load brands from backend ===
  if (typeof loadBrands === 'function') {
    loadBrands();
    console.log('✅ Brands data loaded');
  } else {
    console.warn('⚠️ loadBrands function not found');
  }
  
  // === STEP 6: Close sidebar and scroll ===
  if (typeof closeSidebar === 'function') {
    closeSidebar();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * ==========================================
 * SECTION 2: DATA LOADING FUNCTIONS
 * ==========================================
 */

// Load Brands from Backend
async function loadBrands() {
  try {
    console.log('📡 Fetching brands from server...');
    
    // Build URL with authentication
    const url = `${GOOGLE_SCRIPT_URL}?action=getBrands&email=${encodeURIComponent(userEmail)}&hash=${encodeURIComponent(userHash)}&t=${Date.now()}`;
    
    // Fetch data
    const response = await fetch(url);
    const data = await response.json();
    
    // Check response
    if (data.success && data.brands) {
      cachedBrands = data.brands;
      console.log('✅ Loaded', data.brands.length, 'brands');
      
      // Render brands list
      renderBrandsList();
    } else {
      throw new Error(data.error || 'Failed to load brands');
    }
    
  } catch (error) {
    console.error('❌ Error loading brands:', error);
    
    // Show error message
    const container = document.getElementById('brandsListContainer');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#dc3545;">
          <i class="bi bi-exclamation-circle" style="font-size:48px;"></i>
          <h4 style="margin-top:20px;">Error Loading Brands</h4>
          <p>${error.message}</p>
          <button class="btn btn-primary mt-3" onclick="loadBrands()">
            <i class="bi bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      `;
    }
  }
}

/**
 * ==========================================
 * SECTION 3: RENDERING FUNCTIONS
 * ==========================================
 */

// Render Brands List
function renderBrandsList() {
  console.log('🎨 Rendering brands list...');
  
  const container = document.getElementById('brandsListContainer');
  const emptyState = document.getElementById('brandsEmptyState');
  
  if (!container) {
    console.error('brandsListContainer not found!');
    return;
  }
  
  // Check if no brands
  if (!cachedBrands || cachedBrands.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
    }
    console.log('No brands to display');
    return;
  }
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Build HTML
  let html = '<div style="padding:20px; max-width:1200px; margin:0 auto;">';
  
  cachedBrands.forEach(brand => {
    // Get brand info
    const productCount = brand.productCount || 0;
    const brandName = brand.brandName || 'Unknown';
    const manufacturerId = brand.manufacturerId || 'N/A';
    
    // Create brand card
    html += `
      <div class="card mb-3 shadow-sm" style="cursor:pointer; transition:transform 0.2s;" 
           onmouseover="this.style.transform='scale(1.02)'" 
           onmouseout="this.style.transform='scale(1)'"
           onclick="showBrandDetails('${brand.brandId}')">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <h5 class="mb-2">
                🏷️ ${escapeHtml(brandName)}
              </h5>
              <p class="text-muted mb-2" style="font-size:14px;">
                <i class="bi bi-factory"></i> Manufacturer ID: ${escapeHtml(manufacturerId)}
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <i class="bi bi-boxes"></i> Products: ${productCount}
              </p>
              <small class="text-muted">Created: ${new Date(brand.createdDate).toLocaleDateString('en-IN')}</small>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-primary" 
                      onclick="event.stopPropagation(); openEditBrandModal('${brand.brandId}')"
                      title="Edit Brand">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger" 
                      onclick="event.stopPropagation(); confirmDeleteBrand('${brand.brandId}', '${escapeHtml(brandName)}')"
                      title="Delete Brand">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Render to page
  container.innerHTML = html;
  console.log(`✅ Rendered ${cachedBrands.length} brands`);
}

// Filter Brands (Search)
function filterBrands(searchText) {
  const text = searchText.toLowerCase().trim();
  
  if (!text) {
    renderBrandsList();
    return;
  }
  
  // Filter brands
  const filtered = cachedBrands.filter(b => {
    return b.brandName.toLowerCase().includes(text) ||
           (b.manufacturerId && b.manufacturerId.includes(text));
  });
  
  // Render filtered list
  const container = document.getElementById('brandsListContainer');
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#999;">
        <i class="bi bi-search" style="font-size:48px;"></i>
        <h4 style="margin-top:20px;">No brands found</h4>
        <p>Try a different search term</p>
      </div>
    `;
    return;
  }
  
  // Render filtered results
  let html = '<div style="padding:20px; max-width:1200px; margin:0 auto;">';
  
  filtered.forEach(brand => {
    const productCount = brand.productCount || 0;
    const brandName = brand.brandName || 'Unknown';
    const manufacturerId = brand.manufacturerId || 'N/A';
    
    html += `
      <div class="card mb-3" style="cursor:pointer;" onclick="showBrandDetails('${brand.brandId}')">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <h5 class="mb-2">🏷️ ${escapeHtml(brandName)}</h5>
              <p class="text-muted mb-2" style="font-size:14px;">
                <i class="bi bi-factory"></i> Manufacturer ID: ${escapeHtml(manufacturerId)}
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <i class="bi bi-boxes"></i> Products: ${productCount}
              </p>
              <small class="text-muted">Created: ${new Date(brand.createdDate).toLocaleDateString('en-IN')}</small>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); openEditBrandModal('${brand.brandId}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); confirmDeleteBrand('${brand.brandId}', '${escapeHtml(brandName)}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * ==========================================
 * SECTION 4: MODAL FUNCTIONS
 * ==========================================
 */

// Open Add Brand Modal
function openAddBrandModal() {
  console.log('➕ Opening Add Brand modal');
  
  // Reset current brand ID
  currentBrandId = null;
  
  // Set modal title
  document.getElementById('brandFormTitle').textContent = 'Add Brand';
  
  // Clear all form fields
  document.getElementById('brandId').value = '';
  document.getElementById('brandName').value = '';
  document.getElementById('manufacturerId').value = '';
  document.getElementById('brandDescription').value = '';
  document.getElementById('brandCountry').value = '';
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('brandModal'));
  modal.show();
}

// Open Edit Brand Modal
function openEditBrandModal(brandId) {
  console.log('✏️ Opening Edit Brand modal for:', brandId);
  
  // Find brand in cache
  const brand = cachedBrands.find(b => b.brandId === brandId);
  
  if (!brand) {
    console.error('Brand not found:', brandId);
    alert('Brand not found!');
    return;
  }
  
  // Set current brand ID
  currentBrandId = brandId;
  
  // Set modal title
  document.getElementById('brandFormTitle').textContent = 'Edit Brand';
  
  // Fill form with brand data
  document.getElementById('brandId').value = brand.brandId;
  document.getElementById('brandName').value = brand.brandName;
  document.getElementById('manufacturerId').value = brand.manufacturerId || '';
  document.getElementById('brandDescription').value = brand.description || '';
  document.getElementById('brandCountry').value = brand.country || '';
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('brandModal'));
  modal.show();
}

// Save Brand (Add or Update)
async function saveBrand() {
  console.log('💾 Saving brand...');
  
  // Get form values
  const brandName = document.getElementById('brandName').value.trim();
  
  // Validation
  if (!brandName) {
    alert('Brand name is required!');
    document.getElementById('brandName').focus();
    return;
  }
  
  // Prepare brand data
  const brandData = {
    action: currentBrandId ? 'updateBrand' : 'addBrand',
    email: userEmail,
    hash: userHash,
    brandId: currentBrandId || '',
    brandName: brandName,
    manufacturerId: document.getElementById('manufacturerId').value.trim(),
    description: document.getElementById('brandDescription').value.trim(),
    country: document.getElementById('brandCountry').value.trim()
  };
  
  try {
    // Prepare form data
    const formData = new URLSearchParams();
    Object.keys(brandData).forEach(key => {
      formData.append(key, brandData[key] || '');
    });
    
    // Send to backend
    console.log('Sending brand data to server...');
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('Server response:', result);
    
    // Check result
    if (result.success) {
      console.log('✅ Brand saved successfully!');
      
      // Show success message
      alert(currentBrandId ? 'Brand updated successfully!' : 'Brand added successfully!');
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('brandModal'));
      if (modal) {
        modal.hide();
      }
      
      // Reload brands list
      await loadBrands();
      
    } else {
      throw new Error(result.error || 'Failed to save brand');
    }
    
  } catch (error) {
    console.error('❌ Error saving brand:', error);
    alert('Error saving brand: ' + error.message);
  }
}

// Confirm Delete Brand
function confirmDeleteBrand(brandId, brandName) {
  console.log('🗑️ Confirm delete:', brandId);
  
  // Ask for confirmation
  const confirmed = confirm(`Delete brand "${brandName}"?\n\nThis action cannot be undone.`);
  
  if (confirmed) {
    deleteBrand(brandId);
  }
}

// Delete Brand
async function deleteBrand(brandId) {
  console.log('🗑️ Deleting brand:', brandId);
  
  try {
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('action', 'deleteBrand');
    formData.append('email', userEmail);
    formData.append('hash', userHash);
    formData.append('brandId', brandId);
    
    // Send to backend
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    // Check result
    if (result.success) {
      console.log('✅ Brand deleted successfully');
      
      // Show success message
      alert('Brand deleted successfully!');
      
      // Reload brands list
      await loadBrands();
      
    } else {
      throw new Error(result.error || 'Failed to delete brand');
    }
    
  } catch (error) {
    console.error('❌ Error deleting brand:', error);
    alert('Error deleting brand: ' + error.message);
  }
}

/**
 * ==========================================
 * SECTION 5: BRAND DETAIL VIEW
 * ==========================================
 */

// Show Brand Details
function showBrandDetails(brandId) {
  console.log('👁️ Showing brand details:', brandId);
  
  // Find brand in cache
  const brand = cachedBrands.find(b => b.brandId === brandId);
  
  if (!brand) {
    console.error('Brand not found:', brandId);
    alert('Brand not found!');
    return;
  }
  
  // Set current brand ID
  currentBrandId = brandId;
  
  // Fill brand info in modal
  document.getElementById('detailBrandName').textContent = brand.brandName;
  document.getElementById('detailManufacturerId').textContent = brand.manufacturerId || 'N/A';
  document.getElementById('detailBrandDescription').textContent = brand.description || 'No description';
  document.getElementById('detailBrandCountry').textContent = brand.country || 'Unknown';
  document.getElementById('detailProductCount').textContent = brand.productCount || 0;
  document.getElementById('detailCreatedDate').textContent = new Date(brand.createdDate).toLocaleDateString('en-IN');
  
  // Show Info tab by default
  showBrandTab('info');
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('brandDetailModal'));
  modal.show();
}

// Show Brand Tab (Info/Products)
function showBrandTab(tab) {
  console.log('📑 Switching to tab:', tab);
  
  // Hide all tabs
  document.getElementById('brandInfoTab').style.display = 'none';
  document.getElementById('brandProductsTab').style.display = 'none';
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.brand-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  if (tab === 'info') {
    document.getElementById('brandInfoTab').style.display = 'block';
    document.querySelector('[onclick*="showBrandTab(\'info\')"]').classList.add('active');
    
  } else if (tab === 'products') {
    document.getElementById('brandProductsTab').style.display = 'block';
    document.querySelector('[onclick*="showBrandTab(\'products\')"]').classList.add('active');
    
    // Load products when tab is opened
    loadBrandProducts(currentBrandId);
  }
}

/**
 * ==========================================
 * SECTION 6: BRAND PRODUCTS
 * ==========================================
 */

// Load Brand Products
async function loadBrandProducts(brandId) {
  console.log('📦 Loading products for brand:', brandId);
  
  const container = document.getElementById('brandProductsList');
  
  // Show loading state
  container.innerHTML = '<p class="text-center text-muted"><i class="spinner-border spinner-border-sm"></i> Loading products...</p>';
  
  try {
    // Fetch products from backend
    const url = `${GOOGLE_SCRIPT_URL}?action=getBrandProducts&brandId=${encodeURIComponent(brandId)}&t=${Date.now()}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check response
    if (!data.success) {
      throw new Error(data.error || 'Failed to load products');
    }
    
    // Check if no products
    if (!data.products || data.products.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#999;">
          <i class="bi bi-box-seam" style="font-size:48px;"></i>
          <h5 style="margin-top:20px;">No Products Yet</h5>
          <p>This brand doesn't have any products yet</p>
        </div>
      `;
      return;
    }
    
    // Build products table
    let html = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add each product
    data.products.forEach(p => {
      const price = p.price ? `₹${parseFloat(p.price).toFixed(2)}` : 'N/A';
      const stock = p.stock || 0;
      
      html += `
        <tr>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.category || 'N/A')}</td>
          <td>
            <span class="badge ${stock > 10 ? 'bg-success' : stock > 0 ? 'bg-warning' : 'bg-danger'}">
              ${stock}
            </span>
          </td>
          <td class="text-end"><strong>${price}</strong></td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
      <div class="text-muted text-end" style="padding:10px;">
        <small>Total Products: ${data.products.length}</small>
      </div>
    `;
    
    container.innerHTML = html;
    console.log(`✅ Loaded ${data.products.length} products`);
    
  } catch (error) {
    console.error('❌ Error loading products:', error);
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#dc3545;">
        <i class="bi bi-exclamation-circle" style="font-size:48px;"></i>
        <h5 style="margin-top:20px;">Error Loading Products</h5>
        <p>${error.message}</p>
        <button class="btn btn-sm btn-primary mt-3" onclick="loadBrandProducts('${brandId}')">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    `;
  }
}

/**
 * ==========================================
 * SECTION 7: HELPER FUNCTIONS
 * ==========================================
 */

// Escape HTML (prevent XSS attacks)
function escapeHtml(text) {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * ==========================================
 * END OF BRAND MANAGEMENT MODULE
 * ==========================================
 */

console.log('✅ Brand Management Module Loaded');
