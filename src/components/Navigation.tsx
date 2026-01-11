// Navigation.tsx
import "../App.css";
import MobileMenu from "./MobileMenu.tsx";

type NavLink = {
    href: string;
    label: string;
    external?: boolean;
};

const FOOD_BOOKING_URL =
    "https://www.foodbooking.com/ordering/restaurant/menu/reservation?restaurant_uid=eabafdf7-d9df-43d2-b287-a367bbc89127&reservation=true";

const NAV_LINKS: NavLink[] = [
    { href: "#/home", label: "Home" },
    { href: "#/menu", label: "Menu" },
    { href: FOOD_BOOKING_URL, label: "Book A Table", external: true },
    { href: "#/gallery", label: "Gallery" },
    { href: "#/hours", label: "Hours & Locations" },
    { href: "#/booking", label: "Book a Table"}
];

const LINK_CLASSES =
    "text-xl font-medium border-b-2 border-transparent pb-4 transition-all " +
    "no-underline " +                          // remove default blue underline
    "!text-red-900 visited:!text-red-900 " +   // force base + visited red
    "hover:!text-red-800 hover:border-red-800 " +
    "focus:!text-red-800 active:!text-red-800";

export function DesktopNavigation() {
    return (
        // Desktop only
        <ul className="hidden md:flex justify-center space-x-12">
            {NAV_LINKS.map(({ href, label, external }) => (
                <li key={label}>
                    <a
                        href={href}
                        className={LINK_CLASSES}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                        {label}
                    </a>
                </li>
            ))}
        </ul>
    );
}

export default function Navigation() {
    return (
        <nav className="bg-transparent py-6 text-red-800">
            <div className="max-w-6xl mx-auto px-6">
                <DesktopNavigation />
                <MobileMenu />
            </div>
        </nav>
    );
}