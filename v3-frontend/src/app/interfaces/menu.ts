import { CommunityRole } from '../services/v3-unified-auth.service';

export interface Menu {
  id: number;
  name: string;
  translatedName: string;
  railTranslatedName?: string;
  icon: string;
  link: string;
  isExternal?: boolean;
  order?: number;
  active: boolean;
  roles?: CommunityRole[];
  permission?: string;
  anyPermissions?: string[];
  moduleTag?: string;
  subItems?: Menu[];
}
