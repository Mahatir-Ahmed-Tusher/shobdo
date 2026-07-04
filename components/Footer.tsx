'use client';
import { useState } from 'react';
import InfoModal from './InfoModal';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const close = () => setActiveModal(null);

  return (
    <>
      <footer className="w-full bg-[#FFFFFF] border-t border-[#F2EFE9] py-6 px-4 md:px-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#8C877D]">
            &copy; {new Date().getFullYear()} Shobdo. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#8C877D]">
            <button onClick={() => setActiveModal('about')} className="hover:text-red-600 transition-colors">About</button>
            <button onClick={() => setActiveModal('faq')} className="hover:text-red-600 transition-colors">FAQ</button>
            <button onClick={() => setActiveModal('privacy')} className="hover:text-red-600 transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-red-600 transition-colors">Terms & Conditions</button>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      <InfoModal isOpen={activeModal === 'about'} onClose={close} title="About Shobdo">
        <div className="space-y-4 text-sm">
          <p>
            Shobdo is an entirely client-side application designed to seamlessly convert Bengali text between legacy Bijoy (ANSI) and modern Unicode encodings.
          </p>
          <p>
            It is heavily optimized to run entirely in your browser without requiring a backend server, ensuring your documents remain completely private and secure on your local machine.
          </p>
          <div className="bg-[#FCFAF5] p-4 rounded-lg border border-[#F2EFE9] mt-6">
            <h3 className="font-semibold text-[#2D2A26] mb-2">Developed By</h3>
            <p>
              This project was built by <strong>Mahatir Ahmed Tusher</strong>. 
            </p>
            <a 
              href="https://github.com/Mahatir-Ahmed-Tusher/shobdo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium mt-2"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              View Source on GitHub
            </a>
          </div>
        </div>
      </InfoModal>

      {/* FAQ Modal */}
      <InfoModal isOpen={activeModal === 'faq'} onClose={close} title="Frequently Asked Questions">
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-[#2D2A26] mb-1">Are my documents sent to a server?</h3>
            <p>No. All standard document and text conversions happen locally on your device in your browser. If you explicitly enable AI Correction, only the specific text segments are sent securely to the AI provider.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2A26] mb-1">Who made this?</h3>
            <p>This tool was created by <strong>Mahatir Ahmed Tusher</strong>. You can find the open-source repository at <a href="https://github.com/Mahatir-Ahmed-Tusher/shobdo" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">GitHub</a>.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2A26] mb-1">What formats are supported?</h3>
            <p>Currently, you can paste raw text or upload Microsoft Word documents (.docx).</p>
          </div>
        </div>
      </InfoModal>

      {/* Privacy Policy Modal */}
      <InfoModal isOpen={activeModal === 'privacy'} onClose={close} title="Privacy Policy">
        <div className="space-y-4 text-sm prose prose-sm prose-red max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p><strong>1. Data Processing</strong><br/>All primary data processing, including DOCX parsing and Bijoy/Unicode text conversion, occurs locally within your web browser. We do not upload, store, or transmit your files to our servers.</p>
          <p><strong>2. AI Features</strong><br/>If you opt-in to use the AI Correction feature, text segments are transmitted securely via API to the respective LLM provider (Groq, Google, Mistral) based on your settings. API keys are stored solely in your local browser storage (`localStorage`).</p>
          <p><strong>3. Analytics</strong><br/>We may use basic, anonymized web analytics to understand usage patterns. No personally identifiable information is collected.</p>
        </div>
      </InfoModal>

      {/* Terms & Conditions Modal */}
      <InfoModal isOpen={activeModal === 'terms'} onClose={close} title="Terms & Conditions">
        <div className="space-y-4 text-sm prose prose-sm prose-red max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p><strong>1. Acceptance of Terms</strong><br/>By accessing and using Shobdo, you accept and agree to be bound by the terms and provision of this agreement.</p>
          <p><strong>2. Disclaimer of Warranties</strong><br/>The service is provided "AS IS", without warranty of any kind. We do not guarantee that the conversion will be 100% accurate in all legacy edge cases. Always verify important documents after conversion.</p>
          <p><strong>3. Open Source</strong><br/>This software is open-source. For licensing details, please refer to the LICENSE file in the official <a href="https://github.com/Mahatir-Ahmed-Tusher/shobdo" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">GitHub repository</a>.</p>
        </div>
      </InfoModal>
    </>
  );
}
