export const COLUMNS = 3;
export const ROWS = 4;
export const MARGIN_HORIZONTAL = 16;
export const MAX_MARGIN_VERTICAL = 120;
export const SPACE_BETWEEN_CARDS = 12;

export function getCardLayout(width, height) {
  const marginVertical = Math.min(MAX_MARGIN_VERTICAL, height * 0.15);
  const cardWidth = (width - 2 * MARGIN_HORIZONTAL - (COLUMNS - 1) * SPACE_BETWEEN_CARDS) / COLUMNS;
  const cardHeight = (height - 2 * marginVertical - (ROWS - 1) * SPACE_BETWEEN_CARDS) / ROWS;
  if (!Number.isFinite(cardWidth) || !Number.isFinite(cardHeight) || cardWidth <= 0 || cardHeight <= 0) return null;
  return { width, height, cardWidth, cardHeight, marginVertical,
    centerX: (width - cardWidth) / 2, centerY: (height - cardHeight) / 2 };
}

export function getCardPosition(index, layout) {
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  return {
    x: MARGIN_HORIZONTAL + column * (layout.cardWidth + SPACE_BETWEEN_CARDS),
    y: layout.marginVertical + row * (layout.cardHeight + SPACE_BETWEEN_CARDS),
  };
}
