import { ClientSDK } from "@sitecore-marketplace-sdk/client";

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    url?: string;
    days?: number;
    property?: string;
    recordCount?: number;
  };
}

export interface ApiError {
  error: string;
  details?: string;
}

// Analytics Types
export interface PageViewsData {
  date: Date;
  pageViews: number;
}

export interface GaSiteInfo {
  id: string;
  name: string;
  propertyId: string;
  path: string;
}

// Component Props Types
export interface AnalyticsChartProps {
  propertyId: string;
  route: string;
  initialDays?: string;
}

// Google Analytics API Types
export type MetricType = 'screenPageViews' | 'activeUsers';

// Marketplace SDK Types
export interface PropertyField {
  name: string;
  value: string;
}

export interface ChildrenResults {
  results: {
    id: string;
    name: string;
    field: PropertyField;
  }[];
}

export interface GqlItem {
  itemId: string;
  name: string;
  children: ChildrenResults;
}

export interface GqlData {
  item: GqlItem;
}

export interface GqlResponse {
  data: {
    data: GqlData;
  };
}

// Client Context Types
export interface ClientContext {
  client: ClientSDK;
  sitecoreContextId: string;
} 