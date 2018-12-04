import React, { Component } from 'react';

import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StatusBar,
} from 'react-native';

import Styles from './Styles';

import { createStackNavigator, createAppContainer } from 'react-navigation';
import FirstPage from './components/pages/First';
import SecondPage from './components/pages/Second';

// const startPage = 'First';
const startPage = 'First';

class App extends Component {
  constructor(props) {
    super(props);
    this.navigator = null;
  }

  render() {
    const routeConfig = {
      First: {
        screen: FirstPage,
        path: 'first',
      },
      Second: {
        screen: SecondPage,
        path: 'second',
      },
    };
    const Navigator = createStackNavigator(routeConfig, {
      initialRouteName: startPage,
      header: null,
      headerMode: 'none',
      navigationOptions: {
        header: null,
      },
    });
    const AppContainer = createAppContainer(Navigator);
    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
        />
        <AppContainer
          onNavigationStateChange={(prevState, currentState) => {
            this.getActiveRouteName(currentState);
          }}
          uriPrefix='/'
        >
          <Navigator/>
        </AppContainer>
      </View>
    );
  }
}

export default App;
