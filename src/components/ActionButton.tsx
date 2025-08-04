import {Link} from "react-router-dom";


export function ActionButton() {
    const FOOD_BOOKING_URL = "https://www.foodbooking.com/ordering/restaurant/menu/reservation?restaurant_uid=eabafdf7-d9df-43d2-b287-a367bbc89127&reservation=true"
    const ORDER_ONLINE_URL = "https://3554.letsorder.uk/?"
    return (
        <div className="text-center mb-12">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link to="/menu">
                    <button
                        className="bg-red-800 hover:bg-red-900 text-white px-6 py-2 text-sm font-medium transition-colors">
                        Our Menu
                    </button>
                </Link>
                <a href={ORDER_ONLINE_URL}>
                <button
                    className="bg-red-800 hover:bg-red-900 text-white px-6 py-2 text-sm font-medium transition-colors">
                    Order Online
                </button>
                </a>
                <a href={FOOD_BOOKING_URL}>
                    <button className="bg-red-800 hover:bg-red-900 text-white px-6 py-2 text-sm font-medium transition-colors">
                        Book Table
                    </button>
                </a>
            </div>
        </div>
    )
}

export default ActionButton