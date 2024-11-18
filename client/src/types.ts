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

export interface UpdateMetadataPayload {
  title?: string;
  language?: string;
  tags?: string;
  description?: string;
  how_it_works?: string;
  category?: string;
}