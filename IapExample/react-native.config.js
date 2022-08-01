module.exports = {
    dependencies: {
      'react-native-iap': {
        platforms: {
          ios: null, // disable ios platform, so we can use local files
          android: null, // disable android platform, so we can use the local files
        },
      },
    },
  },
};
