plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "dev.creapolis.ordotodo"
    compileSdk = 37

    defaultConfig {
        // Same id as the Tauri app this replaces (ODD 050, D4); debug builds carry
        // a suffix so both can live on one device during the transition.
        applicationId = "dev.creapolis.ordotodo"
        minSdk = 29
        targetSdk = 37
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".dev"
            // Emulator loopback to the host backend (same contract as Tauri mobile).
            buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3101/api/v1\"")
        }
        release {
            buildConfigField("String", "API_BASE_URL", "\"https://api.ordotodo.app/api/v1\"")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    androidResources {
        // es (default, values/), en and pt-BR — the same three locales as the web.
        localeFilters += listOf("es", "en", "pt-rBR")
        // Per-app language picker in system settings (Android 13+).
        generateLocaleConfig = true
    }
}

dependencies {
    val composeBom = platform(libs.androidx.compose.bom)
    implementation(composeBom)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui.tooling.preview)
    debugImplementation(libs.androidx.compose.ui.tooling)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.okhttp)
    implementation(libs.androidx.datastore.preferences)
    testImplementation(libs.junit)
}
