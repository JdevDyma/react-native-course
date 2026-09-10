import { Pressable, View, StyleSheet, Text } from "react-native";
import { colors } from "../../constants/colors";
import { getFormattedDate, getFormattedTime } from "../../utils";

export default function ListItem({ item, selectItem }) {
  return (
    <Pressable
      onPress={() => selectItem(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir l’événement ${item.title}`}
      style={[
        styles.itemContainer,
        item.isOnline ? styles.onlineItemContainer : undefined,
      ]}
    >
      <View style={styles.rowContainer}>
        <View style={styles.mainInfosContainer}>
          <Text style={[styles.text, styles.itemTitle]}>{item.title}</Text>
          <Text style={styles.text}>{item.location}</Text>
          <Text style={styles.text}>{item.phoneNumber}</Text>
        </View>

        <View style={styles.datesContainer}>
          <Text style={[styles.text, styles.dateText]}>
            Du {getFormattedDate(item.startDate)} à{" "}
            {getFormattedTime(item.startDate)}
          </Text>
          <Text style={[styles.text, styles.dateText]}>
            Au {getFormattedDate(item.endDate)} à {getFormattedTime(item.endDate)}
          </Text>
        </View>
      </View>

      <View style={[styles.rowContainer, styles.bottomContainer]}>
        <Text style={[styles.text, styles.description]}>
          {item.description}
        </Text>
        {item.isOnline ? (
          <View style={styles.onlineTextContainer}>
            <Text style={styles.onlineText}>En ligne</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colors.LIGHT,
    borderRadius: 8,
    padding: 12,
  },
  onlineItemContainer: {
    backgroundColor: colors.PINK,
  },
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  mainInfosContainer: {
    flex: 1, minWidth: 0, flexBasis: 140,
  },
  datesContainer: {
    flex: 1, minWidth: 0, flexBasis: 140,
  },
  text: {
    color: colors.DARK,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
  },
  bottomContainer: {
    marginTop: 16,
  },
  description: {
    flex: 1, minWidth: 0, flexBasis: 180,
  },
  onlineTextContainer: {
    backgroundColor: colors.DARK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineText: {
    fontSize: 16,
    color: colors.LIGHT,
    fontWeight: "700",
  },
});
