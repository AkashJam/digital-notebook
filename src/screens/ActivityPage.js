import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { UserContext, toastr, API } from "../globalvars";
import { COLORS, PAGE, SIZES, FONTS } from "../constants";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TextInput } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import { Header, LocateMap } from "../components";

export default function ActivityPage({ route }) {
  const [state, dispatch] = React.useContext(UserContext);
  const [task, setTask] = useState(
    state.activities.filter((task) => task.id === route.params.id)[0]
  );

  const [name, setName] = useState(task.description);
  const [notify, setNotify] = useState(task.notify);
  const [calendarClock, setCalendarClock] = useState(false);
  const [map, setMap] = useState(false);
  const [date, setDate] = useState(
    task.datetime ? new Date(task.datetime) : new Date()
  );

  const [open, setOpen] = useState(false);
  const def = state.groups.filter((group) => group.name === "All");
  const [value, setValue] = useState(def[0].id);
  let categories = [];
  state.groups.forEach((element) => {
    if (element.active)
      categories.push({ label: element.name, value: element.id });
  });
  const [items, setItems] = useState(categories);

  const toggleCalendarClock = () => {
    setCalendarClock(!calendarClock);
  };

  const navigation = useNavigation();
  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    setCalendarClock(false);
    if (task.datetime !== selectedDate.toString())
      manageTask.changeDate(task.id, selectedDate);
  };

  const handleToggle = () => {
    if (
      !notify &&
      (!task.datetime ||
        (task.datetime && new Date(task.datetime) < new Date())) &&
      !task.location
    ) {
      Alert.alert(
        "Unable to Notify",
        "Requires either a date and time set in the future or a location",
        [
          {
            text: "Ok",
            style: "cancel",
          },
        ]
      );
    } else {
      manageTask.notifyToggle(task.id, !notify);
      setNotify(!notify);
    }
  };

  const handleEdit = async () => {
    if (name !== "") {
      if (task.description !== name) manageTask.renameTask(task.id, name);
      if (task.group_id !== value) manageTask.changeGroup(task.id, value);
      navigation.goBack();
    } else toastr("Task needs a name.");
  };

  const setLocation = (location) => {
    if (task.location !== location) {
      manageTask.changeLocation(task.id, location);
      setMap(false);
    }
  };

  const removeLocation = () => {
    if (task.location !== null) {
      Alert.alert(
        "Remove Location",
        "Are you sure you want to remove location tag?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => manageTask.changeLocation(task.id, null),
          },
        ]
      );
    }
  };

  const removeDate = () => {
    if (task.datetime !== null) {
      Alert.alert("Remove Date", "Are you sure you want to remove date tag?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => manageTask.changeDate(task.id, null),
        },
      ]);
    }
  };

  let data = {};
  const manageTask = {
    setCompleted: async (id, value) => {
      try {
        data = await API.updateTask({
          id: id,
          task: { completed: value, datetime: new Date() },
        });
        if (data.code == 200)
          dispatch({ type: "toggle_completion", id: id, completed: value });
        else toastr(data.status);
      } catch (error) {
        console.log(error);
      }
    },
    renameTask: async (id, value) => {
      try {
        data = await API.updateTask({
          id: id,
          task: { description: value },
        });
        if (data.code == 200)
          dispatch({ type: "rename_task", id: id, name: value });
        else toastr(data.status);
      } catch (error) {
        console.log(error);
      }
    },
    notifyToggle: async (id, value) => {
      try {
        data = await API.updateTask({
          id: action.id,
          task: { notify: action.notify },
        });
        if (data.code == 200)
          dispatch({ type: "toggle_notification", id: id, notify: value });
        else toastr(data.status);
      } catch (error) {
        console.log(error);
      }
    },
    changeDate: async (id, value) => {
      try {
        data = await API.updateTask({
          id: id,
          task: { datetime: value },
        });
        if (data.code == 200) {
          dispatch({ type: "change_datetime", id: id, datetime: value });
          setTask({ ...task, datetime: value });
        } else {
          toastr(data.status);
        }
      } catch (error) {
        console.log(error);
      }
    },
    changeLocation: async (id, value) => {
      try {
        data = await API.updateTask({
          id: id,
          task: { location: value },
        });
        if (data.code == 200) {
          dispatch({ type: "change_location", id: id, location: value });
          setTask({ ...task, location: value });
        } else {
          toastr(data.status);
        }
      } catch (error) {
        console.log(error);
      }
    },
    changeGroup: async (id, value) => {
      try {
        data = await API.updateTask({
          id: id,
          task: { group_id: value },
        });
        if (data.code == 200)
          dispatch({ type: "change_group", id: id, group_id: value });
        else toastr(data.status);
      } catch (error) {
        console.log(error);
      }
    },
    deleteTask: (id) => {
      Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            data = await API.updateTask({
              id: id,
              task: { active: false },
            });
            if (data.code == 200) dispatch({ type: "delete_task", id: id });
            else toastr(data.status);
          },
        },
      ]);
    },
  };

  return (
    <>
      <Header screen={"Activity"} />
      <DateTimePickerModal
        isVisible={calendarClock}
        date={date}
        mode={"datetime"}
        onCancel={toggleCalendarClock}
        onConfirm={handleConfirm}
      />
      <LocateMap
        map={map}
        location={task.location}
        close={() => setMap(false)}
        setLocation={setLocation}
      />
      <View style={PAGE} pointerEvents={map ? "none" : "auto"}>
        <DropDownPicker
          style={styles.dropdown}
          dropDownContainerStyle={styles.container}
          textStyle={{
            color: COLORS.secondary,
            ...FONTS.h1_bold,
          }}
          listItemLabelStyle={FONTS.p_regular}
          searchTextInputStyle={FONTS.p_regular}
          searchable={true}
          searchPlaceholder="Enter a group name"
          addCustomItem={true}
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
        />
        <View
          style={{
            flexDirection: "row",
            marginVertical: SIZES.padding,
            marginHorizontal: SIZES.margin,
            alignItems: "center",
          }}
        >
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notify ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleToggle}
            value={notify}
          />
          <Text
            style={{
              ...FONTS.p_regular,
              marginLeft: notify ? SIZES.margin : 0,
            }}
          >
            {notify ? "Alarm On" : "Alarm Off"}
          </Text>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={toggleCalendarClock}
            onLongPress={removeDate}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={32}
              color={
                notify && task.datetime && new Date(task.datetime) > new Date()
                  ? COLORS.accent
                  : COLORS.secondary
              }
            />
          </TouchableOpacity>
          <Text style={{ marginHorizontal: SIZES.padding, ...FONTS.p_regular }}>
            {task.datetime
              ? date.toDateString() + "\n" + date.toTimeString()
              : "Not Set"}
          </Text>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setMap(true)}
            onLongPress={removeLocation}
          >
            <MaterialIcons
              name="location-pin"
              size={32}
              color={
                notify &&
                task.location &&
                (!task.datetime ||
                  (task.datetime && new Date(task.datetime) > new Date()))
                  ? COLORS.accent
                  : COLORS.secondary
              }
            />
          </TouchableOpacity>
          <Text style={{ marginHorizontal: SIZES.padding, ...FONTS.p_regular }}>
            {task.location
              ? task.location.type === "custom"
                ? `Latitude: ${task.location.latitude}\nLongitude: ${task.location.longitude}`
                : `nearby ${task.location.type}`
              : "Not Set"}
          </Text>
        </View>
        <View
          style={{
            marginTop: SIZES.padding,
            marginHorizontal: SIZES.padding,
            padding: SIZES.padding,
            backgroundColor: COLORS.accent,
            borderRadius: SIZES.borderRadius,
          }}
        >
          <TextInput
            multiline={true}
            onChangeText={(text) => setName(text)}
            style={{
              ...styles.textInput,
              textDecorationLine: task.completed ? "line-through" : "none",
            }}
            placeholder="Add New Task"
            placeholderTextColor={COLORS.secondary}
            value={name}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              // backgroundColor: COLORS.accent,
              // marginHorizontal: SIZES.padding,
            }}
          >
            {/* <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.goBack()}
              >
                <Text style={{ ...FONTS.h2_bold, color: COLORS.primary }}>
                  Cancel
                </Text>
              </TouchableOpacity> */}
            <TouchableOpacity style={styles.button} onPress={handleEdit}>
              <Text style={{ ...FONTS.h2_bold, color: COLORS.primary }}>
                Ok
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = new StyleSheet.create({
  button: {
    height: 40,
    width: 80,
    borderRadius: SIZES.textBoxRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    ...FONTS.h2_bold,
    backgroundColor: COLORS.accent,
    marginTop: SIZES.padding,
    marginHorizontal: SIZES.padding,
    // padding: SIZES.padding,
    // paddingRight: 0,
    color: COLORS.secondary,
    textAlign: "justify",
  },
  position: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  container: {
    backgroundColor: COLORS.primary,
    // width: "75%",
  },
  tabs: {
    flexDirection: "row",
    // justifyContent: "space-between",
    margin: SIZES.padding,
    alignItems: "center",
  },
  container: {
    backgroundColor: COLORS.accent,
    marginHorizontal: SIZES.margin,
    width: "96%",
    padding: 10,
    borderWidth: 0,
  },
  dropdown: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    margin: SIZES.margin,
    width: "96%",
    borderRadius: SIZES.borderRadius,
    borderWidth: 0,
  },
});
