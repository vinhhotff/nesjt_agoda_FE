import { Bounce, ToastContainer } from "react-toastify";
import "./globals.css";
import { AuthContext, AuthProvider } from "../Context/AuthContext";
import { CartProvider } from "../Context/CartContext"; // Import CartProvider
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header/Header";

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
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Bounce}
            />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
