import React from "react";
import { SocialIcon } from "@/components/SocialIcon";
import { profile } from "@/data/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact for Hardware and IoT Projects",
  description:
    "Contact Ahmed Asl about hardware prototypes, IoT products, embedded systems, robotics, connected products, mechatronics, or engineering collaboration.",
  pathname: "/contact/"
});

export default function ContactPage() {
  return (
    <section className="contact-page shell asl-page asl-brief">
      <div className="contact-lead">
        <p className="eyebrow">Project brief / reply within two working days</p>
        <h1>Bring me the problem, even if the solution is not clear yet.</h1>
        <p>
          Tell me what you are trying to build or fix, what already exists, and where
          you are stuck. I will tell you whether I can help and what the next useful
          step should be.
        </p>
      </div>

      <div className="contact-grid">
        <form
          className="contact-form"
          action={`https://formsubmit.co/${profile.email}`}
          method="POST"
        >
          <input type="hidden" name="_subject" value="New portfolio inquiry" />
          <input type="hidden" name="_captcha" value="false" />
          <label>
            <span>Name or organization</span>
            <input name="name" required placeholder="Your name" />
          </label>
          <label>
            <span>Email address</span>
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <div className="contact-field-grid">
            <label>
              <span>Work type</span>
              <select name="workType" defaultValue="Build a system">
                <option>Diagnose a fault</option>
                <option>Build a system</option>
                <option>Review and harden</option>
                <option>Technical education</option>
              </select>
            </label>
            <label>
              <span>Domain</span>
              <select name="domain" defaultValue="Embedded systems">
                <option>Embedded systems</option>
                <option>Electronics</option>
                <option>IoT and connected products</option>
                <option>Robotics</option>
                <option>Applied AI</option>
                <option>Security</option>
              </select>
            </label>
          </div>
          <label>
            <span>Timeline</span>
            <select name="timeline" defaultValue="This month">
              <option>Urgent diagnosis</option>
              <option>This month</option>
              <option>Next quarter</option>
              <option>Exploring the scope</option>
            </select>
          </label>
          <label>
            <span>Project brief</span>
            <textarea
              name="details"
              required
              rows={8}
              placeholder="Describe the system, constraints, current state, and desired result."
            />
          </label>
          <label>
            <span>Project links</span>
            <input
              name="links"
              type="url"
              placeholder="Repository, logs, scope captures, or documentation"
            />
          </label>
          <button className="button primary" type="submit">
            Send your project brief
          </button>
        </form>

        <aside className="contact-aside">
          <div className="contact-aside-heading">
            <span className="mono">01 / NONTECHNICAL CLIENT</span>
            <p>Use the form for a structured project brief. It helps me understand the business goal and constraints before we talk.</p>
          </div>
          
          <div className="contact-aside-heading" style={{ marginTop: '2rem' }}>
            <span className="mono">02 / TECHNICAL COLLABORATOR</span>
            <p>If you are an engineer, researcher, or recruiter, you can bypass the form and reach out directly.</p>
          </div>
          <div>
            <div className="contact-socials">
              <a href={`mailto:${profile.email}`} aria-label="Email Ahmed directly">
                <span className="social-link-text">Email directly</span>
              </a>
              <a href={profile.whatsapp} target="_blank" rel="noreferrer" aria-label="Message Ahmed on WhatsApp">
                <span className="social-link-text">Message on WhatsApp</span>
              </a>
            </div>
          </div>
          <div>
            <div className="contact-socials">
              <a href={profile.cv} target="_blank" rel="noreferrer" aria-label="Open CV for employment evaluation">
                <span className="social-link-text">Open CV</span>
              </a>
              <a href={profile.scholar} target="_blank" rel="noreferrer" aria-label="Open Google Scholar for academic evaluation">
                <span className="social-link-text">Open Publications</span>
              </a>
            </div>
          </div>
          <div>
            <div className="contact-socials">
              {profile.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${social.label} profile (opens in a new tab)`}
                >
                  <SocialIcon label={social.label} />
                  <span className="social-link-text">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
          <p className="availability-note" style={{ marginTop: '2rem' }}>
            <span className="status-dot" aria-hidden="true" />
            {profile.availability}
          </p>
        </aside>
      </div>
    </section>
  );
}
