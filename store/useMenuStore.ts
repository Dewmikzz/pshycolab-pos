import { create } from "zustand";
import { Product, Category, ModifierGroup } from "@/types";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { MODIFIER_GROUPS } from "@/data/mockData"; // Fallback/Initial

interface MenuState {
    products: Product[];
    categories: Category[];
    modifierGroups: ModifierGroup[];
    isLoading: boolean;

    initializeMenuSubscription: () => () => void;
    getModifiersForProduct: (product: Product) => ModifierGroup[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
    products: [],
    categories: [],
    modifierGroups: [],
    isLoading: true,

    initializeMenuSubscription: () => {
        const productsRef = ref(db, "products");
        const categoriesRef = ref(db, "categories");
        const modifiersRef = ref(db, "modifierGroups");

        const unsubProducts = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            const products = data ? Object.values(data) as Product[] : [];
            set({ products });
        });

        const unsubCategories = onValue(categoriesRef, (snapshot) => {
            const data = snapshot.val();
            const categories = data ? Object.values(data) as Category[] : [];
            set((state) => ({ categories }));
        });

        const unsubModifiers = onValue(modifiersRef, (snapshot) => {
            const data = snapshot.val();
            // If no data in DB, use mock for dev
            const modifierGroups = data ? Object.values(data) as ModifierGroup[] : (MODIFIER_GROUPS as unknown as ModifierGroup[]);
            set({ modifierGroups, isLoading: false });
        });

        return () => {
            unsubProducts();
            unsubCategories();
            unsubModifiers();
        };
    },

    getModifiersForProduct: (product: Product) => {
        const { categories, modifierGroups } = get();
        const category = categories.find(c => c.id === product.category);

        const categoryGroupIds = category?.modifierGroups || [];
        const productGroupIds = product.modifierGroups || [];

        // Combine unique IDs
        const allGroupIds = Array.from(new Set([...categoryGroupIds, ...productGroupIds]));

        return allGroupIds
            .map(id => modifierGroups.find(g => g.id === id))
            .filter((g): g is ModifierGroup => !!g);
    }
}));
