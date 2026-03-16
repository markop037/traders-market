"use client";

import { useState } from "react";

export default function PrivacyPolicy() {
  const [copied, setCopied] = useState(false);
  const emailAddress = "admin@tradersmarket.io";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816]">
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-8">
            Privacy Policy
          </h1>
          
          <p className="text-gray-400 mb-8">
            Last Updated: August 15, 2025
          </p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              This privacy policy has been compiled to better serve those who are concerned with how
              their 'Personally identifiable information' (PII) is being used online. PII, as used in US
              privacy law and information security, is information that can be used on its own or with
              other information to identify, contact, or locate a single person, or to identify an individual
              in context. Please read our privacy policy carefully to get a clear understanding of how we
              collect, use, protect or otherwise handle your Personally Identifiable Information in
              accordance with our website.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              What personal information do we collect from the people that visit our blog, website or
              app?
            </h2>
            <p>
              When contacting us on our site, you may be asked to enter your name, email address,
              phone number or other details to help you with your experience.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              When do we collect information?
            </h2>
            <p>
              We collect information from you when you fill out a form or enter information on our site.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              How do we use your information
            </h2>
            <p>
              We may use the information we collect from you when you register, make a purchase, sign
              up for our newsletter, respond to a survey or marketing communication, surf the website,
              or use certain other site features in the following ways:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To personalize user's experience and to allow us to deliver the type of content and
              product offerings in which you are most interested.</li>
              <li>To improve our website in order to better serve you.</li>
              <li>To allow us to better service you in responding to your customer service requests.</li>
              <li>To administer a contest, promotion, survey or other site feature.</li>
              <li>To send periodic emails regarding your order or other products and services.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              How do we protect visitor information?
            </h2>
            <p>
              We do not use vulnerability scanning and/or scanning to PCI standards.
            </p>
            <p>
              We do not use Malware Scanning.
            </p>
            <p>
              We do not use an SSL certificate.
            </p>
            <p>
              We only provide articles and information on our website. Other than your contact
              information for the specific purposes of responding to your inquiry, we never ask for
              personal or private information.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              Do we use cookies?
            </h2>
            <p>
              Yes. Cookies are small files that a site or its service provider transfers to your computer's
              hard drive through your Web browser (if you allow) that enables the site's or service
              provider's systems to recognize your browser and capture and remember certain
              information. For instance, we use cookies to help us understand your preferences based
              on previous or current site activity, which enables us to provide you with improved
              services. We also use cookies to help us compile aggregate data about site traffic and site
              interaction so that we can offer better site experiences and tools in the future.
            </p>
            <p>
              We use cookies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Understand and save user's preferences for future visits.</li>
              <li>Keep track of advertisements.</li>
              <li>Compile aggregate data about site traffic and site interactions in order to offer
              better site experiences and tools in the future. We may also use trusted third party
              services that track this information on our behalf.</li>
            </ul>
            <p>
              You can choose to have your computer warn you each time a cookie is being sent,
              or you can choose to turn off all cookies. You do this through your browser (like
              Internet Explorer) settings. Each browser is a little different, so look at your
              browser's Help menu to learn the correct way to modify your cookies.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              If users disable cookies in their browser:
            </h2>
            <p>
              If you disable cookies off, some features will be disabled. It will turn off some of the
              features that make your site experience more efficient and some of our services will not
              function properly.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              Third Party Disclosure
            </h2>
            <p>
              We do not sell, trade, or otherwise transfer to outside parties your personally identifiable
              information unless we provide you with advance notice. This does not include website
              hosting partners and other parties who assist us in operating our website, conducting our
              business, or servicing you, so long as those parties agree to keep this information
              confidential. We may also release your information when we believe release is appropriate
              to comply with the law, enforce our site policies, or protect ours or others' rights, property,
              or safety. However, non-personally identifiable visitor information may be provided to
              other parties for marketing, advertising, or other uses.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              Third party links
            </h2>
            <p>
              Occasionally, at our discretion, we may include or offer third party products or services on
              our website. These third party sites have separate and independent privacy policies. We
              therefore have no responsibility or liability for the content and activities of these linked
              sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback
              about these sites.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              California Online Privacy Protection Act
            </h2>
            <p>
              CalOPPA is the first state law in the nation to require commercial websites and online
              services to post a privacy policy. The law's reach stretches well beyond California to
              require a person or company in the United States (and conceivably the world) that
              operates websites collecting personally identifiable information from California
              consumers to post a conspicuous privacy policy on its website stating exactly the
              information being collected and those individuals with whom it is being shared, and to
              comply with this policy. – See more at:
            </p>
            <p>
              <a 
                href="http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf
              </a>
            </p>
            <p>
              According to CalOPPA we agree to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users can visit our site anonymously.</li>
              <li>Once this privacy policy is created, we will add a link to it on our home page, or as a
              minimum on the first significant page after entering our website.</li>
              <li>Our Privacy Policy link includes the word 'Privacy', and can be easily be found on
              the page specified above.</li>
              <li>Users will be notified of any privacy policy changes:
              On our Privacy Policy Page</li>
              <li>Users are able to change their personal information:
              By emailing us</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              How does our site handle do not track signals?
            </h2>
            <p>
              We honor do not track signals and do not track, plant cookies, or use advertising when a
              Do Not Track (DNT) browser mechanism is in place.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              Does our site allow third party behavioral tracking?
            </h2>
            <p>
              It's also important to note that we do not allow third party behavioral tracking.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              COPPA (Children Online Privacy Protection Act)
            </h2>
            <p>
              When it comes to the collection of personal information from children under 13, the
              Children's Online Privacy Protection Act (COPPA) puts parents in control. The Federal
              Trade Commission, the nation's consumer protection agency, enforces the COPPA Rule,
              which spells out what operators of websites and online services must do to protect
              children's privacy and safety online. We do not specifically market to children under 13.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              Fair Information Practices
            </h2>
            <p>
              The Fair Information Practices Principles form the backbone of privacy law in the United
              States and the concepts they include have played a significant role in the development of
              data protection laws around the globe. Understanding the Fair Information Practice
              Principles and how they should be implemented is critical to comply with the various
              privacy laws that protect personal information.
            </p>
            <p>
              In order to be in line with Fair Information Practices we will take the following responsive
              action, should a data breach occur:
            </p>
            <p>
              We will notify the users via email:
            </p>
            <p>
              Whithin 7 bussiness days
            </p>
            <p>
              We also agree to the individual redress principle, which requires that individuals have a
              right to pursue legally enforceable rights against data collectors and processors who fail to
              adhere to the law. This principle requires not only that individuals have enforceable rights
              against data users, but also that individuals have recourse to courts or a government
              agency to investigate and/or prosecute non-compliance by data processors.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              CAN SPAM Act
            </h2>
            <p>
              The CAN-SPAM Act is a law that sets the rules for commercial email, establishes
              requirements for commercial messages, gives recipients the right to have emails stopped
              from being sent to them, and spells out tough penalties for violations.
            </p>
            <p>
              We collect your email address in order to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Send information, respond to inquiries, and/or other requests or questions.</li>
              <li>Market to our mailing list or continue to send emails to our clients after the original
              transaction has occurred</li>
            </ul>
            <p>
              To be in accordance with CANSPAM we agree to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>NOT use false, or misleading subjects or email addresses</li>
              <li>Identify the message as an advertisement in some reasonable way</li>
              <li>Include the physical address of our business or site headquarters</li>
              <li>Monitor third party email marketing services for compliance, if one is used</li>
              <li>Honor opt-out/unsubscribe requests quickly</li>
              <li>Allow users to unsubscribe by using the link at the bottom of each email</li>
            </ul>
            <p>
              If at any time you would like to unsubscribe from receiving future emails, you can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Follow the instructions at the bottom of each email and we will promptly remove
              you from ALL correspondence</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              CONTACTING US
            </h2>
            <p>
              If there are any questions regarding this privacy policy you may contact us using the
              information below.
            </p>
            <p>
              <a 
                href="/" 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                tradersmarket.io
              </a>
            </p>
            <p>
              Momentum Digital LLC<br />
              30 N Gould St Ste R, Sheridan, WY 82801, USA<br />
              <button
                onClick={handleCopyEmail}
                className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1 -mx-1 underline"
                title="Click to copy email address"
              >
                {emailAddress}
              </button>
              {copied && (
                <span className="ml-2 text-green-400 text-sm animate-fade-in">
                  (Copied!)
                </span>
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
