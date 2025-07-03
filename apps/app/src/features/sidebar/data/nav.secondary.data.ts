import { Icons, type IconType } from "@local-sql/ui/components/icons";

export type SecondaryNavType = {
  title: string;
  url: string;
  icon: IconType;
  disabled?: true;
  external?: boolean;
};

export const secondaryNavData: SecondaryNavType[] = [
  {
    title: "GitHub",
    url: "https://github.com/martiinii/local-sql",
    icon: Icons.Github,
    external: true,
  },
  {
    title: "Report a bug",
    url: "https://github.com/martiinii/local-sql/issues/new/choose",
    icon: Icons.Bug,
    external: true,
  },
];
