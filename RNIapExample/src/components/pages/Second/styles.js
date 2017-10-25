import EStyleSheet from 'react-native-extended-stylesheet';
import { Platform } from 'react-native';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : '$statusSize',
    paddingTop: Platform.OS === 'ios' ? '$statusPaddingSize' : 0,
    backgroundColor: 'white',
  },
  header: {
    flex: 8.8,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 87.5,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  txtResult: {
    fontSize: '$fontSize',
    padding: '$8',
  },
  btnNaverLogin: {
    height: '$48',
    width: '240 * $ratio',
    alignSelf: 'center',
    backgroundColor: '#00c40f',
    borderRadius: 0,
    borderWidth: 0,
  },
  txtNaverLogin: {
    fontSize: '$fontSize',
    color: 'white',
  },
});

export default styles;
