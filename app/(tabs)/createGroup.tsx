import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/database/firebase";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getCurrentUserId } from "@/services/auth";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UserOption = {
  id: string;
  name: string;
};

export default function CreateGroupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");

  // FORM STATE
  const [groupName, setGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // UI DROPDOWN STATE
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);

  // USERS
  const [users, setUsers] = useState<UserOption[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // VALIDATION ERRORS (SAME STRUCTURE AS ADD TASK)
  const [errors, setErrors] = useState({
    groupName: "",
    members: "",
    color: "",
  });

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA502",
    "#A55EEA",
    "#2ED573",
  ];

  // LOAD USERS
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list = snap.docs.map((d) => {
          const data = d.data() as any;
          const displayName =
            data.username ||
            `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
            data["e-mail"] ||
            "Unknown";

          return { id: d.id, name: displayName };
        });
        setUsers(list);
      } finally {
        setMembersLoading(false);
      }
    };

    loadUsers();
  }, []);

  // TOGGLE MEMBERS
  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ---- CREATE GROUP ----
  const handleCreate = async () => {
    let newErrors = { groupName: "", members: "", color: "" };
    let hasError = false;

    if (!groupName.trim()) {
      newErrors.groupName = "Group name is required.";
      hasError = true;
    }
    if (selectedMemberIds.length === 0) {
      newErrors.members = "Select at least one member.";
      hasError = true;
    }
    if (!selectedColor) {
      newErrors.color = "Please choose a color.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      setLoading(true);

      const creatorId = await getCurrentUserId();

      const allMembers = Array.from(new Set([...selectedMemberIds, creatorId]));
      const memberRefs = allMembers.map((id) => doc(db, "users", id));
      const creatorRef = doc(db, "users", creatorId);

      const groupDoc = await addDoc(collection(db, "groups"), {
        group_name: groupName,
        color: selectedColor,
        creator: creatorRef,
        group_members: memberRefs,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      for (const uid of allMembers) {
        await updateDoc(doc(db, "users", uid), {
          assigned_groups: arrayUnion(groupDoc),
        });
      }

      router.replace("/(tabs)/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const membersLabel =
    selectedMemberIds.length === 0
      ? "Select members"
      : users
          .filter((u) => selectedMemberIds.includes(u.id))
          .map((u) => u.name)
          .join(", ");

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Create Group</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#2a2a2a" : "#fafafa" },
            ]}
          >
            {/* GROUP NAME */}
            <ThemedText style={styles.label}>Group Name *</ThemedText>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="e.g. Group C"
              placeholderTextColor={isDark ? "#666" : "#999"}
              style={[
                styles.input,
                {
                  borderColor: errors.groupName
                    ? "#ff3b30"
                    : isDark
                    ? "#444"
                    : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  color: text,
                },
              ]}
            />
            {errors.groupName ? (
              <ThemedText style={styles.errorText}>
                {errors.groupName}
              </ThemedText>
            ) : null}

            {/* MEMBERS */}
            <ThemedText style={styles.label}>Members *</ThemedText>

            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdownButton,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  borderColor: errors.members
                    ? "#ff3b30"
                    : isDark
                    ? "#444"
                    : "#000",
                },
              ]}
              onPress={() => setShowMembersDropdown((prev) => !prev)}
            >
              <ThemedText style={{ color: text }}>{membersLabel}</ThemedText>

              <MaterialIcons
                name={
                  showMembersDropdown
                    ? "keyboard-arrow-up"
                    : "keyboard-arrow-down"
                }
                size={22}
                color={isDark ? "#666" : "#999"}
              />
            </TouchableOpacity>

            {errors.members ? (
              <ThemedText style={styles.errorText}>{errors.members}</ThemedText>
            ) : null}

            {showMembersDropdown && (
              <View
                style={[
                  styles.dropdown,
                  { backgroundColor: isDark ? "#1a1a1a" : "white" },
                ]}
              >
                <ScrollView style={{ maxHeight: 220 }}>
                  {users.map((u) => {
                    const selected = selectedMemberIds.includes(u.id);
                    return (
                      <TouchableOpacity
                        key={u.id}
                        style={styles.dropdownItem}
                        onPress={() => toggleMember(u.id)}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <MaterialIcons
                            name={
                              selected
                                ? "check-box"
                                : "check-box-outline-blank"
                            }
                            size={20}
                            color={selected ? tint : isDark ? "#ccc" : "#555"}
                          />
                          <ThemedText style={{ marginLeft: 8 }}>
                            {u.name}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* COLOR PICKER */}
            <ThemedText style={styles.label}>Choose a Color *</ThemedText>
            <View style={styles.colorRow}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 1.5,
                      borderColor:
                        selectedColor === color
                          ? tint
                          : errors.color
                          ? "#ff3b30"
                          : isDark
                          ? "#444"
                          : "#000",
                    },
                  ]}
                />
              ))}
            </View>

            {errors.color ? (
              <ThemedText style={styles.errorText}>{errors.color}</ThemedText>
            ) : null}
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: tint }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="group-add" size={22} color="white" />
                <ThemedText style={styles.buttonText}>
                  Create Group
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  headerContainer: {
    paddingVertical: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 20,
    alignSelf: "stretch",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },

  scrollContent: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },

  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    marginBottom: 20,
    marginTop: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
  },

  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    height: 100,
    fontSize: 16,
    marginBottom: 10,
    textAlignVertical: "top",
  },

  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdown: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
    overflow: "hidden",
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },

  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  errorText: {
    color: "#ff3b30",
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 4,
  },

  button: {
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
