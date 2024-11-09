import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {session.user?.name || session.user?.email}
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Your home page content goes here */}
        Home
      </div>
    </div>
  );
}