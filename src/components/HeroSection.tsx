

export default function HeroSection() {
    return(
        <>
            {/* Hero Section with Food Background */}
            <section className="relative h-80 mb-8">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('/raj-durbar/assets/Home_Banner.avif')`,
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
        </>
    )
}