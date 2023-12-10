export type Card = {
  linkTo: string;
  shownAs: string;
  redirectTo?: string;
  element: Element;
};

export type Link = {
  href: string;
  shownAs: string;
};