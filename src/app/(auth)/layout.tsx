import type { Metadata } from "next";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/config/seo";

export const metadata: Metadata = {
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
