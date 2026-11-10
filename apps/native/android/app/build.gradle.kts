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
            // Debug talks to production by default (owner, 10-nov-2026: no users yet).
            // For a backend on this Mac: ./gradlew -Pordo.apiBaseUrl=http://10.0.2.2:3101/api/v1 …
            val debugApi =
                providers.gradleProperty("ordo.apiBaseUrl")
                    .getOrElse("https://api.ordotodo.app/api/v1")
            buildConfigField("String", "API_BASE_URL", "\"$debugApi\"")
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
    // Glance widget (F4b): pinned to the cached 1.2.0, verified --offline.
    // androidx.work is excluded on purpose: the widget never schedules
    // periodic updates (the app pushes a refresh on every pull instead),
    // and work-runtime 2.7.1 is not in the offline cache.
    implementation("androidx.glance:glance-appwidget:1.2.0") {
        exclude(group = "androidx.work")
    }
    implementation("androidx.glance:glance-material3:1.2.0") {
        exclude(group = "androidx.work")
    }
    testImplementation(libs.junit)
}
