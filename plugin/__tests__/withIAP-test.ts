import {modifyAppBuildGradle, modifyProjectBuildGradle} from '../src/withIAP';

import {
  appBuildGradleWithAmazonStoreIAP,
  appBuildGradleWithBothIAP,
  appBuildGradleWithoutIAP,
  appBuildGradleWithPlayStoreIAP,
  projectBuildGradleWithIAP,
  projectBuildGradleWithoutIAP,
} from './fixtures/buildGradleFiles';

jest.mock('@expo/config-plugins', () => {
  const plugins = jest.requireActual('@expo/config-plugins');

  return {
    ...plugins,
    WarningAggregator: {addWarningAndroid: jest.fn()},
  };
});

describe('Configures Android native project correctly', () => {
  it(`Add supportLibVersion to android/build.gradle if it is not present`, () => {
    expect(modifyProjectBuildGradle(projectBuildGradleWithoutIAP)).toMatch(
      projectBuildGradleWithIAP,
    );
  });

  it(`Add play store missingDimenstionStrategy to android/app/build.gradle if is not present`, () => {
    expect(
      modifyAppBuildGradle(appBuildGradleWithoutIAP, 'Play Store'),
    ).toMatch(appBuildGradleWithPlayStoreIAP);
  });

  it(`Add amazon store missingDimenstionStrategy to android/app/build.gradle if is not present`, () => {
    expect(
      modifyAppBuildGradle(appBuildGradleWithoutIAP, 'Amazon AppStore'),
    ).toMatch(appBuildGradleWithAmazonStoreIAP);
  });

  it(`Add play store and amazon payment providers to android/app/build.gradle if is not present`, () => {
    expect(modifyAppBuildGradle(appBuildGradleWithoutIAP, 'both')).toMatch(
      appBuildGradleWithBothIAP,
    );
  });
  it(`Doesn't modify android/build.gradle if supportLibVersion already configured`, () => {
    expect(modifyProjectBuildGradle(projectBuildGradleWithIAP)).toMatch(
      projectBuildGradleWithIAP,
    );
  });

  it(`Doesn't modify android/app/build.gradle if missingDimensionStrategy already configured`, () => {
    expect(
      modifyAppBuildGradle(appBuildGradleWithPlayStoreIAP, 'Play Store'),
    ).toMatch(appBuildGradleWithPlayStoreIAP);
  });
});
