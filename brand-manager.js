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
 * SECTION 5: OPEN ADD BRANDS MODAL
 * ==========================================
 */

function openAddBrandsModal() {
  console.log('📋 Opening Add Brands Modal');
  
  pendingBrands = [];
  
  // Reset form
  document.getElementById('brandInput').value = '';
  updateBrandPreviewList();
  
  // Show modal using Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('addBrandsModal'));
  modal.show();
  
  // Focus input
  setTimeout(() => {
    document.getElementById('brandInput').focus();
  }, 100);
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
      <div style="padding: 10px; color: #999; text-align: center; font-size: 14px;">
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
        padding: 8px 10px; border-bottom: 1px solid #e0e0e0;
        background: white; transition: background 0.2s;
      " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='white'">
        
        <span style="font-size: 13px; color: #333; flex: 1;">
          <strong style="color: #007bff;">${index + 1}.</strong> 
          <span>${escapeHtml(brand)}</span>
        </span>
        
        <button onclick="removePendingBrand('${escapeHtml(brand)}')" style="
          background: #dc3545; color: white; border: none; 
          padding: 4px 8px; border-radius: 3px; cursor: pointer;
          font-size: 11px; font-weight: bold; transition: background 0.2s;
        " onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">
          ✕
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
  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('addBrandsModal'));
  if (modal) {
    modal.hide();
  }
  
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
