/**
 * Debug utilities for table layouts
 * Giúp debug vấn đề với localStorage và active layout
 */

export function debugLayouts() {
  try {
    const saved = localStorage.getItem('table-layouts');
    if (!saved) {
      // console.log removed
      return;
    }

    const layouts = JSON.parse(saved);
    console.log('📊 Layouts in localStorage:', {
      count: layouts.length,
      layouts: layouts.map((l: any, index: number) => ({
        index,
        name: l.name,
        isActive: l.isActive,
        tablesCount: l.tables?.length || 0,
        gridSize: `${l.gridCols}x${l.gridRows}`,
        _id: l._id,
      })),
    });

    const activeLayout = layouts.find((l: any) => l.isActive === true);
    if (activeLayout) {
      console.log('✅ Active layout found:', {
        name: activeLayout.name,
        tablesCount: activeLayout.tables?.length || 0,
        tables: activeLayout.tables?.map((t: any) => t.tableName),
      });
    } else {
      // console.log removed
      // console.log removed
    }

    return layouts;
  } catch (error) {
    console.error('❌ Error reading layouts:', error);
  }
}

export function setActiveLayout(layoutId: string) {
  try {
    const saved = localStorage.getItem('table-layouts');
    if (!saved) {
      // console.log removed
      return false;
    }

    const layouts = JSON.parse(saved);
    const updated = layouts.map((l: any) => ({
      ...l,
      isActive: l._id === layoutId,
    }));

    localStorage.setItem('table-layouts', JSON.stringify(updated));
    // console.log removed
    debugLayouts();
    return true;
  } catch (error) {
    console.error('❌ Error setting active layout:', error);
    return false;
  }
}

export function clearLayouts() {
  localStorage.removeItem('table-layouts');
  // console.log removed
}

export function exportLayouts() {
  const saved = localStorage.getItem('table-layouts');
  if (saved) {
    const blob = new Blob([saved], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-layouts-${Date.now()}.json`;
    a.click();
    // console.log removed
  }
}

export function importLayouts(jsonString: string) {
  try {
    const layouts = JSON.parse(jsonString);
    localStorage.setItem('table-layouts', JSON.stringify(layouts));
    // console.log removed
    debugLayouts();
    return true;
  } catch (error) {
    console.error('❌ Error importing layouts:', error);
    return false;
  }
}

// Expose to window for easy debugging in console
if (typeof window !== 'undefined') {
  (window as any).debugLayouts = debugLayouts;
  (window as any).setActiveLayout = setActiveLayout;
  (window as any).clearLayouts = clearLayouts;
  (window as any).exportLayouts = exportLayouts;
  (window as any).importLayouts = importLayouts;
}
