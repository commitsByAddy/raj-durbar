import TopBanner from "../components/TopBanner.tsx";
import Header from "../components/Header.tsx";
import Navigation from "../components/Navigation.tsx";
import Footer from "../components/Footer.tsx";


interface LocationInfo {
    name: string;
    address: {
        street: string;
        area: string;
        postcode: string;
    };
    hours: {
        weekdays: string;
        weekend: string;
        holidays: string;
    };
    contact: {
        email: string;
        phone: string[];
    };
}


export default function ContactPage() {

    const locationData : LocationInfo = {
        name: "Raj Durbar, New Haw",
        address: {
            street: "31 The Broadway,",
            area: "Addlestone",
            postcode: "KT15 3EU"
        },
        hours: {
            weekdays: "Mon - Thu: 05:30pm - 10:30pm",
            weekend: "Fri - Sat: 05:00pm - 11:00pm",
            holidays: "Sun & Bank Holidays: 05:00am - 10:00pm"
        },
        contact: {
            email: "info@rajdurbar.co.uk",
            phone: ["01932348400", "01932353579"]
        }
    }

    return (
        < div className="min-h-screen" style={{ backgroundColor: '#f5f1e8' }}>
            <TopBanner/>
            <Header/>
            <Navigation/>

            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
                {/* Header Section */}
                <div className="text-center py-16 px-4">
                    <p className="text-amber-700 text-sm font-medium mb-2 tracking-wide">
                        HOURS & LOCATIONS
                    </p>
                    <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-8">
                        Visit Us
                    </h1>
                </div>

                {/* Main Content Container */}
                <div className="max-w-7xl mx-auto px-4 pb-16">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">

                        {/* Location Information */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-amber-200">
                            <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">
                                {locationData.name}
                            </h2>

                            {/* Address */}
                            <div className="mb-8 text-center">
                                <h3 className="text-lg font-semibold text-amber-800 mb-3">Address</h3>
                                <div className="text-gray-700 space-y-1">
                                    <p>{locationData.address.street}</p>
                                    <p>{locationData.address.area}</p>
                                    <p className="font-medium">{locationData.address.postcode}</p>
                                </div>
                            </div>

                            {/* Opening Hours */}
                            <div className="mb-8 text-center">
                                <h3 className="text-lg font-semibold text-amber-800 mb-3">Opening Hours</h3>
                                <div className="space-y-2 text-gray-700">
                                    <p>{locationData.hours.weekdays}</p>
                                    <p>{locationData.hours.weekend}</p>
                                    <p>{locationData.hours.holidays}</p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-amber-800 mb-3">Contact Us</h3>
                                <div className="space-y-2 text-gray-700">
                                    <p>
                                        <span className="font-medium">Mail: </span>
                                        <a
                                            href={`mailto:${locationData.contact.email}`}
                                            className="text-amber-700 hover:text-amber-800 transition-colors"
                                        >
                                            {locationData.contact.email}
                                        </a>
                                    </p>
                                    <p>
                                        <span className="font-medium">Tel: </span>
                                        {locationData.contact.phone.map((phone, index) => (
                                            <span key={phone}>
                      <a
                          href={`tel:${phone}`}
                          className="text-amber-700 hover:text-amber-800 transition-colors"
                      >
                        {phone}
                      </a>
                                                {index < locationData.contact.phone.length - 1 && " | "}
                    </span>
                                        ))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Google Map Container */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-amber-200">
                            <div className="h-96 relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2503.8234567890123!2d-0.4567890123456789!3d51.3789012345678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487673c4d5e6789a%3A0x1234567890abcdef!2sRaj%20Durbar!5e0!3m2!1sen!2suk!4v1609459200000!5m2!1sen!2suk"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Raj Durbar Location Map"
                                    className="rounded-t-2xl"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}