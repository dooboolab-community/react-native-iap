import {Platform} from 'react-native';

export const linkingError = new Proxy(
  {},
  {
    get() {
      throw new Error(
        `The package 'react-native-iap' doesn't seem to be linked. Make sure: \n\n` +
          Platform.select({
            ios: "- You have run 'pod install'\n",
            default: '',
          }) +
          '- You rebuilt the app after installing the package\n' +
          '- You are not using Expo managed workflow\n',
      );
    },
  },
);
