import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootNavigator";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export function navigate<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name],
) {
  if (navigationRef.isReady()) {
    const args = params !== undefined ? [name, params] : [name];
    navigationRef.navigate(...(args as any));
  }
}
