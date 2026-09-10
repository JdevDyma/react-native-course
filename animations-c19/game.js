export function shuffleCards(cards) {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const initialGame = { openCards: [], clearedCards: [], phase: "ready" };

export function gameReducer(state, action) {
  if (action.type === "open") {
    const card = action.card;
    if (state.phase !== "ready" || state.clearedCards.includes(card.type) ||
      state.openCards.some((item) => item.id === card.id)) return state;
    const openCards = [...state.openCards, card];
    return { ...state, openCards, phase: openCards.length === 2 ? "revealed" : "ready" };
  }
  if (action.type === "evaluate" && state.phase === "revealed") {
    const [first, second] = state.openCards;
    if (first.type === second.type) {
      return { openCards: [], clearedCards: [...state.clearedCards, first.type], phase: "ready" };
    }
    return { ...state, openCards: [], phase: "closing" };
  }
  if (action.type === "closed" && state.phase === "closing") return { ...state, phase: "ready" };
  return state;
}
