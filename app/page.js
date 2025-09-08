"use client";
import HomePage from "./_components/HomePage";

export default function Page() {
  return (
    <main>
      <div className="">
        <HomePage videoSrc="/video.mp4" imageSrc="/image.jpg" />
      </div>
    </main>
  );
}
