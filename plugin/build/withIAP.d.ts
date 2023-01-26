import type {ConfigPlugin} from '@expo/config-plugins';
declare type PaymentProvider = 'Amazon AppStore' | 'both' | 'Play Store';
export declare const modifyAppBuildGradle: (
  buildGradle: string,
  paymentProvider: PaymentProvider,
) => string;
export declare const modifyProjectBuildGradle: (buildGradle: string) => string;
interface Props {
  paymentProvider?: PaymentProvider;
}
declare const withIAP: ConfigPlugin<Props | undefined>;
export default withIAP;
