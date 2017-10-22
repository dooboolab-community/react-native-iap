using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace React.Native.Iap.RNReactNativeIap
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNReactNativeIapModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNReactNativeIapModule"/>.
        /// </summary>
        internal RNReactNativeIapModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNReactNativeIap";
            }
        }
    }
}
