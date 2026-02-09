import { ScrollView, View, Text } from "react-native";
import { Provider as PaperProvider, Searchbar, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import RestaurantsCard from "../../components/RestaurantsCard";

export default function HomePage() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "European", "Fast Food", "Burmese", "Thai"];

  const allRestaurants = [
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

  const filteredRestaurants = selectedCategory === "All"
    ? allRestaurants
    : allRestaurants.filter((restaurant) => restaurant.cuisine === selectedCategory);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>

      {/* Search Bar */}
      <View style={{  paddingTop: 10, paddingBottom: 12, backgroundColor: 'white' }}>
        <Searchbar
          placeholder="Search restaurants..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={() => {
            (navigation.navigate as any)('Screens', { screen: 'Search', params: { query: searchQuery } });
          }}
          onFocus={() => {
            (navigation.navigate as any)('Screens', { screen: 'Search', params: { query: searchQuery } });
          }}
          style={{ backgroundColor: "#F5F5F5", borderRadius: 20, marginLeft: 15, marginRight: 15 }}
          elevation={0}
          iconColor="#00000"
        />
      </View>

      {/* Category Chips */}
      <View className="pb-2 bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 12 }}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              mode="flat"
              showSelectedCheck={false}
              style={{
                backgroundColor:
                  selectedCategory === category ? "#17a2b8" : "#F5F5F5",
                borderRadius: 20,
                height: 32
              }}
              textStyle={{
                color: selectedCategory === category ? "#FFFFFF" : "#666666",
                fontSize: 13,
                fontWeight: selectedCategory === category ? "600" : "400",
              }}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 15, paddingHorizontal: 16 }}
        className="bg-white"
      >
        {filteredRestaurants.map((restaurant) => (
          <RestaurantsCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}
      </ScrollView>
    </View>
  );
}