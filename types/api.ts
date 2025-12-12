/**
 * API response types
 */

import { Tool } from './tool';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

