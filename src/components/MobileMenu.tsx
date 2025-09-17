import {Menu, X} from "lucide-react";
import {useState} from "react";


export default function MobileMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <>
        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex justify-center">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-red-800 transition-colors"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
                <div className="flex flex-col items-center space-y-3">
                    <a href="#/home" className="text-gray-600 hover:text-red-800 text-sm font-medium">Home</a>
                    <a href="#/menu" className="text-gray-600 hover:text-red-800 text-sm font-medium">Menu</a>
                    <a href="#/book" className="text-gray-600 hover:text-red-800 text-sm font-medium">Book A Table</a>
                    <a href="#/gallery" className="text-gray-600 hover:text-red-800 text-sm font-medium">Gallery</a>
                    <a href="#/hours" className="text-gray-600 hover:text-red-800 text-sm font-medium">Hours & Locations</a>
                </div>
            </div>
        )}
        </>
    )
}