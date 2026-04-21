import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { File } from "expo-file-system/next";
import { fetch } from "expo/fetch";

const { width } = Dimensions.get("window");

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [caption, setCaption] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);

  const canPost = !isSharing && (caption.trim().length > 0 || !!selectedImage);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,   // ← no forced crop
      quality: 0.85,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => setSelectedImage(null);

  const handleShare = async () => {
    if (!canPost) return;
    try {
      setIsSharing(true);
      if (selectedImage) {
        const uploadUrl = await generateUploadUrl();
        const file = new File(selectedImage);
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          body: file,
          headers: { "Content-Type": "image/jpeg" },
        });
        if (!uploadResult.ok) throw new Error("Upload failed");
        const { storageId } = await uploadResult.json();
        await createPost({ storageId, caption: caption.trim() || undefined });
      } else {
        await createPost({ caption: caption.trim() });
      }
      setSelectedImage(null);
      setCaption("");
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error sharing post:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 30}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(null);
            setCaption("");
            router.back();
          }}
          disabled={isSharing}
          hitSlop={8}
        >
          <Text style={[s.cancelText, isSharing && { opacity: 0.4 }]}>Cancel</Text>
        </TouchableOpacity>

        <Text style={s.headerTitle}>New post</Text>

        <TouchableOpacity
          style={[s.postButton, !canPost && s.postButtonDisabled]}
          disabled={!canPost}
          onPress={handleShare}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Compose row ── */}
        <View style={s.composeRow}>
          {/* Avatar */}
          <Image
            source={user?.imageUrl}
            style={s.avatar}
            contentFit="cover"
          />

          {/* Input area */}
          <View style={s.inputArea}>
            <TextInput
              style={s.textInput}
              placeholder="What's happening?"
              placeholderTextColor={COLORS.grey}
              multiline
              value={caption}
              onChangeText={setCaption}
              editable={!isSharing}
              autoFocus
              maxLength={280}
            />

            {/* Image preview — contained, never cropped */}
            {selectedImage && (
              <View style={s.imagePreviewWrapper}>
                <Image
                  source={selectedImage}
                  style={s.imagePreview}
                  contentFit="contain"   // ← shows full image, no cropping
                  transition={200}
                  contentPosition="center"
                />
                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={removeImage}
                  disabled={isSharing}
                >
                  <View style={s.removeCircle}>
                    <Ionicons name="close" size={13} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Toolbar ── */}
        <View style={s.toolbar}>
          <TouchableOpacity style={s.toolbarBtn} onPress={pickImage} disabled={isSharing}>
            <Ionicons
              name="image-outline"
              size={22}
              color={isSharing ? COLORS.grey : COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={s.toolbarBtn} disabled>
            <Ionicons name="gif-outline" size={22} color={COLORS.surfaceLight} />
          </TouchableOpacity>

          <TouchableOpacity style={s.toolbarBtn} disabled>
            <Ionicons name="list-outline" size={22} color={COLORS.surfaceLight} />
          </TouchableOpacity>

          <TouchableOpacity style={s.toolbarBtn} disabled>
            <Ionicons name="location-outline" size={22} color={COLORS.surfaceLight} />
          </TouchableOpacity>

          {/* Character counter */}
          <View style={s.charCountWrapper}>
            {caption.length > 0 && (
              <Text
                style={[
                  s.charCount,
                  caption.length > 250 && { color: "#F4212E" },
                ]}
              >
                {280 - caption.length}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  cancelText: {
    color: COLORS.white,
    fontSize: 15,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    minWidth: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonDisabled: {
    opacity: 0.45,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // Scroll
  scrollContent: {
    flexGrow: 1,
  },

  // Compose
  composeRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    flexShrink: 0,
  },
  inputArea: {
    flex: 1,
  },
  textInput: {
    color: COLORS.white,
    fontSize: 17,
    lineHeight: 23,
    paddingTop: 8,
    minHeight: 56,
    textAlignVertical: "top",
  },

  // Image preview — contained (no crop, visually smaller than full-screen)
  imagePreviewWrapper: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.surfaceLight,
    backgroundColor: COLORS.surface,
    // Fixed height so image appears smaller; contain keeps it uncropped
    height: (width - 14 - 44 - 12) * 0.7,
    maxHeight: 260,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  removeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(15,20,25,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 14,
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  toolbarBtn: {
    padding: 8,
  },
  charCountWrapper: {
    marginLeft: "auto",
    paddingRight: 4,
  },
  charCount: {
    color: COLORS.grey,
    fontSize: 13,
  },
});