import axios from 'axios';
import { htmlToText } from 'html-to-text';

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
const parseTextFromUrl = async (url: string): Promise<string> => {
  const html = await fetchHtmlFromUrl(url);
  const options = { tables: ['#invoice', '.address'] };
  const text = htmlToText(html, options);
  return text;
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
