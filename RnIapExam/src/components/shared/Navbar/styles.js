import EStyleSheet from 'react-native-extended-stylesheet';
import { Platform } from 'react-native';

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

export default styles;
