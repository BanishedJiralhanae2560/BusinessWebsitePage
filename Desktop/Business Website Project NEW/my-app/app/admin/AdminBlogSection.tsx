'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '@/app/admin/AdminPage.module.css';
import blogStyles from './AdminBlogSection.module.css';

/* ============================================================
   Types
   ============================================================ */
type BodySection = {
  heading: string;
  body: string;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  introduction: string | null;
  sections: BodySection[] | null;
  conclusion: string | null;
  author: string;
  category: string;
  tags: string[] | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  banner_url: string | null;
};

type ArticleForm = {
  title: string;
  slug: string;
  excerpt: string;
  introduction: string;
  sections: BodySection[];
  conclusion: string;
  author: string;
  category: string;
  tags: string;
  published: boolean;
  published_at: string;
  banner_url: string | null;
};

const BLOG_CATEGORIES = [
  'General',
  'Company News',
  'Product Update',
  'Operations',
  'Engineering',
];

const MAX_SECTIONS = 5;

/* ============================================================
   Helpers
   ============================================================ */
function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function todayISO() {
  return new Date().toISOString().slice(0, 16);
}

function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function emptyForm(): ArticleForm {
  return {
    title: '', slug: '', excerpt: '', introduction: '',
    sections: [{ heading: '', body: '' }],
    conclusion: '', author: 'Admin', category: 'General',
    tags: '', published: false, published_at: todayISO(),
    banner_url: null,
  };
}

/* ============================================================
   Word counter
   ============================================================ */
function Counter({ text }: { text: string }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <span className={blogStyles.counter}>
      {words}w · {text.length}ch
    </span>
  );
}

/* ============================================================
   Banner Upload Field
   ============================================================ */
function BannerUpload({
  bannerUrl,
  onUpload,
  onRemove,
  uploading,
}: {
  bannerUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  if (bannerUrl) {
    return (
      <div className={blogStyles.bannerPreviewWrap}>
        <img src={bannerUrl} alt="Article banner" className={blogStyles.bannerPreviewImg} />
        <div className={blogStyles.bannerPreviewOverlay}>
          <button
            type="button"
            className={blogStyles.bannerChangeBtn}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : '↑ Change Image'}
          </button>
          <button
            type="button"
            className={blogStyles.bannerRemoveBtn}
            onClick={onRemove}
            disabled={uploading}
          >
            ✕ Remove
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div
      className={blogStyles.bannerDropzone}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      {uploading ? (
        <div className={blogStyles.bannerUploading}>
          <span className={blogStyles.bannerSpinner} />
          <span>Uploading image…</span>
        </div>
      ) : (
        <>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28"
            style={{ color: 'var(--color-text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p className={blogStyles.bannerDropzoneText}>
            <strong>Click to upload</strong> or drag & drop a banner image
          </p>
          <p className={blogStyles.bannerDropzoneHint}>JPG, PNG, WebP · Recommended 1200×630px · Max 5 MB</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}

/* ============================================================
   Body section field
   ============================================================ */
function SectionField({
  index, section, total, onChange, onRemove, onMoveUp, onMoveDown,
}: {
  index: number;
  section: BodySection;
  total: number;
  onChange: (i: number, f: keyof BodySection, v: string) => void;
  onRemove: (i: number) => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
}) {
  return (
    <div className={blogStyles.sectionField}>
      <div className={blogStyles.sectionFieldHeader}>
        <span className={blogStyles.sectionFieldLabel}>
          Section {index + 1}
          {section.heading && (
            <span className={blogStyles.sectionFieldPreview}> — {section.heading}</span>
          )}
        </span>
        <div className={blogStyles.sectionFieldActions}>
          <button type="button" className={blogStyles.sectionMoveBtn}
            onClick={() => onMoveUp(index)} disabled={index === 0} title="Move up">↑</button>
          <button type="button" className={blogStyles.sectionMoveBtn}
            onClick={() => onMoveDown(index)} disabled={index === total - 1} title="Move down">↓</button>
          <button type="button" className={blogStyles.sectionRemoveBtn}
            onClick={() => onRemove(index)} title="Remove section">✕</button>
        </div>
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel}>Section Heading</label>
        <input type="text" className={styles.settingsInput}
          placeholder="e.g. What's New, Key Features, Why This Matters…"
          value={section.heading}
          onChange={e => onChange(index, 'heading', e.target.value)} />
      </div>
      <div className={styles.settingsField} style={{ marginTop: '0.75rem' }}>
        <div className={blogStyles.labelRow}>
          <label className={styles.settingsLabel}>Section Body</label>
          <Counter text={section.body} />
        </div>
        <textarea className={styles.settingsTextarea} rows={5}
          placeholder="Write this section's content…"
          value={section.body}
          onChange={e => onChange(index, 'body', e.target.value)} />
      </div>
    </div>
  );
}

/* ============================================================
   Article Preview
   ============================================================ */
function ArticlePreview({ form }: { form: ArticleForm }) {
  const hasContent = form.introduction || form.sections.some(s => s.body) || form.conclusion;
  return (
    <div className={blogStyles.preview}>
      {/* Banner preview */}
      {form.banner_url && (
        <div className={blogStyles.previewBanner}>
          <img src={form.banner_url} alt="Banner" className={blogStyles.previewBannerImg} />
        </div>
      )}
      <div className={blogStyles.previewHeader}>
        <span className={blogStyles.previewCategory}>{form.category || 'Category'}</span>
        <h1 className={blogStyles.previewTitle}>{form.title || 'Article Title'}</h1>
        {form.excerpt && <p className={blogStyles.previewExcerpt}>{form.excerpt}</p>}
        <div className={blogStyles.previewMeta}>
          <span>By <strong>{form.author || 'Author'}</strong></span>
          <span className={blogStyles.previewMetaDot}>·</span>
          <span>{form.published_at ? formatDisplayDate(form.published_at) : 'Publication date'}</span>
          {form.tags && (
            <>
              <span className={blogStyles.previewMetaDot}>·</span>
              <span>{form.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => `#${t}`).join(' ')}</span>
            </>
          )}
        </div>
      </div>
      <div className={blogStyles.previewDivider} />
      {!hasContent ? (
        <p className={blogStyles.previewEmpty}>Start writing to see your article preview here.</p>
      ) : (
        <>
          {form.introduction && (
            <p className={blogStyles.previewIntro}>{form.introduction}</p>
          )}
          {form.sections.filter(s => s.body).map((s, i) => (
            <div key={i} className={blogStyles.previewSection}>
              {s.heading && <h2 className={blogStyles.previewSectionHeading}>{s.heading}</h2>}
              <p className={blogStyles.previewSectionBody}>{s.body}</p>
            </div>
          ))}
          {form.conclusion && (
            <div className={blogStyles.previewSection}>
              <h2 className={blogStyles.previewSectionHeading}>Conclusion</h2>
              <p className={blogStyles.previewSectionBody}>{form.conclusion}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   Main BlogSection
   ============================================================ */
export function BlogSection() {
  const [posts, setPosts]             = useState<BlogPost[]>([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState<'list' | 'new' | 'edit'>('list');
  const [editPost, setEditPost]       = useState<BlogPost | null>(null);
  const [saving, setSaving]           = useState(false);
  const [feedback, setFeedback]       = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm]               = useState<ArticleForm>(emptyForm());
  const [isDirty, setIsDirty]         = useState(false);
  const [lastSaved, setLastSaved]     = useState<Date | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  const supabase = createClient();

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  /* ── Banner upload handler ── */
  const handleBannerUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback('Image must be under 5 MB.');
      return;
    }

    setBannerUploading(true);
    setFeedback('');

    const ext      = file.name.split('.').pop();
    const fileName = `${Date.now()}-${slugify(form.slug || form.title || 'banner')}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-banners')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setFeedback('Banner upload failed: ' + uploadError.message);
      setBannerUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('blog-banners')
      .getPublicUrl(fileName);

    setForm(prev => ({ ...prev, banner_url: urlData.publicUrl }));
    setIsDirty(true);
    setBannerUploading(false);
  };

  const handleBannerRemove = () => {
    setForm(prev => ({ ...prev, banner_url: null }));
    setIsDirty(true);
  };

  const openNew = () => {
    setForm(emptyForm());
    setEditPost(null);
    setView('new');
    setFeedback('');
    setShowPreview(false);
  };

  const openEdit = (post: BlogPost) => {
    setEditPost(post);
    setForm({
      title:        post.title,
      slug:         post.slug,
      excerpt:      post.excerpt ?? '',
      introduction: post.introduction ?? '',
      sections:     post.sections?.length ? post.sections : [{ heading: '', body: '' }],
      conclusion:   post.conclusion ?? '',
      author:       post.author,
      category:     post.category,
      tags:         (post.tags ?? []).join(', '),
      published:    post.published,
      published_at: post.published_at ? post.published_at.slice(0, 16) : todayISO(),
      banner_url:   post.banner_url ?? null,
    });
    setView('edit');
    setFeedback('');
    setShowPreview(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setIsDirty(true);
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && view === 'new' ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSectionChange = (i: number, field: keyof BodySection, value: string) => {
    setIsDirty(true);
    setForm(prev => {
      const updated = [...prev.sections];
      updated[i] = { ...updated[i], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const addSection = () => {
    if (form.sections.length >= MAX_SECTIONS) return;
    setForm(prev => ({ ...prev, sections: [...prev.sections, { heading: '', body: '' }] }));
  };

  const removeSection = (i: number) => {
    setForm(prev => ({ ...prev, sections: prev.sections.filter((_, idx) => idx !== i) }));
  };

  const moveSection = (i: number, dir: 'up' | 'down') => {
    setForm(prev => {
      const arr = [...prev.sections];
      const t = dir === 'up' ? i - 1 : i + 1;
      [arr[i], arr[t]] = [arr[t], arr[i]];
      return { ...prev, sections: arr };
    });
  };

  const totalWords = [form.introduction, ...form.sections.map(s => s.body), form.conclusion]
    .join(' ').trim().split(/\s+/).filter(Boolean).length;

  const buildPayload = (published: boolean) => {
    const plainContent = [
      form.introduction,
      ...form.sections.map(s => s.heading ? `${s.heading}\n\n${s.body}` : s.body),
      form.conclusion,
    ].filter(Boolean).join('\n\n');

    return {
      title:        form.title.trim(),
      slug:         form.slug.trim(),
      excerpt:      form.excerpt.trim() || null,
      content:      plainContent || '(draft)',
      introduction: form.introduction.trim() || null,
      sections:     form.sections.filter(s => s.body.trim()),
      conclusion:   form.conclusion.trim() || null,
      author:       form.author.trim() || 'Admin',
      category:     form.category,
      tags:         form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      banner_url:   form.banner_url ?? null,
      published,
      published_at: published
        ? (form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString())
        : null,
    };
  };

  const handleSave = async () => {
    if (!form.title.trim())  { setFeedback('Title is required.');  return; }
    if (!form.slug.trim())   { setFeedback('Slug is required.');   return; }
    if (!form.author.trim()) { setFeedback('Author is required.'); return; }
    if (!form.introduction.trim() && form.sections.every(s => !s.body.trim())) {
      setFeedback('Please write at least an introduction or one body section.');
      return;
    }

    setSaving(true);
    setFeedback('');
    const payload = buildPayload(true);

    if (view === 'edit' && editPost) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editPost.id);
      if (error) { setFeedback('Error: ' + error.message); }
      else { setFeedback('✓ Post updated!'); setLastSaved(new Date()); setIsDirty(false); }
      fetchPosts();
    } else {
      const { error } = await supabase.from('blog_posts').insert([payload]);
      if (error) setFeedback('Error: ' + error.message);
      else { setLastSaved(new Date()); setIsDirty(false); fetchPosts(); setView('list'); }
    }
    setSaving(false);
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) { setFeedback('Title is required to save a draft.'); return; }
    if (!form.slug.trim())  { setFeedback('Slug is required to save a draft.');  return; }

    setSaving(true);
    setFeedback('');
    const payload = buildPayload(false);

    if (view === 'edit' && editPost) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editPost.id);
      if (error) { setFeedback('Error: ' + error.message); }
      else { setFeedback('✓ Draft saved.'); setLastSaved(new Date()); setIsDirty(false); }
      fetchPosts();
    } else {
      const { error } = await supabase.from('blog_posts').insert([payload]);
      if (error) setFeedback('Error: ' + error.message);
      else { setLastSaved(new Date()); setIsDirty(false); fetchPosts(); setView('list'); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const handleDeleteDraft = async () => {
    if (!editPost) return;
    if (!confirm('Permanently delete this draft? This cannot be undone.')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', editPost.id);
    if (error) { setFeedback('Error deleting draft: ' + error.message); return; }
    fetchPosts();
    setView('list');
  };

  const handleBack = () => {
    if (isDirty && !confirm('You have unsaved changes. Leave without saving?')) return;
    setView('list');
    setFeedback('');
    setIsDirty(false);
    setLastSaved(null);
  };

  const handleTogglePublish = async (post: BlogPost) => {
    await supabase.from('blog_posts').update({
      published:    !post.published,
      published_at: !post.published ? new Date().toISOString() : null,
    }).eq('id', post.id);
    fetchPosts();
  };

  /* ── LIST ── */
  if (view === 'list') return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <p className={styles.pageEyebrow}>// BLOG</p>
          <h1 className={styles.pageTitle}>Blog</h1>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.btnPrimary} onClick={openNew}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Post
          </button>
        </div>
      </div>

      <div className={styles.miniStatsRow}>
        {[
          { label: 'Total Posts', value: String(posts.length) },
          { label: 'Published',   value: String(posts.filter(p => p.published).length) },
          { label: 'Drafts',      value: String(posts.filter(p => !p.published).length) },
          { label: 'Categories',  value: String([...new Set(posts.map(p => p.category))].length) },
        ].map((s, i) => (
          <div key={i} className={styles.miniStatCard}>
            <p className={styles.miniStatValue}>{s.value}</p>
            <p className={styles.miniStatLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={styles.fullPanel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>All Posts</span>
          <span className={styles.panelMeta}>{posts.length} total</span>
        </div>
        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading…</p>
        ) : posts.length === 0 ? (
          <p style={{ padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No posts yet. Click "New Post" to write your first article.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['Banner', 'Title', 'Category', 'Author', 'Published Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className={styles.tableTh}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className={styles.tableTr}>
                    <td className={styles.tableTd}>
                      {post.banner_url ? (
                        <img
                          src={post.banner_url}
                          alt="Banner"
                          className={blogStyles.tableBannerThumb}
                        />
                      ) : (
                        <div className={blogStyles.tableBannerEmpty}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className={styles.tableTd}>
                      <span className={styles.tableCustomer}>{post.title}</span>
                      <br />
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        /blog/{post.slug}
                      </span>
                    </td>
                    <td className={styles.tableTd}>{post.category}</td>
                    <td className={styles.tableTd}>{post.author}</td>
                    <td className={styles.tableTd} style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {post.published_at ? formatDisplayDate(post.published_at) : <span style={{ fontStyle: 'italic' }}>Not set</span>}
                    </td>
                    <td className={styles.tableTd}>
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`${styles.statusBadge} ${post.published ? styles.statusPaid : styles.statusPending}`}
                        style={{ cursor: 'pointer', border: 'none', background: 'inherit' }}
                        title="Click to toggle"
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className={styles.tableTd}>
                      <div className={styles.tableActions}>
                        <button className={styles.tableActionBtn} onClick={() => openEdit(post)}>Edit</button>
                        <button
                          className={`${styles.tableActionBtn} ${styles.tableActionBtnDanger}`}
                          onClick={() => handleDelete(post.id)}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  /* ── FORM (New / Edit) ── */
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <p className={styles.pageEyebrow}>// BLOG</p>
          <h1 className={styles.pageTitle}>{view === 'new' ? 'New Article' : 'Edit Article'}</h1>
        </div>
        <div className={styles.pageActions}>
          <button className={blogStyles.previewToggle} onClick={() => setShowPreview(p => !p)}>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          {view === 'edit' && editPost && !editPost.published && (
            <button className={blogStyles.btnDeleteDraft} onClick={handleDeleteDraft}>
              Delete Draft
            </button>
          )}
          <button className={styles.btnSecondary} onClick={handleBack}>← Back</button>
          <button className={blogStyles.btnDraft} onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : view === 'new' ? 'Publish Post' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {feedback && (
        <p className={blogStyles.feedback} style={{
          color: feedback.startsWith('✓') ? 'var(--color-accent)' : '#ef4444',
        }}>{feedback}</p>
      )}

      <div className={blogStyles.saveStatus}>
        {isDirty ? (
          <span className={blogStyles.saveStatusUnsaved}>● Unsaved changes</span>
        ) : lastSaved ? (
          <span className={blogStyles.saveStatusSaved}>
            ✓ Last saved at {lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : null}
      </div>

      <div className={blogStyles.wordCountBar}>
        <span className={blogStyles.wordCountText}>
          Total: <strong>{totalWords} words</strong>
        </span>
        <span className={blogStyles.wordCountSections}>
          {form.sections.length}/{MAX_SECTIONS} sections used
        </span>
      </div>

      <div className={blogStyles.formLayout}>

        {/* ── LEFT: Content ── */}
        <div className={blogStyles.formMain}>

          {/* Block 00 — Banner Image */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>00</span>
              <span className={blogStyles.formBlockTitle}>Banner Image</span>
              <span className={blogStyles.formBlockHint}>
                Displayed at the top of the article and as the post card thumbnail.
              </span>
            </div>
            <BannerUpload
              bannerUrl={form.banner_url}
              onUpload={handleBannerUpload}
              onRemove={handleBannerRemove}
              uploading={bannerUploading}
            />
          </div>

          {/* Block 01 — Title & Identity */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>01</span>
              <span className={blogStyles.formBlockTitle}>Title & Identity</span>
            </div>
            <div className={styles.settingsFields}>
              <div className={styles.settingsField}>
                <div className={blogStyles.labelRow}>
                  <label className={styles.settingsLabel}>Article Title *</label>
                  <Counter text={form.title} />
                </div>
                <input name="title" type="text" value={form.title} onChange={handleChange}
                  className={styles.settingsInput}
                  placeholder="Write a clear, compelling title…" />
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>
                  URL Slug *
                  <span className={blogStyles.slugHint}> — auto-generated, edit if needed</span>
                </label>
                <div className={blogStyles.slugWrap}>
                  <span className={blogStyles.slugPrefix}>/blog/</span>
                  <input name="slug" type="text" value={form.slug} onChange={handleChange}
                    className={`${styles.settingsInput} ${blogStyles.slugInput}`}
                    placeholder="article-slug-here" />
                </div>
              </div>
              <div className={styles.settingsField}>
                <div className={blogStyles.labelRow}>
                  <label className={styles.settingsLabel}>Excerpt / Summary</label>
                  <Counter text={form.excerpt} />
                </div>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange}
                  className={styles.settingsTextarea} rows={2}
                  placeholder="1–2 sentences shown on the blog listing. Give readers a reason to click." />
              </div>
            </div>
          </div>

          {/* Block 02 — Introduction */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>02</span>
              <span className={blogStyles.formBlockTitle}>Introduction</span>
              <span className={blogStyles.formBlockHint}>Sets the scene — what is this article about and why does it matter?</span>
            </div>
            <div className={styles.settingsField}>
              <div className={blogStyles.labelRow}>
                <label className={styles.settingsLabel}>Opening Paragraph</label>
                <Counter text={form.introduction} />
              </div>
              <textarea name="introduction" value={form.introduction} onChange={handleChange}
                className={styles.settingsTextarea} rows={5}
                placeholder="Start with context. What is happening? Why is it relevant to your readers?" />
            </div>
          </div>

          {/* Block 03 — Body Sections */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>03</span>
              <span className={blogStyles.formBlockTitle}>Body Sections</span>
              <span className={blogStyles.formBlockHint}>Each section has a heading and its own content. Up to {MAX_SECTIONS}.</span>
            </div>
            {form.sections.map((section, i) => (
              <SectionField
                key={i} index={i} section={section} total={form.sections.length}
                onChange={handleSectionChange}
                onRemove={removeSection}
                onMoveUp={idx => moveSection(idx, 'up')}
                onMoveDown={idx => moveSection(idx, 'down')}
              />
            ))}
            {form.sections.length < MAX_SECTIONS && (
              <button type="button" className={blogStyles.addSectionBtn} onClick={addSection}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Add Section ({form.sections.length}/{MAX_SECTIONS})
              </button>
            )}
          </div>

          {/* Block 04 — Conclusion */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>04</span>
              <span className={blogStyles.formBlockTitle}>Conclusion</span>
              <span className={blogStyles.formBlockHint}>Wrap up — summarise key points or include a call to action.</span>
            </div>
            <div className={styles.settingsField}>
              <div className={blogStyles.labelRow}>
                <label className={styles.settingsLabel}>Closing Paragraph</label>
                <Counter text={form.conclusion} />
              </div>
              <textarea name="conclusion" value={form.conclusion} onChange={handleChange}
                className={styles.settingsTextarea} rows={4}
                placeholder="Round off the article. What should readers take away or do next?" />
            </div>
          </div>

        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className={blogStyles.formSidebar}>

          {/* Publish settings */}
          <div className={blogStyles.sidebarPanel}>
            <p className={blogStyles.sidebarPanelTitle}>Publish Settings</p>
            <div className={styles.settingsField} style={{ marginBottom: '1rem' }}>
              <label className={styles.settingsLabel}>Author Name *</label>
              <input name="author" type="text" value={form.author} onChange={handleChange}
                className={styles.settingsInput} placeholder="Your name" />
            </div>
            <div className={styles.settingsField} style={{ marginBottom: '1rem' }}>
              <label className={styles.settingsLabel}>Publication Date & Time</label>
              <input name="published_at" type="datetime-local" value={form.published_at}
                onChange={handleChange} className={styles.settingsInput} />
              <p className={blogStyles.fieldNote}>Shown on the article as the published date.</p>
            </div>
            <div className={`${styles.settingsToggleRow} ${blogStyles.publishToggleRow}`}>
              <div>
                <p className={styles.settingsToggleLabel}>
                  {form.published ? '🟢 Published' : '⚪ Draft'}
                </p>
                <p className={styles.settingsToggleDesc}>
                  {form.published ? 'Visible to all visitors' : 'Only visible to admins'}
                </p>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>

          {/* Categorisation */}
          <div className={blogStyles.sidebarPanel}>
            <p className={blogStyles.sidebarPanelTitle}>Categorisation</p>
            <div className={styles.settingsField} style={{ marginBottom: '1rem' }}>
              <label className={styles.settingsLabel}>Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className={styles.settingsInput}>
                {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Tags</label>
              <input name="tags" type="text" value={form.tags} onChange={handleChange}
                className={styles.settingsInput} placeholder="news, update, product" />
              <p className={blogStyles.fieldNote}>Comma-separated. No # needed.</p>
              {form.tags && (
                <div className={blogStyles.tagPreview}>
                  {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className={blogStyles.tagChip}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Article checklist */}
          <div className={blogStyles.sidebarPanel}>
            <p className={blogStyles.sidebarPanelTitle}>Article Checklist</p>
            <ul className={blogStyles.checklist}>
              {[
                { label: 'Banner image added',       done: !!form.banner_url },
                { label: 'Title written',            done: !!form.title.trim() },
                { label: 'Excerpt written',          done: !!form.excerpt.trim() },
                { label: 'Author set',               done: !!form.author.trim() },
                { label: 'Introduction written',     done: !!form.introduction.trim() },
                { label: 'At least 1 body section',  done: form.sections.some(s => !!s.body.trim()) },
                { label: 'Conclusion written',       done: !!form.conclusion.trim() },
                { label: 'Category selected',        done: !!form.category },
                { label: 'Publication date set',     done: !!form.published_at },
              ].map((item, i) => (
                <li key={i} className={`${blogStyles.checklistItem} ${item.done ? blogStyles.checklistItemDone : ''}`}>
                  <span className={blogStyles.checklistDot}>{item.done ? '✓' : '○'}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className={blogStyles.previewWrapper}>
          <div className={blogStyles.previewLabel}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Article Preview
          </div>
          <ArticlePreview form={form} />
        </div>
      )}
    </>
  );
}

export default BlogSection;