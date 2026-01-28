
export interface FileItem {
  name: string;
  isDirectory: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ConfigData {
  ollamaUrl: string;
  sandboxRoot: string;
}
