import type { ImgHTMLAttributes } from "react";
import { publicImageManifest } from "@/data/public-image-manifest.generated";

type PublicImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string;
  sizes?: string;
};

function srcSet(variants: Array<{ src: string; width: number }> | undefined) {
  return variants?.map(variant => `${variant.src} ${variant.width}w`).join(", ");
}

export function PublicImage({ src, alt = "", sizes = "100vw", loading = "lazy", decoding = "async", ...props }: PublicImageProps) {
  const asset = publicImageManifest[src];

  if (!asset) {
    return <img src={src} alt={alt} loading={loading} decoding={decoding} {...props} />;
  }

  return (
    <picture style={{ display: "contents" }}>
      <source type="image/avif" srcSet={srcSet(asset.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(asset.webp)} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        width={asset?.width}
        height={asset?.height}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        {...props}
      />
    </picture>
  );
}
