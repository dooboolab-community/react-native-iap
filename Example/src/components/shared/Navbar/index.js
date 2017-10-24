import React, { Component } from 'react';
import {
  Dimensions,
  View,
  Text,
  TouchableHighlight,
  Image,
} from 'react-native';

import styles from './styles';

const NavBar = ({ showBack, showOption, handleBack, handleOption, children, }) => {
  return (
    <View style = { styles.container }>
      {
        showBack
          ? <TouchableHighlight
            underlayColor="#ccc"
            style={styles.leftMenu}
            onPress={ handleBack }
          >
            <Image
              style={styles.center}
              source={ require('../../../../assets/icons/icBack.png') }
            />
          </TouchableHighlight>
          : <View style={styles.leftMenu}/>
      }
      <Text style={[
        styles.center,
        styles.title,
      ]}>{ children }</Text>
      {
        showOption
          ? <TouchableHighlight
            underlayColor="#ccc"
            style={styles.rightMenu}
            onPress={ handleOption }
          >
            <Image
              style={styles.center}
              source={ require('../../../../assets/icons/icSetting.png') }
            />
          </TouchableHighlight>
          : <View style={styles.rightMenu}/>
      }
    </View>
  );
};

export default NavBar;
