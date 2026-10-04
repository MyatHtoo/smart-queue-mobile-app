import { MD3LightTheme as DefaultTheme } from "react-native-paper";
import { colors } from './design';

export const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.success,
    background: colors.background,
    surface: colors.surface,
  },
};
