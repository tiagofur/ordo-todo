// Mock @react-native-async-storage/async-storage (MUST BE FIRST)
jest.mock("@react-native-async-storage/async-storage", () => ({
  AsyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    mergeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    multiMerge: jest.fn(),
    default: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      mergeItem: jest.fn(),
      clear: jest.fn(),
      getAllKeys: jest.fn(),
      multiGet: jest.fn(),
      multiSet: jest.fn(),
      multiRemove: jest.fn(),
      multiMerge: jest.fn(),
    },
  },
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const View = ({ children, style }) =>
    React.createElement("View", { style }, children);
  return {
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn((cb) => ({})),
    useAnimatedProps: jest.fn((cb) => ({})),
    withSpring: jest.fn((val) => val),
    withTiming: jest.fn((val) => val),
    withSequence: jest.fn((...args) => args[0]),
    withDelay: jest.fn((delay, anim) => anim),
    withRepeat: jest.fn((anim) => anim),
    cancelAnimation: jest.fn(),
    measure: jest.fn(),
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
    Easing: {
      bezier: jest.fn(() => ({})),
      out: jest.fn(() => ({})),
      in: jest.fn(() => ({})),
      inOut: jest.fn(() => ({})),
      ease: jest.fn(() => ({})),
      linear: jest.fn(() => ({})),
    },
    View: View,
    default: {
      View: View,
    },
  };
});

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
}));

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  return {
    LinearGradient: ({ children, style }) =>
      React.createElement("View", { style }, children),
  };
});

// Mock expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Feather: ({ name, size, color, style }) =>
      React.createElement("Text", { style, name, size, color }, "Icon"),
  };
});
