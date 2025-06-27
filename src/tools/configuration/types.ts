import { ConfigurationType, ConfigurationCategory } from '@prisma/client';

export interface ConfigurationResult {
  key: string;
  value: string;
  type: ConfigurationType;
  category: ConfigurationCategory;
  description: string;
  defaultValue: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationUpdateResult {
  key: string;
  oldValue: string;
  newValue: string;
  type: ConfigurationType;
  category: ConfigurationCategory;
  timestamp: string;
  reason?: string;
}

export interface ConfigurationListResult {
  category: ConfigurationCategory;
  configurations: ConfigurationResult[];
  totalCount: number;
}

export type CONFIGURATION_TOOLS =
  | 'configuration_get'
  | 'configuration_set'
  | 'configuration_list'
  | 'configuration_reset'
  | 'configuration_categories';

export interface ConfigurationGetArgs {
  key: string;
}

export interface ConfigurationSetArgs {
  key: string;
  value: string | number | boolean | object;
  reason?: string;
}

export interface ConfigurationListArgs {
  category?: ConfigurationCategory;
  search?: string;
}

export interface ConfigurationResetArgs {
  key: string;
  reason?: string;
}
