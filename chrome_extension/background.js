const API_KEY = 'sk-QaMxHjhRe0ez4v2Vnf6r2junMFSoZ03oZ8CkFdK4';

chrome.runtime.onInstalled.addListener(() => {
  console.log('extension installed');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  let action = msg.action || msg;
  if (action == 'read_config') {
    console.log('reading configuration');
    chrome.storage.local.get(['config'], (result) => {
      let c = fillDefaultConfig(result.config);
      c.API_KEY = API_KEY;
      sendResponse(c);
    });
  }
  else if (action == 'write_config') {
    console.log('writing configuration');
    let c = fillDefaultConfig(msg.data);
    chrome.storage.local.set({'config' : c}, sendResponse);

    chrome.tabs.query({currentWindow: true}, (tabs) => {
      tabs.forEach(t => {
        chrome.tabs.sendMessage(t.id, { action: 'config_updated', data: c });
      })
    });
    
  }
  return true;
});

function fillDefaultConfig(c) {
  var r = {};
  r.max_tokens = Number.parseInt((c && c.max_tokens) || 100);
  c && c.temperature && (r.temperature = Number.parseFloat(c.temperature));
  c && c.top_p && (r.top_p = Number.parseFloat(c.top_p));
  r.n = Number.parseInt((c && c.n) || 1);
  c && c.stream && (r.stream = !!c.stream);
  c && c.logprobs && (r.logprobs = Number.parseInt(c.logprobs));
  c && c.echo && (r.echo = !!c.echo);
  c && c.stop && (r.stop = c.stop);
  c && c.presence_penalty && (r.presence_penalty = Number.parseFloat(c.presence_penalty));
  c && c.frequency_penalty && (r.frequency_penalty = Number.parseFloat(c.frequency_penalty));
  c && c.best_of && (r.best_of = Number.parseFloat(c.best_of));
  c && c.logit_bias && (r.logit_bias = c.logit_bias);

  return r;
}