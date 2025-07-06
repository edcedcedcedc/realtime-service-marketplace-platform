import { PaperProvider } from "react-native-paper";
import AppLayout from "../AppLayout";
import RootNavigator from "./RootNavigator";

export default function WrappedRootNavigator() {
  return (
    <PaperProvider>
      <RootNavigator />
    </PaperProvider>
  );
}
