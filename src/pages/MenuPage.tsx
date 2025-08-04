import {useState} from "react";
import TopBanner from "../components/TopBanner.tsx";
import Header from "../components/Header.tsx";
import Navigation from "../components/Navigation.tsx";


interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    spiceLevel?: string;
    allergens?: string[];
}

export default function MenuPage() {
    const [activeTab, setActiveTab] = useState<'veg' | 'nonveg' | 'specials' | 'sides'>('veg');

    const vegStarters: MenuItem[] = [
        {
            id: 1,
            name: "Papadams (plain or spicy)",
            description: "Traditional Indian crispy lentil wafers",
            price: 0.95,
            allergens: ["Contains Nuts"]
        },
        {
            id: 2,
            name: "Vegetable Pakoda",
            description: "Fresh mix chopped onion, potato & cauliflower, battered with gram flour",
            price: 4.25,
            allergens: ["Vegetarian"]
        },
        {
            id: 3,
            name: "Vegetable Samosa",
            description: "Flint pastry parcels filled with potatoes and vegetables",
            price: 4.50,
            allergens: ["Vegetarian"]
        },
        {
            id: 4,
            name: "Vegetable Momo",
            description: "Nepalese steamed dumplings with spicy and tangy tomato chutney",
            price: 4.95,
            allergens: ["Vegetarian"]
        },
        {
            id: 5,
            name: "Chilli Paneer",
            description: "Spicy and tangy paneer with pepper, onions and blend of our sauce, garlic and chilli",
            price: 5.25,
            allergens: ["Vegetarian", "Medium Spicy", "Contains Dairy"]
        },
        {
            id: 6,
            name: "Onion Bhaji",
            description: "Onion slices in gram flour batter, fried until crisp",
            price: 4.25
        }
    ];

    const nonVegStarters: MenuItem[] = [
        {
            id: 7,
            name: "Chicken Tikka",
            description: "Tender pieces of chicken marinated in yogurt and spices, cooked in tandoor",
            price: 5.95,
            allergens: ["Contains Nuts", "Contains Dairy"]
        },
        {
            id: 8,
            name: "Lamb Tikka",
            description: "Succulent lamb pieces marinated in traditional spices",
            price: 6.50,
            allergens: ["Contains Nuts", "Medium Spicy"]
        },
        {
            id: 9,
            name: "Seekh Kebab",
            description: "Minced lamb mixed with herbs and spices, cooked on skewers",
            price: 5.75,
            allergens: ["Contains Nuts"]
        },
        {
            id: 10,
            name: "King Prawn Butterfly",
            description: "Large prawns coated in breadcrumbs and deep fried",
            price: 6.95,
            allergens: ["Contains Nuts", "Mild Spicy"]
        },
        {
            id: 11,
            name: "Chicken Chat",
            description: "Diced chicken with cucumber, tomato, and chat masala",
            price: 5.50,
            allergens: ["Contains Nuts", "Medium Spicy"]
        }
    ];

    const specials: MenuItem[] = [
        {
            id: 12,
            name: "Durbar Chicken",
            description: "Chef's special Nepalese chicken curry",
            price: 10.50,
            allergens: ["Contains Nuts", "Medium Spicy"]
        },
        {
            id: 13,
            name: "Chicken Chettinand",
            description: "South Indian curry with aromatic spices and coconut",
            price: 10.50,
            allergens: ["Contains Nuts", "Contains Dairy", "Hot"]
        },
        {
            id: 14,
            name: "Butter Chicken",
            description: "Tender chicken in a smooth creamy tomato sauce, flavoured with butter, spices and touch of cream",
            price: 10.25,
            allergens: ["Contains Nuts", "Contains Dairy"]
        },
        {
            id: 15,
            name: "Tawa Gosht",
            description: "Chicken cooked in chef's special spice (+£1 for lamb)",
            price: 10.95,
            allergens: ["Contains Nuts", "Medium Spicy"]
        },
        {
            id: 16,
            name: "Kata Gosht Punjabi",
            description: "Punjabi dish with tender lamb pieces and aromatic spices, in a onion and tomato gravy",
            price: 10.95,
            allergens: ["Contains Nuts", "Medium Spicy"]
        }
    ];

    const sides: MenuItem[] = [
        {
            id: 17,
            name: "Daal Makhani",
            description: "Creamy lentils with aromatic spices",
            price: 5.50,
            allergens: ["Creamy Lentils", "Contains Dairy"]
        },
        {
            id: 18,
            name: "Palak Paneer",
            description: "Spinach & Indian cottage cheese",
            price: 4.95,
            allergens: ["Contains Nuts", "Contains Dairy"]
        },
        {
            id: 19,
            name: "Matar Paneer",
            description: "Green peas & Indian cottage cheese",
            price: 4.95,
            allergens: ["Contains Nuts", "Contains Dairy"]
        },
        {
            id: 20,
            name: "Aloo Gobi",
            description: "Potatoes & cauliflower",
            price: 4.75,
            allergens: ["Contains Nuts"]
        },
        {
            id: 21,
            name: "Baingan Bhaji",
            description: "Eggplant curry",
            price: 4.75,
            allergens: ["Contains Nuts"]
        },
        {
            id: 22,
            name: "Mushroom Bhaji",
            description: "Spiced mushrooms in traditional sauce",
            price: 4.75
        }
    ];

    const getCurrentMenu = () => {
        switch (activeTab) {
            case 'veg': return vegStarters;
            case 'nonveg': return nonVegStarters;
            case 'specials': return specials;
            case 'sides': return sides;
            default: return vegStarters;
        }
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'veg': return 'Vegetarian Starters';
            case 'nonveg': return 'Non-Vegetarian Starters';
            case 'specials': return 'Raj Durbar Specials';
            case 'sides': return 'Side Dishes';
            default: return 'Menu';
        }
    };

    return (

        < div className="min-h-screen" style={{ backgroundColor: '#f5f1e8' }}>
            <TopBanner/>
            <Header/>
            <Navigation/>

            {/* Header */}
            <div className="text-center py-8 px-4">
                <div className="mt-6">
                    <h2 className="text-2xl font-serif mb-2" style={{ color: '#B8860B' }}>
                        Our Menu
                    </h2>
                    <p className="text-lg" style={{ color: '#8B4513' }}>
                        Indian and Nepali Inspired Kitchen
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center mb-8 border-b" style={{ borderColor: '#D2B48C' }}>
                    <button
                        onClick={() => setActiveTab('veg')}
                        className={`px-6 py-3 mx-2 mb-2 font-serif text-lg transition-colors duration-200 border-b-2 ${
                            activeTab === 'veg'
                                ? 'border-yellow-600 bg-yellow-50'
                                : 'border-transparent hover:border-yellow-400'
                        }`}
                        style={{
                            color: activeTab === 'veg' ? '#B8860B' : '#8B4513',
                            backgroundColor: activeTab === 'veg' ? '#FFFBF0' : 'transparent'
                        }}
                    >
                        Vegetarian Starters
                    </button>
                    <button
                        onClick={() => setActiveTab('nonveg')}
                        className={`px-6 py-3 mx-2 mb-2 font-serif text-lg transition-colors duration-200 border-b-2 ${
                            activeTab === 'nonveg'
                                ? 'border-yellow-600 bg-yellow-50'
                                : 'border-transparent hover:border-yellow-400'
                        }`}
                        style={{
                            color: activeTab === 'nonveg' ? '#B8860B' : '#8B4513',
                            backgroundColor: activeTab === 'nonveg' ? '#FFFBF0' : 'transparent'
                        }}
                    >
                        Non-Vegetarian Starters
                    </button>
                    <button
                        onClick={() => setActiveTab('specials')}
                        className={`px-6 py-3 mx-2 mb-2 font-serif text-lg transition-colors duration-200 border-b-2 ${
                            activeTab === 'specials'
                                ? 'border-yellow-600 bg-yellow-50'
                                : 'border-transparent hover:border-yellow-400'
                        }`}
                        style={{
                            color: activeTab === 'specials' ? '#B8860B' : '#8B4513',
                            backgroundColor: activeTab === 'specials' ? '#FFFBF0' : 'transparent'
                        }}
                    >
                        Raj Durbar Specials
                    </button>
                    <button
                        onClick={() => setActiveTab('sides')}
                        className={`px-6 py-3 mx-2 mb-2 font-serif text-lg transition-colors duration-200 border-b-2 ${
                            activeTab === 'sides'
                                ? 'border-yellow-600 bg-yellow-50'
                                : 'border-transparent hover:border-yellow-400'
                        }`}
                        style={{
                            color: activeTab === 'sides' ? '#B8860B' : '#8B4513',
                            backgroundColor: activeTab === 'sides' ? '#FFFBF0' : 'transparent'
                        }}
                    >
                        Side Dishes
                    </button>
                </div>

                {/* Menu Section Title */}
                <div className="mb-8">
                    <h3 className="text-2xl font-serif text-center" style={{ color: '#8B4513' }}>
                        {getTabTitle()}
                    </h3>
                    <p className="text-center mt-2" style={{ color: '#8B4513', fontSize: '14px' }}>
                        {activeTab === 'veg' && "These dishes are great for sharing"}
                        {activeTab === 'specials' && "Our in-house special dishes made by our chef"}
                    </p>
                </div>

                {/* Menu Items */}
                <div className="grid gap-1 max-w-4xl mx-auto mb-8">
                    {getCurrentMenu().map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-start py-4 px-6 border-b border-dotted"
                            style={{
                                borderColor: '#D2B48C',
                                backgroundColor: '#FFFBF0'
                            }}
                        >
                            <div className="flex-1 pr-4">
                                <h4 className="font-serif text-lg mb-1" style={{ color: '#8B4513' }}>
                                    {item.name}
                                </h4>
                                <p className="text-sm leading-relaxed mb-2" style={{ color: '#8B4513' }}>
                                    {item.description}
                                </p>
                                {item.allergens && (
                                    <div className="flex flex-wrap gap-2">
                                        {item.allergens.map((allergen, index) => (
                                            <span
                                                key={index}
                                                className="text-xs px-2 py-1 rounded"
                                                style={{
                                                    backgroundColor: allergen.includes('Spicy') ? '#FFE4E1' :
                                                        allergen.includes('Vegetarian') ? '#F0FFF0' : '#FFF8DC',
                                                    color: allergen.includes('Spicy') ? '#8B0000' :
                                                        allergen.includes('Vegetarian') ? '#228B22' : '#8B4513'
                                                }}
                                            >
                        {allergen}
                      </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                <span className="text-lg font-semibold" style={{ color: '#B8860B' }}>
                  £{item.price.toFixed(2)}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}