import { createNavigationContainerRef } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/RootNavigator";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = <Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name],
) => {
  if (!navigationRef.isReady()) return;

  const args = params !== undefined ? [name, params] : [name];
  navigationRef.navigate(...(args as any));
};
