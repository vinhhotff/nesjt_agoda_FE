/**
 * Force Cleanup Layouts Script
 * Chạy script này trong console để fix vấn đề "Default Layout" bị ưu tiên
 */

(function forceCleanupLayouts() {
  console.log('🔧 Starting layout cleanup...');
  
  const saved = localStorage.getItem('table-layouts');
  if (!saved) {
    console.log('❌ No layouts found in localStorage');
    return;
  }
  
  let layouts = JSON.parse(saved);
  console.log('📊 Before cleanup:', layouts.map(l => ({
    name: l.name,
    isActive: l.isActive,
    tables: l.tables?.length || 0
  })));
  
  let changed = false;
  
  // Step 1: Remove "Default Layout" if other layouts exist
  const hasDefaultLayout = layouts.some(l => l.name === 'Default Layout');
  const hasOtherLayouts = layouts.some(l => l.name !== 'Default Layout');
  
  if (hasDefaultLayout && hasOtherLayouts) {
    console.log('🗑️ Removing "Default Layout" because other layouts exist');
    layouts = layouts.filter(l => l.name !== 'Default Layout');
    changed = true;
  }
  
  // Step 2: Fix undefined isActive
  layouts.forEach((l, index) => {
    if (l.isActive === undefined) {
      console.log(`🔧 Fixing undefined isActive for "${l.name}"`);
      l.isActive = (index === 0);
      changed = true;
    }
  });
  
  // Step 3: Ensure only one layout is active
  const activeLayouts = layouts.filter(l => l.isActive === true);
  
  if (activeLayouts.length > 1) {
    console.log('⚠️ Multiple active layouts found:', activeLayouts.map(l => l.name));
    // Prefer non-default layout
    const preferredActive = activeLayouts.find(l => l.name !== 'Default Layout') || activeLayouts[0];
    console.log('✅ Keeping only:', preferredActive.name);
    
    layouts.forEach(l => {
      l.isActive = (l._id === preferredActive._id);
    });
    changed = true;
  } else if (activeLayouts.length === 0 && layouts.length > 0) {
    console.log('⚠️ No active layout found, setting first as active');
    layouts[0].isActive = true;
    changed = true;
  }
  
  // Step 4: Save if changed
  if (changed) {
    localStorage.setItem('table-layouts', JSON.stringify(layouts));
    console.log('✅ Layouts cleaned and saved!');
    console.log('📊 After cleanup:', layouts.map(l => ({
      name: l.name,
      isActive: l.isActive,
      tables: l.tables?.length || 0
    })));
    
    alert('✅ Layouts cleaned! Please reload the page.');
  } else {
    console.log('✅ Layouts are already clean, no changes needed');
  }
  
  // Step 5: Verify
  const activeCount = layouts.filter(l => l.isActive).length;
  const hasDefault = layouts.some(l => l.name === 'Default Layout');
  
  console.log('\n📋 Summary:');
  console.log(`- Total layouts: ${layouts.length}`);
  console.log(`- Active layouts: ${activeCount}`);
  console.log(`- Has "Default Layout": ${hasDefault}`);
  console.log(`- Active layout: ${layouts.find(l => l.isActive)?.name || 'None'}`);
  
  if (activeCount === 1 && !hasDefault) {
    console.log('✅ All good!');
  } else {
    console.log('⚠️ Still has issues, please check manually');
  }
})();
