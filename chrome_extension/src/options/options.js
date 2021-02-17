(function() {
  var form = document.getElementById('param_form');

  form.onsubmit = function() {
    var formData = new FormData(form);
    var data = {};
    for (var p of formData) {
      p[1] !== '' && (data[p[0]] = p[1]);
    }
    chrome.runtime.sendMessage({ action: 'write_config', data: data }, function() {
      alert('Successfully wrote extension configuration!');
    });
    return false;
  };

  async function listEngines(API_KEY, cur_engine) {
    form.querySelector('#param_engine').innerHTML = '<option value="' + cur_engine + '" selected>' + cur_engine + '</option>';

    var response = await fetch('https://api.openai.com/v1/engines', {
      method: 'GET',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    var json = await response.json();
    if (json && json.data) {
      form.querySelector('#param_engine').innerHTML = json.data
        .filter(e => e.ready).map((e) => '<option value="' + e.id + '"' + (cur_engine == e.id ? ' selected' :'') + '>' + e.id + '</option>').join('');
    }
  }

  chrome.runtime.sendMessage('read_config', (conf) => {
    if (typeof conf == undefined) {
      console.log(lastError);
    } else if (conf) {
      // let's show configuration values on the form
      form.querySelector('#param_max_tokens').value = conf.max_tokens;
      form.querySelector('#param_temperature').value = conf.temperature || '';
      form.querySelector('#param_top_p').value = conf.top_p || '';
      form.querySelector('#param_n').value = conf.n;
      form.querySelector('#param_stream').checked = !!conf.stream;
      form.querySelector('#param_logprobs').value = conf.logprobs || '';
      form.querySelector('#param_echo').checked = !!conf.echo;
      form.querySelector('#param_stop').value = conf.stop || '';
      form.querySelector('#param_presence_penalty').value = conf.presence_penalty || '';
      form.querySelector('#param_frequency_penalty').value = conf.frequency_penalty || '';
      // form.querySelector('#param_best_of').value = conf.best_of || '';
      // form.querySelector('#param_logit_bias').value = conf.logit_bias || '';
      listEngines(conf.API_KEY, conf.engine);
    }
  });
})();