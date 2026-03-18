import React from "react";
import { footerStyles } from "../assets/dummyStyles";
import { FaApplePay, FaCcAmex, FaCcMastercard, FaCcPaypal, FaCcVisa, FaEnvelope, FaFacebookF, FaInstagram, FaMapMarkedAlt, FaPhone, FaTwitter, FaYoutube } from "react-icons/fa";
import { FiBookmark, FiLink, FiMail } from "react-icons/fi";
import { BsTelephone } from "react-icons/bs";
import { BiMailSend } from 'react-icons/bi'

const Footer = () => {
  const socialLinks = [
    {
      icon: FaFacebookF,
      url: "https://www.facebook.com/",
    },
    {
      icon: FaTwitter,
      url: "https://twitter.com/",
    },
    {
      icon: FaInstagram,
      url: "https://www.instagram.com/",
    },
    {
      icon: FaYoutube,
      url: "https://www.youtube.com/",
    },
  ];

  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.topBorder} />

      <div
        className={`${footerStyles.floatingShape} -top-24 -right-24 w-80 h-80 opacity-20`}
      ></div>
      <div
        className={`${footerStyles.floatingShape} -bottom-40 -left-24 w-96 h-96 opacity-15 animation-delay-2000`}
      ></div>
      <div
        className={`${footerStyles.floatingShape} top-1/4 left-1/3 w-64 h-64 bg-emerald-600 opacity-10 animate-pulse animation-delay-1000`}
      ></div>

      <div className={footerStyles.container}>
        <div className={footerStyles.grid}>
            {/* brand */}
            <div>
                <h2 className={footerStyles.brandTitle}>
                    RUSH<span className={footerStyles.brandSpan}>BASKET</span>
                </h2>
                <p className={footerStyles.brandText}>
                    Bringing you the freshest organic produce since 202. Our mission is to deliver farm-fresh 
                    goodness straight to your doorsteps.
                </p>

                <div className="space-x-3 flex">
                    {socialLinks.map((social, idx) => (
                        <a href={social.url} key={idx}
                        target="_blank" aria-label={`Visit our ${social.icon.name.replace('fa', '')} page`}
                        className={footerStyles.socialLink}>
                            <social.icon className={footerStyles.socialIcon}></social.icon>
                        </a>
                    ))}
                </div>
            </div>
            
            {/* quick links */}
            <div>
                <h3 className={footerStyles.sectionTitle}>
                    <FiLink className={footerStyles.sectionIcon} /> Quick Links
                </h3>
                <ul className={footerStyles.linkList}>
                    {['Home', 'Items', 'Contact'].map((item, idx) => (
                        <li key={idx}>
                            <a href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            
                            className={footerStyles.linkItem}>
                            <span className={footerStyles.linkBullet}></span>
                            {item}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* contact info */}
            <div>
                <h3 className={footerStyles.sectionTitle}>
                    <BsTelephone className= {footerStyles.sectionIcon} />Cotact Us
                </h3>
                <ul className="space-y-4 text-sm sm:text-base">
                    <li className={footerStyles.contactItem}>
                        <div className={footerStyles.contactIconContainer}>
                            <FaMapMarkedAlt className={footerStyles.contactIcon} />
                        </div>
                        <div>
                            <p>123 almansora egypt</p>
                        </div>
                    </li>

                    <li className={footerStyles.contactItem}>
                        <div className={footerStyles.contactIconContainer}>
                            <FaPhone className={footerStyles.contactIcon} />
                        </div>
                        <div>
                            <p>+2011271234</p>
                        </div>
                    </li>

                    <li className={footerStyles.contactItem}>
                        <div className={footerStyles.contactIconContainer}>
                            <FaEnvelope className={footerStyles.contactIcon} />
                        </div>
                        <div>
                            <p>albasuonyh@gmail.com</p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* newslater */}
            <div>
                <h3 className={footerStyles.sectionTitle}>
                    <FiMail className={footerStyles.sectionIcon} /> NewsLetter
                </h3>
                <p className={footerStyles.newsletterText}>
                    Subsvribe to our newsletter for fresh updates, exclusive offers, 
                    and seasonal recipes!
                </p>
                <div className={footerStyles.newsletterForm}>
                    <input type="email" placeholder="Enter Email Adress" 
                    className={footerStyles.newsletterInput}/>

                    <button className={footerStyles.newsletterButton}>
                        <BiMailSend className='mr-2 text-lg' />
                        <span className="cursor-pointer">Subscibe</span>
                    </button>
                </div>
                <p className={footerStyles.privacyText}>
                    We respect your praivacy. unsubscribe at any time.
                </p>
            </div>
        </div>

        {/* payment methods */}
        <div className={footerStyles.paymentSection}>
            <h4 className={footerStyles.paymentTitle}>
                <FiBookmark className={footerStyles.paymentIcon} /> We Accept All Major Payment Method
            </h4>

            <div className={footerStyles.paymentMethods}>
                {[FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex, FaApplePay].map((Icon, idx) => (
                    <div key={idx} className={footerStyles.paymentItem}>
                        <Icon className={footerStyles.paymentIcon} />
                    </div>
                ))}
            </div>
        </div>

        {/* hr */}
        <div className={footerStyles.attribution}>
            <div className={footerStyles.attributionBadge}>
                <div className={footerStyles.hexagonContainer}>

                    <div className={footerStyles.hexagon}></div>

                    <div className={footerStyles.hexagonInner}>
                        <div className={footerStyles.hexagonInnerShape} />
                    </div>
                </div>
                <span className={footerStyles.attributionText}>
                    Dscigned By{' '}
                    <a href="" 
                    target="_blank"
                    className={footerStyles.attributionLink}>
                        albasuony
                    </a>
                </span>
            </div>
        </div>
      </div>

      <style>{footerStyles.customCSS}</style>
    </footer>
  );
};

export default Footer;