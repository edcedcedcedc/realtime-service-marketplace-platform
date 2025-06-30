import AppLayout from "../AppLayout";
import RootNavigator from "./RootNavigator";

export default function WrappedRootNavigator() {
  return (
    <AppLayout>
      <RootNavigator />
    </AppLayout>
  );
}
