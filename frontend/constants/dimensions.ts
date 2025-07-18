import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const guidelineBaseWidth = 375;
export const guidelineBaseHeight = 812;

export const scale = (size: number) =>
  (SCREEN_WIDTH / guidelineBaseWidth) * size;

export const verticalScale = (size: number) =>
  (SCREEN_HEIGHT / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
};
