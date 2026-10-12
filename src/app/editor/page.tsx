import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ambilProfilSatker } from "@/lib/profil";
import { EditorApp } from "@/components/editor/EditorApp";

export default async function HalamanEditor() {
  const session = await auth();
  const kodeSatker = session?.user?.kodeSatker;
  if (!kodeSatker) redirect("/");

  const profil = await ambilProfilSatker(kodeSatker);
  if (!profil) redirect("/");

  return <EditorApp profil={profil} />;
}
