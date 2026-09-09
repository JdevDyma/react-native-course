import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";

const reactotron = Reactotron
  .setAsyncStorageHandler(AsyncStorage)
  .configure({ name: "Project Shoes" })
  .use(reactotronRedux())
  .useReactNative()
  .connect();

export default reactotron;
