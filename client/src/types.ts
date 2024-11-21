export interface ScriptMetadata {
  id: string;
  filename: string;
  title: string;
  language: string;
  tags: string;
  description: string;
  how_it_works: string;
  category: string;
  script_content: string;
}

export interface AnalyticsResponse {
    total_scripts: number;
    total_likes: number;
    most_liked_script: ScriptMetadata | null;
    recent_uploads: number;
    trending_scripts: number;
}

export interface ScriptRequest {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string;
  is_fulfilled: boolean;
}