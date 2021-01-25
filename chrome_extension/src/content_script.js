(function() {
  /**
   * Flow
   *  1. User selects some text on a page
   *  2. The extension gets triggered and shows small widget for auto-complete
   *  3. Save extension
   */
  const API_KEY = 'sk-QaMxHjhRe0ez4v2Vnf6r2junMFSoZ03oZ8CkFdK4';
  var ghostFace; // root element of component
  var triggerBtn; // trigger button for ghost writer
  var ghostAnswerPanel; // panel that holds answers from ghost writer

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
        </div>
        <div class="panel">
          <div class="panel-header">
            Ghost writer suggests:
          </div>
          <div class="panel-body">
            <ul class="gwf-candidates"></ul>
          </div>
        </div>
      </div>`;
    if (!ghostFace) {
      document.body.insertAdjacentHTML('beforeEnd', template);

      ghostFace = document.querySelector(".gwf");;
      triggerBtn = document.querySelector(".gwf .gwf-btn");
      ghostAnswerPanel = document.querySelector(".gwf .panel");

      triggerBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        debouncedCreateCompletion(getSelectedText());
      });
      ghostAnswerPanel.addEventListener('click', function(event) {
        event.stopPropagation();
      });
      document.addEventListener('click', function() {
        toggleAnswerPanel(!1);
      });
    }

    var selRect = getSelectedTextPosition();
    if (selRect) {
      ghostFace.style.left = window.scrollX + selRect.right+'px';
      ghostFace.style.top = window.scrollY + selRect.bottom+'px';
    }
  }

  function toggleAnswerPanel(show) {
    if (show) {
      triggerBtn.classList.add("active");
      ghostAnswerPanel.classList.add("active");
    } else {
      triggerBtn.classList.remove("active");
      ghostAnswerPanel.classList.remove("active");
    }
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
    console.log('CreateCompletion', text);
    // call OpenAI API
    // @see https://beta.openai.com/docs/api-reference/create-completion
    var response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        "prompt": text,
        "max_tokens": 16 // default value (One token is roughly 4 characters for normal English text)
      }) // body data type must match "Content-Type" header
    });
    var json = await response.json();

    if (json.choices) {
      var choicesHtml = '';
      json.choices.forEach(function(c) {
        choicesHtml += `<li><p>${c.text}</p></li>`;
      });
      ghostAnswerPanel.querySelector('.panel-body ul').innerHTML = choicesHtml;
    } else {
      ghostAnswerPanel.querySelector('.panel-body ul').innerHTML = '<li disabled>No candidates!</li>'
    }

    // show "answer panel"
    toggleAnswerPanel(!0);
  }

  /**
   * Bring in Ghost writer to auto-complete from the current lead.
   */
  function bringGhostWriter() {
    var selectedText = getSelectedText();
    if (selectedText) {
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
        console.log(typeof target, target);
        if (target === ghostFace)
          return isPartOfGhostFace = !0;
        target = target.parentElement;
      }
    }

    console.log('isPartOfGhostFace', isPartOfGhostFace);
    if (!isPartOfGhostFace) {
      var selectedText = getSelectedText();
      if (selectedText) {
        bringGhostWriter();
      } else {
        bustGhost();
      }
    }
  }

  function initContentScript() {
    // addEventListener version
    document.addEventListener('selectionchange', (evt) => {
      debouncedOnSelectionChange(evt);
    });
  }

  const debouncedCreateCompletion = debounce(CreateCompletion, 500);
  const debouncedInitFabButton = debounce(initFabButton, 200);
  const debouncedOnSelectionChange = debounce(onSelectionChange, 200);


  initContentScript();

  chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
  
      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      console.log("Hello. This message was sent from scripts/content_script.js");
      // ----------------------------------------------------------
  
    }
    }, 10);
  });

})();
