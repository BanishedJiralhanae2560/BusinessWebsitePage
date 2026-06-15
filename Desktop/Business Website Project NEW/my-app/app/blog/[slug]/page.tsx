'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/app/components/Header/Header';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

/* ============================================================
   Types
   ============================================================ */

// Each entry in the `sections` JSONB column
type Section = {
  heading: string;
  body: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  author_avatar: string | null;
  category: string;
  tags: string[] | null;
  // Plain-text fallback body
  content: string | null;
  // Structured fields added via ALTER TABLE
  introduction: string | null;
  sections: Section[] | null;
  conclusion: string | null;
  created_at: string;
  published_at: string | null;
};

/* ============================================================
   Helpers
   ============================================================ */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** Renders a plain-text string as paragraphs (splits on blank lines) */
function renderPlainText(raw: string) {
  return raw
    .split(/\n{2,}/)
    .map((para, i) => {
      const trimmed = para.trim();
      if (!trimmed) return null;
      const lines = trimmed.split('\n');
      return (
        <p key={i} className={styles.contentParagraph}>
          {lines.map((line, j) => (
            <React.Fragment key={j}>
              {line}
              {j < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    })
    .filter(Boolean);
}

/* ============================================================
   Main Component
   ============================================================ */
export default function BlogPostPage() {
  const params = useParams();
  const slug =
    typeof params?.slug === 'string'
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : '';

  const [post, setPost]         = useState<Post | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select(
          'id, title, slug, excerpt, author, category, tags, content, introduction, sections, conclusion, created_at, published_at'
        )
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        // Separately fetch the avatar from admin_users by matching on the author name
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('avatar_url, full_name')
          .eq('full_name', data.author)
          .single();

        setPost({
          ...data,
          author_avatar: adminRow?.avatar_url ?? null,
        } as Post);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className={styles.page}>
        <Header navOnly />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Loading post…</p>
        </div>
      </div>
    );
  }

  /* ---- Not found ---- */
  if (notFound || !post) {
    return (
      <div className={styles.page}>
        <Header navOnly />
        <div className={styles.notFound}>
          <p className={styles.notFoundCode}>404</p>
          <h1 className={styles.notFoundTitle}>Post not found</h1>
          <p className={styles.notFoundSub}>This post may have been moved or unpublished.</p>
          <Link href="/blog" className={styles.backButton}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const publishDate = post.published_at ?? post.created_at;

  // Determine whether this post uses structured fields or plain content
  const hasStructured =
    post.introduction || (post.sections && post.sections.length > 0) || post.conclusion;

  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{post.title}</span>
      </div>

      {/* Article */}
      <article className={styles.article}>

        {/* ── Header ── */}
        <header className={styles.articleHeader}>
          <div className={styles.articleMeta}>
            <span className={styles.articleCategory}>{post.category}</span>
            <span className={styles.articleDate}>{formatDate(publishDate)}</span>
          </div>

          <h1 className={styles.articleTitle}>{post.title}</h1>

          {post.excerpt && (
            <p className={styles.articleExcerpt}>{post.excerpt}</p>
          )}

          <div className={styles.articleAuthorRow}>
            <div className={styles.articleAuthorAvatar}>
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              )}
            </div>
            <span className={styles.articleAuthorName}>{post.author}</span>
          </div>
        </header>

        <div className={styles.headerDivider} />

        {/* ── Body ── */}
        <div className={styles.articleBody}>

          {hasStructured ? (
            <>
              {/* Introduction */}
              {post.introduction && (
                <div className={styles.introBlock}>
                  {renderPlainText(post.introduction)}
                </div>
              )}

              {/* Sections — each has a styled heading + body paragraphs */}
              {post.sections && post.sections.map((section, i) => (
                <div key={i} className={styles.sectionBlock}>
                  <h2 className={styles.contentH2}>{section.heading}</h2>
                  {section.body && renderPlainText(section.body)}
                </div>
              ))}

              {/* Conclusion */}
              {post.conclusion && (
                <div className={styles.conclusionBlock}>
                  {renderPlainText(post.conclusion)}
                </div>
              )}
            </>
          ) : post.content ? (
            // Fallback: render plain content field
            renderPlainText(post.content)
          ) : (
            <p className={styles.noContent}>No content available for this post.</p>
          )}

        </div>

        {/* ── Tags ── */}
        {post.tags && post.tags.length > 0 && (
          <div className={styles.articleTags}>
            <span className={styles.tagsLabel}>Tags:</span>
            {post.tags.map(tag => (
              <span key={tag} className={styles.articleTag}>#{tag}</span>
            ))}
          </div>
        )}

        {/* ── Back link ── */}
        <div className={styles.articleFooter}>
          <Link href="/blog" className={styles.backButton}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
            </svg>
            Back to Blog
          </Link>
        </div>

      </article>
    </div>
  );
}