import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import { Provider as PaperProvider, Searchbar, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import RestaurantsCard from "../../components/RestaurantsCard";
import { getShops } from "../../src/services/api";

export default function HomePage() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [shops, setShops] = useState<any[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);

  useEffect(() => {
    // fetch shops to derive categories and use for listing
    let mounted = true;
    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const data = await getShops();
        const items = (Array.isArray(data) ? data : data?.data ?? data?.shops ?? []) as any[];
        if (!mounted) return;
        setShops(items);
        // derive categories from cuisine/type and shopTypes (if available)
        const values: string[] = [];
        items.forEach((s: any) => {
          const c = String(s.cuisine || s.type || 'Other');
          values.push(c);
          if (Array.isArray(s.shopTypes)) {
            s.shopTypes.forEach((t: any) => values.push(typeof t === 'string' ? t : (t?.name ? String(t.name) : String(t))));
          } else if (s.shopType || typeof s.shopTypes === 'string') {
            values.push(String(s.shopType || s.shopTypes));
          }
        });
        const found = Array.from(new Set(values)).filter(v => !!v);
        setCategories(['All', ...found]);
      } catch (e) {
        console.warn('Error fetching shops for HomePage:', e);
      } finally {
        if (mounted) setLoadingShops(false);
      }
    };
    fetchShops();
    return () => { mounted = false; };
  }, []);

  const filteredRestaurants = selectedCategory === 'All'
    ? shops
    : shops.filter((s: any) => {
      const cuisineVal = String(s.cuisine || s.type || 'Other');
      const shopTypeVal = Array.isArray(s.shopTypes)
        ? s.shopTypes.map((t: any) => (typeof t === 'string' ? t : (t?.name || String(t)))).join(', ')
        : (s.shopType || (typeof s.shopTypes === 'string' ? s.shopTypes : ''));
      return cuisineVal === selectedCategory || shopTypeVal === selectedCategory || shopTypeVal.split(', ').includes(selectedCategory);
    });

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
        {loadingShops ? (
          <ActivityIndicator size="large" color="#17a2b8" style={{ marginTop: 24 }} />
        ) : (
          // pass filtered shops into RestaurantsCard (component will render list when `restaurants` prop provided)
          <RestaurantsCard restaurants={filteredRestaurants.map((s: any) => ({
            id: s._id || s.id || String(s.shopId || Math.random()),
            name: s.name || s.title || 'Unnamed Shop',
            cuisine: s.cuisine || s.type || 'Various',
            shopType: Array.isArray(s.shopTypes)
              ? s.shopTypes.map((t: any) => (typeof t === 'string' ? t : (t?.name || String(t)))).join(', ')
              : (s.shopType || (typeof s.shopTypes === 'string' ? s.shopTypes : '')),
            distance: s.distance || '—',
            waitInfo: (Array.isArray(s.tableTypes) ? String(s.tableTypes.length) : (s.waitInfo != null ? String(s.waitInfo) : '0')),
            image: s.shopImg ? { uri: s.shopImg } : require("../../assets/images/Thai.jpg"),
          }))} />
        )}
      </ScrollView>
    </View>
  );
}