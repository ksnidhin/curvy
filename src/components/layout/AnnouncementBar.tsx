import { settingsRepository } from "@/lib/repositories/settings.repository";

export async function AnnouncementBar() {
  const settings = await settingsRepository.getSiteSettings();
  const text = settings?.announcementText || "Honest picks. Handpicked for you.";

  if (!text) return null;

  return (
    <div className="bg-[#F6EFEA] text-center py-2 px-4 text-xs text-muted flex items-center justify-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span>{text}</span>
    </div>
  );
}
