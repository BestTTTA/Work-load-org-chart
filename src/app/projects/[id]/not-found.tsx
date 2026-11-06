import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="py-12 text-center">
      <p className="font-medium">ไม่พบโปรเจคนี้</p>
      <Link
        href="/projects"
        className="mt-2 inline-block text-sm text-accent hover:underline"
      >
        กลับไปหน้าโปรเจค
      </Link>
    </div>
  );
}
