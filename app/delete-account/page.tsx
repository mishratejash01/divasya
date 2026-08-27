import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete your account · Divasya",
  description: "How to permanently delete your Divasya account and data.",
};

export default function DeleteAccount() {
  return (
    <main style={{ background: "#FFF9EF", minHeight: "100vh", color: "#241D14" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 80px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Delete your Divasya account</h1>
        <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: "#4A4237" }}>
          Deleting your account is permanent. It removes your profile, birth details, japa
          history and streaks, wallet ledger, puja and store order history, chats, and vastu
          data, and closes your sign-in account. This cannot be undone.
        </p>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>Delete inside the app</h2>
        <ol style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.9, color: "#4A4237" }}>
          <li>Open Divasya and go to the <b>Account</b> tab</li>
          <li>Tap <b>Edit profile</b></li>
          <li>Scroll to the bottom and tap <b>Delete account</b></li>
          <li>Tap it again to confirm. Your data is removed immediately.</li>
        </ol>

        <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>Or request deletion by email</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4A4237" }}>
          Email <a href="mailto:divasya.app@gmail.com" style={{ color: "#B4560F" }}>divasya.app@gmail.com</a>{" "}
          from the Google email address you sign in with, with the subject &quot;Delete my account&quot;.
          We complete emailed requests within 7 days.
        </p>

        <p style={{ marginTop: 28, fontSize: 13, lineHeight: 1.7, color: "#8A7E6C" }}>
          Note: records of completed payments may be retained by our payment processor,
          Razorpay, where Indian law requires it. See our{" "}
          <a href="/privacy" style={{ color: "#B4560F" }}>Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
