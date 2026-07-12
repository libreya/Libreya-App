-- Run this once in the Supabase SQL editor to fix the live privacy policy.
-- Replaces the AdMob/mobile-app boilerplate with AdSense-accurate, cookie-disclosing content.
UPDATE public.app_settings
SET value = '
<h2>Privacy Notice for Libreya</h2>
<p><strong>Last Updated: July 2026</strong></p>

<h3>1. Identity and Contact Details</h3>
<p>Libreya ("we," "us," "our") is the data controller responsible for your personal information on libreya.app. For any privacy question or request, contact us at hello@libreya.app.</p>

<h3>2. Information We Collect</h3>
<p>We collect only what is needed to run the service:</p>
<ul>
<li><strong>Account Data:</strong> Email address, display name, and profile image, for registered users.</li>
<li><strong>Activity Data:</strong> Reading progress, favorites, and highlights — stored in your browser for guests, and synced to our database for registered users.</li>
<li><strong>Device and Usage Data:</strong> IP address, browser type, and general usage patterns, collected automatically for security and to serve relevant advertising.</li>
<li><strong>Cookies:</strong> We and our advertising and analytics partners use cookies and similar technologies. See Section 4.</li>
</ul>

<h3>3. Legal Basis for Processing (GDPR)</h3>
<p>We process your data based on:</p>
<ul>
<li><strong>Performance of a Contract:</strong> To provide the reading service you requested.</li>
<li><strong>Legitimate Interests:</strong> To prevent fraud, secure the site, and support the free, ad-supported service.</li>
<li><strong>Consent:</strong> For personalized advertising cookies, which you can withdraw at any time.</li>
</ul>

<h3>4. Cookies and Advertising</h3>
<p>Libreya is free to use and is supported by display advertising delivered through Google AdSense. Google and its advertising partners use cookies — including the DoubleClick/Google Ads cookie — to serve ads based on your visits to this and other websites. You can manage or opt out of personalized advertising using:</p>
<ul>
<li><a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a></li>
<li><a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">the Digital Advertising Alliance opt-out page</a></li>
<li><a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">Your Online Choices</a> (for visitors in the EU/UK)</li>
</ul>
<p>You can also block or delete cookies through your browser settings at any time. Doing so may affect some site functionality.</p>

<h3>5. Third-Party Sharing and Data Transfers</h3>
<p>We do not sell your personal information. We share data with:</p>
<ul>
<li><strong>Service Providers:</strong> Supabase, for authentication and database storage.</li>
<li><strong>Advertising Partners:</strong> Google AdSense, for displaying the ads that keep Libreya free.</li>
<li><strong>International Transfers:</strong> Data may be transferred to servers outside the EEA (e.g., the United States). We rely on Standard Contractual Clauses (SCCs) to safeguard these transfers.</li>
</ul>

<h3>6. Data Retention and Erasure</h3>
<p>We retain account data for as long as your account remains active. Guest activity data is stored locally in your browser and is removed if you clear your browser storage. Registered users can permanently delete their account and all associated data — highlights, favorites, and profile — at any time from their Profile page.</p>

<h3>7. Your Rights</h3>
<p>Depending on your location, you may have the right to:</p>
<ul>
<li>Access and receive a copy of the personal data we hold about you</li>
<li>Correct inaccurate personal information</li>
<li>Request deletion of your personal data</li>
<li>Object to, or opt out of, the use of your data for personalized advertising</li>
<li>Lodge a complaint with your local data protection authority</li>
</ul>
<p>To exercise any of these rights, contact us at hello@libreya.app.</p>

<h3>8. Children''s Privacy</h3>
<p>Libreya does not knowingly collect personal information from children under 13 (or the relevant age of consent in your jurisdiction). If we learn we have inadvertently collected such information, we will delete it promptly.</p>
'
WHERE key = 'privacy_notice';
