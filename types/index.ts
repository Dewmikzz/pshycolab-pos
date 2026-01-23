export interface Product {
    id: string;
    name: string;
    price: number;
    category: string; // This refers to Category.id
    image?: string;
    description?: string;
    modifierGroups?: string[]; // IDs of ModifierGroups specific to this product
}

export interface Category {
    id: string;
    label: string;
    modifierGroups?: string[]; // IDs of ModifierGroups applied to all products in this category
}

export interface ModifierOption {
    id: string;
    label: string;
    price: number;
}

export interface ModifierGroup {
    id: string;
    label: string;
    selectionType: 'single' | 'multiple';
    minSelection: number; // 0 for optional, 1 for required
    maxSelection: number; // 1 for single, >1 for limit, -1 for unlimited
    options: ModifierOption[];
}

export interface CartItem extends Product {
    cartItemId: string; // Unique ID for this line item (to distinguish variants)
    quantity: number;
    selectedModifiers?: { [groupId: string]: ModifierOption[] }; // Store full option details to preserve price
}

export interface Order {
    tableId: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'cooking' | 'ready' | 'served' | 'paid';
    updatedAt?: number;
}

export interface Receipt {
    id: string; // Firebase ID
    receiptNumber: string; // Human readable e.g. RC-1001
    tableId: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    rounding: number;
    total: number;
    paidAmount: number;
    change: number;
    paymentMethod: 'cash' | 'card' | 'qr' | 'grab_food' | 'grab_dine_out' | 'custom';
    timestamp: number;
}

export interface Table {
    id: string;
    label: string;
    token?: string; // Secure token
}

export interface Shift {
    id: string;
    openedAt: number;
    closedAt?: number;
    startCash: number;

    // Cash Drawer Specific
    cashPayments: number; // Accumulated from sales
    cashDrops: number; // Add/Remove manual cash
    expectedCash: number; // start + payments + drops
    actualCash?: number;

    // Total Sales Reporting
    totalSales: number;
    cardSales: number;
    qrSales: number;
    grabFoodSales: number;
    grabDineOutSales: number;
    customSales: number;

    status: 'open' | 'closed';
    notes?: string;
}

export interface RestaurantSettings {
    name: string;
    address: string;
    phone: string;
    footerMessage: string;
}

export interface PrinterSettings {
    paperWidth: '80mm' | '58mm';
    autoPrint: boolean;
    printerType: 'browser';
}
