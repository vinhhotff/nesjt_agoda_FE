import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export const metadata = {
  title: "Restaurant",
  description: "Vinh IT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <Header />
        <main>{children}</main>
        <Footer />
    </>
  );
}
