"use client";

import { useState } from "react";
import { Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate API call for Phase 1
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">Get in Touch</h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Have a question about styling, a product recommendation, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        <div>
          <h2 className="text-2xl font-heading text-foreground mb-6">Send us a message</h2>
          
          {status === 'success' ? (
            <div className="bg-[#F6EFEA] p-8 rounded-[var(--radius-card)] text-center border border-border">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-sage shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-heading text-foreground mb-2">Message Sent!</h3>
              <p className="text-muted">Thanks for reaching out. We'll get back to you within 24-48 hours.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm font-medium text-sage hover:text-foreground transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-sage/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-sage/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                <textarea 
                  id="message" 
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-[var(--radius-card)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-foreground text-white px-6 py-4 rounded-[var(--radius-button)] font-medium hover:bg-foreground/90 transition-colors disabled:opacity-70"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div>
          <div className="bg-accent/30 p-8 rounded-[var(--radius-card)] border border-border h-full">
            <h2 className="text-2xl font-heading text-foreground mb-8">Contact Information</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-sage">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-foreground mb-1">Email Us</h3>
                  <p className="text-muted text-sm mb-1">For general inquiries, collaborations, or support.</p>
                  <a href="mailto:hello@curvygirls.com" className="font-medium text-foreground hover:text-sage transition-colors">hello@curvygirls.com</a>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="font-heading text-lg text-foreground mb-4">Follow our journey</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-muted hover:text-sage shadow-sm transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-muted hover:text-sage shadow-sm transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21.31c-.34.34-1.22.42-2.38.1A12.08 12.08 0 0 1 5.92 8.7c-.32-1.16-.24-2.04.1-2.38a1 1 0 0 1 1.4-.04l3.12 3.12a1 1 0 0 1-.04 1.4l-1.33 1.33a8 8 0 0 0 7.37 7.37l1.33-1.33a1 1 0 0 1 1.4-.04l3.12 3.12a1 1 0 0 1-.04 1.4Z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
