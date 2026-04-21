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

    // Also ensure tables exist
    const { seedTables } = await import("@/services/orderService");
    const { TABLES: MOCK_TABLES } = await import("@/data/mockData");
    await seedTables(MOCK_TABLES);
}

export async function seedSriLankanData() {
    const updates: Record<string, any> = {};

    // Clear existing menu data nodes to ensure a fresh Sri Lankan menu
    await remove(ref(db, "products"));
    await remove(ref(db, "categories"));
    await remove(ref(db, "modifierGroups"));
    await remove(ref(db, "tables")); // Clear tables too for a full reset

    // Seed tables
    const { seedTables } = await import("@/services/orderService");
    const { TABLES } = await import("@/data/mockData");
    await seedTables(TABLES);

    const categories = [
        { label: "Rice & Curry 🍛", id: "cat_rc", modifierGroups: ["mg_spice"] },
        { label: "Kottu 🥘", id: "cat_kottu", modifierGroups: ["mg_spice", "mg_kottu_extra"] },
        { label: "Hoppers 🥞", id: "cat_hoppers", modifierGroups: ["mg_sides_sl"] },
        { label: "Short Eats 🥟", id: "cat_short_eats" },
        { label: "Beverages 🥤", id: "cat_beverages", modifierGroups: ["mg_sugar_sl"] },
        { label: "Desserts 🍨", id: "cat_desserts" },
    ];

    categories.forEach(c => {
        updates[`categories/${c.id}`] = c;
    });

    const products = [
        {
            name: "Chicken Rice & Curry",
            price: 550.00,
            category: "cat_rc",
            description: "Traditional Sri Lankan red rice served with chicken curry, dhal, two seasonal vegetables, sambol, and papadum.",
            image: "https://images.unsplash.com/photo-1589302168068-9a4960d57bb8?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Fish Rice & Curry",
            price: 480.00,
            category: "cat_rc",
            description: "Authentic white rice served with spicy fish ambul thiyal, dhal, kale mallum, and spicy coconut sambol.",
            image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Chicken Kottu (Large)",
            price: 850.00,
            category: "cat_kottu",
            description: "Finely chopped godamba roti stir-fried with tender chicken, eggs, onions, leeks, and a rich gravy blend.",
            image: "https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Cheese Chicken Kottu",
            price: 1250.00,
            category: "cat_kottu",
            description: "Our signature chicken kottu creamy with melted Happy Cow cheese and extra spice. Local favorite!",
            image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Egg Hopper Set (3pcs)",
            price: 250.00,
            category: "cat_hoppers",
            description: "One Egg Hopper and two Plain Hoppers, served fresh with spicy Lunu Miris.",
            image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "String Hoppers Set (10pcs)",
            price: 280.00,
            category: "cat_hoppers",
            description: "Freshly steamed red string hoppers served with coconut sodhi and spicy pol sambol.",
            image: "https://images.unsplash.com/photo-1505253304499-671c55fb57fe?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Fish Cutlet (4pcs)",
            price: 320.00,
            category: "cat_short_eats",
            description: "Spicy mackerel fish balls breaded and deep-fried to golden perfection. Best with tea!",
            image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Egg Roti",
            price: 180.00,
            category: "cat_short_eats",
            description: "Soft griddle-cooked roti with a whole egg inside, served with a small side of dhal or gravy.",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Ceylon Milk Tea",
            price: 120.00,
            category: "cat_beverages",
            description: "Strongly brewed Ceylon BOP tea mixed with condensed milk. The nation's favorite.",
            image: "https://images.unsplash.com/photo-1544787210-2211d7c3bc95?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Ginger Beer (EGB)",
            price: 220.00,
            category: "cat_beverages",
            description: "Classic Elephant House Ginger Beer. A spicy, carbonated local favorite.",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Fresh Woodapple Juice",
            price: 350.00,
            category: "cat_beverages",
            description: "Creamy, sweet and sour woodapple pulp blended with a hint of coconut milk and jaggery.",
            image: "https://images.unsplash.com/photo-1621506289937-4c7260000a6c?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Watalappam",
            price: 450.00,
            category: "cat_desserts",
            description: "Rich, spiced coconut custard made with kithul jaggery, eggs, and cardamoms. Garnished with cashews.",
            image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Buffalo Curd & Treacle",
            price: 380.00,
            category: "cat_desserts",
            description: "Creamy buffalo curd served in a clay pot with a generous drizzle of golden kithul treacle.",
            image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80"
        }
    ];

    products.forEach(p => {
        const id = push(ref(db, "products")).key!;
        updates[`products/${id}`] = { ...p, id };
    });

    // Add Sri Lankan Modifiers
    const modifiers = [
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

    modifiers.forEach(m => {
        updates[`modifierGroups/${m.id}`] = m;
    });

    await update(ref(db), updates);
    console.log("Sri Lankan Menu Seeded!");
}
