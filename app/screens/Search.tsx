import { ScrollView, View, Text } from "react-native";
import { Searchbar, IconButton } from "react-native-paper";
import RestaurantsCard from "../../components/RestaurantsCard";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";


interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  distance: string;
  waitInfo: string;
  image: any;
}

const allRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Zhengxin Chicken Steak",
    cuisine: "Fast Food",
    distance: "1.4 km",
    waitInfo: "12",
    image: require("../../assets/images/ZhengXin.png"),
  },
  {
    id: "2",
    name: "Martini Cafe",
    cuisine: "European",
    distance: "1.4 km",
    waitInfo: "8",
    image: require("../../assets/images/Martini.webp"),
  },
  {
    id: "3",
    name: "Ah May Eain",
    cuisine: "Burmese",
    distance: "750 m",
    waitInfo: "5",
    image: require("../../assets/images/ah_may_eain.jpg"),
  },
  {
    id: "4",
    name: "คุณหนึ่งก๋วยเตี๋ยวไก่มะพร้าว",
    cuisine: "Thai",
    distance: "1.3 km",
    waitInfo: "8",
    image: require("../../assets/images/Thai.jpg"),
  },
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const initialQuery = (route.params as any)?.query || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filteredRestaurants = allRestaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-white">
        <Searchbar
          placeholder="Search restaurants..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          autoFocus={true}
          style={{
            backgroundColor: "#F5F5F5",
            borderRadius: 20,
            marginLeft: 15,
            marginRight: 15,
          }}
          elevation={0}
          iconColor="#00000"
        />
      </View>

      {/* Results Count */}
      {searchQuery.length > 0 && (
        <View className="px-8 py-2 bg-white">
          <Text style={{ fontSize: 14, color: "#6b7280", marginLeft: 15, marginTop: 8 }}>
            {filteredRestaurants.length} result{filteredRestaurants.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}

      {/* Results */}
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        >
          {searchQuery.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 60,
              }}
            >
              <IconButton
                icon="magnify"
                size={64}
                iconColor="#d1d5db"
                style={{ margin: 0 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: "#9ca3af",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                Enter a restaurant name or cuisine
              </Text>
            </View>
          ) : filteredRestaurants.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 60,
              }}
            >
              <IconButton
                icon="alert-circle-outline"
                size={64}
                iconColor="#d1d5db"
                style={{ margin: 0 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: "#9ca3af",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No results found
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#d1d5db",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Try searching with different keywords
              </Text>
            </View>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <RestaurantsCard
                key={restaurant.id}
                restaurant={restaurant}
              />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
