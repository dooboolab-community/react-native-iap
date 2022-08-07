import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {StackNavigator} from './navigators';

export const App = () => (
  <NavigationContainer>
    <StackNavigator />
  </NavigationContainer>
);
