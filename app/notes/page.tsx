import React from "react";
import { WritingIndex } from "@/components/WritingIndex";
import { WritingSeries } from "@/components/WritingSeries";
import { PlannedNotes } from "@/components/PlannedNotes";
import { getAllPosts } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Engineering Tutorials and Linux Walkthroughs",
  description:
    "Read Ahmed Asl's tutorials on Linux, cybersecurity, embedded systems, Python, Git, Dart, Flutter, IoT, and machine learning.",
  pathname: "/notes/"
});

export default function WritingPage() {
  const allPosts = getAllPosts({ includeDrafts: true });
  const posts = allPosts.filter((post) => !post.draft);

  return (
    <div className="asl-page asl-field-notes">
      <section className="page-intro shell writing-intro asl-page-intro">
        <p className="eyebrow">Field notes / reproducible methods</p>
        <h1>Linux Walkthroughs and Engineering Tutorials</h1>
        <p className="page-lede">
          I document the commands, design decisions, tests, and failure modes
          behind embedded systems, Linux, cybersecurity, Flutter, and AI work.
        </p>
      </section>

      <WritingSeries posts={allPosts} />

      <section
        className="shell page-section writing-index-section"
        id="published-field-logs"
        aria-labelledby="published-field-logs-title"
      >
        <div className="section-heading writing-library-heading">
          <div>
            <h2 id="published-field-logs-title">Published engineering notes</h2>
            <p className="section-intro">
              Search published articles by subject, tool, or category.
            </p>
          </div>
          <span className="series-count mono">
            {String(posts.length).padStart(2, "0")} PUBLISHED
          </span>
        </div>
        <WritingIndex posts={posts} />
      </section>
      <PlannedNotes />
    </div>
  );
}
