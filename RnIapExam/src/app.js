import React, { Component } from 'react';

import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StatusBar,
} from 'react-native';

import Styles from './Styles';

import { StackNavigator } from 'react-navigation';
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
    const Navigator = StackNavigator({
      First: {
        screen: FirstPage,
        path: 'first',
      },
      Second: {
        screen: SecondPage,
        path: 'second',
      },
    }, {
      initialRouteName: startPage,
      header: null,
      headerMode: 'none',
      navigationOptions: {
        header: null,
      },
    });
    return (
      <View style={{ flex: 1, }}>
        <StatusBar
          barStyle="dark-content"
        />
        <Navigator/>
      </View>
    );
  }
}

export default App;
