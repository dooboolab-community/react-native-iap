import React from 'react';
import {storeKit2} from 'react-native-iap';
import {NavigationContainer} from '@react-navigation/native';

import {StackNavigator} from './navigators';
storeKit2();
export const App = () => (
  <NavigationContainer>
    <StackNavigator />
  </NavigationContainer>
);
