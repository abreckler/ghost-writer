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
 _ Enforces the scheme of the URL is https
 _ and returns the new URL
 */
const enforceHttpsUrl = (url: string) => url.replace(/^(https?:)?\/\//, 'https://');

/**
 - Loads the html string returned for the given URL
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
 - Parse the string from the HTML returned for the given URL
 */
const parseTextFromUrl = async (url: string): Promise<string> => {
  const html = await fetchHtmlFromUrl(url);
  const options = { tables: ['#invoice', '.address'] };
  const text = htmlToText(html, options);
  return text;
};

export { extractUrls, fetchHtmlFromUrl, parseTextFromUrl };
