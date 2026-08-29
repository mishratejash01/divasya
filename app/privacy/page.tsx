import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Divasya",
  description: "How Divasya collects, uses, and protects your information.",
};

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginTop: 28 }}>
    <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{title}</h2>
    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#4A4237" }}>{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <main style={{ background: "#FFF9EF", minHeight: "100vh", color: "#241D14" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 80px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Privacy Policy</h1>
        <p style={{ marginTop: 6, fontSize: 13, color: "#8A7E6C" }}>
          Divasya · Sanatani Vibes Private Limited, Hyderabad, India · Effective 27 August 2026
        </p>

        <S title="Who we are">
          Divasya is a spiritual companion app operated by Sanatani Vibes Private Limited
          (&quot;we&quot;, &quot;us&quot;). This policy explains what information the Divasya app and
          website collect, why, and the choices you have. It applies to the Divasya mobile app
          and the website.
        </S>

        <S title="What we collect">
          <ul style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
            <li><b>Account:</b> your name and email address from Google Sign-In. We never see your Google password.</li>
            <li><b>Birth details:</b> date, time, and place of birth, if you provide them, used only to compute your kundli, rashi, and nakshatra.</li>
            <li><b>Phone number:</b> only when you book a puja or chadhava, used to fulfil the ritual and send its updates on WhatsApp.</li>
            <li><b>Orders and wallet:</b> your order history and wallet ledger inside Divasya. Card, UPI, and banking details are handled entirely by Razorpay; we never receive or store them.</li>
            <li><b>Usage:</b> japa counts, streaks, and basic in-app activity, kept to power your own progress screens.</li>
            <li><b>Camera:</b> the Vastu Lens uses your camera live on the device. No photos or video are recorded, stored, or uploaded.</li>
          </ul>
        </S>

        <S title="How we use it">
          To sign you in, compute your astrological details, deliver pujas, chadhava, and
          store orders, maintain your wallet, and show your own activity back to you. We do
          not sell personal data, and we do not show third-party ads.
        </S>

        <S title="Who we share it with">
          Only what each service needs to do its job: <b>Supabase</b> hosts our database;
          <b> Google</b> provides sign-in; <b>Razorpay</b> processes payments; <b>DevPunya</b>,
          our temple-services partner, receives the devotee name, gotra, sankalp names, and
          phone number for a puja you book so the ritual can be performed; <b>Cloudinary </b>
          delivers images; live darshan streams are played through <b>YouTube</b>. We share
          nothing with anyone else.
        </S>

        <S title="How long we keep it">
          For as long as your account exists. Payment records may also be retained by
          Razorpay as required by Indian law.
        </S>

        <S title="Deleting your account">
          You can permanently delete your account and data at any time, inside the app under
          Account, or by following the steps at{" "}
          <a href="/delete-account" style={{ color: "#B4560F" }}>the account deletion page</a>.
          Deletion removes your profile, birth details, japa history, wallet ledger, bookings,
          chats, and vastu data, and closes your sign-in account.
        </S>

        <S title="Children">
          Divasya is a general-audience app and is not directed at children under 13.
        </S>

        <S title="Changes and contact">
          If this policy changes, the new version will be published at this address with a new
          effective date. Questions or requests:{" "}
          <a href="mailto:divasya.app@gmail.com" style={{ color: "#B4560F" }}>divasya.app@gmail.com</a>.
        </S>
      </div>
    </main>
  );
}
