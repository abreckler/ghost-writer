function extractUrls(html: string) {
  let links: Array<string> = [];
  let hostnames: Array<string> = [];

  var urlRegex = /(((https?:\/\/)|(www\.))[^\s"'>,]+)/gi;
  let array1;

  while ((array1 = urlRegex.exec(html)) !== null) {
    let l = array1[1];
    if (links.indexOf(l) < 0)
    {
      links.push(l);
      try {
        let h = new URL(l).hostname;
        if (hostnames.indexOf(h) < 0)
          hostnames.push(h);
      } catch {}
    }
  }

  return {
    links: links,
    hostnames: hostnames
  }
}


export {
  extractUrls
};