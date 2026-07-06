import { GoogleAnalytics as NextGA } from "@next/third-parties/google";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

export function GoogleAnalytics() {
  if (!GA_ID) return null;
  return <NextGA gaId={GA_ID} />;
}
