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
    }
  });
})();