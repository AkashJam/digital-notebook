import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { COLORS, SIZES, FONTS, PAGEHEAD } from "../../constants/index";
import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import DropDownPicker from "react-native-dropdown-picker";
import * as Location from "expo-location";
import { UserContext, toastr } from "../../globalvars";

export default function LocateMap(props) {
  const [state, dispatch] = React.useContext(UserContext);
  const [coordinates, setCoordinates] = useState(
    props.location
      ? {
          latitude: props.location.latitude,
          longitude: props.location.longitude,
        }
      : null
  );

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    props.location ? props.location.type : "custom"
  );
  const categories = [
    { label: "Custom", value: "custom" },
    { label: "Hospital", value: "hospital" },
    { label: "Supermarket", value: "supermarket" },
    { label: "Library", value: "library" },
    { label: "ATM", value: "atm" },
    { label: "Bank", value: "bank" },
    { label: "Pharmacy", value: "pharmacy" },
    { label: "Post Office", value: "post_office" },
  ];
  const [items, setItems] = useState(categories);

  const location = useRef(null);
  const name = useRef("You are here");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        location.current = await Location.getCurrentPositionAsync({});
        if (!coordinates) {
          setCoordinates({
            latitude: location.current.coords.latitude,
            longitude: location.current.coords.longitude,
          });
        }
      }
    })();
  }, [coordinates]);

  useEffect(() => {
    // console.log(location.current);
    if (value !== "custom" && location.current) {
      if (
        state.locations &&
        state.locations.lat &&
        state.locations.lon &&
        (Math.abs(state.locations.lat - location.current.coords.latitude) >=
          0.05 ||
          Math.abs(state.locations.lon - location.current.coords.lon) >=
            0.05) &&
        state.locations[`${value}`] !== undefined &&
        state.locations[`${value}`].length !== 0
      ) {
        const loc_data = state.locations[`${value}`];
        const stored_loc = nearestPoint(loc_data);
        setCoordinates(stored_loc);
      } else {
        let type = value === "supermarket" ? "shop" : "amenity";
        fetch(
          `http://www.overpass-api.de/api/interpreter?data=[out:json];node
          ["${type}"=${value}]
          (${location.current.coords.latitude - 0.05},${
            location.current.coords.longitude - 0.05
          },${location.current.coords.latitude + 0.05},${
            location.current.coords.longitude + 0.05
          });
          out;`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.elements.length !== 0) {
              const API_data = data.elements.map((element) => {
                return {
                  id: element.id,
                  lat: element.lat,
                  lon: element.lon,
                  name: element.tags.name,
                };
              });
              dispatch({
                type: "set_location",
                lat: location.current.coords.latitude,
                lon: location.current.coords.longitude,
                location: API_data,
                use: value,
              });
              const API_loc = nearestPoint(API_data);
              setCoordinates(API_loc);
            }
          });
      }
    }
  }, [value]);

  const changeLocation = () => {
    props.setLocation({ type: value, ...coordinates });
  };

  function nearestPoint(data) {
    let lat = 0;
    let lon = 0;
    let delta = 100;
    for (let i = 0; i < data.length; i++) {
      let deltaTest = distance(
        data[i].lat,
        location.current.coords.latitude,
        data[i].lon,
        location.current.coords.longitude
      );
      if (delta > deltaTest) {
        lat = data[i].lat;
        lon = data[i].lon;
        delta = deltaTest;
        name.current = data[i].name;
        // console.log("closer", data);
      }
    }
    return {
      latitude: lat,
      longitude: lon,
    };
  }

  function distance(lat1, lat2, lon1, lon2) {
    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = (lon1 * Math.PI) / 180;
    lon2 = (lon2 * Math.PI) / 180;
    lat1 = (lat1 * Math.PI) / 180;
    lat2 = (lat2 * Math.PI) / 180;
    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a =
      Math.pow(Math.sin(dlat / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;
    // calculate the result
    return c * r;
  }

  if (!props.map) {
    return null;
  } else {
    return (
      <View style={styles.overlay}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={props.map}
          onRequestClose={() => props.close()}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ height: "100%", width: "100%" }}
            onPress={() => props.close()}
          >
            <View style={styles.modal}>
              <TouchableWithoutFeedback>
                <View
                  style={{
                    backgroundColor: "rgba(28,115,180,255)",
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <Text
                    style={{
                      ...PAGEHEAD,
                      marginHorizontal: SIZES.padding,
                      marginTop: SIZES.padding,
                    }}
                  >
                    Location
                  </Text>
                  <View
                    style={{
                      width: "100%",
                      padding: SIZES.padding,
                      justifyContent: "center",
                    }}
                  >
                    <DropDownPicker
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.container}
                      textStyle={{
                        color: COLORS.secondary,
                        ...FONTS.h2_bold,
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
                  </View>
                  {coordinates && (
                    <MapView
                      style={styles.map}
                      zoomControlEnabled={true}
                      region={{
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude,
                        latitudeDelta: 0.012,
                        longitudeDelta: 0.006,
                      }}
                    >
                      <Marker
                        draggable
                        pinColor="rgb(28,115,180)"
                        title={name.current}
                        coordinate={coordinates}
                        onDragEnd={(e) =>
                          setCoordinates(e.nativeEvent.coordinate)
                        }
                      />
                    </MapView>
                  )}
                  <View style={styles.bottom}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={props.close}
                    >
                      <Text
                        style={{ ...FONTS.h2_bold, color: "rgb(28,115,180)" }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={changeLocation}
                    >
                      <Text
                        style={{ ...FONTS.h2_bold, color: "rgb(28,115,180)" }}
                      >
                        Ok
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

const styles = new StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    elevation: 5,
  },
  modal: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    //   backgroundColor: COLORS.accent,
    padding: 20,
  },
  map: {
    // margin: SIZES.padding,
    borderColor: COLORS.accent,
    borderWidth: 10,
    width: Dimensions.get("window").width / 1.3,
    height: Dimensions.get("window").height / 2.3,
  },
  bottom: {
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: COLORS.accent,
    // borderTopWidth: 3,
    // borderColor: COLORS.secondary,
  },
  button: {
    height: 40,
    width: 80,
    borderRadius: SIZES.textBoxRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: COLORS.accent,
    marginHorizontal: SIZES.margin,
    width: "78.5%",
    padding: 10,
    borderWidth: 0,
  },
  dropdown: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    marginHorizontal: SIZES.margin,
    marginBottom: SIZES.margin,
    width: "80%",
    borderRadius: SIZES.borderRadius,
    borderWidth: 0,
  },
});
