import { useEffect } from "react";

export function useRevealOnScroll(className: string = ".reveal") {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(className);

    const reveal = () => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        } else {
          el.style.opacity = "0";
          el.style.transform = "translateY(50px)";
        }
      });
    };

    // chạy ngay lần đầu + khi scroll
    window.addEventListener("scroll", reveal);
    reveal();

    return () => window.removeEventListener("scroll", reveal);
  }, [className]);
}
