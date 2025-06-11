import {
  ChevronRight,
  Computer,
  Database,
  LifeBuoy,
  Loader2,
  MoonStar,
  Plus,
  Power,
  Send,
  Server,
  SquareTerminal,
  Sun,
  SunMoon,
  TableProperties,
  Unplug,
  Wrench,
} from "lucide-react";

export const Icons = {
  Loader: Loader2,
  Sun,
  MoonStar,
  SunMoon,
  Computer,
  LifeBuoy,
  Send,
  Connect: Power,
  Disconnect: Unplug,
  Wrench,
  SquareTerminal,
  Plus,
  ChevronRight,
  Table: TableProperties,
  Database,
  Server,
};

export type IconName = keyof typeof Icons;
export type IconType = (typeof Icons)[IconName];
