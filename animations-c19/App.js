import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import StartBtn from "./components/StartBtn";
import Card from "./components/Card";
import Completed from "./components/Completed";
import { pokemonsArr } from "./data";
import { getCardLayout } from "./layout";
import { gameReducer, initialGame, shuffleCards } from "./game";

export default function App() {
  const [roundId, setRoundId] = useState(0);
  const handleRestart = useCallback(() => setRoundId((id) => id + 1), []);
  return <MemoryRound key={roundId} roundId={roundId} handleRestart={handleRestart} />;
}

function MemoryRound({ roundId, handleRestart }) {
  const [cards] = useState(() => shuffleCards(pokemonsArr));
  const [game, dispatch] = useReducer(gameReducer, initialGame);
  useEffect(() => {
    if (game.phase === "ready") return;
    const timer = setTimeout(() => {
      dispatch({ type: game.phase === "revealed" ? "evaluate" : "closed" });
    }, game.phase === "revealed" ? 1000 : 500);
    return () => clearTimeout(timer);
  }, [game.phase]);
  const [isCompleted, setIsCompleted] = useState(false);
  const pairCount = useMemo(() => new Set(cards.map((card) => card.type)).size, [cards]);
  useEffect(() => {
    if (pairCount === 0 || game.clearedCards.length !== pairCount) return;
    let current = true;
    const timer = setTimeout(() => { if (current) setIsCompleted(true); }, 500);
    return () => { current = false; clearTimeout(timer); };
  }, [game.clearedCards.length, pairCount]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [shouldDistribute, setShouldDistribute] = useState(roundId > 0);
  const layout = useMemo(() => getCardLayout(size.width, size.height), [size]);
  const startGame = useCallback(() => setShouldDistribute(true), []);
  function measure({ nativeEvent }) {
    const { width, height } = nativeEvent.layout;
    setSize((current) => current.width === width && current.height === height ? current : { width, height });
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <View style={styles.board} onLayout={measure}>
          {layout ? <>
            {cards.map((card, index) => (
              <Card key={card.id} index={index} layout={layout} shouldDistribute={shouldDistribute}
                card={card} onPressCard={(selected) => dispatch({ type: "open", card: selected })}
                isFlipped={game.openCards.some((item) => item.id === card.id)}
                isCleared={game.clearedCards.includes(card.type)} disabled={isCompleted || game.phase !== "ready"} restartFromLeft={roundId > 0} />
            ))}
            <Completed isCompleted={isCompleted} handleRestart={handleRestart} layout={layout} />
            {!shouldDistribute && <StartBtn startGame={startGame} availableWidth={layout.width} />}
          </> : size.width > 0 ? <Text>Agrandissez la zone disponible pour afficher les cartes.</Text> : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  board: { flex: 1, overflow: "hidden" },
});
