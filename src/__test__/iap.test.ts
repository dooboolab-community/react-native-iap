import { NativeModules, Platform } from "react-native";
import { initConnection } from "../iap";

const rnLib = "../../node_modules/react-native/Libraries"

describe('Google Play IAP', () => {

  beforeEach(()=>{
    jest.mock( rnLib+'/Utilities/Platform', () => ({
      OS: 'android', 
      select: (dict: { [x: string]: any; }) => dict['android']
  }));
    
  });
    it('should call init on native module', async () => {
            const initVal = await initConnection();
            
            expect(NativeModules.RNIapModule.initConnection).toBeCalled()
            expect(NativeModules.RNIapAmazonModule.initConnection).not.toBeCalled()
    })
})
