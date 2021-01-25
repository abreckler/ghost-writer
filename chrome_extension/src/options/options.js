function load() {
  var selectedElement = document.getElementById('selected');
  var sel = window.getSelection();
  sel.removeAllRanges();
  var range = document.createRange();
  range.selectNode(selectedElement);
  sel.addRange(range);
  
  var hotKeyElement = document.getElementById('hotkey');
  hotKeyElement.value = keyString;
  hotKeyElement.addEventListener('keydown', function(evt) {
    switch (evt.keyCode) {
    case 27:  // Escape
      evt.stopPropagation();
      evt.preventDefault();
      hotKeyElement.blur();
      return false;
    case 8:   // Backspace
    case 46:  // Delete
      evt.stopPropagation();
      evt.preventDefault();
      hotKeyElement.value = '';
      localStorage['hotKey'] = '';
      sendKeyToAllTabs('');
      window.hotKeyStr = '';
      return false;
    case 9:  // Tab
      return false;
    case 16:  // Shift
    case 17:  // Control
    case 18:  // Alt/Option
    case 91:  // Meta/Command
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }
    var keyStr = keyEventToString(evt);
    if (keyStr) {
      hotKeyElement.value = keyStr;
      localStorage['hotKey'] = keyStr;
      sendKeyToAllTabs(keyStr);
    
      // Set the key used by the content script running in the options page.
      window.hotKeyStr = keyStr;
    }
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }, true);
}

document.addEventListener('DOMContentLoaded', load);