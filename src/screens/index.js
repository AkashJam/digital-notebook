import HomePage from "./HomePage";
import { UserProvider } from "../globalvars";
import AuthPage from "./AuthPage";
import SettingsPage from "./SettingsPage";
import ActivityPage from "./ActivityPage";
import CategoryPage from "./CategoryPage";
import { UserNotifications } from "../components";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

function StackNav() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={AuthPage} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Categories" component={CategoryPage} />
      <Stack.Screen name="Activity" component={ActivityPage} />
      <Stack.Screen name="Settings" component={SettingsPage} />
    </Stack.Navigator>
  );
}

export default function UI() {
  return (
    <UserProvider>
      <NavigationContainer>
        <StackNav />
        <UserNotifications />
      </NavigationContainer>
    </UserProvider>
  );
}
