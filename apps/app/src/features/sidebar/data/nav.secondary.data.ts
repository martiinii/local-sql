import type { IconType } from "@local-sql/ui/components/icons";

export type SecondaryNavType = {
  title: string;
  url: string;
  icon: IconType;
  disabled?: true;
};

export const secondaryNavData: SecondaryNavType[] = [
  //   {
  //     title: "Support",
  //     url: "/help",
  //     icon: Icons.LifeBuoy,
  //   },
  //   {
  //     title: "Feedback",
  //     url: "/feedback",
  //     icon: Icons.Send,
  //   },
];
