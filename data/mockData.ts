import { Product, Table } from "@/types";

export const TABLES: Table[] = [
    ...Array.from({ length: 16 }, (_, i) => ({ id: `${i + 1}`, label: `${i + 1}` })),
    ...["A1", "A2", "B1", "B2"].map((label) => ({ id: label, label })),
].sort((a, b) => {
    const numA = parseInt(a.id);
    const numB = parseInt(b.id);
    if (isNaN(numA) || isNaN(numB)) return a.id.localeCompare(b.id);
    if (numA === numB) return a.id.localeCompare(b.id);
    return numA - numB;
});

export const PRODUCTS: Product[] = [
    // Rice & Curry
    { id: "rc1", name: "Chicken Rice & Curry", price: 550.00, category: "Rice & Curry" },
    { id: "rc2", name: "Fish Rice & Curry", price: 480.00, category: "Rice & Curry" },
    { id: "rc3", name: "Egg Rice & Curry", price: 420.00, category: "Rice & Curry" },
    { id: "rc4", name: "Vegetable Rice & Curry", price: 350.00, category: "Rice & Curry" },
    { id: "rc5", name: "Mutton Rice & Curry", price: 950.00, category: "Rice & Curry" },

    // Kottu
    { id: "kt1", name: "Chicken Kottu", price: 850.00, category: "Kottu" },
    { id: "kt2", name: "Egg Kottu", price: 700.00, category: "Kottu" },
    { id: "kt3", name: "Cheese Chicken Kottu", price: 1250.00, category: "Kottu" },
    { id: "kt4", name: "Vegetable Kottu", price: 600.00, category: "Kottu" },
    { id: "kt5", name: "Dolphin Kottu (Chicken)", price: 950.00, category: "Kottu" },

    // Hoppers & String Hoppers
    { id: "hp1", name: "Plain Hopper", price: 60.00, category: "Hoppers" },
    { id: "hp2", name: "Egg Hopper", price: 150.00, category: "Hoppers" },
    { id: "hp3", name: "String Hoppers (Set of 10)", price: 250.00, category: "Hoppers" },
    { id: "hp4", name: "Milk Hopper", price: 100.00, category: "Hoppers" },

    // Short Eats
    { id: "se1", name: "Fish Cutlet (Piece)", price: 80.00, category: "Short Eats" },
    { id: "se2", name: "Egg Roti", price: 180.00, category: "Short Eats" },
    { id: "se3", name: "Vegetable Patty", price: 70.00, category: "Short Eats" },
    { id: "se4", name: "Chicken Chinese Roll", price: 120.00, category: "Short Eats" },
    { id: "se5", name: "Ulundu Vadai", price: 90.00, category: "Short Eats" },

    // Beverages
    { id: "bv1", name: "Ceylon Tea (Milk)", price: 120.00, category: "Beverages" },
    { id: "bv2", name: "Ginger Beer (EGB)", price: 220.00, category: "Beverages" },
    { id: "bv3", name: "Woodapple Juice", price: 350.00, category: "Beverages" },
    { id: "bv4", name: "Fresh Lime Juice", price: 280.00, category: "Beverages" },
    { id: "bv5", name: "King Coconut", price: 150.00, category: "Beverages" },
    { id: "bv6", name: "Milo (Cold)", price: 250.00, category: "Beverages" },

    // Desserts
    { id: "ds1", name: "Watalappam", price: 450.00, category: "Desserts" },
    { id: "ds2", name: "Curd & Treacle", price: 380.00, category: "Desserts" },
    { id: "ds3", name: "Caramel Pudding", price: 420.00, category: "Desserts" },
    { id: "ds4", name: "Fruit Salad", price: 550.00, category: "Desserts" },
];

export const CATEGORIES: { id: string; label: string; modifierGroups?: string[] }[] = [
    { id: "Rice & Curry", label: "Rice & Curry", modifierGroups: ["mg_spice"] },
    { id: "Kottu", label: "Kottu", modifierGroups: ["mg_spice", "mg_kottu_extra"] },
    { id: "Hoppers", label: "Hoppers", modifierGroups: ["mg_sides_sl"] },
    { id: "Short Eats", label: "Short Eats" },
    { id: "Beverages", label: "Beverages", modifierGroups: ["mg_sugar_sl"] },
    { id: "Desserts", label: "Desserts" },
];

export const MODIFIER_GROUPS = [
    {
        id: "mg_spice",
        label: "Spice Level",
        selectionType: "single",
        minSelection: 1,
        maxSelection: 1,
        options: [
            { id: "sp_mild", label: "Mild", price: 0 },
            { id: "sp_med", label: "Medium", price: 0 },
            { id: "sp_hot", label: "Spicy", price: 0 },
        ]
    },
    {
        id: "mg_kottu_extra",
        label: "Extras",
        selectionType: "multiple",
        minSelection: 0,
        maxSelection: 3,
        options: [
            { id: "ex_cheese", label: "Extra Cheese", price: 250.00 },
            { id: "ex_egg", label: "Extra Egg", price: 100.00 },
            { id: "ex_gravy", label: "Extra Gravy", price: 50.00 },
        ]
    },
    {
        id: "mg_sugar_sl",
        label: "Sugar Level",
        selectionType: "single",
        minSelection: 1,
        maxSelection: 1,
        options: [
            { id: "s_no", label: "No Sugar", price: 0 },
            { id: "s_less", label: "Less Sugar", price: 0 },
            { id: "s_normal", label: "Normal Sugar", price: 0 },
        ]
    },
    {
        id: "mg_sides_sl",
        label: "Sides",
        selectionType: "multiple",
        minSelection: 0,
        maxSelection: 2,
        options: [
            { id: "sd_lunu", label: "Lunu Miris", price: 50.00 },
            { id: "sd_seeni", label: "Seeni Sambol", price: 70.00 },
            { id: "sd_dhal", label: "Dhal Curry", price: 150.00 },
        ]
    }
];
