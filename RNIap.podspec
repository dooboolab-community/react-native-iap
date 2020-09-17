require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "RNIap"
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = "https://github.com/dooboolab/react-native-iap"
  s.license      = "MIT"
  s.author       = package['author']
  s.platforms    = { :ios => "9.0", :tvos => "9.0" }
  s.source       = { :git => "https://github.com/dooboolab/react-native-iap.git", :tag => "#{s.version}" }
  s.source_files = "ios/*.{h,m}"
  s.requires_arc = true

  s.dependency 'React-Core'
end
