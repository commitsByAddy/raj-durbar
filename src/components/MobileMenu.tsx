import { useEffect, useRef, useState } from "react";

/** Simple classnames helper (no external deps) */
function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

type NavLink = { name: string; href: string; external?: boolean };
const NAV_LINKS: NavLink[] = [
    { name: "Home", href: "#home" },
    { name: "Menu", href: "#menu" },
    { name: "Gallery", href: "#reservations" },
    { name: "Hours & Location", href: "#/hours" },
    { name: "Book a Table", href: "#/booking"}
];

/** Delay classes used for staggered reveals (avoid inline styles) */
const DELAYS = ["delay-200", "delay-300", "delay-400", "delay-500", "delay-600", "delay-700"];

export default function MobileMenu() {
    const [open, setOpen] = useState(false);
    const toggleBtnRef = useRef<HTMLButtonElement>(null);

    // Close on Esc
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Lock body scroll while open
    useEffect(() => {
        if (!open) return;
        const { body } = document;
        const prev = body.style.overflow;
        body.style.overflow = "hidden";
        return () => {
            body.style.overflow = prev;
            // return focus to the toggle for a11y
            toggleBtnRef.current?.focus();
        };
    }, [open]);

    const close = () => setOpen(false);
    const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) close();
    };

    return (
        <div className="md:hidden">
            {/* Toggle (burger → X) */}
            <button
                ref={toggleBtnRef}
                onClick={() => setOpen((s) => !s)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className={cn(
                    "fixed top-20 right-6 z-50 h-12 w-12 border-none bg-transparent transition-shadow",
                    "flex flex-col items-center justify-center space-y-1.5",
                    open && "shadow-none bg-transparent backdrop-blur"
                )}
            >
                {/* 3 bars animate to X */}
                <span
                    className={cn(
                        "h-0.5 w-6 bg-gray-800 transition-transform duration-300 ease-in-out",
                        open && "translate-y-2 rotate-45"
                    )}
                />
                <span
                    className={cn(
                        "h-0.5 w-6 bg-gray-800 transition-opacity duration-300 ease-in-out",
                        open && "opacity-0"
                    )}
                />
                <span
                    className={cn(
                        "h-0.5 w-6 bg-gray-800 transition-transform duration-300 ease-in-out",
                        open && "-translate-y-2 -rotate-45"
                    )}
                />
            </button>

            {/* Overlay (full-page menu) */}
            <div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                onClick={onBackdrop}
                className={cn(
                    "fixed inset-0 z-40 transition-opacity duration-300",
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            >
                {/* Backdrop + gradient */}
                <div
                    className={cn(
                        "absolute inset-0 bg-red-900",
                        "transition-transform duration-300",
                        open ? "scale-100" : "scale-95"
                    )}
                />

                {/*/!* Close button inside overlay (redundant but handy) *!/*/}
                {/*<button*/}
                {/*    onClick={close}*/}
                {/*    className="absolute top-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full text-white transition hover:bg-white/20"*/}
                {/*    aria-label="Close menu"*/}
                {/*>*/}
                {/*    <X size={24} />*/}
                {/*</button>*/}

                {/* Content */}
                <div
                    className={cn(
                        "relative z-50 flex h-full flex-col items-center justify-center",
                        "transition-all duration-500",
                        open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    )}
                >
                    {/* Links */}
                    <nav className="flex flex-col items-center">
                        <ul className="space-y-8 text-center">
                            {NAV_LINKS.map((item, i) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        onClick={close}
                                        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                        className={cn(
                                            "text-white text-3xl md:text-4xl font-light tracking-wide no-underline !text-gray-200",
                                            "transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:text-yellow-400",
                                            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                                            DELAYS[Math.min(i, DELAYS.length - 1)]
                                        )}
                                    >
                    <span className="relative inline-block">
                      {item.name}
                        <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-yellow-400 transition-all duration-300 group-hover:w-full" />
                    </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                </div>
            </div>
        </div>
    );
}
