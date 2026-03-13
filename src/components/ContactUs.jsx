import React, { useState } from "react";
import contactStyles from "../assets/dummyStyles";
import { FaCheck, FaComment, FaEnvelope, FaPaperPlane, FaPhone, FaTag, FaUser } from 'react-icons/fa'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [showToast, setShowToast] = useState(false);

  const whatsappNumber = "01011271243";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // web api whatsapp
  const handleSubmit = (e) => {
  e.preventDefault();
  const { name, email, phone, subject, message } = formData;

  if (!name || !email || !phone || !subject || !message) {
    alert("Please fill in all fields");
    return;
  }

  // 1. تجهيز الرسالة بشكل احترافي
  const text = 
    `*New Order Inquiry* \n\n` +
    `*Name:* ${name}\n` +
    `*Email:* ${email}\n` +
    `*Phone:* ${phone}\n` +
    `*Subject:* ${subject}\n\n` +
    `*Message:* \n${message}`;

  // 2. استخدام رقم بكود الدولة وبدون أصفار زيادة
  const whatsappNumber = "201011271243"; 

  // 3. استخدام رابط wa.me للعمل على كل الأجهزة
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

  // 4. فتح الرابط
  window.open(url, "_blank");


    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };
  return (
      <div className={contactStyles.pageContainer}>
        {showToast && (
            <div className="toast-notificattion">
                <div className={contactStyles.toast}>
                    <FaCheck className='mr-2' />
                    Message opened in whatsapp
                </div>
            </div>
        )}

        {/* centere container */}
        <div className={contactStyles.centeredContainer}>
            <div className={contactStyles.headingContainer}>
                <h1 className={contactStyles.heading}>
                    Contact FreshGrocres
                </h1>
                <div className={contactStyles.divider} />
            </div>
            <br />

            {/* contavt area */}
            <div className={contactStyles.contactFormContainer}>
                <div className="absolute inset-0 bg-emerald-900 bg-opacity-90 backdrop-blur-sm z-0"></div>

                <form onSubmit={handleSubmit} className={contactStyles.form}>
                    
                    <div className={contactStyles.formField}>
                        <div className={contactStyles.inputContainer}>
                            <div className={contactStyles.inputIconContainer}>
                                <FaUser className={contactStyles.inputIcon} />
                            </div>
                            <input type="text" id="name" name="name" value={formData.name}
                            onChange={handleChange} className={contactStyles.formInput}
                            placeholder="hossam albasuony" required />
                        </div>
                    </div>

                    <div className={contactStyles.formField}>
                        <div className={contactStyles.inputContainer}>
                            <div className={contactStyles.inputIconContainer}>
                                <FaEnvelope className={contactStyles.inputIcon} />
                            </div>
                            <input type="email" id="email" name="email" value={formData.email}
                            onChange={handleChange} className={contactStyles.formInput}
                            placeholder="biso@example.com" required />
                        </div>
                    </div>

                    <div className={contactStyles.formField}>
                        <div className={contactStyles.inputContainer}>
                            <div className={contactStyles.inputIconContainer}>
                                <FaPhone className={contactStyles.inputIcon} />
                            </div>
                            <input type="tel" id="phone" name="phone" value={formData.phone}
                            onChange={handleChange} className={contactStyles.formInput}
                            placeholder="123-456-789" required />
                        </div>
                    </div>

                    <div className={contactStyles.formField}>
                        <div className={contactStyles.inputContainer}>
                            <div className={contactStyles.inputIconContainer}>
                                <FaTag className={contactStyles.inputIcon} />
                            </div>
                            <input type="text" id="subject" name="subject" value={formData.subject}
                            onChange={handleChange} className={contactStyles.formInput}
                            placeholder="Order Inquiry" required />
                        </div>
                    </div>

                    <div className={contactStyles.formField}>
                        <div className={contactStyles.inputContainer}>
                            <div className={contactStyles.inputIconContainer}>
                                <FaComment className={contactStyles.inputIcon} />
                            </div>
                            <textarea name="message" id="message" rows='5' 
                            value={formData.message} onChange={handleChange}
                            className={contactStyles.formTextarea} placeholder="Type your message her..."
                            required></textarea>
                        </div>
                    </div>
                    {/* submit btn */}
                    <button type="submit" className={contactStyles.submitButton}>
                        <span className={contactStyles.submitButtonText}>
                            Send Message
                        </span>
                        <FaPaperPlane className="h-5 w-5 text-black" />
                    </button>
                </form>
            </div>
        </div>

        <style>{contactStyles.customCSS}</style>
      </div>
  )
};

export default ContactUs;
