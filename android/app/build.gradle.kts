plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.yivu.learning.yivu"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.yivu.learning.yivu"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        // Uses the version code from pubspec.yaml. When using split APKs, 1000 * ABI_VERSION
        // is added automatically by Flutter. (https://developer.android.com/studio/build/configure-apk-splits#configure-APK-versions)
        // You can force using the value of versionCode by specifying the `-P force-version-code-ignoring-abi=true`
        // flag during build.
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

tasks.whenTaskAdded {
    if (name == "assembleRelease") {
        doLast {
            val outDir = layout.buildDirectory.dir("outputs/flutter-apk").get().asFile
            val releaseApk = File(outDir, "app-release.apk")
            if (releaseApk.exists()) {
                val vName = android.defaultConfig.versionName ?: "1.0.0"
                val versionedApk = File(outDir, "yivu-v${vName}-release.apk")
                releaseApk.copyTo(versionedApk, overwrite = true)
                println("Successfully created versioned APK: ${versionedApk.absolutePath}")
            }
        }
    }
    if (name == "assembleDebug") {
        doLast {
            val outDir = layout.buildDirectory.dir("outputs/flutter-apk").get().asFile
            val debugApk = File(outDir, "app-debug.apk")
            if (debugApk.exists()) {
                val vName = android.defaultConfig.versionName ?: "1.0.0"
                val versionedApk = File(outDir, "yivu-v${vName}-debug.apk")
                debugApk.copyTo(versionedApk, overwrite = true)
                println("Successfully created versioned APK: ${versionedApk.absolutePath}")
            }
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
