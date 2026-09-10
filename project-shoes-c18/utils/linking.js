import { Linking, Platform } from "react-native";
import * as ExpoLinking from "expo-linking";
import * as Notifications from "expo-notifications";
import store from "../store/store";
import { shoes } from "../data/shoes";
import { createDeepLinkPolicy } from "../lib/deepLinkPolicy";
import { createNavigationInbox } from "../lib/navigationInbox";
import { startLinkReception } from "../lib/linkReception";

const prefixes = [...new Set([ExpoLinking.createURL("/"), "dyma-shoes://"])];
const shoeIds = shoes.flatMap(brand => brand.stock.map(shoe => shoe.id));
const inbox = createNavigationInbox(createDeepLinkPolicy(prefixes, shoeIds));
const seenResponses = new Set();

export const linkingConfig = {
  prefixes,
  config: {
    initialRouteName: "DrawerNavigator",
    screens: {
      DrawerNavigator: {
        screens: {
          BottomTabs: {
            screens: {
              HomeStack: { screens: { Home: "" } },
              Notifications: "notifications",
            },
          },
        },
      },
      Details: "details/:id",
      MainCart: "cart",
    },
  },
  // Le récepteur conserve le lien pendant que MainStack restaure la session.
  getInitialURL: async () => null,
  subscribe: listener => inbox.subscribe(listener),
};

export function setDeepLinkReady(ready) {
  inbox.setReady(ready);
}

export function startDeepLinks() {
  const updateSession = () => {
    const { userId, generation } = store.getState().auth;
    inbox.updateSession({ userId, generation });
  };
  updateSession();
  const unsubscribeStore = store.subscribe(updateSession);
  const stopReception = startLinkReception({
    linking: Linking,
    notifications: Notifications,
    inbox,
    seenResponses,
    notificationsSupported: Platform.OS === "android" || Platform.OS === "ios",
  });
  return () => {
    unsubscribeStore();
    stopReception();
  };
}
