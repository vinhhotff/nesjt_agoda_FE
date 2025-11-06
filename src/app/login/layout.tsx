import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>
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
            />{children}</>; 
}