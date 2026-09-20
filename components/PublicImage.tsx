import type { ImgHTMLAttributes } from "react";
import { publicImageManifest } from "@/data/public-image-manifest.generated";
import { publicImageSizes, type PublicImageSizesPreset } from "@/data/public-image-sizes";

type PublicImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string;
  mobileSrc?: string;
  wideSrc?: string;
  sizes?: string;
  sizesPreset?: PublicImageSizesPreset;
};

function srcSet(variants: Array<{ src: string; width: number }> | undefined) {
  return variants?.map(variant => `${variant.src} ${variant.width}w`).join(", ");
}

export function PublicImage({
  src,
  mobileSrc,
  wideSrc,
  alt = "",
  sizes,
  sizesPreset,
  loading = "lazy",
  decoding = "async",
  ...props
}: PublicImageProps) {
  const asset = publicImageManifest[src];

  if (!asset) {
    return <img src={src} alt={alt} loading={loading} decoding={decoding} {...props} />;
  }

  const resolvedWideAsset = wideSrc ? publicImageManifest[wideSrc] : asset.wide;
  const resolvedMobileAsset = mobileSrc ? publicImageManifest[mobileSrc] : asset.mobile;
  const preset = sizesPreset ?? asset.sizesPreset as PublicImageSizesPreset;
  const resolvedSizes = sizes ?? publicImageSizes[preset] ?? "100vw";

  return (
    <picture style={{ display: "contents" }}>
      {resolvedWideAsset ? <>
        <source media="(min-width: 1600px)" type="image/avif" srcSet={srcSet(resolvedWideAsset.avif)} sizes={resolvedSizes} />
        <source media="(min-width: 1600px)" type="image/webp" srcSet={srcSet(resolvedWideAsset.webp)} sizes={resolvedSizes} />
      </> : null}
      {resolvedMobileAsset ? <>
        <source media="(max-width: 639px)" type="image/avif" srcSet={srcSet(resolvedMobileAsset.avif)} sizes={resolvedSizes} />
        <source media="(max-width: 639px)" type="image/webp" srcSet={srcSet(resolvedMobileAsset.webp)} sizes={resolvedSizes} />
      </> : null}
      <source type="image/avif" srcSet={srcSet(asset.avif)} sizes={resolvedSizes} />
      <source type="image/webp" srcSet={srcSet(asset.webp)} sizes={resolvedSizes} />
      <img
        src={src}
        alt={alt}
        width={asset.width}
        height={asset.height}
        sizes={resolvedSizes}
        loading={loading}
        decoding={decoding}
        {...props}
      />
    </picture>
  );
}
