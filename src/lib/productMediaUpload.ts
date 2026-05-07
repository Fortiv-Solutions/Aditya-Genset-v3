import { supabase } from "@/lib/supabase";
import type { ExtractedPdfAssets } from "@/lib/pdfExtractor";

const PRODUCT_MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_PRODUCT_MEDIA_BUCKET || "product-media";

export type UploadedMediaAsset = {
  publicUrl: string;
  storagePath: string;
  mimeType: string;
};

export type UploadedPdfAssetBundle = {
  primaryImage?: UploadedMediaAsset;
  galleryImages: UploadedMediaAsset[];
  datasheet?: UploadedMediaAsset;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadFile(path: string, file: Blob | File, mimeType: string) {
  const { error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: mimeType,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    storagePath: path,
    mimeType,
  };
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  const fromMime = file.type.split("/").pop()?.toLowerCase();
  return fromMime && /^[a-z0-9]+$/.test(fromMime) ? fromMime : "bin";
}

export async function uploadProductMediaFile(params: {
  productId: string;
  slug: string;
  file: File;
  kind: "video" | "image" | "datasheet";
}) {
  const safeSlug = slugify(params.slug || params.productId);
  const extension = getFileExtension(params.file);
  const stamp = Date.now();
  const path = `products/${safeSlug}-${params.productId}/${params.kind}-${stamp}.${extension}`;

  return uploadFile(path, params.file, params.file.type || "application/octet-stream");
}

export async function uploadExtractedPdfAssets(params: {
  productId: string;
  slug: string;
  assets: ExtractedPdfAssets;
}) {
  const safeSlug = slugify(params.slug || params.productId);
  const stamp = Date.now();
  const basePath = `products/${safeSlug}-${params.productId}/${stamp}`;

  const pageUploads = await Promise.all(
    params.assets.pageImages.map((image) =>
      uploadFile(
        `${basePath}/page-${String(image.pageNumber).padStart(2, "0")}.png`,
        image.blob,
        image.mimeType,
      ),
    ),
  );

  const pdfUpload = await uploadFile(
    `${basePath}/datasheet-${safeSlug}.pdf`,
    params.assets.sourcePdf,
    params.assets.sourcePdf.type || "application/pdf",
  );

  return {
    primaryImage: pageUploads[0],
    galleryImages: pageUploads.slice(1),
    datasheet: pdfUpload,
  } satisfies UploadedPdfAssetBundle;
}
