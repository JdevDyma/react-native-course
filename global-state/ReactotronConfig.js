import Reactotron from "reactotron-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { reactotronRedux } from "reactotron-redux";

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({ name: "Global State" })
  .use(reactotronRedux())
  .useReactNative()
  .connect();

export default reactotron;
