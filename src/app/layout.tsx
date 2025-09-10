import { Bounce, ToastContainer } from "react-toastify";
import "./globals.css";
import { AuthProvider } from "../Context/AuthContext";
import { CartProvider } from "../Context/CartContext"; // Import CartProvider
import SWRProvider from "@/src/components/providers/SWRProvider";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Restaurant",
  description: "Vinh IT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="mdl-js">
      <body>
        <AuthProvider>
          <CartProvider> {/* Wrap with CartProvider */}
            <SWRProvider>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover
                theme="colored"
                transition={Bounce}
              />
              {children}
            </SWRProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
