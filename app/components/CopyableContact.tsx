'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/;
const FEEDBACK_DURATION_MS = 2000;
const INSTAGRAM_URL = 'https://www.instagram.com/coleferguson/';

function InstagramContact({ value }: { value: string }) {
  const lines = value.split('\n');

  return (
    <>
      {lines.map((line, index) => {
        const label = line.trim();
        const isInstagram =
          label.toLowerCase() === '@coleferguson' ||
          /(?:www\.)?instagram\.com\/coleferguson\/?/i.test(label);

        return (
          <span key={`${line}-${index}`}>
            {isInstagram ? (
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="cursor-pointer underline decoration-transparent underline-offset-2 transition-[text-decoration-color] duration-150 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label="Cole Ferguson on Instagram"
              >
                {label}
              </a>
            ) : (
              line
            )}
            {index < lines.length - 1 ? '\n' : null}
          </span>
        );
      })}
    </>
  );
}

export function CopyableContact({
  contact,
  lowerEmailOnDesktop = false,
}: {
  contact: string;
  lowerEmailOnDesktop?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const email = useMemo(() => contact.match(EMAIL_PATTERN)?.[0] ?? '', [contact]);
  const remainingContact = email
    ? contact.replace(email, '').replace(/^\s+/, '')
    : contact;

  useEffect(
    () => () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    },
    []
  );

  const copyEmail = async () => {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
      resetTimer.current = window.setTimeout(() => {
        setCopied(false);
        resetTimer.current = null;
      }, FEEDBACK_DURATION_MS);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span className="whitespace-pre-line">
      {email && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void copyEmail();
            }}
            className={`relative inline-grid cursor-copy text-left underline decoration-transparent underline-offset-2 transition-[text-decoration-color] duration-150 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 ${
              lowerEmailOnDesktop ? 'xl:translate-y-[18px]' : ''
            }`}
            aria-label={`Copy ${email}`}
          >
            <span className="invisible col-start-1 row-start-1" aria-hidden="true">
              {email}
            </span>
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={copied ? 'copied' : 'email'}
                className="absolute left-0 top-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                {copied ? 'Copied' : email}
              </motion.span>
            </AnimatePresence>
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? `${email} copied to clipboard` : ''}
          </span>
        </>
      )}
      {remainingContact && (
        <>
          {email ? '\n' : null}
          <InstagramContact value={remainingContact} />
        </>
      )}
    </span>
  );
}
