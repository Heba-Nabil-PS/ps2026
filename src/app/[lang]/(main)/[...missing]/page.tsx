import { notFound } from "next/navigation";

/** Unmatched URLs inside a locale render that locale's not-found page. */
export default function Missing() {
  notFound();
}
