import { ClassFormData } from '@/types/classes';
import { SkillItem } from '@/types/skills';

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export function validateClass(data: ClassFormData): ValidationResult {
  const errors: string[] = [];
  
  if (!data.name?.trim()) {
    errors.push('Name is required');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (data.description && data.description.length > 10000) {
    errors.push('Description must be less than 10000 characters');
  }

  if (data.avatar_url && typeof data.avatar_url !== 'string') {
    errors.push('Avatar URL must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateSkill(data: SkillItem): ValidationResult {
  const errors: string[] = [];
  
  if (!data.name?.trim()) {
    errors.push('Name is required');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (data.description && data.description.length > 10000) {
    errors.push('Description must be less than 10000 characters');
  }

  if (data.icon_url && typeof data.icon_url !== 'string') {
    errors.push('Icon URL must be a string');
  }

  if (data.cooldown !== undefined && typeof data.cooldown !== 'number') {
    errors.push('Cooldown must be a number');
  }

  if (data.range !== undefined && typeof data.range !== 'number') {
    errors.push('Range must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
