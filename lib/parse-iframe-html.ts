/**
 * Extract embed payload from admin-pasted iframe HTML.
 * Handles broken srcdoc quoting (unescaped " inside the attribute value).
 */
export function parseIframeHtml(iframeHtml: string): {
  src?: string;
  srcDoc?: string;
  sandbox?: string;
  allow?: string;
  allowFullScreen?: boolean;
} {
  const html = iframeHtml.trim();
  if (!html) return {};

  // Full document pasted without an <iframe> wrapper
  if (/^(<!DOCTYPE|<html[\s>])/i.test(html)) {
    return {
      srcDoc: html,
      sandbox: 'allow-scripts allow-forms allow-popups allow-modals',
    };
  }

  const sandbox = html.match(/\ssandbox\s*=\s*(["'])(.*?)\1/i)?.[2];
  const allow = html.match(/\sallow\s*=\s*(["'])(.*?)\1/i)?.[2];
  const allowFullScreen = /\sallowfullscreen\b/i.test(html);

  // Prefer a real src URL when present (not about:srcdoc)
  const srcMatch = html.match(/\ssrc\s*=\s*(["'])([^"']*)\1/i);
  const src = srcMatch?.[2]?.trim();
  if (src && !/^about:srcdoc$/i.test(src) && !src.startsWith('javascript:')) {
    return {
      src,
      sandbox,
      allow,
      allowFullScreen,
    };
  }

  // Extract srcdoc by taking everything after srcdoc=" until </iframe>.
  // Do NOT stop at the first inner quote — admin pastes often leave quotes unescaped.
  const srcdocAttr = html.match(/srcdoc\s*=\s*(["'])/i);
  if (srcdocAttr) {
    const start = html.indexOf(srcdocAttr[0]) + srcdocAttr[0].length;
    const closeIdx = html.toLowerCase().lastIndexOf('</iframe>');
    const endSearch = closeIdx === -1 ? html.length : closeIdx;
    let srcDoc = html.slice(start, endSearch).trim();
    // Drop a trailing attribute closer quote if present
    srcDoc = srcDoc.replace(/["']\s*$/, '').trim();

    if (srcDoc) {
      return {
        srcDoc,
        sandbox: sandbox || 'allow-scripts allow-forms allow-popups allow-modals',
        allow,
        allowFullScreen,
      };
    }
  }

  return { sandbox, allow, allowFullScreen };
}
