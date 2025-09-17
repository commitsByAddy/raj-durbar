import '../App.css'
import MobileMenu from "./MobileMenu.tsx";


export function Navigation() {
    {/* Navigation */}

    const FOOD_BOOKING_URL = "https://www.foodbooking.com/ordering/restaurant/menu/reservation?restaurant_uid=eabafdf7-d9df-43d2-b287-a367bbc89127&reservation=true"

    return (
        <nav className="bg-transparent py-4 text-red-800">
            <div className="max-w-6xl mx-auto px-4 ">

                {/* Desktop Navigation */}
                <div className="hidden md:flex justify-center space-x-12">
                    <a href="#/home" className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Home</a>
                    <a href="#/menu" className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Menu</a>
                    <a href={FOOD_BOOKING_URL} className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Book A Table</a>
                    <a href="#/gallery" className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Gallery</a>
                    <a href="#/hours" className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Hours & Locations</a>
                </div>
                <MobileMenu/>
            </div>
        </nav>
    )
}

export default Navigation