<div align="center">
  <img src="https://i.postimg.cc/dtL8yZYP/shobdo-logo.webp" alt="Shobdo Logo" width="300" />
  
  # Shobdo (শব্দ)
  
  **A blazing-fast, 100% in-browser Bijoy ⇄ Unicode Bengali converter with AI-powered proofreading.**

  [![Live Demo](https://img.shields.io/badge/Live_Demo-shobdo--doc.vercel.app-red.svg?style=for-the-badge)](https://shobdo-doc.vercel.app/)
  [![Open Source](https://img.shields.io/badge/Open_Source-Yes-success.svg?style=for-the-badge)](#)
</div>

---

## 🌟 What is Shobdo?

**Shobdo** is an open-source web application designed to seamlessly convert Bengali text and `.docx` documents between legacy **Bijoy** encodings and modern **Unicode**. 

Unlike traditional converters that require you to upload your sensitive documents to a server, Shobdo processes everything **locally in your browser**. It also integrates powerful AI correction to fix typos, resolve legacy encoding glitches, and restore broken scientific/mathematical notation, highlighting exactly what it changed!

## 🚀 Features

- **Document Conversion**: Drag-and-drop `.docx` files to convert entire documents without losing formatting (tables, headers, footnotes, fonts).
- **Text Conversion**: Copy and paste raw text for instant conversion.
- **Smart AI Proofreader**: Optionally plug in an AI model to clean up the converted Bengali text, correct spelling mistakes, and fix garbled mathematical formulas (e.g. restoring mangled Bengali back to $H_2O$).
- **Visual Diffs**: Any text modified by the AI in your `.docx` is automatically highlighted in **yellow**, allowing you to easily review the changes.
- **Auto-Detection**: Automatically detects if your text/document is in Bijoy or Unicode and converts it to the other.
- **100% Private**: Your `.docx` files are processed locally on your machine via Web Workers. Files are never uploaded to our servers.

## 🤖 Using the AI Proofreader

Shobdo allows you to bring your own API keys to power the AI proofreading engine. This keeps the tool free and ensures your data is sent directly to the provider of your choice.

### 1. Get an API Key
You can generate a free API key from any of the supported providers:
- **Groq** (Fastest): [console.groq.com](https://console.groq.com/)
- **Gemini** (Google): [aistudio.google.com](https://aistudio.google.com/)
- **Mistral**: [console.mistral.ai](https://console.mistral.ai/)

### 2. Configure Shobdo
1. Click the **Settings ⚙️** icon in the top right corner of Shobdo.
2. Paste your API key into the corresponding input field.
3. Select your preferred AI Provider from the dropdown (or leave it on Auto-Detect).
4. Save your settings!

### 3. Convert with AI
- Check the **"Enable AI Correction"** box before converting your document or text.
- Review your converted `.docx` file—any intelligent corrections made by the AI will be cleanly highlighted in yellow!

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Processing:** Web Workers, jszip
- **AI Integration:** Direct REST API calls (Groq, Gemini, Mistral)

## 🤝 Open Source

Shobdo is fully open-source! We believe in transparent, privacy-first tools for the Bengali-speaking community. 

Feel free to fork the repository, submit pull requests, report bugs, or suggest features.

## 🏃‍♂️ Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Mahatir-Ahmed-Tusher/shobdo.git
   ```
2. Navigate into the directory:
   ```bash
   cd shobdo
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---
*Created by [Mahatir Ahmed Tusher](https://github.com/Mahatir-Ahmed-Tusher)*
