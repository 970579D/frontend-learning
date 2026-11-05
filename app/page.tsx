"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/app/lib/auth";

// put these files in  public/images/
const imagePath = { src: "/images/0.jpg", alt: "Learning App" };

const images = [
  { src: "/images/1.jpg", alt: "Coach teaching a class" },
  { src: "/images/2.jpg", alt: "Learner studying online" },
  { src: "/images/3.jpg", alt: "Group workshop" },
  { src: "/images/4.jpg", alt: "One-on-one coaching" },
  { src: "/images/5.jpg", alt: "Practicing a new skill" },
  { src: "/images/6.jpg", alt: "Celebrating progress" },
];

export default function HomePage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  // already logged in: go to the profile page of that role
  useEffect(() => {
    if (ready && user) router.replace(`/${user.role}_profile`);
  }, [ready, user, router]);

  if (!ready || user) {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <main>
      {/* zone 1: large image, welcome message, button */}
      <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col items-center justify-center gap-8 p-6 text-center">
        {/* large image before the welcome message */}
        <div className="relative mx-auto aspect-[21/9] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-800">
          <Image
            src={imagePath.src}
            alt={imagePath.alt}
            fill
            priority
            sizes="(min-width: 768px) 720px, 100vw"
            quality={70}
            className="object-cover"
          />
        </div>

        <h1 className="text-4xl font-bold text-white">Welcome to Learning App</h1>

        <p className="max-w-3xl leading-relaxed text-gray-400">
          Learning App connects people who want to learn with coaches who love to teach.
          Coaches share their skills and manage their profile, while learners browse
          skills, follow their progress and grow step by step. Create an account in
          a minute and start learning at your own pace.
        </p>

        <Link
          href="/menu"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
        >
          Get started
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* zone 2: image grid, visible after scrolling */}
      {images.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-8">
          <div className="grid w-full grid-cols-3 gap-3">
            {images.map(({ src, alt }) => (
              <div
                key={src}
                className="relative aspect-video overflow-hidden rounded-2xl border border-gray-800"
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 320px, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}