import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import Loader from "@/components/Loader";
import { COLORS } from "@/constants/theme";

const { width } = Dimensions.get("window");

const TABS = ["All", "Mentions"] as const;
type Tab = (typeof TABS)[number];

const NOTIF_CONFIG = {
  like: {
    icon: "heart" as const,
    color: COLORS.like,
    label: "liked your post",
  },
  comment: {
    icon: "chatbubble" as const,
    color: COLORS.primary,
    label: "replied to your post",
  },
  follow: {
    icon: "person-add" as const,
    color: "#22C55E",
    label: "followed you",
  },
};

export default function NotificationsScreen() {
  const notifications = useQuery(api.notifications.getNotifications);
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const router = useRouter();

  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const deleteAllNotifications = useMutation(api.notifications.deleteAllNotifications);

  const [activeTab, setActiveTab] = useState<Tab>("All");
  const tabAnim = useRef(new Animated.Value(0)).current;

  const rowAnims = useRef<{ [key: string]: Animated.Value }>({});

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    Animated.spring(tabAnim, {
      toValue: tab === "All" ? 0 : 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const getOrCreateAnim = (id: string) => {
    if (!rowAnims.current[id]) {
      rowAnims.current[id] = new Animated.Value(0);
      Animated.spring(rowAnims.current[id], {
        toValue: 1,
        useNativeDriver: true,
        speed: 25,
        bounciness: 6,
        delay: 50,
      }).start();
    }
    return rowAnims.current[id];
  };

  const handleDeleteOne = (notificationId: Id<"notifications">) => {
    Alert.alert("Delete notification", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNotification({ notificationId });
          } catch (e) {
            console.error("Error deleting notification:", e);
          }
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (!notifications || notifications.length === 0) return;
    Alert.alert(
      "Clear all notifications",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllNotifications();
            } catch (e) {
              console.error("Error clearing notifications:", e);
            }
          },
        },
      ]
    );
  };

  if (notifications === undefined) return <Loader />;

  const tabIndicatorX = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2],
  });

  const handleSenderPress = (senderId: Id<"users">) => {
    if (currentUser?._id === senderId) {
      router.push("/(tabs)/profile");
    } else {
      router.push(`/user/${senderId}`);
    }
  };
  const filteredNotifications = activeTab === "All"
    ? notifications
    : notifications.filter((n) => n.type === "comment");

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} hitSlop={10}>
            <Text style={s.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={s.tab}
            onPress={() => switchTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[s.tabLabel, activeTab === tab && s.tabLabelActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            s.tabIndicator,
            { transform: [{ translateX: tabIndicatorX }] },
          ]}
        />
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
        renderItem={({ item }) => {
          const cfg = NOTIF_CONFIG[item.type];
          const anim = getOrCreateAnim(item._id);
          return (
            <Animated.View
              style={[
                s.row,
                {
                  opacity: anim,
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[s.iconStripe, { backgroundColor: cfg.color }]} />

              <View style={[s.iconBubble, { backgroundColor: cfg.color + "18" }]}>
                <Ionicons name={cfg.icon} size={18} color={cfg.color} />
              </View>

              <View style={s.contentBlock}>
                <TouchableOpacity
                  onPress={() => handleSenderPress(item.sender._id)}
                  activeOpacity={0.85}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <Image
                    source={{ uri: item.sender.image }}
                    style={s.senderAvatar}
                    contentFit="cover"
                  />
                  <View style={s.textBlock}>
                    <Text style={s.notifText} numberOfLines={2}>
                      <Text style={s.senderName}>{item.sender.username}</Text>{" "}
                      <Text style={s.notifLabel}>{cfg.label}</Text>
                    </Text>
                    <Text style={s.timeText}>
                      {formatDistanceToNow(new Date(item._creationTime), {
                        addSuffix: true,
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>

                {item.postImageUrl && (
                  <Image
                    source={{ uri: item.postImageUrl }}
                    style={s.postThumb}
                    contentFit="cover"
                  />
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteOne(item._id)}
                hitSlop={10}
                style={s.deleteBtn}
              >
                <Ionicons name="close-outline" size={18} color={COLORS.grey} />
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconWrapper}>
              <Ionicons name="notifications-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={s.emptyTitle}>Nothing to see here yet</Text>
            <Text style={s.emptySubtitle}>
              Likes, mentions, and new followers will show up here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  // Clear All
  clearAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  // Tabs
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
    position: "relative",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  tabLabel: {
    color: COLORS.grey,
    fontSize: 15,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: COLORS.white,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width / 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: COLORS.background,
  },
  iconStripe: {
    width: 3,
    height: "80%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: "10%",
    opacity: 0.7,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  contentBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  senderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  notifText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 19,
  },
  senderName: {
    fontWeight: "700",
  },
  notifLabel: {
    color: COLORS.grey,
  },
  timeText: {
    color: COLORS.greyLight,
    fontSize: 12,
  },
  postThumb: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    flexShrink: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.surfaceLight,
  },
  //Кнопка видалення
  deleteBtn: {
    padding: 6,
    flexShrink: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.surfaceLight,
    marginLeft: 16 + 3 + 12 + 38 + 12,
  },
  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  emptySubtitle: {
    color: COLORS.grey,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
  },
});