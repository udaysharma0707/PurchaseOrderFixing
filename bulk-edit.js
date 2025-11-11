/**
 * ==========================================
 * 📦 BULK EDIT MODULE - ALL OPERATIONS
 * ==========================================
 * Handles: Category, Unit Type, Stock, Selling Price, Brand, Size
 * Created: Nov 11, 2025
 * ==========================================
 */



/**
 * ==========================================
 * 🎯 BULK EDIT - CATEGORY
 * ==========================================
 */

/**
 * Show Category Bulk Edit - HIDE MAIN BUTTON
 */
function showCategoryBulkEdit() {
  console.log('📝 Opening category bulk edit mode...');
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show category selection UI
  document.getElementById('categorySelectionDropdown').style.display = 'inline-block';
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  console.log('✅ Category selection UI shown');
}

/**
 * Select Bulk Category
 */
function selectBulkCategory(category) {
  console.log('📦 Selected category:', category);
  
  // ✅ Close category dropdown
  document.getElementById('categoryDropdownBtn').click();
  
  setTimeout(() => {
    // ✅ Set bulk edit mode
    bulkEditMode = {
      active: true,
      field: 'category',
      value: category,
      selectedProducts: []
    };
    
    // ✅ Update UI
    document.getElementById('selectedCategoryText').textContent = category;
    document.getElementById('updateCategoryBtn').style.display = 'inline-block';
    document.getElementById('cancelBulkEditBtn').style.display = 'inline-block';
    document.getElementById('selectedCount').textContent = '0';
    
    // ✅ Enable product selection
    enableProductSelection();
    
    showToast(`✅ Bulk edit mode: Update Category to "${category}"`, 'Click on products to select them', 'success');
  }, 100);
}

/**
 * Apply Bulk Category Update
 */
async function applyBulkCategoryUpdate() {
  if (bulkEditMode.selectedProducts.length === 0) {
    alert('⚠️ Please select at least one product');
    return;
  }
  
  const category = bulkEditMode.value;
  const count = bulkEditMode.selectedProducts.length;
  
  if (!confirm(`Update category to "${category}" for ${count} product(s)?`)) {
    return;
  }
  
  const btn = document.getElementById('updateCategoryBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  
  try {
    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'bulkUpdateCategory',
        productIds: bulkEditMode.selectedProducts,
        category: category
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Backend update failed');
    }
    
    console.log('✅ Backend update successful:', result);
    
    // ✅ Update local cache
    if (typeof cachedProducts !== 'undefined') {
      bulkEditMode.selectedProducts.forEach(productId => {
        const product = cachedProducts.find(p => p.id === productId);
        if (product) product.category = category;
      });
      localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
    }
    
    showToast('✅ Success!', `Updated ${result.updatedCount} product(s) to category "${category}"`, 'success');
    cancelBulkEdit();
    
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating products: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

/**
 * ==========================================
 * 🎯 BULK EDIT - UNIT TYPE
 * ==========================================
 */

/**
 * Show Unit Type Bulk Edit
 */
function showUnitTypeBulkEdit() {
  console.log('📝 Opening unit type bulk edit mode...');
  
  // ✅ HIDE THE MAIN DROPDOWN BUTTON
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'none';
  }
  
  // ✅ Show unit type selection UI
  document.getElementById('unitTypeSelectionDropdown').style.display = 'inline-block';
  document.getElementById('bulkEditInfoText').style.display = 'block';
  document.getElementById('bulkEditToolbar').classList.add('active');
  
  console.log('✅ Unit type selection UI shown');
}

/**
 * Select Bulk Unit Type
 */
function selectBulkUnitType(unitType) {
  console.log('📦 Selected unit type:', unitType);
  
  // ✅ Close unit type dropdown
  document.getElementById('unitTypeDropdownBtn').click();
  
  setTimeout(() => {
    // ✅ Set bulk edit mode
    bulkEditMode = {
      active: true,
      field: 'unitType',
      value: unitType,
      selectedProducts: []
    };
    
    // ✅ Update UI
    document.getElementById('selectedUnitTypeText').textContent = unitType;
    document.getElementById('updateUnitTypeBtn').style.display = 'inline-block';
    document.getElementById('cancelBulkEditBtn').style.display = 'inline-block';
    document.getElementById('selectedCountUnitType').textContent = '0';
    
    // ✅ Enable product selection
    enableProductSelection();
    
    showToast(`✅ Bulk edit mode: Update Unit Type to "${unitType}"`, 'Click on products to select them', 'success');
  }, 100);
}

/**
 * Apply Bulk Unit Type Update
 */
async function applyBulkUnitTypeUpdate() {
  if (bulkEditMode.selectedProducts.length === 0) {
    alert('⚠️ Please select at least one product');
    return;
  }
  
  const unitType = bulkEditMode.value;
  const count = bulkEditMode.selectedProducts.length;
  
  if (!confirm(`Update unit type to "${unitType}" for ${count} product(s)?`)) {
    return;
  }
  
  const btn = document.getElementById('updateUnitTypeBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  
  try {
    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'bulkUpdateUnitType',
        productIds: bulkEditMode.selectedProducts,
        unitType: unitType
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Backend update failed');
    }
    
    console.log('✅ Backend update successful:', result);
    
    // ✅ Update local cache
    if (typeof cachedProducts !== 'undefined') {
      bulkEditMode.selectedProducts.forEach(productId => {
        const product = cachedProducts.find(p => p.id === productId);
        if (product) product.unitType = unitType;
      });
      localStorage.setItem('inventory_products_cache', JSON.stringify(cachedProducts));
    }
    
    showToast('✅ Success!', `Updated ${result.updatedCount} product(s) to unit type "${unitType}"`, 'success');
    cancelBulkEdit();
    
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error updating products: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

/**
 * ==========================================
 * 🎯 COMMON FUNCTIONS - SELECTION & CANCEL
 * ==========================================
 */

/**
 * Enable Product Selection Mode
 */
function enableProductSelection() {
  console.log('🖱️ Product selection mode enabled');
  enableProductSelectionDesktop();
  enableProductSelectionMobile();
}

/**
 * Enable Desktop Selection
 */
function enableProductSelectionDesktop() {
  const tableRows = document.querySelectorAll('#productsTableBody tr[data-product-id]');
  
  tableRows.forEach(row => {
    const productId = row.getAttribute('data-product-id');
    row.classList.add('product-selectable');
    row.onclick = null;
    row.onclick = function(event) {
      if (event.target.closest('.btn')) return;
      event.stopPropagation();
      event.preventDefault();
      toggleProductSelectionDesktop(productId, row);
    };
  });
  
  console.log('✅ Desktop selection enabled for', tableRows.length, 'rows');
}

/**
 * Enable Mobile Selection
 */
function enableProductSelectionMobile() {
  const mobileCards = document.querySelectorAll('.mobile-item[data-product-id]');
  
  mobileCards.forEach(card => {
    const productId = card.getAttribute('data-product-id');
    card.classList.add('product-selectable');
    card.onclick = null;
    card.onclick = function(event) {
      if (event.target.closest('.btn')) return;
      event.stopPropagation();
      event.preventDefault();
      toggleProductSelectionMobile(productId, card);
    };
  });
  
  console.log('✅ Mobile selection enabled for', mobileCards.length, 'cards');
}

/**
 * Toggle Desktop Product Selection
 */
function toggleProductSelectionDesktop(productId, row) {
  if (!bulkEditMode.active) return;
  
  const index = bulkEditMode.selectedProducts.indexOf(productId);
  
  if (index > -1) {
    bulkEditMode.selectedProducts.splice(index, 1);
    row.classList.remove('product-selected');
  } else {
    bulkEditMode.selectedProducts.push(productId);
    row.classList.add('product-selected');
  }
  
  // ✅ Update count based on field
  updateSelectedCount();
}

/**
 * Toggle Mobile Product Selection
 */
function toggleProductSelectionMobile(productId, card) {
  if (!bulkEditMode.active) return;
  
  const indicator = card.querySelector('.selection-indicator');
  const index = bulkEditMode.selectedProducts.indexOf(productId);
  
  if (index > -1) {
    bulkEditMode.selectedProducts.splice(index, 1);
    card.classList.remove('product-selected');
    if (indicator) indicator.style.display = 'none';
  } else {
    bulkEditMode.selectedProducts.push(productId);
    card.classList.add('product-selected');
    if (indicator) indicator.style.display = 'flex';
  }
  
  // ✅ Update count based on field
  updateSelectedCount();
}

/**
 * Update Selected Count
 */
function updateSelectedCount() {
  const count = bulkEditMode.selectedProducts.length;
  
  if (bulkEditMode.field === 'category') {
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = count;
  } else if (bulkEditMode.field === 'unitType') {
    const el = document.getElementById('selectedCountUnitType');
    if (el) el.textContent = count;
  }
  // Add more fields here as needed
}

/**
 * Cancel Bulk Edit Mode
 */
function cancelBulkEdit() {
  console.log('✕ Cancelling bulk edit mode');
  
  // ✅ Reset state
  bulkEditMode = {
    active: false,
    field: null,
    value: null,
    selectedProducts: []
  };
  
  // ✅ SHOW MAIN DROPDOWN BUTTON BACK
  const mainDropdownContainer = document.querySelector('#bulkEditDropdown').closest('.dropdown');
  if (mainDropdownContainer) {
    mainDropdownContainer.style.display = 'inline-block';
  }
  
  // ✅ Hide all UI elements
  hideElement('categorySelectionDropdown');
  hideElement('unitTypeSelectionDropdown');
  hideElement('updateCategoryBtn');
  hideElement('updateUnitTypeBtn');
  hideElement('cancelBulkEditBtn');
  hideElement('bulkEditInfoText');
  
  const bulkToolbar = document.getElementById('bulkEditToolbar');
  if (bulkToolbar) bulkToolbar.classList.remove('active');
  
  // ✅ Reset text
  const selectedCategoryText = document.getElementById('selectedCategoryText');
  if (selectedCategoryText) selectedCategoryText.textContent = 'Select Category';
  
  const selectedUnitTypeText = document.getElementById('selectedUnitTypeText');
  if (selectedUnitTypeText) selectedUnitTypeText.textContent = 'Select Unit Type';
  
  // ✅ Remove selection classes
  document.querySelectorAll('.product-selected').forEach(el => {
    el.classList.remove('product-selected');
  });
  
  document.querySelectorAll('.selection-indicator').forEach(el => {
    el.style.display = 'none';
  });
  
  document.querySelectorAll('.product-selectable').forEach(el => {
    el.classList.remove('product-selectable');
    el.onclick = null;
  });
  
  console.log('✅ Bulk edit mode cancelled');
}

/**
 * Helper: Hide Element
 */
function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

/**
 * Toast Notification Helper
 */
function showToast(title, message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
    document.body.appendChild(toastContainer);
  }
  
  const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#0d6efd';
  
  const toastHTML = `
    <div class="toast show" role="alert" style="min-width: 300px; margin-bottom: 10px;">
      <div class="toast-header" style="background: ${bgColor}; color: white;">
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${message}</div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  setTimeout(() => {
    const toasts = toastContainer.querySelectorAll('.toast');
    if (toasts.length > 0) toasts[0].remove();
  }, 3000);
}

/**
 * ==========================================
 * 🎯 INITIALIZE ON DOM READY
 * ==========================================
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Bulk edit module initialized');
  
  // ✅ Make functions globally accessible
  window.showCategoryBulkEdit = showCategoryBulkEdit;
  window.selectBulkCategory = selectBulkCategory;
  window.applyBulkCategoryUpdate = applyBulkCategoryUpdate;
  
  window.showUnitTypeBulkEdit = showUnitTypeBulkEdit;
  window.selectBulkUnitType = selectBulkUnitType;
  window.applyBulkUnitTypeUpdate = applyBulkUnitTypeUpdate;
  
  window.cancelBulkEdit = cancelBulkEdit;
});

