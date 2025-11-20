import { Table } from '@/src/Types';

export interface TableLayout {
  _id?: string;
  name: string;
  gridCols: number;
  gridRows: number;
  isActive?: boolean; // Layout chính được hiển thị cho khách hàng
  zones?: {
    zoneId: string;
    zoneName: string;
    bounds: { x1: number; y1: number; x2: number; y2: number };
  }[];
  tables: {
    tableId: string;
    tableName: string;
    position: { x: number; y: number; rotation?: number };
    width?: number;
    height?: number;
    zoneName?: string;
    type?: string;
    capacity?: number;
  }[];
  backgroundImage?: string;
  description?: string;
}

/**
 * Tạo layout mặc định từ danh sách bàn
 * Tự động sắp xếp bàn theo lưới
 */
export function createDefaultLayout(tables: Table[]): TableLayout {
  const tablesPerRow = 4; // 4 bàn mỗi hàng
  const spacing = 1; // Khoảng cách giữa các bàn
  
  const layoutTables = tables.map((table, index) => {
    const row = Math.floor(index / tablesPerRow);
    const col = index % tablesPerRow;
    
    return {
      tableId: table._id,
      tableName: table.tableName,
      position: {
        x: col * 3, // Mỗi bàn chiếm 2 ô + 1 ô spacing
        y: row * 3,
        rotation: 0
      },
      width: 2,
      height: 2,
      type: 'rectangle',
      capacity: 4
    };
  });

  const gridCols = Math.min(tablesPerRow * 3, 12);
  const gridRows = Math.ceil(tables.length / tablesPerRow) * 3;

  return {
    name: 'Default Layout',
    gridCols,
    gridRows,
    tables: layoutTables,
    description: 'Auto-generated default layout',
    isActive: true // Layout mặc định luôn là active
  };
}

/**
 * Lấy hoặc tạo layout mặc định
 */
export function getOrCreateDefaultLayout(tables: Table[]): TableLayout {
  try {
    const saved = localStorage.getItem('table-layouts');
    if (saved) {
      const layouts: TableLayout[] = JSON.parse(saved);
      if (layouts.length > 0) {
        return layouts[0]; // Trả về layout đầu tiên
      }
    }
  } catch (error) {
    console.error('Error loading saved layouts:', error);
  }

  // Nếu không có layout nào, tạo mặc định
  const defaultLayout = createDefaultLayout(tables);
  
  // Lưu vào localStorage
  try {
    localStorage.setItem('table-layouts', JSON.stringify([defaultLayout]));
  } catch (error) {
    console.error('Error saving default layout:', error);
  }

  return defaultLayout;
}

/**
 * Kiểm tra xem có layout nào không
 */
export function hasLayout(): boolean {
  try {
    const saved = localStorage.getItem('table-layouts');
    if (saved) {
      const layouts: TableLayout[] = JSON.parse(saved);
      return layouts.length > 0;
    }
  } catch (error) {
    console.error('Error checking layouts:', error);
  }
  return false;
}
