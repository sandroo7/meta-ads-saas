export const metadata = { title: "Privacy Policy — AutoAds" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-slate-700">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mb-6 text-sm text-slate-400">Last updated: 2026</p>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          AutoAds (&quot;the Service&quot;) helps users create and upload advertisements
          to Meta (Facebook &amp; Instagram) through the Meta Marketing API. This
          policy explains what we collect and how we use it.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">Information we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your account email and authentication data (via Supabase).</li>
          <li>
            A Meta access token you authorize, stored <strong>encrypted</strong> and used
            only to manage the ad assets you choose.
          </li>
          <li>The ad content you submit (text, images, videos) to create your ads.</li>
        </ul>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">How we use it</h2>
        <p>
          We use your data solely to provide the Service: authenticating you and
          creating the ads you request in your own Meta ad accounts. We do not sell
          your data or use it for advertising to you.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">Data sharing</h2>
        <p>
          Data is shared only with the providers needed to run the Service: Meta
          (to create your ads), Supabase (database/auth) and our hosting providers.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">Data retention &amp; deletion</h2>
        <p>
          You can disconnect Meta or delete your account at any time. To request
          deletion of your data, see our{" "}
          <a href="/data-deletion" className="text-indigo-600 hover:underline">
            data deletion page
          </a>
          .
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">Contact</h2>
        <p>For any privacy question, contact: snavarroc1912@gmail.com</p>
      </div>
    </main>
  );
}
