import katex from "katex";
import "katex/dist/katex.min.css";
import styles from "./MathEquation.module.css";

export default function MathEquation({ tex, label }: { tex: string; label?: string }) {
  return (
    <div className={styles.equation}>
      {label && <span className={styles.label}>{label}</span>}
      <div
        className={styles.math}
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(tex, {
            displayMode: true,
            throwOnError: true,
            trust: false,
            output: "htmlAndMathml"
          })
        }}
      />
    </div>
  );
}
