/**
 * This cli config is needed for the coexistance of react-native and other
 * out-of-tree implementations such react-native-windows.
 * The following issue is tracked by
 * https://github.com/react-native-community/discussions-and-proposals/issues/182
 *
 * The work-around involves having a metro.config.js for each out-of-tree
 * platform, i.e. metro.config.js for react-native and
 * metro.config.windows.js for react-native-windows.
 * This react-native.config.js looks for a --use-react-native-windows
 * switch and when present pushes --config=metro.config.windows.js
 * and specifies reactNativePath: 'node_modules/react-native-windows'.
 * The metro.config.js has to blacklist 'node_modules/react-native-windows',
 * and conversely metro.config.windows.js has to blacklist 'node_modules/react-native'.
 */
'use strict';

const config = {
  project: {
    "macos": {
      "sourceDir": "/Volumes/Data/Work/ghost-writer/react_native/macos",
      "folder": "/Volumes/Data/Work/ghost-writer/react_native",
      "pbxprojPath": "/Volumes/Data/Work/ghost-writer/react_native/macos/ghost_writer_rn.xcodeproj/project.pbxproj",
      "podfile": "/Volumes/Data/Work/ghost-writer/react_native/macos/Podfile",
      "podspecPath": null,
      "projectPath": "/Volumes/Data/Work/ghost-writer/react_native/macos/ghost_writer_rn.xcodeproj",
      "projectName": "ghost_writer_rn.xcodeproj",
      "libraryFolder": "Libraries",
      "sharedLibraries": [],
      "plist": [],
      "scriptPhases": []
    },
  }
}

const windowsSwitch = '--use-react-native-windows';

if (process.argv.includes(windowsSwitch)) {
  process.argv = process.argv.filter((arg) => arg !== windowsSwitch);
  process.argv.push('--config=./example/metro.config.windows.js');

  config.reactNativePath = 'node_modules/react-native-windows';
}

const macSwitch = '--use-react-native-macos';

if (process.argv.includes(macSwitch)) {
  process.argv = process.argv.filter((arg) => arg !== macSwitch);
  process.argv.push('--config=metro.config.macos.js');

  config.reactNativePath = 'node_modules/react-native-macos';
}

module.exports = config;