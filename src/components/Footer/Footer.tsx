"use client";


export default function Footer() {
    return (
        <div className=" flex flex-col justify-end">
                  <footer className="w-full py-10 flex flex-col items-center justify-center bg-white ">
            {/* Logo */}
            <h1 className="text-5xl font-extrabold tracking-widest">Foodies</h1>
            <span className="uppercase text-sm tracking-[0.5em] text-gray-600 mt-1">
                Restaurant
            </span>

            {/* Tagline */}
            <p className="text-xl text-gray-700 mt-4">
                Design and coding by VinhIT
            </p>
        </footer>
        </div>
      
    );
}
