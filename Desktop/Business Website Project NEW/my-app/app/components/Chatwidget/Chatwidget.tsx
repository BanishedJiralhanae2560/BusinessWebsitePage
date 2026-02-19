'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatwidget.module.css';

/* ============================================================
   Types
   ============================================================ */
type Role = 'user' | 'assistant';

interface Message {
  id:      number;
  role:    Role;
  content: string;
}

/* ============================================================
   Quick-reply suggestions shown at the start
   ============================================================ */
const QUICK_REPLIES = [
  'What products do you sell?',
  'How do I track my order?',
  'What is your return policy?',
  'Do you offer bulk discounts?',
  'How long does shipping take?',
];

/* ============================================================
   System prompt — keeps the bot focused on customer service
   ============================================================ */
const SYSTEM_PROMPT = `You are a helpful customer service assistant for an electronics component store that sells circuit boards, microchips, sensors, development kits, and custom hardware solutions. 

Keep responses concise, friendly, and professional. Only answer questions related to:
- Products and availability
- Order tracking and processing
- Shipping and delivery times
- Returns and warranty policy
- Pricing and bulk discounts
- Technical support for components

If asked about anything unrelated, politely redirect the conversation back to how you can help with their electronics or order needs. Never make up specific order numbers, prices, or tracking info — instead guide users to check their account or contact the team directly for specifics.`;

/* ============================================================
   Sub-components
   ============================================================ */

function BotAvatar() {
  return (
    <div className={styles.msgAvatar}>
      <svg className={styles.msgAvatarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.121m-3 0a2.25 2.25 0 003 0m0 0a24.094 24.094 0 004.5-.25m-7.5.25a2.25 2.25 0 01-3 0" />
      </svg>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className={styles.msgAvatar}>
      <svg className={styles.msgAvatarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className={styles.typingRow}>
      <BotAvatar />
      <div className={styles.typingBubble}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
const ChatWidget = () => {
  const [isOpen,    setIsOpen]    = useState(false);
  const [closing,   setClosing]   = useState(false);
  const [messages,  setMessages]  = useState<Message[]>([
    {
      id:      0,
      role:    'assistant',
      content: "Hi there! 👋 I'm your support assistant. Ask me anything about our products, orders, shipping, or returns!",
    },
  ]);
  const [input,     setInput]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDot,   setShowDot]   = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const idCounter      = useRef(1);

  /* Auto-scroll to latest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  /* Hide unread dot once opened */
  const handleOpen = () => {
    setShowDot(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
    }, 200);
  };

  const handleToggle = () => {
    if (isOpen) handleClose();
    else handleOpen();
  };

  /* Send message to Anthropic API */
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: idCounter.current++, role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      /* Build history for the API (exclude the greeting) */
      const history = [...messages.slice(1), userMsg].map(m => ({
        role:    m.role,
        content: m.content,
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system:     SYSTEM_PROMPT,
          messages:   history,
        }),
      });

      const data = await res.json();
      const reply = data?.content?.[0]?.text ?? "Sorry, I couldn't get a response. Please try again.";

      setMessages(prev => [
        ...prev,
        { id: idCounter.current++, role: 'assistant', content: reply },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id:      idCounter.current++,
          role:    'assistant',
          content: 'Sorry, something went wrong. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  /* Only show quick replies if there's only the greeting so far */
  const showQuickReplies = messages.length === 1 && !isLoading;

  return (
    <>
      {/* ── Chat Window ── */}
      {isOpen && (
        <div className={`${styles.window} ${closing ? styles.windowClosing : ''}`} role="dialog" aria-label="Customer support chat">

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.avatarBadge}>
              <svg className={styles.avatarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className={styles.headerText}>
              <p className={styles.headerTitle}>Support Assistant</p>
              <div className={styles.headerStatus}>
                <span className={styles.statusDot} />
                <span className={styles.statusText}>Online · Replies instantly</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close chat">
              <svg className={styles.closeBtnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages} role="log" aria-live="polite">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : ''}`}
              >
                {msg.role === 'assistant' ? <BotAvatar /> : <UserAvatar />}
                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply chips */}
          {showQuickReplies && (
            <div className={styles.quickReplies} aria-label="Quick reply suggestions">
              {QUICK_REPLIES.map(q => (
                <button key={q} className={styles.chip} onClick={() => handleQuickReply(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className={styles.inputBar}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question…"
              rows={1}
              aria-label="Type your message"
              disabled={isLoading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <svg className={styles.sendIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>

        </div>
      )}

      {/* ── Floating Toggle Button ── */}
      <button
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleBtnOpen : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
        aria-expanded={isOpen}
      >
        {/* Unread indicator */}
        {showDot && !isOpen && <span className={styles.unreadDot} aria-hidden="true" />}

        {/* Chat icon → X icon transition */}
        {isOpen ? (
          <svg className={styles.toggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className={styles.toggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default ChatWidget;