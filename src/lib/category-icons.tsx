import {
  Smartphone,
  Laptop,
  Tablet,
  Tv,
  Headphones,
  Gamepad2,
  Camera,
  Package,
} from "lucide-react";

type IconProps = { className?: string; strokeWidth?: number };

// Un composant par catégorie (plutôt qu'une variable de type composant
// assignée dynamiquement pendant le rendu) pour rester compatible avec la
// règle ESLint react-hooks/static-components : chaque balise JSX ci-dessous
// nomme directement le composant importé, aucune sélection dynamique.
export function CategoryIcon({ slug, className, strokeWidth }: IconProps & { slug: string }) {
  switch (slug) {
    case "telephones":
      return <Smartphone className={className} strokeWidth={strokeWidth} />;
    case "ordinateurs":
      return <Laptop className={className} strokeWidth={strokeWidth} />;
    case "tablettes":
      return <Tablet className={className} strokeWidth={strokeWidth} />;
    case "televiseurs":
      return <Tv className={className} strokeWidth={strokeWidth} />;
    case "audio":
      return <Headphones className={className} strokeWidth={strokeWidth} />;
    case "gaming":
      return <Gamepad2 className={className} strokeWidth={strokeWidth} />;
    case "cameras":
      return <Camera className={className} strokeWidth={strokeWidth} />;
    default:
      return <Package className={className} strokeWidth={strokeWidth} />;
  }
}
