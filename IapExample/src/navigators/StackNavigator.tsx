import React from 'react';
import {withIAPContext} from 'react-native-iap';
import {createStackNavigator} from '@react-navigation/stack';

import {
  ClassSetup,
  Examples,
  Products,
  PurchaseHistory,
  Subscriptions,
} from '../screens';
import {AvailablePurchases} from '../screens/AvailablePurchases';

export const examples = [
  {
    name: 'Products',
    label: 'With success and error listeners.',
    component: withIAPContext(Products),
    section: 'Context',
    color: '#47d371',
    emoji: '💵',
  },
  {
    name: 'Subscriptions',
    component: withIAPContext(Subscriptions),
    section: 'Context',
    color: '#cebf38',
    emoji: '💳',
  },
  {
    name: 'PurchaseHistory',
    component: withIAPContext(PurchaseHistory),
    section: 'Context',
    color: '#c241b3',
    emoji: '📄',
  },
  {
    name: 'AvailablePurchases',
    component: withIAPContext(AvailablePurchases),
    section: 'Context',
    color: '#475ed3',
    emoji: '🧾',
  },
  {
    name: 'ClassSetup',
    component: ClassSetup,
    section: 'Others',
    color: '#b947d3',
    emoji: '',
  },
] as const;

export type Screens = {
  Examples: undefined;
  Products: undefined;
  Subscriptions: undefined;
  PurchaseHistory: undefined;
  AvailablePurchases: undefined;
  Listeners: undefined;
  ClassSetup: undefined;
};

const Stack = createStackNavigator<Screens>();

export const StackNavigator = () => (
  <Stack.Navigator screenOptions={{title: 'React Native IAP'}}>
    <Stack.Screen name="Examples" component={Examples} />

    {examples.map(({name, component}) => (
      <Stack.Screen
        key={name}
        name={name}
        component={component}
        options={{
          title: name,
          headerBackTitle: 'Examples',
        }}
      />
    ))}
  </Stack.Navigator>
);
