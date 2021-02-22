(function() {
  /**
   * Flow
   *  1. User selects some text on a page
   *  2. The extension gets triggered and shows small widget for auto-complete
   *  3. Save extension
   */
  var API_KEY = null;
  var ENGINE = 'davinci';
  var EXT_CONF = {};
  var ghostFace; // root element of component
  var triggerBtn; // trigger button for ghost writer
  var ghostAnswerPanel; // panel that holds answers from ghost writer
  var ghostBelly = [];

  /**
   * show FAB button for the extension
   */
  function initFabButton() {
    var template = `
      <div class="gwf" style="position:absolute;z-index:100000">
        <div class="gwf-btn">
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 92 92" enable-background="new 0 0 92 92" xml:space="preserve" class="arrow-icon show">
            <path id="XMLID_507_" d="M49.9,88c-0.2,0-0.4,0-0.6-0.1c-1.8-0.3-3.2-1.7-3.3-3.5l-3.5-34.8L7.6,46.1c-1.8-0.2-3.3-1.6-3.5-3.3c-0.3-1.8,0.7-3.5,2.3-4.3l76-34.1c1.5-0.7,3.3-0.4,4.5,0.8c1.2,1.2,1.5,3,0.8,4.5l-34.1,76C52.9,87.1,51.4,88,49.9,88z M23.3,39.7L46.4,42c1.9,0.2,3.4,1.7,3.6,3.6l2.4,23.1L76,16L23.3,39.7z"></path>
          </svg>
          <div class="dot-loading dot-pulse"></div>
        </div>
        <div class="gwf-panel">
          <div class="gwf-panel-header">
            Ghost writer suggests:
          </div>
          <div class="gwf-panel-body">
            <ul class="gwf-candidates"></ul>
          </div>
        </div>
      </div>`;
    if (!ghostFace) {
      document.body.insertAdjacentHTML('beforeEnd', template);

      ghostFace = document.querySelector(".gwf");;
      triggerBtn = document.querySelector(".gwf .gwf-btn");
      ghostAnswerPanel = document.querySelector(".gwf .gwf-panel");

      triggerBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        debouncedCreateCompletion(getSelectedText());
      });
      document.addEventListener('click', () => toggleAnswerPanel(!1));
      ghostFace.addEventListener('click', (event) => {
        event.stopPropagation();
        var target = event.target;
        while(target) {
          if (target.matches('.gwf-answer')) {
            if (event.pageX == null && event.clientX != null) {
              eventDoc = (event.target && event.target.ownerDocument) || document;
              doc = eventDoc.documentElement;
              body = eventDoc.body;
  
              event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
              event.pageY = event.clientY +
                (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }
            answerClicked(target, event);
          }
          target = target.parentElement;
        }
      });
    }

    var selRect = getSelectedTextPosition();
    if (selRect) {
      ghostFace.style.left = (window.scrollX + selRect.right) + 'px';
      ghostFace.style.top = (window.scrollY + selRect.bottom) + 'px';
    }
  }

  function answerClicked(answerEl, evt) {
    copyTextToClipboard(answerEl.innerText);
    whisper('Copied into the clipboard!', {x: evt.pageX, y: evt.pageY});
  }

  function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';

    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    var copied = false;
    try {
      document.execCommand('copy');
      success = true;
    } catch (err) {
    } finally {
      document.body.removeChild(textArea);
    }
    return copied;
  }

  function toggleAnswerPanel(show) {
    if (ghostFace) {
      if (show) {
        ghostFace.classList.add("gwf-view-panel");
      } else {
        ghostFace.classList.remove("gwf-view-panel");
      }
    }
  }

  function whisper(text, pos) {
    var el = document.createElement('span');
    el.innerText = text;
    el.style.position = 'fixed';
    el.style.opacity = 1;
    el.style.zIndex = 1000;
    ghostFace.appendChild(el);
    var rect = el.getBoundingClientRect();
    el.style.left = (pos.x - rect.width / 2) + 'px';
    el.style.top = (pos.y - rect.height - window.scrollY) + 'px';

    // animate
    el.classList.add('gwf-whisper');
    setTimeout(() => el.remove(), 500);
    setTimeout(() => {
      el.style.top = (pos.y - 3 * rect.height - window.scrollY) + 'px';
      el.style.opacity = 0;
    }, 0);
  }

  function getSelectedText() {
    var focused = document.activeElement;
    var selectedText;
    if (focused) {
      try {
        selectedText = focused.value.substring(focused.selectionStart, focused.selectionEnd);
      } catch (err) {
      }
    }
    if (selectedText == undefined) {
      var sel = window.getSelection();
      var selectedText = sel.toString();
    }
    return selectedText;
  }

  function getSelectedElement() {
    var focused = document.activeElement;
    var element;
    if (focused) {
      try {
        var selectedText = focused.value.substring(focused.selectionStart, focused.selectionEnd);
        element = focused;
      } catch (err) {
      }
    }
    if (element == undefined)
      element = window.getSelection();
    return element;
  }

  function getSelectedTextPosition() {
    var focused = document.activeElement;
    var oRect;
    if (focused) {
      try {
        var selectedText = focused.value.substring(focused.selectionStart, focused.selectionEnd);
        oRect = focused.getBoundingClientRect();
      } catch (err) {
      }
    }
    if (oRect == undefined) {
      oRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    }
    return oRect;
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    }
  }

  async function CreateCompletion(text) {
    if (ghostFace.classList.contains('gwf-thinking'))
      return;

    ghostFace.classList.add('gwf-thinking');
    var json = null;

    // check cache
    var cached = ghostBelly.find((c) => c.promptText == text);
    cached && (json = cached.response);

    if (!json) {
      // call OpenAI API
      // @see https://beta.openai.com/docs/api-reference/create-completion
      var response = await fetch('https://api.openai.com/v1/engines/'+ ENGINE +'/completions', {
        method: 'POST',
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + API_KEY
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(extend(EXT_CONF, { prompt: text, max_tokens: calculateTokens(text) })) // body data type must match "Content-Type" header
      });
      var json = await response.json();
    }

    ghostBelly.push({
      promptText: text,
      response: json
    });

    if (json.choices) {
      var choicesHtml = '';
      json.choices.forEach((c) => {
        choicesHtml += `<li class="gwf-answer"><p>${c.text}</p></li>`;
      });
      ghostAnswerPanel.querySelector('.gwf-panel-header').innerHTML = 'Ghost writer has ' + json.choices.length + (json.choices.length == 1 ? ' suggestion' : ' suggestions') + ':';
      ghostAnswerPanel.querySelector('ul.gwf-candidates').innerHTML = choicesHtml;
    } else {
      ghostAnswerPanel.querySelector('ul.gwf-candidates').innerHTML = '<li class="gwf-answer" disabled>No candidates!</li>'
    }

    // show "answer panel"
    ghostFace.classList.remove('gwf-thinking');
    toggleAnswerPanel(!0);
  }

  /**
   * Calculate max_tokens to be passed on API call, based on text selection
   * NOTE: One token is roughly 4 characters for normal English text
   * @param {string} text 
   */
  function calculateTokens(text) {
    // Now suggestion text will be rougly the same length as the selected text.
    return Number.parseInt(Math.min(Math.ceil(text.length / 4), EXT_CONF.max_tokens));
  }

  /**
   * Bring in Ghost writer to auto-complete from the current lead.
   * At least 30 characters must be selected.
   */
  function bringGhostWriter() {
    var selectedText = getSelectedText();
    if (selectedText && selectedText.length > 30) {
      debouncedInitFabButton();
    }
  }

  function bustGhost() {
    if (ghostFace) {
      ghostFace.remove();
      ghostFace = ghostAnswerPanel = triggerBtn = undefined;
    }
  }

  function onSelectionChange(evt) {
    var isPartOfGhostFace = !1;
    if (ghostFace) {
      var target = getSelectedElement();
      target = target.focusNode || target.anchorNode || target;
      while (target) {
        if (target === ghostFace)
          return isPartOfGhostFace = !0;
        target = target.parentElement;
      }
    }

    if (!isPartOfGhostFace) {
      var selectedText = getSelectedText();
      if (selectedText) {
        bringGhostWriter();
      } else {
        bustGhost();
      }
    }
  }

  /*!
   * Merge two or more objects together.
   * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param   {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
   * @param   {Object}   objects  The objects to merge together
   * @returns {Object}            Merged values of defaults and options
   */
  var extend = function () {
    var extended = {};
    var deep = false;
    var i = 0;

    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
        deep = arguments[0];
        i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          // If property is an object, merge properties
          if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
            extended[prop] = extend(extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    // Loop through each object and conduct a merge
    for (; i < arguments.length; i++) {
      merge(arguments[i]);
    }

    return extended;

  };

  function initContentScript() {
    // addEventListener version
    document.addEventListener('selectionchange', (evt) => debouncedOnSelectionChange(evt));
  }

  const debouncedCreateCompletion = debounce(CreateCompletion, 500);
  const debouncedInitFabButton = debounce(initFabButton, 200);
  const debouncedOnSelectionChange = debounce(onSelectionChange, 200);


  initContentScript();

  chrome.runtime.sendMessage('read_config', (conf) => {
    if (typeof conf == undefined) {
      console.log(lastError);
    } else if (conf) {
      API_KEY = conf.API_KEY;
      ENGINE = conf.engine;
      EXT_CONF = conf;
      delete EXT_CONF['API_KEY'];
      delete EXT_CONF['engine'];
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    let action = msg.action || msg;
    if (action == 'config_updated') {
      console.log('configuration updated');
      EXT_CONF = msg.data;
    }
  });

})();
