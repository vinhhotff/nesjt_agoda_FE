'use client'
import Link from "next/link";

interface ButtonProps {
  text: string;
  url: string;
}

const Button = ({ text, url }: ButtonProps) => {
  return (
    <Link
      href={url}
      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white cursor-pointer w-max rounded-lg font-bold text-[20px] shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:-translate-y-0.5 hover:scale-105"
    >
      {text}
    </Link>
  );
};

export default Button;
