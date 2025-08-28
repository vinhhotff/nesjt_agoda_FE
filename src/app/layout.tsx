import { Bounce, ToastContainer } from "react-toastify";
import "./globals.css";
import { AuthProvider } from "../Context/AuthContext";
import "react-toastify/dist/ReactToastify.css"; // cần import CSS của react-toastify

export const metadata = {
  title: "Restaurant",
  description: "Vinh IT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="mdl-js">
      <body>
        <AuthProvider>

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
        </AuthProvider>
      </body>
    </html>
  );
}
