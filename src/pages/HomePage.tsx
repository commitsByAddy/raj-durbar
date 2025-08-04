import TopBanner from "../components/TopBanner.tsx";
import Header from "../components/Header.tsx";
import Navigation from "../components/Navigation.tsx";
import ActionButton from "../components/ActionButton.tsx";
import {Clock, MapPin, Phone} from "lucide-react";
import Footer from "../components/Footer.tsx";


export default function HomePage() {

    const deals = [
        {
            title: "Banquet Night",
            subtitle: "Every Wednesday",
            detail: "£16.95 per person"
        },
        {
            title: "Emergency Workers Deal",
            subtitle: "15% off Mon-Thur",
            detail: "with valid ID",
            note: "Dine-in & Collection only",
            disclaimer: "* Not in conjunction with any other offers."
        },
        {
            title: "10% off collections",
            subtitle: "On orders over £15"
        },
        {
            title: "Special Offers",
            subtitle: "Keep an eye out for here for special offers."
        }
    ];

    return (
        < div className="min-h-screen" style={{ backgroundColor: '#f5f1e8' }}>
            <TopBanner/>
            <Header/>
            <Navigation/>

            {/* Hero Section with Food Background */}
            <section className="relative h-80 mb-8">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&h=600&fit=crop')`,
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-biege-800 mb-4 leading-tight">
                        Kitchen with the spices<br />
                        of India and soul of<br />
                        Nepal.
                    </h2>
                </div>
            </section>

            {/* Action Buttons */}
            <ActionButton/>

            {/* Mission Statement */}
            <section className="max-w-4xl mx-auto px-4 text-center mb-16">
                <div className="relative">

                    <div className="pt-12">
                        <p className="text-red-900 text-lg md:text-xl leading-relaxed font-medium">
                            We believe that food is more than just a meal – it's a way to bring people together,
                            build community, and celebrate culture. Our mission is to offer an inviting space where families,
                            friends, and neighbors can gather and enjoy a meal together.
                        </p>
                    </div>
                </div>
            </section>

            {/* Deals Section */}
            <section className="bg-red-900">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {deals.map((deal, index) => (
                        <div key={index} className="p-8 text-center text-white border-r border-red-800 last:border-r-0">
                            {/* Icon */}
                            <div className="mb-4">
                                <div className="w-12 h-12 mx-auto border border-white rounded-full flex items-center justify-center">
                                    <MapPin size={20} />
                                </div>
                            </div>

                            {/* Deal Label */}
                            <div className="mb-2">
                                <span className="text-xs uppercase tracking-wide text-red-200">Deals</span>
                            </div>

                            {/* Deal Content */}
                            <h3 className="text-lg font-semibold mb-2">{deal.title}</h3>
                            <p className="text-sm mb-1 text-red-100">{deal.subtitle}</p>
                            {deal.detail && <p className="text-sm mb-1 text-red-100">{deal.detail}</p>}
                            {deal.note && <p className="text-xs mb-1 text-red-200">{deal.note}</p>}
                            {deal.disclaimer && <p className="text-xs text-red-300">{deal.disclaimer}</p>}
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <img
                                src="https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&h=400&fit=crop"
                                alt="Indian cooking"
                                className="w-full h-80 object-cover shadow-lg"
                            />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-gray-800">
                                About Us
                            </h2>
                            <h3 className="text-xl font-semibold mb-4 text-red-800">
                                Welcome to Raj Durbar
                            </h3>

                            <p className="text-gray-700 mb-4 leading-relaxed">
                                In the heart of our name lies the essence of Himalayan Royal Cuisine. 'Raj' translates to royal,
                                symbolizing the regal flavors and opulent traditions that are at the core of our culinary philosophy.
                                It also pays homage to our predecessor, Raj Cuisine, which laid the foundation for our journey.
                            </p>

                            <p className="text-gray-700 leading-relaxed">
                                'Durbar,' meaning palace, reflects the warmth and hospitality extended to every guest. Together,
                                'Raj Durbar' represents a royal court of flavors, where each dish is crafted with the elegance
                                and sophistication of a palace feast, inspired by the time-honored traditions of the Himalayas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catering Section */}
            <section className="py-20 bg-red-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">
                            Great Moments, Even Better Meals!
                        </h2>
                        <h3 className="text-xl text-red-800 font-semibold">
                            Gather & Celebrate with our Catering and Booking Service
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                Our catering and booking services bring your loved ones together effortlessly! Whether it's a birthday,
                                anniversary, Christmas party, hen night, or simply a family meal, we cater to all your special moments.
                            </p>

                            <p className="text-gray-700 mb-4 leading-relaxed">
                                With a 24-hour notice, our team is ready to provide delicious, freshly prepared meals in our restaurant
                                with the finest ingredients tailored to your event's needs.
                            </p>

                            <p className="text-gray-700 mb-6 leading-relaxed">
                                To inquire about pricing or to book your catering service, give us a call or send an email,
                                and we'll take care of the rest. Let us help make your next gathering unforgettable with flavors that feel like home.
                            </p>

                            <button className="bg-red-800 hover:bg-red-900 text-white px-8 py-3 font-medium transition-colors">
                                Contact Us for Catering
                            </button>
                        </div>

                        <div>
                            <img
                                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop"
                                alt="Catering service"
                                className="w-full h-80 object-cover shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-red-900 text-white py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="w-12 h-12 mx-auto mb-4 border border-white rounded-full flex items-center justify-center">
                            <MapPin size={20} />
                        </div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <p className="text-sm text-red-100">Addlestone, Surrey</p>
                    </div>

                    <div>
                        <div className="w-12 h-12 mx-auto mb-4 border border-white rounded-full flex items-center justify-center">
                            <Phone size={20} />
                        </div>
                        <h3 className="font-semibold mb-2">Contact</h3>
                        <p className="text-sm text-red-100">Call for reservations</p>
                    </div>

                    <div>
                        <div className="w-12 h-12 mx-auto mb-4 border border-white rounded-full flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <h3 className="font-semibold mb-2">Hours</h3>
                        <p className="text-sm text-red-100">Open Daily</p>
                    </div>
                </div>
            </section>
            <Footer/>
        </div>
    )
}
