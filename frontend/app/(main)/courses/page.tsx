"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

import { apiFetch, type Course, type UserSummary } from "@/lib/api";

import { List } from "./list";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [me, setMe] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Course[]>("/api/courses"),
      apiFetch<UserSummary>("/api/me"),
    ])
      .then(([c, u]) => {
        setCourses(c);
        setMe(u);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#C81E3A]" />
      </div>
    );
  }

  return (
    <div className="mx-auto h-full max-w-[912px] px-3 pb-12">
      <h1 className="text-2xl font-black text-neutral-900">
        Who are you trying to impress? ❤️
      </h1>
      <p className="mt-1 text-sm font-semibold text-rose-500">
        Both <strong>Spanish 🇪🇸</strong> and <strong>Korean 🇰🇷</strong> are
        fully seeded with 3 stages, 9 skills, and all 5 exercise types!
      </p>

      <List courses={courses} activeCourseId={me?.course?.id} />
    </div>
  );
};

export default CoursesPage;
