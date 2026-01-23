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
