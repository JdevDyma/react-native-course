import { createContext, useState } from "react";

export const FavoritesContext = createContext({
  picturesIds: [],
  addFavorite: () => {},
  removeFavorite: () => {},
});

export default function FavoritesContextProvider({ children }) {
  const [favoritePictureIds, setFavoritePictureIds] = useState([]);

  const addFavorite = (id) => {
    setFavoritePictureIds((currentIds) =>
      currentIds.includes(id) ? currentIds : [...currentIds, id]
    );
  };

  const removeFavorite = (id) => {
    setFavoritePictureIds((currentIds) =>
      currentIds.filter((favoriteId) => favoriteId !== id)
    );
  };

  const value = {
    picturesIds: favoritePictureIds,
    addFavorite,
    removeFavorite,
  };

  return (
    <FavoritesContext value={value}>
      {children}
    </FavoritesContext>
  );
}
