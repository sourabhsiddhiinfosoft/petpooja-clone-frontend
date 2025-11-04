"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function OwnerHelpPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/docs/OWNER_USER_MANUAL.md")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load manual");
        return res.text();
      })
      .then((text) => {
        if (isMounted) {
          setContent(text);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load manual");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Build a simple TOC from markdown headings starting with "## " or "### "
  const toc = useMemo(() => {
    if (!content) return [];
    return content
      .split("\n")
      .map((line) => line.trim())
      .map((line, idx) => {
        if (line.startsWith("## ")) {
          const title = line.replace(/^## /, "").trim();
          const id = slugify(title);
          return { level: 2, title, id };
        }
        if (line.startsWith("### ")) {
          const title = line.replace(/^### /, "").trim();
          const id = slugify(title);
          return { level: 3, title, id };
        }
        return null;
      })
      .filter(Boolean);
  }, [content]);

  const handleJump = (id) => {
    const el = containerRef.current?.querySelector(`#${CSS.escape(id)}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Minimal Markdown → JSX (headings, hr, bullet lists, paragraphs)
  const rendered = useMemo(() => {
    if (!content) return null;
    const lines = content.split("\n");
    const elements = [];
    let listBuffer = [];

    const flushList = () => {
      if (listBuffer.length) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-1">
            {listBuffer.map((item, i) => (
              <li key={`li-${elements.length}-${i}`} className="text-sm text-gray-800">{item}</li>
            ))}
          </ul>
        );
        listBuffer = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.replace(/\r$/, "");
      if (!line.trim()) {
        flushList();
        continue;
      }

      // Horizontal rule ---
      if (/^---+$/.test(line.trim())) {
        flushList();
        elements.push(<hr key={`hr-${i}`} className="my-6 border-gray-200" />);
        continue;
      }

      // Headings
      if (line.startsWith("### ")) {
        flushList();
        const text = line.replace(/^### /, "").trim();
        const id = slugify(text);
        elements.push(
          <h3 id={id} key={`h3-${i}`} className="text-lg font-semibold text-gray-900 mt-8 mb-3">
            {text}
          </h3>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        flushList();
        const text = line.replace(/^## /, "").trim();
        const id = slugify(text);
        elements.push(
          <h2 id={id} key={`h2-${i}`} className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">
            {text}
          </h2>
        );
        continue;
      }
      if (line.startsWith("# ")) {
        flushList();
        const text = line.replace(/^# /, "").trim();
        const id = slugify(text);
        elements.push(
          <h1 id={id} key={`h1-${i}`} className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 mb-4">
            {text}
          </h1>
        );
        continue;
      }

      // Bulleted list item
      if (line.trim().startsWith("- ")) {
        const item = line.trim().replace(/^-\s+/, "");
        listBuffer.push(item);
        continue;
      }

      // Paragraph fallback
      flushList();
      elements.push(
        <p key={`p-${i}`} className="text-sm leading-6 text-gray-800 mb-3">
          {line}
        </p>
      );
    }

    flushList();
    return elements;
  }, [content]);

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className=" px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black">Owner Help & User Manual</h1>
                <p className="text-grey mt-1">Step-by-step guide to set up branches, areas, tables, menu, inventory, staff and take orders.</p>
              </div>
              {/* <div className="flex items-center gap-2">
                <a
                  href="/docs/OWNER_USER_MANUAL.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  View Raw
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  }}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                >
                  Copy Page Link
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TOC Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">On this page</h2>
              {loading && <div className="text-gray-500 text-sm">Building outline…</div>}
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {!loading && !error && (
                <nav className="space-y-1">
                  {toc.map((item, idx) => (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => handleJump(item.id)}
                      className={`block w-full text-left text-sm rounded-md px-2 py-1 hover:bg-gray-50 transition ${
                        item.level === 2 ? "font-medium text-gray-800" : "pl-4 text-gray-600"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-9">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6" ref={containerRef}>
              {loading && (
                <div className="space-y-3">
                  <div className="h-5 w-1/3 bg-gray-100 animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded" />
                  <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-gray-100 animate-pulse rounded" />
                </div>
              )}
              {error && (
                <p className="text-red-600">{error}. Please contact support or try again.</p>
              )}
              {!loading && !error && (
                <article className="text-gray-800">
                  {rendered}
                </article>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
