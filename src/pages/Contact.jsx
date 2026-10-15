import { useState, useEffect } from 'react';
import { MessageSquare, Mail, MapPin, Clock, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../config/api';
import Footer from '../components/Layout/Footer';

export default function Contact() {
  const showToast = useCartStore((state) => state.showToast);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    orderNumber: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Page khulte hi smoothly top par scroll kare
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Real MongoDB API Submit Call
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        showToast('Inquiry sent. Our concierge will contact you within 24 hours.');
        setFormData({
          name: '',
          email: '',
          subject: 'General Inquiry',
          orderNumber: '',
          message: '',
        });
      } else {
        showToast(data.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting contact form:', err);
      showToast('Connection error. Ensure backend server is running on port 5001.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Universal Mail Handler: Mobile app + Desktop Web Gmail + Clipboard Fallback
  const handleEmailDispatch = (e) => {
    if (e) e.preventDefault();
    const targetEmail = 'concierge@aurastudio.com';
    const emailSubject = encodeURIComponent('Inquiry Regarding AURA Studio');
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `mailto:${targetEmail}?subject=${emailSubject}`;
    } else {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${emailSubject}`,
        '_blank',
        'noopener,noreferrer'
      );
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetEmail);
    }
    showToast('Opening mail composer & copied email to clipboard');
  };

  return (
    <div className="pt-2 bg-[#F9F9F8] min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white relative w-full overflow-x-hidden">
      <main className="w-full px-6 sm:px-12 lg:px-20 pt-6 pb-24 max-w-6xl mx-auto space-y-16">
        
        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold block">
            Client Concierge & Atelier
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-neutral-900 uppercase">
            CONTACT US
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed pt-2">
            Whether inquiring about bespoke sizing, order tracking, or styling consultations, our atelier concierge is at your service.
          </p>
        </section>

        {/* Quick Channels Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Direct WhatsApp Concierge */}
          <div className="group bg-white border border-neutral-200 p-6 rounded-sm hover:border-neutral-900 transition-colors duration-300 flex h-full flex-col items-center text-center">
            <a
              href="https://wa.me/923087300960?text=Hello%20AURA%2C%20I%20would%20like%20to%20inquire%20about%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors"
              aria-label="Open WhatsApp concierge"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            <div className="flex flex-1 flex-col items-center space-y-3 mt-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900">
                WhatsApp Concierge
              </h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Direct live chat for immediate styling advice, order queries, and private capsule reservations.
              </p>
            </div>

            <a
              href="https://wa.me/923087300960?text=Hello%20AURA%2C%20I%20would%20like%20to%20inquire%20about%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 text-[10px] uppercase tracking-widest font-bold text-neutral-900 flex items-center justify-center space-x-1"
            >
              <span>Open WhatsApp Chat</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </a>
          </div>

          {/* Email Support */}
          <div className="group bg-white border border-neutral-200 p-6 rounded-sm hover:border-neutral-900 transition-colors duration-300 flex h-full flex-col items-center text-center">
            <button
              type="button"
              onClick={handleEmailDispatch}
              className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors cursor-pointer"
              aria-label="Email concierge"
            >
              <Mail className="w-4 h-4" />
            </button>

            <div className="flex flex-1 flex-col items-center space-y-3 mt-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900">
                Email Dispatch
              </h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Send official press inquiries, global logistics requests, or detailed feedback directly to our desk.
              </p>
            </div>

            <button
              type="button"
              onClick={handleEmailDispatch}
              className="mt-6 text-[10px] uppercase tracking-widest font-bold text-neutral-900 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>concierge@aurastudio.com</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </button>
          </div>

          {/* Atelier Hours */}
          <div className="bg-white border border-neutral-200 p-6 rounded-sm flex h-full flex-col items-center text-center">
            <div className="flex flex-1 flex-col items-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900">
                Studio Schedule
              </h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Monday – Saturday: 10:00 AM – 8:00 PM<br />
                Sunday: Private Appointments Only
              </p>
            </div>
            <span className="mt-6 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              Average response: under 2 hours
            </span>
          </div>

        </section>

        {/* Main Section: Form (Left) & Studio Details (Right) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 p-8 sm:p-10 rounded-sm">
            <div className="mb-8 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Inquiry Form</span>
              <h2 className="text-2xl font-light uppercase tracking-wider text-neutral-900">
                SEND A MESSAGE
              </h2>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-neutral-900 mx-auto" />
                <h3 className="text-lg font-light uppercase tracking-wider text-neutral-900">Message Received</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to AURA. An atelier representative has received your correspondence and will reply shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 inline-block text-[10px] uppercase tracking-widest font-bold underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-[10px] uppercase tracking-widest font-bold text-neutral-700">
                      Full Name *
                    </label>
                    <input 
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full bg-[#F9F9F8] border border-neutral-200 px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 rounded-xs"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-[10px] uppercase tracking-widest font-bold text-neutral-700">
                      Email Address *
                    </label>
                    <input 
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full bg-[#F9F9F8] border border-neutral-200 px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 rounded-xs"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Subject Dropdown */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-[10px] uppercase tracking-widest font-bold text-neutral-700">
                      Topic / Department
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-[#F9F9F8] border border-neutral-200 px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-xs"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order & Tracking">Order & Tracking</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                      <option value="Bespoke Sizing & Styling">Bespoke Sizing & Styling</option>
                      <option value="Press & Collaborations">Press & Collaborations</option>
                    </select>
                  </div>

                  {/* Order Number (Optional) */}
                  <div className="space-y-2">
                    <label htmlFor="orderNumber" className="block text-[10px] uppercase tracking-widest font-bold text-neutral-700">
                      Order Number (Optional)
                    </label>
                    <input 
                      id="orderNumber"
                      name="orderNumber"
                      type="text"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      placeholder="#AUR-8291"
                      className="w-full bg-[#F9F9F8] border border-neutral-200 px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 rounded-xs"
                    />
                  </div>

                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-[10px] uppercase tracking-widest font-bold text-neutral-700">
                    Your Message *
                  </label>
                  <textarea 
                    id="message"
                    name="message"
                    rows="5"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can assist you..."
                    className="w-full bg-[#F9F9F8] border border-neutral-200 px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 rounded-xs resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 text-white py-3.5 sm:py-4 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 text-center cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Saving to Database...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Correspondence</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Studio Presence & FAQs (Right Column) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Headquarters Card */}
            <div className="bg-white border border-neutral-200 p-8 rounded-sm space-y-6 text-center">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-semibold">Physical Presence</span>
                <h3 className="text-xl font-light uppercase tracking-[0.15em] text-neutral-900">
                  FLAGSHIP ATELIER
                </h3>
              </div>

              <div className="space-y-5 text-[15px] text-neutral-600 font-light leading-relaxed">
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <MapPin className="w-5 h-5 text-neutral-900" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">AURA Design House</p>
                    <p>44 Boulevard des Capucines, Atelier 4B</p>
                    <p>Paris / Global Shipping Hub</p>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-5">
                  <p className="text-sm font-semibold text-neutral-900 mb-2">
                    Private Consultations
                  </p>
                  <p className="text-[15px] text-neutral-500 leading-relaxed">
                    Appointments for private trunk shows and silhouette fittings are arranged by invitation or through our WhatsApp concierge.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Support FAQ Card */}
            <div className="bg-white border border-neutral-200 p-8 rounded-sm space-y-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <HelpCircle className="w-4 h-4 text-neutral-900" />
                <h4 className="text-xs uppercase tracking-widest font-bold text-neutral-900">
                  Common Inquiries
                </h4>
              </div>

              <ul className="space-y-3 text-xs text-neutral-600 font-light text-center">
                <li className="border-b border-neutral-100 pb-2">
                  <p className="font-medium text-neutral-900">How long does shipping take?</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">Complimentary express delivery takes 3–5 business days internationally.</p>
                </li>
                <li className="border-b border-neutral-100 pb-2">
                  <p className="font-medium text-neutral-900">What is the return policy?</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">Items may be returned in pristine, unworn condition within 14 calendar days.</p>
                </li>
                <li>
                  <p className="font-medium text-neutral-900">Need immediate order status?</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">Reach out on WhatsApp with your Order ID for instant lookup.</p>
                </li>
              </ul>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}