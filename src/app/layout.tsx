import { Slide, ToastContainer } from "react-toastify";
import "./globals.css";
import { AuthProvider } from "../Context/AuthContext";
import { CartProvider } from "../Context/CartContext";
import SWRProvider from "@/src/components/providers/SWRProvider";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Restaurant",
  description: "",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="mdl-js">
      <body>
        <AuthProvider>
          <CartProvider>
            <SWRProvider>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={true}
                theme="light"
                transition={Slide}
                limit={3}
                style={{ zIndex: 9999 }}
              />
              {children}
            </SWRProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
