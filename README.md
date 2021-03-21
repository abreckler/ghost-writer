# Ghost Writer

Uses [OpenAI](https://openai.com/) API to suggest auto-completes of selected sentence.

## Chrome Extension (`./chrome_extension`)

### Flow

1. User selects some text on a page
2. The extension gets triggered and shows small widget for auto-complete
3. Save extension

## React Native App for iOS (Share Extension enabled)

### Building from the source code (`./react-native/ios`)

1. Install prerequisites: [Node.js](https://nodejs.org), [Cocoapods](https://cocoapods.org/), [Yarn](https://yarnpkg.com/)
2. Install NPM packages and Pods. This will create XCode workspace including the Pod project/targets.

    ```sh
    cd react-native

    # NPM packages
    yarn install

    # Cocoapods
    cd ios
    pod install
    ```

3. Open Xcode project, and assign Code Signing Identity.  
    There are many good tutorials for creation, management and assignment of Code Signing Identity.
4. Compile from command line

    ```sh
    # run this in ./react-native directory context

    # for simulator
    yarn ios
    # for a specific device
    yarn ios --udid=xxx
    ```

    NOTE: When compiling for a specific device, you will need to check device settings to allow the app signed by the Code signing identity.

## React Native App for Mac OS X (Share Extension enabled)

### Building from the source code (`./react-native/macos`)

1. Install prerequisites: [Node.js](https://nodejs.org), [Cocoapods](https://cocoapods.org/), [Yarn](https://yarnpkg.com/)
2. Install NPM packages and Pods. This will create XCode workspace including the Pod project/targets.
  
    ```sh
    cd react-native

    # NPM packages
    yarn install

    # Cocoapods
    cd macos
    pod install
    ```

3. Open Xcode project and assign Code Signing Identity.  
    There are many good tutorials for creation, management and assignment of Code Signing Identity.
4. Compile from command line

    ```sh
    # run this in ./react-native directory context
    yarn macos
    ```

### Troubleshooting of building issues for MacOS and iOS projects

#### Xcode, Pods ProjectName.debug.xcconfig unable to open file. Wrong directory

See [this Stackoverflow question](https://stackoverflow.com/questions/55558984/xcode-pods-projectname-debug-xcconfig-unable-to-open-file-wrong-directory).
