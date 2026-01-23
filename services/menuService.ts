import { db } from "@/lib/firebase";
import { ref, update, push, remove, get } from "firebase/database";
import { Product, Category } from "@/types";

// PRODUCTS
export async function addProduct(product: Omit<Product, "id">) {
    const productsRef = ref(db, "products");
    const newRef = push(productsRef);
    await update(newRef, { ...product, id: newRef.key });
}

export async function updateProduct(product: Product) {
    const productRef = ref(db, `products/${product.id}`);
    await update(productRef, product);
}

export async function deleteProduct(productId: string) {
    const productRef = ref(db, `products/${productId}`);
    await remove(productRef);
}

// CATEGORIES
export async function addCategory(category: Omit<Category, "id">) {
    const catRef = ref(db, "categories");
    const newRef = push(catRef);
    await update(newRef, { ...category, id: newRef.key });
}

export async function updateCategory(category: Category) {
    const catRef = ref(db, `categories/${category.id}`);
    await update(catRef, category);
}

export async function deleteCategory(categoryId: string) {
    const catRef = ref(db, `categories/${categoryId}`);
    await remove(catRef);
}

// MODIFIER GROUPS
export async function addModifierGroup(group: Omit<ModifierGroup, "id">) {
    const groupRef = ref(db, "modifierGroups");
    const newRef = push(groupRef);
    await update(newRef, { ...group, id: newRef.key });
}

export async function updateModifierGroup(group: ModifierGroup) {
    const groupRef = ref(db, `modifierGroups/${group.id}`);
    await update(groupRef, group);
}

export async function deleteModifierGroup(groupId: string) {
    const groupRef = ref(db, `modifierGroups/${groupId}`);
    await remove(groupRef);
}

// Seed initial data if empty (Helper)
import { PRODUCTS, CATEGORIES, MODIFIER_GROUPS } from "@/data/mockData";
import { ModifierGroup } from "@/types";

export async function seedMenuData() {
    // Check Products
    const pSnap = await get(ref(db, "products"));
    // Check Categories
    const cSnap = await get(ref(db, "categories"));
    // Check Modifiers
    const mSnap = await get(ref(db, "modifierGroups"));

    const updates: Record<string, any> = {};

    if (!pSnap.exists()) {
        PRODUCTS.forEach(p => {
            const id = push(ref(db, "products")).key!;
            updates[`products/${id}`] = { ...p, id };
        });
    }

    if (!cSnap.exists()) {
        CATEGORIES.forEach(c => {
            const id = push(ref(db, "categories")).key!;
            updates[`categories/${id}`] = { ...c, id };
        });
    }

    if (!mSnap.exists()) {
        MODIFIER_GROUPS.forEach(m => {
            const id = push(ref(db, "modifierGroups")).key!;
            updates[`modifierGroups/${id}`] = { ...m, id };
        });
    }

    if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        console.log("Menu Seeded with missing data");
    }
}

export async function seedMalaysianData() {
    const updates: Record<string, any> = {};

    // 1. Clear existing (optional, but safer to avoid clutter) - actually we'll just append basically or should we clear?
    // User said "do the order menu again", implying a fresh start.
    // But deleting might be dangerous. Let's just Add New Categories and Products.
    // We will prefix IDs to track them if needed, but Firebase push keys are random.

    const categories = [
        { label: "Nasi 🍚", id: "cat_nasi" },
        { label: "Noodles 🍜", id: "cat_noodles" },
        { label: "Sides 🍢", id: "cat_sides" },
        { label: "Drinks 🥤", id: "cat_drinks" },
    ];

    categories.forEach(c => {
        updates[`categories/${c.id}`] = c;
    });

    const products = [
        {
            name: "Nasi Lemak Royal",
            price: 15.90,
            category: "cat_nasi",
            description: "Fragrant coconut rice served with crispy fried chicken, spicy sambal, crunchy anchovies, peanuts, and a perfectly boiled egg.",
            image: "https://images.unsplash.com/photo-1574482620826-40685ca5ebd2?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Nasi Goreng Kampung",
            price: 12.50,
            category: "cat_nasi",
            description: "Traditional village-style fried rice with anchovies, water spinach (kangkung), and plenty of bird's eye chili.",
            image: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Char Kway Teow",
            price: 14.00,
            category: "cat_noodles",
            description: "Wok-fried flat rice noodles with prawns, cockles, chinese sausage, eggs, bean sprouts, and chives in a rich soy sauce.",
            image: "https://images.unsplash.com/photo-1632549219018-ba20f862aa48?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Curry Mee",
            price: 13.50,
            category: "cat_noodles",
            description: "Yellow noodles in a rich and spicy coconut milk curry broth with tofu puffs, cockles, and long beans.",
            image: "https://images.unsplash.com/photo-1563290637-2938a1631e0c?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Satay Ayam (10 pcs)",
            price: 18.00,
            category: "cat_sides",
            description: "Skewered and grilled chicken meat, marinated in spices, served with peanut sauce, cucumber, and onions.",
            image: "https://images.unsplash.com/photo-1626804475297-411dbb166067?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Roti Canai w/ Curry",
            price: 4.50,
            category: "cat_sides",
            description: "Crispy and fluffy flatbread served with distinct dhal and curry dipping sauces.",
            image: "https://images.unsplash.com/photo-1625475653528-56ba772e04df?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Teh Tarik Kaw",
            price: 4.50,
            category: "cat_drinks",
            description: "Malaysian pulled milk tea, thick, frothy and perfectly sweet.",
            image: "https://images.unsplash.com/photo-1629007466851-9f933ac0273c?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Sirap Bandung Soda",
            price: 5.50,
            category: "cat_drinks",
            description: "Rose syrup milk drink with ice cream soda for a fizzy kick.",
            image: "https://images.unsplash.com/photo-1624683074360-192c77d4c795?auto=format&fit=crop&w=800&q=80"
        }
    ];

    products.forEach(p => {
        const id = push(ref(db, "products")).key!;
        updates[`products/${id}`] = { ...p, id };
    });

    await update(ref(db), updates);
    console.log("Malaysian Menu Seeded!");
}
