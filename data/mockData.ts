import { Product, Table } from "@/types";

export const TABLES: Table[] = [
    ...Array.from({ length: 16 }, (_, i) => ({ id: `${i + 1}`, label: `${i + 1}` })),
    ...["1A", "2A", "3A", "10A"].map((label) => ({ id: label, label })),
].sort((a, b) => {
    const numA = parseInt(a.id);
    const numB = parseInt(b.id);
    if (numA === numB) return a.id.localeCompare(b.id);
    return numA - numB;
});

export const PRODUCTS: Product[] = [
    // Food
    { id: "f1", name: "Classic Burger", price: 12.99, category: "Food" },
    { id: "f2", name: "Cheese Burger", price: 13.99, category: "Food" },
    { id: "f3", name: "Chicken Wings", price: 9.99, category: "Food" },
    { id: "f4", name: "Caesar Salad", price: 10.50, category: "Food" },
    { id: "f5", name: "Fries", price: 4.99, category: "Food" },
    { id: "f6", name: "Steak", price: 24.99, category: "Food" },
    { id: "f7", name: "Pasta Carbonara", price: 14.99, category: "Food" },

    // Drinks
    { id: "d1", name: "Coke", price: 2.50, category: "Drinks" },
    { id: "d2", name: "Water", price: 1.50, category: "Drinks" },
    { id: "d3", name: "Iced Tea", price: 3.00, category: "Drinks" },
    { id: "d4", name: "Lemonade", price: 3.50, category: "Drinks" },
    { id: "d5", name: "Cold Brew", price: 4.50, category: "Drinks" },

    // Desserts
    { id: "de1", name: "Cheesecake", price: 6.99, category: "Desserts" },
    { id: "de2", name: "Brownie", price: 5.99, category: "Desserts" },
    { id: "de3", name: "Ice Cream", price: 4.99, category: "Desserts" },

    // Add-ons
    { id: "a1", name: "Extra Cheese", price: 1.50, category: "Add-ons" },
    { id: "a2", name: "Bacon", price: 2.00, category: "Add-ons" },
    { id: "a3", name: "Sauce", price: 0.50, category: "Add-ons" },
];

export const CATEGORIES: { id: string; label: string; modifierGroups?: string[] }[] = [
    { id: "Food", label: "Food", modifierGroups: ["mg_sides"] },
    { id: "Drinks", label: "Drinks", modifierGroups: ["mg_sugar", "mg_size"] },
    { id: "Desserts", label: "Desserts" },
    { id: "Add-ons", label: "Add-ons" },
];

export const MODIFIER_GROUPS = [
    {
        id: "mg_sugar",
        label: "Sugar Level",
        selectionType: "single",
        minSelection: 1,
        maxSelection: 1,
        options: [
            { id: "s_0", label: "0%", price: 0 },
            { id: "s_50", label: "50%", price: 0 },
            { id: "s_100", label: "100%", price: 0 },
        ]
    },
    {
        id: "mg_size",
        label: "Size",
        selectionType: "single",
        minSelection: 1,
        maxSelection: 1,
        options: [
            { id: "sz_reg", label: "Regular", price: 0 },
            { id: "sz_lrg", label: "Large", price: 1.50 },
        ]
    },
    {
        id: "mg_sides",
        label: "Sides",
        selectionType: "multiple",
        minSelection: 0,
        maxSelection: 2,
        options: [
            { id: "sd_fries", label: "Fries", price: 4.00 },
            { id: "sd_salad", label: "Coleslaw", price: 3.00 },
        ]
    }
];
