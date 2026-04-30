import { ConfigContext, ExpoConfig } from "expo/config";

// ── EAS ───────────────────────────────────────────────────────────────────────
const EAS_PROJECT_ID = "f5951504-5ab8-4322-a4a0-4815e4363dc0";
const PROJECT_SLUG   = "x-clone";
const OWNER          = "juliasavchuk";

// ── Базова конфігурація ───────────────────────────────────────────────────────
const APP_NAME          = "X Clone";
const BUNDLE_IDENTIFIER = "com.juliasavchuk.xclone";
const PACKAGE_NAME      = "com.juliasavchuk.xclone";
const SCHEME            = "x-clone";

const ICON                     = "./assets/images/icon.png";
const ADAPTIVE_ICON_FOREGROUND = "./assets/icons/x-clone-foreground.png";
const ADAPTIVE_ICON_BACKGROUND = "./assets/icons/x-clone-background.png";

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment =
    (process.env.APP_ENV as "development" | "preview" | "production") ||
    "development";

  console.log("⚙️  Building for environment:", environment);
  console.log("📦 Convex URL:", process.env.EXPO_PUBLIC_CONVEX_URL);
  console.log(
    "🔐 Clerk Key:",
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + "...",
  );

  const dynamicConfig = getDynamicAppConfig(environment);

  return {
    ...config,
    name:               dynamicConfig.name,
    slug:               PROJECT_SLUG,
    version:            "1.0.0",
    orientation:        "portrait",
    icon:               dynamicConfig.icon,
    scheme:             dynamicConfig.scheme,
    userInterfaceStyle: "automatic",
    newArchEnabled:     true,

    ios: {
      supportsTablet:   true,
      bundleIdentifier: dynamicConfig.bundleIdentifier,
      buildNumber:      "1",
      infoPlist: {
        NSCameraUsageDescription:
          "This app uses the camera to take photos for posts.",
        NSPhotoLibraryUsageDescription:
          "This app accesses your photos to share in posts.",
      },
    },

    android: {
      package:     dynamicConfig.packageName,
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor:  "#000000",
        foregroundImage:  dynamicConfig.adaptiveIconForeground,
        backgroundImage:  dynamicConfig.adaptiveIconBackground,
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO",
      ],
    },

    web: {
      output:  "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image:           "./assets/images/splash-icon.png",
          imageWidth:      200,
          resizeMode:      "contain",
          backgroundColor: "#000000",
        },
      ],
      "expo-secure-store",
      "expo-image-picker",
      [
        "expo-build-properties",
        {
          android: {
            packagingOptions: {
              pickFirst: ["META-INF/versions/9/OSGI-INF/MANIFEST.MF"],
            },
          },
        },
      ],
    ],

    experiments: {
      typedRoutes:   true,
      reactCompiler: true,
    },

    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },

    runtimeVersion: {
      policy: "appVersion",
    },

    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      router: {},
    },

    owner: OWNER,
  };
};

export const getDynamicAppConfig = (
  environment: "development" | "preview" | "production",
) => {
  if (environment === "development") {
    return {
      name:                   `${APP_NAME} Dev`,
      bundleIdentifier:       `${BUNDLE_IDENTIFIER}.dev`,
      packageName:            `${PACKAGE_NAME}.dev`,
      icon:                   "./assets/icons/icon-dev.png",
      adaptiveIconForeground: "./assets/icons/x-clone-foreground-dev.png",
      adaptiveIconBackground: ADAPTIVE_ICON_BACKGROUND,
      scheme:                 `${SCHEME}-dev`,
    };
  }

  return {
    name:                   APP_NAME,
    bundleIdentifier:       BUNDLE_IDENTIFIER,
    packageName:            PACKAGE_NAME,
    icon:                   ICON,
    adaptiveIconForeground: ADAPTIVE_ICON_FOREGROUND,
    adaptiveIconBackground: ADAPTIVE_ICON_BACKGROUND,
    scheme:                 SCHEME,
  };
};