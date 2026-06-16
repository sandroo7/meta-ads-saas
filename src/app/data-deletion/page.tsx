export const metadata = { title: "Data Deletion — AutoAds" };

export default function DataDeletionPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-slate-700">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Data Deletion Instructions</h1>
      <p className="mb-6 text-sm text-slate-400">Last updated: 2026</p>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          You can request deletion of all data associated with your AutoAds account
          (your profile, your encrypted Meta connection, and your job history).
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">How to request deletion</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Send an email to <strong>tset@gmail.com</strong> with the subject
            &quot;Data deletion&quot; and the email address of your AutoAds account.
          </li>
          <li>We will delete your data within 30 days and confirm by email.</li>
        </ol>

        <p>
          You can also disconnect Meta at any time from your dashboard, which revokes
          our access to your Meta assets.
        </p>
      </div>
    </main>
  );
}
