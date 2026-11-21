import { CommunityRole } from '../services/v3-unified-auth.service';

export interface Menu {
  id: number;
  name: string;
  translatedName: string;
  icon: string;
  link: string;
  isExternal?: boolean;
  order?: number;
  active: boolean;
  roles?: CommunityRole[];
  subItems?: Menu[];
}
