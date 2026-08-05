"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/app/actions";

export function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const { success } = await subscribeToNewsletter(email);
      if (success) {
        setStatus('success');
        setEmail("");
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#F9F6F0]">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-6 shadow-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">
          Every pick is chosen with<br />care, for real bodies<br />and real women.
        </h2>
        
        <p className="text-muted mb-8 max-w-md mx-auto">
          Join our newsletter for weekly curated looks, styling tips, and honest reviews delivered to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-[var(--radius-button)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-sage/50"
            required
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 rounded-[var(--radius-button)] bg-foreground text-white font-medium hover:bg-foreground/90 transition-colors disabled:opacity-70"
          >
            {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Subscribe'}
          </button>
        </form>
        
        {status === 'success' && (
          <p className="text-sage text-sm mt-4 font-medium">
            Thank you! You're on the list.
          </p>
        )}
        {status === 'error' && (
          <p className="text-rose text-sm mt-4">
            You might already be subscribed, or something went wrong.
          </p>
        )}
      </div>
    </section>
  );
}
