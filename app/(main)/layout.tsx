import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </>
  );
}
