import Link from "next/link";

export default async function AdminPage({ params }: { params: { slug: string[] } }) {
  const { slug } = await params;
  return (
    <div>
      <h1 className="text-black">Admin Page</h1>
      <p className="text-black">This is admin {slug}</p>
      <div className="p-4 border border-gray-300 rounded-lg mt-4">
        <p className="text-black">Register New Admin</p>
        <Link href="/admin/registration" className="text-blue-500 hover:underline">Go to Registration</Link>
      </div>
    </div>
  );
}
