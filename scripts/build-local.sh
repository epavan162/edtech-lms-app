#!/bin/bash

# Fast Local Android Build Script
# Replicates the GitHub Actions CI/CD path

echo "🚀 Starting Local Native Build..."

# Ensure we are in the root
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this from the project root."
  exit 1
fi

echo "📦 Generating native android project..."
npx expo prebuild --platform android --clean --no-install

if [ $? -ne 0 ]; then
  echo "❌ Prebuild failed."
  exit 1
fi

echo "🔨 Compiling APK with Gradle..."
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon

if [ $? -ne 0 ]; then
  echo "❌ Gradle build failed. Ensure Android SDK and JDk 17 are installed."
  exit 1
fi

echo "✅ Build Successful!"
echo "📍 APK Location: android/app/build/outputs/apk/release/app-release.apk"
