require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "RNIap"
  s.version      = package['version']
  s.summary      = "RNIap"
  s.description  = package['description']
  s.homepage     = "https://github.com/dooboolab/react-native-iap"
  s.license      = "MIT"
  s.author       = package['author']
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/RNIap.git", :tag => "master" }
  s.source_files  = "ios/*.{h,m}"
  s.requires_arc = true

  s.dependency 'React'
end

  
