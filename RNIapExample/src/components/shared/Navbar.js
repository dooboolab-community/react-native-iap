import React, { Component } from 'react';
import {
  Dimensions,
  View,
  Text,
  TouchableHighlight,
  Image,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

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
              source={ require('../../../assets/icons/icBack.png') }
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
              source={ require('../../../assets/icons/icSetting.png') }
            />
          </TouchableHighlight>
          : <View style={styles.rightMenu}/>
      }
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    borderColor: '#eee',
  },
  title: {
    fontSize: '$20',
    fontWeight: 'bold',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  leftMenu: {
    width: '$48',
    height: '$48',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  rightMenu: {
    width: '$48',
    height: '$48',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default NavBar;
