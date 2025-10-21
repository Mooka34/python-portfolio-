[app]
title = Fake Job Detector
package.name = fakejobdetector
package.domain = org.example
source.dir = .
source.include_exts = py,kv,png,jpg,atlas
version = 0.1.0
requirements = python3,kivy==2.3.0,kivymd==1.2.0
orientation = portrait
fullscreen = 0
icon.filename = assets/icon.png

# Optimize APK size
android.archs = armeabi-v7a, arm64-v8a
android.api = 29
android.minapi = 21

[buildozer]
log_level = 2
warn_on_root = 0
