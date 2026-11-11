"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch, type Course } from "@/lib/api";

import { Card } from "./card";

type ListProps = {
  courses: Course[];
  activeCourseId?: number;
};

export const List = ({ courses, activeCourseId }: ListProps) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onClick = async (course: Course) => {
    if (pending) return;

    if (course.id === activeCourseId) {
      router.push("/learn");
      return;
    }

    if ((course.unit_count ?? 0) === 0 && course.id > 2) {
      toast.info(
        `${course.title} full skill tree is coming soon! Try Spanish 🇪🇸 or Korean 🇰🇷.`
      );
      return;
    }

    setPending(true);
    try {
      await apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ active_course_id: course.id }),
      });
      toast.success(`Switched active course to ${course.title} ❤️`);
      router.push("/learn");
    } catch {
      toast.error("Could not switch language course.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 pt-6 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imageSrc={course.flag_src}
          onClick={() => onClick(course)}
          disabled={pending}
          isActive={course.id === activeCourseId}
        />
      ))}
    </div>
  );
};
