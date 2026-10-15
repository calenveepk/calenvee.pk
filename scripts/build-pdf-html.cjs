const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'AUDIT_REPORT.md');
const htmlPath = path.join(__dirname, '..', 'AUDIT_REPORT.html');

const mdContent = fs.readFileSync(mdPath, 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calenvee.pk — System Architectural & Security Audit Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    @page {
      margin: 15mm 12mm 15mm 12mm;
      size: A4;
    }
    @media print {
      body { background-color: #ffffff !important; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      thead { display: table-header-group; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .markdown-body h1 { font-size: 1.85rem; font-weight: 800; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 1.5rem; margin-bottom: 1rem; }
    .markdown-body h2 { font-size: 1.35rem; font-weight: 700; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.4rem; margin-top: 1.75rem; margin-bottom: 0.75rem; }
    .markdown-body h3 { font-size: 1.1rem; font-weight: 700; color: #334155; margin-top: 1.25rem; margin-bottom: 0.5rem; }
    .markdown-body h4 { font-size: 0.95rem; font-weight: 700; color: #475569; margin-top: 1rem; margin-bottom: 0.4rem; }
    .markdown-body p { margin-bottom: 0.75rem; line-height: 1.6; color: #334155; font-size: 0.9rem; }
    .markdown-body ul, .markdown-body ol { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; font-size: 0.9rem; }
    .markdown-body li { margin-bottom: 0.35rem; }
    .markdown-body table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.8rem; }
    .markdown-body th { background-color: #0f172a; color: #ffffff; padding: 8px 10px; text-align: left; font-weight: 700; border: 1px solid #334155; }
    .markdown-body td { padding: 7px 10px; border: 1px solid #e2e8f0; vertical-align: top; }
    .markdown-body tr:nth-child(even) { background-color: #f8fafc; }
    .markdown-body blockquote { border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 12px 16px; margin: 1rem 0; border-radius: 0 8px 8px 0; color: #991b1b; }
    .markdown-body code { background-color: #f1f5f9; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85em; padding: 2px 5px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .markdown-body pre code { background-color: transparent; border: none; padding: 0; color: inherit; }
    .markdown-body pre { background-color: #0f172a; color: #f8fafc; padding: 0.85rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; font-size: 0.78rem; }
    .mermaid { margin: 1.5rem 0; display: flex; justify-content: center; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900">

  <div class="no-print bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800 shadow-md">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <span class="bg-[#F97316] text-white font-extrabold text-xs px-2.5 py-1 rounded-md tracking-wider">CALENVEE AUDIT</span>
        <span class="text-sm font-semibold text-slate-300">Staff Architecture &amp; Security Report</span>
      </div>
      <div class="flex items-center space-x-3">
        <button onclick="window.print()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition active:scale-95 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          <span>Save / Print as PDF</span>
        </button>
      </div>
    </div>
  </div>

  <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 markdown-body" id="content">
      Loading audit report...
    </div>
  </div>

  <textarea id="md-source" style="display: none;">${mdContent.replace(/<\/textarea>/gi, '<\\/textarea>')}</textarea>

  <script>
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

    try {
      const rawMd = document.getElementById('md-source').value;
      const renderer = new marked.Renderer();
      const defaultCodeRenderer = renderer.code.bind(renderer);

      renderer.code = function(code, language) {
        if (language === 'mermaid') {
          return '<div class="mermaid">' + code + '</div>';
        }
        return defaultCodeRenderer(code, language);
      };

      marked.setOptions({ renderer: renderer });
      document.getElementById('content').innerHTML = marked.parse(rawMd);
      mermaid.run().then(() => {
        document.body.setAttribute('data-rendered', 'true');
      });
    } catch (err) {
      document.getElementById('content').innerHTML = '<div class="text-red-600 font-bold">Error rendering report: ' + err + '</div>';
    }
  </script>
</body>
</html>`;

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully wrote', htmlPath, 'Size:', html.length);

