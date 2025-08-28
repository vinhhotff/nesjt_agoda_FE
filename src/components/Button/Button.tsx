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
      className="px-6 py-3 bg-[#edb021] text-white cursor-pointer w-max rounded-lg font-bold text-[20px]"
    >
      {text}
    </Link>
  );
};

export default Button;
