"use client";
import { useEffect, useState } from "react";
import styles from "./typing.module.css";

interface TypingTitleProps {
  texts: string[];
  typingSpeed?: number;   // tốc độ gõ
  deletingSpeed?: number; // tốc độ xoá
  delay?: number;         // delay trước khi xoá
}

export default function TypingTitle({
  texts,
  typingSpeed = 150,
  deletingSpeed = 80,
  delay = 1500,
}: TypingTitleProps) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (index >= texts.length) return;

    if (!deleting && subIndex === texts[index].length) {
      const timeout = setTimeout(() => setDeleting(true), delay);
      return () => clearTimeout(timeout);
    }

    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, texts, typingSpeed, deletingSpeed, delay]);

  return <h1 className={styles.typing}>{texts[index].substring(0, subIndex)}</h1>;
}
