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
    yarn install
    pod install
    ```

3. Open Xcode project, and assign Code Signing Identity
4. Compile from command line

    ```sh
    # for simulator
    yarn ios

    # for device
    yarn ios --udid=xxx
    ```

## React Native App for Mac OS X (Share Extension enabled)

### Building from the source code (`./react-native/macos`)

1. Install prerequisites: [Node.js](https://nodejs.org), [Cocoapods](https://cocoapods.org/), [Yarn](https://yarnpkg.com/)
2. Install NPM packages and Pods. This will create XCode workspace including the Pod project/targets.
  
    ```sh
    cd react-native
    yarn install
    pod install
    ```

3. Open Xcode project and assign Code Signing Identity
4. Compile from command line

    ```sh
    yarn macos
    ```
