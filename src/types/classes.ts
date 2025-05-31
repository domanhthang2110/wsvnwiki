import { SkillItem } from './skills';

export interface ClassItem {
  id: number;
  name: string;
  description: string;
  avatar_url?: string;
  skills?: SkillItem[];
}

export interface NewClassItem extends Omit<ClassItem, 'id'> {
  id?: number;
}
