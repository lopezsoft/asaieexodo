import {Role} from "../enums/profiel-enum";

export interface Menu {
  id: number;
  name: string;
  translatedName: string;
  icon: string;
  link: string;
  isExternal?: boolean;
  order?: number;
  active: boolean;
  roles?: Role[];
  subItems?: Menu[];
}
