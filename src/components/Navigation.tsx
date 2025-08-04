import {Menu, X} from "lucide-react";
import {useState} from "react";
import '../App.css'


export function Navigation() {
    {/* Navigation */}
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const FOOD_BOOKING_URL = "https://www.foodbooking.com/ordering/restaurant/menu/reservation?restaurant_uid=eabafdf7-d9df-43d2-b287-a367bbc89127&reservation=true"

    return (
        <nav className="bg-transparent py-4 text-red-800">
            <div className="max-w-6xl mx-auto px-4 ">

                {/* Desktop Navigation */}
                <div className="hidden md:flex justify-center space-x-12">
                    <a href="home" className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Home</a>
                    <a href="menu" className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Menu</a>
                    <a href={FOOD_BOOKING_URL} className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Book A Table</a>
                    <a href="gallery" className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Gallery</a>
                    <a href="hours" className=" hover:text-red-800 text-sm font-medium border-b-2 border-transparent hover:border-red-800 pb-1 transition-all">Hours & Locations</a>
                </div>

                {/* Mobile Navigation Toggle */}
                <div className="md:hidden flex justify-center">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-600 hover:text-red-800 transition-colors"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 pb-4">
                    <div className="flex flex-col items-center space-y-3">
                        <a href="home" className="text-gray-600 hover:text-red-800 text-sm font-medium">Home</a>
                        <a href="menu" className="text-gray-600 hover:text-red-800 text-sm font-medium">Menu</a>
                        <a href="book" className="text-gray-600 hover:text-red-800 text-sm font-medium">Book A Table</a>
                        <a href="gallery" className="text-gray-600 hover:text-red-800 text-sm font-medium">Gallery</a>
                        <a href="hours" className="text-gray-600 hover:text-red-800 text-sm font-medium">Hours & Locations</a>
                    </div>
                </div>
            )}
        </nav>
    )

}

export default Navigation