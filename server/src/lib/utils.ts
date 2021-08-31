import axios from 'axios';
import { DomNode, FormatOptions, htmlToText, HtmlToTextOptions, RecursiveCallback } from 'html-to-text';
import cheerio from 'cheerio';
import { BlockTextBuilder } from 'html-to-text/lib/block-text-builder';

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
    .get(enforceHttpsUrl(url), {
      timeout: 10000, // milliseconds
    })
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
  _outputFormat: 'text'|'markdown' = 'text'
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

  console.log('title: ', title);
  console.log('description: ', description);

  // clear up HTML to extract main article
  // remove elements that are highly likely not related to main article
  $('head,body>header,body>footer,nav,aside,form,iframe').remove();
  $('[role=banner],[role=button],[role=dialog],[role=navigation]').remove();
  $('[aria-hidden=true],[aria-modal=true]').remove();
  $('.hidden,.sr-only,.screen-reader-only').remove(); // some common style classes that are hidden from UI
  $('script,style,noscript').remove(); // remove non-visible elements
  $('svg,video,audio,picture,figure,img').remove();
  $('[style*="display:none"i]').remove();

  while ($(':empty').length > 0) {
    console.log('Removing empty elements');
    $(':empty').remove();
  }

  // Sometimes a visible parent consists of only non-visible children. If so remove them.
  const removeEmptyChildren = ($el: cheerio.Cheerio) => {
    if ($el.children().length > 0) {
      $el.children().each((_idx: number, element: cheerio.Element) => {
        removeEmptyChildren($(element));
      });
    }

    if ($el.children().length == 0) {
      const txt = $el.text().trim();
      if (
        txt == '' ||
        ( // simple social share links
          txt.indexOf('.') < 0 &&
          (
            /Share (on|via) (Twitter|Facebook|Email|LinkedIn|WhatsApp|Messenger|Reddit|Tumblr|Pinterest|Pocket)/gi.test(txt) ||
            /^Read more/gi.test(txt)
          )
        )
      ) {
        $el.remove();
      }
    }
  };
  $('body').each((_idx: number, element: cheerio.Element) => removeEmptyChildren($(element)));

  const cleaned_html = $.html();

  const _findFirstValidText = (selectors: Array<string[]>): string => {
    let text = '';
    selectors.forEach((sel) => {
      if (text) {
        return;
      }

      text = htmlToText(cleaned_html, {
        baseElements: {
          selectors: sel,
          orderBy: 'occurrence',
          returnDomByDefault: false,
        },
        formatters: {
          formatHeadingMarkdown: function (
            elem: DomNode,
            walk: RecursiveCallback,
            builder: BlockTextBuilder,
            formatOptions: FormatOptions,
          ) {
            builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
            if (formatOptions.uppercase !== false) {
              builder.pushWordTransform((str: string) => str.toUpperCase());
              walk(elem.children, builder);
              builder.popWordTransform();
            } else {
              walk(elem.children, builder);
            }
            builder.closeBlock({
              trailingLineBreaks: formatOptions.trailingLineBreaks || 2,
              blockTransform: (str: string) => {
                switch (elem.name?.toLowerCase()) {
                  case 'h1':
                    return '# ' + str.replace(/\n/g, ' ') + ' #';
                  case 'h2':
                    return '## ' + str.replace(/\n/g, ' ') + ' ##';
                  case 'h3':
                    return '### ' + str.replace(/\n/g, ' ') + ' ###';
                  case 'h4':
                    return '#### ' + str.replace(/\n/g, ' ') + ' ####';
                  case 'h5':
                    return '##### ' + str.replace(/\n/g, ' ') + ' #####';
                  case 'h6':
                    return '###### ' + str.replace(/\n/g, ' ') + ' ######';
                }
                return str;
              },
            });
          },
          formatHorizontalLineMarkdown: function (
            _elem: DomNode,
            _walk: RecursiveCallback,
            builder: BlockTextBuilder,
            formatOptions: FormatOptions,
          ) {
            builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
            builder.addInline('_'.repeat(formatOptions.length || 40));
            builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
          },
        },
        selectors: [
          {
            selector: 'h1',
            format: 'formatHeadingMarkdown',
          },
          {
            selector: 'h2',
            format: 'formatHeadingMarkdown',
          },
          {
            selector: 'h3',
            format: 'formatHeadingMarkdown',
          },
          {
            selector: 'h4',
            format: 'formatHeadingMarkdown',
          },
          {
            selector: 'h5',
            format: 'formatHeadingMarkdown',
          },
          {
            selector: 'h6',
            format: 'formatHeadingMarkdown',
          },
          {
            selector: 'hr',
            format: 'formatHorizontalLineMarkdown',
          },
          {
            selector: 'section',
            format: 'block',
          },
          {
            selector: 'dl',
            format: 'unorderedList',
          },
          {
            selector: 'dd',
            format: 'paragraph',
          },
        ],
        ignoreHref: false,
        ignoreImage: false,
        singleNewLineParagraphs: false,
      } as HtmlToTextOptions);

      text = text
        .split('\n')
        .map((str) => (str.trim() == '' ? '' : str))
        .join('\n')
        .replace(/\n\n\n+/g, '\n\n');

      if (text != '') {
        console.log('_findFirstValidText: text found with selector:', sel);
      }
    });
    return text;
  };

  const text = _findFirstValidText([
    ['main>article'],
    ['article'],
    ['[role=article]'],
    ['.article-body'],
    ['main'],
    ['[role=main]'],
    ['body'],
  ]);

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
