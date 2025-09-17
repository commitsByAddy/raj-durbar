import { useMemo, useState } from "react";
import TopBanner from "../components/TopBanner.tsx";
import Header from "../components/Header.tsx";
import Navigation from "../components/Navigation.tsx";
import Footer from "../components/Footer.tsx";
import menuData from "../data/menu.json";

interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    spiceLevel?: string;
    allergens: string[];
}

interface MenuData {
    veg: MenuItem[];
    nonveg: MenuItem[];
    tandoori: MenuItem[];
    specials: MenuItem[];
    classics: MenuItem[];
    biryani: MenuItem[];
    sides: MenuItem[];
    rice: MenuItem[];
    naan_breads: MenuItem[];
    sundries: MenuItem[];
    childrens: MenuItem[];
}


const MENU: MenuData = menuData;
type MenuTabs = keyof MenuData;


// ===== Theme & utils (easy to move to a separate module) =====
const THEME = {
    pageBg: "#f5f1e8",
    ink: "#8B4513",
    accent: "#B8860B",
    cardBg: "#FFFBF0",
    border: "#D2B48C",
};

const formatPrice = (n: number) => `£${n.toFixed(2)}`;

const labelFromKey = (key: string) => {
    const map: Record<string, string> = {
        veg: "Vegetarian Starters",
        nonveg: "Non-Vegetarian Starters",
        tandoori: "Tandoori Sizzlers",
        specials: "Raj Durbar Specials",
        classics: "Indian Classics",
        biryani: "Biryani",
        sides: "Side Dishes",
        rice: "Rice",
        naan_breads: "Naan & Breads",
        sundries: "Sundries",
        childrens: "Children’s Menu",
    };
    return map[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// Optional: control tab order without hard-coding the type
const TAB_ORDER: Partial<Record<MenuTabs, number>> = {
    veg: 1,
    nonveg: 2,
    tandoori: 3,
    specials: 4,
    classics: 5,
    biryani: 6,
    sides: 7,
    rice: 8,
    naan_breads: 9,
    sundries: 10,
    childrens: 11,
};

// ===== Small, reusable view components =====
function Tabs({
                  tabs,
                  active,
                  onChange,
              }: {
    tabs: MenuTabs[];
    active: MenuTabs;
    onChange: (t: MenuTabs) => void;
}) {
    return (
        <div className="flex flex-wrap justify-center mb-8 border-b" style={{ borderColor: THEME["border"] }}>
            {tabs.map((key) => {
                const isActive = key === active;
                return (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={`px-6 py-3 mx-2 mb-2 font-serif text-lg transition-colors duration-200 border-b-2 ${
                            isActive ? "border-yellow-600 bg-yellow-50" : "border-transparent hover:border-yellow-400"
                        }`}
                        style={{
                            color: isActive ? THEME.accent : THEME.ink,
                            backgroundColor: isActive ? THEME.cardBg : "transparent",
                        }}
                    >
                        {labelFromKey(key)}
                    </button>
                );
            })}
        </div>
    );
}

function AllergenBadge({ label }: { label: string }) {
    const isSpicy = /spicy|hot/i.test(label);
    const isVeg = /vegetarian|vegan/i.test(label);

    const bg = isSpicy ? "#FFE4E1" : isVeg ? "#F0FFF0" : "#FFF8DC";
    const fg = isSpicy ? "#8B0000" : isVeg ? "#228B22" : THEME.ink;

    return (
        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: bg, color: fg }}>
      {label}
    </span>
    );
}

function MenuItemCard({ item }: { item: MenuItem }) {
    return (
        <div
            className="flex justify-between items-start py-4 px-6 border-b border-dotted"
            style={{ borderColor: THEME.border, backgroundColor: THEME.cardBg }}
        >
            <div className="flex-1 pr-4">
                <h4 className="font-serif text-lg mb-1" style={{ color: THEME.ink }}>
                    {item.name}
                </h4>

                {!!item.description && (
                    <p className="text-sm leading-relaxed mb-2" style={{ color: THEME.ink }}>
                        {item.description}
                    </p>
                )}

                {Array.isArray(item.allergens) && item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {item.allergens.map((a, i) => (
                            <AllergenBadge key={`${item.id}-alg-${i}`} label={a} />
                        ))}
                    </div>
                )}
            </div>

            <div className="text-right">
        <span className="text-lg font-semibold" style={{ color: THEME.accent }}>
          {formatPrice(item.price)}
        </span>
            </div>
        </div>
    );
}

function MenuList({ items }: { items: readonly MenuItem[] }) {
    if (!items?.length) {
        return (
            <div className="text-center py-8" style={{ color: THEME.ink }}>
                No items available for this section.
            </div>
        );
    }

    return (
        <div className="grid gap-1 max-w-4xl mx-auto mb-8">
            {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
            ))}
        </div>
    );
}

// ===== Page =====
export default function MenuPage() {
    // Build tab list in a controlled order, falling back to natural key order
    const tabs = useMemo(() => {
        const keys = Object.keys(MENU) as MenuTabs[];
        return [...keys].sort((a, b) => (TAB_ORDER[a] ?? 999) - (TAB_ORDER[b] ?? 999));
    }, []);

    // Default to first tab (or veg if present)
    const defaultTab = (tabs.includes("veg" as MenuTabs) ? "veg" : tabs[0]) as MenuTabs;
    const [activeTab, setActiveTab] = useState<MenuTabs>(defaultTab);

    const currentItems = MENU[activeTab] as readonly MenuItem[];

    return (
        <div className="min-h-screen" style={{ backgroundColor: THEME.pageBg }}>
            <TopBanner />
            <Header />
            <Navigation />

            {/* Header */}
            <div className="text-center py-8 px-4">
                <div className="mt-6">
                    <h2 className="text-2xl font-serif mb-2" style={{ color: THEME.accent }}>
                        Our Menu
                    </h2>
                    <p className="text-lg" style={{ color: THEME.ink }}>
                        Indian and Nepali Inspired Kitchen
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

                <div className="mb-8">
                    <h3 className="text-2xl font-serif text-center" style={{ color: THEME.ink }}>
                        {labelFromKey(activeTab)}
                    </h3>
                    <p className="text-center mt-2" style={{ color: THEME.ink, fontSize: "14px" }}>
                        {activeTab === "veg" && "These dishes are great for sharing"}
                        {activeTab === "specials" && "Our in-house special dishes made by our chef"}
                    </p>
                </div>

                <MenuList items={currentItems} />
            </div>

            <Footer />
        </div>
    );
}