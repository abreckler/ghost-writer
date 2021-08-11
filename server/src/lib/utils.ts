import axios from 'axios';
import { htmlToText, HtmlToTextOptions } from 'html-to-text';
import cheerio from 'cheerio';

/**
 * Extracts URL links and hostnames from a string
 * @param html string
 * @returns
 */
function extractUrls(html: string): { links: Array<string>; hostnames: Array<string> } {
  const links: Array<string> = [];
  const hostnames: Array<string> = [];

  const urlRegex = /(((https?:\/\/)|(www\.))[^\s"'>,]+)/gi;
  let array1;

  while ((array1 = urlRegex.exec(html)) !== null) {
    const l = array1[1];
    if (links.indexOf(l) < 0) {
      links.push(l);
      try {
        const h = new URL(l).hostname;
        if (hostnames.indexOf(h) < 0) {
          hostnames.push(h);
        }
      } catch {}
    }
  }

  return {
    links: links,
    hostnames: hostnames,
  };
}

/**
 * Enforces the scheme of the URL is https and returns the new URL
 */
const enforceHttpsUrl = (url: string) => url.replace(/^(https?:)?\/\//, 'https://');

/**
 * Loads the html string returned for the given URL
 */
const fetchHtmlFromUrl = async (url: string): Promise<string> => {
  return await axios
    .get(enforceHttpsUrl(url))
    .then((response) => response.data)
    .catch((error) => {
      error.status = (error.response && error.response.status) || 500;
      throw error;
    });
};

/**
 * Parse the string from the HTML returned for the given URL
 */
const parseTextFromUrl = async (
  url: string,
): Promise<{ title: string; description: string; text: string; html: string }> => {
  const html = await fetchHtmlFromUrl(url);

  // Extract title and description
  // NOTE: Some texts are more correct when extracted directly from html,
  // particularly when the text is contained within single element or attribute.
  const $ = cheerio.load(html);

  const _findFirstValidText2 = (selectors: (string | { selector: string; attribute: string })[]): string => {
    let text = '';
    selectors.forEach((sel) => {
      if (text) {
        return;
      }
      text = typeof sel == 'string' ? $(sel).text() : $(sel.selector).attr(sel.attribute) || '';
      // if (text != '') {
      //   console.log('_findFirstValidText2: text found with selector:', sel);
      // }
    });
    return text;
  };

  const title = _findFirstValidText2(['head>meta[name="twitter:title"]', 'head>title:first-of-type']);
  const description = _findFirstValidText2([
    { selector: 'head>meta[name="description"]', attribute: 'content' },
    { selector: 'head>meta[name="twitter:description"]', attribute: 'content' },
    { selector: 'head>meta[property="og:description"]', attribute: 'content' },
  ]);

  // console.log('title: ', title);
  // console.log('description: ', description);

  const _findFirstValidText = (selectors: Array<string[]>): string => {
    let text = '';
    selectors.forEach((sel) => {
      if (text) {
        return;
      }

      text = htmlToText(html, {
        baseElements: {
          selectors: sel,
          orderBy: 'occurrence',
          returnDomByDefault: false,
        },
        selectors: [
          {
            selector: 'section',
            format: 'block',
          },
          {
            selector: 'main',
            format: 'block',
          },
        ],
        wordwrap: 80, // null for no-wrap
        ignoreHref: false,
        ignoreImage: false,
        singleNewLineParagraphs: false,
      } as HtmlToTextOptions);

      if (text != '') {
        console.log('_findFirstValidText: text found with selector:', sel);
      }
    });
    return text;
  };

  const text = _findFirstValidText([['article', 'section'], ['main'], ['body']]);

  return {
    title: title,
    description: description,
    html: html,
    text: text,
  };
};

/**
 * Split long text into multiple substrings.
 * Slice by paragraphs.
 * @param text - long text
 * @param maxlen - maximum length of each slice
 */
const splitText = (text: string, maxlen: number): Array<string> => {
  const res = [];
  while (text.length > 0) {
    if (text.length < maxlen) {
      res.push(text);
      text = '';
    } else {
      let i = text.substring(0, maxlen).lastIndexOf('\n');
      if (i < 0) {
        i = text.substring(0, maxlen).lastIndexOf('.');
      }
      if (i < 0) {
        i = text.substring(0, maxlen).lastIndexOf(' ');
      }

      if (i >= 0) {
        const t = text.substring(0, i + 1).trim();
        if (t.length > 0) {
          res.push(t);
        }
        text = text.substring(i + 1).trim();
      } else {
        res.push(text);
        text = '';
      }
    }
  }
  return res;
};

const isAmazonDomain = (url: string): boolean => {
  const amazonDomains = ['amzn.to', 'www.amazon.com'];
  const internalHostname = new URL(url).hostname;
  return amazonDomains.indexOf(internalHostname) >= 0;
};

const extractAmazonAsin = (url: string): string | null => {
  const matches = /\/dp\/(\w+)/i.exec(url);
  if (matches) {
    return matches[1];
  }
  return null;
};

export { extractUrls, fetchHtmlFromUrl, parseTextFromUrl, splitText, isAmazonDomain, extractAmazonAsin };
