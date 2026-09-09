import ADNIcon from "../assets/icons/dna.svg";
import HeartIcon from "../assets/icons/heart.svg";
import ShieldIcon from "../assets/icons/shield.svg";
import SpaceShip from "../assets/icons/space-ship.svg";
import GeneticIcon from "../assets/icons/genetic.svg";
import { colors } from "../constants/colors";

export const data = [
  {
    id: "ased45",
    title: "L'ADN pour les nuls",
    description: "Premier chapitre : qui a découvert l'ADN ?",
    logo: ADNIcon,
    color: colors.VIOLET,
  },
  {
    id: "ased78",
    title: "Les bases de la biologie",
    description: "Premier chapitre : Quel est le rôle du cœur ?",
    logo: HeartIcon,
    color: colors.PURPLE,
  },
  {
    id: "ased12",
    title: "La cybersécurité",
    description: "Un véritable enjeu ces dernières années",
    logo: ShieldIcon,
    color: colors.DARK,
  },

  {
    id: "ased99",
    title: "La physique quantique",
    description:
      "Et si nous n'étions qu'au début des découvertes scientifiques ?",
    logo: GeneticIcon,
    color: colors.GREY,
  },
  {
    id: "ased07",
    title: "La conquête de l'espace",
    description: "Le destin des astronautes",
    logo: SpaceShip,
    color: colors.ORANGE,
  },
];
