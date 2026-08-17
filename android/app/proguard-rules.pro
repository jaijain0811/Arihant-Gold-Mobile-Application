# React Native ProGuard Rules for Google Play Store Production

# Keep React Native Native Modules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep Google Sign-In Native SDK
-keep class com.reactnativegooglesignin.** { *; }
-keep class com.google.android.gms.auth.api.signin.** { *; }

# Keep Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep OkHttp & Retrofit Network layer
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
