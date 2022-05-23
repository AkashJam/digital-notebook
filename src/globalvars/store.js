import React, { useReducer } from "react";
import { toastr } from "./";
import AsyncStorage from "@react-native-async-storage/async-storage";

const user = {
  id: 0,
  username: "",
  displayName: null,
  range: 0.75,
  collaborators: [],
  groups: [],
  activities: [],
  locations: {},
};

const storeUserLog = (data) =>
  AsyncStorage.setItem(`DN_userlog`, JSON.stringify(data));

const reducer = (state, action) => {
  let log = [];
  let obj = {};
  switch (action.type) {
    //users

    case "set_user":
      // console.log(action.locations);
      obj = {
        id: action.user.id,
        username: action.user.username,
        displayName: action.user.displayName,
        range: action.user.range,
        collaborators: action.user.collaborators,
        groups: action.user.groups,
        activities: action.user.activities,
        locations: action.locations,
      };
      storeUserLog(obj);
      toastr(
        `Welcome ${
          action.user.displayName !== null
            ? action.user.displayName
            : action.user.username
        }`
      );
      return obj;

    case "update_user_name":
      // obj = await API.updateUser({
      //   id: state.id,
      //   task: { display_name: action.displayName },
      // });
      // if (obj.code == 200) {
      obj = {
        id: state.id,
        username: state.username,
        displayName: action.user.displayName,
        range: state.range,
        collaborators: action.collaborators,
        groups: state.groups,
        activities: state.activities,
        locations: state.locations,
      };
      storeUserLog(obj);
      toastr("Display name updated.");
      return obj;
    // } else {
    //   toastr("Error connecting to server.", toastTime);
    //   return state;
    // }

    case "update_user_range":
      // obj = await API.updateUser({
      //   id: state.id,
      //   user: { range: action.range },
      // });
      // if (obj.code == 200) {
      obj = {
        id: state.id,
        username: state.username,
        displayName: state.displayName,
        range: action.range,
        collaborators: state.collaborators,
        groups: state.groups,
        activities: state.activities,
        locations: state.locations,
      };
      storeUserLog(obj);
      toastr("Notification range updated.");
      return obj;
    // } else {
    //   toastr("Error connecting to server.", toastTime);
    //   return state;
    // }

    //activities
    case "add_task":
      const newTask = {
        id: obj.id,
        description: action.description,
        group_id: action.group_id,
        notify: false,
        location: null,
        datetime: action.datetime !== undefined ? action.datetime : null,
        completed: false,
        active: true,
        createdOn: new Date().toString(),
        modifiedOn: null,
      };
      log = [newTask, ...state.activities];
      obj = { ...state, activities: log };
      storeUserLog(obj);
      toastr("Task added.");
      return obj;

    case "rename_task":
      log = state.activities.map((activity) => {
        if (activity.id === action.id) {
          return {
            ...activity,
            description: action.description,
            modifiedOn: new Date().toString(),
          };
        } else {
          return activity;
        }
      });
      obj = { ...state, activities: log };
      storeUserLog(obj);
      toastr("Task renamed.");
      return obj;

    case "delete_task":
      log = state.activities.filter((activity) => {
        if (activity.id !== action.id) return activity;
      });
      obj = { ...state, activities: log };
      storeUserLog(obj);
      toastr("Task deleted.");
      return obj;

    case "change_group":
      log = state.activities.map((activity) => {
        if (activity.id === action.id) {
          return {
            ...activity,
            group_id: action.group_id,
            modifiedOn: new Date().toString(),
          };
        } else {
          return activity;
        }
      });
      obj = { ...state, activities: log };
      storeUserLog(obj);
      toastr("Group changed.");
      return obj;

    case "change_datetime":
      log = state.activities.map((activity) => {
        if (activity.id === action.id) {
          return {
            ...activity,
            datetime: action.datetime,
            modifiedOn: new Date().toString(),
          };
        } else {
          return activity;
        }
      });
      obj = { ...state, activities: log };
      storeUserLog(obj);
      toastr("Date and time changed.");
      return obj;

    case "change_location":
      log = state.activities.map((activity) => {
        if (activity.id === action.id) {
          return {
            ...activity,
            location: action.location,
            modifiedOn: new Date().toString(),
          };
        } else {
          return activity;
        }
      });
      obj = { ...state, activities: log };
      storeUserLog(obj);
      toastr("Location changed.");
      return obj;

    case "toggle_notifications":
      log = state.activities.map((activity) => {
        if (activity.id === action.id) {
          return {
            ...activity,
            notify: action.notify,
            modifiedOn: new Date().toString(),
          };
        } else {
          return activity;
        }
      });
      obj = { ...state, activities: log };
      storeUserLog(obj);
      toastr(action.notify ? "Notification On." : "Notification Off.");
      return obj;

    case "toggle_completion":
      log = state.activities.map((activity) => {
        if (activity.id === action.id) {
          return {
            ...activity,
            completed: action.completed,
            datetime: new Date().toString(),
            modifiedOn: new Date().toString(),
          };
        } else {
          return activity;
        }
      });
      obj = { ...state, activities: log };
      storeUserLog(obj);
      toastr(
        action.completed ? "Task completed." : "Task no longer completed."
      );
      return obj;

    // groups
    case "add_group":
      let newGroup = {
        id: obj.id,
        name: action.name,
        active: true,
        createdOn: new Date().toString(),
        modifiedOn: null,
      };
      log = [newGroup, ...state.groups];
      obj = { ...state, groups: log };
      storeUserLog(obj);
      toastr("Group added.");
      return obj;

    case "rename_group":
      // obj = await API.updateGroup({
      //   id: action.id,
      //   group: { name: action.name },
      // });
      // if (obj.code == 200) {
      log = state.groups.map((group) => {
        if (group.id === action.id) {
          return {
            ...activity,
            name: action.name,
            modifiedOn: new Date().toString(),
          };
        } else {
          return group;
        }
      });
      obj = { ...state, groups: log };
      storeUserLog(obj);
      toastr("Group renamed.");
      return obj;
    // } else {
    //   toastr("Error connecting to server.", toastTime);
    //   return state;
    // }

    case "delete_group":
      // obj = await API.updateGroup({
      //   id: action.id,
      //   group: { active: false },
      // });
      // if (obj.code == 200) {
      log = state.groups.filter((group) => {
        if (group.id !== action.id) return group;
      });
      obj = { ...state, groups: log };
      storeUserLog(obj);
      toastr("Group deleted.");
      return obj;
    // } else {
    //   toastr("Error connecting to server.", toastTime);
    //   return state;
    // }

    // locations
    case "set_location":
      obj = state.locations?state.locations:{};
      obj.lat = action.lat;
      obj.lon = action.lon;
      obj[`${action.use}`] = action.location;
      storeUserLog({ ...state, locations: obj });
      return { ...state, locations: obj };

    default:
      return state;
  }
};

const UserContext = React.createContext({
  state: user,
  dispatch: () => null,
});

const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, user);

  return (
    <UserContext.Provider value={[state, dispatch]}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };