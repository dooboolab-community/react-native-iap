import EStyleSheet from 'react-native-extended-stylesheet';
import { ratio, width, height } from './constants/GlobalStyles';

EStyleSheet.build({
  $screenWidth: width,
  $screenHeight: height,
  $ratio: ratio,

  $statusPaddingSize: 20 * ratio,
  $statusSize: 24 * ratio,
  $headerSize: 56 * ratio,
  $fontTitle: 28 * ratio,
  $fontBigSize: 24 * ratio,
  $fontSize: 16 * ratio,

  $1: 1 * ratio,
  $2: 2 * ratio,
  $4: 4 * ratio,
  $8: 8 * ratio,
  $12: 12 * ratio,
  $16: 16 * ratio,
  $20: 20 * ratio,
  $24: 24 * ratio,
  $28: 28 * ratio,
  $32: 32 * ratio,
  $36: 36 * ratio,
  $40: 40 * ratio,
  $44: 44 * ratio,
  $48: 48 * ratio,
  $52: 52 * ratio,
  $56: 56 * ratio,
  $60: 60 * ratio,
  $64: 64 * ratio,
  $68: 68 * ratio,
  $72: 72 * ratio,
  $76: 76 * ratio,
  $80: 80 * ratio,
});
