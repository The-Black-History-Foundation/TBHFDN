import { redirect } from "next/navigation";
import { getWikiUrl } from "@/lib/wiki";

export default function WikiRedirectPage() {
  const wikiUrl = getWikiUrl();
  if (wikiUrl) {
    redirect(wikiUrl);
  }
  redirect("/educational");
}
