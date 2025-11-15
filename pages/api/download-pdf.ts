import type { NextApiRequest, NextApiResponse } from "next";
import fs from 'node:fs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { Browser } from 'puppeteer-core';

const isServerless = Boolean(process.env.AWS_REGION || process.env.VERCEL);

const localChromeCandidates = [
  process.env.CHROME_EXECUTABLE_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean) as string[];

const resolveLocalExecutable = () => {
  for (const candidate of localChromeCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
};

async function launchBrowser(): Promise<Browser> {
  if (isServerless) {
    const executablePath = await chromium.executablePath();

    if (!executablePath) {
      throw new Error('Chromium executable path not found in serverless runtime.');
    }

    return puppeteer.launch({
      args: puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' }),
      executablePath,
      headless: 'shell',
    });
  }

  const executablePath = resolveLocalExecutable();

  if (!executablePath) {
    throw new Error(
      'Unable to locate a local Chrome/Chromium executable. Set CHROME_EXECUTABLE_PATH.'
    );
  }

  return puppeteer.launch({
    executablePath,
    headless: true,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enforce JSON body
  const ct = (req.headers['content-type'] || '').toString();
  if (!ct.includes('application/json')) {
    return res.status(415).json({ error: 'Unsupported Media Type' });
  }

  const { prdContent } = req.body as { prdContent?: string };

  if (typeof prdContent !== 'string' || prdContent.trim().length === 0) {
    return res.status(400).json({ error: 'Missing PRD content' });
  }

  // Escape HTML to prevent injection in the generated document
  const escapeHtml = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();

    const page = await browser.newPage();

    // Convert text content to HTML with proper line breaks and escaped content
    const formattedContent = prdContent
      .split('\n')
      .map((line: string) => {
        const text = escapeHtml(line.trim());
        if (text.length === 0) return '<br>';
        if (line.startsWith('# ')) {
          return `<h1>${escapeHtml(line.substring(2))}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2>${escapeHtml(line.substring(3))}</h2>`;
        }
        return `<p>${text}</p>`;
      })
      .join('\n');

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-Content-Type-Options" content="nosniff">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            .content { max-width: 100%; word-wrap: break-word; }
            h1 { font-size: 24px; margin-top: 24px; margin-bottom: 16px; font-weight: bold; color: #000; }
            h2 { font-size: 20px; margin-top: 20px; margin-bottom: 12px; font-weight: bold; color: #333; }
            p { margin: 8px 0; }
            br { display: block; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="content">${formattedContent}</div>
        </body>
      </html>
    `);

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' },
      printBackground: true
    });

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
      'Content-Disposition': 'attachment; filename="Final-prd.pdf"',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(pdf);
  } catch (error) {
    console.error('[download-pdf] Failed to generate PDF', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn('[download-pdf] Failed to close browser', closeError);
      }
    }
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '200kb' },
  },
  runtime: 'nodejs',
};