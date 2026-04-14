Pod::Spec.new do |s|
  s.name           = 'OggyMLX'
  s.version        = '0.1.0'
  s.summary        = 'On-device LLM inference via MLX for Oggy'
  s.description    = 'Expo native module wrapping MLX-Swift for on-device Gemma model inference'
  s.homepage       = 'https://github.com/oggy-app'
  s.license        = { type: 'MIT' }
  s.author         = 'Oggy'
  s.source         = { git: '' }
  s.platform       = :ios, '17.0'
  s.swift_version  = '5.9'

  s.source_files   = 'src/**/*.swift'
  s.dependency 'ExpoModulesCore'
end
