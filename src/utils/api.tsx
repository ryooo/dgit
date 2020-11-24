import useSWR from 'swr';
import axios from 'axios';
import path from 'path';

const jsonFetcher = (url: string) => axios.get(url).then(res => res.data)

export const useMarkdownApi = (filePath: string) => {
  return {
    data: {markdown: "#asdf"},
    error: null,
  }
}
