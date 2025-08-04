import TopBanner from "../components/TopBanner.tsx";
import Header from "../components/Header.tsx";
import Navigation from "../components/Navigation.tsx";


export default function NoPage() {
    return (
        < div className="min-h-screen" style={{ backgroundColor: '#f5f1e8' }}>
            <TopBanner/>
            <Header/>
            <Navigation/>
            <p className="text-black">Ahh, cheeky, cheeky. There's no page like that here.</p>
        </div>
    )
}