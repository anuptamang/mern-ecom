import axios from "axios";
import { BACKEND_API } from "@/configs/api";

export const DOCS_API = `${BACKEND_API}/docs`;

export interface IDocFile {
  filename: string;
  name: string;
  slug: string;
  category?: string;
  path?: string; // Full path for nested files
  isFolder?: boolean;
  children?: IDocFile[];
}

export interface IDocContent extends IDocFile {
  content: string;
}

export interface ISearchResult extends IDocFile {
  matches: Array<{
    line: number;
    text: string;
    context: string;
  }>;
  matchCount: number;
}

export interface IDocsListResponse {
  docs: IDocFile[];
  hierarchy?: IDocFile[];
}

export const getDocsListApi = async (): Promise<IDocsListResponse> => {
  const { data } = await axios.get(`${DOCS_API}/list`);
  return data;
};

export const getDocApi = async (docName: string): Promise<IDocContent> => {
  const { data } = await axios.get(`${DOCS_API}/${docName}`);
  return data;
};

export const searchDocsApi = async (query: string): Promise<{ results: ISearchResult[] }> => {
  const { data } = await axios.get(`${DOCS_API}/search`, {
    params: { query },
  });
  return data;
};
