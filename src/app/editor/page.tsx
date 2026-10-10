import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EditorApp } from "@/components/editor/EditorApp";

export default async function HalamanEditor() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <EditorApp
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? ""}
      sessionError={session.error}
    />
  );
}
