'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

/* ============================================================
   Types
   ============================================================ */
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  category: string;
  tags: string[] | null;
  created_at: string;
};

const CATEGORIES = ['All', 'Company News', 'Product Update', 'Operations', 'Engineering', 'General'];

/* ============================================================
   Helpers
   ============================================================ */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className={styles.postCard}>
      {/* Image placeholder */}
      <div className={styles.postImagePlaceholder}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28"
          style={{ color: 'var(--color-border, #333)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>

      <div className={styles.postCardBody}>
        <div className={styles.postMeta}>
          <span className={styles.postCategory}>{post.category}</span>
          <span className={styles.postDate}>{formatDate(post.created_at)}</span>
        </div>
        <h2 className={styles.postTitle}>{post.title}</h2>
        {post.excerpt && <p className={styles.postExcerpt}>{post.excerpt}</p>}
        <div className={styles.postFooter}>
          <span className={styles.postAuthor}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="13" height="13">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            {post.author}
          </span>
          <span className={styles.postReadMore}>
            Read more
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="13" height="13">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className={styles.postTags}>
            {post.tags.map(tag => (
              <span key={tag} className={styles.postTag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
export default function BlogPage() {
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, author, category, tags, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filtered = posts.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch   = search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* Hero */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>// BLOG</p>
          <h1 className={styles.heroTitle}>News & Updates</h1>
          <p className={styles.heroSub}>
            Company announcements, product launches, operational updates,
            and insights from our engineering team.
          </p>
        </div>
      </div>

      <div className={styles.contentWrap}>

        {/* Search + filter */}
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input
              type="text"
              placeholder="Search posts…"
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <div className={styles.categoryTabs}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${activeCategory === cat ? styles.categoryTabActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <p>Loading posts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="40" height="40"
              style={{ color: 'var(--color-border, #333)', marginBottom: '1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
            <p className={styles.emptyTitle}>No posts found</p>
            <p className={styles.emptySub}>
              {search ? `No results for "${search}"` : 'No posts in this category yet.'}
            </p>
            <button className={styles.emptyReset} onClick={() => { setSearch(''); setActiveCategory('All'); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className={styles.resultCount}>{filtered.length} post{filtered.length !== 1 ? 's' : ''}</p>
            <div className={styles.postsGrid}>
              {filtered.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          </>
        )}

      </div>
    </div>
  );
}