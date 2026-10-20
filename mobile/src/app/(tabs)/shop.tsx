import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { Chips } from "@/components/Chips";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { TabHeader } from "@/components/TabHeader";
import { Empty, ErrorState, Loading, Text, colors } from "@/components/ui";
import { useCategories, useProducts } from "@/lib/queries";

export default function Shop() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const categories = useCategories();
  const products = useProducts(q, category);
  const items = products.data?.pages.flatMap((p) => p.items) ?? [];
  const total = products.data?.pages[0]?.total ?? 0;
  const onSearch = useCallback((v: string) => setQ(v), []);

  return (
    <View className="flex-1 bg-ground">
      <TabHeader kicker="B2B supplies · CAD" title="Shop" />
      <View className="gap-3 bg-ground pb-3 pt-3">
        <SearchBar placeholder="Products, brands, SKUs" onSearch={onSearch} />
        {categories.data?.length ? (
          <Chips value={category} onChange={setCategory} options={categories.data.map((c) => ({ value: c.slug, label: c.name }))} />
        ) : null}
      </View>

      {products.isPending ? (
        <Loading />
      ) : products.isError ? (
        <ErrorState error={products.error} onRetry={() => void products.refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperClassName="gap-3"
          contentContainerClassName="gap-3 px-5 pb-12"
          renderItem={({ item }) => <ProductCard p={item} className="flex-1" />}
          ListHeaderComponent={<Text className="font-mono text-[11px] uppercase tracking-machine text-slate-500">{total.toLocaleString()} {total === 1 ? "item" : "items"}</Text>}
          ListEmptyComponent={<Empty title="Nothing matches" body="Try a different search or category." />}
          ListFooterComponent={products.isFetchingNextPage ? <ActivityIndicator color={colors.brand} className="py-6" /> : undefined}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (products.hasNextPage && !products.isFetchingNextPage) void products.fetchNextPage();
          }}
          refreshControl={<RefreshControl refreshing={products.isRefetching && !products.isFetchingNextPage} onRefresh={() => void products.refetch()} tintColor={colors.brand} />}
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}
