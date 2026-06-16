export const metadata = { title: "Terms of Service — AutoAds" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-slate-700">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mb-6 text-sm text-slate-400">Last updated: 2026</p>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          By using AutoAds (&quot;the Service&quot;) you agree to these terms. The
          Service lets you create and upload ads to your own Meta (Facebook &amp;
          Instagram) ad accounts via the Meta Marketing API.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">Your responsibilities</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>You must have the right to manage the Meta assets you connect.</li>
          <li>You are responsible for the content of the ads you create.</li>
          <li>You agree to comply with Meta&apos;s advertising policies and terms.</li>
        </ul>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">No warranty</h2>
        <p>
          The Service is provided &quot;as is&quot;, without warranties. We are not
          liable for ad spend, ad rejections, or actions taken on your Meta accounts.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">Contact</h2>
        <p>Questions: snavarroc1912@gmail.com</p>
      </div>
    </main>
  );
}
