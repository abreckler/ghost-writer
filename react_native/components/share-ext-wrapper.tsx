import React, { FC, PropsWithChildren } from 'react';
import { ViewProps, Platform, ModalProps, Modal, View } from 'react-native';

const ShareExtWrapper: FC<PropsWithChildren<ModalProps>> = ({ children, ...props}) => {

  if (Platform.OS === 'macos') {
    // NOTE: Modal does not support MacOS yet
    let viewprops = props as ViewProps;
    return (
      <View {...viewprops}>
        {children}
      </View>
    );
  }
  else {
    return (
      <Modal {...props}>
        {children}
      </Modal>
    );
  }

}

export { ShareExtWrapper };