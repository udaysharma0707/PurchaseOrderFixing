/**
 * ==========================================
 * BRANDS MANAGEMENT - PHASE 2 (SIMPLIFIED)
 * Simple: Create & Delete Only
 * File: brand-manager.js
 * ==========================================
 */

// ===== GLOBAL VARIABLES =====
let brandsCache = [];
let pendingBrands = [];

/**
 * ==========================================
 * SECTION 1: NAVIGATION
 * ==========================================
 */

function navigateToBrands() {
  console.log('🏷️ Navigating to Brands');
  
  // Hide navbar
  const navbar = document.querySelector('.navbar.navbar-dark.bg-primary');
  if (navbar) {
    navbar.style.display = 'none';
  }
  
  // Show brands page
  const brandsPage = document.getElementById('brandsPage');
  if (brandsPage) {
    brandsPage.style.display = 'block';
  }
  
  // Close sidebar
  if (typeof closeSidebar === 'function') {
    closeSidebar();
  }
  
  // Render page
  renderBrandsPage();
}

/**
 * ==========================================
 * SECTION 2: RENDER BRANDS PAGE
 * ==========================================
 */

function renderBrandsPage() {
  console.log('🎨 Rendering Brands Page');
  
  const brandsPageContent = document.getElementById('brandsPageContent');
  
  if (!brandsPageContent) {
    console.error('❌ brandsPageContent not found');
    return;
  }
  
  // Build page HTML
  const pageHTML = `
    <div style="padding: 0; width: 100%; min-height: 100vh; background: #f8f9fa;">
      
      <!-- HEADER: Back Button + Title + Add Brands Button -->
      <div style="background: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <!-- Back Button -->
        <button onclick="goBackHome()" style="
          background: none; border: none; font-size: 24px; cursor: pointer;
          color: #007bff; padding: 5px 10px;
        ">← Back</button>
        
        <!-- Title -->
        <h2 style="margin: 0; flex: 1; text-align: center; font-size: 20px;">🏷️ Brands</h2>
        
        <!-- Add Brands Button -->
        <button onclick="openAddBrandsModal()" style="
          background: #28a745; color: white; border: none; padding: 8px 16px;
          border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;
        ">+ Add</button>
      </div>
      
      <!-- BRANDS LIST -->
      <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
        <div id="brandsList" style="
          background: white; border-radius: 8px; padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <p style="text-align: center; color: #999;">Loading brands...</p>
        </div>
      </div>
      
    </div>
  `;
  
  brandsPageContent.innerHTML = pageHTML;
  
  // Load and display brands
  loadBrandsFromBackend();
}

/**
 * ==========================================
 * SECTION 3: LOAD BRANDS FROM BACKEND
 * ==========================================
 */

function loadBrandsFromBackend() {
  console.log('📡 Fetching brands from backend...');
  
  fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify({ action: 'getBrands' })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Response:', data);
    
    if (data.success && data.brands) {
      brandsCache = data.brands;
      console.log('✅ Loaded', data.brands.length, 'brands');
      displayBrandsList(data.brands);
    } else {
      console.warn('⚠️ No brands found or error');
      displayBrandsList([]);
    }
  })
  .catch(error => {
    console.error('❌ Error fetching brands:', error);
    displayBrandsList([]);
  });
}

/**
 * ==========================================
 * SECTION 4: DISPLAY BRANDS LIST
 * ==========================================
 */

function displayBrandsList(brands) {
  const brandsList = document.getElementById('brandsList');
  
  if (!brandsList) return;
  
  if (!brands || brands.length === 0) {
    brandsList.innerHTML = `
      <p style="text-align: center; color: #999; padding: 30px;">
        📭 No brands yet. Click "+ Add" to create one!
      </p>
    `;
    return;
  }
  
  let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
  
  brands.forEach((brand, index) => {
    html += `
      <li style="
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px; border-bottom: 1px solid #f0f0f0;
        transition: background 0.2s;
      " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='transparent'">
        
        <span style="font-size: 14px; color: #333;">
          <strong>${(index + 1)}.</strong> ${escapeHtml(brand)}
        </span>
        
        <button onclick="deleteBrandConfirm('${escapeHtml(brand)}')" style="
          background: #dc3545; color: white; border: none;
          padding: 5px 10px; border-radius: 3px; cursor: pointer;
          font-size: 12px; font-weight: bold;
        ">🗑️ Delete</button>
      </li>
    `;
  });
  
  html += '</ul>';
  brandsList.innerHTML = html;
  console.log('✅ Brands list displayed');
}

/**
 * ==========================================
 * SECTION 5: ADD BRANDS MODAL
 * ==========================================
 */

function openAddBrandsModal() {
  console.log('📋 Opening Add Brands Modal');
  
  pendingBrands = [];
  
  // Create modal if it doesn't exist
  if (!document.getElementById('addBrandsModal')) {
    createAddBrandsModal();
  }
  
  // Reset form
  document.getElementById('brandInput').value = '';
  updateBrandPreviewList();
  
  // Show modal
  const modal = document.getElementById('addBrandsModal');
  modal.style.display = 'flex';
  
  // Focus input
  setTimeout(() => {
    document.getElementById('brandInput').focus();
  }, 100);
}

function createAddBrandsModal() {
  const modalHTML = `
    <div id="addBrandsModal" style="
      display: none; position: fixed; top: 0; left: 0;
      width: 100%; height: 100%; background: rgba(0,0,0,0.5);
      z-index: 2000; justify-content: center; align-items: center;
    " onclick="closeAddBrandsModalOverlay(event)">
      
      <div style="
        background: white; border-radius: 8px; padding: 30px;
        width: 90%; max-width: 450px; max-height: 80vh; overflow-y: auto;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2);
      " onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">
          <h4 style="margin: 0; color: #333; font-weight: bold;">➕ Add New Brands</h4>
          <button onclick="closeAddBrandsModal()" style="
            background: none; border: none; font-size: 24px; cursor: pointer; color: #999;
            padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
          ">✕</button>
        </div>
        
        <!-- Instructions -->
        <p style="color: #666; margin-bottom: 15px; font-size: 14px; line-height: 1.5;">
          Enter brand names below. Press <strong>Enter</strong> or <strong>Comma (,)</strong> after each brand name to add multiple brands:
        </p>
        
        <!-- Input Field -->
        <input id="brandInput" type="text" placeholder="e.g., Somany"
          style="
            width: 100%; padding: 12px; border: 2px solid #e0e0e0;
            border-radius: 5px; margin-bottom: 20px; font-size: 14px;
            box-sizing: border-box; transition: border-color 0.3s;
          "
          onfocus="this.style.borderColor='#007bff'"
          onblur="this.style.borderColor='#e0e0e0'"
          onkeydown="handleBrandInputKeydown(event)"
        />
        
        <!-- Preview Section -->
        <div style="margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 14px; color: #333;" id="previewCount">
            📝 Brands to Save (0):
          </p>
          <div id="brandPreviewList" style="
            list-style: none; padding: 0; margin: 0;
            background: #f8f9fa; border: 1px solid #e0e0e0;
            border-radius: 5px; max-height: 200px; overflow-y: auto;
            min-height: 40px;
          ">
            <div style="padding: 15px; color: #999; text-align: center; font-size: 14px;">
              No brands added yet
            </div>
          </div>
        </div>
        
        <!-- Buttons -->
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px; border-top: 1px solid #f0f0f0; padding-top: 15px;">
          <button onclick="closeAddBrandsModal()" style="
            background: #e9ecef; color: #333; border: none;
            padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;
            font-size: 14px; transition: background 0.2s;
          " onmouseover="this.style.background='#dee2e6'" onmouseout="this.style.background='#e9ecef'">
            Cancel
          </button>
          
          <button onclick="saveAllBrands()" style="
            background: #007bff; color: white; border: none;
            padding: 10px 25px; border-radius: 5px; cursor: pointer; font-weight: bold;
            font-size: 14px; transition: background 0.2s;
          " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
            💾 Save All
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeAddBrandsModalOverlay(event) {
  if (event.target.id === 'addBrandsModal') {
    closeAddBrandsModal();
  }
}

function closeAddBrandsModal() {
  const modal = document.getElementById('addBrandsModal');
  if (modal) {
    modal.style.display = 'none';
  }
  pendingBrands = [];
  console.log('❌ Modal closed');
}

/**
 * ==========================================
 * SECTION 6: HANDLE BRAND INPUT
 * ==========================================
 */

function handleBrandInputKeydown(event) {
  const input = document.getElementById('brandInput');
  const value = input.value.trim();
  
  // Enter or Comma key
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    
    if (value && value.length > 0) {
      // Remove comma if typed
      const brand = value.replace(/,\s*$/, '').trim();
      
      // Add only if not duplicate
      if (brand && !pendingBrands.includes(brand)) {
        pendingBrands.push(brand);
        console.log('✅ Brand added to preview:', brand);
      }
      
      // Clear input
      input.value = '';
      updateBrandPreviewList();
    }
  }
}

/**
 * ==========================================
 * SECTION 7: UPDATE BRAND PREVIEW
 * ==========================================
 */

function updateBrandPreviewList() {
  const previewList = document.getElementById('brandPreviewList');
  const previewCount = document.getElementById('previewCount');
  
  if (!previewList) return;
  
  // Update count
  if (previewCount) {
    previewCount.textContent = `📝 Brands to Save (${pendingBrands.length}):`;
  }
  
  if (pendingBrands.length === 0) {
    previewList.innerHTML = `
      <div style="padding: 15px; color: #999; text-align: center; font-size: 14px;">
        No brands added yet
      </div>
    `;
    return;
  }
  
  let html = '';
  pendingBrands.forEach((brand, index) => {
    html += `
      <div style="
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 15px; border-bottom: 1px solid #e0e0e0;
        background: white; transition: background 0.2s;
      " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='white'">
        
        <span style="font-size: 14px; color: #333; flex: 1;">
          <strong style="color: #007bff;">${index + 1}.</strong> 
          <span>${escapeHtml(brand)}</span>
        </span>
        
        <button onclick="removePendingBrand('${escapeHtml(brand)}')" style="
          background: #dc3545; color: white; border: none; 
          padding: 5px 10px; border-radius: 3px; cursor: pointer;
          font-size: 12px; font-weight: bold; transition: background 0.2s;
        " onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">
          ✕ Remove
        </button>
      </div>
    `;
  });
  
  previewList.innerHTML = html;
}

function removePendingBrand(brand) {
  pendingBrands = pendingBrands.filter(b => b !== brand);
  updateBrandPreviewList();
  console.log('🗑️ Removed from preview:', brand);
}

/**
 * ==========================================
 * SECTION 8: SAVE ALL BRANDS
 * ==========================================
 */

function saveAllBrands() {
  if (pendingBrands.length === 0) {
    alert('⚠️ Please add at least one brand');
    return;
  }
  
  console.log('💾 Saving', pendingBrands.length, 'brands...');
  
  let saved = 0;
  let failed = 0;
  let failedBrands = [];
  
  // Save each brand
  pendingBrands.forEach((brand, index) => {
    setTimeout(() => {
      fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'addBrand',
          brandName: brand
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          saved++;
          console.log('✅ Saved:', brand);
        } else {
          failed++;
          failedBrands.push(brand);
          console.warn('⚠️ Failed:', brand, data.error);
        }
        
        // All done
        if (saved + failed === pendingBrands.length) {
          showSaveResult(saved, failed, failedBrands);
        }
      })
      .catch(error => {
        failed++;
        failedBrands.push(brand);
        console.error('❌ Error:', brand, error);
        
        if (saved + failed === pendingBrands.length) {
          showSaveResult(saved, failed, failedBrands);
        }
      });
    }, index * 200); // Stagger requests
  });
}

function showSaveResult(saved, failed, failedBrands) {
  closeAddBrandsModal();
  
  if (failed === 0) {
    alert(`✅ Success!\n\n${saved} brand(s) saved successfully!`);
  } else {
    let message = `✅ Saved: ${saved}\n❌ Failed: ${failed}`;
    if (failedBrands.length > 0) {
      message += `\n\nFailed brands:\n${failedBrands.join(', ')}`;
    }
    alert(message);
  }
  
  // Reload brands list
  loadBrandsFromBackend();
}

/**
 * ==========================================
 * SECTION 9: DELETE BRAND
 * ==========================================
 */

function deleteBrandConfirm(brand) {
  const confirmed = confirm(`🗑️ Delete "${brand}"?\n\nThis cannot be undone.`);
  
  if (confirmed) {
    deleteBrand(brand);
  }
}

function deleteBrand(brand) {
  console.log('🗑️ Deleting brand:', brand);
  
  fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify({ 
      action: 'deleteBrand',
      brandName: brand
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Brand deleted:', brand);
      alert('✅ Brand deleted successfully!');
      loadBrandsFromBackend();
    } else {
      console.warn('⚠️ Delete failed:', data.error);
      alert('❌ Failed to delete brand: ' + data.error);
    }
  })
  .catch(error => {
    console.error('❌ Error deleting brand:', error);
    alert('❌ Error deleting brand');
  });
}

/**
 * ==========================================
 * SECTION 10: HELPER FUNCTIONS
 * ==========================================
 */

function goBackHome() {
  console.log('🏠 Going back to home');
  
  // Show navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.style.display = 'flex';
  }
  
  // Hide brands page
  const brandsPage = document.getElementById('brandsPage');
  if (brandsPage) {
    brandsPage.style.display = 'none';
  }
  
  // Call navigate to home
  if (typeof navigateToHome === 'function') {
    navigateToHome();
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

console.log('✅ Brand Manager Module Loaded - PHASE 2');
