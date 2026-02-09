import { View, Image, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { Restaurant } from "../src/constants/types";


interface Props {
  restaurant: Restaurant;
}

export default function RestaurantsCard({ restaurant }: Props) {
  const { id, name, cuisine, distance, waitInfo, image } = restaurant;
  const navigation = useNavigation();

  const handleJoinQueue = () => {
       navigation.navigate("Screens", { screen: "JoinQueue", params: { restaurant } });
  };

  return (
 <View style={{ marginBottom: 16, borderRadius: 20, borderWidth: 2, borderColor: "#17a2b8", backgroundColor: "white", overflow: "hidden" }}>
  <View style={{ flexDirection: "row", height: 140 }}>

    {/* Left Image */}
    <View style={{ width: "35%" }}>
      <Image
        source={image}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </View>

    {/* Right Content */}
    <View style={{ width: "65%", paddingHorizontal: 12, paddingVertical: 8, justifyContent: "space-between" }}>
      <View>
        <Text style={{ fontWeight: "600", fontSize: 15, color: "#111" }} numberOfLines={2}>
          {name}
        </Text>

        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
          {cuisine} • {distance}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <Ionicons name="people" size={14} color="#6B7280" />
          <Text style={{ fontSize: 12, color: "#6B7280", marginLeft: 4 }}>
            {waitInfo} in queue
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleJoinQueue}
        style={{ backgroundColor: "#17a2b8", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" }}
      >
        <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>
          Join Queue
        </Text>
      </TouchableOpacity>
    </View>

  </View>
</View>

  );
}