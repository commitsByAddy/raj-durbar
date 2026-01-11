

export default function HeroSection() {
    return(
        <div className="justify-center flex">
            <section className="relative w-520 h-52 md:h-105 mb-8">
                <div
                    className="absolute inset-0 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: `url('/raj-durbar/assets/Hero_Banner.avif')` }}
                >
                    <div className="absolute inset-0 bg-black/30 "></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                    <h2 className="text-4xl md:text-7xl text-biege-800 leading-tight">
                        Kitchen with the spices<br />
                        of India and soul of<br />
                        Nepal.
                    </h2>
                </div>
            </section>
        </div>
    )
}